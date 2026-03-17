export default defineNuxtPlugin(() => {
    if (!import.meta.client) {
        return
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.id = 'silktide-consent-manager-css'
    link.href = '/silktide/silktide-consent-manager.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = '/silktide/silktide-consent-manager.js'
    script.onload = () => {
        window.silktideCookieBannerManager?.updateCookieBannerConfig({
            background: {
                showBackground: true
            },
            cookieIcon: {
                position: 'bottomLeft'
            },
            cookieTypes: [
                {
                    id: 'necessary',
                    name: 'Necessary',
                    description:
                        '<p>These cookies are necessary for the website to function properly and cannot be switched off.</p>',
                    required: true
                },
                {
                    id: 'analytics',
                    name: 'Analytics',
                    defaultValue: true,
                    description:
                        '<p>These cookies help us improve the site by tracking usage.</p>',
                    onAccept() {
                        if (window.gtag) {
                            window.gtag('consent', 'update', {
                                analytics_storage: 'granted'
                            })
                        }
                        window.dataLayer?.push({
                            event: 'consent_accepted_analytics'
                        })
                    },
                    onReject() {
                        if (window.gtag) {
                            window.gtag('consent', 'update', {
                                analytics_storage: 'denied'
                            })
                        }
                    }
                },
                {
                    id: 'advertising',
                    name: 'Advertising',
                    description:
                        '<p>Advertising and personalization cookies.</p>',
                    onAccept() {
                        if (window.gtag) {
                            window.gtag('consent', 'update', {
                                ad_storage: 'granted',
                                ad_user_data: 'granted',
                                ad_personalization: 'granted'
                            })
                        }
                    },
                    onReject() {
                        if (window.gtag) {
                            window.gtag('consent', 'update', {
                                ad_storage: 'denied',
                                ad_user_data: 'denied',
                                ad_personalization: 'denied'
                            })
                        }
                    }
                }
            ],
            text: {
                banner: {
                    description:
                        '<p>We use cookies to enhance your experience. <a href="/cookie-policy" target="_blank">Cookie Policy</a>.</p>',
                    acceptAllButtonText: 'Accept all',
                    rejectNonEssentialButtonText: 'Reject non-essential',
                    preferencesButtonText: 'Preferences'
                },
                preferences: {
                    title: 'Customize your cookie preferences',
                    description:
                        '<p>You can change your preferences at any time.</p>'
                }
            }
        })
    }

    document.head.appendChild(script)
})
