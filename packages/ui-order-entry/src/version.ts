declare global {
  interface Window {
    __ORDERLY_VERSION__?: {
      [key: string]: string;
    };
  }
}
if (typeof window !== "undefined") {
  window.__ORDERLY_VERSION__ = window.__ORDERLY_VERSION__ || {};
  window.__ORDERLY_VERSION__["@veltodefi/ui-order-entry"] =
    "2.8.10-velto-dev.20";
}

export default "2.8.10-velto-dev.20";
