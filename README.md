# 辣白菜的博客

静态个人博客，无需安装依赖。网站名称、简介与内容都可以修改。

## 开启发布

仓库 Settings → Pages → Source 选择 Deploy from a branch，Branch 选择 main，文件夹选择 /(root)，点击 Save。

博客网址：https://nhanquangak5qof069u5wr-collab.github.io/

## 修改和写文章

- `index.html`：首页、文章列表和关于介绍。
- `style.css`：颜色、排版与手机端样式。
- `posts/hello.html`：第一篇开站说明，可作为文章模板。
- `skills.html`：AI 开发与安全攻防技能地图。
- `favicon.svg`：浏览器标签页图标。

在 GitHub 打开文件，点击铅笔编辑，保存 Commit changes 后网站会自动更新。

新增文章：复制 `posts/hello.html` 为一个新文件，例如 `posts/cpp-note.html`，修改标题、描述、日期和正文，再在 `index.html` 中复制一段 `post-row`，更新文章链接、标题与摘要，并修改篇数。

也可以把本文件夹下载到电脑，双击 `index.html` 预览。没有在线管理后台；文章通过修改仓库文件发布。
