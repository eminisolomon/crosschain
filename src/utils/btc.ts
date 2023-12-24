import { Blockchain } from '../config/blockchain';
import { Blockstream } from '../config/blockstream';
import { Sochain } from '../config/sochain';
import { Blockchair } from '../config/blockchair';
import { ElectrumX } from '../config/electrumx';
import { JSONRPC, MULTICHAIN_URLS } from '../config/jsonrpc';
import { shuffleArray } from '../utils/index';
import { BlockchainNetwork } from '../enums';

export const _apiFallbacks = {
  fetchUTXO: (testnet: boolean, txHash: string, vOut: number) => [
    ...shuffleArray(
      () => Blockstream.fetchUTXO(testnet)(txHash, vOut),
      () =>
        Blockchair.fetchUTXO(
          testnet
            ? Blockchair.networks.BITCOIN_TESTNET
            : Blockchair.networks.BITCOIN
        )(txHash, vOut)
    ),
    () =>
      Blockchain.fetchUTXO(
        testnet ? BlockchainNetwork.BitcoinTestnet : BlockchainNetwork.Bitcoin
      )(txHash, vOut),
  ],

  fetchUTXOs: (
    testnet: boolean,
    address: string,
    confirmations: number,
    scriptHash?: string
  ) => [
    ...shuffleArray(
      () => Blockstream.fetchUTXOs(testnet)(address, confirmations),
      () =>
        Blockchair.fetchUTXOs(
          testnet
            ? Blockchair.networks.BITCOIN_TESTNET
            : Blockchair.networks.BITCOIN
        )(address, confirmations)
    ),
    () =>
      Sochain.fetchUTXOs(testnet ? 'BTCTEST' : 'BTC')(address, confirmations),
    () =>
      Blockchain.fetchUTXOs(
        testnet ? BlockchainNetwork.BitcoinTestnet : BlockchainNetwork.Bitcoin
      )(address, confirmations),
    () =>
      ElectrumX.fetchUTXOs('bitcoin', testnet)(
        address,
        confirmations,
        scriptHash
      ),
  ],

  fetchTXs: (testnet: boolean, address: string, confirmations: number = 0) => [
    ...shuffleArray(
      () => Blockstream.fetchTXs(testnet)(address),
      () =>
        Blockchair.fetchTXs(
          testnet
            ? Blockchair.networks.BITCOIN_TESTNET
            : Blockchair.networks.BITCOIN
        )(address, confirmations),
      () =>
        Sochain.fetchTXs(testnet ? 'BTCTEST' : 'BTC')(address, confirmations),
      () =>
        Blockchain.fetchUTXOs(
          testnet ? BlockchainNetwork.BitcoinTestnet : BlockchainNetwork.Bitcoin
        )(address, confirmations)
    ),
  ],

  broadcastTransaction: (testnet: boolean, hex: string) => [
    ...shuffleArray(
      () => Blockstream.broadcastTransaction(testnet)(hex),
      () =>
        Blockchair.broadcastTransaction(
          testnet
            ? Blockchair.networks.BITCOIN_TESTNET
            : Blockchair.networks.BITCOIN
        )(hex)
    ),
    () => Sochain.broadcastTransaction(testnet ? 'BTCTEST' : 'BTC')(hex),
    () =>
      JSONRPC.broadcastTransaction(
        testnet ? MULTICHAIN_URLS.BTCTEST : MULTICHAIN_URLS.BTC
      )(hex),
    testnet
      ? undefined
      : () => Blockchain.broadcastTransaction(BlockchainNetwork.Bitcoin)(hex),
  ],
};
