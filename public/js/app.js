window.onload = () => {
  if (ST.name && ST.name !== 'Student') showApp();
  else document.getElementById('onboarding').classList.add('active');
  checkStatus(); setInterval(checkStatus, 30000);
};

function startJourney() {
  const name = document.getElementById('ob-name').value.trim();
  const grade = document.getElementById('ob-grade').value;
  const subject = document.getElementById('ob-subject').value;
  const lang = document.getElementById('ob-lang').value;
  if (!name || !grade || !subject) { alert('Please fill all fields!'); return; }
  ST.name = name; ST.grade = grade; ST.subject = subject; ST.language = lang;
  saveST(ST); showApp();
}

function showApp() {
  document.getElementById('onboarding').classList.remove('active');
  document.getElementById('app').classList.add('active');
  document.getElementById('globalLang').value = ST.language || 'English';
  updateStreak(); updateDash(); renderVisualLab(); initPlanner(); switchTabById('dashboard');
}

async function checkStatus() {
  try {
    const r = await fetch('/api/status'); const d = await r.json();
    document.getElementById('sdot').className = 'sb-sdot ' + (d.online ? 'online' : 'offline');
    document.getElementById('slbl').textContent = d.online ? 'Spark AI ready ✓' : 'Ollama offline';
  } catch {
    document.getElementById('sdot').className = 'sb-sdot offline';
    document.getElementById('slbl').textContent = 'Server offline';
  }
}

function switchTab(btn) {
  document.querySelectorAll('.sn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
  // Stop 3D animation when leaving visual lab
  if (btn.dataset.tab !== 'visual') stopVlabAnim();
}
function switchTabById(id) { const b = document.querySelector(`.sn[data-tab="${id}"]`); if (b) switchTab(b); }
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }
function changeLanguage(lang) { ST.language = lang; saveST(ST); }

// ── Mission ──────────────────────────────────────────────────────
let curMission = null; const doneTasks = new Set();
const TICOS = {learn:'📖',quiz:'📝',practice:'✏️',visual:'🔬',review:'🔄'};

async function generateMission() {
  const sub = document.getElementById('mSub').value, lv = document.getElementById('mLv').value;
  const btn = document.getElementById('genMBtn'); btn.disabled = true; doneTasks.clear();
  document.getElementById('mCard').classList.add('hidden'); document.getElementById('mLoad').classList.remove('hidden');
  try {
    const res = await fetch('/api/mission',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subject:sub,level:lv,studentName:ST.name,weakAreas:ST.weakAreas})});
    curMission = await res.json(); renderMission(curMission);
  } catch { alert('Could not generate mission. Is Ollama running?'); }
  document.getElementById('mLoad').classList.add('hidden'); btn.disabled = false;
}

function renderMission(m) {
  document.getElementById('mTit').textContent = m.title;
  document.getElementById('mDesc').textContent = m.description;
  document.getElementById('mXP').textContent = m.totalXP;
  document.getElementById('mDiff').textContent = (m.difficulty||'medium').toUpperCase();
  document.getElementById('mTip').textContent = '💡 ' + m.tip;
  document.getElementById('tTot').textContent = m.tasks.length;
  document.getElementById('tDone').textContent = '0';
  document.getElementById('mPB').style.width = '0%';
  document.getElementById('mCmpBtn').disabled = true;
  document.getElementById('mTasks').innerHTML = m.tasks.map(t =>
    `<div class="task-item" id="task-${t.id}" onclick="toggleTask(${t.id},${t.xp})"><div class="task-cb" id="cb-${t.id}"></div><span>${TICOS[t.type]||'📌'}</span><div class="task-txt">${t.task}</div><div class="task-xp">+${t.xp} XP</div></div>`
  ).join('');
  document.getElementById('mCard').classList.remove('hidden');
}

function toggleTask(id, xp) {
  if (!curMission) return;
  if (doneTasks.has(id)) { doneTasks.delete(id); document.getElementById('task-'+id).classList.remove('done'); document.getElementById('cb-'+id).textContent = ''; }
  else { doneTasks.add(id); document.getElementById('task-'+id).classList.add('done'); document.getElementById('cb-'+id).textContent = '✓'; showXPPop(xp); }
  const done = doneTasks.size, total = curMission.tasks.length;
  document.getElementById('tDone').textContent = done;
  document.getElementById('mPB').style.width = Math.round(done/total*100)+'%';
  document.getElementById('mCmpBtn').disabled = done < total;
}

