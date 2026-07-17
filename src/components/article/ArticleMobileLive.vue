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

// Walk text nodes in `container`, build a concatenated string, then return a
// Range that exactly spans `needle` within that string. Returns null if not found.
// Tries three strategies in order so minor Wikipedia typography differences
// (en/em dashes, non-breaking spaces) don't break the highlight:
//   1. Exact string match
//   2. Dash-normalized match (–/— → -)
//   3. Fuzzy: locate start by first 6 words, locate end by last 5 words
function findTextRange(container: HTMLElement, needle: string): Range | null {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  const starts: number[] = []
  let full = ''
  let n: Text | null
  while ((n = walker.nextNode() as Text | null)) {
    starts.push(full.length)
    full += n.textContent ?? ''
    nodes.push(n)
  }

  const normD = (s: string) => s.replace(/[–— ]/g, (c) => c === ' ' ? ' ' : '-')

  function buildRange(startIdx: number, endIdx: number): Range | null {
    let startNode: Text | null = null, startOff = 0, endNode: Text | null = null, endOff = 0
    for (let i = 0; i < nodes.length; i++) {
      const len = nodes[i].textContent?.length ?? 0
      if (!startNode && startIdx < starts[i] + len) { startNode = nodes[i]; startOff = startIdx - starts[i] }
      if (!endNode && endIdx <= starts[i] + len) { endNode = nodes[i]; endOff = endIdx - starts[i] }
    }
    if (!startNode || !endNode) return null
    const range = document.createRange()
    range.setStart(startNode, startOff)
    range.setEnd(endNode, endOff)
    return range
  }

  // 1. Exact match
  let idx = full.indexOf(needle)
  if (idx !== -1) return buildRange(idx, idx + needle.length)

  // 2. Dash/NBSP-normalized match (indices stay valid — 1-to-1 substitution)
  idx = normD(full).indexOf(normD(needle))
  if (idx !== -1) return buildRange(idx, idx + needle.length)

  // 3. Fuzzy: anchor on first 6 words (start) and last 5 words (end)
  const words = needle.trim().split(/\s+/)
  const headText = words.slice(0, 6).join(' ')
  const tailText = words.slice(-5).join(' ')
  const nFull = normD(full)
  let headIdx = nFull.indexOf(normD(headText))
  if (headIdx === -1) return null
  let tailIdx = nFull.indexOf(normD(tailText), headIdx)
  if (tailIdx === -1) return null
  return buildRange(headIdx, tailIdx + tailText.length)
}

function applyMark(range: Range) {
  const mark = document.createElement('mark')
  mark.className = 'article-highlight'
  mark.style.cssText = 'background: #ffd966 !important; border-radius: 2px; padding: 0 1px;'
  try {
    // Fast path: works when the range doesn't partially contain any element node.
    range.surroundContents(mark)
  } catch {
    // surroundContents throws when an inline element (e.g. <a>, <sup>) is only
    // partially within the range. extractContents handles this by cloning boundary
    // nodes, so the mark still wraps exactly the right text.
    const frag = range.extractContents()
    mark.appendChild(frag)
    range.insertNode(mark)
  }
}

// Highlight the exact extract text inside `para`. Tries exact-text match first,
// then citation-based (for extracts like "...[58]: 43"), then whole-paragraph fallback.
function highlightParagraph(para: HTMLElement, extract: string) {
  // 1. Exact text match — finds precise start/end within any sentence
  const exactRange = findTextRange(para, extract.trim())
  if (exactRange) { try { applyMark(exactRange); return } catch { /* fall through */ } }

  // 2. Citation-based — wraps from paragraph start to the matching <sup>
  const citNum = firstCitationNum(extract)
  const endSup = citNum
    ? Array.from(para.querySelectorAll('sup')).find(s => s.textContent?.replace(/[\[\]\s]/g, '') === citNum)
    : null
  try {
    const range = document.createRange()
    range.setStart(para, 0)
    if (endSup) range.setEndAfter(endSup)
    else range.setEnd(para, para.childNodes.length)
    applyMark(range)
  } catch {
    para.style.cssText += '; background: #ffd966 !important; border-radius: 2px; padding: 2px 4px;'
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
  }, 100)
}

// If a <ul> immediately follows `para` and its first <li> text appears in
// the extract, highlight every <li> — handles articles like RNA where the
// intro sentence is a <p> and the bullet points are a sibling <ul>.
function highlightFollowingList(para: HTMLElement, extract: string) {
  const next = para.nextElementSibling
  if (next?.tagName !== 'UL') return
  const firstLi = next.querySelector('li')
  if (!firstLi) return
  const probe = firstLi.textContent?.trim().slice(0, 24).toLowerCase() ?? ''
  if (!probe || !extract.toLowerCase().includes(probe)) return
  next.querySelectorAll<HTMLElement>('li').forEach(li => {
    li.style.cssText += '; background: #ffd966 !important; border-radius: 2px; padding: 1px 2px;'
  })
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
  highlightFollowingList(para, extract)
  setTimeout(() => {
    const rect = para.getBoundingClientRect()
    window.scrollBy({ top: rect.top - 90, behavior: 'instant' })
  }, 100)
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
