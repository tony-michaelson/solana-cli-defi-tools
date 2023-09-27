// node --loader ts-node/esm ./liquidity/Raydium/createAmm.ts
// set type: module in package.json

import {
  Keypair,
  Transaction,
  Connection,
  PublicKey,
  Account,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
} from '@solana/web3.js'
import { Market as MarketSerum } from '@project-serum/serum'
import { Token } from '@solana/spl-token'
import { throwIfNull } from './util/errors.js'
// @ts-ignore
import { struct, u8, nu64 } from 'buffer-layout'
import {
  createAmmAuthority,
  createAssociatedId,
  getMintDecimals,
  getMultipleAccounts,
  commitment,
  sendTransaction,
  getFilteredTokenAccountsByOwner,
  findAssociatedTokenAddress,
} from './util/web3.js'
import { ACCOUNT_LAYOUT, getBigNumber, MINT_LAYOUT } from './util/layouts.js'
import {
  AMM_ASSOCIATED_SEED,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  COIN_VAULT_ASSOCIATED_SEED,
  LP_MINT_ASSOCIATED_SEED,
  OPEN_ORDER_ASSOCIATED_SEED,
  PC_VAULT_ASSOCIATED_SEED,
  SYSTEM_PROGRAM_ID,
  TARGET_ASSOCIATED_SEED,
  TEMP_LP_TOKEN_ASSOCIATED_SEED,
  TOKEN_PROGRAM_ID,
  WITHDRAW_ASSOCIATED_SEED,
} from './util/ids.js'
import BigNumber from 'bignumber.js'
import { TOKENS } from './util/tokens.js'
import { transfer } from './util/swap.js'
import {
  closeAccount,
  initializeAccount,
} from '@project-serum/serum/lib/token-instructions.js'
import { logPubKey, logBumpSeed } from '../util.js'

