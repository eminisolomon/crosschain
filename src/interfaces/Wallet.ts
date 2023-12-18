export interface CreateWalletPayload {
  derivationPath?: string;
  cluster?: string;
  network: string;
}

export interface GetAddressFromPrivateKeyPayload {
  privateKey: string;
  network: string;
}

export interface GenerateWalletFromMnemonicPayload {
  mnemonic: string;
  derivationPath?: string;
  cluster?: string;
  network: string;
}

export interface GetEncryptedJsonFromPrivateKey {
  password: string;
  privateKey: string;
  network: string;
}

export interface GetWalletFromEncryptedjsonPayload {
  json: string;
  password: string;
  network: string;
}
