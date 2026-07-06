<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import WireframeMobileWrapper from '@/components/WireframeMobileWrapper.vue'
import WireframeChromeWrapper from '@/components/chrome/WireframeChromeWrapper.vue'
import SemanticResultCard from '@/components/SemanticResultCard.vue'
import '@/styles/mobile-android/index.css'

definePage({
  meta: {
    title: 'Template: Mobile wireframe (search focused)',
    description: 'Focused search state for mobile wireframe with keyboard and recent searches.',
  },
})

interface LanguageOption {
  code: string
  label: string
  lang: 'en' | 'pt' | 'es'
}

const languages: LanguageOption[] = [
  { code: 'EN', label: 'ENGLISH', lang: 'en' },
  { code: 'PT', label: 'PORTUGUES', lang: 'pt' },
  { code: 'ES', label: 'ESPAÑOL', lang: 'es' },
]
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
    extract: 'Night vision is the ability to see in low-light conditions, either naturally with scotopic vision or through a night-vision device. Night vision requires both sufficient spectral range and sufficient intensity range. Humans have poor night vision compared to many animals such as cats, dogs, foxes and rabbits, in part because the human eye lacks a tapetum lucidum' },
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

const showBetaMenu = ref(false)

function toggleBetaMenu(e: Event) {
  e.stopPropagation()
  showBetaMenu.value = !showBetaMenu.value
}

function closeBetaMenu() {
  showBetaMenu.value = false
}


const showFeedbackToast = ref(false)
const feedbackToastThumb = ref<'up' | 'down' | null>(null)
const feedbackToastExpanded = ref(false)
const feedbackToastText = ref('')
const showThanksToast = ref(false)
let thanksTimer: ReturnType<typeof setTimeout> | null = null

const w = window as Window & { _v3Visits?: number; _v3CardTapped?: boolean; _v3ToastShown?: boolean }

function selectThumb(thumb: 'up' | 'down') {
  feedbackToastThumb.value = thumb
  feedbackToastExpanded.value = true
}

function submitFeedbackToast() {
  showFeedbackToast.value = false
  feedbackToastExpanded.value = false
  feedbackToastText.value = ''
  showThanksToast.value = true
  if (thanksTimer) clearTimeout(thanksTimer)
  thanksTimer = setTimeout(() => { showThanksToast.value = false }, 3000)
}

function scheduleSearch(_query: string) {
  searchResults.value = HARDCODED_RESULTS
}

function selectLanguage(lang: 'en' | 'pt' | 'es') {
  if (selectedLanguage.value === lang) return
  selectedLanguage.value = lang
  if (searchQuery.value.trim()) scheduleSearch(searchQuery.value)
}

const router = useRouter()

function saveToHistory(query: string) {
  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const existing: { query: string; date: string }[] = JSON.parse(localStorage.getItem('v3_search_history') ?? '[]')
  if (!existing.some(e => e.query === query && e.date === date)) {
    localStorage.setItem('v3_search_history', JSON.stringify([{ query, date }, ...existing]))
  }
  const recents: string[] = JSON.parse(localStorage.getItem('v3_recent_searches') ?? '[]')
  if (!recents.includes(query)) {
    localStorage.setItem('v3_recent_searches', JSON.stringify([query, ...recents]))
  }
}

