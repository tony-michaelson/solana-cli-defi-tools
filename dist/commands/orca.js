import { networkOption, payerOption, swapDirectionOption, quoteOnlyOption, tokenTypeOption, ORCA_TOKEN_SWAP_ID, } from '../lib/constants.js';
import { TokenSwap } from '@solana/spl-token-swap';
import { calcSwapAmountForDesiredPrice, checkOptions, createKeypairFromFile, getConnection, getNetworkName, } from '../lib/util.js';
import Decimal from 'decimal.js';
import { Account, Keypair, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token, u64 as splu64 } from '@solana/spl-token';
import { findAssociatedTokenAddress } from '../lib/token/token.js';
import { tokenSwapToOrcaPool } from '../lib/orca/orca.js';
import * as orca from '@orca-so/sdk';
import { Fee } from '../lib/fee.js';
async function createPool(mintA, payerTokenAccountAStr, mintB, payerTokenAccountBStr, option) {
    checkOptions(option, 'network', 'payer');
    const networkName = getNetworkName(option);
    const connection = getConnection(networkName);
    const payer = await createKeypairFromFile(option['payer']);
    const programId = ORCA_TOKEN_SWAP_ID[networkName];
    console.log('ProgramId:', programId.toString());
    const mintA_PK = new PublicKey(mintA);
    const mintB_PK = new PublicKey(mintB);
    const payerTokenAccountA_PK = new PublicKey(payerTokenAccountAStr);
    const payerTokenAccountB_PK = new PublicKey(payerTokenAccountBStr);
    // Hard-coded fee address, for testing production mode
    const SWAP_PROGRAM_OWNER_FEE_ADDRESS = process.env.SWAP_PROGRAM_OWNER_FEE_ADDRESS;
    // Pool fees
    const TRADING_FEE_NUMERATOR = 25;
    const TRADING_FEE_DENOMINATOR = 10000;
    const OWNER_TRADING_FEE_NUMERATOR = 5;
    const OWNER_TRADING_FEE_DENOMINATOR = 10000;
    const OWNER_WITHDRAW_FEE_NUMERATOR = SWAP_PROGRAM_OWNER_FEE_ADDRESS ? 0 : 1;
    const OWNER_WITHDRAW_FEE_DENOMINATOR = SWAP_PROGRAM_OWNER_FEE_ADDRESS ? 0 : 6;
    const HOST_FEE_NUMERATOR = 20;
    const HOST_FEE_DENOMINATOR = 100;
    // Accounts
    const tokenSwapAccount = new Keypair();
    const [authority, nonce] = await PublicKey.findProgramAddress([tokenSwapAccount.publicKey.toBuffer()], programId);
    console.log('Swap Account: \t\t', tokenSwapAccount.publicKey.toString());
    console.log('Authority: \t\t', authority.toString(), 'Nonce:', nonce);
    const lpMint = await Token.createMint(connection, payer, authority, null, 2, TOKEN_PROGRAM_ID);
    console.log('LP Token Mint: \t\t', lpMint.publicKey.toString());
    const tokenAccountLP = await lpMint.createAccount(payer.publicKey);
    console.log('LP Token Account: \t', tokenAccountLP.toString());
    const ownerKey = payer.publicKey.toString();
    const feeAccount = await lpMint.createAccount(new PublicKey(ownerKey));
    console.log('LP Fee Account: \t', feeAccount.toString());
    // Token Accounts
    const amount = 1;
    const tokenA = new Token(connection, mintA_PK, TOKEN_PROGRAM_ID, payer);
    const tokenAccountA_PK = await tokenA.createAccount(authority);
    const mintAInfo = await tokenA.getMintInfo();
    const shiftedAmountA = new splu64(amount * Math.pow(10, mintAInfo.decimals));
    await tokenA.transfer(payerTokenAccountA_PK, tokenAccountA_PK, payer.publicKey, [payer], shiftedAmountA);
    const tokenB = new Token(connection, mintB_PK, TOKEN_PROGRAM_ID, payer);
    const tokenAccountB_PK = await tokenB.createAccount(authority);
    const mintBInfo = await tokenB.getMintInfo();
    const shiftedAmountB = new splu64(amount * Math.pow(10, mintBInfo.decimals));
    await tokenA.transfer(payerTokenAccountB_PK, tokenAccountB_PK, payer.publicKey, [payer], shiftedAmountB);
    const swap = await TokenSwap.createTokenSwap(connection, new Account(payer.secretKey), new Account(tokenSwapAccount.secretKey), authority, tokenAccountA_PK, tokenAccountB_PK, lpMint.publicKey, mintA_PK, mintB_PK, feeAccount, tokenAccountLP, programId, TOKEN_PROGRAM_ID, nonce, TRADING_FEE_NUMERATOR, TRADING_FEE_DENOMINATOR, OWNER_TRADING_FEE_NUMERATOR, OWNER_TRADING_FEE_DENOMINATOR, OWNER_WITHDRAW_FEE_NUMERATOR, OWNER_WITHDRAW_FEE_DENOMINATOR, HOST_FEE_NUMERATOR, HOST_FEE_DENOMINATOR, 0 // 0 for ConstantProduct & 2 for Stable
    );
    console.log('Swap Initialized:', swap.tokenSwap.toString());
}
async function showPool(tokenSwapID, option) {
    checkOptions(option, 'network', 'payer');
    const networkName = getNetworkName(option);
    const connection = getConnection(networkName);
    const payer = await createKeypairFromFile(option['payer']);
    const programId = ORCA_TOKEN_SWAP_ID[networkName];
    const tokenSwap_PK = new PublicKey(tokenSwapID);
    const payerAccount = new Account(payer.secretKey);
    const tokenSwap = await TokenSwap.loadTokenSwap(connection, tokenSwap_PK, programId, payerAccount);
    const tokenAccountBalA = (await connection.getTokenAccountBalance(tokenSwap.tokenAccountA)).value.uiAmount;
    const tokenAccountBalB = (await connection.getTokenAccountBalance(tokenSwap.tokenAccountB)).value.uiAmount;
    const mintLP = new Token(connection, tokenSwap.poolToken, TOKEN_PROGRAM_ID, payer);
    const lpTokenSupply = (await mintLP.getMintInfo()).supply;
    console.log('---- ORCA SWAP ACCOUNT INFO ----');
    console.log('Authority:\t\t', tokenSwap.authority.toString());
    console.log('Curve Type:\t\t', tokenSwap.curveType.toString());
    console.log('LP Token Mint:\t\t', tokenSwap.poolToken.toString());
    console.log('LP Mint Supply:\t\t', lpTokenSupply.toString());
    console.log('Mint A:\t\t\t', tokenSwap.mintA.toString());
    console.log('Token Account A:\t', tokenSwap.tokenAccountA.toString());
    console.log('Token Account A Bal:\t', tokenAccountBalA.toString());
    console.log('Mint B:\t\t\t', tokenSwap.mintB.toString());
    console.log('Token Account B:\t', tokenSwap.tokenAccountB.toString());
    console.log('Token Account B Bal:\t', tokenAccountBalB.toString());
    console.log('Swap Program Id:\t', tokenSwap.swapProgramId.toString());
    console.log('Trade Fee Numerator:\t', tokenSwap.tradeFeeNumerator.toString());
    console.log('Trade Fee Denominator:\t', tokenSwap.tradeFeeDenominator.toString());
    console.log('Owner Fee Numerator:\t', tokenSwap.ownerTradeFeeNumerator.toString());
    console.log('Owner Fee Denominator:\t', tokenSwap.ownerTradeFeeDenominator.toString());
    console.log('Host Fee Numerator:\t', tokenSwap.hostFeeNumerator.toString());
    console.log('Host Fee Denominator:\t', tokenSwap.hostFeeDenominator.toString());
    console.log('Fee Account:\t\t', tokenSwap.feeAccount.toString());
    console.log('---- / ORCA SWAP ACCOUNT INFO ----');
}
async function showPoolATAs(tokenSwapID, option) {
    checkOptions(option, 'network', 'payer');
    const networkName = getNetworkName(option);
    const connection = getConnection(networkName);
    const payer = await createKeypairFromFile(option['payer']);
    const programId = ORCA_TOKEN_SWAP_ID[networkName];
    const tokenSwap_PK = new PublicKey(tokenSwapID);
    const payerAccount = new Account(payer.secretKey);
    const tokenSwap = await TokenSwap.loadTokenSwap(connection, tokenSwap_PK, programId, payerAccount);
    const mintA = new Token(connection, tokenSwap.mintA, TOKEN_PROGRAM_ID, payer);
    const mintB = new Token(connection, tokenSwap.mintB, TOKEN_PROGRAM_ID, payer);
    const mintLP = new Token(connection, tokenSwap.poolToken, TOKEN_PROGRAM_ID, payer);
    const ataA = await findAssociatedTokenAddress(payer.publicKey, mintA.publicKey);
    const ataB = await findAssociatedTokenAddress(payer.publicKey, mintB.publicKey);
    const ataLP = await findAssociatedTokenAddress(payer.publicKey, mintLP.publicKey);
    const ataAInfo = await connection.getAccountInfo(ataA);
    const ataBInfo = await connection.getAccountInfo(ataB);
    const ataLPInfo = await connection.getAccountInfo(ataLP);
    ataAInfo || (await mintA.createAssociatedTokenAccount(payer.publicKey));
    ataBInfo || (await mintB.createAssociatedTokenAccount(payer.publicKey));
    ataLPInfo || (await mintLP.createAssociatedTokenAccount(payer.publicKey));
    const ataABal = (await connection.getTokenAccountBalance(ataA)).value
        .uiAmountString;
    const ataBBal = (await connection.getTokenAccountBalance(ataB)).value
        .uiAmountString;
    const ataLPBal = (await connection.getTokenAccountBalance(ataLP)).value
        .uiAmountString;
    console.log('Mint A:\t\t', mintA.publicKey.toString());
    console.log('ATA A:\t\t', ataA.toString());
    console.log('Balance:\t', ataABal);
    console.log();
    console.log('Mint B:\t\t', mintB.publicKey.toString());
    console.log('ATA B:\t\t', ataB.toString());
    console.log('Balance:\t', ataBBal);
    console.log();
    console.log('Mint LP:\t', mintLP.publicKey.toString());
    console.log('ATA LP:\t\t', ataLP.toString());
    console.log('Balance:\t', ataLPBal);
    console.log();
}
async function deposit(tokenSwapID, tokenQty, option) {
    checkOptions(option, 'network', 'payer');
    const networkName = getNetworkName(option);
    const connection = getConnection(networkName);
    const payer = await createKeypairFromFile(option['payer']);
    const programId = ORCA_TOKEN_SWAP_ID[networkName];
    const tokenSwap_PK = new PublicKey(tokenSwapID);
    const payerAccount = new Account(payer.secretKey);
    const tokenSwap = await TokenSwap.loadTokenSwap(connection, tokenSwap_PK, programId, payerAccount);
    const orcaNetwork = networkName === 'devnet' ? orca.Network.DEVNET : orca.Network.MAINNET;
    const orcaPool = await tokenSwapToOrcaPool(connection, orcaNetwork, payer, tokenSwap);
    const inputToken = option['token'] === 'A' ? orcaPool.getTokenA() : orcaPool.getTokenB();
    const inputTokenAmount = new Decimal(parseInt(tokenQty));
    const quote = await orcaPool.getQuote(inputToken, inputTokenAmount);
    const tokenAmount = quote.getMinOutputAmount();
    const { maxTokenAIn, maxTokenBIn, minPoolTokenAmountOut } = option['token'] === 'A'
        ? await orcaPool.getDepositQuote(inputTokenAmount, tokenAmount)
        : await orcaPool.getDepositQuote(tokenAmount, inputTokenAmount);
    console.log('--- DEPOSIT QUOTE ---');
    console.log('GIVE:');
    console.log('TOKEN A:\t' + maxTokenAIn.toNumber());
    console.log('TOKEN B:\t' + maxTokenBIn.toNumber());
    console.log();
    console.log('RECEIVE');
    console.log('LP Tokens:\t' + minPoolTokenAmountOut.toNumber());
    console.log('--- / DEPOSIT QUOTE ---');
    if (!('quoteOnly' in option)) {
        const poolDepositPayload = await orcaPool.deposit(payer, maxTokenAIn, maxTokenBIn, minPoolTokenAmountOut);
        const poolDepositTxId = await poolDepositPayload.execute();
        console.log('Pool deposited:', poolDepositTxId, '\n');
    }
}
const withdrawAll = async (tokenSwapID, option) => withdraw(tokenSwapID, '0', { all: 'true', ...option });
async function withdraw(tokenSwapID, tokenQty, option) {
    checkOptions(option, 'network', 'payer');
    const networkName = getNetworkName(option);
    const connection = getConnection(networkName);
    const payer = await createKeypairFromFile(option['payer']);
    const programId = ORCA_TOKEN_SWAP_ID[networkName];
    const tokenAmount = new Decimal(parseInt(tokenQty));
    const tokenSwap_PK = new PublicKey(tokenSwapID);
    const payerAccount = new Account(payer.secretKey);
    const tokenSwap = await TokenSwap.loadTokenSwap(connection, tokenSwap_PK, programId, payerAccount);
    const orcaNetwork = networkName === 'devnet' ? orca.Network.DEVNET : orca.Network.MAINNET;
    const orcaPool = await tokenSwapToOrcaPool(connection, orcaNetwork, payer, tokenSwap);
    const withdrawTokenAmount = 'all' in option ? await orcaPool.getLPBalance(payer.publicKey) : tokenAmount;
    const withdrawTokenMint = orcaPool.getPoolTokenMint();
    const { maxPoolTokenAmountIn, minTokenAOut, minTokenBOut } = await orcaPool.getWithdrawQuote(withdrawTokenAmount, withdrawTokenMint);
    console.log('--- WITHDRAW QUOTE ---');
    console.log('GIVE:');
    console.log('LP Tokens:\t' + maxPoolTokenAmountIn.toNumber());
    console.log();
    console.log('RECEIVE');
    console.log('TOKEN A:\t' + minTokenAOut.toNumber());
    console.log('TOKEN B:\t' + minTokenBOut.toNumber());
    console.log('--- / WITHDRAW QUOTE ---');
    if (!('quoteOnly' in option)) {
        // TODO; put minimums in
        const poolWithdrawPayload = await orcaPool.withdraw(payer, maxPoolTokenAmountIn, new Decimal(1), new Decimal(1));
        const poolWithdrawTxId = await poolWithdrawPayload.execute();
        console.log('Pool withdrawn:', poolWithdrawTxId, '\n');
    }
}
async function swap(tokenSwapID, tokenQty, option) {
    checkOptions(option, 'network', 'payer', 'direction');
    const networkName = getNetworkName(option);
    const connection = getConnection(networkName);
    const payer = await createKeypairFromFile(option['payer']);
    const programId = ORCA_TOKEN_SWAP_ID[networkName];
    const tokenAmountIn = new Decimal(parseInt(tokenQty));
    const tokenSwap_PK = new PublicKey(tokenSwapID);
    const payerAccount = new Account(payer.secretKey);
    const tokenSwap = await TokenSwap.loadTokenSwap(connection, tokenSwap_PK, programId, payerAccount);
    const orcaNetwork = networkName === 'devnet' ? orca.Network.DEVNET : orca.Network.MAINNET;
    const orcaPool = await tokenSwapToOrcaPool(connection, orcaNetwork, payer, tokenSwap);
    const fromCoin = option['direction'] === 'AtB' ? orcaPool.getTokenA() : orcaPool.getTokenB();
    const toCoin = option['direction'] === 'AtB' ? orcaPool.getTokenB() : orcaPool.getTokenA();
    const quote = await orcaPool.getQuote(fromCoin, tokenAmountIn);
    const tokenAmountOut = quote.getMinOutputAmount();
    console.log('--- SWAP QUOTE ---');
    console.log('INPUT TOKEN:');
    console.log(fromCoin.name + ':\t' + tokenAmountIn.toString());
    console.log('');
    console.log('OUTPUT TOKEN:');
    console.log(toCoin.name + ':\t' + quote.getExpectedOutputAmount().toNumber());
    console.log('');
    console.log('FEES:');
    console.log(quote.getLPFees().toDecimal().toString());
    console.log('--- / SWAP QUOTE ---');
    if (!('quoteOnly' in option)) {
        const swapPayload = await orcaPool.swap(payer, fromCoin, tokenAmountIn, tokenAmountOut);
        const swapTxId = await swapPayload.execute();
        console.log('Swapped:', swapTxId, '\n');
    }
}
async function getPrice(tokenSwapID, option) {
    checkOptions(option, 'network', 'payer');
    const networkName = getNetworkName(option);
    const connection = getConnection(networkName);
    const payer = await createKeypairFromFile(option['payer']);
    const programId = ORCA_TOKEN_SWAP_ID[networkName];
    const tokenSwap_PK = new PublicKey(tokenSwapID);
    const payerAccount = new Account(payer.secretKey);
    const tokenSwap = await TokenSwap.loadTokenSwap(connection, tokenSwap_PK, programId, payerAccount);
    const baseBalanceLookup = await connection.getTokenAccountBalance(tokenSwap.tokenAccountA);
    const baseBalance = (baseBalanceLookup.value.uiAmountString &&
        new Decimal(baseBalanceLookup.value.uiAmountString)) ||
        new Decimal(0);
    const quoteBalanceLookup = await connection.getTokenAccountBalance(tokenSwap.tokenAccountB);
    const quoteBalance = (quoteBalanceLookup.value.uiAmountString &&
        new Decimal(quoteBalanceLookup.value.uiAmountString)) ||
        new Decimal(0);
    console.log('price:', quoteBalance.div(baseBalance));
}
async function setPrice(tokenSwapID, price, option) {
    checkOptions(option, 'network', 'payer');
    const networkName = getNetworkName(option);
    const connection = getConnection(networkName);
    const payer = await createKeypairFromFile(option['payer']);
    const desiredPrice = new Decimal(price);
    const programId = ORCA_TOKEN_SWAP_ID[networkName];
    const tokenSwap_PK = new PublicKey(tokenSwapID);
    const payerAccount = new Account(payer.secretKey);
    const tokenSwap = await TokenSwap.loadTokenSwap(connection, tokenSwap_PK, programId, payerAccount);
    const baseBalanceLookup = await connection.getTokenAccountBalance(tokenSwap.tokenAccountA);
    const baseBalance = (baseBalanceLookup.value.uiAmountString &&
        new Decimal(baseBalanceLookup.value.uiAmountString)) ||
        new Decimal(0);
    const baseDecimals = baseBalanceLookup.value.decimals;
    const quoteBalanceLookup = await connection.getTokenAccountBalance(tokenSwap.tokenAccountB);
    const quoteBalance = (quoteBalanceLookup.value.uiAmountString &&
        new Decimal(quoteBalanceLookup.value.uiAmountString)) ||
        new Decimal(0);
    const tradeFee = new Fee(tokenSwap.tradeFeeNumerator.toString(), tokenSwap.tradeFeeDenominator.toString());
    const ownerFee = new Fee(tokenSwap.ownerTradeFeeNumerator.toString(), tokenSwap.ownerTradeFeeDenominator.toString());
    // https://github.com/orca-so/typescript-sdk/blob/55eb802db6d51f9e51f614cbf2e2dfea5dc6f5ff/src/model/quote/constant-product-quote.ts#L45
    // host fee appears to be ignored
    // const hostFee = new Decimal(tokenSwap.hostFeeNumerator.toString()).div(
    //   tokenSwap.hostFeeDenominator.toString()
    // )
    const swapAmount = calcSwapAmountForDesiredPrice('orca', baseBalance, baseBalanceLookup.value.decimals, quoteBalance, quoteBalanceLookup.value.decimals, desiredPrice, tradeFee, ownerFee);
    console.log(swapAmount);
    const tokenAmountIn = swapAmount.amount;
    const direction = swapAmount.input === 'base' ? 'AtB' : 'BtA';
    const orcaNetwork = networkName === 'devnet' ? orca.Network.DEVNET : orca.Network.MAINNET;
    const orcaPool = await tokenSwapToOrcaPool(connection, orcaNetwork, payer, tokenSwap);
    const fromCoin = direction === 'AtB' ? orcaPool.getTokenA() : orcaPool.getTokenB();
    const toCoin = direction === 'AtB' ? orcaPool.getTokenB() : orcaPool.getTokenA();
    const quote = await orcaPool.getQuote(fromCoin, tokenAmountIn);
    const tokenAmountOut = quote.getMinOutputAmount();
    console.log('--- SWAP QUOTE ---');
    console.log('INPUT TOKEN:');
    console.log(fromCoin.name + ':\t' + tokenAmountIn.toString());
    console.log(fromCoin.name +
        ' * 10^' +
        fromCoin.scale +
        ':\t' +
        tokenAmountIn.mul(new Decimal(10).pow(fromCoin.scale)).round());
    console.log('');
    console.log('OUTPUT TOKEN:');
    console.log(toCoin.name + ':\t' + quote.getExpectedOutputAmount().toNumber());
    console.log('');
    console.log('FEES:');
    console.log(quote.getLPFees().toDecimal().toString());
    console.log('--- / SWAP QUOTE ---');
    if (!('quoteOnly' in option)) {
        const swapPayload = await orcaPool.swap(payer, fromCoin, tokenAmountIn, tokenAmountOut);
        const swapTxId = await swapPayload.execute();
        console.log('Swapped:', swapTxId, '\n');
        await new Promise((e) => setTimeout(e, 5000));
        {
            const baseBalanceLookup = await connection.getTokenAccountBalance(tokenSwap.tokenAccountA);
            const baseBalance = (baseBalanceLookup.value.uiAmountString &&
                new Decimal(baseBalanceLookup.value.uiAmountString)) ||
                new Decimal(0);
            const quoteBalanceLookup = await connection.getTokenAccountBalance(tokenSwap.tokenAccountB);
            const quoteBalance = (quoteBalanceLookup.value.uiAmountString &&
                new Decimal(quoteBalanceLookup.value.uiAmountString)) ||
                new Decimal(0);
            console.log('new price:', quoteBalance.div(baseBalance));
        }
    }
}
export function addOrcaCommands(program) {
    const ocra = program.command('orca');
    ocra
        .command('createPool <mintA> <payerTokenAccountA> <mintB> <payerTokenAccountB>')
        .description('create Orca liquidity pool')
        .addOption(networkOption)
        .addOption(payerOption)
        .action(createPool);
    ocra
        .command('showPool <tokenSwapId>')
        .description('show Orca token swap account')
        .addOption(networkOption)
        .addOption(payerOption)
        .action(showPool);
    ocra
        .command('showPoolATAs <tokenSwapId>')
        .description('show LP ATA addresses and balances')
        .addOption(networkOption)
        .addOption(payerOption)
        .action(showPoolATAs);
    ocra
        .command('deposit <tokenSwapId> <tokenAmount>')
        .description('deposit A & B tokens into LP')
        .addOption(networkOption)
        .addOption(payerOption)
        .addOption(quoteOnlyOption)
        .addOption(tokenTypeOption)
        .action(deposit);
    ocra
        .command('withdraw <tokenSwapId> <tokenAmountLP>')
        .description('withdraw from LP')
        .addOption(networkOption)
        .addOption(payerOption)
        .addOption(quoteOnlyOption)
        .action(withdraw);
    ocra
        .command('withdrawAll <tokenSwapId>')
        .description('withdraw all tokens from LP')
        .addOption(networkOption)
        .addOption(payerOption)
        .addOption(quoteOnlyOption)
        .action(withdrawAll);
    ocra
        .command('swap <tokenSwapId> <tokenAmount>')
        .description('swap token')
        .addOption(networkOption)
        .addOption(payerOption)
        .addOption(swapDirectionOption)
        .addOption(quoteOnlyOption)
        .action(swap);
    ocra
        .command('getPrice <tokenSwapId>')
        .description('price of LP')
        .addOption(networkOption)
        .addOption(payerOption)
        .action(getPrice);
    ocra
        .command('setPrice <tokenSwapId> <desiredPrice>')
        .description('swap as needed to establish desired price')
        .addOption(networkOption)
        .addOption(payerOption)
        .addOption(quoteOnlyOption)
        .action(setPrice);
}
