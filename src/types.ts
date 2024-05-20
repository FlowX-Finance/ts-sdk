import { TransactionBlock } from "@mysten/sui.js";
import BigNumber from "bignumber.js";

export interface PairStats {
  volume7D: number | string;
  volume24H: number | string;
  transaction24H: number | string;
  totalLiquidity: number | string;
  fee24H: number | string;
  aprPerformance7D: number | string;
  totalLiquidityInUSD: string | number;
}
export interface PairRanking {
  reserveY: number | string;
  reserveX: number | string;
  lpType: string;
  explorerUrl?: string;
  coinYType: string;
  coinXType: string;
  isNewPair?: boolean;
  createdBy?: string;
  lpObjectId: string;
  lpName?: string;
  createdAtTimestamp: number | null;
  stats: PairStats;
}
export interface CoinStats {
  totalLiquidityInUSD: number | string;
  priceChange24H: number | string;
  price: number | string;
  volume7D: number | string;
  volume24H: number | string;
  transaction24H: number | string;
  totalLiquidity: number | string;
  fee24H: number | string;
}
export interface CoinMetadata {
  type: string;
  decimals: number;
  description?: string;
  iconUrl?: string;
  isVerified?: boolean;
  symbol?: string;
  balance?: string;
  derivedSUI?: string;
  derivedPriceInUSD?: string;
  name?: string;
  id?: string;
  stats?: CoinStats;
  twitterUrl?: string;
  websiteUrl?: string;
  coinMarketcapUrl?: string;
  coingeckoUrl?: string;
  __typename?: string;
}
export interface ICoinBalance {
  balance: string;
  type: string;
}
export type Reserve = {
  fields: {
    balance: string;
  };
  type: string;
};
export interface IPoolInfo {
  objectId?: string;
  reserveX?: Reserve;
  reserveY?: Reserve;
  totalLpSupply?: string;
  coinX?: string;
  coinY?: string;
  lpType?: string;
  feeRate?: number;
}
export interface IRawCoins {
  coinX?: string;
  coinY?: string;
}
export interface IFullDataCoins {
  coinX?: CoinMetadata;
  coinY?: CoinMetadata;
  apr?: string;
  lpValue?: string;
  userLpBalance?: string;
}
export interface IPools {
  coinXType?: string;
  coinYType?: string;
  createdAtTimestamp?: number;
  createdBy?: string;
  explorerUrl?: string;
  feeRate?: number;
  lpName?: string;
  lpObjectId?: string;
  lpType?: string;
  objectId?: string;
  stats?: {
    aprPerformance7D?: string;
    fee24H?: string;
    totalLiquidity?: string;
    totalLiquidityInUSD?: string;
    transaction24H?: number;
    volume7D: string;
    volume24H?: string;
    __typename?: string;
  };
  totalLpSupply?: string;
  reserveX?: Reserve;
  reserveY?: Reserve;
  __typename?: string;
}
export interface IGetLpPrice {
  poolInfo: IPools;
  coinX: CoinMetadata;
  coinY: CoinMetadata;
}
export interface ILiquidity extends IFullDataCoins, IPools {}
export interface IPoolInfos extends IRawCoins, IPools {}
export interface IFaasUserRw {
  token: CoinMetadata;
  amount: string;
}
export interface IGenesisUserJoin {
  type: string;
  lp_locked_amount: string;
  xflx_locked_amount: string;
  id: string;
  pool_id: string;
  pool_idx: string;
  acc_pending_rewards: string;
}
export interface IGenesisPoolsData {
  totalLpDeposit: string;
  totalXFlxDeposit: string;
  totalPendingReward: string;
  coinX: CoinMetadata;
  coinY: CoinMetadata;
}
export interface IAprPdrwposition {
  apr: string;
  pendingReward: string;
  __typename: string;
}
export interface IFaasData {
  coinX: CoinMetadata;
  coinY: CoinMetadata;
  userReward: IFaasUserRw[];
  totalLpDeposit: string;
}
export interface IPairsRankingItem {
  reserveX: number;
  reserveY: number;
  stats: {
    volume7D: string;
    volume24H: string;
    transaction24H: number;
    totalLiquidityInUSD: string;
    totalLiquidity: string;
    fee24H: string;
    aprPerformance7D: string;
  };
  lpType: string;
  lpObjectId: string;
  lpName: string;
  explorerUrl: string;
  createdBy: string;
  createdAtTimestamp: number;
  coinY: string;
  coinX: string;
}
export interface IFaasV2 {
  id: string;
  poolIndex: string;
  started_at_ms: string | number;
  ended_at_ms: string | number;
  creator: string;
  totalLiquid: string | number;
  totalLiquidDecimal: string | number;
  totalLpDeposit: string;
  rewardApr: string;
  tradingApr: string;
  userReward: IFaasUserRw[];
  poolReward: IFaasUserRw[];
  isLegacy: boolean;
  lpPrice: string;
  poolLiquid: IPoolInfo;
}
export class Coin {
  coinType: string;
}
export type Amount = {
  amount: number | string;
  decimalAmount: number | string;
};
export interface GetSplitSmartRoute {
  path: {
    routes: Route[];
    amountIn: string;
    amountOut: string;
    coinTypeOut: string;
    coinTypeIn: string;
  };
  rate: number;
}
export interface PairSetting {
  _id?: string;
  coinXType: string;
  coinYType: string;
  createdBy?: string;
  createdAt?: string;
  isNewPair?: boolean;
  lpType?: string;
  lpName?: string;
  userLpBalance?: string;
  reserveX?: string;
  reserveY?: string;
  lpObjectId?: string;
  inRate?: string;
  outRate?: string;
  stats?: PairStats;
}
export type PoolInfo = {
  objectId?: string;
  reserveX?: Reserve;
  reserveY?: Reserve;
  totalLpSupply?: string;
  coinX?: string;
  coinY?: string;
  lpType?: string;
  feeRate?: number;
  kLast?: string;
};
export type SmartRoute = {
  amountIn?: string | number;
  amountOut?: string | number;
  routes?: {
    coinTypeIn?: string;
    coinTypeOut?: string;
    amountIn?: string | number;
    amountOut?: string | number;
    pair?: PairSetting;
  }[];
};
export interface SwapArgs {
  typeArguments: string[];
  args: any[];
  tx: TransactionBlock;
  callFunction: string;
}
export interface ICalcAmountExact {
  amountIn: Amount;
  amountOut: Amount;
  trades: PairSetting[];
  smartRoute: SmartRoute;
}
export interface IGetPools {
  poolInfos: IPools[];
  pairs: PairSetting[];
}

export class Route {
  protocol?: string;
  lpObjectId?: string;
  pairId?: string;
  pairType?: string;
  fee?: number;
  coinX?: Coin;
  coinY?: Coin;
  reserveX?: number;
  reserveY?: number;
  amountIn?: BigNumber;
  amountOut?: BigNumber;
  //V3
  poolId?: string;
  sourceType?: string;
  sqrtPrice?: string;
  liquidity?: string;
  tickIndex?: string;
  swapXtoY?: boolean;
  lpType?: string;
}
export interface ISmartPathV3 {
  info: {
    routes: Route[];
    amountIn: BigNumber;
    amountOut: BigNumber;
    coinTypeOut: string;
    coinTypeIn: string;
  };
  rate: number;
}
export interface ISmartRouting {
  paths: ISmartPathV3[];
  amountOut: string;
}
export interface ITradeRateItem {
  coinInType: string;
  coinOutType: string;
  outRate: string;
  inRate: string;
}
export interface IEstimateGasResult {
  fee: string;
  amountOut: string;
  pathsAmountOut: string[];
}
export type TSourceSmartRouting =
  | "FLOWX"
  | "FLOWX_CLMM"
  | "KRIYA"
  | "TURBOS"
  | "CETUS"
  | "AFTERMATH";
