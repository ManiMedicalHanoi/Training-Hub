/* Kết quả khảo sát · MMH (v1.0 · 13/11/2026)
   Xem kết quả mọi khảo sát Google Form: danh sách khảo sát (thêm bằng link) ⇒ thống kê từng câu hỏi (số người, %), lọc theo phần / theo câu trả lời,
   từng câu trả lời, tải bảng thống kê. Báo câu trả lời mới: số đỏ trên chuông + thông báo trình duyệt (khi đang mở app) và mục "Nhắc tôi"
   của Report Hub / CRM (máy chủ quét mỗi giờ, cho người bấm Theo dõi).
   Máy chủ: survey (mmh-backend ▸ backends/survey/MMH_SurveyResults.gs). Đăng nhập: Training Hub, dùng chung phiên mmh_tk với Report Hub / CRM / Tender Map. */
(function(){
"use strict";
var API = window.KS_API || "";
var TRAINING_HUB = "https://script.google.com/macros/s/AKfycbwsX4cQEoH4LNlmcNfe8qWIM9K6EiDEXy7PjhP9bHY2citL6xHn5L1unsAlQJHyL9EP/exec";
var LS_TK = "mmh_tk", LS_MAIL = "mmh_last_email", LS_SEEN = "ks_seen_v1", LS_UI = "ks_ui_v1";
var POLL_MS = 3 * 60 * 1000;

/* ═════════ tiện ích ═════════ */
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function n0(x){ return String(Math.round(+x||0)).replace(/\B(?=(\d{3})+(?!\d))/g,"."); }
function pct(a,b){ if(!b) return "0%"; var p=a*100/b; return (p>=10||p===0?Math.round(p):Math.round(p*10)/10).toString().replace(".",",")+"%"; }
function nk(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/đ/g,"d").replace(/\s+/g," ").trim(); }
function dt(v){ if(!v) return ""; var d=new Date(v); if(isNaN(d)) return String(v); var p=function(n){ return String(n).padStart(2,"0"); };
  return p(d.getDate())+"/"+p(d.getMonth()+1)+"/"+d.getFullYear()+" "+p(d.getHours())+":"+p(d.getMinutes()); }
function ago(v){ if(!v) return ""; var d=new Date(v); if(isNaN(d)) return ""; var m=Math.round((Date.now()-d)/60000);
  if(m<1) return "vừa xong"; if(m<60) return m+" phút trước"; var h=Math.round(m/60); if(h<24) return h+" giờ trước"; var dd=Math.round(h/24); return dd+" ngày trước"; }
function qs(o){ return Object.keys(o).map(function(k){ return encodeURIComponent(k)+"="+encodeURIComponent(o[k]==null?"":o[k]); }).join("&"); }
function toast(t,ms){ var e=$("toast"); e.textContent=t; e.hidden=false; clearTimeout(toast._t); toast._t=setTimeout(function(){ e.hidden=true; }, ms||3500); }
function ls(k,v){ try{ if(v===undefined) return JSON.parse(localStorage.getItem(k)||"null"); localStorage.setItem(k, JSON.stringify(v)); }catch(_){ return null; } }
var ICON={
  bell:'<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10.3 20a1.9 1.9 0 0 0 3.4 0"/></svg>',
  ext:'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  ref:'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/></svg>',
  dl:'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14"/></svg>'
};

/* ═════════ mạng ═════════ */
function jsonp(url, ms){
  return new Promise(function(res, rej){
    var cb="__ks"+Math.random().toString(36).slice(2), s=document.createElement("script"), done=false;
    var to=setTimeout(function(){ fin(); rej(new Error("hết giờ")); }, ms||60000);
    function fin(){ done=true; clearTimeout(to); try{ delete window[cb]; }catch(_){ window[cb]=undefined; } s.remove(); }
    window[cb]=function(d){ if(done) return; fin(); res(d); };
    s.onerror=function(){ if(done) return; fin(); rej(new Error("không tải được")); };
    s.src=url+(url.indexOf("?")<0?"?":"&")+"callback="+cb; document.head.appendChild(s);
  });
}
/* fetch KHÔNG kèm cookie Google trước (máy đăng nhập nhiều tài khoản Google thì thẻ <script> bị chuyển sang trang chọn tài khoản), lỗi ⇒ JSONP */
function getJSON(url, ms){
  var ctl=window.AbortController?new AbortController():null, to=setTimeout(function(){ if(ctl) ctl.abort(); }, ms||60000);
  return fetch(url,{redirect:"follow", credentials:"omit", signal:ctl?ctl.signal:undefined}).then(function(r){ clearTimeout(to); if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); })
    .catch(function(){ clearTimeout(to); return jsonp(url, ms); });
}
function api(action, p){ return getJSON(API+"?"+qs(Object.assign({action:action, tk:tk()}, p||{})), 90000).then(function(d){
  if(d && d.code==="AUTH"){ authFail(d.error); throw new Error(d.error||"Cần đăng nhập"); }
  return d; }); }
function hub(action, p){ return getJSON(TRAINING_HUB+"?"+qs(Object.assign({action:action}, p||{})), 30000); }
function hubPost(action, p){  /* có mật khẩu ⇒ POST, không đưa lên URL */
  var ctl=window.AbortController?new AbortController():null, to=setTimeout(function(){ if(ctl) ctl.abort(); }, 30000);
  return fetch(TRAINING_HUB,{ method:"POST", body:new URLSearchParams(Object.assign({action:action}, p||{})), redirect:"follow", credentials:"omit", signal:ctl?ctl.signal:undefined })
    .then(function(r){ clearTimeout(to); if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); }, function(e){ clearTimeout(to); throw e; });
}

