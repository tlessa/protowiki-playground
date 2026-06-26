<script setup lang="ts">
import { useRouter } from 'vue-router'
import { cdxIconArrowPrevious, cdxIconBell, cdxIconEllipsis, cdxIconSearch } from '@wikimedia/codex-icons'

import AppIcon from '@/components/AppIcon.vue'
import WireframeMobileWrapper from '@/components/WireframeMobileWrapper.vue'
import { MATERIAL_ICON_PATHS } from '@/lib/materialIconPaths'
import '@/styles/mobile-android/index.css'

const router = useRouter()
</script>

<template>
  <WireframeMobileWrapper>
    <div class="article-shell mobile-android-type mobile-android-type--wireframe">
      <!-- Status bar -->
      <div class="article-status-bar" aria-hidden="true">
        <span class="article-status-bar__time">9:52</span>
        <div class="article-status-bar__center-dot" />
        <div class="article-status-bar__icons">
          <span class="article-status-bar__signal" />
          <span class="article-status-bar__wifi" />
          <span class="article-status-bar__battery">
            <span class="article-status-bar__battery-level" />
          </span>
        </div>
      </div>

      <!-- Top app bar -->
      <header class="article-top-bar" aria-label="Article navigation">
        <button class="article-top-bar__back" aria-label="Back" @click="router.back()">
          <AppIcon :codex-icon="cdxIconArrowPrevious" />
        </button>

        <div class="article-top-bar__search" role="search" aria-label="Search Wikipedia">
          <AppIcon :codex-icon="cdxIconSearch" :material-icon="MATERIAL_ICON_PATHS.search" class="article-top-bar__search-icon" />
          <span class="mwf-android-type-p article-top-bar__search-placeholder">Search Wikipedia</span>
        </div>

        <div class="article-top-bar__actions" aria-hidden="true">
          <div class="article-top-bar__tab-count">
            <span class="mwf-android-type-small article-top-bar__tab-number">1</span>
          </div>
          <AppIcon :codex-icon="cdxIconBell" :material-icon="MATERIAL_ICON_PATHS.bell" class="article-top-bar__icon" />
          <AppIcon :codex-icon="cdxIconEllipsis" :material-icon="MATERIAL_ICON_PATHS.more" class="article-top-bar__icon" />
        </div>
      </header>

      <!-- Article content -->
      <main class="article-content" aria-label="Article content">
        <slot />
      </main>

      <!-- Bottom toolbar -->
      <nav class="article-bottom-bar" aria-label="Article actions">
        <button class="article-bottom-bar__item" aria-label="Save">
          <span class="article-bottom-bar__icon article-bottom-bar__icon--save" aria-hidden="true" />
          <span class="mwf-android-type-toolbar article-bottom-bar__label">Save</span>
        </button>
        <button class="article-bottom-bar__item" aria-label="Language">
          <span class="article-bottom-bar__icon article-bottom-bar__icon--language" aria-hidden="true" />
          <span class="mwf-android-type-toolbar article-bottom-bar__label">Language</span>
        </button>
        <button class="article-bottom-bar__item" aria-label="Find in article">
          <span class="article-bottom-bar__icon article-bottom-bar__icon--find" aria-hidden="true" />
          <span class="mwf-android-type-toolbar article-bottom-bar__label">Find in article</span>
        </button>
        <button class="article-bottom-bar__item" aria-label="Edit">
          <span class="article-bottom-bar__icon article-bottom-bar__icon--edit" aria-hidden="true" />
          <span class="mwf-android-type-toolbar article-bottom-bar__label">Edit</span>
        </button>
        <button class="article-bottom-bar__item" aria-label="Contents">
          <span class="article-bottom-bar__icon article-bottom-bar__icon--contents" aria-hidden="true" />
          <span class="mwf-android-type-toolbar article-bottom-bar__label">Contents</span>
        </button>
      </nav>
    </div>
  </WireframeMobileWrapper>
</template>

<style scoped>
.article-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fff;
  color: #202122;
}

/* ── Status bar ── */
.article-status-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  min-height: 24px;
  padding: max(4px, env(safe-area-inset-top, 0px)) 12px 4px;
  background: #fff;
  color: #6b7280;
  font-size: 12px;
  line-height: 1;
}

