// ===========================
// LINAC Console Emulator Logic
// ===========================

// -----------
// DOM Elements
// -----------
const btnSetMu = document.getElementById('btn-set-mu');
const btnPrepare = document.getElementById('btn-prepare');
const btnBeamOn = document.getElementById('btn-beam-on');
const btnBeamOff = document.getElementById('btn-beam-off');
const btnReset = document.getElementById('btn-reset');
const btnDoorControl = document.getElementById('btn-door-control');
const consoleStatus = document.getElementById('console-status');
const consoleReading = document.getElementById('console-reading');
const consoleParams = document.getElementById('console-parameters');
const energyToggleButton = document.getElementById('energyToggleButton');
const btnConeSize = document.getElementById('btn-conesize');
const coneModal = document.getElementById('cone-modal');
const coneOptionsList = document.getElementById('cone-options-list');
const fieldSizeAdjustButtons = document.querySelectorAll('.field-control-group button');
const mlcSection = document.getElementById('mlc-section');
const statusBar = document.getElementById('status-bar');
const treatmentTabContent = document.getElementById('treatment');

// Image Alignment Elements
const baseImageElement = document.getElementById('baseImage');
const overlayImageElement = document.getElementById('overlayImage');
const opacitySlider = document.getElementById('opacitySlider');
const opacityValueDisplay = document.getElementById('opacityValue');
const alignmentMessage = document.getElementById('alignmentMessage');
const shiftFeedback = document.getElementById('shiftFeedback');
const alignmentCounterDisplay = document.getElementById('alignmentCounterDisplay');
const defaultImageUrl = "https://via.placeholder.com/400x300.png?text=Load+Case";

// MLC Images
const staticMlcImageUrl = "https://help.imageowl.com/hc/article_attachments/15979985068691";
const animatedMlcGifUrl = "https://help.imageowl.com/hc/article_attachments/15980435011475";

// -----------
// State Vars
// -----------
let isPrepared = false;
let isBeaming = false;
let isDoorOpen = true;
let deliveredMU = 0;
let setMU = 0;
let selectedEnergy = "6 MV";
let beamTimeoutId = null;
let gantryAngle = 0;
let collimatorAngle = 0;
let couchAngle = 0;
let jawX1 = 5.0, jawX2 = 5.0, jawY1 = 5.0, jawY2 = 5.0;
const energyOptions = ['6 MV', '10 MV', '15 MV', '18 MV', '6 MeV', '9 MeV', '12 MeV', '15 MeV', '18 MeV'];
let currentEnergyIndex = 0;
let fieldAdjustmentLocked = false;
let currentLoadedPlan = null;
let loadedFieldIndex = -1;

// Image alignment state
let overlayOffsetX = 0, overlayOffsetY = 0, initialOverlayShiftX = 0, initialOverlayShiftY = 0;
const alignmentTolerance = 2;
let correctCaseAlignments = 0;
let hasCurrentCaseAlignmentBeenCounted = false;

// Field display constants
const fieldDisplayContainerSize = 150;
const maxFieldCoordinate = 20.0;
const scaleFactor = (fieldDisplayContainerSize / 2.0) / maxFieldCoordinate;

let shiftFeedbackTimeout = null;

// -----------
// Demo Images and Sample Data
// -----------
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

// ---------------------------------
// Utility Functions (Randomization)
// ---------------------------------
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

