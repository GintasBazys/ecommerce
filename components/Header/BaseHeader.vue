<template>
    <VBanner v-if="!bannerHidden" class="primary" dense icon="mdi-truck-fast">
        <template #actions>
            <VBtn icon @click="bannerHidden = true">
                <VIcon>mdi-close</VIcon>
            </VBtn>
        </template>
        Free shipping on 35 €
    </VBanner>
    <VAppBar app color="white" elevate-on-scroll flat height="64">
        <VContainer fluid>
            <VRow align="center" no-gutters>
                <VCol cols="auto">
                    <NuxtLink to="/">
                        <NuxtImg src="/images/logo.svg" width="200" height="40" alt="Ecommerce logo" />
                    </NuxtLink>
                </VCol>
                <VSpacer />
                <VToolbarItems class="hidden-sm-and-down">
                    <NuxtLink to="/search">
                        <VBtn icon>
                            <VImg src="/images/search.svg" width="24" height="24" />
                        </VBtn>
                    </NuxtLink>

                    <NuxtLink to="/cart" class="position-relative">
                        <VBtn icon>
                            <VImg src="/images/shopping_cart.svg" width="24" height="24" />
                            <VBadge :content="itemCount" color="error" overlap bordered class="cart-counter" />
                        </VBtn>
                    </NuxtLink>

                    <NuxtLink v-if="customer?.id" to="/account">
                        <VBtn text>
                            <VImg src="/images/person.svg" width="24" height="24" />
                            <span class="ms-2">{{ customer.first_name }}</span>
                        </VBtn>
                    </NuxtLink>
                    <NuxtLink v-else to="/signin">
                        <VBtn text>
                            <VImg src="/images/person.svg" width="24" height="24" />
                            <span class="ms-2">Sign In</span>
                        </VBtn>
                    </NuxtLink>
                </VToolbarItems>
                <VBtn icon class="hidden-md-and-up" @click="drawer = !drawer">
                    <VIcon>mdi-menu</VIcon>
                </VBtn>
            </VRow>
        </VContainer>
    </VAppBar>
    <VNavigationDrawer v-model="drawer" app temporary width="250">
        <VList nav>
            <VListItem>
                <NuxtLink class="nav-link" to="#">Special offers</NuxtLink>
            </VListItem>

            <VListItem v-for="cat in categories" :key="cat.id">
                <NuxtLink class="nav-link" :to="`${CATEGORY_HANDLE}/${cat.handle}`">
                    {{ cat.name }}
                </NuxtLink>
            </VListItem>

            <VListItem>
                <NuxtLink class="nav-link" :to="BLOG_HANDLE">Blog</NuxtLink>
            </VListItem>
            <VListItem>
                <NuxtLink class="nav-link" to="/about">About us</NuxtLink>
            </VListItem>
        </VList>
    </VNavigationDrawer>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { storeToRefs } from "pinia"
import { useCustomerStore } from "~/stores/customer"
import { useCartStore } from "~/stores/cartStore"
import { useProductStore } from "~/stores/product"

const bannerHidden = ref(false)
const drawer = ref(false)

const customerStore = useCustomerStore()
const cartStore = useCartStore()
const productStore = useProductStore()

const { customer } = storeToRefs(customerStore)
const { itemCount } = storeToRefs(cartStore)
const { categories } = storeToRefs(productStore)
</script>

<style scoped>
.cart-counter {
    position: absolute;
    top: -4px;
    right: -4px;
}
</style>
