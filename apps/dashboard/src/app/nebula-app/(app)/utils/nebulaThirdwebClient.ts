import {
  IPFS_GATEWAY_URL,
  NEBULA_APP_SECRET_KEY,
  NEXT_PUBLIC_NEBULA_APP_CLIENT_ID,
} from "@/constants/env";
import {
  THIRDWEB_BUNDLER_DOMAIN,
  THIRDWEB_INAPP_WALLET_DOMAIN,
  THIRDWEB_INSIGHT_API_DOMAIN,
  THIRDWEB_PAY_DOMAIN,
  THIRDWEB_RPC_DOMAIN,
  THIRDWEB_SOCIAL_API_DOMAIN,
  THIRDWEB_STORAGE_DOMAIN,
} from "constants/urls";
import { createThirdwebClient } from "thirdweb";
import { setThirdwebDomains } from "thirdweb/utils";
import { getVercelEnv } from "../../../../lib/vercel-utils";

// returns a thirdweb client with optional JWT passed in
function getThirdwebClient() {
  if (getVercelEnv() !== "production") {
    // if not on production: run this when creating a client to set the domains
    setThirdwebDomains({
      rpc: THIRDWEB_RPC_DOMAIN,
      inAppWallet: THIRDWEB_INAPP_WALLET_DOMAIN,
      pay: THIRDWEB_PAY_DOMAIN,
      storage: THIRDWEB_STORAGE_DOMAIN,
      social: THIRDWEB_SOCIAL_API_DOMAIN,
      bundler: THIRDWEB_BUNDLER_DOMAIN,
      insight: THIRDWEB_INSIGHT_API_DOMAIN,
    });
  }

  return createThirdwebClient({
    secretKey: NEBULA_APP_SECRET_KEY,
    clientId: NEXT_PUBLIC_NEBULA_APP_CLIENT_ID,
    config: {
      storage: {
        gatewayUrl: IPFS_GATEWAY_URL,
      },
    },
  });
}

export const nebulaAppThirdwebClient = getThirdwebClient();
