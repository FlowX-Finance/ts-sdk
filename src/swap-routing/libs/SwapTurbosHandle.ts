import { TransactionArgument, TransactionBlock } from "@mysten/sui.js";
import { MODULE, SWAP_V3 } from "../../constants";
import { CLOCK_ID } from "../../constants";

export const SwapTurbosHandle = async (
  routeObject: any,
  coinInType: string,
  coinOutType: string,
  swapXtoY: boolean,
  poolId: string,
  feeTier: string | number,
  sqrtPriceLimit: string,
  txb?: TransactionBlock
): Promise<TransactionArgument & TransactionArgument[]> => {
  let tx = new TransactionBlock();
  // console.log(
  //   "TURBOS",
  //   routeObject,
  //   coinInType,
  //   coinOutType,
  //   swapXtoY,
  //   poolId,
  //   feeTier
  // );
  if (txb) tx = txb;
  return tx.moveCall({
    target: `${SWAP_V3.UNIVERSAL_ROUTER}::${MODULE.UNIVERSAL_ROUTER}::${
      swapXtoY ? "turbos_swap_exact_x_to_y" : "turbos_swap_exact_y_to_x"
    }`,
    typeArguments: [
      swapXtoY ? coinInType : coinOutType,
      swapXtoY ? coinOutType : coinInType,
      `0x91bfbc386a41afcfd9b2533058d7e915a1d3829089cc268ff4333d54d6339ca1::fee${feeTier}bps::FEE${feeTier}BPS`,
    ],
    arguments: [
      routeObject,
      tx.object(poolId),
      tx.pure(sqrtPriceLimit),
      tx.object(
        "0xf1cf0e81048df168ebeb1b8030fad24b3e0b53ae827c25053fff0779c1445b6f"
      ), //Version
      tx.object(CLOCK_ID),
    ],
  });
};
