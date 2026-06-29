<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { cdxIconTrash } from '@wikimedia/codex-icons'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import WireframeMobileWrapper from '@/components/WireframeMobileWrapper.vue'
import WireframeChromeWrapper from '@/components/chrome/WireframeChromeWrapper.vue'
import { MATERIAL_ICON_PATHS } from '@/lib/materialIconPaths'
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
const recentSearches = ref([
  'dog',
  'hshd',
  "cat\'s ability to see in the dark",
  "cat\'s ability",
  'cat',
  'edga',
])
const searchInput = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')
const isSearching = ref(false)
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

const showFeedbackSheet = ref(false)
const hoverRating = ref(0)
const selectedRating = ref(0)
const feedbackText = ref('')
const showToast = ref(false)

function openFeedbackSheet() {
  showFeedbackSheet.value = true
}

function closeFeedbackSheet() {
  showFeedbackSheet.value = false
}

function submitFeedback() {
  showFeedbackSheet.value = false
  selectedRating.value = 0
  feedbackText.value = ''
  setTimeout(() => {
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 3000)
  }, 200)
}

let abortController: AbortController | null = null

const isShowingResults = computed(() => searchQuery.value.trim().length > 0)


function scheduleSearch(_query: string) {
  searchResults.value = HARDCODED_RESULTS
}


function onSearchInput(event: Event) {
  const target = event.target as HTMLInputElement | null
  searchQuery.value = target?.value ?? ''
  scheduleSearch(searchQuery.value)
}

function clearListOrQuery() {
  if (isShowingResults.value) {
    searchQuery.value = ''
    searchResults.value = []
    searchError.value = ''
    isSearching.value = false
    isSkeletonVisible.value = false
    abortController?.abort()
    nextTick(() => searchInput.value?.focus())
    return
  }
  recentSearches.value = []
}

function useSuggestion(value: string) {
  searchQuery.value = value
  scheduleSearch(value)
  nextTick(() => {
    if (searchInput.value) {
      searchInput.value.value = value
      searchInput.value.focus()
    }
  })
}

function selectLanguage(lang: 'en' | 'pt' | 'es') {
  if (selectedLanguage.value === lang) {
    return
  }

  selectedLanguage.value = lang

  if (searchQuery.value.trim()) {
    scheduleSearch(searchQuery.value)
  }

  nextTick(() => searchInput.value?.focus())
}

const router = useRouter()

function openArticle(result: WikiSearchResult) {
  router.push({
    path: '/example-search-experiment-v3-jump/article',
    query: {
      article: result.title,
      ...(result.anchor ? { anchor: result.anchor } : {}),
    },
    state: { highlight: result.extract ?? '' },
  })
}

