import axios from "axios";
import { BigNumber } from "../BigNumber";
import { ISmartRouting, Route, TSourceSmartRouting } from "../types";
import { standardizeType } from "../utils";
import { normalizeStructTag } from "@mysten/sui.js";
export const getSmartRouting = async (
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  signal: any,
  source?: TSourceSmartRouting[]
): Promise<ISmartRouting> => {
  try {
    // &includeSources=FLOWX
    let response = await axios.get(
      `https://api.flowx.finance/flowx-ag-routing/api/v1/quote?tokenIn=${normalizeStructTag(
        tokenIn
      )}&tokenOut=${normalizeStructTag(tokenOut)}&amountIn=${amountIn}${
        source?.length > 0 ? `&includeSources=${source.join(",")}` : ""
      }`,
      // `https://flowx-dev.flowx.finance/flowx-ag-routing/api/v1/quote?tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${amountIn}`,
      { signal }
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
          } = j.extra;
          data.sqrtPrice = nextStateSqrtRatioX64;
          data.liquidity = nextStateLiquidity;
          data.tickIndex = nextStateTickCurrent;
          data.fee = fee;
          data.swapXtoY = swapXToY;
          data.lpType = lpCoinType;
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
