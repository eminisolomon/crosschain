import provider from '../utils/ethers';
import erc20Abi from '../abis/erc20.json';
import { ethers } from 'ethers';
import {
  BalancePayload,
  GetEncryptedJsonFromPrivateKey,
  GetTransactionPayload,
  GetWalletFromEncryptedjsonPayload,
  TransferPayload,
  IGetTokenInfoPayload,
  ITokenInfo,
  ISmartContractCallPayload,
} from '../interfaces';
import { successResponse } from '../utils';

interface GetContract {
  rpcUrl?: string;
  privateKey?: string;
  contractAddress?: string;
  abi?: any[];
}

const getContract = async ({
  contractAddress,
  rpcUrl,
  privateKey,
  abi,
}: GetContract) => {
  const providerInstance = provider(rpcUrl);
  const gasPrice = await providerInstance.getGasPrice();
  const gas = ethers.BigNumber.from(21000);

  let nonce;
  let contract;
  let signer;
  const contractAbi = abi || erc20Abi;

  if (privateKey && contractAddress) {
    signer = new ethers.Wallet(privateKey, providerInstance);
    nonce = providerInstance.getTransactionCount(signer.getAddress());
    contract = new ethers.Contract(contractAddress, contractAbi, signer);
  } else if (privateKey && !contractAddress) {
    signer = new ethers.Wallet(privateKey, providerInstance);
    nonce = providerInstance.getTransactionCount(signer.getAddress());
  } else if (contractAddress && !privateKey) {
    contract = new ethers.Contract(
      contractAddress,
      contractAbi,
      providerInstance
    );
  }

  return {
    contract,
    signer,
    gasPrice,
    gas,
    nonce,
    providerInstance,
  };
};

const createWallet = (derivationPath?: string) => {
  const path = derivationPath || "m/44'/60'/0'/0/0";
  const wallet = ethers.Wallet.createRandom({
    path,
  });

  return successResponse({
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic.phrase,
  });
};

const getAddressFromPrivateKey = (privateKey: string) => {
  const wallet = new ethers.Wallet(privateKey);

  return successResponse({
    address: wallet.address,
  });
};

const generateWalletFromMnemonic = (
  mnemonic: string,
  derivationPath?: string
) => {
  const path = derivationPath || "m/44'/60'/0'/0/0";
  const wallet = ethers.Wallet.fromMnemonic(mnemonic, path);

  return successResponse({
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic.phrase,
  });
};

const getBalance = async ({
  rpcUrl,
  tokenAddress,
  address,
}: BalancePayload) => {
  const { contract, providerInstance } = await getContract({
    rpcUrl,
    contractAddress: tokenAddress,
  });

  try {
    let balance;

    if (contract) {
      const decimals = await contract.decimals();

      balance = await contract.balanceOf(address);

      return successResponse({
        balance: parseFloat(ethers.utils.formatUnits(balance, decimals)),
      });
    }

    balance = await providerInstance.getBalance(address);

    return successResponse({
      balance: parseFloat(ethers.utils.formatEther(balance)),
    });
  } catch (error) {
    throw error;
  }
};

const transfer = async ({
  privateKey,
  tokenAddress,
  rpcUrl,
  ...data
}: TransferPayload) => {
  const { contract, providerInstance, gasPrice, nonce } = await getContract({
    rpcUrl,
    privateKey,
    contractAddress: tokenAddress,
  });

  let wallet = new ethers.Wallet(privateKey, providerInstance);

  try {
    let tx;

    if (contract) {
      const decimals = await contract.decimals();
      const estimatedGas = await contract.estimateGas.transfer(
        data.recipientAddress,
        ethers.utils.parseUnits(data.amount.toString(), decimals)
      );

      tx = await contract.transfer(
        data.recipientAddress,
        ethers.utils.parseUnits(data.amount.toString(), decimals),
        {
          gasPrice: data.gasPrice
            ? ethers.utils.parseUnits(data.gasPrice.toString(), 'gwei')
            : gasPrice,
          nonce: data.nonce || nonce,
          gasLimit: data.gasLimit || estimatedGas,
        }
      );
    } else {
      tx = await wallet.sendTransaction({
        to: data.recipientAddress,
        value: ethers.utils.parseEther(data.amount.toString()),
        gasPrice: data.gasPrice
          ? ethers.utils.parseUnits(data.gasPrice.toString(), 'gwei')
          : gasPrice,
        nonce: data.nonce || nonce,
        data: data.data
          ? ethers.utils.hexlify(ethers.utils.toUtf8Bytes(data.data as string))
          : '0x',
      });
    }

    return successResponse({
      ...tx,
    });
  } catch (error) {
    throw error;
  }
};

const getTransaction = async ({ hash, rpcUrl }: GetTransactionPayload) => {
  const { providerInstance } = await getContract({ rpcUrl });

  try {
    const tx = await providerInstance.getTransaction(hash);
    return successResponse({
      ...tx,
    });
  } catch (error) {
    throw error;
  }
};

const getEncryptedJsonFromPrivateKey = async (
  data: GetEncryptedJsonFromPrivateKey
) => {
  const wallet = new ethers.Wallet(data.privateKey);
  const json = await wallet.encrypt(data.password);

  return successResponse({ json });
};

const getWalletFromEncryptedJson = async (
  data: GetWalletFromEncryptedjsonPayload
) => {
  const wallet = await ethers.Wallet.fromEncryptedJson(
    data.json,
    data.password
  );

  return successResponse({
    privateKey: wallet.privateKey,
    address: wallet.address,
  });
};

const getTokenInfo = async ({ address, rpcUrl }: IGetTokenInfoPayload) => {
  const { contract } = await getContract({ contractAddress: address, rpcUrl });

  if (contract) {
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply(),
    ]);

    const data: ITokenInfo = {
      name,
      symbol,
      decimals,
      address: contract.address,
      totalSupply: parseInt(ethers.utils.formatUnits(totalSupply, decimals)),
    };
    return successResponse({ ...data });
  }
  return;
};

const smartContractCall = async (data: ISmartContractCallPayload) => {
  const { contract, gasPrice, nonce } = await getContract({
    rpcUrl: data.rpcUrl,
    contractAddress: data.contractAddress,
    abi: data.contractAbi,
    privateKey: data.privateKey,
  });

  try {
    let tx;
    let overrides = {} as any;

    if (data.methodType === 'read') {
      overrides = {};
    } else if (data.methodType === 'write') {
      overrides = {
        gasPrice: data.gasPrice
          ? ethers.utils.parseUnits(data.gasPrice, 'gwei')
          : gasPrice,
        nonce: data.nonce || nonce,
        value: data.value ? ethers.utils.parseEther(data.value.toString()) : 0,
      };

      if (data.gasLimit) {
        overrides.gasLimit = data.gasLimit;
      }
    }

    if (data.params.length > 0) {
      tx = await contract?.[data.method](...data.params, overrides);
    } else {
      tx = await contract?.[data.method](overrides);
    }

    return successResponse({
      data: tx,
    });
  } catch (error) {
    throw error;
  }
};

export default {
  getBalance,
  createWallet,
  getAddressFromPrivateKey,
  generateWalletFromMnemonic,
  transfer,
  getTransaction,
  getEncryptedJsonFromPrivateKey,
  getWalletFromEncryptedJson,
  getTokenInfo,
  smartContractCall,
};
