import { flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'

export async function flushNuxtUpdates(): Promise<void> {
    await nextTick()
    await flushPromises()
    await nextTick()
}
