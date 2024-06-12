import { Transaction } from "@mysten/sui/transactions";
import {
  ADD_LIQUIDITY_V3,
  CLOCK_ID,
  FUNCTION,
  MODULE,
  SUI_TYPE,
} from "../../constants";
import { CoinMetadata, IFeeTierV3 } from "../../types";
import { getTxIncreasePositionLiquidV3 } from "./getTxIncreasePositionLiquidV3";

export const buildTxIncreaseLiquidV3 = async (
  amountX: string,
  amountY: string,
  account: string,
  coinX: CoinMetadata,
  coinY: CoinMetadata,
  positionObjectId: string,
  slippage: string
) => {
  const tx = new Transaction();
  return await getTxIncreasePositionLiquidV3(
    coinX,
    coinY,
    amountX,
    amountY,
    account,
    positionObjectId,
    slippage,
    tx
  );
};
