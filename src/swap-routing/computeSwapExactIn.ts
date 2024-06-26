import { CoinMetadata, IPartnerFee, ISmartPathV3 } from "../types";
import { getBalanceAmount } from "../utils";
import { BigNumb, BigNumber, BigNumber as BN } from "../BigNumber";
import { estimateGasFee } from "./libs/EstimateGasFee";
import { txBuild } from "./libs/Txbuild";
import { TransactionBlock } from "@mysten/sui.js";
import Lodash from "../lodash";
import { estimatePriceImpact } from "./estimatePriceImpact";

export const computeSwapExactIn = async (
  paths: ISmartPathV3[],
  amountIn: string | number,
  amountOut: string | number, // total out from all path (api)
  coinIn: CoinMetadata,
  coinOut: CoinMetadata,
  slippage: number,
  account: string,
  partnerFee?: IPartnerFee
): Promise<{
  gasFee: string;
  priceChange: boolean;
  totalAmountOutInspec: string;
  inRate: string;
  outRate: string;
  tx: TransactionBlock | any;
  priceImpact: string;
}> => {
  try {
    if (
      paths.length > 0 &&
      BigNumber(coinIn.balance ?? 0).isGreaterThanOrEqualTo(amountIn)
    ) {
      const tokenIn = {
        type: coinIn.type,
        amount: BigNumb(amountIn).toFixed(),
      };
      const tokenOut = {
        type: coinOut.type,
        amount: BigNumb(amountOut).toFixed(),
      };
      const tx = await txBuild({
        listSmartPath: paths,
        slippage,
        tokenIn,
        tokenOut,
        account,
        partnerFee,
        inspecTransaction: true,
      });
      const estimateResult = await estimateGasFee(tx, account);
      // console.log("estimateResult", estimateResult);
      if (estimateResult) {
        const { fee, amountOut: amountOutDev } = estimateResult;
        let priceChange = false;
        const txb = await txBuild({
          listSmartPath: paths,
          slippage,
          tokenIn,
          tokenOut: { ...tokenOut, amount: amountOutDev },
          account,
          partnerFee,
        });
        const inAmountFormat = getBalanceAmount(
            amountIn,
            coinIn.decimals
          ).toFixed(),
          outAmountFormat = getBalanceAmount(
            amountOutDev,
            coinOut?.decimals
          ).toFixed(),
          outRate = BigNumber(inAmountFormat).div(outAmountFormat).toFixed(),
          inRate = BigNumber(outAmountFormat).div(inAmountFormat).toFixed();
        const differRate = BigNumber(amountOutDev)
          .minus(amountOut)
          .div(amountOut)
          .toFixed();
        priceChange = BigNumber(differRate).abs().gt(0.005);
        const priceImpact = estimatePriceImpact(
          amountIn,
          amountOutDev,
          coinIn,
          coinOut
        );
        return {
          totalAmountOutInspec: amountOutDev,
          gasFee: fee,
          priceImpact,
          priceChange,
          inRate,
          outRate,
          tx: txb,
        };
      }
    }
  } catch (error) {
    throw error;
  }
};
