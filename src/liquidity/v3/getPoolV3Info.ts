import BigNumber from "bignumber.js";
import { BigNumb } from "../../BigNumber";
import { provider } from "../../constants";
import { CoinMetadata, IPoolInfoV3 } from "../../types";
import { getBalanceAmount, getCoinsFlowX, standardizeType } from "../../utils";
import { getListPoolLiquidV3 } from "./getListPoolLiquidV3";
import { TickMath } from "./math";
import { asIntN } from "./utils";
import { getClmmPoolDetail } from "./queries/getClmmPoolDetail";

export const getLiquidPoolV3Info = async (
  coinX: CoinMetadata,
  coinY: CoinMetadata,
  feeRate: string,
  coinList?: CoinMetadata[]
): Promise<IPoolInfoV3> => {
  try {
    let coins = coinList ?? [];
    if (!coinList) {
      coins = await getCoinsFlowX();
    }
    const dataPools = await getListPoolLiquidV3();
    const poolId = dataPools.find(
      (item) =>
        item.typeCoinX === coinX.type &&
        item.typeCoinY === coinY.type &&
        item.feeRate === feeRate
    )?.id;
    if (!poolId) {
      return;
    }
    const resPool = await provider.getObject({
      id: poolId,
      options: {
        showContent: true,
      },
    });
    const fields = (resPool.data.content as any).fields,
      currentTime = Date.now(),
      totalLiquid = getBalanceAmount(fields?.reserve_x ?? 0, coinX?.decimals)
        .multipliedBy(coinX?.derivedPriceInUSD)
        .plus(
          getBalanceAmount(
            fields?.reserve_y ?? 0,
            coinY?.decimals
          ).multipliedBy(coinY?.derivedPriceInUSD)
        )
        .toString(),
      rewardInfo = fields.reward_infos
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
      );
    const newPrice = TickMath.tickIndexToPrice(
      asIntN(fields?.tick_index?.fields?.["bits"]),
      coinX?.decimals,
      coinY?.decimals
    ).toString();
    const data = await getClmmPoolDetail(poolId);
    return {
      typeCoinX: standardizeType(fields?.coin_type_x?.fields?.name),
      typeCoinY: standardizeType(fields?.coin_type_y?.fields?.name),
      liquidity: fields?.liquidity,
      sqrtPrice: fields?.sqrt_price,
      feeRate: +fields?.swap_fee_rate / 10000,
      reserveX: fields?.reserve_x,
      reserveY: fields?.reserve_y,
      id: fields?.id?.id,
      totalLiquid,
      rewardApr:
        +totalLiquid === 0
          ? "0"
          : totalReward.multipliedBy(3153600000).div(totalLiquid).toFixed(),

      currentPrice: newPrice,
      currentTickIndex: asIntN(fields?.tick_index?.fields?.["bits"]),
      volume24H: data?.stats?.volume24H ?? "0",
      fee24H: data?.stats?.fee24H ?? "0",
      fee7D: data?.stats?.fee7D ?? "0",
      apr: data?.stats?.apr ?? "0",
    };
  } catch (error) {
    throw error;
  }
};
