<script setup lang="ts">
import AppBreadcrumbs from "~/components/Shared/AppBreadcrumbs.vue"

const breadcrumbItems = [{ label: "Home", to: "/" }, { label: "Privacy Policy" }]

useHead({
    title: "Privacy Policy | Medusa Commerce"
})
</script>

<template>
    <main class="min-h-screen bg-linear-to-b from-slate-50 via-indigo-50 to-orange-50 text-slate-900">
        <section class="mx-auto w-full max-w-5xl px-4 pt-8 pb-14 sm:px-6 lg:px-8 lg:pt-12">
            <div class="rounded-panel border border-slate-200/95 bg-white/95 p-5 sm:p-7 lg:p-9">
                <AppBreadcrumbs :items="breadcrumbItems" class="mb-4" />

                <div class="max-w-3xl">
                    <span
                        class="tracking-label-tight inline-flex min-h-9 items-center rounded-full border border-slate-300/90 bg-slate-50 px-4 text-xs font-semibold text-slate-700 uppercase"
                    >
                        Privacy policy
                    </span>
                    <h1 class="mt-4 text-3xl font-semibold tracking-tighter text-slate-950 sm:text-5xl">Privacy Policy</h1>
                    <p class="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                        This policy explains how Medusa Commerce collects, uses, stores, and protects personal data when you browse the
                        storefront, place an order, create an account, or contact the team.
                    </p>
                </div>

                <div class="mt-10 space-y-10">
                    <section class="space-y-5 rounded-3xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
                        <div class="grid gap-4 sm:grid-cols-3 sm:items-start sm:gap-6">
                            <div class="space-y-3 sm:col-span-2">
                                <p class="text-sm font-semibold tracking-widest text-slate-500 uppercase">Policy details</p>
                                <p class="text-base leading-7 text-slate-700">
                                    This Privacy Policy explains how Medusa Commerce collects, uses, stores, and shares personal data in
                                    connection with the storefront, customer accounts, orders, support requests, reviews, and related
                                    services.
                                </p>
                            </div>
                            <div class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 sm:col-span-1 sm:min-w-60">
                                <p><span class="font-semibold text-slate-950">Effective date:</span> 25 April 2026</p>
                                <p class="mt-1"><span class="font-semibold text-slate-950">Controller:</span> Medusa Commerce</p>
                                <p class="mt-1"><span class="font-semibold text-slate-950">Location:</span> Vilnius, Lithuania</p>
                            </div>
                        </div>
                    </section>

                    <section class="space-y-4">
                        <h2 class="text-2xl font-semibold tracking-tighter text-slate-950 sm:text-3xl">1. Data Controller</h2>
                        <p class="text-base leading-8 text-slate-700">
                            For the purposes of applicable data protection law, including the General Data Protection Regulation (GDPR), the
                            data controller for personal data processed through this storefront is
                            <strong class="font-semibold text-slate-950">Medusa Commerce</strong>. If you have any questions about this
                            policy or wish to exercise your data protection rights, you can contact us at
                            <a
                                href="mailto:info@medusa-commerce.de"
                                class="font-semibold text-slate-950 underline decoration-slate-300 underline-offset-4"
                            >info@medusa-commerce.de</a
                            >.
                        </p>
                    </section>

                    <section class="space-y-4">
                        <h2 class="text-2xl font-semibold tracking-tighter text-slate-950 sm:text-3xl">2. Personal Data We Collect</h2>
                        <p class="text-base leading-8 text-slate-700">The data we collect depends on how you use the site.</p>
                        <div class="grid gap-4 sm:grid-cols-2">
                            <div class="rounded-card border border-slate-200 bg-white p-5">
                                <h3 class="text-lg font-semibold text-slate-950">Account and checkout details</h3>
                                <p class="mt-2 text-sm leading-7 text-slate-600">
                                    Name, email address, phone number, billing address, shipping address, and other information required to
                                    create an account, place an order, or manage delivery.
                                </p>
                            </div>
                            <div class="rounded-card border border-slate-200 bg-white p-5">
                                <h3 class="text-lg font-semibold text-slate-950">Order and transaction records</h3>
                                <p class="mt-2 text-sm leading-7 text-slate-600">
                                    Purchased products, cart contents, totals, shipping selections, delivery status, refunds, and related
                                    customer support history.
                                </p>
                            </div>
                            <div class="rounded-card border border-slate-200 bg-white p-5">
                                <h3 class="text-lg font-semibold text-slate-950">Payment-related information</h3>
                                <p class="mt-2 text-sm leading-7 text-slate-600">
                                    Payment details are processed by our payment providers. We do not store full payment card details on
                                    this site.
                                </p>
                            </div>
                            <div class="rounded-card border border-slate-200 bg-white p-5">
                                <h3 class="text-lg font-semibold text-slate-950">Profile and saved account data</h3>
                                <p class="mt-2 text-sm leading-7 text-slate-600">
                                    Saved addresses, login-related details, and order history associated with your customer account.
                                </p>
                            </div>
                            <div class="rounded-card border border-slate-200 bg-white p-5 sm:col-span-2">
                                <h3 class="text-lg font-semibold text-slate-950">Communications, review, and technical data</h3>
                                <p class="mt-2 text-sm leading-7 text-slate-600">
                                    Information you provide when contacting support, subscribing to email updates, or submitting a review,
                                    as well as IP address, browser type, device data, referral source, page views, and cookie-related data
                                    needed to operate and measure the storefront.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section class="space-y-4">
                        <h2 class="text-2xl font-semibold tracking-tighter text-slate-950 sm:text-3xl">3. How We Use Personal Data</h2>
                        <ul class="grid gap-3 text-base leading-8 text-slate-700">
                            <li class="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                                <strong class="font-semibold text-slate-950">Storefront operations:</strong> To run the site, maintain
                                sessions, preserve cart state, and support region or account preferences.
                            </li>
                            <li class="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                                <strong class="font-semibold text-slate-950">Order fulfilment:</strong> To confirm purchases, arrange
                                payment, coordinate shipping, and provide order updates.
                            </li>
                            <li class="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                                <strong class="font-semibold text-slate-950">Customer support:</strong> To respond to delivery questions,
                                returns, account issues, and product-related requests.
                            </li>
                            <li class="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                                <strong class="font-semibold text-slate-950">Service improvement:</strong> To understand site usage and
                                improve navigation, search, product discovery, and checkout.
                            </li>
                            <li class="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                                <strong class="font-semibold text-slate-950">Marketing communications:</strong> To send updates only where
                                you have requested them or where otherwise permitted by law.
                            </li>
                            <li class="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                                <strong class="font-semibold text-slate-950">Security and abuse prevention:</strong> To detect fraud, spam,
                                misuse, and malicious activity affecting public-facing forms or commerce flows.
                            </li>
                            <li class="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                                <strong class="font-semibold text-slate-950">Legal compliance:</strong> To keep records required for tax,
                                accounting, consumer protection, fraud prevention, and dispute handling.
                            </li>
                        </ul>
                    </section>

                    <section class="space-y-4">
                        <h2 class="text-2xl font-semibold tracking-tighter text-slate-950 sm:text-3xl">
                            4. GDPR Legal Bases for Processing
                        </h2>
                        <p class="text-base leading-8 text-slate-700">
                            Where GDPR applies, we process personal data on one or more of the following legal bases:
                        </p>
                        <div class="overflow-hidden rounded-card border border-slate-200 bg-white">
                            <div class="overflow-x-auto">
                                <table class="min-w-full border-collapse text-left text-sm text-slate-700">
                                    <thead class="bg-slate-50 text-slate-950">
                                        <tr>
                                            <th class="border-b border-slate-200 px-4 py-3 font-semibold">Purpose</th>
                                            <th class="border-b border-slate-200 px-4 py-3 font-semibold">Legal basis</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="border-b border-slate-200 px-4 py-3 align-top">
                                                Creating accounts, maintaining carts, processing orders, and delivering purchases
                                            </td>
                                            <td class="border-b border-slate-200 px-4 py-3 align-top">
                                                Performance of a contract or steps taken at your request before entering into a contract
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="border-b border-slate-200 px-4 py-3 align-top">
                                                Handling support requests, product questions, and post-purchase care
                                            </td>
                                            <td class="border-b border-slate-200 px-4 py-3 align-top">
                                                Performance of a contract and our legitimate interests in providing customer support
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="border-b border-slate-200 px-4 py-3 align-top">
                                                Keeping financial records, tax records, and compliance documentation
                                            </td>
                                            <td class="border-b border-slate-200 px-4 py-3 align-top">
                                                Compliance with a legal obligation
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="border-b border-slate-200 px-4 py-3 align-top">
                                                Preventing fraud, spam, abuse, and misuse of the storefront
                                            </td>
                                            <td class="border-b border-slate-200 px-4 py-3 align-top">
                                                Our legitimate interests in protecting the business, customers, and platform integrity
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="border-b border-slate-200 px-4 py-3 align-top">
                                                Analytics and non-essential measurement technologies
                                            </td>
                                            <td class="border-b border-slate-200 px-4 py-3 align-top">Consent, where required</td>
                                        </tr>
                                        <tr>
                                            <td class="px-4 py-3 align-top">Newsletter and promotional emails</td>
                                            <td class="px-4 py-3 align-top">
                                                Consent or, where permitted by law, our legitimate interests in promoting our products
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    <section class="space-y-4">
                        <h2 class="text-2xl font-semibold tracking-tighter text-slate-950 sm:text-3xl">
                            5. Cookies and Similar Technologies
                        </h2>
                        <p class="text-base leading-8 text-slate-700">
                            We use cookies and similar technologies to operate the storefront and, where permitted, understand how visitors
                            use it. Essential cookies are used to keep the ecommerce experience functional. Analytics cookies are only
                            enabled after you explicitly accept them through our cookie banner.
                        </p>
                        <div class="overflow-hidden rounded-card border border-slate-200 bg-white">
                            <div class="overflow-x-auto">
                                <table class="min-w-full border-collapse text-left text-sm text-slate-700">
                                    <thead class="bg-slate-50 text-slate-950">
                                        <tr>
                                            <th class="border-b border-slate-200 px-4 py-3 font-semibold">Cookie category</th>
                                            <th class="border-b border-slate-200 px-4 py-3 font-semibold">Why we use it</th>
                                            <th class="border-b border-slate-200 px-4 py-3 font-semibold">Examples in Medusa Commerce</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="border-b border-slate-200 px-4 py-3 align-top font-semibold text-slate-950">
                                                Strictly necessary
                                            </td>
                                            <td class="border-b border-slate-200 px-4 py-3 align-top">
                                                Required to keep the storefront secure and support core ecommerce functions.
                                            </td>
                                            <td class="border-b border-slate-200 px-4 py-3 align-top">
                                                Cart continuity, login sessions, region selection, checkout state, and security-related
                                                preferences.
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="px-4 py-3 align-top font-semibold text-slate-950">Analytics</td>
                                            <td class="px-4 py-3 align-top">
                                                Used only after consent to understand how visitors interact with the site and where
                                                improvements are needed.
                                            </td>
                                            <td class="px-4 py-3 align-top">
                                                PostHog analytics used to improve product discovery, navigation, and checkout flows.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <p class="text-sm leading-7 text-slate-600">
                            You can manage your cookie preferences through the cookie banner. If you want to reset your choice later, you
                            can clear cookies in your browser and set your preference again on your next visit.
                        </p>
                    </section>

                    <section class="space-y-4">
                        <h2 class="text-2xl font-semibold tracking-tighter text-slate-950 sm:text-3xl">
                            6. How We Share Personal Data
                        </h2>
                        <p class="text-base leading-8 text-slate-700">
                            We do not sell personal data. We may share it with trusted providers where necessary to run the business,
                            including:
                        </p>
                        <ul class="grid gap-3 text-base leading-8 text-slate-700">
                            <li>commerce and infrastructure providers that support product, cart, order, and account operations;</li>
                            <li>payment providers that authorize and process transactions securely;</li>
                            <li>delivery and logistics partners that ship products and support tracking;</li>
                            <li>analytics, marketing, and subscription tools used in accordance with your settings and applicable law;</li>
                            <li>security and verification providers, including bot-protection tools used on public-facing forms;</li>
                            <li>
                                authorities, advisers, or counterparties where disclosure is required by law or needed to protect our rights
                                and customers.
                            </li>
                        </ul>
                    </section>

                    <section class="space-y-4">
                        <h2 class="text-2xl font-semibold tracking-tighter text-slate-950 sm:text-3xl">
                            7. Reviews, Forms, and Customer Communications
                        </h2>
                        <p class="text-base leading-8 text-slate-700">
                            If you submit a support request, join a mailing list, or leave a product review, we process the information you
                            provide so we can respond, moderate submissions, improve service quality, and maintain appropriate records.
                        </p>
                        <p class="text-base leading-8 text-slate-700">
                            We may use verification tools such as Cloudflare Turnstile on public-facing forms to reduce spam and automated
                            abuse. Information processed through those tools is used for security purposes.
                        </p>
                    </section>

                    <section class="space-y-4">
                        <h2 class="text-2xl font-semibold tracking-tighter text-slate-950 sm:text-3xl">8. Data Retention</h2>
                        <p class="text-base leading-8 text-slate-700">
                            We keep personal data only for as long as necessary for the purpose for which it was collected, including
                            customer support, order fulfilment, security, and legal compliance.
                        </p>
                        <div class="overflow-hidden rounded-card border border-slate-200 bg-white">
                            <div class="overflow-x-auto">
                                <table class="min-w-full border-collapse text-left text-sm text-slate-700">
                                    <thead class="bg-slate-50 text-slate-950">
                                        <tr>
                                            <th class="border-b border-slate-200 px-4 py-3 font-semibold">Data type</th>
                                            <th class="border-b border-slate-200 px-4 py-3 font-semibold">Typical retention approach</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="border-b border-slate-200 px-4 py-3 align-top">Account profile data</td>
                                            <td class="border-b border-slate-200 px-4 py-3 align-top">
                                                Retained while your account remains active and for a reasonable period afterward where
                                                needed for support, fraud prevention, or legal claims.
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="border-b border-slate-200 px-4 py-3 align-top">Order and transaction records</td>
                                            <td class="border-b border-slate-200 px-4 py-3 align-top">
                                                Retained for as long as necessary to fulfil the order and meet accounting, tax, refund, and
                                                consumer protection obligations.
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="border-b border-slate-200 px-4 py-3 align-top">Contact and support messages</td>
                                            <td class="border-b border-slate-200 px-4 py-3 align-top">
                                                Retained for as long as needed to handle the request and maintain a support history where
                                                reasonably necessary.
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="border-b border-slate-200 px-4 py-3 align-top">Review submissions</td>
                                            <td class="border-b border-slate-200 px-4 py-3 align-top">
                                                Retained while the review remains published or needed for moderation, dispute handling, or
                                                abuse prevention.
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="border-b border-slate-200 px-4 py-3 align-top">Analytics and cookie-related data</td>
                                            <td class="border-b border-slate-200 px-4 py-3 align-top">
                                                Retained according to the settings of the relevant analytics provider and your cookie
                                                preferences.
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="px-4 py-3 align-top">Security and verification logs</td>
                                            <td class="px-4 py-3 align-top">
                                                Retained only as long as needed to monitor abuse, investigate incidents, and protect the
                                                storefront and its users.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    <section class="space-y-4">
                        <h2 class="text-2xl font-semibold tracking-tighter text-slate-950 sm:text-3xl">9. International Transfers</h2>
                        <p class="text-base leading-8 text-slate-700">
                            Some of our service providers may process personal data outside your country. Where this happens, we rely on
                            appropriate safeguards required by applicable law, such as contractual protections or other recognized transfer
                            mechanisms.
                        </p>
                    </section>

                    <section class="space-y-4">
                        <h2 class="text-2xl font-semibold tracking-tighter text-slate-950 sm:text-3xl">10. Data Security</h2>
                        <p class="text-base leading-8 text-slate-700">
                            We use reasonable technical and organizational measures to protect personal data against unauthorized access,
                            loss, misuse, or disclosure. No online service or storage system can be guaranteed completely secure, so we
                            cannot promise absolute security.
                        </p>
                    </section>

                    <section class="space-y-4">
                        <h2 class="text-2xl font-semibold tracking-tighter text-slate-950 sm:text-3xl">11. Your Rights</h2>
                        <p class="text-base leading-8 text-slate-700">
                            Depending on your location and the laws that apply, you may have the right to request access to your personal
                            data, ask us to correct inaccurate data, request deletion, object to certain processing, restrict processing,
                            request portability, or withdraw consent where consent is the basis for processing.
                        </p>
                        <p class="text-base leading-8 text-slate-700">
                            You may also opt out of marketing communications at any time by using the unsubscribe link in the message or by
                            contacting us directly.
                        </p>
                    </section>

                    <section class="space-y-4">
                        <h2 class="text-2xl font-semibold tracking-tighter text-slate-950 sm:text-3xl">
                            12. Complaints and Supervisory Authority
                        </h2>
                        <p class="text-base leading-8 text-slate-700">
                            If you believe that our processing of your personal data does not comply with applicable data protection law, we
                            ask that you contact us first so we can try to resolve the issue. You also have the right to lodge a complaint
                            with the supervisory authority responsible for data protection in your place of residence, work, or the place of
                            the alleged infringement.
                        </p>
                    </section>

                    <section class="space-y-4">
                        <h2 class="text-2xl font-semibold tracking-tighter text-slate-950 sm:text-3xl">13. Third-Party Links</h2>
                        <p class="text-base leading-8 text-slate-700">
                            The site may contain links to third-party websites or services. We are not responsible for the privacy practices
                            of those third parties, and you should review their own policies before providing personal data.
                        </p>
                    </section>

                    <section class="space-y-4">
                        <h2 class="text-2xl font-semibold tracking-tighter text-slate-950 sm:text-3xl">14. Changes to This Policy</h2>
                        <p class="text-base leading-8 text-slate-700">
                            We may update this Privacy Policy from time to time to reflect changes to the storefront, our services, legal
                            requirements, or our data practices. The latest version will always be published on this page with the revised
                            effective date.
                        </p>
                    </section>

                    <section class="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                        <h2 class="text-2xl font-semibold tracking-tighter text-slate-950 sm:text-3xl">15. Contact Us</h2>
                        <p class="text-base leading-8 text-slate-700">
                            For privacy questions or data protection requests, contact Medusa Commerce at
                            <a
                                href="mailto:info@medusa-commerce.de"
                                class="font-semibold text-slate-950 underline decoration-slate-300 underline-offset-4"
                            >info@medusa-commerce.de</a
                            >.
                        </p>
                        <p class="text-base leading-8 text-slate-700">Location: Vilnius, Lithuania</p>
                    </section>
                </div>
            </div>
        </section>
    </main>
</template>
