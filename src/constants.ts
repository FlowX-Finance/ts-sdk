import { Connection, JsonRpcProvider } from "@mysten/sui.js";
import { GraphQLClient } from "graphql-request";
import { BigNumber } from "./BigNumber";
import { TCachingRequest, TSourceSmartRouting } from "./types";

export const SOURCE_DEX: TSourceSmartRouting[] = [
  "FLOWX_CLMM",
  "FLOWX",
  "CETUS",
  "KRIYA",
  "AFTERMATH",
  "TURBOS",
  "DEEPBOOK",
];
// //MAINNET
export const client = (cache?: TCachingRequest) => {
  let config: any;
  if (cache) config.cache = cache;
  return new GraphQLClient(
    "https://api.flowx.finance/flowx-be/graphql",
    config
  );
};

export const provider = new JsonRpcProvider(
  new Connection({ fullnode: "https://fullnode.mainnet.sui.io/" })
);

export const MAX_ROUTE_HOPS = 4;
export const MAX_LIMIT_PER_RPC_CALL = 50;
export const LP_DECIMAL = 9;
export const FLX_DECIMAL = 9;
export const XFLX_DECIMAL = 8;
export const DEFAULT_GAS_BUDGET = 10000;
export const SUI_TYPE = "0x2::sui::SUI";
export const SUI_FULL_TYPE =
  "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI";
export const ZERO_BN = BigNumber(0);

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
export const FLX_TYPE = `0x52eb7d9251fc7567f0f2bbd831a9efc76fb6e2edeb613094f0c7a0f3d922169f::flx::FLX`;

export const FAAS_PACKAGE_OBJECT_V2 =
  "0x943535499ac300765aa930072470e0b515cfd7eebcaa5c43762665eaad9cc6f2";
export const FAAS_STATE_OBJECT_V2 =
  "0xe94c179dc1644206b5e05c75674b13118be74d4540baa80599a0cbbaad4fc39c";
export const FAAS_POOL_REGISTRY_DYNAMIC_FIELD_V2 =
  "0x5c38d069b2f208b0894078465a31b5beb425104894f3237195c90666a82753a2";
export const FAAS_FARM_TYPE_V2 = `${FAAS_PACKAGE_OBJECT_V2}::position::Position`;
export const CONTAINER_OBJECT_ID =
  "0xb65dcbf63fd3ad5d0ebfbf334780dc9f785eff38a4459e37ab08fa79576ee511";
export const PACKAGE_OBJECT_ID =
  "0xba153169476e8c3114962261d1edc70de5ad9781b83cc617ecc8c1923191cae0";
