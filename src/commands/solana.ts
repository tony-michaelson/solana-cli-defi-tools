import { PublicKey } from '@solana/web3.js'
import { Command } from 'commander'
import { networkOption } from '../lib/constants.js'
import { Option } from '../lib/types.js'
import {
  checkOptions,
  getConnection,
  getNetworkName,
  loadProgramAccount,
} from '../lib/util.js'

async function pubKeyToU8Array(pubkey: string) {
  const publicKey = new PublicKey(pubkey ? pubkey : '')

  console.log(JSON.stringify(publicKey.toBytes()))
}

async function dumpAccountData(
  pubkey: string,
  programIDStr: string,
  option: Option
) {
  checkOptions(option, 'network')
  const networkName = getNetworkName(option)
  const connection = getConnection(networkName)
  const publicKey = new PublicKey(pubkey ? pubkey : '')
  const programID = new PublicKey(programIDStr ? programIDStr : '')

  const data = await loadProgramAccount(connection, publicKey, programID)

  console.dir(JSON.parse(JSON.stringify(data)), { maxArrayLength: null })
}

async function findProgramAddress(
  pubkey: string,
  seed: string,
  programIdStr: string
) {
  const publicKey = new PublicKey(pubkey ? pubkey : '')
  const programId = new PublicKey(programIdStr ? programIdStr : '')

  const PDA = await PublicKey.findProgramAddress(
    [publicKey.toBuffer(), Buffer.from(seed)],
    programId
  )

  console.log(PDA[0].toString())
  console.log(PDA[1].toString())
}

async function createProgramAddress(
  pubkey: string,
  seed: string,
  programIdStr: string,
  bumpSeed: string
) {
  const publicKey = new PublicKey(pubkey ? pubkey : '')
  const programId = new PublicKey(programIdStr ? programIdStr : '')

  const PDA = await PublicKey.createProgramAddress(
    [
      publicKey.toBuffer(),
      Buffer.from(seed),
      Buffer.from([parseInt(bumpSeed)]),
    ],
    programId
  )

  console.log(PDA.toString())
}

export function addSolanaCommands(program: Command): void {
  const solanaCmd = program.command('solana')

  solanaCmd
    .command('pubkeyToU8Array <pubKey>')
    .description('convert a public key string to a u8array')
    .action(pubKeyToU8Array)

  solanaCmd
    .command('dumpAccountData <pubKey> <programID>')
    .description('dump account data as a u8 array')
    .addOption(networkOption)
    .action(dumpAccountData)

  solanaCmd
    .command('findProgramAddress <pubKey> <seed> <programId>')
    .description('find PDA for pubkey, seed and programId')
    .action(findProgramAddress)

  solanaCmd
    .command('createProgramAddress <pubKey> <seed> <programId> <bumpSeed>')
    .description(
      'createProgramAddress with pubkey, seed, bumpSeed and programId'
    )
    .action(createProgramAddress)
}
