const DEF={name:'Student',grade:'Grade 7',subject:'Science',language:'English',xp:0,level:1,streak:0,lastLogin:null,missionsCompleted:0,quizCount:0,totalQuizScore:0,weakAreas:[],strongAreas:[],badgesEarned:[],pdfCount:0,subjectScores:{Science:0,Mathematics:0,'Social Studies':0,English:0},subjectAttempts:{Science:0,Mathematics:0,'Social Studies':0,English:0}};
function loadST(){try{const s=localStorage.getItem('sparkV4');return s?{...DEF,...JSON.parse(s)}:{...DEF}}catch{return{...DEF}}}
function saveST(s){localStorage.setItem('sparkV4',JSON.stringify(s))}
let ST=loadST();
function xpForLv(l){return l*200}
function addXP(n){ST.xp+=n;if(ST.xp>=xpForLv(ST.level)){ST.xp-=xpForLv(ST.level);ST.level++;saveST(ST);updateXPBar();showLvUp(ST.level);return}saveST(ST);updateXPBar();showXPPop(n)}
function updateXPBar(){const needed=xpForLv(ST.level);const pct=Math.min(100,Math.round(ST.xp/needed*100));document.getElementById('xpF').style.width=pct+'%';document.getElementById('xpT').textContent=ST.xp+'/'+needed+' XP';document.getElementById('lvB').textContent='Lv '+ST.level;document.getElementById('mobLv').textContent='Lv '+ST.level}
function showXPPop(n){if(!n)return;const el=document.getElementById('xpPop');document.getElementById('xpPV').textContent=n;el.classList.remove('hidden');setTimeout(()=>el.classList.add('hidden'),1800)}
function showLvUp(l){document.getElementById('newLv').textContent='Level '+l;document.getElementById('lvModal').classList.remove('hidden')}
function closeLvModal(){document.getElementById('lvModal').classList.add('hidden');updateDash()}
const BADGES=[
  {id:'first',icon:'🌟',name:'First Step',check:s=>s.missionsCompleted>=1},
  {id:'str3',icon:'🔥',name:'3-Day Streak',check:s=>s.streak>=3},
  {id:'qm',icon:'🧠',name:'Quiz Master',check:s=>s.quizCount>=5},
  {id:'xph',icon:'⚡',name:'XP Hunter',check:s=>(s.xp+(s.level-1)*200)>=500},
  {id:'mp',icon:'🎯',name:'Mission Pro',check:s=>s.missionsCompleted>=5},
  {id:'pdf',icon:'📄',name:'PDF Reader',check:s=>s.pdfCount>=1},
  {id:'exp',icon:'🔬',name:'Explorer',check:s=>s.quizCount>=1},
  {id:'str7',icon:'🏆',name:'Week Warrior',check:s=>s.streak>=7},
  {id:'car',icon:'🚀',name:'Career Ready',check:s=>s.missionsCompleted>=3},
];
function checkBadges(){BADGES.forEach(b=>{if(!ST.badgesEarned.includes(b.id)&&b.check(ST)){ST.badgesEarned.push(b.id);saveST(ST)}});renderBadges()}
function renderBadges(){document.getElementById('bgGrid').innerHTML=BADGES.map(b=>`<div class="bi ${ST.badgesEarned.includes(b.id)?'earned':'locked'}" title="${b.name}">${b.icon}<div class="bi-n">${b.name}</div></div>`).join('')}
function updateDash(){
  document.getElementById('dashNm').textContent=ST.name;
  document.getElementById('sbNm').textContent=ST.name;
  document.getElementById('sbGr').textContent=ST.grade;
  document.getElementById('sbAv').textContent=ST.name[0].toUpperCase();
  document.getElementById('strV').textContent=ST.streak;
  document.getElementById('xpV').textContent=ST.xp+(ST.level-1)*200;
  document.getElementById('misV').textContent=ST.missionsCompleted;
  document.getElementById('qavV').textContent=ST.quizCount>0?Math.round(ST.totalQuizScore/ST.quizCount)+'%':'-';
  updateXPBar();renderBadges();renderPerf();renderWA();renderPStat();renderCareerPreview();
}
function renderPerf(){
  const subs=['Science','Mathematics','Social Studies','English'];
  document.getElementById('perfC').innerHTML=subs.map(s=>{const att=ST.subjectAttempts[s]||0;const sc=att>0?Math.round(ST.subjectScores[s]/att):0;return`<div class="pr"><div class="pl">${s==='Social Studies'?'SST':s}</div><div class="pb-bg2"><div class="pb-bar" style="width:${sc}%"></div></div><div class="pp">${sc}%</div></div>`}).join('')}
function renderWA(){document.getElementById('waTg').innerHTML=ST.weakAreas.length?ST.weakAreas.map(w=>`<span class="wa-tg">${w}</span>`).join(''):'<span class="wa-tg">Complete a quiz to detect weak areas</span>'}
function renderPStat(){const avg=ST.quizCount>0?Math.round(ST.totalQuizScore/ST.quizCount):0;document.getElementById('psg').innerHTML=[{icon:'⚡',val:ST.xp+(ST.level-1)*200,lbl:'Total XP'},{icon:'🎯',val:ST.missionsCompleted,lbl:'Missions Done'},{icon:'📝',val:ST.quizCount,lbl:'Quizzes Taken'},{icon:'📊',val:avg+'%',lbl:'Quiz Average'},{icon:'🔥',val:ST.streak,lbl:'Day Streak'},{icon:'🏆',val:'Lv '+ST.level,lbl:'Current Level'}].map(d=>`<div class="sc"><div class="si">${d.icon}</div><div class="sv">${d.val}</div><div class="sl">${d.lbl}</div></div>`).join('')}
function renderCareerPreview(){const el=document.getElementById('careerDataPreview');if(!el)return;const avg=ST.quizCount>0?Math.round(ST.totalQuizScore/ST.quizCount):0;const totalXP=ST.xp+(ST.level-1)*200;el.innerHTML=`<div class="cdp-item"><div class="cdp-val">${totalXP}</div><div class="cdp-lbl">Total XP</div></div><div class="cdp-item"><div class="cdp-val">${avg}%</div><div class="cdp-lbl">Quiz Avg</div></div><div class="cdp-item"><div class="cdp-val">${ST.missionsCompleted}</div><div class="cdp-lbl">Missions</div></div>`}
function updateStreak(){const today=new Date().toDateString();if(ST.lastLogin!==today){const yest=new Date(Date.now()-86400000).toDateString();ST.streak=ST.lastLogin===yest?ST.streak+1:1;ST.lastLogin=today;saveST(ST)}}
function changeLanguage(lang){ST.language=lang;saveST(ST)}
function renderCareerPreview(){const el=document.getElementById('careerDataPrev');if(!el)return;const avg=ST.quizCount>0?Math.round(ST.totalQuizScore/ST.quizCount):0;const totalXP=ST.xp+(ST.level-1)*200;el.innerHTML=`<div class="ch-stat"><div class="ch-stat-v">${totalXP}</div><div class="ch-stat-l">Total XP</div></div><div class="ch-stat"><div class="ch-stat-v">${avg}%</div><div class="ch-stat-l">Quiz Avg</div></div><div class="ch-stat"><div class="ch-stat-v">${ST.missionsCompleted}</div><div class="ch-stat-l">Missions</div></div>`;}
