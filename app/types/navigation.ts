export type AnnouncementMessage = {
    id: string
    message: string
    link_url?: string | null
    is_active: boolean
    starts_at?: string | null
    ends_at?: string | null
    sort_order: number
}

export type AnnouncementBarResponse = {
    announcement_messages: AnnouncementMessage[]
}

export type NavigationCategory = {
    id: string
    handle: string
    name: string
    imageUrl?: string | null
}

export type LocationItem = {
    title: string
    value: string
}
