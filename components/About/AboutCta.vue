<script setup lang="ts">
defineProps<{
    linkShown?: boolean
    extraSpacerClass?: string
}>()
</script>

<template>
    <section class="container">
        <div class="spacer" :class="extraSpacerClass">
            <div class="row flex-xl-row flex-column-reverse gy-4">
                <div class="col-xl-6 col-md-9">
                    <NuxtImg
                        src="/images/online_purchase.jpg"
                        format="webp"
                        densities="x1 x2"
                        alt="..."
                        class="rounded-3"
                        width="800"
                        height="534"
                        :placeholder="[800, 534, 75, 5]"
                        loading="lazy"
                    />
                </div>
                <div class="col-xl-6 col-md-9">
                    <div class="about-us-inner-content">
                        <span class="header-label d-inline-block pb-2">WHO WE ARE</span>
                        <h2>About us</h2>
                        <p>
                            Welcome to our online store! Since our inception in 2012, we’ve been dedicated to providing top-quality products
                            and exceptional service to our customers. Based in Vilnius, Lithuania, we are passionate about curating a
                            diverse selection of goods to meet your needs and exceed your expectations.
                        </p>
                        <p>
                            Our team is committed to delivering not only outstanding products but also a seamless shopping experience.
                            Whether you’re searching for the latest trends or unique finds, we strive to make your online shopping
                            experience enjoyable and efficient.
                        </p>
                        <p>
                            We also offer international shipping, bringing our curated collection to customers around the globe. If you have
                            any questions or need assistance, our friendly customer support team is here to help.
                        </p>
                        <p class="m-0">Speak to us today to find out more.</p>
                        <template v-if="linkShown">
                            <NuxtLink class="btn btn-outline-primary mt-3 px-4" to="/about">
                                <span role="button" class="read-more-btn-text">Read more</span>
                            </NuxtLink>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
