import { Keypair, PublicKey } from '@solana/web3.js'
import { fs } from 'mz'

export async function createKeypairFromFile(
  filePath: string | undefined
): Promise<Keypair> {
  if (filePath) {
    const secretKeyString = await fs.readFile(filePath, { encoding: 'utf8' })
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString))
    return Keypair.fromSecretKey(secretKey)
  } else {
    throw 'Unable to create keypair from file: ' + filePath
  }
}

export function getPubkeyForEnv(keyString: string | undefined) {
  if (keyString) {
    return new PublicKey(keyString)
  } else {
    throw 'No key provided'
  }
}
