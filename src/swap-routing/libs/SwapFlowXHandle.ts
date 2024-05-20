import { TransactionArgument, TransactionBlock } from "@mysten/sui.js";
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
  txb?: TransactionBlock
): Promise<TransactionArgument & TransactionArgument[]> => {
  let tx = new TransactionBlock();
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
  txb?: TransactionBlock
): Promise<TransactionArgument & TransactionArgument[]> => {
  let tx = new TransactionBlock();
  if (txb) tx = txb;
  return tx.moveCall({
    target: `${SWAP_V3.UNIVERSAL_ROUTER}::${MODULE.UNIVERSAL_ROUTER}::${FUNCTION.FLOWX_SWAP_CLMM}`,
    typeArguments: [coinInType, coinOutType],
    arguments: [
      routeObject,
      tx.object(ADD_LIQUIDITY_V3.POOL_REGISTRY_OBJ),
      tx.object(ADD_LIQUIDITY_V3.VERSIONED_OBJ),
      tx.object(CLOCK_ID),
    ],
  });
};
