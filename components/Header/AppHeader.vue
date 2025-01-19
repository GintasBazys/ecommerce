<script setup lang="ts">
const { $bootstrap } = useNuxtApp()

onMounted(() => {
    const offcanvasElement = document.getElementById("navbarNav")
    if (!offcanvasElement) {
        return
    }
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
    <nav class="navbar navbar-expand-lg navbar-light bg-light sticky-top shadow-lg">
        <div class="container flex-column align-items-start">
            <div class="d-flex justify-content-between align-items-center gap-3 w-100">
                <NuxtLink class="navbar-brand p-0" href="/">
                    <NuxtImg class="img-fluid" src="/images/logo.svg" width="200" height="40" alt="Ecommerce logo" loading="eager" />
                </NuxtLink>
                <slot name="header-icons"></slot>
            </div>
            <div
                id="navbarNav"
                tabindex="-1"
                class="offcanvas-lg offcanvas-start w-lg-100 justify-content-lg-center d-flex justify-content-lg-center py-4 px-3 py-lg-0 px-lg-0"
            >
                <button
                    type="button"
                    class="btn-close d-lg-none ms-auto"
                    data-bs-target="#navbarNav"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                ></button>
                <slot name="navigation-links"></slot>
            </div>
        </div>
    </nav>
</template>
