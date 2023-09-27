import { PublicKey } from '@solana/web3.js'
import { Command } from 'commander'
import { keyfileOption, networkOption, payerOption } from '../lib/constants.js'
import {
  createTokenMint,
  findAssociatedTokenAddress,
  mintTo,
} from '../lib/token/token.js'
import { TOKEN_PROGRAM_ID, Token, u64 } from '@solana/spl-token'
import {
  checkOptions,
  createKeypairFromFile,
  getConnection,
  getNetworkName,
  printAccountBalance,
} from '../lib/util.js'
import { Option } from '../lib/types.js'

async function getAccountBalance(accountStr: string, option: Option) {
  checkOptions(option, 'network')
  const networkName = getNetworkName(option)
  const connection = getConnection(networkName)
  const account = new PublicKey(accountStr)
  printAccountBalance(account, connection)
}

async function getAssociatedTokenAddress(
  mintPubKey: string,
  ownerPubKey: string,
  option: Option
) {
  checkOptions(option, 'network')
  const networkName = getNetworkName(option)
  const connection = getConnection(networkName)
  const owner = new PublicKey(ownerPubKey)

  const mint = new PublicKey(mintPubKey)

  const ata = await findAssociatedTokenAddress(owner, mint)
  console.log('ATA Address:', ata.toString())
  printAccountBalance(ata, connection)
}

async function createMint(authority: string, decimals: string, option: Option) {
  checkOptions(option, 'network', 'payer', 'keyfile')
  const networkName = getNetworkName(option)
  const connection = getConnection(networkName)
  const payer = await createKeypairFromFile(option['payer'])
  const keyfile = await createKeypairFromFile(option['keyfile'])

  const mintAuthority = new PublicKey(authority)
  const mintDecimals = parseInt(decimals)

  if (mintDecimals >= 1 && mintDecimals <= 9) {
    const mintPK = await createTokenMint(
      connection,
      payer,
      keyfile,
      mintAuthority,
      mintDecimals
    )
    console.log('Mint Address:', mintPK.toString())

    const mint = new Token(connection, mintPK, TOKEN_PROGRAM_ID, payer)

    if ('createUserATA' in option) {
      const amount = parseInt(option['createUserATA'])
      const tokenAccount = await mint.createAssociatedTokenAccount(
        payer.publicKey
      )
      const shiftedAmount = BigInt(amount * Math.pow(10, mintDecimals))
      await mintTo(
        connection,
        payer,
        mintPK,
        tokenAccount,
        mintAuthority,
        shiftedAmount
      )
      // mint.mintTo(tokenAccount, mintAuthority, [], amount)
      console.log('Associated Token Account: \t', tokenAccount.toString())
    }

    if ('createUserAccount' in option) {
      const amount = parseInt(option['createUserAccount'])
      const tokenAccount = await mint.createAccount(payer.publicKey)
      const shiftedAmount = BigInt(amount * Math.pow(10, mintDecimals))
      await mintTo(
        connection,
        payer,
        mintPK,
        tokenAccount,
        mintAuthority,
        shiftedAmount
      )
      // mint.mintTo(tokenAccount, mintAuthority, [], amount)
      console.log('SPL Token Account: \t', tokenAccount.toString())
    }
  } else {
    console.log('Decimals should be between 1 and 9')
  }
}

async function createPDA(publicKey: string, programId: string, option: Option) {
  const programIdPK = new PublicKey(programId)
  const seedKey = new PublicKey(publicKey)

  const seeds = [seedKey.toBuffer()]
  if ('seed' in option) {
    seeds.push(Buffer.from(option['seed']))
  }

  const [authority, nonce] = await PublicKey.findProgramAddress(
    seeds,
    programIdPK
  )

  console.log('Authority:', authority.toString())
  console.log('Bump Seed:', nonce)
}

async function createSPLTokenAccount(
  mintKey: string,
  ownerKey: string,
  option: Option
) {
  checkOptions(option, 'network', 'payer')
  const networkName = getNetworkName(option)
  const connection = getConnection(networkName)
  const payer = await createKeypairFromFile(option['payer'])

  const mintPK = new PublicKey(mintKey)
  const owner = ownerKey ? new PublicKey(ownerKey) : payer.publicKey

  const mint = new Token(connection, mintPK, TOKEN_PROGRAM_ID, payer)

  const acctPK = await mint.createAccount(owner)

  console.log('SPL Token Account:', acctPK)
}

export async function createATAAccount(
  mintKey: string,
  ownerKey: string,
  option: Option
) {
  checkOptions(option, 'network', 'payer')
  const networkName = getNetworkName(option)
  const connection = getConnection(networkName)
  const payer = await createKeypairFromFile(option['payer'])

  const mintPK = new PublicKey(mintKey)
  const owner = ownerKey ? new PublicKey(ownerKey) : payer.publicKey

  const mint = new Token(connection, mintPK, TOKEN_PROGRAM_ID, payer)

  const ataPK = await mint.createAssociatedTokenAccount(owner)

  console.log('Associated Token Account Account:', ataPK.toString())
}

