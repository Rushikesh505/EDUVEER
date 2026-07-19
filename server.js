const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({ dest: 'uploads/', limits: { fileSize: 20 * 1024 * 1024 } });
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const OLLAMA = 'http://localhost:11434/api/chat';
const MODEL  = 'llama3.2';

async function ai(messages, system, maxTokens) {
  const res = await fetch(OLLAMA, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL, stream: false,
      options: { num_predict: maxTokens || 600 },
      messages: [{ role: 'system', content: system }, ...messages]
    })
  });
  if (!res.ok) throw new Error('Ollama error ' + res.status);
  const d = await res.json();
  return d.message?.content || '';
}

// ── Status ───────────────────────────────────────────────────────
app.get('/api/status', async (req, res) => {
  try { const r = await fetch('http://localhost:11434/api/tags'); res.json({ online: r.ok }); }
  catch { res.json({ online: false }); }
});

// ── Chat ─────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { message, subject, studentName, weakAreas, language } = req.body;
  const lang = language && language !== 'English' ? `IMPORTANT: Reply entirely in ${language}.` : '';
  const system = `You are Spark, a friendly AI Study Companion for Indian school students (grades 6-10).
Student: ${studentName||'Student'} | Subject: ${subject||'General'} | Weak areas: ${(weakAreas||[]).join(', ')||'none'}
${lang}
- Start with "⭐ Why this matters:" (1-2 sentences real-world relevance)
- Clear explanation 3-5 simple sentences
- "🔑 Key points:" with 3-4 bullet points using •
- End with "💡 Fun fact:"
- MATHS: include formula + step-by-step worked example
- SCIENCE: explain mechanism with real-life examples
- Be warm, encouraging. Under 220 words.`;
  try {
    const reply = await ai([{ role:'user', content:message }], system);
    res.json({ reply });
  } catch(e) { res.status(500).json({ error:'Ollama not reachable. Run: ollama serve' }); }
});

// ── PDF text extractor ───────────────────────────────────────────
function extractPdfText(buffer) {
  try {
    const str = buffer.toString('latin1');
    let text = '';
    const btBlocks = str.match(/BT[\s\S]*?ET/g) || [];
    for (const block of btBlocks) {
      const tjs = block.match(/\((.*?)\)\s*Tj/g) || [];
      for (const tj of tjs) {
        const m = tj.match(/\((.*?)\)\s*Tj/);
        if (m) text += m[1].replace(/\\(\d{3})/g, (_, o) => String.fromCharCode(parseInt(o,8))) + ' ';
      }
    }
    if (text.trim().length < 80) {
      text = str.replace(/[^\x20-\x7E\n\r\t]/g,' ').replace(/\s+/g,' ').trim();
    }
    return text.trim();
  } catch { return ''; }
}

// ── PDF Summary ──────────────────────────────────────────────────
app.post('/api/pdf-summary', upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error:'No file uploaded' });
  const { language } = req.body;
  const lang = language && language !== 'English' ? `Reply entirely in ${language}.` : '';
  try {
    const buf = fs.readFileSync(req.file.path);
    const raw = extractPdfText(buf);
    fs.unlinkSync(req.file.path);
    if (!raw || raw.length < 40) return res.status(400).json({ error:'Cannot read text from this PDF. Use a text-based PDF.' });
    const truncated = raw.substring(0, 4000);
    const system = `You are a study assistant for Indian school students. ${lang}
Summarize the PDF content in this format:
📚 TOPIC: [main topic]
⭐ OVERVIEW: [2-3 sentence summary]
🔑 KEY CONCEPTS:
• [concept 1 — brief explanation]
• [concept 2 — brief explanation]
• [concept 3 — brief explanation]
• [concept 4 — brief explanation]
📝 IMPORTANT FORMULAS/FACTS: [list them]
💡 REAL-WORLD APPLICATION: [one practical example]
🎯 EXAM TIPS: [3 key points to remember]`;
    const summary = await ai([{ role:'user', content:`Summarize:\n\n${truncated}` }], system, 900);
    res.json({ summary, chars: raw.length, rawText: truncated });
  } catch(e) {
    if (req.file?.path) try { fs.unlinkSync(req.file.path); } catch {}
    res.status(500).json({ error:'PDF processing failed: ' + e.message });
  }
});

