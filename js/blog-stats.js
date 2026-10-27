(() => {
  if (window.blogLegacyStatsInitialized) return
  window.blogLegacyStatsInitialized = true

  const api = 'https://busuanzi.ibruce.info/busuanzi'
  const keys = ['site_uv', 'site_pv', 'page_pv']
  const siteCacheKey = 'blog-legacy-busuanzi-site'
  const pageCachePrefix = 'blog-legacy-busuanzi-page:'
  let activeRequest
  let sequence = 0

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
          ? '旧统计服务暂时不可用'
          : '旧统计服务暂时不可用，显示上次读取的数值'
      } else {
        element.removeAttribute('title')
      }
    }
  }

  const updateStats = () => {
    activeRequest?.cancel()
    const path = window.location.pathname
    showValues(cachedValues(path), true)

    const callbackName = `BlogBusuanzi_${Date.now()}_${++sequence}`
    const script = document.createElement('script')
    let finished = false
    let timeout

    const cleanup = () => {
      clearTimeout(timeout)
      script.remove()
      delete window[callbackName]
      if (activeRequest?.name === callbackName) activeRequest = null
    }

    const fail = () => {
      if (finished) return
      finished = true
      cleanup()
      if (window.location.pathname === path) {
        showValues(cachedValues(path), true)
      }
    }

    activeRequest = {
      name: callbackName,
      cancel: () => {
        finished = true
        cleanup()
      }
    }

    window[callbackName] = data => {
      if (finished) return
      const values = Object.fromEntries(
        keys.map(key => [key, validCount(data?.[key])])
      )
      if (keys.some(key => values[key] === null)) {
        fail()
        return
      }

      finished = true
      cleanup()
      writeCache(siteCacheKey, {
        site_uv: values.site_uv,
        site_pv: values.site_pv
      })
      writeCache(pageCachePrefix + path, { page_pv: values.page_pv })
      if (window.location.pathname === path) showValues(values)
    }

    script.onerror = fail
    script.async = true
    script.referrerPolicy = 'no-referrer-when-downgrade'
    script.src = `${api}?jsonpCallback=${callbackName}`
    timeout = setTimeout(fail, 15000)
    document.head.appendChild(script)
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
