<script setup lang="ts">
import { RouterLink } from 'vue-router'
import {
  cdxIconBell,
  cdxIconFunnel,
  cdxIconSearch,
  cdxIconTrash,
} from '@wikimedia/codex-icons'

definePage({
  meta: {
    title: 'Template: Mobile wireframe',
    description: 'Template for a mobile-first wireframe inside the phone preview shell.',
  },
})

import WireframeMobileWrapper from '@/components/WireframeMobileWrapper.vue'
import WireframeChromeWrapper from '@/components/chrome/WireframeChromeWrapper.vue'
import AppIcon from '@/components/AppIcon.vue'
import { MATERIAL_ICON_PATHS } from '@/lib/materialIconPaths'
import '@/styles/mobile-android/index.css'

interface HistoryEntry {
  title: string
  subtitle: string
  thumbnail?: 'normal' | 'text'
}

interface HistoryGroup {
  date: string
  entries: HistoryEntry[]
}

const historyGroups: HistoryGroup[] = [
  {
    date: 'Jun 16, 2026',
    entries: [
      {
        title: 'Ulalume',
        subtitle: 'Poem by Edgar Allan Poe',
        thumbnail: 'text',
      },
    ],
  },
  {
    date: 'Jun 15, 2026',
    entries: [
      {
        title: 'Stability',
        subtitle: 'Topics referred to by the same term',
      },
      {
        title: 'Cat',
        subtitle: 'Small domesticated carnivorous mammal',
        thumbnail: 'normal',
      },
      {
        title: 'Capsule hotel',
        subtitle: 'Japanese hotels with small bed-sized rooms',
        thumbnail: 'normal',
      },
    ],
  },
  {
    date: 'Jun 10, 2026',
    entries: [
      {
        title: 'Shr-Hwa International Tower',
        subtitle: 'Skyscraper in Kaohsiung, Taiwan',
        thumbnail: 'normal',
      },
    ],
  },
]
</script>

<template>
  <WireframeMobileWrapper>
    <!--Determine here which tab is active and determine if font is high-fidelity or wireframe-->
    <WireframeChromeWrapper
      active-tab="search"
      home-url="/example-search-experiment-v3-jump/community"
      search-url="/example-search-experiment-v3-jump/search"
      class="mobile-android-type mobile-android-type--wireframe"
    >
      <template #header>
        <header class="wireframe-tab-title" aria-label="Current tab title">
          <h1 class="mwf-android-type-h1-app-bar">Search</h1>
          <div class="wireframe-tab-title__notification" aria-hidden="true">
            <AppIcon
              :codex-icon="cdxIconBell"
              :material-icon="MATERIAL_ICON_PATHS.bell"
              class="wireframe-tab-title__notification-icon"
            />
            <span class="wireframe-tab-title__notification-badge">1</span>
          </div>
        </header>
      </template>

      <section class="search-surface">
        <div class="search-surface__search-field">
          <RouterLink
            to="/example-search-experiment-v3-jump/search/focused"
            class="search-surface__search-input-area"
            aria-label="Search Wikipedia"
          >
            <AppIcon
              :codex-icon="cdxIconSearch"
              :material-icon="MATERIAL_ICON_PATHS.search"
              class="search-surface__search-icon"
            />
            <span class="mwf-android-type-p search-surface__search-placeholder">Search Wikipedia</span>
          </RouterLink>
          <span class="search-surface__dive-divider" aria-hidden="true" />
          <RouterLink
            to="/example-search-experiment-v3-jump/search/dive-dedicated-field"
            class="search-surface__dive"
            aria-label="Dive"
          >
            <span class="search-surface__dive-icon">🤿</span>
            <span class="search-surface__dive-label">Dive</span>
          </RouterLink>
        </div>

        <section class="search-surface__history" aria-label="History">
          <header class="search-surface__history-header">
            <h2 class="mwf-android-type-h1-app-bar search-surface__history-title">History</h2>
            <div class="search-surface__history-actions" aria-hidden="true">
              <AppIcon
                :codex-icon="cdxIconFunnel"
                :material-icon="MATERIAL_ICON_PATHS.filter"
                class="search-surface__history-action-icon"
              />
              <AppIcon
                :codex-icon="cdxIconTrash"
                :material-icon="MATERIAL_ICON_PATHS.trash"
                class="search-surface__history-action-icon"
              />
            </div>
          </header>

          <div
            v-for="group in historyGroups"
            :key="group.date"
            class="search-surface__history-group"
          >
            <h3 class="mwf-android-type-h3 search-surface__history-date">{{ group.date }}</h3>

            <article
              v-for="entry in group.entries"
              :key="entry.title"
              class="search-surface__history-item"
            >
              <div class="search-surface__history-copy">
                <h4 class="mwf-android-type-p search-surface__history-item-title">{{ entry.title }}</h4>
                <p class="mwf-android-type-p search-surface__history-item-subtitle">{{ entry.subtitle }}</p>
              </div>

              <div
                v-if="entry.thumbnail"
                :class="[
                  'search-surface__history-thumb',
                  entry.thumbnail === 'text'
                    ? 'search-surface__history-thumb--text'
                    : 'search-surface__history-thumb--normal',
                ]"
                aria-hidden="true"
              />
            </article>
          </div>
        </section>
      </section>
    </WireframeChromeWrapper>
  </WireframeMobileWrapper>