function openArticle(result: WikiSearchResult) {
  w._v3CardTapped = true
  if (searchQuery.value.trim()) saveToHistory(searchQuery.value.trim())
  router.push({
    path: '/example-search-experiment-v3-jump/article',
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

  w._v3Visits = (w._v3Visits ?? 0) + 1
  if (w._v3Visits >= 2 && !w._v3CardTapped && !w._v3ToastShown) {
    w._v3ToastShown = true
    feedbackToastThumb.value = null
    feedbackToastExpanded.value = false
    feedbackToastText.value = ''
    showFeedbackToast.value = true
  }
})
</script>

<template>
  <WireframeMobileWrapper>
    <div class="ui-frame">
    <WireframeChromeWrapper active-tab="search" home-url="/example-search-experiment-v1" search-url="/example-search-experiment-v1/search/focused" class="mobile-android-type mobile-android-type--wireframe">
      <template #header>
        <header class="focused-search-header" aria-label="Focused search header">
          <RouterLink
            to="/example-search-experiment-v3-jump/search/dive-dedicated-field"
            class="focused-search-header__back"
            aria-label="Back"
          >
            <span class="focused-search-header__back-shaft" />
          </RouterLink>

          <div class="focused-search-header__field">
            <span class="focused-search-header__beta-wrap">
              <button type="button" class="focused-search-header__beta" @click.stop="toggleBetaMenu">Beta</button>
              <div v-if="showBetaMenu" class="beta-menu" role="menu">
                <button type="button" class="beta-menu__item" role="menuitem" @click="closeBetaMenu">Learn more</button>
                <button type="button" class="beta-menu__item beta-menu__item--danger" role="menuitem" @click="closeBetaMenu">Turn off this experiment</button>
              </div>
              <div v-if="showBetaMenu" class="beta-menu__backdrop" @click="closeBetaMenu" />
            </span>
            <span class="mwf-android-type-p focused-search-header__query">{{ searchQuery }}</span>
          </div>
        </header>

        <div class="focused-search-languages" role="tablist" aria-label="Search languages">
          <div class="focused-search-languages__list">
            <button
              v-for="language in languages"
              :key="language.code"
              class="focused-search-languages__item"
              :class="{ 'focused-search-languages__item--active': language.lang === selectedLanguage }"
              type="button"
              @click="selectLanguage(language.lang)"
            >
              <span class="focused-search-languages__row">
                <span class="focused-search-languages__icon">{{ language.code }}</span>
                <span class="mwf-android-type-small focused-search-languages__label">{{ language.label }}</span>
              </span>
            </button>
          </div>

          <button class="mwf-android-type-chip focused-search-languages__more" type="button">
            more
          </button>
        </div>
        
      </template>

      <section class="focused-search-content" aria-label="Search results">
        <div v-if="showFeedbackToast" class="feedback-inline" role="region" aria-label="Feedback">
          <div class="feedback-inline__top-row">
            <span class="mwf-android-type-p feedback-inline__label">Did you find what you were looking for?</span>
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

          <div v-if="feedbackToastExpanded" class="feedback-inline__details">
            <input
              v-model="feedbackToastText"
              class="mwf-android-type-p feedback-inline__input"
              type="text"
              placeholder="Tell us more (optional)"
              aria-label="Tell us more"
            >
            <button type="button" class="mwf-android-type-p feedback-inline__submit" @click="submitFeedbackToast">Submit</button>
          </div>
        </div>

        <p v-if="searchError" class="mwf-android-type-p focused-search-content__status">
          {{ searchError }}
        </p>


        <ul v-if="isSkeletonVisible" class="focused-search-content__results focused-search-content__results--semantic" aria-hidden="true">
          <li v-for="n in 3" :key="n" class="focused-search-content__result-item">
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

        <ul v-else class="focused-search-content__results focused-search-content__results--semantic" aria-label="Dive results">
          <li v-if="!searchResults.length && !searchError" class="focused-search-content__result-item">
            <p class="mwf-android-type-p focused-search-content__status">No results found.</p>
          </li>
          <li v-for="result in searchResults" :key="result.title" class="focused-search-content__result-item">
            <SemanticResultCard
              :trail="result.title + (result.sectionTitle ? ' > ' + result.sectionTitle : '')"
              :highlight="result.extract ?? result.title"
              :contributors="dummyMeta(result.title).contributors"
              :references="dummyMeta(result.title).references"
              role="button"
              tabindex="0"
              @click="openArticle(result)"
            />
          </li>
        </ul>
      </section>

    </WireframeChromeWrapper>
    </div>

    <Transition name="thanks-toast">
      <div v-if="showThanksToast" class="thanks-toast" role="status" aria-live="polite">
        Thanks for your feedback.
      </div>
    </Transition>
  </WireframeMobileWrapper>
</template>

<style scoped>
.focused-search-header {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: var(--mobile-android-space-sm);
  min-height: 64px;
  padding: 8px 12px 10px;
  background: #fff;
  border-bottom: 1px solid #eaecf0;
}

.focused-search-header__back {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  text-decoration: none;
}

.focused-search-header__back-shaft {
  position: relative;
  width: 18px;
  height: 2px;
  background: #202122;
  border-radius: 999px;
}

.focused-search-header__back-shaft::before {
  content: '';
  position: absolute;
  inset-inline-start: -1px;
  inset-block-start: -4px;
  width: 9px;
  height: 9px;
  border-inline-start: 2px solid #202122;
  border-block-end: 2px solid #202122;
  transform: rotate(45deg);
}

.focused-search-header__field {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: var(--mobile-android-size-list-item-height);
}

.focused-search-header__field {
  display: flex;
  align-items: center;
  gap: var(--mobile-android-space-sm);
}

.focused-search-header__beta-wrap {
  flex-shrink: 0;
}

.focused-search-header__beta {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 4px;
  border: 0;
  border-radius: 100px;
  background: var(--progressive, #36C);
  color: #fff;
  font-family: var(--mobile-android-type-toolbar-font-family, sans-serif);
  font-size: 10px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
}

.focused-search-header__query {
  color: #202122;
  user-select: none;
}

.focused-search-header__beta {
  position: absolute;
  inset-inline-end: 22px;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 4px;
  border-radius: 100px;
  background: var(--progressive, #36C);
  color: #fff;
  font-family: var(--mobile-android-type-toolbar-font-family, sans-serif);
  font-size: 10px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  user-select: none;
}

.focused-search-languages {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  min-height: 52px;
  padding: 8px 16px 0 8px;
  background: #ffffff;
  box-shadow: 0 4px 1px rgba(157, 157, 157, 0.25);
}

.focused-search-languages__item {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  flex: 0 0 auto;
  width: 130px;
  padding: 8px 8px 0;
  border: 0;
  background: transparent;
  overflow: hidden;
}

.focused-search-languages__list {
  display: inline-flex;
  align-items: stretch;
  flex: 1 1 auto;
  min-width: 0;
  overflow-x: auto;
}

.focused-search-languages__item::after {
  content: '';
  width: 100%;
  height: 1.5px;
  border-radius: 2px 2px 0 0;
  background: #3366cc;
  opacity: 0;
}

.focused-search-languages__row {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  min-width: 0;
}

.focused-search-languages__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid #72777d;
  color: #72777d;
  font-family: var(--mobile-android-type-toolbar-font-family);
  font-size: var(--mobile-android-type-toolbar-font-size);
  font-weight: var(--mobile-android-type-toolbar-font-weight);
  line-height: var(--mobile-android-type-toolbar-line-height);
}

.focused-search-languages__label {
  color: #72777d;
  white-space: nowrap;
  min-width: 0;
  max-width: 6em;
  overflow: hidden;
  text-overflow: clip;
}

.focused-search-languages__item--active .focused-search-languages__label {
  color: #3366cc;
}

.focused-search-languages__item--active .focused-search-languages__icon {
  border: 0;
  background: #3366cc;
  color: #fff;
}

.focused-search-languages__item--active::after {
  opacity: 1;
}

.focused-search-languages__more {
  flex: 0 0 auto;
  align-self: center;
  margin-inline-start: 8px;
  border: 0;
  padding: 0;
  background: transparent;
  color: #3366cc;
}

.focused-search-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  padding: 16px 16px 20px;
  background: #FFFFFF;
}

.focused-search-content__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.focused-search-dive-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.focused-search-dive-header__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--mobile-android-space-sm);
}

