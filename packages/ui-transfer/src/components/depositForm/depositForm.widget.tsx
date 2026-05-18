import { FC } from "react";
import {
  useDepositFormScript,
  DepositFormScriptOptions,
} from "./depositForm.script";
import { DepositForm } from "./depositForm.ui";

export type DepositFormWidgetProps = DepositFormScriptOptions & {
  /**
   * Called when the user clicks the "Audited protocol" link rendered near the
   * gas fee row. The link is only shown when this prop is provided — leave it
   * undefined to hide the link entirely. The host app owns what opens
   * (e.g. a Security & Transparency dialog in the webapp).
   */
  onAuditLinkClick?: () => void;
};

export const DepositFormWidget: FC<DepositFormWidgetProps> = (props) => {
  const state = useDepositFormScript(props);
  return <DepositForm {...state} onAuditLinkClick={props.onAuditLinkClick} />;
};