.article-status-bar__time {
  justify-self: start;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.article-status-bar__center-dot {
  width: 8px;
  height: 8px;
  border: 1.4px solid currentColor;
  border-radius: 999px;
}

.article-status-bar__icons {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-self: end;
}

.article-status-bar__signal {
  width: 10px;
  height: 10px;
  border: 1.4px solid currentColor;
  border-top-color: transparent;
  border-left-color: transparent;
  transform: rotate(45deg);
  border-radius: 1px;
}

.article-status-bar__wifi {
  position: relative;
  width: 12px;
  height: 8px;
}

.article-status-bar__wifi::before,
.article-status-bar__wifi::after {
  content: '';
  position: absolute;
  inset-inline-start: 50%;
  border: 1.4px solid currentColor;
  border-bottom: 0;
  border-radius: 999px 999px 0 0;
  transform: translateX(-50%);
}

.article-status-bar__wifi::before {
  inset-block-start: 0;
  width: 12px;
  height: 7px;
}

.article-status-bar__wifi::after {
  inset-block-start: 3px;
  width: 6px;
  height: 3px;
}

.article-status-bar__battery {
  position: relative;
  width: 16px;
  height: 10px;
  border: 1.4px solid currentColor;
  border-radius: 2px;
}

.article-status-bar__battery::after {
  content: '';
  position: absolute;
  inset-block-start: 2px;
  inset-inline-end: -3px;
  width: 2px;
  height: 4px;
  background: currentColor;
  border-radius: 0 1px 1px 0;
}

.article-status-bar__battery-level {
  position: absolute;
  inset-block: 1px;
  inset-inline-start: 1px;
  width: 9px;
  background: currentColor;
  border-radius: 1px;
}

/* ── Top app bar ── */
.article-top-bar {
  position: sticky;
  top: 24px;
  z-index: 9;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 56px;
  padding: 8px 12px;
  background: #fff;
  border-bottom: 1px solid #eaecf0;
}

.article-top-bar__back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #202122;
  cursor: pointer;
}

.article-top-bar__search {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 0;
  min-width: 0;
  height: 40px;
  padding: 0 16px;
  border: 1.5px solid #a2a9b1;
  border-radius: 999px;
  background: #fff;
  color: #72777d;
  cursor: text;
}

.article-top-bar__search-icon {
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  color: #72777d;
}

.article-top-bar__search-placeholder {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #72777d;
}

.article-top-bar__actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex: 0 0 auto;
}

.article-top-bar__tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 1.5px solid #202122;
  border-radius: 4px;
}

.article-top-bar__tab-number {
  font-size: 12px;
  font-weight: 600;
  color: #202122;
  line-height: 1;
}

.article-top-bar__icon {
  width: 40px;
  height: 40px;
  padding: 10px;
  color: #202122;
}

/* ── Article content ── */
.article-content {
  flex: 1 1 auto;
  padding-bottom: calc(56px + env(safe-area-inset-bottom, 0px));
  padding-left:16px;
  padding-right:16px;
}

/* ── Bottom toolbar ── */
.article-bottom-bar {
  position: sticky;
  bottom: 0;
  z-index: 9;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: start;
  padding: 7px 0 calc(8px + env(safe-area-inset-bottom, 0px));
  background: #fff;
  border-top: 1px solid #eaecf0;
}

.article-bottom-bar__item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-height: 48px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #202122;
  cursor: pointer;
  font: inherit;
}

.article-bottom-bar__label {
  font-size: 10px;
  line-height: 1.2;
  color: #202122;
}

.article-bottom-bar__icon {
  display: block;
  width: 22px;
  height: 22px;
  background: #202122;
}

.article-bottom-bar__icon--save {
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2l7-3 7 3a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16-7-3-7 3V5h14v14z'/%3E%3C/svg%3E") center/contain no-repeat;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2l7-3 7 3a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16-7-3-7 3V5h14v14z'/%3E%3C/svg%3E") center/contain no-repeat;
}

.article-bottom-bar__icon--language {
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z'/%3E%3C/svg%3E") center/contain no-repeat;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z'/%3E%3C/svg%3E") center/contain no-repeat;
}

.article-bottom-bar__icon--find {
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/%3E%3C/svg%3E") center/contain no-repeat;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/%3E%3C/svg%3E") center/contain no-repeat;
}

.article-bottom-bar__icon--edit {
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/%3E%3C/svg%3E") center/contain no-repeat;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/%3E%3C/svg%3E") center/contain no-repeat;
}

.article-bottom-bar__icon--contents {
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M3 9h14V7H3v2zm0 4h14v-2H3v2zm0 4h14v-2H3v2zm16 0h2v-2h-2v2zm0-10v2h2V7h-2zm0 6h2v-2h-2v2z'/%3E%3C/svg%3E") center/contain no-repeat;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M3 9h14V7H3v2zm0 4h14v-2H3v2zm0 4h14v-2H3v2zm16 0h2v-2h-2v2zm0-10v2h2V7h-2zm0 6h2v-2h-2v2z'/%3E%3C/svg%3E") center/contain no-repeat;
}
</style>
