# Official FlowX Finance TypeScript SDK for Sui

An FlowX Typescript SDK is a software development kit that allows developers to interact with FlowX protocols using the Typescript programming language.

# Features

- Retrieve list token in flowx and their's metadata.
- Retrieve user liquidity.
- Retrieve list farm genesix and user position.
- Retrieve list farm FaaS and user position.
- Retrieve transaction block for swap V2
- Retrieve transaction block for swap V3
- Retrieve transaction block liquidity management V3 (add,remove,increase liquid, collect reward)

# Getting Started

```
npm i @flowx-pkg/ts-sdk
```

# FlowX SDK

## 1. Retrieve token list in Flowx

```
import {getLiquidity, CoinMetadata} from "@flowx-pkg/ts-sdk"

const coins: CoinMetadata[] = await getCoinsFlowX()
```

## 1. Retrieve user liquidity

```
import {getLiquidity,ILiquidity} from "@flowx-pkg/ts-sdk"

const userLiquidity: ILiquidity[] = await getLiquidity(address, sortType, sortOrder)
```

| Arguments   | Description                                    | Type                                  |
| ----------- | ---------------------------------------------- | ------------------------------------- |
| `address`   | Address to retrieve information                | string                                |
| `sortType`  | (Optional) The criteria to sort data retrieved | lpValue, userLpBalance, totalLpSupply |
| `sortOrder` | (Optional) The order of sorting                | ascending , descending                |

## 2. Retrieve list farm genesix and user position

```
import {getGenesisFarm} from "@flowx-pkg/ts-sdk"

let address: string = "..." //optional: user address
let listGenesisX: IGenesisPoolsData[] = await getGenesisFarm(address)
```

## 3. Retrieve list farm FaaS v2 and user position

```
import {getFaasV2} from "@flowx-pkg/ts-sdk"

let address: string = "..." //optional: user address
let listFaaS: IFaasV2[] = await getFaasV2(address)
```

## 4. SWAP V2 Function

```
import {calculateAmountIn, swapExactInput} from "@flowx-pkg/ts-sdk"

const coinIn = {
	type: "0x2::sui::SUI",
	symbol: "SUI",
	decimals: 9,
};
const coinOut = {
	type: "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
	symbol: "wUSDC",
	decimals: 6,
};

const data = await calculateAmountIn(0.8, coinIn, coinOut); //0.8 mean the amount you want to swap

const tx: TransactionBock = await swapExactInput(
	false, //it should be false for now
	data.amountIn, //amount want to swap
	data.amountOut, //amount want to receive
	data.trades, //trades from calculate amount
	coinIn, //coin In data
	coinOut, //coin Out data
	"YOUR_ACCOUNT_RECEIVE TOKEN", //amount swap
	0.005 //slippage (0.05%)
);
```

## 5. SWAP Aggregator (V3)

### getSmartRouting

Retrieve the most optimal route of smart routing for swap and amount of token user may receive.

```
import {getSmartRouting} from "@flowx-pkg/ts-sdk"
const smartRouting:ISmartRouting  = await getSmartRouting(
	tokenIn,
	tokenOut,
	amountIn,
	signal,
	source
)

interface ISmartRouting {
	paths: ISmartPathV3[],
	amountOut:string
}

```

