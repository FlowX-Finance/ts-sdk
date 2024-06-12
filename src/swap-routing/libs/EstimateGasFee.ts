import { Transaction } from "@mysten/sui/transactions";
import { MODULE, provider, SUI_TYPE, SWAP_V3 } from "../../constants";
import { BigNumber } from "../../BigNumber";
import Lodash from "../../lodash";
import { getBalanceAmount, getCoinsFlowX } from "../../utils";
import { CoinMetadata, IEstimateGasResult } from "../../types";
import { SUI_DECIMALS } from "@mysten/sui/utils";

export const estimateGasFee = async (
  tx: Transaction | any,
  account?: string
): Promise<IEstimateGasResult | undefined> => {
  if (!account) return { fee: "0", amountOut: "0" };
  let suiPrice = "0";
  const coins: CoinMetadata[] = await getCoinsFlowX();
  suiPrice = Lodash.find(coins, { type: SUI_TYPE }).derivedPriceInUSD;

  const result = await provider.devInspectTransactionBlock({
    sender: account,
    transactionBlock: tx,
  });

  console.log("%cEstimateGas", "color:cyan", account, result);
  const gasUsed = result.effects.gasUsed;
  if (result.effects.status.status === "success") {
    let fee = BigNumber(gasUsed.computationCost)
      .plus(gasUsed.storageCost)
      .toFixed();
    const listSwapTrans = Lodash.filter(result.events, {
      type: `${SWAP_V3.UNIVERSAL_ROUTER_LEGACY}::${MODULE.UNIVERSAL_ROUTER}::Swap`,
    });
    // console.log('listSwapTrans', listSwapTrans);
    const amountOut = Lodash.reduce(
      listSwapTrans,
      (sum, i) => {
        return +BigNumber(sum).plus((i.parsedJson as any).amount_out).toFixed();
      },
      0
    );
    return {
      fee: BigNumber(suiPrice)
        .multipliedBy(getBalanceAmount(fee, SUI_DECIMALS))
        .toFixed(),
      amountOut: amountOut + "",
      // pathsAmountOut: listSwapTrans.map((i) => i.parsedJson.amount_out),
    };
  }
  return;
};
