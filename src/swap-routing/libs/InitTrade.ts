import { TransactionResult, Transaction } from "@mysten/sui/transactions";
import { BigNumb, BigNumber } from "../../BigNumber";
import { MODULE, SUI_TYPE, SWAP_V3 } from "../../constants";
import { IPartnerFee } from "../../types";
import { createOption, createPartnerOption } from "../../utils";
import { getFeeInfoUrl } from "../../swap/libs/getFeeInfoUrl";
import { bcs } from "@mysten/sui/bcs";

export const InitTrade = async (
  coinInType: string,
  coinOutType: string,
  coinObjectIn: any,
  pathAmountOut: string,
  slippage: number,
  deadline: number,
  pathsAmountOut: number[],
  partnerFee: IPartnerFee,
  txb?: Transaction
): Promise<any> => {
  try {
    const { url, commissionOnInput } = getFeeInfoUrl(
      coinInType,
      coinOutType,
      partnerFee
    );
    let tx = new Transaction();
    if (txb) tx = txb;
    let amountCommission = "0";
    if (url.length > 0) {
      if (partnerFee?.percentage) {
        amountCommission = BigNumb(partnerFee?.percentage)
          .div(100)
          .multipliedBy(1e6)
          .toFixed(0);
      } else {
        amountCommission = BigNumb(partnerFee?.fixAmount).toFixed(0);
      }
    }
    const [tradeObject] = tx.moveCall({
      target: `${SWAP_V3.UNIVERSAL_ROUTER}::${MODULE.UNIVERSAL_ROUTER}::build`,
      typeArguments: [coinInType, coinOutType],
      arguments: [
        tx.object(SWAP_V3.TRADE_ID_TRACKER),
        tx.object(SWAP_V3.PARTNER_REGISTRY),
        coinInType === SUI_TYPE ? coinObjectIn : tx.object(coinObjectIn),
        tx.pure.u64(pathAmountOut),
        tx.pure.u64(BigNumber(slippage).multipliedBy(1e6).toFixed(0)),
        tx.pure.u64(deadline),
        tx.pure(bcs.vector(bcs.u64()).serialize( pathsAmountOut)),
        createPartnerOption(
          tx,
          partnerFee?.percentage ? 0 : partnerFee?.fixAmount ? 1 : 0,
          amountCommission,
          commissionOnInput,
          url.length > 0 && partnerFee?.partnerAddress
        ),
      ],
    });
    return { tradeObject, tx };
  } catch (error) {
    console.log("InitTrade ERROR", error);
  }
};
