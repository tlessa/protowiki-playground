# Mockup workflow with wiki-material-icons

This reference is the practical, repeatable recipe for prototype routes.

## 1. Add icon files

Use the skill's fetch script pattern to place icons in:

- `public/assets/wiki-material-icons/`

Use a pinned commit from apps-android-wikipedia for reproducibility.

## 2. Create a route-level icon map

In your prototype route file, keep one object for icon paths:

```ts
const icons = {
  save: '/assets/wiki-material-icons/ic_done_white_24dp.svg',
  close: '/assets/wiki-material-icons/ic_close_white_24dp.svg'
}
```

## 3. Render icons in controls

Use `<img>` for the icon and put semantics on the interactive control:

```vue
<CdxButton aria-label="Save changes" action="progressive" weight="primary">
  <img :src="icons.save" alt="" width="20" height="20" />
</CdxButton>
```

## 4. Keep visual consistency

- Match icon size to nearby Codex icons (usually 20px).
- Keep button spacing and focus states from Codex components.
- Avoid mixing multiple icon families in one toolbar unless intentional.

## 5. Track provenance

Maintain a small JSON file in your repo with source metadata:

```json
{
  "ic_done_white_24dp.svg": {
    "source": "https://github.com/wikimedia/apps-android-wikipedia/tree/main/icon-svgs",
    "commit": "e427acc",
    "retrieved": "2026-06-24"
  }
}
```

This makes updates and legal review straightforward.
