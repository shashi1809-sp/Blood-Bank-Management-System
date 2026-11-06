document.addEventListener("DOMContentLoaded",()=>{
 const toggle=document.querySelector(".menu-toggle"),nav=document.querySelector(".nav-links");
 if(toggle&&nav)toggle.addEventListener("click",()=>nav.classList.toggle("open"));
 document.querySelectorAll(".toggle-password").forEach(button=>button.addEventListener("click",()=>{
  const input=button.parentElement.querySelector("input"),show=input.type==="password";input.type=show?"text":"password";button.textContent=show?"Hide":"Show";
 }));
 const date=document.getElementById("todayDate");if(date)date.textContent=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
});
window.escapeHTML=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
window.apiRequest=async(url,options={})=>{
 const response=await fetch(url,{headers:{"Content-Type":"application/json",...(options.headers||{})},...options});
 let data={};try{data=await response.json()}catch{}
 if(!response.ok)throw new Error(data.message||`Request failed (${response.status})`);
 return data;
};