function completeMission() {
  if (!curMission) return;
  ST.missionsCompleted++; addXP(curMission.totalXP); checkBadges(); updateDash(); doneTasks.clear();
  document.getElementById('mCard').classList.add('hidden');
  alert('🎉 Mission Complete! You earned ' + curMission.totalXP + ' XP!');
}

// ── Voice ─────────────────────────────────────────────────────────
let recognition = null, isListening = false;

function initVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const rec = new SR();
  rec.continuous = false; rec.interimResults = true;
  const langMap = {'Hindi':'hi-IN','Telugu':'te-IN','Tamil':'ta-IN','Kannada':'kn-IN','Marathi':'mr-IN','Bengali':'bn-IN','Gujarati':'gu-IN','English':'en-IN'};
  rec.lang = langMap[ST.language] || 'en-IN';
  rec.onstart = () => { isListening = true; document.getElementById('micBtn').classList.add('recording'); document.getElementById('micBtn').textContent = '🔴'; document.getElementById('voiceBar').classList.remove('hidden'); document.getElementById('voiceErr').classList.add('hidden'); };
  rec.onresult = (e) => {
    let interim = '', final = '';
    for (let i = e.resultIndex; i < e.results.length; i++) { if (e.results[i].isFinal) final += e.results[i][0].transcript; else interim += e.results[i][0].transcript; }
    const text = final || interim;
    document.getElementById('chatInp').value = text;
    document.getElementById('voiceSt').textContent = 'Heard: "' + text + '"';
    if (final) { stopVoice(); setTimeout(() => sendChat(), 400); }
  };
  rec.onerror = (e) => { stopVoice(); const el = document.getElementById('voiceErr'); el.textContent = e.error === 'not-allowed' ? '⚠️ Microphone permission denied. Click 🔒 in browser bar and allow microphone.' : '⚠️ Voice error: ' + e.error + '. Use Chrome or Edge browser.'; el.classList.remove('hidden'); };
  rec.onend = () => stopVoice();
  return rec;
}

function stopVoice() { isListening = false; document.getElementById('micBtn').classList.remove('recording'); document.getElementById('micBtn').textContent = '🎤'; document.getElementById('voiceBar').classList.add('hidden'); if (recognition) try { recognition.stop(); } catch {} }

function toggleVoice() {
  if (isListening) { stopVoice(); return; }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { const el = document.getElementById('voiceErr'); el.textContent = '⚠️ Voice not supported. Use Chrome or Edge browser.'; el.classList.remove('hidden'); return; }
  recognition = initVoice(); if (!recognition) return;
  try { recognition.start(); } catch(e) { const el = document.getElementById('voiceErr'); el.textContent = '⚠️ Could not start mic: ' + e.message; el.classList.remove('hidden'); }
}

// ── Chat ──────────────────────────────────────────────────────────
let chatSubject = 'Science', lastPdfText = '';

function setChatSub(btn, sub) { document.querySelectorAll('#subChips .chip').forEach(c => c.classList.remove('active')); btn.classList.add('active'); chatSubject = sub; }

function addCMsg(html, isUser) {
  const box = document.getElementById('chatBox');
  const row = document.createElement('div'); row.className = 'cm ' + (isUser ? 'user' : 'bot');
  const av = document.createElement('div'); av.className = 'cav ' + (isUser ? 'user' : 'bot'); av.textContent = isUser ? ST.name[0].toUpperCase() : '⚡';
  const bub = document.createElement('div'); bub.className = 'cb'; bub.innerHTML = html;
  row.appendChild(av); row.appendChild(bub); box.appendChild(row); box.scrollTop = box.scrollHeight;
}

function addTyping() {
  const box = document.getElementById('chatBox');
  const row = document.createElement('div'); row.className = 'cm bot'; row.id = 'chatTyping';
  row.innerHTML = '<div class="cav bot">⚡</div><div class="cb"><div class="td"><span></span><span></span><span></span></div></div>';
  box.appendChild(row); box.scrollTop = box.scrollHeight;
}
function removeTyping() { const t = document.getElementById('chatTyping'); if(t) t.remove(); }

async function sendChat() {
  const inp = document.getElementById('chatInp'); const q = inp.value.trim(); if (!q) return;
  inp.value = ''; document.getElementById('chatSend').disabled = true;
  addCMsg(esc(q), true); addTyping();
  const ctx = lastPdfText ? `[PDF context: ${lastPdfText.substring(0,400)}]\n\nQuestion: ${q}` : q;
  try {
    const res = await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:ctx,subject:chatSubject,studentName:ST.name,weakAreas:ST.weakAreas,language:ST.language})});
    const data = await res.json(); removeTyping();
    const vis = detectVisualFromText(q);
    addCMsg(fmt(data.reply||data.error||'No response.') + (vis ? buildVisualCard(vis) : ''), false);
    addXP(10);
  } catch { removeTyping(); addCMsg('⚠️ Cannot reach Spark AI. Make sure <strong>node server.js</strong> is running!', false); }
  document.getElementById('chatSend').disabled = false;
}

