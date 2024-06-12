import { TransactionResult, Transaction } from "@mysten/sui/transactions";
import { MODULE, SWAP_V3 } from "../../constants";

export const SwapKriyaHandle = async (
  routeObject: any,
  coinInType: string,
  coinOutType: string,
  swapXtoY: boolean,
  poolId: string,
  txb?: Transaction
): Promise<TransactionResult> => {
  let tx = new Transaction();
  if (txb) tx = txb;
  return tx.moveCall({
    target: `${SWAP_V3.UNIVERSAL_ROUTER}::${MODULE.UNIVERSAL_ROUTER}::${
      swapXtoY ? "kriya_swap_exact_x_to_y" : "kriya_swap_exact_y_to_x"
    }`,
    typeArguments: [
      swapXtoY ? coinInType : coinOutType,
      swapXtoY ? coinOutType : coinInType,
    ],
    arguments: [routeObject, tx.object(poolId)],
  });
};
