// ---------- persistence ----------
function loadState(){
  try{
    const raw = localStorage.getItem('bayanialert_state');
    return raw ? JSON.parse(raw) : null;
  }catch(e){ return null; }
}
function saveState(){
  try{ localStorage.setItem('bayanialert_state', JSON.stringify(state)); }catch(e){}
}
const POSITION_PERMS = {
  'Barangay Captain':      { announce:true,  evac:true,  rescue:false },
  'Kagawad':                { announce:true,  evac:true,  rescue:false },
  'SK Chairperson':         { announce:true,  evac:false, rescue:false },
  'Barangay Tanod':         { announce:false, evac:false, rescue:true  },
  'BDRRM Officer':          { announce:true,  evac:true,  rescue:true  },
  'Rescue/Response Team':   { announce:false, evac:false, rescue:true  },
};
function permsFor(position){ return POSITION_PERMS[position] || { announce:true, evac:true, rescue:false }; }

const defaultState = {
  profile: { role:'resident', name:'Ruzel G.', initials:'RG', household:'142', purok:'Purok 3', size:'4', address:'Blk 6, Purok 3', contact:'0917 xxx xx42',
             officialPersonName:'Mario Reyes', officialName:'Kagawad Mario Reyes', officialInitials:'MR', position:'Kagawad', officeContact:'0917 500 1042',
             permissions: permsFor('Kagawad') },
  myStatus: null, // 'safe' | 'help' | null
  extraResources: [],
  requests: [], // {item, owner, status:'pending'}
  messages: {}, // ownerName -> [{from:'me'|'them', text}]
  evacCenters: [
    {name:'San Isidro Elementary School', addr:'0.6 km away · Purok 2', distLabel:'0.6 km', cap:210, max:400,
     amenities:[{name:'Drinking water station', status:'Available'},{name:'First aid / medical', status:'Available'},{name:'Generator power', status:'Available'}]},
    {name:'Purok 4 Covered Court', addr:'1.2 km away · Purok 4', distLabel:'1.2 km', cap:90, max:150,
     amenities:[{name:'Drinking water station', status:'Available'},{name:'First aid / medical', status:'Limited'},{name:'Generator power', status:'Unavailable'}]},
  ],
  announcements: [], // {who, time, text, color}
  puroks: ['Purok 1','Purok 2','Purok 3','Purok 4'],
  pendingOfficials: [
    {id:'p1', name:'Ador Santos', position:'Barangay Tanod', purok:'Purok 4', status:'pending'},
    {id:'p2', name:'Liza Cruz', position:'SK Chairperson', purok:'Purok 2', status:'pending'},
  ],
  households: [
    'MD','TN','JR','AB','CP','LM','FS','GV','KP','RD','VN','ES','WQ','HY','ZL','OC'
  ].map((h,i)=>({ initials:h, id:140+i, status:(i===3||i===9) ? 'help' : 'safe' }))
};
let state = loadState() || JSON.parse(JSON.stringify(defaultState));
if(!state.profile.permissions) state.profile.permissions = permsFor(state.profile.position);
if(!state.households) state.households = JSON.parse(JSON.stringify(defaultState.households));
if(state.evacCenters){
  state.evacCenters.forEach((e,i)=>{
    if(!e.amenities){
      e.amenities = JSON.parse(JSON.stringify((defaultState.evacCenters[i] || defaultState.evacCenters[0]).amenities));
    }
  });
}


