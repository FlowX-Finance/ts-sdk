import { TransactionBlock } from "@mysten/sui.js";
import { IFeeTierV3 } from "../../types";
import { ADD_LIQUIDITY_V3, FUNCTION, MODULE } from "../../constants";

export const getTxOpenPositionLiquidV3 = async (
  fee: IFeeTierV3,
  coinXType: string,
  coinYType: string,
  lowerTickIndex: any,
  upperTickIndex: any,
  inheritTx?: TransactionBlock
) => {
  const tx = inheritTx ?? new TransactionBlock();
  return tx.moveCall({
    target: `${ADD_LIQUIDITY_V3.CLMM_PACKAGE}::${MODULE.POSITION_MANAGER}::${FUNCTION.OPEN_POSITION}`,
    typeArguments: [coinXType, coinYType],
    arguments: [
      tx.object(ADD_LIQUIDITY_V3.POSITION_REGISTRY_OBJ),
      tx.object(ADD_LIQUIDITY_V3.POOL_REGISTRY_OBJ),
      tx.pure(fee.valueDecimal),
      lowerTickIndex,
      upperTickIndex,
      tx.object(ADD_LIQUIDITY_V3.VERSIONED_OBJ),
    ],
  });
};
