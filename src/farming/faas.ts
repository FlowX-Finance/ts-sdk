import {
  CLOCK_ID,
  DYNAMIC_FAAS_POS_TYPE,
  FAAS_PACKAGE_OBJECT,
  FAAS_POOL_REGISTRY_DYNAMIC_FIELD,
  FAAS_POSITION_REGISTRY_DYNAMIC_FIELD,
  FAAS_STATE_OBJECT,
  FLX_DECIMAL,
  FLX_TYPE,
  LP_DECIMAL,
  SUI_TYPE,
  provider,
} from "../constants";
import { CoinMetadata, IFaasData, IFaasUserRw } from "../types";
import { getBalanceAmount, getCoinsFlowX, initTxBlock } from "../utils";

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
