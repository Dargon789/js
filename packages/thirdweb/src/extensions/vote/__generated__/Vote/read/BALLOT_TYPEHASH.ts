import { decodeAbiParameters } from "viem";
import { readContract } from "../../../../../transaction/read-contract.js";
import type { BaseTransactionOptions } from "../../../../../transaction/types.js";
import { detectMethod } from "../../../../../utils/bytecode/detectExtension.js";
import type { Hex } from "../../../../../utils/encoding/hex.js";

export const FN_SELECTOR = "0xdeaaa7cc" as const;
const FN_INPUTS = [] as const;
const FN_OUTPUTS = [
  {
    type: "bytes32",
  },
] as const;

/**
 * Checks if the `BALLOT_TYPEHASH` method is supported by the given contract.
 * @param availableSelectors An array of 4byte function selectors of the contract. You can get this in various ways, such as using "whatsabi" or if you have the ABI of the contract available you can use it to generate the selectors.
 * @returns A boolean indicating if the `BALLOT_TYPEHASH` method is supported.
 * @extension VOTE
 * @example
 * ```ts
 * import { isBALLOT_TYPEHASHSupported } from "thirdweb/extensions/vote";
 * const supported = isBALLOT_TYPEHASHSupported(["0x..."]);
 * ```
 */
export function isBALLOT_TYPEHASHSupported(availableSelectors: string[]) {
  return detectMethod({
    availableSelectors,
    method: [FN_SELECTOR, FN_INPUTS, FN_OUTPUTS] as const,
  });
}

/**
 * Decodes the result of the BALLOT_TYPEHASH function call.
 * @param result - The hexadecimal result to decode.
 * @returns The decoded result as per the FN_OUTPUTS definition.
 * @extension VOTE
 * @example
 * ```ts
 * import { decodeBALLOT_TYPEHASHResult } from "thirdweb/extensions/vote";
 * const result = decodeBALLOT_TYPEHASHResultResult("...");
 * ```
 */
export function decodeBALLOT_TYPEHASHResult(result: Hex) {
  return decodeAbiParameters(FN_OUTPUTS, result)[0];
}

/**
 * Calls the "BALLOT_TYPEHASH" function on the contract.
 * @param options - The options for the BALLOT_TYPEHASH function.
 * @returns The parsed result of the function call.
 * @extension VOTE
 * @example
 * ```ts
 * import { BALLOT_TYPEHASH } from "thirdweb/extensions/vote";
 *
 * const result = await BALLOT_TYPEHASH({
 *  contract,
 * });
 *
 * ```
 */
export async function BALLOT_TYPEHASH(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [FN_SELECTOR, FN_INPUTS, FN_OUTPUTS] as const,
    params: [],
  });
}
