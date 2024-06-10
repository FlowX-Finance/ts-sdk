import { TransactionBlock } from "@mysten/sui.js";
import { BigNumber } from "../../BigNumber";
import Lodash from "../../lodash";
import { ISmartPathV3, ITxBuild } from "../../types";
import { estimateDealine, standardizeType } from "../../utils";
import { FinishRouting } from "./FinishRouting";
import { getSplitCoinForTx } from "./GetSplitCoinForTx";
import { InitTrade } from "./InitTrade";
import { routeTxBuild } from "./RouteTxBuild";
import { SettleRouting } from "./SettleRouting";
import { StartRouting } from "./StartRouting";
import { handleGetCoinAmount } from "../../swap/libs/handleGetCoinAmount";

export const txBuild = async ({
  listSmartPath,
  slippage,
  tokenIn,
  tokenOut,
  account,
  partnerFee,
  inspecTransaction,
}: ITxBuild) => {
  if (!account) return;
  let rates = Lodash.map(listSmartPath, "rate");
  let { tx, coin: coinData } = await handleGetCoinAmount(
    tokenIn.amount,
    account,
    tokenIn.type
  );
  const { tradeObject } = await InitTrade(
    tokenIn.type,
    tokenOut.type,
    coinData,
    tokenOut.amount,
    inspecTransaction ? 1 : slippage,
    estimateDealine(),
    listSmartPath.map((i) => +i.info.amountIn.toFixed()),
    partnerFee,
    tx
  );
  for (const [rateIndex] of rates.entries()) {
    let routeObject: any = null,
      path = listSmartPath[rateIndex];
    for (const [routeIndex] of path.info.routes.entries()) {
      const route = path.info.routes[routeIndex];
      const { routeObject: tempObject, tx: tempTx } = await routeTxBuild(
        route,
        tx,
        routeObject,
        routeIndex,
        path,
        tokenIn.type,
        tokenOut.type,
        tradeObject
      );
      routeObject = tempObject;
      tx = tempTx;
    }
    if (rateIndex === rates.length - 1) {
      await SettleRouting(
        standardizeType(tokenIn.type),
        standardizeType(tokenOut.type),
        tradeObject,
        account,
        tx
      );
    }
  }
  return tx;
};
