import {
  Amount,
  CoinMetadata,
  ICalcAmountExact,
  IGetPools,
  IPools,
  PairSetting,
} from "../types";
import {
  getBalanceAmount,
  getCoinsFlowX,
  getDecimalAmount,
  getPairs,
  getPools,
} from "../utils";
import { BigNumberInstance } from "../BigNumber";
import { getSmartRoute } from "./getSmartRoute";
import { calculateAmountOutFromPath } from "./libs/calculateAmountOutFromPath";
import { calculateAmountInFromPath } from "./libs/calculateAmountInFromPath";

export const handleCalcAmountOut = async (
  value: string | number,
  coinIn: CoinMetadata,
  coinOut: CoinMetadata,
  coinsData?: CoinMetadata[],
  pairsData?: PairSetting[],
  poolInfosData?: IPools[]
): Promise<ICalcAmountExact> => {
  const coins = coinsData ?? (await getCoinsFlowX());
  let pairs = pairsData,
    poolInfos = poolInfosData;
  if (!poolInfosData || !pairsData) {
    const { poolInfos: poolData, pairs: pairData } = await getPools();
    pairs = pairData;
    poolInfos = poolData;
  }

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
    true,
    poolInfos,
    pairs
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

export const handleCalcAmountIn = async (
  value: string | number,
  coinIn: CoinMetadata,
  coinOut: CoinMetadata,
  coinsData?: CoinMetadata[],
  pairsData?: PairSetting[],
  poolInfosData?: IPools[]
): Promise<ICalcAmountExact> => {
  const coins = coinsData ?? (await getCoinsFlowX());
  let pairs = pairsData,
    poolInfos = poolInfosData;
  if (!poolInfosData || !pairsData) {
    const { poolInfos: poolData, pairs: pairData } = await getPools();
    pairs = pairData;
    poolInfos = poolData;
  }

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
    false,
    poolInfos,
    pairs
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
//User input exact amount of in token
export const calculateAmountOut = async (
  value: string | number,
  coinIn: CoinMetadata,
  coinOut: CoinMetadata
): Promise<ICalcAmountExact> => {
  const { poolInfos } = await getPools();
  const coins: CoinMetadata[] = await getCoinsFlowX();
  const pairs: PairSetting[] = await getPairs();
  const { amountIn, amountOut, trades, smartRoute } = await handleCalcAmountOut(
    value,
    coinIn,
    coinOut,
    coins,
    pairs,
    poolInfos
  );
  return { amountIn, amountOut, trades, smartRoute };
};

//User input exact amount of out token
export const calculateAmountIn = async (
  value: string | number,
  coinIn: CoinMetadata,
  coinOut: CoinMetadata
): Promise<ICalcAmountExact> => {
  const { poolInfos } = await getPools();
  const coins: CoinMetadata[] = await getCoinsFlowX();
  const pairs: PairSetting[] = await getPairs();
  const { amountIn, amountOut, trades, smartRoute } = await handleCalcAmountIn(
    value,
    coinIn,
    coinOut,
    coins,
    pairs,
    poolInfos
  );
  return {
    amountIn,
    amountOut,
    trades,
    smartRoute,
  };
};