// ── PDF Workflow / Study Plan ────────────────────────────────────
app.post('/api/pdf-workflow', async (req, res) => {
  const { pdfText, topic, language } = req.body;
  const lang = language && language !== 'English' ? `Reply in ${language}.` : '';
  const system = `You are an expert study planner for Indian school students. ${lang}
Based on the PDF content, generate a detailed study workflow and preparation plan.
Respond ONLY in this exact JSON format:
{
  "topic": "main topic name",
  "totalDays": 7,
  "difficulty": "medium",
  "overview": "2 sentence overview of what student will learn",
  "phases": [
    {
      "phase": 1,
      "title": "Foundation",
      "days": "Day 1-2",
      "goal": "goal description",
      "tasks": ["task 1", "task 2", "task 3"],
      "color": "#6C63FF"
    },
    {
      "phase": 2,
      "title": "Core Learning",
      "days": "Day 3-5",
      "goal": "goal description",
      "tasks": ["task 1", "task 2", "task 3"],
      "color": "#00D9C0"
    },
    {
      "phase": 3,
      "title": "Practice",
      "days": "Day 6",
      "goal": "goal description",
      "tasks": ["task 1", "task 2", "task 3"],
      "color": "#FF9800"
    },
    {
      "phase": 4,
      "title": "Revision & Test",
      "days": "Day 7",
      "goal": "goal description",
      "tasks": ["task 1", "task 2"],
      "color": "#FF6B8A"
    }
  ],
  "dailyTime": "45 minutes",
  "resources": ["resource 1", "resource 2", "resource 3"],
  "tips": ["tip 1", "tip 2", "tip 3"]
}`;
  try {
    const raw = await ai([{ role:'user', content:`Create study workflow for this content:\n${pdfText.substring(0,3000)}\nTopic: ${topic}` }], system, 1000);
    const clean = raw.replace(/```json|```/g,'').trim();
    const s = clean.indexOf('{'); const e = clean.lastIndexOf('}');
    res.json(JSON.parse(clean.substring(s, e+1)));
  } catch(e) {
    res.json({
      topic: topic || 'Study Topic', totalDays: 7, difficulty:'medium',
      overview:'A structured 7-day plan to master this topic effectively.',
      phases:[
        {phase:1,title:'Foundation',days:'Day 1-2',goal:'Understand basic concepts',tasks:['Read the chapter overview','Note down key terms','Watch related visual diagrams'],color:'#6C63FF'},
        {phase:2,title:'Core Learning',days:'Day 3-5',goal:'Learn main concepts in depth',tasks:['Study each section carefully','Solve example problems','Make concept maps'],color:'#00D9C0'},
        {phase:3,title:'Practice',days:'Day 6',goal:'Apply knowledge through problems',tasks:['Solve practice questions','Take a quiz','Review mistakes'],color:'#FF9800'},
        {phase:4,title:'Revision & Test',days:'Day 7',goal:'Consolidate and test yourself',tasks:['Quick revision of all notes','Full mock test'],color:'#FF6B8A'}
      ],
      dailyTime:'45 minutes', resources:['Textbook','Notes','Practice questions'],
      tips:['Study at the same time daily','Take breaks every 25 minutes','Teach concepts to someone else']
    });
  }
});

