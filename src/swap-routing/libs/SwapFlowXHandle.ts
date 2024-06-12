import { TransactionResult, Transaction } from "@mysten/sui/transactions";
import {
  ADD_LIQUIDITY_V3,
  CONTAINER_OBJECT_ID,
  FUNCTION,
  MODULE,
  SWAP_V3,
} from "../../constants";
import { CLOCK_ID } from "../../constants";

export const SwapV2Handle = async (
  routeObject: any,
  coinInType: string,
  coinOutType: string,
  txb?: Transaction
): Promise<TransactionResult> => {
  let tx = new Transaction();
  if (txb) tx = txb;
  return tx.moveCall({
    target: `${SWAP_V3.UNIVERSAL_ROUTER}::${MODULE.UNIVERSAL_ROUTER}::${FUNCTION.FLOWX_SWAP}`,
    typeArguments: [coinInType, coinOutType],
    arguments: [routeObject, tx.object(CONTAINER_OBJECT_ID)],
  });
};
export const SwapV3Handle = async (
  routeObject: any,
  coinInType: string,
  coinOutType: string,
  feeRate: string,
  sqrtPriceLimit: string,
  txb?: Transaction
): Promise<TransactionResult> => {
  let tx = new Transaction();
  if (txb) tx = txb;
  return tx.moveCall({
    target: `${SWAP_V3.UNIVERSAL_ROUTER}::${MODULE.UNIVERSAL_ROUTER}::${FUNCTION.FLOWX_SWAP_CLMM}`,
    typeArguments: [coinInType, coinOutType],
    arguments: [
      routeObject,
      tx.object(ADD_LIQUIDITY_V3.POOL_REGISTRY_OBJ),
      tx.pure.u64(feeRate),
      tx.pure.u128(sqrtPriceLimit),
      tx.object(ADD_LIQUIDITY_V3.VERSIONED_OBJ),
      tx.object(CLOCK_ID),
    ],
  });
};
