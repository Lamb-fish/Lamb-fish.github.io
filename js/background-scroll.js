(function () {
  "use strict";

  const root = document.documentElement;

  if (!document.querySelector("#page-header.full_page")) {
    return;
  }

  root.classList.add("home-bg-page");

  let blurred = false;

  function updateBackgroundBlur() {
    const shouldBlur = window.scrollY >= window.innerHeight * 0.5;

    if (shouldBlur === blurred) {
      return;
    }

    blurred = shouldBlur;
    root.classList.toggle("is-background-blurred", shouldBlur);
  }

  updateBackgroundBlur();
  window.addEventListener("scroll", updateBackgroundBlur, { passive: true });
  window.addEventListener("resize", updateBackgroundBlur);
})();