// export const SWAP_V3 = {
//   UNIVERSAL_ROUTER:
//     "0xb2ed1dc638fc36ecefdb001245902aab209951faba737d57eb61905e14653554",
//   UNIVERSAL_ROUTER_LEGACY:
//     "0x8513d4a794b76bbb2af9e0181df2794ffbcac7b507764fd8dfe8585b3a2ed157",
//   UNIVERSAL_TREASURY:
//     "0xd98689eb13b909329347a8155869b5cd4aa3536b250964d3281f0194088d5057",
// };
export const SWAP_V3 = {
  UNIVERSAL_ROUTER:
    "0x833a64724a500ad978480083c048ecc802fa5f6c59f622baf8b9531c3dfe8091",
  UNIVERSAL_ROUTER_LEGACY:
    "0x833a64724a500ad978480083c048ecc802fa5f6c59f622baf8b9531c3dfe8091",
  UNIVERSAL_TREASURY:
    "0x4695a48a2793dcf38d5f572e3388b675bea7fefdd1e0160d00f6625f10926359",
  TRADE_ID_TRACKER:
    "0x1efc1043577126103876562c35018ca4f799bde6553f936aa15af5af52962a28",
  PARTNER_REGISTRY:
    "0x1a294f8e4d523ccb7d4b14dcc10f987de01925cd35e7a2d738518b82074835e2",
};
export const ADD_LIQUIDITY_V3 = {
  POOL_REGISTRY_OBJ:
    "0x27565d24a4cd51127ac90e4074a841bbe356cca7bf5759ddc14a975be1632abc",
  CLMM_PACKAGE:
    "0x25929e7f29e0a30eb4e692952ba1b5b65a3a4d65ab5f2a32e1ba3edcb587f26d",
  POSITION_REGISTRY_OBJ:
    "0x7dffe3229d675645564273aa68c67406b6a80aa29e245ac78283acd7ed5e4912",
  VERSIONED_OBJ:
    "0x67624a1533b5aff5d0dfcf5e598684350efd38134d2d245f475524c03a64e656",
};
export const FUNCTION = {
  ADD_LIQUIDITY: "add_liquidity",
  ZAP_IN: "zap_in",
  REMOVE_LIQUIDITY: "remove_liquidity",
  REMOVE_LIQUIDITY_DIRECT: "remove_liquidity_direct",
  ZAP_OUT_TO_X: "zap_out_to_x",
  ZAP_OUT_TO_Y: "zap_out_to_y",
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
  MINT_XFLX: "mint_and_transfer",
  LAZY_BURN_XFLX: "lazy_burn",
  BURN_XFLX: "burn",
  CANCEL_LAZY_BURN_XFLX: "cancel_lazy_burn",
  BOOST_POSITION: "boost_position",
  DECREASE_POSITION: "decrease_position",
  DECREASE_POSITION_EMERGENCY_FAAS: "decrease_position_emergency",
  HARVEST_POSITION: "harvest_position",
  INCREASE_POSITION: "increase_position",
  LOCK_POSITION: "lock_position",
  OPEN_POSITION: "open_position",
  UNBOOST_POSITION: "unboost_position",
  OPEN_BOOST_POSITION: "open_and_boost_position",
  CAMPAIGN_DEPOSIT: "deposit",
  CREATE_POOL: "create_pool",
  FETCH_PENDING_REWARD: "fetch_pending_reward",
  UPDATE_END_TIME: "update_end_time",
  MINT: "mint",
  PRE_SALE_DEPOSIT: "pre_sale_deposit",
  PUBLIC_SALE_DEPOSIT: "public_sale_deposit",
  PUBLIC_SALE_WITHDRAW: "public_sale_withdraw",
  CLAIM_PRE_SALE: "claim_pre_sale",
  CLAIM_PUBLIC_SALE: "claim_public_sale",
  HARVEST: "harvest",
  CLAIM_FUND_PRE_SALE: "claim_fund_pre_sale",
  CLAIM: "claim",
  REFUND: "refund",
  RELEASE: "release",
  COMMIT: "commit",
  BORROW_MUT_PAIR_AND_TREASURY: "borrow_mut_pair_and_treasury",
  BURN: "burn",
  STAKE: "stake",
  UN_STAKE: "unstake",
  CREATE_INITIAL_POOL: "create_and_initialize_pool",
  INCREASE_LIQUIDITY: "increase_liquidity",
  DECREASE_LIQUIDITY: "decrease_liquidity",
  COLLECT: "collect",
  COLLECT_POOL_REWARD: "collect_pool_reward",
  CLOSE_POSITION: "close_position",
  INIT_PATH: "initialize_path",
  INIT_ROUTING: "initialize_routing",
  NEXT_ROUTING_V3: "next",
  SETTLE_ROUTING_V3: "settle",
  FLOWX_SWAP: "flowx_swap_exact_input",
  FLOWX_SWAP_CLMM: "flowx_clmm_swap_exact_input",
  CHECK_DEALINE: "check_deadline",
  CHECK_AMOUNT_THRESHOLD: "check_amount_threshold",
};
export const MODULE = {
  ROUTER: "router",
  ROUTER_V2: "router_v2",
  ZAPPER: "zapper",
  FLX: "flx",
  XFLX: "xflx",
  FARM: "farms",
  CAMPAGIN: "flowx_campaign",
  OPERATOR: "operator",
  FETCHER: "fetcher",
  COLLECTIBLE: "collectible",
  LAUNCHPAD: "launchpad",
  EXT_LAUNCHPAD: "external_launchpad",
  TOKEN_VESTING: "token_vesting",
  DISTRIBUTOR: "distributor",
  FACTORY: "factory",
  PAIR: "pair",
  STAKING: "staking",
  POSITION_MANAGER: "position_manager",
  POOL_MANAGER: "pool_manager",
  SWAP_ROUTER: "swap_router",
  UNIVERSAL_ROUTER: "universal_router",
  COMMISSION: "commission",
};
export const POSITION_LIQUID_V3_TYPE = `${ADD_LIQUIDITY_V3.CLMM_PACKAGE}::position::Position`;
/**
 * The maximum tick index supported by the clmmpool program.
 * @category Constants
 */
export const MAX_TICK_INDEX = 443636;
/**
 * The minimum tick index supported by the clmmpool program.
 * @category Constants
 */