/* ═════════ đăng nhập (email + mật khẩu, hoặc mã 6 số qua email — như Tender Map / Report Hub / CRM) ═════════ */
var lg={step:"pw", email:"", busy:false, err:""};
function auth(){ var o=ls(LS_TK); if(!o||!o.tk||!o.user||!o.user.pic) return null; if(o.exp && Date.now()>o.exp) return null; return o; }
function tk(){ var a=auth(); return a?a.tk:""; }
function cleanEmail(v){ var e=String(v||"").trim().toLowerCase().replace(/\s+/g,""); if(e && e.indexOf("@")<0) e+="@manimedicalhanoi.com"; return e; }
function okEmail(e){ return /^[a-z0-9._%+\-]+@(mani\.inc|manimedicalhanoi\.com)$/.test(e); }
function authFail(msg){
  if(/hết hạn|không hợp lệ|đăng xuất|bị khoá|RH_Users|danh sách người dùng/i.test(String(msg||""))){ try{ localStorage.removeItem(LS_TK); }catch(_){} }
  lg.err=msg||""; if(!auth()) gate();
}
function gate(){
  stopPoll(); $("bell").hidden=true; $("pop").hidden=true; userChip();
  var em=lg.email; if(!em){ try{ em=localStorage.getItem(LS_MAIL)||""; }catch(_){} }
  var h='<div class="gate"><h1>Kết quả khảo sát</h1><p class="sub">Xem kết quả các khảo sát Google Form của MMH, thống kê từng câu hỏi. Dành cho nhân sự MMH: đăng nhập bằng email công ty (đã đăng nhập Report Hub / CRM / Tender Map trên trình duyệt này thì vào thẳng).</p>';
  if(lg.step==="pw"){
    h+='<form id="lg-f" autocomplete="on" onsubmit="return false"><label for="lg-email">Email công ty</label><input class="inp" id="lg-email" name="username" type="email" autocomplete="username" placeholder="ten@manimedicalhanoi.com" value="'+esc(em)+'">'+
       '<label for="lg-pw">Mật khẩu</label><input class="inp" id="lg-pw" name="password" type="password" autocomplete="current-password" placeholder="Mật khẩu đã đặt ở Tender Map / Report Hub">'+
       '<div class="act"><button class="btn pri" id="lg-go" type="submit"'+(lg.busy?" disabled":"")+'>'+(lg.busy?"Đang đăng nhập…":"Đăng nhập")+'</button><button class="btn" id="lg-code" type="button">Nhận mã qua email</button></div></form>'+
       '<p class="sm mut">Chưa đặt mật khẩu hoặc quên mật khẩu: bấm "Nhận mã qua email", nhập mã 6 số.</p>';
  } else {
    h+='<p class="sm">Mã 6 số đã gửi tới <b>'+esc(lg.email)+'</b>.</p><label for="lg-c">Mã đăng nhập</label><input class="inp" id="lg-c" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6 số">'+
       '<div class="act"><button class="btn pri" id="lg-go" type="button"'+(lg.busy?" disabled":"")+'>'+(lg.busy?"Đang kiểm tra…":"Đăng nhập")+'</button><button class="btn" id="lg-back" type="button">Đổi email / dùng mật khẩu</button></div>';
  }
  h+='<div class="lgerr">'+esc(lg.err)+'</div></div>';
  $("main").innerHTML=h;
  if(lg.step==="pw"){
    $("lg-go").onclick=lgPw; $("lg-code").onclick=lgSend;
    $("lg-pw").onkeydown=function(e){ if(e.key==="Enter") lgPw(); };
    setTimeout(function(){ try{ ($("lg-email").value?$("lg-pw"):$("lg-email")).focus(); }catch(_){} }, 30);
  } else {
    $("lg-go").onclick=lgVerify; $("lg-back").onclick=function(){ lg.step="pw"; lg.err=""; gate(); };
    $("lg-c").onkeydown=function(e){ if(e.key==="Enter") lgVerify(); };
    setTimeout(function(){ try{ $("lg-c").focus(); }catch(_){} }, 30);
  }
}
function done(d){
  ls(LS_TK, {tk:d.token, exp:d.exp, user:d.user, at:Date.now()}); try{ localStorage.setItem(LS_MAIL, lg.email); }catch(_){}
  lg={step:"pw", email:lg.email, busy:false, err:""}; start();
}
function lgPw(){
  if(lg.busy) return;
  lg.email=cleanEmail($("lg-email").value); var pw=String($("lg-pw").value||"");
  if(!okEmail(lg.email)){ lg.err="Nhập email công ty: …@manimedicalhanoi.com hoặc …@mani.inc"; gate(); return; }
  if(!pw){ lg.err="Nhập mật khẩu, hoặc bấm \"Nhận mã qua email\"."; gate(); return; }
  lg.busy=true; lg.err=""; gate();
  hubPost("rhAuthPw",{email:lg.email, pw:pw}).then(function(d){ lg.busy=false;
    if(d && d.ok && d.token && d.user){ done(d); return; }
    lg.err=(d&&d.error)||"Chưa đăng nhập được."; gate();
  },function(e){ lg.busy=false; lg.err="Không kết nối được máy chủ đăng nhập ("+e.message+")."; gate(); });
}
function lgSend(){
  if(lg.busy) return;
  var i=$("lg-email"); if(i) lg.email=cleanEmail(i.value);
  if(!okEmail(lg.email)){ lg.err="Nhập email công ty rồi bấm Nhận mã: …@manimedicalhanoi.com hoặc …@mani.inc"; gate(); return; }
  lg.busy=true; lg.err=""; gate();
  hub("rhAuthStart",{email:lg.email}).then(function(d){ lg.busy=false;
    if(d && (d.ok || d.code==="WAIT")){ lg.step="code"; lg.err=d.ok?"":(d.error||""); } else lg.err=(d&&d.error)||"Chưa gửi được mã.";
    gate(); },function(e){ lg.busy=false; lg.err="Không kết nối được máy chủ đăng nhập ("+e.message+")."; gate(); });
}
function lgVerify(){
  if(lg.busy) return;
  var code=String(($("lg-c")||{}).value||"").replace(/\D/g,"");
  if(code.length!==6){ lg.err="Nhập đủ 6 số trong email."; gate(); return; }
  lg.busy=true; lg.err=""; gate();
  hub("rhAuthVerify",{email:lg.email, code:code}).then(function(d){ lg.busy=false;
    if(d && d.ok && d.token && d.user){ done(d); return; }
    lg.err=(d&&d.error)||"Mã chưa đúng."; gate(); },function(e){ lg.busy=false; lg.err=e.message; gate(); });
}
function userChip(){
  var a=auth(), u=$("uchip"); if(!a){ u.innerHTML=""; return; }
  var n=a.user.pic||"", ini=n.split(/\s+/).map(function(w){ return w[0]||""; }).join("").slice(-2).toUpperCase();
  u.innerHTML='<button class="uchip" type="button" id="uc-b"><i>'+esc(ini)+'</i><span>'+esc(n)+'</span></button>';
  $("uc-b").onclick=function(){
    modal('<h3>Tài khoản</h3><p>'+esc(n)+(ME&&ME.priv?' · xem được họ tên, số điện thoại người trả lời':'')+'</p><p class="sm mut">Đăng xuất ở đây thì Report Hub / CRM / Tender Map trên trình duyệt này cũng phải đăng nhập lại.</p><div class="row"><button class="btn" data-x="1" type="button">Đóng</button><button class="btn pri" id="lo" type="button">Đăng xuất</button></div>');
    $("lo").onclick=function(){ try{ localStorage.removeItem(LS_TK); }catch(_){} closeModal(); LIST=null; DATA={}; gate(); };
  };
}
function modal(h){ var m=$("modal"); m.innerHTML='<div role="dialog" aria-modal="true">'+h+'</div>'; m.hidden=false;
  m.onclick=function(e){ if(e.target===m || (e.target.closest && e.target.closest("[data-x]"))) closeModal(); }; }
