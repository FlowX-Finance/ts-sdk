import { TransactionArgument, TransactionBlock } from "@mysten/sui.js";
import { MODULE, SWAP_V3 } from "../../constants";
import { CLOCK_ID } from "../../constants";

export const SwapCetusHandle = async (
  routeObject: any,
  coinInType: string,
  coinOutType: string,
  swapXtoY: boolean,
  poolId: string,
  txb?: TransactionBlock
): Promise<TransactionArgument & TransactionArgument[]> => {
  // console.log(
  //   "CETUS",
  //   routeObject,
  //   coinInType,
  //   coinOutType,
  //   swapXtoY,
  //   poolId,
  //   CLOCK_ID
  // );
  let tx = new TransactionBlock();
  if (txb) tx = txb;
  return tx.moveCall({
    target: `${SWAP_V3.UNIVERSAL_ROUTER}::${MODULE.UNIVERSAL_ROUTER}::${
      swapXtoY ? "cetus_swap_exact_x_to_y" : "cetus_swap_exact_y_to_x"
    }`,
    typeArguments: [
      swapXtoY ? coinInType : coinOutType,
      swapXtoY ? coinOutType : coinInType,
    ],
    arguments: [
      routeObject,
      tx.object(
        "0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f"
      ), //Global config
      tx.object(poolId),
      tx.object(CLOCK_ID),
    ],
  });
};
