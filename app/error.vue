<script setup lang="ts">
import { type NuxtError, clearError } from "nuxt/app"
import { computed } from "vue"

const props = defineProps<{
    error: NuxtError
}>()

const statusCode = computed(() => props.error?.statusCode || 500)
const message = computed(() => props.error?.statusMessage || "Internal error")

function backToHome() {
    clearError({ redirect: "/" })
}
</script>

<template>
    <main class="app-error">
        <div class="app-error__card">
            <p class="app-error__code">{{ statusCode }}</p>
            <h1 class="app-error__title">Something went wrong</h1>
            <p class="app-error__message">{{ message }}</p>
            <div class="app-error__actions">
                <VBtn color="primary" rounded="pill" @click="backToHome">Back to home</VBtn>
            </div>
        </div>
    </main>
</template>

<style scoped>
.app-error {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 24px;
    background: linear-gradient(160deg, #f4f6fb 0%, #e8eef9 45%, #e3f0f3 100%);
}

.app-error__card {
    width: min(560px, 100%);
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 16px 42px rgba(15, 36, 72, 0.14);
    padding: 40px 32px;
    text-align: center;
}

.app-error__code {
    margin: 0;
    font-size: clamp(2.25rem, 6vw, 3.5rem);
    font-weight: 700;
    color: #153a7b;
}

.app-error__title {
    margin: 10px 0 8px;
    font-size: 1.5rem;
    color: #122138;
}

.app-error__message {
    margin: 0;
    color: #4a5f7a;
}

.app-error__actions {
    margin-top: 24px;
}
</style>
