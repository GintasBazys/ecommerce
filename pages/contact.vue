<script setup lang="ts">
import ContactForm from "@/components/Forms/ContactForm.vue"

useHead({
    title: "Contact us | Ecommerce"
})
</script>

<template>
    <section class="py-10">
        <VContainer>
            <h1 class="text-h4 text-center font-weight-bold mb-4">Contact Us</h1>
            <p class="text-center mb-8 text-body-1">
                These help articles may solve the issue you're having. Go to
                <NuxtLink to="/faq" class="text-primary text-decoration-underline">FAQ</NuxtLink>.
            </p>

            <VRow justify="center" class="mb-10" dense>
                <VCol cols="12" md="6" lg="4" class="mb-4">
                    <VCard height="100%" class="pa-4" outlined>
                        <VCardTitle class="d-flex align-center text-h6">
                            <VIcon class="me-2">mdi-facebook-messenger</VIcon>
                            Messenger
                        </VCardTitle>
                        <VCardText class="text-body-2">
                            Work hours: I–V: 09:00 – 17:00 <br />
                            (Closed on Holidays)
                        </VCardText>
                    </VCard>
                </VCol>

                <VCol cols="12" md="6" lg="4" class="mb-4">
                    <VCard height="100%" class="pa-4" outlined>
                        <VCardTitle class="d-flex align-center text-h6">
                            <VIcon class="me-2">mdi-email-outline</VIcon>
                            Email us
                        </VCardTitle>
                        <VCardText class="text-body-2">info@ecommerce.com</VCardText>
                    </VCard>
                </VCol>

                <VCol cols="12" md="6" lg="4" class="mb-4">
                    <VCard height="100%" class="pa-4" outlined>
                        <VCardTitle class="d-flex align-center text-h6">
                            <VIcon class="me-2">mdi-phone</VIcon>
                            Call us
                        </VCardTitle>
                        <VCardText class="text-body-2">+370 600 00000</VCardText>
                    </VCard>
                </VCol>
            </VRow>

            <div class="mx-auto mb-10" style="max-width: 500px">
                <p class="text-subtitle-1 font-weight-bold mb-1">Address</p>
                <p class="text-body-2">Lorem ipsum 163, 12345 Vilnius, Lithuania</p>
            </div>

            <VDivider class="my-6" />

            <p class="text-center text-subtitle-2 mb-6">You can also contact us via the form below</p>

            <VRow justify="center" class="mb-10">
                <VCol cols="12" md="10" lg="8">
                    <VCard class="pa-6" elevation="1">
                        <ContactForm />
                    </VCard>
                </VCol>
            </VRow>

            <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d203269.51871892938!2d25.088231590205528!3d54.700572672503455!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46dd93fb5c6408f5%3A0x400d18c70e9dc40!2sVilnius%2C%20Vilniaus%20m.%20sav.!5e1!3m2!1slt!2slt!4v1727009719782!5m2!1slt!2slt"
                width="100%"
                height="450"
                class="mt-10"
                style="border: 0"
                allowfullscreen
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
        </VContainer>
    </section>
</template>
