const VLAB_TOPICS = [
  { id:'heart', emoji:'❤️', label:'Heart' },
  { id:'brain', emoji:'🧠', label:'Brain' },
  { id:'dna', emoji:'🧬', label:'DNA Helix' },
  { id:'atom', emoji:'⚛️', label:'Atom' },
  { id:'cell', emoji:'🔬', label:'Plant Cell' },
  { id:'solar', emoji:'🪐', label:'Solar System' },
  { id:'lungs', emoji:'🫁', label:'Lungs' },
  { id:'eye', emoji:'👁️', label:'Human Eye' },
  { id:'volcano', emoji:'🌋', label:'Volcano' },
  { id:'earth', emoji:'🌍', label:'Earth Layers' },
];

function renderVisualLab() {
  const grid = document.getElementById('vlabTopics');
  grid.innerHTML = VLAB_TOPICS.map(t =>
    `<button class="vlab-topic-btn" onclick="showVlab('${t.id}')"><span class="vt-emoji">${t.emoji}</span><span>${t.label}</span></button>`
  ).join('');
}

let vlabAnimFrame = null;

function stopVlabAnim() {
  if (vlabAnimFrame) { cancelAnimationFrame(vlabAnimFrame); vlabAnimFrame = null; }
}

function showVlab(id) {
  stopVlabAnim();
  document.querySelectorAll('.vlab-topic-btn').forEach(b => b.classList.remove('active'));
  const btn = [...document.querySelectorAll('.vlab-topic-btn')].find(b => b.getAttribute('onclick')?.includes(`'${id}'`));
  if (btn) btn.classList.add('active');
  const stage = document.getElementById('vlabStage');
  const topic = VLAB_TOPICS.find(t => t.id === id);
  const builders = { heart: buildHeart3D, brain: buildBrain3D, dna: buildDNA3D, atom: buildAtom3D, cell: buildCell3D, solar: buildSolar3D, lungs: buildLungs3D, eye: buildEye3D, volcano: buildVolcano3D, earth: buildEarth3D };
  const fn = builders[id] || buildDefault;
  stage.innerHTML = fn(topic);
  initVlabCanvas(id);
}

function initVlabCanvas(id) {
  const canvas = document.getElementById('vlabCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const animFns = { heart: animHeart, brain: animBrain, dna: animDNA, atom: animAtom, cell: animCell, solar: animSolar, lungs: animLungs, eye: animEye, volcano: animVolcano, earth: animEarth };
  const fn = animFns[id];
  if (!fn) return;
  let frame = 0;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    fn(ctx, W, H, frame);
    frame++;
    vlabAnimFrame = requestAnimationFrame(loop);
  }
  loop();
}

function canvasWrap(content, infos, controls) {
  const infoHTML = infos ? `<div class="vlab-info-strip">${infos.map(i=>`<div class="vlab-info-item"><div class="vlab-info-v">${i.v}</div><div class="vlab-info-l">${i.l}</div></div>`).join('')}</div>` : '';
  const ctrlHTML = controls ? `<div class="vlab-controls">${controls.map(c=>`<button class="vlab-ctrl-btn" onclick="${c.fn}">${c.label}</button>`).join('')}</div>` : '';
  return `<div class="vr-badge">🔬 3D Interactive Model</div>
<div class="vlab-3d-wrap"><canvas id="vlabCanvas" class="vlab-canvas" width="560" height="380"></canvas></div>
${infoHTML}${ctrlHTML}${content||''}`;
}

