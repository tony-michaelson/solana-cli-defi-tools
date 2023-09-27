import { LIQUIDITY_STATE_LAYOUT_V4 } from '../lib/raydium/util/layout.js';
import { Account, Keypair, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';
import { networkOption, noFeesOption, payerOption, quoteOnlyOption, swapDirectionOption, } from '../lib/constants.js';
import { createAmm, Market } from '../lib/raydium/createAmm.js';
import { Market as MarketSerum } from '@project-serum/serum/lib/market.js';
import { Liquidity } from '@raydium-io/raydium-sdk';
import { RAYDIUM_PROGRAM_ID_V4, SERUM_PROGRAM_ID_V3, } from '../lib/raydium/util/ids.js';
import { createAmmAuthority, findAssociatedTokenAddress, } from '../lib/raydium/util/web3.js';
import { calcSwapAmountForDesiredPrice, checkOptions, createKeypairFromFile, getConnection, getNetworkName, handleTransactionOutcome, logObject, watchTransaction, } from '../lib/util.js';
import { NATIVE_SOL, TOKENS } from '../lib/raydium/util/tokens.js';
import { addLiquidity, removeLiquidity } from '../lib/raydium/util/liquidity.js';
import { TokenAmount } from '../lib/raydium/util/safe-math.js';
import { getSwapOutAmount, swap } from '../lib/raydium/util/swap.js';
import { calcWeightedAvgPrice } from '../lib/serum/serum.js';
import BN from 'bn.js';
import Decimal from 'decimal.js';
import { Fee } from '../lib/fee.js';
import { fetchPoolKeys } from '../lib/raydium/util/poolKeys.js';
async function getLiquidityState(ammId, connection) {
    const account = await connection.getAccountInfo(ammId, 'max');
    return LIQUIDITY_STATE_LAYOUT_V4.decode(Buffer.from(account.data));
}
async function showAMM(ammId, option) {
    checkOptions(option, 'network');
    const networkName = getNetworkName(option);
    const connection = getConnection(networkName);
    const ammIdPubKey = new PublicKey(ammId);
    const ammState = await getLiquidityState(ammIdPubKey, connection);
    logObject(ammState);
    // const openOrders = await OpenOrders.load(
    //   connection,
    //   ammState.openOrders,
    //   SERUM_PROGRAM_ID_V3[networkName]
    // )
    // console.log('Open Orders:')
    // console.log(JSON.stringify(openOrders.orders))
}
async function getSerumMarket(marketAddress, connection, programId) {
    return await Market.load(connection, marketAddress, {}, programId);
}
async function printMarketAccountsBalance(payerAccountBalance) {
    console.log('BaseMint ATA Address:', payerAccountBalance.tokenA.publicKey.toString());
    console.log('Balance:', payerAccountBalance.tokenA.balance
        ? payerAccountBalance.tokenA.balance.uiAmount
        : 'Account Not Created!');
    console.log('QuoteMint ATA Address:', payerAccountBalance.tokenB.publicKey.toString());
    console.log('Balance:', payerAccountBalance.tokenB.balance
        ? payerAccountBalance.tokenB.balance.uiAmount
        : 'Account Not Created!');
}
async function getMarketAccountsBalance(owner, mintA, mintB, connection) {
    const ataTokenA = await findAssociatedTokenAddress(owner, mintA);
    const ataTokenB = await findAssociatedTokenAddress(owner, mintB);
    const ataAccountInfoTokenA = await connection.getAccountInfo(ataTokenA, 'finalized');
    const ataAccountInfoTokenB = await connection.getAccountInfo(ataTokenB, 'finalized');
    const ataBalanceTokenA = ataAccountInfoTokenA
        ? (await connection.getTokenAccountBalance(ataTokenA)).value
        : null;
    const ataBalanceTokenB = ataAccountInfoTokenB
        ? (await connection.getTokenAccountBalance(ataTokenB)).value
        : null;
    return {
        tokenA: { publicKey: ataTokenA, balance: ataBalanceTokenA },
        tokenB: { publicKey: ataTokenB, balance: ataBalanceTokenB },
    };
}
async function showMarket(marketPubKey, option) {
    checkOptions(option, 'network');
    const networkName = getNetworkName(option);
    const connection = getConnection(networkName);
    // const payer = await createKeypairFromFile(option['payer'])
    const marketAddress = new PublicKey(marketPubKey);
    const market = await getSerumMarket(marketAddress, connection, SERUM_PROGRAM_ID_V3[networkName]);
    // const orders = await market.loadOrdersForOwner(connection, payer.publicKey)
    // console.log('---- SERUM ORDERS ----')
    // console.log(orders)
    // console.log('---- / SERUM ORDERS ----')
    const marketJSON = JSON.stringify(market, null, 2);
    console.log('---- SERUM MARKET ----');
    console.log(marketJSON);
    console.log('Base Lot Size', market.decoded.baseLotSize.toNumber());
    console.log('Quote Lot Size', market.decoded.quoteLotSize.toNumber());
    console.log('---- / SERUM MARKET ----');
    console.log('');
    const bids = await market.loadBids(connection);
    const bidList = bids.getL2(20);
    console.log('Bids:', bidList.length);
    console.log(JSON.parse(JSON.stringify(bidList)));
    console.log('-------------------------');
    const asks = await market.loadAsks(connection);
    const askList = asks.getL2(20);
    console.log('Asks:', askList.length);
    console.log(JSON.parse(JSON.stringify(askList)));
    console.log('-------------------------');
    const fills = await market.loadFills(connection);
    console.log('Fills:', fills.length);
    console.log(JSON.parse(JSON.stringify(fills)));
    console.log('-------------------------');
    // const eq = await market.loadEventQueue(connection)
    // console.log('EQ:', eq.length)
    // console.log(JSON.parse(JSON.stringify(eq)))
    // console.log('-------------------------')
    const rq = await market.loadRequestQueue(connection);
    console.log('Request Queue:', rq.length);
    console.log(JSON.parse(JSON.stringify(rq)));
    console.log('-------------------------');
}
async function calculateMarketPrice(marketPubKey, option) {
    checkOptions(option, 'network');
    const networkName = getNetworkName(option);
    const connection = getConnection(networkName);
    const marketAddress = new PublicKey(marketPubKey);
    const market = await getSerumMarket(marketAddress, connection, SERUM_PROGRAM_ID_V3[networkName]);
    const fills = await market.loadFills(connection);
    const filledBids = fills.filter((a) => {
        return a.eventFlags.maker;
    });
    console.log('Filled Bids:', filledBids.length);
    console.log(JSON.parse(JSON.stringify(filledBids)));
    const fillPrices = filledBids.map((a) => {
        return {
            price: a.price,
            size: a.size,
        };
    });
    const weightedAvgPrice = calcWeightedAvgPrice(fillPrices, 11111111);
    console.log('Weighted Avg Price:', weightedAvgPrice);
    const bids = (await market.loadBids(connection)).getL2(10);
    console.log('Bids:', bids.length);
    console.log(JSON.parse(JSON.stringify(bids)));
}
async function placeOrder(marketPubKey, priceStr, sizeStr, option) {
    checkOptions(option, 'network', 'direction');
    const networkName = getNetworkName(option);
    const connection = getConnection(networkName);
    const payer = await createKeypairFromFile(option['payer']);
    const price = parseFloat(priceStr);
    const size = parseFloat(sizeStr);
    const marketAddress = new PublicKey(marketPubKey);
    const market = await MarketSerum.load(connection, marketAddress, {}, SERUM_PROGRAM_ID_V3[networkName]);
    const ataTokenA = await findAssociatedTokenAddress(payer.publicKey, market.baseMintAddress);
    const ataTokenB = await findAssociatedTokenAddress(payer.publicKey, market.quoteMintAddress);
    const priceLots = market.priceNumberToLots(price);
    if (priceLots.lte(new BN(0))) {
        throw ('\n' +
            '---------------------------------\n' +
            '> PriceToLots is less than 0, try increasing your bid price\n' +
            'priceLots: ' +
            priceLots.toString() +
            '\n' +
            'baseLotSize: ' +
            market.decoded.baseLotSize.toNumber() +
            '\n' +
            'quoteLotSize: ' +
            market.decoded.quoteLotSize.toNumber() +
            '\n' +
            '---------------------------------\n');
    }
    let order = '';
    if (option['direction'] === 'AtB') {
        // BUY
        order = await market.placeOrder(connection, {
            owner: new Account(payer.secretKey),
            payer: ataTokenB,
            side: 'buy',
            price: price,
            size: size,
            orderType: 'limit',
            feeDiscountPubkey: null,
        });
    }
    else {
        // SELL
        order = await market.placeOrder(connection, {
            owner: new Account(payer.secretKey),
            payer: ataTokenA,
            side: 'sell',
            price: price,
            size: size,
            orderType: 'limit',
            feeDiscountPubkey: null,
        });
    }
    console.log('Order TXID:', order);
    for (const fill of await market.loadFills(connection)) {
        console.log(fill.orderId, fill.price, fill.size, fill.side);
    }
    const owner = new Account(payer.secretKey);
    for (const openOrders of await market.findOpenOrdersAccountsForOwner(connection, payer.publicKey)) {
        console.log('openOrders.baseTokenFree', openOrders.baseTokenFree.toNumber());
        console.log('openOrders.quoteTokenFree', openOrders.quoteTokenFree.toNumber());
        console.log('----');
        if (openOrders.baseTokenFree.toNumber() > 0 ||
            openOrders.quoteTokenFree.toNumber() > 0) {
            // spl-token accounts to which to send the proceeds from trades
            const baseTokenAccount = ataTokenA;
            const quoteTokenAccount = ataTokenB;
            const settle = await market.settleFunds(connection, owner, openOrders, baseTokenAccount, quoteTokenAccount);
            console.log('Settle TXID:', settle);
        }
    }
}
async function showMarketATAsBalance(marketPubKey, option) {
    checkOptions(option, 'network', 'payer');
    const networkName = getNetworkName(option);
    const connection = getConnection(networkName);
    const payer = await createKeypairFromFile(option['payer']);
    const marketAddress = new PublicKey(marketPubKey);
    const market = await getSerumMarket(marketAddress, connection, SERUM_PROGRAM_ID_V3[networkName]);
    const payerAccountBalance = await getMarketAccountsBalance(payer.publicKey, market.baseMint, market.quoteMint, connection);
    printMarketAccountsBalance(payerAccountBalance);
}
async function showPoolATAsBalance(ammId, option) {
    checkOptions(option, 'network', 'payer');
    const networkName = getNetworkName(option);
    const connection = getConnection(networkName);
    const payer = await createKeypairFromFile(option['payer']);
    const ammIdPubKey = new PublicKey(ammId);
    const ammState = await getLiquidityState(ammIdPubKey, connection);
    const ataTokenA = await findAssociatedTokenAddress(payer.publicKey, ammState.baseMint);
    const ataTokenB = await findAssociatedTokenAddress(payer.publicKey, ammState.quoteMint);
    const ataTokenLP = await findAssociatedTokenAddress(payer.publicKey, ammState.lpMint);
    const ataAccountInfoTokenA = await connection.getAccountInfo(ataTokenA, 'finalized');
    const ataAccountInfoTokenB = await connection.getAccountInfo(ataTokenB, 'finalized');
    const ataAccountInfoTokenLP = await connection.getAccountInfo(ataTokenLP, 'finalized');
    const ataBalanceTokenA = ataAccountInfoTokenA
        ? (await connection.getTokenAccountBalance(ataTokenA)).value
        : null;
    const ataBalanceTokenB = ataAccountInfoTokenB
        ? (await connection.getTokenAccountBalance(ataTokenB)).value
        : null;
    const ataBalanceTokenLP = ataAccountInfoTokenLP
        ? (await connection.getTokenAccountBalance(ataTokenLP)).value
        : null;
    console.log('Base Token ATA:', ataTokenA.toString());
    console.log('Balance:', ataBalanceTokenA ? ataBalanceTokenA.uiAmountString : 'Account Not Created!');
    console.log('Quote Token ATA:', ataTokenB.toString());
    console.log('Balance:', ataBalanceTokenB ? ataBalanceTokenB.uiAmountString : 'Account Not Created!');
    console.log('LP Token ATA:', ataTokenLP.toString());
    console.log('Balance:', ataBalanceTokenLP
        ? ataBalanceTokenLP.uiAmountString
        : 'Account Not Created!');
}
async function createRayPool(marketPubKey, tokenAStartingBalance, tokenBStartingBalance, option) {
    checkOptions(option, 'network', 'payer');
    const networkName = getNetworkName(option);
    const connection = getConnection(networkName);
    const payer = await createKeypairFromFile(option['payer']);
    const serumProgramId = SERUM_PROGRAM_ID_V3[networkName];
    const raydiumProgramId = RAYDIUM_PROGRAM_ID_V4[networkName];
    const marketAddress = new PublicKey(marketPubKey);
    const market = await getSerumMarket(marketAddress, connection, SERUM_PROGRAM_ID_V3[networkName]);
    const payerAccountBalance = await getMarketAccountsBalance(payer.publicKey, market.baseMint, market.quoteMint, connection);
    if (payerAccountBalance.tokenA.balance.uiAmount >
        parseInt(tokenAStartingBalance) &&
        payerAccountBalance.tokenB.balance.uiAmount >
            parseInt(tokenBStartingBalance)) {
        const ammId = await createAmm(connection, payer, market, serumProgramId, parseInt(tokenAStartingBalance), parseInt(tokenBStartingBalance), 1, raydiumProgramId);
        console.log('AmmID:', ammId);
    }
    else {
        console.log('Unable to create AMM; not enough funds for initial LP amount specified.');
        printMarketAccountsBalance(payerAccountBalance);
    }
}
export async function getLiquidityPoolInfo(ammId, serumVaultSigner, payer, connection, serumProgramId, raydiumProgramId) {
    const ammState = await getLiquidityState(ammId, connection);
    const market = await Market.load(connection, ammState.marketId, {}, serumProgramId);
    const { publicKey } = await createAmmAuthority(raydiumProgramId);
    const ammAuthority = publicKey;
    const mintA = new Token(connection, ammState.baseMint, TOKEN_PROGRAM_ID, payer);
    const mintAInfo = await mintA.getMintInfo();
    const tokenAAccountBalance = await connection.getTokenAccountBalance(ammState.baseVault);
    const tokenABalance = new TokenAmount(tokenAAccountBalance.value.amount, mintAInfo.decimals);
    const mintB = new Token(connection, ammState.quoteMint, TOKEN_PROGRAM_ID, payer);
    const mintBInfo = await mintB.getMintInfo();
    const tokenBAccountBalance = await connection.getTokenAccountBalance(ammState.quoteVault);
    const tokenBBalance = new TokenAmount(tokenBAccountBalance.value.amount, mintBInfo.decimals);
    const mintLP = new Token(connection, ammState.lpMint, TOKEN_PROGRAM_ID, payer);
    const mintLPInfo = await mintLP.getMintInfo();
    const tokenA = {
        symbol: 'TOKENA',
        name: 'TOKENA',
        mintAddress: mintA.publicKey.toString(),
        decimals: mintAInfo.decimals,
        balance: tokenABalance,
        tags: ['TOKENA'],
    };
    const tokenB = {
        symbol: 'TOKENB',
        name: 'TOKENB',
        mintAddress: mintB.publicKey.toString(),
        decimals: mintBInfo.decimals,
        balance: tokenBBalance,
        tags: ['TOKENB'],
    };
    const lpToken = {
        symbol: 'LPTOKEN',
        name: 'LPTOKEN',
        mintAddress: mintLP.publicKey.toString(),
        decimals: mintLPInfo.decimals,
        tags: ['LPTOKEN'],
    };
    const poolInfo = {
        name: ammState.marketId.toString(),
        coin: tokenA,
        pc: tokenB,
        lp: lpToken,
        version: 4,
        programId: raydiumProgramId.toString(),
        ammId: ammId.toString(),
        ammAuthority: ammAuthority.toString(),
        ammOpenOrders: ammState.openOrders.toString(),
        ammTargetOrders: ammState.targetOrders.toString(),
        ammQuantities: NATIVE_SOL.mintAddress,
        poolCoinTokenAccount: ammState.baseVault.toString(),
        poolPcTokenAccount: ammState.quoteVault.toString(),
        poolWithdrawQueue: ammState.withdrawQueue.toString(),
        poolTempLpTokenAccount: ammState.lpVault.toString(),
        serumProgramId: serumProgramId.toString(),
        serumBids: market.bidsAddress.toString(),
        serumAsks: market.asksAddress.toString(),
        serumEventQueue: market.eventQueue.toString(),
        serumMarket: market.address.toString(),
        serumCoinVaultAccount: market.baseVault.toString(),
        serumPcVaultAccount: market.quoteVault.toString(),
        serumVaultSigner: serumVaultSigner.toString(),
        official: false,
        fees: {
            swapFeeNumerator: ammState.swapFeeNumerator.toNumber(),
            swapFeeDenominator: ammState.swapFeeDenominator.toNumber(),
        },
    };
    return poolInfo;
}
async function lpDeposit(ammId, amountTokenA, amountTokenB, serumVaultSigner, option) {
    checkOptions(option, 'network', 'payer');
    const networkName = getNetworkName(option);
    const connection = getConnection(networkName);
    const payer = await createKeypairFromFile(option['payer']);
    const ammIdPubKey = new PublicKey(ammId);
    const vaultSigner = new PublicKey(serumVaultSigner);
    const poolInfo = await getLiquidityPoolInfo(ammIdPubKey, vaultSigner, payer, connection, SERUM_PROGRAM_ID_V3[networkName], RAYDIUM_PROGRAM_ID_V4[networkName]);
    const ammState = await getLiquidityState(ammIdPubKey, connection);
    const tokenA = {
        symbol: 'TOKENA',
        name: 'TOKENA',
        mintAddress: ammState.baseMint.toString(),
        decimals: ammState.baseDecimal.toNumber(),
        tags: ['TOKENA'],
    };
    const tokenB = {
        symbol: 'TOKENB',
        name: 'TOKENB',
        mintAddress: ammState.quoteMint.toString(),
        decimals: ammState.quoteDecimal.toNumber(),
        tags: ['TOKENB'],
    };
    const ataTokenA = await findAssociatedTokenAddress(payer.publicKey, ammState.baseMint);
    const ataTokenB = await findAssociatedTokenAddress(payer.publicKey, ammState.quoteMint);
    const ataTokenLP = await findAssociatedTokenAddress(payer.publicKey, ammState.lpMint);
    const ataAccountInfoTokenA = await connection.getAccountInfo(ataTokenA, 'finalized');
    const ataAccountInfoTokenB = await connection.getAccountInfo(ataTokenB, 'finalized');
    const ataAccountInfoTokenLP = await connection.getAccountInfo(ataTokenLP, 'finalized');
    if (ataAccountInfoTokenA && ataAccountInfoTokenB && ataAccountInfoTokenLP) {
        const ataBalanceTokenA = (await connection.getTokenAccountBalance(ataTokenA)).value;
        const ataBalanceTokenB = (await connection.getTokenAccountBalance(ataTokenB)).value;
        if (ataBalanceTokenA.uiAmount > parseInt(amountTokenA) &&
            ataBalanceTokenB.uiAmount > parseInt(amountTokenB)) {
            const txid = await addLiquidity(connection, payer, poolInfo, ataTokenA.toString(), ataTokenB.toString(), ataTokenLP.toString(), tokenA, tokenB, amountTokenA, amountTokenB, ataTokenA.toString());
            console.log('LP Deposit TXID:', txid);
        }
        else {
            console.log('Insufficent Balance in payer ATA for TokenA or TokenB');
            console.log('Verify funds are available');
        }
    }
    else {
        if (!ataAccountInfoTokenA) {
            console.log('no ATA for base mint:', ataTokenA.toString());
        }
        if (!ataAccountInfoTokenB) {
            console.log('no ATA for quote mint:', ataTokenB.toString());
        }
        if (!ataAccountInfoTokenLP) {
            console.log('no ATA for LP mint:', ataTokenLP.toString());
        }
    }
}
async function lpWithdraw(ammId, amountTokenLP, serumVaultSigner, option) {
    checkOptions(option, 'network', 'payer');
    const networkName = getNetworkName(option);
    const connection = getConnection(networkName);
    const payer = await createKeypairFromFile(option['payer']);
    const ammIdPubKey = new PublicKey(ammId);
    const vaultSigner = new PublicKey(serumVaultSigner);
    const poolInfo = await getLiquidityPoolInfo(ammIdPubKey, vaultSigner, payer, connection, SERUM_PROGRAM_ID_V3[networkName], RAYDIUM_PROGRAM_ID_V4[networkName]);
    const ammState = await getLiquidityState(ammIdPubKey, connection);
    const ataTokenA = await findAssociatedTokenAddress(payer.publicKey, ammState.baseMint);
    const ataTokenB = await findAssociatedTokenAddress(payer.publicKey, ammState.quoteMint);
    const ataTokenLP = await findAssociatedTokenAddress(payer.publicKey, ammState.lpMint);
    const ataAccountInfoTokenA = await connection.getAccountInfo(ataTokenA, 'finalized');
    const ataAccountInfoTokenB = await connection.getAccountInfo(ataTokenB, 'finalized');
    const ataAccountInfoTokenLP = await connection.getAccountInfo(ataTokenLP, 'finalized');
    if (ataAccountInfoTokenA && ataAccountInfoTokenB && ataAccountInfoTokenLP) {
        const ataBalanceTokenLP = (await connection.getTokenAccountBalance(ataTokenA)).value;
        if (ataBalanceTokenLP.uiAmount > parseInt(amountTokenLP)) {
            const txid = await removeLiquidity(connection, payer, poolInfo, ataTokenLP.toString(), ataTokenA.toString(), ataTokenB.toString(), amountTokenLP);
            console.log('LP Withdraw TXID:', txid);
        }
        else {
            console.log('Insufficent Balance in payer ATA for TokenLP');
            console.log('Verify funds are available');
        }
    }
}
async function getLPBalance(ammId, option) {
    checkOptions(option, 'network', 'payer');
    const networkName = getNetworkName(option);
    const connection = getConnection(networkName);
    const payer = await createKeypairFromFile(option['payer']);
    const ammIdPubKey = new PublicKey(ammId);
    const fakeVaultSigner = new Keypair();
    const poolInfo = await getLiquidityPoolInfo(ammIdPubKey, fakeVaultSigner.publicKey, payer, connection, SERUM_PROGRAM_ID_V3[networkName], RAYDIUM_PROGRAM_ID_V4[networkName]);
    console.log('Token A Balance:', poolInfo.coin.balance.toEther().toFixed());
    console.log('Mint A Decimals:', poolInfo.coin.decimals.toString());
    console.log('');
    console.log('Token B Balance:', poolInfo.pc.balance.toEther().toFixed());
    console.log('Mint B Decimals:', poolInfo.pc.decimals.toString());
}
async function getAmountOut(ammId, amount, option) {
    checkOptions(option, 'network', 'payer', 'direction');
    const networkName = getNetworkName(option);
    const connection = getConnection(networkName);
    const payer = await createKeypairFromFile(option['payer']);
    const ammIdPubKey = new PublicKey(ammId);
    const fakeVaultSigner = new Keypair();
    const poolInfo = await getLiquidityPoolInfo(ammIdPubKey, fakeVaultSigner.publicKey, payer, connection, SERUM_PROGRAM_ID_V3[networkName], RAYDIUM_PROGRAM_ID_V4[networkName]);
    const fromCoin = option['direction'] === 'AtB'
        ? poolInfo.coin.mintAddress
        : poolInfo.pc.mintAddress;
    const toCoin = option['direction'] === 'AtB'
        ? poolInfo.pc.mintAddress
        : poolInfo.coin.mintAddress;
    const amountOut = getSwapOutAmount(poolInfo, fromCoin, toCoin, amount, 1.5);
    console.log('Amount Out:', amountOut.amountOut.fixed());
    console.log('New Base Balance:', amountOut.newBaseBal);
    console.log('New Quote Balance', amountOut.newQuoteBal);
}
async function swapToken(ammId, amount, option) {
    checkOptions(option, 'network', 'payer', 'direction');
    const networkName = getNetworkName(option);
    const connection = getConnection(networkName);
    const payer = await createKeypairFromFile(option['payer']);
    const ammIdPubKey = new PublicKey(ammId);
    const fakeVaultSigner = new Keypair();
    const poolInfo = await getLiquidityPoolInfo(ammIdPubKey, fakeVaultSigner.publicKey, payer, connection, SERUM_PROGRAM_ID_V3[networkName], RAYDIUM_PROGRAM_ID_V4[networkName]);
    const fromCoin = option['direction'] === 'AtB'
        ? poolInfo.coin.mintAddress
        : poolInfo.pc.mintAddress;
    const toCoin = option['direction'] === 'AtB'
        ? poolInfo.pc.mintAddress
        : poolInfo.coin.mintAddress;
    const fromCoinATA = await findAssociatedTokenAddress(payer.publicKey, new PublicKey(fromCoin));
    const toCoinATA = await findAssociatedTokenAddress(payer.publicKey, new PublicKey(toCoin));
    const txid = await swap(connection, payer, poolInfo, fromCoin.toString(), toCoin.toString(), fromCoinATA.toString(), toCoinATA.toString(), amount, '0', TOKENS.WSOL.mintAddress.toString());
    console.log('SWAP TXID:', txid);
}
async function getPrice(ammIdStr, option) {
    checkOptions(option, 'network');
    const networkName = getNetworkName(option);
    const connection = getConnection(networkName);
    const ammId = new PublicKey(ammIdStr);
    const poolKeys = await fetchPoolKeys(connection, ammId, RAYDIUM_PROGRAM_ID_V4[networkName], SERUM_PROGRAM_ID_V3[networkName]);
    const poolInfos = await Liquidity.fetchMultipleInfo({
        connection,
        pools: [poolKeys],
        config: {},
    });
    const poolInfo = poolInfos[0];
    // base token amount
    const baseReserve = new Decimal(poolInfo.baseReserve.toString()).div(new Decimal(10).pow(new Decimal(poolInfo.baseDecimals)));
    // quote token amount
    const quoteReserve = new Decimal(poolInfo.quoteReserve.toString()).div(new Decimal(10).pow(new Decimal(poolInfo.quoteDecimals)));
    const basePrice = quoteReserve.div(baseReserve);
    const quotePrice = baseReserve.div(quoteReserve);
    console.log('Base Price:', basePrice.toString());
    console.log('Quote Price:', quotePrice.toString());
}
async function setPrice(ammId, desiredPriceStr, option) {
    checkOptions(option, 'network', 'payer');
    const networkName = getNetworkName(option);
    const connection = getConnection(networkName);
    const payer = await createKeypairFromFile(option['payer']);
    const desiredPrice = new Decimal(desiredPriceStr);
    const ammIdPubKey = new PublicKey(ammId);
    const fakeVaultSigner = new Keypair();
    const poolInfo = await getLiquidityPoolInfo(ammIdPubKey, fakeVaultSigner.publicKey, payer, connection, SERUM_PROGRAM_ID_V3[networkName], RAYDIUM_PROGRAM_ID_V4[networkName]);
    const poolKeys = await fetchPoolKeys(connection, ammIdPubKey, RAYDIUM_PROGRAM_ID_V4[networkName], SERUM_PROGRAM_ID_V3[networkName]);
    const poolInfos = await Liquidity.fetchMultipleInfo({
        connection,
        pools: [poolKeys],
        config: {},
    });
    const newPoolInfo = poolInfos[0];
    const { coin, pc } = poolInfo;
    // base token amount
    const baseReserve = new Decimal(newPoolInfo.baseReserve.toNumber()).div(new Decimal(10).pow(new Decimal(coin.decimals)));
    // quote token amount
    const quoteReserve = new Decimal(newPoolInfo.quoteReserve.toString()).div(new Decimal(10).pow(new Decimal(pc.decimals)));
    const currentPrice = quoteReserve.div(baseReserve);
    console.log('currentPrice:', currentPrice.toString(), 'baseBalance:', baseReserve.toString(), 'quoteBalance:', quoteReserve.toString());
    const tradeFee = (poolInfo.fees &&
        new Fee(poolInfo.fees.swapFeeNumerator, poolInfo.fees.swapFeeDenominator)) ||
        new Fee(0, 1);
    const swapAmount = calcSwapAmountForDesiredPrice('raydium', baseReserve, poolInfo.coin.decimals, quoteReserve, poolInfo.coin.decimals, desiredPrice, tradeFee);
    if (swapAmount) {
        console.log(swapAmount);
        const shiftBaseDecimalsBy = new Decimal(10).pow(new Decimal(coin.decimals));
        const shiftQuoteDecimalsBy = new Decimal(10).pow(new Decimal(pc.decimals));
        const lamportsNeeded = swapAmount.input === 'base'
            ? swapAmount.amount.mul(shiftBaseDecimalsBy).round()
            : swapAmount.amount.mul(shiftQuoteDecimalsBy).round();
        console.log('lamportsNeeded:', lamportsNeeded.toString());
        if (!('quoteOnly' in option)) {
            const direction = swapAmount.input === 'base' ? 'AtB' : 'BtA';
            const fromCoin = direction === 'AtB'
                ? poolInfo.coin.mintAddress
                : poolInfo.pc.mintAddress;
            const toCoin = direction === 'AtB'
                ? poolInfo.pc.mintAddress
                : poolInfo.coin.mintAddress;
            const fromCoinATA = await findAssociatedTokenAddress(payer.publicKey, new PublicKey(fromCoin));
            const toCoinATA = await findAssociatedTokenAddress(payer.publicKey, new PublicKey(toCoin));
            const txid = await swap(connection, payer, poolInfo, fromCoin.toString(), toCoin.toString(), fromCoinATA.toString(), toCoinATA.toString(), swapAmount.amount.toString(), '0', TOKENS.WSOL.mintAddress.toString());
            handleTransactionOutcome(txid, await watchTransaction(connection, txid));
            await new Promise((e) => setTimeout(e, 5000));
            {
                const poolInfo = await getLiquidityPoolInfo(ammIdPubKey, fakeVaultSigner.publicKey, payer, connection, SERUM_PROGRAM_ID_V3[networkName], RAYDIUM_PROGRAM_ID_V4[networkName]);
                const poolKeys = await fetchPoolKeys(connection, ammIdPubKey, RAYDIUM_PROGRAM_ID_V4[networkName], SERUM_PROGRAM_ID_V3[networkName]);
                const poolInfos = await Liquidity.fetchMultipleInfo({
                    connection,
                    pools: [poolKeys],
                    config: {},
                });
                const newPoolInfo = poolInfos[0];
                const { coin, pc } = poolInfo;
                const baseBalanceStr = newPoolInfo.baseReserve
                    ? newPoolInfo.baseReserve.toString()
                    : '0';
                const quoteBalanceStr = newPoolInfo.quoteReserve
                    ? newPoolInfo.quoteReserve.toString()
                    : '0';
                // base token amount
                const baseReserve = new Decimal(baseBalanceStr).div(new Decimal(10).pow(new Decimal(coin.decimals)));
                // quote token amount
                const quoteReserve = new Decimal(quoteBalanceStr).div(new Decimal(10).pow(new Decimal(pc.decimals)));
                const currentPrice = quoteReserve.div(baseReserve);
                console.log('newPrice:', currentPrice.toString(), 'baseBalance:', baseReserve.toString(), 'quoteBalance:', quoteReserve.toString());
            }
        }
    }
    else {
        console.log('Unable to determine swap amount required to establish price:', desiredPrice.toString());
    }
}
export function addRaydiumCommands(program) {
    const raydium = program.command('raydium');
    raydium
        .command('showMarket <marketPubKey>')
        .description('display Serum Market')
        .addOption(networkOption)
        .addOption(payerOption)
        .action(showMarket);
    raydium
        .command('calculateMarketPrice <marketPubKey>')
        .description('calculate Serum Market price')
        .addOption(networkOption)
        .addOption(payerOption)
        .action(calculateMarketPrice);
    raydium
        .command('placeOrder <marketPubKey> <price> <size>')
        .description('place order in Serum Market')
        .addOption(networkOption)
        .addOption(payerOption)
        .addOption(swapDirectionOption)
        .action(placeOrder);
    raydium
        .command('showMarketATABalances <marketPubKey>')
        .description('find payer ATAs for Serum Market')
        .addOption(networkOption)
        .addOption(payerOption)
        .action(showMarketATAsBalance);
    raydium
        .command('createPool <marketPubKey> <tokenAStartingBalance> <tokenBStartingBalance>')
        .description('create LP given a Serum Market ID')
        .addOption(networkOption)
        .addOption(payerOption)
        .action(createRayPool);
    raydium
        .command('showPoolInfo <ammId>')
        .description('show LP info')
        .addOption(networkOption)
        .action(showAMM);
    raydium
        .command('showPoolATABalances <ammId>')
        .description('find payer ATAs for Pool AMM ID')
        .addOption(networkOption)
        .addOption(payerOption)
        .action(showPoolATAsBalance);
    raydium
        .command('deposit <ammId> <amountTokenA> <amountTokenB> <serumVaultSigner>')
        .description('deposit liquidity into LP')
        .addOption(networkOption)
        .addOption(payerOption)
        .action(lpDeposit);
    raydium
        .command('withdraw <ammId> <amountTokenLP> <serumVaultSigner>')
        .description('deposit liquidity into LP')
        .addOption(networkOption)
        .addOption(payerOption)
        .action(lpWithdraw);
    raydium
        .command('getLPBalance <ammId>')
        .description('check account balances of LP')
        .addOption(networkOption)
        .addOption(payerOption)
        .action(getLPBalance);
    raydium
        .command('getSwapAmountOut <ammId> <amount>')
        .description('get quote for token swap')
        .addOption(networkOption)
        .addOption(payerOption)
        .addOption(swapDirectionOption)
        .addOption(noFeesOption)
        .action(getAmountOut);
    raydium
        .command('swapToken <ammId> <amount>')
        .description('swap token')
        .addOption(networkOption)
        .addOption(payerOption)
        .addOption(swapDirectionOption)
        .action(swapToken);
    raydium
        .command('getPrice <ammId>')
        .description('getPrice raydium')
        .addOption(networkOption)
        .action(getPrice);
    raydium
        .command('setPrice <ammId> <desiredPrice>')
        .description('swap tokens needed to establish desired price')
        .addOption(networkOption)
        .addOption(payerOption)
        .addOption(quoteOnlyOption)
        .addOption(noFeesOption)
        .action(setPrice);
}
