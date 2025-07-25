"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CircleAlertIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useCallback } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { sendAndConfirmTransaction } from "thirdweb";
import {
  TransferableERC20,
  TransferableERC721,
  TransferableERC1155,
} from "thirdweb/modules";
import { useReadContract } from "thirdweb/react";
import { z } from "zod";
import { TransactionButton } from "@/components/tx-button";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ToolTipLabel } from "@/components/ui/tooltip";
import { addressSchema } from "../zod-schemas";
import { ModuleCardUI, type ModuleCardUIProps } from "./module-card";
import type { ModuleInstanceProps } from "./module-instance";

const formSchema = z.object({
  allowList: z.array(
    z.object({
      address: addressSchema,
    }),
  ),
  isRestricted: z.boolean(),
});

export type TransferableModuleFormValues = z.infer<typeof formSchema>;

function TransferableModule(props: ModuleInstanceProps) {
  const { contract, ownerAccount } = props;

  const isTransferEnabledQuery = useReadContract(
    props.contractInfo.name === "TransferableERC721"
      ? TransferableERC721.isTransferEnabled
      : props.contractInfo.name === "TransferableERC20"
        ? TransferableERC20.isTransferEnabled
        : TransferableERC1155.isTransferEnabled,
    {
      contract,
    },
  );

  const update = useCallback(
    async (values: TransferableModuleFormValues) => {
      if (!ownerAccount) {
        throw new Error("Not an Owner account");
      }

      // isRestricted is the opposite of transferEnabled
      const transferEnabled = !values.isRestricted;

      if (isTransferEnabledQuery.data !== transferEnabled) {
        const setTransferable =
          props.contractInfo.name === "TransferableERC721"
            ? TransferableERC721.setTransferable
            : props.contractInfo.name === "TransferableERC20"
              ? TransferableERC20.setTransferable
              : TransferableERC1155.setTransferable;
        const setTransferableTx = setTransferable({
          contract,
          enableTransfer: transferEnabled,
        });

        await sendAndConfirmTransaction({
          account: ownerAccount,
          transaction: setTransferableTx,
        });
      }

      await Promise.all(
        values.allowList.map(async ({ address }) => {
          const setTransferableFor =
            props.contractInfo.name === "TransferableERC721"
              ? TransferableERC721.setTransferableFor
              : props.contractInfo.name === "TransferableERC20"
                ? TransferableERC20.setTransferableFor
                : TransferableERC1155.setTransferableFor;
          const setTransferableForTx = setTransferableFor({
            contract,
            enableTransfer: true,
            target: address,
          });

          await sendAndConfirmTransaction({
            account: ownerAccount,
            transaction: setTransferableForTx,
          });
        }),
      );
    },
    [
      contract,
      ownerAccount,
      isTransferEnabledQuery.data,
      props.contractInfo.name,
    ],
  );

  return (
    <TransferableModuleUI
      {...props}
      adminAddress={props.ownerAccount?.address || ""}
      client={props.contract.client}
      contractChainId={props.contract.chain.id}
      isOwnerAccount={!!props.ownerAccount}
      isPending={isTransferEnabledQuery.isPending}
      isRestricted={!isTransferEnabledQuery.data}
      update={update}
    />
  );
}

