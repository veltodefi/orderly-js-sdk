/**
 * Local fallback declaration for plugin-core target map.
 * This keeps ui-order-entry DTS generation stable in monorepo dev mode
 * when plugin-core dist types are not built yet.
 */
declare module "@veltodefi/plugin-core" {
  interface InterceptorTargetPropsMap {}
}
