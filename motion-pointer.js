"use strict";

(() => {
  const body = document.body;
  const stages = [...document.querySelectorAll(".motion-stage")];
  if (!stages.length) return;

  const pointer = matchMedia("(hover: hover) and (pointer: fine)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let tracking = false;
  let point = null;
  let frame = 0;
  let current = null;

  for (const stage of stages) {
    const light = document.createElement("div");
    light.className = "motion-light";
    light.setAttribute("aria-hidden", "true");
    stage.append(light);
  }

  function draw() {
    frame = 0;
    if (!tracking || !point) return;
    const {x, y} = point;
    body.style.setProperty("--page-x", x + "px");
    body.style.setProperty("--page-y", y + "px");
    body.classList.add("has-pointer-light");
    const next = stages.find(stage => {
      const rect = stage.getBoundingClientRect();
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    }) || null;
    if (current !== next) {
      current?.classList.remove("is-lit");
      current = next;
    }
    if (!current) return;

    const rect = current.getBoundingClientRect();
    const u = (x - rect.left) / rect.width;
    const v = (y - rect.top) / rect.height;
    current.style.setProperty("--light-x", (u * 100).toFixed(1) + "%");
    current.style.setProperty("--light-y", (v * 100).toFixed(1) + "%");
    current.style.setProperty("--pointer-drift-x", ((u - .5) * -16).toFixed(1) + "px");
    current.style.setProperty("--pointer-drift-y", ((v - .5) * -12).toFixed(1) + "px");
    current.classList.add("is-lit");
  }

  function schedule() {
    if (!frame && tracking && point) frame = requestAnimationFrame(draw);
  }

  function move(event) {
    if (event.pointerType !== "mouse" || !tracking) return;
    point = {x:event.clientX, y:event.clientY};
    schedule();
  }

  function clear() {
    point = null;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    body.classList.remove("has-pointer-light");
    current?.classList.remove("is-lit");
    current = null;
  }

  function sync() {
    tracking = pointer.matches && !reduced.matches;
    if (!tracking) clear();
  }

  pointer.addEventListener("change", sync);
  reduced.addEventListener("change", sync);
  document.addEventListener("pointermove", move, {passive:true});
  document.documentElement.addEventListener("pointerleave", clear);
  window.addEventListener("scroll", schedule, {passive:true});
  window.addEventListener("resize", schedule, {passive:true});
  window.addEventListener("blur", clear);
  sync();
})();

