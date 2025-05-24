// ===========================
// LINAC Console Emulator Logic (with MLC Visualizer)
// ===========================

/* -----------------------------
   GLOBAL VARIABLES & CONSTANTS
------------------------------*/
const energyOptions = ['6 MV', '10 MV', '15 MV', '18 MV', '6 MeV', '9 MeV', '12 MeV', '15 MeV', '18 MeV'];
let currentEnergyIndex = 0;
let selectedEnergy = energyOptions[0];

let isPrepared = false;
let isBeaming = false;
let isDoorOpen = true;
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

/* --- Image alignment --- */
let overlayOffsetX = 0, overlayOffsetY = 0, initialOverlayShiftX = 0, initialOverlayShiftY = 0;
const alignmentTolerance = 2;
let correctCaseAlignments = 0;
let hasCurrentCaseAlignmentBeenCounted = false;
const defaultImageUrl = "https://via.placeholder.com/400x300.png?text=Load+Case";

/* --- MLC Visualizer --- */
const NUM_LEAF_PAIRS = 5;
let leftLeafPositions = Array(NUM_LEAF_PAIRS).fill(jawX1);
let rightLeafPositions = Array(NUM_LEAF_PAIRS).fill(jawX2);
const fieldDisplayContainerSize = 220;
const centerPx = fieldDisplayContainerSize / 2.0;
const maxFieldCoordinate = 20.0;
const scaleFactor = (fieldDisplayContainerSize / 2.0) / maxFieldCoordinate;

/* --- DOM ELEMENTS --- */
const baseImageElement = document.getElementById('baseImage');
const overlayImageElement = document.getElementById('overlayImage');
const opacitySlider = document.getElementById('opacitySlider');
const opacityValueDisplay = document.getElementById('opacityValue');
const alignmentMessage = document.getElementById('alignmentMessage');
const shiftFeedback = document.getElementById('shiftFeedback');
const alignmentCounterDisplay = document.getElementById('alignmentCounterDisplay');
const statusBar = document.getElementById('status-bar');
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
   PATIENT CASE GENERATION
------------------------------*/
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
  document.getElementById('patientName').textContent = plan.patientName;
  document.getElementById('patientDOB').textContent = plan.patientDOB;
  document.getElementById('patientDiagnosis').textContent = plan.patientDiagnosis;
  document.getElementById('patientType').textContent = plan.patientType;
  document.getElementById('labCreat').textContent = plan.labCreat + " mg/dL";
  document.getElementById('labWBC').textContent = plan.labWBC + " K/uL";
  const imageUrl = plan.alignmentImageUrl || defaultImageUrl;
  if (baseImageElement) baseImageElement.src = imageUrl;
  if (overlayImageElement) overlayImageElement.src = imageUrl;

  initialOverlayShiftX = getRandomInt(-20, 20);
  initialOverlayShiftY = getRandomInt(-20, 20);
  overlayOffsetX = initialOverlayShiftX; overlayOffsetY = initialOverlayShiftY;
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
  setMU = field.mu; deliveredMU = 0;
  gantryAngle = field.gantry; collimatorAngle = field.collimator; couchAngle = field.couch;
  jawX1 = field.x1; jawX2 = field.x2; jawY1 = field.y1; jawY2 = field.y2;
  updateControlPanelDisplays(); updateMachineParameterDisplays();
  isPrepared = false; isBeaming = false;
  if(beamTimeoutId) clearInterval(beamTimeoutId); beamTimeoutId = null;
  enableParameterSettingButtons(true); updateConsoleDisplay();
  document.querySelectorAll('.treatment-field').forEach((el, idx) => {
    el.style.border = idx === fieldIndex ? '2px solid #003366' : '1px solid #ddd';
  });
  updateStatusBar();
}

