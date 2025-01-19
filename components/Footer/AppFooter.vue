<script setup lang="ts">
import { useProductStore } from "~/stores/product"
import { debounce } from "lodash"

const store = useProductStore()

const isLargeScreen = ref<boolean>(true)

const handleResize = () => {
    isLargeScreen.value = window.innerWidth > 767.98
}

const debouncedResize = debounce(handleResize, 300)

onMounted(() => {
    window.addEventListener("resize", debouncedResize)
    window.dispatchEvent(new Event("resize"))
})

onUnmounted(() => {
    window.removeEventListener("resize", debouncedResize)
})
</script>

<template>
    <footer class="bg-gradient-primary spacer mt-auto">
        <div class="container">
            <div class="row footer-main gy-3">
                <div class="col-lg-3 col-md-6">
                    <p
                        class="footer-collapse dropdown-toggle"
                        href="#collapseFooter1"
                        aria-expanded="false"
                        data-bs-toggle="collapse"
                        aria-controls="collapseFooter1"
                    >
                        Help &amp; Contact
                    </p>
                    <div id="collapseFooter1" class="collapse" :class="{ show: isLargeScreen }" data-bs-parent=".footer-main">
                        <ul>
                            <li><NuxtLink href="/faq">FAQ</NuxtLink></li>
                            <li><NuxtLink href="/returns"> Returns</NuxtLink></li>
                            <li><NuxtLink href="/shipping">Payment &amp; shipping</NuxtLink></li>
                            <li><NuxtLink href="/contact">Contact us</NuxtLink></li>
                        </ul>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6">
                    <p
                        class="footer-collapse dropdown-toggle"
                        href="#collapseFooter2"
                        data-bs-toggle="collapse"
                        aria-expanded="false"
                        aria-controls="collapseFooter2"
                    >
                        Categories
                    </p>
                    <div id="collapseFooter2" class="collapse" :class="{ show: isLargeScreen }" data-bs-parent=".footer-main">
                        <ul>
                            <template v-for="category in store.categories" :key="category.id">
                                <li>
                                    <NuxtLink :href="`${CATEGORY_HANDLE}/` + category.handle">{{ category.name }}</NuxtLink>
                                </li>
                            </template>
                        </ul>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6">
                    <p
                        class="footer-collapse dropdown-toggle"
                        href="#collapseFooter3"
                        data-bs-toggle="collapse"
                        aria-expanded="false"
                        aria-controls="collapseFooter3"
                    >
                        About
                    </p>
                    <div id="collapseFooter3" class="collapse" :class="{ show: isLargeScreen }" data-bs-parent=".footer-main">
                        <ul>
                            <li><NuxtLink href="/about">About us</NuxtLink></li>
                            <li><NuxtLink href="/blog"> Blog</NuxtLink></li>
                            <li><NuxtLink href="/contact">Contact us</NuxtLink></li>
                            <li>
                                <NuxtLink href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                                    <NuxtImg
                                        src="/images/facebook.svg"
                                        width="22"
                                        height="22"
                                        alt="facebook"
                                        title="facebook"
                                        loading="lazy"
                                    />
                                    Facebook
                                </NuxtLink>
                            </li>
                            <li>
                                <NuxtLink href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                                    <NuxtImg
                                        src="/images/instagram.svg"
                                        width="22"
                                        height="22"
                                        alt="instagram"
                                        title="instagram"
                                        loading="lazy"
                                    />
                                    Instagram
                                </NuxtLink>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 position-relative">
                    <div class="d-flex align-items-center gap-3 mb-4">
                        <NuxtImg src="/images/mastercard.svg" width="80" loading="lazy" alt="Mastercard" />
                        <NuxtImg src="/images/visa.png" width="80" loading="lazy" alt="Visa" />
                    </div>
                    <div class="extra-links d-flex flex-column gap-1">
                        <NuxtLink class="text-white" href="mailto:info@ecommerce.com" target="_blank" rel="noopener noreferrer"
                            >info@ecommerce.com</NuxtLink
                        >

                        <NuxtLink class="text-white" href="tel:+370 600 00000" target="_blank" rel="noopener noreferrer"
                            >+370 600 00000</NuxtLink
                        >
                    </div>
                </div>
            </div>
            <div class="copyright">
                <div class="copyright-wrapper">
                    <p>© Copyright Gintas Bazys {{ new Date().getFullYear() }}. All rights reserved.</p>
                    <div class="copyright-links">
                        <NuxtLink href="/privacy" target="_blank" rel="noopener noreferrer">Privacy policy</NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </footer>
</template>
