(() => {
  const insertMusicCard = () => {
    // #body-wrap is replaced by Butterfly PJAX. Keep the iframe under body so
    // its browsing context and audio playback survive same-site navigation.
    if (document.querySelector('#persistent-music-player')) return

    const card = document.createElement('div')
    card.className = 'card-widget card-music'
    card.id = 'persistent-music-player'
    card.innerHTML = `
      <div class="item-headline">
        <i class="fas fa-music"></i>
        <span>音乐</span>
      </div>
      <iframe
        class="music-player-frame"
        title="网易云音乐播放器"
        src="https://music.163.com/outchain/player?type=2&id=1487620937&auto=0&height=66"
        frameborder="0"
        marginwidth="0"
        marginheight="0"
        loading="lazy"
        allow="autoplay">
      </iframe>
    `

    document.body.appendChild(card)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insertMusicCard)
  } else {
    insertMusicCard()
  }
})()
