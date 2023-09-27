import { calcWeightedAvgPrice, FillPrice } from './serum'

describe('calcWeightedAvgPrice', () => {
  const shardsSupply = 10 ** 6
  const volumeLimit = shardsSupply * 0.5

  it('returns 0 for no inputs', () => {
    const inputs: FillPrice[] = []
    expect(calcWeightedAvgPrice(inputs, volumeLimit)).toStrictEqual(0)
  })

  it('returns 0 for inputs with zeros', () => {
    const inputs: FillPrice[] = [{ price: 0, size: 0 }]
    expect(calcWeightedAvgPrice(inputs, volumeLimit)).toStrictEqual(0)
  })

  it('returns 0 for divide by zero scenario', () => {
    const inputs: FillPrice[] = [{ price: 1, size: 0 }]
    expect(calcWeightedAvgPrice(inputs, volumeLimit)).toStrictEqual(0)
  })

  it('returns 10 for 1 input', () => {
    const inputs: FillPrice[] = [{ price: 10, size: 100 }]
    expect(calcWeightedAvgPrice(inputs, volumeLimit)).toStrictEqual(10)
  })

  it('returns 20 for multi-inputs', () => {
    const inputs: FillPrice[] = [
      { price: 10, size: 100 },
      { price: 20, size: 100 },
      { price: 30, size: 100 },
    ]
    expect(calcWeightedAvgPrice(inputs, volumeLimit)).toStrictEqual(20)
  })

  it('returns 23.60875 for multi-inputs', () => {
    const inputs: FillPrice[] = [
      { price: 11.11, size: 22.22 },
      { price: 22.22, size: 33.33 },
      { price: 33.33, size: 33.33 },
    ]
    expect(calcWeightedAvgPrice(inputs, volumeLimit)).toStrictEqual(23.60875)
  })

  it('returns 111 for 1 input which exceeds volume limit', () => {
    const inputs: FillPrice[] = [{ price: 111, size: volumeLimit + 1 }]
    expect(calcWeightedAvgPrice(inputs, volumeLimit)).toStrictEqual(111)
  })

  it('returns ~29 for multi-inputs exceeding volume limit', () => {
    const inputs: FillPrice[] = [
      { price: 10, size: 100 },
      { price: 20, size: 100 },
      { price: 30, size: volumeLimit },
      { price: 40, size: 100 },
    ]
    expect(calcWeightedAvgPrice(inputs, volumeLimit)).toStrictEqual(
      29.994002399040383
    )
  })
})
