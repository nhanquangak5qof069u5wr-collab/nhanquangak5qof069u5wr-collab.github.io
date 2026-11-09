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
  content.append(el("p", "bank-statement", q.prompt));
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
