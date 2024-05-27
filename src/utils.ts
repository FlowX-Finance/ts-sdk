import {
  JsonRpcProvider,
  PaginatedObjectsResponse,
  SuiObjectDataFilter,
  SuiObjectDataOptions,
  SuiObjectResponse,
  TransactionBlock,
  getPureSerializationType,
} from "@mysten/sui.js";
import {
  FUNCTION,
  LP_DECIMAL,
  MAX_LIMIT_PER_RPC_CALL,
  SUI_FULL_TYPE,
  SUI_TYPE,
  client,
  provider,
} from "./constants";
import { BIG_TEN, BigNumber, BigNumb } from "./BigNumber";
import {
  CoinMetadata,
  ICoinBalance,
  IGetLpPrice,
  IGetPools,
  IPairsRankingItem,
  IPoolInfo,
  IPools,
  PairSetting,
  PoolInfo,
} from "./types";
import Lodash from "./lodash";
import {
  COIN_SETTING_QUERY,
  GET_PAIRS,
  GET_PAIR_RANKING_INFO,
} from "./queries";
import { isObject } from "lodash";

export const nowInMilliseconds = () => {
  return Date.now();
};

export const wait = (ms: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

export function last<T>(collections: T[]) {
  return collections[collections.length - 1];
}

export const fetchOwnedObjects = async (
  owner: string,
  objectType: string,
  jsonRpcProvider: JsonRpcProvider
) => {
  let cursor = null,
    hasNextPage = false,
    objects = [];
  do {
    const res = await jsonRpcProvider.getOwnedObjects({
      owner,
      cursor,
      limit: MAX_LIMIT_PER_RPC_CALL,
      filter: {
        StructType: objectType,
      },
      options: {
        showContent: true,
        showOwner: true,
        showType: true,
      },
    });
    hasNextPage = res.hasNextPage;
    cursor = res.nextCursor;
    objects.push(res.data.map((item) => item.data));
  } while (!!hasNextPage);

  return objects;
};

export const callGraphQL = async (
  url: string,
  payload: {
    query: string;
    variables: any;
  },
  extractor?: (res: any) => any
) => {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "content-type": "application/json",
    },
  })
    .catch((error) => {
      throw error;
    })
    .then((res) => res.json());

  if (!!res.errors) {
    console.error(
      "callGraphQL: could not execute graphQL request due to error",
      res.errors
    );
    throw new Error(res.errors[0].extensions.code);
  }

  if (!!extractor) {
    return extractor(res.data);
  }

  return res.data;
};

export const SuiTypeMiniNormalize = (type: string) => {
  return type === SUI_FULL_TYPE ? SUI_TYPE : type;
};
export const removeLeadingZeros = (hexString) => {
  return hexString.replace(/^0+/, "");
};

export const convertAmountDecimal = (amount: number, decimals: number) => {
  return amount / 10 ** decimals;
};
export const stripZeros = (a: string): string => {
  let first = a[0];
  while (a.length > 0 && first.toString() === "0") {
    a = a.slice(1);
    first = a[0];
  }
  return a;
};
export const addZerosX = (text: string): string => {
  return `${text.startsWith("0x") ? "" : "0x"}${text}`;
};
export const getLpType = (lpType: string, coinX: string, coinY: string) => {
  if (!lpType) {
    return "";
  }
  let lpTypeFormatted: any = lpType.split("Supply")[1].slice(1, -1);
  lpTypeFormatted = lpTypeFormatted.split("<");
  return `${lpTypeFormatted[0]}<${coinX}, ${coinY}>`;
};
export const formatCoinType = (type: string): string => {
  const COIN_TYPE_ARG_REGEX = /^0x2::coin::Coin<(.+)>$/;
  const [, res] = type.match(COIN_TYPE_ARG_REGEX) ?? [];
  const typeFormatted = stripZeros(res.slice(2) || "");

  return `0x${typeFormatted}`;
};
export const getDecimalAmount = (
  amount: string | number,
  decimals = LP_DECIMAL
) => {
  return BigNumb(amount).times(BIG_TEN.pow(decimals)).toFixed();
};

export const getBalanceAmount = (
  amount: string | number,
  decimals = LP_DECIMAL
) => {
  return BigNumb(amount).div(BIG_TEN.pow(decimals));
};

