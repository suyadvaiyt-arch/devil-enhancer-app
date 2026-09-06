// ============================================================
// DEVIL ENHANCER - APP.JS
// ============================================================

const state = {
    file: null,

    // 4K / 8K
    mode: "4K",

    // 30 / 120 / 240
    fps: "30",

    // Text shown in UI
    qualityLabel: "4K",

    tasks: [],

    previewUrl: null
};


// ============================================================
// HELPERS
// ============================================================

const $ = selector => document.querySelector(selector);

const $$ = selector => [
    ...document.querySelectorAll(selector)
];


function toast(message) {

    const el = $("#toast");

    if (!el) return;

    el.textContent = message;
    el.classList.add("show");

    clearTimeout(window.__toastTimer);

    window.__toastTimer = setTimeout(() => {
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


function escapeHtml(value) {

    return String(value ?? "").replace(
        /[&<>"']/g,
        char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]
    );
}


// ============================================================
// VIDEO PREVIEW
// ============================================================

function getPreviewVideo() {

    const card = $("#previewCard");

    if (!card) return null;

    let video = card.querySelector("#previewVideo");

    if (!video) {

        video = document.createElement("video");

        video.id = "previewVideo";
        video.className = "preview-video";

        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";

        video.style.width = "100%";
        video.style.maxHeight = "260px";
        video.style.borderRadius = "18px";
        video.style.display = "block";
        video.style.objectFit = "contain";
        video.style.background = "#000";
        video.style.marginBottom = "14px";

        const head = card.querySelector(".preview-head");

        if (head) {
            card.insertBefore(video, head);
        } else {
            card.prepend(video);
        }
    }

    return video;
}


function renderFile() {

    const card = $("#previewCard");

    const nameLabel = $("#selectedFileName");
    const previewName = $("#previewName");
    const previewSize = $("#previewSize");
    const previewMode = $("#previewMode");

    if (!state.file) {

        if (card) {
            card.classList.add("hidden");
        }

        if (nameLabel) {
            nameLabel.textContent = "No video";
        }

        const video = getPreviewVideo();

        if (video) {
            video.pause();
            video.removeAttribute("src");
            video.load();
        }

        if (state.previewUrl) {
            URL.revokeObjectURL(state.previewUrl);
            state.previewUrl = null;
        }

        return;
    }


    // Show preview card
    if (card) {
        card.classList.remove("hidden");
    }


    // File name
    if (nameLabel) {
        nameLabel.textContent = state.file.name;
    }


    if (previewName) {
        previewName.textContent = state.file.name;
    }


    // File size
    if (previewSize) {
        previewSize.textContent = formatSize(state.file.size);
    }


    // Current mode
    if (previewMode) {
        previewMode.textContent =
            state.fps === "30"
                ? state.mode
                : `${state.mode} • ${state.fps} FPS`;
    }


    // Create preview URL
    if (state.previewUrl) {
        URL.revokeObjectURL(state.previewUrl);
    }

    state.previewUrl = URL.createObjectURL(state.file);


    const video = getPreviewVideo();

    if (video) {

        video.src = state.previewUrl;

        video.load();

        video.onloadedmetadata = () => {

            const duration = video.duration;

            if (
                Number.isFinite(duration) &&
                duration > 0
            ) {
                video.dataset.duration = String(duration);
            }
        };
    }
}


// ============================================================
// VIDEO SELECT
// ============================================================

const videoInput = $("#videoInput");

const uploadCard = document.querySelector(".upload-card");


if (videoInput) {

    // --------------------------------------------------------
    // Upload card click
    // --------------------------------------------------------

    if (uploadCard) {

        uploadCard.addEventListener("click", event => {

            // If the actual input itself was clicked,
            // don't trigger it twice.
            if (event.target === videoInput) {
                return;
            }

            event.preventDefault();

            // Allow selecting the same video again
            videoInput.value = "";

            videoInput.click();
        });
    }


    // --------------------------------------------------------
    // File selected
    // --------------------------------------------------------

    videoInput.addEventListener("change", event => {

        const files = event.target.files;

        if (!files || !files.length) {
            return;
        }

        const file = files[0];


        // Check MIME type
        const isVideo =
            file.type &&
            file.type.toLowerCase().startsWith("video/");


        // Some Android file pickers may return an empty MIME type.
        // In that case check the file extension.
        const extension =
            file.name
                .split(".")
                .pop()
                ?.toLowerCase();


        const allowedExtensions = [
            "mp4",
            "mov",
            "webm",
            "mkv",
            "avi",
            "m4v",
            "3gp"
        ];


        if (
            !isVideo &&
            !allowedExtensions.includes(extension)
        ) {

            toast("Please select a valid video file.");

            videoInput.value = "";

            return;
        }


        // Save selected file
        state.file = file;


        // Render
        renderFile();


        toast("Video selected.");
    });
}


// ============================================================
// CLEAR / REMOVE VIDEO
// ============================================================

const clearBtn = $("#clearBtn");


if (clearBtn) {

    clearBtn.addEventListener("click", event => {

        event.preventDefault();

        state.file = null;

        if (videoInput) {
            videoInput.value = "";
        }

        renderFile();

        toast("Video removed.");
    });
}


// ============================================================
// QUALITY / FPS MODE
// ============================================================

$$(".mode").forEach(button => {

    button.addEventListener("click", () => {

        // Remove active from all buttons
        $$(".mode").forEach(btn => {
            btn.classList.remove("active");
        });


        // Activate clicked button
        button.classList.add("active");


        const selected =
            button.dataset.mode || "4K";


        // ---------------------------------------------
        // 4K
        // ---------------------------------------------

        if (selected === "4K") {

            state.mode = "4K";
            state.fps = "30";
            state.qualityLabel = "4K";
        }


        // ---------------------------------------------
        // 8K
        // ---------------------------------------------

        else if (selected === "8K") {

            state.mode = "8K";
            state.fps = "30";
            state.qualityLabel = "8K";
        }


        // ---------------------------------------------
        // 120 FPS
        // ---------------------------------------------

        else if (
            selected === "120 FPS" ||
            selected === "120FPS"
        ) {

            state.mode = "4K";
            state.fps = "120";
            state.qualityLabel = "4K • 120 FPS";
        }


        // ---------------------------------------------
        // 240 FPS
        // ---------------------------------------------

        else if (
            selected === "240 FPS" ||
            selected === "240FPS"
        ) {

            state.mode = "4K";
            state.fps = "240";
            state.qualityLabel = "4K • 240 FPS";
        }


        else {

            state.mode = "4K";
            state.fps = "30";
            state.qualityLabel = "4K";
        }


        renderFile();


        toast(
            `${state.qualityLabel} selected.`
        );
    });
});


// ============================================================
// TASKS
// ============================================================

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


    list.innerHTML = state.tasks.map(task => {

        return `
            <div class="task">

                <div class="task-top">

                    <span class="task-name">
                        ${escapeHtml(task.name)}
                    </span>

                    <div class="task-time">
                        ${escapeHtml(task.time)}
                    </div>

                </div>

                <div class="task-mode">
                    ${escapeHtml(task.mode)}
                </div>

                <div class="task-status">
                    ${escapeHtml(task.status)}
                </div>

            </div>
        `;

    }).join("");
}


// ============================================================
// BASE64 CONVERTER
// ============================================================

async function fileToBase64(file) {

    const arrayBuffer =
        await file.arrayBuffer();


    const bytes =
        new Uint8Array(arrayBuffer);


    const chunkSize = 0x8000;

    let binary = "";


    for (
        let i = 0;
        i < bytes.length;
        i += chunkSize
    ) {

        const chunk =
            bytes.subarray(
                i,
                Math.min(
                    i + chunkSize,
                    bytes.length
                )
            );


        binary += String.fromCharCode(
            ...chunk
        );
    }


    return btoa(binary);
}


// ============================================================
// START ENHANCEMENT
// ============================================================

const enhanceBtn = $("#enhanceBtn");


if (enhanceBtn) {

    enhanceBtn.addEventListener(
        "click",
        async () => {

            // ---------------------------------------------
            // Check video
            // ---------------------------------------------

            if (!state.file) {

                toast(
                    "Select a video first."
                );

                return;
            }


            // ---------------------------------------------
            // Disable button
            // ---------------------------------------------

            enhanceBtn.disabled = true;


            const originalText =
                enhanceBtn.querySelector("span");


            if (originalText) {
                originalText.textContent =
                    "Processing...";
            }


            // ---------------------------------------------
            // Create task
            // ---------------------------------------------

            const task = {

                name: state.file.name,

                mode:
                    state.fps === "30"
                        ? state.mode
                        : `${state.mode} • ${state.fps} FPS`,

                status: "Processing",

                time:
                    new Date().toLocaleTimeString(
                        [],
                        {
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    )
            };


            state.tasks.unshift(task);

            renderTasks();


            toast(
                `${state.qualityLabel} enhancement started.`
            );


            // ---------------------------------------------
            // Capacitor Enhancer plugin
            // ---------------------------------------------

            try {

                const Enhancer =
                    window.Capacitor &&
                    window.Capacitor.Plugins &&
                    window.Capacitor.Plugins.Enhancer;


                if (!Enhancer) {

                    task.status =
                        "Plugin not available";

                    renderTasks();


                    toast(
                        "Enhancer plugin not available."
                    );


                    return;
                }


                // -----------------------------------------
                // Convert video to Base64
                // -----------------------------------------

                toast(
                    "Preparing video..."
                );


                const base64 =
                    await fileToBase64(
                        state.file
                    );


                // -----------------------------------------
                // Send to native Android plugin
                // -----------------------------------------

                toast(
                    "Enhancement processing..."
                );


                const result =
                    await Enhancer.enhanceVideo({

                        fileName:
                            state.file.name,

                        data:
                            base64,

                        mode:
                            state.mode,

                        fps:
                            state.fps
                    });


                // -----------------------------------------
                // Completed
                // -----------------------------------------

                task.status =
                    "Completed";


                renderTasks();


                toast(
                    "Enhancement completed."
                );


                if (result && result.uri) {

                    console.log(
                        "Enhanced video saved:",
                        result.uri
                    );

                    toast(
                        "Enhanced video saved."
                    );
                }


            } catch (error) {

                console.error(
                    "Enhancement error:",
                    error
                );


                task.status =
                    "Failed";


                renderTasks();


                toast(
                    "Enhancement failed: " +
                    (
                        error?.message ||
                        "Unknown error"
                    )
                );

            } finally {

                // -----------------------------------------
                // Enable button again
                // -----------------------------------------

                enhanceBtn.disabled = false;


                if (originalText) {

                    originalText.textContent =
                        "Start Enhancement";
                }
            }
        }
    );
}


// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

    const navItems =
        $$(".nav-item");


    const screens =
        $$(".screen");


    navItems.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                navItems.forEach(item => {
                    item.classList.remove("active");
                });


                screens.forEach(screen => {
                    screen.classList.remove("active");
                });


                button.classList.add("active");


                const screenId =
                    button.dataset.screen;


                if (!screenId) {
                    return;
                }


                const screen =
                    $("#" + screenId);


                if (screen) {
                    screen.classList.add("active");
                }
            }
        );
    });
}


setupNavigation();


// ============================================================
// INITIAL UI
// ============================================================

renderFile();

renderTasks();


// ============================================================
// SAFETY: INITIAL ACTIVE MODE
// ============================================================

const initialMode =
    document.querySelector(
        ".mode.active"
    );


if (initialMode) {

    const selected =
        initialMode.dataset.mode;


    if (selected === "8K") {

        state.mode = "8K";
        state.fps = "30";
        state.qualityLabel = "8K";

    } else {

        state.mode = "4K";
        state.fps = "30";
        state.qualityLabel = "4K";
    }
}


// ============================================================
// DEBUG
// ============================================================

console.log(
    "Devil Enhancer loaded successfully."
);

console.log(
    "Enhancer plugin:",
    window.Capacitor?.Plugins?.Enhancer
);