export function TransferableModuleUI(
  props: Omit<ModuleCardUIProps, "children" | "updateButton"> & {
    // allowList: string[]; // TODO: add this back in when we have a way to get the list of addresses
    isRestricted: boolean;
    isPending: boolean;
    adminAddress: string;
    isOwnerAccount: boolean;
    update: (values: TransferableModuleFormValues) => Promise<void>;
    contractChainId: number;
    isLoggedIn: boolean;
  },
) {
  const form = useForm<TransferableModuleFormValues>({
    resolver: zodResolver(formSchema),
    reValidateMode: "onChange",
    values: {
      allowList: [],
      isRestricted: props.isRestricted,
    },
  });

  const updateMutation = useMutation({
    mutationFn: props.update,
  });

  const formFields = useFieldArray({
    control: form.control,
    name: "allowList",
  });

  const onSubmit = async () => {
    const _values = form.getValues();
    const values = { ..._values };

    // clear the allowlist if no restrictions
    if (!_values.isRestricted) {
      values.allowList = [];
    }

    const promise = updateMutation.mutateAsync(values);
    toast.promise(promise, {
      error: (error) => `Failed to update transfer restrictions: ${error}`,
      success: "Successfully updated transfer restrictions",
    });
  };

  const isRestricted = form.watch("isRestricted");
  const allowListLength = form.watch("allowList").length;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ModuleCardUI
          {...props}
          updateButton={() => {
            return (
              <TransactionButton
                className="min-w-24 gap-2"
                client={props.client}
                disabled={
                  props.isPending ||
                  !props.isOwnerAccount ||
                  !form.formState.isDirty
                }
                isLoggedIn={props.isLoggedIn}
                isPending={updateMutation.isPending}
                size="sm"
                transactionCount={
                  // if already restricted, only need to send the allowlist txs
                  // else - need to send one more
                  (props.isRestricted ? 0 : 1) + allowListLength
                }
                txChainID={props.contractChainId}
                type="submit"
              >
                Update
              </TransactionButton>
            );
          }}
        >
          {props.isPending && <Skeleton className="h-[90px]" />}

          {!props.isPending && (
            <div>
              <div className="flex items-center gap-4">
                {/* Switch */}
                <FormField
                  control={form.control}
                  name="isRestricted"
                  render={({ field }) => {
                    // biome-ignore lint/correctness/noUnusedVariables: explicitly removing the value field here
                    const { value, ...restField } = field;

                    return (
                      <FormItem className="flex items-center gap-3">
                        <FormLabel>Restrict Transfers</FormLabel>
                        <FormControl>
                          <Switch
                            {...restField}
                            checked={field.value}
                            className="!m-0"
                            disabled={!props.isOwnerAccount}
                            onCheckedChange={(v) => {
                              field.onChange(v);

                              // if enabling restrictions and allowlist is empty, add the admin address by default
                              if (
                                v === true &&
                                formFields.fields.length === 0
                              ) {
                                formFields.append({
                                  address: props.adminAddress || "",
                                });
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    );
                  }}
                />
              </div>

              <div className="h-3" />

              {isRestricted && (
                <div className="w-full">
                  {formFields.fields.length === 0 && (
                    <Alert variant="warning">
                      <CircleAlertIcon className="size-5 max-sm:hidden" />
                      <AlertTitle className="max-sm:!pl-0">
                        Nobody has permission to transfer tokens on this
                        contract
                      </AlertTitle>
                    </Alert>
                  )}

                  <div className="flex flex-col gap-3">
                    {formFields.fields.length > 0 && (
                      <p className="text-muted-foreground text-sm">
                        Accounts that may override the transfer restrictions
                      </p>
                    )}

                    {/* Addresses */}
                    {formFields.fields.map((fieldItem, index) => (
                      <div
                        className="flex items-start gap-3"
                        key={fieldItem.id}
                      >
                        <FormField
                          control={form.control}
                          name={`allowList.${index}.address`}
                          render={({ field }) => (
                            <FormItem className="grow">
                              <FormControl>
                                <Input
                                  placeholder="0x..."
                                  {...field}
                                  disabled={!props.isOwnerAccount}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <ToolTipLabel label="Remove address">
                          <Button
                            className="!text-destructive-text bg-background"
                            disabled={!props.isOwnerAccount}
                            onClick={() => {
                              formFields.remove(index);
                            }}
                            variant="outline"
                          >
                            <Trash2Icon className="size-4" />
                          </Button>
                        </ToolTipLabel>
                      </div>
                    ))}
                  </div>

                  <div className="h-3" />

                  {/* Add Addresses Actions */}
                  <div className="flex gap-3">
                    <Button
                      className="gap-2"
                      disabled={!props.isOwnerAccount}
                      onClick={() => {
                        // add admin by default if adding the first input
                        formFields.append({
                          address:
                            formFields.fields.length === 0
                              ? props.adminAddress
                              : "",
                        });
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <PlusIcon className="size-3" />
                      Add Address
                    </Button>
                  </div>
                </div>
              )}

              {!isRestricted && (
                <Alert variant="info">
                  <CircleAlertIcon className="size-5 max-sm:hidden" />
                  <AlertTitle className="max-sm:!pl-0">
                    Transferring tokens in this contract is not restricted.
                    Everyone is free to transfer their tokens.
                  </AlertTitle>
                </Alert>
              )}
            </div>
          )}
        </ModuleCardUI>
      </form>
    </Form>
  );
}

export default TransferableModule;
