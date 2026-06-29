<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { cdxIconSearch } from '@wikimedia/codex-icons'

import WireframeMobileWrapper from '@/components/WireframeMobileWrapper.vue'
import WireframeChromeWrapper from '@/components/chrome/WireframeChromeWrapper.vue'
import AppIcon from '@/components/AppIcon.vue'
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

function toggleBetaMenu(e: Event) {
  e.stopPropagation()
  showBetaMenu.value = !showBetaMenu.value
}

function closeBetaMenu() {
  showBetaMenu.value = false
}

const sampleQuery = 'When was Pluto unlisted as a planet?'

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
        <button class="dive-page__back" type="button" aria-label="Go back" @click="router.push('/example-search-experiment-v3-jump/search')">
          <span class="dive-page__back-arrow" aria-hidden="true" />
        </button>
        <div class="dive-page__title-row">
          <h1 class="dive-page__title">Dive straight to the passage</h1>
          <span class="dive-page__beta-wrap">
            <button type="button" class="dive-page__beta" @click.stop="toggleBetaMenu">Beta</button>
            <div v-if="showBetaMenu" class="beta-menu" role="menu">
              <button type="button" class="beta-menu__item" role="menuitem" @click="closeBetaMenu">Learn more</button>
              <button type="button" class="beta-menu__item beta-menu__item--danger" role="menuitem" @click="closeBetaMenu">Turn off this experiment</button>
            </div>
            <div v-if="showBetaMenu" class="beta-menu__backdrop" @click="closeBetaMenu" />
          </span>
        </div>
      </header>

      <p class="dive-page__description">
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

      <button class="dive-page__dive-btn" type="button" @click="router.push({ path: '/example-search-experiment-v3-jump/search/semantic-results', query: { q: searchQuery } })">Dive now</button>

      <section class="dive-page__results">
        <p class="mwf-android-type-p dive-page__sample-query">{{ sampleQuery }}</p>

        <article class="focused-search-semantic-card">
          <div class="focused-search-semantic-card__header">
            <span class="focused-search-semantic-card__thumb" aria-hidden="true" />
            <p class="mwf-android-type-small focused-search-semantic-card__trail">{{ result.article }}</p>
          </div>
          <div class="focused-search-semantic-card__snippet">
            <span class="mwf-android-type-p focused-search-semantic-card__highlight">{{ result.highlight }}</span>
            <span class="mwf-android-type-p focused-search-semantic-card__faded">{{ result.faded }}</span>
          </div>
          <div class="focused-search-semantic-card__bottom">
            <span class="mwf-android-type-small focused-search-semantic-card__meta-item">
              {{ result.contributors }} contributors
            </span>
            <span class="focused-search-semantic-card__meta-dot" aria-hidden="true">·</span>
            <span class="mwf-android-type-small focused-search-semantic-card__meta-item">
              {{ result.references }} references
            </span>
          </div>
        </article>

        <div class="dive-page__dots" aria-hidden="true">
          <span class="dive-page__dot" />
          <span class="dive-page__dot" />
          <span class="dive-page__dot" />
        </div>
      </section>

    </div>
    </WireframeChromeWrapper>
  </WireframeMobileWrapper>
</template>

<style scoped>
.dive-page {
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
  align-items: flex-start;
  gap: 12px;
}

.dive-page__title-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex: 1;
}

.dive-page__beta-wrap {
  position: relative;
  flex-shrink: 0;
  margin-top: 6px;
}

.dive-page__beta {
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

.dive-page__back {
  flex-shrink: 0;
  margin-top: 6px;
  width: 24px;
  height: 24px;
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
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  min-width: 0;
}

.dive-page__search-input::placeholder {
  color: #72777d;
}

.dive-page__search-input::-webkit-search-cancel-button {
  display: none;
}

.dive-page__mic {
  position: relative;
  width: 10px;
  height: 18px;
  border: 2px solid #72777d;
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
  border: 2px solid #72777d;
  border-top: 0;
  border-radius: 0 0 999px 999px;
}

.dive-page__mic::after {
  inset-block-end: -11px;
  width: 2px;
  height: 5px;
  background: #72777d;
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
}

.dive-page__sample-query {
  margin: 0;
  color: #54595d;
}

/* Result card — matches semantic-results card */
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

/* Pagination dots */
.dive-page__dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding-top: 4px;
}

.dive-page__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #c8ccd1;
}
</style>