/* -----------------------------
   CONTROL HANDLERS
------------------------------*/
function changeGantry(delta) {
  if (isBeaming) return;
  gantryAngle = (gantryAngle + delta + 360) % 360;
  updateControlPanelDisplays();
  updateMachineParameterDisplays();
  isPrepared = false;
  enableParameterSettingButtons(true);
  updateConsoleDisplay();
}
function changeCollimator(delta) {
  if (isBeaming) return;
  collimatorAngle = (collimatorAngle + delta + 360) % 360;
  updateControlPanelDisplays();
  updateMachineParameterDisplays();
  isPrepared = false;
  enableParameterSettingButtons(true);
  updateConsoleDisplay();
}
function changeCouch(delta) {
  if (isBeaming) return;
  couchAngle = (couchAngle + delta + 360) % 360;
  updateControlPanelDisplays();
  updateMachineParameterDisplays();
  isPrepared = false;
  enableParameterSettingButtons(true);
  updateConsoleDisplay();
}
function changeFieldSize(dimension, delta) {
  if (fieldAdjustmentLocked || isBeaming) return;
  const maxJawPos = 20.0;
  switch (dimension) {
    case 'X1': jawX1 = Math.min(maxJawPos, Math.max(0, +(jawX1 + delta).toFixed(1))); break;
    case 'X2': jawX2 = Math.min(maxJawPos, Math.max(0, +(jawX2 + delta).toFixed(1))); break;
    case 'Y1': jawY1 = Math.min(maxJawPos, Math.max(0, +(jawY1 + delta).toFixed(1))); break;
    case 'Y2': jawY2 = Math.min(maxJawPos, Math.max(0, +(jawY2 + delta).toFixed(1))); break;
  }
  for (let i = 0; i < NUM_LEAF_PAIRS; i++) {
    leftLeafPositions[i] = jawX1;
    rightLeafPositions[i] = jawX2;
  }
  updateControlPanelDisplays();
  updateMachineParameterDisplays();
  isPrepared = false;
  enableParameterSettingButtons(true);
  updateConsoleDisplay();
}
function cycleEnergy() {
  if (isBeaming) return;
  if (loadedFieldIndex !== -1) {
    alert("Cannot cycle energy manually when a field is loaded. Reset or generate a new case.");
    return;
  }
  currentEnergyIndex = (currentEnergyIndex + 1) % energyOptions.length;
  selectedEnergy = energyOptions[currentEnergyIndex];
  updateControlPanelDisplays();
  updateMachineParameterDisplays();
  isPrepared = false;
  enableParameterSettingButtons(true);
  updateConsoleDisplay();
}
function enableParameterSettingButtons(enable = true) {
  document.getElementById('btn-set-mu').classList.toggle('disabled', !enable);
  document.getElementById('energyToggleButton').classList.toggle('disabled', !enable);
  document.getElementById('btn-prepare').classList.toggle('disabled', !(enable && loadedFieldIndex !== -1 && !isBeaming && !isPrepared && !isDoorOpen));
  document.getElementById('btn-beam-on').classList.toggle('disabled', !(enable && isPrepared && !isBeaming && !isDoorOpen));
  document.getElementById('btn-beam-off').classList.toggle('disabled', !isBeaming);
  setFieldAdjustmentEnabled(enable && !isBeaming && !selectedEnergy.includes('MeV'));
}
function setFieldAdjustmentEnabled(enabled) {
  document.querySelectorAll('.field-control-group button').forEach(btn => btn.disabled = !enabled);
  fieldAdjustmentLocked = !enabled;
}

/* -----------------------------
   BEAM ON/OFF & PREP
------------------------------*/
function handleSetMU() {
  if (document.getElementById('btn-set-mu').classList.contains('disabled')) return;
  const muInput = prompt(`Enter MU (1-1000):`, setMU > 0 ? setMU : 100);
  const muVal = parseInt(muInput);
  if (!isNaN(muVal) && muVal > 0 && muVal <= 1000) {
    setMU = muVal;
    deliveredMU = 0;
    isPrepared = false;
    enableParameterSettingButtons(true);
    updateConsoleDisplay();
  }
}
function handlePrepare() {
  if(document.getElementById('btn-prepare').classList.contains('disabled')) return;
  if (loadedFieldIndex === -1 || selectedEnergy === "---" || setMU <= 0 || isDoorOpen) return;
  isPrepared = true;
  enableParameterSettingButtons(true);
  updateConsoleDisplay();
}
function handleBeamOn() {
  if (document.getElementById('btn-beam-on').classList.contains('disabled') || isBeaming) return;
  if (!isPrepared) return;
  if (isDoorOpen) return;
  if (setMU <= 0) return;
  isBeaming = true; deliveredMU = 0; enableParameterSettingButtons(false);
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
  enableParameterSettingButtons(true);
  updateConsoleDisplay();
}
function handleDoorControl() {
  isDoorOpen = !isDoorOpen;
  enableParameterSettingButtons(true);
  updateConsoleDisplay();
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
  // Reset Images
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
  enableParameterSettingButtons(true);
  updateConsoleDisplay();
  updateStatusBar();
}

