/* Mostar city — cinematic scroll story
   ============================================================
   Scroll-driven animation engine.
   A single self-halting requestAnimationFrame loop reads the
   scroll offset, smooths it with lerp inertia, and writes CSS
   custom properties that the stylesheet binds to GPU transforms.
   ============================================================ */

(() => {
  "use strict";

  // ---------- Queries ----------
  const section = document.querySelector(".cinema-scroll");
  const root = document.documentElement;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  // ---------- State ----------
  let targetMouseX = 0;
  let targetMouseY = 0;
  let mouseX = 0;
  let mouseY = 0;
  let targetScroll = 0;
  let smoothScroll = 0;
  let initialized = false;
  let rafPending = false;

  // ---------- Helpers ----------
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

  const smoothstep = (e0, e1, v) => {
    const x = clamp((v - e0) / (e1 - e0));
    return x * x * (3 - 2 * x);
  };

  const lerp = (a, b, t) => a + (b - a) * t;

  const segmentInOut = (s, a, b, c, d) => {
    const enter = smoothstep(a, b, s);
    const exit = smoothstep(c, d, s);
    return { enter, exit, active: enter * (1 - exit) };
  };

  const getScrollDistance = () =>
    clamp(
      -section.getBoundingClientRect().top,
      0,
      section.offsetHeight - window.innerHeight
    );

  const set = (name, value) => root.style.setProperty(name, value);

  // ---------- Animation engine ----------
  function update() {
    rafPending = false;

    targetScroll = getScrollDistance();
    if (!initialized || reduceMotion.matches) {
      smoothScroll = targetScroll;
      initialized = true;
    } else {
      smoothScroll = lerp(smoothScroll, targetScroll, 0.14);
    }
    if (Math.abs(smoothScroll - targetScroll) < 0.08) smoothScroll = targetScroll;

    mouseX = lerp(mouseX, targetMouseX, 0.12);
    mouseY = lerp(mouseY, targetMouseY, 0.12);

    const frame2 = segmentInOut(smoothScroll, 560, 900, 1300, 1620);
    const frame3 = segmentInOut(smoothScroll, 1760, 2140, 2540, 2700);
    const progress = clamp(smoothScroll / 2700);
    const introExit = smoothstep(90, 650, smoothScroll);
    const blurActive = clamp(frame2.active + frame3.active);
    const frame2Opacity = frame2.active * (1 - frame3.enter);
    const splitDrift = Math.pow(frame2.enter, 1.5);
    const panel2Opacity = frame2.active * (1 - frame2.exit);
    const panel3Opacity = frame3.active * (1 - frame3.exit);
    const backScale =
      0.76 + progress * 0.2 + frame2.enter * 0.18 + frame3.enter * 0.16;
    const sharedHeroY = progress * -74;
    const sharedHeroScale = progress * 0.23;

    // Pointer parallax (custom props; forced to 0 under reduced motion)
    set("--mx", reduceMotion.matches ? 0 : mouseX.toFixed(4));
    set("--my", reduceMotion.matches ? 0 : mouseY.toFixed(4));

    set("--back-opacity", 1 - frame2.active * 0.06);
    set("--back-x", `${mouseX * -12}px`);
    set("--back-y", `${mouseY * -4}px`);
    set("--back-scale", backScale);
    set("--four-y", `${10 + progress * 10}vh`);
    set("--four-scale", 0.78 + progress * 0.16);
    set("--bazaar-y", `${20 - progress * 8}vh`);
    set("--blur-px", `${blurActive * 14}px`);
    set("--back-brightness", 1 - blurActive * 0.255);
    set("--bazaar-blur-px", `${frame2.active * 14}px`);
    set("--bazaar-brightness", 1 - frame2.active * 0.255 - frame3.active * 0.06);
    set("--bazaar-saturation", 1 + frame3.active * 0.18);
    set("--shade-opacity", "1");
    set("--shade-z", frame2.active > 0.02 ? "2" : "0");
    set("--shade-top-alpha", blurActive * 0.465);
    set("--shade-mid-alpha", blurActive * 0.42);
    set("--shade-bottom-alpha", blurActive * 0.51);

    set("--title-y", `${introExit * -210}px`);
    set("--title-scale", 1 - introExit * 0.08);
    set("--title-opacity", 1 - introExit);

    set("--bridge-x", `calc(-50% + ${mouseX * 18}px)`);
    set("--bridge-y", `${mouseY * 8 + sharedHeroY - frame2.exit * 760}px`);
    set("--bridge-bottom", `${5 - frame2.enter * 13}vh`);
    set("--bridge-width", `${67.2 + frame2.enter * 37.8}vw`);
    set("--bridge-scale", 1.02 + sharedHeroScale + frame2.exit * 0.46);

    set(
      "--split-left-x",
      `calc(-50% + ${-splitDrift * 46}vw + ${mouseX * 22}px)`
    );
    set("--split-left-y", `${mouseY * 10 + sharedHeroY - splitDrift * 180}px`);
    set("--split-left-scale", 1 + sharedHeroScale + frame2.enter * 0.74);
    set(
      "--split-right-x",
      `calc(-50% + ${splitDrift * 46}vw + ${mouseX * 22}px)`
    );
    set("--split-right-y", `${mouseY * 10 + sharedHeroY - splitDrift * 180}px`);
    set("--split-right-scale", 1 + sharedHeroScale + frame2.enter * 0.74);

    set("--frame2-opacity", frame2Opacity);
    set("--frame2-x", `calc(-50% + ${mouseX * 10}px)`);
    set("--frame2-y", `calc(-50% + ${mouseY * 8 - frame2.exit * 150}px)`);
    set("--frame2-scale", 1.06 + frame2.enter * 0.08 + frame2.exit * 0.08);

    set("--intro-copy-y", `${introExit * 90}px`);
    set("--intro-copy-opacity", 1 - introExit);
    set("--panel2-opacity", panel2Opacity);
    set(
      "--panel2-y",
      `calc(-50% + ${-frame2.exit * 86 + (1 - frame2.enter) * 58}px)`
    );
    set("--panel3-opacity", panel3Opacity);
    set(
      "--panel3-y",
      `calc(-50% + ${-frame3.exit * 86 + (1 - frame3.enter) * 58}px)`
    );

    if (
      Math.abs(smoothScroll - targetScroll) > 0.08 ||
      Math.abs(mouseX - targetMouseX) > 0.001 ||
      Math.abs(mouseY - targetMouseY) > 0.001
    ) {
      requestTick();
    }
  }

  function requestTick() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(update);
  }

  // ---------- Listeners ----------
  window.addEventListener("scroll", requestTick, { passive: true });

  window.addEventListener("resize", requestTick);

  window.addEventListener(
    "pointermove",
    (event) => {
      targetMouseX = event.clientX / window.innerWidth - 0.5;
      targetMouseY = event.clientY / window.innerHeight - 0.5;
      requestTick();
    },
    { passive: true }
  );

  // ---------- Init ----------
  requestTick();
})();
