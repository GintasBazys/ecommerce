import { LIMIT } from "~/utils/consts"
import type { Product, ProductCollection, Cart } from "@medusajs/medusa"

interface ProductResponse {
    products: Product[]
    count: number
    productLimit: number
    productOffset: number
}

export interface CollectionResponse {
    collections: ProductCollection[]
}

export interface CartResponse {
    cart: Cart
}

export const useProductStore = defineStore("product", () => {
    const products = ref<Product[]>([])
    const collections = ref<ProductCollection[]>([])
    const limit = ref(LIMIT)
    const offset = ref(0)
    const totalCount = ref(0)
    const bestSellers = ref<Product[]>([])

    const setProducts = (newProducts: Product[]) => {
        if (Array.isArray(newProducts)) {
            products.value = newProducts
        }
    }
    const setBestSellers = (newProducts: Product[]) => {
        bestSellers.value = newProducts
    }

    const setTotalCount = (count: number) => {
        totalCount.value = count
    }

    const setCollections = (newCollections: ProductCollection[]) => {
        if (Array.isArray(newCollections)) {
            collections.value = newCollections
        }
    }

    const route = useRoute()
    const pageNumber = parseInt(route.query.page as string, 10) || 1
    offset.value = (pageNumber - 1) * limit.value

    const fetchData = async () => {
        try {
            const response = await $fetch<ProductResponse>("/api/products", {
                params: { limit: limit.value, offset: offset.value }
            })
            if (response) {
                const { products: apiProducts, count, productLimit, productOffset } = response
                limit.value = productLimit
                offset.value = productOffset
                setProducts(apiProducts)
                setTotalCount(count)
            }
        } catch (error) {
            console.error("Failed to fetch data:", error)
        }
    }

    const fetchLinks = async () => {
        try {
            const collectionsResponse = await $fetch<CollectionResponse>("/api/collections")
            setCollections(collectionsResponse["collections"])
        } catch (error) {
            console.error("Failed to fetch data:", error)
        }
    }
    const fetchBestSellers = async () => {
        try {
            const bestSellersResponse = await $fetch(`/api/best-selling`)
            setBestSellers(bestSellersResponse)
        } catch (error) {
            console.error("Failed to fetch data:", error)
        }
    }

    return {
        products,
        collections,
        bestSellers,
        limit,
        offset,
        totalCount,
        fetchData,
        fetchLinks,
        fetchBestSellers
    }
})