// ── Career Guidance ──────────────────────────────────────────────
app.post('/api/career', async (req, res) => {
  const { studentName, grade, subjectScores, weakAreas, strongAreas, totalXP, missionsCompleted, quizCount } = req.body;
  const system = `You are an expert career counselor for Indian school students. Analyze the student's performance data and provide personalized career guidance.
Respond ONLY in this exact JSON format:
{
  "studentProfile": "2 sentence summary of the student's overall academic profile",
  "topStrengths": [
    {"subject": "subject name", "level": "Excellent/Good/Average", "score": 85, "description": "why this is a strength"},
    {"subject": "subject name", "level": "Good", "score": 72, "description": "description"}
  ],
  "areasToImprove": [
    {"subject": "subject name", "score": 45, "advice": "specific actionable advice"},
    {"subject": "subject name", "score": 52, "advice": "specific advice"}
  ],
  "careerPaths": [
    {
      "career": "career name",
      "match": 95,
      "icon": "emoji",
      "description": "2 sentence description of this career",
      "requiredSubjects": ["subject1", "subject2"],
      "nextSteps": ["step 1", "step 2", "step 3"]
    },
    {
      "career": "career name",
      "match": 85,
      "icon": "emoji",
      "description": "description",
      "requiredSubjects": ["subject1"],
      "nextSteps": ["step 1", "step 2"]
    },
    {
      "career": "career name",
      "match": 75,
      "icon": "emoji",
      "description": "description",
      "requiredSubjects": ["subject1", "subject2"],
      "nextSteps": ["step 1", "step 2"]
    }
  ],
  "overallAdvice": "2-3 sentences of personalized motivational advice for this student",
  "immediateActions": ["action 1", "action 2", "action 3", "action 4"]
}`;
  try {
    const prompt = `Student: ${studentName}, Grade: ${grade}
Subject scores: ${JSON.stringify(subjectScores)}
Strong in: ${strongAreas?.join(', ')||'analyzing...'}
Weak in: ${weakAreas?.join(', ')||'none identified'}
Total XP: ${totalXP}, Missions: ${missionsCompleted}, Quizzes: ${quizCount}
Generate detailed career guidance.`;
    const raw = await ai([{ role:'user', content:prompt }], system, 1200);
    const clean = raw.replace(/```json|```/g,'').trim();
    const s = clean.indexOf('{'); const e = clean.lastIndexOf('}');
    res.json(JSON.parse(clean.substring(s, e+1)));
  } catch(e) {
    res.json({
      studentProfile:`${studentName} is a dedicated student showing consistent effort across subjects.`,
      topStrengths:[
        {subject:strongAreas?.[0]||'Science',level:'Good',score:75,description:'Shows strong understanding and consistent performance.'},
        {subject:strongAreas?.[1]||'Mathematics',level:'Average',score:65,description:'Good foundational knowledge with room to grow.'}
      ],
      areasToImprove:[
        {subject:weakAreas?.[0]||'Practice',score:50,advice:'Focus on daily practice problems and concept revision.'}
      ],
      careerPaths:[
        {career:'Software Engineer',match:82,icon:'💻',description:'Build apps and solve problems using code. High demand in India.',requiredSubjects:['Mathematics','Science'],nextSteps:['Master Maths','Learn basic coding','Practice logical reasoning']},
        {career:'Doctor / Medical',match:78,icon:'🏥',description:'Help people stay healthy. Respected and rewarding profession.',requiredSubjects:['Science','Biology'],nextSteps:['Focus on Biology & Chemistry','Prepare for NEET','Stay consistent']},
        {career:'Teacher / Educator',match:70,icon:'📚',description:'Shape young minds and make a difference in education.',requiredSubjects:['All subjects'],nextSteps:['Excel in academics','Improve communication','Read widely']}
      ],
      overallAdvice:`${studentName}, you have great potential! Focus on your strengths and work consistently on improvement areas. Every expert was once a beginner.`,
      immediateActions:['Complete daily missions every day','Take one quiz per subject per week','Upload your textbook PDFs for AI summaries','Track your progress regularly']
    });
  }
});

// ── Mission ──────────────────────────────────────────────────────
app.post('/api/mission', async (req, res) => {
  const { subject, level, studentName, weakAreas } = req.body;
  const system = `Generate a daily study mission. ONLY valid JSON, no extra text:
{"title":"title","subject":"${subject}","description":"one sentence","tasks":[{"id":1,"task":"task","xp":20,"type":"learn"},{"id":2,"task":"task","xp":30,"type":"quiz"},{"id":3,"task":"task","xp":25,"type":"practice"},{"id":4,"task":"task","xp":15,"type":"visual"},{"id":5,"task":"task","xp":10,"type":"review"}],"totalXP":100,"difficulty":"${level}","tip":"motivational tip"}`;
  try {
    const raw = await ai([{role:'user',content:`Subject=${subject} Level=${level} Student=${studentName} Weak=${(weakAreas||[]).join(',')}`}], system, 400);
    const clean = raw.replace(/```json|```/g,'').trim();
    const s=clean.indexOf('{'); const e=clean.lastIndexOf('}');
    res.json(JSON.parse(clean.substring(s,e+1)));
  } catch {
    res.json({title:'Master '+subject+'!',subject,description:'Complete today\'s challenges!',
      tasks:[{id:1,task:'Study key concepts in '+subject,xp:20,type:'learn'},{id:2,task:'Answer 5 questions',xp:30,type:'quiz'},{id:3,task:'Solve 3 problems',xp:25,type:'practice'},{id:4,task:'View a 3D visual',xp:15,type:'visual'},{id:5,task:'Review notes',xp:10,type:'review'}],
      totalXP:100,difficulty:level,tip:'Every expert was once a beginner!'});
  }
});

