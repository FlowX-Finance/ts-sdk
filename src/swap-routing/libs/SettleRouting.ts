import { TransactionArgument, TransactionBlock } from "@mysten/sui.js";
import { CLOCK_ID, FUNCTION, MODULE, SWAP_V3 } from "../../constants";

export const SettleRouting = async (
  coinInType: string,
  coinOutType: string,
  routeObject: any,
  account: string,
  txb?: TransactionBlock
): Promise<TransactionArgument & TransactionArgument[]> => {
  try {
    let tx = new TransactionBlock();
    if (txb) tx = txb;
    // console.log("SettleRouting", coinInType, coinOutType);
    const [coinYObject] = tx.moveCall({
      target: `${SWAP_V3.UNIVERSAL_ROUTER}::${MODULE.UNIVERSAL_ROUTER}::${FUNCTION.SETTLE_ROUTING_V3}`,
      typeArguments: [coinInType, coinOutType],
      arguments: [
        tx.object(SWAP_V3.UNIVERSAL_TREASURY),
        routeObject,
        tx.object(CLOCK_ID),
      ],
    });
    return tx.transferObjects([coinYObject], tx.pure(account));
  } catch (error) {
    console.log("SettleRouting ERROR", error);
  }
};
