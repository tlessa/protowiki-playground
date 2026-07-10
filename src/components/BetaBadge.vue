<script setup lang="ts">
interface Props {
  label?: string
  as?: 'span' | 'button'
  caret?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Beta',
  as: 'span',
  caret: true,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function onClick(event: MouseEvent): void {
  emit('click', event)
}
</script>

<template>
  <component
    :is="props.as"
    class="beta-badge"
    :type="props.as === 'button' ? 'button' : undefined"
    @click="onClick"
  >
    <slot>{{ props.label }}</slot><template v-if="props.caret"> ▾</template>
  </component>
</template>

<style scoped>
.beta-badge {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 4px 8px;
  border-radius: 100px;
  background: var(--progressive, #36C);
  color: #fff;
  font-family: var(--mobile-android-type-toolbar-font-family, sans-serif);
  font-size: 10px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: 0;
}

button.beta-badge {
  cursor: pointer;
}
</style>
