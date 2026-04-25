import type { Router } from "vue-router"

import type { PostHog } from "posthog-js"

import { posthog } from "posthog-js"

type PostHogConfig = {
    publicKey?: string
    host?: string
}

let posthogClient: PostHog | null = null
let pageviewHookRegistered = false

export function getPostHogClient(): PostHog | null {
    return posthogClient
}

export function initPostHogClient(config: PostHogConfig, router: Router): PostHog | null {
    if (!config.publicKey || !config.host) {
        return null
    }

    if (!posthogClient) {
        posthogClient = posthog.init(config.publicKey, {
            api_host: config.host,
            capture_pageview: false,
            capture_pageleave: true,
            capture_exceptions: true,
            autocapture: false,
            disable_session_recording: true
        })
    }

    posthog.clear_opt_in_out_capturing()
    posthog.opt_in_capturing()
    posthog.capture("$pageview", {
        current_url: router.currentRoute.value.fullPath
    })

    if (!pageviewHookRegistered) {
        router.afterEach((to) => {
            if (posthog.has_opted_out_capturing()) {
                return
            }

            posthog.capture("$pageview", {
                current_url: to.fullPath
            })
        })

        pageviewHookRegistered = true
    }

    return posthogClient
}

export function disablePostHogClient(): void {
    if (!posthogClient) {
        return
    }

    posthog.opt_out_capturing()
    posthog.reset(true)
    posthogClient = null
}
