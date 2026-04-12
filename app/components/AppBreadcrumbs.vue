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
    <nav class="app-breadcrumbs" :class="`app-breadcrumbs--${tone}`" aria-label="Breadcrumb">
        <template v-for="(item, index) in items" :key="`${item.label}-${index}`">
            <NuxtLink v-if="item.to && index < items.length - 1" :to="item.to" class="app-breadcrumbs__link">
                {{ item.label }}
            </NuxtLink>
            <span v-else class="app-breadcrumbs__current">{{ item.label }}</span>
            <VIcon v-if="index < items.length - 1" size="16" class="app-breadcrumbs__icon">mdi-chevron-right</VIcon>
        </template>
    </nav>
</template>

<style scoped lang="scss">
.app-breadcrumbs {
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

.app-breadcrumbs__link,
.app-breadcrumbs__current {
    text-decoration: none;
}

.app-breadcrumbs__link {
    color: #4b5874;
    transition: color 0.25s ease;
}

.app-breadcrumbs__link:hover {
    color: #010c80;
}

.app-breadcrumbs__current {
    color: #08173f;
    font-weight: 700;
}

.app-breadcrumbs__icon {
    color: #9aa4bd;
}

.app-breadcrumbs--inverse {
    border-color: rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.1);
    box-shadow: none;
    color: rgba(255, 255, 255, 0.74);
}

.app-breadcrumbs--inverse .app-breadcrumbs__link {
    color: rgba(255, 255, 255, 0.82);
}

.app-breadcrumbs--inverse .app-breadcrumbs__link:hover,
.app-breadcrumbs--inverse .app-breadcrumbs__current {
    color: #ffffff;
}

.app-breadcrumbs--inverse .app-breadcrumbs__icon {
    color: rgba(255, 255, 255, 0.56);
}

@media screen and (max-width: 767px) {
    .app-breadcrumbs {
        padding: 0.55rem 0.8rem;
        border-radius: 1rem;
        font-size: 0.82rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .app-breadcrumbs__link {
        transition: none;
    }
}
</style>
