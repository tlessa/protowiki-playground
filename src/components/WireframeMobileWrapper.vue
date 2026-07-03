<script setup lang="ts">
interface Props {
  lang?: string
  dir?: 'ltr' | 'rtl'
  maxWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  lang: undefined,
  dir: undefined,
  maxWidth: '560px',
})
</script>

<template>
  <div class="wireframe-mobile-wrapper">
    <div
      class="wireframe-mobile-wrapper__column"
      :lang="props.lang"
      :dir="props.dir"
      :style="{ '--wireframe-mobile-max-width': props.maxWidth }"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.wireframe-mobile-wrapper {
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  padding: 0;
  background:
    radial-gradient(
      circle at top,
      var(--proto-shell-gradient-start),
      var(--proto-shell-gradient-mid) 42%,
      var(--proto-shell-gradient-end) 100%
    );
}

.wireframe-mobile-wrapper__column {
  box-sizing: border-box;
  width: min(100%, var(--wireframe-mobile-max-width, 560px));
  min-height: 100vh;
  margin-inline: auto;
  background-color: var(--proto-shell-column-bg);
}

@media (min-width: 480px) {
  .wireframe-mobile-wrapper {
    display: flex;
    align-items: stretch;
    justify-content: center;
    padding: 0 clamp(12px, 4vw, 40px);
  }

  .wireframe-mobile-wrapper__column {
    width: min(calc(100vw - clamp(24px, 8vw, 96px)), var(--wireframe-mobile-max-width, 560px));
    border: 1px solid var(--proto-shell-column-border);
  }
}

@media (min-width: 900px) {
  .wireframe-mobile-wrapper {
    padding-inline: clamp(32px, 10vw, 160px);
  }

  .wireframe-mobile-wrapper__column {
    width: min(calc(100vw - clamp(64px, 14vw, 240px)), var(--wireframe-mobile-max-width, 560px));
  }
}
</style>