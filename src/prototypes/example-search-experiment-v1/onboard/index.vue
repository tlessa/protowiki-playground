<script setup lang="ts">
definePage({
  meta: {
    title: 'Example: Search Experiment v1 – Onboarding',
    description: 'Onboarding screen introducing the Dive / Search deeper feature.',
  },
})

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import WireframeMobileWrapper from '@/components/WireframeMobileWrapper.vue'
import '@/styles/mobile-android/index.css'

const router = useRouter()
const currentSlide = ref(0)

function onScroll(e: Event) {
  const el = e.target as HTMLElement
  currentSlide.value = Math.round(el.scrollLeft / el.offsetWidth)
}

function getStarted() {
  localStorage.setItem('v1-search-onboarded', '1')
  router.push('/example-search-experiment-v1/search/focused')
}
</script>

<template>
  <WireframeMobileWrapper>
    <div class="onboard mobile-android-type mobile-android-type--wireframe">
      <div class="onboard__header">
        <span class="onboard__beta">BETA</span>
        <h1 class="mwf-android-type-h1 onboard__title">Dive: search deeper</h1>
      </div>

      <div class="onboard__slides" @scroll.passive="onScroll">

        <!-- Slide 1 -->
        <div class="onboard__slide">
          <div class="onboard__content">
            <div class="onboard__illustration" aria-hidden="true">
              <div class="onboard__bar onboard__bar--wide" />
              <div class="onboard__bar onboard__bar--narrow" />
              <div class="onboard__highlight-row">
                <span class="onboard__quote">"</span>
                <div class="onboard__highlight" />
              </div>
              <div class="onboard__highlight-row onboard__highlight-row--offset">
                <svg class="onboard__magnifier" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="14" stroke="#101418" stroke-width="6"/>
                  <line x1="31" y1="31" x2="48" y2="48" stroke="#101418" stroke-width="6" stroke-linecap="round"/>
                </svg>
                <div class="onboard__highlight" />
              </div>
            </div>

            <div class="onboard__text">
              <p class="mwf-android-type-p onboard__heading">Go beyond article title</p>
              <p class="mwf-android-type-p onboard__body">This experimental feature searches deeper within articles and returns passages word for word. It's available for a limited time.</p>
              <a href="#" class="mwf-android-type-p onboard__link">Learn more</a>
            </div>
          </div>
        </div>

        <!-- Slide 2 -->
        <div class="onboard__slide">
          <div class="onboard__content">
            <p class="mwf-android-type-p onboard__query">When was Pluto unlisted as a planet?</p>

            <div class="onboard__cards-row" aria-hidden="true">
              <!-- Main card -->
              <div class="onboard__result-card">
                <div class="onboard__result-card-header">
                  <div class="onboard__result-thumb">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="16" height="16" rx="2" stroke="#72777d" stroke-width="1.5"/><path d="M1 12l4-4 3 3 4-5 5 6H1z" fill="#c8ccd1"/></svg>
                  </div>
                  <span class="onboard__result-title">Pluto</span>
                </div>
                <div class="onboard__result-body">
                  <span class="onboard__result-quote">"</span>
                  <div class="onboard__result-text">
                    <span class="onboard__result-highlight">Originally considered a planet, its status was changed when astronomers</span>
                    <span class="onboard__result-faded"> adopted a new definition of the word with new criteria.</span>
                  </div>
                </div>
                <p class="onboard__result-meta">859 contributors | 25 references</p>
              </div>
              <!-- Peek of next card -->
              <div class="onboard__result-card onboard__result-card--peek">
                <div class="onboard__result-card-header">
                  <div class="onboard__result-thumb onboard__result-thumb--yellow" />
                </div>
                <p class="onboard__result-meta-line" />
              </div>
            </div>

            <div class="onboard__text">
              <p class="mwf-android-type-p onboard__heading">From articles written by people</p>
              <p class="mwf-android-type-p onboard__body">Reliable passages drawn from articles that people researched, wrote, and edited, each one backed by cited sources you can check.</p>
            </div>

            <button class="mwf-android-type-p onboard__cta" type="button" @click="getStarted">Get started</button>
          </div>
        </div>

      </div>

      <div class="onboard__footer">
        <div class="onboard__dots" :aria-label="`Step ${currentSlide + 1} of 2`">
          <span class="onboard__dot" :class="{ 'onboard__dot--active': currentSlide === 0 }" />
          <span class="onboard__dot" :class="{ 'onboard__dot--active': currentSlide === 1 }" />
        </div>
        <div class="onboard__home-bar" />
      </div>
    </div>
  </WireframeMobileWrapper>
