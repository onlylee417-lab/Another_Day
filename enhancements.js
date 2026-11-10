/* V0.4 additions. The original prototype remains the fallback renderer. */
(() => {
  const legacyRender = render;
  const archiveKey = 'another_day_v04_extra';
  const tabs = {instagram:'feed',threads:'feed',x:'feed',weverse:'feed',kakao:'chats'};
  let detail = null;
  const samples = {
    instagram:[{id:'ig-game',author:'故事日记',text:'今晚的游戏邀请，似乎比想象中更让人期待。',media:'夜色与游戏手柄',day:1},{id:'ig-sky',author:'故事日记',text:'路过时拍下了这片天空。',media:'暮色天空',day:2}],
    threads:[{id:'th-game',author:'游戏小分队',text:'今晚组队，还差一位。',day:1},{id:'th-music',author:'故事日记',text:'有时候一首歌会让普通的一天变得很特别。',day:3}],
    x:[{id:'x-game',author:'虚构游戏话题',text:'#GameNight 今晚的合作任务能通关吗？',day:1},{id:'x-recap',author:'虚构游戏话题',text:'昨夜那场游戏，有人还在讨论最后一关。',day:3}],
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

  const nav = (items,active,fn) => `<nav class="app-tabs">${items.map(([id,label])=>`<button class="${active===id?'active':''}" onclick="${fn}('${id}')">${label}</button>`).join('')}</nav>`;
  const action = (label,fn,active=false) => `<button class="social-action ${active?'active':''}" onclick="${fn}">${label}</button>`;
  const postList = app => [...state.social.posts.filter(p=>p.app===app),...(samples[app]||[]).filter(p=>p.day<=state.day)];
  function postCard(app,p) {
    const liked=state.social.likes.includes(p.id), saved=state.social.bookmarks.includes(p.id), count=(state.social.comments[p.id]||[]).length;
    return `<article class="social-post"><div class="post-author"><span class="avatar">${app==='weverse'?'W':'✦'}</span><div><b>${esc(p.author)}</b><small>虚构内容 · 第 ${p.day||state.day} 天</small></div></div>${p.media?`<button class="post-media" onclick="showMedia('${app}','${p.id}')"><span>${esc(p.media)}</span><small>查看图片</small></button>`:''}<p>${esc(p.text)}</p><div class="post-actions">${action(liked?'♥ 已赞':'♡ 赞',`toggleSocial('likes','${p.id}')`,liked)}${action(`评论 ${count}`,`openPost('${app}','${p.id}')`)}${app==='instagram'?action(saved?'▣ 已收藏':'▢ 收藏',`toggleSocial('bookmarks','${p.id}')`,saved):''}${app==='x'?action(state.social.reposts.includes(p.id)?'↻ 已转发':'↻ 转发',`toggleSocial('reposts','${p.id}')`,state.social.reposts.includes(p.id)):''}</div></article>`;
  }
  function socialPage(app) {
    const t=tabs[app];let body='';
    if(detail?.app===app) {
      const p=postList(app).find(x=>x.id===detail.id);
      body=p?`<button class="text-back" onclick="closePost()">‹ 返回</button>${postCard(app,p)}<section class="comment-list"><h3>评论</h3>${(state.social.comments[p.id]||[]).map(c=>`<p><b>${esc(c.author)}：</b>${esc(c.text)}</p>`).join('')||'<p class="muted">暂无评论</p>'}<div class="inline-compose"><input id="commentInput" class="field" maxlength="250" placeholder="写下虚构评论"><button class="button" onclick="addComment('${app}','${p.id}')">发送</button></div></section>`:'';
    } else if(t==='profile') body=`<div class="profile-summary"><div class="avatar">${esc(state.profile?.nick?.[0]||'我')}</div><div><h3>${esc(state.profile?.nick||'我')}</h3><p>虚构世界中的个人主页 · ${state.social.posts.filter(p=>p.app===app).length} 条发布</p></div></div>${state.social.posts.filter(p=>p.app===app).map(p=>postCard(app,p)).join('')||'<p class="empty">你还没有发布内容</p>'}`;
    else if(t==='stories') body=`<div class="story-ring" onclick="openPost('instagram','ig-game')">✦</div><div class="card"><h3>故事快拍</h3><p>今晚有人分享了游戏之夜的线索。</p>${btn('查看关联动态',"openPost('instagram','ig-game')")}</div>`;
    else if(t==='search') body=`<div class="search-box"><input id="socialSearch" class="field" placeholder="搜索虚构帖子" oninput="searchPosts()"></div><div id="searchResults">${postList(app).map(p=>postCard(app,p)).join('')}</div>`;
    else if(t==='messages') body=`<div class="listrow" onclick="openApp('kakao')"><span class="avatar">✉</span><div><b>故事私信</b><small>私密剧情请在 KakaoTalk 继续</small></div></div>`;
    else body=postList(app).map(p=>postCard(app,p)).join('');
    if(app==='weverse' && t==='live') body='<div class="card"><h3>LIVE</h3><p>尚无已获许可的直播内容。</p></div>';
    if(app==='weverse' && t==='media') body='<div class="card"><h3>Media</h3><p>尚无已获许可的音视频。可通过官方平台观看公开内容。</p></div>';
    if(app==='weverse' && t==='community') body=postList(app).map(p=>postCard(app,p)).join('');
    const tabsets={instagram:[['feed','首页'],['stories','Stories'],['messages','私信'],['profile','我']],threads:[['feed','首页'],['profile','个人']],x:[['feed','时间线'],['search','搜索'],['profile','个人']],weverse:[['feed','Artist'],['community','Community'],['live','LIVE'],['media','Media']]};
    const compose=app==='weverse'||detail?.app===app?'':`<button class="compose-fab" aria-label="发布虚构内容" onclick="composePost('${app}')">＋</button>`;
    $('#screen').innerHTML=header(app==='x'?'X':app[0].toUpperCase()+app.slice(1))+`<div class="social ${app}"><div class="disclosure">Another Day · 原创虚构内容</div>${body}${compose}</div><nav class="app-tabs"></nav>`;
    // Build tab handlers directly; keep tab labels and handlers independent of app content.
    $('#screen .app-tabs').innerHTML=tabsets[app].map(([id,label])=>`<button class="${t===id?'active':''}" onclick="setSocialTab('${app}','${id}')">${label}</button>`).join('');
  }
  function kakaoPage() {
    const t=tabs.kakao;
    const rows=t==='friends'?`<div class="listrow" onclick="openChat('jk')"><span class="avatar">JK</span><div><b>JK · 虚构角色</b><small>游戏好友</small></div></div><div class="listrow" onclick="openChat('group')"><span class="avatar">G</span><div><b>游戏小分队</b><small>虚构群聊</small></div></div>`:t==='more'?card(`<h3>剧情进度</h3><p>第 ${state.day} 天 · 关系值 ${state.story.relations.jk}</p>${btn('推进故事一天','advanceDay()')}`):`<div class="listrow" onclick="openChat('jk')"><span class="avatar">JK</span><div class="grow"><b>JK · 虚构角色</b><small>${esc(state.messages.at(-1)?.text||'')}</small></div><small>›</small></div><div class="listrow" onclick="openChat('group')"><span class="avatar">G</span><div class="grow"><b>游戏小分队</b><small>${esc(state.group.at(-1)?.text||'')}</small></div><small>›</small></div>`;
    $('#screen').innerHTML=header('KakaoTalk')+`<div class="disclosure">原创虚构互动 · 非真实私人账号</div>${rows}${nav([['chats','聊天'],['friends','好友'],['more','更多']],t,'setKakaoTab')}`;
  }
  const legacyChat = openChat;
  render = function() {
    if(!state.profile) return legacyRender();
    if(page==='kakao') return kakaoPage();
    if(['instagram','threads','x','weverse'].includes(page)) return socialPage(page);
    legacyRender();
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
  window.searchPosts=()=>{const q=$('#socialSearch').value.trim().toLowerCase();$('#searchResults').innerHTML=postList('x').filter(p=>(p.text+' '+p.author).toLowerCase().includes(q)).map(p=>postCard('x',p)).join('')||'<p class="empty">没有匹配的虚构帖子</p>'};
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