</template>

<style scoped>
.wireframe-tab-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: calc(24px + env(safe-area-inset-top, 0px));
  z-index: 9;
  min-height: 56px;
  padding: 9px 24px 8px;
  background: #FFFFFF;
  border-bottom: 1px solid #eaecf0;
}

.wireframe-tab-title__notification {
  position: relative;
  width: 24px;
  height: 24px;
}

.wireframe-tab-title__notification-icon {
  position: absolute;
  inset: 2px;
  color: #101418;
}

.wireframe-tab-title__notification-badge {
  position: absolute;
  inset-inline-end: -5px;
  inset-block-start: -4px;
  min-width: 16px;
  height: 16px;
  padding: 0 5px;
  border-radius: 999px;
  background: #b32424;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
  text-align: center;
}

.search-surface {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 14px 24px 24px;
  background: #FFFFFF;
}

.search-surface__search-field {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 50px;
  padding: 0 18px;
  border-radius: 24px;
  background: #eceff2;
}

.search-surface__search-input-area {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #72777d;
  text-align: start;
}

.search-surface__search-icon {
  color: #72777d;
}

.search-surface__search-placeholder {
  color: #54595d;
}

.search-surface__dive-divider {
  width: 1px;
  height: 22px;
  background: #c8ccd1;
  flex-shrink: 0;
}

.search-surface__dive {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  color: #202122;
  text-decoration: none;
}

.search-surface__dive-icon {
  font-size: 16px;
  line-height: 1;
  display: inline-block;
  animation: icon-wiggle 0.6s ease 0.4s both;
  transform-origin: center;
}

@keyframes icon-wiggle {
  0%   { transform: rotate(0deg); }
  20%  { transform: rotate(-18deg); }
  40%  { transform: rotate(14deg); }
  60%  { transform: rotate(-10deg); }
  80%  { transform: rotate(6deg); }
  100% { transform: rotate(0deg); }
}

.search-surface__dive-label {
  font-family: var(--mobile-android-type-p-font-family);
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  color: #202122;
}

.search-surface__history {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-surface__history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search-surface__history-title {
  margin: 0;
}

.search-surface__history-actions {
  display: inline-flex;
  gap: 18px;
  align-items: center;
  color: #202122;
}

.search-surface__history-action-icon {
  width: 22px;
  height: 22px;
}

.search-surface__history-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-surface__history-date {
  margin: 0;
  color: #202122;
}

.search-surface__history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  min-height: 74px;
  padding: 8px 0;
}

.search-surface__history-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.search-surface__history-item-title {
  margin: 0;
  color: #202122;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-surface__history-item-subtitle {
  margin: 0;
  color: #54595d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-surface__history-thumb {
  flex: 0 0 auto;
  border-radius: 12px;
}

.search-surface__history-thumb--normal {
  width: 74px;
  height: 74px;
  background: linear-gradient(120deg, #d4d9df, #eceff2 58%, #cfd5dc);
}

.search-surface__history-thumb--text {
  width: 62px;
  height: 62px;
  background:
    linear-gradient(#b8bdc4 0 0) 12px 10px / 36px 3px,
    linear-gradient(#c5c9d0 0 0) 12px 18px / 36px 3px,
    linear-gradient(#c5c9d0 0 0) 12px 26px / 30px 3px,
    linear-gradient(#b8bdc4 0 0) 12px 34px / 36px 3px,
    linear-gradient(#c5c9d0 0 0) 12px 42px / 32px 3px,
    linear-gradient(120deg, #edeff2, #d4d9df);
  background-repeat: no-repeat;
  border-radius: 8px;
}

@media (min-width: 520px) {
  .search-surface {
    padding-inline: 28px;
  }

  .search-surface__history-item {
    min-height: 78px;
  }
}
</style>