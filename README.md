# 辣白菜的博客

GitHub Pages 静态站点：首页是可交互的三维安全实验台，采用一屏布局，保留技能地图、学习路线和题库三个插画入口，学习路线入口显示经验条。桌面包含电脑、网络设备、服务器、副屏、台灯、绿植、咖啡杯、笔记本和开发板。

## 本地预览
在项目目录运行 `python -m http.server 8000`，访问 http://localhost:8000/ 。三维首页使用浏览器模块，需要通过 HTTP 预览。

## 页面与文件
- `index.html`、`home-3d.css`：首页结构、响应式布局。
- `home-3d.js`：加载、鼠标/触摸旋转、射线拾取、键盘操作和静态降级。
- `lab-model.js`：程序化建模、材质和部件尺寸；电脑对应技能、网络设备对应路线、服务器对应题库。
- `assets/lab-poster.webp`：从实际三维场景截取的静态预览图。
- `skills.html`：17 项技能与专业证书。
- `roadmap.html`：38 个站点、任务、经验和等级；沿用浏览器原有进度。
- `questions.html`：68 道分级 flag 题目；`challenge.html`：本地 SQLite 练习靶场。
- `motion.css`：全站视觉样式；`motion-pointer.js`：内页鼠标背景。
- `posts/hello.html`：保留的开站手记，首页不使用文章流。

## 三维依赖
本地 vendored Three.js 0.180.0：`vendor/three/`。保留上游 MIT LICENSE；两个 examples 模块仅将 Three.js 导入指向本地同一版本。运行时不访问第三方 CDN。

交互采用按需渲染；停止拖动且场景收敛后停止绘帧，离开视区或后台标签时暂停。减少动态效果、节省流量或 WebGL 不可用时，显示静态预览，所有栏目仍可通过普通链接进入。

## 发布
仓库 main 分支的根目录由 GitHub Pages 发布。提交修改后自动更新：
https://nhanquangak5qof069u5wr-collab.github.io/

