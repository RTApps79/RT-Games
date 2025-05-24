// ===========================
// LINAC Console Emulator Logic (with QA, MLC, Realistic Case & Image Alignment)
// ===========================

/* -----------------------------
   GLOBAL VARIABLES & CONSTANTS
------------------------------*/
const energyOptions = ['6 MV', '10 MV', '15 MV', '18 MV', '6 MeV', '9 MeV', '12 MeV', '15 MeV', '18 MeV'];
let currentEnergyIndex = 0;
let selectedEnergy = energyOptions[0];

let isPrepared = false;
let isBeaming = false;
let isDoorOpen = false;
let deliveredMU = 0;
let setMU = 0;
let beamTimeoutId = null;
let gantryAngle = 0;
let collimatorAngle = 0;
let couchAngle = 0;
let jawX1 = 5.0, jawX2 = 5.0, jawY1 = 5.0, jawY2 = 5.0;
let fieldAdjustmentLocked = false;
let currentLoadedPlan = null;
let loadedFieldIndex = -1;

let overlayOffsetX = 0, overlayOffsetY = 0, initialOverlayShiftX = 0, initialOverlayShiftY = 0;
const alignmentTolerance = 2;
let correctCaseAlignments = 0;
let hasCurrentCaseAlignmentBeenCounted = false;
const defaultImageUrl = "https://via.placeholder.com/400x300.png?text=Load+Case";

/* --- Overlay Manipulation --- */
let overlayOpacity = 0.5;
let overlayRotationAngle = 0;
let overlayScale = 1.0;
let overlayBrightness = 100;
let overlayContrast = 100;
const ROTATION_STEP = 1;
const SCALE_STEP_MULTIPLIER = 1.1;
const MIN_SCALE = 0.2;
const MAX_SCALE = 5.0;

/* --- MLC Visualizer --- */
const NUM_LEAF_PAIRS = 5;
let leftLeafPositions = Array(NUM_LEAF_PAIRS).fill(jawX1);
let rightLeafPositions = Array(NUM_LEAF_PAIRS).fill(jawX2);
const fieldDisplayContainerSize = 220;
const centerPx = fieldDisplayContainerSize / 2.0;
const maxFieldCoordinate = 20.0;
const scaleFactor = (fieldDisplayContainerSize / 2.0) / maxFieldCoordinate;

/* --- QA / Interlocks --- */
let overrideActive = false;

/* --- DOM ELEMENTS --- */
const baseImageElement = document.getElementById('baseImage');
const overlayImageElement = document.getElementById('overlayImage');
const opacitySlider = document.getElementById('opacitySlider');
const opacityValueDisplay = document.getElementById('opacityValue');
const alignmentMessage = document.getElementById('alignmentMessage');
const shiftFeedback = document.getElementById('shiftFeedback');
const alignmentCounterDisplay = document.getElementById('alignmentCounterDisplay');
const statusBar = document.getElementById('status-bar') || document.getElementById('local-status-bar');
const treatmentTabContent = document.getElementById('treatment');
const generateCaseBtn = document.getElementById('generateCaseBtn');

