const adminAccount = {
  name: "Ritesh Srivastava",
  email: "admin@dsafirm.com",
  password: "admin123",
  role: "admin"
};

const YASH_ASSISTANT_URL = "https://chatgpt.com/g/g-6a5354a7412c8191af5748f47ff577fe-yash";
const PORTAL_GUIDE_URL = "https://www.loom.com/share/6dcbd61b938c4206b869abb03c449f90";

const defaultVideoRows = [
  {
    title: "GST LOGIN WITH THE CLIENT CREDENTIALS",
    durationSeconds: 104,
    loomUrl: "https://www.loom.com/share/19eee0ee0d3d418eb0b15c88041393f5"
  },
  {
    title: "HOW TO MAKE A WORKING FOR A CLIENT",
    durationSeconds: 266,
    loomUrl: "https://www.loom.com/share/c0033abcd28e4e899550e4d584ecc004"
  },
  {
    title: "FEED THE WORKING IN GSTR-1 FOR B2B",
    durationSeconds: 184,
    loomUrl: "https://www.loom.com/share/bf47a7f2cba748739ff264ef5130ce77"
  },
  {
    title: "DEBIT AND CREDIT NOTE ENTRY IN PORTAL",
    durationSeconds: 191,
    loomUrl: "https://www.loom.com/share/3cc38e66c8f640b29280826030cab583"
  },
  {
    title: "FEEDING FOR THE B2C IN THE PORTAL",
    durationSeconds: 205,
    loomUrl: "https://www.loom.com/share/dc276028bf4a45b4bd0d005c92fae85b"
  },
  {
    title: "FILE HSN IN THE PORTAL",
    durationSeconds: 223,
    loomUrl: "https://www.loom.com/share/e4fd5ece9305424795bd73396186fc6a"
  },
  {
    title: "DOCUMENT ISSUED FILING IN THE PORTAL",
    durationSeconds: 198,
    loomUrl: "https://www.loom.com/share/218b3c8f96de484ca4f53dfaf059623b"
  },
  {
    title: "CREATE SUMMARY",
    durationSeconds: 161,
    loomUrl: "https://www.loom.com/share/4c9f88974e564fd6b8f44668e38e1bf6"
  },
  {
    title: "INTRODUCTION TO GSTR-3B",
    durationSeconds: 300,
    loomUrl: "https://www.loom.com/share/46f88a0cb552400c93e7a8215b8bd471"
  },
  {
    title: "DOWNLOAD AND INSTALL GST OFFLINE TOOL",
    durationSeconds: 199,
    loomUrl: "https://www.loom.com/share/f902a7e97fce4401956e38ab8ae05651"
  },
  {
    title: "DOWNLOAD THE GSTR-1 WORKING TEMPLATE IN CSV FILE",
    durationSeconds: 134,
    loomUrl: "https://www.loom.com/share/7a77e136b7e1434995802dd7ab871376"
  },
  {
    title: "UPLOAD THE WORKING IN OFFLINE TOOL, DOWNLOAD THE JSON FILE AND UPLOAD IT IN THE GST PORTAL.",
    durationSeconds: 254,
    loomUrl: "https://www.loom.com/share/49260a9ab90c46b58d6e1160f66db867"
  }
];

const initialLessons = buildLessons(defaultVideoRows);

function buildLessons(videoRows) {
  return videoRows.map((video, index) => ({
  id: `lesson-${index + 1}`,
  title: video.title,
  duration: video.duration || formatDurationLabel(video.durationSeconds || 300),
  durationSeconds: Number(video.durationSeconds || 300),
  loomUrl: video.loomUrl,
  summary: video.summary || "This video was synced from the DSA LP VIDEOS FILE Excel sheet.",
  resources: Array.isArray(video.resources) ? video.resources.map((resource, resourceIndex) => ({
    id: resource.id || `resource-${index + 1}-${resourceIndex + 1}`,
    title: resource.title || `${video.title} resource notes`,
    url: resource.url || video.loomUrl,
    type: resource.type || "Link",
    isFile: Boolean(resource.isFile)
  })) : []
  }));
}

const icons = {
  check: "OK",
  download: "Download",
  add: "+",
  delete: "x"
};

const WATCH_TIMER_INTERVAL_MS = 1000;
const confettiColors = ["#b53524", "#6d4fb3", "#2e7d4f", "#b06c1d", "#fff1e6"];
let activeWatchTimer = null;
let activeWatchSession = null;

