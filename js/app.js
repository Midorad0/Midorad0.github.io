(function () {
  "use strict";

  // ---------------- i18n ----------------
  // Every key here (except the ones explicitly marked "our own chrome, not a
  // verified source string") is the real property key + German/English text
  // pulled from menu.properties / menu_de.properties in the GeoGebra source
  // (org.geogebra.common.jre.properties). The real engine underneath
  // translates itself separately via ggbApplet.setLanguage().
  const I18N = {
    de: {
      app_name: "GeoGebra Rechner Suite",
      item_clear: "Alles löschen",
      item_open: "Öffnen",
      item_share: "Teilen",
      item_export: "Bild exportieren",           // exportImage
      item_exam: "Prüfungsmodus",                // exam_menu_entry
      item_exam_end: "Prüfung beenden",          // exam_menu_exit
      examLog_header: "Prüfungsprotokoll",       // exam_log_header
      item_switch: "Rechner wechseln",           // SwitchCalculator
      item_settings: "Einstellungen",            // Settings
      item_help: "Hilfe &amp; Feedback",         // HelpAndFeedback
      rail_algebra: "Algebra",
      rail_tools: "Werkzeuge",
      rail_table: "Tabelle",
      rail_spreadsheet: "Tabellenkalkul<br>ation",
      rail_disabled_note: "Nur in der echten App verfügbar",
      btn_cancel: "Abbrechen",
      btn_exit: "Beenden",
      btn_ok: "OK",
      exam_menu_enter: "Prüfung starten",
      exam_start_dialog_text: "Während der Prüfung werden die verstrichene Zeit und der Prüfungstyp angezeigt.",
      exam_start_button: "Starten",
      exam_exit_confirmation: "Willst du den Prüfungsmodus wirklich beenden?",
      exam_log_show_screen_to_teacher: "Zeige diesen Bildschirm deiner Lehrkraft",
      Duration: "Dauer",
      exam_start_date: "Datum der Prüfung",
      exam_start_time: "Beginn der Prüfung",
      exam_end_time: "Ende der Prüfung",
      exam_alert: "Alarm",
      exam_started: "Prüfung gestartet",
      exam_ended: "Prüfung beendet",
      exam_left_app: "Fenster/App verlassen",    // our own event label - source names the mechanism (ExamUtil visibility/blur handlers) but not this exact string
      picker_title: "GeoGebra Rechner wählen",
      picker_graphing: "Grafikrechner",
      picker_3d: "3D Rechner",
      picker_geometry: "Geometrie",
      picker_cas: "CAS",
      picker_probability: "Wahrscheinlichkeit",
      picker_calculator: "Taschenrechner",
      settings_title: "Einstellungen",
      Language: "Sprache",
      Rounding: "Runden",
      Coordinates: "Koordinaten",
      AngleUnit: "Winkeleinheit",
      Degree: "Grad",
      Radiant: "Radiant",
      DegreesMinutesSeconds: "Grad, Minuten, Sekunden",
      settings_fontsize: "Schriftgröße"          // our own wrapper label
    },
    en: {
      app_name: "GeoGebra Calculator Suite",
      item_clear: "Clear All",
      item_open: "Open",
      item_share: "Share",
      item_export: "Export Image",
      item_exam: "Exam Mode",
      item_exam_end: "Exit Exam",
      examLog_header: "Exam Details",
      item_switch: "Switch Calculator",
      item_settings: "Settings",
      item_help: "Help &amp; Feedback",
      rail_algebra: "Algebra",
      rail_tools: "Tools",
      rail_table: "Table",
      rail_spreadsheet: "Spread<br>sheet",
      rail_disabled_note: "Only available in the real app",
      btn_cancel: "Cancel",
      btn_exit: "Exit",
      btn_ok: "OK",
      exam_menu_enter: "Start Exam",
      exam_start_dialog_text: "Time elapsed and exam type will be shown during the exam.",
      exam_start_button: "Start",
      exam_exit_confirmation: "Do you really want to exit Exam Mode?",
      exam_log_show_screen_to_teacher: "Show this screen to your teacher",
      Duration: "Duration",
      exam_start_date: "Exam date",
      exam_start_time: "Exam start",
      exam_end_time: "Exam end",
      exam_alert: "Alert",
      exam_started: "Exam started",
      exam_ended: "Exam ended",
      exam_left_app: "Window/app left",
      picker_title: "Choose GeoGebra Calculator",
      picker_graphing: "Graphing",
      picker_3d: "3D Calculator",
      picker_geometry: "Geometry",
      picker_cas: "CAS",
      picker_probability: "Probability",
      picker_calculator: "Scientific",
      settings_title: "Settings",
      Language: "Language",
      Rounding: "Rounding",
      Coordinates: "Coordinates",
      AngleUnit: "Angle Unit",
      Degree: "Degree",
      Radiant: "Radians",
      DegreesMinutesSeconds: "Degrees, minutes, seconds",
      settings_fontsize: "Font Size"
    }
  };

  let currentLang = "de";

  function dict() { return I18N[currentLang]; }

  function applyLanguage(lang) {
    currentLang = I18N[lang] ? lang : "de";
    const d = dict();
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (d[key] !== undefined) el.innerHTML = d[key];
    });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.dataset.i18nTitle;
      if (d[key] !== undefined) {
        el.title = d[key];
        el.setAttribute("aria-label", d[key]);
      }
    });
    document.getElementById("menuBtn").setAttribute("aria-label", currentLang === "de" ? "Menü öffnen" : "Open menu");
    document.getElementById("settingsClose").setAttribute("aria-label", currentLang === "de" ? "Schließen" : "Close");
    document.getElementById("appPickerLabel").textContent = d[SUITE_APPS[currentAppCode].key];
    updateExamDrawerVisibility();
  }

  // ---------------- real GeoGebra engine (official embedding API) ----------------
  let ggbApplet = null;
  const ggbLoading = document.getElementById("ggbLoading");
  const ggbContainer = document.getElementById("ggbContainer");
  const ggbArea = document.getElementById("ggbArea");

  function onGgbAppletLoaded() {
    ggbApplet = window.ggbApplet;
    ggbLoading.hidden = true;
    resizeGgb();
  }

  function resizeGgb() {
    if (!ggbApplet) return;
    const rect = ggbArea.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      ggbContainer.style.width = w + "px";
      ggbContainer.style.height = h + "px";
      ggbApplet.setSize(w, h);
    }
  }

  function initGgb() {
    const rect = ggbArea.getBoundingClientRect();
    const params = {
      appName: "suite",
      width: Math.max(320, Math.round(rect.width)),
      height: Math.max(320, Math.round(rect.height)),
      showMenuBar: false,
      showToolBar: false,
      showAlgebraInput: true,
      showResetIcon: false,
      enableFileFeatures: false,
      enableShiftDragZoom: true,
      showZoomButtons: false,
      showFullscreenButton: false,
      allowStyleBar: false,
      perspective: "AG",
      language: "de",
      appletOnLoad: onGgbAppletLoaded
    };
    const applet = new GGBApplet(params, true);
    applet.inject("ggbContainer");
  }

  let ggbInitStarted = false;
  function initGgbOnce() {
    if (ggbInitStarted) return;
    ggbInitStarted = true;
    initGgb();
  }
  if (document.readyState === "complete") initGgbOnce();
  else window.addEventListener("load", initGgbOnce);
  window.addEventListener("resize", resizeGgb);
  new ResizeObserver(resizeGgb).observe(ggbArea);

  // ---------------- toast ----------------
  const toastEl = document.getElementById("toast");
  let toastTimer = null;
  function showToast(text) {
    toastEl.textContent = text;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  // ---------------- overlay bookkeeping ----------------
  const drawerOverlay = document.getElementById("drawerOverlay");
  const examStartOverlay = document.getElementById("examStartOverlay");
  const examExitOverlay = document.getElementById("examExitOverlay");
  const examLogOverlay = document.getElementById("examLogOverlay");
  const pickerScreen = document.getElementById("pickerScreen");
  const settingsOverlay = document.getElementById("settingsOverlay");

  function closeAllOverlays() {
    [drawerOverlay, examStartOverlay, examExitOverlay, examLogOverlay, settingsOverlay].forEach((o) => o.classList.remove("open"));
    pickerScreen.classList.remove("open");
  }

  document.getElementById("menuBtn").addEventListener("click", () => {
    closeAllOverlays();
    drawerOverlay.classList.add("open");
  });
  drawerOverlay.addEventListener("click", (e) => { if (e.target === drawerOverlay) closeAllOverlays(); });

  document.getElementById("headerLogo").addEventListener("click", () => {
    // GlobalHeader#initLogo: normally opens the GeoGebra homepage; disabled
    // during exam in the source (logo href swapped to "#") - same here.
    if (!examActive) window.open("https://www.geogebra.org", "_blank", "noopener");
  });

  // ---------------- drawer: normal vs exam item sets ----------------
  const drawerNormal = document.getElementById("drawerNormal");
  const drawerExam = document.getElementById("drawerExam");
  function updateExamDrawerVisibility() {
    drawerNormal.hidden = examActive;
    drawerExam.hidden = !examActive;
  }

  document.getElementById("clearAllItem").addEventListener("click", clearAll);
  document.getElementById("clearAllItemExam").addEventListener("click", clearAll);
  function clearAll() { if (ggbApplet) ggbApplet.reset(); closeAllOverlays(); }

  document.getElementById("openItem").addEventListener("click", openFile);
  document.getElementById("openItemExam").addEventListener("click", openFile);
  const openFileInput = document.createElement("input");
  openFileInput.type = "file";
  openFileInput.accept = ".ggb,.ggs";
  openFileInput.hidden = true;
  document.body.appendChild(openFileInput);
  function openFile() {
    closeAllOverlays();
    openFileInput.value = "";
    openFileInput.click();
  }
  openFileInput.addEventListener("change", () => {
    const file = openFileInput.files[0];
    if (!file || !ggbApplet) return;
    const reader = new FileReader();
    reader.onload = () => ggbApplet.setBase64(String(reader.result).split(",")[1]);
    reader.readAsDataURL(file);
  });

  function exportImageDataUri() {
    if (!ggbApplet) return null;
    return "data:image/png;base64," + ggbApplet.getPNGBase64(1, false, 300, false, false);
  }
  document.getElementById("exportImageItem").addEventListener("click", () => {
    const uri = exportImageDataUri();
    closeAllOverlays();
    if (!uri) return;
    const a = document.createElement("a");
    a.href = uri;
    a.download = "geogebra.png";
    a.click();
  });

  document.getElementById("shareItem").addEventListener("click", async () => {
    const uri = exportImageDataUri();
    closeAllOverlays();
    if (!uri) return;
    const blob = await (await fetch(uri)).blob();
    const file = new File([blob], "geogebra.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: dict().app_name }); } catch (e) { /* cancelled */ }
      return;
    }
    const a = document.createElement("a");
    a.href = uri;
    a.download = "geogebra.png";
    a.click();
  });
  document.getElementById("headerShareBtn").addEventListener("click", () => document.getElementById("shareItem").click());

  document.getElementById("helpItem").addEventListener("click", () => {
    closeAllOverlays();
    // real FORUM_URL constant, org.geogebra.common.GeoGebraConstants
    window.open("https://help.geogebra.org/", "_blank", "noopener");
  });

  // ---------------- settings ----------------
  function openSettings() { closeAllOverlays(); settingsOverlay.classList.add("open"); }
  document.getElementById("settingsItem").addEventListener("click", openSettings);
  document.getElementById("settingsClose").addEventListener("click", closeAllOverlays);
  settingsOverlay.addEventListener("click", (e) => { if (e.target === settingsOverlay) closeAllOverlays(); });

  document.getElementById("settingLanguage").addEventListener("change", (e) => {
    if (ggbApplet) ggbApplet.setLanguage(e.target.value);
    applyLanguage(e.target.value);
  });
  document.getElementById("settingRounding").addEventListener("change", (e) => {
    if (ggbApplet) ggbApplet.setRounding(e.target.value);
  });
  // Coordinates / Angle Unit / Font Size: no public GgbAPI setter exists for
  // any of these in the source (kernel.setCoordStyle / kernel.setAngleUnit
  // are internal-only, and the only public "font" call - setFont(label,
  // size, bold, italic, serif) in DefaultExportedApi.java - sets a single
  // labeled object's font, not an applet-wide size) - all three fields are
  // kept for visual fidelity but stay display-only.

  // ---------------- icon rail ----------------
  const navRail = document.getElementById("navRail");
  const railAlgebra = document.getElementById("railAlgebra");
  const railTools = document.getElementById("railTools");
  [railAlgebra, railTools].forEach((btn) => {
    btn.addEventListener("click", () => {
      [railAlgebra, railTools].forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const code = btn.dataset.perspective;
      // NavigationRail's real handlers (openAlgebra/openTools) are internal
      // ToolbarPanel calls with no public-API equivalent; setPerspective()
      // approximates the same visual result (hide/show the algebra list).
      if (ggbApplet && code) ggbApplet.setPerspective(code);
    });
  });
  [document.getElementById("railTable"), document.getElementById("railSpreadsheet")].forEach((btn) => {
    btn.addEventListener("click", () => showToast(dict().rail_disabled_note));
  });

  // ---------------- calculator switcher (real switchCalculator API) --------
  // SuiteSubApp enum, org.geogebra.common.SuiteSubApp - fixed real order/codes
  const SUITE_APPS = {
    graphing: { icon: "assets/icons/picker-graphing.svg", key: "picker_graphing" },
    "3d": { icon: "assets/icons/picker-3d.svg", key: "picker_3d" },
    geometry: { icon: "assets/icons/picker-geometry.svg", key: "picker_geometry" },
    cas: { icon: "assets/icons/picker-cas.svg", key: "picker_cas" },
    probability: { icon: "assets/icons/picker-probability.svg", key: "picker_probability" },
    scientific: { icon: "assets/icons/picker-calculator.svg", key: "picker_calculator" }
  };
  let currentAppCode = "graphing";
  const pickerScreenItems = document.querySelectorAll(".picker-item");
  const appPickerIcon = document.getElementById("appPickerIcon");
  const appPickerLabel = document.getElementById("appPickerLabel");

  function openPicker() { closeAllOverlays(); pickerScreen.classList.add("open"); }
  document.getElementById("switchCalcItem").addEventListener("click", openPicker);
  document.getElementById("switchCalcItemExam").addEventListener("click", openPicker);
  document.getElementById("appPickerPill").addEventListener("click", openPicker);
  document.getElementById("pickerClose").addEventListener("click", closeAllOverlays);

  pickerScreenItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const code = btn.dataset.app;
      pickerScreenItems.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      currentAppCode = code;
      appPickerIcon.src = SUITE_APPS[code].icon;
      appPickerLabel.textContent = dict()[SUITE_APPS[code].key];
      // Real, if undocumented, public embedding-API call - the same method
      // CalculatorSwitcherDialog/AppSwitcherPopup use internally
      // (AppWFull#switchToSubapp via GgbAPIW#switchCalculator). Flag: this
      // isn't on GeoGebra's official documented API page and could change.
      if (ggbApplet && ggbApplet.switchCalculator) ggbApplet.switchCalculator(code);
      closeAllOverlays();
    });
  });

  // ---------------- exam mode ----------------
  // ExamController state, mirrored client-side: IDLE -> ACTIVE -> IDLE.
  let examActive = false;
  let examCheating = false;
  let examTimerHandle = null;
  let examSecondsElapsed = 0;
  let examStartDate = null;
  const examEvents = [];

  const examPanel = document.getElementById("examPanel");
  const headerButtons = document.getElementById("headerButtons");
  const examTimerEl = document.getElementById("examTimer");

  function formatDuration(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  }
  // ExamController#getDurationFormatted -> "\j \F \Y" / "\H:\i:\s" style
  function formatLongDate(d) {
    const locale = currentLang === "de" ? "de-DE" : "en-US";
    return d ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(d) : "–";
  }
  function formatClockTime(d) {
    const locale = currentLang === "de" ? "de-DE" : "en-US";
    return d ? new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(d) : "–";
  }

  document.getElementById("examStartItem").addEventListener("click", () => {
    closeAllOverlays();
    examStartOverlay.classList.add("open");
  });
  document.getElementById("examStartCancel").addEventListener("click", closeAllOverlays);
  document.getElementById("examStartConfirm").addEventListener("click", () => {
    closeAllOverlays();
    startExam();
  });

  function startExam() {
    // StartExamAction#showExamDialog: app.fileNew() + examController.startExam()
    if (ggbApplet) ggbApplet.reset();
    examActive = true;
    examCheating = false;
    examSecondsElapsed = 0;
    examStartDate = new Date();
    examEvents.length = 0;
    examEvents.push({ seconds: 0, key: "exam_started" });

    navRail.classList.add("exam-ok");
    headerButtons.hidden = true;
    examPanel.hidden = false;
    examTimerEl.textContent = formatDuration(0);
    updateExamDrawerVisibility();

    const shell = document.getElementById("appShell");
    if (shell.requestFullscreen) shell.requestFullscreen().catch(() => {});

    examTimerHandle = setInterval(() => {
      examSecondsElapsed += 1;
      const formatted = formatDuration(examSecondsElapsed);
      examTimerEl.textContent = formatted;
      const liveEl = document.getElementById("examLogLiveDuration");
      if (liveEl) liveEl.textContent = formatted;
    }, 1000);
  }

  function endExam() {
    clearInterval(examTimerHandle);
    examTimerHandle = null;
    examActive = false;
    navRail.classList.remove("exam-ok", "exam-cheat");
    headerButtons.hidden = false;
    examPanel.hidden = true;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    updateExamDrawerVisibility();
  }

  function markCheating() {
    if (!examActive || examCheating) return;
    examCheating = true;
    examEvents.push({ seconds: examSecondsElapsed, key: "exam_left_app" });
    navRail.classList.remove("exam-ok");
    navRail.classList.add("exam-cheat");
  }
  // ExamUtil#addVisibilityAndBlurHandlers: flags leaving the tab/window
  // during an active exam. Real source doesn't expose the exact event
  // vocabulary, so the "left app" line is our own honest label, not a
  // quoted source string.
  document.addEventListener("visibilitychange", () => { if (document.hidden) markCheating(); });
  window.addEventListener("blur", markCheating);

  document.getElementById("examExitItem").addEventListener("click", () => {
    closeAllOverlays();
    examExitOverlay.classList.add("open");
  });
  document.getElementById("examExitCancel").addEventListener("click", closeAllOverlays);
  document.getElementById("examExitConfirm").addEventListener("click", () => {
    closeAllOverlays();
    openExamLogDialog("summary");
  });

  document.getElementById("examInfoBtn").addEventListener("click", () => {
    closeAllOverlays();
    openExamLogDialog("log");
  });
  document.getElementById("examLogItem").addEventListener("click", () => {
    closeAllOverlays();
    openExamLogDialog("log");
  });

  function row(label, value) {
    return `<div class="exam-log-row"><span class="exam-log-label">${label}</span><span class="exam-log-value">${value}</span></div>`;
  }

  function buildActivityLog() {
    const d = dict();
    return examEvents.map((ev) => `${formatDuration(ev.seconds)} ${d[ev.key]}`).join("\n");
  }

  function openExamLogDialog(variant) {
    const d = dict();
    document.getElementById("examLogCalcType").textContent = d[SUITE_APPS[currentAppCode].key];
    document.getElementById("examLogStatus").textContent = `${d.item_exam}: ${examCheating ? d.exam_alert : "OK"}`;
    document.getElementById("examAlertIcon").hidden = !examCheating;
    document.getElementById("examLogTitlePanel").classList.toggle("cheating", examCheating);

    let html = "";
    if (variant === "summary") {
      html += `<p class="exam-log-teacher">${d.exam_log_show_screen_to_teacher}</p>`;
      html += row(d.Duration, formatDuration(examSecondsElapsed));
      html += row(d.exam_start_date, formatLongDate(examStartDate));
      html += row(d.exam_start_time, formatClockTime(examStartDate));
      html += row(d.exam_end_time, formatClockTime(new Date()));
    } else {
      html += row(d.exam_start_date, formatLongDate(examStartDate));
      html += row(d.exam_start_time, formatClockTime(examStartDate));
      html += `<div class="exam-log-row"><span class="exam-log-label">${d.Duration}</span><span class="exam-log-value" id="examLogLiveDuration">${formatDuration(examSecondsElapsed)}</span></div>`;
    }
    if (examCheating) {
      html += `<pre class="exam-log-activity">${buildActivityLog()}</pre>`;
    }
    document.getElementById("examLogContent").innerHTML = html;

    const okBtn = document.getElementById("examLogOk");
    okBtn.textContent = variant === "summary" ? d.btn_exit : d.btn_ok;
    okBtn.onclick = variant === "summary" ? () => { closeAllOverlays(); endExam(); } : closeAllOverlays;

    closeAllOverlays();
    examLogOverlay.classList.add("open");
  }

  applyLanguage("de");
})();
