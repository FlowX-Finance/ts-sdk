import {
  FLX_DECIMAL,
  GENESIS_FARM_INFO,
  GENESIS_FARM_INFO_DYNAMIC_FIELD_ID,
  POSITION_G_FARM_TYPE,
  client,
  provider,
} from "../constants";
import { GET_POSITION_APR_PDRW } from "../queries";
import {
  CoinMetadata,
  IAprPdrwposition,
  IGenesisPoolsData,
  IGenesisUserJoin,
} from "../types";
import {
  SuiTypeMiniNormalize,
  addZerosX,
  getBalanceAmount,
  getCoinsFlowX,
  getFullyOwnedObjects,
} from "../utils";

export const getAprPdrwPosition = async (
  farmObjectId: string,
  posArr: string[]
): Promise<IAprPdrwposition[]> => {
  try {
    const res: any = await client.request(GET_POSITION_APR_PDRW, {
      farmObjectId,
      objectIds: posArr,
    });
    return res.multiGetPositionsStats;
  } catch (error) {
    throw error;
  }
};

export const getGenesisFarm = async (
  account?: string
): Promise<IGenesisPoolsData[]> => {
  try {
    let joinedPool: IGenesisUserJoin[] = [],
      dataArr: IGenesisPoolsData[] = [];
    const coins: CoinMetadata[] = await getCoinsFlowX();
    if (account) {
      const userOwnedPosition = await getFullyOwnedObjects(
        account,
        { showContent: true },
        {
          MatchAll: [
            {
              StructType: POSITION_G_FARM_TYPE,
            },
            {
              AddressOwner: account,
            },
          ],
        }
      );
      // Get list all position user owned;
      for (let i = 0; i < userOwnedPosition.length; i++) {
        const { type, fields } = (userOwnedPosition[i] as any).data.content;
        joinedPool.push({
          type: type,
          lp_locked_amount: fields.lp_locked_amount,
          xflx_locked_amount: fields.xflx_locked_amount,
          id: fields.id["id"],
          pool_id: fields.pool_id,
          pool_idx: fields.pool_idx,
          acc_pending_rewards: fields.acc_pending_rewards,
        });
      }
    }
    const _poolData = await provider.getDynamicFields({
      parentId: GENESIS_FARM_INFO_DYNAMIC_FIELD_ID,
      limit: 1000,
    });
    const arrpPoolId = _poolData?.data.map((item: any) => item.objectId);
    const listPool = await provider.multiGetObjects({
      ids: arrpPoolId,
      options: { showContent: true },
    });
    for (let i = 0; i < listPool.length; i++) {
      let totalLpDeposit = 0,
        totalXFlxDeposit = 0,
        totalPendingReward = 0;
      const lpName = (listPool[i].data.content as any)?.fields.value.fields
        .lp_name;
      const poolTokens = lpName.split("-");
      const coinXType = addZerosX(poolTokens[1]);
      const coinYType = addZerosX(poolTokens[2]);
      const coinX = coins.find(
        (item: CoinMetadata) => item.type === SuiTypeMiniNormalize(coinXType)
      );
      const coinY = coins.find(
        (item: CoinMetadata) => item.type === SuiTypeMiniNormalize(coinYType)
      );

      let checked: IGenesisUserJoin[] = [];
      for (let j = 0; j < joinedPool.length; j++) {
        if (
          joinedPool[j].pool_id ===
          (listPool[i].data.content as any).fields.value.fields.id["id"]
        ) {
          checked.push(joinedPool[j]);
        }
      }
      if (account) {
        if (checked.length > 0) {
          const arrPosObjectId = checked.map(
            (item: IGenesisUserJoin) => item.id
          );
          checked.forEach((item: IGenesisUserJoin) => {
            totalLpDeposit += +item.lp_locked_amount;
            totalXFlxDeposit += +item.xflx_locked_amount;
            totalPendingReward += +(+item.acc_pending_rewards > 1e-9
              ? +getBalanceAmount(item.acc_pending_rewards, FLX_DECIMAL)
              : 0);
          });
          const dataAprPdrw = await getAprPdrwPosition(
            GENESIS_FARM_INFO,
            arrPosObjectId
          );
          for (let n = 0; n < dataAprPdrw.length; n++) {
            totalPendingReward += +dataAprPdrw[n].pendingReward;
          }
          dataArr.push({
            totalLpDeposit: totalLpDeposit + "",
            totalXFlxDeposit: totalXFlxDeposit + "",
            totalPendingReward: totalPendingReward + "",
            coinX,
            coinY,
          });
        }
      } else {
        dataArr.push({
          totalLpDeposit: "0",
          totalXFlxDeposit: "0",
          totalPendingReward: "0",
          coinX,
          coinY,
        });
      }
    }
    return dataArr;
  } catch (error) {
    throw error;
  }
};
