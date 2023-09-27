import Decimal from 'decimal.js'
import { Fee } from './fee'
import { calcSwapAmountForDesiredPrice, raydiumSwapQuote } from './util'

describe('calcSwapAmountForDesiredPrice', () => {
  it('[orca] calculates proper swap amount for under peg (deep pool)', () => {
    const baseAmount = new Decimal('192388.153043288')
    const quoteAmount = new Decimal('9290429.106149') // 48.29002700628151
    const desiredPrice = new Decimal('48.28')
    const tradeFee = new Fee('25', '10000')
    const ownerFee = new Fee('25', '10000')

    const swapAmount = calcSwapAmountForDesiredPrice(
      'orca',
      baseAmount,
      9,
      quoteAmount,
      6,
      desiredPrice,
      tradeFee,
      ownerFee
    )
    console.log(swapAmount)
    const newPrice = swapAmount.expect.price

    expect(swapAmount.input.toString()).toStrictEqual('base')
    // new price within + or - 0.00001 of desired price
    expect(
      newPrice.gte(desiredPrice.sub('0.00001')) &&
        newPrice.lte(desiredPrice.add('0.00001'))
    ).toBeTruthy()
  })

  it('[raydium] calculates proper swap amount for under peg (deep pool)', () => {
    const baseAmount = new Decimal('192388.153043288')
    const quoteAmount = new Decimal('9290429.106149') // 48.29002700628151
    const desiredPrice = new Decimal('48.28')
    const tradeFee = new Fee('25', '10000')

    const swapAmount = calcSwapAmountForDesiredPrice(
      'raydium',
      baseAmount,
      9,
      quoteAmount,
      6,
      desiredPrice,
      tradeFee
    )
    console.log(swapAmount)
    const newPrice = swapAmount.expect.price

    expect(swapAmount.input.toString()).toStrictEqual('base')
    // new price within + or - 0.00001 of desired price
    expect(
      newPrice.gte(desiredPrice.sub('0.00001')) &&
        newPrice.lte(desiredPrice.add('0.00001'))
    ).toBeTruthy()
  })

  it('[orca] calculates proper swap amount for over peg (deep pool)', () => {
    const baseAmount = new Decimal('192388.153043288')
    const quoteAmount = new Decimal('9290429.106149') // 48.29002700628151
    const desiredPrice = new Decimal('48.30')
    const tradeFee = new Fee('25', '10000')
    const ownerFee = new Fee('25', '10000')

    const swapAmount = calcSwapAmountForDesiredPrice(
      'orca',
      baseAmount,
      9,
      quoteAmount,
      6,
      desiredPrice,
      tradeFee,
      ownerFee
    )
    console.log(swapAmount)
    const newPrice = swapAmount.expect.price

    expect(swapAmount.input.toString()).toStrictEqual('quote')
    // new price within + or - 0.00001 of desired price
    expect(
      newPrice.gte(desiredPrice.sub('0.00001')) &&
        newPrice.lte(desiredPrice.add('0.00001'))
    ).toBeTruthy()
  })

  it('[raydium] calculates proper swap amount for over peg (deep pool)', () => {
    const baseAmount = new Decimal('192388.153043288')
    const quoteAmount = new Decimal('9290429.106149') // 48.29002700628151
    const desiredPrice = new Decimal('48.30')
    const tradeFee = new Fee('25', '10000')

    const swapAmount = calcSwapAmountForDesiredPrice(
      'raydium',
      baseAmount,
      9,
      quoteAmount,
      6,
      desiredPrice,
      tradeFee
    )
    console.log(swapAmount)
    const newPrice = swapAmount.expect.price

    expect(swapAmount.input.toString()).toStrictEqual('quote')
    // new price within + or - 0.00001 of desired price
    expect(
      newPrice.gte(desiredPrice.sub('0.00001')) &&
        newPrice.lte(desiredPrice.add('0.00001'))
    ).toBeTruthy()
  })

  it('[orca] calculates proper swap amount for under peg (shallow pool)', () => {
    const baseAmount = new Decimal('1000')
    const quoteAmount = new Decimal('50000') // 50.00
    const desiredPrice = new Decimal('49.95')
    const tradeFee = new Fee('25', '10000')
    const ownerFee = new Fee('25', '10000')

    const swapAmount = calcSwapAmountForDesiredPrice(
      'orca',
      baseAmount,
      9,
      quoteAmount,
      6,
      desiredPrice,
      tradeFee,
      ownerFee
    )
    console.log(swapAmount)
    const newPrice = swapAmount.expect.price

    expect(swapAmount.input.toString()).toStrictEqual('base')
    // new price within + or - 0.00001 of desired price
    expect(
      newPrice.gte(desiredPrice.sub('0.00001')) &&
        newPrice.lte(desiredPrice.add('0.00001'))
    ).toBeTruthy()
  })

  it('[raydium] calculates proper swap amount for under peg (shallow pool)', () => {
    const baseAmount = new Decimal('1000')
    const quoteAmount = new Decimal('50000') // 50.00
    const desiredPrice = new Decimal('49.95')
    const tradeFee = new Fee('25', '10000')

    const swapAmount = calcSwapAmountForDesiredPrice(
      'raydium',
      baseAmount,
      9,
      quoteAmount,
      6,
      desiredPrice,
      tradeFee
    )
    console.log(swapAmount)
    const newPrice = swapAmount.expect.price

    expect(swapAmount.input.toString()).toStrictEqual('base')
    // new price within + or - 0.00001 of desired price
    expect(
      newPrice.gte(desiredPrice.sub('0.00001')) &&
        newPrice.lte(desiredPrice.add('0.00001'))
    ).toBeTruthy()
  })

  it('[orca] calculates proper swap amount for over peg (shallow pool)', () => {
    const baseAmount = new Decimal('1000')
    const quoteAmount = new Decimal('50000') // 50.00
    const desiredPrice = new Decimal('50.95')
    const tradeFee = new Fee('25', '10000')
    const ownerFee = new Fee('25', '10000')

    const swapAmount = calcSwapAmountForDesiredPrice(
      'orca',
      baseAmount,
      9,
      quoteAmount,
      6,
      desiredPrice,
      tradeFee,
      ownerFee
    )
    console.log(swapAmount)
    const newPrice = swapAmount.expect.price

    expect(swapAmount.input.toString()).toStrictEqual('quote')
    // new price within + or - 0.00001 of desired price
    expect(
      newPrice.gte(desiredPrice.sub('0.00001')) &&
        newPrice.lte(desiredPrice.add('0.00001'))
    ).toBeTruthy()
  })

  it('[raydium] calculates proper swap amount for over peg (shallow pool)', () => {
    const baseAmount = new Decimal('1000')
    const quoteAmount = new Decimal('50000') // 50.00
    const desiredPrice = new Decimal('50.95')
    const tradeFee = new Fee('25', '10000')

    const swapAmount = calcSwapAmountForDesiredPrice(
      'raydium',
      baseAmount,
      9,
      quoteAmount,
      6,
      desiredPrice,
      tradeFee
    )
    console.log(swapAmount)
    const newPrice = swapAmount.expect.price

    expect(swapAmount.input.toString()).toStrictEqual('quote')
    // new price within + or - 0.00001 of desired price
    expect(
      newPrice.gte(desiredPrice.sub('0.00001')) &&
        newPrice.lte(desiredPrice.add('0.00001'))
    ).toBeTruthy()
  })

  it('[orca] returns null if nothing to do (price already correct)', () => {
    const baseAmount = new Decimal('100')
    const quoteAmount = new Decimal('5000') // 50
    const desiredPrice = new Decimal('50')
    const tradeFee = new Fee('25', '10000')
    const ownerFee = new Fee('25', '10000')

    const swapAmount = calcSwapAmountForDesiredPrice(
      'orca',
      baseAmount,
      9,
      quoteAmount,
      6,
      desiredPrice,
      tradeFee,
      ownerFee
    )
    expect(swapAmount).toStrictEqual(null)
  })

  it('[raydium] returns null if nothing to do (price already correct)', () => {
    const baseAmount = new Decimal('100')
    const quoteAmount = new Decimal('5000') // 50
    const desiredPrice = new Decimal('50')
    const tradeFee = new Fee('25', '10000')

    const swapAmount = calcSwapAmountForDesiredPrice(
      'raydium',
      baseAmount,
      9,
      quoteAmount,
      6,
      desiredPrice,
      tradeFee
    )
    expect(swapAmount).toStrictEqual(null)
  })
})

