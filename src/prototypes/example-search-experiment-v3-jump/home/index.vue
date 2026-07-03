<script setup lang="ts">
definePage({
  meta: {
    title: 'Example: Community home feed',
    description: 'Wikipedia Community home feed wireframe — Community tab with Featured article card.',
  },
})

import WireframeMobileWrapper from '@/components/WireframeMobileWrapper.vue'
import WireframeChromeWrapper from '@/components/chrome/WireframeChromeWrapper.vue'
import '@/styles/mobile-android/index.css'
</script>

<template>
  <WireframeMobileWrapper>
    <WireframeChromeWrapper active-tab="home" home-url="/example-search-experiment-v3-jump/community" search-url="/example-search-experiment-v3-jump/search" class="mobile-android-type mobile-android-type--wireframe">
      <template #header>
        <header class="community-header" aria-label="App header">
          <div class="community-header__logo" aria-label="Wikipedia" />
          <button class="community-header__bell" type="button" aria-label="Notifications" />
        </header>

        <nav class="community-tabs" role="tablist" aria-label="Feed tabs">
          <div class="community-tabs__list">
            <button
              class="community-tabs__tab community-tabs__tab--active"
              role="tab"
              aria-selected="true"
              type="button"
            >
              Community
            </button>
            <button
              class="community-tabs__tab"
              role="tab"
              aria-selected="false"
              type="button"
            >
              For you
            </button>
          </div>
          <button class="community-tabs__lang" type="button" aria-label="Language: English">
            EN <span class="community-tabs__lang-chevron" aria-hidden="true" />
          </button>
        </nav>
      </template>

      <section class="community-feed" aria-label="Community feed">
        <div class="community-banner" aria-label="About this feed">
          <div class="community-banner__copy">
            <span class="community-banner__line" />
            <span class="community-banner__line community-banner__line--short" />
          </div>
          <span class="community-banner__globe" aria-hidden="true" />
        </div>

        <section class="community-section" aria-labelledby="featured-title">
          <p class="mwf-android-type-h5 community-section__date">Today - Jun 24, 2026</p>

          <header class="community-section__header">
            <h2 id="featured-title" class="mwf-android-type-h1 community-section__title">Featured article</h2>
            <button class="community-section__more-btn" type="button" aria-label="More options">
              <span class="community-section__more-dots" aria-hidden="true" />
            </button>
          </header>

          <p class="mwf-android-type-p community-section__desc">
            Featured articles are some of the highest-quality articles on Wikipedia, selected daily by editors
          </p>

          <article class="community-card" aria-label="Featured article card">
            <div class="community-card__hero" aria-hidden="true">
              <div class="community-card__hero-actions">
                <span class="community-card__action-btn" aria-hidden="true" />
                <span class="community-card__action-btn" aria-hidden="true" />
              </div>
            </div>

            <div class="community-card__body">
              <span class="community-card__title-line" />
              <span class="community-card__title-line community-card__title-line--half" />
              <span class="community-card__divider" />
              <span class="community-card__subtitle-line" />
              <span class="community-card__text-line" />
              <span class="community-card__text-line community-card__text-line--partial" />
            </div>
          </article>
        </section>
      </section>
    </WireframeChromeWrapper>
  </WireframeMobileWrapper>
</template>

