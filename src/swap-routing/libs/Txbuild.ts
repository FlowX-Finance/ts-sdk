import { BigNumber } from "../../BigNumber";
import Lodash from "../../lodash";
import { ISmartPathV3 } from "../../types";
import { standardizeType } from "../../utils";
import { getSplitCoinForTx } from "./GetSplitCoinForTx";
import { routeTxBuild } from "./RouteTxBuild";
import { SettleRouting } from "./SettleRouting";

export const txBuild = async (
  listSmartPath: ISmartPathV3[],
  slippage: number,
  amountIn: string,
  amountOut: string,
  coinInType: string,
  account: string,
  pathsAmountOut?: string[],
  inspecTransaction?: boolean
) => {
  // console.log(
  //   "AA",
  //   listSmartPath,
  //   slippage,
  //   amountIn,
  //   amountOut,
  //   inspecTransaction,
  //   coinInType,
  //   inspecTransaction
  // );
  if (!account) return;
  let rates = Lodash.map(listSmartPath, "rate");
  // console.log('AAAA', listSmartRoute, amountIn, coinIn.symbol, coinIn.decimals);
  const listAmountInDecimal = listSmartPath.map((i) =>
    i.info.amountIn.toFixed(0)
  );
  // console.log('listSmartRoute', listSmartRoute);
  let { tx, coinData } = await getSplitCoinForTx(
    account,
    amountIn,
    listAmountInDecimal,
    coinInType,
    undefined,
    inspecTransaction
  );
  // console.log("JJJJ", inspecTransaction, coinInType);
  for (const rateIndex in rates) {
    let routeObject: any = null,
      path = listSmartPath[rateIndex],
      coinObjectIn = coinData[rateIndex];
    for (const [routeIndex] of path.info.routes.entries()) {
      // console.log("routeIndex", routeIndex);
      const route = path.info.routes[routeIndex];
      // console.log("route", route);
      const { routeObject: tempObject, tx: tempTx } = await routeTxBuild(
        route,
        !pathsAmountOut ? 1 : slippage,
        tx,
        routeObject,
        coinObjectIn,
        routeIndex,
        path,
        !pathsAmountOut
          ? +BigNumber(amountOut).toFixed(0)
          : +pathsAmountOut[rateIndex]
      );
      routeObject = tempObject;
      tx = tempTx;
      if (routeIndex === path.info.routes.length - 1) {
        // console.log('ok');
        await SettleRouting(
          standardizeType(route.coinX.coinType),
          standardizeType(route.coinY.coinType),
          routeObject,
          account,
          tx
        );
      }
    }
  }
  return tx;
};
