import { TokenInfo } from './tokens.js';
export interface LiquidityPoolInfo {
    name: string;
    coin: TokenInfo;
    pc: TokenInfo;
    lp: TokenInfo;
    version: number;
    programId: string;
    ammId: string;
    ammAuthority: string;
    ammOpenOrders: string;
    ammTargetOrders: string;
    ammQuantities: string;
    poolCoinTokenAccount: string;
    poolPcTokenAccount: string;
    poolWithdrawQueue: string;
    poolTempLpTokenAccount: string;
    serumProgramId: string;
    serumMarket: string;
    serumBids?: string;
    serumAsks?: string;
    serumEventQueue?: string;
    serumCoinVaultAccount: string;
    serumPcVaultAccount: string;
    serumVaultSigner: string;
    official: boolean;
    status?: number;
    currentK?: number;
    fees?: {
        swapFeeNumerator: number;
        swapFeeDenominator: number;
    };
}
/**
 * Get pool use two mint addresses

 * @param {string} coinMintAddress
 * @param {string} pcMintAddress

 * @returns {LiquidityPoolInfo | undefined} poolInfo
 */
export declare function getPoolByTokenMintAddresses(coinMintAddress: string, pcMintAddress: string): LiquidityPoolInfo | undefined;
export declare function getPoolListByTokenMintAddresses(coinMintAddress: string, pcMintAddress: string, ammIdOrMarket: string | undefined): LiquidityPoolInfo[];
export declare function getLpMintByTokenMintAddresses(coinMintAddress: string, pcMintAddress: string, version?: number[]): string | null;
export declare function getLpListByTokenMintAddresses(coinMintAddress: string, pcMintAddress: string, ammIdOrMarket: string | undefined, version?: number[]): LiquidityPoolInfo[];
export declare function getPoolByLpMintAddress(lpMintAddress: string): LiquidityPoolInfo | undefined;
export declare function getAddressForWhat(address: string): {
    key: string;
    lpMintAddress: string;
    version: number;
} | {
    key?: undefined;
    lpMintAddress?: undefined;
    version?: undefined;
};
export declare function isOfficalMarket(marketAddress: string): boolean;
export declare const LIQUIDITY_POOLS: LiquidityPoolInfo[];
//# sourceMappingURL=pools.d.ts.map