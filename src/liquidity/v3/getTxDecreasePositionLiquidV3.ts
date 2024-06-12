import { Transaction } from "@mysten/sui/transactions";
import { ADD_LIQUIDITY_V3, CLOCK_ID, FUNCTION, MODULE } from "../../constants";
import { CoinMetadata } from "../../types";

export const getTxDecreasePositionLiquidV3 = (
  coinX: CoinMetadata,
  coinY: CoinMetadata,
  positionObjectId: string,
  liquid2Remove: string,
  amountX: string,
  amountY: string,
  inheritTx?: Transaction
) => {
  const tx = inheritTx ?? new Transaction();
  tx.moveCall({
    target: `${ADD_LIQUIDITY_V3.CLMM_PACKAGE}::${MODULE.POSITION_MANAGER}::${FUNCTION.DECREASE_LIQUIDITY}`,
    typeArguments: [coinX.type, coinY.type],
    arguments: [
      tx.object(ADD_LIQUIDITY_V3.POOL_REGISTRY_OBJ),
      tx.object(positionObjectId),
      tx.pure.u128(liquid2Remove), //desired amount of liquidity to remove
      tx.pure.u64(amountX), //coinX's portion remove base on amount of remove liquidity
      tx.pure.u64(amountY), //coinY's portion remove base on amount of remove liquidity
      tx.pure.u64(Number.MAX_SAFE_INTEGER),
      tx.object(ADD_LIQUIDITY_V3.VERSIONED_OBJ),
      tx.object(CLOCK_ID),
    ],
  });
  return tx;
};
