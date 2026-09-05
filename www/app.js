const state = { file: null, mode: "4K", tasks: [] };

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function toast(message){
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  setTimeout(()=>el.classList.remove("show"),2200);
}

function formatSize(bytes){
  if(!bytes) return "—";
  const units=["B","KB","MB","GB"]; let i=0, n=bytes;
  while(n>=1024 && i<units.length-1){n/=1024;i++}
  return `${n.toFixed(i?1:0)} ${units[i]}`;
}

function renderFile(){
  const card=$("#previewCard");
  if(!state.file){
    card.classList.add("hidden");
    $("#selectedFileName").textContent="No video";
    return;
  }
  card.classList.remove("hidden");
  $("#selectedFileName").textContent=state.file.name;
  $("#previewName").textContent=state.file.name;
  $("#previewSize").textContent=formatSize(state.file.size);
  $("#previewMode").textContent=state.mode;
}

function renderTasks(){
  const list=$("#taskList");
  if(!state.tasks.length){
    list.innerHTML=`<div class="empty-state"><div class="empty-icon">◌</div><strong>No tasks yet</strong><span>Enhanced videos will appear here.</span></div>`;
    return;
  }
  list.innerHTML=state.tasks.map(t=>`
    <div class="task">
      <div class="task-top"><span class="task-name">${escapeHtml(t.name)}</span><span class="task-mode">${t.mode}</span></div>
      <div class="task-time">${t.status} · ${t.time}</div>
    </div>`).join("");
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

$("#videoInput").addEventListener("change", e=>{
  const file=e.target.files[0];
  if(file){
    if(!file.type.startsWith("video/")) return toast("Please select a video file.");
    state.file=file; renderFile(); toast("Video selected.");
  }
});

$("#clearBtn").addEventListener("click",()=>{
  state.file=null; $("#videoInput").value=""; renderFile();
});

$$(".mode").forEach(btn=>{
  btn.addEventListener("click",()=>{
    $$(".mode").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    state.mode=btn.dataset.mode; renderFile();
  });
});

$("#enhanceBtn").addEventListener("click",()=>{
  if(!state.file) return toast("Select a video first.");
  const task={name:state.file.name,mode:state.mode,status:"Queued",time:new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})};
  state.tasks.unshift(task);
  renderTasks();
  toast(`${state.mode} enhancement queued.`);
  setTimeout(()=>{task.status="Ready for processing";renderTasks()},1200);
});

$$(".nav-item").forEach(btn=>{
  btn.addEventListener("click",()=>{
    $$(".nav-item").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    $$(".screen").forEach(x=>x.classList.remove("active"));
    $("#"+btn.dataset.screen).classList.add("active");
  });
});

renderFile();
renderTasks();
