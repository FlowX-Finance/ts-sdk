import { POSITION_LIQUID_V3_TYPE, provider } from "../../constants";

import { BigNumb } from "../../BigNumber";
import { Transaction } from "@mysten/sui/transactions";
import { ClmmPoolUtil, TickMath } from "./math";
import { asIntN } from "./utils";
import { BN } from "bn.js";
import { getTxCollectRewardLiquidV3 } from "./getTxCollectRewardLiquidV3";
import { getTxCollectLiquidV3 } from "./getTxCollectLiquidV3";
import {
  getBalanceAmount,
  getCoinsFlowX,
  getFullyMultiObject,
  getFullyOwnedObjects,
  standardizeType,
} from "../../utils";
import { CoinMetadata, ILpV3Rw, IUserLiquidV3Position } from "../../types";

export const getUserLiquidityV3 = async (
  account: string
): Promise<IUserLiquidV3Position[]> => {
  try {
    const coins: CoinMetadata[] = await getCoinsFlowX();
    const ownedPosition = await getFullyOwnedObjects(
      account,
      { showContent: true },
      { StructType: POSITION_LIQUID_V3_TYPE }
    );
    const listPool = [
      ...new Set(
        ownedPosition.map((i) => (i.data.content as any)?.fields?.pool_id)
      ),
    ];
    const poolInfos = await getFullyMultiObject(listPool);
    let positionInfo: IUserLiquidV3Position[] = [];
    const tx = new Transaction();
    for (let i = 0; i < ownedPosition.length; i++) {
      const { content, objectId } = ownedPosition[i].data;
      const {
        coin_type_x,
        coin_type_y,
        tick_lower_index,
        tick_upper_index,
        liquidity,
        pool_id,
      } = (content as any).fields;
      const {
        sqrt_price,
        liquidity: poolLiquid,
        swap_fee_rate,
        tick_index,
        reserve_x,
        reserve_y,
        id,
      } = (
        poolInfos.find((item) => item.data.objectId === pool_id).data
          .content as any
      ).fields;
      const reward_infos =
        (
          poolInfos.find((item) => item.data.objectId === pool_id).data
            .content as any
        ).fields?.reward_infos ?? [];
      const coinX = coins.find(
          (item) => item.type === standardizeType(coin_type_x?.fields?.name)
        ),
        coinY = coins.find(
          (item) => item.type === standardizeType(coin_type_y?.fields?.name)
        ),
        minPrice = {
          price: TickMath.tickIndexToPrice(
            asIntN(tick_lower_index.fields["bits"]),
            coinX?.decimals,
            coinY?.decimals
          ).toString(),
          sqrtPrice: TickMath.tickIndexToSqrtPriceX64(
            asIntN(tick_lower_index.fields["bits"])
          ).toString(),
          tickIndex: asIntN(tick_lower_index.fields["bits"]),
        },
        maxPrice = {
          price: TickMath.tickIndexToPrice(
            asIntN(tick_upper_index.fields["bits"]),
            coinX?.decimals,
            coinY?.decimals
          ).toString(),
          sqrtPrice: TickMath.tickIndexToSqrtPriceX64(
            asIntN(tick_upper_index.fields["bits"])
          ).toString(),
          tickIndex: asIntN(tick_upper_index.fields["bits"]),
        },
        currentPrice = {
          price:
            coinX && coinY
              ? TickMath.sqrtPriceX64ToPrice(
                  new BN(sqrt_price),
                  coinX.decimals,
                  coinY.decimals
                ).toString()
              : "",
          sqrtPrice: sqrt_price,
          tickIndex: asIntN(tick_index?.fields["bits"]),
        },
        coinPortion = ClmmPoolUtil.getCoinAmountFromLiquidity(
          new BN(liquidity),
          new BN(sqrt_price),
          new BN(minPrice.sqrtPrice),
          new BN(maxPrice.sqrtPrice),
          true
        ),
        currentPortion = {
          coinX: {
            amount: coinPortion.coinA.toString(),
            amountInUsd: BigNumb(
              getBalanceAmount(
                coinPortion.coinA.toString(),
                coinX?.decimals
              ).toFixed()
            )
              .multipliedBy(coinX.derivedPriceInUSD)
              .toFixed(),
          },
          coinY: {
            amount: coinPortion.coinB.toString(),
            amountInUsd: BigNumb(
              getBalanceAmount(
                coinPortion.coinB.toString(),
                coinY?.decimals
              ).toFixed()
            )
              .multipliedBy(coinY.derivedPriceInUSD)
              .toFixed(),
          },
        };
      //get user reward
      const ownedPosdata: any = (ownedPosition[i].data?.content as any)?.fields;
      let reward: ILpV3Rw = { rewardX: "0", rewardY: "0" };
      reward_infos.forEach((item: any) => {
        const rewardTypes: string[] = [
          coinX?.type,
          coinY?.type,
          standardizeType(item?.fields?.reward_coin_type?.fields?.name),
        ];
        getTxCollectRewardLiquidV3(
          rewardTypes,
          ownedPosdata.id["id"],
          account,
          tx
        );
      });
      if (+ownedPosdata?.liquidity > 0) {
        getTxCollectLiquidV3(coinX, coinY, ownedPosdata.id["id"], account, tx);
      }
      positionInfo.push({
        coinX,
        coinY,
        currentPortion,
        positionLiquid: liquidity,
        positionId: objectId,
        minPrice,
        maxPrice,
        poolLiquid: poolLiquid,
        feeRate: BigNumb(swap_fee_rate).dividedBy(10000).toFixed(),
        currentPrice,
        reward,
        apr: "0",
        id: ownedPosdata.id["id"],
        poolReward: [],
      });
    }
    if (positionInfo.length > 0) {
      const result = await provider.devInspectTransactionBlock({
        sender: account,
        transactionBlock: tx,
      });
      const collectEvent = result.events.filter(
        (i) =>
          i.type.includes("::pool::Collect") &&
          !i.type.includes("::pool::CollectPoolReward")
      );
      const collectPoolReward = result.events.filter((i) =>
        i.type.includes("::pool::CollectPoolReward")
      );
      for (let i = 0; i < positionInfo.length; i++) {
        const index = collectEvent.findIndex(
          (item) => (item.parsedJson as any).position_id === positionInfo[i].id
        );
        const incentiveReward = collectPoolReward.filter(
          (item) => (item?.parsedJson as any)?.position_id === positionInfo[i].id
        );
        if (index > -1) {
          positionInfo[i].reward = {
            rewardX: (collectEvent[index].parsedJson as any).amount_x,
            rewardY: (collectEvent[index].parsedJson as any).amount_y,
          };
        }
        if (incentiveReward.length > 0) {
          positionInfo[i].poolReward = incentiveReward.map((item) => {
            return {
              amount: (item.parsedJson as any).amount,
              coin: coins.find(
                (coin) =>
                  standardizeType(coin.type) ===
                  standardizeType((item.parsedJson as any).reward_coin_type.name)
              ),
            };
          });
        }
      }
    }
    let sortedData = positionInfo.sort(
      (a: IUserLiquidV3Position, b: IUserLiquidV3Position) => {
        let liquidB = +b.positionLiquid;
        let liquidA = +a.positionLiquid;
        return liquidB - liquidA;
      }
    );
    // console.log('positionInfo', positionInfo);
    return sortedData;
  } catch (err) {
    console.log("getPositionData ERROR", err);
  }
};
