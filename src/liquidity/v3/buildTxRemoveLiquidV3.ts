import { Transaction } from "@mysten/sui/transactions";
import { Amount, CoinMetadata, IPoolRewardV3 } from "../../types";
import { getTxDecreasePositionLiquidV3 } from "./getTxDecreasePositionLiquidV3";
import { BigNumb } from "../../BigNumber";
import { getTxCollectLiquidV3 } from "./getTxCollectLiquidV3";
import { getTxCollectRewardLiquidV3 } from "./getTxCollectRewardLiquidV3";
import { getTxClosePositionLiquidV3 } from "./getTxClosePositionLiquidV3";
import { getDecimalAmount } from "../../utils";

export const buildTxRemoveLiquidV3 = async (
  coinX: CoinMetadata,
  coinY: CoinMetadata,
  positionObjectId: string,
  liquid2Remove: string,
  amountX: string,
  amountY: string,
  account: string,
  poolReward: IPoolRewardV3[],
  removeAll?: boolean
): Promise<Transaction> => {
  let tx = new Transaction();
  const amountXDecimal = BigNumb(getDecimalAmount(amountX, coinX.decimals))
    .integerValue()
    .toString();
  const amountYDecimal = BigNumb(getDecimalAmount(amountY, coinY.decimals))
    .integerValue()
    .toString();
  const txb = getTxDecreasePositionLiquidV3(
    coinX,
    coinY,
    positionObjectId,
    liquid2Remove,
    amountXDecimal,
    amountYDecimal,
    tx
  );
  tx = txb;
  const txc = await getTxCollectLiquidV3(
    coinX,
    coinY,
    positionObjectId,
    account,
    tx,
    removeAll || BigNumb(amountX).eq(0) ? null : amountXDecimal,
    removeAll || BigNumb(amountY).eq(0) ? null : amountYDecimal
  );
  tx = txc;
  if (poolReward.length > 0) {
    poolReward.forEach((item) => {
      const rewardType = [coinX.type, coinY.type, item.coin.type];
      getTxCollectRewardLiquidV3(rewardType, positionObjectId, account, tx);
    });
  }
  if (removeAll) {
    const txd = getTxClosePositionLiquidV3(positionObjectId, tx);
    tx = txd;
  }
  return tx;
};
