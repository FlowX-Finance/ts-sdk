import { gql } from "graphql-request";
import { client } from "../../../constants";

const getClmmPoolDetailQuery = gql`
  query GetClmmPoolDetail($poolId: String!) {
    getClmmPoolDetail(poolId: $poolId) {
      id
      feeRate
      coinYType
      coinXType
      lpObjectId
      reserveX
      reserveY
      stats {
        volume24H
        fee24H
        fee7D
        apr
        totalLiquidityInUSD
        liquidityUSDX
        liquidityUSDY
      }
    }
  }
`;
export const getClmmPoolDetail = async (poolId: string): Promise<any> => {
  try {
    const res: any = await client().request(getClmmPoolDetailQuery, {
      poolId,
    });
    return res.getClmmPoolDetail;
  } catch (error) {
    throw error;
  }
};