// ── HEART ─────────────────────────────────────────────────────────
function buildHeart3D() {
  return canvasWrap(`<div class="vlab-desc" style="margin-top:10px">The human heart pumps blood through two circuits — the pulmonary (lungs) and systemic (body) circuits. It beats ~100,000 times daily, pumping 5 litres of blood per minute.</div>`,
    [{v:'100K',l:'beats/day'},{v:'5L',l:'blood/min'},{v:'4',l:'chambers'},{v:'300g',l:'weight'}]);
}
function animHeart(ctx, W, H, f) {
  const cx = W/2, cy = H/2 - 20;
  const beat = Math.sin(f * 0.06) * 0.12 + 1;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(beat, beat);
  // Heart shape
  ctx.beginPath();
  ctx.moveTo(0, 30);
  for (let a = 0; a <= Math.PI * 2; a += 0.01) {
    const x = 16 * Math.pow(Math.sin(a), 3);
    const y = -(13 * Math.cos(a) - 5 * Math.cos(2*a) - 2 * Math.cos(3*a) - Math.cos(4*a));
    if (a === 0) ctx.moveTo(x * 9, y * 9); else ctx.lineTo(x * 9, y * 9);
  }
  const hgr = ctx.createRadialGradient(-20, -30, 10, 0, 0, 120);
  hgr.addColorStop(0, '#FF6B8A'); hgr.addColorStop(0.5, '#E53935'); hgr.addColorStop(1, '#8B0020');
  ctx.fillStyle = hgr; ctx.fill();
  ctx.strokeStyle = 'rgba(255,100,100,0.4)'; ctx.lineWidth = 2; ctx.stroke();
  // Chambers
  ctx.fillStyle = 'rgba(30,136,229,0.75)';
  ctx.beginPath(); ctx.ellipse(38, -15, 30, 24, 0.3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(229,57,53,0.85)';
  ctx.beginPath(); ctx.ellipse(-25, -15, 30, 24, -0.3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(30,136,229,0.65)';
  ctx.beginPath(); ctx.ellipse(36, 30, 26, 32, 0.2, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(229,57,53,0.75)';
  ctx.beginPath(); ctx.ellipse(-22, 32, 28, 34, -0.2, 0, Math.PI*2); ctx.fill();
  // Labels
  ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Inter'; ctx.textAlign = 'center';
  ctx.fillText('RA', 38, -15); ctx.fillText('LA', -25, -15);
  ctx.fillText('RV', 36, 32); ctx.fillText('LV', -22, 32);
  // Aorta animation
  const aFlow = (f * 2) % 40;
  ctx.strokeStyle = `rgba(200,40,40,${0.3 + Math.sin(f*0.08)*0.2})`; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-20, -65); ctx.quadraticCurveTo(-40, -90, -30, -110); ctx.stroke();
  ctx.strokeStyle = `rgba(30,136,229,${0.3 + Math.sin(f*0.08+1)*0.2})`; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(30, -60); ctx.quadraticCurveTo(55, -85, 60, -105); ctx.stroke();
  // Pulse dots
  const pulsePct = (f % 60) / 60;
  ctx.fillStyle = `rgba(255,100,100,${1 - pulsePct})`;
  ctx.beginPath(); ctx.arc(-20 + (-30 - (-20)) * pulsePct, -65 + (-110 - (-65)) * pulsePct, 4 * (1-pulsePct) + 2, 0, Math.PI*2); ctx.fill();
  ctx.restore();
  // Title
  ctx.fillStyle = '#A78BFA'; ctx.font = 'bold 14px Space Grotesk'; ctx.textAlign = 'center';
  ctx.fillText('❤️ Human Heart — 3D Interactive', W/2, H - 14);
}

// ── BRAIN ─────────────────────────────────────────────────────────
function buildBrain3D() {
  return canvasWrap(`<div class="vlab-desc" style="margin-top:10px">The human brain has 86 billion neurons and controls all body functions. Each colour represents a different lobe — click the diagram to learn more!</div>`,
    [{v:'86B',l:'neurons'},{v:'100B',l:'synapses'},{v:'1.4kg',l:'weight'},{v:'20%',l:'body energy'}]);
}
function animBrain(ctx, W, H, f) {
  const cx = W/2, cy = H/2 - 10;
  const pulse = Math.sin(f * 0.03) * 4;
  ctx.save(); ctx.translate(cx, cy);
  // Outer brain
  const bgr = ctx.createRadialGradient(-20, -20, 20, 0, 0, 140);
  bgr.addColorStop(0, '#F48FB1'); bgr.addColorStop(1, '#C2185B');
  ctx.beginPath(); ctx.ellipse(0, 0 + pulse*0.2, 150, 100 + pulse*0.3, 0, 0, Math.PI*2);
  ctx.fillStyle = bgr; ctx.fill();
  // Gyri (wrinkles)
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + f * 0.005;
    ctx.beginPath(); ctx.ellipse(Math.cos(a)*60, Math.sin(a)*40, 30, 15, a, 0, Math.PI); ctx.stroke();
  }
  // Lobes
  const lobes = [
    { label:'Frontal', x:-60, y:-30, rx:52, ry:40, c:'#F06292' },
    { label:'Parietal', x:55, y:-25, rx:44, ry:32, c:'#CE93D8' },
    { label:'Occipital', x:60, y:30, rx:40, ry:28, c:'#80CBC4' },
    { label:'Temporal', x:-20, y:45, rx:42, ry:25, c:'#FFE082' },
    { label:'Cerebellum', x:0, y:80, rx:38, ry:16, c:'#A5D6A7' },
  ];
  lobes.forEach(l => {
    ctx.beginPath(); ctx.ellipse(l.x, l.y, l.rx, l.ry, 0, 0, Math.PI*2);
    ctx.fillStyle = l.c + 'CC'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Inter'; ctx.textAlign = 'center';
    ctx.fillText(l.label, l.x, l.y + 4);
  });
  // Neural pulse animation
  const np = (f * 3) % 300;
  if (np < 150) {
    const px = -80 + np * 1.5, py = -10 + Math.sin(np * 0.08) * 20;
    ctx.fillStyle = `rgba(255,220,100,${0.8 - np/150 * 0.6})`;
    ctx.beginPath(); ctx.arc(px, py, 5 - np/150*3, 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = '#A78BFA'; ctx.font = 'bold 14px Space Grotesk'; ctx.textAlign = 'center';
  ctx.fillText('🧠 Human Brain — 3D Interactive', W/2, H - 14);
}

// ── DNA ────────────────────────────────────────────────────────────
function buildDNA3D() {
  return canvasWrap(`<div class="vlab-desc" style="margin-top:10px">DNA (Deoxyribonucleic Acid) contains genetic information. The double helix has two strands held together by base pairs: A-T and G-C.</div>`,
    [{v:'3B',l:'base pairs'},{v:'46',l:'chromosomes'},{v:'2m',l:'length/cell'},{v:'~25K',l:'genes'}]);
}
function animDNA(ctx, W, H, f) {
  const cx = W/2, speed = f * 0.03;
  const pairs = 14, spacing = (H - 60) / pairs;
  // Draw double helix
  for (let i = 0; i <= pairs; i++) {
    const y = 30 + i * spacing;
    const phase = i * (Math.PI * 2 / pairs) + speed;
    const x1 = cx + Math.sin(phase) * 100;
    const x2 = cx + Math.sin(phase + Math.PI) * 100;
    const depth1 = (Math.sin(phase) + 1) / 2;
    const depth2 = (Math.sin(phase + Math.PI) + 1) / 2;
    // Left strand dot
    const r1 = 7 + depth1 * 4;
    const gr1 = ctx.createRadialGradient(x1-2, y-2, 1, x1, y, r1);
    gr1.addColorStop(0, `rgba(239,68,68,${0.5 + depth1*0.5})`);
    gr1.addColorStop(1, `rgba(153,27,27,${0.5 + depth1*0.5})`);
    ctx.beginPath(); ctx.arc(x1, y, r1, 0, Math.PI*2);
    ctx.fillStyle = gr1; ctx.fill();
    // Right strand dot
    const r2 = 7 + depth2 * 4;
    const gr2 = ctx.createRadialGradient(x2-2, y-2, 1, x2, y, r2);
    gr2.addColorStop(0, `rgba(59,130,246,${0.5 + depth2*0.5})`);
    gr2.addColorStop(1, `rgba(29,78,216,${0.5 + depth2*0.5})`);
    ctx.beginPath(); ctx.arc(x2, y, r2, 0, Math.PI*2);
    ctx.fillStyle = gr2; ctx.fill();
    // Base pair connector
    if (i < pairs) {
      const midDepth = (depth1 + depth2) / 2;
      const bases = ['A-T','G-C','T-A','C-G'];
      const bp = bases[i % 4];
      const bpColor = bp.startsWith('A')||bp.startsWith('T') ? '#4ADE80' : '#FBBF24';
      ctx.strokeStyle = `rgba(${bp.startsWith('A')||bp.startsWith('T')?'74,222,128':'251,191,36'},${0.4 + midDepth*0.4})`;
      ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
      ctx.setLineDash([]);
      // Label
      ctx.fillStyle = bpColor + 'CC'; ctx.font = '9px Inter'; ctx.textAlign = 'center';
      ctx.fillText(bp, cx, y - 3);
    }
  }
  // Backbone curves
  ctx.strokeStyle = 'rgba(239,68,68,0.6)'; ctx.lineWidth = 3; ctx.setLineDash([]);
  ctx.beginPath();
  for (let i = 0; i <= 100; i++) {
    const y = 30 + (i / 100) * (H - 60);
    const phase = (i / 100) * pairs * (Math.PI*2/pairs) + speed;
    const x = cx + Math.sin(phase) * 100;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(59,130,246,0.6)';
  ctx.beginPath();
  for (let i = 0; i <= 100; i++) {
    const y = 30 + (i / 100) * (H - 60);
    const phase = (i / 100) * pairs * (Math.PI*2/pairs) + speed + Math.PI;
    const x = cx + Math.sin(phase) * 100;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = '#A78BFA'; ctx.font = 'bold 14px Space Grotesk'; ctx.textAlign = 'center';
  ctx.fillText('🧬 DNA Double Helix — Rotating 3D', W/2, H - 8);
}

// ── ATOM ───────────────────────────────────────────────────────────
function buildAtom3D() {
  return canvasWrap(`<div class="vlab-desc" style="margin-top:10px">An atom has a nucleus (protons + neutrons) surrounded by electrons in shells. This model shows Oxygen with 8 protons, 8 neutrons, and 8 electrons.</div>`,
    [{v:'8p+',l:'protons'},{v:'8n',l:'neutrons'},{v:'8e-',l:'electrons'},{v:'16',l:'atomic mass'}]);
}
function animAtom(ctx, W, H, f) {
  const cx = W/2, cy = H/2;
  // Glow
  const glow = ctx.createRadialGradient(cx, cy, 5, cx, cy, 80);
  glow.addColorStop(0, 'rgba(124,58,237,0.3)'); glow.addColorStop(1, 'rgba(124,58,237,0)');
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, 80, 0, Math.PI*2); ctx.fill();
  // Nucleus
  const ngr = ctx.createRadialGradient(cx-8, cy-8, 4, cx, cy, 28);
  ngr.addColorStop(0, '#F87171'); ngr.addColorStop(1, '#B91C1C');
  ctx.beginPath(); ctx.arc(cx, cy, 28, 0, Math.PI*2);
  ctx.fillStyle = ngr; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Inter'; ctx.textAlign = 'center';
  ctx.fillText('8p+', cx, cy - 4); ctx.fillText('8n', cx, cy + 11);
  // Electron orbits with electrons
  const orbits = [
    { rx:90, ry:35, rot:0.4, elec:2, color:'#67E8F9', speed:0.025 },
    { rx:120, ry:48, rot:-0.6, elec:6, color:'#A78BFA', speed:0.018 },
    { rx:155, ry:65, rot:0.9, elec:8, color:'#6EE7B7', speed:0.012 },
  ];
  orbits.forEach(o => {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(o.rot);
    // Orbit ellipse
    ctx.strokeStyle = o.color + '30'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(0, 0, o.rx, o.ry, 0, 0, Math.PI*2); ctx.stroke();
    // Electrons
    for (let i = 0; i < o.elec; i++) {
      const a = (i / o.elec) * Math.PI * 2 + f * o.speed;
      const ex = Math.cos(a) * o.rx, ey = Math.sin(a) * o.ry;
      const depth = (Math.sin(a) + 1) / 2;
      const er = 5 + depth * 3;
      const egr = ctx.createRadialGradient(ex-1, ey-1, 1, ex, ey, er);
      egr.addColorStop(0, o.color); egr.addColorStop(1, o.color + '44');
      ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI*2);
      ctx.fillStyle = egr; ctx.fill();
      if (depth > 0.8) {
        ctx.fillStyle = '#fff'; ctx.font = 'bold 8px Inter'; ctx.textAlign = 'center';
        ctx.fillText('e-', ex, ey + 3);
      }
    }
    ctx.restore();
  });
  ctx.fillStyle = '#A78BFA'; ctx.font = 'bold 14px Space Grotesk'; ctx.textAlign = 'center';
  ctx.fillText('⚛️ Oxygen Atom — 3D Orbital Model', W/2, H - 14);
}

// ── CELL ──────────────────────────────────────────────────────────
function buildCell3D() {
  return canvasWrap(`<div class="vlab-desc" style="margin-top:10px">A plant cell has a rigid cell wall, chloroplasts for photosynthesis, a large central vacuole, and nucleus containing DNA. It differs from animal cells by having a cell wall and chloroplasts.</div>`,
    [{v:'Cell Wall',l:'rigid support'},{v:'Chloroplast',l:'photosynthesis'},{v:'Vacuole',l:'water storage'},{v:'Nucleus',l:'DNA center'}]);
}
function animCell(ctx, W, H, f) {
  const cx = W/2, cy = H/2;
  const pulse = Math.sin(f * 0.02) * 3;
  // Cell wall
  ctx.strokeStyle = '#4ADE80'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.roundRect(cx-200, cy-140, 400, 280, 30); ctx.stroke();
  // Cell membrane
  const cmgr = ctx.createRadialGradient(cx-60, cy-60, 30, cx, cy, 200);
  cmgr.addColorStop(0, 'rgba(163,230,53,0.12)'); cmgr.addColorStop(1, 'rgba(74,222,128,0.04)');
  ctx.fillStyle = cmgr;
  ctx.beginPath(); ctx.roundRect(cx-196, cy-136, 392, 272, 26); ctx.fill();
  // Nucleus (pulsing)
  const ngr = ctx.createRadialGradient(cx-10, cy-10, 10, cx, cy, 52 + pulse);
  ngr.addColorStop(0, 'rgba(147,197,253,0.9)'); ngr.addColorStop(1, 'rgba(59,130,246,0.7)');
  ctx.beginPath(); ctx.ellipse(cx, cy, 52 + pulse, 38 + pulse, 0, 0, Math.PI*2);
  ctx.fillStyle = ngr; ctx.fill();
  ctx.strokeStyle = 'rgba(59,130,246,0.8)'; ctx.lineWidth = 2; ctx.stroke();
  // Nucleolus
  ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(37,99,235,0.8)'; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Inter'; ctx.textAlign = 'center';
  ctx.fillText('Nucleus', cx, cy - 3); ctx.fillText('DNA', cx, cy + 11);
  // Chloroplasts (rotating slightly)
  const chloroPos = [{x:-120,y:-60},{x:-140,y:20},{x:-100,y:80}];
  chloroPos.forEach((p,i) => {
    const rot = Math.sin(f * 0.02 + i) * 0.1;
    ctx.save(); ctx.translate(cx + p.x, cy + p.y); ctx.rotate(rot);
    const cgr = ctx.createRadialGradient(-5,-3,3,0,0,24);
    cgr.addColorStop(0, '#86EFAC'); cgr.addColorStop(1, '#16A34A');
    ctx.beginPath(); ctx.ellipse(0, 0, 28, 16, 0, 0, Math.PI*2);
    ctx.fillStyle = cgr; ctx.fill();
    ctx.strokeStyle = '#4ADE80'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 9px Inter'; ctx.textAlign = 'center';
    ctx.fillText('Chloro', 0, 4); ctx.restore();
  });
  // Mitochondria
  ctx.save(); ctx.translate(cx + 130, cy - 50);
  const mgr = ctx.createRadialGradient(-5,-3,3,0,0,22);
  mgr.addColorStop(0, '#FDE047'); mgr.addColorStop(1, '#CA8A04');
  ctx.beginPath(); ctx.ellipse(0, 0, 26, 14, 0, 0, Math.PI*2);
  ctx.fillStyle = mgr; ctx.fill(); ctx.strokeStyle = '#EAB308'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 9px Inter'; ctx.textAlign = 'center'; ctx.fillText('Mito', 0, 4); ctx.restore();
  // Vacuole
  ctx.beginPath(); ctx.ellipse(cx + 80, cy + 50, 55, 55, 0, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(196,181,253,0.3)'; ctx.fill();
  ctx.strokeStyle = 'rgba(196,181,253,0.6)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#DDD6FE'; ctx.font = 'bold 10px Inter'; ctx.textAlign = 'center';
  ctx.fillText('Vacuole', cx+80, cy+50); ctx.fillText('(water)', cx+80, cy+64);
  // Cell wall label
  ctx.fillStyle = '#4ADE80'; ctx.font = 'bold 10px Inter'; ctx.textAlign = 'left';
  ctx.fillText('Cell Wall →', cx - 195, cy - 150);
  ctx.fillStyle = '#A78BFA'; ctx.font = 'bold 14px Space Grotesk'; ctx.textAlign = 'center';
  ctx.fillText('🔬 Plant Cell — 3D Cross Section', W/2, H - 8);
}

// ── SOLAR SYSTEM ──────────────────────────────────────────────────
function buildSolar3D() {
  return canvasWrap(`<div class="vlab-desc" style="margin-top:10px">Our solar system has 8 planets orbiting the Sun. The inner rocky planets (Mercury, Venus, Earth, Mars) and outer gas giants (Jupiter, Saturn, Uranus, Neptune).</div>`,
    [{v:'8',l:'planets'},{v:'4.6B',l:'years old'},{v:'1AU',l:'Earth-Sun'},{v:'8 min',l:'light travel'}]);
}
function animSolar(ctx, W, H, f) {
  const cx = W/2, cy = H/2;
  // Space bg dots
  if (f === 0 || !animSolar._stars) {
    animSolar._stars = Array.from({length:60},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.5}));
  }
  animSolar._stars.forEach(s => {
    ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(f*0.05+s.x)*0.2})`;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
  });
  // Sun
  const sgr = ctx.createRadialGradient(cx-8, cy-8, 8, cx, cy, 36);
  sgr.addColorStop(0, '#FEF08A'); sgr.addColorStop(0.5, '#F59E0B'); sgr.addColorStop(1, '#D97706');
  ctx.beginPath(); ctx.arc(cx, cy, 34, 0, Math.PI*2); ctx.fillStyle = sgr; ctx.fill();
  // Solar flare
  const flare = Math.sin(f * 0.05) * 5;
  ctx.fillStyle = 'rgba(253,224,71,0.15)';
  ctx.beginPath(); ctx.arc(cx, cy, 38 + flare, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#FEF08A'; ctx.font = 'bold 9px Inter'; ctx.textAlign = 'center';
  ctx.fillText('Sun', cx, cy + 4);
  // Planets
  const planets = [
    {name:'Mercury',dist:52,r:4,color:'#9CA3AF',speed:0.04},
    {name:'Venus',dist:72,r:6,color:'#FDE68A',speed:0.025},
    {name:'Earth',dist:95,r:7,color:'#3B82F6',speed:0.018},
    {name:'Mars',dist:118,r:5.5,color:'#F87171',speed:0.013},
    {name:'Jupiter',dist:155,r:14,color:'#FCA5A5',speed:0.007},
    {name:'Saturn',dist:195,r:11,color:'#FDE68A',speed:0.005,ring:true},
    {name:'Uranus',dist:228,r:9,color:'#A5F3FC',speed:0.003},
    {name:'Neptune',dist:258,r:8,color:'#818CF8',speed:0.002},
  ];
  planets.forEach(p => {
    const angle = f * p.speed;
    const px = cx + Math.cos(angle) * p.dist;
    const py = cy + Math.sin(angle) * p.dist * 0.38;
    // Orbit ring
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(cx, cy, p.dist, p.dist * 0.38, 0, 0, Math.PI*2); ctx.stroke();
    // Planet
    const pgr = ctx.createRadialGradient(px-p.r*0.3, py-p.r*0.3, p.r*0.1, px, py, p.r);
    pgr.addColorStop(0, p.color); pgr.addColorStop(1, p.color + '88');
    ctx.beginPath(); ctx.arc(px, py, p.r, 0, Math.PI*2); ctx.fillStyle = pgr; ctx.fill();
    // Saturn ring
    if (p.ring) {
      ctx.strokeStyle = 'rgba(253,230,138,0.6)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(px, py, p.r*2.2, p.r*0.5, 0.3, 0, Math.PI*2); ctx.stroke();
    }
    // Name label for larger planets
    if (p.r >= 7 || p.name === 'Earth') {
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '9px Inter'; ctx.textAlign = 'center';
      ctx.fillText(p.name, px, py + p.r + 10);
    }
  });
  ctx.fillStyle = '#A78BFA'; ctx.font = 'bold 14px Space Grotesk'; ctx.textAlign = 'center';
  ctx.fillText('🪐 Solar System — Live Orbital View', W/2, H - 8);
}
animSolar._stars = null;

// ── LUNGS ─────────────────────────────────────────────────────────
function buildLungs3D() {
  return canvasWrap(`<div class="vlab-desc" style="margin-top:10px">The lungs exchange oxygen and CO₂. Air enters through the trachea, branches into bronchi, and reaches alveoli where gas exchange happens. You breathe ~20,000 times daily.</div>`,
    [{v:'20K',l:'breaths/day'},{v:'6L',l:'lung capacity'},{v:'480M',l:'alveoli'},{v:'70m²',l:'surface area'}]);
}
function animLungs(ctx, W, H, f) {
  const cx = W/2, cy = H/2 - 10;
  const breathe = Math.sin(f * 0.03) * 0.12 + 1;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(1, breathe);
  // Left lung
  const llgr = ctx.createRadialGradient(-70, -30, 10, -70, 0, 90);
  llgr.addColorStop(0, 'rgba(248,113,113,0.8)'); llgr.addColorStop(1, 'rgba(185,28,28,0.6)');
  ctx.beginPath(); ctx.moveTo(-10, -100); ctx.bezierCurveTo(-80, -120, -160, -60, -150, 40);
  ctx.bezierCurveTo(-140, 100, -80, 130, -30, 110); ctx.bezierCurveTo(-10, 100, -10, 80, -10, 60); ctx.closePath();
  ctx.fillStyle = llgr; ctx.fill(); ctx.strokeStyle = 'rgba(248,113,113,0.4)'; ctx.lineWidth = 2; ctx.stroke();
  // Right lung
  const rlgr = ctx.createRadialGradient(70, -30, 10, 70, 0, 90);
  rlgr.addColorStop(0, 'rgba(248,113,113,0.8)'); rlgr.addColorStop(1, 'rgba(185,28,28,0.6)');
  ctx.beginPath(); ctx.moveTo(10, -100); ctx.bezierCurveTo(80, -120, 160, -60, 150, 40);
  ctx.bezierCurveTo(140, 100, 80, 130, 30, 110); ctx.bezierCurveTo(10, 100, 10, 80, 10, 60); ctx.closePath();
  ctx.fillStyle = rlgr; ctx.fill(); ctx.strokeStyle = 'rgba(248,113,113,0.4)'; ctx.lineWidth = 2; ctx.stroke();
  // Trachea
  ctx.strokeStyle = '#F9A8D4'; ctx.lineWidth = 14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -130); ctx.lineTo(0, -100); ctx.stroke();
  // Bronchi
  ctx.lineWidth = 10;
  ctx.beginPath(); ctx.moveTo(0, -100); ctx.quadraticCurveTo(-30, -80, -60, -70); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -100); ctx.quadraticCurveTo(30, -80, 60, -70); ctx.stroke();
  // Bronchioles (smaller branches)
  ctx.lineWidth = 5;
  [[-60,-70,-90,-40],[-60,-70,-40,-30],[60,-70,90,-40],[60,-70,40,-30]].forEach(b => {
    ctx.beginPath(); ctx.moveTo(b[0],b[1]); ctx.quadraticCurveTo((b[0]+b[2])/2,b[1]-10,b[2],b[3]); ctx.stroke();
  });
  // O2/CO2 bubbles
  const bt = (f * 2) % 80;
  ctx.fillStyle = `rgba(96,165,250,${0.8 - bt/80})`;
  ctx.beginPath(); ctx.arc(-90 + bt*0.3, -20 - bt*0.6, 6, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = `rgba(248,113,113,${0.6 - bt/80})`;
  ctx.beginPath(); ctx.arc(90 - bt*0.3, -20 - bt*0.6, 5, 0, Math.PI*2); ctx.fill();
  ctx.restore();
  // Labels
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = 'bold 10px Inter'; ctx.textAlign = 'center';
  ctx.fillText('Trachea', W/2, cy - 130 * breathe - 10);
  ctx.fillStyle = 'rgba(96,165,250,0.9)'; ctx.fillText('O₂ in', 60, cy + 40);
  ctx.fillStyle = 'rgba(248,113,113,0.9)'; ctx.fillText('CO₂ out', W - 60, cy + 40);
  ctx.fillStyle = '#A78BFA'; ctx.font = 'bold 14px Space Grotesk'; ctx.textAlign = 'center';
  ctx.fillText('🫁 Lungs — Breathing Animation', W/2, H - 8);
}

// ── EYE ───────────────────────────────────────────────────────────
function buildEye3D() {
  return canvasWrap(`<div class="vlab-desc" style="margin-top:10px">The human eye focuses light onto the retina. The cornea and lens bend light, the iris controls pupil size, and the retina converts light to nerve signals sent to the brain.</div>`,
    [{v:'576MP',l:'resolution'},{v:'120°',l:'field of view'},{v:'7mm',l:'pupil max'},{v:'1/10s',l:'reaction'}]);
}
function animEye(ctx, W, H, f) {
  const cx = W/2, cy = H/2;
  const blink = Math.sin(f * 0.008) > 0.95 ? Math.sin(f * 0.008) * 10 : 0;
  // Sclera (white)
  ctx.beginPath(); ctx.ellipse(cx, cy, 160, 90 - blink, 0, 0, Math.PI*2);
  ctx.fillStyle = '#F8FAFC'; ctx.fill();
  ctx.strokeStyle = '#CBD5E1'; ctx.lineWidth = 2; ctx.stroke();
  // Iris
  const pupilMove = Math.sin(f * 0.01) * 20;
  const igr = ctx.createRadialGradient(cx + pupilMove - 5, cy - 5, 5, cx + pupilMove, cy, 55);
  igr.addColorStop(0, '#1D4ED8'); igr.addColorStop(0.6, '#3B82F6'); igr.addColorStop(1, '#1E3A8A');
  ctx.beginPath(); ctx.ellipse(cx + pupilMove, cy, 55, 55 - blink*0.5, 0, 0, Math.PI*2);
  ctx.fillStyle = igr; ctx.fill();
  // Iris texture (lines radiating)
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    ctx.strokeStyle = 'rgba(30,58,138,0.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx + pupilMove + Math.cos(a)*18, cy + Math.sin(a)*(18-blink*0.3));
    ctx.lineTo(cx + pupilMove + Math.cos(a)*50, cy + Math.sin(a)*(50-blink*0.4)); ctx.stroke();
  }
  // Pupil (dilating)
  const pupilSize = 20 + Math.sin(f * 0.02) * 6;
  ctx.beginPath(); ctx.ellipse(cx + pupilMove, cy, pupilSize, pupilSize - blink*0.5, 0, 0, Math.PI*2);
  ctx.fillStyle = '#030712'; ctx.fill();
  // Light reflection
  ctx.beginPath(); ctx.ellipse(cx + pupilMove - 8, cy - 8, 8, 5, -0.5, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill();
  // Cornea outline
  ctx.beginPath(); ctx.ellipse(cx + pupilMove, cy, 58, 58 - blink*0.5, 0, 0, Math.PI*2);
  ctx.strokeStyle = 'rgba(203,213,225,0.3)'; ctx.lineWidth = 3; ctx.stroke();
  // Eyelids
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath(); ctx.ellipse(cx, cy, 162, 92, 0, Math.PI, 0); ctx.closePath();
  ctx.fillStyle = '#1F2937'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx, cy, 162, 92, 0, 0, Math.PI); ctx.closePath();
  ctx.fillStyle = '#1F2937'; ctx.fill();
  // Eyelash lines
  for (let i = -5; i <= 5; i++) {
    const lx = cx + i * 25, lbase = cy - 89 + blink;
    ctx.strokeStyle = '#374151'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(lx, lbase); ctx.lineTo(lx + i*2, lbase - 15 + Math.abs(i)*2); ctx.stroke();
  }
  // Light ray animation
  const ray = (f * 2) % 120;
  ctx.strokeStyle = `rgba(250,204,21,${0.4 - ray/120*0.4})`; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx - 180 + ray, cy - 40 + ray*0.4); ctx.lineTo(cx + pupilMove, cy); ctx.stroke();
  ctx.fillStyle = '#A78BFA'; ctx.font = 'bold 14px Space Grotesk'; ctx.textAlign = 'center';
  ctx.fillText('👁️ Human Eye — 3D Cross Section', W/2, H - 8);
}

// ── VOLCANO ────────────────────────────────────────────────────────
function buildVolcano3D() {
  return canvasWrap(`<div class="vlab-desc" style="margin-top:10px">Volcanoes form where tectonic plates meet. Magma rises through vents and erupts as lava. The Earth has ~1,500 active volcanoes.</div>`,
    [{v:'1,500',l:'active volcanoes'},{v:'700°C+',l:'lava temp'},{v:'1,000km/h',l:'eruption speed'},{v:'7km',l:'tallest'}]);
}
function animVolcano(ctx, W, H, f) {
  const cx = W/2;
  // Ground
  const ggr = ctx.createLinearGradient(0, H*0.65, 0, H);
  ggr.addColorStop(0, '#292524'); ggr.addColorStop(1, '#1C1917');
  ctx.fillStyle = ggr; ctx.fillRect(0, H*0.65, W, H*0.35);
  // Volcano body
  ctx.beginPath(); ctx.moveTo(cx, 40); ctx.lineTo(cx - 180, H*0.65); ctx.lineTo(cx + 180, H*0.65); ctx.closePath();
  const vgr = ctx.createLinearGradient(cx-180, 0, cx+180, 0);
  vgr.addColorStop(0, '#57534E'); vgr.addColorStop(0.5, '#78716C'); vgr.addColorStop(1, '#57534E');
  ctx.fillStyle = vgr; ctx.fill();
  // Crater
  ctx.beginPath(); ctx.ellipse(cx, 55, 38, 14, 0, 0, Math.PI*2);
  ctx.fillStyle = '#292524'; ctx.fill();
  ctx.strokeStyle = '#78716C'; ctx.lineWidth = 2; ctx.stroke();
  // Magma glow in crater
  const mg = Math.sin(f * 0.05) * 0.3 + 0.6;
  const mgr = ctx.createRadialGradient(cx, 60, 2, cx, 60, 30);
  mgr.addColorStop(0, `rgba(251,146,60,${mg})`); mgr.addColorStop(1, 'rgba(239,68,68,0)');
  ctx.fillStyle = mgr; ctx.beginPath(); ctx.arc(cx, 60, 30, 0, Math.PI*2); ctx.fill();
  // Lava flows
  const lavaAlpha = 0.6 + Math.sin(f*0.03) * 0.2;
  const lavaPaths = [[-30,0,-60,80,-90,H*0.65-10],[20,0,50,60,80,H*0.65-10]];
  lavaPaths.forEach(p => {
    const lgr2 = ctx.createLinearGradient(cx+p[0], 55, cx+p[4], H*0.65);
    lgr2.addColorStop(0, `rgba(251,146,60,${lavaAlpha})`); lgr2.addColorStop(1, `rgba(239,68,68,${lavaAlpha*0.4})`);
    ctx.beginPath(); ctx.moveTo(cx+p[0], 55+p[1]); ctx.quadraticCurveTo(cx+p[2], 55+p[3], cx+p[4], H*0.65-10);
    ctx.lineWidth = 10 + Math.sin(f*0.05)*3; ctx.strokeStyle = lgr2; ctx.lineCap = 'round'; ctx.stroke();
  });
  // Ash/particle eruption
  if (!animVolcano._particles) animVolcano._particles = [];
  if (f % 6 === 0) animVolcano._particles.push({x:cx+Math.random()*40-20,y:55,vx:(Math.random()-0.5)*3,vy:-Math.random()*5-3,life:80,r:Math.random()*6+2,c:Math.random()>0.5?'#F97316':'#6B7280'});
  animVolcano._particles = animVolcano._particles.filter(p=>p.life>0);
  animVolcano._particles.forEach(p => {
    p.x+=p.vx; p.y+=p.vy; p.vy+=0.15; p.life--;
    ctx.fillStyle = p.c + Math.floor(p.life/80*255).toString(16).padStart(2,'0');
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
  });
  // Smoke puff
  const sp = (f * 0.5) % 60;
  ctx.fillStyle = `rgba(156,163,175,${0.25 - sp/60*0.2})`;
  ctx.beginPath(); ctx.arc(cx + Math.sin(f*0.02)*8, 55 - sp, 12 + sp*0.4, 0, Math.PI*2); ctx.fill();
  // Labels
  ctx.fillStyle = '#FDE68A'; ctx.font = 'bold 11px Inter'; ctx.textAlign = 'left';
  ctx.fillText('Magma Chamber ↑', cx + 50, H - 25);
  ctx.fillStyle = '#A78BFA'; ctx.font = 'bold 14px Space Grotesk'; ctx.textAlign = 'center';
  ctx.fillText('🌋 Volcano — Live Eruption View', W/2, H - 8);
}
animVolcano._particles = null;

// ── EARTH LAYERS ───────────────────────────────────────────────────
function buildEarth3D() {
  return canvasWrap(`<div class="vlab-desc" style="margin-top:10px">The Earth has 4 main layers: crust (thin outer shell), mantle (hot molten rock), outer core (liquid iron), and inner core (solid iron, ~5,000°C).</div>`,
    [{v:'6,371km',l:'radius'},{v:'5,000°C',l:'core temp'},{v:'4.6B yrs',l:'age'},{v:'7',l:'tectonic plates'}]);
}
function animEarth(ctx, W, H, f) {
  const cx = W/2, cy = H/2, R = 150;
  const rot = f * 0.008;
  // Inner core
  const icgr = ctx.createRadialGradient(cx-15, cy-15, 5, cx, cy, 35);
  icgr.addColorStop(0, '#FCD34D'); icgr.addColorStop(1, '#D97706');
  ctx.beginPath(); ctx.arc(cx, cy, 35, 0, Math.PI*2); ctx.fillStyle = icgr; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 9px Inter'; ctx.textAlign = 'center';
  ctx.fillText('Inner Core', cx, cy); ctx.fillText('(Solid)', cx, cy + 12);
  // Outer core
  const ocgr = ctx.createRadialGradient(cx-20, cy-20, 20, cx, cy, 72);
  ocgr.addColorStop(0, 'rgba(249,115,22,0.8)'); ocgr.addColorStop(1, 'rgba(234,88,12,0.6)');
  ctx.beginPath(); ctx.arc(cx, cy, 72, 0, Math.PI*2); ctx.fillStyle = ocgr; ctx.fill();
  ctx.strokeStyle = 'rgba(251,146,60,0.4)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '9px Inter'; ctx.textAlign = 'center';
  ctx.fillText('Outer Core (Liquid)', cx, cy - 58);
  // Mantle (animated convection)
  const mgr = ctx.createRadialGradient(cx-30, cy-30, 30, cx, cy, 120);
  mgr.addColorStop(0, 'rgba(239,68,68,0.6)'); mgr.addColorStop(1, 'rgba(185,28,28,0.4)');
  ctx.beginPath(); ctx.arc(cx, cy, 120, 0, Math.PI*2); ctx.fillStyle = mgr; ctx.fill();
  // Convection current animation
  for (let i = 0; i < 3; i++) {
    const a = i * Math.PI * 2/3 + rot * 2;
    const px = cx + Math.cos(a) * 96, py = cy + Math.sin(a) * 96;
    ctx.fillStyle = 'rgba(252,165,165,0.4)';
    ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI*2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '9px Inter'; ctx.textAlign = 'center';
  ctx.fillText('Mantle', cx - 105, cy + 5);
  // Crust (rotating texture)
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
  const crust_colors = ['#15803D','#0369A1','#166534','#0284C7','#4ADE80','#22D3EE'];
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI/3, a2 = a + Math.PI/3;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0, 0, 150, a, a2); ctx.closePath();
    ctx.fillStyle = crust_colors[i] + 'CC'; ctx.fill();
  }
  // Ocean effect
  ctx.beginPath(); ctx.arc(0, 0, 150, 0, Math.PI*2);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
  // Shadow for 3D effect
  const shadow = ctx.createRadialGradient(cx+80, cy+80, 10, cx+80, cy+80, 140);
  shadow.addColorStop(0, 'rgba(0,0,0,0.4)'); shadow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadow; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2); ctx.fill();
  // Light highlight
  const hl = ctx.createRadialGradient(cx-50, cy-50, 10, cx-50, cy-50, 90);
  hl.addColorStop(0, 'rgba(255,255,255,0.18)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = 'bold 10px Inter'; ctx.textAlign = 'center';
  ctx.fillText('Crust (thin outer layer)', cx, cy + R + 16);
  ctx.fillStyle = '#A78BFA'; ctx.font = 'bold 14px Space Grotesk'; ctx.textAlign = 'center';
  ctx.fillText('🌍 Earth Layers — Rotating 3D', W/2, H - 8);
}

function buildDefault(topic) {
  return `<div class="vlab-desc">3D visualization for ${topic.label} coming soon!</div>`;
}

// Chat visual detection (reuse same detection from old version)
function detectVisualFromText(text) {
  const t = text.toLowerCase();
  if(t.includes('heart')||t.includes('cardiac')) return {id:'heart',title:'Human Heart'};
  if(t.includes('brain')||t.includes('nervous')) return {id:'brain',title:'Human Brain'};
  if(t.includes('dna')||t.includes('gene')||t.includes('chrom')) return {id:'dna',title:'DNA Double Helix'};
  if(t.includes('atom')||t.includes('proton')||t.includes('electron')) return {id:'atom',title:'Atom Structure'};
  if(t.includes('cell')) return {id:'cell',title:'Plant Cell'};
  if(t.includes('solar')||t.includes('planet')) return {id:'solar',title:'Solar System'};
  if(t.includes('lung')||t.includes('breath')||t.includes('respiratory')) return {id:'lungs',title:'Lungs'};
  if(t.includes('eye')||t.includes('vision')||t.includes('retina')) return {id:'eye',title:'Human Eye'};
  if(t.includes('volcano')||t.includes('lava')||t.includes('magma')) return {id:'volcano',title:'Volcano'};
  if(t.includes('earth layer')||t.includes('crust')||t.includes('mantle')||t.includes('tectonic')) return {id:'earth',title:'Earth Layers'};
  return null;
}

function buildVisualCard(v) {
  const builders = {heart:buildHeart3D,brain:buildBrain3D,dna:buildDNA3D,atom:buildAtom3D,cell:buildCell3D,solar:buildSolar3D,lungs:buildLungs3D,eye:buildEye3D,volcano:buildVolcano3D,earth:buildEarth3D};
  const fn = builders[v.id];
  // For chat, show SVG fallback
  return `<div class="vis-card"><div class="vis-card-hd">🔬 ${v.title} — Go to Visual Lab for full 3D animation!</div><div class="vis-card-bd" style="font-size:13px;color:#A78BFA;padding:14px">Click <strong>Visual Lab</strong> in the sidebar → select <strong>${v.title}</strong> for the full 3D rotating animation! ✨</div></div>`;
}
