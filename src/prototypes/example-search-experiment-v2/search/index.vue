<script setup lang="ts">
import { onMounted, ref } from 'vue'
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
  thumbnail?: 'normal' | 'text' | 'query'
}

interface HistoryGroup {
  date: string
  entries: HistoryEntry[]
}

const historyGroups = ref<HistoryGroup[]>([
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
])

onMounted(() => {
  const stored: { query: string; date: string }[] = JSON.parse(localStorage.getItem('v2_search_history') ?? '[]')
  for (const entry of [...stored].reverse()) {
    const group = historyGroups.value.find(g => g.date === entry.date)
    const item = { title: entry.query, subtitle: '', thumbnail: 'query' as const }
    if (group) {
      group.entries.unshift(item)
    } else {
      historyGroups.value.unshift({ date: entry.date, entries: [item] })
    }
  }
})
</script>

<template>
  <WireframeMobileWrapper>
    <!--Determine here which tab is active and determine if font is high-fidelity or wireframe-->
    <WireframeChromeWrapper
      active-tab="search"
      home-url="/example-search-experiment-v2/home"
      search-url="/example-search-experiment-v2/search"
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
        <RouterLink
          to="/example-search-experiment-v2/search/focused"
          class="search-surface__search-field"
          aria-label="Search Wikipedia"
        >
          <AppIcon
            :codex-icon="cdxIconSearch"
            :material-icon="MATERIAL_ICON_PATHS.search"
            class="search-surface__search-icon"
          />
          <span class="mwf-android-type-p search-surface__search-placeholder">Search Wikipedia</span>
          <span class="search-surface__mic" aria-hidden="true" />
        </RouterLink>

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
                v-if="entry.thumbnail === 'query'"
                class="search-surface__history-thumb search-surface__history-thumb--query"
                aria-hidden="true"
              >
                <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                  <text x="1" y="31" font-size="32" font-family="Georgia,serif" font-weight="900" fill="#1a1a1a">&#x201C;</text>
                  <rect x="15" y="13" width="29" height="5.5" rx="2.75" fill="#f5c518"/>
                  <rect x="15" y="21.5" width="29" height="5.5" rx="2.75" fill="#f5c518"/>
                  <rect x="15" y="30" width="21" height="5.5" rx="2.75" fill="#f5c518"/>
                  <circle cx="30" cy="23" r="10" fill="#1a1a1a"/>
                  <circle cx="30" cy="23" r="6" fill="#e8eaed"/>
                  <line x1="37" y1="30" x2="43" y2="37" stroke="#1a1a1a" stroke-width="4.5" stroke-linecap="round"/>
                </svg>
              </div>
              <div
                v-else-if="entry.thumbnail"
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
  min-height: var(--mobile-android-size-section-header-height);
  padding: 9px 24px 8px;
  background: #FFFFFF;
  border-bottom: 1px solid #eaecf0;
}

.wireframe-tab-title__notification {
  position: relative;
  width: var(--mobile-android-size-icon);
  height: var(--mobile-android-size-icon);
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
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 50px;
  padding: 0 18px;
  border: 0;
  border-radius: 24px;
  background: #eceff2;
  color: #72777d;
  text-decoration: none;
  text-align: start;
}

.search-surface__search-icon {
  color: #72777d;
}

.search-surface__search-placeholder {
  color: #54595d;
}

.search-surface__mic {
  position: relative;
  width: 10px;
  height: 18px;
  border: 2px solid #72777d;
  border-radius: 999px;
  border-bottom: 0;
}

.search-surface__mic::before,
.search-surface__mic::after {
  content: '';
  position: absolute;
  inset-inline-start: 50%;
  transform: translateX(-50%);
}

.search-surface__mic::before {
  inset-block-end: -7px;
  width: 10px;
  height: 6px;
  border: 2px solid #72777d;
  border-top: 0;
  border-radius: 0 0 999px 999px;
}

.search-surface__mic::after {
  inset-block-end: -11px;
  width: 2px;
  height: 5px;
  background: #72777d;
  border-radius: 999px;
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

.search-surface__history-thumb--query {
  width: 62px;
  height: 62px;
  background: #eaecf0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  box-sizing: border-box;
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