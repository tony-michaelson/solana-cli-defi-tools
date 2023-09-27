import { TokenAmount } from './safe-math.js';
export interface TokenInfo {
    symbol: string;
    name: string;
    mintAddress: string;
    decimals: number;
    totalSupply?: TokenAmount;
    referrer?: string;
    details?: string;
    docs?: object;
    socials?: object;
    tokenAccountAddress?: string;
    balance?: TokenAmount;
    tags: string[];
}
/**
 * Get token use symbol

 * @param {string} symbol

 * @returns {TokenInfo | null} tokenInfo
 */
export declare function getTokenBySymbol(symbol: string): TokenInfo | null;
/**
 * Get token use mint addresses

 * @param {string} mintAddress

 * @returns {TokenInfo | null} tokenInfo
 */
export declare function getTokenByMintAddress(mintAddress: string): TokenInfo | null;
export declare function getTokenSymbolByMint(mint: string): any;
export interface Tokens {
    [key: string]: any;
    [index: number]: any;
}
export declare const TOKENS_TAGS: {
    [key: string]: {
        mustShow: boolean;
        show: boolean;
        outName: string;
    };
};
export declare const NATIVE_SOL: TokenInfo;
export declare const TOKENS: Tokens;
export declare const LP_TOKENS: Tokens;
//# sourceMappingURL=tokens.d.ts.map