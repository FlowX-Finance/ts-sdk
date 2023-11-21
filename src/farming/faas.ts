import { BigNumberInstance } from "../BigNumber";
import {
  CLOCK_ID,
  DYNAMIC_FAAS_POS_TYPE,
  FAAS_FARM_TYPE_V2,
  FAAS_PACKAGE_OBJECT,
  FAAS_PACKAGE_OBJECT_V2,
  FAAS_POOL_REGISTRY_DYNAMIC_FIELD,
  FAAS_POOL_REGISTRY_DYNAMIC_FIELD_V2,
  FAAS_POSITION_REGISTRY_DYNAMIC_FIELD,
  FAAS_STATE_OBJECT,
  FAAS_STATE_OBJECT_V2,
  FLX_DECIMAL,
  FLX_TYPE,
  LP_DECIMAL,
  SUI_TYPE,
  provider,
} from "../constants";
import {
  CoinMetadata,
  IFaasData,
  IFaasUserRw,
  IFaasV2,
  IPairsRankingItem,
} from "../types";
import {
  getBalanceAmount,
  getCoinsFlowX,
  getPairsRankingFlowX,
  initTxBlock,
  getPoolInfos,
  standardizeType,
  getLpPrice,
  extractTypeFaas,
  getFullyOwnedObjects,
} from "../utils";

const extractType = (type: string) => {
  const pair = type.split("Pool<")[1];
  const coinXType = pair.split(", ")[0];
  const coinYType = pair.split(", ")[1];
  return { coinXType, coinYType };
};

export const getFaas = async (account?: string): Promise<IFaasData[]> => {
  try {
    const coins: CoinMetadata[] = await getCoinsFlowX();
    const poolList = await provider.getDynamicFields({
      parentId: FAAS_POOL_REGISTRY_DYNAMIC_FIELD,
      limit: 1000,
    });
    const arrpPoolId = poolList.data.map((item: any) => item.objectId);
    const poolInfo = await provider.multiGetObjects({
      ids: arrpPoolId,
      options: { showContent: true },
    });
    let finalList: IFaasData[] = [];
    for (let i = 0; i < poolInfo.length; i++) {
      const info = (poolInfo[i]?.data?.content as any).fields.value.fields;
      const type = (poolInfo[i]?.data?.content as any).fields.value.type;
      const poolIndex = (poolInfo[i]?.data?.content as any).fields.name;
      let accountStaked;
      if (account) {
        try {
          accountStaked = await provider.getDynamicFieldObject({
            parentId: FAAS_POSITION_REGISTRY_DYNAMIC_FIELD,
            name: {
              type: DYNAMIC_FAAS_POS_TYPE,
              value: {
                addr: account,
                pool_idx: poolIndex,
              },
            },
          });
        } catch (error) {
          throw error;
        }
      }
      const { coinXType, coinYType } = extractType(type);
      const tokenType = info.reward_token_custodian.type
        .split("Custodian")[1]
        .slice(1, -1);
      let pendingRw: IFaasUserRw[] = [],
        listReward: CoinMetadata[] = [];
      if (+info.token_per_seconds > 0) {
        listReward.push(
          coins.find((item: CoinMetadata) => item.type === tokenType)
        );
      }
      if (+info.flx_per_seconds > 0) {
        listReward.push(
          coins.find((item: CoinMetadata) => item.type === FLX_TYPE)
        );
      }
      if (account && accountStaked?.data) {
        const typeArguments = [
          coinXType,
          coinYType,
          listReward.find(
            (item: CoinMetadata) => item && item?.symbol !== "FLX"
          ).type ?? SUI_TYPE,
        ];
        let params = [FAAS_STATE_OBJECT, +poolIndex, CLOCK_ID];
        const tx = await initTxBlock(
          FAAS_PACKAGE_OBJECT,
          "fetcher",
          "fetch_pending_reward",
          params,
          typeArguments,
          undefined
        );
        const result = await provider.devInspectTransactionBlock({
          sender: account,
          transactionBlock: tx,
        });
        if (result.effects.status.status === "success") {
          pendingRw = listReward.map((item: CoinMetadata) => {
            const amount =
              item.type === FLX_TYPE
                ? getBalanceAmount(
                    result.events[0].parsedJson.flx_reward_amount,
                    FLX_DECIMAL
                  ).toFixed()
                : getBalanceAmount(
                    result.events[0].parsedJson.token_reward_amount,
                    coins.find((item: CoinMetadata) => item.type === tokenType)
                      .decimals
                  ).toFixed();
            return {
              token: item,
              amount,
            };
          });
        } else {
          pendingRw = listReward.map((item: CoinMetadata) => {
            return {
              token: item,
              amount: "0",
            };
          });
        }
        finalList.push({
          coinX: coins.find((item: CoinMetadata) => item.type === coinXType),
          coinY: coins.find((item: CoinMetadata) => item.type === coinYType),
          userReward: pendingRw,
          totalLpDeposit: accountStaked?.data
            ? getBalanceAmount(
                (accountStaked?.data.content as any).fields.value.fields.amount,
                LP_DECIMAL
              ).toFixed()
            : "0",
        });
      } else {
        pendingRw = listReward.map((item: CoinMetadata) => {
          return {
            token: item,
            amount: "0",
          };
        });
        finalList.push({
          coinX: coins.find((item: CoinMetadata) => item.type === coinXType),
          coinY: coins.find((item: CoinMetadata) => item.type === coinYType),
          userReward: [],
          totalLpDeposit: "0",
        });
      }
    }
    return finalList;
  } catch (error) {
    throw error;
  }
};