export async function createAmm(
  conn: any,
  wallet: Keypair,
  market: any,
  serumProgramId: PublicKey,
  userInputBaseValue: number,
  userInputQuoteValue: number,
  startTime: number,
  raydiumProgramId: PublicKey
) {
  const transaction = new Transaction()
  const signers: any = [wallet]
  const owner = wallet.publicKey

  const { publicKey, nonce } = await createAmmAuthority(raydiumProgramId)
  const ammAuthority = publicKey
  logPubKey('ammAuthority', ammAuthority)
  logBumpSeed('nonce', nonce)

  const ammId: PublicKey = await createAssociatedId(
    raydiumProgramId,
    market.address,
    AMM_ASSOCIATED_SEED
  )
  logPubKey('ammId', ammId)

  const poolCoinTokenAccount: PublicKey = await createAssociatedId(
    raydiumProgramId,
    market.address,
    COIN_VAULT_ASSOCIATED_SEED
  )
  logPubKey('poolCoinTokenAccount', poolCoinTokenAccount)

  const poolPcTokenAccount: PublicKey = await createAssociatedId(
    raydiumProgramId,
    market.address,
    PC_VAULT_ASSOCIATED_SEED
  )
  logPubKey('poolPcTokenAccount', poolPcTokenAccount)

  const lpMintAddress: PublicKey = await createAssociatedId(
    raydiumProgramId,
    market.address,
    LP_MINT_ASSOCIATED_SEED
  )
  logPubKey('lpMintAddress', lpMintAddress)

  const poolTempLpTokenAccount: PublicKey = await createAssociatedId(
    raydiumProgramId,
    market.address,
    TEMP_LP_TOKEN_ASSOCIATED_SEED
  )
  logPubKey('poolTempLpTokenAccount', poolTempLpTokenAccount)

  const ammTargetOrders: PublicKey = await createAssociatedId(
    raydiumProgramId,
    market.address,
    TARGET_ASSOCIATED_SEED
  )
  logPubKey('ammTargetOrders', ammTargetOrders)

  const poolWithdrawQueue: PublicKey = await createAssociatedId(
    raydiumProgramId,
    market.address,
    WITHDRAW_ASSOCIATED_SEED
  )
  logPubKey('poolWithdrawQueue', poolWithdrawQueue)

  const ammOpenOrders: PublicKey = await createAssociatedId(
    raydiumProgramId,
    market.address,
    OPEN_ORDER_ASSOCIATED_SEED
  )
  logPubKey('ammOpenOrders', ammOpenOrders)

  let accountSuccessFlag = false
  let accountAllSuccessFlag = false

  const multipleInfo = await getMultipleAccounts(
    conn,
    [lpMintAddress],
    commitment
  )
  if (multipleInfo.length > 0 && multipleInfo[0] !== null) {
    const tempLpMint = MINT_LAYOUT.decode(multipleInfo[0]?.account.data)
    if (getBigNumber(tempLpMint.supply) === 0) {
      accountSuccessFlag = true
    } else {
      accountAllSuccessFlag = true
    }
  } else {
    accountSuccessFlag = false
  }

  transaction.add(
    preInitialize(
      raydiumProgramId,
      ammTargetOrders,
      poolWithdrawQueue,
      ammAuthority,
      lpMintAddress,
      market.baseMintAddress,
      market.quoteMintAddress,
      poolCoinTokenAccount,
      poolPcTokenAccount,
      poolTempLpTokenAccount,
      market.address,
      owner,
      nonce
    )
  )

  if (!accountSuccessFlag) {
    const txid = await sendTransaction(conn, wallet, transaction, signers)
    console.log('txid', txid)
    let txidSuccessFlag = 0
    await conn.onSignature(
      txid,
      function (_signatureResult: any, _context: any) {
        if (_signatureResult.err) {
          txidSuccessFlag = -1
        } else {
          txidSuccessFlag = 1
        }
      }
    )

    const timeAwait = new Date().getTime()
    let outOfWhile = false
    while (!outOfWhile) {
      if (txidSuccessFlag !== 0) {
        outOfWhile = true
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
    if (txidSuccessFlag !== 1) {
      throw new Error('create tx1 error')
    }
  }

  const ammKeys = {
    ammId,
    ammAuthority,
    poolCoinTokenAccount,
    poolPcTokenAccount,
    lpMintAddress,
    ammOpenOrders,
    ammTargetOrders,
    poolWithdrawQueue,
    poolTempLpTokenAccount,
    nonce,
  }

  if (!accountAllSuccessFlag) {
    await initAmm(
      conn,
      wallet,
      market,
      raydiumProgramId,
      serumProgramId,
      // ammId,
      ammKeys,
      userInputBaseValue,
      userInputQuoteValue,
      poolCoinTokenAccount,
      poolPcTokenAccount,
      lpMintAddress,
      startTime
    )
  }

  return ammId.toBase58()
}

async function initAmm(
  conn: any,
  wallet: Keypair,
  market: any,
  ammProgramId: PublicKey,
  dexProgramId: PublicKey,
  // ammKeypair: PublicKey,
  ammKeys: any,
  userInputBaseValue: number,
  userInputQuoteValue: number,
  poolCoinTokenAccount: PublicKey,
  poolPcTokenAccount: PublicKey,
  lpMintAddress: PublicKey,
  startTime: number
) {
  const baseMintDecimals = new BigNumber(
    await getMintDecimals(conn, market.baseMintAddress as PublicKey)
  )
  const quoteMintDecimals = new BigNumber(
    await getMintDecimals(conn, market.quoteMintAddress as PublicKey)
  )

  const coinVol = new BigNumber(10)
    .exponentiatedBy(baseMintDecimals)
    .multipliedBy(userInputBaseValue)
  const pcVol = new BigNumber(10)
    .exponentiatedBy(quoteMintDecimals)
    .multipliedBy(userInputQuoteValue)

  const transaction = new Transaction()
  const signers: any = [wallet]
  const owner = wallet.publicKey
  const baseTokenAccount = await getFilteredTokenAccountsByOwner(
    conn,
    owner,
    market.baseMintAddress
  )
  const quoteTokenAccount = await getFilteredTokenAccountsByOwner(
    conn,
    owner,
    market.quoteMintAddress
  )
  const baseTokenList: any = baseTokenAccount.value.map((item: any) => {
    if (
      item.account.data.parsed.info.tokenAmount.amount >= getBigNumber(coinVol)
    ) {
      return item.pubkey
    }
    return null
  })
  const quoteTokenList: any = quoteTokenAccount.value.map((item: any) => {
    if (
      item.account.data.parsed.info.tokenAmount.amount >= getBigNumber(pcVol)
    ) {
      return item.pubkey
    }
    return null
  })
  let baseToken: string | null = null
  for (const item of baseTokenList) {
    if (item !== null) {
      baseToken = item
    }
  }
  let quoteToken: string | null = null
  for (const item of quoteTokenList) {
    if (item !== null) {
      quoteToken = item
    }
  }

  if (
    (baseToken === null &&
      market.baseMintAddress.toString() !== TOKENS.WSOL.mintAddress) ||
    (quoteToken === null &&
      market.quoteMintAddress.toString() !== TOKENS.WSOL.mintAddress)
  ) {
    throw new Error('no money')
  }

  const destLpToken = await findAssociatedTokenAddress(owner, lpMintAddress)
  const destLpTokenInfo = await conn.getAccountInfo(destLpToken)
  if (!destLpTokenInfo) {
    transaction.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        lpMintAddress,
        destLpToken,
        owner,
        owner
      )
    )
  }

  if (market.baseMintAddress.toString() === TOKENS.WSOL.mintAddress) {
    const newAccount = new Account()
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: owner,
        newAccountPubkey: newAccount.publicKey,
        lamports: parseInt(coinVol.toFixed()) + 1e7,
        space: ACCOUNT_LAYOUT.span,
        programId: TOKEN_PROGRAM_ID,
      })
    )
    transaction.add(
      initializeAccount({
        account: newAccount.publicKey,
        mint: new PublicKey(TOKENS.WSOL.mintAddress),
        owner,
      })
    )

    transaction.add(
      transfer(
        newAccount.publicKey,
        poolCoinTokenAccount,
        owner,
        parseInt(coinVol.toFixed())
      )
    )

    transaction.add(
      closeAccount({
        source: newAccount.publicKey,
        destination: owner,
        owner,
      })
    )

    signers.push(newAccount)
  } else {
    if (baseToken) {
      console.log(
        'Transfer:',
        parseInt(pcVol.toFixed()).toString(),
        'To: poolCoinTokenAccount'
      )
      transaction.add(
        transfer(
          new PublicKey(baseToken),
          poolCoinTokenAccount,
          owner,
          parseInt(coinVol.toFixed())
        )
      )
    }
  }
  if (market.quoteMintAddress.toString() === TOKENS.WSOL.mintAddress) {
    const newAccount = new Account()
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: owner,
        newAccountPubkey: newAccount.publicKey,
        lamports: parseInt(pcVol.toFixed()) + 1e7,
        space: ACCOUNT_LAYOUT.span,
        programId: TOKEN_PROGRAM_ID,
      })
    )
    transaction.add(
      initializeAccount({
        account: newAccount.publicKey,
        mint: new PublicKey(TOKENS.WSOL.mintAddress),
        owner,
      })
    )

    transaction.add(
      transfer(
        newAccount.publicKey,
        poolPcTokenAccount,
        owner,
        parseInt(pcVol.toFixed())
      )
    )
    transaction.add(
      closeAccount({
        source: newAccount.publicKey,
        destination: owner,
        owner,
      })
    )
    signers.push(newAccount)
  } else {
    if (quoteToken) {
      console.log(
        'Transfer:',
        parseInt(pcVol.toFixed()).toString(),
        'To: poolPcTokenAccount'
      )
      transaction.add(
        transfer(
          new PublicKey(quoteToken),
          poolPcTokenAccount,
          owner,
          parseInt(pcVol.toFixed())
        )
      )
    }
  }

  transaction.add(
    initialize(
      ammProgramId,
      ammKeys.ammId,
      ammKeys.ammAuthority,
      ammKeys.ammOpenOrders,
      ammKeys.lpMintAddress,
      market.baseMintAddress,
      market.quoteMintAddress,
      ammKeys.poolCoinTokenAccount,
      ammKeys.poolPcTokenAccount,
      ammKeys.poolWithdrawQueue,
      ammKeys.ammTargetOrders,
      destLpToken,
      ammKeys.poolTempLpTokenAccount,
      dexProgramId,
      market.address,

      owner,

      ammKeys.nonce,
      startTime
    )
  )

  const txid = await sendTransaction(conn, wallet, transaction, signers)
  console.log('txid', txid)

  let txidSuccessFlag = 0
  await conn.onSignature(txid, function (_signatureResult: any, _context: any) {
    if (_signatureResult.err) {
      txidSuccessFlag = -1
    } else {
      txidSuccessFlag = 1
    }
  })

  const timeAwait = new Date().getTime()
  let outOfWhile = false
  while (!outOfWhile) {
    if (txidSuccessFlag !== 0) {
      outOfWhile = true
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  if (txidSuccessFlag !== 1) {
    throw new Error('Transaction failed')
  }
}

export function initialize(
  ammProgramId: PublicKey,
  ammId: PublicKey,
  ammAuthority: PublicKey,
  ammOpenOrders: PublicKey,
  lpMintAddress: PublicKey,
  coinMint: PublicKey,
  pcMint: PublicKey,
  poolCoinTokenAccount: PublicKey,
  poolPcTokenAccount: PublicKey,
  poolWithdrawQueue: PublicKey,
  ammTargetOrders: PublicKey,
  poolLpTokenAccount: PublicKey,
  poolTempLpTokenAccount: PublicKey,
  serumProgramId: PublicKey,
  serumMarket: PublicKey,
  owner: PublicKey,
  nonce: number,
  startTime: number
): TransactionInstruction {
  const dataLayout = struct([u8('instruction'), u8('nonce'), nu64('startTime')])

  const keys = [
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: ammId, isSigner: false, isWritable: true },
    { pubkey: ammAuthority, isSigner: false, isWritable: false },
    { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
    { pubkey: lpMintAddress, isSigner: false, isWritable: true },
    { pubkey: coinMint, isSigner: false, isWritable: true },
    { pubkey: pcMint, isSigner: false, isWritable: true },
    { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolWithdrawQueue, isSigner: false, isWritable: true },
    { pubkey: ammTargetOrders, isSigner: false, isWritable: true },
    { pubkey: poolLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolTempLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: serumProgramId, isSigner: false, isWritable: false },
    { pubkey: serumMarket, isSigner: false, isWritable: true },
    { pubkey: owner, isSigner: true, isWritable: false },
  ]
  const data = Buffer.alloc(dataLayout.span)

  dataLayout.encode(
    {
      instruction: 0,
      nonce,
      startTime,
    },
    data
  )

  return new TransactionInstruction({
    keys,
    programId: ammProgramId,
    data,
  })
}

export function preInitialize(
  programId: PublicKey,
  ammTargetOrders: PublicKey,
  poolWithdrawQueue: PublicKey,
  ammAuthority: PublicKey,
  lpMintAddress: PublicKey,
  coinMintAddress: PublicKey,
  pcMintAddress: PublicKey,
  poolCoinTokenAccount: PublicKey,
  poolPcTokenAccount: PublicKey,
  poolTempLpTokenAccount: PublicKey,
  market: PublicKey,
  owner: PublicKey,
  nonce: u8
): TransactionInstruction {
  const dataLayout = struct([u8('instruction'), u8('nonce')])

  const keys = [
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },

    { pubkey: ammTargetOrders, isSigner: false, isWritable: true },
    { pubkey: poolWithdrawQueue, isSigner: false, isWritable: true },
    { pubkey: ammAuthority, isSigner: false, isWritable: false },
    { pubkey: lpMintAddress, isSigner: false, isWritable: true },
    { pubkey: coinMintAddress, isSigner: false, isWritable: false },
    { pubkey: pcMintAddress, isSigner: false, isWritable: false },
    { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolTempLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: market, isSigner: false, isWritable: false },
    { pubkey: owner, isSigner: true, isWritable: false },
  ]
  const data = Buffer.alloc(dataLayout.span)
  dataLayout.encode(
    {
      instruction: 10,
      nonce,
    },
    data
  )
  return new TransactionInstruction({
    keys,
    programId,
    data,
  })
}

