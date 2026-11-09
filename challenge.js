"use strict";

const tag = document.querySelector("#tag");
const statusLine = document.querySelector("#status");
const verifyStatus = document.querySelector("#verify-status");
const attemptsOut = document.querySelector("#attempts");
const flagField = document.querySelector("#flag");
const resetButton = document.querySelector("#reset");
const controls = [...document.querySelectorAll("[data-op]")];
const messages = {
  ready: "靶场就绪。默认已保存 weekly。",
  hit: "有记录",
  miss: "无记录",
  saved: "设置已保存。回放时生效。",
  rejected: "输入被拦截，请检查标签。",
  error: "靶场未能执行，请重置后重试。",
  timeout: "执行超时，已停止本次查询。请重置靶场。",
  correct: "验证通过！你找到了正确的 flag。",
  wrong: "flag 不正确。"
};
let worker, id = 0, timer, attempts = 0, ready = false;

function setControls(busy) {
  for (const button of controls) button.disabled = busy || !ready;
  resetButton.disabled = busy;
}

function clearWorker() {
  clearTimeout(timer);
  if (worker) worker.terminate();
  worker = null;
}

function send(op, value) {
  setControls(true);
  const current = ++id;
  if (op === "replay") attemptsOut.value = ++attempts;
  const line = op === "verify" ? verifyStatus : statusLine;
  const prefix = {preview: "预览：", replay: "回放："}[op] || "";
  worker.onmessage = ({data}) => {
    if (data.id !== current) return;
    clearTimeout(timer);
    if (op === "reset") ready = data.kind === "ready";
    line.textContent = prefix + (messages[data.kind] || messages.error);
    setControls(false);
  };
  timer = setTimeout(() => {
    clearWorker();
    ready = false;
    line.textContent = op === "reset" ? messages.error : messages.timeout;
    setControls(false);
  }, op === "reset" ? 12000 : 1800);
  worker.postMessage({id: current, op, value});
}

function reset() {
  clearWorker();
  ready = false;
  attempts = 0;
  attemptsOut.value = 0;
  tag.value = "weekly";
  flagField.value = "";
  verifyStatus.textContent = "";
  statusLine.textContent = "正在启动靶场…";
  try {
    worker = new Worker("challenge-worker.js");
    worker.onerror = () => {
      clearWorker();
      ready = false;
      statusLine.textContent = messages.error;
      setControls(false);
    };
    send("reset");
  } catch {
    statusLine.textContent = messages.error;
    setControls(false);
  }
}

for (const button of controls) {
  if (button.dataset.op === "verify") continue;
  button.addEventListener("click", () => send(button.dataset.op, tag.value));
}
document.querySelector("#verify").addEventListener("submit", event => {
  event.preventDefault();
  if (ready && !controls.some(button => button.disabled)) send("verify", flagField.value.trim());
});
resetButton.addEventListener("click", reset);
reset();
