import { TransactionArgument, TransactionBlock } from "@mysten/sui.js";
import { MODULE, SWAP_V3 } from "../../constants";

export const InitPath = async (
  coinInType: string,
  coinOutType: string,
  coinInObject: any,
  feeTier: number,
  sqrtPriceLimit: string,
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
      target: `${SWAP_V3.UNIVERSAL_ROUTER}::${MODULE.UNIVERSAL_ROUTER}::initialize_path`,
      typeArguments: [coinInType, coinOutType],
      arguments: [coinInObject, tx.pure(feeTier), tx.pure(+sqrtPriceLimit)],
    });
  } catch (error) {
    console.log("InitPath ERROR", error);
  }
};
