<script setup lang="ts">
const handleSubscribe = async (e: Event) => {
    e.preventDefault()

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const email = formData.get("email") as string

    try {
        const response = await $fetch("/api/subscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        })

        if (response.success) {
            alert(response.message)
            form.reset()
        } else {
            throw new Error(response.message)
        }
    } catch (error) {
        console.log(`Error: ${error.message}`)
    }
}
</script>

<template>
    <section class="spacer shadow-lg bg-white">
        <div class="container-md">
            <div class="intro">
                <h2 class="text-center newsletter">Subscribe to our Newsletter</h2>
                <p class="text-center">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
            </div>
            <form class="d-flex gap-3 align-items-center w-100" @submit="handleSubscribe">
                <div class="input-group">
                    <input
                        type="email"
                        name="email"
                        required
                        class="form-control my-0"
                        placeholder="Enter your email"
                        aria-label="Enter your email"
                        aria-describedby="cta-addon"
                    />
                    <button id="cta-addon" class="btn btn-primary">Submit</button>
                </div>
            </form>
        </div>
    </section>
</template>
