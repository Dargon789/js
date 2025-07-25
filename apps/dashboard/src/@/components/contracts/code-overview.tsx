"use client";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Flex,
  GridItem,
  List,
  ListItem,
  SimpleGrid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  type Abi,
  type AbiEvent,
  type AbiFunction,
  formatAbiItem,
} from "abitype";
import { Button } from "chakra/button";
import { Card } from "chakra/card";
import { Heading } from "chakra/heading";
import { Link } from "chakra/link";
import { Text } from "chakra/text";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import * as ERC20Ext from "thirdweb/extensions/erc20";
import * as ERC721Ext from "thirdweb/extensions/erc721";
import * as ERC1155Ext from "thirdweb/extensions/erc1155";
import * as ERC4337Ext from "thirdweb/extensions/erc4337";
import { useActiveAccount } from "thirdweb/react";
import { toFunctionSelector } from "thirdweb/utils";

import {
  type CodeEnvironment,
  CodeSegment,
} from "@/components/blocks/code/code-segment.client";
import { getContractFunctionsFromAbi } from "@/components/contract-components/getContractFunctionsFromAbi";
import { UnderlineLink } from "@/components/ui/UnderlineLink";
import { useAllChainsData } from "@/hooks/chains/allChains";
import { useContractEvents } from "@/hooks/contract-hooks";

interface CodeOverviewProps {
  abi?: Abi;
  contractAddress?: string;
  onlyInstall?: boolean;
  chainId: number;
  noSidebar?: boolean;
}

export const COMMANDS = {
  events: {
    javascript: `import { prepareEvent, getContractEvents } from "thirdweb";

const preparedEvent = prepareEvent({
  signature: "{{function}}"
});
const events = await getContractEvents({
  contract,
  events: [preparedEvent]
});`,
    react: `import { prepareEvent } from "thirdweb";
import { useContractEvents } from "thirdweb/react";

const preparedEvent = prepareEvent({
  signature: "{{function}}"
});

export default function Component() {
  const { data: event } = useContractEvents({
    contract,
    events: [preparedEvent]
  });
}`,
    "react-native": `import { prepareEvent } from "thirdweb";
import { useContractEvents } from "thirdweb/react";

const preparedEvent = prepareEvent({
  signature: "{{function}}"
});

export default function Component() {
  const { data: event } = useContractEvents({
    contract,
    events: [preparedEvent]
  });
}`,
  },
  install: {
    javascript: "npm i thirdweb",
    react: "npm i thirdweb",
    "react-native": "npm i thirdweb",
    unity: `// Download the .unitypackage from the latest release:
// https://github.com/thirdweb-dev/unity-sdk/releases
// and drag it into your project`,
  },
  read: {
    javascript: `import { readContract } from "thirdweb";

const data = await readContract({
  contract,
  method: "{{function}}",
  params: [{{args}}]
})`,
    react: `import { useReadContract } from "thirdweb/react";

export default function Component() {
  const { data, isPending } = useReadContract({
    contract,
    method: "{{function}}",
    params: [{{args}}]
  });
}`,
    "react-native": `import { useReadContract } from "thirdweb/react";

export default function Component() {
  const { data, isPending } = useReadContract({
    contract,
    method: "{{function}}",
    params: [{{args}}]
  });
}`,
  },
  setup: {
    javascript: `import { createThirdwebClient, getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";

// create the client with your clientId, or secretKey if in a server environment
const client = createThirdwebClient({
  clientId: "YOUR_CLIENT_ID"
 });

// connect to your contract
const contract = getContract({
  client,
  chain: defineChain({{chainId}}),
  address: "{{contract_address}}"
});`,
    react: `import { createThirdwebClient, getContract, resolveMethod } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { ThirdwebProvider } from "thirdweb/react";

// create the client with your clientId, or secretKey if in a server environment
export const client = createThirdwebClient({
  clientId: "YOUR_CLIENT_ID"
});

// connect to your contract
export const contract = getContract({
  client,
  chain: defineChain({{chainId}}),
  address: "{{contract_address}}"
});

function App() {
  return (
    <ThirdwebProvider>
      <Component />
    </ThirdwebProvider>
  )
}`,
    "react-native": `import { createThirdwebClient, getContract, resolveMethod } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { ThirdwebProvider } from "thirdweb/react";

// create the client with your clientId, or secretKey if in a server environment
export const client = createThirdwebClient({
  clientId: "YOUR_CLIENT_ID"
});

// connect to your contract
export const contract = getContract({
  client,
  chain: defineChain({{chainId}}),
  address: "{{contract_address}}",
});

function App() {
  return (
    <ThirdwebProvider>
      <Component />
    </ThirdwebProvider>
  )
}
`,
    unity: `using Thirdweb;

// Reference the SDK
var sdk = ThirdwebManager.Instance.SDK;

// Get your contract
var contract = sdk.GetContract("{{contract_address}}");`,
  },
  write: {
    javascript: `import { prepareContractCall, sendTransaction } from "thirdweb";

const transaction = await prepareContractCall({
  contract,
  method: "{{function}}",
  params: [{{args}}]
});
const { transactionHash } = await sendTransaction({
  transaction,
  account
});`,
    react: `import { prepareContractCall } from "thirdweb"
import { useSendTransaction } from "thirdweb/react";

export default function Component() {
  const { mutate: sendTransaction } = useSendTransaction();

  const onClick = () => {
    const transaction = prepareContractCall({
      contract,
      method: "{{function}}",
      params: [{{args}}]
    });
    sendTransaction(transaction);
  }
}`,
    "react-native": `import { prepareContractCall } from "thirdweb"
import { useSendTransaction } from "thirdweb/react";

export default function Component() {
  const { mutate: sendTransaction } = useSendTransaction();

  const onClick = () => {
    const transaction = prepareContractCall({
      contract,
      method: "{{function}}",
      params: [{{args}}]
    });
    sendTransaction(transaction);
  }
}`,
  },
};

