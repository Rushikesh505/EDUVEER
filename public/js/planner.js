let planItems = JSON.parse(localStorage.getItem('sparkPlanner') || '[]');
let planPriority = 'high';
let planFilter = 'all';

function savePlan() { localStorage.setItem('sparkPlanner', JSON.stringify(planItems)); }

function setPriority(btn) {
  document.querySelectorAll('.pri-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  planPriority = btn.dataset.p;
}

function addPlanItem() {
  const sub = document.getElementById('planSub').value;
  const topic = document.getElementById('planTopic').value.trim();
  const date = document.getElementById('planDate').value;
  const dur = document.getElementById('planDur').value;
  const note = document.getElementById('planNote').value.trim();
  if (!topic) { alert('Please enter a topic!'); return; }
  if (!date) { alert('Please select a date!'); return; }
  const item = { id: Date.now(), sub, topic, date, dur: parseInt(dur), note, priority: planPriority, done: false };
  planItems.push(item); savePlan();
  document.getElementById('planTopic').value = '';
  document.getElementById('planNote').value = '';
  renderPlanList(); renderWeekOverview();
  showXPPop(5);
}

function deletePlanItem(id) {
  planItems = planItems.filter(i => i.id !== id); savePlan(); renderPlanList(); renderWeekOverview();
}

function togglePlanDone(id) {
  const item = planItems.find(i => i.id === id);
  if (item) { item.done = !item.done; savePlan(); renderPlanList(); }
}

function filterPlan(btn, filter) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active'); planFilter = filter; renderPlanList();
}

function renderPlanList() {
  const list = document.getElementById('planList');
  const today = new Date().toISOString().split('T')[0];
  let items = [...planItems].sort((a, b) => a.date.localeCompare(b.date));
  if (planFilter === 'today') items = items.filter(i => i.date === today);
  else if (planFilter === 'upcoming') items = items.filter(i => i.date >= today && !i.done);
  else if (planFilter === 'done') items = items.filter(i => i.done);

  if (items.length === 0) {
    list.innerHTML = `<div class="empty-plan"><div class="empty-plan-ic">📅</div><p>${planFilter === 'done' ? 'No completed sessions yet!' : 'No study sessions planned yet.'}</p><p style="font-size:12px;margin-top:6px">Add one using the form on the left!</p></div>`;
    return;
  }

  const subColors = { Science:'#3B82F6', Mathematics:'#A855F7', 'Social Studies':'#10B981', English:'#F59E0B', Hindi:'#EF4444' };
  list.innerHTML = items.map(item => {
    const isToday = item.date === today;
    const isPast = item.date < today && !item.done;
    const dateLabel = isToday ? '📅 Today' : formatDate(item.date);
    const subColor = subColors[item.sub] || '#6B7280';
    const priClass = `pri-dot-${item.priority}`;
    return `<div class="plan-item${item.done ? ' done-item' : ''}">
      <div class="plan-check${item.done ? ' checked' : ''}" onclick="togglePlanDone(${item.id})">${item.done ? '✓' : ''}</div>
      <div class="plan-item-info">
        <div class="plan-item-top">
          <span class="plan-item-sub" style="background:${subColor}22;color:${subColor};border:1px solid ${subColor}44;border-radius:20px;padding:2px 8px;font-size:10px;font-weight:700">${item.sub}</span>
          <span class="tag-badge ${priClass}" style="font-size:9px;padding:2px 7px">${item.priority.toUpperCase()}</span>
        </div>
        <div class="plan-item-topic${item.done ? '' : ''}" style="${item.done ? 'text-decoration:line-through;opacity:.6' : ''}">${item.topic}</div>
        <div class="plan-item-meta">${dateLabel}${isPast ? ' ⚠️ Past due' : ''} · ${item.dur} min</div>
        ${item.note ? `<div class="plan-item-note">"${item.note}"</div>` : ''}
      </div>
      <div class="plan-item-right">
        <span class="plan-dur">${item.dur}m</span>
        <button class="plan-delete" onclick="deletePlanItem(${item.id})">🗑️</button>
      </div>
    </div>`;
  }).join('');
}

function renderWeekOverview() {
  const wo = document.getElementById('weekOverview');
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today = new Date();
  const rows = days.map((d, i) => {
    const dt = new Date(today); dt.setDate(today.getDate() - today.getDay() + i);
    const ds = dt.toISOString().split('T')[0];
    const count = planItems.filter(p => p.date === ds).length;
    const maxW = count > 0 ? Math.min(100, count * 33) : 0;
    return `<div class="wo-day">
      <div class="wo-day-label">${d}</div>
      <div class="wo-day-bar-bg"><div class="wo-day-bar" style="width:${maxW}%"></div></div>
      <div class="wo-day-count">${count || ''}</div>
    </div>`;
  });
  wo.innerHTML = rows.join('');
}

function formatDate(ds) {
  const d = new Date(ds + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' });
}

function initPlanner() {
  // Set today as default date
  document.getElementById('planDate').value = new Date().toISOString().split('T')[0];
  renderPlanList(); renderWeekOverview();
}
