"use server";

import { getAuthToken } from "@/api/auth-token";
import {
  NEXT_PUBLIC_ENGINE_CLOUD_URL,
  NEXT_PUBLIC_THIRDWEB_API_HOST,
} from "@/constants/public-envs";
import { ANALYTICS_SERVICE_URL } from "@/constants/server-envs";

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
    body: params.body,
    headers: {
      ...params.headers,
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    method: params.method,
  });

  if (!res.ok) {
    try {
      const errorMessage = await res.text();
      return {
        error: errorMessage || res.statusText,
        ok: false,
        status: res.status,
      };
    } catch {
      return {
        error: res.statusText,
        ok: false,
        status: res.status,
      };
    }
  }

  return {
    data: params.parseAsText ? await res.text() : await res.json(),
    ok: true,
    status: res.status,
  };
}

export async function apiServerProxy<T>(params: ProxyActionParams) {
  return proxy<T>(NEXT_PUBLIC_THIRDWEB_API_HOST, params);
}

export async function engineCloudProxy<T>(params: ProxyActionParams) {
  return proxy<T>(NEXT_PUBLIC_ENGINE_CLOUD_URL, params);
}

export async function analyticsServerProxy<T>(params: ProxyActionParams) {
  return proxy<T>(ANALYTICS_SERVICE_URL, params);
}
