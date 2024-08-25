export const useProductStore = defineStore("product", () => {
    const store = reactive({
        products: [],
        collections: []
    })
    const fetchData = async () => {
        const { products: apiProducts } = await $fetch("/api/products")
        const { collections: apiCollections } = await $fetch("/api/collections")
        store.products.push(...apiProducts)
        store.collections.push(...apiCollections)
    }
    return {
        ...store,
        fetchData
    }
})
