<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import WireframeMobileWrapper from '@/components/WireframeMobileWrapper.vue'
import '@/styles/mobile-android/index.css'

definePage({
  meta: {
    title: 'Dive – Semantic results',
    description: 'Semantic search results as a Material bottom sheet.',
  },
})

const router = useRouter()

const searchQuery = ref('')
const searchError = ref('')
const selectedLanguage = ref<'en' | 'pt' | 'es'>('en')

interface WikiSearchResult {
  title: string
  description: string
  thumbnailUrl?: string
  extract?: string
  sectionTitle?: string
  anchor?: string
}

const HARDCODED_RESULTS: WikiSearchResult[] = [
  { title: 'Cat', description: '', sectionTitle: 'Vision', anchor: 'Vision',
    extract: 'Cats have excellent night vision and can see at one sixth the light level required for human vision.[58]' },
  { title: 'Night vision', description: '', sectionTitle: '', anchor: '',
    extract: 'Night vision is the ability to see in low-light conditions, either naturally with scotopic vision or through a night-vision device.  Night vision requires both sufficient spectral range and sufficient intensity range. Humans have poor night vision compared to many animals such as cats, dogs, foxes and rabbits, in part because the human eye lacks a tapetum lucidum,[1] tissue behind the retina that reflects light back through the retina thus increasing the light available to the photoreceptors.' },
  { title: 'Tapetum lucidum', description: '', sectionTitle: 'Cats', anchor: 'Cats',
    extract: 'While enhancing night vision, increased light scatter within the tapetum slightly compromises visual acuity.[14]' },
  { title: 'Night vision', description: '', sectionTitle: 'Intensity range', anchor: 'Intensity_range',
    extract: 'Many animals have better night vision than humans do, the result of one or more differences in the morphology and anatomy of their eyes. These include having a larger eyeball, a larger lens, a larger optical aperture (the pupils may expand to the physical limit of the eyelids), more rods than cones (or rods exclusively) in the retina, and a tapetum lucidum.' },
  { title: 'Cat', description: '', sectionTitle: 'Whiskers', anchor: 'Whiskers',
    extract: 'These provide information on the width of gaps and on the location of objects in the dark, both by touching objects directly and by sensing air currents.' },
]

const searchResults = ref<WikiSearchResult[]>(HARDCODED_RESULTS)
const route = useRoute()


function dummyMeta(title: string): { contributors: number; references: number } {
  let h = 0
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0
  return { contributors: 200 + (h % 800), references: 10 + (h % 60) }
}

const isSkeletonVisible = ref(false)

function scheduleSearch(_query: string) {
  searchResults.value = HARDCODED_RESULTS
}

function openArticle(result: WikiSearchResult) {
  router.push({
    path: '/example-search-experiment-v2/article',
    query: {
      article: result.title,
      ...(result.anchor ? { anchor: result.anchor } : {}),
    },
    state: { highlight: result.extract ?? '' },
  })
}

onMounted(() => {
  const routeQuery = typeof route.query.q === 'string' ? route.query.q.trim() : ''
  const routeLang = route.query.lang
  if (routeLang === 'en' || routeLang === 'pt' || routeLang === 'es') {
    selectedLanguage.value = routeLang
  }
  if (routeQuery) {
    searchQuery.value = routeQuery
    scheduleSearch(routeQuery)
  }
})
</script>

<template>
  <WireframeMobileWrapper>
    <div class="mobile-android-type mobile-android-type--wireframe semantic-sheet-page">
      <div class="semantic-sheet__scrim" aria-hidden="true" @click="router.back()" />

      <div class="semantic-sheet" role="dialog" aria-modal="true" aria-label="Dive results">
        <div class="semantic-sheet__handle" aria-hidden="true" />

        <div class="semantic-sheet__scroll">
          <div class="semantic-sheet__content">
            <header class="semantic-sheet__header">
              <h2 class="mwf-android-type-h1 semantic-sheet__title">Dive</h2>
              <span class="mwf-android-type-small semantic-sheet__beta">Beta</span>
            </header>

            <p class="semantic-sheet__query">can cats</p>

            <p v-if="searchError" class="mwf-android-type-p semantic-sheet__status">
              {{ searchError }}
            </p>

            <ul v-if="isSkeletonVisible" class="semantic-sheet__results" aria-hidden="true">
              <li v-for="n in 3" :key="n">
                <article class="focused-search-semantic-card focused-search-skeleton-card">
                  <div class="focused-search-skeleton focused-search-skeleton--trail" />
                  <div class="focused-search-semantic-card__snippet">
                    <div class="focused-search-skeleton focused-search-skeleton--line focused-search-skeleton--line-full" />
                    <div class="focused-search-skeleton focused-search-skeleton--line focused-search-skeleton--line-wide" />
                    <div class="focused-search-skeleton focused-search-skeleton--line focused-search-skeleton--line-medium" />
                  </div>
                  <div class="focused-search-semantic-card__bottom">
                    <div class="focused-search-skeleton focused-search-skeleton--line" style="width: 130px;" />
                  </div>
                </article>
              </li>
            </ul>

            <ul v-else class="semantic-sheet__results">
              <li v-if="!searchResults.length && !searchError">
                <p class="mwf-android-type-p semantic-sheet__status">No results found.</p>
              </li>
              <li v-for="result in searchResults" :key="result.title">
                <article class="focused-search-semantic-card" role="button" tabindex="0" @click="openArticle(result)">
                  <div class="focused-search-semantic-card__header">
                    <span class="focused-search-semantic-card__thumb" aria-hidden="true" />
                    <p class="mwf-android-type-small focused-search-semantic-card__trail">
                      {{ result.title }}{{ result.sectionTitle ? ` > ${result.sectionTitle}` : '' }}
                    </p>
                  </div>
                  <div class="focused-search-semantic-card__snippet">
                    <span class="mwf-android-type-p focused-search-semantic-card__highlight">
                      {{ result.extract ?? result.title }}
                    </span>
                  </div>
                  <div class="focused-search-semantic-card__bottom">
                    <span class="mwf-android-type-small focused-search-semantic-card__meta-item">
                      {{ dummyMeta(result.title).contributors }} contributors
                    </span>
                    <span class="focused-search-semantic-card__meta-dot" aria-hidden="true">·</span>
                    <span class="mwf-android-type-small focused-search-semantic-card__meta-item">
                      {{ dummyMeta(result.title).references }} references
                    </span>
                  </div>
                </article>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </WireframeMobileWrapper>
