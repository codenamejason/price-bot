import { ChainId, Token, Fetcher, WETH, Pair, Route, TokenAmount, Trade, TradeOptions, TradeOptionsDeadline, TradeType, Percent, Price, FACTORY_ADDRESS, INIT_CODE_HASH } from '@uniswap/sdk'
import { ethers } from "ethers";
import { Pool } from "@uniswap/v3-sdk";
import { Address } from "cluster";

const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/d49301bb178a4c3e8bb933d80f24195d");

// Print the chain id to the console
console.log(`The chainId of mainnet is ${ChainId.MAINNET}.`)

// set to mainet for real-time token values
const chainId = ChainId.MAINNET;
const testChainId = ChainId.KOVAN; // kovan testnet chain id

/** Token Addresses */
const platinTokenAddress = '0x782eb3304F8b9adD877F13a5cA321f72c4AA9804'; // Polygon Mainet
const daiTokenAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // Ethereum Mainnet Dai Address
const usdcTokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

/** Token Abi's */


/** Misc. */


/** Tokens */
const DAI = new Token(chainId, daiTokenAddress, 18);
const USDC = new Token(ChainId.MAINNET, usdcTokenAddress, 6)




async function getTokenInfo(chainId: ChainId, tokenAddress: string) {
    const DAI_Fetched: Token = await Fetcher.fetchTokenData(chainId, daiTokenAddress);
}

// Token Pair info functions

/** Fetch token pair data */
async function getDaiWethPair(): Promise<Pair> {
    const pairAddress = Pair.getAddress(DAI, WETH[DAI.chainId])

    //const reserves = [/** use pair address to fetch the reserves here */]
    //const [reserve0, reserve1] = reserves;

    const tokens = [DAI, WETH[DAI.chainId]]
    const [token0, token1] = tokens[0].sortsBefore(tokens[1]) ? tokens : [tokens[1], tokens[0]]

    //const pair = new Pair(new TokenAmount(token0, reserve0), new TokenAmount(token1, reserve1))

    // Fetch using SDK
    const pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId], provider)
    
    return pair;
}


// Price Functions

async function getPriceForDaiWeth() {
    const pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId], provider)

    const route = new Route([pair], WETH[DAI.chainId])

    console.log('DAI per WETH ==> ', route.midPrice.toSignificant(6))
    console.log('WETH per DAI ==> ', route.midPrice.invert().toSignificant(6))
}


async function getPriceForDaiWethIndirect()  {
    // note that you may want/need to handle this async code differently,
    // for example if top-level await is not an option
    const USDCWETHPair = await Fetcher.fetchPairData(USDC, WETH[ChainId.MAINNET])
    const DAIUSDCPair = await Fetcher.fetchPairData(DAI, USDC)

    const route = new Route([USDCWETHPair, DAIUSDCPair], WETH[ChainId.MAINNET])

    console.log(route.midPrice.toSignificant(6)) // 202.081
    console.log(route.midPrice.invert().toSignificant(6)) // 0.00494851
}


async function getExecutionPrice() {
    const pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId])

    const route = new Route([pair], WETH[DAI.chainId])

    const trade = new Trade(route, new TokenAmount(WETH[DAI.chainId], '1000000000000000000'), TradeType.EXACT_INPUT)

    console.log('Execution price ==> ', trade.executionPrice.toSignificant(6))
    console.log('Next Mid Price ==> ', trade.nextMidPrice.toSignificant(6))
}


// Trade Execution Functions

async function tradeWethForDai() {
    // note that you may want/need to handle this async code differently,
    // for example if top-level await is not an option
    const pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId])

    const route = new Route([pair], WETH[DAI.chainId])

    const amountIn = '1000000000000000000' // 1 WETH

    const trade = new Trade(route, new TokenAmount(WETH[DAI.chainId], amountIn), TradeType.EXACT_INPUT)

    const slippageTolerance = new Percent('50', '10000') // 50 bips, or 0.50%

    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw // needs to be converted to e.g. hex
    const path = [WETH[DAI.chainId].address, DAI.address]
    const to = '' // should be a checksummed recipient address
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from the current Unix time
    const value = trade.inputAmount.raw // // needs to be converted to e.g. hex
}


const tradeExample1 = async () => {
	const dai = await Fetcher.fetchTokenData(chainId, '0x6B175474E89094C44Da98b954EedeAC495271d0F', provider);
	const weth = WETH[chainId];
	const pair = await Fetcher.fetchPairData(dai, weth, provider);
	const route = new Route([pair], weth);
	const trade = new Trade(route, new TokenAmount(weth, '100000000000000000'), TradeType.EXACT_INPUT);
	console.log("Mid Price WETH --> DAI:", route.midPrice.toSignificant(6));
	console.log("Mid Price DAI --> WETH:", route.midPrice.invert().toSignificant(6));
	console.log("-".repeat(45));
	console.log("Execution Price WETH --> DAI:", trade.executionPrice.toSignificant(6));
	console.log("Mid Price after trade WETH --> DAI:", trade.nextMidPrice.toSignificant(6));
}

// Function Executions

//getTokenInfo(chainId, daiTokenAddress).then(r => console.log('Dai Info:: ', r));
//getDecimals(chainId, daiTokenAddress).then(r => console.log('Decimals:: ', r));

//getPair().then(r => console.log('Pair Info:: ', r));

getPriceForDaiWeth();
//getPriceForDaiWethIndirect();
getExecutionPrice();


