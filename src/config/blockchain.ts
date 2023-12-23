import axios from 'axios';
import { URLSearchParams } from 'url';
import { sortUTXOs } from '../utils/utxo';
import { DEFAULT_TIMEOUT } from './timeout';
import { BlockchainTransaction, UTXO } from '../interfaces';
import { BlockchainNetwork } from '../enums';

const fetchLatestBlock = async (
  network: BlockchainNetwork
): Promise<number> => {
  const statsUrl = `https://api.blockchain.info/haskoin-store/${network}/block/best?notx=true`;
  const statsResponse = (await axios.get<{ height: number }>(statsUrl)).data;
  return statsResponse.height;
};

const fetchUTXO =
  (network: BlockchainNetwork) =>
  async (txHash: string, vOut: number): Promise<UTXO> => {
    const url = `https://api.blockchain.info/haskoin-store/${network}/transaction/${txHash}`;

    const response = (
      await axios.get<BlockchainTransaction>(`${url}`, {
        timeout: DEFAULT_TIMEOUT,
      })
    ).data;

    const confirmations =
      !response.block || !response.block.height
        ? 0
        : Math.max(
            (await fetchLatestBlock(network)) - response.block.height + 1,
            0
          );

    return {
      txHash,
      block:
        response.block && response.block.height ? response.block.height : 0,
      amount: response.outputs[vOut].value,
      confirmations,
    };
  };

const fetchUTXOs =
  (network: BlockchainNetwork) =>
  async (
    address: string,
    confirmations: number,
    limit: number = 25,
    offset: number = 0
  ): Promise<readonly UTXO[]> =>
    fetchTXs(network)(address, confirmations, limit, offset, true);

const fetchTXs =
  (network: BlockchainNetwork) =>
  async (
    address: string,
    confirmations: number = 0,
    limit: number = 25,
    offset: number = 0,
    onlyUnspent: boolean = false
  ): Promise<readonly UTXO[]> => {
    const url = `https://api.blockchain.info/haskoin-store/${network}/address/${address}/transactions/full?limit=${limit}&offset=${offset}`;
    const response = (
      await axios.get<BlockchainTransaction[]>(url, {
        timeout: DEFAULT_TIMEOUT,
      })
    ).data;

    let latestBlock: number | undefined;

    const received: UTXO[] = [];

    for (const tx of response) {
      latestBlock = latestBlock || (await fetchLatestBlock(network));
      const txConfirmations =
        tx.block && tx.block.height
          ? Math.max(latestBlock - tx.block.height + 1, 0)
          : 0;
      for (let i = 0; i < tx.outputs.length; i++) {
        const vout = tx.outputs[i];
        if (
          vout.address === address &&
          // If the onlyUnspent flag is true, check that the tx is unspent.
          (!onlyUnspent || vout.spent === false)
        ) {
          received.push({
            txHash: tx.txid,
            amount: vout.value,
            vOut: i,
            confirmations: txConfirmations,
          });
        }
      }
    }

    return received
      .filter(
        (utxo) => confirmations === 0 || utxo.confirmations >= confirmations
      )
      .sort(sortUTXOs);
  };

export const broadcastTransaction =
  (network: BlockchainNetwork) =>
  async (txHex: string): Promise<string> => {
    if (network !== BlockchainNetwork.Bitcoin) {
      throw new Error(
        `Broadcasting ${network} transactions not supported by endpoint.`
      );
    }
    const url = `https://blockchain.info/pushtx`;

    const params = new URLSearchParams();
    params.append('tx', txHex);

    const response = await axios.post(url, params, {
      timeout: DEFAULT_TIMEOUT,
    });
    if ((response.data as any).error) {
      throw new Error((response.data as any).error);
    }

    return response.data;
  };

export const Blockchain = {
  networks: BlockchainNetwork,
  fetchUTXO,
  fetchUTXOs,
  broadcastTransaction,
  fetchTXs,
};
