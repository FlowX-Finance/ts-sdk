import { orderBy } from "lodash";
import { ClmmPoolUtil, TickMath } from "./math";
import { POSITION_LIQUID_V3_TYPE, provider } from "../../constants";
import { asIntN } from "./utils";
import { BigNumb } from "../../BigNumber";
import { BN } from "bn.js";
import { TransactionBlock } from "@mysten/sui.js";
import { getTxCollectLiquidV3 } from "./getTxCollectLiquidV3";
import { getTxCollectRewardLiquidV3 } from "./getTxCollectRewardLiquidV3";
import { getClmmPoolDetail } from "./queries/getClmmPoolDetail";
import { getTickClmm } from "./queries/getTickClmm";
import BigNumber from "bignumber.js";
import { getTransactionClmm } from "./queries/getTransactionClmm";
import {
  ChartEntry,
  CoinMetadata,
  IGetClmmPoolDetail,
  ILpV3Unclaimed,
  IPDV3State,
  ITickClmm,
} from "../../types";
import {
  getBalanceAmount,
  getCoinsFlowX,
  getFullyOwnedObjects,
  standardizeType,
} from "../../utils";

const MAX_CALL_DETAIL = 5;
const getDataHistory = async (
  poolId: string,
  positionId?: string,
  account?: string
) => {
  if (!poolId || !positionId || !account) return [];
  const data = await getTransactionClmm({
    poolId,
    positionId,
    size: 50,
    page: 1,
    sender: account,
  });
  return data;
};

const getDataTicks = async (
  id: string,
  coinA: CoinMetadata,
  coinB: CoinMetadata
) => {
  const data: ITickClmm[] = await getTickClmm(id);
  const newData: ChartEntry[] = [];
  data.forEach((item) => {
    newData.push({
      activeLiquidity: 0,
      price0: TickMath.tickIndexToPrice(
        item.tick,
        coinA?.decimals,
        coinB?.decimals
      ).toNumber(),
      liquidityNet: +item.liquidityNet,
      tick: item.tick,
    });
  });
  return orderBy(newData, "tick", "asc");
};

