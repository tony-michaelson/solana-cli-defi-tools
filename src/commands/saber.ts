import { Command } from 'commander'
import {
  networkOption,
  payerOption,
  quoteOnlyOption,
  SABER_SWAP_SLIPPAGE,
  swapDirectionOption,
} from '../lib/constants.js'
import {
  checkOptions,
  createKeypairFromFile,
  getConnection,
  getNetworkName,
} from '../lib/util.js'
import { Option } from '../lib/types.js'
import { transfer } from '../lib/raydium/util/swap.js'
import { Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, Token, u64 } from '@solana/spl-token'
import JSBI from 'jsbi'
import { findAssociatedTokenAddress } from '../lib/token/token.js'
import saber from '@saberhq/stableswap-sdk'
import {
  DepositInstruction,
  WithdrawInstruction,
  SwapInstruction,
  InitializeSwapInstruction,
} from '@saberhq/stableswap-sdk/src/instructions/index.js'
import saberToken from '@saberhq/token-utils'
const { TokenAmount } = saberToken
import {
  executeInstruction,
  getExchange,
  initializeStableSwap,
  printSaberPoolATABalances,
} from '../lib/saber/saber.js'
const { StableSwap, SWAP_PROGRAM_ID, RECOMMENDED_FEES } = saber

async function createPool(
  mintAStr: string,
  tokenAmountAStr: string,
  mintBStr: string,
  tokenAmountBStr: string,
  option: Option
) {
  checkOptions(option, 'network', 'payer')
  const networkName = getNetworkName(option)
  const connection = getConnection(networkName)
  const payer = await createKeypairFromFile(option['payer'])

  const swapAccount = new Keypair()

  console.log('Swap Account:', swapAccount.publicKey.toString())

  const [authority, nonce] = await PublicKey.findProgramAddress(
    [swapAccount.publicKey.toBuffer()],
    SWAP_PROGRAM_ID
  )

  const mintA_PK = new PublicKey(mintAStr)
  const mintB_PK = new PublicKey(mintBStr)

  const tokenAmountA = parseInt(tokenAmountAStr)
  const tokenAmountB = parseInt(tokenAmountBStr)

  const mintA = new Token(connection, mintA_PK, TOKEN_PROGRAM_ID, payer)
  const mintB = new Token(connection, mintB_PK, TOKEN_PROGRAM_ID, payer)
  const mintLP = await Token.createMint(
    connection,
    payer,
    authority,
    null,
    2,
    TOKEN_PROGRAM_ID
  )

  const ataA = await findAssociatedTokenAddress(
    payer.publicKey,
    mintA.publicKey
  )
  const ataB = await findAssociatedTokenAddress(
    payer.publicKey,
    mintB.publicKey
  )

  const ataAInfo = await connection.getAccountInfo(ataA)
  const ataBInfo = await connection.getAccountInfo(ataB)

  ataAInfo || (await mintA.createAssociatedTokenAccount(payer.publicKey))
  ataBInfo || (await mintB.createAssociatedTokenAccount(payer.publicKey))

  const ataLP = await mintLP.createAssociatedTokenAccount(payer.publicKey)

  const tokenAReserve = await mintA.createAccount(authority)
  const tokenBReserve = await mintB.createAccount(authority)

  const tokenAFeeAccount = await mintA.createAccount(payer.publicKey)
  const tokenBFeeAccount = await mintB.createAccount(payer.publicKey)

  const transferInstructions: TransactionInstruction[] = [
    transfer(ataA, tokenAReserve, payer.publicKey, tokenAmountA),
    transfer(ataB, tokenBReserve, payer.publicKey, tokenAmountB),
  ]

  const initSwapInstruction: InitializeSwapInstruction = {
    config: {
      swapAccount: swapAccount.publicKey,
      authority: authority,
      swapProgramID: SWAP_PROGRAM_ID,
      tokenProgramID: TOKEN_PROGRAM_ID,
    },
    adminAccount: payer.publicKey,
    tokenA: {
      adminFeeAccount: tokenAFeeAccount,
      mint: mintA.publicKey,
      reserve: tokenAReserve,
    },
    tokenB: {
      adminFeeAccount: tokenBFeeAccount,
      mint: mintB.publicKey,
      reserve: tokenBReserve,
    },
    poolTokenMint: mintLP.publicKey,
    destinationPoolTokenAccount: ataLP,
    nonce: nonce,
    ampFactor: new u64(100),
    fees: RECOMMENDED_FEES,
    isPaused: false,
  }

  initializeStableSwap(
    connection,
    payer,
    swapAccount,
    transferInstructions,
    initSwapInstruction
  )
}

