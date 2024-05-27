import { TransactionBlock } from "@mysten/sui.js";
import { handleGetCoinAmount } from "../../swap/libs/handleGetCoinAmount";
import { CoinMetadata } from "../../types";
import { createZeroCoin, getDecimalAmount } from "../../utils";
import {
  ADD_LIQUIDITY_V3,
  CLOCK_ID,
  FUNCTION,
  MODULE,
  SUI_TYPE,
} from "../../constants";
import { BigNumb } from "../../BigNumber";

export const getTxIncreasePositionLiquidV3 = async (
  coinX: CoinMetadata,
  coinY: CoinMetadata,
  amountX: string,
  amountY: string,
  account: string,
  positionObject: string | any,
  slippage: string,
  tx: TransactionBlock
) => {
  const amountDecimalX = getDecimalAmount(amountX, coinX.decimals);
  const amountDecimalY = getDecimalAmount(amountY, coinY.decimals);
  // console.log("positionObject", positionObject, amountDecimalX, amountDecimalY);
  const { coin: coinObjectX } = await handleGetCoinAmount(
    amountDecimalX,
    account,
    coinX.type,
    tx
  );
  const { coin: coinObjectY } = await handleGetCoinAmount(
    amountDecimalY,
    account,
    coinY.type,
    tx
  );
  tx.moveCall({
    target: `${ADD_LIQUIDITY_V3.CLMM_PACKAGE}::${MODULE.POSITION_MANAGER}::${FUNCTION.INCREASE_LIQUIDITY}`,
    typeArguments: [coinX.type, coinY.type],
    arguments: [
      tx.object(ADD_LIQUIDITY_V3.POOL_REGISTRY_OBJ),
      typeof positionObject === "string"
        ? tx.object(positionObject)
        : positionObject,
      coinX.type === SUI_TYPE
        ? (coinObjectX as any)
        : !!coinObjectX
        ? tx.object(coinObjectX as any)
        : createZeroCoin(tx, coinX.type),
      coinY.type === SUI_TYPE
        ? (coinObjectY as any)
        : !!coinObjectY
        ? tx.object(coinObjectY as any)
        : createZeroCoin(tx, coinY.type),
      tx.pure(
        BigNumb(1)
          .minus(slippage)
          .multipliedBy(amountDecimalX)
          .integerValue()
          .toString()
      ),
      tx.pure(
        BigNumb(1)
          .minus(slippage)
          .multipliedBy(amountDecimalY)
          .integerValue()
          .toString()
      ),
      tx.pure(Number.MAX_SAFE_INTEGER),
      tx.object(ADD_LIQUIDITY_V3.VERSIONED_OBJ),
      tx.object(CLOCK_ID),
    ],
  });
  return tx;
};
