import type { Address as ox__Address } from "ox";
import type { ThirdwebClient } from "../client/client.js";
import { getClientFetch } from "../utils/fetch.js";
import { UNIVERSAL_BRIDGE_URL } from "./constants.js";
import type { PreparedQuote, Quote } from "./types/Quote.js";

/**
 * Retrieves a Universal Bridge quote for the provided buy intent. The quote will specify the necessary `originAmount` to receive the desired `destinationAmount`, which is specified with the `buyAmountWei` option.
 *
 * @example
 * ```typescript
 * import { Bridge, NATIVE_TOKEN_ADDRESS } from "thirdweb";
 *
 * const quote = await Bridge.Buy.quote({
 *   originChainId: 1,
 *   originTokenAddress: NATIVE_TOKEN_ADDRESS,
 *   destinationChainId: 10,
 *   destinationTokenAddress: NATIVE_TOKEN_ADDRESS,
 *   buyAmountWei: toWei("0.01"),
 *   client: thirdwebClient,
 * });
 * ```
 *
 * This will return a quote that might look like:
 * ```typescript
 * {
 *   originAmount: 10000026098875381n,
 *   destinationAmount: 1000000000000000000n,
 *   blockNumber: 22026509n,
 *   timestamp: 1741730936680,
 *   estimatedExecutionTimeMs: 1000
 *   intent: {
 *     originChainId: 1,
 *     originTokenAddress: NATIVE_TOKEN_ADDRESS,
 *     destinationChainId: 10,
 *     destinationTokenAddress: NATIVE_TOKEN_ADDRESS,
 *     buyAmountWei: 1000000000000000000n
 *   }
 * }
 * ```
 *
 * The quote is an **estimate** for how much you would expect to pay for a specific buy. This quote is not guaranteed and you should use `Buy.prepare` to get a finalized quote with transaction data ready for execution.
 * So why use `quote`? The quote function is sometimes slightly faster than `prepare`, and can be used before the user connects their wallet.
 *
 * You can access this functions input and output types with `Buy.quote.Options` and `Buy.quote.Result`, respectively.
 *
 * @param options - The options for the quote.
 * @param options.originChainId - The chain ID of the origin token.
 * @param options.originTokenAddress - The address of the origin token.
 * @param options.destinationChainId - The chain ID of the destination token.
 * @param options.destinationTokenAddress - The address of the destination token.
 * @param options.buyAmountWei - The amount of the origin token to buy.
 * @param options.client - Your thirdweb client.
 *
 * @returns A promise that resolves to a non-finalized quote for the requested buy.
 *
 * @throws Will throw an error if there is an issue fetching the quote.
 * @bridge
 * @beta
 */
export async function quote(options: quote.Options): Promise<quote.Result> {
  const {
    originChainId,
    originTokenAddress,
    destinationChainId,
    destinationTokenAddress,
    buyAmountWei,
    client,
  } = options;

  const clientFetch = getClientFetch(client);
  const url = new URL(`${UNIVERSAL_BRIDGE_URL}/buy/quote`);
  url.searchParams.set("originChainId", originChainId.toString());
  url.searchParams.set("originTokenAddress", originTokenAddress);
  url.searchParams.set("destinationChainId", destinationChainId.toString());
  url.searchParams.set("destinationTokenAddress", destinationTokenAddress);
  url.searchParams.set("buyAmountWei", buyAmountWei.toString());

  const response = await clientFetch(url.toString());
  if (!response.ok) {
    const errorJson = await response.json();
    throw new Error(`${errorJson.code} | ${errorJson.message}`);
  }

  const { data }: { data: Quote } = await response.json();
  return {
    originAmount: BigInt(data.originAmount),
    destinationAmount: BigInt(data.destinationAmount),
    blockNumber: data.blockNumber ? BigInt(data.blockNumber) : undefined,
    timestamp: data.timestamp,
    estimatedExecutionTimeMs: data.estimatedExecutionTimeMs,
    intent: {
      originChainId,
      originTokenAddress,
      destinationChainId,
      destinationTokenAddress,
      buyAmountWei,
    },
  };
}

export declare namespace quote {
  type Options = {
    originChainId: number;
    originTokenAddress: ox__Address.Address;
    destinationChainId: number;
    destinationTokenAddress: ox__Address.Address;
    buyAmountWei: bigint;
    client: ThirdwebClient;
  };

  type Result = Quote & {
    intent: {
      originChainId: number;
      originTokenAddress: ox__Address.Address;
      destinationChainId: number;
      destinationTokenAddress: ox__Address.Address;
      buyAmountWei: bigint;
    };
  };
}

