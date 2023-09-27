import { u64 } from '@solana/spl-token';
import Decimal from 'decimal.js';
export declare class Fee {
    numerator: Decimal;
    denominator: Decimal;
    constructor(numerator: number | string, denominator: number | string);
}
export declare class FeeU64 {
    numerator: u64;
    denominator: u64;
    constructor(numerator: number | string, denominator: number | string);
}
//# sourceMappingURL=fee.d.ts.map