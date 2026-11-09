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
    [650, "安全研习者"],
    [760, "实践引路人"],
    [980, "工程研习者"],
    [1240, "综合守望者"]
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
    const petNames = ["初醒幼体","探路幼猫","工具小猫","巡游伙伴","靶场伙伴","探索搭档","侦察伙伴","工程伙伴","守望伙伴","云端搭档","研习伙伴","星光伙伴","全通守护者"];
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
      write("[data-xp-pet-stage]", petNames[model.level-1]);
      write("[data-xp-next-pet-name]", model.isMax ? "最终形态已解锁" : petNames[model.level]);
      const pet=root.querySelector("[data-xp-pet]");
      if(pet){pet.src="assets/pet-lv-"+model.level+".svg";pet.alt="等级 "+model.level+" 的成长宠物："+petNames[model.level-1];}
      const nextPet=root.querySelector("[data-xp-next-pet]");
      if(nextPet){nextPet.src="assets/pet-lv-"+Math.min(13,model.level+1)+".svg";nextPet.alt=model.isMax?"最终宠物形态":"下一等级的宠物形态："+petNames[model.level];}
      root.dataset.petLevel=model.level;
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