export const getFaasV2 = async (account?: string): Promise<IFaasV2[]> => {
  try {
    const coins: CoinMetadata[] = await getCoinsFlowX();
    const pairsList: IPairsRankingItem[] = await getPairsRankingFlowX();
    const pairObjectIds = pairsList?.map(
      (item: IPairsRankingItem) => item.lpObjectId
    );
    const poolInfos = await getPoolInfos(pairObjectIds);
    if (coins.length > 0 && poolInfos.length > 0) {
      const poolList = await provider.getDynamicFields({
        parentId: FAAS_POOL_REGISTRY_DYNAMIC_FIELD_V2,
        limit: 1000,
      });
      // // console.log('poolList', poolList);
      // console.log('here', poolList);
      const arrpPoolId = poolList.data.map((item: any) => item.objectId);
      // console.log('arrpPoolId', arrpPoolId);
      const poolInfo = await provider.multiGetObjects({
        ids: arrpPoolId,
        options: { showContent: true },
      });
      let finalList: any[] = [];
      for (let i = 0; i < poolInfo.length; i++) {
        const info = (poolInfo[i]?.data?.content as any).fields.value.fields;
        const type = (poolInfo[i]?.data?.content as any).fields.value.type;
        const poolIndex = (poolInfo[i]?.data?.content as any).fields.name;
        const poolId = (poolInfo[i]?.data as any).objectId;
        let accountStaked;
        if (account) {
          try {
            const userOwnedPosition = await getFullyOwnedObjects(
              account,
              { showContent: true },
              {
                MatchAll: [
                  {
                    StructType: FAAS_FARM_TYPE_V2,
                  },
                  {
                    AddressOwner: account,
                  },
                ],
              }
            );
            // console.log('userOwnedPosition', userOwnedPosition);
            for (let i = 0; i < userOwnedPosition.length; i++) {
              const dataPos: any = userOwnedPosition[i];
              const { type, fields } = dataPos?.data?.content;
              // console.log('poolIndex', fields.pool_idx, poolIndex, fields.pool_idx === poolIndex, dataPos);
              if (fields.pool_idx === poolIndex) {
                accountStaked = dataPos;
              }
            }
          } catch (error) {
            console.log("getDynamicFieldObject accountStaked", error);
          }
        }
        const { coinXType, coinYType } = extractTypeFaas(type);
        //Calc APR
        const lpType = info.lp_custodian.type;
        const trueType = lpType.split("Custodian")[1].slice(1, -1);
        const idxPool = poolInfos.findIndex(
          (item: any) => item.lpType === trueType
        );
        const coinX = coins.find(
          (coin) => coin.type === poolInfos[idxPool].coinX
        );
        const coinY = coins.find(
          (coin) => coin.type === poolInfos[idxPool].coinY
        );
        let lpPrice = "0";
        if (idxPool > -1) {
          lpPrice = getLpPrice({
            poolInfo: poolInfos[idxPool],
            coinX,
            coinY,
          });
        }
        const tokenType = standardizeType(
          info.reward_token_custodian.type.split("Custodian")[1].slice(1, -1)
        );
        const token =
          coins.findIndex((item: any) => item.type === tokenType) > -1
            ? coins[
                coins.findIndex((item: CoinMetadata) => item.type === tokenType)
              ]
            : null;
        const flxPrice =
          coins.findIndex((item: any) => item.type === FLX_TYPE) > -1
            ? coins[
                coins.findIndex((item: CoinMetadata) => item.type === FLX_TYPE)
              ].derivedPriceInUSD
            : 0;
        const tokenRw = token
          ? +BigNumberInstance(
              +getBalanceAmount(info.token_per_seconds, token.decimals)
            )
              .multipliedBy(token.derivedPriceInUSD)
              .toFixed()
          : 0;
        const flxRw =
          +flxPrice > 0
            ? +BigNumberInstance(
                +getBalanceAmount(info.flx_per_seconds, FLX_DECIMAL)
              ).multipliedBy(flxPrice)
            : 0;

        const totalRw = +BigNumberInstance(tokenRw).plus(flxRw);
        const totalLp =
          info.lp_custodian.fields.reserve > 0
            ? +BigNumberInstance(info.lp_custodian.fields.reserve).div(
                10 ** LP_DECIMAL
              )
            : 0;
        const totalLpInUsd =
          +totalLp > 0 && +lpPrice > 0
            ? +BigNumberInstance(totalLp).multipliedBy(lpPrice)
            : 0;
        const rewardApr =
          +totalLpInUsd > 0
            ? BigNumberInstance(totalRw)
                .multipliedBy(31_556_926)
                .div(totalLpInUsd)
                .multipliedBy(100)
                .toFixed(3)
            : "0";

        const tradingApr =
          pairsList.find((item: any) => item.lpType === trueType)?.stats
            ?.aprPerformance7D ?? "0";
        // console.log('TTT', rawApr, pairsList.find((item: any) => item.lpType === trueType)?.stats?.aprPerformance7D);
        let listReward = [] as CoinMetadata[],
          listPoolReward = [] as IFaasUserRw[];
        const durationInSec = +BigNumberInstance(info.ended_at_ms)
          .minus(info.started_at_ms)
          .div(1000);

        const idxTokenRwType = coins.findIndex(
          (item: CoinMetadata) => item.type === tokenType
        );
        // console.log(
        //   'tokenType',
        //   tokenType,
        //   coins,
        //   idxTokenRwType,
        //   stripZeros('0x09a4456a7ed43de223ffa2948b66bbc5e4b47455b3ba1026a39866057e93182a::wsol::WSOL'.split('0x')[1]),
        //   normalizeSuiAddress('0x9a4456a7ed43de223ffa2948b66bbc5e4b47455b3ba1026a39866057e93182a::wsol::WSOL', false),
        // );
        if (+info.token_per_seconds > 0 && idxTokenRwType > -1) {
          listReward.push(coins[idxTokenRwType]);
          const totalTokenRw = token
            ? BigNumberInstance(info.token_per_seconds).multipliedBy(
                durationInSec
              ) + ""
            : "0";
          // console.log('QQQQ', info);
          listPoolReward.push({
            token: coins[idxTokenRwType],
            amount: totalTokenRw,
          });
        }
        // console.log('listReward', listReward);
        const idxFlxRwType = coins.findIndex(
          (item: CoinMetadata) => item.type === FLX_TYPE
        );
        if (+info.flx_per_seconds > 0 && idxFlxRwType > -1) {
          listReward.push(coins[idxFlxRwType]);
          const totalFlxRw = token
            ? BigNumberInstance(info.flx_per_seconds).multipliedBy(
                durationInSec
              ) + ""
            : "0";
          listPoolReward.push({
            token: coins[idxFlxRwType],
            amount: totalFlxRw,
          });
        }
        // console.log('accountStaked', coinX.symbol, coinY.symbol, listReward);
        //Get pending reward;
        let pendingRw = [] as IFaasUserRw[];
        if (account && accountStaked && poolIndex) {
          // console.log('ZZZz', coinX.symbol, coinY.symbol, listReward, accountStaked);
          const idxCustomRewardCoin = listReward.findIndex(
            (item: CoinMetadata) => item && item?.symbol !== "FLX"
          );
          const typeArguments = [
            coinX.type,
            coinY.type,
            idxCustomRewardCoin > -1
              ? listReward[idxCustomRewardCoin].type
              : SUI_TYPE,
          ];
          let params = [
            FAAS_STATE_OBJECT_V2,
            (accountStaked.data as any)?.objectId,
            CLOCK_ID,
          ];
          const tx = await initTxBlock(
            FAAS_PACKAGE_OBJECT_V2,
            "fetcher",
            "fetch_pending_reward",
            params,
            typeArguments
          );
          const result = await provider.devInspectTransactionBlock({
            sender: account,
            transactionBlock: tx,
          });
          // console.log('result', result);
          if (result.effects.status.status === "success") {
            pendingRw = listReward.map((item: CoinMetadata) => {
              const amount =
                item.type === FLX_TYPE
                  ? result.events[0].parsedJson.flx_reward_amount
                  : result.events[0].parsedJson.token_reward_amount;
              return {
                token: item,
                amount,
              };
            });
          } else {
            pendingRw = listReward.map((item: CoinMetadata) => {
              return {
                token: item,
                amount: "0",
              };
            });
          }
        } else {
          pendingRw = listReward.map((item: CoinMetadata) => {
            return {
              token: item,
              amount: "0",
            };
          });
        }
        finalList.push({
          coinX: coins.find((coin) => coin.type === coinXType),
          coinY: coins.find((coin) => coin.type === coinYType),
          id: arrpPoolId[i],
          poolIndex,
          started_at_ms: info.started_at_ms,
          ended_at_ms: +info.ended_at_ms,
          creator: info.creator,
          totalLiquid:
            +totalLp > 0 && +lpPrice > 0
              ? +BigNumberInstance(totalLp).multipliedBy(lpPrice)
              : 0,
          totalLpDeposit: accountStaked
            ? +getBalanceAmount(
                ((accountStaked as any)?.data.content as any)?.fields?.amount,
                LP_DECIMAL
              )
            : "0",
          rewardApr,
          tradingApr,
          userReward: pendingRw,
          poolReward: listPoolReward,
          isLegacy: false,
          lpPrice,
          poolLiquid: {
            poolObjectId: poolInfos[idxPool].objectId,
            reserveX: poolInfos[idxPool].reserveX.fields.balance,
            reserveY: poolInfos[idxPool].reserveY.fields.balance,
            totalLpSupply: poolInfos[idxPool].totalLpSupply,
            lpType: poolInfos[idxPool].lpType,
            feeRate: poolInfos[idxPool].feeRate,
          },
        });
      }
      return finalList;
    }
  } catch (error) {
    throw error;
  }
};
