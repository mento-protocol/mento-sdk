# Mento SDK

The official Mento Protocol SDK for interacting with Multi-Collateral Mento smart contracts on the Celo network.

# Sample Usage

```javascript
const provider = new providers.JsonRpcProvider(
  'https://baklava-forno.celo-testnet.org'
)
const pKey = 'privateKey'
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
const amountOutMin = await mento.getAmountOut(
  tokenIn,
  tokenOut,
  // 95% of amountIn to allow some slippage
  utils.parseUnits((one * 0.95).toString(), 18)
)

// allow the broker contract to spend CELO on behalf of the wallet
const allowanceTxObj = await mento.increaseTradingAllowance(tokenIn, amountIn)
const allowanceTx = await wallet.sendTransaction(allowanceTxObj)
const allowanceReceipt = await allowanceTx.wait()
console.log('increaseAllowance receipt', allowanceReceipt)

// execute the swap
const swapTxObj = await mento.swapIn(tokenIn, tokenOut, amountIn, amountOutMin)
const swapTx = await wallet.sendTransaction(swapTxObj)
const swapReceipt = await swapTx.wait()

console.log('swapIn receipt', swapReceipt)
```

# In depth docs

- [ ] TODO: Adds docs link
