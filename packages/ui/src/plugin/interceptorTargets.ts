/**
 * Module augmentation: maps interceptor target paths to their component props types.
 * Import this file (or import from @veltodefi/ui) to enable typed props in
 * createInterceptor('Deposit.DepositForm', (Original, props, api) => ...).
 */
import type { EmptyDataStateProps } from "../table/emptyDataState";
import type { DepositFormProps } from "./plugins/deposit";

declare module "@veltodefi/plugin-core" {
  interface InterceptorTargetPropsMap {
    "Deposit.DepositForm": DepositFormProps;
    "Table.EmptyDataIdentifier": EmptyDataStateProps;
  }
}