const state = {
  lessons: readStore("dsa_lessons", initialLessons),
  interns: readStore("dsa_interns", []),
  session: readStore("dsa_session", null),
  view: "dashboard",
  activeLessonId: "lesson-1",
  completed: readStore("dsa_completed", {}),
  watchProgress: readStore("dsa_watch_progress", {}),
  assistantMessages: {}
};

state.interns = normalizeInterns(state.interns);
writeStore("dsa_interns", state.interns);

if (state.session && state.session.email === adminAccount.email) {
  state.session = adminAccount;
  writeStore("dsa_session", state.session);
}

if (shouldReplaceStoredLessons(state.lessons)) {
  state.lessons = initialLessons;
  writeStore("dsa_lessons", state.lessons);
}

function shouldReplaceStoredLessons(lessons) {
  if (!Array.isArray(lessons) || lessons.length === 0) return true;
  const firstTitle = String(lessons[0]?.title || "");
  return (
    firstTitle === "Orientation and firm workflow" ||
    !lessons.some((lesson) => lesson.loomUrl) ||
    lessonSignature(lessons) !== lessonSignature(initialLessons)
  );
}

function lessonSignature(lessons) {
  return lessons.map((lesson) => {
    const resources = Array.isArray(lesson.resources)
      ? lesson.resources.map((resource) => `${resource.title}|${resource.url}|${resource.type}`).join(";;")
      : "";
    return `${lesson.title}|${lesson.loomUrl}|${lesson.summary}|${lesson.durationSeconds}|${resources}`;
  }).join("::");
}

