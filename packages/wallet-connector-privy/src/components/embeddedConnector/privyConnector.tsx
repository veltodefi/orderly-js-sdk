import React from "react";
import { PrivyClientConfig } from "@privy-io/react-auth";
import { useTranslation } from "@veltodefi/i18n";
import { Flex, EmailIcon } from "@veltodefi/ui";
import { useWalletConnectorPrivy } from "../../provider";

const LoginMethods = ({
  connect,
  loginMethods,
}: {
  connect: (type: any) => void;
  loginMethods?: PrivyClientConfig["loginMethods"];
}) => {
  const { t } = useTranslation();
  const arr = [];

  if (loginMethods?.includes("email")) {
    arr.push(
      <div
        className={
          "oui-flex oui-items-center oui-justify-center oui-cursor-pointer oui-gap-3 oui-rounded-[6px] oui-p-3 oui-bg-base-5 oui-col-span-2 @lg:oui-col-span-1 oui-w-full hover:oui-bg-[#575757] active:oui-bg-base-6"
        }
        onClick={() => connect("email")}
      >
        <EmailIcon
          size={32}
          opacity={1}
          color="primary"
          className="oui-filter-none oui-opacity-100"
        />
        <div className="oui-text-sm oui-text-base-contrast">
          {t("connector.privy.email")}
        </div>
      </div>,
    );
  }

  if (loginMethods?.includes("google")) {
    arr.push(
      <div
        className={
          "oui-flex oui-items-center oui-justify-center oui-cursor-pointer oui-gap-3 oui-rounded-[6px] oui-p-3 oui-bg-base-5 hover:oui-bg-[#575757] active:oui-bg-base-6"
        }
        onClick={() => connect("google")}
      >
        <img
          src="https://oss.orderly.network/static/sdk/privy/google.svg"
          className="oui-size-[32px]"
        />
        <div className="oui-text-sm oui-text-base-contrast ">
          {t("connector.privy.google")}
        </div>
      </div>,
    );
  }
  if (loginMethods?.includes("twitter")) {
    arr.push(
      <div
        className={
          "oui-flex oui-items-center oui-justify-center oui-cursor-pointer oui-gap-3 oui-rounded-[6px] oui-p-3 oui-bg-base-5 hover:oui-bg-[#575757] active:oui-bg-base-6"
        }
        onClick={() => connect("twitter")}
      >
        <img
          src="https://oss.orderly.network/static/sdk/privy/twitter.svg"
          className="oui-size-[32px]"
        />
        <div className="oui-text-sm oui-text-base-contrast ">
          {t("connector.privy.twitter")}
        </div>
      </div>,
    );
  }

  if (loginMethods?.includes("telegram")) {
    arr.push(
      <div
        className={
          "oui-flex oui-items-center oui-justify-center oui-cursor-pointer oui-gap-3 oui-rounded-[6px] oui-p-3 oui-bg-base-5 hover:oui-bg-[#575757] active:oui-bg-base-6"
        }
        onClick={() => connect("telegram")}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.652 8.12916L15.0683 4.04929C15.6468 3.87358 16.1499 4.16929 15.9587 4.91069L13.8458 13.3962C13.6898 13.9961 13.2672 14.1461 12.6836 13.859L9.46384 11.8362L7.90929 13.109C7.73824 13.2547 7.59234 13.379 7.2603 13.379L7.4867 10.5891L13.4584 5.99923C13.72 5.80638 13.398 5.69495 13.0559 5.8878L5.68061 9.8434L2.50107 8.99914C1.81687 8.81058 1.80178 8.41201 2.652 8.12916Z"
            fill="white"
          />
        </svg>
        <div className="oui-text-sm oui-text-base-contrast ">
          {t("connector.privy.telegram")}
        </div>
      </div>,
    );
  }

  return <>{arr}</>;
};

export function PrivyConnectArea({
  connect,
}: {
  connect: (type: any) => void;
}) {
  const { privyConfig } = useWalletConnectorPrivy();
  const loginMethods = privyConfig.loginMethods;

  return (
    <Flex direction="column">
      <div className="oui-w-full @container">
        <div className="oui-w-full oui-grid oui-grid-cols-2 @lg:oui-grid-cols-3 oui-grid-rows-2 @lg:oui-grid-rows-1 oui-gap-4">
          <LoginMethods connect={connect} loginMethods={loginMethods} />
        </div>
      </div>
    </Flex>
  );
}
