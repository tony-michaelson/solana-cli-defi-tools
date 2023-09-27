function _safeDivision(numerator, denominator) {
    return denominator === 0 ? 0 : numerator / denominator;
}
// Price comes from
// https://github.com/project-serum/serum-ts/blob/%40project-serum/serum%400.13.21/packages/serum/src/market.ts#L926
function _calcWeightedAvgPrice([head, ...tail], volLimit, numerator, denominator) {
    return !head || denominator >= volLimit
        ? _safeDivision(numerator, denominator)
        : _calcWeightedAvgPrice(tail, volLimit, numerator + head.price * head.size, denominator + head.size);
}
export function calcWeightedAvgPrice(list, volLimit) {
    return list ? _calcWeightedAvgPrice(list, volLimit, 0, 0) : 0;
}
