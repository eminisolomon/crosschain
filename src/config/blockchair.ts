import axios from 'axios';
import { sortUTXOs } from '../utils/utxo';
import { DEFAULT_TIMEOUT } from './timeout';
import { Networks } from '../enums';
import { AddressResponse, TransactionResponse, UTXO } from '../interfaces';

const fetchUTXO =
  (network: string) =>
  async (txHash: string, vOut: number): Promise<UTXO> => {
    const url = `https://api.blockchair.com/${network}/dashboards/transaction/${txHash}`;

    const response = (
      await axios.get<TransactionResponse>(`${url}`, {
        timeout: DEFAULT_TIMEOUT,
      })
    ).data;

    if (!response.data[txHash]) {
      throw new Error(`Transaction not found.`);
    }

    const tx = response.data[txHash];

    let latestBlock = response.context.state;
    if (latestBlock === 0) {
      const statsUrl = `https://api.blockchair.com/${network}/stats`;
      const statsResponse = (await axios.get(statsUrl)).data;
      latestBlock = statsResponse.data.blocks - 1;
    }

    const confirmations =
      tx.transaction.block_id === -1
        ? 0
        : Math.max(latestBlock - tx.transaction.block_id + 1, 0);

    return {
      txHash,
      block: tx.transaction.block_id === -1 ? 0 : tx.transaction.block_id,
      amount: tx.outputs[vOut].value,
      confirmations,
    };
  };

const fetchUTXOs =
  (network: string) =>
  async (address: string, confirmations: number): Promise<readonly UTXO[]> => {
    const url = `https://api.blockchair.com/${network}/dashboards/address/${address}?limit=0,100`;
    const response = (
      await axios.get<AddressResponse>(url, { timeout: DEFAULT_TIMEOUT })
    ).data;

    let latestBlock = response.context.state;
    if (latestBlock === 0) {
      const statsUrl = `https://api.blockchair.com/${network}/stats`;
      const statsResponse = (await axios.get(statsUrl)).data;
      latestBlock = statsResponse.data.blocks - 1;
    }

    return response.data[address].utxo
      .map((utxo) => ({
        txHash: utxo.transaction_hash,
        amount: utxo.value,
        vOut: utxo.index,
        confirmations:
          utxo.block_id === -1 ? 0 : latestBlock - utxo.block_id + 1,
      }))
      .filter(
        (utxo) => confirmations === 0 || utxo.confirmations >= confirmations
      )
      .sort(sortUTXOs);
  };

const fetchTXs =
  (network: string) =>
  async (
    address: string,
    confirmations: number = 0,
    limit: number = 25
  ): Promise<readonly UTXO[]> => {
    const url = `https://api.blockchair.com/${network}/dashboards/address/${address}?limit=${limit},0`;
    const response = (
      await axios.get<AddressResponse>(url, { timeout: DEFAULT_TIMEOUT })
    ).data;

    let latestBlock = response.context.state;
    if (latestBlock === 0) {
      const statsUrl = `https://api.blockchair.com/${network}/stats`;
      const statsResponse = (await axios.get(statsUrl)).data;
      latestBlock = statsResponse.data.blocks - 1;
    }

    const txHashes = response.data[address].transactions;

    let txDetails: { [txHash: string]: TransactionResponse['data'][''] } = {};

    // Fetch in sets of 10
    for (let i = 0; i < Math.ceil(txHashes.length / 10); i++) {
      const txUrl = `https://api.blockchair.com/${network}/dashboards/transactions/${txHashes
        .slice(i * 10, (i + 1) * 10)
        .join(',')}`;
      const txResponse = (
        await axios.get<TransactionResponse>(txUrl, {
          timeout: DEFAULT_TIMEOUT,
        })
      ).data;
      txDetails = {
        ...txDetails,
        ...txResponse.data,
      };
    }

    const received: UTXO[] = [];

    for (const txHash of txHashes) {
      const tx = txDetails[txHash];
      const txConfirmations =
        tx.transaction.block_id === -1
          ? 0
          : Math.max(latestBlock - tx.transaction.block_id + 1, 0);
      for (let i = 0; i < tx.outputs.length; i++) {
        const vout = tx.outputs[i];
        if (vout.recipient === address) {
          received.push({
            txHash: tx.transaction.hash,
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
  (network: string) =>
  async (txHex: string): Promise<string> => {
    const url = `https://api.blockchair.com/${network}/push/transaction`;
    const response = await axios.post<{ data: { transaction_hash: string } }>(
      url,
      { data: txHex },
      { timeout: DEFAULT_TIMEOUT }
    );
    if ((response.data as any).error) {
      throw new Error((response.data as any).error);
    }

    return response.data.data.transaction_hash;
  };

export const Blockchair = {
  networks: Networks,
  fetchUTXO,
  fetchUTXOs,
  broadcastTransaction,
  fetchTXs,
};
