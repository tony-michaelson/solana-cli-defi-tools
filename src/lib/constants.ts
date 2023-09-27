import { PublicKey } from '@solana/web3.js'
import * as commander from 'commander'

export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
)

export const ORCA_TOKEN_SWAP_ID = {
  devnet: new PublicKey('3xQ8SWv2GaFXXpHZNqkXsdxq5DZciHBz6ZFoPPfbFd7U'),
  'mainnet-beta': new PublicKey('9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP'),
}

export const SABER_SWAP_SLIPPAGE = 0.01

export const RPC_SERVERS = {
  devnet: 'https://api.devnet.solana.com',
  testnet: 'https://api.testnet.solana.com',
  'mainnet-beta': 'https://api.mainnet-beta.solana.com',
  'mainnet-beta-nobody': 'http://node10.nobodyinc.net:8899',
}

export type NETWORK_NAME =
  | 'mainnet-beta'
  | 'mainnet-beta-nobody'
  | 'devnet'
  | 'testnet'

export const NETWORK_TO_CHAINID: Record<NETWORK_NAME, number> = {
  'mainnet-beta': 101,
  'mainnet-beta-nobody': 101,
  testnet: 102,
  devnet: 103,
}

export const networkOption = new commander.Option(
  '-n, --network <network>',
  '[ devnet | testnet | mainnet-beta | http://... ]'
).default('devnet')

export const payerOption = new commander.Option(
  '-p, --payer <keyfile>',
  'Location of payer keyfile'
).default(process.env['PAYER_KEYFILE'])

export const keyfileOption = new commander.Option(
  '-k, --keyfile <keyfile>',
  'Location of keyfile'
).default(process.env['KEYFILE'])

export const quoteOnlyOption = new commander.Option(
  '-q, --quoteOnly',
  'quote only'
)

export const noFeesOption = new commander.Option(
  '--noFees',
  'calculate without fees'
)

export const swapDirectionOption = new commander.Option(
  '-d, --direction <direction>',
  'swap direction'
)
  .default('AtB')
  .choices(['AtB', 'BtA'])

export const tokenTypeOption = new commander.Option(
  '-t, --token <token>',
  '[A|B]'
)
  .default('A')
  .choices(['A', 'B'])
  .makeOptionMandatory()
