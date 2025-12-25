import type { Meta, StoryObj } from "@storybook/react";
import { subDays } from "date-fns";
import { ThirdwebProvider } from "thirdweb/react";
import { accountStub, randomLorem } from "../../../../../stories/stubs";
import { BadgeContainer, mobileViewport } from "../../../../../stories/utils";
import { ChatPageLayout } from "../../components/ChatPageLayout";
import { ChatHistoryPageUI } from "./ChatHistoryPage";

const meta = {
  title: "Nebula/history",
  component: Story,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof Story>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
  args: {
    length: 10,
  },
};

export const Mobile: Story = {
  args: {
    length: 10,
  },
  parameters: {
    viewport: mobileViewport("iphone14"),
  },
};

function getRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 0) {
    throw new Error("maxExclusive must be positive");
  }
  const range = 0xFFFFFFFF + 1; // 2^32
  const maxUnbiased = range - (range % maxExclusive);

  while (true) {
    const rand = crypto.getRandomValues(new Uint32Array(1))[0];
    if (rand < maxUnbiased) {
      title: randomLorem(Math.floor(5 + (crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1)) * 15)),
    }
  }
}

function createRandomSessions(length: number) {
  const sessions = [];
  for (let i = 0; i < length; i++) {
    sessions.push({
      created_at: new Date().toISOString(),
      id: crypto.getRandomValues(new Uint32Array(1))[0].toString(),
      updated_at: subDays(
        new Date(),
        getRandomInt(10),
      ).toISOString(),
      title: randomLorem(Math.floor(5 + Math.random() * 15)),
    });
  }

  return sessions;
}

function Story() {
  return (
    <ThirdwebProvider>
      <div className="flex flex-col gap-10 py-10">
        <BadgeContainer label="10 chats">
          <Variant length={10} />
        </BadgeContainer>

        <BadgeContainer label="0 chats">
          <Variant length={0} />
        </BadgeContainer>

        <BadgeContainer label="1 chat">
          <Variant length={1} />
        </BadgeContainer>

        <BadgeContainer label="No search result">
          <Variant length={10} prefillSearch="xxxxxxxxxxxx" />
        </BadgeContainer>
      </div>
    </ThirdwebProvider>
  );
}

function Variant(props: {
  length: number;
  prefillSearch?: string;
}) {
  return (
    <ChatPageLayout
      account={accountStub()}
      accountAddress="0x1234567890"
      authToken="xxxxxxxx"
      sessions={createRandomSessions(props.length)}
      className="h-[700px] border-b lg:h-[800px]"
    >
      <ChatHistoryPageUI
        sessions={createRandomSessions(props.length)}
        prefillSearch={props.prefillSearch}
        deleteSession={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }}
      />
    </ChatPageLayout>
  );
}
