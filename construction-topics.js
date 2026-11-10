(function(){
"use strict";
const $=function(id){return document.getElementById(id);};
const escape=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});};
const bank=window.QUIZ_DATA_BY_YEAR;
if(!bank){$("count").textContent="題庫載入失敗，請重新整理網頁。";$("practice").disabled=true;return;}
const all=ConstructionAtlas.build(bank);
const topics=ConstructionAtlas.topics.concat([{id:"other",name:"其他／待分類",group:"需人工確認"}]);
const name=function(id){return (topics.find(function(t){return t.id===id;})||{}).name||id;};
const years=Array.from(new Set(all.map(function(q){return q.year;})));
let page=1, size=24, current=[],session=null;
years.forEach(function(y){$("year").add(new Option(y+" 年",y));});
topics.forEach(function(t){$("topic").add(new Option(t.name,t.id));});
const pending=all.filter(function(q){return q.review;}).length;
$("stats").innerHTML=[[years.length,"涵蓋年份"],[all.length.toLocaleString(),"歷年構造考題"],[ConstructionAtlas.topics.length,"施工主題"],[pending,"需人工確認分類"]].map(function(x){return '<div class="stat"><strong>'+x[0]+'</strong><small>'+x[1]+'</small></div>';}).join("");
function baseRows(){const y=$("year").value,s=$("search").value.trim().toLowerCase(),review=$("review").value;return all.filter(function(q){return (!y||q.year===y)&&(!review||q.review)&&(!s||[q.stem].concat(q.options||[]).join(" ").toLowerCase().includes(s));});}
function tags(q){return q.tags.map(function(t){return '<span class="tag">'+escape(name(t))+'</span>';}).join("")+(q.review?'<span class="tag pending">分類需人工確認</span>':"");}
function answerText(q){const keys=Array.from(new Set(q.answer.match(/[A-D]/g)||[]));return keys.length?"答案："+keys.join(" 或 "):"特殊給分或答案格式待核對，請查看原答案公告（此題不自動計分）";}
function render(){
 const rows=baseRows(),topic=$("topic").value;
 current=rows.filter(function(q){return !topic||q.tags.includes(topic);});
 $("topics").innerHTML=topics.map(function(t,i){const n=rows.filter(function(q){return q.primary===t.id;}).length;return '<button class="topic" data-topic="'+t.id+'" aria-pressed="'+(t.id===topic)+'"><small>'+String(i+1).padStart(2,"0")+' / '+escape(t.group)+'</small><strong>'+escape(t.name)+'</strong><div class="n">'+n+'<span>題・主分類</span></div></button>';}).join("");
 $("topics").querySelectorAll("button").forEach(function(b){b.onclick=function(){$("topic").value=$("topic").value===b.dataset.topic?"":b.dataset.topic;page=1;render();};});
 $("list-title").textContent=topic?name(topic):"全部題目";
 const pages=Math.max(1,Math.ceil(current.length/size));page=Math.min(page,pages);
 $("count").textContent="共 "+current.length+" 題"+(topic?"（含相關主題）":"")+" · 每頁 "+size+" 題";
 $("practice").disabled=current.length===0;$("export").disabled=current.length===0;
 $("list").innerHTML=current.slice((page-1)*size,page*size).map(function(q){return '<details class="q"><summary><div class="meta"><span>'+q.year+' 年 · 第 '+escape(q.number)+' 題</span>'+tags(q)+'</div><p class="question-stem">'+escape(q.stem)+'</p><small>展開選項與答案 ＋</small></summary><ol type="A">'+(q.options||[]).map(function(o){return '<li>'+escape(o)+'</li>';}).join("")+'</ol><div class="answer">'+escape(answerText(q))+'</div><small>主分類：'+escape(name(q.primary))+' · 分類依據：'+escape(q.evidence.join("、")||"未命中關鍵字")+'</small></details>';}).join("")||'<p class="q">沒有符合條件的題目，請調整篩選。</p>';
 $("pages").innerHTML='<button class="outline" id="page-prev" '+(page===1?"disabled":"")+'>上一頁</button><span>'+page+' / '+pages+'</span><button class="outline" id="page-next" '+(page===pages?"disabled":"")+'>下一頁</button>';
 $("page-prev").onclick=function(){page--;render();$("questions").scrollIntoView();};$("page-next").onclick=function(){page++;render();$("questions").scrollIntoView();};
}
["year","topic","review"].forEach(function(id){$(id).onchange=function(){page=1;render();};});
$("search").oninput=function(){page=1;render();};
$("clear").onclick=function(){["year","topic","review","search"].forEach(function(id){$(id).value="";});page=1;render();};
$("export").onclick=function(){
 const cell=function(s){let v=String(s==null?"":s);if(/^[=+\-@]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"';};
 const rows=[["年份","題號","主分類","相關主題","分類狀態","分類依據","題目","A","B","C","D","答案"]];
 current.forEach(function(q){rows.push([q.year,q.number,name(q.primary),q.tags.map(name).join("；"),q.review?"需人工確認":"自動初分",q.evidence.join("；"),q.stem].concat(q.options||[],[q.answer]));});
 const blob=new Blob(["\uFEFF"+rows.map(function(r){return r.map(cell).join(",");}).join("\r\n")],{type:"text/csv;charset=utf-8"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="構造歷年考題分類_"+($("year").value||"全部年份")+".csv";a.click();setTimeout(function(){URL.revokeObjectURL(url);},1000);
};
function showQuiz(){
 const q=session.rows[session.index],chosen=session.picks[session.index],reveal=session.finished||($("answer-mode").value==="immediate"&&chosen!=null);
 const allowed=(q.answer.match(/[A-D]/g)||[]);
 $("progress").textContent=(session.index+1)+" / "+session.rows.length+" 題 · 已答 "+session.picks.filter(function(v){return v!=null;}).length+" 題";
 $("quiz-body").innerHTML='<div class="meta">'+q.year+' 年 · 第 '+escape(q.number)+' 題 '+tags(q)+'</div><h3 class="question-stem">'+escape(q.stem)+'</h3>'+(q.options||[]).map(function(o,i){const letter=String.fromCharCode(65+i);return '<button class="option '+(chosen===letter?"chosen ":"")+(reveal&&allowed.includes(letter)?"correct ":"")+(reveal&&chosen===letter&&!allowed.includes(letter)?"wrong":"")+'" data-answer="'+letter+'" '+(reveal?"disabled":"")+'>'+letter+'　'+escape(o)+'</button>';}).join("")+(reveal?'<div class="answer">'+escape(answerText(q))+'</div>':"");
 $("quiz-body").querySelectorAll("button").forEach(function(b){b.onclick=function(){session.picks[session.index]=b.dataset.answer;showQuiz();};});
 $("prev").disabled=session.index===0;
 $("next").textContent=session.index===session.rows.length-1?(session.finished?"回到第一題":"交卷看結果"):"下一題 →";
 $("next").disabled=!session.finished&&chosen==null;
}
$("practice").onclick=function(){if(!current.length)return;session={rows:current.slice(),picks:new Array(current.length).fill(null),index:0,finished:false};$("quiz").hidden=false;$("summary").textContent="";$("answer-mode").disabled=false;showQuiz();$("quiz").scrollIntoView();};
$("exit").onclick=function(){$("quiz").hidden=true;session=null;$("questions").scrollIntoView();};
$("answer-mode").onchange=function(){if(session)showQuiz();};
$("prev").onclick=function(){if(session.index>0){session.index--;showQuiz();}};
$("next").onclick=function(){
 if(session.index<session.rows.length-1){session.index++;showQuiz();return;}
 if(session.finished){session.index=0;showQuiz();return;}
 const missing=session.picks.findIndex(function(v){return v==null;});
 if(missing>=0){session.index=missing;$("summary").textContent="尚有未作答題目，已返回第一題未答題。";showQuiz();return;}
 session.finished=true;$("answer-mode").disabled=true;
 let correct=0,gradable=0;session.rows.forEach(function(q,i){const key=q.answer.match(/[A-D]/g)||[];if(key.length){gradable++;if(key.includes(session.picks[i]))correct++;}});
 $("summary").textContent="已完成 "+session.rows.length+" 題。可判分 "+gradable+" 題，答對 "+correct+" 題，正確率 "+(gradable?Math.round(correct/gradable*100):0)+"%。使用上一題、下一題可逐題檢視答案。";showQuiz();
};
render();
})();