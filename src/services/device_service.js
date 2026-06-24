export async function initWebGPUDevice({ log = () => {} } = {}) {
  log('requesting WebGPU device…');
  const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
  if (!adapter) throw new Error('no WebGPU adapter (use a WebGPU-capable browser)');
  if (!navigator.gpu.wgslLanguageFeatures?.has('immediate_address_space'))
    throw new Error('WGSL immediate_address_space is not available (upgrade to Chrome 149+)');
  if (!adapter.features.has('subgroups'))
    throw new Error(
      'GPU lacks the required "subgroups" feature. The current fast WGSL kernels require subgroups and no fallback kernel set is bundled.',
    );
  const reqFeatures = ['subgroups'];
  if (adapter.features.has('shader-f16')) reqFeatures.push('shader-f16');
  const dev = await adapter.requestDevice({
    requiredFeatures: reqFeatures,
    requiredLimits: {
      maxBufferSize: adapter.limits.maxBufferSize,
      maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize,
      maxStorageBuffersPerShaderStage: adapter.limits.maxStorageBuffersPerShaderStage,
    },
  });
  dev.addEventListener?.('uncapturederror', (e) => console.error('GPUERR', e.error.message));
  log(`WebGPU ready. maxBuffer=${(Number(adapter.limits.maxBufferSize) / 1e9).toFixed(2)}GB`);
  return dev;
}
