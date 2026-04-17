<script setup lang="ts">
import type { FetchError } from "ofetch"

const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const loading = ref<boolean>(false)

interface SubscribeErrorPayload {
    statusCode?: number
    statusMessage?: string
    message?: string
}

function mapSubscribeError(message: string | null | undefined): string {
    if (!message) {
        return "Something went wrong. Please try again."
    }

    if (message.includes("Member Exists")) {
        return "This email is already subscribed to our newsletter."
    }

    if (message.includes("Invalid Resource") || message.toLowerCase().includes("email")) {
        return "Enter a valid email address to subscribe."
    }

    if (message === "Email is required.") {
        return "Enter your email address to subscribe."
    }

    return message.replace(/^Mailchimp error:\s*/i, "")
}

function getSubscribeErrorMessage(error: unknown): string {
    const err = error as FetchError<SubscribeErrorPayload>
    const payloadMessage = err.data?.statusMessage || err.data?.message
    const directMessage = err.statusMessage
    const fallbackMessage = !err.message.startsWith("[") ? err.message : null

    return mapSubscribeError(payloadMessage || directMessage || fallbackMessage)
}

async function handleSubscribe(e: Event): Promise<void> {
    e.preventDefault()

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const email = formData.get("email")

    errorMessage.value = null
    successMessage.value = null

    try {
        loading.value = true
        const response = await $fetch("/api/subscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        })

        if (response.success) {
            successMessage.value = response.message
            form.reset()
        }
    } catch (error: unknown) {
        errorMessage.value = getSubscribeErrorMessage(error)
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <section class="newsletter-block">
        <div class="newsletter-block__container">
            <div class="newsletter-block__panel">
                <div class="newsletter-block__copy">
                    <span class="newsletter-block__eyebrow">Newsletter</span>
                    <h2 class="newsletter-block__title">Thoughtful product updates, useful reads, and selective offers.</h2>
                    <p class="newsletter-block__description">
                        Stay close to new arrivals, editorial picks, and occasional promotions in a more refined weekly email that fits the
                        premium storefront experience.
                    </p>
                    <ul class="newsletter-block__benefits">
                        <li class="newsletter-block__benefit">Early access to curated arrivals</li>
                        <li class="newsletter-block__benefit">Practical journal highlights and product stories</li>
                        <li class="newsletter-block__benefit">Occasional offers without inbox noise</li>
                    </ul>

                    <div class="newsletter-block__notes">
                        <div class="newsletter-block__note-card">
                            <span class="newsletter-block__note-label">Weekly rhythm</span>
                            <strong class="newsletter-block__note-value">Clearer updates, not constant campaigns</strong>
                        </div>
                        <div class="newsletter-block__note-card">
                            <span class="newsletter-block__note-label">Store focus</span>
                            <strong class="newsletter-block__note-value">New products, better offers, useful guidance</strong>
                        </div>
                    </div>
                </div>

                <div class="newsletter-block__form-wrap">
                    <form class="newsletter-block__form" @submit="handleSubscribe">
                        <div class="newsletter-block__form-top">
                            <span class="newsletter-block__form-kicker">Join the list</span>
                            <h3 class="newsletter-block__form-title">Receive a calmer, more premium inbox update.</h3>
                            <p class="newsletter-block__form-description">
                                One field, one clear action, and a lighter sign-up experience that matches the rest of the site.
                            </p>
                        </div>

                        <label class="newsletter-block__label" for="newsletter-email">Email address</label>
                        <div class="newsletter-block__form-row">
                            <input
                                id="newsletter-email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                required
                                class="newsletter-block__input"
                                :aria-invalid="errorMessage ? 'true' : 'false'"
                                :aria-describedby="errorMessage ? 'newsletter-error' : successMessage ? 'newsletter-success' : undefined"
                                @input="
                                    () => {
                                        errorMessage = null
                                        successMessage = null
                                    }
                                "
                            />
                            <button type="submit" class="newsletter-block__button" :disabled="loading">
                                <span v-if="loading" class="newsletter-block__button-spinner" aria-hidden="true"></span>
                                {{ loading ? "Subscribing..." : "Subscribe" }}
                            </button>
                        </div>

                        <p v-if="errorMessage" id="newsletter-error" class="newsletter-block__message newsletter-block__message--error">
                            {{ errorMessage }}
                        </p>
                        <p v-if="successMessage" class="newsletter-block__message newsletter-block__message--success">
                            <span id="newsletter-success">{{ successMessage }}</span>
                        </p>
                        <p class="newsletter-block__caption">
                            No spam. Just useful updates, better offers, and the occasional standout story.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.newsletter-block {
    padding: clamp(3.5rem, 7vw, 5.5rem) 1rem;
    background:
        radial-gradient(circle at top left, rgba(245, 158, 11, 0.08), transparent 24%), linear-gradient(180deg, #fcfdff 0%, #f6f8fc 100%);
}

.newsletter-block__container {
    margin: 0 auto;
    width: 100%;
    max-width: 80rem;
}

.newsletter-block__panel {
    display: grid;
    gap: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.82);
    border-radius: 2rem;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95));
    box-shadow: 0 18px 44px rgba(8, 27, 90, 0.08);
    padding: 1.25rem;
}

.newsletter-block__copy,
.newsletter-block__form {
    border: 1px solid rgba(226, 232, 240, 0.9);
    border-radius: 1.6rem;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
}

.newsletter-block__copy {
    padding: 1.5rem;
}

.newsletter-block__form {
    padding: 1.5rem;
    box-shadow: 0 12px 30px rgba(8, 27, 90, 0.05);
}

.newsletter-block__eyebrow,
.newsletter-block__form-kicker {
    display: inline-flex;
    min-height: 2.25rem;
    align-items: center;
    border-radius: 999px;
    border: 1px solid rgba(253, 230, 138, 0.72);
    background: rgba(254, 243, 199, 0.72);
    padding: 0.45rem 0.95rem;
    color: #78350f;
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.newsletter-block__title {
    margin: 1rem 0 0;
    max-width: 13ch;
    color: #0f172a;
    font-size: clamp(2rem, 6vw, 3.4rem);
    font-weight: 700;
    line-height: 0.98;
    letter-spacing: -0.05em;
}

.newsletter-block__description {
    margin: 1rem 0 0;
    max-width: 40rem;
    color: #475569;
    font-size: 1rem;
    line-height: 1.8;
}

.newsletter-block__benefits {
    display: grid;
    gap: 0.85rem;
    margin: 1.5rem 0 0;
    padding: 0;
    list-style: none;
}

.newsletter-block__benefit {
    position: relative;
    padding-left: 1.5rem;
    color: #334155;
    font-size: 0.96rem;
    line-height: 1.65;
}

.newsletter-block__benefit::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0.62rem;
    height: 0.52rem;
    width: 0.52rem;
    border-radius: 999px;
    background: linear-gradient(180deg, #d97706 0%, #92400e 100%);
}

.newsletter-block__notes {
    display: grid;
    gap: 0.9rem;
    margin-top: 1.5rem;
}

.newsletter-block__note-card {
    border: 1px solid rgba(226, 232, 240, 0.95);
    border-radius: 1.1rem;
    background: rgba(255, 255, 255, 0.9);
    padding: 0.95rem 1rem;
}

.newsletter-block__note-label {
    display: block;
    color: #64748b;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.newsletter-block__note-value {
    display: block;
    margin-top: 0.35rem;
    color: #0f172a;
    font-size: 0.98rem;
    font-weight: 600;
    line-height: 1.55;
}

.newsletter-block__form-wrap {
    display: flex;
}

.newsletter-block__form-top {
    margin-bottom: 1.15rem;
}

.newsletter-block__form-title {
    margin: 0.95rem 0 0;
    color: #0f172a;
    font-size: 1.55rem;
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.03em;
}

.newsletter-block__form-description {
    margin: 0.8rem 0 0;
    color: #475569;
    font-size: 0.95rem;
    line-height: 1.7;
}

.newsletter-block__label {
    display: inline-block;
    margin-bottom: 0.55rem;
    color: #0f172a;
    font-size: 0.86rem;
    font-weight: 700;
    line-height: 1.4;
}

.newsletter-block__form-row {
    display: grid;
    gap: 0.8rem;
}

.newsletter-block__input {
    min-height: 3.35rem;
    width: 100%;
    border: 1px solid rgba(148, 163, 184, 0.42);
    border-radius: 1rem;
    background: #fff;
    color: #0f172a;
    padding: 0.9rem 1rem;
    font-size: 1rem;
    line-height: 1.5;
    box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.03);
}

.newsletter-block__input::placeholder {
    color: #94a3b8;
}

.newsletter-block__input:focus {
    outline: 2px solid rgba(253, 230, 138, 0.9);
    outline-offset: 2px;
    border-color: rgba(245, 158, 11, 0.45);
}

.newsletter-block__button {
    display: inline-flex;
    min-height: 3.35rem;
    align-items: center;
    justify-content: center;
    gap: 0.55rem;
    border: 0;
    border-radius: 999px;
    background: linear-gradient(180deg, #e1bc7b 0%, #cda45e 100%);
    color: #0f172a;
    padding: 0.9rem 1.35rem;
    font-size: 0.96rem;
    font-weight: 700;
    line-height: 1;
}

.newsletter-block__button:disabled {
    cursor: wait;
    opacity: 0.8;
}

.newsletter-block__button-spinner {
    height: 0.95rem;
    width: 0.95rem;
    border: 2px solid rgba(15, 23, 42, 0.25);
    border-top-color: #0f172a;
    border-radius: 999px;
    animation: newsletter-spin 0.8s linear infinite;
}

.newsletter-block__message {
    margin: 0.9rem 0 0;
    font-size: 0.9rem;
    line-height: 1.6;
}

.newsletter-block__message--success {
    color: #157347;
}

.newsletter-block__message--error {
    color: #b91c1c;
}

.newsletter-block__caption {
    margin: 0.9rem 0 0;
    color: #64748b;
    font-size: 0.84rem;
    line-height: 1.6;
}

@keyframes newsletter-spin {
    to {
        transform: rotate(360deg);
    }
}

@media (min-width: 960px) {
    .newsletter-block__panel {
        grid-template-columns: minmax(0, 1.08fr) minmax(20rem, 0.92fr);
        gap: 1.75rem;
        padding: 1.5rem;
    }

    .newsletter-block__notes {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .newsletter-block__form-row {
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
    }

    .newsletter-block__button {
        min-width: 10rem;
    }
}

@media (max-width: 767px) {
    .newsletter-block {
        padding: 3rem 1rem;
    }

    .newsletter-block__panel {
        border-radius: 1.5rem;
        padding: 1rem;
    }

    .newsletter-block__copy,
    .newsletter-block__form {
        border-radius: 1.3rem;
        padding: 1.15rem;
    }

    .newsletter-block__title {
        max-width: 100%;
        font-size: clamp(1.9rem, 8vw, 2.7rem);
    }

    .newsletter-block__form-title {
        font-size: 1.35rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .newsletter-block__button-spinner {
        animation: none;
    }
}
</style>
