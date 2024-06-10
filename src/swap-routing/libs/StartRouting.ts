import { TransactionArgument, TransactionBlock } from "@mysten/sui.js";
import { MODULE, SWAP_V3 } from "../../constants";

export const StartRouting = async (
  coinInType: string,
  coinOutType: string,
  firstRouteCoinOutType: string,
  tradeObject: any,
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
      target: `${SWAP_V3.UNIVERSAL_ROUTER}::${MODULE.UNIVERSAL_ROUTER}::start_routing`,
      typeArguments: [coinInType, coinOutType, firstRouteCoinOutType],
      arguments: [tradeObject],
    });
  } catch (error) {
    console.log("StartRouting ERROR", error);
  }
};
