import { BigNumb } from "../../BigNumber";
import { PairSetting, PoolInfo, SmartRoute } from "../../types";
import { getReserveByCoinType } from "../../utils";
export const getAmountIn = (
  amountOut: string | number,
  reserveIn: string,
  reserveOut: string,
  fee: number
): string => {
  const numerator = BigNumb(reserveIn).multipliedBy(amountOut);
  const denominator = BigNumb(reserveOut)
    .minus(amountOut)
    .multipliedBy(1 - fee);

  return numerator.dividedBy(denominator).plus(1).toFixed(0);
};
const _getAmountIn = (
  pair: PairSetting,
  _amountOut: string | number,
  coinIn: string,
  poolInfos: PoolInfo[]
) => {
  const poolDetail = poolInfos.find(
    (item) => item.objectId === pair.lpObjectId
  );

  const reserve = getReserveByCoinType(coinIn, poolDetail);

  return getAmountIn(
    _amountOut,
    reserve.reserveX,
    reserve.reserveY,
    poolDetail.feeRate
  );
};
export const calculateAmountInFromPath = (
  amount: string | number,
  coinOutType: string,
  tradAbles: PairSetting[],
  poolInfos: PoolInfo[]
): SmartRoute => {
  let smartRoute: SmartRoute = {};
  smartRoute.amountOut = amount;
  smartRoute.routes = [];

  let tradeAblesRev = tradAbles.slice().reverse();
  let amountIn = amount;
  let lpOutType = coinOutType;
  for (let i = 0; i < tradeAblesRev.length; i++) {
    let route: any = {};
    route.coinTypeOut = lpOutType;
    route.amountOut = amountIn;

    lpOutType =
      tradeAblesRev[i].coinYType == lpOutType
        ? tradeAblesRev[i].coinXType
        : tradeAblesRev[i].coinYType;
    amountIn = _getAmountIn(tradeAblesRev[i], amountIn, lpOutType, poolInfos);

    route.coinTypeIn = lpOutType;
    route.amountIn = amountIn;
    route.pair = tradeAblesRev[i];

    smartRoute.routes.push(route);
  }

  smartRoute.routes.reverse();
  smartRoute.amountIn = amountIn;
  return smartRoute;
};
