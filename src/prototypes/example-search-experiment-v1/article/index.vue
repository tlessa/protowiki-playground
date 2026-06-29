<script setup lang="ts">
definePage({
  meta: {
    title: 'Example: Search Experiment v1 – Article (live)',
    description: "Article page loaded from live Wikipedia data, inside the article shell.",
  },
})

import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ArticleChromeWrapper from '@/components/chrome/ArticleChromeWrapper.vue'
import ArticleMobileLive from '@/components/article/ArticleMobileLive.vue'

const route = useRoute()
const article = computed(() => typeof route.query.article === 'string' ? route.query.article : 'cat')
const anchor = computed(() => typeof route.query.anchor === 'string' ? route.query.anchor : undefined)
const highlight = computed(() => typeof history.state?.highlight === 'string' ? history.state.highlight : undefined)

const showFeedback = ref(false)
const showToast = ref(false)

onMounted(() => {
  if (highlight.value) {
    setTimeout(() => { showFeedback.value = true }, 3000)
  }
})

function giveFeedback(_answer: 'yes' | 'no') {
  showFeedback.value = false
  setTimeout(() => {
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 3000)
  }, 200)
}
</script>

<template>
  <ArticleChromeWrapper>
    <ArticleMobileLive
      :article="article"
      :anchor="anchor"
      :highlight="highlight"
    />

    <Transition name="feedback-sheet">
      <div v-if="showFeedback" class="feedback-overlay" @click.self="showFeedback = false">
        <div class="feedback-sheet" role="dialog" aria-modal="true" aria-label="Feedback">
          <div class="feedback-sheet__handle" aria-hidden="true" />
          <p class="feedback-sheet__question">Did you find the information you were looking for?</p>
          <div class="feedback-sheet__actions">
            <button class="feedback-sheet__btn" type="button" @click="giveFeedback('yes')">
              Yes
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 22V11M2 13v7a2 2 0 002 2h11.17a2 2 0 001.96-1.6l1.54-7a2 2 0 00-1.96-2.4H14V5a3 3 0 00-3-3 1 1 0 00-1 1v.5L7.5 9.5A1 1 0 007 10.4V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="feedback-sheet__btn" type="button" @click="giveFeedback('no')">
              No
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M17 2v11m5-2V4a2 2 0 00-2-2H8.83a2 2 0 00-1.96 1.6l-1.54 7A2 2 0 007.29 13H10v4a3 3 0 003 3 1 1 0 001-1v-.5l2.5-4A1 1 0 0017 13.6V2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="toast">
      <div v-if="showToast" class="feedback-toast" role="status" aria-live="polite">
        <strong>Thanks for your feedback.</strong>
      </div>
    </Transition>
  </ArticleChromeWrapper>
</template>

<style scoped>
.feedback-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  pointer-events: all;
  z-index: 100;
  background: rgba(0, 0, 0, 0.32);
}

.feedback-sheet {
  pointer-events: all;
  width: min(100%, 560px);
  background: #fff;
  border-radius: 24px 24px 0 0;
  padding: 12px 24px 36px;
  box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feedback-sheet__handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: #c8ccd1;
  margin: 0 auto 4px;
}

.feedback-sheet__question {
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
  color: #202122;
}

.feedback-sheet__actions {
  display: flex;
  gap: 12px;
}

.feedback-sheet__btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border: 1.5px solid #c8ccd1;
  border-radius: 999px;
  background: #fff;
  color: #202122;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

.feedback-sheet__thanks {
  margin: 0;
  font-size: 16px;
  color: #54595d;
  text-align: center;
  padding: 8px 0;
}

/* Slide-up transition */
.feedback-sheet-enter-active {
  animation: sheet-up 0.28s cubic-bezier(0.05, 0.7, 0.1, 1.0);
}
.feedback-sheet-leave-active {
  animation: sheet-up 0.2s cubic-bezier(0.3, 0, 0.8, 0.15) reverse;
}
@keyframes sheet-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

/* Toast */
.feedback-toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: min(calc(100% - 32px), 528px);
  padding: 14px 16px;
  border-radius: 4px;
  background: #e0e0e0;
  color: #202122;
  font-size: 15px;
  z-index: 200;
  pointer-events: none;
}

.toast-enter-active { animation: toast-in 0.2s ease-out; }
.toast-leave-active { animation: toast-in 0.15s ease-in reverse; }
@keyframes toast-in {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}
</style>