async function showPool(tokenSwapID: string, option: Option) {
  checkOptions(option, 'network', 'payer')
  const networkName = getNetworkName(option)
  const connection = getConnection(networkName)
  const payer = await createKeypairFromFile(option['payer'])

  const tokenSwap_PK = new PublicKey(tokenSwapID)

  const tokenSwap = await StableSwap.load(connection, tokenSwap_PK)

  const tokenAccountBalA = (
    await connection.getTokenAccountBalance(tokenSwap.state.tokenA.reserve)
  ).value.amount
  const tokenAccountBalB = (
    await connection.getTokenAccountBalance(tokenSwap.state.tokenB.reserve)
  ).value.amount

  const mintLP = new Token(
    connection,
    tokenSwap.state.poolTokenMint,
    TOKEN_PROGRAM_ID,
    payer
  )
  const lpTokenSupply = (await mintLP.getMintInfo()).supply

  const jsonStr = JSON.stringify(tokenSwap.state).replace(/\[(\d+)\]/g, '$1')

  console.log('---- SABER SWAP INFO ----')
  console.log(JSON.parse(jsonStr))
  console.log('')
  console.log('LP Token Mint Supply:', lpTokenSupply.toNumber())
  console.log('Token Reserve Bal A:', tokenAccountBalA)
  console.log('Token Reserve Bal B:', tokenAccountBalB)
  console.log('---- / SABER SWAP INFO ----')
}

async function showPoolATAs(tokenSwapID: string, option: Option) {
  checkOptions(option, 'network', 'payer')
  const networkName = getNetworkName(option)
  const connection = getConnection(networkName)
  const payer = await createKeypairFromFile(option['payer'])

  const tokenSwap_PK = new PublicKey(tokenSwapID)

  const tokenSwap = await StableSwap.load(connection, tokenSwap_PK)

  await printSaberPoolATABalances(connection, tokenSwap, payer)
}

