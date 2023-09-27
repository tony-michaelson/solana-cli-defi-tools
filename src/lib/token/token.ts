import {
  AccountMeta,
  ConfirmOptions,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Signer,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionSignature,
} from '@solana/web3.js'
import { SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID } from '../constants.js'
import { TOKEN_PROGRAM_ID } from '../raydium/util/ids.js'
import * as spl from '@solana/spl-token'
import { struct, u8 } from '@solana/buffer-layout'
import { u64 } from '@solana/buffer-layout-utils'

export function addSigners(
  keys: AccountMeta[],
  ownerOrAuthority: PublicKey,
  multiSigners: Signer[]
): AccountMeta[] {
  if (multiSigners.length) {
    keys.push({ pubkey: ownerOrAuthority, isSigner: false, isWritable: false })
    for (const signer of multiSigners) {
      keys.push({ pubkey: signer.publicKey, isSigner: true, isWritable: false })
    }
  } else {
    keys.push({ pubkey: ownerOrAuthority, isSigner: true, isWritable: false })
  }
  return keys
}

export function getSigners(
  signerOrMultisig: Signer | PublicKey,
  multiSigners: Signer[]
): [PublicKey, Signer[]] {
  return signerOrMultisig instanceof PublicKey
    ? [signerOrMultisig, multiSigners]
    : [signerOrMultisig.publicKey, [signerOrMultisig]]
}

export async function findAssociatedTokenAddress(
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey
): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [
        walletAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
      ],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    )
  )[0]
}

export async function createTokenMint(
  connection: Connection,
  payer: Keypair,
  mintKeypair: Keypair,
  authority: PublicKey,
  decimals: number
): Promise<PublicKey> {
  const transaction = new Transaction().add(
    // create stable coin mint
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(
        spl.MintLayout.span
      ),
      space: spl.MintLayout.span,
      programId: TOKEN_PROGRAM_ID,
    }),
    // initialize stable coin mint
    spl.Token.createInitMintInstruction(
      TOKEN_PROGRAM_ID,
      mintKeypair.publicKey,
      decimals,
      authority,
      null
    )
  )

  const signers: Signer[] = [payer, mintKeypair]

  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    signers,
    { commitment: 'finalized' }
  )
  console.log('txid:', signature)

  return mintKeypair.publicKey
}

/** TODO: docs */
export interface MintToInstructionData {
  instruction: number
  amount: bigint
}

/** TODO: docs */
export const mintToInstructionData = struct<MintToInstructionData>([
  u8('instruction'),
  u64('amount'),
])

export function createMintToInstruction(
  mint: PublicKey,
  destination: PublicKey,
  authority: PublicKey,
  amount: number | bigint,
  multiSigners: Signer[] = [],
  programId = TOKEN_PROGRAM_ID
): TransactionInstruction {
  const keys = addSigners(
    [
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: destination, isSigner: false, isWritable: true },
    ],
    authority,
    multiSigners
  )

  const data = Buffer.alloc(mintToInstructionData.span)
  mintToInstructionData.encode(
    {
      instruction: 7,
      amount: BigInt(amount),
    },
    data
  )

  return new TransactionInstruction({ keys, programId, data })
}

export async function mintTo(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  destination: PublicKey,
  authority: Signer | PublicKey,
  amount: number | bigint,
  multiSigners: Signer[] = [],
  confirmOptions?: ConfirmOptions,
  programId = TOKEN_PROGRAM_ID
): Promise<TransactionSignature> {
  const [authorityPublicKey, signers] = getSigners(authority, multiSigners)

  const transaction = new Transaction().add(
    createMintToInstruction(
      mint,
      destination,
      authorityPublicKey,
      amount,
      multiSigners,
      programId
    )
  )

  return await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer, ...signers],
    confirmOptions
  )
}
