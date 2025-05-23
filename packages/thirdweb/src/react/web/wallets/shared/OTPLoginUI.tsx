"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Chain } from "../../../../chains/types.js";
import type { ThirdwebClient } from "../../../../client/client.js";
import { webLocalStorage } from "../../../../utils/storage/webStorage.js";
import { isEcosystemWallet } from "../../../../wallets/ecosystem/is-ecosystem-wallet.js";
import {
  linkProfile,
  preAuthenticate,
} from "../../../../wallets/in-app/web/lib/auth/index.js";
import type { Wallet } from "../../../../wallets/interfaces/wallet.js";
import { useCustomTheme } from "../../../core/design-system/CustomThemeProvider.js";
import { fontSize } from "../../../core/design-system/index.js";
import { setLastAuthProvider } from "../../../core/utils/storage.js";
import { FadeIn } from "../../ui/components/FadeIn.js";
import { OTPInput } from "../../ui/components/OTPInput.js";
import { Spacer } from "../../ui/components/Spacer.js";
import { Spinner } from "../../ui/components/Spinner.js";
import { Container, Line, ModalHeader } from "../../ui/components/basic.js";
import { Button } from "../../ui/components/buttons.js";
import { Text } from "../../ui/components/text.js";
import { StyledButton } from "../../ui/design-system/elements.js";
import type { InAppWalletLocale } from "./locale/types.js";

type VerificationStatus =
  | "verifying"
  | "invalid"
  | "linking_error"
  | "valid"
  | "idle"
  | "payment_required";
type AccountStatus = "sending" | "sent" | "error";
type ScreenToShow = "base" | "enter-password-or-recovery-code";

/**
 * @internal
 */
