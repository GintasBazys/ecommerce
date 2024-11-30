<script setup lang="ts">
import ContactForm from "~/components/Forms/ContactForm.vue"
useHead({
    title: "Contact us | Ecommerce"
})
</script>
<template>
    <section class="spacer">
        <div class="container">
            <h1 class="h3 text-center">Contact us</h1>
            <span class="d-block text-center"
                >These help articles may solve the issue you're having. Go to <NuxtLink href="/faq">FAQ</NuxtLink>.</span
            >

            <div class="faq-cards">
                <div class="row justify-content-center g-2">
                    <div class="col-lg-4 col-md-8">
                        <div class="faq-card">
                            <p class="h4 d-flex align-items-center gap-2">
                                <NuxtImg src="/images/messenger.svg" width="24" height="24" alt="Messenger icon" />
                                Messenger
                            </p>
                            <p class="mb-0">
                                Work hours: I-V: 09:00 am - 17:00 pm <br />
                                (Closed for Holidays)
                            </p>
                        </div>
                    </div>
                    <div class="col-lg-4 col-md-8">
                        <div class="faq-card">
                            <p class="h4 d-flex align-items-center gap-2">
                                <NuxtImg src="/images/email.svg" width="24" height="24" alt="Email icon" />
                                Email us
                            </p>
                            <p class="mb-0">info@ecommerce.com</p>
                        </div>
                    </div>
                    <div class="col-lg-4 col-md-8">
                        <div class="faq-card">
                            <p class="h4 d-flex align-items-center gap-2">
                                <NuxtImg src="/images/phone.svg" width="24" height="24" alt="Phone icon" />
                                Call us
                            </p>
                            <p class="mb-0">+370 600 00000</p>
                        </div>
                    </div>
                </div>
            </div>
            <p><b>Address</b></p>
            <p class="mb-0">Address: Lorem ipsum 163, 12345 Vilnius, Lithuania</p>
            <div class="contact-divider"><span>Also contact</span></div>
            <ContactForm />
            <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d203269.51871892938!2d25.088231590205528!3d54.700572672503455!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46dd93fb5c6408f5%3A0x400d18c70e9dc40!2sVilnius%2C%20Vilniaus%20m.%20sav.!5e1!3m2!1slt!2slt!4v1727009719782!5m2!1slt!2slt"
                width="100%"
                class="mt-5 pt-4"
                height="450"
                style="border: 0"
                allowfullscreen
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
        </div>
    </section>
</template>
