import { BigNumb } from "../../BigNumber";
import { LP_DECIMAL } from "../../constants";
import { CoinMetadata, ILiquidity, IPoolInfos } from "../../types";
import {
  calculateReceiveAmount,
  getBalanceAmount,
  getBasicData,
  sortData,
} from "../../utils";

export const getLiquidity = async (
  account: string,
  sortType?: string, //lpValue, userLpBalance, totalLpSupply
  sortOrder?: string // ascending , descending
): Promise<ILiquidity[]> => {
  try {
    let arr: ILiquidity[] = [];
    const {
      coins,
      coinBalances,
      poolInfos: rawPoolInfo,
    } = await getBasicData(account);
    const poolInfos = rawPoolInfo.map((pool: IPoolInfos) => ({
      ...pool,
      coinX: coins.find((item: CoinMetadata) => item.type === pool.coinX),
      coinY: coins.find((item: CoinMetadata) => item.type === pool.coinY),
    }));
    for (let i = 0; i < coinBalances.length; i++) {
      const idx = poolInfos.findIndex(
        (item) => item.lpType === coinBalances[i].type
      );
      if (idx > -1) {
        const poolInfo = poolInfos[idx];
        let lpValue = "0";
        const {
          objectId,
          reserveX,
          reserveY,
          totalLpSupply,
          coinX,
          coinY,
          lpType,
          feeRate,
        } = poolInfo;
        const { amountX, amountY } = calculateReceiveAmount(
          {
            objectId,
            reserveX,
            reserveY,
            totalLpSupply,
            coinX: coinX.type,
            coinY: coinY.type,
            lpType,
            feeRate,
          },
          poolInfo.coinX,
          poolInfo.coinY
        );
        const amountXValueInUsd = BigNumb(amountX).multipliedBy(
          coinX.derivedPriceInUSD
        );
        const amountYValueInUsd = BigNumb(amountY).multipliedBy(
          coinX.derivedPriceInUSD
        );
        const lpPrice = amountXValueInUsd.plus(amountYValueInUsd).toFixed();
        lpValue = BigNumb(lpPrice)
          .multipliedBy(getBalanceAmount(coinBalances[i].balance, LP_DECIMAL))
          .toFixed();
        if (+coinBalances[i].balance > 0) {
          arr.push({
            ...poolInfo,
            userLpBalance: coinBalances[i].balance + "",
            apr: poolInfo.stats.aprPerformance7D ?? "0.00",
            lpValue,
            coinX,
            coinY,
          });
        }
      }
    }
    return sortData(arr, sortType, sortOrder);
  } catch (error) {
    throw error;
  }
};
