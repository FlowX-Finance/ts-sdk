import {
  Transaction,
  TransactionResult,
} from "@mysten/sui/transactions";

export const getSuiCoinForTx = async (
  amount: string | number,
  tx: Transaction
): Promise<{ tx: Transaction; coin: TransactionResult }> => {
  return { tx, coin: tx.splitCoins(tx.gas, [amount]) };
};
