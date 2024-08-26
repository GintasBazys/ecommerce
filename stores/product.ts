export const useProductStore = defineStore("product", () => {
    const products = ref([])
    const collections = ref([])

    const setProducts = (newProducts) => {
        if (Array.isArray(newProducts)) {
            products.value = newProducts
        }
    }

    const setCollections = (newCollections) => {
        if (Array.isArray(newCollections)) {
            collections.value = newCollections
        }
    }

    const fetchData = async () => {
        try {
            const { products: apiProducts } = await $fetch("/api/products")
            const { collections: apiCollections } = await $fetch("/api/collections")
            setProducts(apiProducts)
            setCollections(apiCollections)
        } catch (error) {
            console.error("Failed to fetch data:", error)
        }
    }

    return {
        products,
        collections,
        fetchData
    }
})
