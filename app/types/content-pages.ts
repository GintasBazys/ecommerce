export type ShippingOption = {
    title: string
    detail: string
}

export type PolicyBlock = {
    eyebrow: string
    title: string
    text: string
}

export type ShippingFaqItem = {
    question: string
    answer: string
}

export type ReturnStep = {
    number: string
    title: string
    detail: string
}

export type PolicyHighlight = {
    title: string
    text: string
}

export type ReturnFaqItem = {
    question: string
    answer: string
}

export type FaqItem = {
    question: string
    answer: string
}

export type FaqSection = {
    id: string
    eyebrow: string
    title: string
    description: string
    items: FaqItem[]
}

export type AccountHighlight = {
    label: string
    value: string
}

export type AccountPageContent = {
    eyebrow: string
    title: string
    description: string
}

export type PolicyItem = {
    icon: string
    title: string
    description: string
    to: string
    action: string
}
