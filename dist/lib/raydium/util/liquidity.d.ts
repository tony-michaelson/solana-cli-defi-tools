import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { LiquidityPoolInfo } from './pools.js';
import { TokenInfo } from './tokens.js';
export declare function getPrice(poolInfo: LiquidityPoolInfo, coinBase?: boolean): BigNumber;
export declare function getOutAmount(poolInfo: LiquidityPoolInfo, amount: string, fromCoinMint: string, toCoinMint: string, slippage: number): BigNumber;
export declare function getOutAmountStable(poolInfo: any, amount: string, fromCoinMint: string, toCoinMint: string, slippage: number): BigNumber;
export declare function addLiquidity(connection: Connection | undefined | null, wallet: any | undefined | null, poolInfo: LiquidityPoolInfo | undefined | null, fromCoinAccount: string | undefined | null, toCoinAccount: string | undefined | null, lpAccount: string | undefined | null, fromCoin: TokenInfo | undefined | null, toCoin: TokenInfo | undefined | null, fromAmount: string | undefined | null, toAmount: string | undefined | null, fixedCoin: string): Promise<string>;
export declare function removeLiquidity(connection: Connection | undefined | null, wallet: any | undefined | null, poolInfo: LiquidityPoolInfo | undefined | null, lpAccount: string | undefined | null, fromCoinAccount: string | undefined | null, toCoinAccount: string | undefined | null, amount: string | undefined | null): Promise<string>;
export declare function addLiquidityInstruction(programId: PublicKey, ammId: PublicKey, ammAuthority: PublicKey, ammOpenOrders: PublicKey, ammQuantities: PublicKey, lpMintAddress: PublicKey, poolCoinTokenAccount: PublicKey, poolPcTokenAccount: PublicKey, serumMarket: PublicKey, userCoinTokenAccount: PublicKey, userPcTokenAccount: PublicKey, userLpTokenAccount: PublicKey, userOwner: PublicKey, maxCoinAmount: number, maxPcAmount: number, fixedFromCoin: number): TransactionInstruction;
export declare function addLiquidityInstructionV4(programId: PublicKey, ammId: PublicKey, ammAuthority: PublicKey, ammOpenOrders: PublicKey, ammTargetOrders: PublicKey, lpMintAddress: PublicKey, poolCoinTokenAccount: PublicKey, poolPcTokenAccount: PublicKey, serumMarket: PublicKey, userCoinTokenAccount: PublicKey, userPcTokenAccount: PublicKey, userLpTokenAccount: PublicKey, userOwner: PublicKey, marketEventQ: PublicKey, maxCoinAmount: number, maxPcAmount: number, fixedFromCoin: number): TransactionInstruction;
export declare function removeLiquidityInstruction(programId: PublicKey, ammId: PublicKey, ammAuthority: PublicKey, ammOpenOrders: PublicKey, ammQuantities: PublicKey, lpMintAddress: PublicKey, poolCoinTokenAccount: PublicKey, poolPcTokenAccount: PublicKey, poolWithdrawQueue: PublicKey, poolTempLpTokenAccount: PublicKey, serumProgramId: PublicKey, serumMarket: PublicKey, serumCoinVaultAccount: PublicKey, serumPcVaultAccount: PublicKey, serumVaultSigner: PublicKey, userLpTokenAccount: PublicKey, userCoinTokenAccount: PublicKey, userPcTokenAccount: PublicKey, userOwner: PublicKey, amount: number): TransactionInstruction;
export declare function removeLiquidityInstructionV4(programId: PublicKey, ammId: PublicKey, ammAuthority: PublicKey, ammOpenOrders: PublicKey, ammTargetOrders: PublicKey, lpMintAddress: PublicKey, poolCoinTokenAccount: PublicKey, poolPcTokenAccount: PublicKey, poolWithdrawQueue: PublicKey, poolTempLpTokenAccount: PublicKey, serumProgramId: PublicKey, serumMarket: PublicKey, serumCoinVaultAccount: PublicKey, serumPcVaultAccount: PublicKey, serumVaultSigner: PublicKey, userLpTokenAccount: PublicKey, userCoinTokenAccount: PublicKey, userPcTokenAccount: PublicKey, userOwner: PublicKey, poolInfo: LiquidityPoolInfo, amount: number): TransactionInstruction;
export declare const AMM_INFO_LAYOUT: any;
export declare const AMM_INFO_LAYOUT_V3: any;
export declare const AMM_INFO_LAYOUT_V4: any;
export declare const AMM_INFO_LAYOUT_STABLE: any;
//# sourceMappingURL=liquidity.d.ts.map