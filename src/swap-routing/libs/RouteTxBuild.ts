import { TransactionBlock } from "@mysten/sui.js";
import { ISmartPathV3, Route } from "../../types";
import { estimateDealine, standardizeType } from "../../utils";
import { BigNumber } from "../../BigNumber";
import { MAX_SQRT_PRICE, MIN_SQRT_PRICE } from "../../constants";
import { InitPath } from "./InitPath";
import { InitRouting } from "./InitRouting";
import { NextRouting } from "./NextRouting";
import { SwapV2Handle, SwapV3Handle } from "./SwapFlowXHandle";
import { SwapKriyaHandle } from "./SwapKriyaHandle";
import { SwapCetusHandle } from "./SwapCetusHandle";
import { SwapTurbosHandle } from "./SwapTurbosHandle";
import { SwapAfterMathHandle } from "./SwapAftermathHandle";
import { SwapDeepBookHandle, SwapDeepBookHandleV2 } from "./SwapDeepBookHandle";

export const routeTxBuild = async (
  route: Route,
  slippage: number,
  tx: TransactionBlock,
  routeObject: any,
  coinObjectIn: any,
  routeIndex: number,
  path: ISmartPathV3,
  amountOut: number
): Promise<any> => {
  try {
    const coinTypeIn = standardizeType(route.coinX.coinType),
      coinTypeOut = standardizeType(route.coinY.coinType);
    if (routeIndex === 0) {
      let sqrtPrice = "0";
      if (route?.sqrtPrice && route?.swapXtoY !== undefined) {
        const rate = route?.swapXtoY
          ? BigNumber(1).minus(0.15)
          : BigNumber(1).plus(0.15);
        const sqrtPriceCalc = !!route?.swapXtoY
          ? BigNumber.max(
              rate.multipliedBy(route?.sqrtPrice).toFixed(0),
              route?.minSqrtPriceHasLiquidity
            )
          : BigNumber.min(
              rate.multipliedBy(route?.sqrtPrice).toFixed(0),
              route?.maxSqrtPriceHasLiquidity
            );
        sqrtPrice = (
          BigNumber(sqrtPriceCalc).isGreaterThan(MAX_SQRT_PRICE)
            ? MAX_SQRT_PRICE
            : BigNumber(sqrtPriceCalc).isLessThan(MIN_SQRT_PRICE)
            ? MIN_SQRT_PRICE
            : sqrtPriceCalc
        ).toString();
      }
      const [firstPath] = await InitPath(
        coinTypeIn,
        coinTypeOut,
        coinObjectIn,
        route?.fee ?? 0,
        sqrtPrice,
        tx
      );
      [routeObject] = await InitRouting(
        coinTypeIn,
        coinTypeOut,
        firstPath,
        amountOut,
        slippage,
        estimateDealine(),
        path.info.routes.length,
        tx
      );
    }
    // console.log('XXXXX', routeIndex, path.info.routes);

    const protocol = route.protocol;
    if (protocol === "FLOWX_CLMM" || protocol === "FLOWX") {
      if (route.sqrtPrice) {
        await SwapV3Handle(routeObject, coinTypeIn, coinTypeOut, tx);
      } else {
        // console.log('go here');
        await SwapV2Handle(routeObject, coinTypeIn, coinTypeOut, tx);
      }
    }
    if (protocol === "KRIYA")
      await SwapKriyaHandle(
        routeObject,
        coinTypeIn,
        coinTypeOut,
        route.swapXtoY,
        route.poolId,
        tx
      );
    if (protocol === "CETUS")
      await SwapCetusHandle(
        routeObject,
        coinTypeIn,
        coinTypeOut,
        route.swapXtoY,
        route.poolId,
        tx
      );
    if (protocol === "TURBOS") {
      await SwapTurbosHandle(
        routeObject,
        coinTypeIn,
        coinTypeOut,
        route.swapXtoY,
        route.poolId,
        route.fee,
        tx
      );
    }
    if (protocol === "AFTERMATH") {
      await SwapAfterMathHandle(
        routeObject,
        route.lpType,
        coinTypeIn,
        coinTypeOut,
        route.poolId,
        route.amountOut.toFixed(0),
        tx
      );
    }
    if (protocol === "DEEPBOOK") {
      if (route.swapXtoY) {
        await SwapDeepBookHandleV2(
          routeObject,
          coinTypeIn,
          coinTypeOut,
          route.swapXtoY,
          route.poolId,
          route.lotSize,
          tx
        );
      } else {
        await SwapDeepBookHandle(
          routeObject,
          coinTypeIn,
          coinTypeOut,
          route.swapXtoY,
          route.poolId,
          tx
        );
      }
    }
    const nextRoute = path.info.routes[routeIndex + 1];
    if (nextRoute) {
      const {
        coinY,
        fee: feeTier,
        sqrtPrice: sqrtPriceLimit,
        swapXtoY,
        minSqrtPriceHasLiquidity,
        maxSqrtPriceHasLiquidity,
      } = nextRoute;
      // console.log('sqrtPriceLimit', sqrtPriceLimit.toString(), route.sqrtPrice.toString());
      let sqrtPrice = "0";
      if (sqrtPriceLimit && swapXtoY !== undefined) {
        const rate = nextRoute?.swapXtoY
          ? BigNumber(1).minus(0.15)
          : BigNumber(1).plus(0.15);
        const sqrtPriceCalc = !!swapXtoY
          ? BigNumber.max(
              rate.multipliedBy(sqrtPriceLimit).toFixed(0),
              minSqrtPriceHasLiquidity
            )
          : BigNumber.min(
              rate.multipliedBy(sqrtPriceLimit).toFixed(0),
              maxSqrtPriceHasLiquidity
            );
        sqrtPrice = (
          BigNumber(sqrtPriceCalc).isGreaterThan(MAX_SQRT_PRICE)
            ? MAX_SQRT_PRICE
            : BigNumber(sqrtPriceCalc).isLessThan(MIN_SQRT_PRICE)
            ? MIN_SQRT_PRICE
            : sqrtPriceCalc
        ).toString();
      }
      // console.log("nextRoute", nextRoute);
      await NextRouting(
        coinTypeIn,
        coinTypeOut,
        coinY.coinType,
        routeObject,
        feeTier ?? 0,
        +sqrtPrice,
        tx
      );
    }
    return { routeObject, tx };
  } catch (error) {
    console.log("buildTxRouteFlowX ERROR", error);
  }
};