/* -----------------------------
   IMAGE ALIGNMENT LOGIC
------------------------------*/
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

/* -----------------------------
   MLC VISUALIZER LOGIC
------------------------------*/
const NUM_LEAF_PAIRS = 5;
let leftLeafPositions = [];
let rightLeafPositions = [];
let collimatorAngle = 0; // global collimator angle (shared by visualizer and parameters)
const fieldDisplayContainerSize = 220;
const maxFieldCoordinate = 20.0;
const centerPx = fieldDisplayContainerSize / 2.0;
const scaleFactor = (fieldDisplayContainerSize > 0) ? (fieldDisplayContainerSize / 2.0) / maxFieldCoordinate : 1;

// Create MLC visualizer leaf DOM elements on load
document.addEventListener('DOMContentLoaded', () => {
  // Main MLC visualizer container
  const fieldDisplayContainer = document.getElementById('fieldDisplayContainer');
  // Remove any leaves if reloading
  if (fieldDisplayContainer) {
    // Clean up on reload
    Array.from(fieldDisplayContainer.querySelectorAll('.leaf-pair-container')).forEach(el => el.remove());
    for (let i = 0; i < NUM_LEAF_PAIRS; i++) {
      leftLeafPositions[i] = 5.0;
      rightLeafPositions[i] = 5.0;
      // Create container for this leaf pair
      const pairContainer = document.createElement('div');
      pairContainer.className = 'leaf-pair-container';
      pairContainer.id = `leafPairContainer_${i}`;
      // Outer left leaf (outside field)
      const outerLeftLeaf = document.createElement('div');
      outerLeftLeaf.className = 'leaf-section outer left';
      outerLeftLeaf.id = `outerLeftLeaf_${i}`;
      // Inner left leaf (inside field)
      const innerLeftLeaf = document.createElement('div');
      innerLeftLeaf.className = 'leaf-section inner left';
      innerLeftLeaf.id = `innerLeftLeaf_${i}`;
      // Inner right leaf (inside field)
      const innerRightLeaf = document.createElement('div');
      innerRightLeaf.className = 'leaf-section inner right';
      innerRightLeaf.id = `innerRightLeaf_${i}`;
      // Outer right leaf (outside field)
      const outerRightLeaf = document.createElement('div');
      outerRightLeaf.className = 'leaf-section outer right';
      outerRightLeaf.id = `outerRightLeaf_${i}`;
      // Append in order: outer left, inner left, inner right, outer right
      pairContainer.appendChild(outerLeftLeaf);
      pairContainer.appendChild(innerLeftLeaf);
      pairContainer.appendChild(innerRightLeaf);
      pairContainer.appendChild(outerRightLeaf);
      fieldDisplayContainer.appendChild(pairContainer);
    }
  }
  updateOuterVisualsAndContainers();
  updateInnerLeafVisuals(leftLeafPositions, rightLeafPositions, false);

  // Add listeners for all MLC buttons
  [
    { id: 'presetMatchJaw', fn: () => setLeafPreset('match') },
    { id: 'presetSquare', fn: () => setLeafPreset('square') },
    { id: 'presetOffset', fn: () => setLeafPreset('offset') },
    { id: 'presetBlock', fn: () => setLeafPreset('block') },
    { id: 'presetCshape', fn: () => setLeafPreset('cshape') },
    { id: 'presetDiagonal', fn: () => setLeafPreset('diagonal') },
    { id: 'presetDiagRev', fn: () => setLeafPreset('diagRev') },
    { id: 'presetDiagShallow', fn: () => setLeafPreset('diagShallow') },
    { id: 'animateSquareRandBtn', fn: () => startPresetAnimation('square') },
    { id: 'animateOffsetRandBtn', fn: () => startPresetAnimation('offset') },
    { id: 'animateDiagonalRandBtn', fn: () => startPresetAnimation('diagonal') },
    { id: 'slidingWindowBtn', fn: startSlidingWindowDemo },
    { id: 'imrtDemoBtn', fn: startImrtDemo }
  ].forEach(({ id, fn }) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', fn);
  });
});

