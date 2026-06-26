<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { CdxMessage, CdxProgressBar } from '@wikimedia/codex'
import { wikimediaApiFetchHeaders } from '@/config'

interface Props {
  article: string
  host?: string
  anchor?: string
  highlight?: string
}

const props = withDefaults(defineProps<Props>(), {
  host: 'en.wikipedia.org',
  anchor: undefined,
  highlight: undefined,
})

const html = ref<string | null>(null)
const leadImage = ref<string | null>(null)
const error = ref<string | null>(null)
const loading = ref(false)
const bodyEl = ref<HTMLDivElement | null>(null)

const cache = new Map<string, { body: string; leadImage: string | null }>()

// Inject PCS stylesheets once per host into <head> so they don't duplicate
const injectedHosts = new Set<string>()
function injectPcsStyles(host: string) {
  if (injectedHosts.has(host)) return
  injectedHosts.add(host)
  const sheets = [
    'https://meta.wikimedia.org/api/rest_v1/data/css/mobile/base',
    `https://${host}/api/rest_v1/data/css/mobile/site`,
    'https://meta.wikimedia.org/api/rest_v1/data/css/mobile/pcs',
  ]
  for (const href of sheets) {
    if (document.querySelector(`link[href="${href}"]`)) continue
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
  }
}

// PCS lazy-loads images as <span data-src="..."> — convert to real <img>
function hydrateLazyImages(container: HTMLElement) {
  container.querySelectorAll<HTMLElement>('.pcs-lazy-load-placeholder').forEach((span) => {
    const src = span.dataset.src
    if (!src) return
    const img = document.createElement('img')
    img.src = src.startsWith('//') ? `https:${src}` : src
    if (span.dataset.srcset) img.srcset = span.dataset.srcset.replace(/\/\//g, 'https://')
    if (span.dataset.height) img.height = Number(span.dataset.height)
    if (span.dataset.width) img.width = Number(span.dataset.width)
    img.decoding = 'async'
    img.className = span.className.replace('pcs-lazy-load-placeholder', '').trim()
    span.replaceWith(img)
  })
}

// PCS collapses all sections after the lead — expand them all
function expandAllSections(container: HTMLElement) {
  container.querySelectorAll<HTMLElement>('section[data-mw-section-id]').forEach((section) => {
    section.style.display = ''
  })
}

// Read the first [N] citation from an extract string, e.g. "[58]" → "58".
function firstCitationNum(extract: string): string | null {
  const match = extract.match(/\[(\d+)\]/)
  return match ? match[1] : null
}

// Wrap the start of a paragraph in a <mark> up to (and including) the <sup>
// that matches the last citation in the extract. Falls back to the whole paragraph.
function highlightParagraph(para: HTMLElement, extract: string) {
  const citNum = firstCitationNum(extract)
  const sups = Array.from(para.querySelectorAll('sup'))
  const endSup = citNum
    ? sups.find(s => s.textContent?.replace(/[\[\]\s]/g, '') === citNum)
    : null
  try {
    const range = document.createRange()
    range.setStart(para, 0)
    if (endSup) range.setEndAfter(endSup)
    else range.setEnd(para, para.childNodes.length)
    const mark = document.createElement('mark')
    mark.className = 'article-highlight'
    range.surroundContents(mark)
  } catch {
    para.style.background = '#ece7a5'
  }
}

// Scroll to a section by its Wikipedia anchor ID and highlight the passage.
function scrollToAnchor(container: HTMLElement, anchor: string, extract?: string) {
  const heading = container.querySelector(`[id="${anchor}"]`)
  if (!heading) return
  const section = heading.closest('section') ?? heading.parentElement
  section?.querySelectorAll('figure').forEach(f => f.remove())
  const allParas = section ? Array.from(section.querySelectorAll('p')) : []
  const bodyPara = allParas.find(p => !p.closest('table'))
  const target = bodyPara ?? heading
  if (bodyPara && extract) highlightParagraph(bodyPara, extract)
  setTimeout(() => {
    const rect = target.getBoundingClientRect()
    window.scrollBy({ top: rect.top - 90, behavior: 'instant' })
  }, 2000)
}

// For articles with no anchor (e.g. Night vision lead): find the paragraph
// whose text contains the start of the extract, highlight it, and scroll to it.
function scrollToExtract(container: HTMLElement, extract: string) {
  const needle = extract.trim().split(/\s+/).slice(0, 6).join(' ').toLowerCase()
  const allParas = Array.from(container.querySelectorAll('p'))
  const para = allParas.find(
    p => !p.closest('figure') && !p.closest('table') && p.textContent?.toLowerCase().includes(needle)
  )
  if (!para) return
  highlightParagraph(para, extract)
  setTimeout(() => {
    const rect = para.getBoundingClientRect()
    window.scrollBy({ top: rect.top - 90, behavior: 'instant' })
  }, 2000)
}

function extractLeadImage(rawHtml: string): string | null {
  const match = rawHtml.match(/<meta[^>]+property="mw:leadImage"[^>]+content="([^"]+)"/)
  if (!match) return null
  const src = match[1]
  return src.startsWith('//') ? `https:${src}` : src
}

