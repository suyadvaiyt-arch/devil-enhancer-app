const state = {
  file: null,
  mode: "4K",
  tasks: []
};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function toast(message) {
  const el = $("#toast");
  if (!el) return;

  el.textContent = message;
  el.classList.add("show");

  setTimeout(() => {
    el.classList.remove("show");
  }, 3000);
}

function formatSize(bytes) {
  if (!bytes) return "-";

  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;

  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }

  return `${n.toFixed(i ? 1 : 0)} ${units[i]}`;
}

function renderFile() {
  const card = $("#previewCard");

  if (!state.file) {
    if (card) card.classList.add("hidden");

    if ($("#selectedFileName")) {
      $("#selectedFileName").textContent = "No video";
    }

    return;
  }

  if (card) card.classList.remove("hidden");

  if ($("#selectedFileName")) {
    $("#selectedFileName").textContent = state.file.name;
  }

  if ($("#previewName")) {
    $("#previewName").textContent = state.file.name;
  }

  if ($("#previewSize")) {
    $("#previewSize").textContent = formatSize(state.file.size);
  }

  if ($("#previewMode")) {
    $("#previewMode").textContent = state.mode;
  }
}

function renderTasks() {
  const list = $("#taskList");
  if (!list) return;

  if (!state.tasks.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">○</div>
        <strong>No tasks yet</strong>
        <span>Enhanced videos will appear here.</span>
      </div>
    `;
    return;
  }

  list.innerHTML = state.tasks.map(t => `
    <div class="task">
      <div class="task-top">
        <span class="task-name">${escapeHtml(t.name)}</span>
        <div class="task-time">${escapeHtml(t.status)} · ${escapeHtml(t.time)}</div>
      </div>
      <div class="task-mode">${escapeHtml(t.mode)}</div>
    </div>
  `).join("");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  }[m]));
}


// VIDEO SELECT
$("#videoInput")?.addEventListener("change", e => {
  const file = e.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("video/")) {
    toast("Please select a video file.");
    return;
  }

  state.file = file;
  renderFile();

  toast("Video selected.");
});


// CLEAR VIDEO
$("#clearBtn")?.addEventListener("click", () => {
  state.file = null;

  if ($("#videoInput")) {
    $("#videoInput").value = "";
  }

  renderFile();
});


// QUALITY MODE
$$(".mode").forEach(btn => {
  btn.addEventListener("click", () => {

    $$(".mode").forEach(x => {
      x.classList.remove("active");
    });

    btn.classList.add("active");

    state.mode = btn.dataset.mode || "4K";

    renderFile();
  });
});


// START ENHANCEMENT
$("#enhanceBtn")?.addEventListener("click", async () => {

  if (!state.file) {
    toast("Select a video first.");
    return;
  }

  const task = {
    name: state.file.name,
    mode: state.mode,
    status: "Processing",
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })
  };

  state.tasks.unshift(task);
  renderTasks();

  toast(`${state.mode} enhancement started.`);

  try {

    // Capacitor native plugin
    const Enhancer =
      window.Capacitor?.Plugins?.Enhancer;

    if (!Enhancer) {
      task.status = "Plugin not available";
      renderTasks();

      toast("Enhancer plugin not available.");
      return;
    }

    // Convert selected video to Base64
    const arrayBuffer = await state.file.arrayBuffer();

    let binary = "";
    const bytes = new Uint8Array(arrayBuffer);

    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(
        i,
        Math.min(i + chunkSize, bytes.length)
      );

      binary += String.fromCharCode(...chunk);
    }

    const base64 = btoa(binary);

    const result = await Enhancer.enhanceVideo({
      fileName: state.file.name,
      data: base64,
      mode: state.mode
    });

    task.status = "Completed";
    renderTasks();

    toast("Enhancement completed.");

    if (result?.uri) {
      toast("Enhanced video saved.");
    }

  } catch (error) {

    console.error("Enhancement error:", error);

    task.status = "Failed";
    renderTasks();

    toast(
      "Enhancement failed: " +
      (error?.message || "Unknown error")
    );
  }
});


// NAVIGATION
$$(".nav-item").forEach(btn => {

  btn.addEventListener("click", () => {

    $$(".nav-item").forEach(x => {
      x.classList.remove("active");
    });

    btn.classList.add("active");

    $$(".screen").forEach(x => {
      x.classList.remove("active");
    });

    const screen = $("#" + btn.dataset.screen);

    if (screen) {
      screen.classList.add("active");
    }
  });

});


// INITIAL RENDER
renderFile();
renderTasks();    list.innerHTML=`<div class="empty-state"><div class="empty-icon">◌</div><strong>No tasks yet</strong><span>Enhanced videos will appear here.</span></div>`;
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