describe('raydiumSwapQuote', () => {
  it('calculates correct swap quote for input token base side', () => {
    const baseAmount = new Decimal('189487.202094932')
    const quoteAmount = new Decimal('9445419.108867')
    const tradeFee = new Fee('25', '10000')
    const swapAmount = new Decimal(100)
    const quote = raydiumSwapQuote(swapAmount, {
      input: 'base',
      baseAmount,
      quoteAmount,
      tradeFee,
    })
    console.log(quote)
    const decimalPrecision = 4

    const expectedQuote = new Decimal('9440449.460135').toFixed(
      decimalPrecision
    )
    expect(quote.newQuoteAmount.toFixed(decimalPrecision)).toStrictEqual(
      expectedQuote
    )

    const expectedBase = new Decimal('189587.202094932').toFixed(
      decimalPrecision
    )
    expect(quote.newBaseAmount.toFixed(decimalPrecision)).toStrictEqual(
      expectedBase
    )
  })

  it('calculates correct swap quote for input token quote side', () => {
    const baseAmount = new Decimal('189587.202094932')
    const quoteAmount = new Decimal('9440449.460135')
    const tradeFee = new Fee('25', '10000')
    const swapAmount = new Decimal(5000)
    const quote = raydiumSwapQuote(swapAmount, {
      input: 'quote',
      baseAmount,
      quoteAmount,
      tradeFee,
    })
    console.log(quote)
    const decimalPrecision = 4

    const expectedQuote = new Decimal('9445449.460135').toFixed(
      decimalPrecision
    )
    expect(quote.newQuoteAmount.toFixed(decimalPrecision)).toStrictEqual(
      expectedQuote
    )

    const expectedBase = new Decimal('189487.09384431').toFixed(
      decimalPrecision
    )
    expect(quote.newBaseAmount.toFixed(decimalPrecision)).toStrictEqual(
      expectedBase
    )
  })
})
