import {
  getLimitId,
  getLimits,
  getLimitsConfig,
  getLimitsState,
} from './limits'

import { Broker__factory } from '@mento-protocol/mento-core-ts'
import { providers } from 'ethers'

jest.mock('@mento-protocol/mento-core-ts', () => {
  return {
    Broker__factory: {
      connect: jest.fn(),
    },
  }
})

// ========== Mock data ==========
const fakeAsset = '0x62492A644A588FD904270BeD06ad52B9abfEA1aE'
const fakeExchangeId =
  '0x3135b662c38265d0655177091f1b647b4fef511103d06c016efdf18b46930d2c'

const fakeLimitConfig = {
  asset: fakeAsset,
  timestep0: 300,
  timestep1: 86400,
  limit0: 100000,
  limit1: 500000,
  limitGlobal: 0,
  flags: 3,
}
const fakeLimitState = {
  asset: fakeAsset,
  lastUpdated0: 1681381868,
  lastUpdated1: 1681375758,
  netflow0: 15,
  netflow1: 20,
  netflowGlobal: 0,
}

// ========== Mock contract factories ==========
const mockBrokerFactory = {
  tradingLimitsConfig: jest.fn(),
  tradingLimitsState: jest.fn(),
}
// @ts-ignore
Broker__factory.connect.mockReturnValue(mockBrokerFactory)

const provider = new providers.JsonRpcProvider()

