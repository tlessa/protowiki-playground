<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { cdxIconTrash } from '@wikimedia/codex-icons'
import { RouterLink } from 'vue-router'

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

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
let abortController: AbortController | null = null

const isShowingResults = computed(() => searchQuery.value.trim().length > 0)
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

onMounted(async () => {
  await nextTick()
  searchInput.value?.focus()
})
</script>

<template>
  <WireframeMobileWrapper>
    <WireframeChromeWrapper active-tab="search" class="mobile-android-type mobile-android-type--wireframe">
      <template #header>
        <header class="focused-search-header" aria-label="Focused search header">
          <RouterLink
            to="/template-mobile-wireframe/search"
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

        <p
          v-else-if="isShowingResults && !isSearching && searchResults.length === 0"
          class="mwf-android-type-p focused-search-content__status"
        >
          No results found.
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
