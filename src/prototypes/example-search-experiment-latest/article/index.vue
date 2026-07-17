<script setup lang="ts">
definePage({
  meta: {
    title: 'Example: Search Experiment v2 – Article (live)',
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
const thumbRating = ref<'up' | 'down' | null>(null)
const feedbackText = ref('')

onMounted(() => {
  if (highlight.value && sessionStorage.getItem('latest_article_feedback_shown') !== '1') {
    setTimeout(() => {
      sessionStorage.setItem('latest_article_feedback_shown', '1')
      showFeedback.value = true
    }, 3000)
  }
})

function submitFeedback() {
  showFeedback.value = false
  thumbRating.value = null
  feedbackText.value = ''
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
          <div class="feedback-sheet__top-row">
            <p class="feedback-sheet__question">Did you find what you were looking for?</p>
            <div class="feedback-sheet__thumbs">
              <button
                type="button"
                class="feedback-sheet__thumb-btn"
                :class="{ 'feedback-sheet__thumb-btn--active': thumbRating === 'up' }"
                aria-label="Yes"
                @click="thumbRating = thumbRating === 'up' ? null : 'up'"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M7 22V11M2 13v7a2 2 0 002 2h11.17a2 2 0 001.96-1.6l1.54-7a2 2 0 00-1.96-2.4H14V5a3 3 0 00-3-3 1 1 0 00-1 1v.5L7.5 9.5A1 1 0 007 10.4V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button
                type="button"
                class="feedback-sheet__thumb-btn"
                :class="{ 'feedback-sheet__thumb-btn--active': thumbRating === 'down' }"
                aria-label="No"
                @click="thumbRating = thumbRating === 'down' ? null : 'down'"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M17 2v11m5-2V4a2 2 0 00-2-2H8.83a2 2 0 00-1.96 1.6l-1.54 7A2 2 0 007.29 13H10v4a3 3 0 003 3 1 1 0 001-1v-.5l2.5-4A1 1 0 0017 13.6V2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          <p class="feedback-sheet__details-label">Add more details here (optional)</p>
          <textarea v-model="feedbackText" class="feedback-sheet__textarea" rows="4" />
          <button type="button" class="feedback-sheet__submit" @click="submitFeedback">Submit</button>
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

.feedback-sheet__top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.feedback-sheet__question {
  margin: 0;
  font-size: 16px;
  line-height: 1.4;
  color: #202122;
  flex: 1;
}

.feedback-sheet__thumbs {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.feedback-sheet__thumb-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1.5px solid #c8ccd1;
  background: #fff;
  color: #54595d;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.feedback-sheet__thumb-btn--active {
  border-color: #3366cc;
  color: #3366cc;
  background: #eaf0fb;
}

.feedback-sheet__details-label {
  margin: 0;
  font-size: 15px;
  color: #202122;
}

.feedback-sheet__textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1.5px solid #c8ccd1;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 15px;
  font-family: inherit;
  color: #202122;
  resize: none;
  outline: none;
}

.feedback-sheet__textarea:focus {
  border-color: #3366cc;
}

.feedback-sheet__submit {
  align-self: center;
  padding: 12px 32px;
  border: 1.5px solid #c8ccd1;
  border-radius: 999px;
  background: #fff;
  color: #202122;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
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
