import { Amount, CoinMetadata, ICalcAmountExact, PairSetting } from "../types";
import {
  getBalanceAmount,
  getCoinsFlowX,
  getDecimalAmount,
  getPools,
} from "../utils";
import { BigNumberInstance } from "../BigNumber";
import { getSmartRoute } from "./getSmartRoute";
import { calculateAmountOutFromPath } from "./libs/calculateAmountOutFromPath";
import { calculateAmountInFromPath } from "./libs/calculateAmountInFromPath";

//User input exact amount of in token
export const calculateAmountOut = async (
  value: string | number,
  coinIn: CoinMetadata,
  coinOut: CoinMetadata
): Promise<ICalcAmountExact> => {
  const { poolInfos } = await getPools();
  const coins: CoinMetadata[] = await getCoinsFlowX();
  let decimalInAmount = BigNumberInstance(
    getDecimalAmount(value, coinIn.decimals)
  ).toFixed(0);
  let amountInFormat = getBalanceAmount(
    decimalInAmount,
    coins.find((coin) => coin.type === coinIn.type)?.decimals
  ).toFixed();

  let amountInNewState: Amount = {
    decimalAmount: decimalInAmount,
    amount: amountInFormat,
  };

  const trades = await getSmartRoute(
    decimalInAmount,
    coinIn.type,
    coinOut.type,
    true
  );

  const smartRoute = calculateAmountOutFromPath(
    decimalInAmount,
    coinIn.type,
    trades,
    poolInfos
  );
  const decimalOutAmount = smartRoute.amountOut;

  const amountOutFormat = getBalanceAmount(
    decimalOutAmount,
    coins.find((coin) => coin.type === coinOut.type)?.decimals
  ).toFixed();

  let amountOutNewState: Amount = {
    decimalAmount: decimalOutAmount,
    amount: amountOutFormat,
  };
  return {
    amountIn: amountInNewState,
    amountOut: amountOutNewState,
    trades,
    smartRoute,
  };
};

//User input exact amount of out token
export const calculateAmountIn = async (
  value: string | number,
  coinIn: CoinMetadata,
  coinOut: CoinMetadata
): Promise<ICalcAmountExact> => {
  const { poolInfos } = await getPools();
  const coins: CoinMetadata[] = await getCoinsFlowX();
  let decimalOutAmount = BigNumberInstance(
    getDecimalAmount(value, coinOut.decimals)
  ).toFixed(0);
  let amountOutFormat = getBalanceAmount(
    decimalOutAmount,
    coins.find((coin) => coin.type === coinOut.type)?.decimals
  ).toFixed();
  let amountOutNewState: Amount = {
    decimalAmount: decimalOutAmount,
    amount: amountOutFormat,
  };
  const trades = await getSmartRoute(
    decimalOutAmount,
    coinIn.type,
    coinOut.type,
    false
  );
  const smartRoute = calculateAmountInFromPath(
    decimalOutAmount,
    coinOut.type,
    trades,
    poolInfos
  );
  const decimalInAmount = smartRoute.amountIn;

  const amountInFormat = getBalanceAmount(
    decimalInAmount,
    coins.find((coin) => coin.type === coinIn.type)?.decimals
  ).toFixed();
  let amountInNewState: Amount = {
    decimalAmount: decimalInAmount,
    amount: amountInFormat,
  };
  return {
    amountIn: amountInNewState,
    amountOut: amountOutNewState,
    trades,
    smartRoute,
  };
};