// ── Quiz ─────────────────────────────────────────────────────────
app.post('/api/quiz', async (req, res) => {
  const { subject, topic, difficulty } = req.body;
  const system = `Generate exactly 5 MCQ questions for Indian school students. ONLY JSON:
{"questions":[{"id":1,"question":"?","options":["A) ","B) ","C) ","D) "],"correct":0,"explanation":"why"}]}
correct = 0-based index of correct answer.`;
  try {
    const raw = await ai([{role:'user',content:`5 ${difficulty} MCQs on "${topic}" in ${subject} for grades 6-10`}], system, 700);
    const clean = raw.replace(/```json|```/g,'').trim();
    const s=clean.indexOf('{'); const e=clean.lastIndexOf('}');
    res.json(JSON.parse(clean.substring(s,e+1)));
  } catch { res.json({ questions:defaultQuiz() }); }
});

function defaultQuiz() {
  return [
    {id:1,question:'Powerhouse of the cell?',options:['A) Nucleus','B) Mitochondria','C) Ribosome','D) Vacuole'],correct:1,explanation:'Mitochondria produces ATP energy.'},
    {id:2,question:'Value of π?',options:['A) 3.14','B) 2.71','C) 1.41','D) 1.73'],correct:0,explanation:'π ≈ 3.14159'},
    {id:3,question:'Gas released in photosynthesis?',options:['A) CO₂','B) Nitrogen','C) Oxygen','D) Hydrogen'],correct:2,explanation:'Plants release O₂.'},
    {id:4,question:'Planets in Solar System?',options:['A) 7','B) 8','C) 9','D) 10'],correct:1,explanation:'8 planets since Pluto reclassified.'},
    {id:5,question:"Newton's 2nd Law?",options:['A) F=mv','B) F=ma','C) F=m/a','D) F=m+a'],correct:1,explanation:'F = mass × acceleration.'}
  ];
}

// ── Weak Area Analysis ───────────────────────────────────────────
app.post('/api/analyze', async (req, res) => {
  const { wrongAnswers, subject } = req.body;
  const system = `Analyze mistakes. ONLY JSON: {"weakAreas":["t1","t2"],"recommendation":"sentence","encouragement":"sentence"}`;
  try {
    const raw = await ai([{role:'user',content:`Wrong in ${subject}: ${wrongAnswers.join(', ')}`}], system, 200);
    const clean = raw.replace(/```json|```/g,'').trim();
    const s=clean.indexOf('{'); const e=clean.lastIndexOf('}');
    res.json(JSON.parse(clean.substring(s,e+1)));
  } catch { res.json({weakAreas:[subject+' basics'],recommendation:'Practice more.',encouragement:'Keep going!'}); }
});

// ── Translate ────────────────────────────────────────────────────
app.post('/api/translate', async (req, res) => {
  const { text, targetLanguage } = req.body;
  if (!text || !targetLanguage || targetLanguage==='English') return res.json({ translated:text });
  const system = `Translate to ${targetLanguage}. Keep emojis, • bullets, formatting. Output ONLY translated text.`;
  try {
    const translated = await ai([{role:'user',content:text}], system, 800);
    res.json({ translated });
  } catch { res.status(500).json({ error:'Translation failed' }); }
});

// ── Parent Report ────────────────────────────────────────────────
app.post('/api/parent-report', async (req, res) => {
  const { studentName, xp, level, completedMissions, weakAreas, strongAreas, quizScores } = req.body;
  const system = `Write a weekly parent progress report for an Indian school student. Simple English. Under 180 words.
1. Overall summary 2. Strong areas with praise 3. Areas needing attention 4. Parent recommendation 5. Encouraging close`;
  try {
    const reply = await ai([{role:'user',content:`Student:${studentName} XP:${xp} Level:${level} Missions:${completedMissions} Strong:${strongAreas?.join(',')} Weak:${weakAreas?.join(',')} QuizAvg:${quizScores}%`}], system, 400);
    res.json({ report:reply });
  } catch { res.json({report:`${studentName} earned ${xp} XP completing ${completedMissions} missions at Level ${level}. Keep up the daily missions!`}); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅ Spark AI Study Companion v3.0 → http://localhost:${PORT}`);
  console.log(`   Model: ${MODEL} | Make sure Ollama is running!\n`);
});
