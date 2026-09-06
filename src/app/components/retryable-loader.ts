export function createRetryableLoader<T>(loadValue: () => Promise<T>) {
  let pending: Promise<T> | null = null;

  const load = () => {
    pending ??= loadValue().catch((error) => {
      pending = null;
      throw error;
    });
    return pending;
  };

  return {
    load,
    async warm() {
      try {
        await load();
      } catch {
        // Speculative loading must not surface an unhandled rejection.
      }
    },
  };
}