export function OTPLoginUI(props: {
  userInfo: { email: string } | { phone: string };
  wallet: Wallet;
  locale: InAppWalletLocale;
  done: () => void;
  goBack?: () => void;
  client: ThirdwebClient;
  chain: Chain | undefined;
  size: "compact" | "wide";
  isLinking?: boolean;
}) {
  const { wallet, done, goBack, userInfo } = props;
  const isWideModal = props.size === "wide";
  const locale = props.locale;
  const [otpInput, setOtpInput] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<VerificationStatus>("idle");
  const [error, setError] = useState<string | undefined>();
  const [accountStatus, setAccountStatus] = useState<AccountStatus>("sending");
  const [countdown, setCountdown] = useState(0);
  const ecosystem = isEcosystemWallet(wallet)
    ? {
        id: wallet.id,
        partnerId: wallet.getConfig()?.partnerId,
      }
    : undefined;

  const [screen] = useState<ScreenToShow>("base");

  const sendEmailOrSms = useCallback(async () => {
    setOtpInput("");
    setVerifyStatus("idle");
    setAccountStatus("sending");

    try {
      if ("email" in userInfo) {
        await preAuthenticate({
          ecosystem,
          email: userInfo.email,
          strategy: "email",
          client: props.client,
        });
        setAccountStatus("sent");
        setCountdown(60); // Start 60-second countdown
      } else if ("phone" in userInfo) {
        await preAuthenticate({
          ecosystem,
          phoneNumber: userInfo.phone,
          strategy: "phone",
          client: props.client,
        });
        setAccountStatus("sent");
        setCountdown(60); // Start 60-second countdown
      } else {
        throw new Error("Invalid userInfo");
      }
    } catch (e) {
      console.error(e);
      setVerifyStatus("idle");
      setAccountStatus("error");
    }
  }, [props.client, userInfo, ecosystem]);

  async function connect(otp: string) {
    if ("email" in userInfo) {
      await wallet.connect({
        chain: props.chain,
        strategy: "email",
        email: userInfo.email,
        verificationCode: otp,
        client: props.client,
      });
      await setLastAuthProvider("email", webLocalStorage);
    } else if ("phone" in userInfo) {
      await wallet.connect({
        chain: props.chain,
        strategy: "phone",
        phoneNumber: userInfo.phone,
        verificationCode: otp,
        client: props.client,
      });
      await setLastAuthProvider("phone", webLocalStorage);
    } else {
      throw new Error("Invalid userInfo");
    }
  }

  async function link(otp: string) {
    if ("email" in userInfo) {
      await linkProfile({
        client: props.client,
        strategy: "email",
        email: userInfo.email,
        verificationCode: otp,
        ecosystem,
      });
    } else if ("phone" in userInfo) {
      await linkProfile({
        client: props.client,
        strategy: "phone",
        phoneNumber: userInfo.phone,
        verificationCode: otp,
        ecosystem,
      });
    }
  }

  const verify = async (otp: string) => {
    if (otp.length !== 6) {
      return;
    }
    setVerifyStatus("verifying");

    try {
      // verifies otp for UI feedback
      if (props.isLinking) {
        await link(otp);
      } else {
        await connect(otp);
      }
      done();

      setVerifyStatus("valid");
    } catch (e) {
      // TODO: More robust error handling
      if (
        e instanceof Error &&
        e?.message?.includes("PAYMENT_METHOD_REQUIRED")
      ) {
        setVerifyStatus("payment_required");
      } else if (
        e instanceof Error &&
        (e.message.toLowerCase().includes("link") ||
          e.message.toLowerCase().includes("profile"))
      ) {
        setVerifyStatus("linking_error");
        setError(e.message);
      } else {
        setVerifyStatus("invalid");
      }
      console.error("Authentication Error", e);
    }
  };

  // send email on mount
  const emailSentOnMount = useRef(false);
  useEffect(() => {
    if (!emailSentOnMount.current) {
      emailSentOnMount.current = true;
      sendEmailOrSms();
    }
  }, [sendEmailOrSms]);

  // Handle countdown timer
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  if (screen === "base") {
    return (
      <Container fullHeight flex="column" animate="fadein">
        <Container p="lg">
          <ModalHeader title={locale.signIn} onBack={goBack} />
        </Container>

        <Container expand flex="column" center="y">
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <Container flex="column" center="x" px="lg">
              {!isWideModal && <Spacer y="xl" />}
              <Text>{locale.emailLoginScreen.enterCodeSendTo}</Text>
              <Spacer y="sm" />
              <Text color="primaryText">
                {"email" in userInfo ? userInfo.email : userInfo.phone}
              </Text>
              <Spacer y="xl" />
            </Container>

            <OTPInput
              isInvalid={verifyStatus === "invalid"}
              digits={6}
              value={otpInput}
              setValue={(value) => {
                setOtpInput(value);
                setVerifyStatus("idle"); // reset error
              }}
              onEnter={() => {
                verify(otpInput);
              }}
            />

            {verifyStatus === "invalid" && (
              <FadeIn>
                <Spacer y="md" />
                <Text size="sm" color="danger" center>
                  {locale.emailLoginScreen.invalidCode}
                </Text>
              </FadeIn>
            )}

            {verifyStatus === "linking_error" && (
              <FadeIn>
                <Spacer y="md" />
                <Text size="sm" color="danger" center>
                  {error || "Failed to verify code"}
                </Text>
              </FadeIn>
            )}

            {verifyStatus === "payment_required" && (
              <FadeIn>
                <Spacer y="md" />
                <Text size="sm" color="danger" center>
                  {locale.maxAccountsExceeded}
                </Text>
              </FadeIn>
            )}

            <Spacer y="xl" />

            <Container px={isWideModal ? "xxl" : "lg"}>
              {verifyStatus === "verifying" ? (
                <>
                  <Container flex="row" center="x" animate="fadein">
                    <Spinner size="lg" color="accentText" />
                  </Container>
                </>
              ) : (
                <Container animate="fadein" key="btn-container">
                  <Button
                    onClick={() => verify(otpInput)}
                    variant="accent"
                    type="submit"
                    style={{
                      width: "100%",
                    }}
                  >
                    {locale.emailLoginScreen.verify}
                  </Button>
                </Container>
              )}
            </Container>

            <Spacer y="xl" />

            {!isWideModal && <Line />}

            <Container p={isWideModal ? undefined : "lg"} gap="xs">
              {accountStatus === "error" && (
                <Text size="sm" center color="danger">
                  {locale.emailLoginScreen.failedToSendCode}
                </Text>
              )}

              {accountStatus === "sending" && (
                <Container
                  flex="row"
                  center="both"
                  gap="xs"
                  style={{
                    textAlign: "center",
                  }}
                >
                  <Text size="sm">{locale.emailLoginScreen.sendingCode}</Text>
                  <Spinner size="xs" color="secondaryText" />
                </Container>
              )}

              {accountStatus !== "sending" && (
                <LinkButton
                  onClick={countdown === 0 ? sendEmailOrSms : undefined}
                  type="button"
                  style={{
                    opacity: countdown > 0 ? 0.5 : 1,
                    cursor: countdown > 0 ? "default" : "pointer",
                  }}
                >
                  {countdown > 0
                    ? `Resend code in ${countdown} seconds`
                    : locale.emailLoginScreen.resendCode}
                </LinkButton>
              )}
            </Container>
          </form>
        </Container>
      </Container>
    );
  }

  return null;
}

const LinkButton = /* @__PURE__ */ StyledButton((_) => {
  const theme = useCustomTheme();
  return {
    all: "unset",
    color: theme.colors.accentText,
    fontSize: fontSize.sm,
    cursor: "pointer",
    textAlign: "center",
    fontWeight: 500,
    width: "100%",
    "&:hover": {
      color: theme.colors.primaryText,
    },
  };
});