// --- Helper Functions (MLC) ---
function getFieldDimensionsPx() {
  const leftPx = centerPx - (jawX1 * scaleFactor);
  const rightPx = centerPx + (jawX2 * scaleFactor);
  const topPx = centerPx - (jawY2 * scaleFactor);
  const bottomPx = centerPx + (jawY1 * scaleFactor);
  const widthPx = Math.max(0, rightPx - leftPx);
  const heightPx = Math.max(0, bottomPx - topPx);
  return { leftPx, topPx, widthPx, heightPx };
}
function updateOuterVisualsAndContainers() {
  const fieldRectEl = document.getElementById('fieldDisplayRect');
  if (!fieldRectEl) return;
  document.getElementById('control-jawX1').textContent = jawX1.toFixed(1);
  document.getElementById('control-jawX2').textContent = jawX2.toFixed(1);
  document.getElementById('control-jawY1').textContent = jawY1.toFixed(1);
  document.getElementById('control-jawY2').textContent = jawY2.toFixed(1);
  document.getElementById('jawX1').textContent = jawX1.toFixed(1);
  document.getElementById('jawX2').textContent = jawX2.toFixed(1);
  document.getElementById('jawY1').textContent = jawY1.toFixed(1);
  document.getElementById('jawY2').textContent = jawY2.toFixed(1);
  const dims = getFieldDimensionsPx();
  fieldRectEl.style.width = `${dims.widthPx}px`;
  fieldRectEl.style.height = `${dims.heightPx}px`;
  fieldRectEl.style.left = `${dims.leftPx}px`;
  fieldRectEl.style.top = `${dims.topPx}px`;
  const leafPairHeight = (NUM_LEAF_PAIRS > 0 && dims.heightPx >= 0) ? (dims.heightPx / NUM_LEAF_PAIRS) : 0;
  for (let i = 0; i < NUM_LEAF_PAIRS; i++) {
    const outerLeftEl = document.getElementById(`outerLeftLeaf_${i}`);
    const outerRightEl = document.getElementById(`outerRightLeaf_${i}`);
    const pairContainerEl = document.getElementById(`leafPairContainer_${i}`);
    if (!outerLeftEl || !outerRightEl || !pairContainerEl) continue;
    const pairTop = dims.topPx + (i * leafPairHeight);
    pairContainerEl.style.top = `${pairTop}px`;
    pairContainerEl.style.height = `${leafPairHeight}px`;
    outerLeftEl.style.left = '0px';
    outerLeftEl.style.width = `${Math.max(0, dims.leftPx)}px`;
    const fieldRightEdgePx = dims.leftPx + dims.widthPx;
    outerRightEl.style.left = `${fieldRightEdgePx}px`;
    outerRightEl.style.width = `${Math.max(0, fieldDisplayContainerSize - fieldRightEdgePx)}px`;
  }
}
function updateInnerLeafVisuals(currentLeft, currentRight, disableTransitions = false) {
  const dims = getFieldDimensionsPx();
  if (scaleFactor <= 0 || fieldDisplayContainerSize <= 0 || dims.widthPx < 0 || dims.heightPx < 0) return;
  const leafPairHeight = (NUM_LEAF_PAIRS > 0 && dims.heightPx >= 0) ? (dims.heightPx / NUM_LEAF_PAIRS) : 0;
  for (let i = 0; i < NUM_LEAF_PAIRS; i++) {
    const innerLeftEl = document.getElementById(`innerLeftLeaf_${i}`);
    const innerRightEl = document.getElementById(`innerRightLeaf_${i}`);
    const pairContainerEl = document.getElementById(`leafPairContainer_${i}`);
    if (!innerLeftEl || !innerRightEl || !pairContainerEl) continue;
    const pairTop = dims.topPx + (i * leafPairHeight);
    pairContainerEl.style.top = `${pairTop}px`;
    pairContainerEl.style.height = `${leafPairHeight}px`;
    let clampedLeft = Math.min(jawX1, currentLeft[i] ?? jawX1);
    let clampedRight = Math.min(jawX2, currentRight[i] ?? jawX2);
    if (!isAnimating && !disableTransitions) {
      leftLeafPositions[i] = clampedLeft; rightLeafPositions[i] = clampedRight;
    }
    const leftTipPx = centerPx - (clampedLeft * scaleFactor);
    const rightTipPx = centerPx + (clampedRight * scaleFactor);
    const fieldRightEdgePx = dims.leftPx + dims.widthPx;
    innerLeftEl.style.left = `${dims.leftPx}px`;
    innerLeftEl.style.width = `${Math.max(0, leftTipPx - dims.leftPx)}px`;
    innerRightEl.style.left = `${rightTipPx}px`;
    innerRightEl.style.width = `${Math.max(0, fieldRightEdgePx - rightTipPx)}px`;
    if (disableTransitions) {
      innerLeftEl.classList.remove('inner'); innerRightEl.classList.remove('inner');
    } else {
      innerLeftEl.classList.add('inner'); innerRightEl.classList.add('inner');
    }
  }
}