export const calculateReceiveAmount = (
  poolInfo: IPoolInfo,
  coinX: CoinMetadata,
  coinY: CoinMetadata
) => {
  if (!poolInfo) {
    return { amountX: 0, amountY: 0 };
  }
  const lpRate = 1 / getBalanceAmount(poolInfo.totalLpSupply).toNumber();
  const amountX =
    lpRate *
    getBalanceAmount(
      typeof poolInfo.reserveX === "string"
        ? poolInfo.reserveX
        : poolInfo.reserveX.fields.balance,
      coinX.decimals
    ).toNumber();
  const amountY =
    lpRate *
    getBalanceAmount(
      typeof poolInfo.reserveY === "string"
        ? poolInfo.reserveY
        : poolInfo.reserveY.fields.balance,
      coinY.decimals
    ).toNumber();
  return { amountX, amountY };
};
export const standardizeType = (type: string, fullTypeIfSui?: boolean) => {
  const OBJECT_ID_LENGTH = 64;
  const REGEX_MOVE_OBJECT_ID = /^(0x)?[0-9a-fA-F]{1,64}/g;
  let originalCoinX = null;
  originalCoinX = type?.replace(REGEX_MOVE_OBJECT_ID, (match: string) => {
    return `0x${stripZeros(
      match.replace("0x", "").padStart(OBJECT_ID_LENGTH, "0")
    )}`;
  });
  return type === SUI_FULL_TYPE && !fullTypeIfSui
    ? SUI_TYPE
    : originalCoinX === SUI_TYPE && fullTypeIfSui
    ? SUI_FULL_TYPE
    : originalCoinX;
};
export const getLpPrice = ({ poolInfo, coinX, coinY }: IGetLpPrice) => {
  const { amountX, amountY } = calculateReceiveAmount(poolInfo, coinX, coinY);
  const amountXValueInUsd = BigNumb(amountX).multipliedBy(
    coinX.derivedPriceInUSD
  );
  const amountYValueInUsd = BigNumb(amountY).multipliedBy(
    coinY.derivedPriceInUSD
  );
  return amountXValueInUsd.plus(amountYValueInUsd).toFixed();
};
export const sortData = (
  inputData: any[],
  sortType?: string,
  order?: "asc" | "desc" | string
) => {
  let tempArr = [...inputData];
  if ((order === "asc" || order === "desc") && sortType) {
    const sortOrder = order === "asc" ? 1 : -1;
    const compare = (a: any, b: any) => {
      const valueA = +a[sortType];
      const valueB = +b[sortType];
      if (valueA < valueB) {
        return -1 * sortOrder;
      } else if (valueA > valueB) {
        return 1 * sortOrder;
      } else {
        return 0;
      }
    };
    tempArr.sort(compare);
  }
  return tempArr;
};
export const getFullyOwnedObjects = async (
  account: string,
  options: SuiObjectDataOptions,
  filter?: SuiObjectDataFilter
) => {
  let hasNextPage = false;
  const data: any[] = [];
  let cursor = null;
  do {
    const results: PaginatedObjectsResponse = await provider.getOwnedObjects({
      owner: account,
      options,
      cursor,
      filter,
    });

    cursor = results.nextCursor;
    hasNextPage = results.hasNextPage;

    data.push(...results.data);
  } while (hasNextPage);

  return data;
};