/* --- Data for Case Generation --- */
const msccImageUrls = [
  "https://dizziness-and-balance.com/disorders/central/images/cervical-MRI.jpg",
  "https://www.wikidoc.org/images/7/7e/CT_spine.gif.gif",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/CoalitionCervicalCageL.png/1200px-CoalitionCervicalCageL.png",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2Y6OxtDNC-P5iSe_fThxG9YObCyAS6xheaHFOEaHcuud3ujFmQlo1d6UA2hLYL2auCYA&usqp=CAU",
  "https://mrimaster.com/wp-content/uploads/2023/11/T1-TSE-axial-image-shows-Metastatic-Spinal-Cord-Compression-1024x601.jpg.webp"
];
const svcsImageUrls = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRClKqn7zvFDw6GRWq18Gu-hLAvDW7FmzLlXg&s",
  "https://prod-images-static.radiopaedia.org/images/832357/d98d7c55811dc0fc35e02d6e218bf3_gallery.jpg",
  "https://ajronline.org/cms/10.2214/AJR.09.2894/asset/images/04_09_2894_03a.jpeg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlH2yihr02Vjyt1C2rkCyFE6dHp8HrtUfZssfNRkFftqNovHztGdNFTS1S43vmM4lvAlk&usqp=CAU",
  "https://www.jto.org/cms/10.1016/j.jtho.2019.09.010/asset/123a5f83-20e9-49fc-87d2-0a283220a360/main.assets/gr1_lrg.jpg"
];
const msccData = {
  patientType: "MSCC",
  primaries: ["Lung cancer", "Breast cancer", "Prostate cancer", "Kidney cancer", "Unknown primary"],
  prescriptions: [
    { text: "30 Gy / 10 fx", energy: "6 MV", muPerFx: 150, technique: "3DCRT", numFields: 1 },
    { text: "30 Gy / 10 fx", energy: "10 MV", muPerFx: 140, technique: "3DCRT", numFields: 1 },
    { text: "20 Gy / 5 fx", energy: "6 MV", muPerFx: 200, technique: "3DCRT", numFields: 1 },
    { text: "20 Gy / 5 fx", energy: "10 MV", muPerFx: 190, technique: "3DCRT", numFields: 1 },
    { text: "8 Gy / 1 fx", energy: "6 MV", muPerFx: 450, technique: "3DCRT", numFields: 1 }
  ],
  fieldSetups: [
    { name: "Post Spine", gantry: 0, coll: 0, couch: 0, xSizeRange: [6, 10], ySizeRange: [15, 25] }
  ],
  imageUrls: msccImageUrls
};
const svcsData = {
  patientType: "SVCS",
  primaries: ["Small cell lung cancer", "Non-Hodgkin lymphoma", "Non-small cell lung cancer (NSCLC)", "Breast cancer"],
  prescriptions: [
    { text: "20 Gy / 5 fx AP/PA", energy: "6 MV", muPerFx: 110, technique: "3DCRT", numFields: 2 },
    { text: "3 Gy x 3 fx -> 1.8 Gy daily to 36 Gy", energy: "6 MV", muPerFx: 100, technique: "3DCRT", numFields: 2 },
    { text: "8 Gy / 1 fx AP/PA", energy: "6 MV", muPerFx: 450, technique: "3DCRT", numFields: 2 },
    { text: "30 Gy / 10 fx AP/PA", energy: "6 MV", muPerFx: 160, technique: "3DCRT", numFields: 2 },
    { text: "4 Gy x 2 fx -> 2 Gy daily to 40 Gy", energy: "6 MV", muPerFx: 110, technique: "3DCRT", numFields: 2 }
  ],
  fieldSetups: [
    { name: "AP Chest", gantry: 180, coll: 0, couch: 0, xSizeRange: [8, 15], ySizeRange: [10, 20] },
    { name: "PA Chest", gantry: 0, coll: 0, couch: 0, xSizeRange: [8, 15], ySizeRange: [10, 20] }
  ],
  imageUrls: svcsImageUrls
};

