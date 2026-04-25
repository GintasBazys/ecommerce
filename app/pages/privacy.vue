<script setup lang="ts">
import AppBreadcrumbs from "~/components/Shared/AppBreadcrumbs.vue"

const breadcrumbItems = [{ label: "Home", to: "/" }, { label: "Privacy Policy" }]

useHead({
    title: "Privacy | Ecommerce"
})
</script>

<template>
    <main class="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_38%,#fff7ed_100%)] text-slate-900">
        <section class="mx-auto w-full max-w-5xl px-4 pb-14 pt-8 sm:px-6 lg:px-8 lg:pt-12">
            <div class="rounded-[1.9rem] border border-slate-200/95 bg-white/95 p-5 sm:p-7 lg:p-9">
                <AppBreadcrumbs :items="breadcrumbItems" class="mb-4" />

                <div class="max-w-3xl">
                    <span
                        class="inline-flex min-h-9 items-center rounded-full border border-slate-300/90 bg-slate-50 px-4 text-xs font-semibold uppercase tracking-label-tight text-slate-700"
                    >
                        Privacy policy
                    </span>
                    <h1 class="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-5xl">Privacy Policy</h1>
                    <p class="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                        This page explains what information we collect, how we use it, and how cookie choices affect analytics on the
                        storefront.
                    </p>
                </div>

                <article class="prose prose-slate mt-8 max-w-none prose-headings:font-semibold prose-headings:tracking-[-0.02em] prose-p:text-slate-600 prose-li:text-slate-600">
                    <p><strong>Effective date:</strong> [Date]</p>
                    <p>
                        This Privacy Policy describes how [Your Company Name] ("we," "our," or "us") collects, uses, and shares
                        information when you visit or make a purchase from [Website URL] (the "Site").
                    </p>

                    <h2>1. Information We Collect</h2>
                    <p>We collect several types of information from and about users of our Site, including:</p>
                    <ul>
                        <li>
                            <strong>Personal Information:</strong> When you make a purchase or attempt to make a purchase, we collect your
                            name, billing and shipping address, payment information, email address, and phone number.
                        </li>
                        <li><strong>Order Information:</strong> We retain purchase details such as items, preferences, and history.</li>
                        <li><strong>Device Information:</strong> This includes browser, IP address, time zone, and cookies.</li>
                    </ul>

                    <h2>2. How We Use Your Information</h2>
                    <p>We use the information we collect for the following purposes:</p>
                    <ul>
                        <li><strong>To Process Orders:</strong> To fulfill orders, process payments, and send updates.</li>
                        <li><strong>To Improve Our Services:</strong> We use behavior data to enhance our website and services.</li>
                        <li><strong>Marketing:</strong> With consent, we may send promotional emails and updates.</li>
                        <li><strong>Legal Compliance:</strong> To fulfill legal and regulatory obligations.</li>
                    </ul>

                    <h2>3. Sharing Your Information</h2>
                    <p>We may share your information with third parties such as:</p>
                    <ul>
                        <li><strong>Service Providers:</strong> Including payment processors, shipping providers, and related tools.</li>
                        <li><strong>Compliance with Laws:</strong> When legally required to do so.</li>
                        <li><strong>Business Transfers:</strong> In the event of mergers or acquisitions.</li>
                    </ul>

                    <h2>4. Data Security</h2>
                    <p>We implement reasonable safeguards, but no internet method is 100% secure. Use the Site at your own risk.</p>

                    <h2>5. Cookies</h2>
                    <p>
                        We use necessary cookies to keep the storefront, cart, and account experience working correctly. We only use analytics
                        cookies after you explicitly accept them through our cookie banner.
                    </p>
                    <p>
                        When analytics cookies are accepted, we use PostHog to understand how visitors use the site so we can improve
                        navigation, product discovery, and checkout flows. You can decline analytics cookies without affecting essential
                        shopping functionality.
                    </p>

                    <h2>6. Your Rights</h2>
                    <p>
                        You can access, update, or delete your data and opt out of marketing by contacting us or using unsubscribe links.
                    </p>

                    <h2>7. Third-Party Links</h2>
                    <p>Our Site may link to third-party sites. We are not responsible for their privacy practices.</p>

                    <h2>8. Changes to This Privacy Policy</h2>
                    <p>We may revise this policy from time to time. Updates will appear here with an effective date.</p>

                    <h2>9. Contact Us</h2>
                    <p>If you have questions, contact us at:</p>
                    <p><strong>Email:</strong> support@[yourcompany].com</p>
                    <p><strong>Address:</strong> [Your Company Address]</p>
                </article>
            </div>
        </section>
    </main>
</template>
