import { TransactionBlock } from "@mysten/sui.js";
import { MODULE, SWAP_V3 } from "../../constants";

export const NextRouting = async (
  coinInType: string,
  coinOutType: string,
  nextRouteCoinOutType: string,
  routeObject: any,
  txb?: TransactionBlock
) => {
  try {
    let tx = new TransactionBlock();
    if (txb) tx = txb;
    // console.log(
    //   "NextRouting",
    //   coinInType,
    //   coinOutType,
    //   nextRouteCoinOutType,
    //   nextRouteFeeTier,
    //   nextRouteSqrtPrice
    // );
    tx.moveCall({
      target: `${SWAP_V3.UNIVERSAL_ROUTER}::${MODULE.UNIVERSAL_ROUTER}::next`,
      typeArguments: [coinInType, coinOutType, nextRouteCoinOutType],
      arguments: [routeObject],
    });
  } catch (error) {
    console.log("NextRouting ERROR", error);
  }
};
