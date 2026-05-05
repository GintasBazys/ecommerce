export type NuxtImageProps = {
    src: string
    alt: string
    width?: string | number
    height?: string | number
    sizes?: string
    format?: string
    quality?: string | number
    densities?: string
    loading?: "lazy" | "eager"
    decoding?: "async" | "auto" | "sync"
    fetchpriority?: "high" | "low" | "auto"
    preload?: boolean | { fetchPriority: "high" | "low" | "auto" }
}