</template>

<style scoped>
/* ── Bottom sheet layout ────────────────────────────────────── */

.semantic-sheet-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.semantic-sheet__scrim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.32);
  cursor: pointer;
}

.semantic-sheet {
  position: relative;
  z-index: 1;
  background: #fffbfe;
  border-radius: 28px 28px 0 0;
  max-height: 78vh;
  display: flex;
  flex-direction: column;
  animation: sheet-slide-up 0.28s cubic-bezier(0.05, 0.7, 0.1, 1.0);
}

@keyframes sheet-slide-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

.semantic-sheet__handle {
  flex-shrink: 0;
  width: 32px;
  height: 4px;
  border-radius: 2px;
  background: #79747e;
  margin: 22px auto 0;
}

.semantic-sheet__scroll {
  flex: 1 1 auto;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.semantic-sheet__content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 16px 32px;
}

.semantic-sheet__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.semantic-sheet__title {
  margin: 0;
}

.semantic-sheet__beta {
  padding: 2px 6px;
  border-radius: 4px;
  background: #3366cc;
  color: #fff;
  font-size: 10px !important;
  font-weight: 700 !important;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.semantic-sheet__query {
  margin: 0;
  font-size: 16px;
  color: #202122;
}

.semantic-sheet__status {
  margin: 0;
  color: #54595d;
}

.semantic-sheet__results {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* ── Semantic result cards ──────────────────────────────────── */

.focused-search-semantic-card {
  display: grid;
  gap: 10px;
  padding: 14px 12px 0;
  border-radius: 16px;
  border: 1px solid #c8ccd1;
  background: #f8f9fa;
  overflow: hidden;
  cursor: pointer;
}

.focused-search-semantic-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.focused-search-semantic-card__thumb {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background:
    linear-gradient(#c8ccd1 0 0) center 10px / 22px 2px,
    linear-gradient(#c8ccd1 0 0) center 16px / 16px 2px,
    linear-gradient(120deg, #eaecf0, #d4d9df);
  background-repeat: no-repeat;
}

.focused-search-semantic-card__trail {
  margin: 0;
  color: #72777d;
}

.focused-search-semantic-card__snippet {
  display: grid;
  gap: 2px;
}

.focused-search-semantic-card__highlight {
  display: block;
  margin: 0;
  padding: 0 4px;
  background: #ece7a5;
  color: #202122;
}

.focused-search-semantic-card__faded {
  display: block;
  margin: 0;
  color: #a2a9b1;
}

.focused-search-semantic-card__bottom {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  margin: 0 -12px;
  border-top: 1px solid #eaecf0;
}

.focused-search-semantic-card__meta-item {
  color: #72777d;
}

.focused-search-semantic-card__meta-dot {
  color: #c8ccd1;
}

/* ── Skeleton shimmer ───────────────────────────────────────── */

@keyframes skeleton-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}

.focused-search-skeleton {
  border-radius: 6px;
  background: linear-gradient(90deg, #eaecf0 25%, #f8f9fa 50%, #eaecf0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
}

.focused-search-skeleton--trail  { height: 14px; width: 55%; }
.focused-search-skeleton--line   { height: 14px; margin-block: 3px; }
.focused-search-skeleton--line-full   { width: 100%; }
.focused-search-skeleton--line-wide   { width: 80%; }
.focused-search-skeleton--line-medium { width: 60%; }

.focused-search-skeleton-card {
  pointer-events: none;
}

</style>
