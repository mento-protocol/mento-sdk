# Mento SDK

The official Mento Protocol SDK for interacting with Multi-Collateral Mento smart contracts on the Celo network.

# Example Usage

```javascript
import { Wallet, providers, utils } from 'ethers'

import { Mento } from '@mento-protocol/mento-sdk'

async function main() {
  const provider = new providers.JsonRpcProvider(
    'https://baklava-forno.celo-testnet.org'
  )
  const pKey =
    'b214fcf9673dc1a880f8041a8c8952c2dc7daff41fb64cf7715919df095c3fce'
  const wallet = new Wallet(pKey, provider)

  const mento = await Mento.create(wallet)
  console.log('available pairs: ', await mento.getTradeablePairs())
  /*
          [
        [
          {
            address: '0x62492A644A588FD904270BeD06ad52B9abfEA1aE',
            symbol: 'cUSD'
          },
          {
            address: '0xdDc9bE57f553fe75752D61606B94CBD7e0264eF8',
            symbol: 'CELO'
          }
        ],
        ...
      ]
      */

  // swap 1 CELO for cUSD
  const one = 1
  const tokenIn = '0xdDc9bE57f553fe75752D61606B94CBD7e0264eF8' // CELO
  const tokenOut = '0x62492A644A588FD904270BeD06ad52B9abfEA1aE' // cUSD
  const amountIn = utils.parseUnits(one.toString(), 18)
  const expectedAmountOut = await mento.getAmountOut(
    tokenIn,
    tokenOut,
    utils.parseUnits(one.toString(), 18)
  )
  // 95% of the quote to allow some slippage
  const minAmountOut = expectedAmountOut.mul(95).div(100)

  // allow the broker contract to spend CELO on behalf of the wallet
  const allowanceTxObj = await mento.increaseTradingAllowance(tokenIn, amountIn)
  const allowanceTx = await wallet.sendTransaction(allowanceTxObj)
  const allowanceReceipt = await allowanceTx.wait()
  console.log('increaseAllowance receipt', allowanceReceipt)

  // execute the swap
  const swapTxObj = await mento.swapIn(
    tokenIn,
    tokenOut,
    amountIn,
    minAmountOut
  )
  const swapTx = await wallet.sendTransaction(swapTxObj)
  const swapReceipt = await swapTx.wait()

  console.log('swapIn receipt', swapReceipt)
}

main()
  .then(() => console.log('Done'))
  .catch((e) => console.error('Error:', e))
```
