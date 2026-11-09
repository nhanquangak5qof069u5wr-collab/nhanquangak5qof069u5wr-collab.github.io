"use strict";
const levels = {1: "基础", 2: "进阶", 3: "挑战"};
const questions = questionBank.flatMap(category => category.skills.flatMap(skill => skill.questions.map(question => ({...question,skill:skill.id,subject:skill.name}))));
const get = id => document.getElementById(id);
const byId = new Map(), completed = new Set();
const key = id => "lc-question-done:" + id;
function el(tag, className, text) {const node=document.createElement(tag);if(className)node.className=className;if(text!=null)node.textContent=text;return node;}
function showStorageFailure(){get("bank-save").textContent="当前浏览器无法保存进度，关闭页面后本次记录会清空。";}
function readProgress(){try{for(const q of questions){if(localStorage.getItem(key(q.id))==="1")completed.add(q.id);else completed.delete(q.id);}}catch{showStorageFailure();}}
function setCompleted(id,checked){if(checked)completed.add(id);else completed.delete(id);try{if(checked)localStorage.setItem(key(id),"1");else localStorage.removeItem(key(id));}catch{showStorageFailure();}refresh();}
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
  get("bank-parking").append(details);
  byId.set(q.id, {details, state, check});
}


const categoryDialog=get("bank-category-dialog"),skillDialog=get("bank-skill-dialog");
const skillPhotos={system:"route-network",python:"route-code",fullstack:"route-code",ops:"route-network","web-pentest":"route-analysis",audit:"route-code",intranet:"route-network",binary:"portal-photo-chip",mobile:"portal-photo-chip",blue:"route-analysis",forensics:"route-analysis",cloud:"route-network",governance:"portal-photo-notebook",genai:"route-code",agent:"route-analysis",analytics:"route-analysis",deep:"portal-photo-chip"};
const sourceNames={system:"系统管理与网络工程",python:"Python 编程与网络工具",fullstack:"Web 全栈与数据库",ops:"Linux 运维与云原生部署","web-pentest":"Web 渗透与 SQL 注入",audit:"源码审计与组件安全",intranet:"内网攻防与红队对抗",binary:"CTF 与二进制分析",mobile:"移动应用与小程序安全",blue:"蓝队研判与应急响应",forensics:"数字取证与安全防护",cloud:"云与容器安全",governance:"数据治理与等级保护",genai:"生成式 AI 与辅助开发",agent:"AI Agent 与安全评估",analytics:"数据清洗、分析与可视化",deep:"深度学习与论文阅读"};
function topicPhoto(skill){return skillPhotos[skill.source||skill.id]||activeCategory?.photo||"route-code";}
let activeCategory=null,activeSkill=null,categoryTrigger=null,returningToCategory=false;
function photo(name,className,alt){const img=el("img",className);img.src="assets/"+name+".webp";img.alt=alt;img.width=600;img.height=320;img.loading="lazy";return img;}
function refresh(){
 for(const q of questions){const item=byId.get(q.id);if(!item)continue;const done=completed.has(q.id);item.state.textContent=done?"已完成":"";item.details.classList.toggle("bank-solved",done);}
 get("bank-completed").textContent=completed.size+" / "+questions.length;
 get("bank-progress").max=questions.length;get("bank-progress").value=completed.size;
 document.querySelectorAll("[data-category-progress]").forEach(node=>{const items=questionBank[Number(node.dataset.categoryProgress)].skills.flatMap(s=>s.questions);node.textContent=items.filter(q=>completed.has(q.id)).length+" / "+items.length+" 已完成";});
 document.querySelectorAll("[data-skill-progress]").forEach(node=>{const skill=questionBank.flatMap(c=>c.skills).find(s=>s.id===node.dataset.skillProgress);node.textContent=skill.questions.filter(q=>completed.has(q.id)).length+" / 3 已完成";});
}
function openCategory(category,trigger){
 activeCategory=category;categoryTrigger=trigger || categoryTrigger;
 get("bank-category-title").textContent=category.group;
 get("bank-category-description").textContent=category.skills.length+" 个细分专题，共 "+category.skills.reduce((n,s)=>n+s.questions.length,0)+" 道练习。按知识点选择，逐步完成验证。";
 const list=get("bank-category-skills");list.replaceChildren();
 for(const [i,skill] of category.skills.entries()){
  const button=el("button","bank-skill-tile");button.type="button";button.dataset.skill=skill.id;button.setAttribute("aria-haspopup","dialog");
  const copy=el("span","bank-skill-tile-copy");copy.append(el("span","bank-skill-index",String(i+1).padStart(2,"0")+" / SKILL"),el("strong",null,skill.name));
  const tags=el("span","bank-skill-count");for(const level of [...new Set(skill.questions.map(q=>q.level))].sort())tags.append(el("span",null,levels[level]));
  const progress=el("span","bank-skill-progress");progress.dataset.skillProgress=skill.id;
  copy.append(tags,progress);
  button.append(photo(topicPhoto(skill),"bank-skill-photo",skill.name+"实验场景"),copy,el("span","bank-tile-arrow","↗"));
  button.addEventListener("click",()=>openSkill(skill));list.append(button);
 }
 refresh();categoryDialog.showModal();list.scrollTop=0;
}
function openSkill(skill,questionId){
 activeSkill=skill;
 get("bank-skill-title").textContent=skill.name;
 get("bank-skill-breadcrumb").textContent=activeCategory.group+" / "+skill.questions.length+" 道练习";
 const cover=get("bank-skill-cover");cover.src="assets/"+topicPhoto(skill)+".webp";cover.alt=skill.name+"实验场景";
 const list=get("bank-dialog-list");for(const node of [...list.children])get("bank-parking").append(node);
 for(const [i,q] of [...skill.questions].sort((a,b)=>a.level-b.level||Number(!!a.lab)-Number(!!b.lab)).entries()){const node=byId.get(q.id).details;node.querySelector(".bank-number").textContent=String(i+1).padStart(2,"0");node.open=q.id===questionId;list.append(node);}
 if(categoryDialog.open)categoryDialog.close();if(!skillDialog.open)skillDialog.showModal();document.querySelector(".bank-exercise-scroll").scrollTop=0;
 if(questionId)requestAnimationFrame(()=>byId.get(questionId).details.scrollIntoView({block:"nearest"}));
 refresh();
}
questionBank.forEach((category,i)=>{
 const visual={photo:category.photo,label:category.label,copy:category.description};const button=el("button","bank-category category-"+i);button.type="button";button.setAttribute("aria-haspopup","dialog");
 const media=el("span","bank-category-media");const diagram=el("img","bank-category-diagram");diagram.src="assets/category-"+category.id+".svg";diagram.alt="";diagram.width=480;diagram.height=360;diagram.loading="lazy";media.append(photo(visual.photo,"bank-category-photo",category.group+"实践工作台"),diagram,el("span","bank-category-label",String(i+1).padStart(2,"0")+" / "+visual.label.split(" / ")[0]));
 const copy=el("span","bank-category-content");const heading=el("span","bank-category-heading");heading.append(el("strong",null,category.group),el("span",null,"↗"));
 const tags=el("span","bank-category-tags");for(const skill of category.skills)tags.append(el("span",null,skill.name));
 const footer=el("span","bank-category-footer");const progress=el("span","bank-category-progress");progress.dataset.categoryProgress=i;
 footer.append(el("strong",null,category.skills.length+" 专题 · "+category.skills.reduce((n,s)=>n+s.questions.length,0)+" 题"),progress);
 copy.append(heading,el("span","bank-category-copy",visual.copy),tags,footer);
 button.append(media,copy);button.addEventListener("click",()=>openCategory(category,button));get("bank-category-grid").append(button);
});
questions.forEach(renderQuestion);readProgress();refresh();
get("bank-dialog-back").addEventListener("click",()=>{returningToCategory=true;skillDialog.close();});
document.querySelector('[data-close="category"]').addEventListener("click",()=>categoryDialog.close());
document.querySelector('[data-close="skill"]').addEventListener("click",()=>skillDialog.close());
categoryDialog.addEventListener("close",()=>{if(!skillDialog.open)categoryTrigger?.focus();});
skillDialog.addEventListener("close",()=>{
 for(const q of questions)get("bank-parking").append(byId.get(q.id).details);
 if(returningToCategory){returningToCategory=false;openCategory(activeCategory,categoryTrigger);(get("bank-category-skills").querySelector('[data-skill="'+activeSkill.id+'"]')||get("bank-category-skills").querySelector("button"))?.focus();}else categoryTrigger?.focus();
});
for(const dialog of [categoryDialog,skillDialog]){dialog.addEventListener("click",event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});}
function openLinkedQuestion(){
 const qId=location.hash.startsWith("#q-")?location.hash.slice(3):null;
 const requested=new URLSearchParams(location.search).get("skill");
 for(const [i,category] of questionBank.entries()){let skill=category.skills.find(s=>s.id===requested||s.questions.some(q=>q.id===qId));
  if(!skill&&requested){const matching=questionBank.flatMap(c=>c.skills).filter(s=>s.source===requested);if(matching.length&&matching.some(s=>category.skills.includes(s)))skill={id:requested,source:requested,name:sourceNames[requested]||matching[0].name,questions:matching.flatMap(s=>s.questions)};}
  if(!skill)continue;
  if(categoryDialog.open)categoryDialog.close();activeCategory=category;categoryTrigger=get("bank-category-grid").children[i];openSkill(skill,qId);break;
 }
}
openLinkedQuestion();window.addEventListener("hashchange",openLinkedQuestion);window.addEventListener("pageshow",()=>{readProgress();refresh();});window.addEventListener("storage",()=>{readProgress();refresh();});