export const extractTypeFaas = (type: string) => {
  const pair = type.split("Pool<")[1];
  const coinXType = pair.split(", ")[0];
  const coinYType = pair.split(", ")[1];
  return { coinXType, coinYType };
};
export const getPoolInfos = async (
  lpObjectIds: string[]
): Promise<IPoolInfo[]> => {
  try {
    const splitObjectIds = [];
    //split array if array is more than 50 elements because
    for (let i = 0; i < lpObjectIds.length; i += 49) {
      splitObjectIds.push(lpObjectIds.slice(i, i + 49));
    }
    const splitPoolInfos = await Promise.all(
      //50 ids maximum
      splitObjectIds.map((items) =>
        provider.multiGetObjects({ ids: items, options: { showContent: true } })
      )
    );
    const poolInfos: IPoolInfo[] = [];
    splitPoolInfos.map((_poolInfos) => {
      _poolInfos.map((data) => {
        const _poolInfo = (data.data.content as any).fields.value.fields;
        const coinX = formatCoinType(_poolInfo.reserve_x.type);
        const coinY = formatCoinType(_poolInfo.reserve_y.type);
        poolInfos.push({
          objectId: data.data.objectId,
          reserveX: _poolInfo.reserve_x,
          reserveY: _poolInfo.reserve_y,
          totalLpSupply: _poolInfo.lp_supply.fields.value,
          lpType: getLpType(_poolInfo.lp_supply.type, coinX, coinY),
          coinX,
          coinY,
          feeRate: _poolInfo.fee_rate
            ? parseFloat(_poolInfo.fee_rate) / 10000
            : 0.003, //default 0.003% if not set
        });
      });
    });
    return poolInfos;
  } catch (e) {
    throw e;
  }
};
export const getPairs = async (): Promise<PairSetting[]> => {
  try {
    const res: any = await client().request(GET_PAIRS, {
      size: 100,
    });
    return res.getPairs;
  } catch (error) {
    throw error;
  }
};
export const getPools = async (): Promise<IGetPools> => {
  try {
    const pairs = await getPairs();
    const pairObjectIds = pairs?.map((item) => item.lpObjectId);
    const poolInfo = await getPoolInfos(pairObjectIds);
    return {
      poolInfos: poolInfo.map((item: any, i: number) => ({
        ...pairs[i],
        ...item,
      })),
      pairs,
    };
  } catch (error) {
    throw error;
  }
};
export const getCoinsFlowX = async (signal?: any): Promise<CoinMetadata[]> => {
  try {
    let variable: any = {
      size: 9999,
    };
    const res: any = await client(signal).request(COIN_SETTING_QUERY, variable);
    const listData: CoinMetadata[] = res.getCoinsSettings.items;
    return listData;
  } catch (error) {
    throw error;
  }
};
export const getCoinsBalance = async (
  address?: string
): Promise<ICoinBalance[]> => {
  if (!address) return [];
  const balances = await provider.getAllBalances({ owner: address });
  const balancesFormatted = balances.map((item) => {
    return {
      type: item.coinType,
      balance: BigNumber(item.totalBalance).toFixed(),
    };
  });
  return Lodash.sortBy(balancesFormatted, ["type", "balance"]);
};

