import { TransactionArgument, TransactionBlock } from "@mysten/sui.js";
import { getCoinOjectIdsByAmount } from "./getCoinOjectIdsByAmount";
import { BigNumberInstance } from "../../BigNumber";
import { getSuiCoinForTx } from "./getSuiCoinForTx";
import { SUI_TYPE } from "../../constants";

export const handleGetCoinAmount = async (
  amount: number | string,
  account: string,
  coinType: string,
  inheritTx?: TransactionBlock
): Promise<{ tx: TransactionBlock; coin: string | TransactionArgument }> => {
  const tx = inheritTx ?? new TransactionBlock();
  const bigintAmount = BigInt(BigNumberInstance(amount).toFixed(0));
  const { objectIds, balance, objectCoins } = await getCoinOjectIdsByAmount(
    account,
    bigintAmount,
    coinType
  );
  if (coinType === SUI_TYPE) {
    return await getSuiCoinForTx(objectCoins, amount, tx);
  }
  //handle merge and split other coins
  let coinObjectId: any = objectIds[0];
  if (objectIds.length > 1) {
    tx.mergeCoins(
      tx.object(coinObjectId),
      objectIds.slice(1).map((item) => tx.object(item))
    );
  }
  const splitAmount = BigNumberInstance(balance)
    .minus(bigintAmount.toString())
    .toFixed();
  if (BigNumberInstance(splitAmount).isGreaterThan(0)) {
    // split correct amount to swap
    const [coin] = tx.splitCoins(tx.object(coinObjectId), [
      tx.pure(splitAmount),
    ]);
    tx.transferObjects([coin], tx.pure(account));
  }

  return { tx, coin: coinObjectId };
};