async function deposit(
  tokenSwapID: string,
  tokenQtyA: string,
  tokenQtyB: string,
  option: Option
) {
  checkOptions(option, 'network', 'payer')
  const networkName = getNetworkName(option)
  const connection = getConnection(networkName)
  const payer = await createKeypairFromFile(option['payer'])

  const tokenAmountA = parseInt(tokenQtyA)
  const tokenAmountB = parseInt(tokenQtyB)

  const tokenSwap_PK = new PublicKey(tokenSwapID)

  const tokenSwap = await StableSwap.load(connection, tokenSwap_PK)

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

  const exchangeInfo = await getExchange(
    connection,
    networkName,
    mintA,
    mintB,
    mintLP,
    tokenSwap
  )

  let minimumPoolTokenAmount
  if (exchangeInfo.lpTotalSupply.toU64().toNumber() > 0) {
    const minAmountOut = saber.calculateEstimatedMintAmount(
      exchangeInfo,
      JSBI.BigInt(tokenAmountA),
      JSBI.BigInt(tokenAmountB)
    )
    minimumPoolTokenAmount = minAmountOut.mintAmount.toU64()
  } else {
    minimumPoolTokenAmount = new u64(1)
  }

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

  const userAuthority = new Keypair()

  await mintA.approve(ataA, userAuthority.publicKey, payer, [], tokenAmountA)
  await mintB.approve(ataB, userAuthority.publicKey, payer, [], tokenAmountB)

  const depositInstruction: DepositInstruction = {
    config: tokenSwap.config,
    userAuthority: userAuthority.publicKey,
    sourceA: ataA,
    sourceB: ataB,
    tokenAccountA: tokenSwap.state.tokenA.reserve,
    tokenAccountB: tokenSwap.state.tokenB.reserve,
    poolTokenMint: tokenSwap.state.poolTokenMint,
    poolTokenAccount: ataLP,
    tokenAmountA: new u64(tokenAmountA),
    tokenAmountB: new u64(tokenAmountB),
    minimumPoolTokenAmount: minimumPoolTokenAmount,
  }

  const instruction = await tokenSwap.deposit(depositInstruction)

  console.log('--- DEPOSIT QUOTE ---')
  console.log('GIVE:')
  console.log('Token A:\t' + tokenAmountA.toString())
  console.log('Token B:\t' + tokenAmountB.toString())
  console.log('')
  console.log('RECEIVE:')
  console.log('Token LP:\t' + minimumPoolTokenAmount)
  console.log('--- / DEPOSIT QUOTE ---')

  const printBal = async () =>
    await printSaberPoolATABalances(connection, tokenSwap, payer)

  if (!('quoteOnly' in option)) {
    executeInstruction(
      connection,
      instruction,
      printBal,
      printBal,
      [payer, userAuthority],
      payer
    )
  }
}

const withdrawAll = async (tokenSwapID: string, option: Option) =>
  withdraw(tokenSwapID, '0', { all: 'true', ...option })

