<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { cdxIconSearch } from '@wikimedia/codex-icons'

import WireframeMobileWrapper from '@/components/WireframeMobileWrapper.vue'
import WireframeChromeWrapper from '@/components/chrome/WireframeChromeWrapper.vue'
import AppIcon from '@/components/AppIcon.vue'
import BetaBadge from '@/components/BetaBadge.vue'
import SemanticResultCard from '@/components/SemanticResultCard.vue'
import { MATERIAL_ICON_PATHS } from '@/lib/materialIconPaths'
import '@/styles/mobile-android/index.css'

definePage({
  meta: {
    title: 'Dive – Dedicated field',
    description: 'Dive straight to a passage in an article.',
  },
})

const router = useRouter()

const searchQuery = ref('')

const showBetaMenu = ref(false)
const betaButtonRef = ref<HTMLElement | null>(null)
const menuStyle = computed(() => {
  if (!betaButtonRef.value) return {}
  const r = betaButtonRef.value.getBoundingClientRect()

  const margin = 8
  const estimatedMenuWidth = 240
  const estimatedMenuHeight = 170

  const maxLeft = Math.max(margin, window.innerWidth - estimatedMenuWidth - margin)
  const left = Math.min(Math.max(r.left, margin), maxLeft)

  let top = r.bottom + 4
  if (top + estimatedMenuHeight > window.innerHeight - margin) {
    top = Math.max(margin, r.top - estimatedMenuHeight - 4)
  }

  return { top: `${top}px`, left: `${left}px` }
})

function toggleBetaMenu(e: Event) {
  e.stopPropagation()
  showBetaMenu.value = !showBetaMenu.value
}

function closeBetaMenu() {
  showBetaMenu.value = false
}

const sampleQueries = [
  'When was Pluto unlisted as a planet?',
  'RNA vs DNA',
]

const sampleQuery = computed(() => sampleQueries[activeCard.value] ?? sampleQueries[0])

const carouselRef = ref<HTMLElement | null>(null)
const activeCard = ref(0)

function onCarouselScroll() {
  const el = carouselRef.value
  if (!el) return
  const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 12 : el.scrollWidth / 2
  activeCard.value = Math.round(el.scrollLeft / cardWidth)
}

const result = {
  highlight: 'Originally considered a planet, its status was changed when astronomers adopted a new definition',
  faded: 'of the word with new criteria',
  article: 'Pluto',
  contributors: 859,
  references: 25,
}
</script>

<template>
  <WireframeMobileWrapper>
    <WireframeChromeWrapper active-tab="search" home-url="/example-search-experiment-v3-jump/community" search-url="/example-search-experiment-v3-jump/search" class="mobile-android-type mobile-android-type--wireframe">
    <div class="dive-page">

      <header class="dive-page__header">
        <div class="dive-page__top-row">
          <BetaBadge />
          <span class="dive-page__gear-wrap">
            <button ref="betaButtonRef" type="button" class="dive-page__gear" aria-label="Settings" @click.stop="toggleBetaMenu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div v-if="showBetaMenu" class="beta-menu" :style="menuStyle" role="menu">
              <button type="button" class="beta-menu__item" role="menuitem" @click="closeBetaMenu">Learn more</button>
              <button type="button" class="beta-menu__item" role="menuitem" @click="closeBetaMenu">Hide feature</button>
              <p class="beta-menu__helper">You can make it visible again via Settings</p>
            </div>
            <div v-if="showBetaMenu" class="beta-menu__backdrop" @click.stop="closeBetaMenu" />
          </span>
        </div>
        <div class="dive-page__title-row">
          <button class="dive-page__back" type="button" aria-label="Go back" @click="router.push('/example-search-experiment-v3-jump/search')">
            <span class="dive-page__back-arrow" aria-hidden="true" />
          </button>
          <h1 class="dive-page__title">Find</h1>
        </div>
      </header>

      <p class="mwf-android-type-p dive-page__description">
        Type what you're looking for and go straight to the part of an article that answers it.
      </p>

      <label class="dive-page__search-field" aria-label="Search Wikipedia">
        <AppIcon
          :codex-icon="cdxIconSearch"
          :material-icon="MATERIAL_ICON_PATHS.search"
          class="dive-page__search-icon"
        />
        <input
          v-model="searchQuery"
          class="mwf-android-type-p dive-page__search-input"
          type="search"
          placeholder="Search Wikipedia"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
        />
        <span class="dive-page__mic" aria-hidden="true" />
      </label>

      <button class="mwf-android-type-p dive-page__dive-btn" type="button" @click="router.push({ path: '/example-search-experiment-v3-jump/search/semantic-results', query: { q: searchQuery } })">🧭 Find</button>

      <section class="dive-page__results">
        <p class="mwf-android-type-p dive-page__sample-query">{{ sampleQuery }}</p>

        <div ref="carouselRef" class="dive-page__carousel" @scroll.passive="onCarouselScroll">
          <SemanticResultCard
            :trail="result.article"
            :highlight="result.highlight"
            :faded="result.faded"
            :contributors="result.contributors"
            :references="result.references"
            class="dive-page__card"
          />
          <SemanticResultCard
            trail="RNA > Differences between DNA and RNA"
            highlight="The chemical structure of RNA is very similar to that of DNA, but differs in three primary ways:"
            :contributors="312"
            :references="28"
            class="dive-page__card"
          />
        </div>

        <div class="dive-page__dots" aria-hidden="true">
          <span class="dive-page__dot" :class="{ 'dive-page__dot--active': activeCard === 0 }" />
          <span class="dive-page__dot" :class="{ 'dive-page__dot--active': activeCard === 1 }" />
        </div>
      </section>

    </div>
    </WireframeChromeWrapper>
  </WireframeMobileWrapper>