| Arguments  | Description                                                                        | Type                                                                        |
| ---------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `tokenIn`  | Type of token in                                                                   | string                                                                      |
| `tokenOut` | Type of token out                                                                  | string                                                                      |
| `amountIn` | Amount of token in                                                                 | string                                                                      |
| `signal`   | Signal to abort current query                                                      | AbortController                                                             |
| `source`   | (Optional) List dex that use to searching smart route. Default is included all dex | Array("FLOWX","FLOWX_CLMM","KRIYA","TURBOS",CETUS", "AFTERMATH","DEEPBOOK") |

### estimateGasFee

Estimate gas fee for conducting transaction, amount token out and list of amount token out from each path of smart routing

```
import {estimateGasFee} from "@flowx-pkg/ts-sdk"

const result:IEstimateGasResult|undefined  = await estimateGasFee(
	tx,
	account)

interface IEstimateGasResult {
	fee: string;
  	amountOut: string;
 	pathsAmountOut: string[];
}

```

### txBuild

Retrieve the transaction block for swap

```
import {txBuild} from "@flowx-pkg/ts-sdk"
const tx: TransactionBock = await txBuild(
	listSmartPath,
	slippage,
	amountIn,
	amountOut,
	coinInType,
	account,
	pathsAmountOut
)
```

| Arguments        | Description                                                                                                                                                                                                                                             | Type           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `listSmartPath`  | List all path of smart routing for current swap, each path may includes one or many route                                                                                                                                                               | ISmartPathV3[] |
| `slippage`       | Slippage percent (Ex: 1% = 0.01)                                                                                                                                                                                                                        | string         |
| `amountIn`       | Amount in by decimal value.                                                                                                                                                                                                                             | string         |
| `amountOut`      | Amount out by decimal value. In case build Tx for inspect transaction: This amount is equivalent to `amountOut` get from `getSmartRouting`. In case build Tx for actual transaction: This amount is equivalent to `amountOut` get from `estimateGasFee` | string         |
| `coinInType`     | Type of token in                                                                                                                                                                                                                                        | string         |
| `account`        | Address conducting swap transaction                                                                                                                                                                                                                     | string         |
| `pathsAmountOut` | (Optional) List amount actual calculated after `estimateGasFee`. Add this argument may turn txBuild to tx for actual transaction. Pass it may turn txBuild to tx for devInpsecTransaction                                                               | string[]       |

### Usage Swap V3

```
import {txBuild, estimateGasFee, getSmartRouting} from "@flowx-pkg/ts-sdk"

const {paths,amountOut} = await getSmartRouting(coinInType,coinOutType,decimalInAmount,abortQuerySmartRef.current.signal)

const txb = await txBuild(paths,slippage,amountIn,amountOut,coinInType,account);

const { fee, amountOut:amountOutDev, pathsAmountOut } = await estimateGasFee(txb, account);

const tx = await txBuild(paths,slippage,amountIn,amountOutDev,coinInType,account,pathsAmountOut)
```

## 6. Liquidity management (V3)

### getUserLiquidityV3

Retrieve the list of liquidity position owned by provided address.

```
import {getUserLiquidityV3, IUserLiquidV3Position} from "@flowx-pkg/ts-sdk"

const result: IUserLiquidV3Position = await getUserLiquidityV3(account)
```

### getPositionDetailV3

Retrieve the information of provided position.

```
import {getPositionDetailV3, IPDV3State} from "@flowx-pkg/ts-sdk"

const result: IPDV3State = await getPositionDetailV3(positionObjectId,account,callTime);
```

| Arguments          | Description                                                                                        | Type   |
| ------------------ | -------------------------------------------------------------------------------------------------- | ------ |
| `positionObjectId` | Position's object id                                                                               | string |
| `account`          | (Optional) Address for checking rewards and ownership of position                                  | string |
| `callTime`         | (Optional) Internal served for retry in case of failure fetching data. Leave it blank is recommend | number |

### getTickClmm

Retrieve the list of ticks of pool liquid

```
import {getTickClmm, IGetClmmTicks} from "@flowx-pkg/ts-sdk"

const result: IGetClmmTicks = await getTickClmm(poolId)
```

### buildTxAddLiquidV3

Retrieve the transaction block to add liquidity (creating new position). If the pool liquid does not exist, this also create new pool liquid.

```
import {buildTxAddLiquidV3} from "@flowx-pkg/ts-sdk"

const tx: TransactionBock = await buildTxAddLiquidV3(
	coinX,
	coinY,
	slippage,
	fee,
	lowerTick,
	upperTick,
	amountX,
	amountY,
	account
)
```

| Arguments   | Description                                       | Type                     |
| ----------- | ------------------------------------------------- | ------------------------ |
| `coinX`     | Token X metadata                                  | CoinMetadata (sdk types) |
| `coinY`     | Token Y metadata                                  | CoinMetadata (sdk types) |
| `slippage`  | Slippage (EX: 0.01% = 0.0001)                     | string                   |
| `fee`       | Fee tier value of pool                            | IFeeTierV3               |
| `lowerTick` | TickIndex's value of lower price that user config | number                   |
| `upperTick` | TickIndex's value of upper price that user config | number                   |
| `amountX`   | Amount of token X to deposit                      | string                   |
| `amountY`   | Amount of token Y to deposit                      | string                   |
| `account`   | Address conducting transaction                    | string                   |

### buildTxIncreaseLiquidV3

Retrieve the transaction block to increase liquidity to existed position that user owned.

```
import {buildTxIncreaseLiquidV3} from "@flowx-pkg/ts-sdk"

const tx: TransactionBock = await buildTxIncreaseLiquidV3(
	amountX,
	amountY,
	account,
	coinX,
	coinY,
	positionObjectId,
	slippage
)
```

| Arguments          | Description                    | Type                     |
| ------------------ | ------------------------------ | ------------------------ |
| `amountX`          | Amount of token X to deposit   | string                   |
| `amountY`          | Amount of token Y to deposit   | string                   |
| `account`          | Address conducting transaction | string                   |
| `coinX`            | Token X metadata               | CoinMetadata (sdk types) |
| `coinY`            | Token Y metadata               | CoinMetadata (sdk types) |
| `positionObjectId` | Position's object id           | string                   |
| `slippage`         | Slippage (EX: 0.01% = 0.0001)  | string                   |

### buildTxRemoveLiquidV3

Retrieve the transaction block to remove liquidity to existed position that user owned.

```
import {buildTxRemoveLiquidV3} from "@flowx-pkg/ts-sdk"

const tx: TransactionBock = await buildTxRemoveLiquidV3(
	coinX,
	coinY,
	positionObjectId,
	liquid2Remove,
	amountX,
	amountY,
	account,
	poolReward,
	removeAll
)
```

| Arguments          | Description                                        | Type                     |
| ------------------ | -------------------------------------------------- | ------------------------ |
| `coinX`            | Token X metadata                                   | CoinMetadata (sdk types) |
| `coinY`            | Token Y metadata                                   | CoinMetadata (sdk types) |
| `positionObjectId` | Position's object id                               | string                   |
| `liquid2Remove`    | Amount liquidity desired to remove (Decimal value) | string                   |
| `amountX`          | Amount of token X to deposit                       | string                   |
| `amountY`          | Amount of token Y to deposit                       | string                   |
| `account`          | Address conducting transaction                     | string                   |
| `poolReward`       | List of reward tokens and their's amount           | IPoolRewardV3[]          |
| `removeAll`        | (Optional) Defined remove all liquidity or not     | Boolean                  |

### getTxCollectRewardLiquidV3

Retrieve the transaction block to collect all pending reward user have in the positon.

```
import {getTxCollectRewardLiquidV3} from "@flowx-pkg/ts-sdk"

const tx: TransactionBock = await getTxCollectRewardLiquidV3(
	rewardType,
	positionObjectId,
	account,
	inheritTx
)
```

| Arguments          | Description                                               | Type             |
| ------------------ | --------------------------------------------------------- | ---------------- |
| `rewardType`       | Type of reward tokens                                     | string[]         |
| `positionObjectId` | Position's object id                                      | string           |
| `account`          | Address conducting transaction                            | string           |
| `inheritTx`        | (Optional) Inherit transaction block from previous action | TransactionBlock |
