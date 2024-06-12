import { Transaction } from "@mysten/sui/transactions";
import { IFeeTierV3 } from "../../types";
import { TickMath } from "./math";
import { ADD_LIQUIDITY_V3, CLOCK_ID, FUNCTION, MODULE } from "../../constants";

export const getTxCreatePoolLiquidV3 = (
  coinXType: string,
  coinYType: string,
  currentTick: number,
  fee: IFeeTierV3,
  tx: Transaction
) => {
  return tx.moveCall({
    target: `${ADD_LIQUIDITY_V3.CLMM_PACKAGE}::${MODULE.POOL_MANAGER}::${FUNCTION.CREATE_INITIAL_POOL}`,
    typeArguments: [coinXType, coinYType],
    arguments: [
      tx.object(ADD_LIQUIDITY_V3.POOL_REGISTRY_OBJ),
      tx.pure.u64(fee.valueDecimal),
      tx.pure.u128(TickMath.tickIndexToSqrtPriceX64(currentTick).toString()),
      tx.object(ADD_LIQUIDITY_V3.VERSIONED_OBJ),
      tx.object(CLOCK_ID),
    ],
  });
};
