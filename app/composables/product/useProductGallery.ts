import type { ProductDTO } from "@medusajs/types"
import type { ComputedRef } from "vue"
import type { ProductGalleryImage } from "~/types/product"

function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0
}

export function useProductGallery(product: ComputedRef<ProductDTO | null>) {
    const activeImageIndex = ref<number>(0)

    const productImages = computed<ProductGalleryImage[]>(() => {
        const fallbackImage = isNonEmptyString(product.value?.thumbnail) ? product.value.thumbnail.trim() : "/images/placeholder.png"
        const gallery = (product.value?.images ?? [])
            .map((image, index) => {
                const src = isNonEmptyString(image?.url) ? image.url.trim() : ""

                if (!src) {
                    return null
                }

                return {
                    id: image.id || `${product.value?.id || "product"}-image-${index}`,
                    src
                }
            })
            .filter((image): image is ProductGalleryImage => Boolean(image))

        if (!gallery.length) {
            return [{ id: `${product.value?.id || "product"}-fallback`, src: fallbackImage }]
        }

        if (fallbackImage !== "/images/placeholder.png" && !gallery.some((image) => image.src === fallbackImage)) {
            gallery.unshift({ id: `${product.value?.id || "product"}-thumbnail`, src: fallbackImage })
        }

        return gallery
    })

    const activeImage = computed<ProductGalleryImage | null>(() => {
        if (!productImages.value.length) {
            return null
        }

        return productImages.value[activeImageIndex.value] ?? productImages.value[0] ?? null
    })

    function selectImage(index: number): void {
        activeImageIndex.value = Math.min(Math.max(index, 0), Math.max(productImages.value.length - 1, 0))
    }

    function resetGallery(): void {
        activeImageIndex.value = 0
    }

    return {
        activeImageIndex,
        productImages,
        activeImage,
        selectImage,
        resetGallery
    }
}
