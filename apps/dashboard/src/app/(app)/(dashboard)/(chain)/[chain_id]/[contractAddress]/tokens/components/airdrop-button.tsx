"use client";

import { DropletIcon } from "lucide-react";
import { useState } from "react";
import type { ThirdwebContract } from "thirdweb";
import { balanceOf } from "thirdweb/extensions/erc20";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TokenAirdropForm } from "./airdrop-form";

interface TokenAirdropButtonProps {
  contract: ThirdwebContract;
  isLoggedIn: boolean;
}

export const TokenAirdropButton: React.FC<TokenAirdropButtonProps> = ({
  contract,
  isLoggedIn,
  ...restButtonProps
}) => {
  const address = useActiveAccount()?.address;
  const tokenBalanceQuery = useReadContract(balanceOf, {
    address: address || "",
    contract,
    queryOptions: { enabled: !!address },
  });
  const hasBalance = tokenBalanceQuery.data && tokenBalanceQuery.data > 0n;
  const [open, setOpen] = useState(false);
  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button
          variant="primary"
          {...restButtonProps}
          className="gap-2"
          disabled={!hasBalance}
        >
          <DropletIcon size={16} /> Airdrop
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:min-w-[540px] lg:min-w-[700px]">
        <SheetHeader>
          <SheetTitle className="text-left">Airdrop tokens</SheetTitle>
        </SheetHeader>
        <TokenAirdropForm contract={contract} isLoggedIn={isLoggedIn} />
      </SheetContent>
    </Sheet>
  );
};