export const MIN_TICK_INDEX = -443636;
/**
 * The maximum sqrt-price supported by the clmmpool program.
 * @category Constants
 */
export const MAX_SQRT_PRICE = "79226673515401279992447579055";
/**
 * The number of initialized ticks that a tick-array account can hold.
 * @category Constants
 */
export const TICK_ARRAY_SIZE = 64;
/**
 * The minimum sqrt-price supported by the clmmpool program.
 * @category Constants
 */
export const MIN_SQRT_PRICE = "4295048016";
/**
 * The denominator which the fee rate is divided on.
 * @category Constants
 */
export const FEE_RATE_DENOMINATOR = BigNumber(1_000_000);
export const MAXU64 = "18446744073709551615";

// TESTNET;
// import BigNumber from "bignumber.js";
// import { Connection, JsonRpcProvider } from "@mysten/sui.js";
// import { GraphQLClient } from "graphql-request";

// export const client = new GraphQLClient(
//   "https://flowx-dev.flowx.finance/flowx-be/graphql"
// );

// export const provider = new JsonRpcProvider(
//   new Connection({ fullnode: "https://fullnode.testnet.sui.io:443" })
// );

// export const MAX_ROUTE_HOPS = 4;
// export const MAX_LIMIT_PER_RPC_CALL = 50;
// export const LP_DECIMAL = 9;
// export const FLX_DECIMAL = 8;
// export const XFLX_DECIMAL = 8;
// export const DEFAULT_GAS_BUDGET = 10000;
// export const SUI_TYPE = "0x2::sui::SUI";
// export const SUI_FULL_TYPE =
//   "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI";
// export const ZERO_BN = new BigNumber(0);

// export const GENESIS_FARM_INFO =
//   "0x035e105129ab5b2630205c0c7b379344ce397a9e2503e164c8f0203c396840aa";
// export const GENESIS_FARM_INFO_DYNAMIC_FIELD_ID =
//   "0xe8d71093fdc05e71953b785f0f4dc73d9d8e21ebbc55cca342e963fefcc5668b";
// export const FAAS_PACKAGE_OBJECT =
//   "0x368d0aff8f837a623b0c8627368adbb300e852298946eb41f0a54bf0ad8fac2e";
// export const FAAS_STATE_OBJECT =
//   "0xdddeb06c0b6f077991da1359f6249f092573b06af44463922247ca93d9a499a9";
// export const FAAS_POOL_REGISTRY_DYNAMIC_FIELD =
//   "0xaa3f27fc7257fc130676b820572f6b9bf2253c01897f9ce87bc937ba9e70f329";
// export const FAAS_POSITION_REGISTRY_DYNAMIC_FIELD =
//   "0x9a7c8bfe99950846e863400cd88ad0d2f017f40a412dc75f39f94c702f284980";
// export const DYNAMIC_FAAS_POS_TYPE = `${FAAS_PACKAGE_OBJECT}::position_registry::Key`;
// export const POSITION_G_FARM_TYPE = `0x71d7e29a0fb2b8b2dd1998b5cad766002477a4a66c39e60ec2a9df508cb1e24b::position::Position`;
// export const CLOCK_ID =
//   "0x0000000000000000000000000000000000000000000000000000000000000006";
// export const FLX_TYPE = `0x52eb7d9251fc7567f0f2bbd831a9efc76fb6e2edeb613094f0c7a0f3d922169f::flx::FLX`;

