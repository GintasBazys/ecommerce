<script setup lang="ts">
import { ref, computed } from "vue"

type Props = {
    title: string
    content: string
    rating: number
    firstName: string
    lastName: string
    productId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
    (_: "submit", __: Props): void
    (___: "close"): void
}>()

const form = ref<Props>({
    title: props.title,
    content: props.content,
    rating: props.rating,
    firstName: props.firstName,
    lastName: props.lastName,
    productId: props.productId
})

const isValid = computed<boolean>(
    () => form.value.title.trim().length > 0 && form.value.content.trim().length > 0 && form.value.rating >= 1 && form.value.rating <= 5
)

const snackbar = ref<boolean>(false)
const snackbarText = ref<string>("")

function handleSubmit(): void {
    if (!isValid.value) {
        snackbarText.value = "Please fill in all fields and choose a rating between 1 and 5."
        snackbar.value = true
        return
    }
    emit("submit", { ...form.value })
    emit("close")
}

function handleCancel(): void {
    emit("close")
}
</script>

<template>
    <div class="relative w-full max-w-2xl rounded-[1.75rem] border border-white/80 bg-white p-5 shadow-[0_24px_64px_rgba(2,6,23,0.2)] sm:rounded-[2rem] sm:p-7">
        <button
            type="button"
            class="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-950 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-200 motion-reduce:transition-none"
            aria-label="Close review form"
            @click="handleCancel"
        >
            <span aria-hidden="true" class="text-lg leading-none">×</span>
        </button>

        <div class="pr-12">
            <p class="inline-flex min-h-9 items-center rounded-full bg-brand-100 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-brand-700">
                Share feedback
            </p>
            <h2 id="product-review-dialog-title" class="mt-4 text-[1.85rem] font-bold leading-[1.02] tracking-[-0.04rem] text-slate-950">
                Write a review
            </h2>
            <p class="mt-3 max-w-[34rem] text-sm leading-7 text-slate-600 sm:text-[0.95rem]">
                Let other shoppers know how the product feels, fits into daily use, and whether it met expectations.
            </p>
        </div>

        <form class="mt-6 grid gap-4" @submit.prevent="handleSubmit">
            <div class="grid gap-2">
                <label for="review-title" class="text-sm font-medium text-slate-700">Review title</label>
                <input
                    id="review-title"
                    v-model="form.title"
                    type="text"
                    placeholder="Summarize your experience"
                    class="min-h-12 rounded-[1rem] border border-slate-300 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-200"
                    required
                />
            </div>

            <div class="grid gap-2">
                <span class="text-sm font-medium text-slate-700">Rating</span>
                <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Select a rating">
                    <button
                        v-for="value in 5"
                        :key="value"
                        type="button"
                        class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border text-lg transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-200 motion-reduce:transition-none"
                        :class="value <= form.rating ? 'border-amber-300 bg-amber-50 text-amber-500' : 'border-slate-200 bg-white text-slate-300 hover:border-amber-200 hover:text-amber-400'"
                        :aria-checked="form.rating === value"
                        role="radio"
                        @click="form.rating = value"
                    >
                        <span aria-hidden="true">★</span>
                    </button>
                </div>
            </div>

            <div class="grid gap-2">
                <label for="review-content" class="text-sm font-medium text-slate-700">Review</label>
                <textarea
                    id="review-content"
                    v-model="form.content"
                    rows="5"
                    placeholder="Share your thoughts"
                    class="rounded-[1rem] border border-slate-300 bg-white px-4 py-3 text-slate-950 placeholder:text-slate-400 focus:border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-200"
                    required
                ></textarea>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
                <div class="grid gap-2">
                    <label for="review-first-name" class="text-sm font-medium text-slate-700">First name</label>
                    <input
                        id="review-first-name"
                        v-model="form.firstName"
                        type="text"
                        placeholder="Your first name"
                        class="min-h-12 rounded-[1rem] border border-slate-300 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-200"
                    />
                </div>
                <div class="grid gap-2">
                    <label for="review-last-name" class="text-sm font-medium text-slate-700">Last name</label>
                    <input
                        id="review-last-name"
                        v-model="form.lastName"
                        type="text"
                        placeholder="Your last name"
                        class="min-h-12 rounded-[1rem] border border-slate-300 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-200"
                    />
                </div>
            </div>

            <div class="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
                <button
                    type="button"
                    class="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:text-slate-950 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-200 motion-reduce:transition-none"
                    @click="handleCancel"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    class="inline-flex min-h-11 items-center justify-center rounded-full bg-[#cda45e] px-6 text-sm font-semibold text-slate-950 transition hover:bg-[#d8b57a] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
                    :disabled="!isValid"
                >
                    Submit review
                </button>
            </div>
        </form>

        <div
            v-if="snackbar"
            class="mt-4 rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            role="alert"
        >
            {{ snackbarText }}
        </div>
    </div>
</template>