function fmt(t) { return t.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>').replace(/• /g,'<br>• ').replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>'); }
function esc(t) { return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ── Quiz ──────────────────────────────────────────────────────────
let quizData=null,curQ=0,score=0,wrongQs=[];

async function startQuiz() {
  const sub=document.getElementById('qSub').value,topic=document.getElementById('qTopic').value.trim()||sub,diff=document.getElementById('qDiff').value;
  document.getElementById('qSetup').classList.add('hidden');document.getElementById('qLoad').classList.remove('hidden');document.getElementById('startQBtn').disabled=true;
  try{const res=await fetch('/api/quiz',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subject:sub,topic,difficulty:diff})});quizData=await res.json();curQ=0;score=0;wrongQs=[];document.getElementById('qLoad').classList.add('hidden');document.getElementById('qArea').classList.remove('hidden');renderQ();}
  catch{document.getElementById('qLoad').classList.add('hidden');document.getElementById('qSetup').classList.remove('hidden');alert('Could not generate quiz. Is Ollama running?');}
  document.getElementById('startQBtn').disabled=false;
}

function renderQ(){const q=quizData.questions[curQ];document.getElementById('qNum').textContent=curQ+1;document.getElementById('qPB').style.width=((curQ+1)/5*100)+'%';document.getElementById('qTxt').textContent=q.question;document.getElementById('qExp').classList.add('hidden');document.getElementById('nextBtn').classList.add('hidden');document.getElementById('qOpts').innerHTML=q.options.map((o,i)=>`<button class="q-opt" onclick="answerQ(${i})">${o}</button>`).join('');}

function answerQ(idx){const q=quizData.questions[curQ];const opts=document.querySelectorAll('.q-opt');opts.forEach(o=>o.disabled=true);opts[q.correct].classList.add('correct');if(idx===q.correct){score++;addXP(20);}else{opts[idx].classList.add('wrong');wrongQs.push(q.question);}const exp=document.getElementById('qExp');exp.textContent='💡 '+q.explanation;exp.classList.remove('hidden');document.getElementById('nextBtn').classList.remove('hidden');}

function nextQ(){curQ++;if(curQ>=quizData.questions.length)finishQuiz();else renderQ();}

async function finishQuiz(){
  document.getElementById('qArea').classList.add('hidden');document.getElementById('qRes').classList.remove('hidden');
  const pct=Math.round(score/5*100);ST.quizCount++;ST.totalQuizScore+=pct;
  const sub=document.getElementById('qSub').value;ST.subjectScores[sub]=(ST.subjectScores[sub]||0)+pct;ST.subjectAttempts[sub]=(ST.subjectAttempts[sub]||0)+100;
  const icons=['😢','😕','🙂','😊','🏆','🌟'];document.getElementById('rI').textContent=icons[score]||'🏆';document.getElementById('rT').textContent=score>=4?'Excellent!':score>=3?'Good job!':'Keep practising!';document.getElementById('rS').textContent=score+'/5';document.getElementById('rX').textContent='+'+(score*20)+' XP Earned!';document.getElementById('rD').textContent=`You got ${score} out of 5 correct (${pct}%)`;
  if(wrongQs.length>0){try{const res=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({wrongAnswers:wrongQs,subject:sub})});const d=await res.json();if(d.weakAreas?.length)ST.weakAreas=[...new Set([...ST.weakAreas,...d.weakAreas])].slice(0,5);}catch{}}
  saveST(ST);checkBadges();updateDash();
}
function resetQuiz(){document.getElementById('qRes').classList.add('hidden');document.getElementById('qSetup').classList.remove('hidden');quizData=null;curQ=0;score=0;}

// ── PDF ───────────────────────────────────────────────────────────
let selPdf=null,curSummary='';
function handlePdfFile(file){if(!file)return;selPdf=file;const el=document.getElementById('pdfFN');el.textContent='📄 '+file.name+' ('+Math.round(file.size/1024)+' KB)';el.classList.remove('hidden');document.getElementById('pdfSBtn').disabled=false;}
function handleDrop(e){e.preventDefault();const f=e.dataTransfer.files[0];if(f?.type==='application/pdf')handlePdfFile(f);else alert('Please drop a PDF file.');}

