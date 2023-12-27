import { gql } from "graphql-request";

export const GET_PAIRS = gql`
  query GetPairs($lpTypes: [String!], $createdBy: String) {
    getPairs(lpTypes: $lpTypes, createdBy: $createdBy) {
      coinXType
      coinYType
      explorerUrl
      lpName
      lpObjectId
      lpType
      reserveX
      reserveY
      createdAtTimestamp
      createdBy
      stats {
        aprPerformance7D
        fee24H
        totalLiquidity
        totalLiquidityInUSD
        transaction24H
        volume7D
        volume24H
      }
    }
  }
`;

export const COIN_SETTING_QUERY = gql`
  query GetCoinsSettings(
    $size: Int
    $page: Int
    $sortBy: String
    $sortDirection: SortDirection
  ) {
    getCoinsSettings(
      size: $size
      page: $page
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      items {
        type
        symbol
        iconUrl
        description
        decimals
        derivedSUI
        derivedPriceInUSD
        name
        isVerified
      }
      page
      size
      total
    }
  }
`;

export const GET_POSITION_APR_PDRW = gql`
  query MultiGetPositionsStats($farmObjectId: String!, $objectIds: [String!]!) {
    multiGetPositionsStats(farmObjectId: $farmObjectId, objectIds: $objectIds) {
      apr
      pendingReward
    }
  }
`;

export const GET_PAIR_RANKING_INFO = gql`
  query GetPairRankings(
    $size: Int
    $page: Int
    $sortBy: String
    $sortDirection: SortDirection
    $coin: String
  ) {
    getPairRankings(
      size: $size
      page: $page
      sortBy: $sortBy
      sortDirection: $sortDirection
      coin: $coin
    ) {
      items {
        reserveX
        reserveY
        stats {
          volume7D
          volume24H
          transaction24H
          totalLiquidityInUSD
          totalLiquidity
          fee24H
          aprPerformance7D
        }
        lpType
        lpObjectId
        lpName
        explorerUrl
        createdBy
        createdAtTimestamp
        coinY
        coinX
      }
      page
      size
      total
    }
  }
`;
export const getSplitSmartRouteQuery = gql`
  query GetSplitSmartRoute(
    $coinTypeIn: String!
    $coinTypeOut: String!
    $amountIn: String!
  ) {
    getSplitSmartRoute(
      coinTypeIn: $coinTypeIn
      coinTypeOut: $coinTypeOut
      amountIn: $amountIn
    ) {
      path {
        routes {
          coinY {
            coinType
          }
          coinX {
            coinType
          }
          pairId
          protocol
          fee
          pairType
        }
        amountIn
        amountOut
        coinTypeOut
        coinTypeIn
      }
      rate
    }
  }
`;
