<script setup lang="ts">
definePage({
  meta: {
    title: 'Example: Search Experiment v1 – Article (live)',
    description: "Article page loaded from live Wikipedia data, inside the article shell.",
  },
})

import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ArticleChromeWrapper from '@/components/chrome/ArticleChromeWrapper.vue'
import ArticleMobileLive from '@/components/article/ArticleMobileLive.vue'

const route = useRoute()
const article = computed(() => typeof route.query.article === 'string' ? route.query.article : 'cat')
const anchor = computed(() => typeof route.query.anchor === 'string' ? route.query.anchor : undefined)
const highlight = computed(() => typeof history.state?.highlight === 'string' ? history.state.highlight : undefined)
</script>

<template>
  <ArticleChromeWrapper>
    <ArticleMobileLive
      :article="article"
      :anchor="anchor"
      :highlight="highlight"
    />
  </ArticleChromeWrapper>
</template>