async function summarizePdf(){
  if(!selPdf)return;const lang=document.getElementById('pdfLang').value;
  document.getElementById('pdfUpCard').classList.add('hidden');document.getElementById('pdfLoad').classList.remove('hidden');
  const fd=new FormData();fd.append('pdf',selPdf);fd.append('language',lang);
  try{const res=await fetch('/api/pdf-summary',{method:'POST',body:fd});const data=await res.json();document.getElementById('pdfLoad').classList.add('hidden');
  if(!res.ok||data.error){document.getElementById('pdfUpCard').classList.remove('hidden');alert('Error: '+(data.error||'Could not process PDF'));return;}
  curSummary=data.summary;lastPdfText=data.rawText||data.summary;document.getElementById('pdfBody').textContent=data.summary;document.getElementById('pdfRes').classList.remove('hidden');document.getElementById('wfRes').classList.add('hidden');
  if(!ST.pdfCount)ST.pdfCount=0;ST.pdfCount++;saveST(ST);checkBadges();updateDash();}
  catch(e){document.getElementById('pdfLoad').classList.add('hidden');document.getElementById('pdfUpCard').classList.remove('hidden');alert('Failed: '+e.message);}
}

function resetPdf(){selPdf=null;curSummary='';document.getElementById('pdfRes').classList.add('hidden');document.getElementById('wfRes').classList.add('hidden');document.getElementById('pdfUpCard').classList.remove('hidden');document.getElementById('pdfFN').classList.add('hidden');document.getElementById('pdfSBtn').disabled=true;document.getElementById('pdfFile').value='';}

async function translatePdf(){
  if(!curSummary)return;const lang=document.getElementById('pdfLang').value;if(lang==='English'){alert('Change the language dropdown first!');return;}
  const btn=event.target;btn.disabled=true;btn.textContent='Translating...';
  try{const res=await fetch('/api/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:curSummary,targetLanguage:lang})});const d=await res.json();document.getElementById('pdfBody').textContent=d.translated;curSummary=d.translated;}
  catch{alert('Translation failed.');}btn.disabled=false;btn.textContent='🌐 Translate';
}
function askPdf(){switchTabById('chat');document.getElementById('chatInp').value='Explain the key concepts from my uploaded PDF';document.getElementById('chatInp').focus();}

async function generateWorkflow(){
  if(!lastPdfText){alert('Please upload and summarize a PDF first!');return;}
  const btn=document.getElementById('wfBtn');btn.disabled=true;
  document.getElementById('wfLoad').classList.remove('hidden');document.getElementById('wfRes').classList.add('hidden');
  try{const res=await fetch('/api/pdf-workflow',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pdfText:lastPdfText,topic:'Study Topic',language:ST.language})});
  const wf=await res.json();renderWorkflow(wf);}
  catch{alert('Could not generate workflow. Is Ollama running?');}
  document.getElementById('wfLoad').classList.add('hidden');btn.disabled=false;
}

function renderWorkflow(wf){
  document.getElementById('wfTopic').textContent=wf.topic||'Study Plan';
  document.getElementById('wfOv').textContent=wf.overview||'';
  document.getElementById('wfDays').textContent=wf.totalDays+' Days';
  document.getElementById('wfTime').textContent=wf.dailyTime+'/day';
  document.getElementById('wfPhases').innerHTML=(wf.phases||[]).map(ph=>`
    <div class="wf-phase" style="background:${ph.color}12;border-color:${ph.color}30">
      <div class="wf-phase-top"><div class="wf-phase-num" style="background:${ph.color}">${ph.phase}</div><div class="wf-phase-title" style="color:${ph.color}">${ph.title}</div></div>
      <div class="wf-phase-days">📅 ${ph.days}</div><div class="wf-phase-goal">🎯 ${ph.goal}</div>
      <ul class="wf-phase-tasks" style="color:${ph.color}">${(ph.tasks||[]).map(t=>`<li style="color:var(--tx)">${t}</li>`).join('')}</ul>
    </div>`).join('');
  document.getElementById('wfResources').innerHTML=(wf.resources||[]).map(r=>`<li>${r}</li>`).join('');
  document.getElementById('wfTips').innerHTML=(wf.tips||[]).map(t=>`<li>${t}</li>`).join('');
  document.getElementById('wfRes').classList.remove('hidden');
  document.getElementById('wfRes').scrollIntoView({behavior:'smooth',block:'start'});
}