export const getAllCoinsWithBalance = async (
  address: string
): Promise<{ coins: CoinMetadata[]; coinBalances: ICoinBalance[] }> => {
  try {
    const [coins, coinBalances] = await Promise.all([
      getCoinsFlowX(),
      getCoinsBalance(address),
    ]);
    let filterListCoinBalance: ICoinBalance[] = [];
    for (let i = 0; i < coinBalances.length; i++) {
      if (coins.findIndex((item) => item.type === coinBalances[i].type) > -1) {
        filterListCoinBalance.push(coinBalances[i]);
      }
    }
    return { coins, coinBalances: filterListCoinBalance };
  } catch (error) {
    throw error;
  }
};
export const getBasicData = async (
  address?: string
): Promise<{
  coins: CoinMetadata[];
  coinBalances: ICoinBalance[];
  poolInfos: any[];
}> => {
  const [coins, coinBalances, poolInfos] = await Promise.all([
    getCoinsFlowX(),
    getCoinsBalance(address),
    (await getPools()).poolInfos,
  ]);
  return {
    coins,
    coinBalances,
    poolInfos,
  };
};
export const initTxBlock = async (
  packageId: string,
  moduleName: string,
  functionName: string,
  params: any[],
  types?: string[],
  tx?: TransactionBlock
): Promise<any> => {
  if (!tx) {
    tx = new TransactionBlock();
  }

  const functionDetails = await provider.getNormalizedMoveModule({
    package: packageId,
    module: moduleName,
  });

  const args: any =
    params?.map((param: any, i: number) => {
      return isObject(param)
        ? param
        : getPureSerializationType(
            functionDetails.exposedFunctions[functionName]["parameters"][i],
            param
          )
        ? tx.pure(param)
        : tx.object(param);
    }) ?? [];
  tx.moveCall({
    target: `${packageId}::${moduleName}::${functionName}`,
    typeArguments: types ?? [],
    arguments: args,
  });

  // tx.moveCall({
  //   target: `$0x2::coin::zero`,
  //   typeArguments: types ?? [],
  //   arguments: args,
  // });
  return tx;
};
export const getPairsRankingFlowX = async (): Promise<any> => {
  try {
    const res: any = await client().request(GET_PAIR_RANKING_INFO, {
      page: 1,
      size: 100,
    });
    const listData: IPairsRankingItem[] = res.getPairRankings.items;
    return listData;
  } catch (error) {
    throw error;
  }
};
export const getMultipleObjectIds = async (
  lpObjectIds: string[]
): Promise<SuiObjectResponse[]> => {
  const splitObjectIds = [];
  //split array if array is more than 50 elements because
  for (let i = 0; i < lpObjectIds.length; i += 49) {
    splitObjectIds.push(lpObjectIds.slice(i, i + 49));
  }
  const splitContentInfos = await Promise.all(
    //50 ids maximum
    splitObjectIds.map((items) =>
      provider.multiGetObjects({ ids: items, options: { showContent: true } })
    )
  );
  return Lodash.flatten(splitContentInfos);
};
export const extractPair = (type: string): string[] => {
  const coinData = type
    .slice(type.indexOf("<") + 1, type.lastIndexOf(">"))
    .split(", ");
  return [coinData[coinData.length - 2], coinData[coinData.length - 1]];
};
export const orderByKey = (
  array: any[],
  key: string,
  sortBy: "desc" | "asc"
) => {
  if (!array?.length) {
    return;
  }
  let swapped;
  const compareFunctionName =
    sortBy === "desc" ? "isLessThan" : "isGreaterThan";
  do {
    swapped = false;
    for (let i = 0; i < array.length - 1; i++) {
      if (BigNumb(array[i][key])[compareFunctionName](array[i + 1][key])) {
        let temp = array[i];
        array[i] = array[i + 1];
        array[i + 1] = temp;
        swapped = true;
      }
    }
  } while (swapped);
  return array;
};
export const estimateDealine = () => {
  const time = "20";
  const currentDate = new Date().getTime();
  return +BigNumb(currentDate).plus(+time * 60_000);
};

export const getAmountOut = (
  amountIn: string | number,
  reserveIn: string,
  reserveOut: string,
  fee: number
): string => {
  const amountWithFee = BigNumb(amountIn).multipliedBy(1 - fee);
  const numerator = amountWithFee.multipliedBy(reserveOut);
  const denominator = amountWithFee.plus(reserveIn);

  return numerator.dividedBy(denominator).toFixed(0);
};

export const getReserveByCoinType = (coinX: string, pairSetting: PoolInfo) => {
  if (coinX === pairSetting.coinX) {
    return {
      reserveX: pairSetting.reserveX?.fields?.balance || "0",
      reserveY: pairSetting.reserveY?.fields?.balance || "0",
    };
  }

  return {
    reserveX: pairSetting.reserveY?.fields?.balance || "0",
    reserveY: pairSetting.reserveX?.fields?.balance || "0",
  };
};
export const getFullyMultiObject = async (objectIds: string[]) => {
  try {
    let finalArr = [];
    for (let i = 0; i < objectIds.length; i += 50) {
      const data = objectIds.slice(i, i + 50);
      const res = await provider.multiGetObjects({
        ids: data,
        options: { showContent: true },
      });
      finalArr.push(...res);
    }
    return finalArr;
  } catch (error) {
    console.log("getFullyMultiObject error", error);
  }
};
export const getFullyDynamicFields = async (id: string) => {
  let hasNextPage = false,
    dynamicFieldObjects = [],
    cursor: string = null;
  do {
    const res = await provider.getDynamicFields({
      parentId: id,
      cursor,
      limit: 50,
    });
    hasNextPage = res.hasNextPage;
    cursor = res.nextCursor;
    dynamicFieldObjects.push(...res.data.map((item) => item));
  } while (!!hasNextPage);
  return dynamicFieldObjects;
};
export const createZeroCoin = (tx: TransactionBlock, coinType: string) => {
  const [zeroCoin] = tx.moveCall({
    target: `0x2::coin::zero`,
    typeArguments: [coinType],
  });
  return zeroCoin;
};
