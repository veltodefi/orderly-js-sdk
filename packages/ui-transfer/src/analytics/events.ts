/**
 * Analytics event contract for the deposit/withdraw dialog.
 *
 * The SDK invokes `onAnalyticsEvent(event)` with one of these shapes whenever
 * the user interacts with the dialog. The webapp maps each event to its
 * tracking pipeline (mixpanel/clarity/etc.). The SDK itself imports no
 * tracker so the contract stays portable across hosts.
 */
export type TransferActiveTab = "deposit" | "withdraw";
export type TransferSurface = "dialog" | "sheet";

export type TransferDialogTrigger =
  | "onboarding"
  | "quick_start_guide"
  | "asset_menu"
  | "order_form"
  | "deep_link"
  | "manual";

export type DepositSubtab = "web3" | "exclusive_deposit";
export type WithdrawSubtab = "wallet" | "account";

export type DepositActionType = "deposit" | "approve" | "approve_and_deposit";

export type WithdrawWarningType =
  | "bridgeless"
  | "cross_chain"
  | "qty_gt_max"
  | "generic";

export type TransferDialogCloseReason =
  | "x_button"
  | "backdrop"
  | "skip_for_now"
  | "action_submitted"
  | "unknown";

export type QuickfillPercentage = 10 | 25 | 50 | 100;

export type TransferAnalyticsEnvelope = {
  surface: TransferSurface;
  is_onboarding: boolean;
  active_tab: TransferActiveTab;
};

type DialogEvent =
  | { form?: undefined; name: "opened"; trigger: TransferDialogTrigger }
  | {
      form?: undefined;
      name: "closed";
      dwell_ms: number;
      last_active_tab: TransferActiveTab;
      reason: TransferDialogCloseReason;
    }
  | {
      form?: undefined;
      name: "tab_changed";
      from_tab: TransferActiveTab;
      to_tab: TransferActiveTab;
    }
  | { form?: undefined; name: "info_clicked" }
  | {
      form?: undefined;
      name: "audit_link_clicked";
      from_form: TransferActiveTab;
    }
  | { form?: undefined; name: "skip_clicked" };

type DepositFormEvent =
  | {
      form: "deposit";
      name: "subtab_changed";
      from_subtab: DepositSubtab;
      to_subtab: DepositSubtab;
    }
  | {
      form: "deposit";
      name: "chain_changed";
      from_chain_id?: number;
      to_chain_id: number;
      wrong_network: boolean;
    }
  | {
      form: "deposit";
      name: "source_token_changed";
      from_symbol?: string;
      to_symbol: string;
    }
  | {
      form: "deposit";
      name: "quickfill_clicked";
      percentage: QuickfillPercentage;
      resulting_amount: string;
      max_amount: string;
    }
  | {
      form: "deposit";
      name: "slippage_changed";
      value: number;
      validate_status?: string;
    }
  | {
      form: "deposit";
      name: "quantity_entered";
      amount: string;
      symbol?: string;
    }
  | {
      form: "deposit";
      name: "action_clicked";
      action_type: DepositActionType;
      chain_id?: number;
      symbol?: string;
      amount: string;
      needs_swap: boolean;
    }
  | {
      form: "deposit";
      name: "action_submitted";
      action_type: DepositActionType;
      chain_id?: number;
      symbol?: string;
      amount: string;
      needs_swap: boolean;
    }
  | {
      form: "deposit";
      name: "action_failed";
      action_type: DepositActionType;
      error_code: string | null;
      error_message: string;
      chain_id?: number;
      is_user_rejection: boolean;
    }
  | {
      form: "deposit";
      name: "error_surfaced";
      field: "quantity" | "target_quantity" | "slippage" | "global";
      message?: string;
      status: "error" | "warning";
    };

