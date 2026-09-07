export function createEffectLoaderRegistry<Id extends string, Loader>(loaders: Record<Id, Loader>) {
  return {
    getEffectLoader(id: string): Loader | null {
      return Object.hasOwn(loaders, id) ? loaders[id as Id] : null;
    },
  };
}