export async function transferTokens(
  mintStr: string,
  fromStr: string,
  amountStr: string,
  toStr: string,
  option: Option
) {
  checkOptions(option, 'network', 'payer')
  const networkName = getNetworkName(option)
  const connection = getConnection(networkName)
  const payer = await createKeypairFromFile(option['payer'])

  const mintPK = new PublicKey(mintStr)
  const from = new PublicKey(fromStr)
  const to = new PublicKey(toStr)
  const amount = parseInt(amountStr)

  const mint = new Token(connection, mintPK, TOKEN_PROGRAM_ID, payer)
  const mintInfo = await mint.getMintInfo()
  const shiftedAmount = BigInt(amount * Math.pow(10, mintInfo.decimals))

  console.log('amount:', amount)
  console.log('shiftedAmount:', shiftedAmount.toString())

  const signature = await mint.transfer(
    from,
    to,
    payer.publicKey,
    [payer],
    new u64(shiftedAmount.toString())
  )

  console.log('txid:', signature)
}

async function mintToCmd(
  mintKey: string,
  accountKey: string,
  amountStr: string,
  option: Option
) {
  checkOptions(option, 'network', 'payer')
  const networkName = getNetworkName(option)
  const connection = getConnection(networkName)
  const payer = await createKeypairFromFile(option['payer'])

  const signer =
    'authoritySigner' in option
      ? await createKeypairFromFile(option['authoritySigner'])
      : payer

  const mintPK = new PublicKey(mintKey)
  const acctPK = new PublicKey(accountKey)

  if (parseInt(amountStr) > 0) {
    const mint = new Token(connection, mintPK, TOKEN_PROGRAM_ID, payer)
    const decimals = (await mint.getMintInfo()).decimals

    const amount = parseInt(amountStr)
    const shiftedAmount = BigInt(amount * Math.pow(10, decimals))
    const account = connection.getAccountInfo(acctPK, 'finalized')

    console.log('Mint Decimals:', decimals)
    console.log(
      'Amount To Mint (after shifting by mint decimal places):',
      shiftedAmount.toString()
    )

    if (account) {
      const accountBalance = (await connection.getTokenAccountBalance(acctPK))
        .value
      console.log('Account Balance:', accountBalance.uiAmountString)
      if ('authority' in option) {
        const mintAuthorityPK = new PublicKey(option['authority'])
        await mintTo(
          connection,
          payer,
          mintPK,
          acctPK,
          mintAuthorityPK,
          shiftedAmount
        )
        // await mint.mintTo(acctPK, mintAuthorityPK, [], amount)
        console.log('Minted', amount.toString(), 'to:', acctPK.toString())
      } else {
        await mintTo(connection, payer, mintPK, acctPK, signer, shiftedAmount)
        // await mint.mintTo(acctPK, signer, [], amount)
        console.log('Minted', amount.toString(), 'to:', acctPK.toString())
      }
      const accountBalanceNew = (
        await connection.getTokenAccountBalance(acctPK)
      ).value
      console.log('Account Balance:', accountBalanceNew.uiAmountString)
    }
  } else {
    console.log('Amount is not > 0')
  }
}

export function addTokenCommands(program: Command): void {
  const tokenCmd = program.command('token')

  tokenCmd
    .command('getBalance <accountPubKey>')
    .description('get Balance for a Token Account')
    .addOption(networkOption)
    .action(getAccountBalance)

  tokenCmd
    .command('getATA <mintPubKey> <ownerPubKey>')
    .description('get Associated Token Account for payer')
    .addOption(networkOption)
    .action(getAssociatedTokenAddress)

  tokenCmd
    .command('createATA <mintPubKey> <ownerPubKey>')
    .description('create associated token account')
    .addOption(networkOption)
    .addOption(payerOption)
    .action(createATAAccount)

  tokenCmd
    .command('transfer <mint> <fromAddress> <amount> <toAddress>')
    .description('transfer tokens')
    .addOption(networkOption)
    .addOption(payerOption)
    .action(transferTokens)

  tokenCmd
    .command('createPDA <publicKey> <programId>')
    .description('create authority')
    .option('--seed <string>', 'seed phrase')
    .action(createPDA)

  tokenCmd
    .command('createSPLTokenAccount <mintPubKey> <ownerPubKey>')
    .description('create SPL token account')
    .addOption(networkOption)
    .addOption(payerOption)
    .action(createSPLTokenAccount)

  const mintCmd = tokenCmd.command('mint')
  mintCmd
    .command('create <authority> <decimals>')
    .description('create mint')
    .addOption(networkOption)
    .addOption(payerOption)
    .addOption(keyfileOption)
    .option('--createUserATA <initialAmount>', 'create user ATA')
    .option('--createUserAccount <initialAmount>', 'create user account')
    .action(createMint)

  mintCmd
    .command('mintTo <mintPubKey> <accountPubKey> <amount>')
    .description('mint to account')
    .addOption(networkOption)
    .addOption(payerOption)
    .option('--authority <authPubKey>', 'mint authority')
    .option('--authoritySigner <keyFile>', 'mint authority signer key file')
    .action(mintToCmd)
}
