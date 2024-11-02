<script setup lang="ts">
import { ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useFetch } from "#app"

const route = useRoute()
const router = useRouter()

const token = (route.query.token as string) || ""
const email = (route.query.email as string) || ""
const password = ref("")

const handleSubmit = async (e: Event) => {
    e.preventDefault()

    if (!password.value) {
        alert("Password is required")
        return
    }

    try {
        const { error } = await useFetch("/api/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token,
                email,
                password: password.value
            })
        })
        if (error.value) {
            alert("Couldn't reset password")
            return
        }

        alert("Password reset successfully!")
        router.push("/signin")
    } catch {
        alert("Error resetting password. Please try again.")
    }
}
</script>

<template>
    <section>
        <h2>Password Reset</h2>
        <form @submit="handleSubmit">
            <label for="password">New Password</label>
            <input id="password" v-model="password" type="password" placeholder="Enter your new password" required />
            <button type="submit">Reset Password</button>
        </form>
    </section>
</template>
