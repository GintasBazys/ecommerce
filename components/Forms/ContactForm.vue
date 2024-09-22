<script setup lang="ts">
const handleSubmit = (e: Event): void => {
    e.preventDefault()

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    fetch("https://formsubmit.co/ajax/ea50e93bb59d60512a0ab63ded1f9169", {
        method: "POST",
        body: formData
    })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error("Error:", error))
}
</script>

<template>
    <form method="POST" enctype="multipart/form-data" @submit="handleSubmit">
        <div class="row">
            <div class="col-12">
                <div class="form-group mb-3">
                    <label class="form-label" for="contactSubjectInput">Subject</label>
                    <input
                        id="contactSubjectInput"
                        required
                        name="subject"
                        type="text"
                        class="form-control"
                        placeholder="Example: customer service"
                    >
                </div>
            </div>
            <div class="col-lg-6">
                <div class="form-group mb-3">
                    <label class="form-label" for="contactEmailInput">Email</label>
                    <input id="contactEmailInput" required name="email" type="email" class="form-control" placeholder="name@example.com" >
                </div>
            </div>
            <div class="col-lg-6">
                <div class="form-group mb-3">
                    <label class="form-label" for="contactPhoneInput">Phone number</label>
                    <input id="contactPhoneInput" name="phone" type="tel" class="form-control" placeholder="+370" >
                </div>
            </div>
            <div class="col-12">
                <div class="form-group mb-3">
                    <label class="form-label" for="contactMessageInput">Message</label>
                    <textarea
                        id="contactMessageInput"
                        class="form-control"
                        name="message"
                        placeholder="How we can help? Your order number?"
                        required
                        style="height: 5.5rem"
                    />
                </div>
            </div>
        </div>
        <button type="submit" class="btn btn-primary w-100 py-2 text-uppercase">Send message</button>
    </form>
</template>
