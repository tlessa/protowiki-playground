<script setup lang="ts">
defineProps<{
  trail: string
  highlight: string
  faded?: string
  contributors?: number
  references?: number
}>()

defineEmits<{ click: [] }>()
</script>

<template>
  <article
    class="semantic-result-card"
    v-bind="$attrs"
    @click="$emit('click')"
  >
    <div class="semantic-result-card__header">
      <span class="semantic-result-card__thumb" aria-hidden="true" />
      <p class="mwf-android-type-small semantic-result-card__trail">{{ trail }}</p>
    </div>
    <div class="semantic-result-card__snippet">
      <span class="mwf-android-type-p semantic-result-card__highlight">
        <span class="semantic-result-card__quote" aria-hidden="true">&#x201C;</span>{{ highlight }}
      </span>
      <span v-if="faded" class="mwf-android-type-p semantic-result-card__faded">{{ faded }}</span>
    </div>
    <div v-if="contributors !== undefined || references !== undefined" class="semantic-result-card__bottom">
      <span class="mwf-android-type-small semantic-result-card__meta-item">
        {{ contributors }} contributors
      </span>
      <span class="semantic-result-card__meta-dot" aria-hidden="true">·</span>
      <span class="mwf-android-type-small semantic-result-card__meta-item">
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

.semantic-result-card__quote {
  font-size: 2em;
  font-weight: 700;
  line-height: 0;
  vertical-align: -0.15em;
  color: var(--proto-card-quote);
  user-select: none;
}

.semantic-result-card__highlight {
  display: block;
  margin: 0;
  padding: 0 4px;
  background: var(--proto-card-highlight-bg);
  color: var(--proto-card-highlight-text);
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
  color: var(--proto-card-meta);
}

.semantic-result-card__meta-dot {
  color: var(--proto-card-meta-dot);
}
</style>
