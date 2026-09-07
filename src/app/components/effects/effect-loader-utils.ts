type Loadable<T> = { load: () => Promise<T> };

export function createEffectLoaderRegistry<Id extends string, Loader>(loaders: Record<Id, Loader>) {
  return {
    getEffectLoader(id: string): Loader | null {
      return Object.hasOwn(loaders, id) ? loaders[id as Id] : null;
    },
  };
}

export function createLazyComponentFactory<Module, LazyComponent>(
  createLazyComponent: (load: () => Promise<Module>) => LazyComponent,
  loader: Loadable<Module>,
) {
  return () => createLazyComponent(loader.load);
}
