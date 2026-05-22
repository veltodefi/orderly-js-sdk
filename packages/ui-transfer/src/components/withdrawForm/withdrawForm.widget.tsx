import { FC } from "react";
import {
  useWithdrawFormScript,
  WithdrawFormScriptOptions,
} from "./withdrawForm.script";
import { WithdrawForm } from "./withdrawForm.ui";

export type WithdrawFormWidgetProps = WithdrawFormScriptOptions & {
  /**
   * Called when the user clicks the "Audited protocol" link rendered near the
   * gas fee row. The link is only shown when this prop is provided — leave it
   * undefined to hide the link entirely. The host app owns what opens
   * (e.g. a Security & Transparency dialog in the webapp).
   */
  onAuditLinkClick?: () => void;
  /**
   * Optional node rendered inside the form's scroll container, above the
   * fields. The dialog wrapper passes its onboarding header (title +
   * subtitle) here so it scrolls with the rest of the form on short
   * viewports.
   */
  header?: React.ReactNode;
};

export const WithdrawFormWidget: FC<WithdrawFormWidgetProps> = (props) => {
  const state = useWithdrawFormScript(props);
  return (
    <WithdrawForm
      {...state}
      onAuditLinkClick={props.onAuditLinkClick}
      header={props.header}
    />
  );
};
