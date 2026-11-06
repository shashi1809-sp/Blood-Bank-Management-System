document.addEventListener("DOMContentLoaded",()=>{
 let stock=[];const grid=document.getElementById("stockGroupGrid"),tbody=document.getElementById("stockTableBody"),search=document.getElementById("stockSearch");
 const maxUnits=()=>Math.max(1,...stock.map(s=>Number(s.units_available)||0));
 function status(units){return units<=5?["Critical","critical"]:units<=8?["Low stock","low"]:["Available","good"]}
 function render(){
  const total=stock.reduce((n,s)=>n+(Number(s.units_available)||0),0);document.getElementById("stockTotal").innerHTML=`${total} <small>units</small>`;
  const max=maxUnits();
  grid.innerHTML=stock.map(s=>{const pct=Math.round((Number(s.units_available)||0)/max*100),st=status(Number(s.units_available)||0);return `<article class="blood-group-card"><div class="group-card-top"><span class="blood-chip">${window.escapeHTML(s.blood_group)}</span><small>${pct}% of top group</small></div><h3>${Number(s.units_available)||0}</h3><p>units available</p><div class="mini-bar"><span style="width:${pct}%"></span></div><div style="margin-top:9px"><span class="stock-status ${st[1]}">${st[0]}</span></div></article>`}).join("");
  renderTable();
 }
 function renderTable(){const q=(search?.value||"").toLowerCase().trim(),max=maxUnits(),filtered=stock.filter(s=>String(s.blood_group).toLowerCase().includes(q));
  tbody.innerHTML=filtered.map(s=>{const u=Number(s.units_available)||0,p=Math.round(u/max*100),st=status(u);return `<tr><td><span class="blood-chip">${window.escapeHTML(s.blood_group)}</span></td><td><strong>${u}</strong> units</td><td><div class="bar-track" style="width:130px"><div class="bar-fill" style="width:${p}%"></div></div></td><td><span class="stock-status ${st[1]}">${st[0]}</span></td></tr>`}).join("");
  if(!filtered.length)tbody.innerHTML='<tr><td colspan="4" style="text-align:center;padding:25px">No blood groups found.</td></tr>';
 }
 async function load(){grid.innerHTML='<p class="loading">Loading stock from MySQL…</p>';try{stock=await window.apiRequest("/api/blood-stock");render();document.getElementById("stockUpdated").textContent=new Date().toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"})}catch(e){grid.innerHTML=`<p class="form-message error">${window.escapeHTML(e.message)}. Check server/database connection.</p>`;tbody.innerHTML=""}}
 search?.addEventListener("input",renderTable);document.getElementById("refreshStock")?.addEventListener("click",load);load();
});
