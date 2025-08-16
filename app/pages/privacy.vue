<script setup lang="ts">
useHead({
    title: "Privacy | Ecommerce"
})
</script>

<template>
  <VContainer class="py-12">
    <VRow justify="center">
      <VCol cols="12" md="9">
        <VCard flat class="pa-4">
          <VCardTitle class="text-h4 mb-6">Privacy Policy</VCardTitle>

          <VCardText>
            <p class="mb-4">Effective date: [Date]</p>

            <p>
              This Privacy Policy describes how [Your Company Name] ("we," "our," or "us") collects, uses, and shares
              information when you visit or make a purchase from [Website URL] (the "Site").
            </p>

            <h2 class="text-h5 mt-8 mb-2">1. Information We Collect</h2>
            <p>We collect several types of information from and about users of our Site, including:</p>
            <VList density="compact" class="mb-4">
              <VListItem>
                <strong>Personal Information:</strong> When you make a purchase or attempt to make a purchase, we collect
                your name, billing and shipping address, payment information, email address, and phone number.
              </VListItem>
              <VListItem>
                <strong>Order Information:</strong> We retain purchase details such as items, preferences, and history.
              </VListItem>
              <VListItem>
                <strong>Device Information:</strong> This includes browser, IP address, time zone, and cookies.
              </VListItem>
            </VList>

            <h2 class="text-h5 mt-8 mb-2">2. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <VList density="compact" class="mb-4">
              <VListItem>
                <strong>To Process Orders:</strong> To fulfill orders, process payments, and send updates.
              </VListItem>
              <VListItem>
                <strong>To Improve Our Services:</strong> We use behavior data to enhance our website and services.
              </VListItem>
              <VListItem> <strong>Marketing:</strong> With consent, we may send promotional emails and updates. </VListItem>
              <VListItem> <strong>Legal Compliance:</strong> To fulfill legal and regulatory obligations. </VListItem>
            </VList>

            <h2 class="text-h5 mt-8 mb-2">3. Sharing Your Information</h2>
            <p>We may share your information with third parties such as:</p>
            <VList density="compact" class="mb-4">
              <VListItem>
                <strong>Service Providers:</strong> Including payment processors, shipping providers, etc.
              </VListItem>
              <VListItem> <strong>Compliance with Laws:</strong> When legally required to do so. </VListItem>
              <VListItem> <strong>Business Transfers:</strong> In the event of mergers or acquisitions. </VListItem>
            </VList>

            <h2 class="text-h5 mt-8 mb-2">4. Data Security</h2>
            <p>We implement reasonable safeguards, but no internet method is 100% secure. Use at your own risk.</p>

            <h2 class="text-h5 mt-8 mb-2">5. Cookies</h2>
            <p>
              We use cookies to enhance your experience. You can disable cookies in your browser, but it may affect
              functionality.
            </p>

            <h2 class="text-h5 mt-8 mb-2">6. Your Rights</h2>
            <p>
              You can access, update, or delete your data and opt out of marketing by contacting us or using unsubscribe
              links.
            </p>

            <h2 class="text-h5 mt-8 mb-2">7. Third-Party Links</h2>
            <p>Our Site may link to third-party sites. We are not responsible for their privacy practices.</p>

            <h2 class="text-h5 mt-8 mb-2">8. Changes to This Privacy Policy</h2>
            <p>We may revise this policy from time to time. Updates will appear here with an effective date.</p>

            <h2 class="text-h5 mt-8 mb-2">9. Contact Us</h2>
            <p>If you have questions, contact us at:</p>
            <p><strong>Email:</strong> support@[yourcompany].com</p>
            <p><strong>Address:</strong> [Your Company Address]</p>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>