.focused-search-dive-header__title {
  margin: 0;
}

.focused-search-dive-header__beta-wrap {
  position: relative;
  align-self: flex-start;
}

.focused-search-dive-header__beta {
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: flex-start;
  padding: 0 4px;
  border-radius: 100px;
  background: var(--progressive, #36C);
  color: #fff;
  font-family: var(--mobile-android-type-toolbar-font-family, sans-serif);
  font-size: 10px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: 0;
  cursor: pointer;
}

.beta-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 200;
  min-width: 220px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.12);
  overflow: hidden;
}

.beta-menu__item {
  display: block;
  width: 100%;
  padding: 14px 16px;
  border: 0;
  background: transparent;
  text-align: start;
  font-size: 16px;
  color: #202122;
  cursor: pointer;
}

.beta-menu__item:hover {
  background: #f8f9fa;
}

.beta-menu__item--danger {
  color: #d33;
}

.beta-menu__backdrop {
  position: fixed;
  inset: 0;
  z-index: 199;
}

.focused-search-dive-header__rate {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.focused-search-dive-header__rate-label {
  font-family: var(--mobile-android-type-toolbar-font-family, sans-serif);
  font-size: 13px;
  color: #54595d;
  white-space: nowrap;
}

.focused-search-dive-header__stars {
  display: flex;
  align-items: center;
  gap: 2px;
}

.focused-search-content__title {
  margin: 0;
}

.focused-search-content__status {
  margin: 0;
  color: #54595d;
}

.focused-search-content__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  color: #72777d;
}

