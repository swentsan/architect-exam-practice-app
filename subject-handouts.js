(function(){
"use strict";
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
if(!window.QUIZ_DATA_BY_YEAR||!window.ConstructionAtlas){$("lecture").textContent="題庫載入失敗，請重新整理。";return;}
const config=SubjectAtlas.current;
document.getElementById("lecture-subject-title").textContent=config.name+" 主題講義";
document.getElementById("back-topics").href="subject-topics.html?subject="+config.id;
if(config.notice){const n=document.createElement("p");n.className="print-note";n.textContent=config.notice;document.querySelector(".toolbar h1").after(n);}
const rows=ConstructionAtlas.build(window.QUIZ_DATA_BY_YEAR);
const topics=ConstructionAtlas.topics.concat([{id:"other",name:"其他待分類",group:"補充附錄"}]);
const years=Array.from(new Set(rows.map(q=>q.year)));
const byId=Object.fromEntries(topics.map(t=>[t.id,t]));
topics.forEach((t,i)=>$("handout-topic").add(new Option(String(i+1).padStart(2,"0")+" "+t.name,t.id)));
years.forEach(y=>$("handout-year").add(new Option(y+" 年",y)));
const params=new URLSearchParams(location.search);
if(byId[params.get("topic")])$("handout-topic").value=params.get("topic");
if(years.includes(params.get("year")))$("handout-year").value=params.get("year");
if(["inline","end","none"].includes(params.get("answers")))$("answer-layout").value=params.get("answers");
 const cleanOption=o=>String(o==null?"":o).replace(/\s*代號[：:]\s*\d+\s*頁次[：:]\s*[\d－—–-]+\s*$/,"").trim();
function answer(q){
 const raw=q.answer||"",keys=Array.from(new Set(raw.match(/[A-D]/g)||[]));
 if(/一律給分|均給分|均予給分/.test(raw))return {text:raw,note:"依原答案特殊給分註記。",flag:false};
 const clean=/^[A-D](?:\s*(?:或|、|,|\/|\\||及|和|與)\s*[A-D])*$/.test(raw);
 if(!keys.length)return {text:"答案註記待核對",note:"既有答案欄位為特殊給分或編碼異常，請查看原答案公告。",flag:true};
 const text=keys.map(k=>k+" "+(cleanOption((q.options||[])[k.charCodeAt(0)-65])||"【選項內容缺漏，請核對原試卷】")).join("；或 ");
 return {text:text,note:clean?"":"原答案含特殊或編碼異常註記；此處列出可辨識字母，給分方式請核對原公告。",flag:!clean};
}
const figure=q=>/下圖|如圖|附圖|圖中|圖示|圖例|圖所示|圖\s*[一二三四五六七八九十0-9ＡＢＣＤA-D]|下表|表中|附表/.test(q.stem);
function question(q,n,layout){
 const a=answer(q),flags=[];
 if(q.review)flags.push("分類需人工確認");
 if(q.sourceIssues&&q.sourceIssues.length)flags.push(...q.sourceIssues);
 if(a.flag)flags.push("答案註記待核對");
 if((q.options||[]).some(o=>/代號[：:]|頁次[：:]/.test(o)))flags.push("原題庫含頁尾殘留，選項請核對");
 const options=(q.options||[]).map((o,i)=>{const clean=cleanOption(o);return '<li><span class="letter">('+String.fromCharCode(65+i)+')</span><span class="option-text">'+esc(clean||"【選項內容缺漏，請核對原試卷】")+'</span></li>';}).join("");
 return '<article class="question" data-question-id="'+q.id+'"><p class="question-id">'+String(n+1).padStart(3,"0")+'　'+q.year+' 年 第 '+esc(q.number)+' 題'+(flags.length?'　<span class="flags">'+flags.join("／")+'</span>':"")+'</p><p class="question-stem">'+esc(q.stem)+'</p><ul class="options">'+options+'</ul>'+(figure(q)?'<p class="figure-note">【圖表提示】題幹提及圖表，目前文字題庫未收錄原圖，請搭配原試卷。</p>':"")+(layout==="inline"?'<p class="answer">答案　'+esc(a.text)+'</p>'+(a.note?'<p class="answer-note">'+esc(a.note)+'</p>':""):"")+'</article>';
}
function render(){
 const topic=$("handout-topic").value,year=$("handout-year").value,layout=$("answer-layout").value;
 const selected=rows.filter(q=>(!topic||q.primary===topic)&&(!year||q.year===year));
 const chosen=topics.filter(t=>(!topic||t.id===topic)&&selected.some(q=>q.primary===t.id));
 const flagged=selected.filter(q=>q.review).length,bad=selected.filter(q=>answer(q).flag).length;
 document.title=config.name+" "+(topic?byId[topic].name:"主題合訂本")+(year?" "+year+"年":" 100-114年");
 $("status").textContent=selected.length+" 題・"+chosen.length+" 個章節・"+flagged+" 題分類需確認・"+bad+" 題答案註記待核對";
 $("print").disabled=!selected.length;$("download").disabled=!selected.length;
 let html="";
 if(!topic){
 html='<section class="cover"><h1 class="cover-title">'+esc(config.name)+'<br>歷年主題題目與答案講義</h1><p class="subtitle">'+(year?year+" 年":"100–114 年")+'　共 '+selected.length+' 題</p><p class="intro">本講義依原練習題庫的主分類編排，每題僅收錄一次，保留年份、原題號與選項。各章依年份由新到舊、題號由小到大排列。供主題複習與原題查找使用。</p>'+ (config.notice?'<p class="intro">'+esc(config.notice)+'</p>':'') +'<p class="intro">分類為自動初分，標示需確認的題目請人工核對。圖表提示題需搭配原試卷；特殊符號缺字以□標示，公式與上下標請核對原題。答案沿用既有題庫，特殊或編碼異常的答案註記不另行推定。'+(layout==="end"?"各章末列出答案。":layout==="none"?"本版僅列題目，不顯示答案。":"答案列於每題下方。")+'</p><table class="toc"><thead><tr><th>章節</th><th>題數</th></tr></thead><tbody>'+chosen.map((t,i)=>'<tr><td><a href="#chapter-'+t.id+'">'+String(i+1).padStart(2,"0")+' '+esc(t.name)+'</a></td><td>'+selected.filter(q=>q.primary===t.id).length+'</td></tr>').join("")+'</tbody></table><p class="intro">資料整理日期 2026 年 11 月 11 日<br>列印建議 A4 100% 比例 雙面長邊翻頁 左側裝訂</p><p class="source-note">題目與答案來源：本專案 quiz_data_years_v4.js。依科目知識架構進行自動初分，不代表官方分類。</p></section>';
 }
 html+=chosen.map((t,i)=>{
 const qs=selected.filter(q=>q.primary===t.id).sort((a,b)=>Number(b.year)-Number(a.year)||Number(a.number)-Number(b.number));
 return '<section class="topic-section" id="chapter-'+t.id+'"><h2 class="topic-heading">'+String(topics.findIndex(x=>x.id===t.id)+1).padStart(2,"0")+' '+esc(t.name)+'</h2><p class="topic-description">'+(year?year+" 年":"100–114 年")+'　共 '+qs.length+' 題　主分類收錄'+(t.id==="other"?"　以下題目尚未確定主題":"")+'</p>'+(config.notice?'<p class="intro">'+esc(config.notice)+'</p>':'')+qs.map((q,n)=>question(q,n,layout)).join("")+(layout==="end"?'<section class="answer-key"><h3>'+esc(t.name)+' 答案</h3>'+qs.map(q=>{const a=answer(q);return '<div class="key-item"><strong>'+q.year+' 年 第 '+esc(q.number)+' 題</strong>'+esc(a.text)+(a.note?'<div class="answer-note">'+esc(a.note)+'</div>':"")+'</div>';}).join("")+'</section>':"")+'</section>';
 }).join("");
 $("lecture").innerHTML=html||"<p>沒有符合條件的題目。</p>";
 window.HANDOUT_SUMMARY={total:selected.length,chapters:chosen.length,review:flagged,answerFlags:bad,ids:selected.map(q=>q.id)};
}
["handout-topic","handout-year","answer-layout"].forEach(id=>$(id).addEventListener("change",render));
$("print").onclick=()=>window.print();
$("download").onclick=()=>{
 const clone=document.documentElement.cloneNode(true);
 clone.querySelectorAll("script,.toolbar").forEach(el=>el.remove());
 const content="<!doctype html>\n"+clone.outerHTML;
 const url=URL.createObjectURL(new Blob(["\uFEFF"+content],{type:"text/html;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download=document.title.replace(/[\\/:*?"<>|]/g,"_")+".html";a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
};
render();
})();
