import type { RestrictedInfoOptions } from "@veltodefi/hooks";
import type { AppLogos } from "@veltodefi/react-app";
import { OrderlyTextIcon } from "../components/icons/orderlyText";

export type OrderlyAppProviderConfigProps = {
  appIcons: AppLogos;
  restrictedInfo: RestrictedInfoOptions;
};

export const orderlyAppProviderConfig: OrderlyAppProviderConfigProps = {
  appIcons: {
    main: {
      component: (
        <OrderlyTextIcon className="oui-w-[100px] oui-h-10 oui-fill-base-contrast" />
      ),
    },
    secondary: {
      img: "/logo-secondary.webp",
    },
  },
  restrictedInfo: {
    enableDefault: true,
    customRestrictedIps: [],
    customRestrictedRegions: [],
    customUnblockRegions: ["United States"],
    // content: ({ ip, brokerName }) =>
    //   `You are accessing ${brokerName} from an IP address (${ip}) associated with a restricted country. Please refer to our Terms of Use</0>. If you believe this is an error, contact x@orerly.network.`,
  },
};
