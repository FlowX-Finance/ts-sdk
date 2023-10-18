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
        volume7D
        volume24H
        transaction24H
        totalLiquidity
        fee24H
        aprPerformance7D
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
