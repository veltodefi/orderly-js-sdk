declare global {
  interface Window {
    __ORDERLY_VERSION__?: {
      [key: string]: string;
    };
  }
}
if (typeof window !== "undefined") {
  window.__ORDERLY_VERSION__ = window.__ORDERLY_VERSION__ || {};
  window.__ORDERLY_VERSION__["@veltodefi/ui-connector"] = "2.9.0-velto-main.13";
}

export default "2.9.0-velto-main.13";
