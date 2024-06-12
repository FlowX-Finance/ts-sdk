import { Transaction, TransactionArgument, TransactionResult } from "@mysten/sui/transactions";
import { MODULE, SWAP_V3 } from "../../constants";

export const FinishRouting = async (
  coinInType: string,
  coinOutType: string,
  lastRouteCoinInType: string,
  tradeObject: TransactionArgument,
  routeObject: TransactionArgument,
  txb?: Transaction
): Promise<TransactionResult> => {
  try {
    let tx = new Transaction();
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