// --- Preset Calculation & Setting ---
function calculatePresetPositions(presetType) {
  const targetLeft = []; const targetRight = [];
  const squareSizeCm = 4; const offsetPosCm = 2; const blockPosCm = 1;
  const cShapeInner = 3, cShapeOuter = 8;
  const diagStep = (jawX1 + jawX2 > 0) ? (jawX1 + jawX2) / Math.max(1, NUM_LEAF_PAIRS - 1) : 1;
  const minGap = 0.5;
  for (let i = 0; i < NUM_LEAF_PAIRS; i++) {
    let left, right;
    switch (presetType) {
      case 'match': left = jawX1; right = jawX2; break;
      case 'square': left = squareSizeCm; right = squareSizeCm; break;
      case 'offset': left = jawX1; right = offsetPosCm; break;
      case 'block': left = blockPosCm; right = blockPosCm; break;
      case 'cshape':
        if (i === 0 || i === NUM_LEAF_PAIRS - 1) { left = cShapeOuter; right = cShapeOuter; }
        else { left = cShapeInner; right = cShapeOuter; }
        break;
      case 'diagonal': {
        let l = jawX1 - (i * diagStep * 0.5);
        let r = jawX2 - ((NUM_LEAF_PAIRS - 1 - i) * diagStep * 0.5);
        if (l + r < minGap) { const adj = (minGap - (l + r)) / 2; l -= adj; r -= adj; }
        left = l; right = r;
        break;
      }
      case 'diagRev': {
        let l = jawX1 - ((NUM_LEAF_PAIRS - 1 - i) * diagStep * 0.5);
        let r = jawX2 - (i * diagStep * 0.5);
        if (l + r < minGap) { const adj = (minGap - (l + r)) / 2; l -= adj; r -= adj; }
        left = l; right = r;
        break;
      }
      case 'diagShallow': {
        let m = 0.25;
        let l = jawX1 - (i * diagStep * m);
        let r = jawX2 - ((NUM_LEAF_PAIRS - 1 - i) * diagStep * m);
        if (l + r < minGap) { const adj = (minGap - (l + r)) / 2; l -= adj; r -= adj; }
        left = l; right = r;
        break;
      }
      default: left = jawX1; right = jawX2;
    }
    targetLeft[i] = Math.min(jawX1, Math.max(0, left ?? jawX1));
    targetRight[i] = Math.min(jawX2, Math.max(0, right ?? jawX2));
  }
  return { targetLeft, targetRight };
}
function setLeafPreset(presetType) {
  stopAllAnimations();
  const { targetLeft, targetRight } = calculatePresetPositions(presetType);
  leftLeafPositions = targetLeft;
  rightLeafPositions = targetRight;
  updateOuterVisualsAndContainers();
  updateInnerLeafVisuals(leftLeafPositions, rightLeafPositions, false);
}