// ── Career ────────────────────────────────────────────────────────
async function generateCareer(){
  const btn=document.getElementById('genCareerBtn');btn.disabled=true;document.getElementById('careerLoad').classList.remove('hidden');
  const avg=ST.quizCount>0?Math.round(ST.totalQuizScore/ST.quizCount):0;
  const strongAreas=Object.entries(ST.subjectScores).filter(([k,v])=>ST.subjectAttempts[k]>0&&(v/ST.subjectAttempts[k])>=60).map(([k])=>k);
  const subjectScores={};['Science','Mathematics','Social Studies','English'].forEach(s=>{subjectScores[s]=ST.subjectAttempts[s]>0?Math.round(ST.subjectScores[s]/ST.subjectAttempts[s]):0;});
  try{const res=await fetch('/api/career',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({studentName:ST.name,grade:ST.grade,subjectScores,weakAreas:ST.weakAreas,strongAreas,totalXP:ST.xp+(ST.level-1)*200,missionsCompleted:ST.missionsCompleted,quizCount:ST.quizCount})});
  const data=await res.json();renderCareer(data);}
  catch{alert('Could not generate career guidance. Is Ollama running?');}
  document.getElementById('careerLoad').classList.add('hidden');btn.disabled=false;
}

function renderCareer(data){
  document.getElementById('careerSetup').classList.add('hidden');
  document.getElementById('crProfile').innerHTML=`<strong>${ST.name}</strong> — ${data.studentProfile}`;
  document.getElementById('crStr').innerHTML=(data.topStrengths||[]).map(s=>`<div class="cr-strength"><div style="font-size:22px">📚</div><div class="cr-str-info"><div class="cr-str-name">${s.subject}</div><span class="cr-str-lv ${s.level==='Excellent'?'lv-exc':s.level==='Good'?'lv-gd':'lv-av'}">${s.level}</span><div class="cr-sbar-bg"><div class="cr-sbar-f" style="width:${s.score||60}%"></div></div><div style="font-size:11px;color:var(--tx2);margin-top:4px">${s.description||''}</div></div></div>`).join('');
  document.getElementById('crImp').innerHTML=(data.areasToImprove||[]).map(a=>`<div class="cr-improve"><div class="cr-imp-sub">📈 ${a.subject}</div><div class="cr-imp-adv">${a.advice}</div></div>`).join('');
  document.getElementById('crPaths').innerHTML=(data.careerPaths||[]).map(p=>`<div class="cr-path-card"><div class="cr-path-top"><div class="cr-path-emoji">${p.icon||'🎯'}</div><div><div class="cr-path-title">${p.career}</div><div class="cr-path-desc">${p.description||''}</div></div><div class="cr-match"><div class="cr-match-pct">${p.match}%</div><div class="cr-match-lbl">Match</div></div></div><div class="cr-path-body"><div><div style="font-size:12px;color:var(--tx2);margin-bottom:6px">Required: ${(p.requiredSubjects||[]).join(', ')}</div></div><ul class="cr-path-steps">${(p.nextSteps||[]).map(s=>`<li>${s}</li>`).join('')}</ul></div></div>`).join('');
  document.getElementById('crActs').innerHTML=`<h4>🚀 Your Action Plan</h4><div class="cr-act-list">${(data.immediateActions||[]).map((a,i)=>`<div class="cr-act"><div class="cr-act-num">${i+1}</div>${a}</div>`).join('')}</div>`;
  document.getElementById('careerRes').classList.remove('hidden');
}
function resetCareer(){document.getElementById('careerRes').classList.add('hidden');document.getElementById('careerSetup').classList.remove('hidden');renderCareerPreview();}

// ── Parent Report ─────────────────────────────────────────────────
async function generateReport(){
  const btn=document.getElementById('genRptBtn');btn.disabled=true;document.getElementById('rptLoad').classList.remove('hidden');document.getElementById('rptCard').classList.add('hidden');
  const avg=ST.quizCount>0?Math.round(ST.totalQuizScore/ST.quizCount):0;
  const strongAreas=Object.entries(ST.subjectScores).filter(([k,v])=>ST.subjectAttempts[k]>0&&(v/ST.subjectAttempts[k])>=70).map(([k])=>k);
  try{const res=await fetch('/api/parent-report',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({studentName:ST.name,xp:ST.xp+(ST.level-1)*200,level:ST.level,completedMissions:ST.missionsCompleted,weakAreas:ST.weakAreas,strongAreas,quizScores:avg})});
  const d=await res.json();document.getElementById('rptBody').textContent=d.report;document.getElementById('rptDt').textContent=new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});document.getElementById('rptCard').classList.remove('hidden');}
  catch{document.getElementById('rptBody').textContent='Could not generate. Is Ollama running?';document.getElementById('rptCard').classList.remove('hidden');}
  document.getElementById('rptLoad').classList.add('hidden');btn.disabled=false;
}
