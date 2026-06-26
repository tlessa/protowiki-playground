<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { CdxIcon } from '@wikimedia/codex'
import { useConfig } from '@/composables/useConfig'

interface Props {
  codexIcon: unknown
  materialIcon?: string
  iconLabel?: string
  size?: 'x-small' | 'small' | 'medium'
}

const props = withDefaults(defineProps<Props>(), {
  materialIcon: '',
  iconLabel: undefined,
  size: 'medium',
})

const { iconSet } = useConfig()
const materialFailed = ref(false)

watch(
  () => props.materialIcon,
  () => {
    materialFailed.value = false
  },
)

const showMaterial = computed(
  () =>
    iconSet.value === 'material' &&
    Boolean(props.materialIcon) &&
    !materialFailed.value,
)

const pixelSize = computed(() => {
  if (props.size === 'x-small') return 12
  if (props.size === 'small') return 16
  return 20
})

function onMaterialLoadError(): void {
  materialFailed.value = true
}
</script>

<template>
  <img
    v-if="showMaterial"
    class="app-icon app-icon--material"
    :src="props.materialIcon"
    :alt="props.iconLabel || ''"
    :width="pixelSize"
    :height="pixelSize"
    @error="onMaterialLoadError"
  />
  <CdxIcon v-else :icon="props.codexIcon" :size="props.size" :icon-label="props.iconLabel" />
</template>

<style scoped>
.app-icon--material {
  display: inline-block;
  inline-size: 1em;
  block-size: 1em;
  object-fit: contain;
  vertical-align: middle;
}
</style>