function readStore(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeInterns(interns) {
  if (!Array.isArray(interns)) return [];
  return interns.map((intern) => ({
    id: intern.id || makeId(),
    name: intern.name || "",
    email: String(intern.email || "").trim().toLowerCase(),
    password: intern.password || "",
    active: intern.active !== false,
    createdAt: intern.createdAt || "Earlier account",
    signedOutAt: intern.signedOutAt || "",
    passwordResetAt: intern.passwordResetAt || ""
  }));
}

function escapeHtml(value) {
  return String(value)
    .split("&").join("&amp;")
    .split("<").join("&lt;")
    .split(">").join("&gt;")
    .split('"').join("&quot;")
    .split("'").join("&#039;");
}

function render() {
  stopLessonWatchTimer();
  document.getElementById("root").innerHTML = state.session ? appShell() : authScreen();
  bindEvents();
  startLessonWatchTimer();
}

function loadSyncedVideos() {
  if (!window.fetch) return;
  fetch("./data/videos.json?cache=" + Date.now())
    .then((response) => response.ok ? response.json() : null)
    .then((videoRows) => {
      if (!Array.isArray(videoRows) || videoRows.length === 0) return;
      const syncedLessons = buildLessons(videoRows.filter((video) => video.title && video.loomUrl));
      if (syncedLessons.length === 0) return;
      const currentSignature = lessonSignature(state.lessons);
      const nextSignature = lessonSignature(syncedLessons);
      if (currentSignature === nextSignature) return;
      state.lessons = syncedLessons;
      state.activeLessonId = syncedLessons[0].id;
      writeStore("dsa_lessons", state.lessons);
      render();
    })
    .catch(() => {});
}

function currentCompleted() {
  return state.session ? state.completed[state.session.email] || [] : [];
}

function progressValue() {
  return Math.round((currentCompleted().length / state.lessons.length) * 100);
}

function appShell() {
  const nav = [
    ["dashboard", "Dashboard"],
    ["videos", "Videos Page"],
    ["assistant", "AI Assistant Yash"]
  ];
  if (state.session.role === "admin") nav.push(["admin", "Admin Controls"]);

  return `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">DSA</div>
          <div><strong>DSA Learning</strong><span>${state.session.role === "admin" ? "Admin workspace" : "Intern portal"}</span></div>
        </div>
        <nav class="nav-list">
          ${nav.map(([id, label]) => `
            <button class="nav-item ${state.view === id ? "active" : ""}" data-view="${id}">
              ${label}
            </button>
          `).join("")}
        </nav>
        <button class="nav-item logout" data-action="logout">Sign out</button>
      </aside>
      <main class="main-content">
        ${topbar()}
        ${mainView()}
      </main>
    </div>
  `;
}

function topbar() {
  return `
    <header class="topbar">
      <div><span class="eyebrow">${state.session.role === "admin" ? "Admin" : "Intern"} access</span><h2>${escapeHtml(state.session.name)}</h2></div>
      <div class="topbar-stat"><span>Course progress</span><strong>${progressValue()}%</strong></div>
    </header>
  `;
}

function mainView() {
  if (state.view === "videos") return videosPage();
  if (state.view === "lesson") return lessonPage();
  if (state.view === "assistant") return assistantPanel("DSA onboarding library", true);
  if (state.view === "admin" && state.session.role === "admin") return adminPage();
  return dashboard();
}

function authScreen() {
  return `
    <div class="auth-page">
      <section class="auth-visual">
        <div class="auth-badge">DSA Private firm training</div>
        <h1>DSA Learning Portal</h1>
        <p>Structured onboarding for new interns with videos, resources, progress, and guided support.</p>
        <img
          class="auth-illustration"
          src="./assets/learning-hero.png"
          alt="Intern studying with notes and laptop"
        >
      </section>
      <section class="auth-panel">
        <div class="mode-switch">
          <button class="active" data-auth-mode="login">Login</button>
          <button data-auth-mode="signup">Create account</button>
        </div>
        <form class="form-stack" id="auth-form" data-mode="login">
          <div id="name-field" hidden>
            <label>Full name<input name="name" autocomplete="name"></label>
          </div>
          <label>Email ID<input name="email" type="email" autocomplete="email"></label>
          <label>Password<input name="password" type="password" autocomplete="current-password"></label>
          <p class="form-message" id="auth-message"></p>
          <button class="primary-button" type="submit">Login</button>
          <button class="ghost-button auth-link" type="button" data-action="show-password-reset">Forgot login details?</button>
        </form>
        <form class="form-stack reset-form" id="reset-form" hidden>
          <div class="reset-heading">
            <h3>Reset intern password</h3>
            <p class="muted">Enter the email used for the intern account. After the reset email is confirmed, set a new password.</p>
          </div>
          <label>Email ID<input name="resetEmail" type="email" autocomplete="email"></label>
          <label>New password<input name="newPassword" type="password" autocomplete="new-password"></label>
          <p class="form-message" id="reset-message"></p>
          <div class="reset-actions">
            <button class="primary-button" type="submit">Reset password</button>
            <button class="ghost-button" type="button" data-action="hide-password-reset">Back to login</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function dashboard() {
  const completed = currentCompleted();
  const nextLesson = state.lessons.find((lesson) => !completed.includes(lesson.id)) || state.lessons[0];
  return `
    <div class="page-grid">
      <section class="welcome-panel">
        <div>
          <span class="eyebrow">Welcome back</span>
          <h1>Hi, ${escapeHtml(state.session.name)}</h1>
          <p>Continue the onboarding videos one by one and keep all supporting material close to the lesson.</p>
        </div>
        <button class="accent-button" data-view="videos">Play Continue</button>
      </section>
      <div class="dashboard-progress-row">
        <section class="progress-card">
          <div class="section-heading"><h3>Learning progress</h3><span>${completed.length} of ${state.lessons.length} videos completed</span></div>
          <div class="progress-bar"><span style="width:${progressValue()}%"></span></div>
          <p>Next lesson: <strong>${escapeHtml(nextLesson.title)}</strong></p>
        </section>
        <section class="portal-guide-card">
          <div class="section-heading"><div><span class="eyebrow">Portal guide</span><h3>How to use DSA Learning Portal</h3></div></div>
          <div class="portal-guide-frame">
            <iframe title="How to use DSA Learning Portal" src="${escapeHtml(toEmbedUrl(PORTAL_GUIDE_URL))}" allowfullscreen></iframe>
          </div>
        </section>
      </div>
      <section class="dashboard-actions">
        <button class="feature-card video-card" data-view="videos">
          <span class="feature-icon">Play</span><span>Videos Page</span><small>Watch all 12 Loom sessions and open lesson resources.</small>
        </button>
        <button class="feature-card assistant-card" data-view="assistant">
          <span class="feature-icon">AI</span><span>AI Assistant Yash</span><small>Ask questions whenever you get stuck in the process.</small>
        </button>
      </section>
    </div>
  `;
}

function videosPage() {
  const completed = currentCompleted();
  return `
    <section class="content-section">
      <div class="page-title-row">
        <div><span class="eyebrow">Video library</span><h1>Onboarding videos</h1></div>
        <span class="status-pill">${state.lessons.length} Loom video slots</span>
      </div>
      <div class="lesson-grid">
        ${state.lessons.map((lesson, index) => `
          <button class="lesson-card" data-open-lesson="${lesson.id}">
            <div class="thumbnail"><span class="play-mark">Play</span><span>Lesson ${index + 1}</span></div>
            <div class="lesson-card-body">
              <h3>${escapeHtml(lesson.title)}</h3>
              <p>${lesson.duration} - ${lesson.resources.length} resource${lesson.resources.length === 1 ? "" : "s"}</p>
              <span class="status-pill ${completed.includes(lesson.id) ? "complete" : ""}">${completed.includes(lesson.id) ? "Completed" : "Open video"}</span>
            </div>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function lessonPage() {
  const completed = currentCompleted();
  const activeLesson = state.lessons.find((lesson) => lesson.id === state.activeLessonId) || state.lessons[0];
  const isComplete = completed.includes(activeLesson.id);
  const requiredSeconds = requiredWatchSeconds(activeLesson);
  const watchedSeconds = currentWatchSeconds(activeLesson.id);
  const isReady = isComplete || !activeLesson.loomUrl || watchedSeconds >= requiredSeconds;
  const watchPercent = Math.min(100, Math.round((watchedSeconds / requiredSeconds) * 100));
  const remainingSeconds = Math.max(0, requiredSeconds - watchedSeconds);
  return `
    <div class="lesson-layout">
      <aside class="lesson-list">
        <h3>Learning Path</h3>
        ${state.lessons.map((lesson, index) => `
          <button class="lesson-nav-button ${activeLesson.id === lesson.id ? "active" : ""}" data-select-lesson="${lesson.id}">
            <span>${index + 1}</span>${escapeHtml(lesson.title)}${completed.includes(lesson.id) ? `<b>${icons.check}</b>` : ""}
          </button>
        `).join("")}
      </aside>
      <section class="lesson-player">
        <div class="video-frame">
          ${activeLesson.loomUrl ? `<iframe title="${escapeHtml(activeLesson.title)}" src="${escapeHtml(toEmbedUrl(activeLesson.loomUrl))}" allowfullscreen></iframe>` : `
            <div class="empty-video"><strong>Loom video not uploaded yet</strong><span>Admin can add the Loom link from Admin Controls.</span></div>
          `}
        </div>
        <div class="watch-gate ${isReady ? "ready" : ""}">
          <div>
            <span class="eyebrow">Video watch progress</span>
            <h3>${isComplete ? "Completed" : isReady ? "Ready to complete" : "Watch the full video to unlock OK"}</h3>
          </div>
          <div class="watch-progress">
            <div class="progress-bar"><span style="width:${watchPercent}%"></span></div>
            <small>${isComplete ? "This video is already completed." : `${formatTime(watchedSeconds)} watched of ${formatTime(requiredSeconds)}${remainingSeconds ? ` - ${formatTime(remainingSeconds)} remaining` : ""}`}</small>
          </div>
        </div>
        <div class="lesson-meta">
          <div><span class="eyebrow">Current video</span><h1>${escapeHtml(activeLesson.title)}</h1><p>${escapeHtml(activeLesson.summary)}</p></div>
          <button
            class="${isComplete ? "secondary-button" : "accent-button"}"
            data-complete="${activeLesson.id}"
            ${isReady && !isComplete ? "" : "disabled"}
          >${icons.check} ${isComplete ? "Completed" : isReady ? "OK" : "Locked"}</button>
        </div>
        <div class="resource-list">
          <h3>Material for this video</h3>
          ${activeLesson.resources.map((resource) => `
            <a class="resource-row" href="${escapeHtml(resource.url)}" ${resource.isFile ? `download="${escapeHtml(resource.title)}"` : `target="_blank" rel="noopener"`}>
              <span>File</span><span>${escapeHtml(resource.title)}</span><small>${escapeHtml(resource.type)}</small><span>${icons.download}</span>
            </a>
          `).join("")}
        </div>
      </section>
      ${assistantPanel(activeLesson.title)}
    </div>
  `;
}

function assistantPanel(contextTitle, fullPage = false) {
  return `
    <section class="assistant-panel ${fullPage ? "full-page" : ""}">
      <div class="section-heading"><div><span class="eyebrow">AI Assistant Yash</span><h3>AI assistant</h3></div><span>AI</span></div>
      <div class="assistant-link-card">
        <strong>${escapeHtml(contextTitle)}</strong>
        <p>Open AI Assistant Yash to ask questions whenever you get stuck during training.</p>
        <a class="primary-button" href="${YASH_ASSISTANT_URL}" target="_blank" rel="noopener">Open AI Assistant Yash</a>
      </div>
    </section>
  `;
}

function adminPage() {
  return `
    <section class="admin-page">
      <div class="page-title-row">
        <div><span class="eyebrow">Restricted</span><h1>Admin controls</h1></div>
        <button class="secondary-button" data-action="export-csv">${icons.download} Export intern sheet</button>
      </div>
      <div class="admin-grid">
        <section class="admin-panel wide">
          <h3>Upload Loom videos and resources</h3>
          <div class="admin-lessons">
            ${state.lessons.map((lesson, index) => `
              <div class="admin-lesson-row">
                <strong>${index + 1}. ${escapeHtml(lesson.title)}</strong>
                <label>Loom video link<input data-lesson-field="${lesson.id}:loomUrl" value="${escapeHtml(lesson.loomUrl)}" placeholder="https://www.loom.com/share/..."></label>
                <label>Lesson notes<textarea data-lesson-field="${lesson.id}:summary">${escapeHtml(lesson.summary)}</textarea></label>
                <div class="resource-editor">
                  <div class="resource-editor-heading">
                    <span>Resources for interns</span>
                    <small>Upload Excel, PDF, Word, CSV or add a government/resource link for this video.</small>
                  </div>
                  ${lesson.resources.map((resource) => `
                    <div class="resource-edit-row">
                      <input data-resource-field="${lesson.id}:${resource.id}:title" value="${escapeHtml(resource.title)}" placeholder="Resource title">
                      <input data-resource-field="${lesson.id}:${resource.id}:url" value="${escapeHtml(resource.url)}" placeholder="Paste resource link">
                      <button class="icon-button" data-remove-resource="${lesson.id}:${resource.id}" aria-label="Remove resource">${icons.delete}</button>
                    </div>
                  `).join("")}
                  <div class="resource-actions">
                    <label class="upload-resource-button">
                      Upload file
                      <input
                        type="file"
                        data-upload-resource="${lesson.id}"
                        accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.ppt,.pptx,.txt,image/*"
                      >
                    </label>
                    <button class="ghost-button" data-add-resource="${lesson.id}">${icons.add} Add link resource</button>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        </section>
        <section class="admin-panel">
          <h3>Intern accounts</h3>
          <p class="muted">This list keeps each intern account record with status and account activity dates. The export keeps only name, email ID, and password.</p>
          <div class="intern-list">
            ${state.interns.length === 0 ? `<p class="muted">No intern accounts yet.</p>` : ""}
            ${state.interns.map((intern) => `
              <div class="intern-row">
                <div>
                  <strong>${escapeHtml(intern.name)}</strong>
                  <span>${escapeHtml(intern.email)}</span>
                  <small>Status: ${intern.active ? "Active" : "Signed out"}</small>
                  <small>Joined: ${escapeHtml(intern.createdAt)}</small>
                  <small>${intern.signedOutAt ? `Signed out: ${escapeHtml(intern.signedOutAt)}` : "Signed out: Not applicable"}</small>
                  <small>${intern.passwordResetAt ? `Password reset: ${escapeHtml(intern.passwordResetAt)}` : "Password reset: Not requested"}</small>
                </div>
                ${intern.active
                  ? `<button class="danger-button" data-signout-intern="${escapeHtml(intern.email)}">Sign out</button>`
                  : `<span class="status-pill danger">Access blocked</span>`}
              </div>
            `).join("")}
          </div>
        </section>
      </div>
    </section>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      render();
    });
  });

  document.querySelectorAll("[data-open-lesson]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeLessonId = button.dataset.openLesson;
      state.view = "lesson";
      render();
    });
  });

  document.querySelectorAll("[data-select-lesson]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeLessonId = button.dataset.selectLesson;
      render();
    });
  });

  const logoutButton = document.querySelector("[data-action='logout']");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      state.session = null;
      writeStore("dsa_session", null);
      render();
    });
  }

  document.querySelectorAll("[data-complete]").forEach((button) => {
    button.addEventListener("click", () => markComplete(button.dataset.complete));
  });

  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => setAuthMode(button.dataset.authMode));
  });

  const authForm = document.getElementById("auth-form");
  if (authForm) authForm.addEventListener("submit", authSubmit);

  const resetForm = document.getElementById("reset-form");
  if (resetForm) resetForm.addEventListener("submit", passwordResetSubmit);

  const showResetButton = document.querySelector("[data-action='show-password-reset']");
  if (showResetButton) showResetButton.addEventListener("click", showPasswordReset);

  const hideResetButton = document.querySelector("[data-action='hide-password-reset']");
  if (hideResetButton) hideResetButton.addEventListener("click", hidePasswordReset);

  document.querySelectorAll("[data-lesson-field]").forEach((field) => {
    field.addEventListener("change", () => {
      const [lessonId, key] = field.dataset.lessonField.split(":");
      state.lessons = state.lessons.map((lesson) => lesson.id === lessonId ? { ...lesson, [key]: field.value } : lesson);
      writeStore("dsa_lessons", state.lessons);
    });
  });

  document.querySelectorAll("[data-resource-field]").forEach((field) => {
    field.addEventListener("change", () => {
      const [lessonId, resourceId, key] = field.dataset.resourceField.split(":");
      state.lessons = state.lessons.map((lesson) => lesson.id === lessonId ? {
        ...lesson,
        resources: lesson.resources.map((resource) => resource.id === resourceId ? { ...resource, [key]: field.value } : resource)
      } : lesson);
      writeStore("dsa_lessons", state.lessons);
    });
  });

  document.querySelectorAll("[data-add-resource]").forEach((button) => {
    button.addEventListener("click", () => {
      const lessonId = button.dataset.addResource;
      state.lessons = state.lessons.map((lesson) => lesson.id === lessonId ? {
        ...lesson,
        resources: [...lesson.resources, { id: makeId(), title: "New resource", url: "#", type: "Link" }]
      } : lesson);
      writeStore("dsa_lessons", state.lessons);
      render();
    });
  });

  document.querySelectorAll("[data-upload-resource]").forEach((input) => {
    input.addEventListener("change", () => {
      const file = input.files && input.files[0];
      if (!file) return;
      addUploadedResource(input.dataset.uploadResource, file);
    });
  });

  document.querySelectorAll("[data-remove-resource]").forEach((button) => {
    button.addEventListener("click", () => {
      const [lessonId, resourceId] = button.dataset.removeResource.split(":");
      state.lessons = state.lessons.map((lesson) => lesson.id === lessonId ? {
        ...lesson,
        resources: lesson.resources.filter((resource) => resource.id !== resourceId)
      } : lesson);
      writeStore("dsa_lessons", state.lessons);
      render();
    });
  });

  document.querySelectorAll("[data-signout-intern]").forEach((button) => {
    button.addEventListener("click", () => {
      const email = button.dataset.signoutIntern;
      state.interns = state.interns.map((intern) => intern.email === email ? {
        ...intern,
        active: false,
        signedOutAt: new Date().toLocaleString()
      } : intern);
      writeStore("dsa_interns", state.interns);
      render();
    });
  });

  const exportButton = document.querySelector("[data-action='export-csv']");
  if (exportButton) exportButton.addEventListener("click", exportCsv);
}

function setAuthMode(mode) {
  const form = document.getElementById("auth-form");
  form.dataset.mode = mode;
  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.authMode === mode);
  });
  document.getElementById("name-field").hidden = mode !== "signup";
  form.querySelector("button[type='submit']").textContent = mode === "login" ? "Login" : "Create account";
  document.getElementById("auth-message").textContent = "";
  hidePasswordReset();
}

function authSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const email = String(data.get("email") || "").trim().toLowerCase();
  const password = String(data.get("password") || "");
  const message = document.getElementById("auth-message");

  if (form.dataset.mode === "login") {
    if (email === adminAccount.email && password === adminAccount.password) {
      state.session = adminAccount;
      writeStore("dsa_session", state.session);
      render();
      return;
    }
    const intern = state.interns.find((item) => item.email === email && item.password === password);
    if (!intern) {
      message.textContent = "No matching account found. Create an intern account or use admin credentials.";
      return;
    }
    if (!intern.active) {
      message.textContent = "This intern account has been signed out by admin and cannot access the portal.";
      return;
    }
    state.session = { name: intern.name, email: intern.email, role: "intern" };
    writeStore("dsa_session", state.session);
    render();
    return;
  }

  const name = String(data.get("name") || "").trim();
  if (!name || !email || !password) {
    message.textContent = "Please enter name, email, and password.";
    return;
  }
  const existingIntern = state.interns.find((intern) => intern.email === email);
  if (existingIntern && existingIntern.active) {
    message.textContent = "An account already exists for this email.";
    return;
  }
  if (existingIntern && !existingIntern.active) {
    message.textContent = "Admin has signed out this intern. The same name and email cannot be used to create another account.";
    return;
  }
  if (state.interns.some((intern) => normalizeText(intern.name) === normalizeText(name) && intern.email === email)) {
    message.textContent = "This intern name and email are already recorded.";
    return;
  }
  const intern = {
    id: makeId(),
    name,
    email,
    password,
    active: true,
    createdAt: new Date().toLocaleString(),
    signedOutAt: "",
    passwordResetAt: ""
  };
  state.interns = [...state.interns, intern];
  writeStore("dsa_interns", state.interns);
  state.session = { name, email, role: "intern" };
  writeStore("dsa_session", state.session);
  render();
}

function markComplete(lessonId) {
  updateActiveWatchProgress();
  const lesson = state.lessons.find((item) => item.id === lessonId);
  if (!lesson || currentCompleted().includes(lessonId)) return;
  if (lesson.loomUrl && currentWatchSeconds(lessonId) < requiredWatchSeconds(lesson)) return;

  const email = state.session.email;
  const current = state.completed[email] || [];
  state.completed[email] = [...current, lessonId];
  writeStore("dsa_completed", state.completed);
  showConfetti();
  render();
}

function startLessonWatchTimer() {
  if (!state.session || state.view !== "lesson" || state.session.role === "admin") return;
  const lesson = state.lessons.find((item) => item.id === state.activeLessonId);
  if (!lesson || !lesson.loomUrl || currentCompleted().includes(lesson.id)) return;
  if (currentWatchSeconds(lesson.id) >= requiredWatchSeconds(lesson)) return;

  activeWatchSession = {
    email: state.session.email,
    lessonId: lesson.id,
    startedAt: Date.now(),
    baseSeconds: currentWatchSeconds(lesson.id)
  };
  activeWatchTimer = window.setInterval(() => {
    const nextSeconds = updateActiveWatchProgress();
    if (nextSeconds >= requiredWatchSeconds(lesson)) {
      stopLessonWatchTimer();
    }
  }, WATCH_TIMER_INTERVAL_MS);
}

function stopLessonWatchTimer() {
  updateActiveWatchProgress();
  if (!activeWatchTimer) return;
  window.clearInterval(activeWatchTimer);
  activeWatchTimer = null;
  activeWatchSession = null;
}

function updateActiveWatchProgress() {
  if (!activeWatchSession) return 0;
  const lesson = state.lessons.find((item) => item.id === activeWatchSession.lessonId);
  if (!lesson) return 0;
  const elapsedSeconds = Math.floor((Date.now() - activeWatchSession.startedAt) / 1000);
  const nextSeconds = Math.min(
    requiredWatchSeconds(lesson),
    activeWatchSession.baseSeconds + elapsedSeconds
  );
  const currentUserProgress = state.watchProgress[activeWatchSession.email] || {};
  if (nextSeconds > Number(currentUserProgress[lesson.id] || 0)) {
    state.watchProgress[activeWatchSession.email] = {
      ...currentUserProgress,
      [lesson.id]: nextSeconds
    };
    writeStore("dsa_watch_progress", state.watchProgress);
  }
  updateWatchGate(lesson, nextSeconds);
  return nextSeconds;
}

function updateWatchGate(lesson, watchedSeconds) {
  const requiredSeconds = requiredWatchSeconds(lesson);
  const watchGate = document.querySelector(".watch-gate");
  const watchBar = document.querySelector(".watch-progress .progress-bar span");
  const watchText = document.querySelector(".watch-progress small");
  const watchTitle = document.querySelector(".watch-gate h3");
  const completeButton = Array.from(document.querySelectorAll("[data-complete]"))
    .find((button) => button.dataset.complete === lesson.id);
  const watchPercent = Math.min(100, Math.round((watchedSeconds / requiredSeconds) * 100));
  const remainingSeconds = Math.max(0, requiredSeconds - watchedSeconds);

  if (watchBar) watchBar.style.width = `${watchPercent}%`;
  if (watchText) {
    watchText.textContent = `${formatTime(watchedSeconds)} watched of ${formatTime(requiredSeconds)}${remainingSeconds ? ` - ${formatTime(remainingSeconds)} remaining` : ""}`;
  }
  if (watchTitle && remainingSeconds === 0) watchTitle.textContent = "Ready to complete";
  if (watchGate && remainingSeconds === 0) watchGate.classList.add("ready");
  if (completeButton && remainingSeconds === 0) {
    completeButton.disabled = false;
    completeButton.textContent = `${icons.check} OK`;
  }
}

function currentWatchSeconds(lessonId) {
  if (!state.session) return 0;
  return Number(state.watchProgress[state.session.email]?.[lessonId] || 0);
}

function requiredWatchSeconds(lesson) {
  const savedSeconds = Number(lesson?.durationSeconds || 0);
  if (savedSeconds > 0) return Math.max(1, Math.round(savedSeconds));
  const duration = String(lesson?.duration || "");
  const minuteMatch = duration.match(/(\d+(?:\.\d+)?)\s*min/i);
  const secondMatch = duration.match(/(\d+(?:\.\d+)?)\s*sec/i);
  if (minuteMatch) return Math.max(1, Math.round(Number(minuteMatch[1]) * 60));
  if (secondMatch) return Math.max(1, Math.round(Number(secondMatch[1])));
  return 300;
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatDurationLabel(totalSeconds) {
  const seconds = Math.max(1, Math.round(Number(totalSeconds || 0)));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes && remainder) return `${minutes} min ${remainder} sec`;
  if (minutes) return `${minutes} min`;
  return `${remainder} sec`;
}

function showConfetti() {
  const confetti = document.createElement("div");
  confetti.className = "confetti-layer";
  confetti.setAttribute("aria-hidden", "true");
  confetti.innerHTML = Array.from({ length: 64 }, (_, index) => {
    const color = confettiColors[index % confettiColors.length];
    const left = Math.round(Math.random() * 100);
    const delay = Math.round(Math.random() * 320);
    const drift = Math.round((Math.random() * 160) - 80);
    const size = 8 + Math.round(Math.random() * 7);
    return `<span style="--left:${left}%;--delay:${delay}ms;--drift:${drift}px;--size:${size}px;--confetti-color:${color};"></span>`;
  }).join("");
  document.body.appendChild(confetti);
  window.setTimeout(() => confetti.remove(), 1800);
}

function showPasswordReset() {
  const resetForm = document.getElementById("reset-form");
  const authForm = document.getElementById("auth-form");
  if (!resetForm || !authForm) return;
  authForm.hidden = true;
  resetForm.hidden = false;
  document.getElementById("reset-message").textContent = "";
}

function hidePasswordReset() {
  const resetForm = document.getElementById("reset-form");
  const authForm = document.getElementById("auth-form");
  if (!resetForm || !authForm) return;
  resetForm.hidden = true;
  authForm.hidden = false;
  document.getElementById("reset-message").textContent = "";
}

function passwordResetSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const email = String(data.get("resetEmail") || "").trim().toLowerCase();
  const newPassword = String(data.get("newPassword") || "");
  const message = document.getElementById("reset-message");
  const intern = state.interns.find((item) => item.email === email);

  if (!email || !newPassword) {
    message.textContent = "Please enter your email ID and new password.";
    return;
  }
  if (!intern) {
    message.textContent = "No intern account exists for this email ID.";
    return;
  }
  if (!intern.active) {
    message.textContent = "This intern account was signed out by admin and cannot be reset.";
    return;
  }

  state.interns = state.interns.map((item) => item.email === email ? {
    ...item,
    password: newPassword,
    passwordResetAt: new Date().toLocaleString()
  } : item);
  writeStore("dsa_interns", state.interns);
  form.reset();
  message.textContent = "Password reset email confirmed. You can now log in with the new password.";
}

function normalizeText(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function addUploadedResource(lessonId, file) {
  const reader = new FileReader();
  reader.onload = () => {
    const nextLessons = state.lessons.map((lesson) => {
      if (lesson.id !== lessonId) return lesson;
      return {
        ...lesson,
        resources: [
          ...lesson.resources,
          {
            id: makeId(),
            title: file.name,
            url: reader.result,
            type: fileTypeLabel(file.name),
            isFile: true
          }
        ]
      };
    });

    try {
      state.lessons = nextLessons;
      writeStore("dsa_lessons", state.lessons);
      render();
    } catch (error) {
      alert("This file is too large for browser storage. Please upload a smaller file or add a cloud/government link instead.");
    }
  };
  reader.onerror = () => {
    alert("The file could not be uploaded. Please try again.");
  };
  reader.readAsDataURL(file);
}

function fileTypeLabel(fileName) {
  const extension = fileName.split(".").pop().toLowerCase();
  const labels = {
    xlsx: "Excel sheet",
    xls: "Excel sheet",
    csv: "CSV file",
    pdf: "PDF document",
    doc: "Word document",
    docx: "Word document",
    ppt: "Presentation",
    pptx: "Presentation",
    txt: "Text file"
  };
  return labels[extension] || "Uploaded file";
}

function exportCsv() {
  const header = ["Name", "Email ID", "Password"];
  const rows = state.interns.map((intern) => [
    intern.name,
    intern.email,
    intern.password
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).split('"').join('""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "dsa-intern-accounts-google-sheet.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function toEmbedUrl(url) {
  if (!url) return "";
  if (url.includes("loom.com/embed/")) return url;
  return url.replace("loom.com/share/", "loom.com/embed/");
}

function makeId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

window.addEventListener("focus", updateActiveWatchProgress);
document.addEventListener("visibilitychange", updateActiveWatchProgress);
window.addEventListener("beforeunload", stopLessonWatchTimer);

render();
loadSyncedVideos();
