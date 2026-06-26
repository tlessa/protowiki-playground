<script setup lang="ts">
definePage({
  meta: {
    title: 'Template: Mobile wireframe',
    description: 'Template for a mobile-first wireframe inside the phone preview shell.',
  },
})

import WireframeMobileWrapper from '@/components/WireframeMobileWrapper.vue'
import WireframeChromeWrapper from '@/components/chrome/WireframeChromeWrapper.vue'
import '@/styles/mobile-android/index.css'
</script>

<template>
  <WireframeMobileWrapper>
    <!--Determine here which tab is active-->
    <WireframeChromeWrapper
      active-tab="search"
      class="mobile-android-type mobile-android-type--wireframe"
    >
      <section class="wireframe">
        <header class="wireframe__header">
          <div class="wireframe__eyebrow"></div>
          <div class="wireframe__title"></div>
          <div class="wireframe__subtitle"></div>
        </header>

        <section class="wireframe__card">
          <div class="wireframe__hero"></div>
          <div class="wireframe__line wireframe__line--long"></div>
          <div class="wireframe__line"></div>
          <div class="wireframe__line wireframe__line--short"></div>
        </section>

        <section class="wireframe__card wireframe__card--split">
          <div class="wireframe__chip"></div>
          <div class="wireframe__chip"></div>
          <div class="wireframe__chip"></div>
        </section>

        <section class="wireframe__card">
          <div class="wireframe__section-title"></div>
          <div class="wireframe__list-item" v-for="item in 4" :key="item">
            <div class="wireframe__avatar"></div>
            <div class="wireframe__list-copy">
              <div class="wireframe__line"></div>
              <div class="wireframe__line wireframe__line--short"></div>
            </div>
          </div>
        </section>
      </section>
    </WireframeChromeWrapper>
  </WireframeMobileWrapper>
</template>

<style scoped>
.wireframe {
  --wireframe-space: clamp(12px, 2.8vw, 24px);
  --wireframe-space-tight: clamp(8px, 2vw, 16px);
  display: flex;
  flex-direction: column;
  gap: var(--wireframe-space);
  padding: var(--wireframe-space);
  background: var(--background-color-neutral-subtle, #f8f9fa);
}

.wireframe__header,
.wireframe__card {
  display: flex;
  flex-direction: column;
  gap: var(--wireframe-space-tight);
  padding: var(--wireframe-space);
  background: var(--background-color-base, #fff);
  border: 1px solid var(--border-color-subtle, #eaecf0);
  border-radius: clamp(8px, 2vw, 16px);
}

.wireframe__card--split {
  flex-direction: row;
  flex-wrap: wrap;
}

.wireframe__eyebrow,
.wireframe__title,
.wireframe__subtitle,
.wireframe__hero,
.wireframe__line,
.wireframe__chip,
.wireframe__section-title,
.wireframe__avatar {
  background: linear-gradient(
    90deg,
    var(--background-color-interactive-subtle, #eaecf0) 0%,
    var(--background-color-neutral-subtle, #f8f9fa) 50%,
    var(--background-color-interactive-subtle, #eaecf0) 100%
  );
  border-radius: var(--border-radius-base, 4px);
}

.wireframe__eyebrow {
  width: 32%;
  height: clamp(8px, 1.6vw, 10px);
}

.wireframe__title {
  width: 72%;
  height: clamp(24px, 5vw, 34px);
}

.wireframe__subtitle {
  width: 48%;
  height: clamp(12px, 2.4vw, 16px);
}

.wireframe__hero {
  width: 100%;
  height: clamp(160px, 36vw, 260px);
}

.wireframe__line {
  width: 100%;
  height: clamp(12px, 2.4vw, 16px);
}

.wireframe__line--long {
  width: 88%;
}

.wireframe__line--short {
  width: 54%;
}

.wireframe__chip {
  width: calc(33.333% - var(--wireframe-space-tight));
  min-width: clamp(84px, 22vw, 120px);
  height: clamp(72px, 16vw, 108px);
}

.wireframe__section-title {
  width: 44%;
  height: clamp(16px, 3vw, 22px);
}

.wireframe__list-item {
  display: flex;
  gap: var(--wireframe-space-tight);
  align-items: center;
}

.wireframe__avatar {
  flex: 0 0 auto;
  width: clamp(40px, 9vw, 56px);
  height: clamp(40px, 9vw, 56px);
  border-radius: 999px;
}

.wireframe__list-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: clamp(6px, 1.8vw, 12px);
}

@media (min-width: 700px) {
  .wireframe {
    --wireframe-space: clamp(18px, 2.6vw, 28px);
    --wireframe-space-tight: clamp(12px, 1.8vw, 18px);
  }

  .wireframe__card--split {
    justify-content: space-between;
  }
}
</style>