function closeModal(){ $("modal").hidden=true; $("modal").innerHTML=""; }

/* ═════════ dữ liệu ═════════ */
var LIST=null, ME=null, OWNER="", DATA={}, PREV={}, pollT=0;
var SEEN=ls(LS_SEEN)||{};
var UI=Object.assign({sort:"form"}, ls(LS_UI)||{});
var V={id:"", tab:"st", sec:"", q:"", fq:"", fv:"", lim:30};
function saveSeen(){ ls(LS_SEEN, SEEN); }
function newOf(it){ return SEEN[it.id]==null ? 0 : Math.max(0, it.n - SEEN[it.id]); }

function loadList(quiet){
  return api("rsList").then(function(d){
    if(!d || !d.ok) throw new Error((d&&d.error)||"Không đọc được danh sách");
    ME=d.me; OWNER=d.owner||OWNER;
    var arrivals=[];
    d.items.forEach(function(it){
      if(SEEN[it.id]==null) SEEN[it.id]=it.n;
      if(PREV[it.id]!=null && it.n>PREV[it.id]) arrivals.push({it:it, k:it.n-PREV[it.id]});
      PREV[it.id]=it.n;
    });
    saveSeen(); LIST=d.items; bell();
    if(arrivals.length) announce(arrivals);
    return d;
  }).catch(function(e){ if(!quiet) throw e; });
}
function announce(arr){
  var t=arr.map(function(a){ return "+"+a.k+" · "+a.it.title; }).join("\n");
  toast(arr.length===1 ? "Có "+arr[0].k+" câu trả lời mới: "+arr[0].it.title : "Có câu trả lời mới ở "+arr.length+" khảo sát");
  try{ if(window.Notification && Notification.permission==="granted"){ var nt=new Notification("Kết quả khảo sát · câu trả lời mới",{body:t, tag:"ks-new"}); nt.onclick=function(){ window.focus(); if(arr.length===1) location.hash="#s="+encodeURIComponent(arr[0].it.id); nt.close(); }; } }catch(_){}
  if(V.id && arr.some(function(a){ return a.it.id===V.id; })) loadData(V.id, true);
  else if(!V.id) render();
}
function bell(){
  var b=$("bell"); if(!auth()||!LIST){ b.hidden=true; return; }
  var tot=LIST.reduce(function(s,it){ return s+newOf(it); },0);
  b.hidden=false; b.innerHTML=b.innerHTML.replace(/<span class="n">.*?<\/span>/,"")+(tot?'<span class="n">'+(tot>99?"99+":tot)+'</span>':"");
  b.title=tot?tot+" câu trả lời mới":"Không có câu trả lời mới";
  document.title=(tot?"("+tot+") ":"")+"Kết quả khảo sát · MMH";
}
function bellPop(){
  var p=$("pop"); if(!p.hidden){ p.hidden=true; return; }
  var news=(LIST||[]).filter(function(it){ return newOf(it)>0; });
  var perm=window.Notification ? Notification.permission : "na";
  p.innerHTML='<h3>Câu trả lời mới</h3>'+(news.length?'<ul>'+news.map(function(it){ return '<li data-id="'+esc(it.id)+'"><span class="newb">+'+newOf(it)+'</span> '+esc(it.title)+'<div class="sm mut">Mới nhất '+esc(ago(it.last))+'</div></li>'; }).join("")+'</ul>':'<div class="em">Chưa có câu trả lời mới kể từ lần bạn xem.</div>')+
    '<p class="sm mut" style="margin:10px 0 6px">Bấm <b>Theo dõi</b> ở một khảo sát để nhận thông báo trong mục "Nhắc tôi" của Report Hub / CRM (máy chủ kiểm tra mỗi giờ, 7h–21h).</p>'+
    (perm==="default"?'<button class="btn sm" id="np" type="button">Bật thông báo trên máy này</button>':perm==="granted"?'<p class="sm mut">Thông báo trên máy này: đang bật (khi app đang mở).</p>':'');
  p.hidden=false;
  p.querySelectorAll("li[data-id]").forEach(function(li){ li.onclick=function(){ p.hidden=true; location.hash="#s="+encodeURIComponent(li.getAttribute("data-id")); }; });
  if($("np")) $("np").onclick=function(){ Notification.requestPermission().then(function(){ p.hidden=true; bellPop(); }); };
}
function startPoll(){ stopPoll(); pollT=setInterval(function(){ if(document.visibilityState==="visible" && auth()) loadList(true); }, POLL_MS); }
function stopPoll(){ if(pollT) clearInterval(pollT); pollT=0; }
document.addEventListener("visibilitychange", function(){ if(document.visibilityState==="visible" && auth() && LIST) loadList(true); });
document.addEventListener("click", function(e){ var p=$("pop"); if(!p.hidden && !p.contains(e.target) && !$("bell").contains(e.target)) p.hidden=true; });