async function fetchArticle(title: string) {
  const key = `${props.host}\0${title}`
  const cached = cache.get(key)
  if (cached) {
    html.value = cached.body
    leadImage.value = cached.leadImage
    await nextTick()
    if (bodyEl.value) {
      hydrateLazyImages(bodyEl.value)
      expandAllSections(bodyEl.value)
      if (props.anchor) scrollToAnchor(bodyEl.value, props.anchor, props.highlight)
      else if (props.highlight) scrollToExtract(bodyEl.value, props.highlight)
    }
    return
  }

  loading.value = true
  error.value = null
  html.value = null
  leadImage.value = null

  try {
    injectPcsStyles(props.host)

    const url = `https://${props.host}/api/rest_v1/page/mobile-html/${encodeURIComponent(title)}`
    const res = await fetch(url, {
      headers: {
        Accept: 'text/html; charset=utf-8',
        ...wikimediaApiFetchHeaders('page-mobile-html'),
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
    const text = await res.text()
    const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    const body = bodyMatch ? bodyMatch[1] : text
    const imgSrc = extractLeadImage(text)
    cache.set(key, { body, leadImage: imgSrc })
    html.value = body
    leadImage.value = imgSrc
    await nextTick()
    if (bodyEl.value) {
      hydrateLazyImages(bodyEl.value)
      expandAllSections(bodyEl.value)
      if (props.anchor) scrollToAnchor(bodyEl.value, props.anchor, props.highlight)
      else if (props.highlight) scrollToExtract(bodyEl.value, props.highlight)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.host, props.article] as const,
  ([, article]) => { if (article) void fetchArticle(article) },
  { immediate: true },
)
</script>

<template>
  <div class="article-mobile-live">
    <CdxProgressBar v-if="loading" inline aria-label="Loading article" />

    <CdxMessage v-if="error" type="error" :allow-user-dismiss="false">
      Couldn't load this article: {{ error }}
    </CdxMessage>

    <img
      v-if="leadImage"
      :src="leadImage"
      class="article-mobile-live__hero"
      alt=""
      aria-hidden="true"
    />

    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-if="html" ref="bodyEl" class="article-mobile-live__body" v-html="html" />
  </div>
</template>

<style scoped>
.article-mobile-live {
  overflow: hidden;
}

.article-mobile-live__hero {
  display: block;
  width: 100%;
  max-height: 280px;
  object-fit: cover;
  object-position: center top;
}

.article-mobile-live__body {
  overflow-x: hidden;
}

.article-mobile-live__body :deep(.article-highlight) {
  background: #ffd966;
  border-radius: 2px;
  padding: 0 1px;
}
</style>
