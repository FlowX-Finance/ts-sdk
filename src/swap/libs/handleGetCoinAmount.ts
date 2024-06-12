import { TransactionArgument, Transaction } from "@mysten/sui/transactions";
import { getCoinOjectIdsByAmount } from "./getCoinOjectIdsByAmount";
import { BigNumb } from "../../BigNumber";
import { getSuiCoinForTx } from "./getSuiCoinForTx";
import { SUI_TYPE } from "../../constants";

export const handleGetCoinAmount = async (
  amount: number | string,
  account: string,
  coinType: string,
  inheritTx?: Transaction
): Promise<{ tx: Transaction; coin: string | TransactionArgument }> => {
  const tx = inheritTx ?? new Transaction();
  const bigintAmount = BigNumb(amount).toFixed(0);
  const { objectIds, balance, objectCoins } = await getCoinOjectIdsByAmount(
    account,
    bigintAmount,
    coinType
  );
  if (coinType === SUI_TYPE) {
    return await getSuiCoinForTx(amount, tx);
  }
  //handle merge and split other coins
  let coinObjectId: any = objectIds[0];
  if (objectIds.length > 1) {
    tx.mergeCoins(
      tx.object(coinObjectId),
      objectIds.slice(1).map((item) => tx.object(item))
    );
  }
  const splitAmount = BigNumb(balance).minus(bigintAmount).toFixed();
  if (BigNumb(splitAmount).isGreaterThan(0)) {
    // split correct amount to swap
    const [coin] = tx.splitCoins(tx.object(coinObjectId), [
      splitAmount,
    ]);
    tx.transferObjects([coin], account);
  }

  return { tx, coin: coinObjectId };
};