// export const FAAS_PACKAGE_OBJECT_V2 =
//   "0xd219d9d3345eb2ec779e8c6faed9259f75e2aa879ea52da670366072fa5a46a7";
// export const FAAS_STATE_OBJECT_V2 =
//   "0xfdc78b91296494f64fee04031e0615e496b1f92b9e7e68b328d159836eb8b1fb";
// export const FAAS_POOL_REGISTRY_DYNAMIC_FIELD_V2 =
//   "0x189462a405393ed2ae6499647ba206590b3bf7ea152381812c2bd33e232a3451";
// export const FAAS_FARM_TYPE_V2 = `${FAAS_PACKAGE_OBJECT_V2}::position::Position`;
// export const CONTAINER_OBJECT_ID =
//   "0xcbca62dbd54d3a8545f27a298872b1af9363a82a04a329504b1f0fef0a5f9ce4";
// export const PACKAGE_OBJECT_ID =
//   "0xebebb67fc6fc6a74be5e57d90563c709631b4da86091c0926db81894add36ed3";
// export const UNIVERSAL_ROUTER =
//   "0xe1d359446beafcde25b78d98464775d7d40a2b6bdbcd66d9efa988e7ef364d21";
// export const SWAP_V3 = {
//   UNIVERSAL_ROUTER:
//     "0x4005b8c05bf514bf18a6c9109d2629d419c0cd21ae08237d9df08090336b1d80", // TODO: still testnet cofnig, remove todo when replace with mainnet config
//   UNIVERSAL_TREASURY:
//     "0x0d41cf814ab9776c4948b4eb9e919eae352121038fab2993588bcfb5308a6d24", // TODO: still testnet cofnig, remove todo when replace with mainnet config
// };
// export const ADD_LIQUIDITY_V3 = {
//   POOL_REGISTRY_OBJ:
//     "0x1f5e3658f83800e5aa61c282fbd730fef3b0d56f1ba1ecbba85aa39187619dd0", // TODO: still testnet cofnig, remove todo when replace with mainnet config
//   CLMM_PACKAGE:
//     "0x0b7372b4c676fac88886b908469d4670785cfaf3faa66d29f716a741862fd65a", // TODO: still testnet cofnig, remove todo when replace with mainnet config
//   POSITION_REGISTRY_OBJ:
//     "0xa43f73524fdc19ef06eac9d1ca9a1b355c2a34dc66f74d418bab50753dc4f385", // TODO: still testnet cofnig, remove todo when replace with mainnet config
//   VERSIONED_OBJ:
//     "0x95a78371508658977045b03afa7fa6dd2ba0f474fb434c11339bc8a61d6e52cf", // TODO: still testnet cofnig, remove todo when replace with mainnet config
// };

// export const FUNCTION = {
//   SWAP_EXACT_OUTPUT: "swap_exact_output",
//   SWAP_EXACT_INPUT: "swap_exact_input",
//   SWAP_EXACT_INPUT_DOUBLEHOP: "swap_exact_input_doublehop",
//   SWAP_EXACT_OUTPUT_DOUBLEHOP: "swap_exact_output_doublehop",
//   SWAP_EXACT_INPUT_TRIPLEHOP: "swap_exact_input_triplehop",
//   SWAP_EXACT_OUTPUT_TRIPLEHOP: "swap_exact_output_triplehop",
//   SWAP_EXACT_INPUT_DOUBLE_OUTPUT: "swap_exact_input_double_output",
//   SWAP_EXACT_INPUT_TRIPLE_OUTPUT: "swap_exact_input_triple_output",
//   SWAP_EXACT_INPUT_QUADRUPLE_OUTPUT: "swap_exact_input_quadruple_output",
//   SWAP_EXACT_INPUT_QUINTUPLE_OUTPUT: "swap_exact_input_quintuple_output",
//   SWAP_EXACT_DOUBLE_INPUT: "swap_exact_double_input",
//   SWAP_EXACT_TRIPLE_INPUT: "swap_exact_triple_input",
//   SWAP_EXACT_QUADRUPLE_INPUT: "swap_exact_quadruple_input",
//   SWAP_EXACT_QUINTUPLE_INPUT: "swap_exact_quintuple_input",
//   SETTLE_ROUTING_V3: "settle",
//   INIT_PATH: "initialize_path",
//   INIT_ROUTING: "initialize_routing",
//   NEXT_ROUTING_V3: "next",
//   FLOWX_SWAP: "flowx_swap_exact_input",
//   FLOWX_SWAP_CLMM: "flowx_clmm_swap_exact_input",
// };
// export const MODULE = {
//   UNIVERSAL_ROUTER: "universal_router",
// };
// /**
//  * The maximum tick index supported by the clmmpool program.
//  * @category Constants
//  */
// export const MAX_TICK_INDEX = 443636;
// /**
//  * The minimum tick index supported by the clmmpool program.
//  * @category Constants
//  */
// export const MIN_TICK_INDEX = -443636;
// /**
//  * The maximum sqrt-price supported by the clmmpool program.
//  * @category Constants
//  */
// export const MAX_SQRT_PRICE = "79226673515401279992447579055";
// /**
//  * The number of initialized ticks that a tick-array account can hold.
//  * @category Constants
//  */
// export const TICK_ARRAY_SIZE = 64;
// /**
//  * The minimum sqrt-price supported by the clmmpool program.
//  * @category Constants
//  */
// export const MIN_SQRT_PRICE = "4295048016";
// /**
//  * The denominator which the fee rate is divided on.
//  * @category Constants
//  */
// export const FEE_RATE_DENOMINATOR = BigNumber(1_000_000);
