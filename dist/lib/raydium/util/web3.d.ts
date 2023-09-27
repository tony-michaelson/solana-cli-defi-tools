/// <reference types="node" />
import { Account, AccountInfo, Commitment, Connection, PublicKey, Transaction } from '@solana/web3.js';
export declare const web3Config: {
    strategy: string;
    rpcs: {
        url: string;
        weight: number;
    }[];
};
export declare const commitment: Commitment;
export declare function findProgramAddress(seeds: Array<Buffer | Uint8Array>, programId: PublicKey): Promise<{
    publicKey: PublicKey;
    nonce: number;
}>;
export declare function createAmmAuthority(programId: PublicKey): Promise<{
    publicKey: PublicKey;
    nonce: number;
}>;
export declare function createAssociatedId(infoId: PublicKey, marketAddress: PublicKey, bufferKey: string): Promise<PublicKey>;
export declare function findAssociatedTokenAddress(walletAddress: PublicKey, tokenMintAddress: PublicKey): Promise<PublicKey>;
export declare function findAssociatedStakeInfoAddress(poolId: PublicKey, walletAddress: PublicKey, programId: PublicKey): Promise<PublicKey>;
export declare function createTokenAccountIfNotExist(connection: Connection, account: string | undefined | null, owner: PublicKey, mintAddress: string, lamports: number | null, transaction: Transaction, signer: Array<Account>): Promise<any>;
export declare function createAssociatedTokenAccountIfNotExist(account: string | undefined | null, owner: PublicKey, mintAddress: string, transaction: Transaction, atas?: string[]): Promise<PublicKey>;
export declare function createAtaSolIfNotExistAndWrap(connection: Connection, account: string | undefined | null, owner: PublicKey, transaction: Transaction, signers: Array<Account>, amount: number): Promise<void>;
export declare function createProgramAccountIfNotExist(connection: Connection, account: string | undefined | null, owner: PublicKey, programId: PublicKey, lamports: number | null, layout: any, transaction: Transaction, signer: Array<Account>): Promise<any>;
export declare function createAssociatedTokenAccount(tokenMintAddress: PublicKey, owner: PublicKey, transaction: Transaction): Promise<PublicKey>;
export declare function getFilteredProgramAccounts(connection: Connection, programId: PublicKey, filters: any): Promise<{
    publicKey: PublicKey;
    accountInfo: AccountInfo<Buffer>;
}[]>;
export declare function getMultipleAccounts(connection: Connection, publicKeys: PublicKey[], commitment?: Commitment): Promise<Array<null | {
    publicKey: PublicKey;
    account: AccountInfo<Buffer>;
}>>;
export declare function sendTransaction(connection: Connection, wallet: any, transaction: Transaction, signers?: Array<Account>): Promise<string>;
export declare function mergeTransactions(transactions: (Transaction | undefined)[]): Transaction;
export declare function getMintDecimals(connection: Connection, mint: PublicKey): Promise<number>;
export declare function getFilteredTokenAccountsByOwner(connection: Connection, programId: PublicKey, mint: PublicKey): Promise<{
    context: {};
    value: [];
}>;
//# sourceMappingURL=web3.d.ts.map