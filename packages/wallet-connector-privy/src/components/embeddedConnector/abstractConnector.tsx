import React from "react";
import { cn } from "@veltodefi/ui";
import { PrivyConnectorImagePath } from "../../util";

export function AbstractConnectArea({ connect }: { connect: () => void }) {
  return (
    <div
      className={
        "oui-flex oui-items-center oui-cursor-pointer oui-gap-3 oui-rounded-[6px] oui-p-3 oui-bg-base-5 oui-w-full"
      }
      onClick={() => connect()}
    >
      <div className="oui-flex oui-size-[32px] oui-items-center oui-justify-center">
        <img
          className={cn("oui-size-[24px]")}
          src={`${PrivyConnectorImagePath}/abstract.png`}
          alt="abstract wallet"
        />
      </div>
      <div className="oui-text-sm oui-text-base-contrast">
        Authenticate with Privy
      </div>
    </div>
  );
}
