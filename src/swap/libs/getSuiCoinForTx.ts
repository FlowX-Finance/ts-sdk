import {
  CoinStruct,
  TransactionArgument,
  TransactionBlock,
} from "@mysten/sui.js";

export const getSuiCoinForTx = async (
  amount: string | number,
  tx: TransactionBlock
): Promise<{ tx: TransactionBlock; coin: string | TransactionArgument }> => {
  return { tx, coin: tx.splitCoins(tx.gas, [tx.pure(amount)]) };
};
