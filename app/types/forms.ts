export type OptionValue = string | number

export type SelectOption = {
    value?: OptionValue
    label?: string
    text?: string
    title?: string
    disabled?: boolean
}

export type NormalizedSelectOption = {
    key: string
    value: OptionValue | ""
    label: string
    disabled: boolean
}

export type PendingTurnstileExecution = {
    resolve: (_token: string) => void
    reject: (_error: Error) => void
}

export type TurnstileWidgetInstance = {
    execute: () => Promise<string>
}
