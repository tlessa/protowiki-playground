<script setup lang="ts">
definePage({
  meta: {
    title: 'Template: Article',
    description: 'Wikipedia article reading view with top app bar and bottom toolbar.',
  },
})

import ArticleChromeWrapper from '@/components/chrome/ArticleChromeWrapper.vue'
</script>

<template>
  <ArticleChromeWrapper />
</template>