</template>

<style scoped>
.onboard {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fff;
  overflow: hidden;
}

.onboard__slides {
  flex: 1;
  display: flex;
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
  min-height: 0;
}

.onboard__slides::-webkit-scrollbar {
  display: none;
}

.onboard__slide {
  flex: 0 0 100%;
  scroll-snap-align: start;
  overflow-y: auto;
}

.onboard__header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px 24px 0;
  flex-shrink: 0;
}

.onboard__content {
  display: flex;
  flex-direction: column;
  padding: 16px 24px 0;
  gap: 16px;
}

.onboard__beta {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: #3366cc;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  width: fit-content;
}

.onboard__title {
  margin: 0;
  color: #101418;
}

.onboard__illustration {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 28px 24px 36px;
  background: #e0e2e5;
  border-radius: 8px;
}

.onboard__illustration--s2 {
  gap: 20px;
  align-items: center;
  justify-content: center;
  padding: 36px 24px;
}

.onboard__bar {
  height: 36px;
  border-radius: 4px;
  background: #7b7f6b;
}

.onboard__bar--wide { width: 85%; }
.onboard__bar--narrow { width: 70%; }

.onboard__highlight-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.onboard__highlight-row--offset {
  margin-top: -4px;
}

.onboard__quote {
  font-size: 40px;
  font-weight: 900;
  line-height: 1;
  color: #101418;
  flex-shrink: 0;
}

.onboard__highlight {
  flex: 1;
  height: 28px;
  background: #f5d800;
  border-radius: 2px;
}

.onboard__magnifier {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  margin-left: -8px;
  margin-top: 4px;
}

/* Slide 2 */
.onboard__query {
  margin: 0;
  color: #54595d;
  font-style: italic;
}

.onboard__cards-row {
  display: flex;
  gap: 12px;
  overflow: hidden;
}

.onboard__result-card {
  flex: 0 0 88%;
  border: 1px solid #c8ccd1;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fff;
}

.onboard__result-card--peek {
  flex: 0 0 9%;
  gap: 8px;
}

.onboard__result-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.onboard__result-thumb {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 1px solid #c8ccd1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #f8f9fa;
}

.onboard__result-thumb--yellow {
  background: #f5d800;
  border-color: #f5d800;
}

.onboard__result-title {
  font-size: 14px;
  color: #54595d;
}

.onboard__result-body {
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.onboard__result-quote {
  font-size: 32px;
  font-weight: 900;
  line-height: 1;
  color: #101418;
  flex-shrink: 0;
  margin-top: -4px;
}

.onboard__result-text {
  font-size: 15px;
  line-height: 1.5;
}

.onboard__result-highlight {
  background: #f5d800;
  font-style: italic;
}

.onboard__result-faded {
  color: #72777d;
  font-style: italic;
}

.onboard__result-meta {
  margin: 0;
  font-size: 13px;
  color: #54595d;
}

.onboard__result-meta-line {
  margin: 0;
  height: 10px;
  border-radius: 4px;
  background: #e0e2e5;
  width: 100%;
}

.onboard__cta {
  width: 100%;
  height: 52px;
  border: 0;
  border-radius: 999px;
  background: #3366cc;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  margin-top: 8px;
}

/* Text */
.onboard__text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.onboard__heading {
  margin: 0;
  font-weight: 700;
  color: #101418;
}

.onboard__body {
  margin: 0;
  color: #3d3d3d;
}

.onboard__link {
  color: #101418;
  text-decoration: underline;
}

/* Footer */
.onboard__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 0 12px;
}

.onboard__dots {
  display: flex;
  gap: 8px;
  align-items: center;
  padding-bottom: 40px;
}

.onboard__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #c8ccd1;
  transition: background 0.2s;
}

.onboard__dot--active {
  background: #54595d;
}

.onboard__home-bar {
  width: 120px;
  height: 4px;
  border-radius: 999px;
  background: #c8ccd1;
}
</style>
