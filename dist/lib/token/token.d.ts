import { AccountMeta, ConfirmOptions, Connection, Keypair, PublicKey, Signer, TransactionInstruction, TransactionSignature } from '@solana/web3.js';
export declare function addSigners(keys: AccountMeta[], ownerOrAuthority: PublicKey, multiSigners: Signer[]): AccountMeta[];
export declare function getSigners(signerOrMultisig: Signer | PublicKey, multiSigners: Signer[]): [PublicKey, Signer[]];
export declare function findAssociatedTokenAddress(walletAddress: PublicKey, tokenMintAddress: PublicKey): Promise<PublicKey>;
export declare function createTokenMint(connection: Connection, payer: Keypair, mintKeypair: Keypair, authority: PublicKey, decimals: number): Promise<PublicKey>;
/** TODO: docs */
export interface MintToInstructionData {
    instruction: number;
    amount: bigint;
}
/** TODO: docs */
export declare const mintToInstructionData: import("@solana/buffer-layout").Structure<MintToInstructionData>;
export declare function createMintToInstruction(mint: PublicKey, destination: PublicKey, authority: PublicKey, amount: number | bigint, multiSigners?: Signer[], programId?: PublicKey): TransactionInstruction;
export declare function mintTo(connection: Connection, payer: Signer, mint: PublicKey, destination: PublicKey, authority: Signer | PublicKey, amount: number | bigint, multiSigners?: Signer[], confirmOptions?: ConfirmOptions, programId?: PublicKey): Promise<TransactionSignature>;
//# sourceMappingURL=token.d.ts.map