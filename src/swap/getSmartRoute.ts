import { BigNumberInstance } from "../BigNumber";
import { MAX_ROUTE_HOPS, client } from "../constants";
import { IPools, PairSetting, PoolInfo } from "../types";
import { getPairs, getPools } from "../utils";
import Graph from "./libs/Graph";
import { calculateAmountInFromPath } from "./libs/calculateAmountInFromPath";
import { calculateAmountOutFromPath } from "./libs/calculateAmountOutFromPath";

const getTrades = (
  coinInType: string,
  coinOutType: string,
  pairs: PairSetting[]
) => {
  const trade = pairs.find(
    (pair) =>
      (pair.coinXType.includes(coinInType) &&
        pair.coinYType.includes(coinOutType)) ||
      (pair.coinXType.includes(coinOutType) &&
        pair.coinYType.includes(coinInType))
  );

  return trade;
};
const getTradAbles = (
  coinInType: string,
  coinOutType: string,
  pairs: PairSetting[]
) => {
  const graph = new Graph();

  pairs.forEach((pair) => {
    graph.addEdge(pair.coinXType, pair.coinYType);
  });

  const paths = graph
    .findAllPaths(coinInType, coinOutType)
    .filter((path) => path.length <= MAX_ROUTE_HOPS);

  const pairPaths: PairSetting[][] = [];
  for (let i = 0; i < paths.length; i++) {
    for (let j = 0; j < paths[i].length - 1; j++) {
      const coinX = paths[i][j];
      const coinY = paths[i][j + 1];

      if (!pairPaths[i]) {
        pairPaths[i] = [];
      }

      pairPaths[i].push(
        pairs.find(
          (pair) =>
            (pair.coinXType === coinX && pair.coinYType === coinY) ||
            (pair.coinXType === coinY && pair.coinYType === coinX)
        )
      );
    }
  }
  return pairPaths;
};
const getBestRouterExactIn = (
  amount: string | number,
  tradAbles: PairSetting[][],
  directTrade: PairSetting,
  coinInType: string,
  poolInfos: PoolInfo[]
) => {
  let bestTrade: PairSetting[];
  let maxAmountOut = BigNumberInstance(0);

  tradAbles.forEach((item) => {
    let smartRoute = calculateAmountOutFromPath(
      amount,
      coinInType,
      item,
      poolInfos
    );
    // console.log(smartRoute, 'smartRoute');

    if (BigNumberInstance(smartRoute.amountOut).gte(maxAmountOut)) {
      maxAmountOut = BigNumberInstance(smartRoute.amountOut);
      bestTrade = item;
    }
  });

  // console.log('================== Exact IN ==================');

  return bestTrade;
};
const getBestRouterExactOut = (
  amount: string | number,
  tradAbles: PairSetting[][],
  directTrade: PairSetting,
  coinInType: string,
  coinOutType: string,
  poolInfos: PoolInfo[]
) => {
  let bestTrade: PairSetting[] = [];
  let maxAmountIn = BigNumberInstance("Infinity");
  tradAbles.forEach((item) => {
    let smartRoute = calculateAmountInFromPath(
      amount,
      coinOutType,
      item,
      poolInfos
    );

    // console.log(smartRoute, 'smartRoute');
    if (
      BigNumberInstance(smartRoute.amountIn).lte(maxAmountIn) &&
      BigNumberInstance(smartRoute.amountIn).gt(1)
    ) {
      maxAmountIn = BigNumberInstance(smartRoute.amountIn);
      bestTrade = item;
    }
  });
  // console.log('================== Exact OUT ==================');
  return bestTrade;
};
export const getSmartRoute = async (
  amount: string | number,
  coinInType: string,
  coinOutType: string,
  isExactIn: boolean,
  poolInfosData?: IPools[],
  pairsData?: PairSetting[]
): Promise<PairSetting[]> => {
  let pairs = pairsData,
    poolInfos = poolInfosData;
  if (!poolInfosData || !pairsData) {
    const { poolInfos: poolData, pairs: pairData } = await getPools();
    pairs = pairData;
    poolInfos = poolData;
  }

  let tradAbles = getTradAbles(coinInType, coinOutType, pairs);
  const directTrade = getTrades(coinInType, coinOutType, pairs);
  //return directTrade if do not have multi routers
  // if (!tradAbles.length) {
  //   return directTrade ? [directTrade] : [];
  // }
  if (isExactIn) {
    return getBestRouterExactIn(
      amount,
      tradAbles,
      directTrade,
      coinInType,
      poolInfos
    );
  }
  return getBestRouterExactOut(
    amount,
    tradAbles,
    directTrade,
    coinInType,
    coinOutType,
    poolInfos
  );
};
