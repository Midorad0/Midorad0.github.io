(function () {
  "use strict";

  // ---------------- i18n ----------------
  // Small dictionary covering only our own chrome (rail, drawer, dialogs,
  // picker, settings panel). The real engine underneath translates itself
  // via ggbApplet.setLanguage().
  const I18N = {
    de: {
      app_name: "GeoGebra Rechner Suite",
      item_clear: "Alles löschen",
      item_open: "Öffnen",
      item_share: "Teilen",
      item_export: "Bild exportieren",
      item_exam: "Prüfungsmodus",
      item_exam_end: "Prüfung beenden",
      examLog_header: "Prüfungsprotokoll",
      item_switch: "Rechner wechseln",
      item_settings: "Einstellungen",
      item_help: "Hilfe &amp; Feedback",
      rail_algebra: "Algebra",
      rail_tools: "Werkzeuge",
      rail_table: "Tabelle",
      rail_spreadsheet: "Tabellenkalkul<br>ation",
      examPrep_title: "Prüfungsmodus vorbereiten",
      examPrep_body: "Aktiviere bitte den Flugmodus und deaktiviere deine Wi-Fi und Bluetooth Verbindung um weiterzumachen.",
      btn_cancel: "Abbrechen",
      btn_next: "Weiter",
      iosAlert_title: "Einschränkung durch App bestätigen",
      iosAlert_body: "GeoGebra möchte den Bewertungsmodus starten. Andere Apps können auf iPad erst wieder verwendet werden, wenn GeoGebra den Bewertungsmodus beendet. Möchtest du das zulassen?",
      btn_no: "Nein",
      btn_yes: "Ja",
      examExit_title: "Prüfung beenden?",
      examExit_body: "Willst du den Prüfungsmodus wirklich beenden?",
      btn_end: "Beenden",
      examFeedback_teacher: "Zeige diesen Bildschirm deiner Lehrkraft",
      examFeedback_duration: "Dauer",
      examFeedback_date: "Datum der Prüfung",
      examFeedback_start: "Beginn der Prüfung",
      examFeedback_end: "Ende der Prüfung",
      btn_ok: "OK",
      picker_title: "GeoGebra Rechner wählen",
      picker_graphing: "Grafikrechner",
      picker_3d: "3D Rechner",
      picker_geometry: "Geometrie",
      picker_cas: "CAS",
      picker_probability: "Wahrscheinlichkeit",
      picker_calculator: "Taschenrechner",
      settings_title: "Einstellungen",
      settings_language: "Sprache",
      settings_rounding: "Runden",
      settings_coords: "Koordinaten",
      settings_angle: "Winkeleinheit",
      settings_fontsize: "Schriftgröße",
      settings_decimals: "Dezimalstellen",
      settings_degrees: "Grad",
      settings_radians: "Radiant",
      exam_status_ok: "Prüfungsmodus: OK"
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
      examPrep_title: "Prepare Exam Mode",
      examPrep_body: "Please turn on flight mode and turn off your Wi-Fi and Bluetooth connection to continue.",
      btn_cancel: "Cancel",
      btn_next: "Next",
      iosAlert_title: "Confirm Restriction by App",
      iosAlert_body: "GeoGebra would like to start Assessment Mode. Other apps won't be usable on iPad until GeoGebra ends Assessment Mode. Do you want to allow this?",
      btn_no: "No",
      btn_yes: "Yes",
      examExit_title: "End Exam?",
      examExit_body: "Do you really want to end exam mode?",
      btn_end: "Exit",
      examFeedback_teacher: "Show this screen to your teacher",
      examFeedback_duration: "Duration",
      examFeedback_date: "Exam date",
      examFeedback_start: "Exam start",
      examFeedback_end: "Exam end",
      btn_ok: "OK",
      picker_title: "Choose GeoGebra Calculator",
      picker_graphing: "Graphing Calculator",
      picker_3d: "3D Calculator",
      picker_geometry: "Geometry",
      picker_cas: "CAS",
      picker_probability: "Probability",
      picker_calculator: "Scientific Calculator",
      settings_title: "Settings",
      settings_language: "Language",
      settings_rounding: "Rounding",
      settings_coords: "Coordinates",
      settings_angle: "Angle Unit",
      settings_fontsize: "Font Size",
      settings_decimals: "decimal places",
      settings_degrees: "Degree",
      settings_radians: "Radian",
      exam_status_ok: "Exam Mode: OK"
    }
  };

  let currentLang = "de";

  function applyLanguage(lang) {
    currentLang = I18N[lang] ? lang : "de";
    const dict = I18N[currentLang];
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });
    document.querySelectorAll("#settingRounding option[data-decimals]").forEach((opt) => {
      opt.textContent = `${opt.dataset.decimals} ${dict.settings_decimals}`;
    });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.dataset.i18nTitle;
      if (dict[key] !== undefined) {
        el.title = dict[key];
        el.setAttribute("aria-label", dict[key]);
      }
    });
    document.getElementById("hamburgerBtn").setAttribute(
      "aria-label", currentLang === "de" ? "Menü öffnen" : "Open menu");
    document.getElementById("settingsClose").setAttribute(
      "aria-label", currentLang === "de" ? "Schließen" : "Close");
    updateExamMenuItem();
  }

  // ---------------- real GeoGebra engine (official embedding API) ----------------
  // Our own hamburger/icon-rail/gear/drawer stay as the only visible chrome;
  // everything below is the real, working math engine — not a recreation.
  let ggbApplet = null;
  const ggbLoading = document.getElementById("ggbLoading");
  const ggbContainer = document.getElementById("ggbContainer");
  // Measure from the plain wrapper, not #ggbContainer itself: GGBApplet's
  // embed script stamps an inline px width/height straight onto #ggbContainer
  // at inject time and again on every internal reflow, so reading its own
  // rect back would just echo whatever (often too-small) size it last set —
  // the dead-space/black-bar bug. The wrapper is never touched by GGB, so its
  // rect always reflects the real available space.
  const ggbContent = document.getElementById("ggbContent");

  function onGgbAppletLoaded() {
    ggbApplet = window.ggbApplet;
    ggbLoading.hidden = true;
    resizeGgb();
  }

  function resizeGgb() {
    if (!ggbApplet) return;
    const rect = ggbContent.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      ggbContainer.style.width = w + "px";
      ggbContainer.style.height = h + "px";
      ggbApplet.setSize(w, h);
    }
  }

  function initGgb() {
    const rect = ggbContent.getBoundingClientRect();
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

  if (document.readyState === "complete") {
    initGgbOnce();
  } else {
    window.addEventListener("load", initGgbOnce);
  }

  window.addEventListener("resize", resizeGgb);
  new ResizeObserver(resizeGgb).observe(ggbContent);

  // ---------------- view/dialog switching ----------------
  const drawerOverlay = document.getElementById("drawerOverlay");
  const examPrepOverlay = document.getElementById("examPrepOverlay");
  const iosAlertOverlay = document.getElementById("iosAlertOverlay");
  const examExitOverlay = document.getElementById("examExitOverlay");
  const examFeedbackOverlay = document.getElementById("examFeedbackOverlay");
  const examLogOverlay = document.getElementById("examLogOverlay");
  const pickerScreen = document.getElementById("pickerScreen");
  const settingsOverlay = document.getElementById("settingsOverlay");

  function closeAllOverlays() {
    drawerOverlay.classList.remove("open");
    examPrepOverlay.classList.remove("open");
    iosAlertOverlay.classList.remove("open");
    examExitOverlay.classList.remove("open");
    examFeedbackOverlay.classList.remove("open");
    examLogOverlay.classList.remove("open");
    pickerScreen.classList.remove("open");
    settingsOverlay.classList.remove("open");
  }

  document.getElementById("hamburgerBtn").addEventListener("click", () => {
    closeAllOverlays();
    drawerOverlay.classList.add("open");
  });
  drawerOverlay.addEventListener("click", (e) => {
    if (e.target === drawerOverlay) closeAllOverlays();
  });

  // real: while exam mode is active the File menu collapses to a single
  // "Prüfung beenden" (exam_menu_exit) entry that jumps straight to the exit
  // confirmation — no prep flow shown again. Our drawer's exam item mirrors
  // that by swapping its icon/label (see startExam/endExam below) and
  // branching here on whether an exam is currently running.
  document.getElementById("examMenuItem").addEventListener("click", () => {
    closeAllOverlays();
    if (examTimerHandle) {
      examExitOverlay.classList.add("open");
    } else {
      examPrepOverlay.classList.add("open");
    }
  });
  document.getElementById("examPrepCancel").addEventListener("click", closeAllOverlays);

  // "Weiter" is a test-only affordance: a browser cannot detect real flight-mode/
  // Wi-Fi/Bluetooth state the way the native iPad app does, so this simulates the
  // OS accepting it and moves on to the native confirmation alert, purely so the
  // rest of the flow can be reviewed.
  document.getElementById("examPrepNext").addEventListener("click", () => {
    closeAllOverlays();
    iosAlertOverlay.classList.add("open");
  });

  document.getElementById("switchCalcItem").addEventListener("click", () => {
    closeAllOverlays();
    pickerScreen.classList.add("open");
  });
  document.getElementById("pickerClose").addEventListener("click", closeAllOverlays);

  // real: clears the construction via the engine, same as the native app's
  // "Alles löschen" menu item
  document.getElementById("clearAllItem").addEventListener("click", () => {
    if (ggbApplet) ggbApplet.reset();
    closeAllOverlays();
  });

  // ---------------- settings panel (real content: Sprache/Runden/
  // Koordinaten/Winkeleinheit/Schriftgröße from GeoGebra's own "Allgemein"
  // tab). Sprache/Runden/Schriftgröße are wired to the real engine;
  // Koordinaten/Winkeleinheit have no public API hook and stay display-only. ---
  function openSettings() {
    closeAllOverlays();
    settingsOverlay.classList.add("open");
  }
  document.getElementById("settingsItem").addEventListener("click", openSettings);
  document.getElementById("topGearBtn").addEventListener("click", openSettings);
  document.getElementById("settingsClose").addEventListener("click", closeAllOverlays);
  settingsOverlay.addEventListener("click", (e) => {
    if (e.target === settingsOverlay) closeAllOverlays();
  });

  document.getElementById("settingLanguage").addEventListener("change", (e) => {
    const lang = e.target.value;
    if (ggbApplet) ggbApplet.setLanguage(lang);
    applyLanguage(lang);
  });
  document.getElementById("settingRounding").addEventListener("change", (e) => {
    if (ggbApplet) ggbApplet.setRounding(Number(e.target.value));
  });
  document.getElementById("settingFontSize").addEventListener("change", (e) => {
    if (ggbApplet) ggbApplet.setFont(Number(e.target.value));
  });

  // ---------------- icon rail: switch the real perspective ----------------
  const railItems = document.querySelectorAll(".rail-item");
  railItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      railItems.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const code = btn.dataset.perspective;
      if (ggbApplet && code) {
        ggbApplet.setPerspective(code);
      }
    });
  });

  // ---------------- exam mode: active state (navigation rail turns teal,
  // timer starts) — mirrors NavigationRail's examOk state + GlobalHeader's
  // timer/exam-info-button pairing from the real source. The underlying OS
  // restriction (Guided Access / flight mode) can never really be enforced
  // from a browser — clicking "Ja" here only simulates GeoGebra's own
  // reaction to iOS having granted it. ----------------
  const iconRail = document.getElementById("iconRail");
  const topGearBtn = document.getElementById("topGearBtn");
  const examTopPanel = document.getElementById("examTopPanel");
  const examTopTimerEl = document.getElementById("examTopTimer");
  const examMenuIcon = document.getElementById("examMenuIcon");
  const examMenuLabel = document.getElementById("examMenuLabel");
  let examTimerHandle = null;
  let examSecondsElapsed = 0;
  let examStartDate = null;

  function formatDuration(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function formatDate(d) {
    return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
  }

  function formatTime(d) {
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  // drawer's exam item mirrors the real File menu: "Prüfungsmodus" (start)
  // while no exam runs, "Prüfung beenden" (exam_menu_exit, sign-out icon)
  // while one is active — see FileMenuW/ExitExamAction in the source.
  function updateExamMenuItem() {
    const dict = I18N[currentLang];
    if (examTimerHandle) {
      examMenuIcon.src = "assets/icons/signout.svg";
      examMenuLabel.textContent = dict.item_exam_end;
    } else {
      examMenuIcon.src = "assets/icons/hourglass.svg";
      examMenuLabel.textContent = dict.item_exam;
    }
  }

  function startExam() {
    examSecondsElapsed = 0;
    examStartDate = new Date();
    examTopTimerEl.textContent = formatDuration(0);
    iconRail.classList.add("exam-active");
    // mirrors GlobalHeader.addExamTimer: normal header buttons hide, the
    // exam panel (timer + info button) takes their place instead
    topGearBtn.hidden = true;
    examTopPanel.hidden = false;
    examTimerHandle = setInterval(() => {
      examSecondsElapsed += 1;
      const formatted = formatDuration(examSecondsElapsed);
      examTopTimerEl.textContent = formatted;
      if (examLogOverlay.classList.contains("open")) {
        document.getElementById("examLogDuration").textContent = formatted;
      }
    }, 1000);
    updateExamMenuItem();
  }

  function endExam() {
    clearInterval(examTimerHandle);
    examTimerHandle = null;
    iconRail.classList.remove("exam-active");
    topGearBtn.hidden = false;
    examTopPanel.hidden = true;
    updateExamMenuItem();
  }

  function showExamFeedback() {
    const dict = I18N[currentLang];
    const now = new Date();
    document.getElementById("examFeedbackCalcType").textContent = dict.picker_graphing;
    document.getElementById("examFeedbackStatus").textContent = dict.exam_status_ok;
    document.getElementById("examFeedbackDuration").textContent = formatDuration(examSecondsElapsed);
    document.getElementById("examFeedbackDate").textContent = examStartDate ? formatDate(examStartDate) : "–";
    document.getElementById("examFeedbackStart").textContent = examStartDate ? formatTime(examStartDate) : "–";
    document.getElementById("examFeedbackEnd").textContent = formatTime(now);
    closeAllOverlays();
    examFeedbackOverlay.classList.add("open");
  }

  // tapping the info button in the exam panel opens the "log" variant of the
  // same dialog WHILE the exam keeps running (ExamLogAndExitDialog(app, true,
  // ...) via GuiManagerW.showExamInfoDialog) — no teacher line, no end time,
  // just a live running duration; its "OK" button only closes the dialog.
  function showExamLog() {
    const dict = I18N[currentLang];
    document.getElementById("examLogCalcType").textContent = dict.picker_graphing;
    document.getElementById("examLogStatus").textContent = dict.exam_status_ok;
    document.getElementById("examLogDate").textContent = examStartDate ? formatDate(examStartDate) : "–";
    document.getElementById("examLogStart").textContent = examStartDate ? formatTime(examStartDate) : "–";
    document.getElementById("examLogDuration").textContent = formatDuration(examSecondsElapsed);
    closeAllOverlays();
    examLogOverlay.classList.add("open");
  }
  document.getElementById("examInfoBtn").addEventListener("click", showExamLog);
  document.getElementById("examLogOk").addEventListener("click", closeAllOverlays);

  document.getElementById("iosAlertNo").addEventListener("click", closeAllOverlays);
  document.getElementById("iosAlertYes").addEventListener("click", () => {
    closeAllOverlays();
    startExam();
  });

  document.getElementById("examExitCancel").addEventListener("click", closeAllOverlays);
  document.getElementById("examExitConfirm").addEventListener("click", () => {
    // real flow: confirming exit shows the exam log/feedback screen first
    // ("Zeige diesen Bildschirm deiner Lehrkraft" + duration/date/times);
    // the exam only actually ends once that screen is acknowledged.
    showExamFeedback();
  });
  document.getElementById("examFeedbackOk").addEventListener("click", () => {
    closeAllOverlays();
    endExam();
  });

  applyLanguage("de");
})();
