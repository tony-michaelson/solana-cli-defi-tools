import { TOKEN_PROGRAM_ID, Token } from '@solana/spl-token'
import {
  Connection,
  Keypair,
  Signer,
  TransactionInstruction,
} from '@solana/web3.js'
import type { TokenInfo } from '@saberhq/token-utils'
import saber from '@saberhq/stableswap-sdk'
import { findAssociatedTokenAddress } from '../token/token.js'
import saberContrib from '@saberhq/solana-contrib'
import { getChainId } from '../util.js'
import { NETWORK_NAME } from '../constants.js'

export async function printSaberPoolATABalances(
  connection: Connection,
  tokenSwap: saber.StableSwap,
  payer: Keypair
) {
  const mintA = new Token(
    connection,
    tokenSwap.state.tokenA.mint,
    TOKEN_PROGRAM_ID,
    payer
  )
  const mintB = new Token(
    connection,
    tokenSwap.state.tokenB.mint,
    TOKEN_PROGRAM_ID,
    payer
  )
  const mintLP = new Token(
    connection,
    tokenSwap.state.poolTokenMint,
    TOKEN_PROGRAM_ID,
    payer
  )

  const ataA = await findAssociatedTokenAddress(
    payer.publicKey,
    mintA.publicKey
  )
  const ataB = await findAssociatedTokenAddress(
    payer.publicKey,
    mintB.publicKey
  )
  const ataLP = await findAssociatedTokenAddress(
    payer.publicKey,
    mintLP.publicKey
  )

  const ataAInfo = await connection.getAccountInfo(ataA)
  const ataBInfo = await connection.getAccountInfo(ataB)
  const ataLPInfo = await connection.getAccountInfo(ataLP)

  ataAInfo || (await mintA.createAssociatedTokenAccount(payer.publicKey))
  ataBInfo || (await mintB.createAssociatedTokenAccount(payer.publicKey))
  ataLPInfo || (await mintLP.createAssociatedTokenAccount(payer.publicKey))

  const ataABal = (await connection.getTokenAccountBalance(ataA)).value
    .uiAmountString
  const ataBBal = (await connection.getTokenAccountBalance(ataB)).value
    .uiAmountString
  const ataLPBal = (await connection.getTokenAccountBalance(ataLP)).value
    .uiAmountString

  console.log('Mint A:\t\t', mintA.publicKey.toString())
  console.log('ATA A:\t\t', ataA.toString())
  console.log('Balance:\t', ataABal)
  console.log()
  console.log('Mint B:\t\t', mintB.publicKey.toString())
  console.log('ATA B:\t\t', ataB.toString())
  console.log('Balance:\t', ataBBal)
  console.log()
  console.log('Mint LP:\t', mintLP.publicKey.toString())
  console.log('ATA LP:\t\t', ataLP.toString())
  console.log('Balance:\t', ataLPBal)
  console.log()
}

export async function executeInstruction(
  connection: Connection,
  instruction: TransactionInstruction,
  beforeTransaction: () => void,
  afterTransaction: () => void,
  signers: Signer[],
  payer: Keypair
) {
  const broadcaster = new saberContrib.SingleConnectionBroadcaster(connection)
  const wallet = new saberContrib.SignerWallet(payer)

  const provider = new saberContrib.SolanaProvider(
    connection,
    broadcaster,
    wallet
  )

  const tx = new saberContrib.TransactionEnvelope(
    provider,
    [instruction],
    signers
  )

  await beforeTransaction()
  const txSig = (await tx.confirm()).signature
  console.log(`Transaction Signature: ${txSig}`)
  console.log('')
  await afterTransaction()
}

export async function initializeStableSwap(
  connection: Connection,
  payer: Keypair,
  swapAccount: Keypair,
  transferInstructions: TransactionInstruction[],
  initSwapInstruction: saber.InitializeSwapInstruction
) {
  const broadcaster = new saberContrib.SingleConnectionBroadcaster(connection)
  const wallet = new saberContrib.SignerWallet(payer)

  const provider = new saberContrib.SolanaProvider(
    connection,
    broadcaster,
    wallet
  )

  const { instructions } =
    await saber.createInitializeStableSwapInstructionsRaw({
      provider,
      initializeSwapInstruction: initSwapInstruction,
    })

  const allInstructions: TransactionInstruction[] =
    transferInstructions.concat(instructions)

  const tx = new saberContrib.TransactionEnvelope(provider, allInstructions, [
    payer,
    swapAccount,
  ])
  const txSig = (await tx.confirm()).signature
  console.log(`TxSig: ${txSig}`)
}

export async function getExchange(
  connection: Connection,
  networkName: NETWORK_NAME,
  mintA: Token,
  mintB: Token,
  mintLP: Token,
  tokenSwap: saber.StableSwap
) {
  const tokenA: TokenInfo = {
    chainId: getChainId(networkName),
    address: mintA.publicKey.toString(),
    name: 'Token A',
    decimals: (await mintA.getMintInfo()).decimals,
    symbol: 'TokenA',
  }

  const tokenB: TokenInfo = {
    chainId: getChainId(networkName),
    address: mintB.publicKey.toString(),
    name: 'Token B',
    decimals: (await mintB.getMintInfo()).decimals,
    symbol: 'TokenB',
  }

  const iExchange = saber.makeExchange({
    swapAccount: tokenSwap.config.swapAccount,
    lpToken: mintLP.publicKey,
    tokenA: tokenA,
    tokenB: tokenB,
  })

  return await saber.loadExchangeInfo(connection, iExchange, tokenSwap)
}
