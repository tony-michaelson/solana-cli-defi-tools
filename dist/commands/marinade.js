import { checkOptions, createKeypairFromFile, getConnection, getNetworkName, } from '../lib/util.js';
import { PublicKey, sendAndConfirmTransaction } from '@solana/web3.js';
import { networkOption, payerOption } from '../lib/constants.js';
import { Marinade, MarinadeConfig } from '@marinade.finance/marinade-ts-sdk';
import { Token, TOKEN_PROGRAM_ID, u64 as splu64 } from '@solana/spl-token';
async function stakeSol(solAmountStr, option) {
    checkOptions(option, 'network', 'payer');
    const networkName = getNetworkName(option);
    const payer = await createKeypairFromFile(option['payer']);
    const connection = getConnection(networkName);
    const solAmount = parseInt(solAmountStr);
    const solToken = new Token(connection, new PublicKey('So11111111111111111111111111111111111111112'), TOKEN_PROGRAM_ID, payer);
    const mintAInfo = await solToken.getMintInfo();
    const shiftedAmount = new splu64(solAmount * Math.pow(10, mintAInfo.decimals));
    const config = new MarinadeConfig({
        connection,
        publicKey: payer.publicKey,
    });
    const marinade = new Marinade(config);
    const { transaction } = await marinade.deposit(shiftedAmount);
    const signature = await sendAndConfirmTransaction(connection, transaction, [
        payer,
    ]);
    console.log('txid:', signature);
}
export function addMarinadeCommands(program) {
    const pythCmd = program.command('marinade');
    pythCmd
        .command('stake <solAmount>')
        .addOption(networkOption)
        .addOption(payerOption)
        .description('Stake SOL for mSOL')
        .action(stakeSol);
}
