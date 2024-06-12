import { Transaction } from "@mysten/sui/transactions";
import { BigNumb } from "../BigNumber";
import {
  CLOCK_ID,
  CONTAINER_OBJECT_ID,
  FUNCTION,
  PACKAGE_OBJECT_ID,
} from "../constants";
import { Amount, CoinMetadata, PairSetting, SwapArgs } from "../types";
import { estimateDealine } from "../utils";
import { handleGetCoinAmount } from "./libs/handleGetCoinAmount";
import { isObject } from "lodash";
const getSwapFunction = (trades: PairSetting[], isExactIn = false) => {
  switch (trades?.length) {
    case 1:
      return isExactIn ? FUNCTION.SWAP_EXACT_INPUT : FUNCTION.SWAP_EXACT_OUTPUT;
    case 2:
      return isExactIn
        ? FUNCTION.SWAP_EXACT_INPUT_DOUBLEHOP
        : FUNCTION.SWAP_EXACT_OUTPUT_DOUBLEHOP;
    case 3:
      return isExactIn
        ? FUNCTION.SWAP_EXACT_INPUT_TRIPLEHOP
        : FUNCTION.SWAP_EXACT_OUTPUT_TRIPLEHOP;
    default:
      return isExactIn ? FUNCTION.SWAP_EXACT_INPUT : FUNCTION.SWAP_EXACT_OUTPUT;
  }
};
const getArgsSwapExactInput = async (
  amountIn: string | number,
  amountOutMin: string | number,
  trades: PairSetting[],
  coinIn: CoinMetadata,
  account: string,
  recipient: string
): Promise<SwapArgs> => {
  const { coin: coinObjectId, tx } = await handleGetCoinAmount(
    amountIn,
    account,
    coinIn.type
  );
  let typeArguments: any[] = [coinIn.type];
  trades?.forEach((item) => {
    let lastArgs = typeArguments[typeArguments.length - 1] ?? "";
    if (lastArgs == item.coinXType) {
      typeArguments.push(item.coinYType);
    } else {
      typeArguments.push(item.coinXType);
    }
  });
  return {
    tx,
    typeArguments,
    args: [
      tx.object(CLOCK_ID),
      tx.object(CONTAINER_OBJECT_ID),
      isObject(coinObjectId) ? coinObjectId : tx.object(coinObjectId),
      tx.pure.u64(+amountOutMin),
      tx.pure.u64(recipient || account),
      tx.pure.u64(estimateDealine()),
    ],
    callFunction: getSwapFunction(trades, true),
  };
};

const getArgsSwapExactOutput = async (
  amountInMax: string | number,
  amountOut: string | number,
  trades: PairSetting[],
  coinIn: CoinMetadata,
  account: string,
  recipient: string
): Promise<SwapArgs> => {
  const { coin: coinObjectId, tx } = await handleGetCoinAmount(
    amountInMax,
    account,
    coinIn.type
  );

  let typeArguments: any[] = [coinIn.type];
  trades?.forEach((item) => {
    let lastArgs = typeArguments[typeArguments.length - 1] ?? "";
    if (lastArgs == item.coinXType) {
      typeArguments.push(item.coinYType);
    } else {
      typeArguments.push(item.coinXType);
    }
  });

  return {
    tx,
    typeArguments,
    args: [
      tx.object(CLOCK_ID),
      tx.object(CONTAINER_OBJECT_ID),
      isObject(coinObjectId) ? coinObjectId : tx.object(coinObjectId),
      tx.pure.u64(+amountInMax),
      tx.pure.u64(+amountOut),
      tx.pure.address(recipient || account),
      tx.pure.u64(estimateDealine()),
    ],
    callFunction: getSwapFunction(trades, false),
  };
};
const swap = async (
  tx: Transaction,
  typeArguments: string[],
  args: any[],
  callFunction: string
): Promise<Transaction> => {
  tx.moveCall({
    target: `${PACKAGE_OBJECT_ID}::router::${callFunction}`,
    arguments: args,
    typeArguments,
  });
  return tx;
};
export const swapExactInput = async (
  isExactIn: boolean,
  amountIn: Amount,
  amountOut: Amount,
  trades: PairSetting[],
  coinIn: CoinMetadata,
  coinOut: CoinMetadata,
  account: string,
  valueSlippage: number
) => {
  try {
    const slipageVal =
      valueSlippage > 100 ? 100 : valueSlippage < 0 ? 0 : valueSlippage;
    const slippage = BigNumb(slipageVal).div(100).toFixed();
    const { typeArguments, args, tx, callFunction } = isExactIn
      ? await getArgsSwapExactInput(
          amountIn.decimalAmount,
          BigNumb(amountOut.decimalAmount)
            .multipliedBy(1 - +slippage)
            .toFixed(0),
          trades,
          coinIn,
          account,
          ""
        )
      : await getArgsSwapExactOutput(
          amountIn.decimalAmount,
          amountOut.decimalAmount,
          trades,
          coinIn,
          account,
          ""
        );

    // console.log('=======> Swap Args ==========>');
    // console.log('Args: ', args);
    // console.log('Amount in: ', amountIn.decimalAmount);
    // console.log('Amount out: ', amountOut.decimalAmount);
    // console.log('Type Args: ', typeArguments);
    // console.log('=======> End Args ==========>');
    // console.log("KKK", tx);
    const txb = await swap(tx, typeArguments, args, callFunction);
    return txb;
  } catch (e) {
    console.log("error", e);
    throw `ERROR SWAP: ${e}`;
  }
};
