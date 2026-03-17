import { H3Event } from "h3"

export function getIncomingCookie(event: H3Event) {
    return event.node.req.headers.cookie || ""
}

export function getSetCookieHeaders(res: Response): string[] {
    const h = res.headers
    
    if (typeof h.getSetCookie === "function") {
        const arr = h.getSetCookie() as string[]
        if (arr?.length) {
            return arr
        }
    }
    
    const single = res.headers.get("set-cookie")
    return single ? [single] : []
}

export function mergeCookieHeader(existing: string, setCookies: string[]) {
    const jar = new Map<string, string>()
    
    existing
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((pair) => {
            const i = pair.indexOf("=")
            if (i > 0) {
                jar.set(pair.slice(0, i), pair.slice(i + 1))
            }
        })
    
    for (const sc of setCookies) {
        const nv = sc.split(";")[0]
        const i = nv?.indexOf("=")
        if (i && nv && i > 0) {
            jar.set(nv.slice(0, i), nv.slice(i + 1))
        }
    }

    return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ")
}

export function forwardSetCookies(event: H3Event, setCookies: string[]) {
    for (const c of setCookies) {
        appendHeader(event, "set-cookie", c)
    }
}

export async function safeJson(res: Response) {
    try {
        return await res.json()
    } catch {
        return null
    }
}