// @ts-ignore
export class Market extends MarketSerum {
  public baseVault: PublicKey | null = null
  public quoteVault: PublicKey | null = null
  public requestQueue: PublicKey | null = null
  public eventQueue: PublicKey | null = null
  public bids: PublicKey | null = null
  public asks: PublicKey | null = null
  public baseLotSize = 0
  public quoteLotSize = 0
  private _decoded: any
  public quoteMint: PublicKey | null = null
  public baseMint: PublicKey | null = null

  static async load(
    connection: Connection,
    address: PublicKey,
    options: any = {},
    programId: PublicKey
  ) {
    const { owner, data } = throwIfNull(
      await connection.getAccountInfo(address),
      'Market not found'
    )
    if (!owner.equals(programId)) {
      throw new Error('Address not owned by program: ' + owner.toBase58())
    }
    const decoded = this.getLayout(programId).decode(data)
    if (
      !decoded.accountFlags.initialized ||
      !decoded.accountFlags.market ||
      !decoded.ownAddress.equals(address)
    ) {
      throw new Error('Invalid market')
    }
    const [baseMintDecimals, quoteMintDecimals] = await Promise.all([
      getMintDecimals(connection, decoded.baseMint),
      getMintDecimals(connection, decoded.quoteMint),
    ])

    const market = new Market(
      decoded,
      baseMintDecimals,
      quoteMintDecimals,
      options,
      programId
    )
    market._decoded = decoded
    market.baseLotSize = decoded.baseLotSize
    market.quoteLotSize = decoded.quoteLotSize
    market.baseVault = decoded.baseVault
    market.quoteVault = decoded.quoteVault
    market.requestQueue = decoded.requestQueue
    market.eventQueue = decoded.eventQueue
    market.bids = decoded.bids
    market.asks = decoded.asks
    market.quoteMint = decoded.quoteMint
    market.baseMint = decoded.baseMint
    return market
  }
}
