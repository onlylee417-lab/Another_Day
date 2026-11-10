/* V0.4 additions. The original prototype remains the fallback renderer. */
(() => {
  const legacyRender = render;
  const archiveKey = 'another_day_v04_extra';
  const tabs = {instagram:'feed',threads:'feed',x:'feed',weverse:'feed',kakao:'chats'};
  let detail = null;
  const samples = {
    instagram:[{id:'ig-game',author:'Another Day · 故事动态',text:'今晚第一次和新朋友聊天。你会怎么开场？',media:'✦',day:1},{id:'ig-sky',author:'故事日记',text:'下班路上的天空，像一张没有写完的明信片。',media:'☁',day:1}],
    threads:[{id:'th-game',author:'故事时间线',text:'最近有没有一首反复听也不会腻的歌？',day:1},{id:'th-music',author:'雨天电台',text:'今天路过唱片店，突然想翻翻很久没听的歌。',day:1},{id:'th-coffee',author:'小分队日常',text:'雨天适合在窗边喝点热的。你会选咖啡还是茶？',day:1}],
    x:[{id:'x-game',author:'日常话题',text:'#TodayInOneLine 今天你会用哪一句话记录自己？',day:1},{id:'x-recap',author:'散步记录',text:'傍晚的风有点凉，刚好适合多走一站。',day:1},{id:'x-lobby',author:'音乐角落',text:'耳机里的一首歌，能把通勤路变短一点。',day:1},{id:'x-playlist',author:'城市漫步',text:'如果周末只有一个下午，你会去哪里走走？',day:1}],
    weverse:[{id:'wv-info',author:'Another Day',text:'今天想记下的，是那些很小、却会留在心里的瞬间。',day:1}]
  };
  const initialStory = () => ({seen:[],pending:null,flags:{},relations:{jk:0},notifications:[]});
  function hydrate(raw) {
    const obj = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const profile = obj.profile && typeof obj.profile === 'object' ? obj.profile : obj.name ? {nick:String(obj.name).slice(0,30),birthday:'',handle:''} : null;
    const normalizeMessage=m=>({from:m.from || m.who || 'jk',text:String(m.text || ''),day:Number(m.day)||1,...(typeof m.image==='string'&&/^data:image\/(?:png|jpeg|webp|gif);base64,/.test(m.image)&&m.image.length<1_200_000?{image:m.image}:{})});
    const messages = Array.isArray(obj.messages) ? obj.messages.map(normalizeMessage) : structuredClone(seed.messages);
    const group = Array.isArray(obj.group) ? obj.group.map(normalizeMessage) : structuredClone(seed.group);
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
    const media=p.media?`<button class="post-media" onclick="showMedia('${app}','${p.id}')" aria-label="查看图片"><span>${esc(p.media)}</span></button>`:'';
    if(app==='instagram')return `<article class="social-post ig-post"><div class="post-author">${avatar}<div><b>${esc(p.author)}</b><small>第 ${p.day||state.day} 天</small></div><button class="post-more" onclick="openPost('${app}','${p.id}')" aria-label="查看帖子">${svg('more')}</button></div>${media||'<div class="post-media empty-media">Another Day</div>'}<div class="post-actions">${like}${comment}${action(svg('send',21),`sharePost('${app}','${p.id}')`)}${action(svg('bookmark',21),`toggleSocial('bookmarks','${p.id}')`,saved)}</div><p class="post-caption"><b>${esc(p.author)}</b> ${esc(p.text)}</p><button class="post-replies" onclick="openPost('${app}','${p.id}')">查看全部 ${count} 条评论</button></article>`;
    const repost=action(`${svg('repeat',20)}<span>${reposted?'已转发':'转发'}</span>`,`toggleSocial('reposts','${p.id}')`,reposted);
    return `<article class="social-post ${app}-post"><div class="post-rail">${avatar}<span></span></div><div class="post-main"><div class="post-author"><b>${esc(p.author)}</b><small>· 第 ${p.day||state.day} 天</small><button class="post-more" onclick="openPost('${app}','${p.id}')" aria-label="查看帖子">${svg('more')}</button></div><p>${esc(p.text)}</p>${media}<div class="post-actions">${comment}${app==='weverse'?'':repost}${like}${app==='weverse'?'':action(svg('share',20),`sharePost('${app}','${p.id}')`)}</div></div></article>`;
  }
  function socialPage(app) {
    const t=tabs[app];let body='';
    if(detail?.app===app) {
      const p=postList(app).find(x=>x.id===detail.id);
      body=p?`<button class="text-back" onclick="closePost()">‹ 返回</button>${postCard(app,p)}<section class="comment-list"><h3>评论</h3>${(state.social.comments[p.id]||[]).map(c=>`<p><b>${esc(c.author)}：</b>${esc(c.text)}</p>`).join('')||'<p class="muted">暂无评论</p>'}<div class="inline-compose"><input id="commentInput" class="field" maxlength="250" placeholder="写评论"><button class="button" onclick="addComment('${app}','${p.id}')">发送</button></div></section>`:'';
    } else if(t==='profile') body=`<div class="profile-summary"><div class="avatar">${esc(state.profile?.nick?.[0]||'我')}</div><div><h3>${esc(state.profile?.nick||'我')}</h3><p>${state.social.posts.filter(p=>p.app===app&&p.source!=='story').length} 条发布</p></div></div><div class="profile-divider">帖子</div>${state.social.posts.filter(p=>p.app===app&&p.source!=='story').map(p=>postCard(app,p)).join('')||'<p class="empty">你还没有发布内容</p>'}`;
    else if(t==='stories') body=`<div class="ig-story-viewer"><div class="story-progress"><span></span><span></span></div><div class="story-viewer-head"><span class="story-avatar filled">✦</span><b>故事线索 <small>虚构故事</small></b><button onclick="setSocialTab('instagram','feed')" aria-label="关闭快拍">×</button></div><div class="story-scene"><span>✦</span><p>那首适合散步的歌<br>又在耳边响起。</p></div><div class="story-viewer-foot"><button onclick="setSocialTab('instagram','feed')">返回动态 ›</button></div></div>`;
    else if(t==='search') body=`<div class="search-box"><input id="socialSearch" class="field" placeholder="搜索帖子" oninput="searchPosts()"></div><div id="searchResults">${postList(app).map(p=>postCard(app,p)).join('')}</div>`;
    else if(t==='messages') body=`<div class="listrow" onclick="openApp('kakao')"><span class="avatar">✉</span><div><b>私信</b><small>去 KakaoTalk 看看</small></div></div>`;
    else if(t==='activity') body='<div class="empty-state"><b>通知</b><p>有新消息时，会在这里提醒你。</p></div>';
    else if(t==='reels') body='<div class="empty-state"><b>Reels</b><p>暂未加入有使用许可的短视频。</p></div>';
    else body=postList(app).map(p=>postCard(app,p)).join('');
    if(app==='instagram'&&t==='feed'&&!detail) body=`<div class="story-strip"><button onclick="setSocialTab('instagram','stories')"><span class="story-avatar">＋</span><small>你的快拍</small></button><button onclick="setSocialTab('instagram','stories')"><span class="story-avatar filled">✦</span><small>故事线索</small></button></div>${body}`;
    if(app==='threads'&&t==='feed'&&!detail) body=`<button class="thread-prompt" onclick="composePost('threads')"><span class="avatar">${esc(state.profile.nick?.[0]||'我')}</span><span>有什么新鲜事？</span>${svg('plus',19)}</button>${body}`;
    if(app==='weverse' && t==='live') body='<div class="wv-section-title">LIVE</div><div class="empty-state"><div class="wv-play">▶</div><b>暂无直播</b><p>仅展示取得许可的公开直播。</p></div>';
    if(app==='weverse' && t==='media') body='<div class="wv-section-title">Media</div><div class="empty-state"><b>媒体资料</b><p>尚无已获许可的音视频。</p></div>';
    if(app==='weverse' && t==='community') body=`<div class="wv-section-title">Community</div>${postList(app).map(p=>postCard(app,p)).join('')}`;
    if(app==='weverse' && t==='feed') body=`<div class="wv-banner"><span class="wv-mark">W</span><div><small>COMMUNITY</small><h3>Another Day</h3><p>我们的故事空间</p></div></div><div class="wv-section-title">Artist Feed <span>Another Day</span></div><div class="weverse-feature"><div class="wv-feature-art">✦</div><div><b>今天的小事</b><p>一首歌、一场雨，还有想记住的片刻。</p><button onclick="openApp('kakao')">去看看消息 ›</button></div></div>${postList(app).map(p=>postCard(app,p)).join('')}`;
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
    if(state.story.pending?.channel===app&&!detail)body=`<section class="story-cue"><small>第 ${state.day} 天 · 今日话题</small><p>${esc(state.story.pending.text||'今天有一件小事等你记录。')}</p><div>${state.story.pending.options.map((o,i)=>`<button onclick="resolveEvent(${i})">${esc(o.label)}</button>`).join('')}</div></section>${body}`;
    else if(!state.story.pending&&state.day<10&&!detail&&t==='feed')body+=`<button class="story-next" onclick="advanceDay()">明天会发生什么 · 继续一天 ›</button>`;
    const fab=app==='x'&&!detail&&['feed','following','search'].includes(t)?`<button class="x-compose" onclick="composePost('x')" aria-label="发帖">${svg('plus',25)}</button>`:'';
    $('#screen').innerHTML=`${top}<div class="social ${app}">${body}</div>${fab}<nav class="app-tabs ${app}-tabs">${bottom}</nav>`;
  }
  function kakaoPage() {
    const t=tabs.kakao;
    const title={friends:'好友',chats:'聊天',open:'开放聊天',more:'更多'}[t]||'聊天';
    const chatRows=`<button class="kakao-row" onclick="openChat('jk')"><span class="avatar jk-avatar">JK</span><span class="grow"><b>JK</b><small>${esc(state.messages.at(-1)?.text||'')}</small></span><span class="kakao-time">第 ${state.day} 天</span></button><button class="kakao-row" onclick="openChat('group')"><span class="avatar group-avatar">G</span><span class="grow"><b>周末小分队</b><small>${esc(state.group.at(-1)?.text||'')}</small></span></button>`;
    const rows=t==='friends'?`<div class="kakao-section">我的资料</div><div class="kakao-row"><span class="avatar player-avatar">${esc(state.profile.nick?.[0]||'我')}</span><span class="grow"><b>${esc(state.profile.nick)}</b><small>Another Day</small></span></div><div class="kakao-section">好友 <span>1</span></div><button class="kakao-row" onclick="openChat('jk')"><span class="avatar jk-avatar">JK</span><span class="grow"><b>JK</b><small>聊天好友</small></span></button>`:t==='open'?`<div class="kakao-section">发现群聊</div><button class="open-room" onclick="openChat('group')"><span>☕</span><b>周末小分队</b><small>一起分享周末日常</small></button>`:t==='more'?`<div class="kakao-more"><span class="avatar player-avatar">${esc(state.profile.nick?.[0]||'我')}</span><div><b>${esc(state.profile.nick)}</b><small>我的手机</small></div></div><div class="kakao-story-link" onclick="openApp('calendar')">${svg('grid')} 故事日历 <span>第 ${state.day} 天 ›</span></div><div class="kakao-story-link" onclick="openApp('settings')">${svg('more')} 设置与存档 <span>›</span></div>`:`<div class="kakao-filter"><button class="active">全部</button><button onclick="setKakaoTab('open')">群聊</button></div>${chatRows}`;
    const navItems=[['friends','好友','friends'],['chats','聊天','chat'],['open','开放聊天','search'],['more','更多','more']];
    const navHtml=navItems.map(([id,label,icon])=>`<button class="${t===id?'active':''}" onclick="setKakaoTab('${id}')" aria-label="${label}">${svg(icon,24)}<small>${label}</small></button>`).join('');
    $('#screen').innerHTML=`<div class="kakao-top"><div><button onclick="goHome()" aria-label="返回桌面">${svg('back',20)}</button><h2>${title}</h2></div><div><button onclick="setKakaoTab('open')" aria-label="搜索群聊">${svg('search')}</button><button onclick="setKakaoTab('more')" aria-label="更多">${svg('more')}</button></div></div><div class="kakao-body">${rows}</div><nav class="app-tabs kakao-tabs">${navHtml}</nav>`;
  }
  const legacyChat = openChat;
  render = function() {
    if(!state.profile) return legacyRender();
    if(page==='kakao') return kakaoPage();
    if(['instagram','threads','x','weverse'].includes(page)) return socialPage(page);
    legacyRender();
    if(page==='home') {
      const top=$('#screen .home .top');
      const pending=state.story.pending;
      const next=pending?`<button class="home-story-link" onclick="openPendingStory()">第 ${state.day} 天 · ${esc(pending.channel==='jk'?'KakaoTalk':pending.channel==='group'?'群聊':pending.channel)} 有新线索 ›</button>`:state.day<10?`<button class="home-story-link" onclick="advanceDay()">继续下一天 ›</button>`:`<div class="home-story-done">第一章已完成 · 后续剧情制作中</div>`;
      top.innerHTML=`<div class="home-hello">你好，${esc(state.profile.nick)}</div><div class="home-day">${new Date().toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'})}</div><div class="home-subtitle">Another Day · 第 ${state.day} 天</div>${next}`;
      const order=['kakao','instagram','threads','x','weverse','media','photos','calendar','notes','settings'];
      $('#screen .home .icons').innerHTML=order.map(key=>{const a=appIcons.find(icon=>icon[3]===key);return `<button class="appicon" onclick="openApp('${key}')">${iconTile(a)}<span class="app-label">${a[0]}</span></button>`}).join('');
    }
    if(page==='chat') {
      $('#screen .header .back').setAttribute('onclick',"openApp('kakao')");
      const pending=state.story.pending;
      if(chatName===(pending?.channel||'jk') && pending) {
        const target=$('#screen .composer');
        target.insertAdjacentHTML('beforebegin',`<div class="event-choices">${pending.options.map((o,i)=>btn(o.label,`resolveEvent(${i})`,'outline choice')).join('')}</div>`);
      }
      const composer=$('#screen .composer');
      composer.insertAdjacentHTML('afterbegin',`<button class="chat-attach" onclick="document.getElementById('chatPhotoInput').click()" aria-label="发送照片">+</button><input id="chatPhotoInput" class="chat-attachment-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onchange="sendChatPhoto(event)">`);
      const log=$('#screen .chat');
      (chatName==='group'?state.group:state.messages).forEach((message,i)=>{if(message.image){const bubble=log.querySelectorAll('.bubble')[i];const img=document.createElement('img');img.src=message.image;img.alt='聊天照片';img.className='chat-photo';bubble?.append(img)}});
      if(log)log.scrollTop=log.scrollHeight;
    }
    if(page==='settings') $('#screen').insertAdjacentHTML('beforeend',card(`<h3>导入存档</h3><p class="mini">支持当前版本及 V0.4 JSON。导入会替换当前本机进度，请先导出备份。</p><input type="file" accept="application/json,.json" onchange="importSave(event)">`));
  };
  window.setSocialTab=(app,t)=>{tabs[app]=t;detail=null;page=app;render()};
  window.setKakaoTab=t=>{tabs.kakao=t;render()};
  window.openPost=(app,id)=>{detail={app,id};page=app;render()};
  window.closePost=()=>{detail=null;render()};
  window.toggleSocial=(type,id)=>{const a=state.social[type];state.social[type]=a.includes(id)?a.filter(x=>x!==id):[...a,id];save();render()};
  window.addComment=(app,id)=>{const text=$('#commentInput')?.value.trim();if(!text)return;(state.social.comments[id]??=[]).push({author:state.profile.nick,text:text.slice(0,250)});save();render()};
  window.composePost=app=>{const text=prompt('写下此刻的想法');if(!text?.trim())return;state.social.posts.unshift({id:'user-'+Date.now(),app,author:state.profile.nick,text:text.trim().slice(0,500),day:state.day});tabs[app]='feed';detail=null;save();render()};
  window.searchPosts=()=>{const q=$('#socialSearch').value.trim().toLowerCase();$('#searchResults').innerHTML=postList(page).filter(p=>(p.text+' '+p.author).toLowerCase().includes(q)).map(p=>postCard(page,p)).join('')||'<p class="empty">没有找到相关内容</p>'};
  window.sharePost=async(app,id)=>{const post=postList(app).find(p=>p.id===id);if(!post)return;const text=`Another Day · 虚构故事\n${post.text}`;try{if(navigator.share)await navigator.share({title:'Another Day',text,url:location.href});else{await navigator.clipboard.writeText(text);alert('已复制动态文字')}}catch{}};
  window.showMedia=(app,id)=>{const p=postList(app).find(x=>x.id===id);if(!p)return;const overlay=document.createElement('div');overlay.className='media-overlay';overlay.innerHTML=`<button onclick="this.parentNode.remove()" aria-label="关闭图片">×</button><div class="media-art">${esc(p.media)}</div><p>${esc(p.text)}</p>`;document.querySelector('.phone').append(overlay)};
  window.sendChatPhoto=event=>{const file=event.target.files?.[0];if(!file)return;if(!/^image\/(png|jpeg|webp|gif)$/.test(file.type)||file.size>750_000){alert('请选择小于 750KB 的 PNG、JPEG、WebP 或 GIF 图片');return}const reader=new FileReader();reader.onload=()=>{const list=chatName==='group'?state.group:state.messages;list.push({from:'me',text:'[照片]',image:String(reader.result),day:state.day});try{save();render()}catch{list.pop();alert('本机存储空间不足，请导出存档后再试')}};reader.readAsDataURL(file)};

  const events=[
    {id:'day2-game',day:2,when:s=>s.choices.includes('first'),text:'今天路过一家旧唱片店，门口放的那首歌有点耳熟ㅋㅋ',options:[{label:'听起来想去看看',reply:'下次路过拍给你看。店里应该还有不少好东西。',delta:1,flag:'curious-shop'},{label:'先告诉我是哪首歌',reply:'我还没想起来。等找到名字发你ㅋㅋ',delta:1,flag:'ask-song'}]},
    {id:'day3-music',day:3,when:()=>true,text:'找到那首歌了。刚才走路的时候又听了一遍。你最近在循环什么？',options:[{label:'分享我最近喜欢的歌',reply:'好，今晚听听。',delta:1,flag:'music'},{label:'想听听你推荐的',reply:'等一下，我找给你。',delta:1,flag:'hear-song'}]},
    {id:'day4-group',day:4,channel:'group',from:'Jimin',when:()=>true,text:'周末天气不错。要不要去河边走走？顺便拍拍照。',options:[{label:'我想一起去',reply:'好啊，定好时间发群里！',delta:1,flag:'join-group'},{label:'我先看看安排',reply:'好，别有压力。到时再说ㅋㅋ',delta:0,flag:'maybe-group'}]},
    {id:'day5-followup',day:5,channel:'instagram',from:'story',when:()=>true,text:'路过一扇被夕阳照亮的窗，你想怎样留下今天？',options:[{label:'拍下光影，发一张动态',delta:0,flag:'photo-window'},{label:'写下一句心情',delta:0,flag:'photo-note'}]},
    {id:'day6-prep',day:6,when:()=>true,text:s=>s.story.flags.music?'你昨天发的歌我又听了。下雨的时候听，感觉挺不一样。':'突然下雨了。那天说的歌又在耳机里响起来ㅋㅋ',options:[{label:'雨天更适合慢慢走',reply:'嗯。慢慢走也挺好的。',delta:1,flag:'rain-walk'},{label:'我会找个地方听雨',reply:'听起来不错。你找到地方了吗？',delta:1,flag:'rain-rest'}]},
    {id:'day7-reflection',day:7,when:()=>true,text:'这几天过得好快。刚才翻聊天记录，才发现我们聊了这么多。',options:[{label:'那首一起聊过的歌',reply:'你还记得啊ㅋㅋ 我现在一听那首歌就会想到那天。',delta:2,flag:'memory-music'},{label:'街上那一刻的光',reply:'嗯，那一刻我也挺喜欢的。',delta:2,flag:'memory-photo'}]},
    {id:'day8-challenge',day:8,channel:'threads',from:'story',when:()=>true,text:'朋友发起一个话题：雨天里，你会收藏哪一件小事？',options:[{label:'一首反复听的歌',delta:0,flag:'thread-song'},{label:'一张街角的照片',delta:0,flag:'thread-photo'}]},
    {id:'day9-plan',day:9,channel:'x',from:'story',when:()=>true,text:'#TodayInOneLine：用一句话记录今天。',options:[{label:'今天适合慢一点',delta:0,flag:'line-slow'},{label:'想把此刻留住',delta:0,flag:'line-keep'}]},
    {id:'day10-finale',day:10,channel:'weverse',from:'story',when:()=>true,text:'给十天后的自己留一句话吧。',options:[{label:'记得好好感受日常',delta:0,flag:'letter-daily'},{label:'继续认真认识新朋友',delta:0,flag:'letter-friends'}]}
  ];
  function enqueueDue() {
    if(state.story.pending)return;
    const event=events.find(e=>e.day===state.day&&!state.story.seen.includes(e.id)&&e.when(state));
    if(!event)return;
    const channel=event.channel||'jk',speaker=event.from||'jk',text=typeof event.text==='function'?event.text(state):event.text;
    state.story.pending={id:event.id,options:event.options,channel,from:speaker,text};
    if(channel==='jk'||channel==='group')(channel==='group'?state.group:state.messages).push({from:speaker,text,day:state.day});
    state.story.notifications.unshift({day:state.day,text,app:channel==='jk'||channel==='group'?'kakao':channel,channel});
    state.history.push(`第${state.day}天：${text}`);
  }
  window.resolveEvent=i=>{const p=state.story.pending,o=p?.options[i];if(!o)return;
    const social=['instagram','threads','x','weverse'].includes(p.channel);
    if(!social){const list=p.channel==='group'?state.group:state.messages;list.push({from:'me',text:o.label,day:state.day},{from:p.from||'jk',text:o.reply,day:state.day})}
    state.story.flags[o.flag]=true;state.story.relations.jk+=o.delta;state.affinity=state.story.relations.jk;state.story.seen.push(p.id);state.story.pending=null;state.history.push(`第${state.day}天：${o.label}`);
    const linked=social?{app:p.channel,author:state.profile.nick,text:o.label,source:'player-story',...(p.channel==='instagram'?{media:o.flag==='photo-window'?'夕阳照亮的窗':'今日手记'}:{})}:{
      'day3-music':{app:'instagram',author:'故事日记',text:o.flag==='music'?'今天交换了一首适合散步的歌。':'一首新歌，留给下一次散步。',media:'♫'},
      'day4-group':{app:'threads',author:'朋友的日常',text:o.flag==='join-group'?'周末约好去河边走走、拍拍照。':'河边散步的邀请还在，等大家有空。'},
      'day6-prep':{app:'x',author:'城市日记',text:'下雨天适合慢一点，听完一首歌再出门。'}
    }[p.id];
    if(linked&&!state.social.posts.some(post=>post.id===`story-${p.id}`))state.social.posts.unshift({id:`story-${p.id}`,source:'story',day:state.day,...linked});
    enqueueDue();save();render()};
  const legacyChoose=choose;
  choose=function(type){legacyChoose(type);state.story.seen.push('day1-first');state.story.relations.jk=state.affinity;enqueueDue();save();render()};
  window.openStoryChannel=channel=>{if(['instagram','threads','x','weverse'].includes(channel)){tabs[channel]='feed';openApp(channel)}else openChat(channel==='group'?'group':'jk')};
  window.openPendingStory=()=>{if(state.story.pending)openStoryChannel(state.story.pending.channel)};
  advanceDay=function(){if(state.story.pending){openPendingStory();return}if(state.day>=10){alert('第一章到第 10 天结束。后续剧情仍在制作中。');return}state.day++;state.history.push(`第${state.day}天：新的一天`);enqueueDue();save();render()};
  const legacyNotifications=showNotifications;
  showNotifications=function(){legacyNotifications();const box=$('#screen .lock');if(box){const items=state.story.notifications.slice(0,5);box.insertAdjacentHTML('beforeend',items.map(n=>`<button class="notice story-notice" onclick="openStoryChannel('${['instagram','threads','x','weverse','group'].includes(n.channel)?n.channel:'jk'}')"><b>${esc(n.app==='kakao'?'KakaoTalk':n.app)} · 新动态</b><p>${esc(n.text)}</p></button>`).join(''))}};
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