function loadData(id, force){
  var c=DATA[id];
  if(c && !force && Date.now()-c.at<60000) return Promise.resolve(c.d);
  return api("rsData",{id:id}).then(function(d){
    if(!d || !d.ok) throw new Error((d&&d.error)||"Không đọc được kết quả");
    DATA[id]={d:d, at:Date.now()};
    if(SEEN[id]==null || d.n>SEEN[id]){ SEEN[id]=d.n; saveSeen(); }
    var it=(LIST||[]).filter(function(x){ return x.id===id; })[0]; if(it){ it.n=Math.max(it.n,d.n); PREV[id]=it.n; }
    bell(); if(V.id===id) render(); return d;
  });
}

/* ═════════ màn hình ═════════ */
function route(){
  var m=/#s=([^&]+)/.exec(location.hash||"");
  var id=m?decodeURIComponent(m[1]):"";
  if(id!==V.id){ V={id:id, tab:"st", sec:"", q:"", fq:"", fv:"", lim:30}; window.scrollTo(0,0); }
  render();
  if(id){ loadData(id, false).catch(function(e){ if(V.id===id){ $("main").innerHTML=backLink()+'<div class="note err">'+esc(e.message)+'</div>'; } }); }
}
window.addEventListener("hashchange", route);
function backLink(){ return '<a class="back" href="#">‹ Danh sách khảo sát</a>'; }
function render(){
  if(!auth()){ gate(); return; }
  if(!LIST){ $("main").innerHTML='<div class="boot">Đang đọc danh sách khảo sát…</div>'; return; }
  if(V.id) renderSurvey(); else renderList();
}

