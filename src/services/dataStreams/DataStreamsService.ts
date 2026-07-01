import { Address, Hex, PublicClient, encodeFunctionData, isAddressEqual, zeroAddress } from 'viem'
import { DataStreamsClient } from './DataStreamsClient'
import { DATA_STREAMS_RELAYER_ABI, DATA_STREAMS_RELAYER_FACTORY_ABI, FPMM_ABI } from '../../core/abis'
import { tryGetContractAddress, ChainId } from '../../core/constants'
import { CallParams } from '../../core/types'
import { validateAddress } from '../../utils/validation'

/** A single leg of a relayer's composition path: a Chainlink Data Streams feedId + invert flag. */
export interface StreamLeg {
  feedId: Hex
  invert: boolean
}

/**
 * High-level Data Streams service that bridges the off-chain report API and the on-chain relayers.
 *
 * It resolves a Mento `rateFeedId` to its relayer's Chainlink feedId legs (via the
 * DataStreamsRelayerFactory + relayer), fetches the freshest DON-signed report blob for each leg,
 * and produces the `bytes[]` / `bytes[][]` shapes the on-chain verify-on-swap path expects:
 *   - `fetchReports(rateFeedId)` -> one signed blob per leg (for a single feed / `Factory.ingest`).
 *   - `fetchReportsForRateFeeds(ids)` -> `signedReportsPerHop` for `swapExactTokensForTokensWithReports`.
 *   - `buildIngestParams(rateFeedId)` -> calldata for the permissionless `Factory.ingest` recovery path.
 *
 * The signed report blob written on-chain is the raw `fullReport` returned by the Data Streams API.
 */
export class DataStreamsService {
  constructor(
    private readonly publicClient: PublicClient,
    private readonly chainId: number,
    private readonly client: DataStreamsClient,
    /** Override for the DataStreamsRelayerFactory address (defaults to the on-chain address registry). */
    private readonly relayerFactoryOverride?: string
  ) {}

  /**
   * Resolves the DataStreamsRelayerFactory address from the override or the address registry.
   * @throws if no factory is configured for the chain (it is not deployed anywhere yet).
   */
  getRelayerFactoryAddress(): Address {
    const address = this.relayerFactoryOverride ?? tryGetContractAddress(this.chainId as ChainId, 'DataStreamsRelayerFactory')
    if (!address) {
      throw new Error(
        `DataStreamsRelayerFactory address is not configured for chain ${this.chainId}. ` +
          'Pass it via MentoClientOptions.dataStreamsRelayerFactory until it is deployed and in the registry.'
      )
    }
    validateAddress(address, 'dataStreamsRelayerFactory')
    return address as Address
  }

  /** Reads the relayer registered for a rateFeedId (zero address if none). */
  private async readRelayer(rateFeedId: string): Promise<Address> {
    validateAddress(rateFeedId, 'rateFeedId')
    return (await this.publicClient.readContract({
      address: this.getRelayerFactoryAddress(),
      abi: DATA_STREAMS_RELAYER_FACTORY_ABI,
      functionName: 'getRelayer',
      args: [rateFeedId as Address],
    })) as Address
  }

  /** Reads the ordered legs from a relayer instance. */
  private async readLegs(relayer: Address): Promise<StreamLeg[]> {
    const legs = (await this.publicClient.readContract({
      address: relayer,
      abi: DATA_STREAMS_RELAYER_ABI,
      functionName: 'getLegs',
    })) as readonly StreamLeg[]
    return legs.map((leg) => ({ feedId: leg.feedId, invert: leg.invert }))
  }

  /** Fetches the freshest signed report blob for each leg, in leg order. */
  private async reportsForLegs(legs: StreamLeg[]): Promise<Hex[]> {
    const reports = await Promise.all(legs.map((leg) => this.client.getLatestReport(leg.feedId)))
    return reports.map((report) => report.fullReport as Hex)
  }

  /**
   * Resolves the relayer registered for a `rateFeedId`.
   * @throws if no relayer is registered (the feed is not a Data Streams / pull pair).
   */
  async resolveRelayer(rateFeedId: string): Promise<Address> {
    const relayer = await this.readRelayer(rateFeedId)
    if (isAddressEqual(relayer, zeroAddress)) {
      throw new Error(`No Data Streams relayer registered for rateFeedId ${rateFeedId}`)
    }
    return relayer
  }

  /** Resolves the ordered Chainlink Data Streams legs (feedId + invert) that compose a rateFeedId. */
  async resolveLegs(rateFeedId: string): Promise<StreamLeg[]> {
    return this.readLegs(await this.resolveRelayer(rateFeedId))
  }

  /**
   * Fetches the freshest signed report blob for each leg of a rateFeedId, in leg order.
   * The returned `bytes[]` is exactly what `relay()` / `Factory.ingest()` expects (one per leg).
   */
  async fetchReports(rateFeedId: string): Promise<Hex[]> {
    return this.reportsForLegs(await this.resolveLegs(rateFeedId))
  }

  /**
   * Fetches reports for several rateFeedIds, preserving order — the `bytes[][] signedReportsPerHop`
   * shape consumed by `RouterWithReports.swapExactTokensForTokensWithReports` (entry `i` -> hop `i`).
   */
  async fetchReportsForRateFeeds(rateFeedIds: string[]): Promise<Hex[][]> {
    return Promise.all(rateFeedIds.map((rateFeedId) => this.fetchReports(rateFeedId)))
  }

  /** Reads the reference rateFeedId an FPMM pool prices against. */
  async resolvePoolRateFeedId(poolAddress: string): Promise<Address> {
    validateAddress(poolAddress, 'poolAddress')
    return (await this.publicClient.readContract({
      address: poolAddress as Address,
      abi: FPMM_ABI,
      functionName: 'referenceRateFeedID',
    })) as Address
  }

  /**
   * Builds the `bytes[][] signedReportsPerHop` for a swap route from the per-hop pool addresses
   * (in route order). Each pool's `referenceRateFeedID` is resolved, then its reports fetched.
   * A hop whose rateFeedId has no registered relayer (e.g. a push pair) yields an empty bundle,
   * which `RouterWithReports` skips — so mixed pull/push routes are handled correctly.
   */
  async fetchReportsForPools(poolAddresses: string[]): Promise<Hex[][]> {
    return Promise.all(
      poolAddresses.map(async (poolAddress) => {
        const rateFeedId = await this.resolvePoolRateFeedId(poolAddress)
        const relayer = await this.readRelayer(rateFeedId)
        if (isAddressEqual(relayer, zeroAddress)) {
          return [] as Hex[] // not a Data Streams pull pair -> no report needed for this hop
        }
        return this.reportsForLegs(await this.readLegs(relayer))
      })
    )
  }

  /**
   * Builds calldata for the permissionless `Factory.ingest` recovery/relay path: verify + write a
   * fresh rate for `rateFeedId` without a swap (e.g. to un-stick a stale or tripped feed).
   * @param rateFeedId The Mento rateFeedId to refresh.
   * @param signedReports Optional pre-fetched reports; fetched automatically when omitted.
   */
  async buildIngestParams(rateFeedId: string, signedReports?: Hex[]): Promise<CallParams> {
    validateAddress(rateFeedId, 'rateFeedId')
    const reports = signedReports ?? (await this.fetchReports(rateFeedId))
    const data = encodeFunctionData({
      abi: DATA_STREAMS_RELAYER_FACTORY_ABI,
      functionName: 'ingest',
      args: [rateFeedId as Address, reports, '0x'],
    })
    return { to: this.getRelayerFactoryAddress(), data, value: '0' }
  }
}
