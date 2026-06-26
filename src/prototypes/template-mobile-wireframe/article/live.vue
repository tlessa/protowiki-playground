<script setup lang="ts">
definePage({
  meta: {
    title: 'Template: Article (live)',
    description: "Article page loaded from live Wikipedia data, inside the mobile wireframe article shell.",
  },
})

import ArticleChromeWrapper from '@/components/chrome/ArticleChromeWrapper.vue'
import ArticleLive from '@/components/article/ArticleLive.vue'
</script>

<template>
  <ArticleChromeWrapper>
    <ArticleLive article="Wet Leg" />
  </ArticleChromeWrapper>
</template>
