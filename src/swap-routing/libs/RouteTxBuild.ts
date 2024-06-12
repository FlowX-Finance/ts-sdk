import { Transaction } from "@mysten/sui/transactions";
import { ISmartPathV3, Route } from "../../types";
import { standardizeType } from "../../utils";
import { BigNumber } from "../../BigNumber";
import { MAX_SQRT_PRICE, MIN_SQRT_PRICE } from "../../constants";
import { SwapV2Handle, SwapV3Handle } from "./SwapFlowXHandle";
import { SwapKriyaHandle } from "./SwapKriyaHandle";
import { SwapCetusHandle } from "./SwapCetusHandle";
import { SwapTurbosHandle } from "./SwapTurbosHandle";
import { SwapAfterMathHandle } from "./SwapAftermathHandle";
import { SwapDeepBookHandle } from "./SwapDeepBookHandle";
import { StartRouting } from "./StartRouting";
import { FinishRouting } from "./FinishRouting";
import { NextRouting } from "./NextRouting";

export const routeTxBuild = async (
  route: Route,
  tx: Transaction,
  routeObject: any,
  routeIndex: number,
  path: ISmartPathV3,
  tokenInType: string,
  tokenOutType: string,
  tradeObject: any
): Promise<any> => {
  try {
    const coinTypeIn = standardizeType(route.coinX.coinType),
      coinTypeOut = standardizeType(route.coinY.coinType);
    // console.log("TTT", coinTypeIn, coinTypeOut);
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
    if (routeIndex === 0) {
      // console.log("AA", tokenInType, tokenOutType, route.coinY.coinType);
      [routeObject] = await StartRouting(
        standardizeType(tokenInType),
        standardizeType(tokenOutType),
        standardizeType(route.coinY.coinType),
        tradeObject,
        tx
      );
    }
    // console.log('XXXXX', routeIndex, path.info.routes);

    const protocol = route.protocol;
    if (protocol === "FLOWX_CLMM" || protocol === "FLOWX") {
      if (route.sqrtPrice) {
        await SwapV3Handle(
          routeObject,
          coinTypeIn,
          coinTypeOut,
          route.fee + "",
          sqrtPrice,
          tx
        );
      } else {
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
        sqrtPrice,
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
        sqrtPrice,
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
      await SwapDeepBookHandle(
        routeObject,
        coinTypeIn,
        coinTypeOut,
        route.swapXtoY,
        route.poolId,
        route.lotSize + "",
        tx
      );
    }
    const nextRoute = path.info.routes[routeIndex + 1];
    if (!nextRoute) {
      await FinishRouting(
        standardizeType(tokenInType),
        standardizeType(tokenOutType),
        standardizeType(coinTypeIn),
        tradeObject,
        routeObject,
        tx
      );
    } else {
      const { coinY } = nextRoute;
      await NextRouting(
        coinTypeIn,
        coinTypeOut,
        coinY.coinType,
        routeObject,
        tx
      );
    }

    return { routeObject, tx };
  } catch (error) {
    console.log("buildTxRoute ERROR", error);
  }
};
