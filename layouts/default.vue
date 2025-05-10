<script setup lang="ts">
import PoliciesBlock from "~/components/About/PoliciesBlock.vue"
</script>

<template>
    <main>
        <div>
            <slot></slot>
        </div>
        <NewsletterComponent />
        <PoliciesBlock />
    </main>
</template>
