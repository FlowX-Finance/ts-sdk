import BigNumber from "bignumber.js";
import { Connection, JsonRpcProvider } from "@mysten/sui.js";
import { GraphQLClient } from "graphql-request";

export const client = new GraphQLClient(
  "https://flowx-dev.flowx.finance/flowx-be/graphql"
);

export const provider = new JsonRpcProvider(
  new Connection({ fullnode: "https://explorer-rpc.testnet.sui.io/" })
);

export const MAX_ROUTE_HOPS = 4;
export const MAX_LIMIT_PER_RPC_CALL = 50;
export const LP_DECIMAL = 9;
export const FLX_DECIMAL = 8;
export const XFLX_DECIMAL = 8;
export const DEFAULT_GAS_BUDGET = 10000;
export const SUI_TYPE = "0x2::sui::SUI";
export const SUI_FULL_TYPE =
  "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI";
export const ZERO_BN = new BigNumber(0);

export const GENESIS_FARM_OBJECT =
  "0x6be2e5847e91ca2f18de8cbd711367b87440e6a5ca99c63b1ea1d29d743c8212";
export const GENESIS_FARM_INFO =
  "0x8af239ad8ef0b3c891e19d5287a3756c92d4a25387b9473a2c327288215f4a74";
export const GENESIS_FARM_INFO_DYNAMIC_FIELD_ID =
  "0x35357269a1b001566d40eecb5fe91c36a1f64f4fc6db3ea433c77e140a2f782b";
export const FAAS_PACKAGE_OBJECT =
  "0x2c90dc0ebeb90628a2a9915cdd809f6509d1b8a1bde69a25cfb783802c1101f4";
export const FAAS_STATE_OBJECT =
  "0x52bfc49b2d8c4a6ae8c865cabb5bbc61755810dd64f204eefaa34e28ab49a5db";
export const FAAS_POOL_REGISTRY_DYNAMIC_FIELD =
  "0xe0dadc802ce2687550f13092e9aad64896eb2aef13a604e805b7adaef8c221ab";
export const FAAS_POSITION_REGISTRY_DYNAMIC_FIELD =
  "0xcdb29f87956280dfc87ad14e10755ac6a3654dbd0615a1c71272cbb301b28b59";
export const DYNAMIC_FAAS_POS_TYPE = `${FAAS_PACKAGE_OBJECT}::position_registry::Key`;
export const POSITION_G_FARM_TYPE = `${GENESIS_FARM_OBJECT}::position::Position`;
export const CLOCK_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000006";
export const FLX_TYPE = `0x6dae8ca14311574fdfe555524ea48558e3d1360d1607d1c7f98af867e3b7976c::flx::FLX`;

export const FAAS_PACKAGE_OBJECT_V2 =
  "0x943535499ac300765aa930072470e0b515cfd7eebcaa5c43762665eaad9cc6f2";
export const FAAS_STATE_OBJECT_V2 =
  "0xe94c179dc1644206b5e05c75674b13118be74d4540baa80599a0cbbaad4fc39c";
export const FAAS_POOL_REGISTRY_DYNAMIC_FIELD_V2 =
  "0x5c38d069b2f208b0894078465a31b5beb425104894f3237195c90666a82753a2";
export const FAAS_FARM_TYPE_V2 = `${FAAS_PACKAGE_OBJECT_V2}::position::Position`;
export const CONTAINER_OBJECT_ID =
  "0xcbca62dbd54d3a8545f27a298872b1af9363a82a04a329504b1f0fef0a5f9ce4";
export const PACKAGE_OBJECT_ID =
  "0xebebb67fc6fc6a74be5e57d90563c709631b4da86091c0926db81894add36ed3";
export const FUNCTION = {
  SWAP_EXACT_OUTPUT: "swap_exact_output",
  SWAP_EXACT_INPUT: "swap_exact_input",
  SWAP_EXACT_INPUT_DOUBLEHOP: "swap_exact_input_doublehop",
  SWAP_EXACT_OUTPUT_DOUBLEHOP: "swap_exact_output_doublehop",
  SWAP_EXACT_INPUT_TRIPLEHOP: "swap_exact_input_triplehop",
  SWAP_EXACT_OUTPUT_TRIPLEHOP: "swap_exact_output_triplehop",
  SWAP_EXACT_INPUT_DOUBLE_OUTPUT: "swap_exact_input_double_output",
  SWAP_EXACT_INPUT_TRIPLE_OUTPUT: "swap_exact_input_triple_output",
  SWAP_EXACT_INPUT_QUADRUPLE_OUTPUT: "swap_exact_input_quadruple_output",
  SWAP_EXACT_INPUT_QUINTUPLE_OUTPUT: "swap_exact_input_quintuple_output",
  SWAP_EXACT_DOUBLE_INPUT: "swap_exact_double_input",
  SWAP_EXACT_TRIPLE_INPUT: "swap_exact_triple_input",
  SWAP_EXACT_QUADRUPLE_INPUT: "swap_exact_quadruple_input",
  SWAP_EXACT_QUINTUPLE_INPUT: "swap_exact_quintuple_input",
};
