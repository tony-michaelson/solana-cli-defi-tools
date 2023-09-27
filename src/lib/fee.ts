import { u64 } from '@solana/spl-token'
import Decimal from 'decimal.js'

export class Fee {
  numerator: Decimal
  denominator: Decimal

  constructor(numerator: number | string, denominator: number | string) {
    this.numerator = new Decimal(numerator)
    this.denominator = new Decimal(denominator)
  }
}

export class FeeU64 {
  numerator: u64
  denominator: u64

  constructor(numerator: number | string, denominator: number | string) {
    this.numerator = new u64(numerator)
    this.denominator = new u64(denominator)
  }
}