function renderList(){
  var h='<h1>Khảo sát</h1><p class="sub">Bấm một khảo sát để xem thống kê từng câu hỏi. Số màu cam = câu trả lời mới kể từ lần bạn xem.</p>'+
    '<div class="addbox"><input class="inp" id="add-l" placeholder="Dán link sửa Google Form (…/forms/d/…/edit) hoặc link file Sheet kết quả để thêm khảo sát"><button class="btn pri" id="add-b" type="button">Thêm khảo sát</button></div>'+
    '<p class="addhint">Form / file của người khác cần chia sẻ quyền Người xem cho <b>'+esc(OWNER||"mmh.product@manimedicalhanoi.com")+'</b> (tài khoản máy chủ đọc kết quả) rồi mới thêm được.</p>';
  if(!LIST.length) h+='<div class="note">Chưa có khảo sát nào. Dán link vào ô phía trên để thêm.</div>';
  else {
    var L=LIST.slice().sort(function(a,b){ return String(b.last||b.at).localeCompare(String(a.last||a.at)); });
    h+='<div class="slist">'+L.map(function(it){
      var nw=newOf(it);
      return '<div class="scard" data-id="'+esc(it.id)+'" tabindex="0"><h3>'+esc(it.title)+'</h3>'+
        '<div class="big num">'+n0(it.n)+'<small>câu trả lời</small> '+(nw?'<span class="newb">+'+nw+' mới</span>':'')+'</div>'+
        '<div class="meta">'+(it.err?'<span class="errb">'+esc(it.err)+'</span>':(it.last?'Mới nhất '+esc(dt(it.last))+' · '+esc(ago(it.last)):'Chưa có câu trả lời'))+'</div>'+
        '<div class="meta">Thêm bởi '+esc(it.by||"–")+(it.watchers?' · '+it.watchers+' người theo dõi':'')+'</div>'+
        '<div class="foot"><button class="btn sm'+(it.watch?' on':'')+'" data-w="'+esc(it.id)+'" type="button">'+ICON.bell+(it.watch?'Đang theo dõi':'Theo dõi')+'</button>'+
        (it.sheetUrl?'<a class="btn sm" href="'+esc(it.sheetUrl)+'" target="_blank" rel="noopener" data-stop="1">'+ICON.ext+'Sheet</a>':'')+
        (it.formUrl?'<a class="btn sm" href="'+esc(it.formUrl)+'" target="_blank" rel="noopener" data-stop="1">'+ICON.ext+'Form</a>':'')+
        (it.canDel?'<button class="btn sm" data-del="'+esc(it.id)+'" type="button">Bỏ khỏi danh sách</button>':'')+'</div></div>';
    }).join("")+'</div>';
  }
  $("main").innerHTML=h;
  $("add-b").onclick=addSurvey; $("add-l").onkeydown=function(e){ if(e.key==="Enter") addSurvey(); };
  document.querySelectorAll(".scard").forEach(function(c){
    var go=function(){ location.hash="#s="+encodeURIComponent(c.getAttribute("data-id")); };
    c.onclick=function(e){ if(e.target.closest("[data-w],[data-del],[data-stop]")) return; go(); };
    c.onkeydown=function(e){ if(e.key==="Enter") go(); };
  });
  document.querySelectorAll("[data-w]").forEach(function(b){ b.onclick=function(){ watch(b.getAttribute("data-w")); }; });
  document.querySelectorAll("[data-del]").forEach(function(b){ b.onclick=function(){ removeSurvey(b.getAttribute("data-del")); }; });
}
function addSurvey(){
  var i=$("add-l"), link=String(i.value||"").trim(), b=$("add-b");
  if(!link){ i.focus(); return; }
  b.disabled=true; b.textContent="Đang mở link…";
  api("rsAdd",{link:link}).then(function(d){
    b.disabled=false; b.textContent="Thêm khảo sát";
    if(!d || !d.ok){ modal('<h3>Chưa thêm được</h3><p>'+esc((d&&d.error)||"Lỗi không rõ")+'</p><div class="row"><button class="btn pri" data-x="1" type="button">Đóng</button></div>'); return; }
    toast(d.dup?"Khảo sát đã có trong danh sách":"Đã thêm: "+d.item.title);
    return loadList().then(function(){ location.hash="#s="+encodeURIComponent(d.item.id); });
  },function(e){ b.disabled=false; b.textContent="Thêm khảo sát"; toast(e.message); });
}
function watch(id){
  var it=(LIST||[]).filter(function(x){ return x.id===id; })[0]; if(!it) return;
  var on=!it.watch; it.watch=on; it.watchers=Math.max(0,(it.watchers||0)+(on?1:-1)); render();
  api("rsWatch",{id:id, on:on?1:0}).then(function(d){
    if(!d||!d.ok){ it.watch=!on; render(); toast((d&&d.error)||"Chưa lưu được"); return; }
    toast(on?"Đã theo dõi: có câu trả lời mới sẽ báo ở mục Nhắc tôi của Report Hub / CRM":"Đã bỏ theo dõi");
  },function(e){ it.watch=!on; render(); toast(e.message); });
}
function removeSurvey(id){
  var it=(LIST||[]).filter(function(x){ return x.id===id; })[0]; if(!it) return;
  modal('<h3>Bỏ khảo sát khỏi danh sách?</h3><p>'+esc(it.title)+'</p><p class="sm mut">Chỉ ẩn khỏi app này. Form và file kết quả trên Google Drive giữ nguyên. Thêm lại bằng link bất cứ lúc nào.</p><div class="row"><button class="btn" data-x="1" type="button">Huỷ</button><button class="btn pri" id="rm-ok" type="button">Bỏ khỏi danh sách</button></div>');
  $("rm-ok").onclick=function(){ closeModal(); LIST=LIST.filter(function(x){ return x.id!==id; }); render();
    api("rsRemove",{id:id}).then(function(d){ if(!d||!d.ok){ toast((d&&d.error)||"Chưa bỏ được"); loadList(true).then(render); } }); };
}

