import { fetchMedusaJson } from "#server/utils/medusa-proxy"

type StoreAnnouncementMessage = {
    id: string
    message: string
    link_url?: string | null
    is_active?: boolean
    starts_at?: string | null
    ends_at?: string | null
    sort_order?: number
}

type StoreAnnouncementBarResponse = {
    announcement_messages?: StoreAnnouncementMessage[]
}

function normalizeAnnouncementMessage(message: StoreAnnouncementMessage) {
    if (!message?.id || !message.message) {
        return null
    }

    return {
        id: message.id,
        message: message.message,
        link_url: message.link_url || null,
        is_active: message.is_active ?? true,
        starts_at: message.starts_at || null,
        ends_at: message.ends_at || null,
        sort_order: message.sort_order ?? 0
    }
}

export default defineEventHandler(async (event) => {
    setHeader(event, "Cache-Control", "no-store")

    try {
        const payload = await fetchMedusaJson<StoreAnnouncementBarResponse>(event, "/store/announcement-bar/messages", {
            method: "GET"
        })

        return {
            announcement_messages: (payload.announcement_messages || [])
                .map(normalizeAnnouncementMessage)
                .filter((message): message is NonNullable<ReturnType<typeof normalizeAnnouncementMessage>> => Boolean(message))
        }
    } catch {
        return {
            announcement_messages: []
        }
    }
})
