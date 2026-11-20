const districts=["ঢাকা","গাজীপুর","নারায়ণগঞ্জ","নরসিংদী","মুন্সীগঞ্জ","মানিকগঞ্জ","টাঙ্গাইল","কিশোরগঞ্জ","ফরিদপুর","গোপালগঞ্জ","মাদারীপুর","শরীয়তপুর","রাজবাড়ী","চট্টগ্রাম","কক্সবাজার","কুমিল্লা","ব্রাহ্মণবাড়িয়া","চাঁদপুর","লক্ষ্মীপুর","নোয়াখালী","ফেনী","খাগড়াছড়ি","রাঙামাটি","বান্দরবান","সিলেট","মৌলভীবাজার","হবিগঞ্জ","সুনামগঞ্জ","রাজশাহী","নাটোর","নওগাঁ","চাঁপাইনবাবগঞ্জ","পাবনা","সিরাজগঞ্জ","বগুড়া","জয়পুরহাট","রংপুর","দিনাজপুর","কুড়িগ্রাম","গাইবান্ধা","নীলফামারী","লালমনিরহাট","পঞ্চগড়","ঠাকুরগাঁও","খুলনা","যশোর","সাতক্ষীরা","বাগেরহাট","নড়াইল","মাগুরা","ঝিনাইদহ","কুষ্টিয়া","চুয়াডাঙ্গা","মেহেরপুর","বরিশাল","পটুয়াখালী","ভোলা","বরগুনা","পিরোজপুর","ঝালকাঠি","ময়মনসিংহ","জামালপুর","শেরপুর","নেত্রকোনা"];
const $=id=>document.getElementById(id), storeKey="ehf-demo-alerts";
districts.forEach(d=>{const o=document.createElement("option");o.value=d;o.textContent=d;$("district").append(o)});
$("district").value=localStorage.getItem("ehf-district")||"ঢাকা";
$("district").addEventListener("change",()=>{localStorage.setItem("ehf-district",$("district").value);render()});
$("year").textContent=new Date().getFullYear();
function getAlerts(){try{return JSON.parse(localStorage.getItem(storeKey)||"[]")}catch{return []}}
function render(){const d=$("district").value;const items=getAlerts().filter(a=>a.area==="all"||a.district===d);$("alertCount").textContent=items.length+"টি";$("alerts").innerHTML=items.length?items.map(a=>`<article class="alert"><span class="tag">${esc(a.kind)} · ${a.area==="all"?"সারা বাংলাদেশ":esc(a.district)}</span><h3>${esc(a.title)}</h3><p>${esc(a.body)}</p><small class="muted">${new Date(a.time).toLocaleString("bn-BD")}</small></article>`).join(""):'<div class="empty">আপনার এলাকার জন্য এখনো কোনো সতর্কবার্তা নেই।</div>'}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
$("adminToggle").onclick=()=>{$("adminPanel").hidden=!$("adminPanel").hidden};
$("publish").onclick=async()=>{const title=$("title").value.trim(),body=$("body").value.trim();if(!title||!body){alert("শিরোনাম ও বিস্তারিত লিখুন");return}const area=$("area").value;const item={title,body,kind:$("kind").value,area,district:area==="district"?$("district").value:null,time:Date.now()};const all=getAlerts();all.unshift(item);localStorage.setItem(storeKey,JSON.stringify(all));render();if("serviceWorker"in navigator&&Notification.permission==="granted"){const reg=await navigator.serviceWorker.ready;reg.showNotification("EHF News: "+title,{body,icon:"icon.svg",tag:"ehf-"+item.time})}alert("এই ডিভাইসের ডেমোতে সতর্কবার্তা প্রকাশ হয়েছে। এটি এখনো অন্য ব্যবহারকারীদের ফোনে যায়নি।");$("title").value="";$("body").value=""};
$("enablePush").onclick=async()=>{if(!("Notification"in window)){alert("এই ব্রাউজারে নোটিফিকেশন সমর্থিত নয়।");return}const p=await Notification.requestPermission();alert(p==="granted"?"নোটিফিকেশন অনুমতি চালু হয়েছে।":"নোটিফিকেশন অনুমতি দেওয়া হয়নি।");};
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(console.error));
render();

// Automatic RSS headline feed (the scheduled GitHub Action updates data/news.json)
let newsItems = [];
let activeNewsFilter = "All";
function renderNews(){
  const host=$("newsList");
  if(!host) return;
  const filtered=activeNewsFilter==="All"?newsItems:newsItems.filter(n=>n.category===activeNewsFilter);
  if(!filtered.length){host.innerHTML='<div class="empty">এই বিভাগে এখনো কোনো সংবাদ পাওয়া যায়নি। কিছুক্ষণ পরে আবার দেখুন।</div>';return;}
  host.innerHTML=filtered.slice(0,60).map(n=>{
    const title=esc(n.title||"শিরোনাম নেই"), summary=esc(n.summary||"মূল সংবাদ পড়তে লিংকে যান।"), source=esc(n.source||"সংবাদমাধ্যম");
    const date=n.published?new Date(n.published).toLocaleString("bn-BD",{dateStyle:"medium",timeStyle:"short"}):"সময় উল্লেখ নেই";
    const href=/^https:\/\//i.test(n.link||"")?n.link:"#";
    return `<article class="news-card"><div class="news-meta"><span class="tag">${source}</span><small class="muted">${esc(date)}</small></div><h3>${title}</h3><p>${summary}</p><a href="${esc(href)}" target="_blank" rel="noopener noreferrer">মূল সংবাদ পড়ুন ↗</a></article>`;
  }).join("");
}
async function loadNews(){
  const host=$("newsList");
  try{
    const res=await fetch("./data/news.json?updated="+Date.now(),{cache:"no-store"});
    if(!res.ok) throw new Error("সংবাদ ফাইল পাওয়া যায়নি");
    const data=await res.json();
    newsItems=Array.isArray(data.items)?data.items:[];
    $("newsUpdated").textContent=data.updatedAt?"আপডেট: "+new Date(data.updatedAt).toLocaleString("bn-BD"):"এখনো আপডেট হয়নি";
    renderNews();
  }catch(err){
    if(host) host.innerHTML='<div class="empty">সংবাদ লোড করা যায়নি। GitHub Actions-এ RSS সংগ্রহের কাজ চালু হয়েছে কি না দেখুন।</div>';
    if($("newsUpdated")) $("newsUpdated").textContent="সংযোগ সমস্যা";
  }
}
document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{
  activeNewsFilter=btn.dataset.filter;
  document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b===btn));
  renderNews();
}));
loadNews();
