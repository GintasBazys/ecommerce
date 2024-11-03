import { LIMIT } from "~/utils/consts"
import type { Product, ProductCollection, Cart, ProductCategory } from "@medusajs/medusa"

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
    success: Cart
    cart: Cart
}

export const useProductStore = defineStore("product", () => {
    const products = ref<Product[]>([])
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

    const categories = ref<ProductCategory[]>([])

    const setCategories = (newCategories: ProductCategory[]) => {
        if (Array.isArray(newCategories)) {
            categories.value = newCategories
        }
    }

    const route = useRoute()
    const pageNumber = parseInt(route.query.page as string, 10) || 1
    offset.value = (pageNumber - 1) * limit.value

    const fetchData = async (regionId?: string) => {
        try {
            const response = await $fetch<ProductResponse>("/api/products", {
                params: {
                    limit: limit.value,
                    offset: offset.value,
                    ...(regionId ? { region_id: regionId } : {})
                }
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
            const categoriesResponse = await $fetch("/api/categories")
            setCategories(categoriesResponse["product_categories"])
        } catch (error) {
            console.error("Failed to fetch categories:", error)
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
        bestSellers,
        categories,
        limit,
        offset,
        totalCount,
        fetchData,
        fetchLinks,
        fetchBestSellers
    }
})