const WALLETS_SNIPPETS = [
  {
    description: "Deploy accounts for your users",
    iconUrl:
      "ipfs://QmeAJVqn17aDNQhjEU3kcWVZCFBrfta8LzaDGkS8Egdiyk/smart-wallet.svg",
    id: "smart-wallet",
    link: "https://portal.thirdweb.com/references/typescript/v5/smartWallet",
    name: "Account Abstraction",
    supportedLanguages: {
      javascript: `import { defineChain } from "thirdweb";
import { inAppWallet, smartWallet } from "thirdweb/wallets";

const chain = defineChain({{chainId}});

// First, connect the personal wallet, which can be any wallet (metamask, in-app, etc.)
const personalWallet = inAppWallet();
const personalAccount = await personalWallet.connect({
  client,
  chain,
  strategy: "google",
});

// Then, connect the Smart Account
const wallet = smartWallet({
  chain, // the chain where your account will be or is deployed
  factoryAddress: "{{factory_address}}", // your own deployed account factory address
  gasless: true, // enable or disable gasless transactions
});
const smartAccount = await wallet.connect({
  client,
  personalWallet,
});`,
      react: `import { defineChain } from "thirdweb";
import { ThirdwebProvider, ConnectButton } from "thirdweb/react";

export default function App() {
return (
    <ThirdwebProvider>
      <ConnectButton
        client={client}
        accountAbstraction={{
          chain: defineChain({{chainId}}),
          factoryAddress: "{{factory_address}}",
          gasless: true,
        }}
      />
    </ThirdwebProvider>
  );
}`,
      unity: `using Thirdweb;

public async void ConnectWallet()
{
    // Reference to your Thirdweb SDK
    var sdk = ThirdwebManager.Instance.SDK;

    // Configure the connection
    var connection = new WalletConnection(
      provider: WalletProvider.SmartWallet,        // The wallet provider you want to connect to (Required)
      chainId: 1,                                  // The chain you want to connect to (Required)
      password: "myEpicPassword",                  // If using a local wallet as personal wallet (Optional)
      email: "email@email.com",                    // If using an email wallet as personal wallet (Optional)
      personalWallet: WalletProvider.LocalWallet   // The personal wallet you want to use with your Account (Optional)
    );

    // Connect the wallet
    string address = await sdk.wallet.Connect(connection);
}`,
    },
  },
];

