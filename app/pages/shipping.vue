<script setup lang="ts">
useHead({
    title: "Shipping | Ecommerce"
})
</script>

<template>
    <section class="py-10">
        <VContainer>
            <VRow justify="center">
                <VCol cols="12" md="9">
                    <h1 class="text-h4 mb-6">Payment & Shipping</h1>

                    <h2 class="text-h5 mb-4">Shipping Policy</h2>
                    <p class="mb-4">
                        At [Your Company Name], we are committed to delivering your orders as quickly and efficiently as possible. Please
                        review our shipping policies below.
                    </p>

                    <h3 class="text-h6 mb-2">Shipping Methods</h3>
                    <ul class="mb-4">
                        <li><strong>Standard Shipping:</strong> Delivery within 5-7 business days.</li>
                        <li><strong>Expedited Shipping:</strong> Delivery within 2-3 business days.</li>
                        <li><strong>Overnight Shipping:</strong> Next business day delivery for orders placed before 12:00 PM.</li>
                    </ul>

                    <h3 class="text-h6 mb-2">Shipping Rates</h3>
                    <p class="mb-4">
                        Shipping rates are calculated at checkout based on the weight of your order, destination, and chosen shipping
                        method. We offer free standard shipping on orders over [Enter Amount].
                    </p>

                    <h3 class="text-h6 mb-2">International Shipping</h3>
                    <p class="mb-4">
                        We offer international shipping to select countries. Please note that customs duties, taxes, and additional fees may
                        apply for international orders and are the responsibility of the customer. Delivery times for international orders
                        may vary based on location and customs processing times.
                    </p>

                    <h3 class="text-h6 mb-2">Order Processing</h3>
                    <p class="mb-4">
                        Orders are processed and shipped within 1-2 business days. Orders placed on weekends or holidays will be processed
                        the next business day.
                    </p>

                    <h3 class="text-h6 mb-2">Tracking Your Order</h3>
                    <p class="mb-10">
                        Once your order has been shipped, you will receive a shipping confirmation email with a tracking number to monitor
                        your shipment's progress.
                    </p>

                    <h2 class="text-h5 mb-4">Payment Information</h2>

                    <h3 class="text-h6 mb-2">Accepted Payment Methods</h3>
                    <ul class="mb-4">
                        <li>Visa</li>
                        <li>Mastercard</li>
                        <li>American Express</li>
                        <li>PayPal</li>
                        <li>Apple Pay</li>
                        <li>Google Pay</li>
                        <li>[Any other payment methods your company accepts]</li>
                    </ul>

                    <h3 class="text-h6 mb-2">Payment Security</h3>
                    <p class="mb-4">
                        Your payment information is protected by industry-standard encryption and security measures. We do not store your
                        credit card details. All payments are processed securely by our trusted payment gateway partners.
                    </p>

                    <h3 class="text-h6 mb-2">Billing Information</h3>
                    <p class="mb-4">
                        To ensure successful payment processing, please make sure your billing information matches the details associated
                        with your payment method. If any discrepancies occur, your order may be delayed or canceled.
                    </p>

                    <h3 class="text-h6 mb-2">Taxes</h3>
                    <p class="mb-4">
                        Sales tax will be applied to your order based on your shipping address and the applicable local tax laws.
                    </p>

                    <h3 class="text-h6 mb-2">Order Issues</h3>
                    <p>
                        If you experience any issues with your payment or have any questions regarding your order, please contact our
                        customer support team at
                        <NuxtLink to="mailto:support@[yourcompany].com" class="text-primary text-decoration-underline">
                            support@[yourcompany].com </NuxtLink
                        >.
                    </p>
                </VCol>
            </VRow>
        </VContainer>
    </section>
</template>
