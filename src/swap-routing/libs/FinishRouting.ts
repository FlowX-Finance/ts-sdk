import { TransactionArgument, TransactionBlock } from "@mysten/sui.js";
import { MODULE, SWAP_V3 } from "../../constants";

export const FinishRouting = async (
  coinInType: string,
  coinOutType: string,
  lastRouteCoinInType: string,
  tradeObject: any,
  routeObject: any,
  txb?: TransactionBlock
): Promise<TransactionArgument & TransactionArgument[]> => {
  try {
    let tx = new TransactionBlock();
    if (txb) tx = txb;
    // console.log(
    //   "InitPath",
    //   coinInType,
    //   coinOutType,
    //   feeTier,
    //   sqrtPriceLimit,
    //   coinInObject
    // );
    return tx.moveCall({
      target: `${SWAP_V3.UNIVERSAL_ROUTER}::${MODULE.UNIVERSAL_ROUTER}::finish_routing`,
      typeArguments: [coinInType, coinOutType, lastRouteCoinInType],
      arguments: [tradeObject, routeObject],
    });
  } catch (error) {
    console.log("FinishRouting ERROR", error);
  }
};
