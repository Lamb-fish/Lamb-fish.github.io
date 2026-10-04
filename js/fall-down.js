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
    element.style.fontWeight = "900";
    element.style.textTransform = "lowercase";
    element.style.letterSpacing = "0";
    element.style.color = "var(--text)";
    element.style.textAlign = "center";

    const words = TEXT.split(" ")
      .map((word) => {
        const chars = [...word]
          .map(
            (char) => `
              <span class="textFallDown-char">
                ${char}
              </span>
            `
          )
          .join("");

        return `
          <span class="textFallDown-word">
            ${chars}
          </span>
        `;
      })
      .join('<span class="textFallDown-space"></span>');

    element.innerHTML = `
      <div>
        <div>
          ${words}
        </div>
      </div>
    `;
  }

  function play(element) {
    const targets = element.querySelectorAll(
      ".textFallDown-char"
    );

    if (!targets.length || typeof gsap === "undefined") {
      return;
    }

    gsap.killTweensOf(targets);

    /*
     * 官方 Fall Down 动画参数
     */
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
      repeat: -1,
      repeatDelay: 1.4
    });
  }

  function init() {
    const element = createEffectContainer();

    if (!element) {
      return;
    }

    setup(element);

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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();