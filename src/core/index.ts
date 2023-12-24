import * as bip39 from 'bip39';
import bitcoin from '../services/bitcoin.service';
import ethereum from '../services/ethereum.service';
import solana from '../services/solana.service';
import waves from '../services/waves.service';
import {
  TransferPayload,
  BalancePayload,
  CreateWalletPayload,
  GetAddressFromPrivateKeyPayload,
  GenerateWalletFromMnemonicPayload,
  GetTransactionPayload,
  GetWalletFromEncryptedjsonPayload,
  GetEncryptedJsonFromPrivateKey,
  IGetTokenInfoPayload,
  ISmartContractCallPayload,
} from '../interfaces';

function generateMnemonic(numWords: number = 12): string {
  const strength = (numWords / 3) * 32;

  return bip39.generateMnemonic(strength);
}
function getAddressFromPrivateKey(data: GetAddressFromPrivateKeyPayload) {
  try {
    if (data.network === 'ethereum') {
      return ethereum.getAddressFromPrivateKey(data.privateKey);
    } else if (data.network === 'solana') {
      return solana.getAddressFromPrivateKey(data.privateKey);
    } else if (data.network.includes('bitcoin')) {
      return bitcoin.getAddressFromPrivateKey(
        data.privateKey,
        data.network
      );
    }

    throw new Error('Invalid network');
  } catch (error) {
    throw error;
  }
}

function generateWalletFromMnemonic(data: GenerateWalletFromMnemonicPayload) {
  try {
    if (data.network === 'ethereum') {
      return ethereum.generateWalletFromMnemonic(
        data.mnemonic,
        data.derivationPath
      );
    } else if (data.network === 'solana') {
      return solana.generateWalletFromMnemonic(
        data.mnemonic,
        data.derivationPath
      );
    } else if (data.network.includes('bitcoin')) {
      return bitcoin.generateWalletFromMnemonic(
        data.network,
        data.mnemonic,
        data.derivationPath
      );
    } else if (data.network === 'waves') {
      return waves.generateWalletFromMnemonic(
        data.mnemonic,
        data.cluster
      );
    }

    throw new Error('Invalid network');
  } catch (error) {
    throw error;
  }
}

function createWallet(data: CreateWalletPayload) {
  try {
    if (data.network === 'ethereum') {
      return ethereum.createWallet(data.derivationPath);
    } else if (data.network === 'solana') {
      return solana.createWallet(data.derivationPath);
    } else if (data.network.includes('bitcoin')) {
      return bitcoin.createWallet(data.network, data.derivationPath);
    } else if (data.network === 'waves') {
      return waves.createWallet(data.cluster);
    }

    throw new Error('Invalid network');
  } catch (error) {
    throw error;
  }
}
async function getBalance(data: BalancePayload) {
  try {
    if (data.network === 'ethereum') {
      return await ethereum.getBalance({ ...data });
    } else if (data.network === 'solana') {
      return await solana.getBalance({ ...data });
    } else if (data.network.includes('bitcoin')) {
      return await bitcoin.getBalance(data.address, data.network);
    } else if (data.network === 'waves') {
      return await waves.getBalance({ ...data });
    }

    throw new Error('Invalid network');
  } catch (error) {
    throw error;
  }
}

async function transfer(data: TransferPayload) {
  try {
    if (data.network === 'ethereum') {
      return await ethereum.transfer({ ...data });
    } else if (data.network === 'solana') {
      return await solana.transfer({ ...data });
    } else if (data.network.includes('bitcoin')) {
      return await bitcoin.transfer({ ...data });
    } else if (data.network === 'waves') {
      return await waves.transfer({ ...data });
    }

    throw new Error('Invalid network');
  } catch (error) {
    throw error;
  }
}

async function getTransaction(data: GetTransactionPayload) {
  try {
    if (data.network === 'ethereum') {
      return await ethereum.getTransaction({ ...data });
    } else if (data.network === 'solana') {
      return await solana.getTransaction({ ...data });
    } else if (data.network.includes('bitcoin')) {
      return await bitcoin.getTransaction({ ...data });
    } else if (data.network === 'waves') {
      return await waves.getTransaction({ ...data });
    }

    throw new Error('Invalid network');
  } catch (error) {
    throw error;
  }
}

async function getEncryptedJsonFromPrivateKey(
  data: GetEncryptedJsonFromPrivateKey
) {
  try {
    if (data.network === 'ethereum') {
      return await ethereum.getEncryptedJsonFromPrivateKey({ ...data });
    }

    throw new Error('Invalid network');
  } catch (error) {
    throw error;
  }
}

async function getWalletFromEncryptedJson(
  data: GetWalletFromEncryptedjsonPayload
) {
  try {
    if (data.network === 'ethereum') {
      return await ethereum.getWalletFromEncryptedJson({ ...data });
    }

    throw new Error('Invalid network');
  } catch (error) {
    throw error;
  }
}

async function getTokenInfo(data: IGetTokenInfoPayload) {
  try {
    if (data.network === 'ethereum') {
      return await ethereum.getTokenInfo({ ...data });
    } else if (data.network === 'solana') {
      return solana.getTokenInfo({ ...data });
    } else if (data.network === 'waves') {
      return waves.getTokenInfo({ ...data });
    }

    throw new Error('Invalid network');
  } catch (error) {
    throw error;
  }
}

async function smartContractCall(data: ISmartContractCallPayload) {
  try {
    if (data.network === 'ethereum') {
      return await ethereum.smartContractCall({ ...data });
    } else if (data.network === 'waves') {
      return await waves.smartContractCall({ ...data });
    } else {
      throw new Error('Only Ethereum and Waves is supported at this time');
    }
  } catch (error) {
    throw error;
  }
}

export {
  generateMnemonic,
  getAddressFromPrivateKey,
  generateWalletFromMnemonic,
  createWallet,
  getBalance,
  transfer,
  getTransaction,
  getEncryptedJsonFromPrivateKey,
  getWalletFromEncryptedJson,
  getTokenInfo,
  smartContractCall,
};
