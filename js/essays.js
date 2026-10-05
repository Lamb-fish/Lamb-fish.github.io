(function () {
  "use strict";

  function setupCarousel(carousel) {
    if (carousel.dataset.essayReady === "1") {
      return;
    }

    const track = carousel.querySelector(".essay-grid");
    const previous = carousel.querySelector(".essay-carousel-button-prev");
    const next = carousel.querySelector(".essay-carousel-button-next");

    if (!track || !previous || !next) {
      return;
    }

    carousel.dataset.essayReady = "1";

    const getStep = () => {
      const card = track.querySelector(".essay-card");
      if (!card) return track.clientWidth;

      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || "0");
      return card.getBoundingClientRect().width + gap;
    };

    const updateButtons = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      previous.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= maxScroll - 2;
    };

    const move = (direction) => {
      track.scrollBy({
        left: direction * getStep(),
        behavior: "smooth"
      });
    };

    previous.addEventListener("click", () => move(-1));
    next.addEventListener("click", () => move(1));
    track.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);

    let dragging = false;
    let moved = false;
    let startX = 0;
    let startScrollLeft = 0;

    track.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;

      // 鼠标点击卡片时保留原生链接行为；桌面端用左右按钮切换，
      // 触摸设备仍然可以通过横向拖动浏览卡片。
      if (event.pointerType === "mouse" && event.target.closest?.(".essay-card")) {
        return;
      }

      dragging = true;
      moved = false;
      startX = event.clientX;
      startScrollLeft = track.scrollLeft;
      track.classList.add("is-dragging");
      track.setPointerCapture?.(event.pointerId);
    });

    track.addEventListener("pointermove", (event) => {
      if (!dragging) return;

      const distance = event.clientX - startX;
      if (Math.abs(distance) > 12) {
        moved = true;
      }

      track.scrollLeft = startScrollLeft - distance;
    });

    const stopDragging = (event) => {
      if (!dragging) return;

      dragging = false;
      track.classList.remove("is-dragging");
      track.releasePointerCapture?.(event.pointerId);

      if (moved) {
        track.dataset.essaySuppressClick = "1";
        window.setTimeout(() => {
          delete track.dataset.essaySuppressClick;
        }, 80);
      }
    };

    track.addEventListener("pointerup", stopDragging);
    track.addEventListener("pointercancel", stopDragging);
    track.addEventListener(
      "click",
      (event) => {
        if (track.dataset.essaySuppressClick !== "1") return;

        event.preventDefault();
        event.stopPropagation();
        delete track.dataset.essaySuppressClick;
      },
      true
    );

    updateButtons();
  }

  function init() {
    document.querySelectorAll("[data-essay-carousel]").forEach(setupCarousel);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("pjax:complete", init);
})();
