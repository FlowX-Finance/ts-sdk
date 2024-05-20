import { TransactionArgument, TransactionBlock } from "@mysten/sui.js";
import { MODULE, SWAP_V3 } from "../../constants";

export const SwapAfterMathHandle = async (
  routeObject: any,
  lpType: string,
  coinInType: string,
  coinOutType: string,
  poolId: string,
  amountOut: string,
  txb?: TransactionBlock
): Promise<TransactionArgument & TransactionArgument[]> => {
  let tx = new TransactionBlock();
  if (txb) tx = txb;
  return tx.moveCall({
    target: `${SWAP_V3.UNIVERSAL_ROUTER}::${MODULE.UNIVERSAL_ROUTER}::aftermath_swap_exact_input`,
    typeArguments: [lpType, coinInType, coinOutType],
    arguments: [
      routeObject,
      tx.object(
        "0xfcc774493db2c45c79f688f88d28023a3e7d98e4ee9f48bbf5c7990f651577ae"
      ), // pool_registry
      tx.object(poolId),
      tx.object(
        "0xf194d9b1bcad972e45a7dd67dd49b3ee1e3357a00a50850c52cd51bb450e13b4"
      ), // protocol_fee_vault
      tx.object(
        "0x28e499dff5e864a2eafe476269a4f5035f1c16f338da7be18b103499abf271ce"
      ), // treasury
      tx.object(
        "0xf0c40d67b078000e18032334c3325c47b9ec9f3d9ae4128be820d54663d14e3b"
      ), // insurance_fund
      tx.object(
        "0x35d35b0e5b177593d8c3a801462485572fc30861e6ce96a55af6dc4730709278"
      ), //referral_vault
      tx.pure(amountOut), // Amount out from paths api
    ],
  });
};
