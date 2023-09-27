import { PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction, TransactionInstruction, } from '@solana/web3.js';
import { SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID } from '../constants.js';
import { TOKEN_PROGRAM_ID } from '../raydium/util/ids.js';
import * as spl from '@solana/spl-token';
import { struct, u8 } from '@solana/buffer-layout';
import { u64 } from '@solana/buffer-layout-utils';
export function addSigners(keys, ownerOrAuthority, multiSigners) {
    if (multiSigners.length) {
        keys.push({ pubkey: ownerOrAuthority, isSigner: false, isWritable: false });
        for (const signer of multiSigners) {
            keys.push({ pubkey: signer.publicKey, isSigner: true, isWritable: false });
        }
    }
    else {
        keys.push({ pubkey: ownerOrAuthority, isSigner: true, isWritable: false });
    }
    return keys;
}
export function getSigners(signerOrMultisig, multiSigners) {
    return signerOrMultisig instanceof PublicKey
        ? [signerOrMultisig, multiSigners]
        : [signerOrMultisig.publicKey, [signerOrMultisig]];
}
export async function findAssociatedTokenAddress(walletAddress, tokenMintAddress) {
    return (await PublicKey.findProgramAddress([
        walletAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
    ], SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID))[0];
}
export async function createTokenMint(connection, payer, mintKeypair, authority, decimals) {
    const transaction = new Transaction().add(
    // create stable coin mint
    SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        lamports: await connection.getMinimumBalanceForRentExemption(spl.MintLayout.span),
        space: spl.MintLayout.span,
        programId: TOKEN_PROGRAM_ID,
    }), 
    // initialize stable coin mint
    spl.Token.createInitMintInstruction(TOKEN_PROGRAM_ID, mintKeypair.publicKey, decimals, authority, null));
    const signers = [payer, mintKeypair];
    const signature = await sendAndConfirmTransaction(connection, transaction, signers, { commitment: 'finalized' });
    console.log('txid:', signature);
    return mintKeypair.publicKey;
}
/** TODO: docs */
export const mintToInstructionData = struct([
    u8('instruction'),
    u64('amount'),
]);
export function createMintToInstruction(mint, destination, authority, amount, multiSigners = [], programId = TOKEN_PROGRAM_ID) {
    const keys = addSigners([
        { pubkey: mint, isSigner: false, isWritable: true },
        { pubkey: destination, isSigner: false, isWritable: true },
    ], authority, multiSigners);
    const data = Buffer.alloc(mintToInstructionData.span);
    mintToInstructionData.encode({
        instruction: 7,
        amount: BigInt(amount),
    }, data);
    return new TransactionInstruction({ keys, programId, data });
}
export async function mintTo(connection, payer, mint, destination, authority, amount, multiSigners = [], confirmOptions, programId = TOKEN_PROGRAM_ID) {
    const [authorityPublicKey, signers] = getSigners(authority, multiSigners);
    const transaction = new Transaction().add(createMintToInstruction(mint, destination, authorityPublicKey, amount, multiSigners, programId));
    return await sendAndConfirmTransaction(connection, transaction, [payer, ...signers], confirmOptions);
}
