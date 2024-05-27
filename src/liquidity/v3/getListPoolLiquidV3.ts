import { BigNumb } from "../../BigNumber";
import { ADD_LIQUIDITY_V3 } from "../../constants";
import { IDataPools } from "../../types";
import { getFullyDynamicFields, standardizeType } from "../../utils";

export const getListPoolLiquidV3 = async () => {
  const data: IDataPools[] = [];
  const res = await getFullyDynamicFields(ADD_LIQUIDITY_V3.POOL_REGISTRY_OBJ);
  res.forEach((item) => {
    data.push({
      typeCoinX: standardizeType(item.name.value.coin_type_x.name),
      typeCoinY: standardizeType(item.name.value.coin_type_y.name),
      feeRate: BigNumb(item.name.value.fee_rate).div(1e4).toFixed(),
      id: item.objectId,
    });
  });
  return data;
};
