import { BigNumber } from "../BigNumber";
import { CoinMetadata } from "../types";
import { getBalanceAmount } from "../utils";

export const estimatePriceImpact = (
  amountInDecimal: string | number,
  amountOutDecimal: string | number,
  coinIn?: CoinMetadata,
  coinOut?: CoinMetadata
): string => {
  const amountIn = coinIn
    ? getBalanceAmount(amountInDecimal, coinIn?.decimals).toFixed()
    : "0";
  const amountOut = coinOut
    ? getBalanceAmount(amountOutDecimal, coinOut.decimals).toFixed()
    : "0";
  const amountInUsd = BigNumber(amountIn).multipliedBy(
    coinIn.derivedPriceInUSD
  );
  const amountOutUsd = BigNumber(amountOut).multipliedBy(
    coinOut.derivedPriceInUSD
  );
  const priceImpacts =
    amountOutUsd.isEqualTo(0) || amountInUsd.isEqualTo(0)
      ? "0"
      : amountOutUsd
          .minus(amountInUsd)
          .div(amountInUsd)
          .multipliedBy(-100)
          .toFixed();
  return priceImpacts;
};
