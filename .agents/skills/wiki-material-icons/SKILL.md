---
name: wiki-material-icons
description: How to source SVG icons from the Wikimedia Android app icon set (icon-svgs), keep licensing/provenance intact, and use them safely in mockups when Codex icons do not cover a case.
license: MIT
---

# Wikipedia Android Material icons

Use this skill when you need an icon from the Wikimedia Android app icon
set at:

- <https://github.com/wikimedia/apps-android-wikipedia/tree/main/icon-svgs>

This is a **fallback path**. In Wikimedia product UIs, use Codex icons
first. Reach for this set only when:

- a required glyph does not exist in `@wikimedia/codex-icons`, or
- you are matching an Android-specific mockup that depends on these
  exact icon shapes.

## Licensing and provenance

The Android app repository is licensed under Apache 2.0 (see `COPYING` in
that repo). Reusing icons is generally allowed with attribution and
license compliance.

When you import icons, keep these rules:

- Pin a commit SHA (avoid floating `main` in production-like mockups).
- Preserve original filenames where possible.
- Keep a local manifest of source URL + commit + date.
- Include Apache 2.0 license text in your project if you redistribute.
- Do not imply Wikimedia trademark endorsement.

## Quick workflow

1. Search the source folder and pick icons.
2. Copy SVG files into your project assets.
3. Record provenance in `icons-manifest.json` (or similar).
4. Use icons in your mockup components.
5. Re-check Codex before shipping any long-lived UI.

## Fetch selected icons (script template)

Use this shell snippet pattern in your own repo scripts:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Pin a commit for reproducibility.
COMMIT="e427acc"
BASE="https://raw.githubusercontent.com/wikimedia/apps-android-wikipedia/${COMMIT}/icon-svgs"
OUT_DIR="public/assets/wiki-material-icons"

mkdir -p "$OUT_DIR"

# Add filenames that exist in icon-svgs/.
icons=(
  "ic_search_white_24dp.svg"
  "ic_edit_white_24dp.svg"
  "ic_more_vert_white_24dp.svg"
)

for icon in "${icons[@]}"; do
  curl -fsSL "$BASE/$icon" -o "$OUT_DIR/$icon"
  echo "fetched: $icon"
done
```

## Mockup usage (Vue)

This pattern works well for quick visual prototypes.

```vue
<script setup lang="ts">
const icons = {
  search: '/assets/wiki-material-icons/ic_search_white_24dp.svg',
  edit: '/assets/wiki-material-icons/ic_edit_white_24dp.svg',
  overflow: '/assets/wiki-material-icons/ic_more_vert_white_24dp.svg'
}
</script>

<template>
  <div class="toolbar">
    <button class="icon-btn" aria-label="Search">
      <img :src="icons.search" alt="" width="20" height="20" />
    </button>
    <button class="icon-btn" aria-label="Edit">
      <img :src="icons.edit" alt="" width="20" height="20" />
    </button>
    <button class="icon-btn" aria-label="More actions">
      <img :src="icons.overflow" alt="" width="20" height="20" />
    </button>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color-base, #a2a9b1);
  border-radius: 18px;
  background: var(--background-color-base, #fff);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
```

Accessibility notes:

- If the button has a visible text label, icon `alt` should stay empty.
- If the icon is the only visible label, put meaning in `aria-label`.
- Keep touch targets at least 36x36 in dense toolbars, 44x44 for mobile.

## Mockup usage (Codex component shell)

If your prototype uses Codex components, keep the UI shell in Codex and use
external SVG icons only where needed:

```vue
<script setup lang="ts">
import { CdxButton } from '@wikimedia/codex'

const androidShareIcon = '/assets/wiki-material-icons/ic_share_white_24dp.svg'
</script>

<template>
  <CdxButton aria-label="Share article" weight="quiet">
    <img :src="androidShareIcon" alt="" width="20" height="20" />
  </CdxButton>
</template>
```

## Validation checklist

- Icon exists in source repo and is fetched successfully.
- Manifest contains source URL, commit, and retrieval date.
- `aria-label` and/or visible label communicates action.
- No Codex icon equivalent was overlooked.

## See also

- [`codex-icons`](../codex-icons/SKILL.md) for default Wikimedia icon usage.
- [`codex-style-guide`](../codex-style-guide/SKILL.md) for icon and UX guidance.
- [`codex-usage`](../codex-usage/SKILL.md) for Codex-first composition.

## Inside ProtoWiki

Preferred default remains `@wikimedia/codex-icons`. Use this skill when a
prototype specifically needs Android app icon fidelity.
