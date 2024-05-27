import { BigNumber as BNumber } from "bignumber.js";
BNumber.config({
  DECIMAL_PLACES: 1000,
  EXPONENTIAL_AT: [-1000, 1000],
  ROUNDING_MODE: 3,
});
export const BigNumber = BNumber;
export const BigNumb = (value: string | number): BNumber =>
  new BigNumber(value);
export const BIG_ZERO = BigNumb(0);
export const BIG_ONE = BigNumb(1);
export const BIG_NINE = BigNumb(9);
export const BIG_TEN = BigNumb(10);
