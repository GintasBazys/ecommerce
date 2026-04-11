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
    <section class="contactPage">
        <div class="contactPage__hero">
            <VContainer class="contactPage__container">
                <div class="contactPage__heroGrid">
                    <div class="contactPage__heroCopy">
                        <AppBreadcrumbs :items="breadcrumbItems" class="contactPage__breadcrumbs" />
                        <span class="contactPage__eyebrow">Customer Care</span>
                        <h1 class="contactPage__title">Talk to a team that keeps shopping support calm, clear, and fast.</h1>
                        <p class="contactPage__description">
                            If you want a quick answer first, browse our
                            <NuxtLink to="/faq" class="contactPage__inlineLink">FAQ</NuxtLink>. If you still need us, send a message and we
                            will help with products, delivery, returns, or order updates.
                        </p>
                        <div class="contactPage__heroActions">
                            <VBtn color="primary" rounded="pill" size="large" class="text-none px-7" to="/faq">Browse FAQ</VBtn>
                            <div class="contactPage__responseCard">
                                <span class="contactPage__responseLabel">Average response</span>
                                <strong class="contactPage__responseValue">Within one business day</strong>
                            </div>
                        </div>
                    </div>
                    <div class="contactPage__heroPanel">
                        <span class="contactPage__panelLabel">Support desk</span>
                        <h2 class="contactPage__panelTitle">Built to feel as considered as the new homepage.</h2>
                        <p class="contactPage__panelText">
                            Reach out for delivery updates, product advice, or help with a recent order. We keep replies direct and
                            practical.
                        </p>
                        <ul class="contactPage__promiseList">
                            <li v-for="promise in supportPromises" :key="promise" class="contactPage__promiseItem">
                                <VIcon size="18" color="primary">mdi-check-circle-outline</VIcon>
                                <span>{{ promise }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </VContainer>
        </div>
        <VContainer class="contactPage__container">
            <div class="contactPage__channelGrid">
                <article v-for="channel in contactChannels" :key="channel.title" class="contactPage__channelCard">
                    <div class="contactPage__channelIcon">
                        <VIcon size="22">{{ channel.icon }}</VIcon>
                    </div>
                    <div>
                        <h2 class="contactPage__channelTitle">{{ channel.title }}</h2>
                        <p class="contactPage__channelDetail">{{ channel.detail }}</p>
                        <p class="contactPage__channelMeta">{{ channel.meta }}</p>
                    </div>
                </article>
            </div>
            <div class="contactPage__contentGrid">
                <div class="contactPage__formPanel">
                    <div class="contactPage__sectionIntro">
                        <span class="contactPage__sectionEyebrow">Send a message</span>
                        <h2 class="contactPage__sectionTitle">Share the details and we will take it from there.</h2>
                        <p class="contactPage__sectionText">
                            Add your order number if you have one. That helps us respond faster and keeps follow-up straightforward.
                        </p>
                    </div>
                    <div class="contactPage__formCard">
                        <ContactForm />
                    </div>
                </div>
                <aside class="contactPage__sidebar">
                    <div class="contactPage__sidebarCard">
                        <span class="contactPage__sidebarLabel">Visit us</span>
                        <h2 class="contactPage__sidebarTitle">Vilnius support base</h2>
                        <p class="contactPage__sidebarText">
                            Our team works from Vilnius and supports customers across product questions, order issues, and post-purchase
                            help.
                        </p>
                        <div class="contactPage__sidebarMeta">Open on weekdays | Closed on public holidays</div>
                    </div>
                    <div class="contactPage__mapCard">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d203269.51871892938!2d25.088231590205528!3d54.700572672503455!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46dd93fb5c6408f5%3A0x400d18c70e9dc40!2sVilnius%2C%20Vilniaus%20m.%20sav.!5e1!3m2!1slt!2slt!4v1727009719782!5m2!1slt!2slt"
                            width="100%"
                            height="100%"
                            class="contactPage__map"
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
.contactPage {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 40%, #f7faff 100%);
}

.contactPage__hero {
    padding: clamp(4.75rem, 7vw, 6.5rem) 0 2.5rem;
}

.contactPage__container {
    position: relative;
    z-index: 1;
}

.contactPage__heroGrid,
.contactPage__contentGrid {
    display: grid;
    gap: clamp(1.5rem, 3vw, 2rem);
}

.contactPage__heroGrid {
    grid-template-columns: minmax(0, 1.2fr) minmax(19rem, 0.8fr);
    align-items: end;
}

.contactPage__heroCopy,
.contactPage__heroPanel,
.contactPage__channelCard,
.contactPage__formPanel,
.contactPage__sidebar {
    animation: contact-rise 0.8s ease both;
}

.contactPage__heroPanel,
.contactPage__sidebar {
    animation-delay: 0.12s;
}

.contactPage__breadcrumbs {
    margin-bottom: 1rem;
}

.contactPage__eyebrow,
.contactPage__sectionEyebrow,
.contactPage__panelLabel,
.contactPage__sidebarLabel {
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

.contactPage__eyebrow,
.contactPage__sectionEyebrow {
    margin-bottom: 1rem;
}

.contactPage__title,
.contactPage__sectionTitle {
    color: #08173f;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.contactPage__title {
    max-width: 12ch;
    margin-bottom: 1rem;
    font-size: clamp(2.4rem, 4.4vw, 4.5rem);
    line-height: 0.95;
}

.contactPage__description,
.contactPage__panelText,
.contactPage__sectionText,
.contactPage__sidebarText,
.contactPage__channelDetail {
    color: #4b5874;
    font-size: 1rem;
    line-height: 1.75;
}

.contactPage__description {
    max-width: 40rem;
    margin-bottom: 0;
}

.contactPage__inlineLink {
    color: #010c80;
    font-weight: 700;
    text-decoration: none;
}

.contactPage__inlineLink:hover {
    text-decoration: underline;
}

.contactPage__heroActions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem 1.25rem;
    margin-top: 1.75rem;
}

.contactPage__responseCard,
.contactPage__heroPanel,
.contactPage__channelCard,
.contactPage__formCard,
.contactPage__sidebarCard,
.contactPage__mapCard {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.82);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.contactPage__responseCard {
    display: grid;
    gap: 0.2rem;
    padding: 0.9rem 1.05rem;
}

.contactPage__responseLabel,
.contactPage__channelMeta,
.contactPage__sidebarMeta {
    color: #6a7590;
    font-size: 0.88rem;
}

.contactPage__responseValue,
.contactPage__panelTitle,
.contactPage__sectionTitle,
.contactPage__sidebarTitle,
.contactPage__channelTitle {
    color: #08173f;
}

.contactPage__responseValue {
    font-size: 1rem;
    line-height: 1.4;
}

.contactPage__heroPanel,
.contactPage__sidebarCard {
    padding: clamp(1.4rem, 2vw, 1.9rem);
}

.contactPage__panelLabel,
.contactPage__sidebarLabel {
    margin-bottom: 1rem;
}

.contactPage__panelTitle,
.contactPage__sectionTitle {
    margin-bottom: 0.85rem;
    font-size: clamp(1.6rem, 2.4vw, 2.2rem);
    line-height: 1.08;
}

.contactPage__panelText,
.contactPage__sectionText,
.contactPage__sidebarText {
    margin-bottom: 0;
}

.contactPage__promiseList {
    display: grid;
    gap: 0.85rem;
    margin: 1.4rem 0 0;
    padding: 0;
    list-style: none;
}

.contactPage__promiseItem {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    color: #33415f;
    line-height: 1.6;
}

.contactPage__channelGrid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin-bottom: clamp(2.25rem, 4vw, 3rem);
}

