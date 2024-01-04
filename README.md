## Official FlowX Finance TypeScript SDK for Sui
An FlowX Typescript SDK is a software development kit that allows developers to interact with FlowX protocols using the Typescript programming language. 

## Features

- Retrieve user liquidity.
- Retrieve list farm genesix and user position.
- Retrieve list farm FaaS and user position.

## Getting Started

```
npm i @flowx-pkg/ts-sdk
```

## FlowX SDK
### 1. Retrieve user liquidity
```
import {getLiquidity} from "@flowx-pkg/ts-sdk"

let address: string = "..." //required: user address
let sortType: string = "..." //optional (lpValue, userLpBalance, totalLpSupply)
let sortOrder: stringr = "..." //optional (ascending , descending)
let userLiquidity: ILiquidity = await getLiquidity(address, sortType, sortOrder)
```
### 2. Retrieve list farm genesix and user position
```
import {getGenesisFarm} from "@flowx-pkg/ts-sdk"

let address: string = "..." //optional: user address
let listGenesisX: IGenesisPoolsData[] = await getGenesisFarm(address)
```
### 3. Retrieve list farm FaaS v2 and user position

```
import {getFaasV2} from "@flowx-pkg/ts-sdk"

let address: string = "..." //optional: user address
let listFaaS: IFaasV2[] = await getFaasV2(address)
```

### 3. SWAP Function

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
