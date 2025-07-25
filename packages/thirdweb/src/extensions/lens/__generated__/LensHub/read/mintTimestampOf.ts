import type { AbiParameterToPrimitiveType } from "abitype";
import { decodeAbiParameters } from "viem";
import { readContract } from "../../../../../transaction/read-contract.js";
import type { BaseTransactionOptions } from "../../../../../transaction/types.js";
import { encodeAbiParameters } from "../../../../../utils/abi/encodeAbiParameters.js";
import { detectMethod } from "../../../../../utils/bytecode/detectExtension.js";
import type { Hex } from "../../../../../utils/encoding/hex.js";

/**
 * Represents the parameters for the "mintTimestampOf" function.
 */
export type MintTimestampOfParams = {
  tokenId: AbiParameterToPrimitiveType<{ type: "uint256"; name: "tokenId" }>;
};

export const FN_SELECTOR = "0x50ddf35c" as const;
const FN_INPUTS = [
  {
    name: "tokenId",
    type: "uint256",
  },
] as const;
const FN_OUTPUTS = [
  {
    type: "uint256",
  },
] as const;

/**
 * Checks if the `mintTimestampOf` method is supported by the given contract.
 * @param availableSelectors An array of 4byte function selectors of the contract. You can get this in various ways, such as using "whatsabi" or if you have the ABI of the contract available you can use it to generate the selectors.
 * @returns A boolean indicating if the `mintTimestampOf` method is supported.
 * @extension LENS
 * @example
 * ```ts
 * import { isMintTimestampOfSupported } from "thirdweb/extensions/lens";
 * const supported = isMintTimestampOfSupported(["0x..."]);
 * ```
 */
export function isMintTimestampOfSupported(availableSelectors: string[]) {
  return detectMethod({
    availableSelectors,
    method: [FN_SELECTOR, FN_INPUTS, FN_OUTPUTS] as const,
  });
}

/**
 * Encodes the parameters for the "mintTimestampOf" function.
 * @param options - The options for the mintTimestampOf function.
 * @returns The encoded ABI parameters.
 * @extension LENS
 * @example
 * ```ts
 * import { encodeMintTimestampOfParams } from "thirdweb/extensions/lens";
 * const result = encodeMintTimestampOfParams({
 *  tokenId: ...,
 * });
 * ```
 */
export function encodeMintTimestampOfParams(options: MintTimestampOfParams) {
  return encodeAbiParameters(FN_INPUTS, [options.tokenId]);
}

/**
 * Encodes the "mintTimestampOf" function into a Hex string with its parameters.
 * @param options - The options for the mintTimestampOf function.
 * @returns The encoded hexadecimal string.
 * @extension LENS
 * @example
 * ```ts
 * import { encodeMintTimestampOf } from "thirdweb/extensions/lens";
 * const result = encodeMintTimestampOf({
 *  tokenId: ...,
 * });
 * ```
 */
export function encodeMintTimestampOf(options: MintTimestampOfParams) {
  // we do a "manual" concat here to avoid the overhead of the "concatHex" function
  // we can do this because we know the specific formats of the values
  return (FN_SELECTOR +
    encodeMintTimestampOfParams(options).slice(
      2,
    )) as `${typeof FN_SELECTOR}${string}`;
}

/**
 * Decodes the result of the mintTimestampOf function call.
 * @param result - The hexadecimal result to decode.
 * @returns The decoded result as per the FN_OUTPUTS definition.
 * @extension LENS
 * @example
 * ```ts
 * import { decodeMintTimestampOfResult } from "thirdweb/extensions/lens";
 * const result = decodeMintTimestampOfResultResult("...");
 * ```
 */
export function decodeMintTimestampOfResult(result: Hex) {
  return decodeAbiParameters(FN_OUTPUTS, result)[0];
}

/**
 * Calls the "mintTimestampOf" function on the contract.
 * @param options - The options for the mintTimestampOf function.
 * @returns The parsed result of the function call.
 * @extension LENS
 * @example
 * ```ts
 * import { mintTimestampOf } from "thirdweb/extensions/lens";
 *
 * const result = await mintTimestampOf({
 *  contract,
 *  tokenId: ...,
 * });
 *
 * ```
 */
export async function mintTimestampOf(
  options: BaseTransactionOptions<MintTimestampOfParams>,
) {
  return readContract({
    contract: options.contract,
    method: [FN_SELECTOR, FN_INPUTS, FN_OUTPUTS] as const,
    params: [options.tokenId],
  });
}
