import type { ProductDTO, CartDTO } from "@medusajs/types"

import { LIMIT } from "@/utils/consts"

interface ProductResponse {
    products: ProductDTO[]
    count: number
    productLimit: number
    productOffset: number
}

type NavigationCategory = {
    id: string
    handle: string
    name: string
    imageUrl?: string | null
}

type ProductFetchOptions = {
    limit?: number
    view?: "default" | "card"
}

export interface CartResponse {
    success: boolean
    cart: CartDTO
}

export const useProductStore = defineStore("product", () => {
    const products = ref<ProductDTO[]>([])
    const limit = ref<number>(LIMIT)
    const offset = ref<number>(0)
    const totalCount = ref<number>(0)
    const bestSellers = ref<ProductDTO[]>([])

    const setProducts = (newProducts: ProductDTO[]) => {
        if (Array.isArray(newProducts)) {
            products.value = newProducts
        }
    }
    const setBestSellers = (newProducts: ProductDTO[]) => {
        bestSellers.value = newProducts
    }

    const setTotalCount = (count: number) => {
        totalCount.value = count
    }

    const categories = ref<NavigationCategory[]>([])

    const setCategories = (newCategories: NavigationCategory[]) => {
        if (Array.isArray(newCategories)) {
            categories.value = newCategories
        }
    }

    const route = useRoute()
    const pageNumber = parseInt(route.query.page as string, 10) || 1
    offset.value = (pageNumber - 1) * limit.value

    const fetchData = async (regionId?: string, countryCode?: string, options: ProductFetchOptions = {}) => {
        const requestLimit = options.limit ?? limit.value

        try {
            const response = await $fetch<ProductResponse>("/api/products/products", {
                query: {
                    limit: requestLimit,
                    offset: offset.value,
                    ...(options.view ? { view: options.view } : {}),
                    ...(regionId ? { region_id: regionId } : {}),
                    ...(countryCode ? { country_code: countryCode } : {})
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
            const categoriesResponse = await $fetch<NavigationCategory[]>("/api/categories/navigation", {
                credentials: "include"
            })
            setCategories(categoriesResponse)
        } catch (error) {
            console.error("Failed to fetch categories:", error)
        }
    }
    const fetchBestSellers = async (regionId?: string, countryCode?: string, options: ProductFetchOptions = {}) => {
        if (!regionId) {
            return
        }

        const requestLimit = options.limit ?? limit.value

        try {
            const { products } = await $fetch<{ products: ProductDTO[] }>(`/api/categories/best-selling`, {
                query: {
                    limit: requestLimit,
                    offset: offset.value,
                    ...(options.view ? { view: options.view } : {}),
                    ...(regionId ? { region_id: regionId } : {}),
                    ...(countryCode ? { country_code: countryCode } : {})
                }
            })
            setBestSellers(products)
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
