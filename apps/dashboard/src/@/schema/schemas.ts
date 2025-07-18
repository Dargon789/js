import { isAddress } from "thirdweb";
import { isValidENSName } from "thirdweb/utils";
import z from "zod";
import { getClientThirdwebClient } from "@/constants/thirdweb-client.client";
import { resolveEns } from "@/lib/ens";

/**
 * This file contains some useful zod schemas from the SDK v4
 * Since we are migrating away from v4, and we still need them for (form) validations,
 * we put the schemas here
 */

// Used for PlatformFees and Royalties
export const BasisPointsSchema = z
  .number()
  .max(10000, "Cannot exceed 100%")
  .min(0, "Cannot be below 0%");

// @internal
type EnsName = string;

// Only pass through to provider call if value is a valid ENS name
const EnsSchema: z.ZodType<`0x${string}`, z.ZodTypeDef, string> = z
  .custom<EnsName>((ens) => typeof ens === "string" && isValidENSName(ens))
  // TODO - move this schema inside component to use client with authToken, teamId filled in
  .transform(
    async (ens) =>
      (await resolveEns(ens, getClientThirdwebClient(undefined))).address,
  )
  .refine(
    (address): address is `0x${string}` => !!address && isAddress(address),
    {
      message: "Provided value was not a valid ENS name",
    },
  );

const AddressSchema = z.custom<string>(
  (address) => typeof address === "string" && isAddress(address),
  (out) => {
    return {
      message: `${out} is not a valid address`,
    };
  },
);

// Important for address check to come before ENS so network request is only made when necessary
export const AddressOrEnsSchema = z.union([AddressSchema, EnsSchema], {
  invalid_type_error: "Provided value was not a valid address or ENS name",
});

const FileSchema = z.instanceof(File) as z.ZodType<InstanceType<typeof File>>;

const FileOrStringSchema = z.union([FileSchema, z.string()]);

export const CommonContractSchema = z
  .object({
    app_uri: z.string().optional(),
    defaultAdmin: AddressOrEnsSchema.optional(),
    description: z.string().optional(),
    external_link: z.string().optional(),
    image: FileOrStringSchema.optional(),
    name: z.string(),
    social_urls: z.record(z.string()).optional(),
  })
  .catchall(z.unknown());
