/* 分類為學習用初分，非官方分類。主題可重疊。 */
(function(root){
"use strict";
const definitions=[
["concrete","混凝土與水泥材料","材料 / 結構",["混凝土","水泥","骨材","粒料","坍度","水灰比","水膠比","配比","養護","拌合","預拌","飛灰","爐石","強塑劑","添加劑"]],
["rebar","鋼筋、模板與澆置","材料 / 結構",["鋼筋","箍筋","主筋","搭接","錨定","保護層","澆置","模板","施工縫","冷縫","灌漿","續接器"]],
["steel","鋼構與 SRC","材料 / 結構",["鋼構","鋼結構","銲道","鋼骨","鋼材","螺栓","銲接","焊接","填角銲","衝擊韌性","SRC","剪力釘","鋼板","接合板"]],
["wood","木構與木材","材料 / 結構",["木構","木結構","木材","木料","榫接","集成材","集層材","軸組","木桁架","合板","膠合"]],
["foundation","基礎、地質與開挖","基礎 / 外殼",["基礎","基樁","打樁","開挖","土方","擋土","連續壁","鋼板樁","預壘樁","地質","地下水","基坑","土壤","地盤","沉陷","土壓"]],
["waterproof","防水、屋頂與填縫","基礎 / 外殼",["防水","止水","填縫","密封","伸縮縫","阻根","滲水","漏水","等壓","屋頂","排水坡"]],
["curtain","玻璃、帷幕與門窗","外牆 / 飾面",["帷幕","玻璃","幕牆","窗牆","門窗","鋁窗","氣密","水密","百葉","五金"]],
["finish","磚、磁磚與石材","外牆 / 飾面",["紅磚","砌築","磁磚","面磚","瓷磚","石材","石版","磚材","貼磚","乾掛","抿石","砌磚","砌體","磚牆","花崗石","大理石"]],
["coating","塗裝、粉刷與地坪","外牆 / 飾面",["塗裝","油漆","防蝕","粉刷","抹灰","地坪","環氧","塗料","磨石","踢腳","砂漿"]],
["thermal","耐震、防火與隔熱","性能 / 內裝",["耐震","制震","隔震","隔熱","熱傳","防火","耐火","燃燒","斷熱","熱橋"]],
["interior","隔音、內裝與無障礙","性能 / 內裝",["無障礙","輪椅","樓梯","扶手","隔音","吸音","聲音","音響","隔間","天花","輕鋼架","石膏板","高架地板","內裝"]],
["management","工程管理與品質","管理 / 永續",["BIM","建築資訊","經費","預備費","物價調整","工程管理","施工管理","CPM","要徑","工期","品質","估價","工程費","契約","發包","進度","工程款","採購","品管","驗收"]],
["green","綠建材與永續","管理 / 永續",["綠建材","綠建築","永續","再生","回收","碳排","生態","健康建材","環保標章"]],
["temporary","假設工程與施工安全","管理 / 永續",["假設工程","鷹架","施工架","吊車","起重","臨時","圍籬","施工設備","安全網","墜落","安全帽","勞工安全","吊裝","支撐架"]],
["mep","設備管線與施工介面","性能 / 內裝",["升降機","設備","管線","給水","排水","電氣","空調","通風","消防","衛生","機電","配管","管道","電梯"]]
].map(function(t){return {id:t[0],name:t[1],group:t[2],words:t[3]};});
function classify(q){
 const stem=String(q.stem||"").normalize("NFKC").toLowerCase();
 const options=(q.options||[]).join(" ").normalize("NFKC").toLowerCase();
 const hits=definitions.map(function(t){
  let a=0,b=0;const matched=[];
  t.words.forEach(function(w){const key=w.toLowerCase();if(stem.includes(key)){a++;matched.push(w);}else if(options.includes(key)){b++;matched.push(w);}});
  return {id:t.id,score:a*4+b,stemHits:a,evidence:matched};
 }).filter(function(h){return h.score>0;}).sort(function(a,b){return b.score-a.score;});
 if(!hits.length)return {primary:"other",tags:["other"],review:true,evidence:[]};
 const first=hits[0];const second=hits.find(function(h,i){return i>0&&h.stemHits>0&&h.score>=Math.max(4,first.score*0.6);});
 return {primary:first.id,tags:second?[first.id,second.id]:[first.id],review:first.stemHits===0,evidence:first.evidence};
}
function build(bank){
 const rows=[];
 Object.keys(bank).sort(function(a,b){return Number(b)-Number(a);}).forEach(function(year){
 const subject=(bank[year]||[]).find(function(s){return s.subject==="建築構造與施工";});
 if(!subject)return;
 (subject.questions||[]).forEach(function(q,i){
  const c=classify(q),decision=reviewData&&reviewData.decisions[year+"-"+q.number];
  if(decision)Object.assign(c,{primary:decision.primary,tags:decision.tags.slice(),review:false,reviewed:true,evidence:[decision.reason],reviewReason:decision.reason});
  const clean=root.SubjectAtlas?root.SubjectAtlas.clean:(s=>String(s||""));const repair=root.SubjectAtlas?root.SubjectAtlas.repair:(s=>({text:String(s||"")}));
  const raw=[q.stem,...(q.options||[])],sourceIssues=[];
  if(raw.some(s=>/代號[：:]|頁次[：:]/.test(s)))sourceIssues.push("原題含頁尾殘留");
  if(raw.some(s=>/[\uE000-\uF8FF\u25a1]/.test(s)))sourceIssues.push("原題特殊符號請核對原試卷");
  const options=(q.options||[]).map(s=>clean(s)||"【選項內容缺漏，請核對原試卷】");if(options.some(s=>s.includes("選項內容缺漏")))sourceIssues.push("選項缺漏");
  rows.push(Object.assign({},q,c,{id:year+"-"+q.number,year,stem:clean(q.stem),options,sourceIssues,answer:repair((subject.answers||[])[i]||q.answer||"").text.trim().toUpperCase()}));
 });});return rows;
}
const reviewData=root.CLASSIFICATION_REVIEWS&&root.CLASSIFICATION_REVIEWS.construction;
const topics=definitions.concat(reviewData?reviewData.addedTopics:[]);
const api={topics,classify:classify,build:build};
if(root.SubjectAtlas)root.SubjectAtlas.current={id:"construction",code:"03",name:"建築構造與施工",short:"構造",topics};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.ConstructionAtlas=api;
})(typeof globalThis!=="undefined"?globalThis:this);

