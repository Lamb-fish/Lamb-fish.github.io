(() => {
  const qrMap = {
    'fa-weixin': {
      src: '/image/wechat-qr.jpg',
      alt: '微信二维码'
    },
    'fa-qq': {
      src: '/image/qq-qr.jpg',
      alt: 'QQ二维码'
    }
  }

  const setupSocialQr = () => {
    document.querySelectorAll('a.social-icon').forEach(anchor => {
      if (anchor.querySelector('.social-qr-popup')) return

      const icon = anchor.querySelector('i')
      if (!icon) return

      const iconConfig = Object.entries(qrMap).find(([className]) =>
        icon.classList.contains(className)
      )
      if (!iconConfig) return

      const [, qr] = iconConfig
      const popup = document.createElement('span')
      popup.className = 'social-qr-popup'

      const image = document.createElement('img')
      image.src = qr.src
      image.alt = qr.alt
      image.loading = 'lazy'

      popup.appendChild(image)
      anchor.appendChild(popup)
      anchor.classList.add('social-qr')

      const card = anchor.closest('.card-widget')
      if (card) card.classList.add('social-qr-card')

      anchor.setAttribute('aria-label', `${anchor.title || qr.alt}，悬停查看二维码`)

      anchor.addEventListener('click', event => {
        event.preventDefault()
      })
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSocialQr)
  } else {
    setupSocialQr()
  }

  document.addEventListener('pjax:complete', setupSocialQr)
})()