/* -----------------------------
   UTILITY FUNCTIONS
------------------------------*/
function getRandomInt(min, max) {
  min = Math.ceil(min); max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomFloat(min, max, decimals) {
  const factor = Math.pow(10, decimals);
  const value = Math.random() * (max - min) + min;
  return Math.round(value * factor) / factor;
}
function getRandomElement(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[getRandomInt(0, arr.length - 1)];
}

/* -----------------------------
   EMR TAB LOGIC
------------------------------*/
function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  const content = document.getElementById(tabId);
  const button = document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`);
  if(content) content.classList.add('active');
  if(button) button.classList.add('active');
}

/* -----------------------------
   MACHINE PARAMETER & DISPLAY LOGIC
------------------------------*/
function updateMachineParameterDisplays() {
  document.getElementById('mp-energy').textContent = selectedEnergy || '---';
  document.getElementById('mp-collimator').textContent = collimatorAngle + '°';
  document.getElementById('mp-gantry').textContent = gantryAngle + '°';
  document.getElementById('mp-couch').textContent = couchAngle + '°';
  document.getElementById('jawX1').textContent = jawX1.toFixed(1);
  document.getElementById('jawX2').textContent = jawX2.toFixed(1);
  document.getElementById('jawY1').textContent = jawY1.toFixed(1);
  document.getElementById('jawY2').textContent = jawY2.toFixed(1);
  updateFieldDisplay();
}
function updateControlPanelDisplays() {
  const ce = document.getElementById('currentEnergyDisplay');
  if (ce) ce.textContent = selectedEnergy || '---';
  const cd = document.getElementById('collimatorDisplay');
  if (cd) cd.textContent = 'Collimator ' + collimatorAngle + '°';
  const gd = document.getElementById('gantryDisplay');
  if (gd) gd.textContent = 'Gantry ' + gantryAngle + '°';
  const cch = document.getElementById('couchDisplay');
  if (cch) cch.textContent = 'Couch ' + couchAngle + '°';
  const cx1 = document.getElementById('control-jawX1');
  if (cx1) cx1.textContent = jawX1.toFixed(1);
  const cx2 = document.getElementById('control-jawX2');
  if (cx2) cx2.textContent = jawX2.toFixed(1);
  const cy1 = document.getElementById('control-jawY1');
  if (cy1) cy1.textContent = jawY1.toFixed(1);
  const cy2 = document.getElementById('control-jawY2');
  if (cy2) cy2.textContent = jawY2.toFixed(1);
}
function updateConsoleDisplay() {
  const energyStr = selectedEnergy || "---";
  const muStr = setMU.toString().padStart(3, '0');
  const deliveredMuStr = deliveredMU.toString().padStart(3, '0');
  const fieldStr = `${(jawX1 + jawX2).toFixed(1)}x${(jawY1 + jawY2).toFixed(1)}`;
  document.getElementById('console-parameters').textContent = `Energy: ${energyStr} | MU: ${muStr} | Field: ${fieldStr}`;
  const consoleStatus = document.getElementById('console-status');
  let statusMsg = "Status: Idle";
  if (isBeaming) statusMsg = "Status: Beam On Active";
  else if (isPrepared) statusMsg = "Status: Prepared";
  else if (fieldAdjustmentLocked) statusMsg = "Status: Field Locked (Electron)";
  if (consoleStatus) {
    if (statusMsg.includes("INTERLOCK") || statusMsg.includes("FAIL")) {
      consoleStatus.classList.add('interlock');
    } else {
      consoleStatus.classList.remove('interlock');
    }
    consoleStatus.textContent = statusMsg;
  }
  document.getElementById('console-reading').textContent = `Delivered MU: ${deliveredMuStr} | Dose Rate: ${isBeaming ? "Active" : "---"}`;
  updateStatusBar();
  updateInterlocksPanel();
}
function updateStatusBar() {
  let statusText = "";
  let fieldName = (currentLoadedPlan && loadedFieldIndex !== -1 && currentLoadedPlan.fields && currentLoadedPlan.fields[loadedFieldIndex])
    ? currentLoadedPlan.fields[loadedFieldIndex].name : "Field ?";
  if (isDoorOpen) statusText = "INTERLOCK: Door Open";
  else if (isBeaming) statusText = `Beam Active - Delivering ${setMU} MU - ${fieldName}`;
  else if (isPrepared) statusText = `Prepared - ${fieldName} - ${setMU} MU`;
  else if (loadedFieldIndex !== -1) statusText = `${fieldName} loaded. Adjust parameters or Prepare.`;
  else if (currentLoadedPlan) statusText = `${currentLoadedPlan.patientType} Case "${currentLoadedPlan.patientName}" generated. Select a field to load.`;
  else statusText = "Emulator Ready. Generate a patient case or set parameters manually.";
  if (statusBar) statusBar.textContent = statusText;
  if (statusBar) statusBar.style.backgroundColor = isDoorOpen ? "#dc3545" : "#003366";
}

/* -----------------------------
   QA & INTERLOCK PANEL LOGIC
------------------------------*/
function updateInterlocksPanel() {
  // Door
  const doorStat = isDoorOpen ? "Open" : "Closed";
  document.getElementById('doorStatus').textContent = doorStat;
  document.getElementById('interlock-door').className = "interlock-status " + (isDoorOpen ? "danger" : "ok");
  // Beam
  const beamStat = isBeaming ? "On" : "Off";
  document.getElementById('beamStatus').textContent = beamStat;
  document.getElementById('interlock-beam').className = "interlock-status " + (isBeaming ? "warning" : "ok");
  // Override
  const overrideStat = overrideActive ? "Active" : "Inactive";
  document.getElementById('overrideStatus').textContent = overrideStat;
  document.getElementById('interlock-override').className = "interlock-status " + (overrideActive ? "danger" : "ok");
}

/* -----------------------------
   IMAGE ALIGNMENT LOGIC
------------------------------*/
function moveOverlay(dx, dy) {
  overlayOffsetX += dx;
  overlayOffsetY += dy;
  applyOverlayTransformsAndFilters();
  updateShiftFeedback();
}
function rotateOverlay(deltaAngle) {
  overlayRotationAngle = (overlayRotationAngle + deltaAngle + 360) % 360;
  applyOverlayTransformsAndFilters();
  updateShiftFeedback();
}
function scaleOverlay(zoomIn) {
  if (zoomIn) {
    overlayScale = Math.min(MAX_SCALE, overlayScale * SCALE_STEP_MULTIPLIER);
  } else {
    overlayScale = Math.max(MIN_SCALE, overlayScale / SCALE_STEP_MULTIPLIER);
  }
  applyOverlayTransformsAndFilters();
  updateShiftFeedback();
}
function handleOpacityChange() {
  if (overlayImageElement && opacitySlider && opacityValueDisplay) {
    overlayOpacity = opacitySlider.value / 100;
    applyOverlayTransformsAndFilters();
  }
}
function handleBrightnessChange() {
  overlayBrightness = parseInt(document.getElementById('brightnessSlider').value);
  applyOverlayTransformsAndFilters();
}
function handleContrastChange() {
  overlayContrast = parseInt(document.getElementById('contrastSlider').value);
  applyOverlayTransformsAndFilters();
}
function applyOverlayTransformsAndFilters() {
  const transformValue =
    `translate(${overlayOffsetX}px, ${overlayOffsetY}px) ` +
    `rotate(${overlayRotationAngle}deg) ` +
    `scale(${overlayScale})`;
  overlayImageElement.style.transform = transformValue;
  overlayImageElement.style.opacity = overlayOpacity;
  overlayImageElement.style.filter = `brightness(${overlayBrightness}%) contrast(${overlayContrast}%)`;
  // Update display spans
  document.getElementById('rotationDisplay').textContent = `${overlayRotationAngle}°`;
  document.getElementById('scaleDisplay').textContent = `${overlayScale.toFixed(2)}x`;
  document.getElementById('opacityValue').textContent = `${Math.round(overlayOpacity * 100)}%`;
  document.getElementById('brightnessValue').textContent = `${overlayBrightness}`;
  document.getElementById('contrastValue').textContent = `${overlayContrast}`;
  // Also update the motion readout
  document.getElementById('couchShiftX').textContent = overlayOffsetX;
  document.getElementById('couchShiftY').textContent = overlayOffsetY;
  document.getElementById('couchRotation').textContent = `${overlayRotationAngle}°`;
  document.getElementById('couchZoom').textContent = `${overlayScale.toFixed(2)}x`;
}
function resetOverlayManipulations() {
  overlayRotationAngle = 0;
  overlayScale = 1.0;
  overlayOpacity = 0.5;
  overlayBrightness = 100;
  overlayContrast = 100;
  overlayOffsetX = initialOverlayShiftX;
  overlayOffsetY = initialOverlayShiftY;
  document.getElementById('opacitySlider').value = 50;
  document.getElementById('brightnessSlider').value = 100;
  document.getElementById('contrastSlider').value = 100;
  applyOverlayTransformsAndFilters();
  updateShiftFeedback();
  if (alignmentMessage) alignmentMessage.textContent = "View reset. Adjust overlay to align.";
  hasCurrentCaseAlignmentBeenCounted = false;
}
function updateShiftFeedback() {
  if(shiftFeedback) {
    const currentCorrectedX = overlayOffsetX - initialOverlayShiftX;
    const currentCorrectedY = overlayOffsetY - initialOverlayShiftY;
    shiftFeedback.textContent = `Corrected Offset: X=${currentCorrectedX}, Y=${currentCorrectedY} | Rotation: ${overlayRotationAngle}°`;
  }
}
function checkAlignment() {
  if (Math.abs(overlayOffsetX) <= alignmentTolerance &&
      Math.abs(overlayOffsetY) <= alignmentTolerance &&
      Math.abs(overlayRotationAngle) <= alignmentTolerance) {
    if(alignmentMessage) {
      alignmentMessage.textContent = "Alignment OK!";
      alignmentMessage.style.color = "green";
    }
    if(shiftFeedback) shiftFeedback.textContent = "Perfectly Aligned!";
    if (!hasCurrentCaseAlignmentBeenCounted) {
      correctCaseAlignments++;
      hasCurrentCaseAlignmentBeenCounted = true;
      updateCaseAlignmentCounterDisplay();
    }
  } else {
    if(alignmentMessage) {
      alignmentMessage.textContent = "Alignment Check Needed";
      alignmentMessage.style.color = "red";
    }
    updateShiftFeedback();
  }
}
function updateCaseAlignmentCounterDisplay() {
  if(alignmentCounterDisplay) alignmentCounterDisplay.textContent = `Correct Case Alignments: ${correctCaseAlignments}`;
}

/* -----------------------------
   MLC VISUALIZER LOGIC (STUB)
------------------------------*/
function updateFieldDisplay() {
  const rect = document.getElementById('fieldDisplayRect');
  if (!rect) return;
  const leftPx = centerPx - (jawX1 * scaleFactor);
  const rightPx = centerPx + (jawX2 * scaleFactor);
  const topPx = centerPx - (jawY2 * scaleFactor);
  const bottomPx = centerPx + (jawY1 * scaleFactor);
  const widthPx = Math.max(0, rightPx - leftPx);
  const heightPx = Math.max(0, bottomPx - topPx);
  rect.style.width = `${widthPx}px`;
  rect.style.height = `${heightPx}px`;
  rect.style.left = `${leftPx}px`;
  rect.style.top = `${topPx}px`;
}
// Add additional MLC visualizer logic as required for your demo.

/* -----------------------------
   PATIENT/PLAN & FIELD LOGIC (STUB)
------------------------------*/
function generateAndDisplayPatientCase() {
  // Stub: Randomly generate a case and update the EMR and plan display.
  // In your actual implementation, populate the DOM with patient info, image, and field plan.
  alert("Stub: Patient case generation not implemented in this snippet.");
}
function loadFieldToConsole(index) {
  // Stub: Load the field setup into parameters and update displays.
  alert("Stub: Field loading not implemented in this snippet.");
}

/* -----------------------------
   CONTROL PANEL BUTTON LOGIC (STUB)
------------------------------*/
function handleSetMU() {
  // Stub: Prompt for MU and update setMU variable.
  setMU = getRandomInt(50, 300); // Example: random MU for stub
  updateConsoleDisplay();
}
function cycleEnergy() {
  currentEnergyIndex = (currentEnergyIndex + 1) % energyOptions.length;
  selectedEnergy = energyOptions[currentEnergyIndex];
  updateMachineParameterDisplays();
  updateControlPanelDisplays();
  updateConsoleDisplay();
}
function handlePrepare() {
  isPrepared = true;
  updateConsoleDisplay();
}
function handleBeamOn() {
  isBeaming = true;
  updateConsoleDisplay();
}
function handleBeamOff() {
  isBeaming = false;
  updateConsoleDisplay();
}
function handleDoorControl() {
  isDoorOpen = !isDoorOpen;
  updateConsoleDisplay();
}
function handleReset() {
  isPrepared = false;
  isBeaming = false;
  isDoorOpen = false;
  deliveredMU = 0;
  setMU = 0;
  gantryAngle = 0;
  collimatorAngle = 0;
  couchAngle = 0;
  jawX1 = 5.0; jawX2 = 5.0; jawY1 = 5.0; jawY2 = 5.0;
  fieldAdjustmentLocked = false;
  correctCaseAlignments = 0;
  hasCurrentCaseAlignmentBeenCounted = false;
  updateMachineParameterDisplays();
  updateControlPanelDisplays();
  updateConsoleDisplay();
  updateCaseAlignmentCounterDisplay();
  resetOverlayManipulations();
}

/* -----------------------------
   FIELD SIZE & MOTION BUTTONS (STUB)
------------------------------*/
function changeFieldSize(jaw, delta) {
  const step = 0.5;
  delta = Math.sign(delta) * step;
  switch(jaw) {
    case 'X1': jawX1 = Math.max(0.1, jawX1 + delta); break;
    case 'X2': jawX2 = Math.max(0.1, jawX2 + delta); break;
    case 'Y1': jawY1 = Math.max(0.1, jawY1 + delta); break;
    case 'Y2': jawY2 = Math.max(0.1, jawY2 + delta); break;
  }
  updateMachineParameterDisplays();
  updateControlPanelDisplays();
  updateConsoleDisplay();
}
function changeCollimator(delta) {
  collimatorAngle = (collimatorAngle + delta + 360) % 360;
  updateMachineParameterDisplays();
  updateControlPanelDisplays();
  updateConsoleDisplay();
}
function changeGantry(delta) {
  gantryAngle = (gantryAngle + delta + 360) % 360;
  updateMachineParameterDisplays();
  updateControlPanelDisplays();
  updateConsoleDisplay();
}
function changeCouch(delta) {
  couchAngle = (couchAngle + delta + 360) % 360;
  updateMachineParameterDisplays();
  updateControlPanelDisplays();
  updateConsoleDisplay();
}

/* -----------------------------
   ENABLE/DISABLE PARAM BUTTONS (STUB)
------------------------------*/
function enableParameterSettingButtons(enable) {
  // Stub: Enable/disable parameter setting buttons in your UI.
}
function setFieldAdjustmentEnabled(enabled) {
  // Stub: Enable/disable field size controls.
}

/* -----------------------------
   MODAL/CONES (STUB)
------------------------------*/
function openConeModal() {
  // Stub: Open modal for cone selection.
}
function closeConeModal() {
  // Stub: Close modal for cone selection.
}
function selectConeSize() {
  // Stub: Handle cone size selection from modal.
}

/* -----------------------------
   INIT & EVENT LISTENERS
------------------------------*/
document.addEventListener('DOMContentLoaded', function() {
  if (generateCaseBtn) generateCaseBtn.onclick = generateAndDisplayPatientCase;
  // Control panel
  let btnSetMu = document.getElementById('btn-set-mu');
  let btnEnergy = document.getElementById('energyToggleButton');
  let btnPrepare = document.getElementById('btn-prepare');
  let btnBeamOn = document.getElementById('btn-beam-on');
  let btnBeamOff = document.getElementById('btn-beam-off');
  let btnReset = document.getElementById('btn-reset');
  let btnDoor = document.getElementById('btn-door-control');
  if (btnSetMu) btnSetMu.onclick = handleSetMU;
  if (btnEnergy) btnEnergy.onclick = cycleEnergy;
  if (btnPrepare) btnPrepare.onclick = handlePrepare;
  if (btnBeamOn) btnBeamOn.onclick = handleBeamOn;
  if (btnBeamOff) btnBeamOff.onclick = handleBeamOff;
  if (btnReset) btnReset.onclick = handleReset;
  if (btnDoor) btnDoor.onclick = handleDoorControl;
  if (opacitySlider) opacitySlider.addEventListener('input', handleOpacityChange);
  document.getElementById('brightnessSlider').addEventListener('input', handleBrightnessChange);
  document.getElementById('contrastSlider').addEventListener('input', handleContrastChange);

  // Example: field/motion controls
  // (You should wire up your field/jaw/gantry/collimator/couch buttons here.)

  document.addEventListener('keydown', function(e) {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
    if (!currentLoadedPlan) return;
    let step = 1, handled = false;
    switch (e.key) {
      case 'ArrowUp': moveOverlay(0, -step); handled = true; break;
      case 'ArrowDown': moveOverlay(0, step); handled = true; break;
      case 'ArrowLeft': moveOverlay(-step, 0); handled = true; break;
      case 'ArrowRight': moveOverlay(step, 0); handled = true; break;
      case '[': rotateOverlay(-ROTATION_STEP); handled = true; break;
      case ']': rotateOverlay(ROTATION_STEP); handled = true; break;
      case '-': if(e.ctrlKey || e.metaKey) { scaleOverlay(false); handled = true; } break;
      case '=': if(e.ctrlKey || e.metaKey) { scaleOverlay(true); handled = true; } break;
      case '+': if(e.ctrlKey || e.metaKey) { scaleOverlay(true); handled = true; } break;
    }
    if (handled) e.preventDefault();
  });
  updateCaseAlignmentCounterDisplay();
  updateControlPanelDisplays();
  updateMachineParameterDisplays();
  updateConsoleDisplay();
  updateStatusBar();
  applyOverlayTransformsAndFilters();
});
