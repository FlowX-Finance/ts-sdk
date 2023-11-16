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
  decimals?: number;
  description?: string;
  iconUrl?: string;
  type: string;
  isVerified?: boolean;
  symbol: string;
  balance?: number | string;
  derivedSUI?: number | string;
  derivedPriceInUSD?: number | string;
  name?: string;
  id?: string;
  stats?: CoinStats;
  twitterUrl?: string;
  websiteUrl?: string;
  coinMarketcapUrl?: string;
  coingeckoUrl?: string;
}
export interface ICoinBalance {
  balance: number;
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
  totalLpDeposit: string;
  rewardApr: string;
  tradingApr: string;
  userReward: IFaasUserRw[];
  poolReward: IFaasUserRw[];
  isLegacy: boolean;
  lpPrice: string;
  poolLiquid: IPoolInfo;
}
