export interface FillPrice {
  price: number
  size: number
}

function _safeDivision(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : numerator / denominator
}

// Price comes from
// https://github.com/project-serum/serum-ts/blob/%40project-serum/serum%400.13.21/packages/serum/src/market.ts#L926

function _calcWeightedAvgPrice(
  [head, ...tail]: FillPrice[],
  volLimit: number,
  numerator: number,
  denominator: number
): number {
  return !head || denominator >= volLimit
    ? _safeDivision(numerator, denominator)
    : _calcWeightedAvgPrice(
      tail,
      volLimit,
      numerator + head.price * head.size,
      denominator + head.size
    )
}

export function calcWeightedAvgPrice(
  list: FillPrice[],
  volLimit: number
): number {
  return list ? _calcWeightedAvgPrice(list, volLimit, 0, 0) : 0
}
