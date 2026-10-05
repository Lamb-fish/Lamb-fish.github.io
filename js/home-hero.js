(function () {
  "use strict";

  const QUOTES = [
    "不用厌恶泪水，那是上天赐我感知世界的心",
    "向前走，别回头",
    "你和别人不一样，不要迷茫",
    "我的思绪也会拆解、规划、执行，那我也是 Agent 吗？",
    "Nothing but yourself.",
    "不管再来多少次，我都会站在那里，让命运看见",
    "我仍旧向命运展示我的稚气或单薄，但靠近我，就能见识到我雁过留痕的锋利与打破偏见的决心",
    "我的偏爱也会掠过万千杂音，只萃取出心底最真切的悸动，那我也是池化吗？",
    "天地辽阔，容得下生命的每条褶皱",
    "别把我困在傲慢的偏见里，我会是打破牢笼的自由鸟",
    "看见别人幸福也会忍不住流泪吗"
  ];

  const LAST_QUOTE_KEY = "blog-last-home-quote";
  const REDUCED_MOTION = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function pickQuote() {
    let lastQuote = "";

    try {
      lastQuote = sessionStorage.getItem(LAST_QUOTE_KEY) || "";
    } catch (error) {}

    const candidates = QUOTES.filter((quote) => quote !== lastQuote);
    const pool = candidates.length ? candidates : QUOTES;
    const quote = pool[Math.floor(Math.random() * pool.length)];

    try {
      sessionStorage.setItem(LAST_QUOTE_KEY, quote);
    } catch (error) {}

    return quote;
  }

  function createQuoteElement(siteInfo, siteTitle) {
    let quoteElement = siteInfo.querySelector("#home-random-quote");

    if (quoteElement) {
      return quoteElement;
    }

    quoteElement = document.createElement("div");
    quoteElement.id = "home-random-quote";
    quoteElement.dataset.homeHeroReady = "1";
    quoteElement.setAttribute("aria-live", "polite");
    quoteElement.innerHTML =
      '<span class="home-random-quote-text"></span>' +
      '<span class="home-random-quote-cursor" aria-hidden="true"></span>';

    siteTitle.insertAdjacentElement("afterend", quoteElement);
    return quoteElement;
  }

  function playTypewriter(element) {
    const target = element.querySelector(".home-random-quote-text");
    const cursor = element.querySelector(".home-random-quote-cursor");

    if (!target || !cursor) {
      return;
    }

    if (typeof gsap === "undefined") {
      target.textContent = pickQuote();
      cursor.style.opacity = "1";
      return;
    }

    if (element.__homeQuoteTween) {
      element.__homeQuoteTween.kill();
    }

    if (element.__homeQuoteTimer) {
      window.clearTimeout(element.__homeQuoteTimer);
    }

    gsap.killTweensOf(cursor);
    gsap.set(cursor, { opacity: 1 });
    gsap.to(cursor, {
      opacity: 0,
      duration: 0.5,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut"
    });

    if (REDUCED_MOTION) {
      target.textContent = pickQuote();
      cursor.style.opacity = "1";
      return;
    }

    // 每次进入首页只随机选择一次，后续循环始终播放同一条文案
    const quote = pickQuote();

    const typeNextQuote = () => {
      if (!document.body.contains(element)) {
        return;
      }

      const progress = { index: 0 };
      target.textContent = "";

      element.__homeQuoteTween = gsap.to(progress, {
        index: quote.length,
        duration: Math.max(0.6, quote.length * 0.05),
        ease: "none",
        roundProps: "index",
        onUpdate: () => {
          target.textContent = quote.slice(0, progress.index);
        },
        onComplete: () => {
          element.__homeQuoteTimer = window.setTimeout(
            typeNextQuote,
            2800
          );
        }
      });
    };

    typeNextQuote();
  }

  function init() {
    const header = document.querySelector("#page-header.full_page");
    const siteInfo = header?.querySelector("#site-info");
    const siteTitle = siteInfo?.querySelector("#site-title");

    if (!header || !siteInfo || !siteTitle) {
      return;
    }

    const quoteElement = createQuoteElement(siteInfo, siteTitle);

    if (quoteElement.dataset.homeHeroScheduled === "1") {
      return;
    }

    quoteElement.dataset.homeHeroScheduled = "1";

    const startHomeQuote = () => {
      if (quoteElement.dataset.homeHeroPlayed === "1") {
        return;
      }

      quoteElement.dataset.homeHeroPlayed = "1";
      playTypewriter(quoteElement);
    };

    const loadingBox = document.querySelector("#loading-box");

    if (loadingBox && !loadingBox.classList.contains("loaded")) {
      // 等进入动画的遮罩淡出后再播放首页文案动画，避免动画被遮住
      window.setTimeout(startHomeQuote, 2700);
    } else {
      startHomeQuote();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.addEventListener("load", init, { once: true });

  document.addEventListener("pjax:complete", init);
})();
