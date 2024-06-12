import { TransactionResult, Transaction } from "@mysten/sui/transactions";
import { MODULE, SWAP_V3 } from "../../constants";

export const InitPath = async (
  coinInType: string,
  coinOutType: string,
  coinInObject: any,
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
      target: `${SWAP_V3.UNIVERSAL_ROUTER}::${MODULE.UNIVERSAL_ROUTER}::initialize_path`,
      typeArguments: [coinInType, coinOutType],
      arguments: [coinInObject],
    });
  } catch (error) {
    console.log("InitPath ERROR", error);
  }
};
