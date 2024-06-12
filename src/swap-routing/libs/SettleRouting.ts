import { TransactionResult, Transaction } from "@mysten/sui/transactions";
import { CLOCK_ID, FUNCTION, MODULE, SWAP_V3 } from "../../constants";

export const SettleRouting = async (
  coinInType: string,
  coinOutType: string,
  tradeObject: any,
  account: string,
  txb?: Transaction
): Promise<TransactionResult> => {
  try {
    let tx = new Transaction();
    if (txb) tx = txb;
    // console.log("SettleRouting", coinInType, coinOutType);
    const [coinYObject] = tx.moveCall({
      target: `${SWAP_V3.UNIVERSAL_ROUTER}::${MODULE.UNIVERSAL_ROUTER}::${FUNCTION.SETTLE_ROUTING_V3}`,
      typeArguments: [coinInType, coinOutType],
      arguments: [
        tx.object(SWAP_V3.UNIVERSAL_TREASURY),
        tx.object(SWAP_V3.PARTNER_REGISTRY),
        tradeObject,
        tx.object(CLOCK_ID),
      ],
    });
    return tx.transferObjects([coinYObject], account);
  } catch (error) {
    console.log("SettleRouting ERROR", error);
  }
};
