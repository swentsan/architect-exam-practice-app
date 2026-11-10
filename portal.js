(function(){
"use strict";
const entries=Array.isArray(window.LEARNING_SUBJECTS)?window.LEARNING_SUBJECTS:[];
const target=document.getElementById("subject-entries");
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const path=s=>{const v=String(s||"");return /^[a-zA-Z0-9][a-zA-Z0-9_./-]*\.html(?:[?#][a-zA-Z0-9_=&%./-]*)?$/.test(v)&&!v.includes("..")?v:null;};
function drawing(type){
 const lines=type==="section"?'<path d="M20 100 112 146 210 96 118 50Z M20 72 112 118 210 68 118 22Z M20 44 112 90 210 40 118 -6Z" stroke="currentColor"/><path d="M112 90v28 M112 118v28 M20 44v28 M210 40v28 M118 22v28" stroke="#b65439" stroke-dasharray="4 4"/><path d="M35 125 110 163 223 105" stroke="currentColor" stroke-dasharray="3 4"/>':'<path d="M24 18H201V140H24Z M24 65H124 M84 65v75 M124 18v74 M124 92h77 M153 92v48 M45 18v-8 M175 140v10 M13 18v122 M8 18h10 M8 140h10" stroke="currentColor"/><path d="M84 65h24a24 24 0 0 1-24 24 M153 92h23a23 23 0 0 1-23 23" stroke="#dc9477"/><path d="M24 155h177 M24 150v10 M201 150v10 M44 28v22 M34 39h22" stroke="currentColor" stroke-dasharray="3 3"/>';
 return '<svg viewBox="0 0 240 180" aria-hidden="true" fill="none" stroke-width="1.3">'+lines+'</svg>';
}
const usable=entries.filter(x=>x&&x.title&&path(x.href));
const overview=usable.find(x=>x.id==="architect-exam");
const subjects=usable.filter(x=>x.id!=="architect-exam");
target.innerHTML=subjects.map((item,i)=>'<article class="subject-card" data-subject="'+esc(item.id||i)+'"><div class="card-art" aria-hidden="true"><span class="card-number">'+String(i+1).padStart(2,"0")+' / STUDY</span>'+drawing(item.icon)+'<span class="card-art-caption">'+esc(item.english)+'</span></div><div class="card-body"><p class="card-english">'+esc(item.english)+'</p><h3><a href="'+esc(path(item.href))+'">'+esc(item.title)+'</a></h3><p class="card-description">'+esc(item.description)+'</p><div class="meta">'+(item.meta||[]).map(m=>'<span>'+esc(m)+'</span>').join("")+'</div></div><div class="card-actions"><a class="card-primary" href="'+esc(path(item.href))+'">'+esc(item.action||"進入專區")+'<span aria-hidden="true">→</span></a>'+(item.secondary||[]).filter(l=>path(l.href)).map(l=>'<a class="card-secondary" href="'+esc(path(l.href))+'">'+esc(l.text)+' ↗</a>').join("")+'</div></article>').join("");
if(overview)document.getElementById("exam-entry").innerHTML='<article class="exam-overview" data-subject="architect-exam"><div><p class="eyebrow">ALL SUBJECTS / EXAM PRACTICE</p><h2>建築師考古題</h2><p>四科整合練習，依年份選擇科目，逐題作答或交卷後看答案。</p><div class="overview-meta">'+overview.meta.map(x=>'<span>'+esc(x)+'</span>').join("")+'</div></div><a class="card-primary" href="'+esc(path(overview.href))+'">進入四科考古題 <span aria-hidden="true">→</span></a></article>';
})();
