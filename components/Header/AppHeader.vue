<script setup lang="ts">
import { useProductStore } from "~/stores/product"

const store = useProductStore()
const isHidden = ref(false)

const { $bootstrap } = useNuxtApp()

onMounted(() => {
    const offcanvasElement = document.getElementById("navbarNavAltMarkup")
    const offcanvas = new $bootstrap.Offcanvas(offcanvasElement)

    const hideOffcanvas = () => {
        if (offcanvasElement?.classList.contains("show")) {
            offcanvas.hide()
        }
    }

    const router = useRouter()
    router.afterEach(hideOffcanvas)
})
</script>

<template>
    <div :class="{ 'd-none': isHidden }" class="header-banner bg-primary">
        <div class="container d-flex align-items-center justify-content-between flex-wrap">
            <p class="d-flex flex-fill justify-content-center mb-0 text-white fw-semibold">Free shipping on 35 €</p>
            <button class="banner-button btn border-0 pe-0" type="button" @click="() => (isHidden = true)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                        d="M2.33841 14.8491L15.0663 2.12117C15.4569 1.73064 15.4569 1.09748 15.0663 0.706956C14.6758 0.316431 14.0426 0.316431 13.6521 0.706956L0.924195 13.4349C0.533671 13.8254 0.533671 14.4586 0.924195 14.8491C1.31472 15.2396 1.94788 15.2396 2.33841 14.8491Z"
                        fill="#ffffff"
                    />
                    <path
                        d="M15.0678 13.435L2.33992 0.707107C1.94939 0.316582 1.31623 0.316582 0.925706 0.707107C0.535181 1.09763 0.535181 1.7308 0.925706 2.12132L13.6536 14.8492C14.0442 15.2398 14.6773 15.2398 15.0678 14.8492C15.4584 14.4587 15.4584 13.8256 15.0678 13.435Z"
                        fill="#ffffff"
                    />
                </svg>
            </button>
        </div>
    </div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light sticky-top shadow-lg">
        <div class="container flex-column align-items-start">
            <div class="d-flex justify-content-between align-items-center gap-3 w-100">
                <NuxtLink class="navbar-brand p-0" href="/">
                    <NuxtImg class="img-fluid" src="/images/logo.svg" width="200" height="40" alt="Ecommerce logo" loading="eager" />
                </NuxtLink>
                <div class="d-flex gap-3 align-items-center">
                    <NuxtLink href="/cart" class="me-2 position-relative">
                        <NuxtImg src="/images/shopping_cart.svg" width="24" height="24" alt="Shopping icon" loading="eager" />
                        <span class="badge rounded-pill cart-counter">0</span>
                    </NuxtLink>
                    <NuxtLink class="btn sign-in-btn" href="/signin">
                        <div class="d-flex align-items-center">
                            <NuxtImg src="/images/person.svg" width="24" height="24" alt="person icon" loading="eager" />
                            <span class="ms-2 d-none d-lg-inline-block">Sign In</span>
                        </div>
                    </NuxtLink>
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
            </div>
            <div
                id="navbarNavAltMarkup"
                tabindex="-1"
                class="offcanvas-lg offcanvas-start w-lg-100 justify-content-lg-center d-flex justify-content-lg-center py-4 px-3 py-lg-0 px-lg-0"
            >
                <button
                    type="button"
                    class="btn-close d-lg-none ms-auto"
                    data-bs-target="#navbarNavAltMarkup"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                />
                <div class="navbar-nav">
                    <NuxtLink class="nav-link ps-lg-0 text-danger fw-bold" href="#">Special offers</NuxtLink>
                    <template v-for="collection in store.collections" :key="collection.id">
                        <NuxtLink :href="'/collection/' + collection.handle" class="nav-link">{{ collection.title }}</NuxtLink>
                    </template>
                    <NuxtLink class="nav-link" href="/blog">Blog</NuxtLink>
                    <NuxtLink class="nav-link" href="/about">About us</NuxtLink>
                </div>
            </div>
        </div>
    </nav>
</template>
