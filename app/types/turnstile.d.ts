type TurnstileRenderOptions = {
    sitekey: string
    action?: string
    theme?: "auto" | "light" | "dark"
    size?: "normal" | "flexible" | "compact"
    callback?: (token: string) => void
    ["error-callback"]?: (errorCode?: string) => void
    ["expired-callback"]?: () => void
}

type TurnstileApi = {
    ready: (callback: () => void) => void
    render: (container: string | HTMLElement, options: TurnstileRenderOptions) => string
    reset: (widgetId?: string) => void
    remove: (widgetId: string) => void
}

declare global {
    interface Window {
        turnstile?: TurnstileApi
        onTurnstileContactLoad?: () => void
    }
}

export {}