// --- Animation Control ---
let isAnimating = false;
let currentAnimationFrameId = null;
let animStartTime = 0;
let animType = 'NONE';
let animStartLeft = [], animStartRight = [], animTargetLeft = [], animTargetRight = [], animDurations = [];
let currentAnimatingButton = null;
function stopAllAnimations() {
  if (isAnimating) {
    cancelAnimationFrame(currentAnimationFrameId); currentAnimationFrameId = null; isAnimating = false; animType = 'NONE';
    if(currentAnimatingButton) { currentAnimatingButton.classList.remove('animating'); }
    ['slidingWindowBtn','animateSquareRandBtn','animateOffsetRandBtn','animateDiagonalRandBtn','imrtDemoBtn'].forEach(id => {
      const btn = document.getElementById(id); if(btn) btn.textContent = btn.getAttribute('data-label') || btn.textContent.replace(/Stop.*/,'Demo');
      if(btn) btn.classList.remove('animating');
    });
    currentAnimatingButton = null;
    updateOuterVisualsAndContainers();
    updateInnerLeafVisuals(leftLeafPositions, rightLeafPositions, false);
  }
}
function lerp(start, end, t) { return start * (1 - t) + end * t; }
function startSlidingWindowDemo() {
  if (isAnimating) { stopAllAnimations(); return; }
  isAnimating = true; animType = 'SLIDING'; currentAnimatingButton = document.getElementById('slidingWindowBtn');
  currentAnimatingButton.classList.add('animating');
  currentAnimatingButton.textContent = "Stop Demo";
  const windowGapCm = 2.0; const duration = 8000;
  const jawFieldStartX = centerPx - (jawX1 * scaleFactor);
  const jawFieldEndX = centerPx + (jawX2 * scaleFactor);
  const windowGapPx = windowGapCm * scaleFactor;
  const targetLeftEndPx = jawFieldEndX;
  const targetRightStartPx = jawFieldStartX + windowGapPx;
  const targetRightEndPx = targetLeftEndPx + windowGapPx;
  animStartTime = performance.now();
  function animationStep(timestamp) {
    if (!isAnimating || animType !== 'SLIDING') return;
    const elapsedTime = timestamp - animStartTime;
    let progress = Math.min(1, elapsedTime / duration);
    let currentLeftTipPx = lerp(jawFieldStartX, targetLeftEndPx, progress);
    let currentRightTipPx = lerp(targetRightStartPx, targetRightEndPx, progress);
    let animLeftPos = Math.max(0, -(currentLeftTipPx - centerPx) / scaleFactor);
    let animRightPos = Math.max(0, (currentRightTipPx - centerPx) / scaleFactor);
    const currentLeft = new Array(NUM_LEAF_PAIRS).fill(animLeftPos);
    const currentRight = new Array(NUM_LEAF_PAIRS).fill(animRightPos);
    updateInnerLeafVisuals(currentLeft, currentRight, true);
    if (progress < 1) {
      currentAnimationFrameId = requestAnimationFrame(animationStep);
    } else {
      stopAllAnimations();
    }
  }
  currentAnimationFrameId = requestAnimationFrame(animationStep);
}
function startPresetAnimation(presetType) {
  if (isAnimating) { stopAllAnimations(); return; }
  isAnimating = true; animType = 'PRESET';
  currentAnimatingButton = document.getElementById(
    presetType === 'square' ? 'animateSquareRandBtn' :
    presetType === 'offset' ? 'animateOffsetRandBtn' :
    presetType === 'diagonal' ? 'animateDiagonalRandBtn' : null
  );
  if(currentAnimatingButton) {
    currentAnimatingButton.classList.add('animating');
    currentAnimatingButton.textContent = "Stop Animation";
  }
  const { targetLeft, targetRight } = calculatePresetPositions(presetType);
  animTargetLeft = targetLeft; animTargetRight = targetRight;
  animStartLeft = [...leftLeafPositions]; animStartRight = [...rightLeafPositions];
  animDurations = [];
  const baseDuration = 2000; const durationVariation = 1000;
  let maxDuration = 0;
  for (let i = 0; i < NUM_LEAF_PAIRS; i++) {
    const duration = baseDuration + (Math.random() * durationVariation);
    animDurations[i] = duration;
    if (duration > maxDuration) maxDuration = duration;
  }
  animStartTime = performance.now();
  function presetAnimationStep(timestamp) {
    if (!isAnimating || animType !== 'PRESET') return;
    const elapsedTime = timestamp - animStartTime;
    let allDone = true;
    const currentLeft = []; const currentRight = [];
    for (let i = 0; i < NUM_LEAF_PAIRS; i++) {
      const pairDuration = animDurations[i];
      const progress = Math.min(1, elapsedTime / pairDuration);
      currentLeft[i] = lerp(animStartLeft[i], animTargetLeft[i], progress);
      currentRight[i] = lerp(animStartRight[i], animTargetRight[i], progress);
      if (progress < 1) allDone = false;
    }
    updateInnerLeafVisuals(currentLeft, currentRight, true);
    if (!allDone) {
      currentAnimationFrameId = requestAnimationFrame(presetAnimationStep);
    } else {
      leftLeafPositions = [...animTargetLeft]; rightLeafPositions = [...animTargetRight];
      stopAllAnimations();
    }
  }
  currentAnimationFrameId = requestAnimationFrame(presetAnimationStep);
}

