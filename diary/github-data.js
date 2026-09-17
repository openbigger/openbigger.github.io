const config = window.DIARY_CONFIG;
const apiBase = `https://api.github.com/repos/${config.owner}/${config.repo}`;
const repoUrl = `https://github.com/${config.owner}/${config.repo}`;
const escapeHtml = value => { const el = document.createElement('span'); el.textContent = value || ''; return el.innerHTML; };
const dateText = value => new Date(value).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });

async function github(url) {
  const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
  return response.json();
}
function postFromIssue(issue) {
  const raw = issue.body || '';
  const date = (raw.match(/^date:\s*(\d{4}-\d{2}-\d{2})\s*$/m) || [])[1] || issue.created_at.slice(0, 10);
  const author = (raw.match(/^author:\s*(.+)$/m) || [])[1] || issue.user.login;
  const body = raw.replace(/^date:\s*.*$/m, '').replace(/^author:\s*.*$/m, '').trim();
  return { id: issue.number, title: issue.title, date, author, body, comments: issue.comments, htmlUrl: issue.html_url, commentsUrl: issue.comments_url };
}
function paragraphHtml(text) {
  return escapeHtml(text).split(/\n\n+/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
}
function showLoadError(target, message) { target.innerHTML = `<div class="entry"><p>${message}</p><p class="note">GitHub の公開データを読み込めませんでした。少し時間をおいて再読み込みしてください。</p></div>`; }

async function renderDiaryList() {
  const target = document.querySelector('#dynamic-entries'); if (!target) return;
  target.innerHTML = '<div class="entry"><p class="note">日記を読み込み中です…</p></div>';
  try {
    const issues = await github(`${apiBase}/issues?state=open&labels=${encodeURIComponent(config.diaryLabel)}&per_page=100`);
    const posts = issues.filter(issue => !issue.pull_request).map(postFromIssue);
    target.innerHTML = posts.length ? posts.map((post, index) => `<article class="entry"><h2><a href="./entry.html?id=${post.id}">${dateText(post.date)}　${escapeHtml(post.title)}</a>${index === 0 ? ' <span class="new">NEW!</span>' : ''}</h2><p>${escapeHtml(post.body).split('\n\n')[0].replace(/\n/g, '<br>')}</p><p align="right"><a href="./entry.html?id=${post.id}">≫ 続きを読む</a></p></article>`).join('') : '<div class="entry"><p>まだ日記はありません。</p><p class="note">管理人が最初の日記を書いているところです。(^^)</p></div>';
  } catch { showLoadError(target, '日記を読み込めませんでした。'); }
}
async function renderEntry() {
  const target = document.querySelector('#entry-content'); if (!target) return;
  const id = new URLSearchParams(location.search).get('id'); if (!/^\d+$/.test(id || '')) { showLoadError(target, '日記が見つかりません。'); return; }
  try {
    const post = postFromIssue(await github(`${apiBase}/issues/${id}`));
    document.title = `${post.title} - 管理人の日記`;
    target.innerHTML = `<p class="content-title">■ ${dateText(post.date)}</p><article class="entry"><h2>${escapeHtml(post.title)}</h2>${paragraphHtml(post.body)}<hr><p align="right">管理人 ${escapeHtml(post.author)}　(^_^)/</p></article>`;
    await renderIssueComments(post);
  } catch { showLoadError(target, 'この日記は見つかりませんでした。'); }
}
async function renderIssueComments(post) {
  const target = document.querySelector('#comments'); const link = document.querySelector('#comment-link'); if (!target || !link) return;
  link.href = post.htmlUrl;
  link.textContent = 'GitHub で留言する';
  try {
    const comments = await github(post.commentsUrl);
    target.innerHTML = comments.length ? comments.map(comment => `<div class="comment"><span class="comment-name">${escapeHtml(comment.user.login)}</span> <span class="comment-date">${new Date(comment.created_at).toLocaleString('ja-JP')}</span><br>${paragraphHtml(comment.body)}</div>`).join('') : '<p class="note">まだ書き込みはありません。よかったら一言どうぞ。</p>';
  } catch { target.innerHTML = '<p class="note">コメントを読み込めませんでした。</p>'; }
}
function setupStation() {
  const form = document.querySelector('#post-form'); if (!form) return;
  form.date.value = new Date().toISOString().slice(0, 10);
  form.addEventListener('submit', event => {
    event.preventDefault(); const data = new FormData(form);
    const title = String(data.get('title')).trim(), body = String(data.get('body')).trim(), author = String(data.get('author')).trim() || 'Yuri';
    if (!title || !body) return;
    const issueBody = `date: ${data.get('date')}\nauthor: ${author}\n\n${body}\n\n---\n写真がある場合は、このあと GitHub の Issue 画面へドラッグして追加してください。`;
    const url = new URL(`${repoUrl}/issues/new`); url.searchParams.set('labels', config.diaryLabel); url.searchParams.set('title', title); url.searchParams.set('body', issueBody);
    location.href = url;
  });
}
async function setupBbs() {
  const target = document.querySelector('#bbs-messages'); const link = document.querySelector('#bbs-link'); if (!target || !link) return;
  try {
    const issues = await github(`${apiBase}/issues?state=open&labels=${encodeURIComponent(config.bbsLabel)}&per_page=1`);
    const issue = issues.find(item => !item.pull_request);
    if (!issue) {
    target.innerHTML = '<p class="note">掲示板は、ただいま準備中です。</p>';
    link.href = `${repoUrl}/issues/new?labels=${encodeURIComponent(config.bbsLabel)}&title=${encodeURIComponent('Guestbook / 掲示板')}&body=${encodeURIComponent('この Issue のコメントを、ホームページの掲示板として使います。')}`;
    link.textContent = '管理人が掲示板を作る'; return;
    }
    const comments = await github(issue.comments_url);
    target.innerHTML = comments.length ? comments.map(comment => `<div class="comment"><span class="comment-name">${escapeHtml(comment.user.login)}</span> <span class="comment-date">${new Date(comment.created_at).toLocaleString('ja-JP')}</span><br>${paragraphHtml(comment.body)}</div>`).join('') : '<p class="note">まだ書き込みはありません。はじめの一人になってね。</p>';
    link.href = issue.html_url; link.textContent = 'GitHub で書き込む';
  } catch { target.innerHTML = '<p class="note">掲示板を読み込めませんでした。</p>'; }
}
renderDiaryList(); renderEntry(); setupStation(); setupBbs();
