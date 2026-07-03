<script setup lang="ts">
import { RouterLink } from 'vue-router'
import {
  cdxIconBookmarkOutline,
  cdxIconHistory,
  cdxIconHome,
  cdxIconMenu,
  cdxIconSearch,
} from '@wikimedia/codex-icons'

import AppIcon from '@/components/AppIcon.vue'
import { MATERIAL_ICON_PATHS } from '@/lib/materialIconPaths'

type WireframeTab = 'home' | 'saved' | 'search' | 'edit' | 'more'

interface Props {
  lang?: string
  dir?: 'ltr' | 'rtl'
  theme?: 'light' | 'dark'
  activeTab?: WireframeTab
  homeUrl?: string
  searchUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  lang: undefined,
  dir: undefined,
  theme: undefined,
  activeTab: 'home',
  homeUrl: '/example-search-experiment/home',
  searchUrl: '/example-search-experiment/search',
})
</script>

<template>
  <div
    class="mobile-chrome-wrapper"
    data-skin="mobile"
    :data-theme="props.theme"
    :lang="props.lang"
    :dir="props.dir"
  >
    <main class="mobile-chrome-wrapper__content">
      <div class="mobile-chrome-wrapper__status-bar" aria-hidden="true">
        <span class="mobile-chrome-wrapper__status-time">9:52</span>
        <div class="mobile-chrome-wrapper__status-center-dot" />
        <div class="mobile-chrome-wrapper__status-icons">
          <span class="mobile-chrome-wrapper__signal" />
          <span class="mobile-chrome-wrapper__wifi" />
          <span class="mobile-chrome-wrapper__battery">
            <span class="mobile-chrome-wrapper__battery-level" />
          </span>
        </div>
      </div>

      <slot name="header" />

      <slot />
    </main>

    <slot name="nav">
      <nav class="mobile-chrome-wrapper__nav" aria-label="Primary">
        <RouterLink
          :to="props.homeUrl"
          :class="[
            'mobile-chrome-wrapper__nav-item',
            { 'mobile-chrome-wrapper__nav-item--active': props.activeTab === 'home' },
          ]"
        >
          <span class="mobile-chrome-wrapper__nav-icon-shell">
            <AppIcon :codex-icon="cdxIconHome" :material-icon="MATERIAL_ICON_PATHS.home" />
          </span>
          <span class="mwf-android-type-toolbar">Home</span>
        </RouterLink>

        <div
          :class="[
            'mobile-chrome-wrapper__nav-item',
            { 'mobile-chrome-wrapper__nav-item--active': props.activeTab === 'saved' },
          ]"
        >
          <span class="mobile-chrome-wrapper__nav-icon-shell">
            <AppIcon
              :codex-icon="cdxIconBookmarkOutline"
              :material-icon="MATERIAL_ICON_PATHS.saved"
            />
          </span>
          <span class="mwf-android-type-toolbar">Saved</span>
        </div>

        <RouterLink
          :to="props.searchUrl"
          :class="[
            'mobile-chrome-wrapper__nav-item',
            { 'mobile-chrome-wrapper__nav-item--active': props.activeTab === 'search' },
          ]"
        >
          <span class="mobile-chrome-wrapper__nav-icon-shell">
            <AppIcon :codex-icon="cdxIconSearch" :material-icon="MATERIAL_ICON_PATHS.search" />
          </span>
          <span class="mwf-android-type-toolbar">Search</span>
        </RouterLink>

        <div
          :class="[
            'mobile-chrome-wrapper__nav-item',
            { 'mobile-chrome-wrapper__nav-item--active': props.activeTab === 'edit' },
          ]"
        >
          <span class="mobile-chrome-wrapper__nav-icon-shell">
            <AppIcon :codex-icon="cdxIconHistory" :material-icon="MATERIAL_ICON_PATHS.history" />
          </span>
          <span class="mwf-android-type-toolbar">Activity</span>
        </div>

        <div
          :class="[
            'mobile-chrome-wrapper__nav-item',
            { 'mobile-chrome-wrapper__nav-item--active': props.activeTab === 'more' },
          ]"
        >
          <span class="mobile-chrome-wrapper__nav-icon-shell">
            <AppIcon :codex-icon="cdxIconMenu" :material-icon="MATERIAL_ICON_PATHS.more" />
          </span>
          <span class="mwf-android-type-toolbar">More</span>
        </div>
      </nav>
    </slot>
  </div>
