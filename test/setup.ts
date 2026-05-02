import { afterEach, beforeEach, vi } from 'vitest'

beforeEach(() => {
    vi.stubGlobal(
        'ResizeObserver',
        class ResizeObserverMock {
            observe(): void {}
            disconnect(): void {}
        }
    )
})

afterEach(() => {
    vi.unstubAllGlobals()
})
