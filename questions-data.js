"use strict";

const questionBank = [
  {
    "group": "开发与基础",
    "skills": [
      {
        "id": "system",
        "name": "系统管理与网络工程",
        "questions": [
          {
            "id": "vlan-gateway",
            "level": 1,
            "title": "能通同网段，为什么出不了网？",
            "prompt": "终端 A 是 192.168.10.25/24，能访问同 VLAN 的服务器，默认网关却配成了 192.168.20.1。交换机没有端口报错。指出最可能的原因，并写出修复后的两步验证。\n\nFlag 任务：写出需要修正的网络配置项，英文两个单词，用下划线连接。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{default_gateway}",
            "explanation": "默认网关通常须与终端在同一链路的子网内。核对 VLAN 10 实际网关地址并修改终端配置；先确认能解析并访问正确网关，再访问已知跨网段的 IP，必要时最后单独查 DNS。"
          },
          {
            "id": "dual-vlan",
            "level": 2,
            "title": "跨 VLAN 的断点在哪里？",
            "prompt": "VLAN 10 和 20 的终端各自都能访问本 VLAN 网关，但 10→20 的新连接超时。路由器上两个网段均为直连，VLAN 20→10 可以主动连接。列出最有区分力的两处检查，说明各自预期看到什么。\n\nFlag 任务：写出应在目标端抓包确认是否到达的 TCP 握手报文名称，三个小写字母。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{syn}",
            "explanation": "先核对跨 VLAN 的 ACL 或状态防火墙，检查 10→20 新建连接是否命中拒绝计数。再在 VLAN 20 终端或接口抓包：看 SYN 是否到达、主机是否回复。收到 SYN 却不回优先检查主机防火墙或服务监听。"
          },
          {
            "id": "subnet-host",
            "level": 1,
            "title": "子网里的最后一台主机",
            "prompt": "主机 192.168.40.74/27 所在子网，最后一个可用 IPv4 地址是什么？flag 内只写地址。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{192.168.40.94}",
            "explanation": "/27 每段 32 个地址，范围 .64–.95，广播 .95，最后可用 .94。"
          },
          {
            "id": "route-longest",
            "level": 2,
            "title": "最长前缀命中",
            "prompt": "路由表：10.0.0.0/8 → A；10.12.0.0/16 → B；10.12.8.0/24 → C。目的 10.12.8.19 应走哪条下一跳？flag 内填大写 A、B 或 C。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{C}",
            "explanation": "三条均匹配，/24 最长，选 C。"
          }
        ]
      },
      {
        "id": "python",
        "name": "Python 编程与网络工具",
        "questions": [
          {
            "id": "split-log",
            "level": 1,
            "title": "从日志提取异常地址",
            "prompt": "给定三行：\n10.0.0.2 GET /health 200\n10.0.0.8 GET /admin 403\n10.0.0.8 POST /admin 500\n用 Python 统计状态码大于等于 400 的来源 IP 次数，并跳过格式错误行。写出示例输出。\n\nFlag 任务：提交异常来源 IP 与次数，以一个下划线连接。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{10.0.0.8_2}",
            "explanation": "逐行 split，校验有 4 列、状态码可转换为整数；满足条件时用字典或 Counter 累加。样例输出为 {'10.0.0.8': 2}。"
          },
          {
            "id": "bounded-fetch",
            "level": 2,
            "title": "让并发探测有上限",
            "prompt": "离线测试桩提供 5,000 个地址，单次探测可能超时。设计一个 Python 调度器：最多 20 个在途请求，每条结果保留原地址，单个错误不影响其他任务。写出关键伪代码和验证方法。\n\nFlag 任务：提交允许的最大在途请求数。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{20}",
            "explanation": "可建 20 个协程消费者从队列取任务，对单次 I/O 设置超时，在任务内捕获预期异常并记录地址与状态；消费者持续取下一条。用测试桩故意延迟和报错，核对最高在途数与结果总量。"
          },
          {
            "id": "python-slice",
            "level": 1,
            "title": "切片留下了什么",
            "prompt": "执行 s=\"security\"; print(s[1:7:2])。flag 内填打印结果，保持小写。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{eui}",
            "explanation": "索引 1、3、5 分别为 e、u、i。"
          },
          {
            "id": "python-dedup",
            "level": 2,
            "title": "保留最新记录",
            "prompt": "记录为 (id,ts,value)：(a,10,3),(b,8,4),(a,12,7),(b,9,5)。按 id 保留 ts 最大的一条，再对 value 求和。flag 内填整数。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{12}",
            "explanation": "a 保留 7，b 保留 5，合计 12。"
          }
        ]
      },
      {
        "id": "fullstack",
        "name": "Web 全栈与数据库",
        "questions": [
          {
            "id": "order-query",
            "level": 1,
            "title": "用一条 SQL 找到欠款订单",
            "prompt": "orders(id, user_id, status, amount) 中，写出查询用户 7 的 pending 订单总金额的 SQL；如果一条都没有，结果仍需是 0。\n\nFlag 任务：提交让空聚合结果变为 0 的 SQL 函数名，小写。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{coalesce}",
            "explanation": "SELECT COALESCE(SUM(amount), 0) FROM orders WHERE user_id = 7 AND status = 'pending'; 在应用中用绑定参数传入用户 ID。"
          },
          {
            "id": "stock-race",
            "level": 2,
            "title": "库存只有一件，为什么卖出两单？",
            "prompt": "两个请求同时读到 stock=1，都创建订单后再把库存改为 0。设计一个数据库内可验证的修复，说明失败请求如何响应、哪些写入必须在同一事务。\n\nFlag 任务：把条件“stock 大于 0”编码成 stock_gt_0 形式提交。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{stock_gt_0}",
            "explanation": "在事务中执行 UPDATE items SET stock=stock-1 WHERE id=? AND stock>0，检查受影响行数；仅更新成功才插入订单并提交。插入失败应回滚扣减；没库存的请求返回明确的售罄结果。用并发请求验证最多一单成功。"
          },
          {
            "id": "sql-join-count",
            "level": 1,
            "title": "LEFT JOIN 的计数",
            "prompt": "users 有 id=1、2、3；orders 的 user_id 为 1、1、2。LEFT JOIN 后按用户分组执行 COUNT(orders.user_id)，按用户 id 升序输出。flag 内用下划线连接三个计数。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{2_1_0}",
            "explanation": "匹配计数依次 2、1、0；COUNT(列) 不统计 NULL。"
          },
          {
            "id": "transaction-retry",
            "level": 2,
            "title": "可重试的事务",
            "prompt": "固定演练规则：SQLSTATE 40001=序列化失败，23505=唯一键冲突，22012=除零。哪一种应在确认事务回滚后重试整个事务？flag 内提交五位状态码。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{40001}",
            "explanation": "序列化失败可重试整个事务；不能仅重复最后一条语句。"
          }
        ]
      },
      {
        "id": "ops",
        "name": "Linux 运维与云原生部署",
        "questions": [
          {
            "id": "proxy-502",
            "level": 1,
            "title": "Nginx 能打开，接口却报 502",
            "prompt": "Nginx 转发 /api 到 127.0.0.1:8000，直接请求该地址返回连接拒绝。给出两个优先检查项和一条验证思路。\n\nFlag 任务：提交 Linux 中查看监听套接字的两个字母工具名。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{ss}",
            "explanation": "先用 ss -ltnp 确认是否监听 8000，再查看应用进程状态与启动日志，核对绑定地址和端口。恢复后先 curl 上游本地地址，再从 Nginx 入口验证。"
          },
          {
            "id": "rollout",
            "level": 2,
            "title": "无中断发布遇到冷启动",
            "prompt": "服务有 3 个副本，新容器需要 30 秒才可接流量。上线时，旧副本先被缩减，部分请求失败。提出滚动更新和探针设置的调整，并说明如何验收。\n\nFlag 任务：提交决定 Pod 是否接收业务流量的探针英文类型，不带 probe，小写。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{readiness}",
            "explanation": "用 readiness 控制新副本何时接流量，必要时加 startup probe 容纳冷启动；在资源允许时设 maxUnavailable: 0 并保留可用的 maxSurge。发布时监测 Ready 副本、请求错误率和回滚条件。"
          },
          {
            "id": "linux-mode",
            "level": 1,
            "title": "权限位解码",
            "prompt": "文件权限需要所有者读写、组只读、其他人无权限。flag 内填三位八进制 chmod 模式。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{640}",
            "explanation": "所有者 4+2=6，组 4，其他 0。"
          },
          {
            "id": "rollout-math",
            "level": 2,
            "title": "滚动更新的最坏情况",
            "prompt": "Deployment 期望 8 副本，maxSurge=25%，maxUnavailable=0，假设没有终止中的 Pod 且配额充足。更新期间允许同时存在的副本上限是多少？flag 内填整数。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{10}",
            "explanation": "25%×8=2 个额外副本，总计 10。"
          }
        ]
      }
    ]
  },
  {
    "group": "漏洞分析与攻防",
    "skills": [
      {
        "id": "web-pentest",
        "name": "Web 渗透测试与漏洞挖掘",
        "questions": [
          {
            "id": "invoice-auth",
            "level": 1,
            "title": "发票 ID 能改，权限也能绕过吗？",
            "prompt": "在授权靶场，用普通账号 A 登录后 GET /invoices/41 返回自己的发票。账号 B 的发票 ID 是 42。设计最少的对照请求，验证是否存在对象级越权，并给出服务端修复原则。\n\nFlag 任务：提交应在对象读取时执行的授权类型：object、level、authorization，用下划线连接。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{object_level_authorization}",
            "explanation": "保持 A 的会话，访问 41 做正例，再访问 42 验证是否返回 B 的对象；用 B 访问 42 确认它确实存在。服务端在读取对象时校验当前用户或租户对该对象的权限，不能仅验证登录。"
          },
          {
            "id": "silent-archive",
            "level": 3,
            "title": "静默归档室",
            "prompt": "交互靶场只返回「有记录」或「无记录」。找出保存与回放之间的注入点，识别生效的归档版本，恢复完整 flag。需在靶场内验证 flag。",
            "answer": null,
            "lab": "challenge.html"
          },
          {
            "id": "idor-evidence",
            "level": 1,
            "title": "找出越权证据",
            "prompt": "自有靶场：A→自己的订单返回 200；B→自己的订单返回 200；A→B 的订单返回 200 且正文含 B 的收货地址。按常见缩写，这是什么对象引用漏洞？flag 内填小写四字母。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{idor}",
            "explanation": "用其他用户对象 ID 访问到未授权数据，构成 IDOR。"
          },
          {
            "id": "sqli-offline-count",
            "level": 3,
            "title": "离线盲注记录",
            "prompt": "授权 SQLite 题库的布尔查询结果：length(secret)=8 为真；substr(secret,1,4)='lab_' 为真；CAST(substr(secret,5) AS INTEGER)=2468 为真。已知后四位均为数字且没有前导零。恢复 secret，填入 flag。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{lab_2468}",
            "explanation": "长度 8，前缀 lab_ 四字符，剩余四位是 2468。"
          }
        ]
      },
      {
        "id": "audit",
        "name": "源码审计与组件安全",
        "questions": [
          {
            "id": "path-review",
            "level": 1,
            "title": "审计一段下载逻辑",
            "prompt": "接口直接将 baseDir 与用户传来的 name 拼接后读取文件。画出输入到文件读取的路径，并解释只检查字符串是否包含 .. 为什么不足。\n\nFlag 任务：提交目录包含检查前应获得的路径类型：规范路径，英文 canonical 与 path 用下划线连接。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{canonical_path}",
            "explanation": "从请求参数到路径拼接再到打开文件。应使用受控文件 ID，或解析规范路径后按路径组件确认目标处于允许目录，并处理符号链接与检查/打开之间的竞态；不能只依赖字符黑名单。"
          },
          {
            "id": "dependency-triage",
            "level": 3,
            "title": "扫描器报警，但代码走不到？",
            "prompt": "组件版本命中反序列化风险，运行时发现同时存在两个版本，业务只声称使用安全入口。给出从制品到调用链的核实方案，区分已证实可达与仅发现组件。\n\nFlag 任务：提交判断外部输入能否走到危险方法的属性英文名：可达性，名词小写。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{reachability}",
            "explanation": "从部署制品和类加载记录确认实际生效版本；追踪外部输入经过路由、转换器到危险方法的路径与配置条件。在隔离环境用最小样例验证并记录证据。无法证明可达就标为待核实，分开记录组件存在、调用可达和影响。"
          },
          {
            "id": "source-sink",
            "level": 1,
            "title": "污点流终点",
            "prompt": "伪代码：p=request.query[\"name\"]; f=base+p; data=open(f).read()。本题把“真正进行文件读取的调用”定义为 sink。flag 内提交 open，不带括号。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{open}",
            "explanation": "用户可控参数经拼接进入 open，是文件访问风险点。"
          },
          {
            "id": "path-sibling",
            "level": 3,
            "title": "前缀检查漏了谁",
            "prompt": "允许目录 /srv/data，程序只用 resolvedPath.startswith(\"/srv/data\") 判断。候选：/srv/tmp/x、/srv/database/key、/var/data/x。哪条不在允许目录内却会通过？flag 内保留完整路径。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{/srv/database/key}",
            "explanation": "字符串前缀相同不代表路径组件相同，database 是 data 的同级目录。"
          }
        ]
      },
      {
        "id": "intranet",
        "name": "内网攻防与红队对抗",
        "questions": [
          {
            "id": "network-zones",
            "level": 1,
            "title": "画出办公区到数据库的边界",
            "prompt": "授权实验有办公区、应用区和数据库区。需求只有办公终端访问应用 HTTPS、应用服务访问数据库。写出允许方向和默认拒绝原则。\n\nFlag 任务：假设应用 HTTPS 使用标准端口，提交办公区访问应用允许的目的端口数字。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{443}",
            "explanation": "办公区→应用区只允许 HTTPS；应用区→数据库区只允许指定应用地址和数据库端口。其余新建连接默认拒绝，已有会话的响应流量按状态放行；管理流量独立约束。"
          },
          {
            "id": "lateral-timeline",
            "level": 3,
            "title": "区分运维作业与横向移动",
            "prompt": "模拟演练日志：工作站 W 使用服务账号登录应用服务器 A，5 分钟后 A 向三台数据库主机发起 SMB 连接。该账号平时只在调度机运行。给出时间线、两类验证证据和隔离顺序。\n\nFlag 任务：提交日志中应用服务器访问数据库主机使用的协议，小写。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{smb}",
            "explanation": "先关联 W 上的凭据使用与 A 上的认证、进程和 SMB 连接；核对调度记录及授权窗口，检查各主机的认证与共享访问结果。按影响先阻止可疑会话和扩散，保留证据后处置服务账号，评估依赖并轮换凭据。"
          },
          {
            "id": "acl-order",
            "level": 1,
            "title": "第一条匹配规则",
            "prompt": "ACL 按顺序首条匹配：1 deny 10.2.0.0/16 → DB:445；2 allow 10.2.3.0/24 → DB:445；3 deny any。10.2.3.8 连接 DB:445 命中哪条？flag 内填规则号。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{1}",
            "explanation": "第一条已覆盖该源地址，后面的允许规则不再参与。"
          },
          {
            "id": "timeline-host",
            "level": 3,
            "title": "谁最先偏离基线",
            "prompt": "正常调度源仅 JOB01。记录：09:00 JOB01→APP01；09:03 WS07→APP01，二者均使用 svc_job；09:04 APP01→DB01。按“最早来自非调度源”的规则，提交待核实源主机名，保持大写。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{WS07}",
            "explanation": "09:03 的 WS07 偏离调度源基线；仍需后续证据核实，不能仅凭此认定入侵。"
          }
        ]
      },
      {
        "id": "binary",
        "name": "CTF 与二进制分析",
        "questions": [
          {
            "id": "xor-three",
            "level": 1,
            "title": "还原三字节校验",
            "prompt": "一个练习程序逐字节把输入与 0x23 异或，结果要求等于十六进制字节 62 61 60。求原始 ASCII 输入，并解释为什么同一运算可还原。\n\nFlag 任务：提交还原的三个 ASCII 字符，保持大写。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{ABC}",
            "explanation": "0x62 ^ 0x23 = 0x41，0x61 ^ 0x23 = 0x42，0x60 ^ 0x23 = 0x43，所以输入是 ABC。因为同一字节异或两次会抵消。"
          },
          {
            "id": "stack-evidence",
            "level": 3,
            "title": "崩溃是否意味着可以控制返回地址？",
            "prompt": "本地练习程序读取超长输入后崩溃，启用了栈保护和 NX。设计一套用调试器确认覆盖范围的实验，区分栈保护主动中止与实际跳转异常。\n\nFlag 任务：提交用于检测栈破坏的保护值英文名，小写。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{canary}",
            "explanation": "用已知长度和有序标记递增输入，观察缓冲区、canary、保存的返回地址及故障指令。在栈检查失败处理处中断，区分保护触发的中止与 RET 后的非法目标。记录偏移与重现条件，不能只凭崩溃判断控制流可控。"
          },
          {
            "id": "rotate-byte",
            "level": 1,
            "title": "一字节循环移位",
            "prompt": "八位无符号数 0x96 循环左移 3 位，结果是多少？flag 内填两位小写十六进制，不带 0x。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{b4}",
            "explanation": "10010110 循环左移 3 位得到 10110100，即 b4。"
          },
          {
            "id": "little-endian",
            "level": 3,
            "title": "栈上的四个字节",
            "prompt": "内存地址由低到高存放 78 56 34 12。以小端序读取一个无符号 32 位整数。flag 内填八位小写十六进制，不带 0x。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{12345678}",
            "explanation": "低地址字节是低有效位，整数为 0x12345678。"
          }
        ]
      },
      {
        "id": "mobile",
        "name": "移动应用与小程序安全",
        "questions": [
          {
            "id": "apk-survey",
            "level": 1,
            "title": "从 APK 找到入口与权限",
            "prompt": "只做静态检查：拿到自己的调试 APK，写出定位应用入口、导出组件和敏感权限的步骤，并说明为什么声明权限不等于使用权限。\n\nFlag 任务：提交 APK 中声明组件和权限的清单文件名，保持大小写。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{AndroidManifest.xml}",
            "explanation": "解析 AndroidManifest，查找 MAIN/LAUNCHER 入口、组件 exported 和权限配置；再搜索相关 API 调用和路径。清单只说明能力或声明，实际使用还需检查运行路径、系统版本与授权状态。"
          },
          {
            "id": "miniapp-trust",
            "level": 2,
            "title": "前端隐藏按钮能保护接口吗？",
            "prompt": "自有测试小程序把退款按钮只展示给管理员，普通用户仍能在本地看到退款接口路径。设计普通账号和管理员的对照验证，给出两层后端检查。\n\nFlag 任务：前端与服务端二选一：真正执行退款权限校验的位置，用英文 server 或 frontend。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{server}",
            "explanation": "以普通账号提交对同一授权测试订单的退款请求，再与管理员正例对比，并覆盖跨租户对象。后端应检查角色或细粒度权限，同时核验当前租户和订单归属、订单状态，记录审计。"
          },
          {
            "id": "exported-component",
            "level": 1,
            "title": "谁可以从外部启动",
            "prompt": "自有 APK 的组件：A exported=false；B exported=true 且无 permission；C exported=true 且受 signature 权限保护。不具备任何签名权限的其他应用可直接调用哪一个？flag 内填大写组件字母。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{B}",
            "explanation": "B 对外导出且没有额外权限门槛。"
          },
          {
            "id": "refund-tenant",
            "level": 2,
            "title": "退款授权的缺失项",
            "prompt": "测试 API 校验了管理员角色与订单 paid 状态，但未校验订单所属租户。A 租户管理员可退款 B 租户订单。flag 内提交缺失的 tenant_id 字段名。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{tenant_id}",
            "explanation": "角色和状态不足以替代对象归属校验，需要限制当前 tenant_id。"
          }
        ]
      }
    ]
  },
  {
    "group": "检测与响应",
    "skills": [
      {
        "id": "blue",
        "name": "蓝队研判与应急响应",
        "questions": [
          {
            "id": "alert-first",
            "level": 1,
            "title": "告警来了先看哪三条线索？",
            "prompt": "主机告警显示办公软件启动了脚本解释器，并出现出站连接。列出能快速判断是否异常的三类证据。\n\nFlag 任务：提交追溯办公软件如何启动解释器所需的结构英文名：进程树，两个单词用下划线连接。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{process_tree}",
            "explanation": "查看完整进程树与命令行、脚本或文档的来源及哈希、出站目的与时间。与相同岗位的正常使用和变更记录比较，保留原始日志。"
          },
          {
            "id": "ransom-scope",
            "level": 3,
            "title": "勒索事件里先阻断哪一环？",
            "prompt": "三台主机文件被批量改写，共享存储还在写入，备份服务未受影响但在线。给出先后顺序：止损、保全证据、确定范围、恢复。\n\nFlag 任务：提交阻断受感染终端联网的首要动作英文动词：隔离，小写。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{isolate}",
            "explanation": "优先隔离受影响终端、暂停可疑账号对共享的写权限并保护备份。保存事件日志和关键易失证据，沿账号、共享访问、进程和时间线排查范围。确认入侵入口被处置后，从干净备份分批恢复并验证。"
          },
          {
            "id": "process-parent",
            "level": 1,
            "title": "追溯可疑父进程",
            "prompt": "模拟进程日志：pid=40 name=winword.exe ppid=10；pid=71 name=powershell.exe ppid=40；pid=80 name=whoami.exe ppid=71。PowerShell 的直接父进程名称是什么？flag 内填完整小写文件名。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{winword.exe}",
            "explanation": "ppid=40，对应 winword.exe。"
          },
          {
            "id": "alert-dedupe",
            "level": 3,
            "title": "合并同一次事件",
            "prompt": "按 host+sha256 合并告警：H1/x、H1/x、H2/x、H1/y、H2/x。合并后有几个独立组合？flag 内填整数。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{3}",
            "explanation": "独立组合为 H1/x、H2/x、H1/y。"
          }
        ]
      },
      {
        "id": "forensics",
        "name": "数字取证与安全防护",
        "questions": [
          {
            "id": "hash-chain",
            "level": 1,
            "title": "证明工作副本没被改过",
            "prompt": "要分析一份练习磁盘镜像，给出复制、校验和操作留痕的步骤。\n\nFlag 任务：提交用于校验镜像一致性的算法，去掉连字符，英文小写加数字。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{sha256}",
            "explanation": "保护原始镜像，记录来源、接收时间和操作者。计算原件与副本的 SHA-256 并比对，使用校验通过的工作副本分析，保存工具、时间和操作日志。"
          },
          {
            "id": "timeline-offset",
            "level": 2,
            "title": "三个日志时间不一致",
            "prompt": "Web 日志使用 UTC，终端日志使用 UTC+8，文件系统时间可能有 90 秒时钟偏差。如何建立可信时间线并避免把近邻事件误判为因果关系？\n\nFlag 任务：提交统一时间线使用的世界协调时英文缩写，小写。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{utc}",
            "explanation": "先记录来源时区、精度和采集时间，把各时间转换到统一基准；用可关联的共同事件估计偏差并标记不确定区间。用请求 ID、进程父子关系和主体标识补足因果证据。"
          },
          {
            "id": "timezone-convert",
            "level": 1,
            "title": "统一到 UTC",
            "prompt": "日志为 2026-11-09 09:12:30+08:00。转换为 UTC，flag 内使用 YYYYMMDD_HHMMSS。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{20261109_011230}",
            "explanation": "UTC+8 减去 8 小时，得到当日 01:12:30。"
          },
          {
            "id": "clock-skew",
            "level": 2,
            "title": "校正主机时钟",
            "prompt": "同一请求的可信服务器时间为 10:00:00，终端日志为 10:01:30。假设终端偏差恒定，终端上的 10:09:00 事件对应服务器几点？flag 内使用 HHMMSS。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{100730}",
            "explanation": "终端快 90 秒，10:09:00 减去 90 秒等于 10:07:30。"
          }
        ]
      },
      {
        "id": "cloud",
        "name": "云与容器安全",
        "questions": [
          {
            "id": "bucket-access",
            "level": 1,
            "title": "公共对象和私有备份怎么分？",
            "prompt": "业务需要公开站点图标，备份只能供备份服务读取。提出存储与权限拆分方案，以及两次应成功和失败的验证。\n\nFlag 任务：私有备份的匿名读取应允许还是拒绝？提交 allow 或 deny。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{deny}",
            "explanation": "公开静态内容与私有备份分离，用独立容器、账户或明确策略分别授权；关闭备份的公共访问，仅授予备份身份所需权限。用匿名身份访问公开对象成功、私有对象失败，并验证合法身份能读取备份。"
          },
          {
            "id": "pod-boundary",
            "level": 3,
            "title": "一个 Pod 的权限有多大？",
            "prompt": "模拟集群内，应用 Pod 挂载服务账号令牌；对应 RoleBinding 允许读取命名空间里的 Secret，同时容器以 root 运行并挂载宿主路径。按风险路径指出三项收敛措施及验证方法。\n\nFlag 任务：提交角色允许读取的 Kubernetes 敏感资源名称，英文复数小写。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{secrets}",
            "explanation": "移除不必要的 Secret 读取权限并核查 RBAC，应用无需访问 API 时关闭令牌自动挂载；以非 root、最少能力运行，移除不必要的 hostPath 或限制为只读最小范围。分别验证服务账号权限、实际挂载和容器身份。"
          },
          {
            "id": "rbac-verbs",
            "level": 1,
            "title": "只读权限的边界",
            "prompt": "服务账号仅允许 get、list pods，不允许其他资源和动作。候选请求：A=list pods；B=delete pods；C=get secrets。哪一个可以通过 RBAC？flag 内填大写选项。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{A}",
            "explanation": "只有 A 同时满足资源与动作权限。"
          },
          {
            "id": "image-pinning",
            "level": 3,
            "title": "镜像为什么变了",
            "prompt": "部署使用 repo/app:latest，相同部署文件两次拉取内容不同。需要用哪个内容寻址标识固定镜像？flag 内填 digest，英文小写。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{digest}",
            "explanation": "可变标签会移动；使用镜像 digest 固定实际内容。"
          }
        ]
      },
      {
        "id": "governance",
        "name": "数据治理与等级保护",
        "questions": [
          {
            "id": "data-class",
            "level": 1,
            "title": "给三类数据制定访问规则",
            "prompt": "某系统包含公开公告、内部运营报表和含个人标识的用户资料。分别给出可访问对象、最少可见字段和日志策略。\n\nFlag 任务：提交“最小权限”的英文原则，两个单词用下划线连接。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{least_privilege}",
            "explanation": "公告可公开并记录发布审批；运营报表仅授权人员可访问，限制导出并记录查询；用户资料按岗位、目的和字段最小授权，脱敏展示，保留访问和导出的审计证据。"
          },
          {
            "id": "control-evidence",
            "level": 2,
            "title": "有制度，如何证明控制在运行？",
            "prompt": "练习系统制度要求离职当日回收权限，抽查发现一个历史账号仍启用。设计证据链和复测办法，区分制度存在、控制生效和例外处理。\n\nFlag 任务：离职账号回收首先需验证账号已被禁用。提交“禁用”的英文动词，小写。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{disable}",
            "explanation": "核对离职触发时间、工单、目录与各系统禁用记录及最近登录；查清历史账号是否有受控例外及审批、有效期。修复后从样本到端到端新用例验证回收及时性，记录失败与补偿动作。"
          },
          {
            "id": "retention",
            "level": 1,
            "title": "保留期到期日",
            "prompt": "实验规则：保存采集日及随后 6 个自然日，第 8 天起删除。数据采集于 2026-11-01，最早删除日是哪天？flag 内使用 YYYYMMDD。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{20261108}",
            "explanation": "保存 11 月 1 日到 7 日，8 日起删除。"
          },
          {
            "id": "access-matrix",
            "level": 2,
            "title": "按岗位最小授权",
            "prompt": "权限矩阵：客服可读脱敏资料；财务可读账单；运营只读汇总。工单要求“客服导出完整身份证”。按现有矩阵是否允许？flag 内提交 allow 或 deny。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{deny}",
            "explanation": "没有完整身份证导出权限，不能凭工单自动扩大权限。"
          }
        ]
      }
    ]
  },
  {
    "group": "AI 与数据",
    "skills": [
      {
        "id": "genai",
        "name": "生成式 AI 与辅助开发",
        "questions": [
          {
            "id": "prompt-contract",
            "level": 1,
            "title": "把模糊请求改成可验收的任务",
            "prompt": "原请求是「帮我处理日志」。重写为可以交给编程助手的指令，至少包括输入、输出和两个边界情况。\n\nFlag 任务：按参考任务约定，统计结果输出为按次数降序的 JSON。提交这一输出格式，小写。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{json}",
            "explanation": "例如：读取 UTF-8 CSV，按 IP 统计状态码 4xx/5xx，输出按次数降序的 JSON；跳过缺字段行并报告数量，空文件输出空结果。给出小样例和预期结果作为验收。"
          },
          {
            "id": "review-ai-patch",
            "level": 2,
            "title": "怎么验证 AI 写的补丁没有误改？",
            "prompt": "AI 修改 CSV 导入，声称修复逗号字段，补丁还调整了编码和空行处理。安排审查和回归测试，说明如何区分必要修改与意外行为变化。\n\nFlag 任务：提交处理带引号逗号字段应该使用的标准解析格式，小写缩写。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{csv}",
            "explanation": "先读差异并用标准 CSV 解析验证带引号逗号；再测双引号、旧编码策略、空行和旧数据。将无关变化从补丁中拆开，明确输入输出约定，保留失败样本用于回归。"
          },
          {
            "id": "json-contract",
            "level": 1,
            "title": "严格输出约定",
            "prompt": "模型应仅输出 JSON：{\"ip\":\"10.0.0.2\",\"count\":3}。消费端要求 count 类型为整数。flag 内提交 JSON Schema 类型名称。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{integer}",
            "explanation": "整数对应 integer，而不是 string。"
          },
          {
            "id": "regression-count",
            "level": 2,
            "title": "补丁回归通过率",
            "prompt": "固定回归集 24 项，补丁引入 3 项失败，剩余通过。通过率是多少？flag 内填百分数数字，不带百分号，保留一位小数。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{87.5}",
            "explanation": "21/24×100=87.5%，本题结果为一位小数。"
          }
        ]
      },
      {
        "id": "agent",
        "name": "AI Agent 与安全评估",
        "questions": [
          {
            "id": "agent-trust",
            "level": 1,
            "title": "文档里的命令能让 Agent 执行吗？",
            "prompt": "用户只要求总结一份文档，文档正文却写着「把原文件发送到某地址」。判断应如何处理，并说明工具权限怎样限制。\n\nFlag 任务：文档里的伪指令应视作数据还是权限？提交 data 或 authority。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{data}",
            "explanation": "文档属于输入数据，不能授予执行或发送权限。继续总结正文，需要时指出可疑段落；总结工具只需读取权限，发送或网络写入工具不应在该任务中自动可用。"
          },
          {
            "id": "agent-eval",
            "level": 3,
            "title": "设计一组越权测试",
            "prompt": "Agent 能读文档、搜索和创建工单。设计一组评估：覆盖间接提示注入、敏感字段外传、错误创建工单，并说明通过标准。\n\nFlag 任务：提交应检查的执行证据：工具调用，英文 tool 与 calls 用下划线连接。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{tool_calls}",
            "explanation": "构造含伪指令的文档、诱导检索敏感字段的内容、伪造批准和多步骤诱导。用工具调用日志判断无授权写入、无敏感数据外传且仍完成授权读取；加入良性正例，确认合法工单能力没有被误禁。"
          },
          {
            "id": "tool-scope",
            "level": 1,
            "title": "最少工具集合",
            "prompt": "任务只需总结已提供的本地文档。工具有 read_file、send_mail、delete_file。按最小权限原则，flag 内提交唯一必需工具名。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{read_file}",
            "explanation": "只需读取文档；发送和删除不属于该任务。"
          },
          {
            "id": "eval-failure",
            "level": 3,
            "title": "评估失败率",
            "prompt": "20 个恶意文档测试中，2 次发生未经授权的写入，3 次拒绝总结但未写入，其他正常总结且未写入。仅按“未经授权写入率”计分，flag 内填百分数数字，不带百分号。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{10}",
            "explanation": "未经授权写入为 2/20=10%；任务拒绝另记可用性指标。"
          }
        ]
      },
      {
        "id": "analytics",
        "name": "数据清洗、分析与可视化",
        "questions": [
          {
            "id": "clean-events",
            "level": 1,
            "title": "重复和缺失怎么影响告警数量？",
            "prompt": "样例有 (a, 10:00, high)、(a, 10:00, high)、(b, 10:04, 空)、(c, 10:08, low)。假设事件 ID 唯一。给出清洗后的事件数与已知 high 占比。\n\nFlag 任务：提交去重后总数与 high 占已知严重性比例，用下划线连接；比例用最简分数。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{3_1/2}",
            "explanation": "按事件 ID 去重得到 3 条；严重性缺失的 b 单独标为未知。已知严重性 2 条，high 占已知 1/2；若用全量作分母，需写明 high 占全部 1/3。"
          },
          {
            "id": "time-leak",
            "level": 2,
            "title": "为什么模型离线很准，上线却失灵？",
            "prompt": "预测次日事件量时，训练前对全部日期做了标准化，并随机划分训练和验证集。指出两处可能的信息泄漏，设计一套时间验证方案。\n\nFlag 任务：预处理参数只能在训练集还是全量数据上拟合？提交 train 或 all。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{train}",
            "explanation": "按时间先切分数据，只在每个训练窗口估计预处理参数，并应用到后续验证窗口。使用滚动或扩展窗口；构造特征时只用预测时刻之前能取得的数据，与简单基线比较。"
          },
          {
            "id": "median",
            "level": 1,
            "title": "异常值下的中位数",
            "prompt": "请求时延（毫秒）：10、12、13、15、900。flag 内填中位数数字。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{13}",
            "explanation": "排序后第三个数为 13，中位数较少受 900 的影响。"
          },
          {
            "id": "precision-recall",
            "level": 2,
            "title": "精确率与召回率",
            "prompt": "TP=12，FP=3，FN=8。计算 precision 与 recall，flag 内用下划线连接两个整数百分数，不带百分号。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{80_60}",
            "explanation": "precision=12/15=80%，recall=12/20=60%。"
          }
        ]
      },
      {
        "id": "deep",
        "name": "深度学习与论文阅读",
        "questions": [
          {
            "id": "overfit-curve",
            "level": 1,
            "title": "读懂两条损失曲线",
            "prompt": "第 3、6、9 轮训练损失为 0.54、0.31、0.18；验证损失为 0.59、0.52、0.71。选择目前较好的检查点并给出理由。\n\nFlag 任务：提交三个观测点中验证损失最低的轮数数字。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{6}",
            "explanation": "在三个已观测检查点中选第 6 轮，因为验证损失最低。第 9 轮训练继续变好而验证变差，提示过拟合；用早停或正则化改善，并用独立测试集最终评估。"
          },
          {
            "id": "paper-ablation",
            "level": 2,
            "title": "复现论文的消融实验",
            "prompt": "论文说模块 X 带来准确率提升，但加入 X 的实验训练轮数也更长。设计一套能检验模块贡献的对照，说明怎样报告随机波动。\n\nFlag 任务：提交模块对照中必须保持一致的训练预算，英文 training 与 budget 用下划线连接。 将结果放入 flag{...}，不要加入额外空格。",
            "answer": "flag{training_budget}",
            "explanation": "固定数据划分、训练预算、优化器和评估流程，只改变模块 X；可加等预算的基线。用多组相同随机种子成对比较，报告平均值、离散程度与单次结果，并记录环境和超参数。"
          },
          {
            "id": "conv-shape",
            "level": 1,
            "title": "卷积输出尺寸",
            "prompt": "输入宽度 32，卷积核 3，padding=1，stride=2，dilation=1。按 floor((W+2P-K)/S)+1 计算输出宽度。flag 内填整数。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{16}",
            "explanation": "floor((32+2-3)/2)+1=16。"
          },
          {
            "id": "paired-ablation",
            "level": 2,
            "title": "成对消融差值",
            "prompt": "三个相同种子下，基线准确率 80、82、81；新模块为 82、83、84（均为百分数）。平均提升多少个百分点？flag 内填整数。\n\n统一提交格式：flag{结果}。",
            "answer": "flag{2}",
            "explanation": "差值为 2、1、3，平均 2 个百分点。"
          }
        ]
      }
    ]
  }
];
