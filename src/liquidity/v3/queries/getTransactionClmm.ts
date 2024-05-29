import { gql } from "graphql-tag";
import { client } from "../../../constants";
import { IGetTransactionClmm } from "../../../types";
const graphTransactionClmmQuery = gql`
  query GetClmmTransactions(
    $size: Int
    $page: Int
    $poolId: String
    $positionId: String
    $sender: String
  ) {
    getClmmTransactions(
      size: $size
      page: $page
      poolId: $poolId
      positionId: $positionId
      sender: $sender
    ) {
      items {
        txDigest
        type
        totalAmountInUSD
        amountXIn
        amountXOut
        amountYIn
        amountYOut
        sender
        timestamp
        eventSeq
        coinX {
          type
          symbol
          decimals
        }
        coinY {
          type
          symbol
          decimals
        }
      }
      total
      size
      page
    }
  }
`;
export const getTransactionClmm = async ({
  poolId,
  positionId,
  size,
  page,
  sender,
}: IGetTransactionClmm) => {
  try {
    const res: any = await client("no-cache").request(
      graphTransactionClmmQuery,
      {
        poolId,
        positionId,
        size,
        page,
        sender,
      }
    );
    return res.getClmmTransactions.items ?? [];
  } catch (error) {
    throw error;
  }
};
