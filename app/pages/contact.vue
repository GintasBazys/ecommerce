<script setup lang="ts">
import ContactForm from "~/components/Forms/ContactForm.vue"

const breadcrumbItems = computed(() => [{ label: "Home", to: "/" }, { label: "Contact" }])

const contactChannels = [
    {
        icon: "mdi-facebook-messenger",
        title: "Messenger support",
        detail: "Talk to us during business hours for quick shopping or delivery questions.",
        meta: "Mon-Fri | 09:00 - 17:00"
    },
    {
        icon: "mdi-email-outline",
        title: "Email us",
        detail: "Best for order updates, return requests, or detailed product questions.",
        meta: "info@ecommerce.com"
    },
    {
        icon: "mdi-phone-outline",
        title: "Call the team",
        detail: "Speak directly with support when you need a fast answer before checkout.",
        meta: "+370 600 00000"
    }
]

const supportPromises = [
    "Order questions handled by a real person",
    "Guidance before and after checkout",
    "Clear follow-up for shipping and returns"
]

useHead({
    title: "Contact us | Ecommerce"
})
</script>

<template>
    <section class="contact-page">
        <div class="contact-page__hero">
            <VContainer class="contact-page__container">
                <div class="contact-page__hero-grid">
                    <div class="contact-page__hero-copy">
                        <AppBreadcrumbs :items="breadcrumbItems" class="contact-page__breadcrumbs" />
                        <span class="contact-page__eyebrow">Customer Care</span>
                        <h1 class="contact-page__title">Talk to a team that keeps shopping support calm, clear, and fast.</h1>
                        <p class="contact-page__description">
                            If you want a quick answer first, browse our
                            <NuxtLink to="/faq" class="contact-page__inline-link">FAQ</NuxtLink>. If you still need us, send a message and
                            we will help with products, delivery, returns, or order updates.
                        </p>
                        <div class="contact-page__hero-actions">
                            <VBtn color="primary" rounded="pill" size="large" class="text-none px-7" to="/faq">Browse FAQ</VBtn>
                            <div class="contact-page__response-card">
                                <span class="contact-page__response-label">Average response</span>
                                <strong class="contact-page__response-value">Within one business day</strong>
                            </div>
                        </div>
                    </div>
                    <div class="contact-page__hero-panel">
                        <span class="contact-page__panel-label">Support desk</span>
                        <h2 class="contact-page__panel-title">Built to feel as considered as the new homepage.</h2>
                        <p class="contact-page__panel-text">
                            Reach out for delivery updates, product advice, or help with a recent order. We keep replies direct and
                            practical.
                        </p>
                        <ul class="contact-page__promise-list">
                            <li v-for="promise in supportPromises" :key="promise" class="contact-page__promise-item">
                                <VIcon size="18" color="primary">mdi-check-circle-outline</VIcon>
                                <span>{{ promise }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </VContainer>
        </div>
        <VContainer class="contact-page__container">
            <div class="contact-page__channel-grid">
                <article v-for="channel in contactChannels" :key="channel.title" class="contact-page__channel-card">
                    <div class="contact-page__channel-icon">
                        <VIcon size="22">{{ channel.icon }}</VIcon>
                    </div>
                    <div>
                        <h2 class="contact-page__channel-title">{{ channel.title }}</h2>
                        <p class="contact-page__channel-detail">{{ channel.detail }}</p>
                        <p class="contact-page__channel-meta">{{ channel.meta }}</p>
                    </div>
                </article>
            </div>
            <div class="contact-page__content-grid">
                <div class="contact-page__form-panel">
                    <div class="contact-page__section-intro">
                        <span class="contact-page__section-eyebrow">Send a message</span>
                        <h2 class="contact-page__section-title">Share the details and we will take it from there.</h2>
                        <p class="contact-page__section-text">
                            Add your order number if you have one. That helps us respond faster and keeps follow-up straightforward.
                        </p>
                    </div>
                    <div class="contact-page__form-card">
                        <ContactForm />
                    </div>
                </div>
                <aside class="contact-page__sidebar">
                    <div class="contact-page__sidebar-card">
                        <span class="contact-page__sidebar-label">Visit us</span>
                        <h2 class="contact-page__sidebar-title">Vilnius support base</h2>
                        <p class="contact-page__sidebar-text">
                            Our team works from Vilnius and supports customers across product questions, order issues, and post-purchase
                            help.
                        </p>
                        <div class="contact-page__sidebar-meta">Open on weekdays | Closed on public holidays</div>
                    </div>
                    <div class="contact-page__map-card">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d203269.51871892938!2d25.088231590205528!3d54.700572672503455!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46dd93fb5c6408f5%3A0x400d18c70e9dc40!2sVilnius%2C%20Vilniaus%20m.%20sav.!5e1!3m2!1slt!2slt!4v1727009719782!5m2!1slt!2slt"
                            width="100%"
                            height="100%"
                            class="contact-page__map"
                            style="border: 0"
                            allowfullscreen
                            loading="lazy"
                            referrerpolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </aside>
            </div>
        </VContainer>
    </section>
</template>

<style scoped lang="scss">
.contact-page {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 40%, #f7faff 100%);
}

.contact-page__hero {
    padding: 5.5rem 0 2.5rem;
}

.contact-page__container {
    position: relative;
    z-index: 1;
}

.contact-page__hero-grid,
.contact-page__content-grid {
    display: grid;
    gap: 2rem;
}

.contact-page__hero-grid {
    grid-template-columns: minmax(0, 1.2fr) minmax(19rem, 0.8fr);
    align-items: end;
}

.contact-page__hero-copy,
.contact-page__hero-panel,
.contact-page__channel-card,
.contact-page__form-panel,
.contact-page__sidebar {
    animation: contact-rise 0.8s ease both;
}

.contact-page__hero-panel,
.contact-page__sidebar {
    animation-delay: 0.12s;
}

.contact-page__breadcrumbs {
    margin-bottom: 1rem;
}

.contact-page__eyebrow,
.contact-page__section-eyebrow,
.contact-page__panel-label,
.contact-page__sidebar-label {
    display: inline-flex;
    align-items: center;
    min-height: 2.25rem;
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    background: rgba(1, 12, 128, 0.07);
    color: #010c80;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.contact-page__eyebrow,
.contact-page__section-eyebrow {
    margin-bottom: 1rem;
}

.contact-page__title,
.contact-page__section-title {
    color: #08173f;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.contact-page__title {
    max-width: 12ch;
    margin-bottom: 1rem;
    font-size: 4rem;
    line-height: 0.95;
}

.contact-page__description,
.contact-page__panel-text,
.contact-page__section-text,
.contact-page__sidebar-text,
.contact-page__channel-detail {
    color: #4b5874;
    font-size: 1rem;
    line-height: 1.75;
}

.contact-page__description {
    max-width: 40rem;
    margin-bottom: 0;
}

.contact-page__inline-link {
    color: #010c80;
    font-weight: 700;
    text-decoration: none;
}

.contact-page__inline-link:hover {
    text-decoration: underline;
}

.contact-page__hero-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem 1.25rem;
    margin-top: 1.75rem;
}

.contact-page__response-card,
.contact-page__hero-panel,
.contact-page__channel-card,
.contact-page__form-card,
.contact-page__sidebar-card,
.contact-page__map-card {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.82);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.contact-page__response-card {
    display: grid;
    gap: 0.2rem;
    padding: 0.9rem 1.05rem;
}

.contact-page__response-label,
.contact-page__channel-meta,
.contact-page__sidebar-meta {
    color: #6a7590;
    font-size: 0.88rem;
}

.contact-page__response-value,
.contact-page__panel-title,
.contact-page__section-title,
.contact-page__sidebar-title,
.contact-page__channel-title {
    color: #08173f;
}

.contact-page__response-value {
    font-size: 1rem;
    line-height: 1.4;
}

.contact-page__hero-panel,
.contact-page__sidebar-card {
    padding: 1.75rem;
}

.contact-page__panel-label,
.contact-page__sidebar-label {
    margin-bottom: 1rem;
}

.contact-page__panel-title,
.contact-page__section-title {
    margin-bottom: 0.85rem;
    font-size: 2rem;
    line-height: 1.08;
}

.contact-page__panel-text,
.contact-page__section-text,
.contact-page__sidebar-text {
    margin-bottom: 0;
}

.contact-page__promise-list {
    display: grid;
    gap: 0.85rem;
    margin: 1.4rem 0 0;
    padding: 0;
    list-style: none;
}

.contact-page__promise-item {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    color: #33415f;
    line-height: 1.6;
}

.contact-page__channel-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin-bottom: 2.75rem;
}

