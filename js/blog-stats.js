(() => {
  if (window.blogStatsInitialized) return
  window.blogStatsInitialized = true

  const api = 'https://busuanzi.9420.ltd/api'
  const keys = ['site_uv', 'site_pv', 'page_pv']
  let requestId = 0
  let controller

  const showValues = (values, failed = false) => {
    for (const key of keys) {
      const element = document.getElementById(`busuanzi_value_${key}`)
      if (!element) continue

      element.textContent = values?.[key] ?? '—'
      if (failed) {
        element.title = '统计服务暂时不可用'
      } else {
        element.removeAttribute('title')
      }
    }
  }

  const updateStats = async () => {
    const currentRequest = ++requestId
    controller?.abort()
    const currentController = new AbortController()
    controller = currentController
    const timeout = setTimeout(() => currentController.abort(), 8000)

    const headers = { 'x-bsz-referer': window.location.href }
    try {
      const identity = localStorage.getItem('bsz-id')
      if (identity) headers.Authorization = `Bearer ${identity}`
    } catch (_) {}

    try {
      const response = await fetch(api, {
        method: 'POST',
        headers,
        signal: currentController.signal
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const result = await response.json()
      if (result.success !== true || !result.data) {
        throw new Error('Invalid statistics response')
      }

      const values = {}
      for (const key of keys) {
        const value = Number(result.data[key])
        if (!Number.isFinite(value) || value < 0) {
          throw new Error(`Invalid ${key}`)
        }
        values[key] = String(value)
      }

      if (currentRequest !== requestId) return

      const identity = response.headers.get('Set-Bsz-Identity')
      if (identity) {
        try { localStorage.setItem('bsz-id', identity) } catch (_) {}
      }
      showValues(values)
    } catch (error) {
      if (currentRequest === requestId) {
        console.warn('Blog statistics failed:', error)
        showValues(null, true)
      }
    } finally {
      clearTimeout(timeout)
    }
  }

  document.addEventListener('pjax:complete', updateStats)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateStats, { once: true })
  } else {
    updateStats()
  }
})()
