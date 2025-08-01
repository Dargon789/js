"use client";

import { SimpleGrid, Stat, StatLabel, StatNumber } from "@chakra-ui/react";
import { Card } from "chakra/card";
import type { ThirdwebContract } from "thirdweb";
import { useActiveWalletChain, useWalletBalance } from "thirdweb/react";
import { useSplitBalances } from "@/hooks/useSplit";

interface AccountBalanceProps {
  contract: ThirdwebContract;
}

export const AccountBalance: React.FC<AccountBalanceProps> = ({ contract }) => {
  const activeChain = useActiveWalletChain();
  const { data: balance } = useWalletBalance({
    address: contract.address,
    chain: activeChain,
    client: contract.client,
  });
  const balanceQuery = useSplitBalances(contract);

  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={{ base: 3, md: 6 }}>
      <Card as={Stat}>
        <StatLabel mb={{ base: 1, md: 0 }}>{balance?.symbol}</StatLabel>
        <StatNumber>{balance?.displayValue}</StatNumber>
      </Card>
      {balanceQuery?.data
        ?.filter((bl) => bl.name !== "Native Token")
        .map((bl) => (
          <Card as={Stat} key={bl.symbol}>
            <StatLabel mb={{ base: 1, md: 0 }}>{bl.symbol}</StatLabel>
            <StatNumber>{bl.display_balance}</StatNumber>
          </Card>
        ))}
    </SimpleGrid>
  );
};
