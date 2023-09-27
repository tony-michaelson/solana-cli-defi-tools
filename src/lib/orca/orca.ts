import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { ORCA_TOKEN_SWAP_ID } from '../constants.js'
import { TokenSwap } from '@solana/spl-token-swap'
import { OrcaToken, Percentage, Network } from '@orca-so/sdk'
import { OrcaPoolImpl } from '@orca-so/sdk/dist/model/orca/pool/orca-pool.js'
import { OrcaPoolParams } from '@orca-so/sdk/dist/model/orca/pool/pool-types.js'
import { OrcaPool } from '@orca-so/sdk/dist/public/index.js'

export async function findTokenSwapNonce(
  programId: PublicKey,
  tokenSwap: TokenSwap,
  nonce = 255
): Promise<number> {
  const _next = nonce
    ? findTokenSwapNonce(programId, tokenSwap, nonce - 1)
    : nonce
  try {
    const authorityGuess = await PublicKey.createProgramAddress(
      [tokenSwap.tokenSwap.toBuffer(), Buffer.from([nonce])],
      programId
    )
    return tokenSwap.authority.equals(authorityGuess) ? nonce : _next
  } catch (err) {
    if (err instanceof TypeError) {
      throw err
    }
    return _next
  }
}

export async function tokenSwapToOrcaPool(
  connection: Connection,
  network: Network,
  payer: Keypair,
  tokenSwap: TokenSwap
): Promise<OrcaPool> {
  const programId = ORCA_TOKEN_SWAP_ID[network]
  const nonce = await findTokenSwapNonce(programId, tokenSwap)

  if (!nonce) {
    throw (
      'Unable to determine nonce for TokenSwap authority: ' +
      tokenSwap.authority.toString() +
      ', ' +
      'ProgramID: ' +
      programId.toString() +
      ', ' +
      'Network: ' +
      network.toString()
    )
  }

  const mintA = new Token(connection, tokenSwap.mintA, TOKEN_PROGRAM_ID, payer)
  const mintB = new Token(connection, tokenSwap.mintB, TOKEN_PROGRAM_ID, payer)
  const mintLP = new Token(
    connection,
    tokenSwap.poolToken,
    TOKEN_PROGRAM_ID,
    payer
  )
  const poolTokenDecimals = (await mintLP.getMintInfo()).decimals

  const tokenA: OrcaToken = Object.freeze({
    tag: 'tokenA',
    name: 'tokenA',
    mint: mintA.publicKey,
    scale: (await mintA.getMintInfo()).decimals,
  })

  const tokenB: OrcaToken = Object.freeze({
    tag: 'tokenB',
    name: 'tokenB',
    mint: mintB.publicKey,
    scale: (await mintB.getMintInfo()).decimals,
  })

  const amp = tokenSwap.curveType === 2 ? 100 : undefined

  const customConfig: OrcaPoolParams = Object.freeze({
    address: tokenSwap.tokenSwap,
    nonce: nonce,
    authority: tokenSwap.authority,
    poolTokenMint: tokenSwap.poolToken,
    poolTokenDecimals: poolTokenDecimals,
    feeAccount: tokenSwap.feeAccount,
    tokenIds: [mintA.publicKey.toString(), mintB.publicKey.toString()],
    tokens: {
      [mintA.publicKey.toString()]: {
        ...tokenA,
        addr: tokenSwap.tokenAccountA,
      },
      [mintB.publicKey.toString()]: {
        ...tokenB,
        addr: tokenSwap.tokenAccountB,
      },
    },
    curveType: tokenSwap.curveType,
    amp: amp,
    feeStructure: {
      traderFee: Percentage.fromFraction(
        tokenSwap.tradeFeeNumerator,
        tokenSwap.tradeFeeDenominator
      ),
      ownerFee: Percentage.fromFraction(
        tokenSwap.ownerTradeFeeNumerator,
        tokenSwap.ownerTradeFeeDenominator
      ),
    },
  })

  return new OrcaPoolImpl(connection, network, customConfig)
}
