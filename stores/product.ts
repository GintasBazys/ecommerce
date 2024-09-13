// Define the structure of a PricedProduct
import { LIMIT } from "~/utils/consts"

interface PricedProduct {
    id: string
    title: string
    thumbnail: string
    variants: {
        title: string
        size: string
        color: string
        inventoryQuantity: number
        prices: {
            amount: number
            currency_code: string
        }[]
    }[]
}

interface Collection {
    id: string
    title: string
    handle: string
}

interface ProductResponse {
    products: PricedProduct[]
    count: number
    productLimit: number
    productOffset: number
}

export interface CollectionResponse {
    collections: Collection[]
}

export const useProductStore = defineStore("product", () => {
    const products = ref<PricedProduct[]>([])
    const collections = ref<Collection[]>([])
    const limit = ref(LIMIT)
    const offset = ref(0)
    const totalCount = ref(0)
    const bestSellers = ref<PricedProduct[]>([])

    const setProducts = (newProducts: PricedProduct[]) => {
        if (Array.isArray(newProducts)) {
            products.value = newProducts
        }
    }
    const setBestSellers = (newProducts: PricedProduct[]) => {
        bestSellers.value = newProducts
    }

    const setTotalCount = (count: number) => {
        totalCount.value = count
    }

    const setCollections = (newCollections: Collection[]) => {
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
            if ("count" in response && "products" in response) {
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
            const bestSellersResponse = await $fetch<ProductResponse>("http://localhost:9000/store/best-selling")
            setBestSellers(bestSellersResponse["products"])
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
