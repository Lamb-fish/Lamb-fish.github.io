(function () {
  "use strict";

  const TEXT = "nothing but yourself";

  function createEffectContainer() {
    const loadingBox = document.querySelector("#loading-box");
    const spinnerBox = loadingBox?.querySelector(".spinner-box");

    if (!loadingBox || !spinnerBox) {
      return null;
    }

    spinnerBox.innerHTML = `
      <div data-gsap-effect-stage="textFallDown">
        <div data-gsap-effect="textFallDown"></div>
      </div>
    `;

    return spinnerBox.querySelector(
      '[data-gsap-effect="textFallDown"]'
    );
  }

  function setup(element) {
    element.style.fontSize = "var(--card-text-hero)";
    element.style.fontWeight = "500";
    element.style.textTransform = "lowercase";
    element.style.letterSpacing = "0";
    element.style.color = "var(--text)";
    element.style.textAlign = "center";

    const words = TEXT.split(" ")
      .map((word) => {
        const chars = [...word]
          .map(
            (char) => `<span class="textFallDown-char">${char}</span>`
          )
          .join("");

        return `<span class="textFallDown-word">${chars}</span>`;
      })
      .join('<span class="textFallDown-space"></span>');

    element.innerHTML = `<div><div>${words}</div></div>`;
  }

  function play(element) {
    const targets = element.querySelectorAll(
      ".textFallDown-char"
    );

    if (!targets.length || typeof gsap === "undefined") {
      return;
    }

    gsap.killTweensOf(targets);

    gsap.set(targets, {
      transform: "translateY(-50px)",
      opacity: 0
    });

    gsap.to(targets, {
      keyframes: {
        "0%": {
          transform: "translateY(-50px)",
          opacity: 0
        },

        "100%": {
          transform: "translateY(0)",
          opacity: 1
        }
      },

      duration: 0.5,
      stagger: 0.05,
      ease: "power2.out",
      repeat: 0
    });
  }

  function animate(element) {
    if (typeof gsap === "undefined") {
      element.textContent = TEXT;
      return;
    }

    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      const targets = element.querySelectorAll(
        ".textFallDown-char"
      );

      gsap.set(targets, {
        transform: "translateY(0)",
        opacity: 1
      });

      return;
    }

    play(element);
  }

  function init() {
    const element = createEffectContainer();

    if (!element) {
      return;
    }

    setup(element);
    animate(element);

    // 整页跳转时，head 中的标记会让本次加载使用白底黑字
    if (document.documentElement.classList.contains("page-transition")) {
      setTimeout(() => {
        document.documentElement.classList.remove("page-transition");
      }, 2600);
    }
  }

  let transitionTimer;
  let transitionActive = false;

  function startPageTransition() {
    if (transitionActive) return;

    transitionActive = true;
    clearTimeout(transitionTimer);
    document.body.classList.add("page-transition");
    document.documentElement.classList.add("page-transition");

    try {
      sessionStorage.setItem("blog-page-transition", "1");
    } catch (error) {
      // 无法使用 sessionStorage 时仍继续执行当前页动画
    }

    const loadingBox = document.querySelector("#loading-box");
    loadingBox?.classList.remove("loaded");
    loadingBox?.classList.add("pjax-transition");

    if (loadingBox) {
      loadingBox.style.opacity = "1";
      loadingBox.style.visibility = "visible";
      loadingBox.style.pointerEvents = "auto";
    }

    loadingBox?.querySelector(".spinner-box")?.style.setProperty(
      "display",
      "flex",
      "important"
    );

    const element = createEffectContainer();

    if (element) {
      setup(element);
      animate(element);
    }
  }

  function endPageTransition() {
    transitionTimer = setTimeout(() => {
      document.body.classList.remove("page-transition");
      document.documentElement.classList.remove("page-transition");
      document
        .querySelector("#loading-box")
        ?.classList.remove("pjax-transition");
      try {
        sessionStorage.removeItem("blog-page-transition");
      } catch (error) {}
      transitionActive = false;
    }, 2600);
  }

  document.addEventListener("pjax:send", startPageTransition);
  document.addEventListener("pjax:complete", endPageTransition);

  // 在 PJAX 发出事件前先响应站内链接点击，确保文字动画及时出现
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest?.("a");

    if (!link || link.target === "_blank" || link.hasAttribute("download")) {
      return;
    }

    const url = new URL(link.href, window.location.href);

    if (url.origin !== window.location.origin) return;
    if (
      url.pathname === window.location.pathname &&
      url.search === window.location.search
    ) {
      return;
    }

    startPageTransition();
  }, true);

  // Butterfly 的 PJAX 还会通过 btf 全局回调触发，这里一并注册
  if (window.btf && typeof btf.addGlobalFn === "function") {
    btf.addGlobalFn(
      "pjaxSend",
      startPageTransition,
      "fall_down_page_transition_start"
    );
    btf.addGlobalFn(
      "pjaxComplete",
      endPageTransition,
      "fall_down_page_transition_end"
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }
})();
