<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { cdxIconTrash } from '@wikimedia/codex-icons'
import { RouterLink, useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import WireframeMobileWrapper from '@/components/WireframeMobileWrapper.vue'
import WireframeChromeWrapper from '@/components/chrome/WireframeChromeWrapper.vue'
import { wikimediaApiFetchHeaders, wikiHostFromLang } from '@/config'
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
const namespaces = ['User:', 'Portal:', 'Help:', 'Wikipedia:', 'Template:']
const searchInput = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')
const isSearching = ref(false)
const searchError = ref('')
const selectedLanguage = ref<'en' | 'pt' | 'es'>('en')

interface WikiSearchResult {
  title: string
  description: string
  thumbnailUrl?: string
}

const searchResults = ref<WikiSearchResult[]>([])
const searchHost = computed(() => wikiHostFromLang(selectedLanguage.value))
const router = useRouter()

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
let abortController: AbortController | null = null

const isShowingResults = computed(() => searchQuery.value.trim().length > 0)

const showBetaMenu = ref(false)

function toggleBetaMenu(e: Event) {
  e.stopPropagation()
  showBetaMenu.value = !showBetaMenu.value
}

function closeBetaMenu() {
  showBetaMenu.value = false
}
function getApiErrorMessage(status: number): string {
  if (status === 429) return 'Too many requests. Please wait a moment and try again.'
  if (status >= 500) return 'Wikipedia search is temporarily unavailable.'
  return 'Unable to load search results right now.'
}

async function fetchWikipediaSearchResults(query: string, signal?: AbortSignal): Promise<WikiSearchResult[]> {
  const trimmed = query.trim()
  if (!trimmed.length) return []

  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: trimmed,
    gsrlimit: '10',
    gsrnamespace: '0',
    prop: 'description|pageimages',
    piprop: 'thumbnail',
    pithumbsize: '160',
    pilimit: '10',
    format: 'json',
    formatversion: '2',
    origin: '*',
  })

  const response = await fetch(`https://${searchHost.value}/w/api.php?${params.toString()}`, {
    signal,
    headers: wikimediaApiFetchHeaders('mobile-wireframe-search'),
  })

  if (!response.ok) {
    throw new Error(getApiErrorMessage(response.status))
  }

  const data = (await response.json()) as {
    query?: {
      pages?: Array<{
        title: string
        description?: string
        thumbnail?: { source?: string }
        index?: number
      }>
    }
  }

  const pages = [...(data.query?.pages ?? [])]
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map((page) => ({
      title: page.title,
      description: page.description?.trim() || 'Wikipedia article',
      thumbnailUrl: page.thumbnail?.source,
    }))

  return pages
}

function scheduleSearch(query: string) {
  const trimmed = query.trim()
  searchError.value = ''

  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
    searchDebounceTimer = null
  }

  abortController?.abort()
  abortController = null

  if (!trimmed.length) {
    isSearching.value = false
    searchResults.value = []
    return
  }

  isSearching.value = true
  searchDebounceTimer = setTimeout(async () => {
    abortController = new AbortController()
    try {
      const results = await fetchWikipediaSearchResults(trimmed, abortController.signal)
      if (searchQuery.value.trim() !== trimmed) {
        return
      }
      searchResults.value = results
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return
      }
      searchResults.value = []
      searchError.value =
        error instanceof Error && error.message.length
          ? error.message
          : 'Unable to load search results right now.'
    } finally {
      if (searchQuery.value.trim() === trimmed) {
        isSearching.value = false
      }
    }
  }, 220)
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
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
      searchDebounceTimer = null
    }
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

function openArticle(title: string) {
  window.open(`https://${searchHost.value}/wiki/${encodeURIComponent(title.replace(/\s+/g, '_'))}`, '_blank')
}

function openSemanticResults() {
  const trimmed = searchQuery.value.trim()
  router.push({
    path: '/example-search-experiment-v1/search/semantic-results',
    query: {
      ...(trimmed ? { q: trimmed } : {}),
      lang: selectedLanguage.value,
    },
  })
}

onMounted(() => {
  setTimeout(() => {
    searchInput.value?.focus()
  }, 150)
})
</script>

