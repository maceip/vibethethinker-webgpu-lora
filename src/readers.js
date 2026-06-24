// tf-free range readers used by the WebGPU runtime loader. A reader is
// { range(path,start,end)->ArrayBuffer, text(path)->string }.

/** Range reader over a base URL (server must support HTTP Range). `headers` is
 *  merged into every request — e.g. { Authorization: 'Bearer hf_...' } for HF. */
export function urlReader(baseUrl, headers = {}) {
  const base = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
  return {
    async range(path, start, end) {
      const r = await fetch(base + path, { headers: { ...headers, Range: `bytes=${start}-${end - 1}` } });
      if (!r.ok && r.status !== 206) throw new Error(`range ${path} ${start}-${end}: ${r.status}`);
      return await r.arrayBuffer();
    },
    async text(path) {
      const r = await fetch(base + path, { headers });
      if (!r.ok) throw new Error(`fetch ${path}: ${r.status}`);
      return await r.text();
    },
  };
}

/** Reader over a Hugging Face repo: streams files from the resolve endpoint
 *  (CORS-enabled, Range-capable). `token` is optional (gated/private repos). */
export function hfReader(repo, token = '', rev = 'main') {
  return urlReader(`https://huggingface.co/${repo}/resolve/${rev}`, token ? { Authorization: `Bearer ${token}` } : {});
}

/** Range reader over BYO File objects (drag/drop / directory picker). */
export function fileReader(fileMap) {
  const pick = (path) => fileMap[path] || fileMap[path.split('/').pop()];
  return {
    async range(path, start, end) {
      const f = pick(path);
      if (!f) throw new Error(`file not provided: ${path}`);
      return await f.slice(start, end).arrayBuffer();
    },
    async text(path) {
      const f = pick(path);
      if (!f) throw new Error(`file not provided: ${path}`);
      return await f.text();
    },
  };
}
