"use strict";
(() => {
  const dialog = document.getElementById("skill-guide-dialog");
  const canvas = document.getElementById("skill-guide-canvas");
  const image = document.getElementById("skill-guide-image");
  const zoom = document.getElementById("skill-guide-zoom");
  let trigger;
  for (const button of document.querySelectorAll("[data-skill-guide]")) {
    button.addEventListener("click", () => {
      const guide = skillGuides.find(item => item.id === button.dataset.skillGuide);
      if (!guide) return;
      trigger = button;
      document.getElementById("skill-guide-title").textContent = guide.title;
      document.getElementById("skill-guide-mobile").srcset = "assets/skill-guides/" + guide.id + "-mobile.webp";
      image.src = "assets/skill-guides/" + guide.id + ".webp";
      image.alt = guide.title + "详细图解：核心概念、操作流程、动手实践、验收方式与常见误区。";
      const transcript = document.getElementById("skill-guide-transcript");
      transcript.textContent = [guide.title, guide.tagline, guide.overview.replace(/<[^>]*>/g,""), ...guide.concepts.flat(), ...guide.flow, ...guide.practice.map(s => s.replace(/<[^>]*>/g,"")), guide.pitfall].join("。 ");
      canvas.classList.remove("is-zoomed");
      zoom.setAttribute("aria-pressed", "false"); zoom.textContent = "放大图片 ＋";
      dialog.showModal(); canvas.scrollTop = canvas.scrollLeft = 0;
    });
  }
  zoom.addEventListener("click", () => {
    const enlarged = canvas.classList.toggle("is-zoomed");
    zoom.setAttribute("aria-pressed", String(enlarged));
    zoom.textContent = enlarged ? "适应宽度 －" : "放大图片 ＋";
  });
  document.getElementById("skill-guide-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => trigger?.focus());
  dialog.addEventListener("click", event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
})();
