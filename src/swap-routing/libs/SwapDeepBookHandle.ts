import { TransactionResult, Transaction } from "@mysten/sui/transactions";
import { CLOCK_ID, MODULE, SWAP_V3 } from "../../constants";

export const SwapDeepBookHandle = async (
  routeObject: any,
  coinInType: string,
  coinOutType: string,
  swapXtoY: boolean,
  poolId: string,
  lotSize: string,
  txb?: Transaction
): Promise<TransactionResult> => {
  try {
    let tx = new Transaction();
    if (txb) tx = txb;
    return tx.moveCall({
      target: `${SWAP_V3.UNIVERSAL_ROUTER}::${MODULE.UNIVERSAL_ROUTER}::${
        swapXtoY
          ? "deepbook_swap_exact_base_for_quote"
          : "deepbook_swap_exact_quote_for_base"
      }`,
      typeArguments: [
        swapXtoY ? coinInType : coinOutType,
        swapXtoY ? coinOutType : coinInType,
      ],
      arguments: swapXtoY ? [
        tx.object(SWAP_V3.UNIVERSAL_TREASURY),
        routeObject,
        tx.object(poolId),
        tx.pure.u64(lotSize),
        tx.object(CLOCK_ID),
      ] : [
        tx.object(SWAP_V3.UNIVERSAL_TREASURY),
        routeObject,
        tx.object(poolId),
        tx.object(CLOCK_ID),
      ],
    });
  } catch (error) {
    console.log("SwapDeepBookHandle ERROR", error);
  }
};

// export const SwapDeepBookHandleV2 = async (
//   routeObject: any,
//   coinInType: string,
//   coinOutType: string,
//   swapXtoY: boolean,
//   poolId: string,
//   lootSize: string | number,
//   txb?: TransactionBlock
// ): Promise<TransactionResult> => {
//   try {
//     let tx = new TransactionBlock();
//     if (txb) tx = txb;
//     return tx.moveCall({
//       target: `${SWAP_V3.UNIVERSAL_ROUTER}::${MODULE.UNIVERSAL_ROUTER}::${
//         swapXtoY
//           ? "deepbook_swap_exact_base_for_quote_v2"
//           : "deepbook_swap_exact_quote_for_base_v2"
//       }`,
//       typeArguments: [
//         swapXtoY ? coinInType : coinOutType,
//         swapXtoY ? coinOutType : coinInType,
//       ],
//       arguments: [
//         tx.object(SWAP_V3.UNIVERSAL_TREASURY),
//         routeObject,
//         tx.object(poolId),
//         tx.pure(lootSize.toString()),
//         tx.object(CLOCK_ID),
//       ],
//     });
//   } catch (error) {
//     console.log("SwapDeepBookHandle2 ERROR", error);
//   }
// };
