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

export interface ISmartContractCallPayload {
  rpcUrl: string;
  network: string;
  contractAddress: string;
  method: string;
  methodType: 'read' | 'write';
  params: any[];
  payment?: any[];
  value?: number;
  contractAbi?: any[];
  gasPrice?: string;
  gasLimit?: number;
  nonce?: number;
  privateKey?: string;
}