describe('Limits', () => {
  afterEach(async () => {
    jest.clearAllMocks()
  })

  describe('getLimitsConfig', () => {
    it('should return the limits config', async () => {
      const broker = Broker__factory.connect('0xfakeBrokerAddr', provider)
      mockBrokerFactory.tradingLimitsConfig.mockResolvedValue(fakeLimitConfig)

      const cfg = await getLimitsConfig(broker, fakeExchangeId, fakeAsset)
      expect(cfg).toEqual(fakeLimitConfig)
    })
  })

  describe('getLimitsState', () => {
    it('should return the current state if up to date', async () => {
      const broker = Broker__factory.connect('0xfakeBrokerAddr', provider)

      const nowEpoch = Math.floor(Date.now() / 1000)
      const updatedState = {
        ...fakeLimitState,
        lastUpdated0: nowEpoch,
        lastUpdated1: nowEpoch,
      }

      mockBrokerFactory.tradingLimitsConfig.mockResolvedValue(fakeLimitConfig)
      mockBrokerFactory.tradingLimitsState.mockResolvedValue(updatedState)

      const state = await getLimitsState(broker, fakeExchangeId, fakeAsset)
      expect(state).toEqual(updatedState)
    })

    it('should refresh L0 if outdated', async () => {
      const broker = Broker__factory.connect('0xfakeBrokerAddr', provider)

      const nowEpoch = Math.floor(Date.now() / 1000)
      const stateWithOutdatedL0 = {
        ...fakeLimitState,
        lastUpdated0: nowEpoch - fakeLimitConfig.timestep0 - 1,
        lastUpdated1: nowEpoch,
      }

      mockBrokerFactory.tradingLimitsConfig.mockResolvedValue(fakeLimitConfig)
      mockBrokerFactory.tradingLimitsState.mockResolvedValue(
        stateWithOutdatedL0
      )

      const state = await getLimitsState(broker, fakeExchangeId, fakeAsset)
      expect(state.netflow0).toEqual(0)
      expect(state.lastUpdated0).toEqual(nowEpoch)
    })

    it('should refresh L1 if outdated', async () => {
      const broker = Broker__factory.connect('0xfakeBrokerAddr', provider)

      const nowEpoch = Math.floor(Date.now() / 1000)
      const stateWithOutdatedL1 = {
        ...fakeLimitState,
        lastUpdated0: nowEpoch,
        lastUpdated1: nowEpoch - fakeLimitConfig.timestep1 - 1,
      }

      mockBrokerFactory.tradingLimitsConfig.mockResolvedValue(fakeLimitConfig)
      mockBrokerFactory.tradingLimitsState.mockResolvedValue(
        stateWithOutdatedL1
      )

      const state = await getLimitsState(broker, fakeExchangeId, fakeAsset)
      expect(state.netflow1).toEqual(0)
      expect(state.lastUpdated1).toEqual(nowEpoch)
    })
  })

  describe('getLimits', () => {
    beforeEach(() => {
      mockBrokerFactory.tradingLimitsConfig.mockResolvedValue(fakeLimitConfig)
      mockBrokerFactory.tradingLimitsState.mockResolvedValue(fakeLimitState)
    })

    it('should return limits for both L0 and L1', async () => {
      const broker = Broker__factory.connect('0xfakeBrokerAddr', provider)
      const limits = await getLimits(broker, fakeExchangeId, fakeAsset)
      expect(limits.length).toEqual(2)
    })

    it('should return the right remaining limits for L0 and L1', async () => {
      const nowEpoch = Math.floor(Date.now() / 1000)
      const cfg = {
        ...fakeLimitConfig,
        limit0: 100,
        limit1: 1000,
      }
      const stateWithoutNetflow = {
        ...fakeLimitState,
        lastUpdated0: nowEpoch,
        lastUpdated1: nowEpoch,
        netflow0: 0,
        netflow1: 0,
      }

      mockBrokerFactory.tradingLimitsConfig.mockResolvedValue(cfg)
      mockBrokerFactory.tradingLimitsState.mockResolvedValue(
        stateWithoutNetflow
      )

      const broker = Broker__factory.connect('0xfakeBrokerAddr', provider)
      const limits = await getLimits(broker, fakeExchangeId, fakeAsset)
      expect(limits.length).toEqual(2)

      const [l0Limit, l1Limit] = limits
      expect(l0Limit.maxIn).toEqual(100)
      expect(l0Limit.maxOut).toEqual(100)
      expect(l0Limit.until).toEqual(nowEpoch + cfg.timestep0)
      expect(l1Limit.maxIn).toEqual(1000)
      expect(l1Limit.maxOut).toEqual(1000)
      expect(l1Limit.until).toEqual(nowEpoch + cfg.timestep1)

      const stateWithPositiveflow = {
        ...stateWithoutNetflow,
        netflow0: 20,
        netflow1: 200,
      }
      mockBrokerFactory.tradingLimitsState.mockResolvedValue(
        stateWithPositiveflow
      )
      const limitsAfterPositiveFlow = await getLimits(
        broker,
        fakeExchangeId,
        fakeAsset
      )
      expect(limits.length).toEqual(2)

      const [l0LimitAfterPosFlow, l1LimitAfterPosFlow] = limitsAfterPositiveFlow
      expect(l0LimitAfterPosFlow.maxIn).toEqual(80)
      expect(l0LimitAfterPosFlow.maxOut).toEqual(120)
      expect(l0LimitAfterPosFlow.until).toEqual(nowEpoch + cfg.timestep0)
      expect(l1LimitAfterPosFlow.maxIn).toEqual(800)
      expect(l1LimitAfterPosFlow.maxOut).toEqual(1200)
      expect(l1LimitAfterPosFlow.until).toEqual(nowEpoch + cfg.timestep1)

      const stateWithNegativeflow = {
        ...stateWithoutNetflow,
        netflow0: -20,
        netflow1: -200,
      }
      mockBrokerFactory.tradingLimitsState.mockResolvedValue(
        stateWithNegativeflow
      )
      const limitsAfterNegativeFlow = await getLimits(
        broker,
        fakeExchangeId,
        fakeAsset
      )
      expect(limits.length).toEqual(2)

      const [l0LimitAfterNegFlow, l1LimitAfterNegFlow] = limitsAfterNegativeFlow
      expect(l0LimitAfterNegFlow.maxIn).toEqual(120)
      expect(l0LimitAfterNegFlow.maxOut).toEqual(80)
      expect(l0LimitAfterNegFlow.until).toEqual(nowEpoch + cfg.timestep0)
      expect(l1LimitAfterNegFlow.maxIn).toEqual(1200)
      expect(l1LimitAfterNegFlow.maxOut).toEqual(800)
      expect(l1LimitAfterNegFlow.until).toEqual(nowEpoch + cfg.timestep1)
    })

    it('should return limit for LG if configured', async () => {
      const cfgWithLG = {
        ...fakeLimitConfig,
        limitGlobal: 1000000,
      }
      mockBrokerFactory.tradingLimitsConfig.mockResolvedValue(cfgWithLG)

      const broker = Broker__factory.connect('0xfakeBrokerAddr', provider)
      const limits = await getLimits(broker, fakeExchangeId, fakeAsset)
      expect(limits.length).toEqual(3)
    })

    it('should constrain smaller limits according to bigger ones', async () => {
      const nowEpoch = Math.floor(Date.now() / 1000)
      const cfg = {
        ...fakeLimitConfig,
        limit0: 100,
        limit1: 1000,
        limitGlobal: 10000,
      }
      const stateWithL1ConstrainingL0 = {
        ...fakeLimitState,
        lastUpdated0: nowEpoch,
        lastUpdated1: nowEpoch,
        netflow0: 25,
        netflow1: 995,
        netflowGlobal: 1020,
      }

      mockBrokerFactory.tradingLimitsConfig.mockResolvedValue(cfg)
      mockBrokerFactory.tradingLimitsState.mockResolvedValue(
        stateWithL1ConstrainingL0
      )

      const broker = Broker__factory.connect('0xfakeBrokerAddr', provider)
      let limits = await getLimits(broker, fakeExchangeId, fakeAsset)
      expect(limits.length).toEqual(3)
      expect(limits[0].maxIn).toEqual(5)
      expect(limits[1].maxIn).toEqual(5)
      expect(limits[2].maxIn).toEqual(8980)

      const stateWithLGMaxedOut = {
        ...fakeLimitState,
        lastUpdated0: nowEpoch,
        lastUpdated1: nowEpoch,
        netflow0: 25,
        netflow1: 25,
        netflowGlobal: cfg.limitGlobal,
      }
      mockBrokerFactory.tradingLimitsState.mockResolvedValue(
        stateWithLGMaxedOut
      )
      const maxedOutLimits = await getLimits(broker, fakeExchangeId, fakeAsset)
      expect(maxedOutLimits.length).toEqual(3)
      expect(maxedOutLimits.every((limit) => limit.maxIn === 0)).toBe(true)
    })
  })

  describe('getLimitId', () => {
    it('should return the correct limit id for the given exchange and token', async () => {
      const cUsdCeloExchangeId =
        '0x3135b662c38265d0655177091f1b647b4fef511103d06c016efdf18b46930d2c'
      const cUsdAddr = '0x62492A644A588FD904270BeD06ad52B9abfEA1aE'

      expect(getLimitId(cUsdCeloExchangeId, cUsdAddr)).toEqual(
        '0x3135b662c38265d0655177097d524e1f05b7dec807f767ec6850a332ed6dac82'
      )

      const cEurCeloExchangeId =
        '0xb73ffc6b5123de3c8e460490543ab93a3be7d70824f1666343df49e219199b8c'
      const cEurAddr = '0xf9ecE301247aD2CE21894941830A2470f4E774ca'

      expect(getLimitId(cEurCeloExchangeId, cEurAddr)).toEqual(
        '0xb73ffc6b5123de3c8e460490add65a3b1f9d05c605782f22c0d56d92edfeef46'
      )

      const cRealCeloExchangeId =
        '0xed0528e42b9ecae538aab34b93813e08de03f8ac4a894b277ef193e67275bbae'
      const cRealAddr = '0x6a0EEf2bed4C30Dc2CB42fe6c5f01F80f7EF16d1'

      expect(getLimitId(cRealCeloExchangeId, cRealAddr)).toEqual(
        '0xed0528e42b9ecae538aab34bf98fd123334fc870663d64c1bb018c66859aad7f'
      )
    })
  })
})
