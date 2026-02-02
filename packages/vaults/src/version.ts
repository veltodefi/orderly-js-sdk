declare global {
  interface Window {
    __ORDERLY_VERSION__?: {
      [key: string]: string;
    };
  }
}
if (typeof window !== "undefined") {
  window.__ORDERLY_VERSION__ = window.__ORDERLY_VERSION__ || {};
  window.__ORDERLY_VERSION__["@veltodefi/vaults"] = "2.8.13-velto-dev.3";
}

export default "2.8.13-velto-dev.3";
