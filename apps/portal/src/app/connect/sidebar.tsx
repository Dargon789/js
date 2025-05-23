import type { SideBar } from "@/components/Layouts/DocLayout";
import { DotNetIcon, ReactIcon, TypeScriptIcon, UnityIcon } from "@/icons";
import { ExternalLink } from "lucide-react";
import { UnrealEngineIcon } from "../../icons/sdks/UnrealEngineIcon";

// TODO: move the following two slugs to walletSlug with updated docs
const inAppSlug = "/connect/in-app-wallet";

const walletSlug = "/connect/wallet";
const aAslug = "/connect/account-abstraction";
const authSlug = "/connect/auth";
const paySlug = "/connect/pay";

export const sidebar: SideBar = {
  name: "Connect",
  links: [
    { separator: true },
    {
      name: "Introduction",
      href: "/connect",
    },
    {
      name: "Why thirdweb?",
      href: "/connect/why-thirdweb",
    },
    {
      name: "Playground",
      href: "https://playground.thirdweb.com/",
      icon: <ExternalLink />,
    },
    {
      name: "Templates",
      href: "https://thirdweb.com/templates",
      icon: <ExternalLink />,
    },
    { separator: true },
    // Connect\
    {
      name: "Onboard Users",
      expanded: true,
      isCollapsible: false,
      links: [
        {
          name: "Overview",
          href: `${walletSlug}/overview`,
        },
        {
          name: "Security",
          href: `${walletSlug}/security`,
        },
        {
          name: "Get Started",
          href: `${walletSlug}/get-started`,
        },
        {
          name: "External Wallets",
          href: `${walletSlug}/sign-in-methods/external-wallets`,
        },
        {
          name: "In-App Wallets",
          links: [
            {
              name: "Sign-In Methods",
              href: `${walletSlug}/sign-in-methods/configure`,
            },
            {
              name: "Fetch Users",
              href: `${walletSlug}/get-users`,
            },
            {
              name: "Pregenerate Wallets",
              href: `${walletSlug}/pregenerate-wallets`,
            },
            {
              name: "Guest Mode",
              href: `${walletSlug}/sign-in-methods/guest`,
            },
            {
              name: "FAQ",
              href: `${walletSlug}/in-app-wallet/faq`,
            },
            {
              name: "Custom Authentication",
              links: [
                {
                  name: "Overview",
                  href: `${inAppSlug}/custom-auth/overview`,
                },
                {
                  name: "Configuration",
                  href: `${inAppSlug}/custom-auth/configuration`,
                },
                {
                  name: "Integration guides",
                  links: [
                    {
                      name: "Custom auth server (OIDC Auth)",
                      href: `${inAppSlug}/custom-auth/custom-jwt-auth-server`,
                    },
                    {
                      name: "Custom auth server (Generic Auth)",
                      href: `${inAppSlug}/custom-auth/custom-auth-server`,
                    },
                    {
                      name: "Firebase Auth",
                      href: `${inAppSlug}/custom-auth/firebase-auth`,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "Ecosystem Wallets",
          links: [
            {
              name: "Set-up",
              href: `${walletSlug}/ecosystem/set-up`,
            },
            {
              name: "Ecosystem Portal",
              href: `${walletSlug}/ecosystem/portal`,
            },
            {
              name: "Managing Ecosystem Permissions",
              href: `${walletSlug}/ecosystem/permissions`,
            },
            {
              name: "Integrating with Partners",
              href: `${walletSlug}/ecosystem/integrating-partners`,
            },
            {
              name: "Register with WalletConnect",
              href: `${walletSlug}/ecosystem/register-walletconnect`,
            },
            {
              name: "FAQ",
              href: `${walletSlug}/ecosystem/faq`,
            },
          ],
        },
        //Account abstraction
        {
          name: "Account Abstraction",
          links: [
            {
              name: "Overview",
              href: `${aAslug}/overview`,
            },
            {
              name: "How it Works",
              href: `${aAslug}/how-it-works`,
            },
            {
              name: "Get Started",
              links: [
                {
                  name: "TypeScript",
                  href: "/typescript/v5/account-abstraction/get-started",
                  icon: <TypeScriptIcon />,
                },
                {
                  name: "React",
                  href: "/react/v5/account-abstraction/get-started",
                  icon: <ReactIcon />,
                },
                {
                  name: "React Native",
                  // TODO - add react-native dedicated page
                  href: "/react/v5/account-abstraction/get-started",
                  icon: <ReactIcon />,
                },
                {
                  name: "Dotnet",
                  href: "/dotnet/wallets/providers/account-abstraction",
                  icon: <DotNetIcon />,
                },
                {
                  name: "Unity",
                  href: "/unity/wallets/providers/account-abstraction",
                  icon: <UnityIcon />,
                },
              ],
            },
            {
              name: "ERC-20 Paymaster",
              href: `${aAslug}/erc-20-paymaster`,
            },
            {
              name: "Account Factories",
              href: `${aAslug}/factories`,
            },
            {
              name: "Bundler & Paymaster",
              href: `${aAslug}/infrastructure`,
            },
            {
              name: "Sponsorship rules",
              href: `${aAslug}/sponsorship-rules`,
            },
            {
              name: "FAQs",
              href: `${aAslug}/faq`,
            },
          ],
        },
        {
          name: "Web3 Onboard",
          href: `${walletSlug}/web3-onboard`,
        },
        {
          name: "Migrate to thirdweb",
          href: `${walletSlug}/migrate-to-thirdweb`,
        },
        {
          name: "FAQ",
          href: `${walletSlug}/faq`,
        },
      ],
    },
    { separator: true },
    {
      name: "Universal Bridge",
      isCollapsible: false,
      links: [
        {
          name: "Overview",
          href: `${paySlug}/overview`,
        },
        {
          name: "Supported Routes",
          href: "https://thirdweb.com/routes",
        },
        {
          name: "Service Fees",
          href: `${paySlug}/fees`,
        },
        {
          name: "Get Started",
          href: `${paySlug}/get-started`,
          expanded: true,
          links: [
            {
              name: "ConnectButton",
              href: `${paySlug}/get-started#option-1-connectbutton`,
            },
            {
              name: "Embed Pay",
              href: `${paySlug}/get-started#option-2-embed-pay`,
            },
            {
              name: "Send a Transaction",
              href: `${paySlug}/get-started#option-3-send-a-transaction-with-pay`,
            },
          ],
        },
        {
          name: "Tutorials",
          isCollapsible: true,

          links: [
            {
              name: "Accept Direct Payments",
              href: `${paySlug}/guides/accept-direct-payments`,
            },
            {
              name: "Build a Custom Onramp Experience",
              href: `${paySlug}/guides/build-a-custom-experience`,
            },
            {
              name: "Cross-Chain Swapping",
              href: `${paySlug}/guides/cross-chain-swapping`,
            },
          ],
        },
        {
          name: "Customization",
          isCollapsible: true,
          links: [
            {
              name: "ConnectButton",
              href: `${paySlug}/customization/connectbutton`,
            },
            {
              name: "PayEmbed",
              href: `${paySlug}/customization/payembed`,
            },
            {
              name: "useSendTransaction",
              href: `${paySlug}/customization/send-transaction`,
            },
          ],
        },
        {
          name: "Webhooks",
          href: `${paySlug}/webhooks`,
        },
        {
          name: "Developer Mode",
          href: `${paySlug}/testing-pay`,
        },
        {
          name: "FAQs",
          href: `${paySlug}/faqs`,
        },
      ],
    },
    // User identity
    {
      name: "User Identity",
      isCollapsible: false,
      links: [
        // Auth
        // TODO move to TS reference
        {
          name: "Sign In with Ethereum",
          links: [
            {
              name: "Get Started",
              href: `${authSlug}`,
            },
            {
              name: "Frameworks",
              isCollapsible: true,
              expanded: false,
              links: [
                {
                  name: "Next.js",
                  href: `${authSlug}/frameworks/next`,
                },
                {
                  name: "React + Express",
                  href: `${authSlug}/frameworks/react-express`,
                },
              ],
            },
            {
              name: "Deploying to Production",
              href: `${authSlug}/deploying-to-production`,
            },
          ],
        },
        {
          name: "Get User Profiles",
          href: `${walletSlug}/user-management/get-user-profiles`,
        },
        {
          name: "Link Multiple Identities",
          href: `${walletSlug}/user-management/link-multiple-identity`,
        },
        {
          name: "Export Private Keys",
          href: `${walletSlug}/user-management/export-private-key`,
        },
        // TODO:
        // {
        //   name: "Deleting User Details",
        //   href: `${walletSlug}/user-management/deleting-user-details`,
        // },
      ],
    },
    { separator: true },
    // Blockchain API
    // TODO Overview page?
    {
      name: "API References",
      isCollapsible: false,
      links: [
        {
          name: "TypeScript",
          href: "/typescript/v5",
          icon: <TypeScriptIcon />,
        },
        {
          name: "React",
          href: "/react/v5",
          icon: <ReactIcon />,
        },
        {
          name: "React Native",
          href: "/react-native/v5",
          icon: <ReactIcon />,
        },
        {
          name: "Dotnet",
          href: "/dotnet",
          icon: <DotNetIcon />,
        },
        {
          name: "Unity",
          href: "/unity",
          icon: <UnityIcon />,
        },
        {
          name: "Unreal Engine",
          href: "/unreal-engine",
          icon: <UnrealEngineIcon />,
        },
      ],
    },
  ],
};
