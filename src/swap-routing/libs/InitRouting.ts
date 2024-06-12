import { TransactionResult, Transaction } from "@mysten/sui/transactions";
import { BigNumber } from "../../BigNumber";
import { MODULE, SWAP_V3 } from "../../constants";

export const InitRouting = async (
  coinInType: string,
  coinOutType: string,
  firstPathObject: any,
  pathAmountOut: number,
  slippage: number,
  deadline: number,
  pathSize: number,
  txb?: Transaction
): Promise<TransactionResult> => {
  try {
    // console.log(
    //   "InitRouting",
    //   coinInType,
    //   coinOutType,
    //   firstPathObject,
    //   pathAmountOut,
    //   slippage,
    //   deadline,
    //   pathSize,
    //   txb
    // );
    let tx = new Transaction();
    if (txb) tx = txb;
    return tx.moveCall({
      target: `${SWAP_V3.UNIVERSAL_ROUTER}::${MODULE.UNIVERSAL_ROUTER}::initialize_routing`,
      typeArguments: [coinInType, coinOutType],
      arguments: [
        firstPathObject,
        tx.pure.u64(pathAmountOut),
        tx.pure.u64(BigNumber(slippage).multipliedBy(1e6).toFixed(0)),
        tx.pure.u64(deadline),
        tx.pure.u64(pathSize),
      ],
    });
  } catch (error) {
    console.log("InitPath ERROR", error);
  }
};
