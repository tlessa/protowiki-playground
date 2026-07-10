<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import WireframeMobileWrapper from '@/components/WireframeMobileWrapper.vue'
import BetaBadge from '@/components/BetaBadge.vue'
import '@/styles/mobile-android/index.css'

definePage({
  meta: {
    title: 'Dive – Semantic results',
    description: 'Semantic search results as a Material bottom sheet.',
  },
})

// window survives HMR reloads (unlike module vars) and resets on page refresh (unlike sessionStorage)
const w = window as Window & { _v2Visits?: number; _v2CardTapped?: boolean; _v2ToastShown?: boolean }

const router = useRouter()

const searchQuery = ref('')
const searchError = ref('')
const selectedLanguage = ref<'en' | 'pt' | 'es'>('en')

const showFeedbackToast = ref(false)
const feedbackToastThumb = ref<'up' | 'down' | null>(null)
const showThanksToast = ref(false)
let thanksTimer: ReturnType<typeof setTimeout> | null = null

function selectThumb(thumb: 'up' | 'down') {
  feedbackToastThumb.value = thumb
  showFeedbackToast.value = false
  showThanksToast.value = true
  if (thanksTimer) clearTimeout(thanksTimer)
  thanksTimer = setTimeout(() => { showThanksToast.value = false }, 3000)
}

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

function checkFeedbackTrigger() {
  w._v2Visits = (w._v2Visits ?? 0) + 1
  if (w._v2Visits >= 2 && !w._v2CardTapped && !w._v2ToastShown) {
    w._v2ToastShown = true
    showFeedbackToast.value = true
  }
}

function saveToHistory(query: string) {
  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const entry = { query, date }
  const existing: { query: string; date: string }[] = JSON.parse(localStorage.getItem('v2_search_history') ?? '[]')
  if (!existing.some(e => e.query === query && e.date === date)) {
    localStorage.setItem('v2_search_history', JSON.stringify([entry, ...existing]))
  }
}

function openArticle(result: WikiSearchResult) {
  w._v2CardTapped = true
  if (searchQuery.value.trim()) saveToHistory(searchQuery.value.trim())
  router.push({
    path: '/example-search-experiment-latest/article',
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
  checkFeedbackTrigger()
})

// Catches re-navigation to this page when Vue Router reuses the component instance
watch(() => route.fullPath, () => {
  checkFeedbackTrigger()
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
              <BetaBadge />
            </header>

            <p class="mwf-android-type-p semantic-sheet__query">can cats</p>

            <div v-if="showFeedbackToast" class="feedback-inline" role="region" aria-label="Feedback">
              <span class="mwf-android-type-p feedback-inline__label">Did you find what you were looking for? Add more details (optional)</span>
              <div class="feedback-inline__thumbs">
                <button
                  type="button"
                  class="feedback-inline__thumb"
                  :class="{ 'feedback-inline__thumb--active': feedbackToastThumb === 'up' }"
                  aria-label="Yes"
                  @click="selectThumb('up')"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M7 22V11M2 13v7a2 2 0 002 2h11.17a2 2 0 001.96-1.6l1.54-7a2 2 0 00-1.96-2.4H14V5a3 3 0 00-3-3 1 1 0 00-1 1v.5L7.5 9.5A1 1 0 007 10.4V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button
                  type="button"
                  class="feedback-inline__thumb"
                  :class="{ 'feedback-inline__thumb--active': feedbackToastThumb === 'down' }"
                  aria-label="No"
                  @click="selectThumb('down')"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M17 2v11m5-2V4a2 2 0 00-2-2H8.83a2 2 0 00-1.96 1.6l-1.54 7A2 2 0 007.29 13H10v4a3 3 0 003 3 1 1 0 001-1v-.5l2.5-4A1 1 0 0017 13.6V2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

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
                    <span class="mwf-android-type-p focused-search-semantic-card__highlight"><span class="focused-search-semantic-card__quote" aria-hidden="true">&#x201C;</span>{{ result.extract ?? result.title }}</span>
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

    <Transition name="thanks-toast">
      <div v-if="showThanksToast" class="thanks-toast" role="status" aria-live="polite">
        Thanks for your feedback.
      </div>
    </Transition>
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
  gap: var(--mobile-android-space-sm);
}

.semantic-sheet__title {
  margin: 0;
}

.semantic-sheet__query {
  margin: 0;
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

.focused-search-semantic-card__quote {
  font-size: 2em;
  font-weight: 700;
  line-height: 0;
  vertical-align: -0.15em;
  color: #202122;
  user-select: none;
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

/* Inline feedback prompt */
.feedback-inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 12px;
  border-radius: 16px;
  background: #dcdfe3;
}

.feedback-inline__label {
  line-height: 1.4;
  color: #202122;
  flex: 1;
}

.feedback-inline__thumbs {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.feedback-inline__thumb {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 2px solid #a2a9b1;
  background: #dcdfe3;
  color: #72777d;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.feedback-inline__thumb--active {
  border-color: #3366cc;
  color: #3366cc;
  background: #eaf0fb;
}

.thanks-toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 14px 20px;
  border-radius: 8px;
  background: #202122;
  color: #fff;
  font-size: 14px;
  z-index: 400;
  pointer-events: none;
  white-space: nowrap;
}

.thanks-toast-enter-active { animation: thanks-in 0.2s ease-out; }
.thanks-toast-leave-active { animation: thanks-in 0.15s ease-in reverse; }
@keyframes thanks-in {
  from { opacity: 0; transform: translateX(-50%) translateY(6px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}
</style>
