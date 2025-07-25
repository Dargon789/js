import type { Chain } from "../../chains/types.js";
import type { ThirdwebClient } from "../../client/client.js";
import { isNativeTokenAddress } from "../../constants/addresses.js";
import { getContract } from "../../contract/contract.js";
import type { Prettify } from "../type-utils.js";
import { toUnits } from "../units.js";

type AmountOrAmountInWei =
  | {
      amount: string | number;
    }
  | {
      amountInWei: bigint;
    };

export async function convertErc20Amount(
  options: Prettify<
    {
      client: ThirdwebClient;
      chain: Chain;
      erc20Address: string;
    } & AmountOrAmountInWei
  >,
): Promise<bigint> {
  try {
    if ("amount" in options) {
      // for native token, we know decimals are 18
      if (!options.erc20Address || isNativeTokenAddress(options.erc20Address)) {
        return toUnits(options.amount.toString(), 18);
      }
      // otherwise get the decimals of the currency
      const currencyContract = getContract({
        address: options.erc20Address,
        chain: options.chain,
        client: options.client,
      });
      const { decimals } = await import(
        "../../extensions/erc20/read/decimals.js"
      );
      const currencyDecimals = await decimals({
        contract: currencyContract,
      });
      return toUnits(options.amount.toString(), currencyDecimals);
    }
    return options.amountInWei;
  } catch (e) {
    throw new Error(
      `Failed to convert ERC20 amount for token: ${options.erc20Address}: ${e}`,
    );
  }
}
