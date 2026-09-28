// Lightweight query cache and fetcher stub for client-side state
export const queryClient = {
  cache: new Map<string, any>(),
  fetch: async <T>(key: string, fn: () => Promise<T>): Promise<T> => {
    return fn();
  },
};