const resources = [
    {id:0, name:'Gasoline-powered generator', owner:'Mang Tonio · Purok 3', cat:'power', dist:'120m', desc:'2000W gasoline generator, good for a few lights, a fan, and charging phones during an outage. Bring your own extension cord if you need more reach.'},
    {id:1, name:'5-gallon drinking water', owner:'Aling Nena · Purok 1', cat:'water', dist:'240m', desc:'Sealed 5-gallon container, refilled weekly. Can lend the container or just fill yours — just return it clean.'},
    {id:2, name:'Extension cord & power strip', owner:'Kuya Jomar · Purok 3', cat:'power', dist:'300m', desc:'10-meter heavy-duty extension cord with a 4-outlet power strip. Good for sharing one generator across two households.'},
    {id:3, name:'First aid kit (family size)', owner:'Nurse Bel · Purok 2', cat:'firstaid', dist:'410m', desc:'Stocked kit with bandages, antiseptic, paracetamol, and a thermometer. Please let Nurse Bel know what you use so she can restock.'},
    {id:4, name:'Steel bolo & rope', owner:'Mang Tonio · Purok 3', cat:'tools', dist:'120m', desc:'Useful for clearing fallen branches or securing loose roofing before a storm. Handle with care and return promptly.'},
    {id:5, name:'Multicab for evacuation trips', owner:'Kap. Lira · Purok 1', cat:'transport', dist:'500m', desc:'Can help ferry elderly or families with small children to the evacuation center. Best to request a few hours before the storm peaks.'},
    {id:6, name:'Rechargeable flashlights (x3)', owner:'Aling Nena · Purok 1', cat:'power', dist:'240m', desc:'Three USB-rechargeable flashlights, fully charged. Good for a family during a brownout.'},
    {id:7, name:'Water container drums', owner:'Mang Ador · Purok 4', cat:'water', dist:'650m', desc:'Two empty 20-liter drums for stocking up on water before the storm arrives.'},
  ];
  const icons = {
    power:'<path d="M13 2 3 14h7l-1 8 11-14h-8z"/>',
    water:'<path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11Z"/>',
    tools:'<path d="M14 7l3 3-8 8-3.5.5.5-3.5 8-8Z"/><path d="M17 4l3 3"/>',
    firstaid:'<rect x="3" y="7" width="18" height="12" rx="2"/><path d="M12 10v6M9 13h6"/>',
    transport:'<rect x="3" y="10" width="18" height="7" rx="2"/><circle cx="7.5" cy="18.5" r="1.5"/><circle cx="16.5" cy="18.5" r="1.5"/>'
  };
  let currentResFilter = 'all';
  function allResources(){ return resources.concat(state.extraResources); }
  function renderResources(filter){
    currentResFilter = filter;
    const list = document.getElementById('resList');
    const q = (document.getElementById('resSearch')?.value || '').trim().toLowerCase();
    const items = allResources().filter(r => (filter==='all' || r.cat===filter) && (!q || r.name.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q)));
    if(items.length===0){
      list.innerHTML = '<p class="small muted" style="text-align:center; margin-top:18px;">No items match your search.</p>';
      return;
    }
    list.innerHTML = items.map(r => `
      <div class="card res-card" onclick="openResourceDetail(${r.id})" style="cursor:pointer;">
        <span class="res-ic cat-${r.cat}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${icons[r.cat]}</svg></span>
        <div class="res-body">
          <div class="name">${r.name}</div>
          <div class="owner">Shared by ${r.owner}</div>
          <div class="res-foot"><span class="dist">${r.dist} away</span><button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); requestItem(${r.id})">Request</button></div>
        </div>
      </div>`).join('');
  }
  document.getElementById('chipRow').addEventListener('click', e=>{
    const chip = e.target.closest('.chip');
    if(!chip) return;
    document.querySelectorAll('#chipRow .chip').forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');
    renderResources(chip.dataset.f);
  });
  renderResources('all');

  function requestItem(id){
    const r = allResources().find(x=>x.id===id);
    if(!r) return;
    const ownerName = r.owner.split(' · ')[0];
    if(!state.requests.some(rq=>rq.item===r.name && rq.owner===ownerName)){
      state.requests.unshift({item:r.name, owner:r.owner, status:'pending'});
      saveState();
    }
    showToast('Request sent to '+ownerName);
  }

  function openResourceDetail(id){
    const r = allResources().find(x=>x.id===id);
    if(!r) return;
    const ownerName = r.owner.split(' · ')[0];
    const ownerZone = r.owner.split(' · ')[1] || '';
    document.getElementById('detIcon').className = 'res-ic cat-' + r.cat;
    document.getElementById('detIcon').innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${icons[r.cat]}</svg>`;
    document.getElementById('detName').textContent = r.name;
    document.getElementById('detDist').textContent = r.dist + ' away · ' + ownerZone;
    document.getElementById('detDesc').textContent = r.desc;
    document.getElementById('detOwnerName').textContent = ownerName;
    document.getElementById('detOwnerAv').textContent = ownerName.split(' ').filter(Boolean).map(w=>w[0]).slice(0,2).join('').toUpperCase();
    document.getElementById('detRequestBtn').onclick = ()=>{ requestItem(id); go('board'); };
    document.getElementById('detMsgBtn').onclick = ()=> openThread(ownerName);
    go('resourceDetail');
  }

  // ---------- list a new resource ----------
  let listResourceCat = 'power';
  function pickListCat(el, cat){
    document.querySelectorAll('#listCatRow .chip').forEach(c=>c.classList.remove('active'));
    el.classList.add('active');
    listResourceCat = cat;
  }
  function submitListResource(){
    const nameInput = document.getElementById('listItemName');
    const name = nameInput.value.trim();
    const desc = document.getElementById('listItemDesc').value.trim();
    const loc = document.getElementById('listItemLoc').value.trim();
    if(!name){ flagInvalid(nameInput); showToast('Give your item a name first'); return; }
    const id = 1000 + state.extraResources.length;
    state.extraResources.push({
      id, name, owner: state.profile.name+' · '+state.profile.purok, cat: listResourceCat,
      dist:'You', desc: desc || 'No additional description.',
    });
    saveState();
    document.getElementById('listItemName').value = '';
    document.getElementById('listItemDesc').value = '';
    document.getElementById('listItemLoc').value = '';
    renderResources('all');
    showToast('Item listed on the resource board');
    go('board');
  }

  function renderEvacList(){
    const wrap = document.getElementById('evacListWrap');
    if(wrap){
      wrap.innerHTML = state.evacCenters.map((e,i)=>`
        <div class="card row between" onclick="openEvacDetail(${i})" style="cursor:pointer; ${i>0?'margin-top:10px;':''}">
          <div><div style="font-weight:600; font-size:14px;">${e.name}</div><div class="muted small" style="margin-top:3px;">${e.distLabel} · ${e.cap} / ${e.max} capacity</div></div>
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); showToast('Directions would open here')">Directions</button>
        </div>`).join('');
    }
    const guestWrap = document.getElementById('guestEvacListWrap');
    if(guestWrap){
      guestWrap.innerHTML = state.evacCenters.map((e,i)=>`
        <div class="card row between" style="${i>0?'margin-top:10px;':''}">
          <div><div style="font-weight:600; font-size:14px;">${e.name}</div><div class="muted small" style="margin-top:3px;">${e.distLabel} · ${e.cap} / ${e.max} capacity</div></div>
          <button class="btn btn-primary btn-sm" onclick="showToast('Directions would open here')">Directions</button>
        </div>`).join('');
    }
  }
  function refreshEvacViews(){
    renderEvacList();
    const capText = document.getElementById('capWidgetText');
    const capFill = document.getElementById('capWidgetFill');
    if(capText){
      const e0 = state.evacCenters[0];
      capText.textContent = e0.cap + ' / ' + e0.max;
      capFill.style.width = Math.round((e0.cap/e0.max)*100) + '%';
    }
    renderAdminEvacList();
  }
  const AMENITY_COLORS = { Available:'var(--safe)', Limited:'var(--accent)', Unavailable:'var(--danger)' };
  const AMENITY_CYCLE = ['Available','Limited','Unavailable'];
  function renderEvacAmenities(i){
    const e = state.evacCenters[i];
    const canEvac = !!(state.profile.permissions && state.profile.permissions.evac);
    const wrap = document.getElementById('evacAmenities');
    wrap.innerHTML = e.amenities.map((a,ai)=>`
      <div class="list-item"${canEvac?` onclick="cycleAmenity(${i},${ai})" style="cursor:pointer;"`:''}><span>${a.name}</span><span class="val" style="color:${AMENITY_COLORS[a.status]||''};">${a.status}</span></div>
    `).join('');
    document.getElementById('evacAmenitiesHint').style.display = canEvac ? '' : 'none';
  }
  function cycleAmenity(i, ai){
    const a = state.evacCenters[i].amenities[ai];
    a.status = AMENITY_CYCLE[(AMENITY_CYCLE.indexOf(a.status)+1) % AMENITY_CYCLE.length];
    saveState();
    renderEvacAmenities(i);
    showToast(a.name+': '+a.status);
  }
  function openEvacDetail(i){
    const e = state.evacCenters[i];
    if(!e) return;
    window._currentEvacIndex = i;
    document.getElementById('evacName').textContent = e.name;
    document.getElementById('evacAddr').textContent = e.addr;
    document.getElementById('evacCap').textContent = e.cap + ' / ' + e.max;
    document.getElementById('evacFill').style.width = Math.round((e.cap/e.max)*100) + '%';
    document.getElementById('evacEditCap').value = e.cap;
    document.getElementById('evacEditCap').max = e.max;
    const canEvac = !!(state.profile.permissions && state.profile.permissions.evac);
    document.getElementById('evacEditWrap').style.display = canEvac ? '' : 'none';
    document.getElementById('evacNoPermNote').style.display = canEvac ? 'none' : '';
    renderEvacAmenities(i);
    go('evacDetail');
  }
  function saveEvacCapacity(){
    const i = window._currentEvacIndex;
    const e = state.evacCenters[i];
    if(!e) return;
    let val = parseInt(document.getElementById('evacEditCap').value, 10);
    if(isNaN(val) || val<0) val = 0;
    if(val > e.max) val = e.max;
    e.cap = val;
    saveState();
    document.getElementById('evacCap').textContent = e.cap + ' / ' + e.max;
    document.getElementById('evacFill').style.width = Math.round((e.cap/e.max)*100) + '%';
    refreshEvacViews();
    showToast('Capacity updated');
  }

  function setReqTab(tab){
    document.getElementById('reqSent').classList.toggle('active', tab==='sent');
    document.getElementById('reqReceived').classList.toggle('active', tab==='received');
    document.getElementById('sentList').style.display = tab==='sent' ? 'block' : 'none';
    document.getElementById('receivedList').style.display = tab==='received' ? 'block' : 'none';
  }
  const baseSent = [
    {item:'Gasoline-powered generator', owner:'Mang Tonio · Purok 3', status:'pending'},
    {item:'First aid kit (family size)', owner:'Nurse Bel · Purok 2', status:'accepted'},
    {item:'Multicab for evacuation trips', owner:'Kap. Lira · Purok 1', status:'declined'},
  ];
  function statusTag(s){
    if(s==='accepted') return '<span class="tag tag-accepted">Accepted</span>';
    if(s==='declined') return '<span class="tag tag-declined">Declined</span>';
    return '<span class="tag tag-pending">Pending</span>';
  }
  function respondReceived(cardId, action){
    const card = document.getElementById(cardId);
    if(!card) return;
    const btns = card.querySelector('.row');
    btns.innerHTML = action==='accept' ? '<span class="tag tag-accepted">Accepted</span>' : '<span class="tag tag-declined">Declined</span>';
    showToast(action==='accept' ? 'Request accepted' : 'Request declined');
  }
  function renderSentRequests(){
    const list = document.getElementById('sentList');
    const q = (document.getElementById('reqSearch')?.value || '').trim().toLowerCase();
    const items = state.requests.concat(baseSent).filter(r=> !q || r.item.toLowerCase().includes(q) || r.owner.toLowerCase().includes(q));
    list.innerHTML = items.length ? items.map(r=>`
      <div class="req-card"><div><div class="name">${r.item}</div><div class="meta">From ${r.owner}</div></div>${statusTag(r.status)}</div>
    `).join('') : '<p class="small muted" style="text-align:center; padding:14px 0;">No requests match your search.</p>';
  }

  const stat_colors = { safe:'var(--grad-safe)', help:'var(--grad-danger)', none:'var(--ink-soft)' };
  let currentHouseFilter = 'all';
  function renderHouses(filter){
    if(filter) currentHouseFilter = filter;
    const grid = document.getElementById('houseGrid');
    const canRescue = !!(state.profile.permissions && state.profile.permissions.rescue);
    const note = document.getElementById('checkinNote');
    if(note) note.textContent = canRescue
      ? 'You can tap a household to update its status directly — for rescue/response duty.'
      : 'Kagawad Reyes can see this board live to know who may need assistance.';
    const items = state.households.map((h,i)=>({...h, idx:i})).filter(h=> currentHouseFilter==='all' || h.status===currentHouseFilter);
    if(items.length===0){
      grid.innerHTML = '<p class="small muted" style="grid-column:1/-1; text-align:center; padding:10px 0;">No households match this filter.</p>';
      return;
    }
    grid.innerHTML = items.map(h=>{
      const bg = stat_colors[h.status] || stat_colors.safe;
      const action = canRescue ? `updateHouseholdStatus(${h.idx})` : `viewHouseholdStatus(${h.idx})`;
      return `<div class="house" onclick="${action}" style="cursor:pointer;"><div class="dot" style="background:${bg}">${h.initials}</div><div class="nm">Hh. ${h.id}</div></div>`;
    }).join('');
  }
  document.getElementById('houseChipRow').addEventListener('click', e=>{
    const chip = e.target.closest('.chip');
    if(!chip) return;
    document.querySelectorAll('#houseChipRow .chip').forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');
    renderHouses(chip.dataset.hf);
  });
  function viewHouseholdStatus(i){
    const h = state.households[i];
    const label = h.status==='help' ? 'needs help' : h.status==='safe' ? 'checked in safe' : 'has not responded';
    showToast('Hh. '+h.id+' — '+label);
  }
  function updateHouseholdStatus(i){
    const h = state.households[i];
    const cur = h.status;
    const input = (prompt('Set status for Hh. '+h.id+' — type "safe", "help", or "none"', cur) || '').trim().toLowerCase();
    if(!['safe','help','none'].includes(input)) return;
    h.status = input;
    saveState();
    renderHouses();
    showToast('Hh. '+h.id+' marked '+(input==='none' ? 'no response' : input));
  }
  renderHouses();

  function refreshMeCard(){
    const st = document.getElementById('meStatus');
    if(!st) return;
    if(state.myStatus==='safe'){ st.textContent = 'Marked safe'; st.style.color='var(--safe)'; }
    else if(state.myStatus==='help'){ st.textContent = 'Help requested'; st.style.color='var(--danger)'; }
    else { st.textContent = "Not checked in for tonight's advisory"; st.style.color=''; }
  }
  function setStatus(s){
    state.myStatus = s;
    saveState();
    refreshMeCard();
    if(s==='safe'){ showToast("Thanks — you're marked safe"); }
    else { showToast('Kagawad Reyes has been notified'); }
  }

  function setRole(role){
    document.getElementById('roleResident').classList.toggle('active', role==='resident');
    document.getElementById('roleOfficial').classList.toggle('active', role==='official');
    document.getElementById('composeWrap').style.display = (role==='official' && state.profile.permissions.announce) ? 'block' : 'none';
  }

  // ---------- messaging ----------
  const stockReplies = ["Sure, what time works for you?", "Still available — let's meet at the chapel.", "Noted, I'll set it aside for you.", "Yes, just knock when you arrive."];
  function openThread(ownerName){
    if(!state.messages[ownerName]) state.messages[ownerName] = [];
    document.getElementById('threadName').textContent = ownerName;
    renderThread(ownerName);
    go('thread');
    window._activeThread = ownerName;
  }
  function renderThread(ownerName){
    const wrap = document.getElementById('threadBody');
    const msgs = state.messages[ownerName] || [];
    if(msgs.length===0){
      wrap.innerHTML = `<div class="muted small" style="text-align:center; margin-top:24px;">Say hello to ${ownerName} about this item.</div>`;
    } else {
      wrap.innerHTML = msgs.map(m=>`<div class="bubble ${m.from==='me'?'me':'them'}">${m.text}</div>`).join('');
    }
    wrap.scrollTop = wrap.scrollHeight;
  }
  function sendThreadMsg(){
    const input = document.getElementById('threadInput');
    const text = input.value.trim();
    const ownerName = window._activeThread;
    if(!text || !ownerName) return;
    state.messages[ownerName].push({from:'me', text});
    saveState();
    input.value = '';
    renderThread(ownerName);
    setTimeout(()=>{
      const reply = stockReplies[Math.floor(Math.random()*stockReplies.length)];
      state.messages[ownerName].push({from:'them', text:reply});
      saveState();
      renderThread(ownerName);
    }, 700);
  }

  // ---------- profile / register / login ----------
  // ---------- announcements ----------
  const baseAnnouncements = [
    {who:'Kagawad Reyes', time:'25 min ago', text:'Evacuation center at San Isidro Elementary is now open. Bring your family ID and essentials.', color:'danger'},
    {who:'Brgy. Captain Lira', time:'2 hr ago', text:'Free rubber boots and candles available at the covered court while supplies last.', color:'accent'},
    {who:'Kagawad Reyes', time:'Yesterday', text:'Please clear drainage canals near your homes before Friday. Bagyo is expected to strengthen over the weekend.', color:'safe'},
  ];
  function allAnnouncements(){ return state.announcements.map((a,i)=>({...a, idx:i})).concat(baseAnnouncements.map(a=>({...a, idx:-1}))); }
  function renderAnnouncements(){
    const feed = document.getElementById('annFeed');
    if(feed){
      const q = (document.getElementById('annSearch')?.value || '').trim().toLowerCase();
      const items = allAnnouncements().filter(a=> !q || a.text.toLowerCase().includes(q) || a.who.toLowerCase().includes(q));
      feed.innerHTML = items.length ? items.map(a=>`
        <div class="post"><div class="post-head"><span class="who">${a.who}</span><span class="time">${a.time}</span>${a.idx>-1?`<span class="role-swap" data-role="official" style="margin-left:auto;"><button class="btn btn-ghost btn-sm" style="color:var(--danger); padding:4px 8px;" onclick="deleteAnnouncement(${a.idx})">Delete</button></span>`:''}</div><p>${a.text}</p></div>
      `).join('') : '<p class="small muted" style="text-align:center; padding:14px 0;">No announcements match your search.</p>';
    }
    const prevRes = document.getElementById('annPreviewResident');
    if(prevRes){
      prevRes.innerHTML = allAnnouncements().slice(0,3).map(a=>`
        <div class="ann-preview"><span class="ann-dot" style="background:var(--${a.color});"></span><div><div class="t">${a.text}</div><div class="time">${a.who} · ${a.time}</div></div></div>
      `).join('');
    }
    const prevOff = document.getElementById('annPreviewOfficial');
    if(prevOff){
      const mine = state.announcements.length ? state.announcements : baseAnnouncements.slice(0,2);
      prevOff.innerHTML = mine.slice(0,3).map(a=>`
        <div class="ann-preview"><span class="ann-dot" style="background:var(--${a.color});"></span><div><div class="t">${a.text}</div><div class="time">Posted ${a.time}</div></div></div>
      `).join('');
    }
  }
  function deleteAnnouncement(idx){
    if(!confirm('Delete this announcement?')) return;
    state.announcements.splice(idx,1);
    saveState();
    renderAnnouncements();
    showToast('Announcement removed');
  }
  function postAnnouncement(){
    const input = document.getElementById('announceInput');
    const text = input.value.trim();
    if(!text){ showToast('Write something to post first'); return; }
    state.announcements.unshift({ who: state.profile.officialName, time:'Just now', text, color:'accent' });
    saveState();
    input.value = '';
    renderAnnouncements();
    showToast('Announcement posted');
  }

  // ---------- admin dashboard ----------
  function renderPendingOfficials(){
    const wrap = document.getElementById('adminPendingList');
    if(!wrap) return;
    const pending = state.pendingOfficials.filter(p=>p.status==='pending');
    if(pending.length===0){
      wrap.innerHTML = '<p class="small muted">No pending accounts — all caught up.</p>';
      return;
    }
    wrap.innerHTML = pending.map(p=>`
      <div class="req-card">
        <div><div class="name">${p.name}</div><div class="meta">${p.position} · ${p.purok}</div></div>
        <div class="row" style="gap:6px;">
          <button class="btn btn-safe btn-sm" onclick="respondPendingOfficial('${p.id}','approved')">Approve</button>
          <button class="btn btn-ghost btn-sm" onclick="respondPendingOfficial('${p.id}','rejected')">Reject</button>
        </div>
      </div>`).join('');
  }
  function respondPendingOfficial(id, status){
    const p = state.pendingOfficials.find(x=>x.id===id);
    if(!p) return;
    if(status==='rejected' && !confirm('Reject '+p.name+"'s application?")) return;
    p.status = status;
    saveState();
    renderPendingOfficials();
    showToast(status==='approved' ? p.name+' approved as official' : p.name+' rejected');
  }

  function renderPurokList(){
    const wrap = document.getElementById('adminPurokList');
    if(wrap){
      wrap.innerHTML = state.puroks.map((p,i)=>`
        <div class="list-item"><span>${p}</span><span class="val" style="cursor:pointer; color:var(--danger);" onclick="removePurok(${i})">Remove</span></div>
      `).join('');
    }
    const regSel = document.getElementById('regPurokSelect');
    if(regSel){
      const cur = regSel.value;
      regSel.innerHTML = state.puroks.map(p=>`<option${p===cur?' selected':''}>${p}</option>`).join('');
    }
    const zoneSel = document.getElementById('regZoneSelect');
    if(zoneSel){
      const cur = zoneSel.value;
      zoneSel.innerHTML = '<option>All puroks</option>' + state.puroks.map(p=>`<option${p===cur?' selected':''}>${p}</option>`).join('');
    }
  }
  function addPurok(){
    const input = document.getElementById('adminNewPurok');
    const name = input.value.trim();
    if(!name){ flagInvalid(input); showToast('Enter a purok name first'); return; }
    if(state.puroks.includes(name)){ flagInvalid(input); showToast('That purok already exists'); return; }
    state.puroks.push(name);
    saveState();
    input.value = '';
    renderPurokList();
    showToast(name+' added');
  }
  function removePurok(i){
    const name = state.puroks[i];
    if(!confirm('Remove '+name+'? This cannot be undone.')) return;
    state.puroks.splice(i,1);
    saveState();
    renderPurokList();
    showToast(name+' removed');
  }

  function renderAdminEvacList(){
    const wrap = document.getElementById('adminEvacList');
    if(!wrap) return;
    wrap.innerHTML = state.evacCenters.map((e,i)=>`
      <div class="req-card">
        <div><div class="name">${e.name}</div><div class="meta">${e.distLabel} · ${e.cap} / ${e.max}</div></div>
        <div class="row" style="gap:6px;">
          <button class="btn btn-ghost btn-sm" onclick="editEvacCenter(${i})">Edit</button>
          <button class="btn btn-ghost btn-sm" style="color:var(--danger);" onclick="removeEvacCenter(${i})">Remove</button>
        </div>
      </div>`).join('');
  }
  function editEvacCenter(i){
    const e = state.evacCenters[i];
    if(!e) return;
    const newMax = parseInt(prompt('Maximum capacity for '+e.name, e.max), 10);
    if(isNaN(newMax) || newMax<=0){ showToast('Enter a valid number'); return; }
    e.max = newMax;
    if(e.cap > e.max) e.cap = e.max;
    saveState();
    refreshEvacViews();
    showToast(e.name+' updated');
  }
  function removeEvacCenter(i){
    const e = state.evacCenters[i];
    if(!e) return;
    if(state.evacCenters.length<=1){ showToast('At least one evacuation center is required'); return; }
    if(!confirm('Remove '+e.name+' from the master list?')) return;
    state.evacCenters.splice(i,1);
    saveState();
    refreshEvacViews();
    showToast(e.name+' removed');
  }
  function addEvacCenter(){
    const nameInput = document.getElementById('adminEvacName');
    const maxInput = document.getElementById('adminEvacMax');
    const name = nameInput.value.trim();
    const zone = document.getElementById('adminEvacZone').value.trim();
    const dist = document.getElementById('adminEvacDist').value.trim();
    const max = parseInt(maxInput.value, 10);
    if(!name){ flagInvalid(nameInput); showToast('Give the center a name'); return; }
    if(!max){ flagInvalid(maxInput); showToast('Enter a maximum capacity'); return; }
    state.evacCenters.push({ name, addr:(dist||'—')+' away · '+(zone||'Barangay'), distLabel: dist || '—', cap:0, max,
      amenities:[{name:'Drinking water station', status:'Available'},{name:'First aid / medical', status:'Available'},{name:'Generator power', status:'Available'}] });
    saveState();
    document.getElementById('adminEvacName').value = '';
    document.getElementById('adminEvacZone').value = '';
    document.getElementById('adminEvacDist').value = '';
    document.getElementById('adminEvacMax').value = '';
    refreshEvacViews();
    showToast('Evacuation center added');
  }

  function openEditProfile(){
    document.getElementById('editName').value = state.profile.name;
    document.getElementById('editSize').value = state.profile.size;
    document.getElementById('editAddress').value = state.profile.address;
    document.getElementById('editContact').value = state.profile.contact;
    go('editProfile');
  }
  function saveEditProfile(){
    const name = document.getElementById('editName').value.trim();
    if(name){
      state.profile.name = name;
      state.profile.initials = name.split(' ').filter(Boolean).map(w=>w[0]).slice(0,2).join('').toUpperCase();
    }
    state.profile.size = document.getElementById('editSize').value.trim() || state.profile.size;
    state.profile.address = document.getElementById('editAddress').value.trim() || state.profile.address;
    state.profile.contact = document.getElementById('editContact').value.trim() || state.profile.contact;
    saveState();
    refreshProfileUI();
    showToast('Household info updated');
    go('profile');
  }

  function applyOfficialPermissions(){
    const p = state.profile.permissions;
    document.getElementById('settingsManageAnnounce') && (document.getElementById('settingsManageAnnounce').style.display = p.announce ? '' : 'none');
    document.getElementById('settingsManageEvac') && (document.getElementById('settingsManageEvac').style.display = p.evac ? '' : 'none');
    const compose = document.getElementById('composeWrap');
    if(compose) compose.style.display = (document.getElementById('roleOfficial')?.classList.contains('active') && p.announce) ? 'block' : 'none';
    renderHouses();
  }
  function refreshOfficialUI(){
    const p = state.profile;
    document.getElementById('sideAvOfficial') && (document.getElementById('sideAvOfficial').textContent = p.officialInitials);
    document.getElementById('sideNameOfficial') && (document.getElementById('sideNameOfficial').textContent = p.officialName);
    document.getElementById('sideHhOfficial') && (document.getElementById('sideHhOfficial').textContent = p.purok+' official');
    document.getElementById('topAvOfficial') && (document.getElementById('topAvOfficial').textContent = p.officialInitials);
    document.getElementById('profAvatarOfficial') && (document.getElementById('profAvatarOfficial').textContent = p.officialInitials);
    document.getElementById('profNameOfficial') && (document.getElementById('profNameOfficial').textContent = p.officialName);
    document.getElementById('profSubOfficial') && (document.getElementById('profSubOfficial').textContent = p.position+' · '+p.purok);
    document.getElementById('profPositionOfficial') && (document.getElementById('profPositionOfficial').textContent = p.position);
    document.getElementById('profZoneOfficial') && (document.getElementById('profZoneOfficial').textContent = p.purok);
    document.getElementById('profContactOfficial') && (document.getElementById('profContactOfficial').textContent = p.officeContact);
    const perms = [];
    if(p.permissions.announce) perms.push('Announcements');
    if(p.permissions.evac) perms.push('Evacuation centers');
    if(p.permissions.rescue) perms.push('Rescue check-in updates');
    document.getElementById('profPermsOfficial') && (document.getElementById('profPermsOfficial').textContent = perms.length ? perms.join(', ') : 'View only');
    applyOfficialPermissions();
  }

  function filterDirectory(){
    const q = (document.getElementById('dirSearch').value || '').trim().toLowerCase();
    document.querySelectorAll('#screen-directory .dir-item').forEach(item=>{
      const text = item.textContent.toLowerCase();
      item.style.display = (!q || text.includes(q)) ? '' : 'none';
    });
    document.querySelectorAll('#screen-directory .card').forEach(card=>{
      const anyVisible = Array.from(card.querySelectorAll('.dir-item')).some(i=>i.style.display!=='none');
      const label = card.previousElementSibling;
      if(label && label.classList.contains('section-label')) label.style.display = anyVisible ? '' : 'none';
      card.style.display = anyVisible ? '' : 'none';
    });
  }

  function flagInvalid(el){
    if(!el) return;
    el.classList.remove('field-error');
    void el.offsetWidth;
    el.classList.add('field-error');
    el.focus();
  }

  function confirmLogout(){
    if(confirm('Log out of BayaniAlert?')) go('welcome');
  }

  function togglePassword(){
    const input = document.getElementById('loginPassword');
    const btn = document.getElementById('pwToggleBtn');
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    btn.textContent = showing ? 'Show' : 'Hide';
  }

  const THEME_CYCLE = ['system','light','dark'];
  const THEME_LABEL = { system:'System', light:'Light', dark:'Dark' };
  function applyTheme(){
    const t = state.theme || 'system';
    if(t==='system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
    const val = document.getElementById('themeVal');
    if(val) val.textContent = THEME_LABEL[t];
  }
  function cycleTheme(){
    const cur = state.theme || 'system';
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(cur)+1) % THEME_CYCLE.length];
    state.theme = next;
    saveState();
    applyTheme();
    showToast('Appearance: '+THEME_LABEL[next]);
  }

  function refreshProfileUI(){
    const p = state.profile;
    document.querySelectorAll('[data-role="resident"] .av, [data-role="resident"].av').forEach(()=>{});
    document.getElementById('sideAvResident') && (document.getElementById('sideAvResident').textContent = p.initials);
    document.getElementById('sideNameResident') && (document.getElementById('sideNameResident').textContent = p.name);
    document.getElementById('sideHhResident') && (document.getElementById('sideHhResident').textContent = 'Household #'+p.household);
    document.getElementById('topAvResident') && (document.getElementById('topAvResident').textContent = p.initials);
    document.getElementById('meAvatar') && (document.getElementById('meAvatar').textContent = p.initials);
    document.getElementById('meName') && (document.getElementById('meName').textContent = p.name+' — Household #'+p.household);
    document.getElementById('profAvatarResident') && (document.getElementById('profAvatarResident').textContent = p.initials);
    document.getElementById('profNameResident') && (document.getElementById('profNameResident').textContent = p.name);
    document.getElementById('profSubResident') && (document.getElementById('profSubResident').textContent = 'Household #'+p.household+' · '+p.purok);
    document.getElementById('profSize') && (document.getElementById('profSize').textContent = p.size);
    document.getElementById('profContact') && (document.getElementById('profContact').textContent = p.contact);
    document.getElementById('profAddress') && (document.getElementById('profAddress').textContent = p.address);
    refreshMeCard();
  }

  let toastTimer;
  function showToast(msg){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> t.classList.remove('show'), 2200);
  }

  const publicScreens = ['welcome','login','register'];
  const adminScreens = ['adminApprovals','adminPuroks','adminEvac'];
  const tabMap = { home:'home', board:'board', resourceDetail:'board', listResource:'board', myRequests:'board', thread:'board', map:'map', evacDetail:'map', checkin:'checkin', announcements:'announcements', weatherHistory:'home', profile:'profile', directory:'profile' };
  function go(id){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    document.getElementById('screen-'+id).classList.add('active');
    if(id==='myRequests') renderSentRequests();
    if(id==='checkin'){ refreshMeCard(); renderHouses(); }
    if(id==='announcements' || id==='home') renderAnnouncements();
    if(id==='adminApprovals') renderPendingOfficials();
    if(id==='adminPuroks') renderPurokList();
    if(id==='adminEvac') renderAdminEvacList();
    const isPublic = publicScreens.includes(id);
    const isAdmin = adminScreens.includes(id);
    document.body.classList.toggle('authed', !isPublic);
    if(id === 'welcome'){
      document.body.classList.remove('role-official');
      loginRole = 'resident'; registerRole = 'resident';
      setAuthRole('login','resident'); setAuthRole('register','resident');
    }
    document.getElementById('sidebar').style.display = (!isPublic && !isAdmin) ? '' : 'none';
    document.getElementById('adminSidebar').style.display = isAdmin ? '' : 'none';
    document.getElementById('tabbar').style.display = (!isPublic && !isAdmin) ? 'flex' : 'none';
    document.getElementById('adminTabbar').style.display = isAdmin ? 'flex' : 'none';
    const activeTab = isAdmin ? id : (tabMap[id] || id);
    document.querySelectorAll('.tab').forEach(t=> t.classList.toggle('active', t.dataset.tab===activeTab));
    document.querySelectorAll('.side-link').forEach(t=> t.classList.toggle('active', t.dataset.tab===activeTab));
    document.getElementById('app').scrollTop = 0;
    window.scrollTo(0,0);
  }

  let loginRole = 'resident';
  let registerRole = 'resident';

  function setAuthRole(page, role){
    if(page === 'login'){
      loginRole = role;
      document.getElementById('loginRoleResident').classList.toggle('active', role==='resident');
      document.getElementById('loginRoleOfficial').classList.toggle('active', role==='official');
      document.getElementById('loginRoleAdmin').classList.toggle('active', role==='admin');
      document.getElementById('loginIdLabel').textContent = role==='resident' ? 'Household number or mobile' : role==='official' ? 'Official ID or mobile' : 'Admin username';
      document.getElementById('loginIdInput').placeholder = role==='resident' ? 'e.g. 0917 123 4567' : role==='official' ? 'e.g. BRGY-2024-0113' : 'e.g. admin.sanisidro';
      document.getElementById('loginPositionField').style.display = role==='official' ? '' : 'none';
      document.getElementById('loginPositionNote').style.display = role==='official' ? '' : 'none';
    } else {
      registerRole = role;
      document.getElementById('registerRoleResident').classList.toggle('active', role==='resident');
      document.getElementById('registerRoleOfficial').classList.toggle('active', role==='official');
      document.getElementById('registerResidentFields').style.display = role==='resident' ? 'grid' : 'none';
      document.getElementById('registerOfficialFields').style.display = role==='official' ? 'grid' : 'none';
      document.getElementById('registerTitle').textContent = role==='resident' ? 'Create your household account' : 'Register as a barangay official';
      document.getElementById('registerSub').textContent = role==='resident'
        ? "One account per household — you'll use it for check-ins and the resource board."
        : 'For barangay officials who post announcements and manage evacuation capacity.';
    }
  }

  function loginSubmit(){
    document.body.classList.toggle('role-official', loginRole==='official');
    if(loginRole === 'official'){
      const position = document.getElementById('loginPositionSelect').value;
      state.profile.position = position;
      state.profile.officialName = position+' '+state.profile.officialPersonName;
      state.profile.officialInitials = state.profile.officialPersonName.split(' ').filter(Boolean).map(w=>w[0]).slice(0,2).join('').toUpperCase();
      state.profile.permissions = permsFor(position);
      saveState();
      go('announcements'); setRole('official'); refreshOfficialUI();
      showToast('Logged in as '+position);
    }
    else if(loginRole === 'admin'){ go('adminApprovals'); showToast('Logged in as system administrator'); }
    else { go('home'); }
  }

  renderSentRequests();
  refreshProfileUI();
  refreshOfficialUI();
  renderAnnouncements();
  refreshEvacViews();
  renderPurokList();
  renderPendingOfficials();
  applyTheme();

  function registerSubmit(){
    document.body.classList.toggle('role-official', registerRole==='official');
    if(registerRole === 'resident'){
      const fields = document.querySelectorAll('#registerResidentFields input, #registerResidentFields select');
      const [nameEl, mobileEl, purokEl, sizeEl, addrEl, contactEl] = fields;
      const name = (nameEl.value || '').trim();
      if(!name){ flagInvalid(nameEl); showToast('Full name is required'); return; }
      state.profile.name = name;
      state.profile.initials = name.split(' ').filter(Boolean).map(w=>w[0]).slice(0,2).join('').toUpperCase();
      state.profile.purok = purokEl.value || state.profile.purok;
      state.profile.size = sizeEl.value || state.profile.size;
      state.profile.address = (addrEl.value || '').trim() || state.profile.address;
      state.profile.contact = (contactEl.value || '').trim() || state.profile.contact;
      saveState();
      refreshProfileUI();
      showToast('Household account created');
      go('home');
    } else {
      const name = (document.getElementById('regOfficialName').value || '').trim();
      if(!name){ flagInvalid(document.getElementById('regOfficialName')); showToast('Full name is required'); return; }
      const position = document.getElementById('regPositionSelect').value;
      const zone = document.getElementById('regZoneSelect').value;
      const officeContact = (document.getElementById('regOfficeContact').value || '').trim();
      state.profile.officialPersonName = name;
      state.profile.position = position;
      state.profile.officialName = position+' '+state.profile.officialPersonName;
      state.profile.officialInitials = state.profile.officialPersonName.split(' ').filter(Boolean).map(w=>w[0]).slice(0,2).join('').toUpperCase();
      state.profile.purok = zone==='All puroks' ? state.profile.purok : zone;
      state.profile.officeContact = officeContact || state.profile.officeContact;
      state.profile.permissions = permsFor(position);
      saveState();
      go('announcements'); setRole('official'); refreshOfficialUI();
      showToast(position+' account created');
    }
  }
