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

<template>
    <VBanner v-if="!bannerHidden" class="primary-banner" dense icon="mdi-truck-fast">
        <template #actions>
            <VBtn icon @click="bannerHidden = true">
                <VIcon>mdi-close</VIcon>
            </VBtn>
        </template>
        Free shipping on 35 €
    </VBanner>

    <VAppBar style="position: sticky" app color="white" elevate-on-scroll elevation="1" height="64">
        <VContainer>
            <VRow align="center" justify="space-between" no-gutters class="w-100">
                <VCol class="logo-container" cols="auto">
                    <NuxtLink class="flex-center logo-link" to="/">
                        <NuxtImg src="/images/logo.svg" alt="Ecommerce logo" />
                    </NuxtLink>
                </VCol>

                <div class="hidden-md-and-down nav-links-container">
                    <NuxtLink class="mx-2" to="#">Special offers</NuxtLink>
                    <NuxtLink v-for="cat in categories" :key="cat.id" class="mx-2" :to="`${CATEGORY_HANDLE}/${cat.handle}`">
                        {{ cat.name }}
                    </NuxtLink>
                    <NuxtLink class="mx-2" :to="BLOG_HANDLE">Blog</NuxtLink>
                    <NuxtLink class="mx-2" to="/about">About us</NuxtLink>
                </div>

                <VCol cols="auto" class="flex-center">
                    <VToolbarItems class="flex-center">
                        <NuxtLink to="/search">
                            <VBtn icon>
                                <VIcon>mdi-magnify</VIcon>
                            </VBtn>
                        </NuxtLink>

                        <NuxtLink to="/cart" class="position-relative">
                            <VBtn icon>
                                <VIcon>mdi-cart</VIcon>
                                <VBadge :content="itemCount" color="error" overlap bordered class="cart-counter" />
                            </VBtn>
                        </NuxtLink>

                        <NuxtLink v-if="customer?.id" class="hidden-md-and-down" to="/account">
                            <VBtn text>
                                <VIcon>mdi-account</VIcon>
                                <span class="ms-2">{{ customer.first_name }}</span>
                            </VBtn>
                        </NuxtLink>
                        <NuxtLink v-else class="hidden-md-and-down" to="/signin">
                            <VBtn text>
                                <VIcon>mdi-account</VIcon>
                                <span class="ms-2">Sign In</span>
                            </VBtn>
                        </NuxtLink>
                    </VToolbarItems>

                    <VBtn icon class="hidden-lg-and-up" @click="drawer = !drawer">
                        <VIcon>mdi-menu</VIcon>
                    </VBtn>
                </VCol>
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
            <VListItem>
                <NuxtLink v-if="customer?.id" to="/account">
                    <VBtn text>
                        <VIcon>mdi-account</VIcon>
                        <span class="ms-2">{{ customer.first_name }}</span>
                    </VBtn>
                </NuxtLink>
                <NuxtLink v-else to="/signin">
                    <VBtn text>
                        <VIcon>mdi-account</VIcon>
                        <span class="ms-2">Sign In</span>
                    </VBtn>
                </NuxtLink>
            </VListItem>
        </VList>
    </VNavigationDrawer>
</template>

<style scoped>
.cart-counter {
    position: absolute;
    top: 0px;
    right: 10px;
}

.primary-banner {
    position: fixed;
    top: 0;
    width: 100%;
    height: 32px;
    background-color: #1976d2;
    color: white;
    z-index: 1001;
    display: flex;
    align-items: center;
    padding-left: 16px;
}

.v-application--wrap {
    padding-top: 96px;
}

.flex-center {
    display: flex;
    align-items: center;
}

.nav-links-container {
    text-align: center;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

.logo-container {
    max-width: 200px;
    flex-shrink: 1;
    flex-grow: 1;
}

.logo-link img {
    max-width: 100%;
    height: auto;
    object-fit: contain;
}
</style>