/**
 * Prepares a **finalized** Universal Bridge quote for the provided buy request with transaction data. This function will return everything `quote` does, with the addition of a series of prepared transactions and the associated expiration timestamp.
 *
 * @example
 * ```typescript
 * import { Bridge, NATIVE_TOKEN_ADDRESS } from "thirdweb";
 *
 * const quote = await Bridge.Buy.prepare({
 *   originChainId: 1,
 *   originTokenAddress: NATIVE_TOKEN_ADDRESS,
 *   destinationChainId: 10,
 *   destinationTokenAddress: NATIVE_TOKEN_ADDRESS,
 *   buyAmountWei: toWei("0.01"),
 *   client: thirdwebClient,
 * });
 * ```
 *
 * This will return a quote that might look like:
 * ```typescript
 * {
 *   originAmount: 10000026098875381n,
 *   destinationAmount: 1000000000000000000n,
 *   blockNumber: 22026509n,
 *   timestamp: 1741730936680,
 *   estimatedExecutionTimeMs: 1000
 *   transactions: [
 *     {
 *       to: NATIVE_TOKEN_ADDRESS,
 *       value: 10000026098875381n,
 *       data: "0x",
 *       chainId: 10,
 *       type: "eip1559"
 *     }
 *   ],
 *   expiration: 1741730936680,
 *   intent: {
 *     originChainId: 1,
 *     originTokenAddress: NATIVE_TOKEN_ADDRESS,
 *     destinationChainId: 10,
 *     destinationTokenAddress: NATIVE_TOKEN_ADDRESS,
 *     buyAmountWei: 1000000000000000000n
 *   }
 * }
 * ```
 *
 * ## Sending the transactions
 * The `transactions` array is a series of [ox](https://oxlib.sh) EIP-1559 transactions that must be executed one after the other in order to fulfill the complete route. There are a few things to keep in mind when executing these transactions:
 *  - Approvals and other preparation transactions are not included in the transactions array.
 *  - All transactions are assumed to be executed by the `sender` address, regardless of which chain they are on. The final transaction will use the `receiver` as the recipient address.
 *  - If an `expiration` timestamp is provided, all transactions must be executed before that time to guarantee successful execution at the specified price.
 *
 * NOTE: To get the status of each transaction, use `Bridge.status` rather than checking for transaction inclusion. This function will ensure full bridge completion on the destination chain.
 *
 * You can access this functions input and output types with `Buy.prepare.Options` and `Buy.prepare.Result`, respectively.
 *
 * @param options - The options for the quote.
 * @param options.originChainId - The chain ID of the origin token.
 * @param options.originTokenAddress - The address of the origin token.
 * @param options.destinationChainId - The chain ID of the destination token.
 * @param options.destinationTokenAddress - The address of the destination token.
 * @param options.buyAmountWei - The amount of the origin token to buy.
 * @param options.sender - The address of the sender.
 * @param options.receiver - The address of the recipient.
 * @param options.client - Your thirdweb client.
 *
 * @returns A promise that resolves to a non-finalized quote for the requested buy.
 *
 * @throws Will throw an error if there is an issue fetching the quote.
 * @bridge
 * @beta
 */
export async function prepare(
  options: prepare.Options,
): Promise<prepare.Result> {
  const {
    originChainId,
    originTokenAddress,
    destinationChainId,
    destinationTokenAddress,
    buyAmountWei,
    sender,
    receiver,
    client,
  } = options;

  const clientFetch = getClientFetch(client);
  const url = new URL(`${UNIVERSAL_BRIDGE_URL}/buy/prepare`);
  url.searchParams.set("originChainId", originChainId.toString());
  url.searchParams.set("originTokenAddress", originTokenAddress);
  url.searchParams.set("destinationChainId", destinationChainId.toString());
  url.searchParams.set("destinationTokenAddress", destinationTokenAddress);
  url.searchParams.set("buyAmountWei", buyAmountWei.toString());
  url.searchParams.set("sender", sender);
  url.searchParams.set("receiver", receiver);

  const response = await clientFetch(url.toString());
  if (!response.ok) {
    const errorJson = await response.json();
    throw new Error(`${errorJson.code} | ${errorJson.message}`);
  }

  const { data }: { data: PreparedQuote } = await response.json();
  return {
    originAmount: BigInt(data.originAmount),
    destinationAmount: BigInt(data.destinationAmount),
    blockNumber: data.blockNumber ? BigInt(data.blockNumber) : undefined,
    timestamp: data.timestamp,
    estimatedExecutionTimeMs: data.estimatedExecutionTimeMs,
    transactions: data.transactions.map((transaction) => ({
      ...transaction,
      value: transaction.value ? BigInt(transaction.value) : undefined,
    })),
    expiration: data.expiration,
    intent: {
      originChainId,
      originTokenAddress,
      destinationChainId,
      destinationTokenAddress,
      buyAmountWei,
    },
  };
}

export declare namespace prepare {
  type Options = {
    originChainId: number;
    originTokenAddress: ox__Address.Address;
    destinationChainId: number;
    destinationTokenAddress: ox__Address.Address;
    buyAmountWei: bigint;
    sender: ox__Address.Address;
    receiver: ox__Address.Address;
    client: ThirdwebClient;
  };

  type Result = PreparedQuote & {
    intent: {
      originChainId: number;
      originTokenAddress: ox__Address.Address;
      destinationChainId: number;
      destinationTokenAddress: ox__Address.Address;
      buyAmountWei: bigint;
    };
  };
}
