export type ContactChannel = {
    icon: string
    title: string
    detail: string
    meta: string
    cta: string
    href?: string
    to?: string
}

export type ContactFormState = {
    subject: string
    email: string
    phone: string
    orderNumber: string
    message: string
}

export type ContactFormErrors = {
    subject: string
    email: string
    message: string
}
