import { Keypair, Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { Market as MarketSerum } from '@project-serum/serum';
import { u8 } from 'buffer-layout';
export declare function createAmm(conn: any, wallet: Keypair, market: any, serumProgramId: PublicKey, userInputBaseValue: number, userInputQuoteValue: number, startTime: number, raydiumProgramId: PublicKey): Promise<string>;
export declare function initialize(ammProgramId: PublicKey, ammId: PublicKey, ammAuthority: PublicKey, ammOpenOrders: PublicKey, lpMintAddress: PublicKey, coinMint: PublicKey, pcMint: PublicKey, poolCoinTokenAccount: PublicKey, poolPcTokenAccount: PublicKey, poolWithdrawQueue: PublicKey, ammTargetOrders: PublicKey, poolLpTokenAccount: PublicKey, poolTempLpTokenAccount: PublicKey, serumProgramId: PublicKey, serumMarket: PublicKey, owner: PublicKey, nonce: number, startTime: number): TransactionInstruction;
export declare function preInitialize(programId: PublicKey, ammTargetOrders: PublicKey, poolWithdrawQueue: PublicKey, ammAuthority: PublicKey, lpMintAddress: PublicKey, coinMintAddress: PublicKey, pcMintAddress: PublicKey, poolCoinTokenAccount: PublicKey, poolPcTokenAccount: PublicKey, poolTempLpTokenAccount: PublicKey, market: PublicKey, owner: PublicKey, nonce: u8): TransactionInstruction;
export declare class Market extends MarketSerum {
    baseVault: PublicKey | null;
    quoteVault: PublicKey | null;
    requestQueue: PublicKey | null;
    eventQueue: PublicKey | null;
    bids: PublicKey | null;
    asks: PublicKey | null;
    baseLotSize: number;
    quoteLotSize: number;
    private _decoded;
    quoteMint: PublicKey | null;
    baseMint: PublicKey | null;
    static load(connection: Connection, address: PublicKey, options: any, programId: PublicKey): Promise<Market>;
}
//# sourceMappingURL=createAmm.d.ts.map