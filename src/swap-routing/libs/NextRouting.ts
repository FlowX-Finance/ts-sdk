import { Transaction } from "@mysten/sui/transactions";
import { MODULE, SWAP_V3 } from "../../constants";

export const NextRouting = async (
  coinInType: string,
  coinOutType: string,
  nextRouteCoinOutType: string,
  routeObject: any,
  txb?: Transaction
) => {
  try {
    let tx = new Transaction();
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