async function withdraw(tokenSwapID: string, tokenQty: string, option: Option) {
  checkOptions(option, 'network', 'payer')
  const networkName = getNetworkName(option)
  const connection = getConnection(networkName)
  const payer = await createKeypairFromFile(option['payer'])

  const tokenSwap_PK = new PublicKey(tokenSwapID)

  const tokenSwap = await StableSwap.load(connection, tokenSwap_PK)

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

  const exchangeInfo = await getExchange(
    connection,
    networkName,
    mintA,
    mintB,
    mintLP,
    tokenSwap
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

  const withdrawTokenAmount: number =
    'all' in option
      ? parseInt((await connection.getTokenAccountBalance(ataLP)).value.amount)
      : parseInt(tokenQty)

  const userAuthority = new Keypair()

  await mintLP.approve(
    ataLP,
    userAuthority.publicKey,
    payer,
    [],
    withdrawTokenAmount
  )

  const withdrawQuote = await saber.calculateEstimatedWithdrawAmount({
    ...exchangeInfo,
    poolTokenAmount: new TokenAmount(
      exchangeInfo.lpTotalSupply.token,
      JSBI.BigInt(withdrawTokenAmount)
    ),
  })

  const withdrawInstruction: WithdrawInstruction = {
    config: tokenSwap.config,
    userAuthority: userAuthority.publicKey,
    poolMint: tokenSwap.state.poolTokenMint,
    tokenAccountA: tokenSwap.state.tokenA.reserve,
    tokenAccountB: tokenSwap.state.tokenB.reserve,
    adminFeeAccountA: tokenSwap.state.tokenA.adminFeeAccount,
    adminFeeAccountB: tokenSwap.state.tokenB.adminFeeAccount,
    sourceAccount: ataLP,
    userAccountA: ataA,
    userAccountB: ataB,
    poolTokenAmount: new u64(withdrawTokenAmount),
    minimumTokenA: withdrawQuote.withdrawAmounts[0].toU64(),
    minimumTokenB: withdrawQuote.withdrawAmounts[1].toU64(),
  }

  const instruction = await tokenSwap.withdraw(withdrawInstruction)

  console.log('--- WITHDRAW QUOTE ---')
  console.log('GIVE:')
  console.log('Token LP:\t' + withdrawTokenAmount)
  console.log('')
  console.log('RECEIVE:')
  console.log(
    'Token A:\t' +
      withdrawQuote.withdrawAmountsBeforeFees[0].toU64().toNumber() +
      ' (before fees)'
  )
  console.log(
    'Token A:\t' +
      withdrawQuote.withdrawAmounts[0].toU64().toNumber() +
      ' (after fees)'
  )
  console.log()
  console.log(
    'Token B:\t' +
      withdrawQuote.withdrawAmountsBeforeFees[1].toU64().toNumber() +
      ' (before fees)'
  )
  console.log(
    'Token B:\t' +
      withdrawQuote.withdrawAmounts[1].toU64().toNumber() +
      ' (after fees)'
  )
  console.log('--- / WITHDRAW QUOTE ---')

  const printBal = async () =>
    await printSaberPoolATABalances(connection, tokenSwap, payer)

  if (!('quoteOnly' in option)) {
    executeInstruction(
      connection,
      instruction,
      printBal,
      printBal,
      [payer, userAuthority],
      payer
    )
  }
}

async function swap(tokenSwapID: string, tokenQty: string, option: Option) {
  checkOptions(option, 'network', 'payer', 'direction')
  const networkName = getNetworkName(option)
  const connection = getConnection(networkName)
  const payer = await createKeypairFromFile(option['payer'])

  const tokenAmount = parseInt(tokenQty)

  const tokenSwap_PK = new PublicKey(tokenSwapID)

  const tokenSwap = await StableSwap.load(connection, tokenSwap_PK)

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

  const exchangeInfo = await getExchange(
    connection,
    networkName,
    mintA,
    mintB,
    mintLP,
    tokenSwap
  )

  const ataA = await findAssociatedTokenAddress(
    payer.publicKey,
    mintA.publicKey
  )
  const ataB = await findAssociatedTokenAddress(
    payer.publicKey,
    mintB.publicKey
  )

  const fromTokenName: string = option['direction'] === 'AtB' ? 'A' : 'B'
  const toTokenName: string = option['direction'] === 'AtB' ? 'B' : 'A'

  const fromToken: saberToken.Token =
    option['direction'] === 'AtB'
      ? exchangeInfo.reserves[0].amount.token
      : exchangeInfo.reserves[1].amount.token

  const poolSource: PublicKey =
    option['direction'] === 'AtB'
      ? tokenSwap.state.tokenA.reserve
      : tokenSwap.state.tokenB.reserve

  const poolDestination: PublicKey =
    option['direction'] === 'AtB'
      ? tokenSwap.state.tokenB.reserve
      : tokenSwap.state.tokenA.reserve

  const adminDestination: PublicKey =
    option['direction'] === 'AtB'
      ? tokenSwap.state.tokenB.adminFeeAccount
      : tokenSwap.state.tokenA.adminFeeAccount

  const sourceMint: Token = option['direction'] === 'AtB' ? mintA : mintB
  const userSource: PublicKey = option['direction'] === 'AtB' ? ataA : ataB
  const userDestination: PublicKey = option['direction'] === 'AtB' ? ataB : ataA

  const userAuthority = new Keypair()

  await sourceMint.approve(
    userSource,
    userAuthority.publicKey,
    payer,
    [],
    tokenAmount
  )

  const swapQuote = saber.calculateEstimatedSwapOutputAmount(
    exchangeInfo,
    new TokenAmount(fromToken, JSBI.BigInt(tokenAmount))
  )

  const slippage = swapQuote.outputAmount.asNumber * SABER_SWAP_SLIPPAGE
  const minAmountOut = swapQuote.outputAmount.asNumber - slippage

  const swapInstruction: SwapInstruction = {
    config: tokenSwap.config,
    userAuthority: userAuthority.publicKey,
    userSource: userSource,
    userDestination: userDestination,
    poolSource: poolSource,
    poolDestination: poolDestination,
    adminDestination: adminDestination,
    amountIn: new u64(tokenAmount),
    minimumAmountOut: new u64(minAmountOut),
  }

  const instruction = await tokenSwap.swap(swapInstruction)

  console.log('--- SWAP QUOTE ---')
  console.log('GIVE:')
  console.log('Token ' + fromTokenName + ':\t' + tokenAmount)
  console.log('')
  console.log('RECEIVE:')
  console.log(
    'Token ' +
      toTokenName +
      ':\t' +
      swapQuote.outputAmountBeforeFees.toU64().toNumber() +
      ' (before fees)'
  )
  console.log(
    'Token ' +
      toTokenName +
      ':\t' +
      swapQuote.outputAmount.toU64().toNumber() +
      ' (after fees)'
  )
  console.log('--- / SWAP QUOTE ---')

  const printBal = async () =>
    await printSaberPoolATABalances(connection, tokenSwap, payer)

  if (!('quoteOnly' in option)) {
    executeInstruction(
      connection,
      instruction,
      printBal,
      printBal,
      [payer, userAuthority],
      payer
    )
  }
}

async function price(tokenSwapID: string, option: Option) {
  checkOptions(option, 'network', 'payer')
  const networkName = getNetworkName(option)
  const connection = getConnection(networkName)
  const payer = await createKeypairFromFile(option['payer'])

  const tokenSwap_PK = new PublicKey(tokenSwapID)

  const tokenSwap = await StableSwap.load(connection, tokenSwap_PK)

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

  const exchangeInfo = await getExchange(
    connection,
    networkName,
    mintA,
    mintB,
    mintLP,
    tokenSwap
  )

  const swapQuote = saber.calculateSwapPrice(exchangeInfo)

  console.log('--- SWAP PRICE ---')
  console.log(swapQuote.toFixed(4))
  console.log('--- / SWAP PRICE ---')
}

export function addSaberCommands(program: Command): void {
  const saber = program.command('saber')

  saber
    .command(
      'createPool <mintA> <tokenAInitialAmount> <mintB> <tokenBInitialAmount>'
    )
    .description('create Saber liquidity pool')
    .addOption(networkOption)
    .addOption(payerOption)
    .action(createPool)

  saber
    .command('showPool <tokenSwapId>')
    .description('show Saber token swap account')
    .addOption(networkOption)
    .addOption(payerOption)
    .action(showPool)

  saber
    .command('showPoolATAs <tokenSwapId>')
    .description('show LP ATA addresses and balances')
    .addOption(networkOption)
    .addOption(payerOption)
    .action(showPoolATAs)

  saber
    .command('deposit <tokenSwapId> <tokenAmountA> <tokenAmountB>')
    .description('deposit A & B tokens into LP')
    .addOption(networkOption)
    .addOption(payerOption)
    .addOption(quoteOnlyOption)
    .action(deposit)

  saber
    .command('withdraw <tokenSwapId> <tokenAmountLP>')
    .description('withdraw from LP')
    .addOption(networkOption)
    .addOption(payerOption)
    .addOption(quoteOnlyOption)
    .action(withdraw)

  saber
    .command('withdrawAll <tokenSwapId>')
    .description('withdraw all tokens from LP')
    .addOption(networkOption)
    .addOption(payerOption)
    .addOption(quoteOnlyOption)
    .action(withdrawAll)

  saber
    .command('swap <tokenSwapId> <tokenAmount>')
    .description('swap token')
    .addOption(networkOption)
    .addOption(payerOption)
    .addOption(swapDirectionOption)
    .addOption(quoteOnlyOption)
    .action(swap)

  saber
    .command('price <tokenSwapId>')
    .description('calculate virtual price')
    .addOption(networkOption)
    .addOption(payerOption)
    .action(price)
}
