import { PublicKey } from '@solana/web3.js';
import { networkOption } from '../lib/constants.js';
import { checkOptions, getConnection, getNetworkName, loadProgramAccount, } from '../lib/util.js';
async function pubKeyToU8Array(pubkey) {
    const publicKey = new PublicKey(pubkey ? pubkey : '');
    console.log(JSON.stringify(publicKey.toBytes()));
}
async function dumpAccountData(pubkey, programIDStr, option) {
    checkOptions(option, 'network');
    const networkName = getNetworkName(option);
    const connection = getConnection(networkName);
    const publicKey = new PublicKey(pubkey ? pubkey : '');
    const programID = new PublicKey(programIDStr ? programIDStr : '');
    const data = await loadProgramAccount(connection, publicKey, programID);
    console.dir(JSON.parse(JSON.stringify(data)), { maxArrayLength: null });
}
async function findProgramAddress(pubkey, seed, programIdStr) {
    const publicKey = new PublicKey(pubkey ? pubkey : '');
    const programId = new PublicKey(programIdStr ? programIdStr : '');
    const PDA = await PublicKey.findProgramAddress([publicKey.toBuffer(), Buffer.from(seed)], programId);
    console.log(PDA[0].toString());
    console.log(PDA[1].toString());
}
async function createProgramAddress(pubkey, seed, programIdStr, bumpSeed) {
    const publicKey = new PublicKey(pubkey ? pubkey : '');
    const programId = new PublicKey(programIdStr ? programIdStr : '');
    const PDA = await PublicKey.createProgramAddress([
        publicKey.toBuffer(),
        Buffer.from(seed),
        Buffer.from([parseInt(bumpSeed)]),
    ], programId);
    console.log(PDA.toString());
}
export function addSolanaCommands(program) {
    const solanaCmd = program.command('solana');
    solanaCmd
        .command('pubkeyToU8Array <pubKey>')
        .description('convert a public key string to a u8array')
        .action(pubKeyToU8Array);
    solanaCmd
        .command('dumpAccountData <pubKey> <programID>')
        .description('dump account data as a u8 array')
        .addOption(networkOption)
        .action(dumpAccountData);
    solanaCmd
        .command('findProgramAddress <pubKey> <seed> <programId>')
        .description('find PDA for pubkey, seed and programId')
        .action(findProgramAddress);
    solanaCmd
        .command('createProgramAddress <pubKey> <seed> <programId> <bumpSeed>')
        .description('createProgramAddress with pubkey, seed, bumpSeed and programId')
        .action(createProgramAddress);
}
