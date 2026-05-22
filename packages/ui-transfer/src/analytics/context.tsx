import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";
import type {
  TransferActiveTab,
  TransferAnalyticsEnvelope,
  TransferAnalyticsEvent,
  TransferAnalyticsPayload,
  TransferSurface,
} from "./events";

type EmitFn = (payload: TransferAnalyticsPayload) => void;

type ContextValue = {
  emit: EmitFn;
  envelope: TransferAnalyticsEnvelope;
};

const noopEmit: EmitFn = () => {};

const TransferAnalyticsContext = createContext<ContextValue>({
  emit: noopEmit,
  envelope: { surface: "dialog", is_onboarding: false, active_tab: "deposit" },
});

type ProviderProps = {
  onEvent?: (event: TransferAnalyticsEvent) => void;
  surface: TransferSurface;
  isOnboarding: boolean;
  activeTab: TransferActiveTab;
  children: ReactNode;
};

export const TransferAnalyticsProvider = ({
  onEvent,
  surface,
  isOnboarding,
  activeTab,
  children,
}: ProviderProps) => {
  const envelope = useMemo<TransferAnalyticsEnvelope>(
    () => ({ surface, is_onboarding: isOnboarding, active_tab: activeTab }),
    [surface, isOnboarding, activeTab],
  );

  const emit = useCallback<EmitFn>(
    (payload) => {
      if (!onEvent) return;
      onEvent({ ...envelope, ...payload } as TransferAnalyticsEvent);
    },
    [onEvent, envelope],
  );

  const value = useMemo(() => ({ emit, envelope }), [emit, envelope]);

  return (
    <TransferAnalyticsContext.Provider value={value}>
      {children}
    </TransferAnalyticsContext.Provider>
  );
};

/** Hook used by deposit/withdraw form internals. Safe outside a provider — returns no-op. */
export const useTransferAnalytics = () => useContext(TransferAnalyticsContext);
