"use client";

import { Card } from "chakra/card";
import { type ChangeEvent, useState } from "react";
import { prepareTransaction, type ThirdwebClient, toWei } from "thirdweb";
import { useSendAndConfirmTransaction } from "thirdweb/react";
import { TransactionButton } from "@/components/tx-button";
import { Input } from "@/components/ui/input";
import { useV5DashboardChain } from "@/hooks/chains/v5-adapter";
import type { StoredChain } from "@/stores/chainStores";

interface DepositNativeProps {
  address: string;
  symbol: string;
  chain: StoredChain;
  isLoggedIn: boolean;
  client: ThirdwebClient;
}

export const DepositNative: React.FC<DepositNativeProps> = ({
  address,
  symbol,
  chain,
  isLoggedIn,
  client,
}) => {
  const { mutate: transfer, isPending } = useSendAndConfirmTransaction();
  const [amount, setAmount] = useState("");
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAmount(e.currentTarget.value);
  };
  const v5Chain = useV5DashboardChain(chain.chainId);

  return (
    <Card
      maxW={{ base: "100%", md: "49%" }}
      style={{
        alignItems: "center",
        display: "flex",
        flexDirection: "row",
        gap: 16,
      }}
    >
      <Input
        onChange={handleChange}
        placeholder={`Amount in ${symbol}. ex: 0.001`}
        type="number"
        value={amount}
      />
      <TransactionButton
        client={client}
        disabled={
          amount.length === 0 || Number.parseFloat(amount) <= 0 || !address
        }
        isLoggedIn={isLoggedIn}
        isPending={isPending}
        onClick={() => {
          if (!address) {
            throw new Error("Invalid address");
          }

          const transaction = prepareTransaction({
            chain: v5Chain,
            client,
            to: address,
            value: toWei(amount),
          });
          transfer(transaction, {
            onSuccess: () => {
              setAmount("");
            },
          });
        }}
        style={{ minWidth: 160 }}
        transactionCount={1}
        txChainID={v5Chain.id}
      >
        Deposit
      </TransactionButton>
    </Card>
  );
};
