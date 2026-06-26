<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie, { type AnimationItem } from 'lottie-web'

const props = withDefaults(defineProps<{
  src: string
  loop?: boolean
  autoplay?: boolean
}>(), {
  loop: true,
  autoplay: true,
})

const container = ref<HTMLDivElement | null>(null)
let anim: AnimationItem | null = null

onMounted(async () => {
  if (!container.value) return
  const data = await fetch(props.src).then(r => r.json())
  anim = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: props.loop,
    autoplay: props.autoplay,
    animationData: data,
  })
})

onBeforeUnmount(() => {
  anim?.destroy()
  anim = null
})
</script>

<template>
  <div ref="container" class="lottie-player" />
</template>

<style scoped>
.lottie-player {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
