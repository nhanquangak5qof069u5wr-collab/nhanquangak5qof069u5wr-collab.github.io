"use strict";

const learningXp = (() => {
  const storageKey = "lc-cyber-roadmap-v1";
  const perTask = 10;
  const taskIds = new Set(roadmap.flatMap(stage => stage.nodes.flatMap(
    ([id, , , ...tasks]) => tasks.map((_, index) => id + ":" + index)
  )));
  const maximum = taskIds.size * perTask;
  const steps = [
    [0, "安全小白"],
    [20, "环境学徒"],
    [50, "基础练习生"],
    [100, "排障练习生"],
    [170, "靶场练习生"],
    [260, "攻防探索者"],
    [380, "安全进阶者"],
    [520, "综合实践者"],
    [650, "安全研习者"]
  ].filter(([threshold]) => threshold < maximum);
  steps.push([maximum, "路线全通"]);

  function parseProgress(raw) {
    const data = JSON.parse(raw || "[]");
    return new Set(Array.isArray(data) ? data.filter(id => taskIds.has(id)) : []);
  }

  function calculate(count) {
    const total = Math.max(0, Math.min(maximum, count * perTask));
    const next = steps.findIndex(([threshold]) => threshold > total);
    const index = next < 0 ? steps.length - 1 : next - 1;
    const [start, title] = steps[index];
    const cap = next < 0 ? maximum : steps[next][0];
    return {
      level: index + 1,
      title,
      total,
      value: next < 0 ? maximum : total - start,
      range: next < 0 ? maximum : cap - start,
      remainingTasks: Math.ceil((cap - total) / perTask),
      isMax: next < 0
    };
  }

  function render(completed) {
    const model = calculate(completed.size);
    for (const root of document.querySelectorAll("[data-learning-xp]")) {
      const write = (selector, value) => {
        const item = root.querySelector(selector);
        if (item && item.textContent !== value) item.textContent = value;
      };
      write("[data-xp-level]", "Lv. " + model.level + " " + model.title);
      write("[data-xp-value]", model.isMax ? "满级" : model.value + " / " + model.range + " XP");
      write("[data-xp-total]", "累计 " + model.total + " XP");
      write("[data-xp-next]", model.isMax
        ? "已完成全部路线任务"
        : "再完成 " + model.remainingTasks + " 项任务升至 Lv. " + (model.level + 1));
      const bar = root.querySelector("[data-xp-bar]");
      bar.max = model.range;
      bar.value = model.value;
    }
  }

  if (document.querySelector("[data-xp-autoload]")) {
    const sync = () => {
      try {
        render(parseProgress(localStorage.getItem(storageKey)));
      } catch {
        // A blocked store leaves the initial level visible.
      }
    };
    sync();
    window.addEventListener("pageshow", sync);
    window.addEventListener("storage", event => {
      if (event.key === storageKey || event.key === null) sync();
    });
  }

  return {storageKey, taskIds, parseProgress, calculate, render};
})();
