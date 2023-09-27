import { parsePriceData } from '@pythnetwork/client';
import { checkOptions, getConnection, getNetworkName } from '../lib/util.js';
import { PublicKey } from '@solana/web3.js';
import { networkOption } from '../lib/constants.js';
async function pythPrice(pythPublicKeyStr, option) {
    checkOptions(option, 'network');
    const networkName = getNetworkName(option);
    const connection = getConnection(networkName);
    const pythPublicKey = new PublicKey(pythPublicKeyStr);
    const accountInfo = await connection.getAccountInfo(pythPublicKey, 'finalized');
    const priceData = parsePriceData(accountInfo.data);
    console.log(priceData);
    console.log('');
    console.log('Current Price Is:', priceData.price);
}
export function addPythCommands(program) {
    const pythCmd = program.command('pyth');
    pythCmd
        .command('getPrice <pricePubkey>')
        .addOption(networkOption)
        .description('Display pyth price data')
        .action(pythPrice);
}
