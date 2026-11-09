const $ = (id) => document.getElementById(id);
const pages = ["home","doubts","tests","library","planner","news"];
const titles = {home:"Dashboard",doubts:"AI Doubt Solver",tests:"Mock Tests",library:"Digital Library",planner:"Alarms & Reminders",news:"News & Updates"};
function toast(message){const t=$("toast");t.textContent=message;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600)}
function showPage(page){pages.forEach(p=>$(p).classList.toggle("active",p===page));document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.page===page));$("pageTitle").textContent=titles[page]||"Dashboard";$("sidebar").classList.remove("open");window.scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.go)));
$("menuBtn").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
$("todayLabel").textContent=new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
$("year").textContent=new Date().getFullYear();

const newsItems=[
 ["🌱","Science","How everyday science helps us understand the world","Explore simple observations, ask questions and look for evidence in everyday life."],
 ["🛰️","Technology","Why satellites are important for communication","Satellites support navigation, weather forecasting and communication around the world."],
 ["🌏","Environment","Small ways students can care for the environment","Saving resources, reducing waste and learning about local ecosystems all make a difference."]
];
function renderNews(){ $("newsGrid").innerHTML=newsItems.map(n=>`<article class="news-card"><div class="news-emoji">${n[0]}</div><span>${n[1].toUpperCase()} • LEARNING</span><h3>${n[2]}</h3><p>${n[3]}</p></article>`).join(""); $("homeNews").innerHTML=newsItems.map(n=>`<div class="news-mini"><span>${n[1].toUpperCase()}</span><b>${n[2]}</b></div>`).join("");}
renderNews();

const resources=[
 ["📘","Mathematics","Revise numbers, algebra and geometry concepts.","https://www.khanacademy.org/math"],
 ["🧪","Science","Explore physics, chemistry and biology lessons.","https://www.khanacademy.org/science"],
 ["🌍","Geography","Learn about maps, places and our planet.","https://education.nationalgeographic.org/"],
 ["📖","English","Practise reading, grammar and vocabulary.","https://learnenglish.britishcouncil.org/"],
 ["💻","Computer Basics","Build digital skills and learn computing concepts.","https://www.code.org/"],
 ["📝","Study Skills","Find ideas for planning and effective learning.","https://www.khanacademy.org/"]
];
function renderLibrary(filter=""){const list=resources.filter(r=>r.join(" ").toLowerCase().includes(filter.toLowerCase()));$("libraryGrid").innerHTML=list.length?list.map(r=>`<article class="resource-card"><div class="resource-symbol">${r[0]}</div><h3>${r[1]}</h3><p>${r[2]}</p><a href="${r[3]}" target="_blank" rel="noopener noreferrer">Open learning resource ↗</a></article>`).join(""):`<p class="empty-state">No matching resources found.</p>`;}
renderLibrary();$("librarySearch").addEventListener("input",e=>renderLibrary(e.target.value));

// Offline sample doubt helper. This is intentionally not represented as a live AI model.
$("solveBtn").addEventListener("click",()=>{const q=$("doubtInput").value.trim();if(!q){toast("Please type a question first.");return;}let answer="A good way to solve this doubt is to break it into smaller parts. First, identify the main topic and any important words. Next, connect it to an example you already understand. Finally, explain the idea in your own words and check whether your explanation answers the question.";const lower=q.toLowerCase();if(lower.includes("photosynthesis"))answer="Photosynthesis is the process by which green plants make their own food. They use light energy, water and carbon dioxide to produce glucose (a type of sugar) and release oxygen. The green pigment chlorophyll helps capture light energy.";else if(lower.includes("gravity"))answer="Gravity is an attractive force between objects that have mass. Earth's gravity pulls objects toward its centre, which is why objects fall toward the ground when dropped.";else if(lower.includes("fraction"))answer="A fraction represents part of a whole. The top number (numerator) tells how many parts are being considered; the bottom number (denominator) tells how many equal parts make the whole. For example, 1/2 means one out of two equal parts.";else if(lower.includes("water cycle"))answer="The water cycle is the continuous movement of water around Earth. The main stages are evaporation (liquid water becomes vapour), condensation (vapour forms clouds), and precipitation (water falls as rain, snow or hail).";$("doubtAnswer").hidden=false;$("doubtAnswer").textContent="Your question: "+q+"\n\nStarter explanation:\n"+answer+"\n\nTry asking a teacher or checking your textbook for a complete, syllabus-specific explanation.";});