const wait = (miliseconds: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, miliseconds);
  });
};
const getPoolDetail = async (poolId: string): Promise<IGetClmmPoolDetail> => {
  const data = await getClmmPoolDetail(poolId);
  return {
    volume24H: data?.stats?.volume24H ?? "0",
    fee24H: data?.stats?.fee24H ?? "0",
    fee7D: data?.stats?.fee7D ?? "0",
    apr: data?.stats?.apr ?? "0",
  };
};
export const getPositionDetailV3 = async (
  positionObjectId: string,
  account?: string,
  callTime?: number
) => {
  let numberOfCall = callTime ?? 1;
  try {
    const coins: CoinMetadata[] = await getCoinsFlowX();
    //get data of Position
    const posRes = await provider.getObject({
      id: positionObjectId,
      options: { showContent: true },
    });
    const posFields = (posRes.data.content as any).fields;
    // console.log('posFields', posFields);

    //get data of Pool
    const resPool = await provider.getObject({
      id: posFields?.pool_id,
      options: { showContent: true },
    });

    const poolFields = (resPool.data.content as any).fields;
    // console.log('poolFields', poolFields);
    const coinX = coins.find(
        (item) =>
          item.type === standardizeType(posFields?.coin_type_x?.fields?.name)
      ),
      coinY = coins.find(
        (item) =>
          item.type === standardizeType(posFields?.coin_type_y?.fields?.name)
      ),
      minPrice = {
        price: TickMath.tickIndexToPrice(
          asIntN(posFields?.tick_lower_index.fields["bits"]),
          coinX?.decimals,
          coinY?.decimals
        ).toString(),
        sqrtPrice: TickMath.tickIndexToSqrtPriceX64(
          asIntN(posFields?.tick_lower_index.fields["bits"])
        ).toString(),
        tickIndex: asIntN(posFields?.tick_lower_index.fields["bits"]),
      },
      maxPrice = {
        price: TickMath.tickIndexToPrice(
          asIntN(posFields?.tick_upper_index.fields["bits"]),
          coinX?.decimals,
          coinY?.decimals
        ).toString(),
        sqrtPrice: TickMath.tickIndexToSqrtPriceX64(
          asIntN(posFields?.tick_upper_index.fields["bits"])
        ).toString(),
        tickIndex: asIntN(posFields?.tick_upper_index.fields["bits"]),
      },
      currentPrice = {
        price:
          coinX && coinY
            ? TickMath.tickIndexToPrice(
                asIntN(poolFields?.tick_index?.fields["bits"]),
                coinX.decimals,
                coinY.decimals
              ).toString()
            : "",
        sqrtPrice: poolFields?.sqrt_price,
        tickIndex: asIntN(poolFields?.tick_index?.fields["bits"]),
      };
    // console.log('currentPrice', currentPrice, minPrice);
    const coinYPercent = BigNumb(
      BigNumb(currentPrice.tickIndex).minus(minPrice.tickIndex).toFixed()
    )
      .div(BigNumb(maxPrice.tickIndex).minus(minPrice.tickIndex))
      .multipliedBy(100)
      .toFixed();
    const coinXPercent = BigNumb(100).minus(coinYPercent).toFixed();

    const coinPortion = ClmmPoolUtil.getCoinAmountFromLiquidity(
        new BN(posFields?.liquidity),
        new BN(poolFields?.sqrt_price),
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
            .multipliedBy(coinX?.derivedPriceInUSD)
            .toFixed(),
          percentage: coinXPercent,
        },
        coinY: {
          amount: coinPortion.coinB.toString(),
          amountInUsd: BigNumb(
            getBalanceAmount(
              coinPortion.coinB.toString(),
              coinY?.decimals
            ).toFixed()
          )
            .multipliedBy(coinY?.derivedPriceInUSD)
            .toFixed(),
          percentage: coinYPercent,
        },
      };
    let unClaimedLiquid: ILpV3Unclaimed = {
      coinX: {
        amount: "0",
        amountInUsd: "0",
      },
      coinY: {
        amount: "0",
        amountInUsd: "0",
      },
      totalInUsd: "0",
    };
    const { coins_owed_x, coins_owed_y } = posFields;
    if (+posFields?.liquidity === 0) {
      const coinXAmount = getBalanceAmount(
        coins_owed_x,
        coinX?.decimals
      ).toFixed();
      const coinYAmount = getBalanceAmount(
        coins_owed_y,
        coinX?.decimals
      ).toFixed();
      const amountXInUsd = BigNumb(coinXAmount)
        .multipliedBy(coinX?.derivedPriceInUSD)
        .toFixed();
      const amountYInUsd = BigNumb(coinYAmount)
        .multipliedBy(coinY?.derivedPriceInUSD)
        .toFixed();
      unClaimedLiquid = {
        coinX: {
          amount: coinXAmount,
          amountInUsd: amountXInUsd,
        },
        coinY: {
          amount: coinYAmount,
          amountInUsd: amountYInUsd,
        },
        totalInUsd: BigNumb(amountXInUsd).plus(amountYInUsd).toFixed(),
      };
    }
    const liquidX = getBalanceAmount(
      poolFields?.reserve_x ?? 0,
      coinX?.decimals
    ).multipliedBy(coinX?.derivedPriceInUSD);
    const liquidY = getBalanceAmount(
      poolFields?.reserve_y ?? 0,
      coinY?.decimals
    ).multipliedBy(coinY?.derivedPriceInUSD);
    const totalLiquid = liquidX.plus(liquidY).toString();
    let detailData: IPDV3State = {
      coinX,
      coinY,
      currentPortion,
      positionLiquid: posFields?.liquidity,
      minPrice,
      maxPrice,
      liquidity: poolFields?.liquidity,
      locked: poolFields?.locked,
      feeGrowthGlobalX: poolFields?.fee_growth_global_x,
      feeGrowthGlobalY: poolFields?.fee_growth_global_y,
      maxLiquidityPerTick: poolFields?.max_liquidity_per_tick,
      protocolFeeRate: poolFields?.protocol_fee_rate,
      protocolFeeX: poolFields?.protocol_fee_x,
      protocolFeeY: poolFields?.protocol_fee_y,
      sqrtPrice: poolFields?.sqrt_price,
      feeRate: BigNumb(poolFields.swap_fee_rate).dividedBy(10000).toFixed(),
      currentPrice,
      isOwned: false,
      reward: {
        rewardX: "0",
        rewardY: "0",
      },
      unClaimedLiquid,
      id: posFields?.pool_id,
      apr: "0",
      poolReward: [],
      ticks: [],
      history: [],
    };
    if (account) {
      const userOwnedPosition = await getFullyOwnedObjects(
        account,
        { showContent: true },
        { StructType: POSITION_LIQUID_V3_TYPE }
      );
      const ownedPosIdx = userOwnedPosition.findIndex(
        (i) => i.data.objectId === positionObjectId
      );
      if (ownedPosIdx > -1) {
        detailData.isOwned = true;
        const ownedPosdata: any = (
          userOwnedPosition[ownedPosIdx].data?.content as any
        )?.fields;
        //fetch user reward
        // console.log(' detailData.reward', detailData.reward);
        if (+ownedPosdata?.liquidity > 0) {
          const tx = new TransactionBlock();
          getTxCollectLiquidV3(coinX, coinY, positionObjectId, account, tx);
          const reward_infos = poolFields?.reward_infos ?? [];
          reward_infos.forEach((item: any) => {
            const rewardTypes: string[] = [
              coinX?.type,
              coinY?.type,
              item?.fields?.reward_coin_type?.fields?.name,
            ];
            getTxCollectRewardLiquidV3(
              rewardTypes,
              ownedPosdata.id["id"],
              account,
              tx
            );
          });
          // console.log('txb', txb);
          const result = await provider.devInspectTransactionBlock({
            sender: account,
            transactionBlock: tx,
          });
          // console.log('result', result);
          const collectEvent = result.events.find(
              (i) =>
                i.type.includes("::pool::Collect") &&
                !i.type.includes("::pool::CollectPoolReward")
            ),
            collectPoolReward = result.events.filter((i) =>
              i.type.includes("::pool::CollectPoolReward")
            ),
            rewardX = collectEvent.parsedJson.amount_x,
            rewardY = collectEvent.parsedJson.amount_y,
            incentiveReward = collectPoolReward.filter(
              (item) => item?.parsedJson?.position_id === positionObjectId
            );
          detailData.poolReward = incentiveReward.map((item) => {
            return {
              amount: item.parsedJson.amount,
              coin: coins.find(
                (coin) =>
                  standardizeType(coin.type) ===
                  standardizeType(item.parsedJson.reward_coin_type.name)
              ),
            };
          });
          detailData.reward = { rewardX, rewardY };
        }
      }
    }
    // setDetail(detailData);
    numberOfCall = MAX_CALL_DETAIL + 1;
    const [ticks, history, poolInfo] = await Promise.all([
      getDataTicks(posFields?.pool_id, coinX, coinY),
      getDataHistory(posFields?.pool_id, account),
      getPoolDetail(posFields?.pool_id),
    ]);
    const currentTime = Date.now(),
      rewardInfo = poolFields.reward_infos
        .map((item: any) => {
          return {
            ...item?.fields,
            reward_coin: coins.find(
              (coin) =>
                standardizeType(coin.type) ===
                standardizeType(item?.fields?.reward_coin_type?.fields?.name)
            ),
          };
        })
        .filter((item: any) => {
          return (
            currentTime >= +item?.last_update_time * 1000 &&
            currentTime <= +item?.ended_at_seconds * 1000
          );
        }),
      totalReward: BigNumber = rewardInfo.reduce(
        (value: BigNumber, item: any) => {
          const rewardPerSeconds = BigNumb(item.reward_per_seconds)
            .div(BigNumb(2).pow(64))
            .toString();
          return value.plus(
            getBalanceAmount(
              rewardPerSeconds,
              item?.reward_coin?.decimals
            ).multipliedBy(item?.reward_coin?.derivedPriceInUSD)
          );
        },
        BigNumb(0)
      ),
      rewardApr =
        +totalLiquid === 0
          ? "0"
          : totalReward.multipliedBy(3153600000).div(totalLiquid).toString();
    detailData.apr = BigNumb(poolInfo.apr).plus(rewardApr).toString();
    detailData.ticks = ticks;
    detailData.history = history;
    return detailData;
  } catch (err) {
    if (numberOfCall <= MAX_CALL_DETAIL) {
      wait(2000).then(() => {
        getPositionDetailV3(positionObjectId, account, numberOfCall);
      });
      numberOfCall++;
    } else {
      throw err;
    }
  }
};
