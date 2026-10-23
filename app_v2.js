const subjectNames = {"01":"營建法規與實務","02":"建築結構","03":"建築構造與施工","04":"建築環境控制","05":"敷地計畫與都市設計","06":"建築計畫與設計"};
const pdfs = {"01":"114_architect_01_law_question.pdf","02":"114_architect_02_structure_question.pdf","03":"114_architect_03_construction_question.pdf","04":"114_architect_04_environment_question.pdf","05":"114_architect_05_site_urban_question.pdf","06":"114_architect_06_planning_design_question.pdf"};
const $ = id => document.getElementById(id);
const rawYears = window.QUIZ_DATA_BY_YEAR || {"114": window.QUIZ_DATA || []};
const years = Object.keys(rawYears).sort((a,b)=>Number(b)-Number(a));
let activeYear = years[0] || '114';
let subjects = (rawYears[activeYear] || []).filter(item => !['05','06'].includes(item.code));
let state = {subject:null,questions:[],index:0,score:0,answers:[],answered:false,answerMode:'immediate'};

function refreshYear(){
  activeYear = $('year-select')?.value || activeYear;
  subjects = (rawYears[activeYear] || []).filter(item => !['05','06'].includes(item.code));
  renderSubjects();
  const label = $('year-label'); if(label) label.textContent = activeYear + ' 年題庫';
}
function renderYearOptions(){
  const select = $('year-select'); if(!select) return;
  select.innerHTML = years.map(year => '<option value="'+year+'">'+year+' 年</option>').join('');
  select.value = activeYear;
  select.addEventListener('change', refreshYear);
}
function renderSubjects(){
  const grid = $('subject-grid'); if(!grid) return;
  grid.innerHTML = subjects.map((item,index)=>{
    const count = item.questions?.length || 0;
    const isQuiz = count > 0;
    const answerNote = (item.answers?.length || 0) >= count ? '可自動判分' : '題庫已匯入，部分答案待補';
    return '<article class="subject-card subject-card-'+item.code+'"><div><span class="subject-index">0'+(index+1)+' / STUDIO</span><div class="card-visual" aria-hidden="true"><span></span><i></i></div><h3>'+item.subject+'</h3><p>'+count+' 題可練習 · '+answerNote+'</p></div><div class="card-bottom"><strong>QUIZ READY</strong><button data-start="'+item.code+'">開始練習 <span>→</span></button></div></article>';
  }).join('');
  document.querySelectorAll('[data-start]').forEach(btn=>btn.addEventListener('click',()=>startQuiz(btn.dataset.start)));
}
function startQuiz(code, limit=null){
  const subject = subjects.find(item=>item.code===code); if(!subject || !subject.questions?.length) return;
  const pool=[...subject.questions].sort(()=>Math.random()-.5).slice(0,limit ? Math.min(limit,subject.questions.length) : subject.questions.length);
  state={subject,questions:pool,index:0,score:0,answers:[],answered:false,answerMode:$('answer-mode')?.value || 'immediate'};
  $('home').classList.add('hidden'); $('subjects').classList.add('hidden'); $('result').classList.add('hidden'); $('quiz').classList.remove('hidden');
  $('quiz-subject').textContent=subject.subject; $('quiz-kicker').textContent=activeYear+' YEAR · '+subject.questions.length+' QUESTIONS'; $('quiz-mode').textContent=state.answerMode==='immediate'?'答完一題看答案':'全部作答後看答案';
  renderQuestion(); window.scrollTo({top:0,behavior:'smooth'});
}
function renderQuestion(){
  const q=state.questions[state.index]; state.answered=false;
  $('question-number').textContent=String(q.number).padStart(2,'0'); $('question-stem').textContent=q.stem; $('question-count').textContent='第 '+(state.index+1)+' / '+state.questions.length+' 題'; $('score').textContent=state.score;
  $('progress-bar').style.width=((state.index)/state.questions.length*100)+'%'; $('feedback').textContent=''; $('feedback').className='feedback'; $('next').disabled=true; $('next').innerHTML=state.index===state.questions.length-1?'查看結果 <span>↗</span>':'下一題 <span>→</span>';
  const reveal=$('reveal'); reveal.disabled=state.answerMode!=='immediate'; reveal.hidden=state.answerMode!=='immediate';
  $('options').innerHTML=q.options.map((option,i)=>'<button class="option" data-option="'+('ABCD'[i])+'"><span class="option-key">'+('ABCD'[i])+'</span><span>'+option+'</span></button>').join('');
  document.querySelectorAll('.option').forEach(btn=>btn.addEventListener('click',()=>choose(btn.dataset.option)));
}
function choose(letter){
  if(state.answered) return;
  state.answerMode=$('answer-mode')?.value || state.answerMode;
  const q=state.questions[state.index]; const correct=state.subject.answers?.[q.number-1]; state.answered=true; state.answers.push({number:q.number,selected:letter,correct});
  document.querySelectorAll('.option').forEach(btn=>{if(btn.dataset.option===letter)btn.classList.add('selected');});
  if(state.answerMode==='immediate') showAnswer(letter,correct); else { $('feedback').textContent='已記錄答案，完成全部題目後揭示結果。'; $('feedback').className='feedback'; $('next').disabled=false; }
}
function showAnswer(selected,correct){
  if(!correct){$('feedback').textContent='本題答案資料尚未載入，已保留作答紀錄。';$('feedback').className='feedback';$('next').disabled=false;$('reveal').disabled=true;return;}
  if(selected===correct){state.score++; $('feedback').textContent='答對了，繼續保持。'; $('feedback').className='feedback good'; document.querySelector('[data-option="'+selected+'"]').classList.add('correct');}
  else {$('feedback').textContent='答案是 '+correct+'，再看一次題幹中的關鍵條件。'; $('feedback').className='feedback bad'; const wrong=document.querySelector('[data-option="'+selected+'"]'); const right=document.querySelector('[data-option="'+correct+'"]'); if(wrong)wrong.classList.add('wrong'); if(right)right.classList.add('correct');}
  $('score').textContent=state.score; $('next').disabled=false; $('reveal').disabled=true;
}
function reveal(){ if(!state.answered){const q=state.questions[state.index]; showAnswer(null,state.subject.answers?.[q.number-1]);} }
function next(){if(!state.answered)return;if(state.index===state.questions.length-1){showResult();return;}state.index++;renderQuestion();}
function showResult(){
  if(state.answerMode==='end') state.score=state.answers.filter(a=>a.correct&&a.selected===a.correct).length;
  $('quiz').classList.add('hidden'); $('result').classList.remove('hidden'); const graded=state.answers.filter(a=>a.correct).length; const percent=graded?Math.round(state.score/graded*100):0; $('result-score').textContent=percent+'%'; $('result-summary').textContent='你在「'+state.subject.subject+'」完成 '+state.questions.length+' 題，已判分 '+graded+' 題，答對 '+state.score+' 題。'+(graded<state.questions.length?'部分歷年答案表待補，未解析題目不列入分數。':(percent>=80?'這輪表現很穩，繼續維持題感。':'把錯題再做一次，下一輪會更接近滿分。'));
  const wrong=state.answers.filter(item=>item.selected&&item.correct&&item.selected!==item.correct); const gradedCount=state.answers.filter(item=>item.correct).length; $('mistakes').innerHTML=(gradedCount<state.answers.length?'<p>其中 '+(state.answers.length-gradedCount)+' 題因歷年答案表格式尚未完整解析，暫不列入判分。</p>':'')+(wrong.length?'<h3>本輪錯題</h3>'+wrong.map(item=>'<div class="mistake-item"><span>Q'+item.number+'</span>你的答案 '+item.selected+' · 正確答案 '+item.correct+'</div>').join(''):'<h3>目前已解析題目沒有錯題，漂亮！</h3>'); window.scrollTo({top:0,behavior:'smooth'});
}
function home(){$('quiz').classList.add('hidden');$('result').classList.add('hidden');$('home').classList.remove('hidden');$('subjects').classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'});}
$('year-label') && ($('year-label').textContent=activeYear+' 年題庫');
$('year-select')?.addEventListener('change',refreshYear);
$('answer-mode')?.addEventListener('change',event=>{
  state.answerMode=event.target.value;
  $('quiz-mode').textContent=state.answerMode==='immediate'?'答完一題看答案':'全部作答後看答案';
  const reveal=$('reveal');
  reveal.hidden=state.answerMode!=='immediate';
  reveal.disabled=state.answerMode!=='immediate';
});
document.querySelectorAll('[data-action="back-home"]').forEach(btn=>btn.addEventListener('click',home));
document.querySelector('[data-action="scroll-subjects"]')?.addEventListener('click',()=>document.querySelector('#subjects').scrollIntoView({behavior:'smooth'}));
document.querySelector('[data-action="quick-start"]')?.addEventListener('click',()=>startQuiz('01',10));
$('reveal')?.addEventListener('click',reveal); $('next')?.addEventListener('click',next); document.querySelector('[data-action="retry"]')?.addEventListener('click',()=>startQuiz(state.subject.code));
renderYearOptions(); renderSubjects();
