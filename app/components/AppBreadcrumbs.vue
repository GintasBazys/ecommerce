<script setup lang="ts">
type BreadcrumbItem = {
    label: string
    to?: string
}

withDefaults(
    defineProps<{
        items: BreadcrumbItem[]
        tone?: "default" | "inverse"
    }>(),
    {
        tone: "default"
    }
)
</script>

<template>
    <nav class="appBreadcrumbs" :class="`appBreadcrumbs--${tone}`" aria-label="Breadcrumb">
        <template v-for="(item, index) in items" :key="`${item.label}-${index}`">
            <NuxtLink v-if="item.to && index < items.length - 1" :to="item.to" class="appBreadcrumbs__link">
                {{ item.label }}
            </NuxtLink>
            <span v-else class="appBreadcrumbs__current">{{ item.label }}</span>
            <VIcon v-if="index < items.length - 1" size="16" class="appBreadcrumbs__icon">mdi-chevron-right</VIcon>
        </template>
    </nav>
</template>

<style scoped lang="scss">
.appBreadcrumbs {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.45rem;
    width: fit-content;
    max-width: 100%;
    padding: 0.6rem 0.9rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.78);
    box-shadow: 0 14px 36px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
    color: #5a6480;
    font-size: 0.88rem;
    line-height: 1.35;
}

.appBreadcrumbs__link,
.appBreadcrumbs__current {
    text-decoration: none;
}

.appBreadcrumbs__link {
    color: #4b5874;
    transition: color 0.25s ease;
}

.appBreadcrumbs__link:hover {
    color: #010c80;
}

.appBreadcrumbs__current {
    color: #08173f;
    font-weight: 700;
}

.appBreadcrumbs__icon {
    color: #9aa4bd;
}

.appBreadcrumbs--inverse {
    border-color: rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.1);
    box-shadow: none;
    color: rgba(255, 255, 255, 0.74);
}

.appBreadcrumbs--inverse .appBreadcrumbs__link {
    color: rgba(255, 255, 255, 0.82);
}

.appBreadcrumbs--inverse .appBreadcrumbs__link:hover,
.appBreadcrumbs--inverse .appBreadcrumbs__current {
    color: #ffffff;
}

.appBreadcrumbs--inverse .appBreadcrumbs__icon {
    color: rgba(255, 255, 255, 0.56);
}

@media screen and (max-width: 767px) {
    .appBreadcrumbs {
        padding: 0.55rem 0.8rem;
        border-radius: 1rem;
        font-size: 0.82rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .appBreadcrumbs__link {
        transition: none;
    }
}
</style>
