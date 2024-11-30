<script setup lang="ts">
import { ref } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const router = useRouter()

const token = encodeURIComponent((route.query.token as string) || "")
const email = encodeURIComponent((route.query.email as string) || "")
const password = ref("")

const handleSubmit = async (e: Event) => {
    e.preventDefault()

    if (!password.value) {
        alert("Password is required")
        return
    }

    fetch(`http://localhost:9000/auth/customer/emailpass/update?token=${token}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password: password.value
        })
    })
        .then((res) => {
            if (!res.ok) {
                throw new Error("Failed to reset password")
            }
            return res.json()
        })
        .then(({ success }) => {
            alert(success ? "Password reset successfully!" : "Couldn't reset password")
            router.push("/signin")
        })
        .catch((err) => {
            console.error(err)
            alert("Error resetting password. Please try again.")
        })
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
