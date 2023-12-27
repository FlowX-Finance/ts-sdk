import { PairSetting, PoolInfo, SmartRoute } from "../../types";
import { getAmountOut, getReserveByCoinType } from "../../utils";

const _getAmountOut = (
  pair: PairSetting,
  _amountIn: string | number,
  coinIn: string,
  poolInfos: PoolInfo[]
) => {
  const poolDetail = poolInfos.find(
    (item) => item.objectId === pair.lpObjectId
  );
  const reserve = getReserveByCoinType(coinIn, poolDetail);
  return getAmountOut(
    _amountIn,
    reserve.reserveX,
    reserve.reserveY,
    poolDetail.feeRate
  );
};
export const calculateAmountOutFromPath = (
  amount: string | number,
  coinInType: string,
  tradAbles: PairSetting[],
  poolInfos: PoolInfo[]
): SmartRoute => {
  let smartRoute: SmartRoute = {};
  smartRoute.amountIn = amount;
  smartRoute.routes = [];
  let amountOut = amount;
  let lpOutType = coinInType;

  for (let i = 0; i < tradAbles?.length; i++) {
    let route: any = {};
    route.coinTypeIn = lpOutType;
    route.amountIn = amountOut;

    amountOut = _getAmountOut(tradAbles[i], amountOut, lpOutType, poolInfos);
    lpOutType =
      tradAbles[i].coinYType == lpOutType
        ? tradAbles[i].coinXType
        : tradAbles[i].coinYType;

    route.coinTypeOut = lpOutType;
    route.amountOut = amountOut;
    route.pair = tradAbles[i];

    smartRoute.routes.push(route);
  }

  smartRoute.amountOut = amountOut;
  return smartRoute;
};
