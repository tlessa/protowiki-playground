<script setup lang="ts">
import { useRouter } from 'vue-router'

import WireframeMobileWrapper from '@/components/WireframeMobileWrapper.vue'
import WireframeChromeWrapper from '@/components/chrome/WireframeChromeWrapper.vue'
import SemanticResultCard from '@/components/SemanticResultCard.vue'
import '@/styles/mobile-android/index.css'

definePage({
  meta: {
    title: 'Search results',
    description: 'Search results screen for v2 prototype.',
  },
})

const router = useRouter()
</script>

<template>
  <WireframeMobileWrapper>
    <WireframeChromeWrapper
      active-tab="search"
      home-url="/example-search-experiment-latest/home"
      search-url="/example-search-experiment-latest/search"
      class="mobile-android-type mobile-android-type--wireframe"
    >
      <template #header>
        <header class="results-header" aria-label="Results header">
          <button type="button" class="results-header__back" aria-label="Go back" @click="router.back()">
            <span class="results-header__back-shaft" />
          </button>
          <button type="button" class="results-header__close" aria-label="Close search" @click="router.push('/example-search-experiment-latest/search')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </header>

        <div class="results-languages" role="tablist" aria-label="Search languages">
          <div class="results-languages__list">
            <button class="results-languages__item results-languages__item--active" type="button" role="tab">
              <span class="results-languages__row">
                <span class="results-languages__icon results-languages__icon--active">EN</span>
                <span class="mwf-android-type-small results-languages__label results-languages__label--active">ENGLISH</span>
              </span>
            </button>
            <button class="results-languages__item" type="button" role="tab">
              <span class="results-languages__row">
                <span class="results-languages__icon">PT</span>
                <span class="mwf-android-type-small results-languages__label">PORTUGUÊS</span>
              </span>
            </button>
            <button class="results-languages__item" type="button" role="tab">
              <span class="results-languages__row">
                <span class="results-languages__icon">ES</span>
                <span class="mwf-android-type-small results-languages__label">ESPAÑOL</span>
              </span>
            </button>
          </div>
          <button class="mwf-android-type-chip results-languages__more" type="button">more</button>
        </div>
      </template>

      <section class="results-content" aria-label="Search results">
        <article class="results-item">
          <div class="results-item__copy">
            <h3 class="mwf-android-type-p results-item__title">Cat</h3>
            <p class="mwf-android-type-p results-item__description">Small domesticated carnivorous mammal</p>
          </div>
          <div class="results-item__thumb" aria-hidden="true" />
        </article>

        <SemanticResultCard
          trail="Cat > Senses > Vision"
          highlight="Cats have excellent night vision and can see at one sixth the light level required for human vision.[58]:"
          faded="This is partly the result of cat eyes"
          :contributors="859"
          :references="25"
        />

        <article class="results-item">
          <div class="results-item__copy">
            <h3 class="mwf-android-type-p results-item__title">Cat Stevens</h3>
            <p class="mwf-android-type-p results-item__description">British musician (born 1948)</p>
          </div>
          <div class="results-item__thumb" aria-hidden="true" />
        </article>
      </section>
    </WireframeChromeWrapper>
  </WireframeMobileWrapper>
</template>

<style scoped>
/* ── Header ─────────────────────────────────────────────────────── */
.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
  padding: 8px 12px 10px;
  background: #fff;
  border-bottom: 1px solid #eaecf0;
}

.results-header__back {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.results-header__back-shaft {
  position: relative;
  width: 18px;
  height: 2px;
  background: #202122;
  border-radius: 999px;
}

.results-header__back-shaft::before {
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

.results-header__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  color: #202122;
}

/* ── Language tabs ───────────────────────────────────────────────── */
.results-languages {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  min-height: 52px;
  padding: 8px 16px 0 8px;
  background: #fff;
  box-shadow: 0 4px 1px rgba(157, 157, 157, 0.25);
}

.results-languages__list {
  display: inline-flex;
  align-items: stretch;
  flex: 1 1 auto;
  min-width: 0;
  overflow-x: auto;
}

.results-languages__item {
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

.results-languages__item--active::after {
  content: '';
  width: 100%;
  height: 1.5px;
  border-radius: 2px 2px 0 0;
  background: #3366cc;
}

.results-languages__row {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.results-languages__icon {
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
}

.results-languages__icon--active {
  border: 0;
  background: #3366cc;
  color: #fff;
}

.results-languages__label {
  color: #72777d;
  white-space: nowrap;
}

.results-languages__label--active {
  color: #3366cc;
}

.results-languages__more {
  flex: 0 0 auto;
  align-self: center;
  margin-inline-start: 8px;
  border: 0;
  padding: 0;
  background: transparent;
  color: #3366cc;
}

/* ── Results ─────────────────────────────────────────────────────── */
.results-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 16px 24px;
  background: #fff;
}

.results-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  min-height: 74px;
  padding: 8px 0;
}

.results-item__copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.results-item__title {
  margin: 0;
  color: #202122;
}

.results-item__description {
  margin: 0;
  color: #54595d;
}

.results-item__thumb {
  flex: 0 0 auto;
  width: 74px;
  height: 74px;
  border-radius: 12px;
  background: linear-gradient(120deg, #d4d9df, #eceff2 58%, #cfd5dc);
}
</style>