.contact-page__channel-card {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    min-height: 100%;
    padding: 1.35rem;
    transition:
        transform 0.25s ease,
        box-shadow 0.25s ease,
        border-color 0.25s ease;
}

.contact-page__channel-card:hover {
    transform: translateY(-4px);
    border-color: rgba(1, 12, 128, 0.14);
    box-shadow: 0 22px 54px rgba(8, 27, 90, 0.12);
}

.contact-page__channel-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: 1rem;
    background: linear-gradient(145deg, rgba(1, 12, 128, 0.1), rgba(0, 128, 255, 0.08));
    color: #010c80;
}

.contact-page__channel-title {
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
}

.contact-page__channel-detail {
    margin-bottom: 0.75rem;
}

.contact-page__channel-meta {
    margin-bottom: 0;
    font-weight: 700;
}

.contact-page__content-grid {
    grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.8fr);
    align-items: start;
    padding-bottom: 5rem;
}

.contact-page__form-panel {
    min-width: 0;
}

.contact-page__form-card {
    padding: 1.5rem;
}

.contact-page__section-intro {
    margin-bottom: 1.25rem;
}

.contact-page__sidebar {
    display: grid;
    gap: 1rem;
    position: sticky;
    top: 1.5rem;
}

.contact-page__sidebar-title {
    margin-bottom: 0.75rem;
    font-size: 1.5rem;
    line-height: 1.1;
}