.contactPage__channelCard {
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

.contactPage__channelCard:hover {
    transform: translateY(-4px);
    border-color: rgba(1, 12, 128, 0.14);
    box-shadow: 0 22px 54px rgba(8, 27, 90, 0.12);
}

.contactPage__channelIcon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: 1rem;
    background: linear-gradient(145deg, rgba(1, 12, 128, 0.1), rgba(0, 128, 255, 0.08));
    color: #010c80;
}

.contactPage__channelTitle {
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
}

.contactPage__channelDetail {
    margin-bottom: 0.75rem;
}

.contactPage__channelMeta {
    margin-bottom: 0;
    font-weight: 700;
}

.contactPage__contentGrid {
    grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.8fr);
    align-items: start;
    padding-bottom: clamp(4rem, 7vw, 6rem);
}

.contactPage__formPanel {
    min-width: 0;
}

.contactPage__formCard {
    padding: clamp(1.2rem, 2vw, 1.8rem);
}

.contactPage__sectionIntro {
    margin-bottom: 1.25rem;
}

.contactPage__sidebar {
    display: grid;
    gap: 1rem;
    position: sticky;
    top: 1.5rem;
}

.contactPage__sidebarTitle {
    margin-bottom: 0.75rem;
    font-size: 1.5rem;
    line-height: 1.1;
}

.contactPage__sidebarMeta {
    margin-top: 1.1rem;
    font-weight: 700;
}

.contactPage__mapCard {
    overflow: hidden;
    min-height: 22rem;
}

.contactPage__map {
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
    .contactPage__heroGrid,
    .contactPage__contentGrid,
    .contactPage__channelGrid {
        grid-template-columns: 1fr;
    }

    .contactPage__title {
        max-width: 100%;
    }

    .contactPage__sidebar {
        position: static;
    }
}

@media screen and (max-width: 600px) {
    .contactPage__hero {
        padding: 3.75rem 0 2rem;
    }

    .contactPage__title {
        font-size: clamp(2rem, 9vw, 2.8rem);
        line-height: 1;
    }

    .contactPage__heroPanel,
    .contactPage__channelCard,
    .contactPage__formCard,
    .contactPage__sidebarCard {
        border-radius: 1.2rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .contactPage__heroCopy,
    .contactPage__heroPanel,
    .contactPage__channelCard,
    .contactPage__formPanel,
    .contactPage__sidebar {
        animation: none;
    }

    .contactPage__channelCard {
        transition: none;
    }
}
</style>
