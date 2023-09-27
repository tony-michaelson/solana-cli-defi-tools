import BigNumber from 'bignumber.js';
export declare class TokenAmount {
    wei: BigNumber;
    decimals: number;
    _decimals: BigNumber;
    constructor(wei: number | string | BigNumber, decimals?: number, isWei?: boolean);
    toEther(): BigNumber;
    toWei(): BigNumber;
    format(): string;
    fixed(): string;
    isNullOrZero(): boolean;
}
export declare function gt(a: string | number, b: string | number): boolean;
export declare function gte(a: string | number, b: string | number): boolean;
export declare function lt(a: string | number, b: string | number): boolean;
export declare function lte(a: string | number, b: string | number): boolean;
export declare function isNullOrZero(value: string | number): boolean;
//# sourceMappingURL=safe-math.d.ts.map