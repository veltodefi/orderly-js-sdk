import { useCallback, useState } from "react";
import { useEventEmitter } from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import { toast } from "@veltodefi/ui";
import {
  DepositActionType,
  detectUserRejection,
  useTransferAnalytics,
} from "../../../analytics";
import { getDepositKnownErrorMessage } from "../../../utils";

type Options = {
  quantity: string;
  approve: (quantity?: string) => Promise<any>;
  deposit: () => Promise<any>;
  onSuccess?: () => void;
  swapDeposit?: () => Promise<any>;
  needSwap?: boolean;
  onError?: (err: unknown, knownMessage?: string) => void;
  /** Optional analytics context — when provided, emit-sites stamp these onto events. */
  analyticsContext?: { chain_id?: number; symbol?: string };
};

const toErrorCode = (err: unknown): string | null => {
  if (!err || typeof err !== "object") return null;
  const code = (err as { code?: unknown }).code;
  return typeof code === "string" || typeof code === "number"
    ? String(code)
    : null;
};

const toErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown error";
};

export function useDepositAction(options: Options) {
  const {
    quantity,
    approve,
    deposit,
    swapDeposit,
    onSuccess,
    needSwap,
    analyticsContext,
  } = options;
  const [isMutating, setIsMutating] = useState(false);
  const [depositError, setDepositError] = useState("");

  const ee = useEventEmitter();
  const { t } = useTranslation();
  const { emit } = useTransferAnalytics();

  const buildBase = (action_type: DepositActionType) => ({
    form: "deposit" as const,
    action_type,
    chain_id: analyticsContext?.chain_id,
    symbol: analyticsContext?.symbol,
    amount: quantity,
    needs_swap: !!needSwap,
  });

  const emitFailed = (action_type: DepositActionType, err: unknown) => {
    emit({
      form: "deposit",
      name: "action_failed",
      action_type,
      chain_id: analyticsContext?.chain_id,
      error_code: toErrorCode(err),
      error_message: toErrorMessage(err),
      is_user_rejection: detectUserRejection(err),
    });
  };

  const doDeposit = useCallback(async () => {
    try {
      await deposit();
      setDepositError("");
    } catch (err: any) {
      console.error("orderly deposit error", err);
      const knownErrorMessage = getDepositKnownErrorMessage(err.message);
      options.onError?.(err, knownErrorMessage);
      if (knownErrorMessage) {
        setDepositError(knownErrorMessage);
        toast.error(
          <div>
            {t("common.somethingWentWrong")}
            <br />
            <div className="orderly-text-white/[0.54] orderly-text-xs">
              {t("common.details")}: {knownErrorMessage}
            </div>
          </div>,
        );
      } else {
        toast.error(err.message || t("common.somethingWentWrong"));
      }
      throw err;
    }
  }, [deposit, onSuccess, t, ee]);

  const onDeposit = useCallback(async () => {
    const base = buildBase("deposit");
    emit({ ...base, name: "action_clicked" });

    const num = Number(quantity);

    if (isNaN(num) || num <= 0) {
      toast.error(t("transfer.quantity.invalid"));
      return;
    }

    if (isMutating) return;

    emit({ ...base, name: "action_submitted" });
    setIsMutating(true);

    try {
      if (needSwap) {
        await swapDeposit?.();
      } else {
        await doDeposit();
      }
      toast.success(t("transfer.deposit.requested"));
      ee.emit("deposit:requested");
      onSuccess?.();
    } catch (err: any) {
      emitFailed("deposit", err);
      // all error toasts handled by doDeposit or swapDeposit
    } finally {
      setIsMutating(false);
    }
  }, [quantity, isMutating, needSwap, doDeposit, swapDeposit, t]);

  const onApprove = useCallback(async () => {
    const base = buildBase("approve");
    emit({ ...base, name: "action_clicked" });
    if (isMutating) return;
    emit({ ...base, name: "action_submitted" });
    setIsMutating(true);

    try {
      await approve(quantity);
      toast.success(t("transfer.deposit.approve.success"));
    } catch (err: any) {
      console.error("approve error", err);
      emitFailed("approve", err);
      toast.error(
        err.message || err?.errorCode || t("transfer.deposit.approve.failed"),
      );
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, [approve, isMutating, quantity, t]);

  const onApproveAndDeposit = useCallback(async () => {
    const base = buildBase("approve_and_deposit");
    emit({ ...base, name: "action_clicked" });
    if (isMutating) return;
    emit({ ...base, name: "action_submitted" });
    setIsMutating(true);

    try {
      // Inner calls re-emit at their own action_type — that's intentional so
      // funnels can distinguish "approve step failed" vs "deposit step failed"
      // within a single approve_and_deposit flow.
      await onApprove();
      await onDeposit();
    } catch (err) {
      console.error("approve and deposit error", err);
      emitFailed("approve_and_deposit", err);
    } finally {
      setIsMutating(false);
    }
  }, [isMutating, onApprove, onDeposit]);

  return {
    isMutating,
    depositError,
    setDepositError,
    onApprove,
    onDeposit,
    onApproveAndDeposit,
  };
}
