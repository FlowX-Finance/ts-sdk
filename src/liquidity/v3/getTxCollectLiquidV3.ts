import { TransactionBlock } from "@mysten/sui.js";
import {
  ADD_LIQUIDITY_V3,
  CLOCK_ID,
  FUNCTION,
  MAXU64,
  MODULE,
} from "../../constants";
import { CoinMetadata } from "../../types";
//Collect Liquid incase user proceed transaction remove on chain using contract instead of using UI
export const getTxCollectLiquidV3 = async (
  coinX: CoinMetadata,
  coinY: CoinMetadata,
  positionObjectId: string,
  account: string,
  inheritTx?: TransactionBlock,
  amountX?: string,
  amountY?: string
) => {
  const tx = inheritTx ?? new TransactionBlock();
  const [coinXOut, coinYOut] = tx.moveCall({
    target: `${ADD_LIQUIDITY_V3.CLMM_PACKAGE}::${MODULE.POSITION_MANAGER}::${FUNCTION.COLLECT}`,
    typeArguments: [coinX.type, coinY.type],
    arguments: [
      tx.object(ADD_LIQUIDITY_V3.POOL_REGISTRY_OBJ),
      tx.object(positionObjectId),
      tx.pure(amountX ?? MAXU64),
      tx.pure(amountY ?? MAXU64),
      tx.object(ADD_LIQUIDITY_V3.VERSIONED_OBJ),
      tx.object(CLOCK_ID),
    ],
  });
  tx.transferObjects([coinXOut, coinYOut], tx.pure(account));
  return tx;
};
