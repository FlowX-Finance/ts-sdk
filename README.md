# Official FlowX Finance TypeScript SDK for Sui

An FlowX Typescript SDK is a software development kit that allows developers to interact with FlowX protocols using the Typescript programming language.

# Features

- Retrieve user liquidity.
- Retrieve list farm genesix and user position.
- Retrieve list farm FaaS and user position.

# Getting Started

```
npm i @flowx-pkg/ts-sdk
```

# FlowX SDK

## 1. Retrieve user liquidity

```
import {getLiquidity} from "@flowx-pkg/ts-sdk"

let address: string = "..." //required: user address
let sortType: string = "..." //optional (lpValue, userLpBalance, totalLpSupply)
let sortOrder: stringr = "..." //optional (ascending , descending)
let userLiquidity: ILiquidity = await getLiquidity(address, sortType, sortOrder)
```

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

## 4. SWAP Function

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

## 5. SWAP Aggregator

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

| Arguments  | Description                                                                        | Type                                                             |
| ---------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `tokenIn`  | Type of token in                                                                   | string                                                           |
| `tokenOut` | Type of token out                                                                  | string                                                           |
| `amountIn` | Ammount of token in                                                                | string                                                           |
| `signal`   | Signal to abort current query                                                      | AbortController                                                  |
| `source`   | (Optional) List dex that use to searching smart route. Default is included all dex | Array("FLOWX","FLOWX_CLMM","KRIYA","TURBOS",CETUS", "AFTERMATH") |

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
	pathsAmountOut)
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

## Usage

```

import {txBuild, estimateGasFee, getSmartRouting} from "@flowx-pkg/ts-sdk"

const {paths,amountOut} = await getSmartRouting(coinInType,coinOutType,decimalInAmount,abortQuerySmartRef.current.signal)

const txb = await txBuild(paths,slippage,amountIn,amountOut,coinInType,account);

const { fee, amountOut:amountOutDev, pathsAmountOut } = await estimateGasFee(txb, account);

const tx = await txBuild(paths,slippage,amountIn,amountOutDev,coinInType,account,pathsAmountOut)
```
