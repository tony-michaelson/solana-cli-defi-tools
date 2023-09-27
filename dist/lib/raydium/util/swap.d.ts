import { Market, OpenOrders } from '@project-serum/serum/lib/market.js';
import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { RouterInfoItem } from '../types/api.js';
import { TokenAmount } from './safe-math.js';
import { LiquidityPoolInfo } from './pools.js';
export declare function getOutAmount(market: any, asks: any, bids: any, fromCoinMint: string, toCoinMint: string, amount: string, slippage: number): {
    side: "buy" | "sell";
    maxInAllow: number;
    amountOut: number;
    amountOutWithSlippage: number;
    worstPrice: number;
    priceImpact: number;
};
export declare function getSwapOutAmount(poolInfo: any, fromCoinMint: string, toCoinMint: string, amount: string, slippage: number): {
    amountIn: TokenAmount;
    amountOut: TokenAmount;
    amountOutWithSlippage: TokenAmount;
    newBaseBal: number;
    newQuoteBal: number;
    priceImpact: number;
};
export declare function getSwapInAmount(poolInfo: any, fromCoinMint: string, toCoinMint: string, amount: string, slippage: number): {
    amountIn: TokenAmount;
    amountOut: TokenAmount;
    amountOutWithSlippage: TokenAmount;
    priceImpact: number;
};
export declare function getSwapOutAmountStable(poolInfo: any, fromCoinMint: string, toCoinMint: string, amount: string, slippage: number): {
    amountIn: TokenAmount;
    amountOut: TokenAmount;
    amountOutWithSlippage: TokenAmount;
    priceImpact: number;
};
export declare function getSwapRouter(poolInfos: LiquidityPoolInfo[], fromCoinMint: string, toCoinMint: string): [LiquidityPoolInfo, LiquidityPoolInfo][];
export declare function forecastBuy(market: any, orderBook: any, pcIn: any, slippage: number): {
    side: "buy" | "sell";
    maxInAllow: number;
    amountOut: number;
    amountOutWithSlippage: number;
    worstPrice: number;
    priceImpact: number;
};
export declare function forecastSell(market: any, orderBook: any, coinIn: any, slippage: number): {
    side: "buy" | "sell";
    maxInAllow: number;
    amountOut: number;
    amountOutWithSlippage: number;
    worstPrice: number;
    priceImpact: number;
};
export declare function swap(connection: Connection, wallet: any, poolInfo: LiquidityPoolInfo, fromCoinMint: string, toCoinMint: string, fromTokenAccount: string, toTokenAccount: string, aIn: string, aOut: string, wsolAddress: string): Promise<string>;
export declare function preSwapRoute(connection: Connection, wallet: any, fromMint: string, fromTokenAccount: string, middleMint: string, middleTokenAccount: string, toMint: string, toTokenAccount: string, needWrapAmount: number): Promise<string>;
export declare function swapRoute(connection: Connection, wallet: any, poolInfoA: any, poolInfoB: any, routerInfo: RouterInfoItem, fromTokenAccount: string, middleTokenAccount: string, toTokenAccount: string, aIn: string, aOut: string, raydiumProgramId: PublicKey): Promise<string>;
export declare function swapRouteOld(connection: Connection, wallet: any, poolInfoA: any, poolInfoB: any, routerInfo: RouterInfoItem, fromTokenAccount: string, middleTokenAccount: string, toTokenAccount: string, aIn: string, aMiddle: string, aOut: string): Promise<string>;
export declare function place(connection: Connection, wallet: any, market: Market, fromCoinMint: string, toCoinMint: string, fromTokenAccount: string, toTokenAccount: string, side: 'buy' | 'sell' | null, maxInAllow: string, amountOut: string, worstPrice: number | null): Promise<string>;
export declare function swapInstruction(programId: PublicKey, ammId: PublicKey, ammAuthority: PublicKey, ammOpenOrders: PublicKey, ammTargetOrders: PublicKey, poolCoinTokenAccount: PublicKey, poolPcTokenAccount: PublicKey, serumProgramId: PublicKey, serumMarket: PublicKey, serumBids: PublicKey, serumAsks: PublicKey, serumEventQueue: PublicKey, serumCoinVaultAccount: PublicKey, serumPcVaultAccount: PublicKey, serumVaultSigner: PublicKey, userSourceTokenAccount: PublicKey, userDestTokenAccount: PublicKey, userOwner: PublicKey, amountIn: number, minAmountOut: number): TransactionInstruction;
export declare function routeSwapInInstruction(programId: PublicKey, ammProgramId: PublicKey, fromAmmId: PublicKey, toAmmId: PublicKey, ammAuthority: PublicKey, ammOpenOrders: PublicKey, _ammTargetOrders: PublicKey, poolCoinTokenAccount: PublicKey, poolPcTokenAccount: PublicKey, serumProgramId: PublicKey, serumMarket: PublicKey, serumBids: PublicKey, serumAsks: PublicKey, serumEventQueue: PublicKey, serumCoinVaultAccount: PublicKey, serumPcVaultAccount: PublicKey, serumVaultSigner: PublicKey, userSourceTokenAccount: PublicKey, userMiddleTokenAccount: PublicKey, userPdaAccount: PublicKey, userOwner: PublicKey, amountIn: number): TransactionInstruction;
export declare function routeSwapOutInstruction(programId: PublicKey, ammProgramId: PublicKey, fromAmmId: PublicKey, toAmmId: PublicKey, ammAuthority: PublicKey, ammOpenOrders: PublicKey, _ammTargetOrders: PublicKey, poolCoinTokenAccount: PublicKey, poolPcTokenAccount: PublicKey, serumProgramId: PublicKey, serumMarket: PublicKey, serumBids: PublicKey, serumAsks: PublicKey, serumEventQueue: PublicKey, serumCoinVaultAccount: PublicKey, serumPcVaultAccount: PublicKey, serumVaultSigner: PublicKey, userMiddleTokenAccount: PublicKey, userDestTokenAccount: PublicKey, userPdaAccount: PublicKey, userOwner: PublicKey, amountOut: number): TransactionInstruction;
export declare function transfer(source: PublicKey, destination: PublicKey, owner: PublicKey, amount: number): TransactionInstruction;
export declare function memoInstruction(memo: string): TransactionInstruction;
export declare function checkUnsettledInfo(connection: Connection, wallet: any, market: Market): Promise<{
    baseSymbol: string;
    quoteSymbol: string;
    baseTotalAmount: number;
    quoteTotalAmount: number;
    baseUnsettledAmount: number;
    quoteUnsettledAmount: number;
    openOrders: OpenOrders;
}>;
export declare function settleFund(connection: Connection, market: Market, openOrders: OpenOrders, wallet: any, baseMint: string, quoteMint: string, baseWallet: string, quoteWallet: string): Promise<string>;
//# sourceMappingURL=swap.d.ts.map