onMounted(async () => {
  const routeQuery = typeof route.query.q === 'string' ? route.query.q.trim() : ''
  const routeLang = route.query.lang
  if (routeLang === 'en' || routeLang === 'pt' || routeLang === 'es') {
    selectedLanguage.value = routeLang
  }
  if (routeQuery) {
    searchQuery.value = routeQuery
    scheduleSearch(routeQuery)
  }
  await nextTick()
  if (searchInput.value) {
    searchInput.value.value = routeQuery
    searchInput.value.focus()
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

          <div class="focused-search-header__field" role="search">
            <input
              ref="searchInput"
              class="mwf-android-type-p focused-search-header__input"
              type="search"
              placeholder="Search Wikipedia"
              aria-label="Search Wikipedia"
              autocomplete="off"
              autocapitalize="none"
              spellcheck="false"
              autofocus
              :value="searchQuery"
              @input="onSearchInput"
            />
            
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

      <section class="focused-search-content" aria-label="Recent searches">
        <header v-if="!isShowingResults" class="focused-search-content__header">
          <h1 class="mwf-android-type-h1 focused-search-content__title">Recent searches:</h1>
          <button
            class="focused-search-content__clear"
            type="button"
            aria-label="Clear recent searches"
            @click="clearListOrQuery"
          >
            <AppIcon :codex-icon="cdxIconTrash" :material-icon="MATERIAL_ICON_PATHS.trash" />
          </button>
        </header>

        <p v-if="searchError" class="mwf-android-type-p focused-search-content__status">
          {{ searchError }}
        </p>

        <header v-if="isShowingResults" class="focused-search-dive-header">
          <span class="focused-search-dive-header__beta">Beta</span>
          <div class="focused-search-dive-header__row">
            <h2 class="mwf-android-type-h1 focused-search-dive-header__title">Dive</h2>
            <button class="focused-search-dive-header__rate" type="button" aria-label="Rate results" @click="openFeedbackSheet">
              <span class="focused-search-dive-header__rate-label">Rate results</span>
              <span class="focused-search-dive-header__stars" aria-hidden="true">
                <svg v-for="i in 5" :key="i" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l2.9 6.1L22 9.3l-5 4.9 1.2 6.8L12 17.8l-6.2 3.2L7 14.2 2 9.3l7.1-1.2L12 2z" stroke="#72777d" stroke-width="1.5" stroke-linejoin="round"/>
                </svg>
              </span>
            </button>
          </div>
        </header>

        <ul v-if="!isShowingResults" class="focused-search-content__list">
          <li
            v-for="item in recentSearches"
            :key="item"
            class="mwf-android-type-p focused-search-content__item"
          >
            <button type="button" class="focused-search-content__item-button" @click="useSuggestion(item)">
              {{ item }}
            </button>
          </li>
        </ul>

        <ul v-else-if="false" class="focused-search-content__results">
          <li class="focused-search-content__result-item">
            <button type="button" class="focused-search-content__result-button" @click="openArticle({ title: searchQuery.trim(), description: '' })">
              <span class="focused-search-content__result-copy"><span class="mwf-android-type-small focused-search-content__dive-badge"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 4.67578C0 4.03125 0.121094 3.42773 0.363281 2.86523C0.605469 2.29883 0.941406 1.80078 1.37109 1.37109C1.80078 0.941406 2.29688 0.605469 2.85938 0.363281C3.42578 0.121094 4.03125 0 4.67578 0C5.32031 0 5.92383 0.121094 6.48633 0.363281C7.05273 0.605469 7.55078 0.941406 7.98047 1.37109C8.41016 1.80078 8.74609 2.29883 8.98828 2.86523C9.23047 3.42773 9.35156 4.03125 9.35156 4.67578C9.35156 5.21094 9.26562 5.71875 9.09375 6.19922C8.92578 6.67969 8.69141 7.11523 8.39062 7.50586L11.2559 10.3887C11.3184 10.4512 11.3652 10.5234 11.3965 10.6055C11.4316 10.6875 11.4492 10.7754 11.4492 10.8691C11.4492 10.998 11.4199 11.1152 11.3613 11.2207C11.3066 11.3262 11.2285 11.4082 11.127 11.4668C11.0254 11.5293 10.9082 11.5605 10.7754 11.5605C10.6816 11.5605 10.5918 11.543 10.5059 11.5078C10.4238 11.4766 10.3477 11.4277 10.2773 11.3613L7.39453 8.47266C7.01172 8.74609 6.58984 8.96094 6.12891 9.11719C5.66797 9.27344 5.18359 9.35156 4.67578 9.35156C4.03125 9.35156 3.42578 9.23047 2.85938 8.98828C2.29688 8.74609 1.80078 8.41016 1.37109 7.98047C0.941406 7.55078 0.605469 7.05469 0.363281 6.49219C0.121094 5.92578 0 5.32031 0 4.67578ZM1.00195 4.67578C1.00195 5.18359 1.0957 5.66016 1.2832 6.10547C1.47461 6.54688 1.73828 6.93555 2.07422 7.27148C2.41406 7.60742 2.80469 7.87109 3.24609 8.0625C3.69141 8.25391 4.16797 8.34961 4.67578 8.34961C5.18359 8.34961 5.6582 8.25391 6.09961 8.0625C6.54492 7.87109 6.93555 7.60742 7.27148 7.27148C7.60742 6.93555 7.87109 6.54688 8.0625 6.10547C8.25391 5.66016 8.34961 5.18359 8.34961 4.67578C8.34961 4.16797 8.25391 3.69336 8.0625 3.25195C7.87109 2.80664 7.60742 2.41602 7.27148 2.08008C6.93555 1.74023 6.54492 1.47656 6.09961 1.28906C5.6582 1.09766 5.18359 1.00195 4.67578 1.00195C4.16797 1.00195 3.69141 1.09766 3.24609 1.28906C2.80469 1.47656 2.41406 1.74023 2.07422 2.08008C1.73828 2.41602 1.47461 2.80664 1.2832 3.25195C1.0957 3.69336 1.00195 4.16797 1.00195 4.67578Z" fill="white"/></svg>{{ selectedLanguage === 'pt' ? 'Mergulhe' : selectedLanguage === 'es' ? 'Bucear' : 'Dive' }}</span><span class="mwf-android-type-p focused-search-content__result-title">{{ searchQuery.trim() }}</span><span class="mwf-android-type-p focused-search-content__result-description">{{ selectedLanguage === 'pt' ? 'Pesquisar dentro de artigos da Wikipédia' : selectedLanguage === 'es' ? 'Buscar dentro de los artículos de Wikipedia' : 'Search within Wikipedia articles' }}</span></span>
            </button>
          </li>
          <li v-for="result in searchResults" :key="result.title" class="focused-search-content__result-item">
            <button
              type="button"
              class="focused-search-content__result-button"
              @click="openArticle(result)"
            >
              <span class="focused-search-content__result-copy">
                <span class="mwf-android-type-p focused-search-content__result-title">{{ result.title }}</span>
                <span class="mwf-android-type-p focused-search-content__result-description">
                  {{ result.description }}
                </span>
              </span>

              <span
                v-if="result.thumbnailUrl"
                class="focused-search-content__result-thumb"
                :style="{ backgroundImage: `url(${result.thumbnailUrl})` }"
                aria-hidden="true"
              />
              <span v-else class="focused-search-content__result-thumb focused-search-content__result-thumb--placeholder" aria-hidden="true" />
            </button>
          </li>
        </ul>

        <ul v-else-if="isSkeletonVisible" class="focused-search-content__results focused-search-content__results--semantic" aria-hidden="true">
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

        <ul v-else class="focused-search-content__results focused-search-content__results--semantic">
          <li v-if="!searchResults.length && !searchError" class="focused-search-content__result-item">
            <p class="mwf-android-type-p focused-search-content__status">No results found.</p>
          </li>
          <li v-for="result in searchResults" :key="result.title" class="focused-search-content__result-item">
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
      </section>

    </WireframeChromeWrapper>
    <!-- Feedback bottom sheet -->
    <Transition name="sheet">
      <div v-if="showFeedbackSheet" class="feedback-sheet-backdrop" @click.self="closeFeedbackSheet">
        <div class="feedback-sheet" role="dialog" aria-modal="true" aria-label="Rate results">
          <div class="feedback-sheet__handle" />
          <p class="feedback-sheet__prompt mwf-android-type-p">Rate results</p>
          <div class="feedback-sheet__stars" role="radiogroup" aria-label="Star rating">
            <button
              v-for="i in 5"
              :key="i"
              type="button"
              class="feedback-sheet__star"
              :class="{ 'feedback-sheet__star--filled': i <= (hoverRating || selectedRating) }"
              :aria-label="`${i} star${i > 1 ? 's' : ''}`"
              :aria-pressed="selectedRating === i"
              @mouseenter="hoverRating = i"
              @mouseleave="hoverRating = 0"
              @click="selectedRating = i"
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2l2.9 6.1L22 9.3l-5 4.9 1.2 6.8L12 17.8l-6.2 3.2L7 14.2 2 9.3l7.1-1.2L12 2z" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <p class="feedback-sheet__details-label mwf-android-type-p">Add more details here (optional)</p>
          <textarea
            v-model="feedbackText"
            class="feedback-sheet__textarea mwf-android-type-p"
            rows="4"
            placeholder=""
          />
          <button class="feedback-sheet__submit mwf-android-type-p" type="button" @click="submitFeedback">
            Submit
          </button>
        </div>
      </div>
    </Transition>

    <Transition name="toast">
      <div v-if="showToast" class="feedback-toast" role="status" aria-live="polite">
        <strong>Thanks for your feedback.</strong>
      </div>
    </Transition>
    </div>
  </WireframeMobileWrapper>
</template>

<style scoped>
.focused-search-header {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 8px;
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
  min-height: 48px;
}

.focused-search-header__input {
  width: 100%;
  border: 0;
  background: transparent;
  color: #202122;
  outline: none;
  padding-inline-end: 52px;
}

.focused-search-header__input::placeholder {
  color: #54595d;
}

.focused-search-header__beta {
  position: absolute;
  inset-inline-end: 22px;
  pointer-events: none;
  padding: 2px 6px;
  border-radius: 4px;
  background: #3366cc;
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
  gap: 8px;
}

.focused-search-dive-header__title {
  margin: 0;
}

.focused-search-dive-header__beta {
  display: inline-block;
  align-self: flex-start;
  padding: 2px 6px;
  border-radius: 4px;
  background: #3366cc;
  color: #fff;
  font-family: var(--mobile-android-type-toolbar-font-family, sans-serif);
  font-size: 10px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.04em;
  text-transform: uppercase;
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

.focused-search-content__dive-badge { display: inline-flex; align-items: center; width: fit-content; gap: 8px; padding: 3px 12px; border-radius: 10px; background: #8a8f95; color: #fff; }
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
  gap: 8px;
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
  gap: 8px;
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
</style>