</template>

<style scoped>
.mobile-chrome-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--background-color-base, #fff);
  color: var(--color-base, #202122);
}

.mobile-chrome-wrapper__status-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  min-height: 24px;
  padding: max(4px, env(safe-area-inset-top, 0px)) 12px 4px;
  background-color: var(--background-color-base, #fff);
  color: var(--proto-chrome-status-color);
  font-family: var(--proto-ui-font-family);
  font-size: 12px;
  line-height: 1;
}

.mobile-chrome-wrapper__status-time {
  justify-self: start;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.mobile-chrome-wrapper__status-center-dot {
  width: 8px;
  height: 8px;
  border: 1.4px solid currentColor;
  border-radius: 999px;
  justify-self: center;
}

.mobile-chrome-wrapper__status-icons {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-self: end;
}

.mobile-chrome-wrapper__signal {
  width: 10px;
  height: 10px;
  border: 1.4px solid currentColor;
  border-top-color: transparent;
  border-left-color: transparent;
  transform: rotate(45deg);
  border-radius: 1px;
}

.mobile-chrome-wrapper__wifi {
  position: relative;
  width: 12px;
  height: 8px;
}

.mobile-chrome-wrapper__wifi::before,
.mobile-chrome-wrapper__wifi::after {
  content: '';
  position: absolute;
  inset-inline-start: 50%;
  border: 1.4px solid currentColor;
  border-bottom: 0;
  border-radius: 999px 999px 0 0;
  transform: translateX(-50%);
}

.mobile-chrome-wrapper__wifi::before {
  inset-block-start: 0;
  width: 12px;
  height: 7px;
}

.mobile-chrome-wrapper__wifi::after {
  inset-block-start: 3px;
  width: 6px;
  height: 3px;
}

.mobile-chrome-wrapper__battery {
  position: relative;
  width: 16px;
  height: 10px;
  border: 1.4px solid currentColor;
  border-radius: 2px;
}

.mobile-chrome-wrapper__battery::after {
  content: '';
  position: absolute;
  inset-block-start: 2px;
  inset-inline-end: -3px;
  width: 2px;
  height: 4px;
  background: currentColor;
  border-radius: 0 1px 1px 0;
}

.mobile-chrome-wrapper__battery-level {
  position: absolute;
  inset-block: 1px;
  inset-inline-start: 1px;
  width: 9px;
  background: currentColor;
  border-radius: 1px;
}

.mobile-chrome-wrapper__content {
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
  padding-bottom: calc(var(--mobile-android-size-nav-bar-height, 72px) + env(safe-area-inset-bottom, 0px));
}

.mobile-chrome-wrapper__nav {
  position: sticky;
  bottom: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: start;
  gap: 0;
  padding: 7px 0 calc(8px + env(safe-area-inset-bottom, 0px));
  background-color: var(--background-color-base, #fff);
  border-top: 1px solid var(--border-color-subtle, #c8ccd1);
}

.mobile-chrome-wrapper__nav-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-height: var(--mobile-android-size-list-item-height, 48px);
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-subtle, #54595d);
  text-decoration: none;
  font: inherit;
  font-size: 11px;
  line-height: 1.2;
}

.mobile-chrome-wrapper__nav-icon-shell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
}

.mobile-chrome-wrapper__nav-item--active {
  color: var(--color-base, #202122);
}

.mobile-chrome-wrapper__nav-item--active .mobile-chrome-wrapper__nav-icon-shell {
  background: var(--proto-chrome-nav-active-pill-bg);
}

.mobile-chrome-wrapper__nav-item :deep(svg),
.mobile-chrome-wrapper__nav-item :deep(img) {
  display: block;
  width: 20px;
  height: 20px;
}
</style>
