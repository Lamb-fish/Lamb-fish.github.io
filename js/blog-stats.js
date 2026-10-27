(() => {
  if (window.blogOffsetStatsInitialized) return
  window.blogOffsetStatsInitialized = true

  const api = 'https://busuanzi.9420.ltd/api'
  const start = { site_uv: 1104, site_pv: 2618 }
  const providerAtCutover = { site_uv: 2, site_pv: 3 }
  const keys = ['site_uv', 'site_pv', 'page_pv']
  const siteCacheKey = 'blog-offset-stats-site-v1'
  const pageCachePrefix = 'blog-offset-stats-page-v1:'
  let requestId = 0
  let controller

  const validCount = value => {
    if (value === null || value === undefined) return null
    const count = Number(value)
    return Number.isSafeInteger(count) && count >= 0 ? count : null
  }

  const readCache = key => {
    try { return JSON.parse(localStorage.getItem(key)) || {} } catch (_) { return {} }
  }

  const writeCache = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch (_) {}
  }

  const cachedValues = path => ({
    ...readCache(siteCacheKey),
    ...readCache(pageCachePrefix + path)
  })

  const showValues = (values, stale = false) => {
    for (const key of keys) {
      const element = document.getElementById(`busuanzi_value_${key}`)
      if (!element) continue

      const count = validCount(values[key])
      element.textContent = count === null ? '—' : String(count)
      if (stale) {
        element.title = count === null
          ? '统计服务暂时不可用'
          : '统计服务暂时不可用，显示上次读取的数值'
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
    const path = window.location.pathname
    showValues(cachedValues(path), true)

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

      const provider = {}
      for (const key of keys) {
        provider[key] = validCount(result.data[key])
        if (provider[key] === null) throw new Error(`Invalid ${key}`)
      }
      if (currentRequest !== requestId) return

      const values = {
        site_uv: start.site_uv + Math.max(0, provider.site_uv - providerAtCutover.site_uv),
        site_pv: start.site_pv + Math.max(0, provider.site_pv - providerAtCutover.site_pv),
        page_pv: provider.page_pv
      }
      const identity = response.headers.get('Set-Bsz-Identity')
      if (identity) {
        try { localStorage.setItem('bsz-id', identity) } catch (_) {}
      }

      writeCache(siteCacheKey, { site_uv: values.site_uv, site_pv: values.site_pv })
      writeCache(pageCachePrefix + path, { page_pv: values.page_pv })
      showValues(values)
    } catch (error) {
      if (currentRequest === requestId) {
        console.warn('Blog statistics failed:', error)
        showValues(cachedValues(path), true)
      }
    } finally {
      clearTimeout(timeout)
    }
  }

  document.addEventListener('pjax:complete', updateStats)
  window.addEventListener('pageshow', event => {
    if (event.persisted) updateStats()
  })
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateStats, { once: true })
  } else {
    updateStats()
  }
})()
