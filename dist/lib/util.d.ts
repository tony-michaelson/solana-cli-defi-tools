/// <reference types="node" />
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { NETWORK_NAME } from './constants.js';
import { Option, SwapAmount } from './types.js';
import { Fee } from './fee.js';
import Decimal from 'decimal.js';
export declare const ZERO: Decimal;
export declare const ONE: Decimal;
export interface RaydiumQuoteParams {
    input: 'base' | 'quote';
    baseAmount: Decimal;
    quoteAmount: Decimal;
    tradeFee: Fee;
}
export declare type RaydiumHonePriceParams = RaydiumQuoteParams & {
    walk: 'up' | 'down';
    desiredPrice: Decimal;
};
export interface RaydiumQuote {
    newPrice: Decimal;
    fees: Decimal;
    newQuoteAmount: Decimal;
    newBaseAmount: Decimal;
}
export declare function raydiumSwapQuote(swapAmount: Decimal, params: RaydiumQuoteParams): RaydiumQuote;
export declare function calcSwapAmountForDesiredPrice(type: 'raydium' | 'orca', baseAmount: Decimal, baseDecimals: number, quoteAmount: Decimal, quoteDecimals: number, desiredPrice: Decimal, tradeFee: Fee, ownerFee?: Fee): SwapAmount | null;
export declare function logPubKey(name: string, key: PublicKey): void;
export declare function logBumpSeed(name: string, value: number): void;
export declare function createKeypairFromFile(filePath: string): Promise<Keypair>;
export declare function getChainId(network: NETWORK_NAME): number;
export declare function getRPC(network: NETWORK_NAME, url?: string): string;
export declare function getConnection(network: NETWORK_NAME): Connection;
export declare function getNetworkName(opts: Option): NETWORK_NAME;
export declare function checkOptions(opts: Option, ...options: any[]): void;
export declare function getPubkeyForEnv(keyString: string | undefined): PublicKey;
export declare function printAccountBalance(account: PublicKey, connection: Connection): Promise<void>;
/**
 * Loads the account info of an account owned by a program.
 * @param connection
 * @param address
 * @param programId
 * @returns
 */
export declare const loadProgramAccount: (connection: Connection, address: PublicKey, programId: PublicKey) => Promise<Buffer>;
export declare function watchTransaction(connection: Connection, signature: string): Promise<boolean>;
export declare function handleTransactionOutcome(signature: string, success: boolean): void;
export declare function logObject(obj: Record<string, unknown>, prefix?: string): void;
//# sourceMappingURL=util.d.ts.map