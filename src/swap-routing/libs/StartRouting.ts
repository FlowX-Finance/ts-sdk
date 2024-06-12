import { TransactionResult, Transaction } from "@mysten/sui/transactions";
import { MODULE, SWAP_V3 } from "../../constants";

export const StartRouting = async (
  coinInType: string,
  coinOutType: string,
  firstRouteCoinOutType: string,
  tradeObject: any,
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
      target: `${SWAP_V3.UNIVERSAL_ROUTER}::${MODULE.UNIVERSAL_ROUTER}::start_routing`,
      typeArguments: [coinInType, coinOutType, firstRouteCoinOutType],
      arguments: [tradeObject],
    });
  } catch (error) {
    console.log("StartRouting ERROR", error);
  }
};
