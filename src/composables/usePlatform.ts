import { readonly, type Ref } from 'vue'
import { globalPlatform, type Platform } from '@/theme'

/**
 * Read-only access to the GLOBAL platform mode (the value on <html>, set at
 * boot from ?platform= URL param).
 *
 * - Returns a reactive Ref for the global value only.
 * - Does NOT mutate page state and does NOT reflect hypothetical subtree-only
 *   overrides.
 *
 * Use this when global platform state is needed for logic; for visuals, prefer
 * [data-platform] selectors in CSS.
 */
export function usePlatform(): Readonly<Ref<Platform>> {
  return readonly(globalPlatform)
}
