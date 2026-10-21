const subjects = window.QUIZ_DATA || [];
const subjectNames = {"01":"營建法規與實務","02":"建築結構","03":"建築構造與施工","04":"建築環境控制","05":"敷地計畫與都市設計","06":"建築計畫與設計"};
const pdfs = {"01":"114_architect_01_law_question.pdf","02":"114_architect_02_structure_question.pdf","03":"114_architect_03_construction_question.pdf","04":"114_architect_04_environment_question.pdf","05":"114_architect_05_site_urban_question.pdf","06":"114_architect_06_planning_design_question.pdf"};
const $ = (id) => document.getElementById(id);
let state = {subject:null, questions:[], index:0, score:0, answers:[], answered:false};

function renderSubjects(){
  $('subject-grid').innerHTML = subjects.map((item, index) => {
    const count = item.questions.length;
    const isQuiz = count > 0 && item.answers.length >= count;
    return `<article class="subject-card"><div><span class="subject-index">0${index + 1} / STUDIO</span><h3>${item.subject}</h3><p>${isQuiz ? `${count} 題可自動判分` : '申論／設計題本閱讀'}</p></div><div class="card-bottom"><strong>${isQuiz ? 'QUIZ READY' : 'PDF READER'}</strong>${isQuiz ? `<button data-start="${item.code}">開始練習 →</button>` : `<a class="pdf-link" href="${pdfs[item.code]}" target="_blank" rel="noreferrer">開啟題本 ↗</a>`}</div></article>`;
  }).join('');
  document.querySelectorAll('[data-start]').forEach(btn => btn.addEventListener('click', () => startQuiz(btn.dataset.start)));
}

function startQuiz(code){
  const subject = subjects.find(item => item.code === code);
  if(!subject) return;
  const pool = [...subject.questions].sort(() => Math.random() - .5).slice(0, Math.min(10, subject.questions.length));
  state = {subject, questions:pool, index:0, score:0, answers:[], answered:false};
  $('home').classList.add('hidden'); $('subjects').classList.add('hidden'); $('result').classList.add('hidden'); $('quiz').classList.remove('hidden');
  $('quiz-subject').textContent = subject.subject; $('quiz-kicker').textContent = `${subject.questions.length} QUESTIONS · QUICK PRACTICE`; $('quiz-mode').textContent = '隨機 10 題';
  renderQuestion(); window.scrollTo({top:0,behavior:'smooth'});
}

function renderQuestion(){
  const q = state.questions[state.index]; state.answered = false;
  $('question-number').textContent = String(q.number).padStart(2,'0'); $('question-stem').textContent = q.stem;
  $('question-count').textContent = `第 ${state.index + 1} / ${state.questions.length} 題`; $('score').textContent = state.score;
  $('progress-bar').style.width = `${((state.index) / state.questions.length) * 100}%`; $('feedback').textContent=''; $('feedback').className='feedback'; $('reveal').disabled=false; $('next').disabled=true; $('next').innerHTML = state.index === state.questions.length - 1 ? '查看結果 <span>↗</span>' : '下一題 <span>→</span>';
  $('options').innerHTML = q.options.map((option, i) => `<button class="option" data-option="${'ABCD'[i]}"><span class="option-key">${'ABCD'[i]}</span><span>${option}</span></button>`).join('');
  document.querySelectorAll('.option').forEach(btn => btn.addEventListener('click', () => choose(btn.dataset.option)));
}

function choose(letter){
  if(state.answered) return;
  const q = state.questions[state.index]; const answer = state.subject.answers[q.number - 1];
  state.answered=true; state.answers.push({number:q.number, selected:letter, correct:answer});
  document.querySelectorAll('.option').forEach(btn => { if(btn.dataset.option === letter) btn.classList.add('selected'); });
  if(letter === answer){ state.score++; $('feedback').textContent='答對了，繼續保持。'; $('feedback').className='feedback good'; document.querySelector(`[data-option="${letter}"]`).classList.add('correct'); }
  else { $('feedback').textContent=`答案是 ${answer}，再看一次題幹中的關鍵條件。`; $('feedback').className='feedback bad'; document.querySelector(`[data-option="${letter}"]`).classList.add('wrong'); document.querySelector(`[data-option="${answer}"]`).classList.add('correct'); }
  $('score').textContent=state.score; $('reveal').disabled=true; $('next').disabled=false;
}

function reveal(){
  if(state.answered) return;
  const answer = state.subject.answers[state.questions[state.index].number - 1]; if(!answer) return;
  document.querySelector(`[data-option="${answer}"]`).classList.add('correct'); $('feedback').textContent=`正確答案：${answer}`; $('feedback').className='feedback good'; state.answered=true; state.answers.push({number:state.questions[state.index].number, selected:null, correct:answer}); $('reveal').disabled=true; $('next').disabled=false;
}

function next(){ if(!state.answered) return; if(state.index === state.questions.length - 1){showResult();return;} state.index++; renderQuestion(); }
function showResult(){
  $('quiz').classList.add('hidden'); $('result').classList.remove('hidden'); const percent=Math.round((state.score/state.questions.length)*100); $('result-score').textContent=`${percent}%`; $('result-summary').textContent=`你在「${state.subject.subject}」完成 ${state.questions.length} 題，答對 ${state.score} 題。${percent >= 80 ? '這輪表現很穩，繼續維持題感。' : '把錯題再做一次，下一輪會更接近滿分。'}`;
  const wrong=state.answers.filter(item=>item.selected && item.selected!==item.correct); $('mistakes').innerHTML=wrong.length ? `<h3>本輪錯題</h3>${wrong.map(item=>`<div class="mistake-item"><span>Q${item.number}</span>你的答案 ${item.selected} · 正確答案 ${item.correct}</div>`).join('')}` : '<h3>本輪沒有錯題，漂亮！</h3>'; window.scrollTo({top:0,behavior:'smooth'});
}
function home(){ $('quiz').classList.add('hidden'); $('result').classList.add('hidden'); $('home').classList.remove('hidden'); $('subjects').classList.remove('hidden'); window.scrollTo({top:0,behavior:'smooth'}); }
document.querySelectorAll('[data-action="back-home"]').forEach(btn=>btn.addEventListener('click',home));
document.querySelector('[data-action="scroll-subjects"]').addEventListener('click',()=>document.querySelector('#subjects').scrollIntoView({behavior:'smooth'}));
document.querySelector('[data-action="quick-start"]').addEventListener('click',()=>startQuiz('01'));
$('reveal').addEventListener('click',reveal); $('next').addEventListener('click',next); document.querySelector('[data-action="retry"]').addEventListener('click',()=>startQuiz(state.subject.code));
renderSubjects();
