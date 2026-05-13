import { type MessageFactor, type SignedMessagePayload } from "@veltodefi/core";
import { mutate } from "@veltodefi/net";
import { getTimestamp } from "@veltodefi/utils";
import useSWRMutation, { type SWRMutationConfiguration } from "swr/mutation";
import { useMemoizedFn } from ".";
import { useAccountInstance } from "./useAccountInstance";
import { useConfig } from "./useConfig";
import { useWithdrawOnlyMode } from "./veltoWithdrawOnlyModeContext";

type HTTP_METHOD = "POST" | "PUT" | "DELETE" | "GET";

const fetcher = (
  url: string,
  options: {
    arg: {
      data?: any;
      params?: any;
      method: HTTP_METHOD;
      signature: SignedMessagePayload;
    };
  },
) => {
  const init: RequestInit = {
    method: options.arg.method,
    headers: {
      ...options.arg.signature,
    },
  };

  if (options.arg.data) {
    init.body = JSON.stringify(options.arg.data);
  }

  if (
    typeof options.arg.params === "object" &&
    Object.keys(options.arg.params).length
  ) {
    const search = new URLSearchParams(options.arg.params);
    url = `${url}?${search.toString()}`;
  }

  return mutate(url, init);
};

/**
 * This hook is used to execute API requests for data mutation, such as POST, DELETE, PUT, etc.
 */
export const useMutation = <T, E>(
  /**
   * The URL to send the request to. If the URL does not start with "http",
   * it will be prefixed with the API base URL.
   */
  url: string,
  /**
   * The HTTP method to use for the request. Defaults to "POST".
   */
  method: HTTP_METHOD = "POST",
  /**
   * The configuration object for the mutation.
   * @see [useSWRMutation](https://swr.vercel.app/docs/mutation#api)
   *
   * @link https://swr.vercel.app/docs/mutation#api
   */
  options?: SWRMutationConfiguration<T, E>,
) => {
  const apiBaseUrl = useConfig("apiBaseUrl");

  let fullUrl = url;
  if (!url.startsWith("http")) {
    fullUrl = `${apiBaseUrl}${url}`;
  }

  const veltoWithdrawOnlyMode = useWithdrawOnlyMode();
  const account = useAccountInstance();

  const { trigger, data, error, reset, isMutating } = useSWRMutation(
    fullUrl,
    // method === "POST" ? fetcher : deleteFetcher,
    fetcher,
    options,
  );

  const mutation = async (
    /**
     * The data to send with the request.
     */
    data: Record<string, any> | null,
    /**
     * The query parameters to send with the request.
     */
    params?: Record<string, any>,
    options?: SWRMutationConfiguration<T, E>,
  ): Promise<any> => {
    if (veltoWithdrawOnlyMode) {
      // In withdraw-only mode, allow: DELETE (order cancels) and reduce_only orders (position closes).
      // Block all other mutations.
      const isAllowed = method === "DELETE" || data?.reduce_only === true;
      if (!isAllowed) {
        throw Object.assign(
          new Error("This action is not available in your region"),
          {
            code: "RESTRICTED_REGION_WITHDRAW_ONLY",
          },
        );
      }
    }

    let newUrl = url;

    if (typeof params === "object" && Object.keys(params).length) {
      const search = new URLSearchParams(params);
      newUrl = `${url}?${search.toString()}`;
    }

    const payload: MessageFactor = {
      method,
      url: newUrl,
      data,
    };

    const signer = account.signer;
    const signature = await signer.sign(payload, getTimestamp());

    return trigger(
      {
        data,
        params,
        method,
        signature: {
          ...signature,
          "orderly-account-id": account.accountId,
        },
      },
      options,
    );
  };

  return [useMemoizedFn(mutation), { data, error, reset, isMutating }] as const;
};
