<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { cdxIconTrash } from '@wikimedia/codex-icons'
import { RouterLink, useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import BetaBadge from '@/components/BetaBadge.vue'
import LottiePlayer from '@/components/LottiePlayer.vue'
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
const router = useRouter()
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

const showFeedbackToast = ref(false)
const feedbackToastThumb = ref<'up' | 'down' | null>(null)
const feedbackToastExpanded = ref(false)
const feedbackToastText = ref('')
const showThanksToast = ref(false)
let thanksTimer: ReturnType<typeof setTimeout> | null = null
let diveCount = 0
let articleOpened = false

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

function onSearchEnter() {
  const q = searchQuery.value.trim()
  if (!q) return
  openDive()
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

function saveToHistory(query: string) {
  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const existing: { query: string; date: string }[] = JSON.parse(sessionStorage.getItem('latest_search_history') ?? '[]')
  if (!existing.some(e => e.query === query && e.date === date)) {
    sessionStorage.setItem('latest_search_history', JSON.stringify([{ query, date }, ...existing]))
  }
  const recents: string[] = JSON.parse(sessionStorage.getItem('latest_recent_searches') ?? '[]')
  if (!recents.includes(query)) {
    sessionStorage.setItem('latest_recent_searches', JSON.stringify([query, ...recents]))
  }
}

function openArticle(result: WikiSemanticResult) {
  articleOpened = true
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

// ── Dive sheet ──────────────────────────────────────────────────

const showDive = ref(false)

const betaMenuOpen = ref<'card' | 'sheet' | null>(null)

const showDiveSettings = ref(false)
const moduleVisible = ref(true)
const showHideToast = ref(false)
let hideToastTimer: ReturnType<typeof setTimeout> | null = null

function hideModule() {
  moduleVisible.value = false
  showHideToast.value = true
  if (hideToastTimer) clearTimeout(hideToastTimer)
  hideToastTimer = setTimeout(() => { showHideToast.value = false }, 4000)
}

function toggleBetaMenu(source: 'card' | 'sheet', e: Event) {
  e.stopPropagation()
  betaMenuOpen.value = betaMenuOpen.value === source ? null : source
}

function closeBetaMenu() {
  betaMenuOpen.value = null
}

interface WikiSemanticResult {
  title: string
  extract?: string
  sectionTitle?: string
  anchor?: string
}

const diveResults = ref<WikiSemanticResult[]>([])
const diveError = ref('')
const isDiveSearching = ref(false)
const isDiveSkeletonVisible = ref(false)
let diveSkeletonTimer: ReturnType<typeof setTimeout> | null = null

let diveAbortController: AbortController | null = null

const DIVE_SKIP_SECTIONS = new Set(['See also', 'References', 'External links', 'Notes', 'Further reading', 'Bibliography'])

function getRestOfExtract(text: string): string {
  const match = text.match(/^.*?[.!?](?:\s|$)/s)
  if (!match) return ''
  return text.slice(match[0].length).trim().slice(0, 400)
}

function dummyMeta(title: string): { contributors: number; references: number } {
  let h = 0
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0
  return { contributors: 200 + (h % 800), references: 10 + (h % 60) }
}

async function fetchSectionTitle(title: string, signal?: AbortSignal): Promise<string | undefined> {
  const params = new URLSearchParams({
    action: 'parse', page: title, prop: 'sections',
    format: 'json', formatversion: '2', origin: '*',
  })
  try {
    const res = await fetch(`https://${searchHost.value}/w/api.php?${params.toString()}`, {
      signal, headers: wikimediaApiFetchHeaders('mobile-wireframe-search'),
    })
    if (!res.ok) return undefined
    const data = await res.json() as { parse?: { sections?: Array<{ line: string }> } }
    const sections = (data.parse?.sections ?? []).filter(s => s.line && !DIVE_SKIP_SECTIONS.has(s.line))
    if (!sections.length) return undefined
    let h = 0
    for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0
    return sections[h % sections.length].line
  } catch {
    return undefined
  }
}

function startDiveSkeleton() {
  isDiveSkeletonVisible.value = true
  if (diveSkeletonTimer) clearTimeout(diveSkeletonTimer)
  diveSkeletonTimer = setTimeout(() => {
    if (!isDiveSearching.value) isDiveSkeletonVisible.value = false
  }, 1000)
}

async function fetchDiveResults(query: string, signal?: AbortSignal): Promise<WikiSemanticResult[]> {
  const trimmed = query.trim()
  if (!trimmed.length) return []
  const params = new URLSearchParams({
    action: 'query', generator: 'search', gsrsearch: trimmed, gsrlimit: '10',
    gsrnamespace: '0', prop: 'description|extracts',
    exintro: '1', exsentences: '4', explaintext: '1',
    format: 'json', formatversion: '2', origin: '*',
  })
  const response = await fetch(`https://${searchHost.value}/w/api.php?${params.toString()}`, {
    signal, headers: wikimediaApiFetchHeaders('mobile-wireframe-search'),
  })
  if (!response.ok) throw new Error(getApiErrorMessage(response.status))
  const data = (await response.json()) as {
    query?: { pages?: Array<{ title: string; extract?: string; index?: number }> }
  }
  return [...(data.query?.pages ?? [])]
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map(page => ({ title: page.title, extract: page.extract?.trim() || undefined }))
}

// ── Query → card-set mapping ─────────────────────────────────────────
// To add a new query: put the exact typed text (lowercase) as the key,
// and the set index (0, 1, or 2) as the value. Add a matching set below.
// Unrecognised queries fall back to set 0.
const QUERY_DIVE_MAP: Record<string, number> = {
  'can cats see in the dark': 0,
  'how was the moon formed': 1,
  'who discovered dna': 2,
}

const QUERY_CARD_SETS: WikiSemanticResult[][] = [
  // Set 0 ── "can cats see in the dark"
  [
    { title: 'Cat', sectionTitle: 'Vision', anchor: 'Vision', extract: 'Cats have excellent night vision and can see at one sixth the light level required for human vision.' },
    { title: 'Night vision', sectionTitle: '', anchor: '', extract: 'Night vision is the ability to see in low-light conditions. Humans have poor night vision compared to many animals such as cats, in part because the human eye lacks a tapetum lucidum.' },
    { title: 'Tapetum lucidum', sectionTitle: 'Cats', anchor: 'Cats', extract: 'While enhancing night vision, increased light scatter within the tapetum slightly compromises visual acuity.' },
  ],
  // Set 1 ── "how was the moon formed"
  [
    { title: 'Moon', sectionTitle: 'Formation', anchor: 'Formation', extract: 'The leading theory holds that the Moon formed from the debris left over after a Mars-sized body collided with the early Earth about 4.5 billion years ago.' },
    { title: 'Giant-impact hypothesis', sectionTitle: '', anchor: '', extract: 'The giant-impact hypothesis proposes that the Moon formed when a Mars-sized protoplanet, named Theia, collided with the early Earth.' },
    { title: 'Lunar geology', sectionTitle: 'Composition', anchor: 'Composition', extract: 'The Moon is composed of crustal rock and a small iron core. The surface is covered in regolith — a layer of loose, fragmented material created by meteorite impacts.' },
  ],
  // Set 2 ── "who discovered dna"
  [
    { title: 'DNA', sectionTitle: 'Double helix', anchor: 'Double_helix', extract: 'The double-helix model of DNA structure was first published in the journal Nature in April 1953 by James Watson and Francis Crick.' },
    { title: 'Rosalind Franklin', sectionTitle: '', anchor: '', extract: "Rosalind Franklin's X-ray diffraction images of DNA — particularly Photo 51 — were critical data that contributed to the discovery of the double-helix structure." },
    { title: 'Francis Crick', sectionTitle: '', anchor: '', extract: 'Francis Crick, together with James Watson, proposed the double-helix structure of DNA, for which they received the Nobel Prize in Physiology or Medicine in 1962.' },
  ],
]

function pickDiveSet(query: string): WikiSemanticResult[] {
  const key = query.toLowerCase().trim()
  const idx = QUERY_DIVE_MAP[key] ?? 0
  return QUERY_CARD_SETS[idx]
}

function openDive() {
  diveCount++
  if (diveCount >= 2 && !articleOpened && !showFeedbackToast.value) {
    feedbackToastThumb.value = null
    showFeedbackToast.value = true
  }
  diveResults.value = pickDiveSet(searchQuery.value)
  showDive.value = true
}

function closeDive() {
  showDive.value = false
  diveAbortController?.abort()
  diveAbortController = null
  if (diveSkeletonTimer) { clearTimeout(diveSkeletonTimer); diveSkeletonTimer = null }
}

onMounted(async () => {
  const stored: string[] = JSON.parse(sessionStorage.getItem('latest_recent_searches') ?? '[]')
  for (const q of [...stored].reverse()) {
    if (!recentSearches.value.includes(q)) recentSearches.value.unshift(q)
  }
  await nextTick()
  searchInput.value?.focus()
})
</script>

<template>
  <WireframeMobileWrapper>
    <div class="focused-page-wrap">
    <WireframeChromeWrapper active-tab="search" home-url="/example-search-experiment-latest/home" search-url="/example-search-experiment-latest/search" class="mobile-android-type mobile-android-type--wireframe">
      <template #header>
        <header class="focused-search-header" aria-label="Focused search header">
          <RouterLink
            to="/example-search-experiment-latest/search"
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
              @keydown.enter="onSearchEnter"
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
          <li v-if="moduleVisible" class="focused-search-dive-card-item">
            <div class="focused-search-dive-card">
              <div class="focused-search-dive-card__top-row">
                <span class="focused-search-dive-card__beta-wrap">
                  <BetaBadge as="button" @click.stop="showDiveSettings = true" />
                </span>
                <div class="focused-search-dive-card__actions">
                  <button type="button" class="focused-search-dive-card__hide" @click="hideModule">Hide</button>

                </div>
              </div>
              <div class="focused-search-dive-card__body">
                <p class="mwf-android-type-h1 focused-search-dive-card__query">{{ searchQuery.trim() }}</p>
                <p class="mwf-android-type-p focused-search-dive-card__desc">
                  {{ selectedLanguage === 'pt'
                    ? 'Pesquise dentro de artigos e receba respostas como trechos palavra por palavra.'
                    : selectedLanguage === 'es'
                      ? 'Busca dentro de los artículos y obtén tus respuestas como pasajes palavra por palavra.'
                      : 'Search within articles and get your answers as word-for-word passages.' }}
                </p>
                <button type="button" class="mwf-android-type-p focused-search-dive-card__btn" @click="openDive()">
                  {{ selectedLanguage === 'pt' ? 'Encontrar' : selectedLanguage === 'es' ? 'Encontrar' : 'Find' }}
                </button>
              </div>
              <div class="focused-search-dive-card__illus" aria-hidden="true">
                <svg width="93" height="78" viewBox="0 0 93 78" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.015625" width="92.6546" height="6.8296" rx="3.4148" fill="#54595D"/>
                <rect x="0.015625" y="11.3826" width="92.6546" height="6.8296" rx="3.4148" fill="#54595D"/>
                <rect x="0.015625" y="22.7654" width="92.6546" height="6.8296" rx="3.4148" fill="#54595D"/>
                <rect x="24.7266" y="34.1479" width="68.0574" height="6.8296" rx="3.4148" fill="#FFCC33"/>
                <rect x="24.7266" y="45.5305" width="68.0574" height="6.8296" rx="3.4148" fill="#FFCC33"/>
                <path d="M18.2889 43.4183C18.7643 43.8343 19.2397 44.3988 19.7151 45.1119C20.25 45.825 20.5174 46.657 20.5174 47.6078C20.5174 48.9151 20.1014 49.9254 19.2694 50.6385C18.4969 51.3516 17.4867 51.7081 16.2387 51.7081C15.0502 51.7081 14.04 51.1733 13.2081 50.1037C12.3761 49.034 11.871 47.7861 11.6927 46.3599C11.6927 46.241 11.663 46.1222 11.6036 46.0033C11.6036 45.825 11.6036 45.6765 11.6036 45.5576C11.6036 43.4777 12.4652 41.3681 14.1886 39.2288C15.9119 37.0301 17.9918 35.3959 20.4282 34.3262C20.5471 34.2668 20.6659 34.2371 20.7848 34.2371C20.9036 34.1777 21.0225 34.1479 21.1413 34.1479C21.5573 34.1479 21.8544 34.2965 22.0327 34.5936C22.2704 34.8313 22.3893 35.0988 22.3893 35.3959C22.3893 35.8119 22.211 36.1684 21.8544 36.4655C20.7254 37.2381 19.6557 38.2186 18.6455 39.4071C17.6947 40.5956 17.0707 41.7247 16.7736 42.7943C16.8924 42.8538 17.1598 42.9429 17.5758 43.0617C17.9918 43.1806 18.2295 43.2995 18.2889 43.4183ZM6.70098 43.4183C7.17638 43.8343 7.65178 44.3988 8.12718 45.1119C8.66201 45.825 8.92943 46.657 8.92943 47.6078C8.92943 48.9151 8.51345 49.9254 7.68149 50.6385C6.90897 51.3516 5.89873 51.7081 4.6508 51.7081C3.46229 51.7081 2.45206 51.1733 1.62011 50.1037C0.788155 49.034 0.283039 47.7861 0.104763 46.3599C0.104763 46.241 0.0750502 46.1222 0.015625 46.0033C0.015625 45.825 0.015625 45.6765 0.015625 45.5576C0.015625 43.4777 0.877292 41.3681 2.60063 39.2288C4.32396 37.0301 6.40385 35.3959 8.84029 34.3262C8.95914 34.2668 9.07799 34.2371 9.19684 34.2371C9.31569 34.1777 9.43454 34.1479 9.55339 34.1479C9.96937 34.1479 10.2665 34.2965 10.4448 34.5936C10.6825 34.8313 10.8013 35.0988 10.8013 35.3959C10.8013 35.8119 10.623 36.1684 10.2665 36.4655C9.13742 37.2381 8.06776 38.2186 7.05753 39.4071C6.10672 40.5956 5.48276 41.7247 5.18563 42.7943C5.30448 42.8538 5.57189 42.9429 5.98787 43.0617C6.40385 43.1806 6.64155 43.2995 6.70098 43.4183Z" fill="black"/>
                <path d="M50.7686 37.1776C53.9114 31.7341 60.8734 29.8693 66.3181 33.0125C71.0872 35.766 73.1107 41.4491 71.4275 46.4754L81.7657 52.4441C82.8543 53.0726 83.2272 54.465 82.5989 55.5537C81.9703 56.6424 80.578 57.0155 79.4893 56.3869L69.1511 50.4181C65.6401 54.3899 59.7064 55.4792 54.9368 52.7256C49.4924 49.582 47.626 42.6211 50.7686 37.1776ZM54.7127 39.4536C52.8269 42.7198 53.9471 46.8972 57.214 48.7833C60.4808 50.6691 64.6579 49.5502 66.5436 46.2842C68.429 43.0181 67.3095 38.8411 64.0431 36.9549C60.7763 35.0689 56.5985 36.1876 54.7127 39.4536Z" fill="#202122"/>
                <rect y="60.2036" width="92.7688" height="17.0296" rx="2.27653" fill="#ADBBC8"/>
                <path d="M4 73.2332V71.653C4 71.3332 4.0823 71.0393 4.2469 70.7712C4.4115 70.5032 4.63019 70.2986 4.90296 70.1575C5.48612 69.8659 6.07868 69.6472 6.68066 69.5014C7.28263 69.3556 7.894 69.2827 8.51479 69.2827C9.13557 69.2827 9.74695 69.3556 10.3489 69.5014C10.9509 69.6472 11.5435 69.8659 12.1266 70.1575C12.3994 70.2986 12.6181 70.5032 12.7827 70.7712C12.9473 71.0393 13.0296 71.3332 13.0296 71.653V73.2332H4ZM14.1583 73.2332V71.5401C14.1583 71.1263 14.0431 70.7289 13.8126 70.348C13.5822 69.967 13.2553 69.6402 12.8321 69.3674C13.3118 69.4238 13.7632 69.5202 14.1865 69.6566C14.6098 69.793 15.0048 69.96 15.3716 70.1575C15.7102 70.3456 15.9689 70.5549 16.1476 70.7853C16.3263 71.0158 16.4157 71.2674 16.4157 71.5401V73.2332H14.1583ZM6.9205 68.0553C6.47843 67.6132 6.25739 67.0818 6.25739 66.461C6.25739 65.8402 6.47843 65.3088 6.9205 64.8667C7.36258 64.4246 7.894 64.2036 8.51479 64.2036C9.13557 64.2036 9.667 64.4246 10.1091 64.8667C10.5511 65.3088 10.7722 65.8402 10.7722 66.461C10.7722 67.0818 10.5511 67.6132 10.1091 68.0553C9.667 68.4974 9.13557 68.7184 8.51479 68.7184C7.894 68.7184 7.36258 68.4974 6.9205 68.0553ZM13.4952 68.0553C13.0531 68.4974 12.5217 68.7184 11.9009 68.7184C11.7974 68.7184 11.6657 68.7066 11.5058 68.6831C11.3459 68.6596 11.2143 68.6337 11.1108 68.6055C11.3647 68.3045 11.5599 67.9706 11.6963 67.6038C11.8327 67.237 11.9009 66.8561 11.9009 66.461C11.9009 66.066 11.8327 65.685 11.6963 65.3182C11.5599 64.9514 11.3647 64.6175 11.1108 64.3165C11.2425 64.2695 11.3742 64.2389 11.5058 64.2248C11.6375 64.2107 11.7692 64.2036 11.9009 64.2036C12.5217 64.2036 13.0531 64.4246 13.4952 64.8667C13.9372 65.3088 14.1583 65.8402 14.1583 66.461C14.1583 67.0818 13.9372 67.6132 13.4952 68.0553Z" fill="white"/>
                <path d="M25.8827 71.093V72.2185H20.9006V71.2581L23.2566 68.732C23.4934 68.4686 23.6801 68.2368 23.8169 68.0367C23.9536 67.8333 24.052 67.6515 24.112 67.4915C24.1753 67.3281 24.207 67.173 24.207 67.0263C24.207 66.8062 24.1703 66.6178 24.097 66.461C24.0236 66.301 23.9152 66.1776 23.7718 66.0909C23.6318 66.0042 23.4584 65.9608 23.2516 65.9608C23.0315 65.9608 22.8414 66.0142 22.6814 66.1209C22.5246 66.2276 22.4046 66.376 22.3212 66.5661C22.2412 66.7562 22.2012 66.9713 22.2012 67.2114H20.7555C20.7555 66.7778 20.8589 66.381 21.0657 66.0208C21.2724 65.6574 21.5642 65.3689 21.9411 65.1555C22.3179 64.9387 22.7647 64.8303 23.2816 64.8303C23.7918 64.8303 24.222 64.9137 24.5722 65.0804C24.9257 65.2438 25.1925 65.4806 25.3725 65.7907C25.5559 66.0975 25.6476 66.4644 25.6476 66.8912C25.6476 67.1313 25.6093 67.3664 25.5326 67.5965C25.4559 67.8233 25.3458 68.05 25.2025 68.2768C25.0624 68.5002 24.8923 68.727 24.6922 68.9571C24.4921 69.1872 24.2704 69.4256 24.0269 69.6724L22.7614 71.093H25.8827ZM28.2588 67.9517H29.0291C29.2759 67.9517 29.4793 67.91 29.6394 67.8266C29.7994 67.7399 29.9178 67.6199 29.9945 67.4665C30.0745 67.3097 30.1146 67.128 30.1146 66.9212C30.1146 66.7345 30.0779 66.5694 30.0045 66.426C29.9345 66.2793 29.8261 66.1659 29.6794 66.0859C29.5326 66.0025 29.3476 65.9608 29.1241 65.9608C28.9474 65.9608 28.784 65.9958 28.6339 66.0659C28.4839 66.1359 28.3638 66.2343 28.2738 66.361C28.1837 66.4877 28.1387 66.6411 28.1387 66.8212H26.6931C26.6931 66.421 26.7998 66.0725 27.0132 65.7757C27.23 65.4789 27.5201 65.2472 27.8836 65.0804C28.2471 64.9137 28.6473 64.8303 29.0841 64.8303C29.5777 64.8303 30.0095 64.9104 30.3797 65.0704C30.7498 65.2272 31.0383 65.4589 31.2451 65.7657C31.4518 66.0725 31.5552 66.4527 31.5552 66.9062C31.5552 67.1363 31.5018 67.3598 31.3951 67.5765C31.2884 67.7899 31.135 67.9834 30.9349 68.1568C30.7382 68.3268 30.4981 68.4636 30.2146 68.5669C29.9312 68.667 29.6127 68.717 29.2592 68.717H28.2588V67.9517ZM28.2588 69.0471V68.3018H29.2592C29.656 68.3018 30.0045 68.3468 30.3046 68.4369C30.6048 68.5269 30.8566 68.657 31.06 68.827C31.2634 68.9938 31.4168 69.1922 31.5202 69.4223C31.6235 69.6491 31.6752 69.9008 31.6752 70.1776C31.6752 70.5178 31.6102 70.8212 31.4802 71.088C31.3501 71.3515 31.1667 71.5749 30.9299 71.7583C30.6965 71.9417 30.423 72.0818 30.1096 72.1785C29.7961 72.2719 29.4543 72.3185 29.0841 72.3185C28.7773 72.3185 28.4755 72.2769 28.1787 72.1935C27.8853 72.1068 27.6185 71.9784 27.3784 71.8083C27.1416 71.6349 26.9515 71.4182 26.8081 71.158C26.6681 70.8946 26.5981 70.5828 26.5981 70.2226H28.0437C28.0437 70.4094 28.0904 70.5761 28.1837 70.7229C28.2771 70.8696 28.4055 70.9846 28.5689 71.068C28.7356 71.1514 28.9207 71.1931 29.1241 71.1931C29.3542 71.1931 29.551 71.1514 29.7144 71.068C29.8811 70.9813 30.0079 70.8613 30.0946 70.7079C30.1846 70.5511 30.2296 70.3694 30.2296 70.1626C30.2296 69.8958 30.1813 69.6824 30.0846 69.5223C29.9878 69.3589 29.8495 69.2389 29.6694 69.1622C29.4893 69.0855 29.2759 69.0471 29.0291 69.0471H28.2588ZM37.7679 69.4973V70.6278H32.5206L32.4506 69.7524L35.4869 64.9354H36.6324L35.3918 67.0113L33.8812 69.4973H37.7679ZM36.9425 64.9354V72.2185H35.5019V64.9354H36.9425ZM43.4553 70.2226C43.4553 70.6795 43.3486 71.0647 43.1352 71.3781C42.9217 71.6883 42.6283 71.9234 42.2548 72.0834C41.8846 72.2402 41.4644 72.3185 40.9942 72.3185C40.524 72.3185 40.1022 72.2402 39.7287 72.0834C39.3552 71.9234 39.0601 71.6883 38.8433 71.3781C38.6266 71.0647 38.5182 70.6795 38.5182 70.2226C38.5182 69.9158 38.5799 69.6391 38.7033 69.3923C38.8266 69.1422 38.9984 68.9288 39.2185 68.752C39.4419 68.5719 39.7037 68.4352 40.0038 68.3418C40.3039 68.2451 40.6308 68.1968 40.9842 68.1968C41.4578 68.1968 41.8813 68.2801 42.2548 68.4469C42.6283 68.6136 42.9217 68.8487 43.1352 69.1522C43.3486 69.4557 43.4553 69.8125 43.4553 70.2226ZM42.0047 70.1276C42.0047 69.9042 41.9613 69.7124 41.8746 69.5524C41.7913 69.389 41.6729 69.2639 41.5195 69.1772C41.3661 69.0905 41.1877 69.0471 40.9842 69.0471C40.7808 69.0471 40.6024 69.0905 40.449 69.1772C40.2956 69.2639 40.1756 69.389 40.0889 69.5524C40.0055 69.7124 39.9638 69.9042 39.9638 70.1276C39.9638 70.3477 40.0055 70.5378 40.0889 70.6979C40.1756 70.8579 40.2956 70.9813 40.449 71.068C40.6057 71.1514 40.7875 71.1931 40.9942 71.1931C41.201 71.1931 41.3794 71.1514 41.5295 71.068C41.6829 70.9813 41.7996 70.8579 41.8796 70.6979C41.963 70.5378 42.0047 70.3477 42.0047 70.1276ZM43.3002 66.8662C43.3002 67.2364 43.2019 67.5648 43.0051 67.8516C42.8084 68.1351 42.5349 68.3568 42.1848 68.5169C41.8379 68.677 41.4411 68.757 40.9942 68.757C40.5441 68.757 40.1439 68.677 39.7937 68.5169C39.4436 68.3568 39.1701 68.1351 38.9734 67.8516C38.7766 67.5648 38.6782 67.2364 38.6782 66.8662C38.6782 66.426 38.7766 66.0559 38.9734 65.7557C39.1735 65.4523 39.4469 65.2222 39.7937 65.0654C40.1439 64.9087 40.5407 64.8303 40.9842 64.8303C41.4344 64.8303 41.8329 64.9087 42.1798 65.0654C42.5299 65.2222 42.8034 65.4523 43.0001 65.7557C43.2002 66.0559 43.3002 66.426 43.3002 66.8662ZM41.8596 66.9312C41.8596 66.7345 41.8246 66.5644 41.7546 66.421C41.6845 66.2743 41.5845 66.1609 41.4544 66.0809C41.3277 66.0008 41.171 65.9608 40.9842 65.9608C40.8042 65.9608 40.6491 65.9992 40.519 66.0759C40.3923 66.1526 40.2939 66.2643 40.2239 66.411C40.1572 66.5544 40.1239 66.7278 40.1239 66.9312C40.1239 67.128 40.1572 67.3014 40.2239 67.4515C40.2939 67.5982 40.394 67.7132 40.524 67.7966C40.6541 67.88 40.8108 67.9217 40.9942 67.9217C41.1777 67.9217 41.3327 67.88 41.4594 67.7966C41.5895 67.7132 41.6879 67.5982 41.7546 67.4515C41.8246 67.3014 41.8596 67.128 41.8596 66.9312ZM47.8734 71.7029C48.0453 71.7029 48.2042 71.6677 48.35 71.5974C48.4958 71.5271 48.6156 71.4307 48.7094 71.3083C48.8031 71.1833 48.8565 71.0414 48.8695 70.8826H49.557C49.544 71.1326 49.4594 71.3656 49.3031 71.5818C49.1495 71.7953 48.9476 71.9685 48.6976 72.1013C48.4476 72.2315 48.1729 72.2966 47.8734 72.2966C47.5557 72.2966 47.2784 72.2406 47.0414 72.1287C46.807 72.0167 46.6117 71.863 46.4555 71.6677C46.3018 71.4724 46.1859 71.2485 46.1078 70.9958C46.0323 70.7406 45.9945 70.4711 45.9945 70.1873V70.0232C45.9945 69.7393 46.0323 69.4711 46.1078 69.2185C46.1859 68.9633 46.3018 68.738 46.4555 68.5427C46.6117 68.3474 46.807 68.1938 47.0414 68.0818C47.2784 67.9698 47.5557 67.9138 47.8734 67.9138C48.2042 67.9138 48.4932 67.9815 48.7406 68.1169C48.988 68.2498 49.182 68.432 49.3226 68.6638C49.4659 68.893 49.544 69.1534 49.557 69.4451H48.8695C48.8565 69.2706 48.807 69.113 48.7211 68.9724C48.6377 68.8318 48.5232 68.7198 48.3773 68.6365C48.2341 68.5505 48.0661 68.5076 47.8734 68.5076C47.6521 68.5076 47.4659 68.5518 47.3148 68.6404C47.1664 68.7263 47.0479 68.8435 46.9594 68.9919C46.8734 69.1378 46.8109 69.3005 46.7719 69.4802C46.7354 69.6573 46.7172 69.8383 46.7172 70.0232V70.1873C46.7172 70.3722 46.7354 70.5544 46.7719 70.7341C46.8083 70.9138 46.8695 71.0766 46.9555 71.2224C47.044 71.3682 47.1625 71.4854 47.3109 71.574C47.462 71.6599 47.6495 71.7029 47.8734 71.7029ZM50.1781 70.1521V70.0623C50.1781 69.7576 50.2224 69.475 50.3109 69.2146C50.3995 68.9516 50.5271 68.7237 50.6937 68.531C50.8604 68.3357 51.0622 68.1847 51.2992 68.0779C51.5362 67.9685 51.8018 67.9138 52.0961 67.9138C52.393 67.9138 52.6599 67.9685 52.8969 68.0779C53.1364 68.1847 53.3396 68.3357 53.5062 68.531C53.6755 68.7237 53.8044 68.9516 53.893 69.2146C53.9815 69.475 54.0258 69.7576 54.0258 70.0623V70.1521C54.0258 70.4568 53.9815 70.7393 53.893 70.9998C53.8044 71.2602 53.6755 71.488 53.5062 71.6833C53.3396 71.8761 53.1377 72.0271 52.9008 72.1365C52.6664 72.2432 52.4008 72.2966 52.1039 72.2966C51.807 72.2966 51.5401 72.2432 51.3031 72.1365C51.0661 72.0271 50.863 71.8761 50.6937 71.6833C50.5271 71.488 50.3995 71.2602 50.3109 70.9998C50.2224 70.7393 50.1781 70.4568 50.1781 70.1521ZM50.9008 70.0623V70.1521C50.9008 70.363 50.9255 70.5623 50.975 70.7498C51.0245 70.9347 51.0987 71.0987 51.1976 71.2419C51.2992 71.3852 51.4255 71.4985 51.5765 71.5818C51.7276 71.6625 51.9034 71.7029 52.1039 71.7029C52.3018 71.7029 52.475 71.6625 52.6234 71.5818C52.7745 71.4985 52.8995 71.3852 52.9984 71.2419C53.0974 71.0987 53.1716 70.9347 53.2211 70.7498C53.2732 70.5623 53.2992 70.363 53.2992 70.1521V70.0623C53.2992 69.8539 53.2732 69.6573 53.2211 69.4724C53.1716 69.2849 53.0961 69.1195 52.9945 68.9763C52.8956 68.8305 52.7706 68.7159 52.6195 68.6326C52.4711 68.5492 52.2966 68.5076 52.0961 68.5076C51.8982 68.5076 51.7237 68.5492 51.5726 68.6326C51.4242 68.7159 51.2992 68.8305 51.1976 68.9763C51.0987 69.1195 51.0245 69.2849 50.975 69.4724C50.9255 69.6573 50.9008 69.8539 50.9008 70.0623ZM55.6547 68.8943V72.2185H54.932V67.9919H55.6156L55.6547 68.8943ZM55.4828 69.9451L55.182 69.9333C55.1846 69.6443 55.2276 69.3774 55.3109 69.1326C55.3943 68.8852 55.5114 68.6703 55.6625 68.488C55.8135 68.3057 55.9932 68.1651 56.2015 68.0662C56.4125 67.9646 56.6456 67.9138 56.9008 67.9138C57.1091 67.9138 57.2966 67.9425 57.4633 67.9998C57.6299 68.0544 57.7719 68.143 57.889 68.2654C58.0088 68.3878 58.1 68.5466 58.1625 68.7419C58.225 68.9347 58.2562 69.1703 58.2562 69.449V72.2185H57.5297V69.4412C57.5297 69.2198 57.4971 69.0427 57.432 68.9099C57.3669 68.7745 57.2719 68.6768 57.1469 68.6169C57.0219 68.5544 56.8682 68.5232 56.6859 68.5232C56.5062 68.5232 56.3422 68.561 56.1937 68.6365C56.0479 68.712 55.9216 68.8162 55.8148 68.949C55.7107 69.0818 55.6286 69.2341 55.5687 69.406C55.5114 69.5753 55.4828 69.755 55.4828 69.9451ZM61.1234 67.9919V68.5466H58.8383V67.9919H61.1234ZM59.6117 66.9646H60.3344V71.1716C60.3344 71.3149 60.3565 71.4229 60.4008 71.4958C60.445 71.5688 60.5023 71.6169 60.5726 71.6404C60.643 71.6638 60.7185 71.6755 60.7992 71.6755C60.8591 71.6755 60.9216 71.6703 60.9867 71.6599C61.0544 71.6469 61.1052 71.6365 61.139 71.6287L61.143 72.2185C61.0857 72.2367 61.0101 72.2537 60.9164 72.2693C60.8252 72.2875 60.7146 72.2966 60.5844 72.2966C60.4073 72.2966 60.2445 72.2615 60.0961 72.1912C59.9476 72.1208 59.8292 72.0037 59.7406 71.8396C59.6547 71.6729 59.6117 71.449 59.6117 71.1677V66.9646ZM62.6937 68.656V72.2185H61.9711V67.9919H62.6742L62.6937 68.656ZM64.014 67.9685L64.0101 68.6404C63.9502 68.6274 63.893 68.6195 63.8383 68.6169C63.7862 68.6117 63.7263 68.6091 63.6586 68.6091C63.4919 68.6091 63.3448 68.6352 63.2172 68.6873C63.0896 68.7393 62.9815 68.8123 62.893 68.906C62.8044 68.9998 62.7341 69.1117 62.682 69.2419C62.6325 69.3695 62.6 69.5102 62.5844 69.6638L62.3812 69.781C62.3812 69.5258 62.406 69.2862 62.4555 69.0623C62.5075 68.8383 62.587 68.6404 62.6937 68.4685C62.8005 68.294 62.9359 68.1586 63.1 68.0623C63.2667 67.9633 63.4646 67.9138 63.6937 67.9138C63.7458 67.9138 63.8057 67.9203 63.8734 67.9333C63.9411 67.9438 63.988 67.9555 64.014 67.9685ZM65.4672 67.9919V72.2185H64.7406V67.9919H65.4672ZM64.6859 66.8708C64.6859 66.7537 64.7211 66.6547 64.7914 66.574C64.8643 66.4932 64.9711 66.4529 65.1117 66.4529C65.2497 66.4529 65.3552 66.4932 65.4281 66.574C65.5036 66.6547 65.5414 66.7537 65.5414 66.8708C65.5414 66.9828 65.5036 67.0792 65.4281 67.1599C65.3552 67.238 65.2497 67.2771 65.1117 67.2771C64.9711 67.2771 64.8643 67.238 64.7914 67.1599C64.7211 67.0792 64.6859 66.9828 64.6859 66.8708ZM66.6234 66.2185H67.35V71.3982L67.2875 72.2185H66.6234V66.2185ZM70.2055 70.0701V70.1521C70.2055 70.4594 70.169 70.7445 70.0961 71.0076C70.0232 71.268 69.9164 71.4945 69.7758 71.6873C69.6351 71.88 69.4633 72.0297 69.2601 72.1365C69.057 72.2432 68.8239 72.2966 68.5609 72.2966C68.2927 72.2966 68.057 72.2511 67.8539 72.1599C67.6534 72.0662 67.4841 71.932 67.3461 71.7576C67.2081 71.5831 67.0974 71.3722 67.014 71.1248C66.9333 70.8774 66.8773 70.5987 66.8461 70.2888V69.9294C66.8773 69.6169 66.9333 69.337 67.014 69.0896C67.0974 68.8422 67.2081 68.6313 67.3461 68.4568C67.4841 68.2797 67.6534 68.1456 67.8539 68.0544C68.0544 67.9607 68.2875 67.9138 68.5531 67.9138C68.8187 67.9138 69.0544 67.9659 69.2601 68.0701C69.4659 68.1716 69.6377 68.3175 69.7758 68.5076C69.9164 68.6977 70.0232 68.9255 70.0961 69.1912C70.169 69.4542 70.2055 69.7472 70.2055 70.0701ZM69.4789 70.1521V70.0701C69.4789 69.8591 69.4594 69.6612 69.4203 69.4763C69.3812 69.2888 69.3187 69.1248 69.2328 68.9841C69.1469 68.8409 69.0336 68.7289 68.893 68.6482C68.7523 68.5649 68.5792 68.5232 68.3734 68.5232C68.1911 68.5232 68.0323 68.5544 67.8969 68.6169C67.764 68.6794 67.6508 68.7641 67.557 68.8708C67.4633 68.975 67.3864 69.0948 67.3265 69.2302C67.2693 69.363 67.2263 69.5011 67.1976 69.6443V70.5857C67.2393 70.768 67.307 70.9438 67.4008 71.113C67.4971 71.2797 67.6247 71.4164 67.7836 71.5232C67.945 71.63 68.1443 71.6833 68.3812 71.6833C68.5765 71.6833 68.7432 71.6443 68.8812 71.5662C69.0219 71.4854 69.1351 71.3748 69.2211 71.2341C69.3096 71.0935 69.3747 70.9307 69.4164 70.7458C69.4581 70.561 69.4789 70.363 69.4789 70.1521ZM73.7055 71.2419V67.9919H74.432V72.2185H73.7406L73.7055 71.2419ZM73.8422 70.3513L74.143 70.3435C74.143 70.6248 74.113 70.8852 74.0531 71.1248C73.9958 71.3617 73.9021 71.5675 73.7719 71.7419C73.6417 71.9164 73.4711 72.0531 73.2601 72.1521C73.0492 72.2485 72.7927 72.2966 72.4906 72.2966C72.2849 72.2966 72.0961 72.2667 71.9242 72.2068C71.7549 72.1469 71.6091 72.0544 71.4867 71.9294C71.3643 71.8044 71.2693 71.6417 71.2015 71.4412C71.1364 71.2406 71.1039 70.9998 71.1039 70.7185V67.9919H71.8265V70.7263C71.8265 70.9164 71.8474 71.074 71.889 71.199C71.9333 71.3214 71.9919 71.419 72.0648 71.4919C72.1404 71.5623 72.2237 71.6117 72.3148 71.6404C72.4086 71.669 72.5049 71.6833 72.6039 71.6833C72.9112 71.6833 73.1547 71.6248 73.3344 71.5076C73.514 71.3878 73.643 71.2276 73.7211 71.0271C73.8018 70.824 73.8422 70.5987 73.8422 70.3513ZM77.3031 67.9919V68.5466H75.018V67.9919H77.3031ZM75.7914 66.9646H76.514V71.1716C76.514 71.3149 76.5362 71.4229 76.5805 71.4958C76.6247 71.5688 76.682 71.6169 76.7523 71.6404C76.8226 71.6638 76.8982 71.6755 76.9789 71.6755C77.0388 71.6755 77.1013 71.6703 77.1664 71.6599C77.2341 71.6469 77.2849 71.6365 77.3187 71.6287L77.3226 72.2185C77.2654 72.2367 77.1898 72.2537 77.0961 72.2693C77.0049 72.2875 76.8943 72.2966 76.764 72.2966C76.587 72.2966 76.4242 72.2615 76.2758 72.1912C76.1273 72.1208 76.0088 72.0037 75.9203 71.8396C75.8344 71.6729 75.7914 71.449 75.7914 71.1677V66.9646ZM77.8812 70.1521V70.0623C77.8812 69.7576 77.9255 69.475 78.014 69.2146C78.1026 68.9516 78.2302 68.7237 78.3969 68.531C78.5635 68.3357 78.7654 68.1847 79.0023 68.0779C79.2393 67.9685 79.5049 67.9138 79.7992 67.9138C80.0961 67.9138 80.363 67.9685 80.6 68.0779C80.8396 68.1847 81.0427 68.3357 81.2094 68.531C81.3786 68.7237 81.5075 68.9516 81.5961 69.2146C81.6846 69.475 81.7289 69.7576 81.7289 70.0623V70.1521C81.7289 70.4568 81.6846 70.7393 81.5961 70.9998C81.5075 71.2602 81.3786 71.488 81.2094 71.6833C81.0427 71.8761 80.8409 72.0271 80.6039 72.1365C80.3695 72.2432 80.1039 72.2966 79.807 72.2966C79.5101 72.2966 79.2432 72.2432 79.0062 72.1365C78.7693 72.0271 78.5661 71.8761 78.3969 71.6833C78.2302 71.488 78.1026 71.2602 78.014 70.9998C77.9255 70.7393 77.8812 70.4568 77.8812 70.1521ZM78.6039 70.0623V70.1521C78.6039 70.363 78.6286 70.5623 78.6781 70.7498C78.7276 70.9347 78.8018 71.0987 78.9008 71.2419C79.0023 71.3852 79.1286 71.4985 79.2797 71.5818C79.4307 71.6625 79.6065 71.7029 79.807 71.7029C80.0049 71.7029 80.1781 71.6625 80.3265 71.5818C80.4776 71.4985 80.6026 71.3852 80.7015 71.2419C80.8005 71.0987 80.8747 70.9347 80.9242 70.7498C80.9763 70.5623 81.0023 70.363 81.0023 70.1521V70.0623C81.0023 69.8539 80.9763 69.6573 80.9242 69.4724C80.8747 69.2849 80.7992 69.1195 80.6976 68.9763C80.5987 68.8305 80.4737 68.7159 80.3226 68.6326C80.1742 68.5492 79.9997 68.5076 79.7992 68.5076C79.6013 68.5076 79.4268 68.5492 79.2758 68.6326C79.1273 68.7159 79.0023 68.8305 78.9008 68.9763C78.8018 69.1195 78.7276 69.2849 78.6781 69.4724C78.6286 69.6573 78.6039 69.8539 78.6039 70.0623ZM83.3578 68.656V72.2185H82.6351V67.9919H83.3383L83.3578 68.656ZM84.6781 67.9685L84.6742 68.6404C84.6143 68.6274 84.557 68.6195 84.5023 68.6169C84.4502 68.6117 84.3904 68.6091 84.3226 68.6091C84.156 68.6091 84.0088 68.6352 83.8812 68.6873C83.7536 68.7393 83.6456 68.8123 83.557 68.906C83.4685 68.9998 83.3982 69.1117 83.3461 69.2419C83.2966 69.3695 83.264 69.5102 83.2484 69.6638L83.0453 69.781C83.0453 69.5258 83.07 69.2862 83.1195 69.0623C83.1716 68.8383 83.251 68.6404 83.3578 68.4685C83.4646 68.294 83.6 68.1586 83.764 68.0623C83.9307 67.9633 84.1286 67.9138 84.3578 67.9138C84.4099 67.9138 84.4698 67.9203 84.5375 67.9333C84.6052 67.9438 84.6521 67.9555 84.6781 67.9685ZM87.807 71.0974C87.807 70.9932 87.7836 70.8969 87.7367 70.8083C87.6924 70.7172 87.6 70.6352 87.4594 70.5623C87.3213 70.4867 87.113 70.4216 86.8344 70.3669C86.6 70.3175 86.3877 70.2589 86.1976 70.1912C86.0101 70.1235 85.85 70.0414 85.7172 69.9451C85.587 69.8487 85.4867 69.7354 85.4164 69.6052C85.3461 69.475 85.3109 69.3227 85.3109 69.1482C85.3109 68.9815 85.3474 68.824 85.4203 68.6755C85.4958 68.5271 85.6013 68.3956 85.7367 68.281C85.8747 68.1664 86.0401 68.0766 86.2328 68.0115C86.4255 67.9464 86.6403 67.9138 86.8773 67.9138C87.2159 67.9138 87.5049 67.9737 87.7445 68.0935C87.9841 68.2133 88.1677 68.3735 88.2953 68.574C88.4229 68.7719 88.4867 68.9919 88.4867 69.2341H87.764C87.764 69.1169 87.7289 69.0037 87.6586 68.8943C87.5909 68.7823 87.4906 68.6899 87.3578 68.6169C87.2276 68.544 87.0674 68.5076 86.8773 68.5076C86.6768 68.5076 86.514 68.5388 86.389 68.6013C86.2666 68.6612 86.1768 68.738 86.1195 68.8318C86.0648 68.9255 86.0375 69.0245 86.0375 69.1287C86.0375 69.2068 86.0505 69.2771 86.0765 69.3396C86.1052 69.3995 86.1547 69.4555 86.225 69.5076C86.2953 69.557 86.3943 69.6039 86.5219 69.6482C86.6495 69.6925 86.8122 69.7367 87.0101 69.781C87.3565 69.8591 87.6416 69.9529 87.8656 70.0623C88.0896 70.1716 88.2562 70.3057 88.3656 70.4646C88.475 70.6235 88.5297 70.8162 88.5297 71.0427C88.5297 71.2276 88.4906 71.3969 88.4125 71.5505C88.337 71.7042 88.2263 71.837 88.0805 71.949C87.9372 72.0583 87.7653 72.1443 87.5648 72.2068C87.3669 72.2667 87.1443 72.2966 86.8969 72.2966C86.5245 72.2966 86.2094 72.2302 85.9515 72.0974C85.6937 71.9646 85.4984 71.7927 85.3656 71.5818C85.2328 71.3708 85.1664 71.1482 85.1664 70.9138H85.893C85.9034 71.1117 85.9607 71.2693 86.0648 71.3865C86.169 71.5011 86.2966 71.5831 86.4476 71.6326C86.5987 71.6794 86.7484 71.7029 86.8969 71.7029C87.0948 71.7029 87.2601 71.6768 87.393 71.6248C87.5284 71.5727 87.6312 71.5011 87.7015 71.4099C87.7719 71.3188 87.807 71.2146 87.807 71.0974Z" fill="white"/>
                </svg>
              </div>
            </div>
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

    <Transition name="dive-sheet">
      <div v-if="showDive" class="dive-overlay">
        <div class="dive-overlay__scrim" aria-hidden="true" @click="closeDive()" />
        <div class="dive-sheet" role="dialog" aria-modal="true" aria-label="Dive results">
          <div class="dive-sheet__handle" aria-hidden="true" />
          <div class="dive-sheet__scroll">
            <div class="dive-sheet__content mobile-android-type mobile-android-type--wireframe">
              <header class="dive-sheet__header">
                <h2 class="mwf-android-type-h1 dive-sheet__title">Find</h2>
                <span class="dive-sheet__beta-wrap">
                  <BetaBadge as="button" :caret="false" @click.stop="(e) => toggleBetaMenu('sheet', e)" />
                  <div v-if="betaMenuOpen === 'sheet'" class="beta-menu" role="menu">
                    <button type="button" class="beta-menu__item" role="menuitem" @click="closeBetaMenu">Learn more</button>
                    <button type="button" class="beta-menu__item beta-menu__item--danger" role="menuitem" @click="closeBetaMenu">Turn off this experiment</button>
                  </div>
                  <div v-if="betaMenuOpen === 'sheet'" class="beta-menu__backdrop" @click="closeBetaMenu" />
                </span>
              </header>

              <p class="mwf-android-type-p dive-sheet__query">{{ searchQuery.trim() || 'can cats' }}</p>

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
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 22V11M2 13v7a2 2 0 002 2h11.17a2 2 0 001.96-1.6l1.54-7a2 2 0 00-1.96-2.4H14V5a3 3 0 00-3-3 1 1 0 00-1 1v.5L7.5 9.5A1 1 0 007 10.4V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <button
                      type="button"
                      class="feedback-inline__thumb"
                      :class="{ 'feedback-inline__thumb--active': feedbackToastThumb === 'down' }"
                      aria-label="No"
                      @click="selectThumb('down')"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M17 2v11m5-2V4a2 2 0 00-2-2H8.83a2 2 0 00-1.96 1.6l-1.54 7A2 2 0 007.29 13H10v4a3 3 0 003 3 1 1 0 001-1v-.5l2.5-4A1 1 0 0017 13.6V2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
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

              <p v-if="diveError" class="mwf-android-type-p dive-sheet__status">{{ diveError }}</p>

              <ul v-if="isDiveSkeletonVisible" class="dive-sheet__results" aria-hidden="true">
                <li v-for="n in 3" :key="n">
                  <article class="dive-semantic-card dive-skeleton-card">
                    <div class="dive-skeleton dive-skeleton--trail" />
                    <div class="dive-semantic-card__snippet">
                      <div class="dive-skeleton dive-skeleton--line dive-skeleton--line-full" />
                      <div class="dive-skeleton dive-skeleton--line dive-skeleton--line-wide" />
                      <div class="dive-skeleton dive-skeleton--line dive-skeleton--line-medium" />
                    </div>
                    <div class="dive-semantic-card__bottom">
                      <div class="dive-skeleton dive-skeleton--line" style="width: 130px;" />
                    </div>
                  </article>
                </li>
              </ul>

              <ul v-else class="dive-sheet__results">
                <li v-if="!diveResults.length && !diveError">
                  <p class="mwf-android-type-p dive-sheet__status">No results found.</p>
                </li>
                <li v-for="result in diveResults" :key="result.title">
                  <article class="dive-semantic-card" role="button" tabindex="0" @click="openArticle(result)">
                    <div class="dive-semantic-card__header">
                      <span class="dive-semantic-card__thumb" aria-hidden="true" />
                      <p class="mwf-android-type-small dive-semantic-card__trail">
                        {{ result.title }}{{ result.sectionTitle ? ` > ${result.sectionTitle}` : '' }}
                      </p>
                    </div>
                    <div class="dive-semantic-card__snippet">
                      <span class="mwf-android-type-p dive-semantic-card__highlight">
                        <span class="dive-semantic-card__quote" aria-hidden="true">&#x201C;</span>{{ result.extract ?? result.title }}
                      </span>
                    </div>
                    <div class="dive-semantic-card__bottom">
                      <span class="mwf-android-type-small dive-semantic-card__meta-item">
                        {{ dummyMeta(result.title).contributors }} contributors
                      </span>
                      <span class="dive-semantic-card__meta-dot" aria-hidden="true">·</span>
                      <span class="mwf-android-type-small dive-semantic-card__meta-item">
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
    </Transition>
    </div>

    <Transition name="thanks-toast">
      <div v-if="showThanksToast" class="thanks-toast" role="status" aria-live="polite">Thanks for your feedback.</div>
    </Transition>

    <Transition name="thanks-toast">
      <div v-if="showHideToast" class="thanks-toast hide-toast" role="status" aria-live="polite">Module hidden. You can make it visible again via Settings.</div>
    </Transition>

    <Transition name="dive-settings-sheet">
      <div v-if="showDiveSettings" class="dive-settings-overlay" @click.self="showDiveSettings = false">
        <div class="dive-settings-sheet" role="dialog" aria-modal="true" aria-label="Dive settings">
          <div class="dive-settings-sheet__handle" aria-hidden="true" />
    

          

          <h3 class="dive-settings-sheet__section-title">What is this feature?</h3>
          <p class="dive-settings-sheet__body">With find you can find answers to your questions inside Wikipedia articles. we will retrieve the exact Wikipedia passage and you can go straight to it in article to get more context.</p>
          <button type="button" class="dive-settings-sheet__learn-more" @click="showDiveSettings = false">Learn more</button>
        </div>
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
  display: flex;
  align-items: center;
  width: 100%;
  min-height: var(--mobile-android-size-list-item-height);
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

.focused-search-content__dive-badge { display: inline-flex; align-items: center; width: fit-content; gap: var(--mobile-android-space-sm); padding: 3px 12px; border-radius: 10px; background: #8a8f95; color: #fff; }
.focused-search-content__dive-badge svg { display: block; width: 12px; height: 12px; }

.focused-search-dive-card-item {
  margin: 0;
  padding: 4px 0 8px;
}

.focused-search-dive-card {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: 16px;
  row-gap: 8px;
  padding: 16px;
  background: #fff;
  border-top: 1px solid #c8ccd1;
  border-bottom: 1px solid #c8ccd1;
}

.focused-search-dive-card__top-row {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.focused-search-dive-card__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--mobile-android-space-sm);
  min-width: 0;
}

.focused-search-dive-card__actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.focused-search-dive-card__hide {
  background: none;
  border: 0;
  padding: 0;
  font-family: var(--mobile-android-type-p-font-family);
  font-size: 13px;
  font-weight: 500;
  color: #3366cc;
  cursor: pointer;
  line-height: 1.4;
}

.focused-search-dive-card__info {
  background: none;
  border: 0;
  padding: 4px;
  cursor: pointer;
  color: #72777d;
  display: flex;
  align-items: center;
  justify-content: center;
}

.focused-search-dive-card__beta-wrap {
  position: relative;
}

.focused-search-dive-card__query {
  margin: 0;
  color: #202122;
}

.focused-search-dive-card__desc {
  margin: 0;
  color: #202122;
}

.focused-search-dive-card__btn {
  padding: 8px 20px;
  border: 0;
  border-radius: 8px;
  background: #72777d;
  color: #fff;
  cursor: pointer;
}

.focused-search-dive-card__illus {
  width: 93px;
  height: 78px;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
}

.focused-search-dive-card__illus svg {
  display: block;
  width: 93px;
  height: 78px;
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

/* ── Dive sheet overlay ─────────────────────────────────────── */

.focused-page-wrap {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.dive-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  z-index: 100;
}

.dive-overlay__scrim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.32);
  cursor: pointer;
}

.dive-sheet {
  position: relative;
  z-index: 1;
  width: min(100%, 560px);
  margin-inline: auto;
  background: #fffbfe;
  border-radius: 28px 28px 0 0;
  max-height: 78vh;
  display: flex;
  flex-direction: column;
}

.dive-sheet-enter-active {
  animation: dive-sheet-up 0.28s cubic-bezier(0.05, 0.7, 0.1, 1.0);
}

.dive-sheet-leave-active {
  animation: dive-sheet-up 0.2s cubic-bezier(0.3, 0, 0.8, 0.15) reverse;
}

@keyframes dive-sheet-up {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

.dive-sheet__handle {
  flex-shrink: 0;
  width: 32px;
  height: 4px;
  border-radius: 2px;
  background: #79747e;
  margin: 22px auto 0;
}

.dive-sheet__scroll {
  flex: 1 1 auto;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.dive-sheet__content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 16px 32px;
}

.dive-sheet__header {
  display: flex;
  align-items: center;
  gap: var(--mobile-android-space-sm);
}

.dive-sheet__title {
  margin: 0;
}

.dive-sheet__beta-wrap {
  position: relative;
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

.dive-sheet__query {
  margin: 0;
  color: #202122;
}

.dive-sheet__status {
  margin: 0;
  color: #54595d;
}

.dive-sheet__results {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.dive-semantic-card {
  display: grid;
  gap: 10px;
  padding: 14px 12px 0;
  border-radius: 16px;
  border: 1px solid #c8ccd1;
  background: #f8f9fa;
  overflow: hidden;
  cursor: pointer;
}

.dive-semantic-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dive-semantic-card__thumb {
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

.dive-semantic-card__trail {
  margin: 0;
  color: #72777d;
}

.dive-semantic-card__snippet {
  display: grid;
  gap: 2px;
}

.dive-semantic-card__highlight {
  display: block;
  margin: 0;
  padding: 0 4px;
  background: #ece7a5;
  color: #202122;
}

.dive-semantic-card__quote {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
  color: #202122;
  user-select: none;
}

.dive-semantic-card__faded {
  display: block;
  margin: 0;
  color: #a2a9b1;
}

.dive-semantic-card__bottom {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  margin: 0 -12px;
  border-top: 1px solid #eaecf0;
}

.dive-semantic-card__meta-item { color: #72777d; }
.dive-semantic-card__meta-dot  { color: #c8ccd1; }

@keyframes dive-skeleton-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}

.dive-skeleton {
  border-radius: 6px;
  background: linear-gradient(90deg, #eaecf0 25%, #f8f9fa 50%, #eaecf0 75%);
  background-size: 200% 100%;
  animation: dive-skeleton-shimmer 1.4s ease-in-out infinite;
}

.dive-skeleton--trail        { height: 14px; width: 55%; }
.dive-skeleton--line         { height: 14px; margin-block: 3px; }
.dive-skeleton--line-full    { width: 100%; }
.dive-skeleton--line-wide    { width: 80%; }
.dive-skeleton--line-medium  { width: 60%; }

.dive-skeleton-card { pointer-events: none; }

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

.feedback-inline__label { line-height: 1.4; color: #202122; flex: 1; }
.feedback-inline__thumbs { display: flex; gap: 10px; flex-shrink: 0; }
.feedback-inline__thumb { width: 42px; height: 42px; border-radius: 50%; border: 2px solid #a2a9b1; background: #dcdfe3; color: #72777d; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.feedback-inline__thumb--active { border-color: #3366cc; color: #3366cc; background: #eaf0fb; }

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
  font-family: inherit;
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
  font-family: inherit;
  padding: 0 20px;
  cursor: pointer;
}
.thanks-toast { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); padding: 14px 20px; border-radius: 8px; background: #202122; color: #fff; font-size: 14px; z-index: 400; pointer-events: none; white-space: nowrap; }
.hide-toast { white-space: normal; width: max-content; max-width: calc(100vw - 48px); text-align: center; }
.thanks-toast-enter-active { animation: thanks-in 0.2s ease-out; }
.thanks-toast-leave-active { animation: thanks-in 0.15s ease-in reverse; }
@keyframes thanks-in {
  from { opacity: 0; transform: translateX(-50%) translateY(6px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* Dive settings bottom sheet */
.dive-settings-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  z-index: 300;
  background: rgba(0, 0, 0, 0.32);
}

.dive-settings-sheet {
  width: min(100%, 560px);
  background: #fff;
  border-radius: 24px 24px 0 0;
  padding: 12px 24px 40px;
  box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: 'Klee One', var(--font-family-base, sans-serif);
}

.dive-settings-sheet__handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: #c8ccd1;
  margin: 0 auto 8px;
}

.dive-settings-sheet__title {
  margin: 0;
  font-family: inherit;
  font-size: 24px;
  font-weight: 400;
  color: #202122;
}

.dive-settings-sheet__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.dive-settings-sheet__row-label {
  font-size: 18px;
  color: #202122;
}

.dive-settings-toggle {
  position: relative;
  flex-shrink: 0;
  width: 52px;
  height: 30px;
  border-radius: 999px;
  border: 0;
  background: #c8ccd1;
  cursor: pointer;
  transition: background 0.2s;
  padding: 0;
}

.dive-settings-toggle--on {
  background: #72777d;
}

.dive-settings-toggle__thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.22);
  transition: transform 0.2s;
}

.dive-settings-toggle--on .dive-settings-toggle__thumb {
  transform: translateX(22px);
}

.dive-settings-sheet__helper {
  margin: 0;
  font-size: 13px;
  color: #54595d;
  line-height: 1.4;
}

.dive-settings-sheet__section-title {
  margin: 8px 0 0;
  font-family: inherit;
  font-size: 18px;
  font-weight: 500;
  color: #202122;
}

.dive-settings-sheet__body {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: #202122;
}

.dive-settings-sheet__learn-more {
  align-self: flex-start;
  background: none;
  border: 0;
  padding: 0;
  font-size: 15px;
  color: #202122;
  text-decoration: underline;
  cursor: pointer;
}

.dive-settings-sheet-enter-active {
  animation: dive-sheet-up 0.28s cubic-bezier(0.05, 0.7, 0.1, 1.0);
}
.dive-settings-sheet-leave-active {
  animation: dive-sheet-up 0.2s cubic-bezier(0.3, 0, 0.8, 0.15) reverse;
}
@keyframes dive-sheet-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
</style>
