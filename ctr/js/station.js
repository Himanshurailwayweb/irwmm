const k1Terminals = [
  { number: "01", status: "SPARE", particular: "", locationBox: "", locationTerminal: "", remarks: "" },
  { number: "02", status: "SPARE", particular: "", locationBox: "", locationTerminal: "", remarks: "" },
  { number: "03", status: "SPARE", particular: "", locationBox: "", locationTerminal: "", remarks: "" },
  { number: "04", status: "SPARE", particular: "", locationBox: "", locationTerminal: "", remarks: "" },
  { number: "05", status: "SPARE", particular: "", locationBox: "", locationTerminal: "", remarks: "" },
  { number: "06", status: "SPARE", particular: "", locationBox: "", locationTerminal: "", remarks: "" },
  { number: "07", status: "SPARE", particular: "", locationBox: "", locationTerminal: "", remarks: "" },
  { number: "08", status: "SPARE", particular: "", locationBox: "", locationTerminal: "", remarks: "" },
  { number: "09", status: "SPARE", particular: "", locationBox: "", locationTerminal: "", remarks: "" },
  { number: "10", status: "SPARE", particular: "", locationBox: "", locationTerminal: "", remarks: "" },
  { number: "11", status: "SPARE", particular: "", locationBox: "", locationTerminal: "", remarks: "" },
  { number: "12", status: "SPARE", particular: "", locationBox: "", locationTerminal: "", remarks: "" }
];


const k1TerminalStrip =
  document.getElementById("k1-terminal-strip");

const terminalEditor =
  document.getElementById("terminalEditor");

const selectedTerminalTitle =
  document.getElementById("selectedTerminalTitle");

const currentTerminalStatus =
  document.getElementById("currentTerminalStatus");

const circuitParticular =
  document.getElementById("circuitParticular");

const locationBox =
  document.getElementById("locationBox");

const locationTerminal =
  document.getElementById("locationTerminal");

const terminalStatus =
  document.getElementById("terminalStatus");

const terminalRemarks =
  document.getElementById("terminalRemarks");

const closeTerminalEditor =
  document.getElementById("closeTerminalEditor");

const cancelTerminalEdit =
  document.getElementById("cancelTerminalEdit");

const saveTerminalPreview =
  document.getElementById("saveTerminalPreview");


let selectedTerminal = null;


function renderK1Terminals() {

  k1TerminalStrip.innerHTML = "";


  k1Terminals.forEach(function (terminal) {

    const button =
      document.createElement("button");

    button.type = "button";

    button.className =
      terminal.status === "IN USE"
        ? "terminal in-use"
        : "terminal";


    button.innerHTML = `
      <span class="terminal-number">
        ${terminal.number}
      </span>

      <span class="terminal-line"></span>

      <span class="terminal-point"></span>

      <span class="terminal-line"></span>

      <strong>
        ${terminal.status}
      </strong>

      <span class="terminal-particular">
        ${terminal.particular || ""}
      </span>
    `;


    button.addEventListener(
      "click",
      function () {

        openTerminalEditor(terminal);

      }
    );


    k1TerminalStrip.appendChild(button);

  });

}


function openTerminalEditor(terminal) {

  selectedTerminal = terminal;


  selectedTerminalTitle.textContent =
    `K1 / Row A / Terminal ${terminal.number}`;


  currentTerminalStatus.textContent =
    terminal.status;


  circuitParticular.value =
    terminal.particular;

  locationBox.value =
    terminal.locationBox;

  locationTerminal.value =
    terminal.locationTerminal;

  terminalStatus.value =
    terminal.status;

  terminalRemarks.value =
    terminal.remarks;


  terminalEditor.classList.add("open");


  terminalEditor.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}


function closeEditor() {

  terminalEditor.classList.remove("open");

  selectedTerminal = null;

}


function saveInitialTerminalData() {

  if (!selectedTerminal) {
    return;
  }


  selectedTerminal.particular =
    circuitParticular.value.trim();

  selectedTerminal.locationBox =
    locationBox.value.trim();

  selectedTerminal.locationTerminal =
    locationTerminal.value.trim();

  selectedTerminal.status =
    terminalStatus.value;

  selectedTerminal.remarks =
    terminalRemarks.value.trim();


  currentTerminalStatus.textContent =
    selectedTerminal.status;


  renderK1Terminals();


  terminalEditor.classList.remove("open");

  selectedTerminal = null;

}


closeTerminalEditor.addEventListener(
  "click",
  closeEditor
);


cancelTerminalEdit.addEventListener(
  "click",
  closeEditor
);


saveTerminalPreview.addEventListener(
  "click",
  saveInitialTerminalData
);


renderK1Terminals();