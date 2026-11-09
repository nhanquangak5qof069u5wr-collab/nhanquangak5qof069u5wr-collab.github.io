"use strict";

const storageKey = "lc-cyber-roadmap-v1";
const nodes = roadmap.flatMap(stage => stage.nodes.map(([id, number, title, ...tasks]) => ({
  id, number, title, tasks, stage
})));
const mainNodes = nodes.filter(node => !node.stage.optional);
const sideNodes = nodes.filter(node => node.stage.optional);
const taskIds = new Set(nodes.flatMap(node => node.tasks.map((_, i) => node.id + ":" + i)));
const tiles = new Map();
const stageCounts = new Map();
const get = id => document.getElementById(id);
const dialog = get("route-dialog");
let activeNode;
let nextNode;
let storage;
let completed = new Set();

function parseProgress(raw) {
  const data = JSON.parse(raw || "[]");
  return new Set(Array.isArray(data) ? data.filter(id => taskIds.has(id)) : []);
}

function storageUnavailable() {
  storage = null;
  get("route-save-note").textContent = "浏览器当前不允许保存进度，本次勾选将在关闭页面后清空。";
}

try {
  storage = window.localStorage;
  completed = parseProgress(storage.getItem(storageKey));
} catch {
  if (!storage) storageUnavailable();
}

function saveProgress() {
  if (!storage) return;
  try {
    storage.setItem(storageKey, JSON.stringify([...completed]));
  } catch {
    storageUnavailable();
  }
}

function el(tag, className, text) {
  const result = document.createElement(tag);
  if (className) result.className = className;
  if (text != null) result.textContent = text;
  return result;
}

function renderStage(stage) {
  const section = el("section", "route-stage");
  section.id = stage.id;
  const title = el("h3", null, stage.title);
  title.id = stage.id + "-title";
  section.setAttribute("aria-labelledby", title.id);
  const head = el("div", "route-stage-head");
  const marker = el("span", "route-stage-marker", stage.number);
  marker.setAttribute("aria-hidden", "true");
  const copy = el("div", "route-stage-copy");
  copy.append(title, el("p", null, stage.description));
  const count = el("span", "route-stage-count");
  stageCounts.set(stage, count);
  head.append(marker, copy, count);

  const list = el("ol", "route-stations");
  for (const node of nodes.filter(item => item.stage === stage)) {
    const item = el("li");
    const button = el("button", "route-station");
    button.type = "button";
    button.setAttribute("aria-haspopup", "dialog");
    const top = el("span", "route-station-top");
    const marker = el("span", "route-station-number", node.number);
    const status = el("span", "route-station-status");
    const dot = el("span", "route-station-dot");
    dot.setAttribute("aria-hidden", "true");
    top.append(marker, dot);
    button.append(top, el("strong", null, node.title), status);
    button.addEventListener("click", () => openNode(node));
    tiles.set(node.id, {button, status});
    item.append(button);
    list.append(item);
  }
  section.append(head, list);
  get(stage.optional ? "route-side-groups" : "route-main-groups").append(section);
  const link = el("a", null, stage.number + " · " + stage.title);
  link.href = "#" + stage.id;
  get("route-stage-nav").append(link);
}

const tally = node => node.tasks.reduce((sum, _, i) => sum + Number(completed.has(node.id + ":" + i)), 0);
const lit = node => tally(node) === node.tasks.length;

function refreshMap() {
  nextNode = mainNodes.find(node => !lit(node));
  for (const node of nodes) {
    const count = tally(node);
    const {button, status} = tiles.get(node.id);
    button.dataset.state = lit(node) ? "done" : count ? "started" : "new";
    status.textContent = lit(node) ? "已点亮" : count ? count + " / " + node.tasks.length + " 已完成" : "待开始";
    if (node === nextNode) button.dataset.next = "true";
    else delete button.dataset.next;
  }
  for (const [stage, count] of stageCounts) {
    count.textContent = nodes.filter(node => node.stage === stage && lit(node)).length + " / " + stage.nodes.length;
  }
  const mainDone = mainNodes.filter(lit).length;
  const mainTasks = mainNodes.reduce((sum, node) => sum + node.tasks.length, 0);
  const mainTaskDone = mainNodes.reduce((sum, node) => sum + tally(node), 0);
  get("route-done").textContent = mainDone;
  get("route-total").textContent = mainNodes.length;
  get("route-percent").textContent = Math.round(mainDone / mainNodes.length * 100) + "%";
  get("route-progress").max = mainNodes.length;
  get("route-progress").value = mainDone;
  get("route-task-count").textContent = "已完成 " + mainTaskDone + " / " + mainTasks + " 项主线任务";
  get("side-count").textContent = "已点亮 " + sideNodes.filter(lit).length + " / " + sideNodes.length + " 站";
  get("route-next-label").textContent = nextNode ? "下一站 · " + nextNode.title : "主线全部点亮";
  get("route-resume").hidden = !nextNode;
  get("route-resume").disabled = !nextNode;
}

function refreshDialog() {
  if (!activeNode || !dialog.open) return;
  const count = tally(activeNode);
  get("route-dialog-status").textContent = count === activeNode.tasks.length
    ? "✓ 站点已点亮"
    : count + " / " + activeNode.tasks.length + " 项任务已完成";
  for (const input of get("route-tasks").querySelectorAll("input")) {
    input.checked = completed.has(input.value);
  }
}

function openNode(node) {
  activeNode = node;
  get("route-dialog-index").textContent = "站点 " + node.number + " / " + node.stage.title;
  get("route-dialog-title").textContent = node.title;
  const tasks = get("route-tasks");
  tasks.replaceChildren();
  for (const [i, task] of node.tasks.entries()) {
    const label = el("label", "route-task");
    const input = el("input");
    input.type = "checkbox";
    input.value = node.id + ":" + i;
    label.append(input, el("span", null, task));
    tasks.append(label);
  }
  dialog.showModal();
  refreshDialog();
}

get("route-checklist").addEventListener("change", event => {
  const input = event.target;
  if (input.type !== "checkbox" || !taskIds.has(input.value)) return;
  const wasLit = lit(activeNode);
  if (input.checked) completed.add(input.value);
  else completed.delete(input.value);
  saveProgress();
  refreshMap();
  refreshDialog();
  if (!wasLit && lit(activeNode)) {
    get("route-announcement").textContent = "已点亮站点：" + activeNode.title;
  } else if (wasLit && !lit(activeNode)) {
    get("route-announcement").textContent = "已取消点亮：" + activeNode.title;
  }
});

get("route-resume").addEventListener("click", () => {
  if (nextNode) openNode(nextNode);
});
dialog.addEventListener("close", () => {
  if (document.activeElement === document.body && activeNode) {
    tiles.get(activeNode.id).button.focus();
  }
  activeNode = null;
});
window.addEventListener("storage", event => {
  if (!storage || event.storageArea !== storage || (event.key !== storageKey && event.key !== null)) return;
  try {
    completed = parseProgress(event.newValue);
    refreshMap();
    refreshDialog();
  } catch {
    // Leave the current display intact if another tab supplied invalid progress.
  }
});

for (const stage of roadmap) renderStage(stage);
refreshMap();
