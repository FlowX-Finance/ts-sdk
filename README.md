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

### 3. Retrieve list farm FaaS and user position

```
import {getFaas} from "@flowx-pkg/ts-sdk"

let address: string = "..." //optional: user address
let listFaaS: IFaasData[] = await getFaas(address,)
```