// ------------------------
// EMR Tabs and User Actions
// ------------------------
function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  const content = document.getElementById(tabId);
  const button = document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`);
  if(content) content.classList.add('active');
  if(button) button.classList.add('active');
}

// ------------------------------
// Machine Parameter Display Logic
// ------------------------------
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
  document.getElementById('currentEnergyDisplay').textContent = selectedEnergy || '---';
  document.getElementById('collimatorDisplay').textContent = 'Collimator ' + collimatorAngle + '°';
  document.getElementById('gantryDisplay').textContent = 'Gantry ' + gantryAngle + '°';
  document.getElementById('couchDisplay').textContent = 'Couch ' + couchAngle + '°';
  document.getElementById('control-jawX1').textContent = jawX1.toFixed(1);
  document.getElementById('control-jawX2').textContent = jawX2.toFixed(1);
  document.getElementById('control-jawY1').textContent = jawY1.toFixed(1);
  document.getElementById('control-jawY2').textContent = jawY2.toFixed(1);
}
function updateConsoleDisplay() {
  const energyStr = selectedEnergy || "---";
  const muStr = setMU.toString().padStart(3, '0');
  const deliveredMuStr = deliveredMU.toString().padStart(3, '0');
  const fieldStr = `${(jawX1 + jawX2).toFixed(1)}x${(jawY1 + jawY2).toFixed(1)}`;
  if(consoleParams) consoleParams.textContent = `Energy: ${energyStr} | MU: ${muStr} | Field: ${fieldStr}`;
  if (consoleStatus) {
    let statusMsg = consoleStatus.textContent || "Status: Idle";
    if (!statusMsg.startsWith("Status: INTERLOCK")) {
      if (isBeaming) statusMsg = "Status: Beam On Active";
      else if (isPrepared) statusMsg = "Status: Prepared";
      else if (fieldAdjustmentLocked) statusMsg = "Status: Field Locked (Electron)";
      else statusMsg = "Status: Idle";
      if (loadedFieldIndex !== -1 && currentLoadedPlan && currentLoadedPlan.fields[loadedFieldIndex]) {
        statusMsg += ` (${currentLoadedPlan.fields[loadedFieldIndex].name} Loaded)`;
      }
    }
    if (statusMsg.includes("INTERLOCK") || statusMsg.includes("FAIL")) {
      consoleStatus.classList.add('interlock');
    } else {
      consoleStatus.classList.remove('interlock');
    }
    consoleStatus.textContent = statusMsg;
  }
  if (consoleReading) {
    const doseRate = isBeaming ? "Active" : "---";
    consoleReading.textContent = `Delivered MU: ${deliveredMuStr} | Dose Rate: ${doseRate}`;
  }
  if (btnBeamOn) {
    if(isBeaming) btnBeamOn.classList.add('beam-active');
    else btnBeamOn.classList.remove('beam-active');
  }
  updateStatusBar();
}
function updateDoorButton() {
  if (btnDoorControl) {
    if (isDoorOpen) {
      btnDoorControl.textContent = "Close Door";
      btnDoorControl.classList.add('open');
    } else {
      btnDoorControl.textContent = "Open Door";
      btnDoorControl.classList.remove('open');
    }
  }
}
function updateStatusBar() {
  let statusText = "";
  let fieldName = (currentLoadedPlan && loadedFieldIndex !== -1 && currentLoadedPlan.fields[loadedFieldIndex]) ? currentLoadedPlan.fields[loadedFieldIndex].name : "Field ?";
  if (isDoorOpen) statusText = "INTERLOCK: Door Open";
  else if (isBeaming) statusText = `Beam Active - Delivering ${setMU} MU - ${fieldName}`;
  else if (isPrepared) statusText = `Prepared - ${fieldName} - ${setMU} MU`;
  else if (loadedFieldIndex !== -1) statusText = `${fieldName} loaded. Adjust parameters or Prepare.`;
  else if (currentLoadedPlan) statusText = `${currentLoadedPlan.patientType} Case "${currentLoadedPlan.patientName}" generated. Select a field to load.`;
  else statusText = "Emulator Ready. Generate a patient case or set parameters manually.";
  statusBar.textContent = statusText;
  statusBar.style.backgroundColor = isDoorOpen ? "#dc3545" : "#003366";
}
function enableParameterSettingButtons(enable = true) {
  if (btnSetMu) enable ? btnSetMu.classList.remove('disabled') : btnSetMu.classList.add('disabled');
  if (energyToggleButton) enable ? energyToggleButton.classList.remove('disabled') : energyToggleButton.classList.add('disabled');
  if (btnPrepare) {
    if (enable && loadedFieldIndex !== -1 && !isBeaming && !isPrepared && !isDoorOpen) btnPrepare.classList.remove('disabled');
    else btnPrepare.classList.add('disabled');
  }
  if (btnBeamOn) {
    if (enable && isPrepared && !isBeaming && !isDoorOpen) btnBeamOn.classList.remove('disabled');
    else btnBeamOn.classList.add('disabled');
  }
  if (btnBeamOff) {
    if (isBeaming) btnBeamOff.classList.remove('disabled');
    else btnBeamOff.classList.add('disabled');
  }
  const isElectron = selectedEnergy.includes('MeV');
  setFieldAdjustmentEnabled(enable && !isBeaming && !isElectron);
  if (btnConeSize) {
    if(enable && !isBeaming && isElectron) btnConeSize.classList.remove('disabled');
    else btnConeSize.classList.add('disabled');
  }
}
function setFieldAdjustmentEnabled(enabled) {
  fieldSizeAdjustButtons.forEach(button => {
    if (button.textContent === '+' || button.textContent === '–') button.disabled = !enabled;
  });
  fieldAdjustmentLocked = !enabled;
}

// ------------------------------
// Treatment Plan Generation/Load
// ------------------------------
function generateRandomTreatmentPlan() {
  const caseTypeData = Math.random() < 0.5 ? msccData : svcsData;
  const randomPrimary = getRandomElement(caseTypeData.primaries);
  const randomRx = getRandomElement(caseTypeData.prescriptions);
  const planEnergy = randomRx.energy;
  const planTechnique = randomRx.technique;
  const alignmentImgUrl = getRandomElement(caseTypeData.imageUrls);

  let planFields = [];
  const numFields = randomRx.numFields || 1;
  const fieldSetupTemplates = caseTypeData.fieldSetups;
  for (let i = 0; i < numFields; i++) {
    const setupTemplate = fieldSetupTemplates[i % fieldSetupTemplates.length];
    const xSize = getRandomFloat(setupTemplate.xSizeRange[0], setupTemplate.xSizeRange[1], 1);
    const ySize = getRandomFloat(setupTemplate.ySizeRange[0], setupTemplate.ySizeRange[1], 1);
    const muPerField = Math.round((randomRx.muPerFx / numFields) * getRandomFloat(0.95, 1.05, 2));
    planFields.push({
      name: setupTemplate.name || `Field ${i+1}`, mu: muPerField,
      gantry: setupTemplate.gantry, collimator: setupTemplate.coll, couch: setupTemplate.couch,
      x1: xSize/2, x2: xSize/2, y1: ySize/2, y2: ySize/2,
      energy: planEnergy, technique: planTechnique
    });
  }

  // Fake patient details
  const firstNames = ["John", "Jane", "Alex", "Sarah", "Michael", "Emily", "David", "Linda", "Robert", "Maria"];
  const lastNames = ["Smith", "Doe", "Jones", "Chen", "Williams", "Brown", "Davis", "Miller", "Wilson", "Garcia"];
  const randomName = getRandomElement(firstNames) + " " + getRandomElement(lastNames);
  const randomDOB = `${getRandomInt(1, 12)}/${getRandomInt(1, 28)}/${getRandomInt(1940, 1985)}`;
  const diagnosisText = `${caseTypeData.patientType} - ${randomPrimary}`;
  const randomCreat = getRandomFloat(0.6, 1.5, 1);
  const randomWBC = getRandomFloat(3.0, 11.0, 1);

  return {
    patientName: randomName, patientDOB: randomDOB, patientDiagnosis: diagnosisText,
    patientType: caseTypeData.patientType, prescriptionText: randomRx.text,
    technique: planTechnique, energy: planEnergy, fields: planFields,
    labCreat: randomCreat, labWBC: randomWBC,
    alignmentImageUrl: alignmentImgUrl
  };
}
function displayTreatmentPlan(plan) {
  currentLoadedPlan = plan;
  loadedFieldIndex = -1;
  // Update EMR Tabs
  document.getElementById('patientName').textContent = plan.patientName;
  document.getElementById('patientDOB').textContent = plan.patientDOB;
  document.getElementById('patientDiagnosis').textContent = plan.patientDiagnosis;
  document.getElementById('patientType').textContent = plan.patientType;
  document.getElementById('labCreat').textContent = plan.labCreat + " mg/dL";
  document.getElementById('labWBC').textContent = plan.labWBC + " K/uL";
  // Images
  const imageUrl = plan.alignmentImageUrl || defaultImageUrl;
  if (baseImageElement) baseImageElement.src = imageUrl;
  if (overlayImageElement) overlayImageElement.src = imageUrl;
  // Initial overlay offset
  initialOverlayShiftX = getRandomInt(-20, 20);
  initialOverlayShiftY = getRandomInt(-20, 20);
  overlayOffsetX = initialOverlayShiftX;
  overlayOffsetY = initialOverlayShiftY;
  if (overlayImageElement) overlayImageElement.style.transform = `translate(${overlayOffsetX}px, ${overlayOffsetY}px)`;
  if (alignmentMessage) alignmentMessage.textContent = "Adjust overlay using arrow keys.";
  if (shiftFeedback) shiftFeedback.textContent = "";
  hasCurrentCaseAlignmentBeenCounted = false;

  // Update Treatment Tab
  let html = `<h4>Plan Details</h4>
    <p><strong>Prescription:</strong> ${plan.prescriptionText}</p>
    <p><strong>Technique:</strong> ${plan.technique}</p>
    <p><strong>Nominal Energy:</strong> ${plan.energy}</p>
    <h4>Fields (Click to Load)</h4>`;
  plan.fields.forEach((field, index) => {
    const fieldSizeDisplay = `${(field.x1 + field.x2).toFixed(1)} x ${(field.y1 + field.y2).toFixed(1)}`;
    html += `<div class="treatment-field" onclick="loadFieldToConsole(${index})">
      <h5>${field.name}</h5>
      <p>Energy: ${field.energy} | MU: ${field.mu}</p>
      <p>Gantry: ${field.gantry}° | Coll: ${field.collimator}° | Couch: ${field.couch}°</p>
      <p>Field Size (X x Y): ${fieldSizeDisplay} cm</p>
    </div>`;
  });
  treatmentTabContent.innerHTML = html;
  showTab('treatment');
  partialResetConsoleForNewPlan();
  updateConsoleDisplay();
  updateStatusBar();
  updateCaseAlignmentCounterDisplay();
}
function partialResetConsoleForNewPlan() {
  if(beamTimeoutId) clearInterval(beamTimeoutId);
  beamTimeoutId = null;
  isPrepared = false; isBeaming = false; deliveredMU = 0; setMU = 0;
  selectedEnergy = "---"; gantryAngle = 0; collimatorAngle = 0; couchAngle = 0;
  jawX1 = 0; jawX2 = 0; jawY1 = 0; jawY2 = 0; currentEnergyIndex = -1;
  fieldAdjustmentLocked = false; loadedFieldIndex = -1;
  document.getElementById('currentEnergyDisplay').textContent = '---';
  document.getElementById('mp-energy').textContent = '---';
  updateControlPanelDisplays();
  updateMachineParameterDisplays();
  enableParameterSettingButtons(false);
  if(btnReset) btnReset.classList.remove('disabled');
  updateDoorButton();
  stopBeam();
  if (mlcSection) mlcSection.style.display = 'none';
  updateConsoleDisplay();
  updateStatusBar();
}
function generateAndDisplayPatientCase() {
  const plan = generateRandomTreatmentPlan();
  displayTreatmentPlan(plan);
}
function loadFieldToConsole(fieldIndex) {
  if (!currentLoadedPlan || !currentLoadedPlan.fields[fieldIndex]) return;
  if (isBeaming) {
    alert("Cannot load new field while beam is active!");
    return;
  }
  const field = currentLoadedPlan.fields[fieldIndex];
  loadedFieldIndex = fieldIndex;
  const energyIndex = energyOptions.findIndex(e => e === field.energy);
  if (energyIndex !== -1) {
    currentEnergyIndex = energyIndex; selectedEnergy = field.energy;
  } else {
    const fallbackIndex = energyOptions.findIndex(e => e === '6 MV');
    currentEnergyIndex = fallbackIndex !== -1 ? fallbackIndex : -1;
    selectedEnergy = fallbackIndex !== -1 ? '6 MV' : "---";
  }
  document.getElementById('currentEnergyDisplay').textContent = selectedEnergy;
  document.getElementById('mp-energy').textContent = selectedEnergy;
  const isElectron = selectedEnergy.includes('MeV');
  if (btnConeSize) btnConeSize.classList.toggle('disabled', !isElectron);
  setFieldAdjustmentEnabled(!isElectron);
  if (mlcSection) mlcSection.style.display = isElectron ? 'none' : 'block';
  document.getElementById('mlcPatternDisplay').textContent = isElectron ? 'N/A (Electron)' : field.technique || '3DCRT';
  setMU = field.mu; deliveredMU = 0;
  gantryAngle = field.gantry; collimatorAngle = field.collimator; couchAngle = field.couch;
  jawX1 = field.x1; jawX2 = field.x2; jawY1 = field.y1; jawY2 = field.y2;
  updateControlPanelDisplays(); updateMachineParameterDisplays();
  isPrepared = false; isBeaming = false;
  if(beamTimeoutId) clearInterval(beamTimeoutId); beamTimeoutId = null;
  stopBeam(); enableParameterSettingButtons(true); updateConsoleDisplay();
  document.querySelectorAll('.treatment-field').forEach((el, idx) => {
    el.style.border = idx === fieldIndex ? '2px solid #003366' : '1px solid #ddd';
  });
  updateStatusBar();
}

// -------------------------------------------
// User-Interactive Controls and Event Handlers
// -------------------------------------------
function handleSetMU() {
  if(!btnSetMu || btnSetMu.classList.contains('disabled')) return;
  const fieldName = (currentLoadedPlan && loadedFieldIndex !== -1 && currentLoadedPlan.fields[loadedFieldIndex]) ? currentLoadedPlan.fields[loadedFieldIndex].name : "Current Field";
  const muInput = prompt(`Enter MU for ${fieldName} (e.g., 1-1000):`, setMU > 0 ? setMU : 100);
  const muVal = parseInt(muInput);
  if (!isNaN(muVal) && muVal > 0 && muVal <= 1000) {
    setMU = muVal;
    deliveredMU = 0;
    isPrepared = false;
    enableParameterSettingButtons(true);
    updateConsoleDisplay();
  } else if (muInput !== null) {
    alert("Invalid MU value. Please enter a number between 1 and 1000.");
    updateConsoleDisplay();
  }
}
function handlePrepare() {
  if(!btnPrepare || btnPrepare.classList.contains('disabled')) return;
  if (loadedFieldIndex === -1) {
    alert("Load a treatment field first."); updateConsoleDisplay(); return;
  }
  if (selectedEnergy === "---" || setMU <= 0) {
    alert("Energy and MU must be set for the loaded field."); updateConsoleDisplay(); return;
  }
  if (isDoorOpen) {
    updateConsoleDisplay(); return;
  }
  const loadedField = currentLoadedPlan.fields[loadedFieldIndex];
  let paramsMatch = true;
  if (gantryAngle !== loadedField.gantry || collimatorAngle !== loadedField.collimator ||
      couchAngle !== loadedField.couch || Math.abs(jawX1 - loadedField.x1) > 0.01 ||
      Math.abs(jawX2 - loadedField.x2) > 0.01 || Math.abs(jawY1 - loadedField.y1) > 0.01 ||
      Math.abs(jawY2 - loadedField.y2) > 0.01 || selectedEnergy !== loadedField.energy ||
      setMU !== loadedField.mu ) {
    paramsMatch = false;
    if(!confirm("Console parameters deviate from loaded plan. Prepare anyway?")) {
      updateConsoleDisplay(); return;
    }
  }
  isPrepared = true; enableParameterSettingButtons(true); updateConsoleDisplay();
}
function handleBeamOn() {
  if (!btnBeamOn || btnBeamOn.classList.contains('disabled') || isBeaming) return;
  if (!isPrepared) { updateConsoleDisplay(); return; }
  if (isDoorOpen) { updateConsoleDisplay(); return; }
  if (setMU <= 0) { updateConsoleDisplay(); return; }
  isBeaming = true; deliveredMU = 0; enableParameterSettingButtons(false); startBeam();
  const beamDurationMs = 2000 * (setMU / 100.0);
  const totalSteps = Math.max(20, setMU / 5);
  let currentStepTime = 0;
  const stepInterval = Math.max(50, beamDurationMs / totalSteps);
  beamTimeoutId = setInterval(() => {
    currentStepTime++;
    deliveredMU = Math.min(setMU, Math.round(setMU * (currentStepTime / totalSteps)));
    updateConsoleDisplay();
    if (currentStepTime >= totalSteps || deliveredMU >= setMU) handleBeamOff(true);
  }, stepInterval);
  updateConsoleDisplay();
}
function handleBeamOff(beamCompleted = false) {
  if(beamTimeoutId) clearInterval(beamTimeoutId); beamTimeoutId = null;
  const wasBeaming = isBeaming; isBeaming = false;
  if (wasBeaming) {
    isPrepared = false;
    if (beamCompleted) deliveredMU = setMU;
  }
  enableParameterSettingButtons(true); stopBeam(); updateConsoleDisplay();
}
function handleDoorControl() {
  if (!btnDoorControl) return;
  isDoorOpen = !isDoorOpen; updateDoorButton();
  if (isDoorOpen) {
    if (isBeaming) handleBeamOff(false);
    else isPrepared = false;
  }
  enableParameterSettingButtons(true); updateConsoleDisplay();
}
function handleReset() {
  if(beamTimeoutId) clearInterval(beamTimeoutId); beamTimeoutId = null;
  isPrepared = false; isBeaming = false; deliveredMU = 0; setMU = 0;
  gantryAngle = 0; collimatorAngle = 0; couchAngle = 0;
  jawX1 = 5.0; jawX2 = 5.0; jawY1 = 5.0; jawY2 = 5.0;
  fieldAdjustmentLocked = false; isDoorOpen = true;
  currentLoadedPlan = null; loadedFieldIndex = -1;
  selectedEnergy = energyOptions[0]; currentEnergyIndex = 0;
  updateControlPanelDisplays(); updateMachineParameterDisplays();
  treatmentTabContent.innerHTML = '<p>Generate a new patient case to see the treatment plan.</p>';
  document.getElementById('patientName').textContent = '---';
  document.getElementById('patientDOB').textContent = '---';
  document.getElementById('patientDiagnosis').textContent = '---';
  document.getElementById('patientType').textContent = '---';
  document.getElementById('labCreat').textContent = "---";
  document.getElementById('labWBC').textContent = "---";
  if (baseImageElement) baseImageElement.src = defaultImageUrl;
  if (overlayImageElement) overlayImageElement.src = defaultImageUrl;
  overlayOffsetX = 0; overlayOffsetY = 0; initialOverlayShiftX = 0; initialOverlayShiftY = 0;
  if (overlayImageElement) overlayImageElement.style.transform = `translate(0px, 0px)`;
  if(opacitySlider) opacitySlider.value = 50;
  if(opacityValueDisplay) opacityValueDisplay.textContent = "50%";
  if(overlayImageElement) overlayImageElement.style.opacity = 0.5;
  if(alignmentMessage) alignmentMessage.textContent = "";
  if(shiftFeedback) shiftFeedback.textContent = "";
  correctCaseAlignments = 0; hasCurrentCaseAlignmentBeenCounted = false;
  updateCaseAlignmentCounterDisplay();
  enableParameterSettingButtons(true); updateDoorButton();
  stopBeam();
  if (mlcSection) { mlcSection.style.display = 'block'; document.getElementById('mlcPatternDisplay').textContent = '3DCRT'; }
  updateConsoleDisplay(); updateStatusBar();
}
function cycleEnergy() {
  if (isBeaming) { updateConsoleDisplay(); return; }
  if (loadedFieldIndex !== -1) {
    alert("Cannot cycle energy manually when a field is loaded. Reset or generate a new case.");
    return;
  }
  currentEnergyIndex = (currentEnergyIndex + 1) % energyOptions.length;
  let newEnergy = energyOptions[currentEnergyIndex];
  selectedEnergy = newEnergy;
  document.getElementById('currentEnergyDisplay').textContent = newEnergy;
  document.getElementById('mp-energy').textContent = newEnergy;
  const isElectron = newEnergy.includes('MeV');
  if (btnConeSize) btnConeSize.classList.toggle('disabled', !isElectron);
  setFieldAdjustmentEnabled(!isElectron);
  if (mlcSection) mlcSection.style.display = isElectron ? 'none' : 'block';
  document.getElementById('mlcPatternDisplay').textContent = isElectron ? 'N/A (Electron)' : '3DCRT';
  enableParameterSettingButtons(true); updateConsoleDisplay();
}
function openConeModal() {
  if (isBeaming || !selectedEnergy.includes('MeV')) return;
  if (loadedFieldIndex !== -1) {
    alert("Cannot select electron cone when a specific field plan is loaded. Reset first.");
    return;
  }
  if (coneModal) coneModal.style.display = "block";
}
function closeConeModal() {
  if (coneModal) coneModal.style.display = "none";
}
function selectConeSize(event) {
  if (!event.target.matches('li[data-cone-size]')) return;
  if (loadedFieldIndex !== -1) {
    alert("Cannot change cone size when a field is loaded. Reset first.");
    closeConeModal(); return;
  }
  const coneDim = parseInt(event.target.getAttribute('data-cone-size'));
  if (isNaN(coneDim)) return;
  const jawDim = (coneDim / 2.0) + 1.0;
  jawX1 = jawDim; jawX2 = jawDim; jawY1 = jawDim; jawY2 = jawDim;
  document.getElementById('control-jawX1').textContent = jawX1.toFixed(1);
  document.getElementById('control-jawX2').textContent = jawX2.toFixed(1);
  document.getElementById('control-jawY1').textContent = jawY1.toFixed(1);
  document.getElementById('control-jawY2').textContent = jawY2.toFixed(1);
  updateMachineParameterDisplays();
  closeConeModal();
  isPrepared = false;
  enableParameterSettingButtons(true); updateConsoleDisplay();
}

// ------------------------
// Motion and Field Controls
// ------------------------
function changeGantry(delta) {
  if (isBeaming) { updateConsoleDisplay(); return; }
  gantryAngle = (gantryAngle + delta + 360) % 360;
  document.getElementById('gantryDisplay').textContent = 'Gantry ' + gantryAngle + '°';
  document.getElementById('mp-gantry').textContent = gantryAngle + '°';
  isPrepared = false; enableParameterSettingButtons(true); updateConsoleDisplay();
}
function changeCollimator(delta) {
  if (isBeaming) { updateConsoleDisplay(); return; }
  collimatorAngle = (collimatorAngle + delta + 360) % 360;
  document.getElementById('collimatorDisplay').textContent = 'Collimator ' + collimatorAngle + '°';
  document.getElementById('mp-collimator').textContent = collimatorAngle + '°';
  const fieldContainer = document.getElementById('fieldDisplayContainer');
  if (fieldContainer) fieldContainer.style.transform = `rotate(${collimatorAngle}deg)`;
  isPrepared = false; enableParameterSettingButtons(true); updateConsoleDisplay();
}
function changeCouch(delta) {
  if (isBeaming) { updateConsoleDisplay(); return; }
  couchAngle = (couchAngle + delta + 360) % 360;
  document.getElementById('couchDisplay').textContent = 'Couch ' + couchAngle + '°';
  document.getElementById('mp-couch').textContent = couchAngle + '°';
  isPrepared = false; enableParameterSettingButtons(true); updateConsoleDisplay();
}

// -----------------
// Field Size Control
// -----------------
function changeFieldSize(dimension, delta) {
  if (fieldAdjustmentLocked || isBeaming) { updateConsoleDisplay(); return; }
  let controlDisplayId = 'control-jaw' + dimension;
  let paramDisplayId = 'jaw' + dimension;
  let currentValue = 0;
  function roundToDecimalPlace(num, places) {
    const factor = 10 ** places; return Math.round(num * factor) / factor;
  }
  const maxJawPos = 20.0;
  switch (dimension) {
    case 'X1': jawX1 = Math.min(maxJawPos, Math.max(0, roundToDecimalPlace(jawX1 + delta, 1))); currentValue = jawX1; break;
    case 'X2': jawX2 = Math.min(maxJawPos, Math.max(0, roundToDecimalPlace(jawX2 + delta, 1))); currentValue = jawX2; break;
    case 'Y1': jawY1 = Math.min(maxJawPos, Math.max(0, roundToDecimalPlace(jawY1 + delta, 1))); currentValue = jawY1; break;
    case 'Y2': jawY2 = Math.min(maxJawPos, Math.max(0, roundToDecimalPlace(jawY2 + delta, 1))); currentValue = jawY2; break;
    default: return;
  }
  try {
    document.getElementById(controlDisplayId).textContent = currentValue.toFixed(1);
    document.getElementById(paramDisplayId).textContent = currentValue.toFixed(1);
  } catch (error) {}
  isPrepared = false;
  updateFieldDisplay();
  enableParameterSettingButtons(true); updateConsoleDisplay();
}

// --------------------
// Field Visual Display
// --------------------
function updateFieldDisplay() {
  const rect = document.getElementById('fieldDisplayRect');
  if (!rect) return;
  let widthPx = Math.max(0, (jawX1 + jawX2) * scaleFactor);
  let heightPx = Math.max(0, (jawY1 + jawY2) * scaleFactor);
  let leftPx = (fieldDisplayContainerSize / 2.0) - (jawX1 * scaleFactor);
  let topPx = (fieldDisplayContainerSize / 2.0) - (jawY2 * scaleFactor);
  rect.style.width = `${widthPx}px`;
  rect.style.height = `${heightPx}px`;
  rect.style.left = `${leftPx}px`;
  rect.style.top = `${topPx}px`;
}

// ---------------------
// Image Alignment Logic
// ---------------------
function moveOverlay(dx, dy) {
  overlayOffsetX += dx;
  overlayOffsetY += dy;
  if(overlayImageElement) overlayImageElement.style.transform = `translate(${overlayOffsetX}px, ${overlayOffsetY}px)`;
  updateShiftFeedback();
}
function updateShiftFeedback() {
  if(shiftFeedback) shiftFeedback.textContent = `Current Offset: X=${overlayOffsetX}, Y=${overlayOffsetY}`;
}
function checkAlignment() {
  if (Math.abs(overlayOffsetX) <= alignmentTolerance && Math.abs(overlayOffsetY) <= alignmentTolerance) {
    if(alignmentMessage) {
      alignmentMessage.textContent = "Alignment OK!";
      alignmentMessage.style.color = "green";
    }
    if(shiftFeedback) shiftFeedback.textContent = "";
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
function handleOpacityChange() {
  if (overlayImageElement && opacitySlider && opacityValueDisplay) {
    const opacity = opacitySlider.value / 100;
    overlayImageElement.style.opacity = opacity;
    opacityValueDisplay.textContent = `${opacitySlider.value}%`;
  }
}
function updateCaseAlignmentCounterDisplay() {
  if(alignmentCounterDisplay) alignmentCounterDisplay.textContent = `Correct Case Alignments: ${correctCaseAlignments}`;
}

// ------------------
// Beam (MLC) Effects
// ------------------
function startBeam() {
  const mlcImg = document.getElementById('mlcImage');
  if (mlcImg && !selectedEnergy.includes('MeV')) mlcImg.src = staticMlcImageUrl;
}
function stopBeam() {
  const mlcImg = document.getElementById('mlcImage');
  if (mlcImg) mlcImg.src = staticMlcImageUrl;
}

// ----------------------
// Initialization & Events
// ----------------------
document.addEventListener('DOMContentLoaded', () => {
  handleReset();
  // Attach Listeners
  if(btnReset) btnReset.onclick = handleReset;
  if(btnDoorControl) btnDoorControl.onclick = handleDoorControl;
  if(btnSetMu) btnSetMu.onclick = handleSetMU;
  if(energyToggleButton) energyToggleButton.onclick = cycleEnergy;
  if(btnPrepare) btnPrepare.onclick = handlePrepare;
  if(btnBeamOn) btnBeamOn.onclick = handleBeamOn;
  if(btnBeamOff) btnBeamOff.onclick = handleBeamOff;
  if (btnConeSize) btnConeSize.onclick = openConeModal;
  if (coneOptionsList) coneOptionsList.addEventListener('click', selectConeSize);
  if (opacitySlider) opacitySlider.addEventListener('input', handleOpacityChange);

  // Modal close on window click
  window.onclick = function(event) { if (event.target == coneModal) closeConeModal(); }

  // Arrow key controls for image alignment
  document.addEventListener('keydown', function(e) {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
    if (!currentLoadedPlan) return;
    let step = 1, handled = false;
    switch (e.key) {
      case 'ArrowUp': moveOverlay(0, -step); handled = true; break;
      case 'ArrowDown': moveOverlay(0, step); handled = true; break;
      case 'ArrowLeft': moveOverlay(-step, 0); handled = true; break;
      case 'ArrowRight': moveOverlay(step, 0); handled = true; break;
    }
    if (handled) e.preventDefault();
  });

  updateCaseAlignmentCounterDisplay();
});