(function(root){
"use strict";
function repair(value){
 const source=String(value==null?"":value);
 if(!/[ÃÂäåæçèéïð]/.test(source))return {text:source,repaired:false};
 try{
  const chars=Array.from(source);if(chars.some(c=>c.charCodeAt(0)>255))return {text:source,repaired:false};
  const out=new TextDecoder("utf-8",{fatal:true}).decode(Uint8Array.from(chars,c=>c.charCodeAt(0)));
  if((out.match(/[\u3400-\u9fff]/g)||[]).length>(source.match(/[\u3400-\u9fff]/g)||[]).length)return {text:out,repaired:true};
 }catch(e){}
 return {text:source,repaired:false};
}
function clean(value){
 let text=repair(value).text.replace(/<sup>([^<]*)<\/sup>/gi,"^($1)").replace(/<sub>([^<]*)<\/sub>/gi,"_($1)").replace(/<br\s*\/?>/gi,"\n").replace(/[\uE000-\uF8FF]/g,"□");
 text=text.replace(/!\[[^\]]*\]\((?:[^()]|\([^)]*\))*\)/g,"〔原題附圖未收錄，請對照原試卷〕");
 text=text.replace(/\$([^$]+)\$/g,(_,math)=>math.replace(/\\(?:mathrm|text)\{([^{}]*)\}/g,"$1").replace(/_\{([^{}]*)\}/g,"_($1)").replace(/\^\{([^{}]*)\}/g,"^($1)").replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g,"($1)/($2)").replace(/\\rightarrow/g,"→").replace(/\\ /g," "));
 return text.replace(/\s*代號[：:]\s*\d+\s*頁次[：:]\s*[\d－—–-]+\s*$/,"").trim();
}
const garbled=s=>/[æåçèéï][\u0080-\u00bf]/.test(s)||s.includes("\ufffd");
const statutes=[
["建築師法","architect"],["公寓大廈管理條例","condo"],["營造業法","contractor"],["政府採購法","procurement"],
["建築物室內裝修管理辦法","use"],["建築物使用類組","use"],["招牌廣告","use"],["公共安全檢查","public-safety"],["公共安全改善","public-safety"],
["無障礙設施設計","accessibility"],["都市更新條例","renewal"],["危險及老舊","renewal"],["都市計畫","urban"],
["國土計畫","nonurban"],["區域計畫","nonurban"],["非都市土地","nonurban"],["國家公園法","nonurban"],["農業用地興建農舍","nonurban"],["山坡地建築","nonurban"],
["文化資產保存法","heritage"],["住宅法","heritage"]
];
function forSubject(config){
 const reviewData=root.CLASSIFICATION_REVIEWS&&root.CLASSIFICATION_REVIEWS[config.id];
 const displayTopics=config.topics.concat(reviewData?reviewData.addedTopics:[]);
 function classify(q){
  const stem=clean(q.stem).normalize("NFKC").toLowerCase(),opts=(q.options||[]).map(clean).join(" ").normalize("NFKC").toLowerCase();
  const includes=(text,word)=>/^[A-Za-z][A-Za-z0-9]{1,5}$/.test(word)?new RegExp("\\b"+word.toLowerCase()+"\\b").test(text):text.includes(word.toLowerCase());
  const hits=config.topics.map(t=>{
   let a=0,b=0;const evidence=[];
   for(const w of t.words){const key=w.toLowerCase();if(includes(stem,w)){a++;evidence.push(w);}else if(includes(opts,w)){b++;evidence.push(w);}}
   return {id:t.id,score:a*4+b,stemHits:a,evidence};
  }).filter(h=>h.score>0).sort((a,b)=>b.score-a.score);
  const named=config.id==="law"?statutes.map(([phrase,id])=>({phrase,id,index:stem.slice(0,55).indexOf(phrase)})).filter(x=>x.index>=0).sort((a,b)=>a.index-b.index)[0]:null;
  if(!hits.length&&!named)return {primary:"other",tags:["other"],review:true,evidence:[]};
  const first=named?{id:named.id,score:100,stemHits:1,evidence:["原題法規 "+named.phrase]}:hits[0];
  const second=hits.find(h=>h.id!==first.id&&h.stemHits>0&&h.score>=Math.max(4,(named?8:first.score*.6)));
  const tied=!named&&hits[1]&&hits[1].score===first.score;
  return {primary:first.id,tags:second?[first.id,second.id]:[first.id],review:first.stemHits===0||!!tied,evidence:first.evidence};
 }
 function build(bank){
  const rows=[];
  for(const year of Object.keys(bank).sort((a,b)=>Number(b)-Number(a))){
   const s=(bank[year]||[]).find(x=>x.code===config.code);if(!s)continue;
   for(const [i,q] of (s.questions||[]).entries()){
    const originals=[q.stem,...(q.options||[]),String((s.answers||[])[i]||q.answer||"")];
    let stem=clean(q.stem);
    const hasExamPrefix=/測驗題部分|本測驗試題/.test(stem);
    if(hasExamPrefix){const anchor=new RegExp("(?:^|\\s)"+Number(q.number)+"\\s+(?=[\\u3400-\\u9fff\\uf900-\\ufaff])","g");const matches=Array.from(stem.matchAll(anchor));if(matches.length)stem=stem.slice(matches[matches.length-1].index).replace(new RegExp("^\\s*"+Number(q.number)+"\\s+"),"").trim();}
    const originalStem=stem;const options=(q.options||[]).map(o=>clean(o)||"【選項內容缺漏，請核對原試卷】");
    const answer=repair(originals[originals.length-1]).text.trim().toUpperCase();
    let classification=classify({stem,options});
    let contextQuestions=[];
    if(/承上題|續上題|同上題|根據上題|依上題|延續上題/.test(originalStem)){
     const prev=rows.findLast(x=>x.year===year&&Number(x.number)===Number(q.number)-1);
     if(prev){
      contextQuestions=(prev.contextQuestions||[]).concat([{number:prev.number,stem:prev.originalStem||prev.stem,options:prev.options}]);
      classification={primary:prev.primary,tags:prev.tags.slice(),review:true,evidence:["承接 "+year+" 年第 "+prev.number+" 題主題"]};
      stem=contextQuestions.map(c=>"【上題背景 "+year+" 年第 "+c.number+" 題】\n"+c.stem+"\n"+c.options.map((o,i)=>String.fromCharCode(65+i)+". "+o).join("\n")).join("\n\n")+"\n\n【本題】\n"+originalStem;
     }
    }
    const sourceIssues=[];
    if(originals.some(x=>/!\[[^\]]*\]\(/.test(x)))sourceIssues.push("原題附圖未收錄，請對照原試卷");
    if(hasExamPrefix)sourceIssues.push("原題含試卷說明前綴，請核對原試卷");
    if(originals.some(x=>/[\uE000-\uF8FF\u25a1]/.test(x)))sourceIssues.push("原題特殊符號以□標示，請核對原試卷");
    if(options.some(x=>x.includes("選項內容缺漏")))sourceIssues.push("選項缺漏");
    if(originals.some(x=>/代號[：:]|頁次[：:]/.test(x)))sourceIssues.push("原題含頁尾殘留");
    if([stem,...options,answer].some(garbled))sourceIssues.push("原文字編碼待核對");
    const decision=reviewData&&reviewData.decisions[year+"-"+q.number];
    if(decision)classification={primary:decision.primary,tags:decision.tags.slice(),review:false,reviewed:true,evidence:[decision.reason],reviewReason:decision.reason};
    rows.push(Object.assign({},q,classification,{id:year+"-"+q.number,year,stem,originalStem,contextQuestions,options,answer,sourceIssues,encodingRecovered:originals.filter(x=>repair(x).repaired).length}));
   }
  }
  return rows;
 }
 return {config:Object.assign({},config,{topics:displayTopics}),topics:displayTopics,classify,build};
}
const api={repair,clean,forSubject};
if(root.SUBJECT_CATALOG&&root.location){const id=new URLSearchParams(root.location.search).get("subject")||"structure";api.current=root.SUBJECT_CATALOG[id]||root.SUBJECT_CATALOG.structure;root.ConstructionAtlas=forSubject(api.current);api.current=root.ConstructionAtlas.config;}
root.SubjectAtlas=api;if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);

