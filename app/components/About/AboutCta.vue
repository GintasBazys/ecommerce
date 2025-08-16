<script setup lang="ts">
defineProps<{
    linkShown?: boolean
    extraSpacerClass?: string
}>()
</script>

<template>
  <VContainer :class="extraSpacerClass">
    <VRow justify="center" class="py-12" align="center" dense>
      <VCol cols="12" md="9" xl="6">
        <VImg
          src="/images/online_purchase.jpg"
          alt="online purchase illustration"
          max-width="800"
          max-height="534"
          aspect-ratio="1.5"
          lazy-src="/images/online_purchase.jpg"
          class="rounded-lg"
          cover
        />
      </VCol>

      <VCol cols="12" md="9" xl="6">
        <div>
          <div class="text-subtitle-2 mb-2">WHO WE ARE</div>
          <h2 class="text-h4 mb-4">About us</h2>
          <p>
            Welcome to our online store! Since our inception in 2012, we’ve been dedicated to providing top-quality products and
            exceptional service to our customers. Based in Vilnius, Lithuania, we are passionate about curating a diverse
            selection of goods to meet your needs and exceed your expectations.
          </p>
          <p>
            Our team is committed to delivering not only outstanding products but also a seamless shopping experience. Whether
            you’re searching for the latest trends or unique finds, we strive to make your online shopping experience enjoyable
            and efficient.
          </p>
          <p>
            We also offer international shipping, bringing our curated collection to customers around the globe. If you have any
            questions or need assistance, our friendly customer support team is here to help.
          </p>
          <p class="mb-0">Speak to us today to find out more.</p>

          <VBtn v-if="linkShown" to="/about" variant="outlined" class="mt-4" tag="NuxtLink"> Read more </VBtn>
        </div>
      </VCol>
    </VRow>
  </VContainer>
</template>