// --- NEW: IMRT Demo Animation Logic ---
const imrtSequence = ['square', 'offset', 'diagonal', 'cshape', 'block', 'match'];
let currentImrtStep = 0;
let imrtStepDuration = 2500;
function startImrtDemo() {
  if (isAnimating) { stopAllAnimations(); return; }
  isAnimating = true; animType = 'IMRT'; currentImrtStep = 0;
  currentAnimatingButton = document.getElementById('imrtDemoBtn');
  currentAnimatingButton.classList.add('animating');
  currentAnimatingButton.textContent = "Stop IMRT";
  prepareAndRunImrtStep();
}
function prepareAndRunImrtStep() {
  if (currentImrtStep >= imrtSequence.length) { stopAllAnimations(); return; }
  const currentPresetType = imrtSequence[currentImrtStep];
  const { targetLeft, targetRight } = calculatePresetPositions(currentPresetType);
  animTargetLeft = targetLeft; animTargetRight = targetRight;
  animStartLeft = [...leftLeafPositions]; animStartRight = [...rightLeafPositions];
  animStartTime = performance.now();
  currentAnimationFrameId = requestAnimationFrame(imrtAnimationStep);
}
function imrtAnimationStep(timestamp) {
  if (!isAnimating || animType !== 'IMRT') return;
  const elapsedTime = timestamp - animStartTime;
  const progress = Math.min(1, elapsedTime / imrtStepDuration);
  const currentLeft = [];
  const currentRight = [];
  for (let i = 0; i < NUM_LEAF_PAIRS; i++) {
    currentLeft[i] = lerp(animStartLeft[i], animTargetLeft[i], progress);
    currentRight[i] = lerp(animStartRight[i], animTargetRight[i], progress);
  }
  updateInnerLeafVisuals(currentLeft, currentRight, true);
  if (progress >= 1) {
    leftLeafPositions = [...animTargetLeft]; rightLeafPositions = [...animTargetRight];
    currentImrtStep++; prepareAndRunImrtStep();
  } else currentAnimationFrameId = requestAnimationFrame(imrtAnimationStep);
}

// --- END MLC VISUALIZER LOGIC ---

/* -----------------------------
   FIELD VISUALIZER LOGIC
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

/* -----------------------------
   INIT & EVENT LISTENERS
------------------------------*/
document.addEventListener('DOMContentLoaded', function() {
  // MLC Visualizer DOM setup is handled above!
  // Case generation button hookup
  if (generateCaseBtn) generateCaseBtn.onclick = generateAndDisplayPatientCase;
  // Control panel
  document.getElementById('btn-set-mu').onclick = handleSetMU;
  document.getElementById('energyToggleButton').onclick = cycleEnergy;
  document.getElementById('btn-prepare').onclick = handlePrepare;
  document.getElementById('btn-beam-on').onclick = handleBeamOn;
  document.getElementById('btn-beam-off').onclick = handleBeamOff;
  document.getElementById('btn-reset').onclick = handleReset;
  document.getElementById('btn-door-control').onclick = handleDoorControl;
  if (opacitySlider) opacitySlider.addEventListener('input', handleOpacityChange);
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
  updateControlPanelDisplays();
  updateMachineParameterDisplays();
  updateConsoleDisplay();
  updateStatusBar();
});
