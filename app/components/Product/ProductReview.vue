<script setup lang="ts">
import { ref, computed } from "vue"
import { VSnackbar } from "vuetify/components"

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
    (e: "submit", payload: Props): void
    (e: "close"): void
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
  <VCard>
    <VCardTitle class="text-h6">Write a Review</VCardTitle>

    <VCardText>
      <VForm>
        <VTextField v-model="form.title" label="Review Title" placeholder="Summarize your experience" required />

        <VTextarea v-model="form.content" label="Review Content" placeholder="Share your thoughts" rows="4" required />

        <div class="my-4">
          <span class="font-medium">Rating</span>
          <VRating v-model="form.rating" background-color="grey lighten-2" hover length="5" size="lg" />
        </div>

        <VTextField v-model="form.firstName" label="First Name" placeholder="Your first name" />
        <VTextField v-model="form.lastName" label="Last Name" placeholder="Your last name" />
      </VForm>
    </VCardText>

    <VCardActions>
      <VSpacer />
      <VBtn text @click="handleCancel">Cancel</VBtn>
      <VBtn color="primary" :disabled="!isValid" @click="handleSubmit"> Submit </VBtn>
    </VCardActions>
    <VSnackbar v-model="snackbar" :timeout="3000" location="top" elevation="2" color="error">
      {{ snackbarText }}
    </VSnackbar>
  </VCard>
</template>

<style scoped>
.v-card {
    width: 100%;
}
</style>
