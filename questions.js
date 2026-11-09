"use strict";

const levels = {1: "基础", 2: "进阶", 3: "挑战"};
const questions = questionBank.flatMap(category => category.skills.flatMap(skill =>
  skill.questions.map(question => ({...question, skill: skill.id, subject: skill.name}))
)).sort((a, b) => a.level - b.level || Number(Boolean(a.lab)) - Number(Boolean(b.lab)));

const get = id => document.getElementById(id);
const byId = new Map();
const completed = new Set();
const key = id => "lc-question-done:" + id;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function showStorageFailure() {
  get("bank-save").textContent = "当前浏览器无法保存进度，关闭页面后本次勾选会清空。";
}

function readProgress() {
  try {
    for (const q of questions) {
      if (localStorage.getItem(key(q.id)) === "1") completed.add(q.id);
      else completed.delete(q.id);
    }
  } catch {
    showStorageFailure();
  }
}

function setCompleted(id, checked) {
  if (checked) completed.add(id);
  else completed.delete(id);
  try {
    if (checked) localStorage.setItem(key(id), "1");
    else localStorage.removeItem(key(id));
  } catch {
    showStorageFailure();
  }
  refresh();
}

function renderQuestion(q, i) {
  const details = el("details", "bank-question");
  details.id = "q-" + q.id;
  details.dataset.level = q.level;
  const summary = el("summary");
  const info = el("div", "bank-info");
  const label = el("div", "bank-meta");
  label.append(el("span", "bank-level", levels[q.level]), el("span", "bank-subject", q.subject));
  if (q.lab) label.append(el("span", "bank-lab-tag", "在线靶场"));
  info.append(label, el("strong", "bank-title", q.title));
  const state = el("span", "bank-state");
  const arrow = el("span", "bank-chevron");
  arrow.setAttribute("aria-hidden", "true");
  summary.append(el("span", "bank-number", String(i + 1).padStart(2, "0")), info, state, arrow);

  const content = el("div", "bank-prompt");
  content.append(el("h4", "bank-prompt-label", "题目情境"));
  const ruleMatch = /\n\n(?=(?:Flag 任务：|统一提交格式：))/.exec(q.prompt);
  if (ruleMatch) {
    content.append(el("p", "bank-statement", q.prompt.slice(0, ruleMatch.index)));
    const rule = el("div", "bank-submit-rule");
    rule.append(el("strong", null, "提交约定"), el("p", null, q.prompt.slice(ruleMatch.index).trim()));
    content.append(rule);
  } else content.append(el("p", "bank-statement", q.prompt));
  let check;
  if (q.lab) {
    const link = el("a", "bank-open-lab", "打开静默归档室 ↗");
    link.href = q.lab;
    content.append(link, el("p", "bank-small", "在靶场验证正确的 flag 后，这道题会自动标记为完成。"));
  } else {
    const form = el("form", "bank-flag-form");
    const input = el("input", "bank-flag-input");
    input.type = "text"; input.name = "flag"; input.placeholder = "flag{...}";
    input.autocomplete = "off"; input.spellcheck = false; input.required = true;
    input.setAttribute("aria-label", q.title + "的 flag");
    const submit = el("button", "bank-flag-submit", "验证 flag"); submit.type = "submit";
    const feedback = el("p", "bank-flag-feedback"); feedback.setAttribute("role", "status");
    form.append(input, submit);
    form.addEventListener("submit", event => {
      event.preventDefault();
      const value = input.value.trim();
      if (!/^flag\{[^{}]+\}$/.test(value)) { feedback.textContent = "请按 flag{...} 格式提交。"; return; }
      if (value !== q.answer) { feedback.textContent = "flag 不正确，请检查结果、大小写和题目要求的分隔符。"; return; }
      setCompleted(q.id, true); feedback.textContent = "验证通过，已记录完成进度。";
    });
    const answer = el("details", "bank-answer");
    answer.append(el("summary", null, "查看 flag 与解析"), el("code", "bank-reference-flag", q.answer), el("p", null, q.explanation));
    content.append(form, feedback, answer);

  }
  details.append(summary, content);
  get("bank-list").append(details);
  byId.set(q.id, {details, state, check});
}

function refresh() {
  const skill = get("bank-skill").value;
  const level = get("bank-level").value;
  const unfinished = get("bank-unfinished").checked;
  let visible = 0;
  for (const q of questions) {
    const {details, state, check} = byId.get(q.id);
    const done = completed.has(q.id);
    details.hidden = Boolean((skill && q.skill !== skill) ||
      (level && q.level !== Number(level)) || (unfinished && done));
    if (!details.hidden) visible++;
    if (check) check.checked = done;
    state.textContent = done ? (q.lab ? "已通关" : "已完成") : "";
    details.classList.toggle("bank-solved", done);
  }
  get("bank-count").textContent = "显示 " + visible + " / " + questions.length + " 题";
  get("bank-empty").hidden = visible > 0;
  get("bank-completed").textContent = completed.size + " / " + questions.length;
  get("bank-progress").max = questions.length;
  get("bank-progress").value = completed.size;
  updateCategoryProgress();
}

function openLinkedQuestion() {
  const id = location.hash.slice(1);
  if (!id.startsWith("q-")) return;
  const item = byId.get(id.slice(2));
  if (!item) return;
  if (item.details.hidden) {
    get("bank-skill").value = "";
    get("bank-level").value = "";
    get("bank-unfinished").checked = false;
    refresh();
  }
  item.details.open = true;
  item.details.scrollIntoView({block: "start"});
}

