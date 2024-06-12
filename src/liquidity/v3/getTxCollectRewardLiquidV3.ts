import { Transaction } from "@mysten/sui/transactions";
import {
  ADD_LIQUIDITY_V3,
  CLOCK_ID,
  FUNCTION,
  MAXU64,
  MODULE,
} from "../../constants";

export const getTxCollectRewardLiquidV3 = async (
  rewardType: string[],
  positionObjectId: string,
  account: string,
  inheritTx?: Transaction
) => {
  const tx = inheritTx ?? new Transaction();
  const [coinReward] = tx.moveCall({
    target: `${ADD_LIQUIDITY_V3.CLMM_PACKAGE}::${MODULE.POSITION_MANAGER}::${FUNCTION.COLLECT_POOL_REWARD}`,
    typeArguments: rewardType,
    arguments: [
      tx.object(ADD_LIQUIDITY_V3.POOL_REGISTRY_OBJ),
      tx.object(positionObjectId),
      tx.pure.u64(MAXU64),
      tx.object(ADD_LIQUIDITY_V3.VERSIONED_OBJ),
      tx.object(CLOCK_ID),
    ],
  });
  return tx.transferObjects([coinReward], account);
};
