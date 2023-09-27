import { Account, Connection } from '@solana/web3.js'
import { createKeypairFromFile, getPubkeyForEnv } from './lib'
import Decimal from 'decimal.js'
import { calcSwapAmountForDesiredPrice } from '../src/lib/util'
import { Fee } from '../src/lib/fee'
import { TokenSwap } from '@solana/spl-token-swap'
import { ORCA_TOKEN_SWAP_ID } from '../src/lib/constants'
import * as orca from '@orca-so/sdk'
import { tokenSwapToOrcaPool } from '../src/lib/orca/orca'

const connection = new Connection('https://api.devnet.solana.com', 'confirmed')
const networkName = 'devnet'

describe('orca', () => {
  jest.setTimeout(120 * 1000)

  it('set price on a pool (fix under peg)', async () => {
    const payerKP = await createKeypairFromFile(process.env['PAYER_KEYFILE'])
    const tokenSwap_PK = getPubkeyForEnv(process.env['SWAP_ID'])
    const payerAccount = new Account(payerKP.secretKey)
    const programId = ORCA_TOKEN_SWAP_ID[networkName]
    const tokenSwap = await TokenSwap.loadTokenSwap(
      connection,
      tokenSwap_PK,
      programId,
      payerAccount
    )

    const baseBalanceLookup = await connection.getTokenAccountBalance(
      tokenSwap.tokenAccountA
    )
    const baseBalance =
      (baseBalanceLookup.value.uiAmountString &&
        new Decimal(baseBalanceLookup.value.uiAmountString)) ||
      new Decimal(0)

    const quoteBalanceLookup = await connection.getTokenAccountBalance(
      tokenSwap.tokenAccountB
    )
    const quoteBalance =
      (quoteBalanceLookup.value.uiAmountString &&
        new Decimal(quoteBalanceLookup.value.uiAmountString)) ||
      new Decimal(0)

    const tradeFee = new Fee(
      tokenSwap.tradeFeeNumerator.toString(),
      tokenSwap.tradeFeeDenominator.toString()
    )
    const ownerFee = new Fee(
      tokenSwap.ownerTradeFeeNumerator.toString(),
      tokenSwap.ownerTradeFeeDenominator.toString()
    )

    const currentPrice = quoteBalance.div(baseBalance)
    const desiredPrice = currentPrice.sub('0.05')

    const swapAmount = calcSwapAmountForDesiredPrice(
      'orca',
      baseBalance,
      quoteBalance,
      desiredPrice,
      tradeFee,
      ownerFee
    )

    if (swapAmount) {
      console.log(swapAmount)

      const tokenAmountIn = swapAmount.amount
      const direction = swapAmount.input === 'base' ? 'AtB' : 'BtA'

      const orcaNetwork =
        networkName === 'devnet' ? orca.Network.DEVNET : orca.Network.MAINNET

      const orcaPool = await tokenSwapToOrcaPool(
        connection,
        orcaNetwork,
        payerKP,
        tokenSwap
      )

      const fromCoin: orca.OrcaPoolToken =
        direction === 'AtB' ? orcaPool.getTokenA() : orcaPool.getTokenB()
      // const toCoin: orca.OrcaPoolToken =
      //   direction === 'AtB' ? orcaPool.getTokenB() : orcaPool.getTokenA()

      const quote = await orcaPool.getQuote(fromCoin, tokenAmountIn)
      const tokenAmountOut = quote.getMinOutputAmount()

      const swapPayload = await orcaPool.swap(
        payerKP,
        fromCoin,
        tokenAmountIn,
        tokenAmountOut
      )
      const swapTxId = await swapPayload.execute()
      console.log('TXID:', swapTxId, '\n')

      await new Promise((e) => setTimeout(e, 5000))
      // check new price
      {
        const baseBalanceLookup = await connection.getTokenAccountBalance(
          tokenSwap.tokenAccountA
        )
        const baseBalance =
          (baseBalanceLookup.value.uiAmountString &&
            new Decimal(baseBalanceLookup.value.uiAmountString)) ||
          new Decimal(0)

        const quoteBalanceLookup = await connection.getTokenAccountBalance(
          tokenSwap.tokenAccountB
        )
        const quoteBalance =
          (quoteBalanceLookup.value.uiAmountString &&
            new Decimal(quoteBalanceLookup.value.uiAmountString)) ||
          new Decimal(0)

        const newPrice = quoteBalance.div(baseBalance)
        console.log('new price:', newPrice)

        expect(
          newPrice.gte(desiredPrice.sub('0.0001')) &&
            newPrice.lte(desiredPrice.add('0.0001'))
        ).toBeTruthy()
      }
    } else {
      expect('fail').toStrictEqual('')
    }
  })
})
