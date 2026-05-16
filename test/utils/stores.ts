import { vi } from 'vitest'
import { computed, ref } from 'vue'

type SetupStoreFactory<TStore> = () => TStore

type AutoImportMap = Record<string, unknown>

export async function createSetupStore<TStore>(moduleLoader: () => Promise<Record<string, unknown>>, exportName: string, autoImports: AutoImportMap = {}): Promise<TStore> {
    vi.resetModules()
    vi.stubGlobal('defineStore', (_id: string, setup: SetupStoreFactory<TStore>) => setup)
    vi.stubGlobal('ref', ref)
    vi.stubGlobal('computed', computed)

    Object.entries(autoImports).forEach(([name, value]) => {
        vi.stubGlobal(name, value)
    })

    const module = await moduleLoader()
    const useStore = module[exportName] as SetupStoreFactory<TStore>

    return useStore()
}
