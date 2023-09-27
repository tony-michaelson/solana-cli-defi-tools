import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { createKeypairFromFile, getPubkeyForEnv } from './lib'
import { getLiquidityPoolInfo } from '../src/commands/raydium'
import {
  RAYDIUM_PROGRAM_ID_V4,
  SERUM_PROGRAM_ID_V3,
} from '../src/lib/raydium/util/ids'
import { findAssociatedTokenAddress } from '../src/lib/raydium/util/web3'
import { swap } from '../src/lib/raydium/util/swap'
import Decimal from 'decimal.js'
import { calcSwapAmountForDesiredPrice } from '../src/lib/util'
import { TOKENS } from '../src/lib/raydium/util/tokens'
import { Fee } from '../src/lib/fee'

const connection = new Connection('https://api.devnet.solana.com', 'confirmed')
const networkName = 'devnet'

describe('raydium', () => {
  jest.setTimeout(120 * 1000)

  it('set price on a pool (fix under peg)', async () => {
    const payerKP = await createKeypairFromFile(process.env['PAYER_KEYFILE'])
    const ammIdPubKey = getPubkeyForEnv(process.env['AMM_ID'])
    const fakeVaultSigner = new Keypair()
    const poolInfo = await getLiquidityPoolInfo(
      ammIdPubKey,
      fakeVaultSigner.publicKey,
      payerKP,
      connection,
      SERUM_PROGRAM_ID_V3[networkName],
      RAYDIUM_PROGRAM_ID_V4[networkName]
    )

    const baseVault = new PublicKey(poolInfo.poolCoinTokenAccount)
    const quoteVault = new PublicKey(poolInfo.poolPcTokenAccount)

    const baseBalanceLookup = await connection.getTokenAccountBalance(baseVault)
    const baseBalance = baseBalanceLookup.value.uiAmountString
      ? new Decimal(baseBalanceLookup.value.uiAmountString)
      : new Decimal(0)

    const quoteBalanceLookup = await connection.getTokenAccountBalance(
      quoteVault
    )
    const quoteBalance = quoteBalanceLookup.value.uiAmountString
      ? new Decimal(quoteBalanceLookup.value.uiAmountString)
      : new Decimal(0)

    const currentPrice = baseBalance.gt(0)
      ? quoteBalance.div(baseBalance)
      : new Decimal(0)
    const desiredPrice = currentPrice.sub('0.05')

    console.log(
      'currentPrice:',
      currentPrice.toString(),
      'baseBalance:',
      baseBalance.toString(),
      'quoteBalance:',
      quoteBalance.toString()
    )

    const tradeFee = new Fee('25', '10000')

    const swapAmount = calcSwapAmountForDesiredPrice(
      'raydium',
      baseBalance,
      quoteBalance,
      desiredPrice,
      tradeFee
    )

    if (swapAmount) {
      console.log(swapAmount)
      const direction = 'AtB'
      const fromCoin =
        direction === 'AtB'
          ? poolInfo.coin.mintAddress
          : poolInfo.pc.mintAddress
      const toCoin =
        direction === 'AtB'
          ? poolInfo.pc.mintAddress
          : poolInfo.coin.mintAddress

      const fromCoinATA = await findAssociatedTokenAddress(
        payerKP.publicKey,
        new PublicKey(fromCoin)
      )
      const toCoinATA = await findAssociatedTokenAddress(
        payerKP.publicKey,
        new PublicKey(toCoin)
      )

      const txid = await swap(
        connection,
        payerKP,
        poolInfo,
        fromCoin.toString(),
        toCoin.toString(),
        fromCoinATA.toString(),
        toCoinATA.toString(),
        swapAmount.amount.toString(),
        '0',
        TOKENS.WSOL.mintAddress.toString()
      )

      console.log('SWAP TXID:', txid)

      await new Promise((e) => setTimeout(e, 5000))
      // check new price
      {
        const poolInfo = await getLiquidityPoolInfo(
          ammIdPubKey,
          fakeVaultSigner.publicKey,
          payerKP,
          connection,
          SERUM_PROGRAM_ID_V3[networkName],
          RAYDIUM_PROGRAM_ID_V4[networkName]
        )

        const baseVault = new PublicKey(poolInfo.poolCoinTokenAccount)
        const quoteVault = new PublicKey(poolInfo.poolPcTokenAccount)

        const baseBalanceLookup = await connection.getTokenAccountBalance(
          baseVault
        )
        const baseBalance = baseBalanceLookup.value.uiAmountString
          ? new Decimal(baseBalanceLookup.value.uiAmountString)
          : new Decimal(0)

        const quoteBalanceLookup = await connection.getTokenAccountBalance(
          quoteVault
        )
        const quoteBalance = quoteBalanceLookup.value.uiAmountString
          ? new Decimal(quoteBalanceLookup.value.uiAmountString)
          : new Decimal(0)

        const newPrice = baseBalance.gt(0)
          ? quoteBalance.div(baseBalance)
          : new Decimal(0)

        console.log('new price', newPrice)

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