function buildJavascriptSnippet(args: {
  extensionName: string;
  extensionNamespace: string;
  type: "read" | "write" | "event";
  fnArgs: string[];
}) {
  const importStatement = `import { ${args.type === "read" ? "readContract" : args.type === "write" ? "sendTransaction" : "getContractEvents"} } from "thirdweb";
import { ${args.extensionName} } from "thirdweb/extensions/${args.extensionNamespace}";`;

  switch (args.type) {
    case "read": {
      return `${importStatement}

const data = await readContract(${args.extensionName}, {
  contract,${args.fnArgs.map((arg) => `\n  ${arg}`).join(",")}
});`;
    }
    case "write": {
      return `${importStatement}

const transaction = ${args.extensionName}({
  contract,${args.fnArgs.map((arg) => `\n  ${arg}`).join(",")}
});

const { transactionHash } = await sendTransaction({
  transaction,
  account
});`;
    }
    case "event": {
      return `${importStatement}

const preparedEvent = ${args.extensionName}({
  contract
});

const events = await getContractEvents({
  contract,
  events: [preparedEvent]
});`;
    }
  }
}

function buildReactSnippet(args: {
  extensionName: string;
  extensionNamespace: string;
  type: "read" | "write" | "event";
  fnArgs: string[];
}) {
  const importStatement = `import { use${args.type === "read" ? "ReadContract" : args.type === "write" ? "SendTransaction" : "ContractEvents"} } from "thirdweb/react";
import { ${args.extensionName} } from "thirdweb/extensions/${args.extensionNamespace}";`;

  switch (args.type) {
    case "read": {
      return `${importStatement}

const { data, isPending } = useReadContract(${args.extensionName}, {
  contract,${args.fnArgs.map((arg) => `\n  ${arg}`).join(",")}
});`;
    }
    case "write": {
      return `${importStatement}

const { mutate: sendTransaction } = useSendTransaction();

const onClick = () => {
  const transaction = ${args.extensionName}({
    contract,${args.fnArgs.map((arg) => `\n    ${arg}`).join(",")}
  });
  sendTransaction(transaction);
};`;
    }
    case "event": {
      return `${importStatement}

const preparedEvent = ${args.extensionName}({
  contract
});

const { data: event } = useContractEvents({
  contract,
  events: [preparedEvent]
});`;
    }
  }
}

/**
 * This is a temporary solution to provide code snippets for the different extensions.
 */
const EXTENSION_NAMESPACE_FUNCTION_MAPPING = {
  erc20: {
    claim: {
      args: ["to", "amount"],
      name: "claimTo",
    },
  },
  erc721: {
    claim: {
      args: ["to", "amount"],
      name: "claimTo",
    },
  },
  erc1155: {
    claim: {
      args: ["to", "amount", "tokenId"],
      name: "claimTo",
    },
  },
} as Record<
  string,
  Record<
    string,
    {
      name: string;
      args: string[];
    }
  >
>;

interface SnippetOptions {
  contractAddress?: string;
  fn?: AbiFunction | AbiEvent;
  args?: string[];
  address?: string;
  clientId?: string;
  chainId?: number;
  extensionNamespace?: string;
}

export function formatSnippet(
  // biome-ignore lint/suspicious/noExplicitAny: FIXME
  snippet: Partial<Record<CodeEnvironment, any>>,
  {
    contractAddress,
    fn,
    args,
    chainId,
    address,
    clientId,
    extensionNamespace,
  }: SnippetOptions,
) {
  const code = { ...snippet };

  const formattedAbi = fn
    ? formatAbiItem({
        ...fn,
        type: "stateMutability" in fn ? "function" : "event",
        // biome-ignore lint/suspicious/noExplicitAny: FIXME
      } as any)
    : "";

  for (const key of Object.keys(code)) {
    const env = key as CodeEnvironment;

    let codeForEnv = code[env];

    // hacks on hacks on hacks
    if (
      fn?.name &&
      extensionNamespace &&
      extensionNamespace in EXTENSION_NAMESPACE_FUNCTION_MAPPING &&
      EXTENSION_NAMESPACE_FUNCTION_MAPPING[extensionNamespace] &&
      fn.name in EXTENSION_NAMESPACE_FUNCTION_MAPPING[extensionNamespace]
    ) {
      const extensionConfig =
        EXTENSION_NAMESPACE_FUNCTION_MAPPING[extensionNamespace][fn.name];

      if (!extensionConfig) {
        continue;
      }

      switch (env) {
        case "javascript":
          codeForEnv = buildJavascriptSnippet({
            extensionName: extensionConfig.name,
            extensionNamespace,
            fnArgs: extensionConfig.args,
            type:
              "stateMutability" in fn
                ? fn.stateMutability === "view" || fn.stateMutability === "pure"
                  ? "read"
                  : "write"
                : "event",
          });
          break;
        case "react":
        case "react-native":
          codeForEnv = buildReactSnippet({
            extensionName: extensionConfig.name,
            extensionNamespace,
            fnArgs: extensionConfig.args,
            type:
              "stateMutability" in fn
                ? fn.stateMutability === "view" || fn.stateMutability === "pure"
                  ? "read"
                  : "write"
                : "event",
          });
          break;
      }
    }
    // end hacks on hacks on hacks -- now just hacks on hacks from here on out

    code[env] = codeForEnv
      ?.replace(/{{contract_address}}/gm, contractAddress || "0x...")
      ?.replace(/{{factory_address}}/gm, contractAddress || "0x...")
      ?.replace(/{{wallet_address}}/gm, address || "walletAddress")
      ?.replace("YOUR_CLIENT_ID", clientId || "YOUR_CLIENT_ID")
      ?.replace(/{{function}}/gm, formattedAbi || "")
      ?.replace(/{{chainId}}/gm, chainId?.toString() || "1");

    if (args?.some((arg) => arg)) {
      code[env] = code[env]?.replace(/{{args}}/gm, args?.join(", ") || "");
    } else {
      code[env] = code[env]?.replace(/{{args}}/gm, "");
    }
  }

  return code;
}