.focused-search-content__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.focused-search-content__item {
  margin: 0;
}

.focused-search-content__item-button {
  width: 100%;
  padding: 14px 0;
  border: 0;
  background: transparent;
  color: #202122;
  font: inherit;
  text-align: start;
}

.focused-search-content__results {
  margin: 0;
  padding: 0;
  list-style: none;
}

.focused-search-content__result-item {
  margin: 0;
  padding: 8px 0;
}

.focused-search-content__result-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 14px;
  border: 0;
  padding: 0;
  background: transparent;
  text-align: start;
}

.focused-search-content__result-copy {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.focused-search-content__dive-badge { display: inline-flex; align-items: center; width: fit-content; gap: var(--mobile-android-space-sm); padding: 3px 12px; border-radius: 10px; background: #8a8f95; color: #fff; }
.focused-search-content__dive-badge svg { display: block; width: 12px; height: 12px; }

.focused-search-content__result-title,
.focused-search-content__result-description {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.focused-search-content__result-title {
  color: #202122;
}

.focused-search-content__result-description {
  color: #54595d;
}

.focused-search-content__result-thumb {
  flex: 0 0 auto;
  width: 74px;
  height: 74px;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.focused-search-content__result-thumb--placeholder {
  background: linear-gradient(120deg, #d4d9df, #eceff2 58%, #cfd5dc);
}

.focused-search-content__results--semantic {
  display: grid;
  gap: 10px;
}

.focused-search-semantic-card {
  display: grid;
  gap: 10px;
  padding: 14px 12px 0;
  border-radius: 16px;
  border: 1px solid #c8ccd1;
  background: #f8f9fa;
  overflow: hidden;
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

.focused-search-semantic-card__quote {
  font-size: 2em;
  font-weight: 700;
  line-height: 0;
  vertical-align: -0.15em;
  color: #202122;
  user-select: none;
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

.focused-search-footer {
  position: sticky;
  bottom: 0;
  z-index: 20;
  background: #f5f6f7;
}

.focused-search-footer__namespaces {
  display: flex;
  gap: var(--mobile-android-space-sm);
  align-items: center;
  min-height: 44px;
  padding: 0 12px;
  overflow-x: auto;
  background: #f5f6f7;
  border-top: 1px solid #eaecf0;
  border-bottom: 1px solid #eaecf0;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.focused-search-footer__ns-label,
.focused-search-footer__ns-item {
  margin: 0;
  border: 0;
  background: transparent;
  color: #202122;
  white-space: nowrap;
}

.focused-search-footer__ns-item {
  color: #3366cc;
  padding: 0;
}

@media (min-width: 520px) {
  .focused-search-languages,
  .focused-search-header {
    padding-inline: 16px;
  }

  .focused-search-content {
    padding-inline: 20px;
  }
}

@keyframes skeleton-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.focused-search-skeleton {
  border-radius: 6px;
  background: linear-gradient(90deg, #eaecf0 25%, #f8f9fa 50%, #eaecf0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
}

.focused-search-skeleton--trail {
  height: 14px;
  width: 55%;
}

.focused-search-skeleton--line {
  height: 14px;
  margin-block: 3px;
}

.focused-search-skeleton--line-full  { width: 100%; }
.focused-search-skeleton--line-wide  { width: 80%; }
.focused-search-skeleton--line-medium { width: 60%; }

.focused-search-skeleton-card {
  pointer-events: none;
}

/* Rate results button */
.focused-search-dive-header__rate {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.ui-frame {
  position: relative;
  min-height: 100vh;
  --proto-card-highlight-bg: #ece7a5;
}

/* Feedback bottom sheet */
.feedback-sheet-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.32);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.feedback-sheet {
  width: min(100%, 560px);
  box-sizing: border-box;
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 12px 20px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.feedback-sheet__handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: #c8ccd1;
  margin-bottom: 4px;
}

.feedback-sheet__prompt {
  margin: 0;
  color: #54595d;
  align-self: flex-start;
}

.feedback-sheet__stars {
  display: flex;
  gap: var(--mobile-android-space-sm);
}

.feedback-sheet__star {
  border: 0;
  background: transparent;
  padding: 4px;
  cursor: pointer;
  color: #c8ccd1;
  line-height: 0;
}

.feedback-sheet__star svg path {
  stroke: #c8ccd1;
  fill: none;
}

.feedback-sheet__star--filled svg path {
  stroke: #f0a500;
  fill: #f0a500;
}

.feedback-sheet__details-label {
  margin: 0;
  align-self: flex-start;
  color: #202122;
}

.feedback-sheet__textarea {
  width: 100%;
  border: 1px solid #c8ccd1;
  border-radius: 4px;
  padding: 10px 12px;
  font: inherit;
  color: #202122;
  resize: none;
  box-sizing: border-box;
  outline: none;
}

.feedback-sheet__textarea:focus {
  border-color: #3366cc;
}

.feedback-sheet__submit {
  width: 100%;
  padding: 14px;
  border: 1px solid #c8ccd1;
  border-radius: 24px;
  background: transparent;
  color: #202122;
  cursor: pointer;
  font: inherit;
}

/* Toast */
.feedback-toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: min(calc(100% - 32px), 528px);
  padding: 14px 16px;
  border-radius: 4px;
  background: #e0e0e0;
  color: #202122;
  font-size: 15px;
  z-index: 200;
  pointer-events: none;
}

.toast-enter-active { animation: toast-in 0.2s ease-out; }
.toast-leave-active { animation: toast-in 0.15s ease-in reverse; }
@keyframes toast-in {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* Sheet transition */
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s ease;
}

.sheet-enter-active .feedback-sheet,
.sheet-leave-active .feedback-sheet {
  transition: transform 0.25s ease;
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .feedback-sheet,
.sheet-leave-to .feedback-sheet {
  transform: translateY(100%);
}

/* Inline feedback prompt */
.feedback-inline {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
  background: #dcdfe3;
}

.feedback-inline__top-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
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

.feedback-inline__details {
  display: grid;
  gap: 12px;
}

.feedback-inline__input {
  width: 100%;
  box-sizing: border-box;
  height: 48px;
  border-radius: 8px;
  border: 1.5px solid #a2b8d1;
  background: #dcdfe3;
  color: #202122;
  padding: 0 14px;
  outline: none;
}

.feedback-inline__input::placeholder {
  color: #72777d;
}

.feedback-inline__input:focus {
  border-color: #3366cc;
  background: #f8f9fa;
}

.feedback-inline__submit {
  justify-self: center;
  min-width: 180px;
  height: 46px;
  border-radius: 999px;
  border: 1.5px solid #a2b8d1;
  background: #f1f3f5;
  color: #202122;
  line-height: 1.2;
  padding: 0 20px;
  cursor: pointer;
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
