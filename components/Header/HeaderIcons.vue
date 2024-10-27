<script setup lang="ts">
import { useCustomerStore } from "~/stores/customer"

const customerStore = useCustomerStore()
const cartStore = useCartStore()

const { customer } = storeToRefs(customerStore)
const { itemCount } = storeToRefs(cartStore)
</script>

<template v-slot:header-icons>
    <div class="d-flex gap-3 align-items-center header-icons">
        <NuxtLink href="/search">
            <NuxtImg src="/images/search.svg" width="24" height="24" alt="Search icon" loading="eager" />
        </NuxtLink>
        <NuxtLink href="/cart" class="me-2 position-relative">
            <NuxtImg src="/images/shopping_cart.svg" width="24" height="24" alt="Shopping icon" loading="eager" />
            <span class="badge rounded-pill cart-counter">{{ itemCount }}</span>
        </NuxtLink>
        <template v-if="customer && customer.id">
            <NuxtLink class="btn sign-in-btn" href="/account">
                <div class="d-flex align-items-center">
                    <NuxtImg src="/images/person.svg" width="24" height="24" alt="person icon" loading="eager" />
                    <span class="ms-2 d-none d-lg-inline-block">{{ customer.first_name }}</span>
                </div>
            </NuxtLink>
        </template>
        <template v-else>
            <NuxtLink class="btn sign-in-btn" href="/signin">
                <div class="d-flex align-items-center">
                    <NuxtImg src="/images/person.svg" width="24" height="24" alt="person icon" loading="eager" />
                    <span class="ms-2 d-none d-lg-inline-block">Sign In</span>
                </div>
            </NuxtLink>
        </template>
        <button
            class="navbar-toggler p-0 border-0"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#navbarNavAltMarkup"
            aria-controls="navbarNavAltMarkup"
            aria-expanded="false"
            aria-label="Toggle navigation"
        >
            <span class="navbar-toggler-icon" />
        </button>
    </div>
</template>
