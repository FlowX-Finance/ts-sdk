import { client } from "../../../constants";
import { gql } from "graphql-tag";
import { IGetClmmTicks } from "../../../types";

const graphTickClmmQuery = gql`
  query GetClmmTicks($pool: String!) {
    getClmmTicks(pool: $pool) {
      _id
      liquidityGross
      liquidityNet
      pool
      tick
    }
  }
`;
export const getTickClmm = async (poolId: string): Promise<IGetClmmTicks[]> => {
  try {
    const res: any = await client(undefined, "no-cache").request(
      graphTickClmmQuery,
      {
        pool: poolId,
      }
    );
    const data: IGetClmmTicks[] = res.getClmmTicks ?? [];
    return data.filter((item) => +item.liquidityNet !== 0);
  } catch (error) {
    throw error;
  }
};
