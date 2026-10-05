(function () {
  "use strict";

  const root = document.documentElement;
  const header = document.querySelector("#page-header.full_page");
  const isHomePage = Boolean(header);

  if (!isHomePage) {
    return;
  }

  root.classList.add("home-bg-page");

  let ticking = false;

  function updateBackground() {
    const headerHeight = Math.max(header.offsetHeight, window.innerHeight);
    const blurDistance = Math.max(headerHeight * 0.75, 360);
    const progress = Math.min(
      1,
      Math.max(0, window.scrollY / blurDistance)
    );

    root.style.setProperty(
      "--home-bg-opacity",
      (progress * 0.22).toFixed(3)
    );
    root.style.setProperty(
      "--home-bg-blur",
      `${(progress * 14).toFixed(2)}px`
    );
    root.style.setProperty(
      "--home-bg-brightness",
      (1 - progress * 0.2).toFixed(3)
    );
    root.style.setProperty(
      "--home-bg-scale",
      (1 + progress * 0.045).toFixed(3)
    );
    root.style.setProperty(
      "--home-bg-overlay",
      (progress * 0.9).toFixed(3)
    );

    ticking = false;
  }

  function requestUpdate() {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(updateBackground);
  }

  updateBackground();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
})();
