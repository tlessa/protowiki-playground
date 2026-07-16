<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineProps<{
  trail: string
  highlight: string
  faded?: string
  contributors?: number
  references?: number
  thumbnailUrl?: string
}>()

defineEmits<{ click: [] }>()

const expanded = ref(false)
const isClamped = ref(false)
const highlightWrapRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const el = highlightWrapRef.value
  if (el) isClamped.value = el.scrollHeight > el.clientHeight
})
</script>

<template>
  <article
    class="semantic-result-card"
    v-bind="$attrs"
    @click="$emit('click')"
  >
    <div class="semantic-result-card__snippet">
      <div class="semantic-result-card__highlight-outer">
        <div
          ref="highlightWrapRef"
          class="semantic-result-card__highlight-wrap"
          :class="{ 'semantic-result-card__highlight-wrap--clamped': !expanded }"
        >
          <span class="mwf-android-type-p semantic-result-card__highlight">
            <span class="semantic-result-card__quote" aria-hidden="true">&#x201C;</span>{{ highlight }}
          </span>
        </div>
        <button
          v-if="isClamped && !expanded"
          class="semantic-result-card__expand"
          type="button"
          aria-label="Show more"
          @click.stop="expanded = true"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
      <span v-if="faded" class="mwf-android-type-p semantic-result-card__faded">{{ faded }}</span>
    </div>
    <div class="semantic-result-card__header">
      <span
        class="semantic-result-card__thumb"
        :style="thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}"
        aria-hidden="true"
      />
      <p class="mwf-android-type-small semantic-result-card__trail">{{ trail }}</p>
    </div>
    <div v-if="contributors !== undefined || references !== undefined" class="semantic-result-card__bottom">
      <span class="mwf-android-type-small semantic-result-card__meta-item">
        <svg class="semantic-result-card__meta-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><g clip-path="url(#src-contrib-clip)"><path d="M0.666504 13.3334V11.4667C0.666504 11.0889 0.763726 10.7417 0.958171 10.425C1.15262 10.1084 1.41095 9.86669 1.73317 9.70002C2.42206 9.35558 3.12206 9.09724 3.83317 8.92502C4.54428 8.7528 5.2665 8.66669 5.99984 8.66669C6.73317 8.66669 7.45539 8.7528 8.1665 8.92502C8.87762 9.09724 9.57762 9.35558 10.2665 9.70002C10.5887 9.86669 10.8471 10.1084 11.0415 10.425C11.2359 10.7417 11.3332 11.0889 11.3332 11.4667V13.3334H0.666504ZM12.6665 13.3334V11.3334C12.6665 10.8445 12.5304 10.375 12.2582 9.92502C11.9859 9.47502 11.5998 9.08891 11.0998 8.76669C11.6665 8.83335 12.1998 8.94724 12.6998 9.10835C13.1998 9.26947 13.6665 9.46669 14.0998 9.70002C14.4998 9.92224 14.8054 10.1695 15.0165 10.4417C15.2276 10.7139 15.3332 11.0111 15.3332 11.3334V13.3334H12.6665ZM4.1165 7.21669C3.59428 6.69446 3.33317 6.06669 3.33317 5.33335C3.33317 4.60002 3.59428 3.97224 4.1165 3.45002C4.63873 2.9278 5.2665 2.66669 5.99984 2.66669C6.73317 2.66669 7.36095 2.9278 7.88317 3.45002C8.40539 3.97224 8.6665 4.60002 8.6665 5.33335C8.6665 6.06669 8.40539 6.69446 7.88317 7.21669C7.36095 7.73891 6.73317 8.00002 5.99984 8.00002C5.2665 8.00002 4.63873 7.73891 4.1165 7.21669ZM11.8832 7.21669C11.3609 7.73891 10.7332 8.00002 9.99984 8.00002C9.87762 8.00002 9.72206 7.98613 9.53317 7.95835C9.34428 7.93058 9.18873 7.90002 9.0665 7.86669C9.3665 7.51113 9.59706 7.11669 9.75817 6.68335C9.91928 6.25002 9.99984 5.80002 9.99984 5.33335C9.99984 4.86669 9.91928 4.41669 9.75817 3.98335C9.59706 3.55002 9.3665 3.15558 9.0665 2.80002C9.22206 2.74446 9.37762 2.70835 9.53317 2.69169C9.68873 2.67502 9.84428 2.66669 9.99984 2.66669C10.7332 2.66669 11.3609 2.9278 11.8832 3.45002C12.4054 3.97224 12.6665 4.60002 12.6665 5.33335C12.6665 6.06669 12.4054 6.69446 11.8832 7.21669Z" fill="currentColor"/></g><defs><clipPath id="src-contrib-clip"><rect width="16" height="16" fill="white"/></clipPath></defs></svg>
        {{ contributors }} contributors
      </span>
      <span class="semantic-result-card__meta-dot" aria-hidden="true">·</span>
      <span class="mwf-android-type-small semantic-result-card__meta-item">
        <svg class="semantic-result-card__meta-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 5.1731L7.956 5.098L8 5.07221V5.1731ZM8 5.1731L12 12L14.2993 10.6527L10.256 3.75L8 5.07221V4H5.33333V12H8V5.1731ZM2 4V12H4.66667V4H2ZM4 10.6667H2.66667V10H4V10.6667ZM2.66667 8.66667H4V8H2.66667V8.66667ZM6 10.6667H7.33333V10H6V10.6667ZM7.33333 8.66667H6V8H7.33333V8.66667ZM13.0513 9.83867L11.9007 10.5133L11.5633 9.93867L12.7133 9.264L13.0513 9.83867ZM10.89 8.78733L12.04 8.11333L11.7033 7.538L10.5527 8.21267L10.89 8.78733Z" fill="currentColor"/></svg>
        {{ references }} references
      </span>
    </div>
  </article>
</template>

<style scoped>
.semantic-result-card {
  display: grid;
  gap: 10px;
  padding: 14px 12px 0;
  border-radius: 16px;
  border: 1px solid var(--proto-card-border);
  background: var(--proto-card-bg);
  overflow: hidden;
}

.semantic-result-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.semantic-result-card__thumb {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background:
    linear-gradient(var(--proto-card-thumb-line) 0 0) center 10px / 22px 2px,
    linear-gradient(var(--proto-card-thumb-line) 0 0) center 16px / 16px 2px,
    linear-gradient(120deg, var(--proto-card-thumb-grad-start), var(--proto-card-thumb-grad-end));
  background-repeat: no-repeat;
}

.semantic-result-card__trail {
  margin: 0;
  color: var(--proto-card-trail);
}

.semantic-result-card__snippet {
  display: grid;
  gap: 2px;
}

.semantic-result-card__highlight-outer {
  position: relative;
}

.semantic-result-card__highlight-wrap {
    margin-top: -32px;/* styles here apply whether clamped or not */
}
.semantic-result-card__highlight-wrap--clamped {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 6;
  line-clamp: 6;
  overflow: hidden;
  padding-right: 28px;
}

.semantic-result-card__highlight {
  display: inline;
  padding: 2px 4px;
  background: var(--proto-card-highlight-bg);
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  color: var(--proto-card-highlight-text);
}

.semantic-result-card__quote {
  position: relative;
  top: 40px;
  font-size: 4em;
  font-weight: 700;
  line-height: 1;
  color: var(--proto-card-quote);
  user-select: none;
}

.semantic-result-card__expand {
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: center;
  background: var(--proto-card-bg);
  border: none;
  padding: 1px 0 1px 6px;
  cursor: pointer;
  color: #3366cc;
  line-height: inherit;
}

.semantic-result-card__faded {
  display: block;
  margin: 0;
  color: var(--proto-card-faded);
}

.semantic-result-card__bottom {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  margin: 0 -12px;
  border-top: 1px solid var(--proto-card-bottom-border);
}

.semantic-result-card__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--proto-card-meta);
}

.semantic-result-card__meta-icon {
  flex-shrink: 0;
  color: var(--proto-card-meta);
}

.semantic-result-card__meta-dot {
  color: var(--proto-card-meta-dot);
}
</style>