export const CodeOverview: React.FC<CodeOverviewProps> = ({
  abi,
  contractAddress = "0x...",
  onlyInstall = false,
  noSidebar = false,
  chainId,
}) => {
  const searchParams = useSearchParams();
  const defaultEnvironment = searchParams?.get("environment") as
    | CodeEnvironment
    | undefined;

  const [environment, setEnvironment] = useState<CodeEnvironment>(
    defaultEnvironment || "javascript",
  );

  const [tab, setTab] = useState("write");

  const address = useActiveAccount()?.address;
  const isMobile = useBreakpointValue({ base: true, md: false });

  const functionSelectors = useMemo(() => {
    return (abi || [])
      .filter((a) => a.type === "function")
      .map((fn) => toFunctionSelector(fn));
  }, [abi]);

  const isAccountFactory = useMemo(() => {
    return [
      ERC4337Ext.isGetAllAccountsSupported(functionSelectors),
      ERC4337Ext.isGetAccountsSupported(functionSelectors),
      ERC4337Ext.isTotalAccountsSupported(functionSelectors),
      ERC4337Ext.isGetAccountsOfSignerSupported(functionSelectors),
      ERC4337Ext.isPredictAccountAddressSupported(functionSelectors),
    ].every(Boolean);
  }, [functionSelectors]);
  const isERC20 = useMemo(
    () => ERC20Ext.isERC20(functionSelectors),
    [functionSelectors],
  );
  const isERC721 = useMemo(() => {
    // this will have to do for now
    return [ERC721Ext.isGetNFTsSupported(functionSelectors)].every(Boolean);
  }, [functionSelectors]);

  const isERC1155 = useMemo(() => {
    // this will have to do for now
    return [ERC1155Ext.isGetNFTsSupported(functionSelectors)].every(Boolean);
  }, [functionSelectors]);

  const extensionNamespace = useMemo(() => {
    if (isERC20) {
      return "erc20";
    }
    if (isERC721) {
      return "erc721";
    }
    if (isERC1155) {
      return "erc1155";
    }
    return undefined;
  }, [isERC20, isERC721, isERC1155]);

  const { idToChain } = useAllChainsData();
  const chainInfo = chainId ? idToChain.get(chainId) : undefined;

  const functions = getContractFunctionsFromAbi(abi || []);
  const events = useContractEvents(abi as Abi);
  const { readFunctions, writeFunctions } = useMemo(() => {
    return {
      readFunctions: functions?.filter(
        (f) => f.stateMutability === "view" || f.stateMutability === "pure",
      ),
      writeFunctions: functions?.filter(
        (f) => f.stateMutability !== "view" && f.stateMutability !== "pure",
      ),
    };
  }, [functions]);

  const [read, setRead] = useState(
    readFunctions && readFunctions.length > 0 ? readFunctions[0] : undefined,
  );
  const [write, setWrite] = useState(
    writeFunctions && writeFunctions.length > 0 ? writeFunctions[0] : undefined,
  );
  const [event, setEvent] = useState(
    events && events.length > 0 ? events[0] : undefined,
  );

  return (
    <SimpleGrid
      columns={12}
      display={{ base: "block", md: "grid" }}
      gap={16}
      justifyContent="space-between"
      maxW="full"
      overflowX={{ base: "scroll", md: "hidden" }}
    >
      <GridItem as={Flex} colSpan={12} flexDir="column" gap={12}>
        {isAccountFactory && (
          <Flex flexDirection="column" gap={4}>
            <Flex flexDir="column" gap={6}>
              <Heading size="title.md">Integrate your account factory</Heading>
              <Alert
                alignItems="start"
                as={Flex}
                borderRadius="md"
                flexDir="column"
                gap={2}
                status="info"
              >
                <Flex justifyContent="start">
                  <AlertIcon />
                  <AlertTitle>Account Factory</AlertTitle>
                </Flex>
                <AlertDescription>
                  The recommended way to use account factories is to integrate
                  the{" "}
                  <UnderlineLink
                    className="text-primary-500"
                    href="https://portal.thirdweb.com/connect/account-abstraction/overview"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Connect SDK
                  </UnderlineLink>{" "}
                  in your applications. This will ensure account contracts are
                  deployed for your users only when they need it.
                </AlertDescription>
              </Alert>
              <Flex flexDir="column" gap={2}>
                <CodeSegment
                  environment={environment}
                  hideTabs
                  setEnvironment={setEnvironment}
                  snippet={formatSnippet(
                    (WALLETS_SNIPPETS.find((w) => w.id === "smart-wallet")
                      ?.supportedLanguages || {}) as Record<
                      CodeEnvironment,
                      string
                    >,
                    {
                      address,
                      chainId,
                      contractAddress,
                    },
                  )}
                />
              </Flex>
            </Flex>
          </Flex>
        )}
        <Flex flexDirection="column" gap={4}>
          <Flex flexDir="column" gap={2}>
            <Heading size="title.md">
              {isAccountFactory
                ? "Direct contract interaction (advanced)"
                : chainInfo
                  ? "Interact with this contract from your app"
                  : "Getting Started"}
            </Heading>
          </Flex>
          {(noSidebar || isMobile) && (
            <Flex flexDir="column" gap={2}>
              <Text>Choose a language:</Text>
              <CodeSegment
                environment={environment}
                onlyTabs
                setEnvironment={setEnvironment}
                snippet={COMMANDS.install}
              />
            </Flex>
          )}
          <Flex flexDir="column" gap={2}>
            {environment === "react-native" || environment === "unity" ? (
              <Text>
                Install the latest version of the SDK. <br />
                <UnderlineLink
                  className="text-primary-500"
                  href={`https://portal.thirdweb.com/${environment}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Learn how in the{" "}
                  {environment === "react-native" ? "React Native" : "Unity"}{" "}
                  documentation
                </UnderlineLink>
                .
              </Text>
            ) : (
              <>
                <Text>Install the latest version of the SDK:</Text>
                <CodeSegment
                  environment={environment}
                  hideTabs
                  isInstallCommand
                  setEnvironment={setEnvironment}
                  snippet={COMMANDS.install}
                />
              </>
            )}
          </Flex>
          <Flex flexDir="column" gap={2}>
            <Text>Initialize the SDK and contract on your project:</Text>
            <CodeSegment
              environment={environment}
              hideTabs
              setEnvironment={setEnvironment}
              snippet={formatSnippet(COMMANDS.setup, {
                chainId,
                contractAddress,
              })}
            />
            <Text>
              You will need to pass a client ID/secret key to use
              thirdweb&apos;s infrastructure services. If you don&apos;t have
              any API keys yet you can create one by creating a project for free
              from the{" "}
              <Link color="primary.500" href="/team">
                dashboard
              </Link>
              .
            </Text>
          </Flex>
        </Flex>
        {!onlyInstall && (
          <Flex flexDirection="column" gap={6}>
            <Heading size="title.md">All Functions & Events</Heading>
            <SimpleGrid columns={12} gap={3} height="100%">
              <GridItem
                as={Card}
                colSpan={{ base: 12, md: 4 }}
                height="100%"
                overflow="auto"
                overflowY="auto"
                pt={0}
                px={0}
              >
                <List height="100%" overflowX="hidden">
                  {((writeFunctions || []).length > 0 ||
                    (readFunctions || []).length > 0) && (
                    <Tabs
                      colorScheme="gray"
                      display="flex"
                      flexDir="column"
                      h="100%"
                      position="relative"
                    >
                      <TabList as={Flex}>
                        {(writeFunctions || []).length > 0 && (
                          <Tab flex="1 1 0" gap={2}>
                            <Heading color="inherit" my={1} size="label.md">
                              Write
                            </Heading>
                          </Tab>
                        )}
                        {(readFunctions || []).length > 0 && (
                          <Tab flex="1 1 0" gap={2}>
                            <Heading color="inherit" my={1} size="label.md">
                              Read
                            </Heading>
                          </Tab>
                        )}
                        {(events || []).length > 0 && (
                          <Tab flex="1 1 0" gap={2}>
                            <Heading color="inherit" my={1} size="label.md">
                              Events
                            </Heading>
                          </Tab>
                        )}
                      </TabList>
                      <TabPanels h="auto" overflow="auto">
                        <TabPanel>
                          {writeFunctions?.map((fn) => (
                            <ListItem key={fn.signature} my={0.5}>
                              <Button
                                _hover={{
                                  opacity: 1,
                                  textDecor: "underline",
                                }}
                                color="heading"
                                fontFamily="mono"
                                fontWeight={
                                  tab === "write" &&
                                  write?.signature === fn.signature
                                    ? 600
                                    : 400
                                }
                                onClick={() => {
                                  setTab("write");
                                  setWrite(fn);
                                }}
                                opacity={
                                  tab === "write" &&
                                  write?.signature === fn.signature
                                    ? 1
                                    : 0.65
                                }
                                size="sm"
                                variant="link"
                              >
                                {fn.name}
                              </Button>
                            </ListItem>
                          ))}
                        </TabPanel>
                        <TabPanel>
                          {readFunctions?.map((fn) => (
                            <ListItem key={fn.signature} my={0.5}>
                              <Button
                                _hover={{
                                  opacity: 1,
                                  textDecor: "underline",
                                }}
                                color="heading"
                                fontFamily="mono"
                                fontWeight={
                                  tab === "read" &&
                                  read?.signature === fn.signature
                                    ? 600
                                    : 400
                                }
                                onClick={() => {
                                  setTab("read");
                                  setRead(fn);
                                }}
                                opacity={
                                  tab === "read" &&
                                  read?.signature === fn.signature
                                    ? 1
                                    : 0.65
                                }
                                size="sm"
                                variant="link"
                              >
                                {fn.name}
                              </Button>
                            </ListItem>
                          ))}
                        </TabPanel>
                        <TabPanel>
                          {events?.map((ev) => (
                            <ListItem key={ev.name} my={0.5}>
                              <Button
                                _hover={{
                                  opacity: 1,
                                  textDecor: "underline",
                                }}
                                color="heading"
                                fontFamily="mono"
                                fontWeight={
                                  tab === "events" &&
                                  (event as AbiEvent).name ===
                                    (ev as AbiEvent).name
                                    ? 600
                                    : 400
                                }
                                onClick={() => {
                                  setTab("events");
                                  setEvent(ev);
                                }}
                                opacity={
                                  tab === "events" &&
                                  (event as AbiEvent).name ===
                                    (ev as AbiEvent).name
                                    ? 1
                                    : 0.65
                                }
                                size="sm"
                                variant="link"
                              >
                                {ev.name}
                              </Button>
                            </ListItem>
                          ))}
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  )}
                </List>
              </GridItem>
              <GridItem
                as={Card}
                colSpan={{ base: 12, md: 8 }}
                height="100%"
                overflow="auto"
              >
                <CodeSegment
                  environment={environment}
                  setEnvironment={setEnvironment}
                  snippet={formatSnippet(
                    // biome-ignore lint/suspicious/noExplicitAny: FIXME
                    COMMANDS[tab as keyof typeof COMMANDS] as any,
                    {
                      args:
                        abi
                          ?.filter(
                            (f) => f.type === "function" || f.type === "event",
                          )
                          ?.find(
                            (f) =>
                              f.name ===
                              (tab === "read"
                                ? read?.name
                                : tab === "write"
                                  ? write?.name
                                  : event?.name),
                          )
                          ?.inputs.map((i) => i.name || "") || [],

                      chainId,
                      contractAddress,
                      extensionNamespace,
                      fn:
                        tab === "read" ? read : tab === "write" ? write : event,
                    },
                  )}
                />
              </GridItem>
            </SimpleGrid>
          </Flex>
        )}
      </GridItem>
    </SimpleGrid>
  );
};
