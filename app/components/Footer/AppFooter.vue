<script setup lang="ts">
import type { NavLink } from "@/types/interfaces"

const expandedPanels = ref<number[][]>([[0], [0], [0]])
const { categories } = useProductStore()

const helpLinks: NavLink[] = [
    { label: "FAQ", to: "/faq" },
    { label: "Returns", to: "/returns" },
    { label: "Payment & Shipping", to: "/shipping" },
    { label: "Contact Us", to: "/contact" }
]

const aboutLinks: NavLink[] = [
    { label: "About Us", to: "/about" },
    { label: "Blog", to: BLOG_HANDLE },
    { label: "Contact Us", to: "/contact" },
    { label: "Facebook", to: "https://facebook.com", icon: "mdi-facebook" },
    { label: "Instagram", to: "https://instagram.com", icon: "mdi-instagram" }
]
</script>

<template>
  <VFooter class="bg-primary text-white pa-6" padless>
    <VContainer>
      <VRow class="footer-main" dense>
        <VCol cols="12" md="6" lg="3">
          <VExpansionPanels v-model="expandedPanels[0]" multiple flat tile class="bg-primary text-white">
            <VExpansionPanel>
              <VExpansionPanelTitle>Help & Contact</VExpansionPanelTitle>
              <VExpansionPanelText class="bg-primary text-white">
                <VList dense class="bg-primary">
                  <VListItem v-for="(item, i) in helpLinks" :key="i" class="pa-0">
                    <NuxtLink :to="item.to" class="text-white text-decoration-none">{{ item.label }}</NuxtLink>
                  </VListItem>
                </VList>
              </VExpansionPanelText>
            </VExpansionPanel>
          </VExpansionPanels>
        </VCol>

        <VCol cols="12" md="6" lg="3">
          <VExpansionPanels v-model="expandedPanels[1]" multiple flat tile class="bg-primary text-white">
            <VExpansionPanel>
              <VExpansionPanelTitle>Categories</VExpansionPanelTitle>
              <VExpansionPanelText class="bg-primary text-white">
                <VList dense class="bg-primary">
                  <VListItem v-for="category in categories" :key="category.id" class="pa-0">
                    <NuxtLink :to="`${CATEGORY_HANDLE}/` + category.handle" class="text-white text-decoration-none">
                      {{ category.name }}
                    </NuxtLink>
                  </VListItem>
                </VList>
              </VExpansionPanelText>
            </VExpansionPanel>
          </VExpansionPanels>
        </VCol>

        <VCol cols="12" md="6" lg="3">
          <VExpansionPanels v-model="expandedPanels[2]" multiple flat tile class="bg-primary text-white">
            <VExpansionPanel>
              <VExpansionPanelTitle>About</VExpansionPanelTitle>
              <VExpansionPanelText class="bg-primary text-white">
                <VList dense class="bg-primary">
                  <VListItem v-for="(item, i) in aboutLinks" :key="i" class="pa-0">
                    <NuxtLink :to="item.to" class="text-white text-decoration-none">
                      <VIcon v-if="item.icon" size="22" class="me-2">{{ item.icon }}</VIcon>
                      {{ item.label }}
                    </NuxtLink>
                  </VListItem>
                </VList>
              </VExpansionPanelText>
            </VExpansionPanel>
          </VExpansionPanels>
        </VCol>

        <VCol cols="12" md="6" lg="3">
          <VRow class="mb-4 ml-4" align="center" dense>
            <div class="d-flex justify-center">
              <VImg src="/images/mastercard.svg" width="80" loading="lazy" alt="Mastercard" />
              <VImg src="/images/visa.png" width="80" loading="lazy" alt="Visa" class="" />
            </div>
          </VRow>
          <div class="d-flex flex-column ml-4">
            <NuxtLink
              class="text-white text-decoration-none"
              to="mailto:info@ecommerce.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              info@ecommerce.com
            </NuxtLink>
            <NuxtLink class="text-white text-decoration-none" to="tel:+37060000000" target="_blank" rel="noopener noreferrer">
              +370 600 00000
            </NuxtLink>
          </div>
        </VCol>
      </VRow>

      <VDivider class="my-6" />

      <VRow justify="space-between" align="center">
        <VCol cols="12" md="6">
          <p class="mb-0">© Copyright Gintas Bazys {{ new Date().getFullYear() }}. All rights reserved.</p>
        </VCol>
        <VCol cols="12" md="6" class="d-flex justify-end">
          <NuxtLink to="/privacy" class="text-white text-decoration-none"> Privacy Policy </NuxtLink>
        </VCol>
      </VRow>
    </VContainer>
  </VFooter>
</template>
