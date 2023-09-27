import { u64 } from '@solana/spl-token';
import Decimal from 'decimal.js';
export class Fee {
    constructor(numerator, denominator) {
        this.numerator = new Decimal(numerator);
        this.denominator = new Decimal(denominator);
    }
}
export class FeeU64 {
    constructor(numerator, denominator) {
        this.numerator = new u64(numerator);
        this.denominator = new u64(denominator);
    }
}