<template>
  <WireframeMobileWrapper>
    <WireframeChromeWrapper active-tab="search" home-url="/example-search-experiment-v1" search-url="/example-search-experiment-v1/search/focused" class="mobile-android-type mobile-android-type--wireframe">
      <template #header>
        <header class="focused-search-header" aria-label="Focused search header">
          <RouterLink
            to="/example-search-experiment-v1/search"
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

        <ul v-else class="focused-search-content__results">
          <li class="focused-search-content__result-item">
            <div role="button" tabindex="0" class="focused-search-content__result-button" @click="!showBetaMenu && openSemanticResults()" @keydown.enter="!showBetaMenu && openSemanticResults()">
              <span class="focused-search-content__result-copy"><span class="focused-search-content__dive-row"><span class="mwf-android-type-small focused-search-content__dive-badge"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 4.67578C0 4.03125 0.121094 3.42773 0.363281 2.86523C0.605469 2.29883 0.941406 1.80078 1.37109 1.37109C1.80078 0.941406 2.29688 0.605469 2.85938 0.363281C3.42578 0.121094 4.03125 0 4.67578 0C5.32031 0 5.92383 0.121094 6.48633 0.363281C7.05273 0.605469 7.55078 0.941406 7.98047 1.37109C8.41016 1.80078 8.74609 2.29883 8.98828 2.86523C9.23047 3.42773 9.35156 4.03125 9.35156 4.67578C9.35156 5.21094 9.26562 5.71875 9.09375 6.19922C8.92578 6.67969 8.69141 7.11523 8.39062 7.50586L11.2559 10.3887C11.3184 10.4512 11.3652 10.5234 11.3965 10.6055C11.4316 10.6875 11.4492 10.7754 11.4492 10.8691C11.4492 10.998 11.4199 11.1152 11.3613 11.2207C11.3066 11.3262 11.2285 11.4082 11.127 11.4668C11.0254 11.5293 10.9082 11.5605 10.7754 11.5605C10.6816 11.5605 10.5918 11.543 10.5059 11.5078C10.4238 11.4766 10.3477 11.4277 10.2773 11.3613L7.39453 8.47266C7.01172 8.74609 6.58984 8.96094 6.12891 9.11719C5.66797 9.27344 5.18359 9.35156 4.67578 9.35156C4.03125 9.35156 3.42578 9.23047 2.85938 8.98828C2.29688 8.74609 1.80078 8.41016 1.37109 7.98047C0.941406 7.55078 0.605469 7.05469 0.363281 6.49219C0.121094 5.92578 0 5.32031 0 4.67578ZM1.00195 4.67578C1.00195 5.18359 1.0957 5.66016 1.2832 6.10547C1.47461 6.54688 1.73828 6.93555 2.07422 7.27148C2.41406 7.60742 2.80469 7.87109 3.24609 8.0625C3.69141 8.25391 4.16797 8.34961 4.67578 8.34961C5.18359 8.34961 5.6582 8.25391 6.09961 8.0625C6.54492 7.87109 6.93555 7.60742 7.27148 7.27148C7.60742 6.93555 7.87109 6.54688 8.0625 6.10547C8.25391 5.66016 8.34961 5.18359 8.34961 4.67578C8.34961 4.16797 8.25391 3.69336 8.0625 3.25195C7.87109 2.80664 7.60742 2.41602 7.27148 2.08008C6.93555 1.74023 6.54492 1.47656 6.09961 1.28906C5.6582 1.09766 5.18359 1.00195 4.67578 1.00195C4.16797 1.00195 3.69141 1.09766 3.24609 1.28906C2.80469 1.47656 2.41406 1.74023 2.07422 2.08008C1.73828 2.41602 1.47461 2.80664 1.2832 3.25195C1.0957 3.69336 1.00195 4.16797 1.00195 4.67578Z" fill="white"/></svg>{{ selectedLanguage === 'pt' ? 'Mergulhe' : selectedLanguage === 'es' ? 'Bucear' : 'Dive' }}</span><span class="focused-search-content__dive-beta-wrap">
                  <button type="button" class="focused-search-content__dive-beta" @click.stop="toggleBetaMenu">Beta</button>
                  <div v-if="showBetaMenu" class="beta-menu" role="menu">
                    <button type="button" class="beta-menu__item" role="menuitem" @click="closeBetaMenu">Learn more</button>
                    <button type="button" class="beta-menu__item beta-menu__item--danger" role="menuitem" @click="closeBetaMenu">Turn off this experiment</button>
                  </div>
                  <div v-if="showBetaMenu" class="beta-menu__backdrop" @click.stop="closeBetaMenu" />
                </span></span><span class="mwf-android-type-p focused-search-content__result-title">{{ searchQuery.trim() }}</span><span class="mwf-android-type-p focused-search-content__result-description">{{ selectedLanguage === 'pt' ? 'Pesquisar dentro de artigos da Wikipédia' : selectedLanguage === 'es' ? 'Buscar dentro de los artículos de Wikipedia' : 'Search within Wikipedia articles' }}</span></span>
            </div>
          </li>
          <li v-for="result in searchResults" :key="result.title" class="focused-search-content__result-item">
            <button
              type="button"
              class="focused-search-content__result-button"
              @click="openArticle(result.title)"
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
      </section>

      <template #nav>
        <footer class="focused-search-footer" aria-label="Search namespaces">
          <div class="focused-search-footer__namespaces">
            <span class="mwf-android-type-h4 focused-search-footer__ns-label">Namespaces</span>
            <button
              v-for="namespace in namespaces"
              :key="namespace"
              class="mwf-android-type-h4 focused-search-footer__ns-item"
              type="button"
            >
              {{ namespace }}
            </button>
          </div>
        </footer>
      </template>
    </WireframeChromeWrapper>
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
}

.focused-search-header__input::placeholder {
  color: #54595d;
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
.focused-search-content__dive-row { display: inline-flex; align-items: center; gap: 6px; }

.focused-search-content__dive-beta-wrap {
  position: relative;
}

.focused-search-content__dive-beta {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  background: #3366cc;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
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
</style>