</template>

<style scoped>
.dive-page {
  --proto-card-highlight-bg: #ece7a5;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px 24px 32px;
  min-height: 100%;
  background: #fff;
}

/* Header */
.dive-page__header {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dive-page__top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dive-page__title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dive-page__gear-wrap {
  position: relative;
  flex-shrink: 0;
}

.dive-page__gear {
  background: none;
  border: 0;
  padding: 4px;
  cursor: pointer;
  color: #72777d;
  display: flex;
  align-items: center;
  justify-content: center;
}

.beta-menu {
  position: fixed;
  z-index: 200;
  min-width: 220px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.12);
  overflow: hidden;
  font-family: 'Klee One', var(--font-family-base, sans-serif);
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
  padding-bottom: 4px;
}

.beta-menu__helper {
  margin: 0;
  padding: 0 16px 10px;
  font-size: 12px;
  color: #72777d;
}

.beta-menu__backdrop {
  position: fixed;
  inset: 0;
  z-index: 199;
}

.dive-page__back {
  flex-shrink: 0;
  margin-top: 6px;
  width: var(--mobile-android-size-icon);
  height: var(--mobile-android-size-icon);
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.dive-page__back-arrow {
  display: block;
  width: 10px;
  height: 10px;
  border-inline-start: 2px solid #202122;
  border-block-end: 2px solid #202122;
  transform: rotate(45deg) translateX(2px);
}

.dive-page__title {
  margin: 0;
  font-family: var(--mobile-android-type-h1-app-bar-font-family, Georgia, serif);
  font-size: 28px;
  font-weight: 400;
  line-height: 1.25;
  color: #202122;
}

/* Description */
.dive-page__description {
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
  color: #202122;
}

/* Search field */
.dive-page__search-field {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  min-height: 50px;
  padding: 0 18px;
  border: 1.5px solid #a2a9b1;
  border-radius: 24px;
  background: #fff;
}

.dive-page__search-icon {
  color: #72777d;
}

.dive-page__search-input {
  flex: 1;
  border: 0;
  background: transparent;
  outline: none;
  color: #202122;
  min-width: 0;
}

.dive-page__search-input::placeholder {
  color: #72777d;
}

.dive-page__search-input::-webkit-search-cancel-button {
  display: none;
}

.dive-page__mic {
  display: inline-block;
  box-sizing: border-box;
  flex-shrink: 0;
  position: relative;
  width: 10px;
  height: 18px;
  color: #72777d;
  border: 2px solid currentColor;
  border-radius: 999px;
  border-bottom: 0;
}

.dive-page__mic::before,
.dive-page__mic::after {
  content: '';
  position: absolute;
  inset-inline-start: 50%;
  transform: translateX(-50%);
}

.dive-page__mic::before {
  inset-block-end: -7px;
  width: 10px;
  height: 6px;
  box-sizing: border-box;
  border: 2px solid currentColor;
  border-top: 0;
  border-radius: 0 0 999px 999px;
}

.dive-page__mic::after {
  inset-block-end: -11px;
  width: 2px;
  height: 5px;
  background: currentColor;
  border-radius: 999px;
}

/* Dive now button */
.dive-page__dive-btn {
  align-self: center;
  padding: 14px 32px;
  border: 0;
  border-radius: 999px;
  background: #54595d;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

/* Results section */
.dive-page__results {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.dive-page__sample-query {
  margin: 0;
  color: #54595d;
}

/* Carousel */
.dive-page__carousel {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 4px;
}

.dive-page__carousel::-webkit-scrollbar {
  display: none;
}

/* Carousel card sizing */
.dive-page__card {
  flex: 0 0 92%;
  scroll-snap-align: start;
}

/* Pagination dots */
.dive-page__dots {
  display: flex;
  justify-content: center;
  gap: var(--mobile-android-space-sm);
  padding-top: 4px;
}

.dive-page__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #c8ccd1;
  transition: background 0.2s ease;
}

.dive-page__dot--active {
  background: #54595d;
}
</style>
