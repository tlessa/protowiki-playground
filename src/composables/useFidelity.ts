import { readonly, type Ref } from 'vue'
import { globalFidelity, type Fidelity } from '@/theme'

/**
 * Read-only access to the GLOBAL fidelity mode (the value on <html>, set at boot
 * from ?fidelity= URL param).
 *
 * - Returns a reactive Ref for the global value only.
 * - Does NOT mutate page state and does NOT reflect hypothetical subtree-only
 *   overrides.
 *
 * Use this when global fidelity state is needed for logic; for visuals, prefer
 * [data-fidelity] selectors in CSS.
 */
export function useFidelity(): Readonly<Ref<Fidelity>> {
  return readonly(globalFidelity)
}
