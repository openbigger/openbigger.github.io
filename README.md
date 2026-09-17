把 Issue 当成“日记的后台记录”

网页是否显示 = Issue 是否带 diary 标签 + 是否处于 Open 状态

- 在一篇 diary Issue 下点 Add a comment：只是给这篇日记追加留言，不会新建 Issue。网页刷新后，这条留言会出现在该日记下方，也会带留言者 GitHub 名称与头像。
- 点 Close issue：这篇日记会从你的网站消失。因为当前网站只读取 Open 状态的 diary Issue；关闭很适合当作“下架/不公开”，不适合普通的“写完归档”。关闭后其他人通常也不能继续留言。GitHub 的关闭 Issue 说明
- 编辑 Issue 正文、补图、改标题：网页刷新后会跟着更新，不需要 push。
Sub-issue 是 GitHub 用来把大任务拆成子任务的功能，和个人博客没关系。它会创建一个新的真实 Issue，并建立“父子关系”。网站不读取这种父子关系，只看标签：
新建的 Issue 有什么标签	会发生什么
diary	会作为一篇独立日记出现在网页列表
没有 diary / bbs	只存在 GitHub，不会出现在网站
bbs	会被当作 BBS 候选；不要建第二个
同时有 diary 和 bbs	会同时被两边读到，容易乱，避免这样做


所以日常管理最简单：
- 新日记：新建普通 Issue，贴 diary，保持 Open。
- 日记留言：在该 Issue 下 Add a comment。
- BBS：永远只保留一条 Open 的 bbs Issue；所有公共留言都评论在它下面。
- 网站维护、待办、Sub-issue：不贴这两个标签。
