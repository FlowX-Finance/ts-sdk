import { Transaction } from "@mysten/sui/transactions";
import { ADD_LIQUIDITY_V3, provider } from "../../constants";
import { CoinMetadata, IFeeTierV3 } from "../../types";
import { getTxIncreasePositionLiquidV3 } from "./getTxIncreasePositionLiquidV3";
import { getTxCreatePoolLiquidV3 } from "./getTxCreatePoolLiquidV3";
import { getTxOpenPositionLiquidV3 } from "./getTxOpenPositionLiquidV3";
import { getListPoolLiquidV3 } from "./getListPoolLiquidV3";
import { asIntN } from "./utils";

const getI32Object = (tickIndex: number, tx: Transaction) => {
  return tx.moveCall({
    target: `${ADD_LIQUIDITY_V3.CLMM_PACKAGE}::i32::${
      tickIndex < 0 ? "neg_from" : "from"
    }`,
    typeArguments: [],
    arguments: [tx.pure.u32(Math.abs(tickIndex))],
  });
};

export const buildTxAddLiquidV3 = async (
  coinX: CoinMetadata,
  coinY: CoinMetadata,
  slippage: string,
  fee: IFeeTierV3,
  lowerTick: number,
  upperTick: number,
  amountX: string,
  amountY: string,
  account: string
) => {
  const tx = new Transaction();
  const dataPools = await getListPoolLiquidV3();
  const poolId = dataPools.find(
    (item) =>
      item.typeCoinX === coinX.type &&
      item.typeCoinY === coinY.type &&
      item.feeRate === fee.valueDecimal + ""
  )?.id;
  if (!poolId) {
    const resPool = await provider.getObject({
      id: poolId,
      options: {
        showContent: true,
      },
    });
    (resPool.data.content as any).fields;
    const currentTick = asIntN(
      (resPool.data.content as any).fields?.tick_index?.fields?.["bits"]
    );
    getTxCreatePoolLiquidV3(coinX.type, coinY.type, currentTick, fee, tx);
  }
  const lowerTickIndex = getI32Object(lowerTick, tx);
  const upperTickIndex = getI32Object(upperTick, tx);

  const position = await getTxOpenPositionLiquidV3(
    fee,
    coinX.type,
    coinY.type,
    lowerTickIndex,
    upperTickIndex,
    tx
  );
  await getTxIncreasePositionLiquidV3(
    coinX,
    coinY,
    amountX,
    amountY,
    account,
    position,
    slippage,
    tx
  );
  tx.transferObjects([position], account);
  return tx;
};