type WithdrawFormEvent =
  | {
      form: "withdraw";
      name: "subtab_changed";
      from: WithdrawSubtab;
      to: WithdrawSubtab;
    }
  | {
      form: "withdraw";
      name: "wallet_selected";
      selection_type: "connected" | "external";
      is_new_wallet: boolean;
    }
  | { form: "withdraw"; name: "add_wallet_opened" }
  | {
      form: "withdraw";
      name: "add_wallet_submitted";
      network: "EVM" | "SOL" | null;
    }
  | {
      form: "withdraw";
      name: "chain_changed";
      from_chain_id?: number;
      to_chain_id: number;
      wrong_network: boolean;
    }
  | {
      form: "withdraw";
      name: "source_token_changed";
      from_symbol?: string;
      to_symbol: string;
    }
  | {
      form: "withdraw";
      name: "quickfill_clicked";
      percentage: QuickfillPercentage;
      resulting_amount: string;
      max_amount: string;
    }
  | {
      form: "withdraw";
      name: "quantity_entered";
      amount: string;
      symbol?: string;
    }
  | {
      form: "withdraw";
      name: "settle_pnl_clicked";
      unsettled_pnl: number;
    }
  | { form: "withdraw"; name: "switch_network_clicked" }
  | {
      form: "withdraw";
      name: "account_id_entered";
      lookup_succeeded: boolean;
    }
  | {
      form: "withdraw";
      name: "action_clicked";
      withdraw_to: WithdrawSubtab;
      is_cross_chain: boolean;
      chain_id?: number;
      symbol?: string;
      amount: string;
      fee: number;
    }
  | {
      form: "withdraw";
      name: "action_submitted";
      withdraw_to: WithdrawSubtab;
      is_cross_chain: boolean;
      chain_id?: number;
      symbol?: string;
      amount: string;
      fee: number;
    }
  | {
      form: "withdraw";
      name: "action_failed";
      withdraw_to: WithdrawSubtab;
      is_cross_chain: boolean;
      error_code: string | null;
      error_message: string;
      is_user_rejection: boolean;
    }
  | {
      form: "withdraw";
      name: "error_surfaced";
      field: "quantity" | "global";
      message?: string;
      status: "error" | "warning";
    }
  | {
      form: "withdraw";
      name: "warning_shown";
      warning_type: WithdrawWarningType;
    };

export type TransferAnalyticsPayload =
  | DialogEvent
  | DepositFormEvent
  | WithdrawFormEvent;

export type TransferAnalyticsEvent = TransferAnalyticsEnvelope &
  TransferAnalyticsPayload;

/**
 * Best-effort detection of "user rejected the wallet prompt" failures.
 * Web3 wallets use code 4001 (EIP-1193) or include the substring in `message`.
 */
export const detectUserRejection = (err: unknown): boolean => {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: number | string; message?: string };
  if (e.code === 4001 || e.code === "4001" || e.code === "ACTION_REJECTED") {
    return true;
  }
  return (
    typeof e.message === "string" && /user (rejected|denied)/i.test(e.message)
  );
};

/**
 * Mirrors the conditional ladder in `WithdrawWarningMessage.renderContent()`
 * so the analytics emit site can classify which warning the user sees.
 * Returns null when no warning is being rendered.
 */
export const deriveWithdrawWarningType = (input: {
  isConnected: boolean;
  crossChainTrans: boolean;
  qtyGreaterThanMaxAmount: boolean;
  checkIsBridgeless: boolean;
  message?: string;
}): WithdrawWarningType | null => {
  if (!input.isConnected) return null;
  if (input.crossChainTrans) return "cross_chain";
  if (input.qtyGreaterThanMaxAmount) return "qty_gt_max";
  if (input.message) {
    return input.checkIsBridgeless ? "generic" : "bridgeless";
  }
  return null;
};

const PERCENTAGE_MAP: Record<string, QuickfillPercentage> = {
  "0.1": 10,
  "0.25": 25,
  "0.5": 50,
  "1": 100,
};

export const normalizeQuickfillPercentage = (
  raw: number,
): QuickfillPercentage => PERCENTAGE_MAP[String(raw)] ?? 100;
