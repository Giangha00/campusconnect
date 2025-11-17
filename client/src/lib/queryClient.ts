import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      // ✅ Cache time: 5 phút - data được coi là fresh trong 5 phút
      staleTime: 5 * 60 * 1000,
      // ✅ Cache data trong 30 phút trước khi garbage collect
      gcTime: 30 * 60 * 1000, // Previously cacheTime
      // ✅ Retry failed requests 2 lần
      retry: 2,
      // ✅ Không refetch khi window focus để tránh unnecessary requests
      refetchOnWindowFocus: false,
      // ✅ Refetch khi reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // ✅ Retry failed mutations 1 lần
      retry: 1,
    },
  },
});
