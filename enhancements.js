/* V0.4 additions. The original prototype remains the fallback renderer. */
(() => {
  const legacyRender = render;
  const archiveKey = 'another_day_v04_extra';
  const tabs = {instagram:'feed',threads:'feed',x:'feed',weverse:'feed',kakao:'chats'};
  let detail = null;
  const samples = {
    instagram:[{id:'ig-game',author:'Another Day · 故事动态',text:'今天的游戏之夜 🎮 你会参加吗？',media:'🎮',day:1},{id:'ig-sky',author:'公开资料入口 · 示例',text:'官方公开照片、短视频将在获得允许后展示。',media:'📷',day:1}],
    threads:[{id:'th-game',author:'故事时间线',text:'有人想今晚一起玩游戏吗？ㅋㅋ',day:1},{id:'th-music',author:'资料提示',text:'这里不会把虚构帖子冒充成真人公开发言。',day:1},{id:'th-coffee',author:'小分队日常',text:'游戏开始前先来杯咖啡。有人要一起吗？',day:1}],
    x:[{id:'x-game',author:'故事话题 · 虚构',text:'#GameNight 今天的游戏讨论开始了。',day:1},{id:'x-recap',author:'公开资料档案',text:'公开推文需要核实来源与嵌入许可后收录。',day:1},{id:'x-lobby',author:'虚构游戏社区',text:'合作模式的最后一关太难了，有没有通关建议？',day:1},{id:'x-playlist',author:'虚构音乐角落',text:'夜里打游戏时，你会放什么歌单？',day:1}],
    weverse:[{id:'wv-info',author:'Another Day 说明',text:'这里是非官方虚构故事空间。暂未收录真实艺人公开发帖。',day:1}]
  };
  const initialStory = () => ({seen:[],pending:null,flags:{},relations:{jk:0},notifications:[]});
  function hydrate(raw) {
    const obj = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const profile = obj.profile && typeof obj.profile === 'object' ? obj.profile : obj.name ? {nick:String(obj.name).slice(0,30),birthday:'',handle:''} : null;
    const messages = Array.isArray(obj.messages) ? obj.messages.map(m=>({from:m.from || m.who || 'jk',text:String(m.text || ''),day:Number(m.day)||1})) : structuredClone(seed.messages);
    const group = Array.isArray(obj.group) ? obj.group.map(m=>({from:m.from || m.who || 'JK',text:String(m.text || ''),day:Number(m.day)||1})) : structuredClone(seed.group);
    const social={posts:[],likes:[],comments:{},bookmarks:[],reposts:[],...(obj.social||{})};
    social.posts=(Array.isArray(social.posts)?social.posts:[]).filter(p=>p&&typeof p==='object').map(p=>({...p,id:String(p.id||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,80)||`import-${Math.random().toString(36).slice(2)}`}));
    for(const key of ['likes','bookmarks','reposts'])social[key]=Array.isArray(social[key])?social[key]:[];
    social.comments=Object.fromEntries(Object.entries(social.comments&&typeof social.comments==='object'?social.comments:{}).map(([id,entries])=>[id,(Array.isArray(entries)?entries:[]).map(c=>typeof c==='string'?{author:'玩家',text:c}:c).filter(c=>c&&typeof c==='object')]));
    return {...structuredClone(seed),...obj,schemaVersion:2,profile,day:Math.max(1,Math.floor(Number(obj.day)||1)),messages,group,
      choices:Array.isArray(obj.choices)?obj.choices:obj.choice?[obj.choice]:[],
      posts:Array.isArray(obj.posts)?obj.posts:[],history:Array.isArray(obj.history)?obj.history:[],
      story:{...initialStory(),...(obj.story||{}),flags:{...(obj.story?.flags||{})},relations:{jk:Number(obj.story?.relations?.jk)||Number(obj.affinity)||0}},
      social};
  }
  try {
    const archived = JSON.parse(localStorage.getItem(archiveKey)||'null');
    const current = JSON.parse(localStorage.getItem(KEY)||'null');
    if (archived && !current?.social) {
      const merged = {...current,...archived,profile:current?.profile || (archived.name?{nick:archived.name}:null),messages:current?.messages?.length?current.messages:archived.messages,group:current?.group};
      state = hydrate(merged);
      if (Array.isArray(archived.posts)) state.social.posts = archived.posts.filter(p=>p && typeof p==='object').map(p=>({...p,author:state.profile?.nick||'我'}));
      if (Array.isArray(archived.likes)) state.social.likes = archived.likes;
      if (archived.comments && typeof archived.comments==='object') state.social.comments = archived.comments;
      state = hydrate(state);
    } else state = hydrate(current || state);
  } catch { state = hydrate(state); }
  save();

  const glyphs={home:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',plus:'<path d="M12 3v18M3 12h18"/>',heart:'<path d="M20.8 8.3c0 5.1-8.8 11-8.8 11s-8.8-5.9-8.8-11a5 5 0 0 1 8.8-3.1 5 5 0 0 1 8.8 3.1Z"/>',chat:'<path d="M20 11a8 8 0 0 1-8 8 9 9 0 0 1-4-.9L3 20l1.5-4A8 8 0 1 1 20 11Z"/>',send:'<path d="m21 3-9 18-2.7-7.3L2 11zM9.3 13.7 21 3"/>',repeat:'<path d="M4 8h13l-3-3M20 16H7l3 3M17 8l-3 3M7 16l3-3"/>',bookmark:'<path d="M6 3h12v18l-6-4-6 4z"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9M10 21h4"/>',grid:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',play:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m10 8 6 4-6 4z"/>',more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',friends:'<circle cx="9" cy="8" r="3"/><path d="M2 20a7 7 0 0 1 14 0M17 6a3 3 0 0 1 0 6M18 15a5 5 0 0 1 4 5"/>',back:'<path d="m15 4-8 8 8 8"/>',share:'<path d="M12 16V3m-5 5 5-5 5 5M4 14v7h16v-7"/>'};
  const svg = (name,size=23) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${glyphs[name]||glyphs.more}</svg>`;
  const threadsMark='<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M17.6 9.2c-.6-3.1-2.6-4.8-5.7-4.8-3.7 0-6.2 2.7-6.2 7.5 0 4.8 2.4 7.6 6.4 7.6 3.6 0 5.9-2 5.9-4.7 0-2.2-1.8-3.5-4.7-3.6-3-.1-4.7 1.2-4.7 3.2 0 1.6 1.1 2.6 2.8 2.6 2.7 0 4.5-2.4 4.5-5.5 0-2.1-1.1-3.3-3.5-3.3"/></svg>';
  const socialHeader = name => `<div class="header social-header"><button class="back" onclick="goHome()" aria-label="返回桌面">${svg('back')}</button><h2>${name}</h2><button class="header-home" onclick="goHome()" aria-label="返回桌面">${svg('home')}</button></div>`;
  const action = (label,fn,active=false) => `<button class="social-action ${active?'active':''}" onclick="${fn}">${label}</button>`;
  const postList = app => [...state.social.posts.filter(p=>p.app===app),...(samples[app]||[]).filter(p=>p.day<=state.day)];
  function postCard(app,p) {
    const liked=state.social.likes.includes(p.id),saved=state.social.bookmarks.includes(p.id),reposted=state.social.reposts.includes(p.id),count=(state.social.comments[p.id]||[]).length;
    const avatar=`<span class="avatar">${app==='weverse'?'W':esc(p.author?.[0]||'✦')}</span>`;
    const like=action(`${svg('heart',21)}<span>${liked?'已赞':'赞'}</span>`,`toggleSocial('likes','${p.id}')`,liked);
    const comment=action(`${svg('chat',21)}<span>评论 ${count}</span>`,`openPost('${app}','${p.id}')`);
    const media=p.media?`<button class="post-media" onclick="showMedia('${app}','${p.id}')" aria-label="查看虚构画面"><span>${esc(p.media)}</span><small>原创虚构画面</small></button>`:'';
    if(app==='instagram')return `<article class="social-post ig-post"><div class="post-author">${avatar}<div><b>${esc(p.author)}</b><small>虚构动态 · 第 ${p.day||state.day} 天</small></div><button class="post-more" onclick="openPost('${app}','${p.id}')" aria-label="查看帖子">${svg('more')}</button></div>${media||'<div class="post-media empty-media">原创虚构动态</div>'}<div class="post-actions">${like}${comment}${action(svg('send',21),`sharePost('${app}','${p.id}')`)}${action(svg('bookmark',21),`toggleSocial('bookmarks','${p.id}')`,saved)}</div><p class="post-caption"><b>${esc(p.author)}</b> ${esc(p.text)}</p><button class="post-replies" onclick="openPost('${app}','${p.id}')">查看全部 ${count} 条评论</button></article>`;
    const repost=action(`${svg('repeat',20)}<span>${reposted?'已转发':'转发'}</span>`,`toggleSocial('reposts','${p.id}')`,reposted);
    return `<article class="social-post ${app}-post"><div class="post-rail">${avatar}<span></span></div><div class="post-main"><div class="post-author"><b>${esc(p.author)}</b><small>· 第 ${p.day||state.day} 天 · 虚构</small><button class="post-more" onclick="openPost('${app}','${p.id}')" aria-label="查看帖子">${svg('more')}</button></div><p>${esc(p.text)}</p>${media}<div class="post-actions">${comment}${app==='weverse'?'':repost}${like}${app==='weverse'?'':action(svg('share',20),`sharePost('${app}','${p.id}')`)}</div></div></article>`;
  }
  function socialPage(app) {
    const t=tabs[app];let body='';
    if(detail?.app===app) {
      const p=postList(app).find(x=>x.id===detail.id);
      body=p?`<button class="text-back" onclick="closePost()">‹ 返回</button>${postCard(app,p)}<section class="comment-list"><h3>评论</h3>${(state.social.comments[p.id]||[]).map(c=>`<p><b>${esc(c.author)}：</b>${esc(c.text)}</p>`).join('')||'<p class="muted">暂无评论</p>'}<div class="inline-compose"><input id="commentInput" class="field" maxlength="250" placeholder="写下虚构评论"><button class="button" onclick="addComment('${app}','${p.id}')">发送</button></div></section>`:'';
    } else if(t==='profile') body=`<div class="profile-summary"><div class="avatar">${esc(state.profile?.nick?.[0]||'我')}</div><div><h3>${esc(state.profile?.nick||'我')}</h3><p>虚构账号 · ${state.social.posts.filter(p=>p.app===app).length} 条发布</p></div></div><div class="profile-divider">帖子</div>${state.social.posts.filter(p=>p.app===app).map(p=>postCard(app,p)).join('')||'<p class="empty">你还没有发布内容</p>'}`;
    else if(t==='stories') body=`<div class="ig-story-viewer"><div class="story-progress"><span></span><span></span></div><div class="story-viewer-head"><span class="story-avatar filled">✦</span><b>故事线索 <small>虚构故事</small></b><button onclick="setSocialTab('instagram','feed')" aria-label="关闭快拍">×</button></div><div class="story-scene"><span>✦</span><p>今晚的游戏之夜<br>你会参加吗？</p></div><div class="story-viewer-foot"><button onclick="openPost('instagram','ig-game')">查看关联动态 ›</button></div></div>`;
    else if(t==='search') body=`<div class="search-box"><input id="socialSearch" class="field" placeholder="搜索虚构帖子" oninput="searchPosts()"></div><div id="searchResults">${postList(app).map(p=>postCard(app,p)).join('')}</div>`;
    else if(t==='messages') body=`<div class="listrow" onclick="openApp('kakao')"><span class="avatar">✉</span><div><b>故事私信</b><small>私密剧情请在 KakaoTalk 继续</small></div></div>`;
    else if(t==='activity') body='<div class="empty-state"><b>通知</b><p>你的虚构互动会在这里出现。</p></div>';
    else if(t==='reels') body='<div class="empty-state"><b>Reels</b><p>暂未加入有使用许可的短视频。</p></div>';
    else body=postList(app).map(p=>postCard(app,p)).join('');
    if(app==='instagram'&&t==='feed'&&!detail) body=`<div class="story-strip"><button onclick="setSocialTab('instagram','stories')"><span class="story-avatar">＋</span><small>你的快拍</small></button><button onclick="setSocialTab('instagram','stories')"><span class="story-avatar filled">✦</span><small>故事线索</small></button></div>${body}`;
    if(app==='threads'&&t==='feed'&&!detail) body=`<button class="thread-prompt" onclick="composePost('threads')"><span class="avatar">${esc(state.profile.nick?.[0]||'我')}</span><span>有什么新鲜事？</span>${svg('plus',19)}</button>${body}`;
    if(app==='weverse' && t==='live') body='<div class="wv-section-title">LIVE</div><div class="empty-state"><div class="wv-play">▶</div><b>暂无直播</b><p>仅展示取得许可的公开直播。</p></div>';
    if(app==='weverse' && t==='media') body='<div class="wv-section-title">Media</div><div class="empty-state"><b>媒体资料</b><p>尚无已获许可的音视频。</p></div>';
    if(app==='weverse' && t==='community') body=`<div class="wv-section-title">Community · 虚构故事</div>${postList(app).map(p=>postCard(app,p)).join('')}`;
    if(app==='weverse' && t==='feed') body=`<div class="wv-banner"><span class="wv-mark">W</span><div><small>COMMUNITY</small><h3>Another Day</h3><p>虚构平行世界</p></div></div><div class="wv-section-title">Artist Feed <span>原创虚构内容</span></div><div class="weverse-feature"><div class="wv-feature-art">✦</div><div><b>游戏之夜的线索</b><p>这里收录与故事关联的虚构动态。真实公开内容会标注来源。</p><button onclick="openApp('kakao')">前往虚构聊天 ›</button></div></div>${postList(app).map(p=>postCard(app,p)).join('')}`;
    let top='',bottom='';
    const item=(id,label,icon,fn)=>`<button class="${t===id?'active':''}" onclick="${fn||`setSocialTab('${app}','${id}')`}" aria-label="${label}">${svg(icon,24)}<small>${label}</small></button>`;
    if(app==='instagram'){
      top=`<div class="product-top ig-top"><button onclick="goHome()" aria-label="返回桌面">${svg('back')}</button><strong>Instagram</strong><button onclick="setSocialTab('instagram','activity')" aria-label="通知">${svg('heart')}</button><button onclick="setSocialTab('instagram','messages')" aria-label="私信">${svg('send')}</button></div>`;
      bottom=item('feed','首页','home')+item('search','搜索','search')+item('compose','发布','plus',"composePost('instagram')")+item('reels','Reels','play')+item('profile','我','user');
    } else if(app==='threads'){
      top=`<div class="product-top threads-top"><button onclick="goHome()" aria-label="返回桌面">${svg('back')}</button><strong>${threadsMark}</strong><button onclick="setSocialTab('threads','activity')" aria-label="通知">${svg('heart')}</button></div>${!detail&&['feed','following'].includes(t)?`<div class="feed-switch"><button class="${t==='feed'?'active':''}" onclick="setSocialTab('threads','feed')">为你推荐</button><button class="${t==='following'?'active':''}" onclick="setSocialTab('threads','following')">正在关注</button></div>`:''}`;
      bottom=item('feed','首页','home')+item('search','搜索','search')+item('compose','发布','plus',"composePost('threads')")+item('activity','动态','heart')+item('profile','我','user');
    } else if(app==='x'){
      top=`<div class="product-top x-top"><button onclick="goHome()" aria-label="返回桌面"><span class="top-avatar">${esc(state.profile.nick?.[0]||'我')}</span></button><strong>𝕏</strong><button onclick="setSocialTab('x','profile')" aria-label="个人主页">${svg('user')}</button></div>${!detail&&['feed','following'].includes(t)?`<div class="feed-switch"><button class="${t==='feed'?'active':''}" onclick="setSocialTab('x','feed')">为你推荐</button><button class="${t==='following'?'active':''}" onclick="setSocialTab('x','following')">正在关注</button></div>`:''}`;
      bottom=item('feed','首页','home')+item('search','搜索','search')+item('activity','通知','bell')+item('messages','私信','chat')+item('profile','我','user');
    } else {
      top=`<div class="product-top wv-top"><button onclick="goHome()" aria-label="返回桌面">${svg('back')}</button><strong>weverse</strong><button onclick="setSocialTab('weverse','activity')" aria-label="通知">${svg('bell')}</button></div>`;
      bottom=item('feed','首页','home')+item('community','社区','friends')+item('live','LIVE','play')+item('media','媒体','grid')+item('profile','我','user');
    }
    const fab=app==='x'&&!detail&&['feed','following','search'].includes(t)?`<button class="x-compose" onclick="composePost('x')" aria-label="发帖">${svg('plus',25)}</button>`:'';
    $('#screen').innerHTML=`${top}<div class="social ${app}">${body}</div>${fab}<nav class="app-tabs ${app}-tabs">${bottom}</nav>`;
  }
  function kakaoPage() {
    const t=tabs.kakao;
    const title={friends:'好友',chats:'聊天',open:'开放聊天',more:'更多'}[t]||'聊天';
    const chatRows=`<button class="kakao-row" onclick="openChat('jk')"><span class="avatar jk-avatar">JK</span><span class="grow"><b>JK <i>虚构角色</i></b><small>${esc(state.messages.at(-1)?.text||'')}</small></span><span class="kakao-time">第 ${state.day} 天</span></button><button class="kakao-row" onclick="openChat('group')"><span class="avatar group-avatar">G</span><span class="grow"><b>游戏小分队</b><small>${esc(state.group.at(-1)?.text||'')}</small></span></button>`;
    const rows=t==='friends'?`<div class="kakao-section">我的资料</div><div class="kakao-row"><span class="avatar player-avatar">${esc(state.profile.nick?.[0]||'我')}</span><span class="grow"><b>${esc(state.profile.nick)}</b><small>Another Day · 虚构账号</small></span></div><div class="kakao-section">好友 <span>1</span></div><button class="kakao-row" onclick="openChat('jk')"><span class="avatar jk-avatar">JK</span><span class="grow"><b>JK <i>虚构角色</i></b><small>游戏好友</small></span></button>`:t==='open'?`<div class="kakao-section">发现群聊</div><button class="open-room" onclick="openChat('group')"><span>🎮</span><b>游戏小分队</b><small>与虚构朋友继续游戏之夜</small></button>`:t==='more'?`<div class="kakao-more"><span class="avatar player-avatar">${esc(state.profile.nick?.[0]||'我')}</span><div><b>${esc(state.profile.nick)}</b><small>我的虚构手机</small></div></div><div class="kakao-story-link" onclick="openApp('calendar')">${svg('grid')} 故事日历 <span>第 ${state.day} 天 ›</span></div><div class="kakao-story-link" onclick="openApp('settings')">${svg('more')} 设置与存档 <span>›</span></div>`:`<div class="kakao-filter"><button class="active">全部</button><button onclick="setKakaoTab('open')">群聊</button></div>${chatRows}`;
    const navItems=[['friends','好友','friends'],['chats','聊天','chat'],['open','开放聊天','search'],['more','更多','more']];
    const navHtml=navItems.map(([id,label,icon])=>`<button class="${t===id?'active':''}" onclick="setKakaoTab('${id}')" aria-label="${label}">${svg(icon,24)}<small>${label}</small></button>`).join('');
    $('#screen').innerHTML=`<div class="kakao-top"><div><button onclick="goHome()" aria-label="返回桌面">${svg('back',20)}</button><h2>${title}</h2></div><div><button onclick="setKakaoTab('open')" aria-label="搜索群聊">${svg('search')}</button><button onclick="setKakaoTab('more')" aria-label="更多">${svg('more')}</button></div></div><div class="kakao-body">${rows}<p class="fiction-note">原创虚构互动 · 非真实私人账号</p></div><nav class="app-tabs kakao-tabs">${navHtml}</nav>`;
  }
  const legacyChat = openChat;
  render = function() {
    if(!state.profile) return legacyRender();
    if(page==='kakao') return kakaoPage();
    if(['instagram','threads','x','weverse'].includes(page)) return socialPage(page);
    legacyRender();
    if(page==='home') {
      const top=$('#screen .home .top');
      top.innerHTML=`<div class="home-hello">你好，${esc(state.profile.nick)}</div><div class="home-day">${new Date().toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'})}</div><div class="home-subtitle">Another Day · 第 ${state.day} 天</div>`;
      const order=['kakao','instagram','threads','x','weverse','media','photos','calendar','notes','settings'];
      $('#screen .home .icons').innerHTML=order.map(key=>{const a=appIcons.find(icon=>icon[3]===key);return `<button class="appicon" onclick="openApp('${key}')">${iconTile(a)}<span class="app-label">${a[0]}</span></button>`}).join('');
    }
    if(page==='chat') {
      $('#screen .header .back').setAttribute('onclick',"openApp('kakao')");
      const pending=state.story.pending;
      if(chatName==='jk' && pending) {
        const target=$('#screen .composer');
        target.insertAdjacentHTML('beforebegin',`<div class="event-choices">${pending.options.map((o,i)=>btn(o.label,`resolveEvent(${i})`,'outline choice')).join('')}</div>`);
      }
      const log=$('#screen .chat');if(log) log.scrollTop=log.scrollHeight;
    }
    if(page==='settings') $('#screen').insertAdjacentHTML('beforeend',card(`<h3>导入存档</h3><p class="mini">支持当前版本及 V0.4 JSON。导入会替换当前本机进度，请先导出备份。</p><input type="file" accept="application/json,.json" onchange="importSave(event)">`));
  };
  window.setSocialTab=(app,t)=>{tabs[app]=t;detail=null;page=app;render()};
  window.setKakaoTab=t=>{tabs.kakao=t;render()};
  window.openPost=(app,id)=>{detail={app,id};page=app;render()};
  window.closePost=()=>{detail=null;render()};
  window.toggleSocial=(type,id)=>{const a=state.social[type];state.social[type]=a.includes(id)?a.filter(x=>x!==id):[...a,id];save();render()};
  window.addComment=(app,id)=>{const text=$('#commentInput')?.value.trim();if(!text)return;(state.social.comments[id]??=[]).push({author:state.profile.nick,text:text.slice(0,250)});save();render()};
  window.composePost=app=>{const text=prompt('发布一条虚构动态');if(!text?.trim())return;state.social.posts.unshift({id:'user-'+Date.now(),app,author:state.profile.nick,text:text.trim().slice(0,500),day:state.day});tabs[app]='feed';detail=null;save();render()};
  window.searchPosts=()=>{const q=$('#socialSearch').value.trim().toLowerCase();$('#searchResults').innerHTML=postList(page).filter(p=>(p.text+' '+p.author).toLowerCase().includes(q)).map(p=>postCard(page,p)).join('')||'<p class="empty">没有匹配的虚构帖子</p>'};
  window.sharePost=async(app,id)=>{const post=postList(app).find(p=>p.id===id);if(!post)return;const text=`Another Day · 虚构故事\n${post.text}`;try{if(navigator.share)await navigator.share({title:'Another Day',text,url:location.href});else{await navigator.clipboard.writeText(text);alert('已复制虚构动态文字')}}catch{}};
  window.showMedia=(app,id)=>{const p=postList(app).find(x=>x.id===id);if(!p)return;const overlay=document.createElement('div');overlay.className='media-overlay';overlay.innerHTML=`<button onclick="this.parentNode.remove()" aria-label="关闭图片">×</button><div class="media-art">${esc(p.media)}</div><p>${esc(p.text)}</p>`;document.querySelector('.phone').append(overlay)};

  const events=[
    {id:'day2-game',day:2,when:s=>s.choices.includes('first'),text:'JK：昨天那局配合得不错。下次还想一起玩吗？',options:[{label:'当然，一起练习',reply:'好啊，我们慢慢练习。',delta:2,flag:'practice'},{label:'偶尔玩就好',reply:'没问题，有空再玩ㅋㅋ',delta:0,flag:'casual'}]},
    {id:'day3-music',day:3,when:()=>true,text:'JK：今天发现一首适合散步的歌。你平时听什么？',options:[{label:'分享我最近喜欢的歌',reply:'我会去听听。谢谢推荐！',delta:1,flag:'music'},{label:'先聊聊游戏',reply:'ㅋㅋ 好，那先说游戏。',delta:0,flag:'game'}]},
    {id:'day5-group',day:5,when:()=>true,text:'JK：周末游戏小分队要组队。你想加入吗？',options:[{label:'加入小分队',reply:'太好了，我把时间发到群里。',delta:2,flag:'join-group'},{label:'这次先旁观',reply:'当然，随时欢迎你。',delta:0,flag:'watch'}]}
  ];
  function enqueueDue() {
    if(state.story.pending)return;
    const event=events.find(e=>e.day===state.day&&!state.story.seen.includes(e.id)&&e.when(state));
    if(!event)return;
    state.story.pending={id:event.id,options:event.options};
    state.messages.push({from:'jk',text:event.text,day:state.day});
    state.story.notifications.unshift({day:state.day,text:event.text,app:'kakao'});
    state.history.push(`第${state.day}天：${event.text}`);
  }
  window.resolveEvent=i=>{const p=state.story.pending,o=p?.options[i];if(!o)return;state.messages.push({from:'me',text:o.label,day:state.day},{from:'jk',text:o.reply,day:state.day});state.story.flags[o.flag]=true;state.story.relations.jk+=o.delta;state.affinity=state.story.relations.jk;state.story.seen.push(p.id);state.story.pending=null;state.history.push(`第${state.day}天：${o.label}`);enqueueDue();save();render()};
  const legacyChoose=choose;
  choose=function(type){legacyChoose(type);state.story.seen.push('day1-first');state.story.relations.jk=state.affinity;enqueueDue();save();render()};
  advanceDay=function(){if(state.story.pending){openChat('jk');return}state.day++;state.history.push(`第${state.day}天：新的一天`);enqueueDue();save();render()};
  const legacyNotifications=showNotifications;
  showNotifications=function(){legacyNotifications();const box=$('#screen .lock');if(box){const items=state.story.notifications.slice(0,5);box.insertAdjacentHTML('beforeend',items.map(n=>`<div class="notice" onclick="openChat('jk')"><b>KakaoTalk · 虚构剧情</b><p>${esc(n.text)}</p></div>`).join(''))}};
  const legacyHome=goHome;
  goHome=function(){detail=null;legacyHome()};
  const legacyOpen= openApp;
  openApp=function(p){detail=null;legacyOpen(p)};
  openChat=function(name){legacyChat(name)};
  window.importSave=async event=>{const file=event.target.files?.[0];if(!file)return;try{if(file.size>5_000_000)throw Error('存档过大');const raw=JSON.parse(await file.text());if(!raw||typeof raw!=='object'||Array.isArray(raw)||!Array.isArray(raw.messages)||!(raw.profile||raw.name))throw Error('格式错误');if(!confirm('导入存档会替换当前本机进度。确定继续吗？'))return;state=hydrate(raw);save();goHome()}catch{alert('导入失败：请选择有效的 Another Day JSON 存档')}};
  resetSave=function(){if(!confirm('确定删除本机全部剧情存档吗？'))return;localStorage.removeItem(KEY);localStorage.removeItem(archiveKey);state=hydrate(structuredClone(seed));page='onboard';render()};
  let aiProvider=null;
  window.StoryAI={
    registerProvider(adapter){if(!adapter||typeof adapter.reply!=='function')throw Error('Provider 必须实现 reply(context)');aiProvider=adapter},
    context(){return {character:{id:'jk-fictional',disclosure:'原创虚构角色'},conversation:state.messages.slice(-30).map(m=>({...m})),memory:{choices:[...state.choices],flags:{...state.story.flags}},story:{day:state.day,relations:{...state.story.relations},pending:state.story.pending?.id||null}}},
    async reply(){if(!aiProvider)return {configured:false,text:null,fallback:'scripted'};try{const result=await aiProvider.reply(this.context());if(typeof result?.text!=='string'||!result.text.trim())throw Error('空回复');return {configured:true,text:result.text}}catch{return {configured:true,text:null,fallback:'scripted'}}}
  };
  enqueueDue();save();render();
  if('serviceWorker' in navigator && location.protocol==='https:') navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
