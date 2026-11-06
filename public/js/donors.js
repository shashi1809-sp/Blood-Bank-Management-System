document.addEventListener("DOMContentLoaded",()=>{
 const form=document.getElementById("donorForm");
 if(form)form.addEventListener("submit",async event=>{
  event.preventDefault();
  const message=document.getElementById("donorMessage"),button=document.getElementById("donorSubmit");
  const data=Object.fromEntries(new FormData(form).entries());
  data.donor_name=data.donor_name.trim();data.phone=data.phone.trim();data.city=data.city.trim();data.age=Number(data.age);
  if(data.age<18||data.age>65){message.className="form-message error span-2";message.textContent="Enter an age between 18 and 65. Final donor eligibility must be checked by qualified staff.";return}
  button.disabled=true;button.textContent="Saving donor…";message.className="form-message span-2";message.textContent="";
  try{
   const result=await window.apiRequest("/api/donors",{method:"POST",body:JSON.stringify(data)});
   message.className="form-message span-2";message.textContent=`${result.message} Donor ID: ${result.donor_id}.`;
   form.reset();
  }catch(error){message.className="form-message error span-2";message.textContent=error.message+" Check the server terminal and database connection."}
  finally{button.disabled=false;button.innerHTML='Submit donor registration <span>↗</span>'}
 });

 const tbody=document.getElementById("donorTableBody");if(!tbody)return;
 const search=document.getElementById("donorSearch"),group=document.getElementById("groupFilter"),refresh=document.getElementById("refreshDonors");
 let donors=[];
 const fmtDate=v=>v?new Date(String(v).slice(0,10)+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—";
 function render(){
  const q=(search?.value||"").toLowerCase().trim(),g=group?.value||"";
  const filtered=donors.filter(d=>`${d.donor_name} ${d.city} ${d.blood_group} ${d.phone}`.toLowerCase().includes(q)&&(!g||d.blood_group===g));
  tbody.innerHTML=filtered.map(d=>`<tr><td><div class="donor-cell"><span class="donor-avatar">${window.escapeHTML(String(d.donor_name||"?").split(" ").map(n=>n[0]).slice(0,2).join(""))}</span><div><strong>${window.escapeHTML(d.donor_name)}</strong><small>ID: D-${String(d.donor_id).padStart(3,"0")}</small></div></div></td><td><span class="blood-chip">${window.escapeHTML(d.blood_group)}</span></td><td>${window.escapeHTML(d.age)}</td><td>${window.escapeHTML(d.phone)}</td><td>${window.escapeHTML(d.city)}</td><td>${fmtDate(d.last_donation_date)}</td></tr>`).join("");
  document.getElementById("donorCount").textContent=donors.length;
  document.getElementById("donorResultCount").textContent=`Showing ${filtered.length} of ${donors.length} donors`;
  if(!filtered.length)tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:30px;color:#999">No donor records match your search.</td></tr>';
 }
 async function load(){
  tbody.innerHTML='<tr><td colspan="6">Loading donors from MySQL…</td></tr>';
  try{donors=await window.apiRequest("/api/donors");render();const msg=document.getElementById("donorPageMessage");if(msg)msg.textContent="Connected to the MySQL Donors table. New records are fetched from the server."}
  catch(e){tbody.innerHTML=`<tr><td colspan="6" style="white-space:normal;color:#c23c4a;padding:24px">Could not load donors: ${window.escapeHTML(e.message)}. Make sure the Node server and MySQL are running.</td></tr>`;document.getElementById("donorCount").textContent="—";document.getElementById("donorResultCount").textContent="Database connection error"}
 }
 search?.addEventListener("input",render);group?.addEventListener("change",render);refresh?.addEventListener("click",load);
 window.addEventListener("focus",()=>{if(document.visibilityState==="visible")load()});
 load();
});
