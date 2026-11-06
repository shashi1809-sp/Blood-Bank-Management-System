document.addEventListener("DOMContentLoaded",()=>{
 let requests=[];const panel=document.getElementById("requestFormPanel"),form=document.getElementById("requestForm"),dateInput=form?.querySelector('[name="request_date"]');
 if(dateInput)dateInput.value=new Date().toISOString().slice(0,10);
 document.getElementById("showRequestForm")?.addEventListener("click",()=>{panel.classList.remove("hidden");panel.scrollIntoView({behavior:"smooth",block:"start"})});
 document.getElementById("closeRequestForm")?.addEventListener("click",()=>panel.classList.add("hidden"));
 const tbody=document.getElementById("requestTableBody"),search=document.getElementById("requestSearch"),filter=document.getElementById("statusFilter");
 const fmtDate=v=>v?new Date(String(v).slice(0,10)+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—";
 function render(){
  const q=(search?.value||"").toLowerCase().trim(),st=filter?.value||"",filtered=requests.filter(r=>`${r.patient_name} ${r.hospital_name||""} ${r.blood_group}`.toLowerCase().includes(q)&&(!st||r.request_status===st));
  tbody.innerHTML=filtered.map(r=>`<tr><td>REQ-${String(r.request_id).padStart(3,"0")}</td><td><strong>${window.escapeHTML(r.patient_name)}</strong></td><td><span class="blood-chip">${window.escapeHTML(r.blood_group)}</span></td><td>${r.units_required}</td><td>${window.escapeHTML(r.hospital_name||"—")}</td><td>${fmtDate(r.request_date)}</td><td><span class="status-badge status-${String(r.request_status).toLowerCase()}">${window.escapeHTML(r.request_status)}</span></td></tr>`).join("");
  if(!filtered.length)tbody.innerHTML='<tr><td colspan="7" style="text-align:center;padding:25px">No requests match your filters.</td></tr>';
  document.getElementById("requestResultCount").textContent=`Showing ${filtered.length} of ${requests.length} requests`;
  document.getElementById("pendingCount").textContent=requests.filter(r=>r.request_status==="Pending").length;
  document.getElementById("approvedCount").textContent=requests.filter(r=>r.request_status==="Approved").length;
  document.getElementById("requestCount").textContent=requests.length;
 }
 async function load(){tbody.innerHTML='<tr><td colspan="7">Loading requests from MySQL…</td></tr>';try{requests=await window.apiRequest("/api/blood-requests");render()}catch(e){tbody.innerHTML=`<tr><td colspan="7" style="white-space:normal;color:#c23c4a;padding:24px">Could not load requests: ${window.escapeHTML(e.message)}. Check the server and MySQL.</td></tr>`}}
 form?.addEventListener("submit",async e=>{e.preventDefault();const button=document.getElementById("requestSubmit"),message=document.getElementById("requestMessage"),data=Object.fromEntries(new FormData(form).entries());data.units_required=Number(data.units_required);button.disabled=true;button.textContent="Saving…";try{const result=await window.apiRequest("/api/blood-requests",{method:"POST",body:JSON.stringify(data)});message.className="form-message span-2";message.textContent=`${result.message} Request ID: ${result.request_id}.`;form.reset();if(dateInput)dateInput.value=new Date().toISOString().slice(0,10);await load()}catch(err){message.className="form-message error span-2";message.textContent=err.message}finally{button.disabled=false;button.innerHTML='Submit request <span>↗</span>'}});
 search?.addEventListener("input",render);filter?.addEventListener("change",render);document.getElementById("refreshRequests")?.addEventListener("click",load);load();
});
