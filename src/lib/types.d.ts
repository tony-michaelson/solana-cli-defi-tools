import { Decimal } from 'decimal.js'

export type Option = Record<string, string>

export type SwapAmount = {
  input: 'base' | 'quote'
  amount: Decimal
  fee: Decimal
  expect: {
    baseAmount: Decimal
    quoteAmount: Decimal
    amount: Decimal
    price: Decimal
  }
}