<style scoped>
.community-banner__line,
.community-banner__globe,
.community-header__logo,
.community-card__hero,
.community-card__title-line,
.community-card__subtitle-line,
.community-card__text-line {
  display: block;
  background: linear-gradient(
    90deg,
    var(--background-color-interactive-subtle, #eaecf0) 0%,
    var(--background-color-neutral-subtle, #f8f9fa) 50%,
    var(--background-color-interactive-subtle, #eaecf0) 100%
  );
  border-radius: var(--border-radius-base, 4px);
}

/* ---- header ---- */
.community-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
  padding: var(--mobile-android-space-sm) var(--mobile-android-space-md);
  background: #fff;
  border-bottom: 1px solid #eaecf0;
}

.community-header__logo {
  width: 140px;
  height: 28px;
}

.community-header__bell {
  position: relative;
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.community-header__bell::before {
  content: '';
  position: absolute;
  inset-block-start: 4px;
  inset-inline-start: 8px;
  width: 18px;
  height: 16px;
  border: 2px solid #202122;
  border-bottom: 0;
  border-radius: 9px 9px 0 0;
}

.community-header__bell::after {
  content: '';
  position: absolute;
  inset-block-end: 6px;
  inset-inline-start: 5px;
  width: var(--mobile-android-size-icon);
  height: 2px;
  background: #202122;
  border-radius: 2px;
  box-shadow: 0 4px 0 #202122;
}

/* ---- tabs ---- */
.community-tabs {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  min-height: 52px;
  padding: 8px 16px 0;
  background: #fff;
  box-shadow: 0 4px 1px rgba(157, 157, 157, 0.25);
}

.community-tabs__list {
  display: inline-flex;
  align-items: stretch;
}

.community-tabs__tab {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: var(--mobile-android-space-sm);
  padding: 8px 16px 0;
  border: 0;
  background: transparent;
  color: #72777d;
  font-family: var(--mobile-android-type-p-font-family);
  font-size: var(--mobile-android-type-p-font-size);
  font-weight: var(--mobile-android-type-p-font-weight);
  cursor: pointer;
}

.community-tabs__tab::after {
  content: '';
  display: block;
  width: 100%;
  height: 2px;
  border-radius: 2px 2px 0 0;
  background: transparent;
}

.community-tabs__tab--active {
  color: #3366cc;
}

.community-tabs__tab--active::after {
  background: #3366cc;
}

.community-tabs__lang {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: center;
  padding: 4px 8px;
  border: 1px solid #72777d;
  border-radius: 4px;
  background: transparent;
  color: #202122;
  font-family: var(--mobile-android-type-small-font-family);
  font-size: var(--mobile-android-type-small-font-size);
  font-weight: var(--mobile-android-type-small-font-weight);
  cursor: pointer;
}

.community-tabs__lang-chevron {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-inline-end: 1.5px solid currentColor;
  border-block-end: 1.5px solid currentColor;
  transform: rotate(45deg) translateY(-2px);
}

/* ---- feed ---- */
.community-feed {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 16px;
  background: #f8f9fa;
}

/* ---- banner ---- */
.community-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  margin-bottom: 20px;
  background: #fff;
  border: 1px solid #eaecf0;
  border-radius: 12px;
}

.community-banner__copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--mobile-android-space-sm);
}

.community-banner__line {
  height: 14px;
  width: 100%;
}

.community-banner__line--short {
  width: 72%;
}

.community-banner__globe {
  flex: 0 0 auto;
  width: 52px;
  height: 52px;
  border-radius: 999px;
}

/* ---- section ---- */
.community-section {
  display: flex;
  flex-direction: column;
  gap: var(--mobile-android-space-sm);
}

.community-section__date {
  margin: 0;
  color: #202122;
}

.community-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.community-section__title {
  margin: 0;
  color: #202122;
}

.community-section__more-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.community-section__more-dots {
  display: inline-block;
  width: 4px;
  height: 4px;
  background: #202122;
  border-radius: 999px;
  box-shadow: 0 -7px 0 #202122, 0 7px 0 #202122;
}

.community-section__desc {
  margin: 0;
  color: #54595d;
}

/* ---- article card ---- */
.community-card {
  margin-top: 8px;
  overflow: hidden;
  border: 1px solid #eaecf0;
  border-radius: 12px;
  background: #fff;
}

.community-card__hero {
  position: relative;
  width: 100%;
  height: clamp(180px, 46vw, 260px);
  border-radius: 0;
}

.community-card__hero-actions {
  position: absolute;
  inset-block-start: 12px;
  inset-inline-end: 12px;
  display: inline-flex;
  gap: var(--mobile-android-space-sm);
}

.community-card__action-btn {
  display: inline-block;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1.5px solid #c8ccd1;
  background: rgba(255, 255, 255, 0.88);
}

.community-card__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: #fff;
}

.community-card__title-line {
  height: 28px;
  width: 100%;
}

.community-card__title-line--half {
  width: 62%;
}

.community-card__divider {
  display: block;
  height: 1px;
  width: 40px;
  background: #c8ccd1;
  border-radius: 1px;
}

.community-card__subtitle-line {
  height: 16px;
  width: 44%;
}

.community-card__text-line {
  height: 14px;
  width: 100%;
}

.community-card__text-line--partial {
  width: 70%;
}

@media (min-width: 520px) {
  .community-header,
  .community-tabs {
    padding-inline: 20px;
  }

  .community-feed {
    padding-inline: 20px;
  }
}
</style>