for (const category of questionBank) {
  const group = el("optgroup");
  group.label = category.group;
  for (const skill of category.skills) {
    const option = el("option", null, skill.name);
    option.value = skill.id;
    group.append(option);
  }
  get("bank-skill").append(group);
}
const requestedSkill = new URLSearchParams(location.search).get("skill");
if ([...get("bank-skill").options].some(option => option.value === requestedSkill)) get("bank-skill").value = requestedSkill;
questions.forEach(renderQuestion);
readProgress();
refresh();
openLinkedQuestion();
for (const id of ["bank-skill", "bank-level", "bank-unfinished"]) {
  get(id).addEventListener("change", refresh);
}
window.addEventListener("hashchange", openLinkedQuestion);
window.addEventListener("pageshow", () => {
  readProgress();
  refresh();
  openLinkedQuestion();
});
window.addEventListener("storage", () => {
  readProgress();
  refresh();
});


// Direction -> skill -> exercises: one set of live question nodes preserves form state.
const categoryDialog = get("bank-category-dialog");
const skillDialog = get("bank-skill-dialog");
let activeCategory = null, categoryTrigger = null, returningToCategory = false, lastSkill = null;
const categoryDescriptions = [
  "系统、Python、Web 与部署，把基础知识连成可运行的工程。",
  "Web、审计、内网、二进制与移动安全，从线索走到验证。",
  "研判、取证、云安全与治理，用证据解释事件与风险。",
  "生成式 AI、Agent、分析与深度学习，检验方法和结果。"
];
const categoryIcons = [
  "M16 13 6 24l10 11m16-22 10 11-10 11M28 8l-8 32",
  "M24 5 8 12v12c0 10 16 19 16 19s16-9 16-19V12zM17 24l5 5 10-11",
  "M5 25h9l5-14 9 27 6-13h9M8 9h5m22 30h5",
  "M16 16h16v16H16zM9 9l7 7m16 0 7-7M9 39l7-7m16 0 7 7M24 5v11m0 16v11M5 24h11m16 0h11"
];
function updateCategoryProgress() {
  document.querySelectorAll("[data-category-progress]").forEach(node => {
    const category = questionBank[Number(node.dataset.categoryProgress)];
    const items = category.skills.flatMap(skill => skill.questions);
    node.textContent = items.filter(q => completed.has(q.id)).length + " / " + items.length + " 已完成";
  });
}
function restoreQuestionList() {
  for (const q of questions) get("bank-list").append(byId.get(q.id).details);
}
function openCategory(category, trigger) {
  activeCategory = category; categoryTrigger = trigger;
  get("bank-category-title").textContent = category.group;
  const list = get("bank-category-skills"); list.replaceChildren();
  for (const [i, skill] of category.skills.entries()) {
    const button = el("button", "bank-skill-tile"); button.type = "button"; button.dataset.skill = skill.id;
    button.setAttribute("aria-haspopup", "dialog");
    button.append(el("span", "bank-skill-index", String(i + 1).padStart(2,"0")), el("strong", null, skill.name), el("span", "bank-skill-count", skill.questions.length + " 题 · 基础 / 进阶 / 挑战"), el("span", "bank-tile-arrow", "↗"));
    button.addEventListener("click", () => openSkill(skill)); list.append(button);
  }
  categoryDialog.showModal();
}
function openSkill(skill) {
  lastSkill = skill.id;
  get("bank-skill").value = skill.id;
  get("bank-level").value = ""; get("bank-unfinished").checked = false;
  refresh();
  get("bank-skill-title").textContent = skill.name;
  get("bank-skill-breadcrumb").textContent = "LEVEL 02 / " + activeCategory.group + " / " + skill.questions.length + " 道练习";
  const list = get("bank-dialog-list"); list.replaceChildren();
  for (const q of questions.filter(q => q.skill === skill.id)) list.append(byId.get(q.id).details);
  categoryDialog.close(); skillDialog.showModal(); skillDialog.scrollTop = 0;
}
questionBank.forEach((category, i) => {
  const button = el("button", "bank-category category-" + i); button.type = "button";
  button.setAttribute("aria-haspopup", "dialog");
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg"); icon.setAttribute("viewBox","0 0 48 48"); icon.setAttribute("aria-hidden","true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path"); path.setAttribute("d",categoryIcons[i]);icon.append(path);
  const top = el("span", "bank-category-top");top.append(el("span", null,"0"+(i+1)),icon,el("span",null,"↗"));
  const progress = el("span", "bank-category-progress");progress.dataset.categoryProgress = i;
  button.append(top,el("strong",null,category.group),el("span","bank-category-copy",categoryDescriptions[i]),progress);
  button.addEventListener("click", () => openCategory(category,button)); get("bank-category-grid").append(button);
});
get("bank-dialog-back").addEventListener("click", () => {returningToCategory = true; skillDialog.close();});
document.querySelector('[data-close="category"]').addEventListener("click", () => categoryDialog.close());
document.querySelector('[data-close="skill"]').addEventListener("click", () => skillDialog.close());
categoryDialog.addEventListener("close", () => {if (!skillDialog.open) categoryTrigger?.focus();});
skillDialog.addEventListener("close", () => {
  restoreQuestionList(); refresh();
  if (returningToCategory) {
    returningToCategory = false; categoryDialog.showModal();
    get("bank-category-skills").querySelector('[data-skill="'+lastSkill+'"]')?.focus();
  } else categoryTrigger?.focus();
});
for (const dialog of [categoryDialog,skillDialog]) {
  dialog.addEventListener("click", event => {
    if (event.target !== dialog) return;
    const r=dialog.getBoundingClientRect();
    if (event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) dialog.close();
  });
}
updateCategoryProgress();
