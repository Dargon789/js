"use client";

import { useTheme } from "next-themes";
import { ConnectButton } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { nebulaAAOptions } from "@/config/nebula-aa";
import { getSDKTheme } from "@/config/sdk-component-theme";
import { getClientDashboardThirdwebClient } from "./dashboard-client";

// use dashboard client to allow users to connect to their original wallet and move funds to a different wallet
const dashboardClient = getClientDashboardThirdwebClient();

// since only the inApp and smart wallets were affected, only show in-app option
const loginOptions = [
  inAppWallet({
    auth: {
      options: [
        "google",
        "apple",
        "facebook",
        "github",
        "email",
        "phone",
        "passkey",
      ],
    },
  }),
];

// Note: This component has autoConnect enabled
export function MoveFundsConnectButton(props: {
  btnClassName?: string;
  connectLabel?: string;
}) {
  const { theme } = useTheme();

  return (
    <ConnectButton
      accountAbstraction={nebulaAAOptions}
      client={dashboardClient}
      connectButton={{
        className: props.btnClassName,
        label: props.connectLabel,
      }}
      detailsButton={{
        className: props.btnClassName,
      }}
      theme={getSDKTheme(theme === "light" ? "light" : "dark")}
      wallets={loginOptions}
    />
  );
}
