<script setup lang="ts">
useHead({
    title: "Cart | Ecommerce"
})

const cartStore = useCartStore()
const { cart } = storeToRefs(cartStore)

const { removeLineItem } = cartStore

const formatPrice = (amount: number) => {
    return `${amount.toFixed(2)} €`
}

const removeItem = async (lineItemId: string) => {
    if (!cart.value?.id) {
        throw new Error("No active cart found")
    }

    try {
        await removeLineItem(lineItemId)
        return
    } catch (err) {
        console.error("Failed to remove item:", err)
        return
    }
}
</script>

<template>
    <section>
        <div class="container overflow-x-hidden">
            <div
                class="mt-4 mt-lg-5 d-flex flex-column flex-lg-row gap-0 gap-lg-0 align-items-start align-items-lg-center justify-content-between"
            >
                <h1 class="h4 mb-3 mb-lg-0 text-inter fw-bolder">Shopping cart</h1>

                <div class="w-100 mt-3 d-block d-lg-none">
                    <p class="mb-0"><strong>Total: </strong>{{ formatPrice(cart?.total || 0) }}</p>
                </div>
            </div>
            <div class="row cart-row gx-5">
                <div class="cart-items col-lg-7">
                    <div class="order-products-grid">
                        <div v-for="item in cart?.items || []" :key="item.id" class="search-product px-0">
                            <div class="search-img-wrapper mt-1">
                                <a :href="`/product/${item.product_handle}`">
                                    <NuxtImg
                                        :src="item.thumbnail || '/images/placeholder.png'"
                                        width="67"
                                        height="93"
                                        :alt="item.product_title ?? ''"
                                        :title="item.product_title"
                                        loading="lazy"
                                    />
                                </a>
                            </div>
                            <div class="flex-grow-1">
                                <div class="d-flex align-items-start gap-3 justify-content-between">
                                    <div class="search-product-description">
                                        <p class="cart-description-title">
                                            <a :href="`/product/${item.product_handle}`">{{ item.product_title }}</a>
                                        </p>
                                        <span class="description">{{ item.product_description }}</span>
                                        <span class="text-small-2 d-block">Option: {{ item.variant_title }}</span>
                                        <span class="text-small-2">Code: {{ item.variant_sku ?? "N/A" }}</span>
                                    </div>
                                    <div class="side-content m-0">
                                        <button type="button" class="btn p-0 cart-remove" aria-label="Remove" @click="removeItem(item.id)">
                                            Remove
                                        </button>
                                    </div>
                                </div>
                                <div class="cart-item-bottom">
                                    <div class="text-end">
                                        <p>
                                            <b>{{ formatPrice((item.unit_price || 0) * (item.quantity || 1)) }}</b>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-5">
                    <div class="price-date-details">
                        <div class="subtotal-card mw-100 w-100">
                            <h2 class="mb-3 text-inter fw-600">Order summary</h2>

                            <div class="w-100">
                                <form id="couponForm" action="" class="needs-validation" novalidate>
                                    <div class="input-group">
                                        <input
                                            type="text"
                                            name="couponTextInput"
                                            required
                                            class="form-control"
                                            placeholder="Enter coupon code"
                                            aria-label="Enter coupon code"
                                            aria-describedby="coupon-addon"
                                        />
                                        <button id="coupon-addon" class="primary-btn" type="submit">Apply</button>
                                        <div class="invalid-feedback">Please enter coupon code.</div>
                                    </div>
                                </form>
                            </div>
                            <div class="subtotal-item">
                                <span><b>Subtotal:</b></span>
                                <span>{{ formatPrice(cart?.subtotal || 0) }}</span>
                            </div>
                            <div class="subtotal-item mt-3">
                                <span class="total"><strong>Total:</strong></span>
                                <span>{{ formatPrice(cart?.total || 0) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