.contact-page__sidebar-meta {
    margin-top: 1.1rem;
    font-weight: 700;
}

.contact-page__map-card {
    overflow: hidden;
    min-height: 22rem;
}

.contact-page__map {
    display: block;
    min-height: 22rem;
}

@keyframes contact-rise {
    from {
        opacity: 0;
        transform: translateY(26px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media screen and (max-width: 1100px) {
    .contact-page__hero-grid,
    .contact-page__content-grid,
    .contact-page__channel-grid {
        grid-template-columns: 1fr;
    }

    .contact-page__title {
        max-width: 100%;
    }

    .contact-page__sidebar {
        position: static;
    }
}

@media screen and (max-width: 600px) {
    .contact-page__hero {
        padding: 3.75rem 0 2rem;
    }

    .contact-page__title {
        font-size: 2.5rem;
        line-height: 1;
    }

    .contact-page__hero-panel,
    .contact-page__channel-card,
    .contact-page__form-card,
    .contact-page__sidebar-card {
        border-radius: 1.2rem;
    }

    .contact-page__hero-grid,
    .contact-page__content-grid {
        gap: 1.5rem;
    }

    .contact-page__hero-panel,
    .contact-page__sidebar-card,
    .contact-page__form-card {
        padding: 1.4rem;
    }

    .contact-page__panel-title,
    .contact-page__section-title {
        font-size: 1.7rem;
    }

    .contact-page__channel-grid {
        margin-bottom: 2.25rem;
    }

    .contact-page__content-grid {
        padding-bottom: 4rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .contact-page__hero-copy,
    .contact-page__hero-panel,
    .contact-page__channel-card,
    .contact-page__form-panel,
    .contact-page__sidebar {
        animation: none;
    }

    .contact-page__channel-card {
        transition: none;
    }
}
</style>
