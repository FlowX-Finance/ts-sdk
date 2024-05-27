import {d, decimalsMultiplier} from './numbers';

/**
 * Converts an amount to a decimal value, based on the number of decimals specified.
 * @param  {number | string} amount - The amount to convert to decimal.
 * @param  {number | string} decimals - The number of decimals to use in the conversion.
 * @returns {number} - Returns the converted amount as a number.
 */
export function toDecimalsAmount(amount: number | string, decimals: number | string): number {
  const mul = decimalsMultiplier(d(decimals));

  return Number(d(amount).mul(mul));
}

/**
 * Converts a bigint to an unsigned integer of the specified number of bits.
 * @param {bigint} int - The bigint to convert.
 * @param {number} bits - The number of bits to use in the conversion. Defaults to 32 bits.
 * @returns {string} - Returns the converted unsigned integer as a string.
 */
export function asUintN(int: bigint, bits = 32) {
  return BigInt.asUintN(bits, BigInt(int)).toString();
}

/**
 * Converts a bigint to a signed integer of the specified number of bits.
 * @param {bigint} int - The bigint to convert.
 * @param {number} bits - The number of bits to use in the conversion. Defaults to 32 bits.
 * @returns {number} - Returns the converted signed integer as a number.
 */
export function asIntN(int: bigint, bits = 32) {
  return Number(BigInt.asIntN(bits, BigInt(int)));
}
