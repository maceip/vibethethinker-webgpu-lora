// f16_vs_f32_diff.js
// Phase 3 eval harness stub (per OPTIMIZATION_PLAN.md).
// Usage (in browser console or via test runner that loads this):
//   import('./test/f16_vs_f32_diff.js').then(m => m.runF16Diff())
// Expects a global `rt` (QwenWGPU instance) or will create one.
//
// What it does:
// - Runs a short forward (embed + first layer rms/rope/add/silu) with f16=off then f16=on.
// - Captures a slice of the activation (e.g. after rms or after silu) or final logits if accessible.
// - Reports max-abs-diff + relative diff between the two runs.
// - For full end-to-end: use the same prompt, greedy decode a few tokens and compare token ids.
//
// This is intentionally lightweight; wire it to your existing deep_kernel_diff / validate harnesses
// for "real" numbers. Goal: document tolerance and ensure f16 path stays within spec.

import { QwenWGPU } from '../src/qwgpu/runtime.js';
import { QWEN25_3B } from '../src/config.js';

export async function runF16Diff(opts = {}) {
  const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
  const dev = await adapter.requestDevice({
    requiredFeatures: ['subgroups'],
    requiredLimits: { /* ... copy from other tests if needed */ }
  });

  const rt = new QwenWGPU(dev, QWEN25_3B, { onProgress: () => {} });
  await rt.build();

  const prompt = opts.prompt || 'The quick brown fox';
  const useF16 = rt.hasF16;

  if (!useF16) {
    console.warn('[f16_diff] shader-f16 not available on this device; f32 path only.');
    return { skipped: true };
  }

  // Toggle and capture a proxy signal.
  // For a real harness, hook into internal step() or embed + first transformer block and snapshot a buffer.
  // Here we just demonstrate the toggle and a trivial "forward" via public API if exposed.

  rt.setUseF16(false);
  const off = await rt.embedRow(/* token id or prompt tokenization handled upstream */ 42); // placeholder

  rt.setUseF16(true);
  const on = await rt.embedRow(42); // placeholder; real impl would run full layer stack

  // Real implementation sketch:
  //   - tokenize prompt
  //   - run prefill or single step with rt.setUseF16(false) → read back hidden or logits slice
  //   - repeat with true
  //   - compute diff

  console.log('[f16_diff] toggle works, hasF16=', rt.hasF16, 'usingF16 now=', rt.usingF16());
  console.log('[f16_diff] stub complete. Wire to real forward for numeric diff (maxAbs, rel, token parity).');

  return { hasF16: true, note: 'stub; implement real capture in harness' };
}

// Auto-run hook for convenience in some test loaders:
if (typeof window !== 'undefined') {
  window.runF16Diff = runF16Diff;
}
