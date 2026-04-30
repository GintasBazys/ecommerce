type TurnstileRenderOptions = {
    sitekey: string
    action?: string
    theme?: "auto" | "light" | "dark"
    size?: "normal" | "flexible" | "compact"
    appearance?: "always" | "execute" | "interaction-only"
    execution?: "render" | "execute"
    callback?: (token: string) => void
    ["error-callback"]?: (errorCode?: string) => void
    ["expired-callback"]?: () => void
}

type TurnstileApi = {
    ready: (callback: () => void) => void
    render: (container: string | HTMLElement, options: TurnstileRenderOptions) => string
    execute: (widgetId?: string | HTMLElement) => void
    reset: (widgetId?: string) => void
    remove: (widgetId: string) => void
}

declare global {
    interface Window {
        turnstile?: TurnstileApi
    }
}

export {}