/* ── thống kê ── */
function ansRows(d){
  var rows=d.answers;
  if(V.fq!=="" && V.fv!==""){ var k=+V.fq, v=V.fv; rows=rows.filter(function(r){ var a=r[1][k]; return a!=null && (Array.isArray(a)? a.indexOf(v)>=0 : a===v); }); }
  return rows;
}
function statOf(q, rows){
  var k=q.k, ans=rows.map(function(r){ return r[1][k]; }).filter(function(a){ return a!=null && !(Array.isArray(a)&&!a.some(function(x){ return x!=null; })); });
  var s={n:ans.length, opts:[], other:[], avg:null};
  if(q.t==="radio"||q.t==="checkbox"||q.t==="scale"){
    var cnt={}; q.opts.forEach(function(o){ cnt[o]=0; });
    ans.forEach(function(a){ (Array.isArray(a)?a:[a]).forEach(function(v){ if(v==null||v==="") return; if(cnt[v]!=null) cnt[v]++; else s.other.push(v); }); });
    s.opts=q.opts.map(function(o){ return {v:o, c:cnt[o]}; });
    if(s.other.length) s.opts.push({v:"Khác (tự ghi)", c:s.other.length, oth:true});
    if(q.t==="scale"){ var sum=0,m=0; ans.forEach(function(a){ var x=parseFloat(a); if(isFinite(x)){ sum+=x; m++; } }); s.avg=m?sum/m:null; }
  } else if(q.t==="grid"||q.t==="checkgrid"){
    s.rows=q.rows.map(function(rn, ri){ var c={}, nr=0; q.cols.forEach(function(cn){ c[cn]=0; });
      ans.forEach(function(a){ var v=a[ri]; if(v==null) return; nr++; (Array.isArray(v)?v:[v]).forEach(function(x){ if(c[x]!=null) c[x]++; }); });
      return {r:rn, n:nr, c:c}; });
  } else {
    var g={}; ans.forEach(function(a){ var t=String(a).trim(); if(!t) return; var key=nk(t); if(!g[key]) g[key]={v:t, c:0}; g[key].c++; });
    s.texts=Object.keys(g).map(function(key){ return g[key]; }).sort(function(a,b){ return b.c-a.c; });
  }
  return s;
}
function optHtml(o, base, top){
  var w=base?Math.round(o.c*100/base):0;
  return '<div class="opt'+(top&&o.c?' top':'')+(o.c?'':' zero')+'"><span class="lb">'+esc(o.v)+'</span><span class="tr"><i style="width:'+w+'%"></i></span><span class="v"><b>'+n0(o.c)+'</b><span>'+pct(o.c,base)+'</span></span></div>';
}
function qHtml(q, rows, total){
  var s=statOf(q, rows), h='', wide=false;
  var meta=n0(s.n)+' / '+n0(total)+' người trả lời'+(total?' ('+pct(s.n,total)+')':'');
  if(q.t==="checkbox") meta+=' · chọn nhiều, tổng có thể vượt 100%';
  if(q.pii && s.n===0 && !(DATA[V.id]&&DATA[V.id].d.pii)){ return '<div class="q"><div class="grp">'+esc(q.grp||"")+'</div><h4>'+esc(q.q)+'</h4><div class="qm">Thông tin cá nhân: chỉ Admin / Giám đốc / Trưởng bộ phận và người thêm khảo sát xem được.</div></div>'; }
  if(q.t==="radio"||q.t==="checkbox"||q.t==="scale"){
    var mx=Math.max.apply(null,[0].concat(s.opts.map(function(o){ return o.c; })));
    var list=s.opts.slice(); if(UI.sort==="cnt") list.sort(function(a,b){ return (b.oth?-1:0)-(a.oth?-1:0) || b.c-a.c; });
    h=list.map(function(o){ return optHtml(o, s.n, o.c===mx); }).join("");
    if(s.other.length){ var oc={}; s.other.forEach(function(v){ var kk=nk(v); oc[kk]=oc[kk]||{v:v,c:0}; oc[kk].c++; });
      h+='<ul class="oth">'+Object.keys(oc).map(function(kk){ return '<li>'+esc(oc[kk].v)+(oc[kk].c>1?' <b>×'+oc[kk].c+'</b>':'')+'</li>'; }).join("")+'</ul>'; }
    if(q.t==="scale" && s.avg!=null) h+='<div class="avg">Điểm trung bình: <b>'+String(Math.round(s.avg*10)/10).replace(".",",")+'</b> / '+esc(q.hi)+(q.ll||q.hl?' <span class="mut">('+esc(q.lo)+' = '+esc(q.ll)+', '+esc(q.hi)+' = '+esc(q.hl)+')</span>':'')+'</div>';
  } else if(q.t==="grid"||q.t==="checkgrid"){
    wide=q.cols.length>3;
    h='<table class="gtab"><thead><tr><th></th>'+q.cols.map(function(c){ return '<th>'+esc(c)+'</th>'; }).join("")+'</tr></thead><tbody>'+
      s.rows.map(function(r){ return '<tr><td>'+esc(r.r)+'</td>'+q.cols.map(function(c){ var v=r.c[c], p=r.n?v/r.n:0;
        return '<td class="c" style="background:rgba(58,92,170,'+(p*0.32).toFixed(2)+')"><b>'+n0(v)+'</b><small>'+pct(v,r.n)+'</small></td>'; }).join("")+'</tr>'; }).join("")+'</tbody></table>';
  } else {
    h=s.texts.length?'<ul class="txts">'+s.texts.slice(0,200).map(function(t){ return '<li>'+esc(t.v)+(t.c>1?'<b>×'+t.c+'</b>':'')+'</li>'; }).join("")+'</ul>':'<div class="mut sm">Chưa có câu trả lời.</div>';
    wide=s.texts.length>8;
  }
  return '<div class="q'+(wide?' wide':'')+'" id="q'+q.k+'">'+(q.grp?'<div class="grp">'+esc(q.grp)+'</div>':'')+'<h4>'+esc(q.q)+'</h4><div class="qm">'+meta+'</div>'+h+'</div>';
}
function secsOf(d){ var o=[]; d.questions.forEach(function(q){ var s=q.sec||"Chung"; if(o.indexOf(s)<0) o.push(s); }); return o; }
function shownQs(d){
  var f=nk(V.q);
  return d.questions.filter(function(q){ if(q.pii) return false;  /* họ tên / SĐT / email: không phải số liệu thống kê ⇒ chỉ ở tab Từng câu trả lời */
    if(V.sec && (q.sec||"Chung")!==V.sec) return false; if(f && nk(q.q+" "+(q.grp||"")).indexOf(f)<0) return false; return true; });
}
function renderSurvey(){
  var c=DATA[V.id], it=(LIST||[]).filter(function(x){ return x.id===V.id; })[0];
  if(!c){ $("main").innerHTML=backLink()+'<h1>'+esc(it?it.title:"Khảo sát")+'</h1><div class="boot">Đang đọc kết quả…</div>'; return; }
  var d=c.d, rows=ansRows(d), total=rows.length, secs=secsOf(d);
  var first=d.answers.length?d.answers[0][0]:0, lastA=d.answers.length?d.answers[d.answers.length-1][0]:0;
  var today=new Date(); today.setHours(0,0,0,0);
  var nToday=d.answers.filter(function(r){ return r[0]>=today.getTime(); }).length;
  var h=backLink()+'<div class="shead"><div class="tt"><h1>'+esc(d.title)+'</h1><div class="sub" style="margin:0">'+(d.accepting?'Đang nhận câu trả lời':'Đã ngừng nhận câu trả lời')+' · cập nhật '+esc(ago(c.at)||"vừa xong")+'</div></div>'+
    '<div class="row"><button class="btn'+(it&&it.watch?' on':'')+'" id="s-w" type="button">'+ICON.bell+(it&&it.watch?'Đang theo dõi':'Theo dõi')+'</button>'+
    '<button class="btn" id="s-r" type="button">'+ICON.ref+'Tải lại</button>'+
    '<button class="btn" id="s-csv" type="button">'+ICON.dl+'Tải bảng thống kê</button>'+
    (d.sheetUrl?'<a class="btn" href="'+esc(d.sheetUrl)+'" target="_blank" rel="noopener">'+ICON.ext+'Sheet</a>':'')+
    (d.editUrl?'<a class="btn" href="'+esc(d.editUrl)+'" target="_blank" rel="noopener">'+ICON.ext+'Form</a>':'')+'</div></div>'+
    '<div class="kpis"><div class="kpi"><b class="num">'+n0(d.n)+'</b><span>câu trả lời</span></div><div class="kpi"><b class="num">'+n0(nToday)+'</b><span>hôm nay</span></div>'+
    '<div class="kpi"><b>'+esc(lastA?dt(lastA).slice(0,16):"–")+'</b><span>câu trả lời mới nhất</span></div><div class="kpi"><b>'+esc(first?dt(first).slice(0,10):"–")+'</b><span>câu trả lời đầu tiên</span></div></div>';
  h+='<div class="bar2"><div class="tabs"><button class="tab'+(V.tab==="st"?' on':'')+'" data-t="st" type="button">Thống kê theo câu hỏi</button><button class="tab'+(V.tab==="rs"?' on':'')+'" data-t="rs" type="button">Từng câu trả lời ('+n0(total)+')</button></div>';
  if(V.tab==="st") h+='<div class="chips"><button class="chip'+(V.sec?'':' on')+'" data-s="" type="button">Tất cả phần</button>'+secs.map(function(s){ return '<button class="chip'+(V.sec===s?' on':'')+'" data-s="'+esc(s)+'" type="button">'+esc(s)+'</button>'; }).join("")+'</div>';
  var fqs=d.questions.filter(function(q){ return (q.t==="radio"||q.t==="checkbox"||q.t==="scale") && q.opts.length; });
  h+='<div class="flt">'+(V.tab==="st"?'<input class="inp" id="s-q" placeholder="Tìm câu hỏi…" value="'+esc(V.q)+'" style="width:200px">':'')+
    '<select class="inp" id="s-fq" style="width:min(320px,100%)"><option value="">Lọc người trả lời theo câu…</option>'+fqs.map(function(q){ return '<option value="'+q.k+'"'+(String(q.k)===V.fq?' selected':'')+'>'+esc((q.grp?q.grp.replace(/^(Câu\s+\d+).*$/,"$1")+" · ":"")+q.q).slice(0,90)+'</option>'; }).join("")+'</select>'+
    (V.fq!==""?'<select class="inp" id="s-fv" style="width:min(260px,100%)"><option value="">Chọn câu trả lời…</option>'+d.questions[+V.fq].opts.map(function(o){ return '<option'+(o===V.fv?' selected':'')+'>'+esc(o)+'</option>'; }).join("")+'</select>':'')+
    (V.tab==="st"?'<button class="btn sm" id="s-sort" type="button">'+(UI.sort==="cnt"?'Xếp theo thứ tự trên form':'Xếp theo số người')+'</button>':'')+'</div>'+
    (V.fq!==""&&V.fv!==""?'<div class="fon">Đang lọc: '+n0(total)+' / '+n0(d.n)+' người trả lời chọn "'+esc(V.fv)+'". <button class="lnk" id="s-fx" type="button">Bỏ lọc</button></div>':'')+'</div>';
  if(!d.n) h+='<div class="note">Khảo sát chưa có câu trả lời nào.</div>';
  else if(V.tab==="st"){
    var Q=shownQs(d), cur=null, buf='';
    if(!Q.length) h+='<div class="note">Không có câu hỏi khớp.</div>';
    Q.forEach(function(q){ var s=q.sec||"Chung"; if(s!==cur){ if(buf) h+='<div class="qs">'+buf+'</div>'; buf=''; cur=s; h+='<div class="sec">'+esc(s)+'</div>'; } buf+=qHtml(q, rows, total); });
    if(buf) h+='<div class="qs">'+buf+'</div>';
    h+='<p class="sm mut" style="margin-top:16px">'+(d.pii?'Họ tên, số điện thoại người trả lời: xem ở tab Từng câu trả lời.':'Họ tên, số điện thoại, email người trả lời chỉ hiện với Admin / Giám đốc / Trưởng bộ phận và người thêm khảo sát.')+'</p>';
  } else h+=respHtml(d, rows);
  $("main").innerHTML=h;
  wireSurvey(d);
}
function fmtAns(q, a){
  if(a==null) return "";
  if(q.t==="grid"||q.t==="checkgrid") return q.rows.map(function(r,i){ var v=a[i]; if(v==null||(Array.isArray(v)&&!v.length)) return ""; return r+": "+(Array.isArray(v)?v.join(", "):v); }).filter(Boolean).join(" · ");
  return Array.isArray(a)?a.join("; "):String(a);
}
function respHtml(d, rows){
  var L=rows.slice().reverse(), sh=L.slice(0,V.lim);
  return '<div class="rlist">'+sh.map(function(r, i){
    var items=d.questions.map(function(q){ var v=fmtAns(q, r[1][q.k]); return v?'<dt>'+esc((q.grp?q.grp.replace(/^(Câu\s+\d+).*$/,"$1")+" · ":"")+q.q)+'</dt><dd>'+esc(v)+'</dd>':''; }).join("");
    return '<div class="resp"><div class="h"><span>#'+(L.length-i)+'</span><span>'+esc(dt(r[0]))+'</span></div><dl>'+items+'</dl></div>';
  }).join("")+'</div>'+(L.length>V.lim?'<div style="text-align:center;margin-top:12px"><button class="btn" id="s-more" type="button">Xem thêm ('+(L.length-V.lim)+')</button></div>':'');
}
function wireSurvey(d){
  var it=(LIST||[]).filter(function(x){ return x.id===V.id; })[0];
  $("s-w").onclick=function(){ watch(V.id); };
  $("s-r").onclick=function(){ var b=$("s-r"); b.disabled=true; loadData(V.id, true).then(function(){ toast("Đã tải lại"); }, function(e){ b.disabled=false; toast(e.message); }); };
  $("s-csv").onclick=function(){ csv(d); };
  document.querySelectorAll("[data-t]").forEach(function(b){ b.onclick=function(){ V.tab=b.getAttribute("data-t"); render(); }; });
  document.querySelectorAll("[data-s]").forEach(function(b){ b.onclick=function(){ V.sec=b.getAttribute("data-s"); render(); }; });
  var qi=$("s-q"); if(qi){ qi.oninput=function(){ var p=qi.selectionStart; V.q=qi.value; render(); var q2=$("s-q"); if(q2){ q2.focus(); try{ q2.setSelectionRange(p,p); }catch(_){} } }; }
  $("s-fq").onchange=function(){ V.fq=this.value; V.fv=""; render(); };
  if($("s-fv")) $("s-fv").onchange=function(){ V.fv=this.value; render(); };
  if($("s-fx")) $("s-fx").onclick=function(){ V.fq=""; V.fv=""; render(); };
  if($("s-sort")) $("s-sort").onclick=function(){ UI.sort=UI.sort==="cnt"?"form":"cnt"; ls(LS_UI, UI); render(); };
  if($("s-more")) $("s-more").onclick=function(){ V.lim+=30; render(); };
}
function csv(d){
  var rows=ansRows(d), total=rows.length, out=[["Phần","Câu hỏi","Lựa chọn","Số người","% người trả lời câu này","Số người trả lời câu này","Tổng người trả lời"]];
  d.questions.forEach(function(q){
    var s=statOf(q, rows), title=(q.grp?q.grp+" · ":"")+q.q;
    if(s.opts.length) s.opts.forEach(function(o){ out.push([q.sec||"", title, o.v, o.c, pct(o.c,s.n), s.n, total]); });
    else if(s.rows) s.rows.forEach(function(r){ q.cols.forEach(function(c){ out.push([q.sec||"", title+" [" + r.r + "]", c, r.c[c], pct(r.c[c],r.n), r.n, total]); }); });
    else if(!q.pii) (s.texts||[]).forEach(function(t){ out.push([q.sec||"", title, t.v, t.c, "", s.n, total]); });
  });
  var txt="﻿"+out.map(function(r){ return r.map(function(v){ v=String(v==null?"":v); return /[",\n;]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }).join(","); }).join("\r\n");
  var a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([txt],{type:"text/csv;charset=utf-8"}));
  /* tên file bỏ dấu: một số trình duyệt bỏ qua tên có dấu ⇒ file tên "download" không đuôi */
  var fn=d.title.normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D").replace(/[^\x20-\x7E]+/g,"-").replace(/[\\/:*?"<>|&]+/g," ").replace(/\s+/g," ").trim();
  a.download="Thong ke - "+fn.slice(0,80)+(V.fv?" (loc)":"")+".csv"; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

/* ═════════ khởi động ═════════ */
function start(){
  if(!API){ $("main").innerHTML='<div class="note err">App chưa được nối máy chủ (KS_API trống).</div>'; return; }
  if(!auth()){ gate(); return; }
  userChip(); render();
  loadList().then(function(){ route(); startPoll(); }, function(e){ if(auth()) $("main").innerHTML='<div class="note err">Không đọc được danh sách khảo sát: '+esc(e.message)+'</div><p><button class="btn" id="retry" type="button">Thử lại</button></p>'; var r=$("retry"); if(r) r.onclick=start; });
}
$("bell").onclick=function(e){ e.stopPropagation(); bellPop(); };
start();
})();
