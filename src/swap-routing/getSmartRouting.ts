import axios from "axios";
import { BigNumb, BigNumber } from "../BigNumber";
import {
  IPartnerFee,
  ISmartRouting,
  Route,
  TSourceSmartRouting,
} from "../types";
import { standardizeType } from "../utils";
import { normalizeStructTag } from "@mysten/sui/utils";
import { SOURCE_DEX } from "../constants";
import JsonBigInt from "json-bigint";
import { getFeeInfoUrl } from "../swap/libs/getFeeInfoUrl";

interface IGetSmartRouting {
  coinInType: string;
  coinOutType: string;
  amountIn: string;
  signal: any;
  insludeSource: boolean;
  source?: TSourceSmartRouting[];
  partnerFee?: IPartnerFee;
}
export const getSmartRouting = async ({
  coinInType,
  coinOutType,
  amountIn,
  signal,
  insludeSource,
  source,
  partnerFee,
}: IGetSmartRouting): Promise<ISmartRouting> => {
  try {
    // console.log("getSmartRouting", coinInType, coinOutType);
    const excludeList = SOURCE_DEX.filter(
      (item) => !(source ?? SOURCE_DEX).includes(item)
    );
    // let response = await axios.get(
    //   `https://api.flowx.finance/flowx-ag-routing/api/v1/quote?tokenIn=${normalizeStructTag(
    //     tokenIn
    //   )}&tokenOut=${normalizeStructTag(tokenOut)}&amountIn=${amountIn}${
    //     source?.length > 0 && insludeSource
    //       ? `&includeSources=${source.join(",")}`
    //       : excludeList?.length > 0
    //       ? `&excludeSources=${excludeList.join(",")}`
    //       : ""
    //   }${
    //     fee
    //       ? `&feeToken=${normalizeStructTag(fee.percentage)}${
    //           fee?.fixAmount ? `&feeAmount=${fee?.fixAmount}` : ""
    //         }${
    //           +fee.percentage > 0
    //             ? `&feeInBps=${BigNumb(fee.percentage)
    //                 .div(100)
    //                 .multipliedBy(10000)}`
    //             : ""
    //         }`
    //       : ""
    //   }`,
    const info = getFeeInfoUrl(coinInType, coinOutType, partnerFee);
    let response = await axios.get(
      `https://api.flowx.finance/flowx-ag-routing/api/v1/quote?tokenIn=${normalizeStructTag(
        coinInType
      )}&tokenOut=${normalizeStructTag(coinOutType)}&amountIn=${amountIn}${
        source?.length > 0 && insludeSource
          ? `&includeSources=${source.join(",")}`
          : excludeList?.length > 0
          ? `&excludeSources=${excludeList.join(",")}`
          : ""
      }${info.url}`,
      {
        signal,
        transformResponse: [
          (data) =>
            JsonBigInt({ storeAsString: true, useNativeBigInt: true }).parse(
              data
            ),
        ],
      }
    );
    // console.log("response", response);
    if (!response.data.data) return { amountOut: "0", paths: [] };
    const smartPathData = response.data.data;
    // console.log("smartPathData", smartPathData);
    const smartAmountIn = smartPathData.amountIn,
      smartAmountOut = smartPathData.amountOut;
    const listPath = smartPathData.paths.map((path: any) => {
      const coinTypeIn = standardizeType(path[0].tokenIn),
        coinTypeOut = standardizeType(path[path.length - 1].tokenOut),
        pathAmountIn = BigNumber(path[0].amountIn),
        pathAmountOut = BigNumber(path[path.length - 1].amountOut);

      const routes = path.map((j: any) => {
        let data: Route = {
          protocol: j.source,
          sourceType: j.sourceType,
          poolId: j.poolId,
          coinX: { coinType: standardizeType(j.tokenIn) },
          coinY: { coinType: standardizeType(j.tokenOut) },
          amountIn: BigNumber(j.amountIn),
          amountOut: BigNumber(j.amountOut),
        };
        if (j.extra) {
          const {
            nextStateSqrtRatioX64,
            nextStateLiquidity,
            nextStateTickCurrent,
            fee,
            swapXToY,
            lpCoinType,
            lotSize,
            minSqrtPriceHasLiquidity,
            maxSqrtPriceHasLiquidity,
          } = j.extra;
          data.sqrtPrice = nextStateSqrtRatioX64;
          data.liquidity = nextStateLiquidity;
          data.tickIndex = nextStateTickCurrent;
          data.fee = fee;
          data.swapXtoY = swapXToY;
          data.lpType = lpCoinType;
          data.lotSize = lotSize;
          data.minSqrtPriceHasLiquidity = minSqrtPriceHasLiquidity;
          data.maxSqrtPriceHasLiquidity = maxSqrtPriceHasLiquidity;
        }
        return data;
      });

      return {
        info: {
          routes,
          amountIn: pathAmountIn,
          amountOut: pathAmountOut,
          coinTypeOut,
          coinTypeIn,
        },
        rate: +pathAmountIn.div(smartAmountIn).multipliedBy(100).toFixed(),
      };
    });
    return {
      amountOut: smartAmountOut,
      paths: listPath,
    };
  } catch (error) {
    console.log("getSmartRouting ERROR", error);
    return { amountOut: "0", paths: [] };
  }
};
