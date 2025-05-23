"use server";

import { getAuthToken } from "../../app/(app)/api/lib/getAuthToken";
import { API_SERVER_URL } from "../constants/env";

type ProxyActionParams = {
  pathname: string;
  searchParams?: Record<string, string | undefined>;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: string;
  headers?: Record<string, string>;
  parseAsText?: boolean;
};

type ProxyActionResult<T> =
  | {
      status: number;
      ok: true;
      data: T;
    }
  | {
      status: number;
      ok: false;
      error: string;
    };

async function proxy<T>(
  baseUrl: string,
  params: ProxyActionParams,
): Promise<ProxyActionResult<T>> {
  const authToken = await getAuthToken();

  // build URL
  const url = new URL(baseUrl);
  url.pathname = params.pathname;
  if (params.searchParams) {
    for (const key in params.searchParams) {
      const value = params.searchParams[key];
      if (value) {
        url.searchParams.append(key, value);
      }
    }
  }

  const res = await fetch(url, {
    method: params.method,
    headers: {
      ...params.headers,
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: params.body,
  });

  if (!res.ok) {
    try {
      const errorMessage = await res.text();
      return {
        status: res.status,
        ok: false,
        error: errorMessage || res.statusText,
      };
    } catch {
      return {
        status: res.status,
        ok: false,
        error: res.statusText,
      };
    }
  }

  return {
    status: res.status,
    ok: true,
    data: params.parseAsText ? await res.text() : await res.json(),
  };
}

export async function apiServerProxy<T>(params: ProxyActionParams) {
  return proxy<T>(API_SERVER_URL, params);
}

export async function payServerProxy<T>(params: ProxyActionParams) {
  return proxy<T>(
    process.env.NEXT_PUBLIC_PAY_URL
      ? `https://${process.env.NEXT_PUBLIC_PAY_URL}`
      : "https://pay.thirdweb-dev.com",
    params,
  );
}

export async function analyticsServerProxy<T>(params: ProxyActionParams) {
  return proxy<T>(process.env.ANALYTICS_SERVICE_URL || "", params);
}
