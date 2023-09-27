import { Connection, Keypair, PublicKey, } from '@solana/web3.js';
import { fs } from 'mz';
import { NETWORK_TO_CHAINID, RPC_SERVERS } from './constants.js';
import { FeeU64 } from './fee.js';
import Decimal from 'decimal.js';
import BN from 'bn.js';
import { DecimalUtil, U64Utils } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';
export const ZERO = new Decimal(0);
export const ONE = new Decimal(1);
function honeOrcaPrice(swapAmount, guess, params, count = 1, max = 1000) {
    const swapAmountDecimals = params.input === 'base' ? params.baseDecimals : params.quoteDecimals;
    const invariant = params.input === 'base'
        ? params.baseAmount.mul(params.quoteAmount)
        : params.quoteAmount.mul(params.baseAmount);
    const testAmount = swapAmount.add(guess);
    const tradeFeeAmount = testAmount
        .mul(params.tradeFee.numerator)
        .div(params.tradeFee.denominator);
    const ownerFeeAmount = testAmount
        .mul(params.ownerFee.numerator)
        .div(params.ownerFee.denominator);
    const fees = tradeFeeAmount.add(ownerFeeAmount);
    const swapAmountLessFees = testAmount.sub(fees);
    const [sourceAmount, sourceDecimals, destinationDecimals] = params.input === 'base'
        ? [params.baseAmount, params.baseDecimals, params.quoteDecimals]
        : [params.quoteAmount, params.quoteDecimals, params.baseDecimals];
    const divisor = sourceAmount.add(swapAmountLessFees);
    const [newDestinationAmount, newSourceAmount] = U64Utils.ceilingDivision(invariant, divisor);
    const newSourceAmountDecimal = DecimalUtil.fromU64(newSourceAmount.add(fees), sourceDecimals);
    const newDestinationAmountDecimal = DecimalUtil.fromU64(newDestinationAmount, destinationDecimals);
    const newQuoteAmount = params.input === 'base'
        ? newDestinationAmountDecimal
        : newSourceAmountDecimal;
    const newBaseAmount = params.input === 'base'
        ? newSourceAmountDecimal
        : newDestinationAmountDecimal;
    const newPrice = newQuoteAmount.div(newBaseAmount);
    const isAcceptable = newPrice.gte(params.desiredPrice.sub('0.0000001')) &&
        newPrice.lte(params.desiredPrice.add('0.0000001'));
    const tooLow = newPrice.lte(params.desiredPrice);
    const tooHigh = newPrice.gte(params.desiredPrice);
    if (count > max) {
        return null;
    }
    if (isAcceptable) {
        return [
            DecimalUtil.fromU64(testAmount, swapAmountDecimals),
            DecimalUtil.fromU64(fees, swapAmountDecimals),
            newQuoteAmount,
            newBaseAmount,
        ];
    }
    else if (tooLow && params.walk === 'down') {
        return honeOrcaPrice(swapAmount, guess.div(new u64('2')), params, (count += 1));
    }
    else if (tooHigh && params.walk === 'up') {
        return honeOrcaPrice(swapAmount, guess.div(new u64('2')), params, (count += 1));
    }
    else {
        return honeOrcaPrice(swapAmount.add(guess), guess, params, (count += 1));
    }
}
export function raydiumSwapQuote(swapAmount, params) {
    const fees = swapAmount
        .mul(params.tradeFee.numerator)
        .div(params.tradeFee.denominator);
    const swapAmountWithFee = swapAmount.sub(fees);
    const sourceAmount = params.input === 'base' ? params.baseAmount : params.quoteAmount;
    const destinationAmount = params.input === 'base' ? params.quoteAmount : params.baseAmount;
    const newSourceAmount = sourceAmount.plus(swapAmountWithFee);
    const amountOut = destinationAmount
        .mul(swapAmountWithFee)
        .div(newSourceAmount);
    const newDestinationAmount = destinationAmount.sub(amountOut);
    const newQuoteAmount = params.input === 'base'
        ? newDestinationAmount
        : sourceAmount.plus(swapAmount);
    const newBaseAmount = params.input === 'base'
        ? sourceAmount.plus(swapAmount)
        : newDestinationAmount;
    const newPrice = newQuoteAmount.div(newBaseAmount);
    return {
        newPrice,
        fees,
        newQuoteAmount,
        newBaseAmount,
    };
}
function honeRaydiumPrice(swapAmount, guess, params, count = 1, max = 1000) {
    const testAmount = swapAmount.add(guess);
    const quote = raydiumSwapQuote(testAmount, params);
    const isAcceptable = quote.newPrice.gte(params.desiredPrice.sub('0.000001')) &&
        quote.newPrice.lte(params.desiredPrice.add('0.000001'));
    const tooLow = quote.newPrice.lte(params.desiredPrice);
    const tooHigh = quote.newPrice.gte(params.desiredPrice);
    if (count > max) {
        return null;
    }
    if (isAcceptable) {
        return [testAmount, quote.fees, quote.newQuoteAmount, quote.newBaseAmount];
    }
    else if (tooLow && params.walk === 'down') {
        return honeRaydiumPrice(swapAmount, guess.div(2), params, (count += 1));
    }
    else if (tooHigh && params.walk === 'up') {
        return honeRaydiumPrice(swapAmount, guess.div(2), params, (count += 1));
    }
    else {
        return honeRaydiumPrice(swapAmount.add(guess), guess, params, (count += 1));
    }
}
export function calcSwapAmountForDesiredPrice(type, baseAmount, baseDecimals, quoteAmount, quoteDecimals, desiredPrice, tradeFee, ownerFee) {
    const currentPrice = quoteAmount.div(baseAmount);
    const underPeg = currentPrice.gt(desiredPrice);
    const overPeg = currentPrice.lt(desiredPrice);
    const tradeFeeU64 = new FeeU64(tradeFee.numerator.toString(), tradeFee.denominator.toString());
    const ownerFeeU64 = new FeeU64(ownerFee ? ownerFee.numerator.toString() : '0', ownerFee ? ownerFee.denominator.toString() : '1');
    if (underPeg) {
        const priceDiff = currentPrice.sub(desiredPrice);
        const valueDiff = baseAmount.mul(priceDiff);
        const startAmount = valueDiff.div(currentPrice);
        const result = type === 'orca'
            ? honeOrcaPrice(new u64(0), DecimalUtil.toU64(startAmount, baseDecimals), {
                input: 'base',
                walk: 'down',
                baseAmount: DecimalUtil.toU64(baseAmount, baseDecimals),
                baseDecimals,
                quoteAmount: DecimalUtil.toU64(quoteAmount, quoteDecimals),
                quoteDecimals,
                desiredPrice,
                tradeFee: tradeFeeU64,
                ownerFee: ownerFeeU64 ? ownerFeeU64 : new FeeU64(0, 1),
            })
            : honeRaydiumPrice(new Decimal(0), startAmount, {
                input: 'base',
                walk: 'down',
                baseAmount,
                quoteAmount,
                desiredPrice,
                tradeFee,
            });
        if (result) {
            const [swapAmount, fees, newQuoteAmount, newBaseAmount] = result;
            return {
                input: 'base',
                amount: swapAmount,
                fee: fees,
                expect: {
                    baseAmount: newBaseAmount,
                    quoteAmount: newQuoteAmount,
                    amount: quoteAmount.sub(newQuoteAmount),
                    price: newQuoteAmount.div(newBaseAmount),
                },
            };
        }
        else {
            return null;
        }
    }
    else if (overPeg) {
        const priceDiff = desiredPrice.sub(currentPrice);
        const valueDiff = baseAmount.mul(priceDiff);
        const startAmount = valueDiff.div(currentPrice);
        const result = type === 'orca'
            ? honeOrcaPrice(new u64(0), DecimalUtil.toU64(startAmount, baseDecimals), {
                input: 'quote',
                walk: 'up',
                baseAmount: DecimalUtil.toU64(baseAmount, baseDecimals),
                baseDecimals,
                quoteAmount: DecimalUtil.toU64(quoteAmount, quoteDecimals),
                quoteDecimals,
                desiredPrice,
                tradeFee: tradeFeeU64,
                ownerFee: ownerFeeU64 ? ownerFeeU64 : new FeeU64(0, 1),
            })
            : honeRaydiumPrice(new Decimal(0), startAmount, {
                input: 'quote',
                walk: 'up',
                baseAmount,
                quoteAmount,
                desiredPrice,
                tradeFee,
            });
        if (result) {
            const [swapAmount, fees, newQuoteAmount, newBaseAmount] = result;
            return {
                input: 'quote',
                amount: swapAmount,
                fee: fees,
                expect: {
                    baseAmount: newBaseAmount,
                    quoteAmount: newQuoteAmount,
                    amount: baseAmount.sub(newBaseAmount),
                    price: newQuoteAmount.div(newBaseAmount),
                },
            };
        }
        else {
            return null;
        }
    }
    else {
        return null;
    }
}
export function logPubKey(name, key) {
    console.log('const ' + name + " = new PublicKey('" + key.toString() + "')");
}
export function logBumpSeed(name, value) {
    console.log('const ' + name + ' = ' + value);
}
export async function createKeypairFromFile(filePath) {
    const secretKeyString = await fs.readFile(filePath, { encoding: 'utf8' });
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    return Keypair.fromSecretKey(secretKey);
}
export function getChainId(network) {
    return NETWORK_TO_CHAINID[network] ? NETWORK_TO_CHAINID[network] : 0;
}
export function getRPC(network, url = '') {
    return RPC_SERVERS[network.toString()] ? RPC_SERVERS[network.toString()] : url;
}
export function getConnection(network) {
    return new Connection(getRPC(network), 'confirmed');
}
export function getNetworkName(opts) {
    if ('network' in opts &&
        (opts['network'] === 'mainnet-beta' ||
            opts['network'] === 'mainnet-beta-nobody' ||
            opts['network'] === 'devnet' ||
            opts['network'] === 'testnet')) {
        return opts['network'];
    }
    else {
        throw 'Network name:' + opts['network'] + ' is unknown';
    }
}
export function checkOptions(opts, ...options) {
    for (const i in options) {
        const opt = options[i];
        if (!(opt in opts)) {
            throw '--' + opt + ' must be set';
        }
    }
}
export function getPubkeyForEnv(keyString) {
    if (keyString) {
        return new PublicKey(keyString);
    }
    else {
        throw 'No key provided';
    }
}
export async function printAccountBalance(account, connection) {
    try {
        const balance = await connection.getTokenAccountBalance(account);
        console.log(balance);
        console.log('Balance:', balance.value.uiAmountString);
    }
    catch (error) {
        if (error.toString().match('could not find account')) {
            console.log('Account not created!');
        }
        else {
            console.log(error);
        }
    }
}
/**
 * Loads the account info of an account owned by a program.
 * @param connection
 * @param address
 * @param programId
 * @returns
 */
export const loadProgramAccount = async (connection, address, programId) => {
    const accountInfo = await connection.getAccountInfo(address, 'processed');
    if (accountInfo === null) {
        throw new Error(address.toString());
    }
    if (!accountInfo.owner.equals(programId)) {
        throw new Error(`Invalid owner: expected ${programId.toBase58()}, found ${accountInfo.owner.toBase58()}`);
    }
    return Buffer.from(accountInfo.data);
};
export async function watchTransaction(connection, signature) {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    let success = 0;
    await connection.onSignature(signature, function (signatureResult, _context) {
        if (signatureResult.err) {
            success = -1;
        }
        else {
            success = 1;
        }
    });
    while (success === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    return success === 1;
}
export function handleTransactionOutcome(signature, success) {
    console.log('(' + success ? 'success' : 'failed' + ') txid:', signature);
}
export function logObject(obj, prefix = ' ') {
    for (const property in obj) {
        const value = obj[property] instanceof BN || typeof obj[property] === 'bigint'
            ? obj[property].toString()
            : obj[property];
        console.log(prefix, property.toString() + ': ' + "'" + value + "'");
    }
}
