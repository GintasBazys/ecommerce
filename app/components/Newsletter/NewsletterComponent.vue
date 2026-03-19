<script setup lang="ts">
import type { FetchError } from "ofetch"

const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const loading = ref<boolean>(false)

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
        const err = error as FetchError
        errorMessage.value = err.statusMessage || err.message || "An unknown error occurred"
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <section class="newsletterBlock">
        <VContainer class="newsletterBlock__container">
            <div class="newsletterBlock__panel">
                <div class="newsletterBlock__copy">
                    <span class="newsletterBlock__eyebrow">Newsletter</span>
                    <h2 class="newsletterBlock__title">Get product drops, journal reads, and offers in one cleaner weekly email.</h2>
                    <p class="newsletterBlock__description">
                        A quieter subscription block with stronger hierarchy, clearer feedback, and a brighter visual rhythm that fits the
                        refreshed homepage.
                    </p>
                    <ul class="newsletterBlock__benefits">
                        <li class="newsletterBlock__benefit">Fresh arrivals before they disappear</li>
                        <li class="newsletterBlock__benefit">Selected reads from the journal</li>
                        <li class="newsletterBlock__benefit">Occasional offers, no inbox clutter</li>
                    </ul>
                </div>

                <div class="newsletterBlock__formWrap">
                    <VForm class="newsletterBlock__form" @submit="handleSubscribe">
                        <label class="newsletterBlock__label" for="newsletter-email">Email address</label>
                        <VTextField
                            id="newsletter-email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            required
                            variant="solo-filled"
                            hide-details="auto"
                            density="comfortable"
                            class="newsletterBlock__input"
                            :error-messages="errorMessage ? [errorMessage] : []"
                            @input="
                                () => {
                                    errorMessage = null
                                    successMessage = null
                                }
                            "
                        />
                        <VBtn
                            type="submit"
                            color="primary"
                            rounded="pill"
                            :loading="loading"
                            class="newsletterBlock__button text-none"
                            block
                        >
                            Subscribe
                        </VBtn>
                        <p v-if="successMessage" class="newsletterBlock__message newsletterBlock__message--success">{{ successMessage }}</p>
                        <p class="newsletterBlock__caption">No spam. Just useful updates, better offers, and the occasional standout story.</p>
                    </VForm>
                </div>
            </div>
        </VContainer>
    </section>
</template>

<style scoped lang="scss">
.newsletterBlock {
    position: relative;
    overflow: hidden;
    padding: clamp(4rem, 7vw, 6rem) 0;
    background:
        radial-gradient(circle at top right, rgba(0, 128, 255, 0.12), transparent 28%),
        linear-gradient(180deg, #f7faff 0%, #eef5ff 100%);

    &__container {
        position: relative;
        z-index: 1;
    }

    &__panel {
        display: grid;
        grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
        gap: clamp(1.5rem, 3vw, 3rem);
        padding: clamp(1.5rem, 3vw, 2.25rem);
        border: 1px solid rgba(8, 23, 63, 0.08);
        border-radius: 1.75rem;
        background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(246, 250, 255, 0.96) 100%);
        box-shadow: 0 18px 54px rgba(10, 28, 86, 0.08);
    }

    &__copy,
    &__formWrap {
        animation: newsletter-rise 0.75s ease both;
    }

    &__formWrap {
        animation-delay: 0.1s;
    }

    &__eyebrow {
        display: inline-flex;
        align-items: center;
        min-height: 2.3rem;
        padding: 0.45rem 0.9rem;
        margin-bottom: 1rem;
        border-radius: 999px;
        background: rgba(1, 12, 128, 0.07);
        color: #010c80;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
    }

    &__title {
        max-width: 14ch;
        margin-bottom: 1rem;
        color: #08173f;
        font-size: clamp(2rem, 4vw, 3.6rem);
        line-height: 0.98;
        letter-spacing: -0.05rem;
        text-wrap: balance;
    }

    &__description {
        max-width: 42rem;
        margin-bottom: 1.25rem;
        color: #53607b;
        font-size: 1rem;
        line-height: 1.75;
    }

    &__benefits {
        display: grid;
        gap: 0.75rem;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    &__benefit {
        position: relative;
        padding-left: 1.45rem;
        color: #42506b;
        font-size: 0.95rem;
        line-height: 1.6;

        &::before {
            content: "";
            position: absolute;
            top: 0.62rem;
            left: 0;
            width: 0.55rem;
            height: 0.55rem;
            border-radius: 999px;
            background: linear-gradient(135deg, #010c80 0%, #0080ff 100%);
        }
    }

    &__formWrap {
        display: flex;
        align-items: stretch;
    }

    &__form {
        width: 100%;
        padding: 1.2rem;
        border: 1px solid rgba(8, 23, 63, 0.08);
        border-radius: 1.4rem;
        background: rgba(255, 255, 255, 0.92);
    }

    &__label {
        display: inline-block;
        margin-bottom: 0.55rem;
        color: #08173f;
        font-size: 0.88rem;
        font-weight: 700;
        line-height: 1.4;
    }

    &__input {
        margin-bottom: 0.85rem;
    }

    &__button {
        min-height: 3rem;
        font-weight: 700;
    }

    &__message {
        margin: 0.9rem 0 0;
        font-size: 0.9rem;
        line-height: 1.5;

        &--success {
            color: #157347;
        }
    }

    &__caption {
        margin: 0.9rem 0 0;
        color: #6a758f;
        font-size: 0.84rem;
        line-height: 1.55;
    }
}

@keyframes newsletter-rise {
    from {
        opacity: 0;
        transform: translateY(24px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media screen and (max-width: 960px) {
    .newsletterBlock {
        &__panel {
            grid-template-columns: 1fr;
        }

        &__title {
            max-width: 100%;
        }
    }
}

@media screen and (max-width: 767px) {
    .newsletterBlock {
        padding: 3.5rem 0;

        &__panel {
            padding: 1rem;
            border-radius: 1.25rem;
        }

        &__form {
            padding: 1rem;
        }

        &__title {
            font-size: clamp(1.85rem, 7vw, 2.8rem);
        }
    }
}

@media (prefers-reduced-motion: reduce) {
    .newsletterBlock {
        &__copy,
        &__formWrap {
            animation: none;
        }
    }
}
</style>
