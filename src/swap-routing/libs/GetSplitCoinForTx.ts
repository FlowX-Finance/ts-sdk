import { TransactionArgument, TransactionBlock } from "@mysten/sui.js";
import { getCoinOjectIdsByAmount } from "../../swap/libs/getCoinOjectIdsByAmount";
import { SUI_TYPE } from "../../constants";

export const getSplitCoinForTx = async (
  account: string,
  amount: string,
  splits: string[],
  coinType: string,
  inheritTx?: TransactionBlock,
  inspecTransaction?: boolean
): Promise<{
  tx: TransactionBlock;
  coinData: TransactionArgument & TransactionArgument[];
}> => {
  const tx = inheritTx ?? new TransactionBlock();
  // console.log('splits', splits);
  const { objectIds, objectCoins } = await getCoinOjectIdsByAmount(
    account,
    amount,
    coinType
  );
  let coinObjectId: any = objectIds[0];
  if (coinType === SUI_TYPE) {
    let pureAmount = [];
    for (const split of splits) {
      pureAmount.push(tx.pure(split));
    }
    let coin;
    if (inspecTransaction) {
      if (objectIds.length > 1) {
        tx.mergeCoins(
          tx.object(coinObjectId),
          objectIds.slice(1).map((item) => tx.object(item))
        );
      }
      coin = tx.splitCoins(tx.object(coinObjectId), pureAmount);
    } else {
      coin = tx.splitCoins(tx.gas, pureAmount);
    }
    return { tx, coinData: coin };
  }
  // console.log('objectIds', objectIds);
  if (objectIds.length > 1) {
    tx.mergeCoins(
      tx.object(coinObjectId),
      objectIds.slice(1).map((item) => tx.object(item))
    );
  }

  //handle split coin
  let pureAmount = [];
  for (const split of splits) {
    pureAmount.push(tx.pure(split));
  }
  // split correct amount to swap
  const coinData = tx.splitCoins(tx.object(coinObjectId), pureAmount);
  return { tx, coinData };
};
