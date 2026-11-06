document.addEventListener("DOMContentLoaded",async()=>{
 const bars=document.getElementById("stockBars"),recent=document.getElementById("recentRequests"),msg=document.getElementById("dashboardMessage");
 try{
  const [donors,stock,requests]=await Promise.all([window.apiRequest("/api/donors"),window.apiRequest("/api/blood-stock"),window.apiRequest("/api/blood-requests")]);
  document.getElementById("totalDonors").textContent=donors.length;
  document.getElementById("totalUnits").textContent=stock.reduce((sum,s)=>sum+(Number(s.units_available)||0),0);
  document.getElementById("pendingRequests").textContent=requests.filter(r=>r.request_status==="Pending").length;
  const max=Math.max(1,...stock.map(s=>Number(s.units_available)||0));
  bars.innerHTML=stock.map(s=>`<div class="stock-row"><span class="blood-type">${window.escapeHTML(s.blood_group)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round((Number(s.units_available)||0)/max*100)}%"></div></div><span class="bar-value">${Number(s.units_available)||0}</span></div>`).join("")||'<p class="loading">No stock records found.</p>';
  recent.innerHTML=requests.slice(0,4).map(r=>`<div class="request-item"><span class="request-blood">${window.escapeHTML(r.blood_group)}</span><div class="request-detail"><strong>${window.escapeHTML(r.patient_name)}</strong><small>${window.escapeHTML(r.hospital_name||"Hospital not listed")} · ${r.units_required} unit(s)</small></div><span class="status-badge status-${String(r.request_status).toLowerCase()}">${window.escapeHTML(r.request_status)}</span></div>`).join("")||'<p class="loading">No requests yet.</p>';
  msg.innerHTML='<span>✓</span><p><strong>Connected:</strong> dashboard information loaded from the MySQL database.</p>';
 }catch(e){msg.innerHTML=`<span>ⓘ</span><p><strong>Database unavailable:</strong> ${window.escapeHTML(e.message)}. Start MySQL and check your .env credentials.</p>`}
});