// Five-question sample quiz
const questions=[
 {q:"Which planet is known as the Red Planet?",o:["Venus","Mars","Jupiter","Mercury"],a:1},
 {q:"What is 12 × 8?",o:["86","92","96","108"],a:2},
 {q:"Which gas do plants absorb from the air for photosynthesis?",o:["Oxygen","Nitrogen","Carbon dioxide","Hydrogen"],a:2},
 {q:"How many sides does a hexagon have?",o:["5","6","7","8"],a:1},
 {q:"Which is the largest ocean on Earth?",o:["Atlantic","Indian","Arctic","Pacific"],a:3}
];let qi=0,score=0,chosen=null,finished=false;
function drawQuestion(){const q=questions[qi];$("questionNumber").textContent=`QUESTION ${qi+1} / ${questions.length}`;$("quizProgress").style.width=((qi+1)/questions.length*100)+"%";$("questionText").textContent=q.q;$("options").innerHTML=q.o.map((o,i)=>`<button class="option" data-answer="${i}">${String.fromCharCode(65+i)}. ${o}</button>`).join("");$("quizFeedback").textContent="Choose one answer to continue.";$("nextQuestion").disabled=true;$("nextQuestion").textContent=qi===questions.length-1?"See my score →":"Next question →";document.querySelectorAll(".option").forEach(b=>b.addEventListener("click",()=>{if(chosen!==null)return;chosen=Number(b.dataset.answer);document.querySelectorAll(".option").forEach(x=>x.classList.toggle("selected",Number(x.dataset.answer)===chosen));$("nextQuestion").disabled=false;$("quizFeedback").textContent="Answer selected. Continue when ready.";}));}
drawQuestion();$("nextQuestion").addEventListener("click",()=>{if(chosen===null)return;if(chosen===questions[qi].a)score++;qi++;chosen=null;if(qi<questions.length)drawQuestion();else{$("questionText").textContent="Test completed!";$("options").innerHTML="";$("quizFeedback").textContent="";$("nextQuestion").hidden=true;$("quizResult").hidden=false;$("quizResult").textContent=`Your score: ${score} out of ${questions.length}. ${score===questions.length?"Excellent work!":score>=3?"Good effort! Keep practising.":"Keep learning and try again!"}`;}});

// Reminders are saved in this browser. Alarm notifications require permission and the page to remain open.
let reminders=JSON.parse(localStorage.getItem("complexlearnReminders")||"[]");let fired=new Set();
function saveReminders(){localStorage.setItem("complexlearnReminders",JSON.stringify(reminders));renderReminders();}
function renderReminders(){$("reminderCount").textContent=String(reminders.length).padStart(2,"0");$("reminderPill").textContent=`${reminders.length} saved`;$("reminderList").innerHTML=reminders.length?reminders.slice().sort((a,b)=>a.time.localeCompare(b.time)).map(r=>`<div class="reminder-item"><div><b>${escapeHtml(r.title)}</b><small>${new Date(r.time).toLocaleString()}</small></div><button class="delete-btn" data-delete="${r.id}" aria-label="Delete reminder">✕</button></div>`).join(""):`<div class="empty-state">No reminders yet. Add one to plan your study time.</div>`;document.querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",()=>{reminders=reminders.filter(r=>r.id!==b.dataset.delete);fired.delete(b.dataset.delete);saveReminders();toast("Reminder deleted.");}));}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
$("reminderForm").addEventListener("submit",e=>{e.preventDefault();const title=$("reminderTitle").value.trim(),time=$("reminderTime").value;if(!title||!time)return;if(new Date(time).getTime()<=Date.now()){toast("Choose a future date and time.");return;}reminders.push({id:Date.now().toString(),title,time:new Date(time).toISOString()});saveReminders();$("reminderForm").reset();toast("Study reminder saved.");});
$("notifyBtn").addEventListener("click",async()=>{if(!("Notification"in window)){toast("Notifications are not supported in this browser.");return;}const permission=await Notification.requestPermission();toast(permission==="granted"?"Notifications enabled.":"Notification permission was not granted.");});
function checkReminders(){const now=Date.now();reminders.forEach(r=>{if(!fired.has(r.id)&&new Date(r.time).getTime()<=now){fired.add(r.id);toast("Study time: "+r.title);if("Notification"in window&&Notification.permission==="granted")new Notification("COMPLEXLEARN study reminder",{body:r.title});try{const Ctx=window.AudioContext||window.webkitAudioContext;if(Ctx){const ctx=new Ctx(),osc=ctx.createOscillator(),gain=ctx.createGain();osc.connect(gain);gain.connect(ctx.destination);osc.frequency.value=660;gain.gain.value=.08;osc.start();osc.stop(ctx.currentTime+.35);}}catch(e){}}});}
renderReminders();setInterval(checkReminders,10000);
