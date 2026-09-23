/* =========================================================
   CTR STATION DRAWING BUILDER
   SUPABASE DATABASE VERSION

   FEATURES
   ---------------------------------------------------------
   - Station CTR Racks
   - Fuse Details
   - Rows / Conductors / Terminals
   - Connected Ends
   - Location Boxes
   - Location Box Fuse Details + Direct Rows
   - Terminal Editor
   - Supabase Draft Save / Load / Reset
   - Station Status Sync
   - PDF Style Fuse Display
========================================================= */


/* =========================================================
   BASIC DATA
========================================================= */

function createId() {

  if (
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {

    return window.crypto.randomUUID();

  }


  return (
    Date.now().toString() +
    "-" +
    Math.random().toString(16).slice(2)
  );

}


function escapeHtml(value) {

  return String(
    value ?? ""
  )
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function createFusePoint(number) {

  return {

    id:
      createId(),

    label:
      `F${number}`,

    details:
      ""

  };

}


function createTerminal(number) {

  return {

    id:
      createId(),

    number:
      String(number)
        .padStart(
          2,
          "0"
        ),

    status:
      "SPARE",

    particular:
      "",

    locationBox:
      "",

    locationTerminal:
      "",

    remarks:
      ""

  };

}


function createRow(
  label,
  conductorCount = 12
) {

  const terminals =
    [];


  for (
    let i = 1;
    i <= conductorCount;
    i++
  ) {

    terminals.push(
      createTerminal(i)
    );

  }


  return {

    id:
      createId(),

    label:
      label,

    terminals:
      terminals

  };

}


function createCtrRack(number) {

  return {

    id:
      createId(),

    autoNumber:
      number,

    name:
      `K${number}`,

    fuseDetails:
      [],

    rows: [

      createRow(
        "A",
        12
      )

    ]

  };

}


/* =========================================================
   HELPERS
========================================================= */

function getRowLabel(index) {

  let number =
    index + 1;


  let label =
    "";


  while (
    number > 0
  ) {

    number--;


    label =
      String.fromCharCode(
        65 +
        (
          number % 26
        )
      ) +
      label;


    number =
      Math.floor(
        number / 26
      );

  }


  return label;

}


function getNextRackNumber(racks) {

  let highest =
    0;


  racks.forEach(
    function (rack) {

      if (
        typeof rack.autoNumber ===
        "number"
      ) {

        highest =
          Math.max(
            highest,
            rack.autoNumber
          );

      }


      const match =
        String(
          rack.name || ""
        )
          .trim()
          .match(
            /^K(\d+)$/i
          );


      if (match) {

        highest =
          Math.max(
            highest,
            Number(
              match[1]
            )
          );

      }

    }
  );


  return highest + 1;

}


function getNextFuseNumber(
  fuseDetails
) {

  let highest =
    0;


  fuseDetails.forEach(
    function (fuse) {

      const match =
        String(
          fuse.label || ""
        )
          .trim()
          .match(
            /^F(\d+)$/i
          );


      if (match) {

        highest =
          Math.max(
            highest,
            Number(
              match[1]
            )
          );

      }

    }
  );


  return highest + 1;

}


function renumberTerminals(row) {

  row.terminals.forEach(
    function (
      terminal,
      index
    ) {

      terminal.number =
        String(
          index + 1
        )
          .padStart(
            2,
            "0"
          );

    }
  );

}


function relabelRows(rack) {

  rack.rows.forEach(
    function (
      row,
      index
    ) {

      row.label =
        getRowLabel(
          index
        );

    }
  );

}


/* =========================================================
   MAIN CTR DATA
========================================================= */

const stationCtrRacks = [

  createCtrRack(1)

];


const connectedEnds =
  [];


/* =========================================================
   CURRENT STATION
========================================================= */

const currentStationId =
  document.body.dataset.stationId ||
  null;


/* =========================================================
   CONNECTED END HELPERS
========================================================= */

function getNextEndNumber() {

  let highest =
    0;


  connectedEnds.forEach(
    function (end) {

      highest =
        Math.max(
          highest,
          Number(
            end.autoNumber
          ) || 0
        );

    }
  );


  return highest + 1;

}


function getNextLocationNumber(end) {

  let highest =
    0;


  end.locations.forEach(
    function (location) {

      highest =
        Math.max(
          highest,
          Number(
            location.autoNumber
          ) || 0
        );

    }
  );


  return highest + 1;

}


function createConnectedEnd() {

  const number =
    getNextEndNumber();


  return {

    id:
      createId(),

    autoNumber:
      number,

    name:
      `Connected End ${number}`,

    locations:
      []

  };

}


function createLocation(end) {

  const number =
    getNextLocationNumber(
      end
    );


  return {

    id:
      createId(),

    autoNumber:
      number,

    name:
      `Location Box ${number}`,

    /*
      FINAL LOCATION BOX STRUCTURE

      Location Box
      ├── Fuse Details
      └── Direct Rows / Columns / Terminals

      No K1 / K2 / K3 rack layer
      inside Location Box.
    */

    fuseDetails:
      [],

    rows: [

      createRow(
        "A",
        12
      ),

      createRow(
        "B",
        12
      ),

      createRow(
        "C",
        12
      ),

      createRow(
        "D",
        12
      )

    ]

  };

}


/* =========================================================
   DOM REFERENCES
========================================================= */

const stationCtrRacksContainer =
  document.getElementById(
    "stationCtrRacksContainer"
  );


const addStationCtrRackButton =
  document.getElementById(
    "addStationCtrRack"
  );


const connectedEndsContainer =
  document.getElementById(
    "connectedEndsContainer"
  );


const addConnectedEndButton =
  document.getElementById(
    "addConnectedEnd"
  );


const terminalEditor =
  document.getElementById(
    "terminalEditor"
  );


const selectedTerminalTitle =
  document.getElementById(
    "selectedTerminalTitle"
  );


const currentTerminalStatus =
  document.getElementById(
    "currentTerminalStatus"
  );


const circuitParticular =
  document.getElementById(
    "circuitParticular"
  );


const locationBox =
  document.getElementById(
    "locationBox"
  );


const locationTerminal =
  document.getElementById(
    "locationTerminal"
  );


const terminalStatus =
  document.getElementById(
    "terminalStatus"
  );


const terminalRemarks =
  document.getElementById(
    "terminalRemarks"
  );


const closeTerminalEditorButton =
  document.getElementById(
    "closeTerminalEditor"
  );


const cancelTerminalEditButton =
  document.getElementById(
    "cancelTerminalEdit"
  );


const saveTerminalPreviewButton =
  document.getElementById(
    "saveTerminalPreview"
  );


const saveCtrDraftButton =
  document.getElementById(
    "saveCtrDraft"
  );


const resetCtrDraftButton =
  document.getElementById(
    "resetCtrDraft"
  );


const draftSaveStatus =
  document.getElementById(
    "draftSaveStatus"
  );


/* =========================================================
   FUSE EDITOR DOM REFERENCES
========================================================= */

const fuseEditor =
  document.getElementById(
    "fuseEditor"
  );


const selectedFuseTitle =
  document.getElementById(
    "selectedFuseTitle"
  );


const fuseLabelInput =
  document.getElementById(
    "fuseLabelInput"
  );


const fuseDetailsInput =
  document.getElementById(
    "fuseDetailsInput"
  );


const closeFuseEditorButton =
  document.getElementById(
    "closeFuseEditor"
  );


const cancelFuseEditButton =
  document.getElementById(
    "cancelFuseEdit"
  );


const saveFuseEditButton =
  document.getElementById(
    "saveFuseEdit"
  );


/* =========================================================
   STATION ROLE / WORKFLOW ACCESS
========================================================= */

document
  .querySelectorAll(
    "[data-station-edit-control]"
  )
  .forEach(
    function (element) {

      element.hidden =
        true;

    }
  );


const EDITABLE_STATION_STATUSES = [
  "INITIAL_SETUP",
  "DRAFT"
];


const STATION_DRAFT_EDITOR_ROLES = [
  "STATION_USER"
];


let currentStationWorkflowStatus =
  null;


let stationWorkflowStatusLoaded =
  false;


/* =========================================================
   LOAD CURRENT STATION WORKFLOW STATUS
========================================================= */

async function loadCurrentStationWorkflowStatus() {

  if (!currentStationId) {

    stationWorkflowStatusLoaded =
      true;

    currentStationWorkflowStatus =
      null;

    return null;

  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from(
          "stations"
        )
        .select(
          `
            id,
            ctr_status,
            current_version,
            is_active
          `
        )
        .eq(
          "id",
          currentStationId
        )
        .maybeSingle();


    if (error) {

      throw error;

    }


    currentStationWorkflowStatus =
      data?.ctr_status ||
      null;


    stationWorkflowStatusLoaded =
      true;


    return currentStationWorkflowStatus;

  }

  catch (error) {

    console.error(
      "Station workflow status load error:",
      error
    );


    currentStationWorkflowStatus =
      null;


    stationWorkflowStatusLoaded =
      true;


    return null;

  }

}


/* =========================================================
   CHECK DRAFT EDIT PERMISSION
========================================================= */

function canEditCurrentStationDraft() {

  if (
    !currentStationId ||
    !stationWorkflowStatusLoaded ||
    !window.ctrAccess ||
    !window.ctrAccess.ready
  ) {

    return false;

  }


  if (
    !EDITABLE_STATION_STATUSES.includes(
      currentStationWorkflowStatus
    )
  ) {

    return false;

  }


  if (
    window.ctrAccess.isSystemAdmin()
  ) {

    return true;

  }


  return window.ctrAccess.hasStationRole(
    currentStationId,
    STATION_DRAFT_EDITOR_ROLES
  );

}


/* =========================================================
   REQUIRE DRAFT EDIT PERMISSION
========================================================= */

function requireCurrentStationDraftEdit() {

  if (
    canEditCurrentStationDraft()
  ) {

    return true;

  }


  let message =
    "You have view-only access to this station CTR.";


  if (
    stationWorkflowStatusLoaded &&
    currentStationWorkflowStatus &&
    !EDITABLE_STATION_STATUSES.includes(
      currentStationWorkflowStatus
    )
  ) {

    message =
      "This station is no longer in an editable initial draft state. Approved or workflow-controlled CTR data must be changed through the alteration process.";

  }


  alert(
    message
  );


  return false;

}


/* =========================================================
   APPLY STATIC + DYNAMIC EDIT MODE
========================================================= */

function applyStationBuilderAccessMode() {

  const editable =
    canEditCurrentStationDraft();


  document.body.dataset.stationEditMode =
    editable
      ? "edit"
      : "view";


  document
    .querySelectorAll(
      "[data-station-edit-control]"
    )
    .forEach(
      function (element) {

        element.hidden =
          !editable;

      }
    );


  const modifyButton =
    document.getElementById(
      "modifyCtrButton"
    );


  if (modifyButton) {

    modifyButton.disabled =
      true;


    modifyButton.title =
      "CTR alteration workflow will be enabled after baseline approval workflow is implemented.";

  }


  const dynamicEditSelectors = [

    ".remove-conductor-btn",
    ".pdf-fuse-remove",
    ".add-conductor-btn",
    ".remove-row-btn",
    ".remove-rack-btn",
    ".systematic-grid-btn",

    "#stationCtrRacksContainer .builder-action-btn",
    "#connectedEndsContainer .builder-action-btn",

    ".location-racks-wrapper > .builder-action-btn"

  ];


  document
    .querySelectorAll(
      dynamicEditSelectors.join(",")
    )
    .forEach(
      function (element) {

        element.hidden =
          !editable;

      }
    );


  document
    .querySelectorAll(
      [
        ".station-rack-name-input",
        ".location-rack-name-input",
        ".end-name-input",
        ".location-name-input"
      ].join(",")
    )
    .forEach(
      function (input) {

        input.readOnly =
          !editable;


        input.setAttribute(
          "aria-readonly",
          editable
            ? "false"
            : "true"
        );

      }
    );


  document
    .querySelectorAll(
      ".terminal, .pdf-fuse-symbol-btn"
    )
    .forEach(
      function (button) {

        button.disabled =
          !editable;


        if (!editable) {

          button.title =
            "View only";

        }

      }
    );


  document
    .querySelectorAll(
      ".pdf-fuse-note"
    )
    .forEach(
      function (note) {

        note.textContent =
          editable
            ? "Click symbol to edit"
            : "View only";

      }
    );


  if (!editable) {

    if (
      typeof closeEditor ===
      "function"
    ) {

      closeEditor();

    }


    if (
      typeof closeFuseEditor ===
      "function"
    ) {

      closeFuseEditor();

    }

  }

}


/* =========================================================
   DYNAMIC DOM WATCHER
========================================================= */

const stationBuilderAccessObserver =
  new MutationObserver(
    function () {

      if (
        window.ctrAccess?.ready &&
        stationWorkflowStatusLoaded
      ) {

        applyStationBuilderAccessMode();

      }

    }
  );


[
  stationCtrRacksContainer,
  connectedEndsContainer
].forEach(
  function (container) {

    if (container) {

      stationBuilderAccessObserver.observe(
        container,
        {
          childList:
            true,

          subtree:
            true
        }
      );

    }

  }
);


/* =========================================================
   CAPTURE-PHASE VIEW-ONLY PROTECTION
========================================================= */

document.addEventListener(
  "click",
  function (event) {

    if (
      canEditCurrentStationDraft()
    ) {

      return;

    }


    const blockedTarget =
      event.target.closest(
        [
          "[data-station-edit-control]",
          "#stationCtrRacksContainer .builder-action-btn",
          "#connectedEndsContainer .builder-action-btn",
          ".add-conductor-btn",
          ".remove-conductor-btn",
          ".remove-row-btn",
          ".remove-rack-btn",
          ".systematic-grid-btn",
          ".pdf-fuse-remove",
          ".pdf-fuse-symbol-btn",
          ".terminal"
        ].join(",")
      );


    if (!blockedTarget) {

      return;

    }


    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

  },
  true
);


/* =========================================================
   ROLE ACCESS READY EVENT
========================================================= */

window.addEventListener(
  "ctr-access-ready",
  function () {

    applyStationBuilderAccessMode();

  }
);


/* =========================================================
   DRAFT STATUS DISPLAY
========================================================= */

function setDraftStatus(message) {

  if (
    draftSaveStatus
  ) {

    draftSaveStatus.textContent =
      message;

  }

}


/* =========================================================
   TERMINAL EDITOR
========================================================= */

let selectedTerminal =
  null;


let selectedTerminalOwner =
  "station";


function openTerminalEditor(
  rack,
  row,
  terminal,
  owner
) {

  if (
    !canEditCurrentStationDraft()
  ) {

    return;

  }


  if (
    !terminalEditor
  ) {

    return;

  }


  selectedTerminal =
    terminal;


  selectedTerminalOwner =
    owner;


  if (
    selectedTerminalTitle
  ) {

    selectedTerminalTitle.textContent =
      `${rack.name} / Row ${row.label} / Terminal ${terminal.number}`;

  }


  if (
    currentTerminalStatus
  ) {

    currentTerminalStatus.textContent =
      terminal.status;

  }


  if (
    circuitParticular
  ) {

    circuitParticular.value =
      terminal.particular;

  }


  if (
    locationBox
  ) {

    locationBox.value =
      terminal.locationBox;

  }


  if (
    locationTerminal
  ) {

    locationTerminal.value =
      terminal.locationTerminal;

  }


  if (
    terminalStatus
  ) {

    terminalStatus.value =
      terminal.status;

  }


  if (
    terminalRemarks
  ) {

    terminalRemarks.value =
      terminal.remarks;

  }


  terminalEditor.classList.add(
    "open"
  );


  terminalEditor.scrollIntoView({

    behavior:
      "smooth",

    block:
      "center"

  });

}


function closeEditor() {

  if (
    terminalEditor
  ) {

    terminalEditor.classList.remove(
      "open"
    );

  }


  selectedTerminal =
    null;

}


function saveTerminalData() {

  if (
    !requireCurrentStationDraftEdit()
  ) {

    return;

  }


  if (
    !selectedTerminal
  ) {

    return;

  }


  selectedTerminal.particular =
    circuitParticular
      ? circuitParticular.value.trim()
      : "";


  selectedTerminal.locationBox =
    locationBox
      ? locationBox.value.trim()
      : "";


  selectedTerminal.locationTerminal =
    locationTerminal
      ? locationTerminal.value.trim()
      : "";


  selectedTerminal.status =
    terminalStatus
      ? terminalStatus.value
      : "SPARE";


  selectedTerminal.remarks =
    terminalRemarks
      ? terminalRemarks.value.trim()
      : "";


  if (
    selectedTerminalOwner ===
    "location"
  ) {

    renderConnectedEnds();

  }

  else {

    renderStationCtrRacks();

  }


  closeEditor();

}


closeTerminalEditorButton
  ?.addEventListener(
    "click",
    closeEditor
  );


cancelTerminalEditButton
  ?.addEventListener(
    "click",
    closeEditor
  );


saveTerminalPreviewButton
  ?.addEventListener(
    "click",
    saveTerminalData
  );


/* =========================================================
   TERMINAL VISUAL
========================================================= */

function createTerminalVisual(
  rack,
  row,
  terminal,
  owner
) {

  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.className =
    terminal.status === "IN USE"
      ? "terminal in-use"
      : "terminal";


  button.innerHTML = `

    <span class="terminal-number">
      ${escapeHtml(
        terminal.number
      )}
    </span>

    <span class="terminal-line"></span>

    <span class="terminal-point"></span>

    <span class="terminal-line"></span>

    <strong>
      ${escapeHtml(
        terminal.status
      )}
    </strong>

    <span class="terminal-particular">
      ${escapeHtml(
        terminal.particular
      )}
    </span>

  `;


  button.addEventListener(
    "click",
    function () {

      openTerminalEditor(
        rack,
        row,
        terminal,
        owner
      );

    }
  );


  return button;

}


/* =========================================================
   REMOVE TERMINAL
========================================================= */

function createRemoveTerminalButton(
  row,
  terminal,
  rerender
) {

  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.className =
    "remove-conductor-btn";


  button.textContent =
    "×";


  button.title =
    `Remove Terminal ${terminal.number}`;


  button.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();


      const confirmed =
        confirm(
          `Remove Terminal ${terminal.number}?`
        );


      if (
        !confirmed
      ) {

        return;

      }


      const index =
        row.terminals.indexOf(
          terminal
        );


      if (
        index !== -1
      ) {

        row.terminals.splice(
          index,
          1
        );


        renumberTerminals(
          row
        );


        rerender();

      }

    }
  );


  return button;

}


/* =========================================================
   FUSE EDITOR
========================================================= */

let selectedFuse =
  null;


let selectedFuseRerender =
  null;


function openFuseEditor(
  fuse,
  rack,
  rerender
) {

  if (
    !canEditCurrentStationDraft()
  ) {

    return;

  }


  if (!fuseEditor) {

    return;

  }


  selectedFuse =
    fuse;


  selectedFuseRerender =
    rerender;


  if (selectedFuseTitle) {

    selectedFuseTitle.textContent =
      `${rack.name} / ${fuse.label || "Fuse Point"}`;

  }


  if (fuseLabelInput) {

    fuseLabelInput.value =
      fuse.label || "";

  }


  if (fuseDetailsInput) {

    fuseDetailsInput.value =
      fuse.details || "";

  }


  fuseEditor.classList.add(
    "open"
  );


  fuseEditor.scrollIntoView({

    behavior:
      "smooth",

    block:
      "center"

  });


  setTimeout(
    function () {

      fuseDetailsInput?.focus();

    },
    150
  );

}


function closeFuseEditor() {

  if (fuseEditor) {

    fuseEditor.classList.remove(
      "open"
    );

  }


  selectedFuse =
    null;


  selectedFuseRerender =
    null;

}


function saveFuseData() {

  if (
    !requireCurrentStationDraftEdit()
  ) {

    return;

  }


  if (!selectedFuse) {

    return;

  }


  const label =
    fuseLabelInput
      ? fuseLabelInput.value.trim()
      : "";


  const details =
    fuseDetailsInput
      ? fuseDetailsInput.value.trim()
      : "";


  selectedFuse.label =
    label ||
    selectedFuse.label ||
    "F1";


  selectedFuse.details =
    details;


  const rerender =
    selectedFuseRerender;


  closeFuseEditor();


  if (
    typeof rerender ===
    "function"
  ) {

    rerender();

  }

}


closeFuseEditorButton
  ?.addEventListener(
    "click",
    closeFuseEditor
  );


cancelFuseEditButton
  ?.addEventListener(
    "click",
    closeFuseEditor
  );


saveFuseEditButton
  ?.addEventListener(
    "click",
    saveFuseData
  );


/* =========================================================
   PDF STYLE FUSE VISUAL
========================================================= */

function createPdfFuseItem(
  fuse,
  rack,
  rerender
) {

  const item =
    document.createElement(
      "div"
    );


  item.className =
    "pdf-fuse-item";


  const removeButton =
    document.createElement(
      "button"
    );


  removeButton.type =
    "button";


  removeButton.className =
    "pdf-fuse-remove";


  removeButton.textContent =
    "×";


  removeButton.title =
    `Remove ${fuse.label}`;


  removeButton.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();


      const confirmed =
        confirm(
          `Remove ${fuse.label}?`
        );


      if (
        !confirmed
      ) {

        return;

      }


      const index =
        rack.fuseDetails.indexOf(
          fuse
        );


      if (
        index !== -1
      ) {

        rack.fuseDetails.splice(
          index,
          1
        );


        rerender();

      }

    }
  );


  const caption =
    document.createElement(
      "div"
    );


  caption.className =
    "pdf-fuse-caption";


  const description =
    document.createElement(
      "strong"
    );


  description.textContent =
    fuse.details ||
    "Enter fuse details";


  const rackReference =
    document.createElement(
      "span"
    );


  rackReference.textContent =
    `${rack.name} FUSE`;


  caption.appendChild(
    description
  );


  caption.appendChild(
    rackReference
  );


  const symbolButton =
    document.createElement(
      "button"
    );


  symbolButton.type =
    "button";


  symbolButton.className =
    "pdf-fuse-symbol-btn";


  symbolButton.title =
    "Click to edit fuse details";


  symbolButton.innerHTML = `

    <svg
      width="82"
      height="68"
      viewBox="0 0 82 68"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >

      <line
        x1="41"
        y1="2"
        x2="41"
        y2="14"
        stroke="currentColor"
        stroke-width="1.5"
      />

      <circle
        cx="41"
        cy="16"
        r="2.6"
        fill="white"
        stroke="currentColor"
        stroke-width="1.4"
      />

      <line
        x1="41"
        y1="19"
        x2="30"
        y2="30"
        stroke="currentColor"
        stroke-width="1.5"
      />

      <line
        x1="30"
        y1="30"
        x2="52"
        y2="30"
        stroke="currentColor"
        stroke-width="1.5"
      />

      <line
        x1="52"
        y1="30"
        x2="41"
        y2="41"
        stroke="currentColor"
        stroke-width="1.5"
      />

      <line
        x1="41"
        y1="41"
        x2="41"
        y2="51"
        stroke="currentColor"
        stroke-width="1.5"
      />

      <circle
        cx="41"
        cy="54"
        r="3"
        fill="white"
        stroke="currentColor"
        stroke-width="1.5"
      />

      <line
        x1="41"
        y1="57"
        x2="41"
        y2="64"
        stroke="currentColor"
        stroke-width="1.5"
      />

    </svg>

  `;


  symbolButton.addEventListener(
    "click",
    function () {

      openFuseEditor(
        fuse,
        rack,
        rerender
      );

    }
  );


  const fuseLabel =
    document.createElement(
      "div"
    );


  fuseLabel.className =
    "pdf-fuse-label";


  fuseLabel.textContent =
    fuse.label || "-";


  const note =
    document.createElement(
      "div"
    );


  note.className =
    "pdf-fuse-note";


  note.textContent =
    "Click symbol to edit";


  item.appendChild(
    removeButton
  );


  item.appendChild(
    caption
  );


  item.appendChild(
    symbolButton
  );


  item.appendChild(
    fuseLabel
  );


  item.appendChild(
    note
  );


  return item;

}


/* =========================================================
   FUSE BUILDER
========================================================= */

function buildFuseSection(
  rack,
  rerender,
  className,
  heading
) {

  const element =
    document.createElement(

      className ===
      "rack-fuse-section"

        ? "section"

        : "div"

    );


  element.className =
    className;


  const header =
    document.createElement(
      "div"
    );


  header.className =
    "fuse-builder-header";


  const title =
    document.createElement(
      "div"
    );


  const headingLabel =
    document.createElement(
      "span"
    );


  headingLabel.textContent =
    heading;


  const headingTitle =
    document.createElement(
      "strong"
    );


  headingTitle.textContent =
    `${rack.name} Fuse Details`;


  title.appendChild(
    headingLabel
  );


  title.appendChild(
    headingTitle
  );


  const addButton =
    document.createElement(
      "button"
    );


  addButton.type =
    "button";


  addButton.className =
    "add-conductor-btn";


  addButton.textContent =
    "+ Add Fuse Point";


  addButton.addEventListener(
    "click",
    function () {

      const nextNumber =
        getNextFuseNumber(
          rack.fuseDetails
        );


      const fuse =
        createFusePoint(
          nextNumber
        );


      rack.fuseDetails.push(
        fuse
      );


      rerender();


      setTimeout(
        function () {

          openFuseEditor(
            fuse,
            rack,
            rerender
          );

        },
        50
      );

    }
  );


  header.appendChild(
    title
  );


  header.appendChild(
    addButton
  );


  element.appendChild(
    header
  );


  if (
    rack.fuseDetails.length ===
    0
  ) {

    const empty =
      document.createElement(
        "p"
      );


    empty.className =
      "fuse-empty-state";


    empty.textContent =
      "No fuse points added yet. Add fuse points to prepare the rack fuse drawing.";


    element.appendChild(
      empty
    );


    return element;

  }


  const strip =
    document.createElement(
      "div"
    );


  strip.className =
    "pdf-fuse-strip";


  rack.fuseDetails.forEach(
    function (fuse) {

      strip.appendChild(

        createPdfFuseItem(
          fuse,
          rack,
          rerender
        )

      );

    }
  );


  element.appendChild(
    strip
  );


  return element;

}


/* =========================================================
   ROW BUILDER
========================================================= */

function buildRowBlock(
  rack,
  row,
  owner,
  rerender,
  locationMode
) {

  const block =
    document.createElement(

      locationMode
        ? "div"
        : "section"

    );


  block.className =

    locationMode

      ? "location-row-block"

      : "dynamic-rack-row";


  const header =
    document.createElement(
      "div"
    );


  header.className =
    "dynamic-row-header";


  const title =
    document.createElement(

      locationMode
        ? "strong"
        : "div"

    );


  if (
    locationMode
  ) {

    title.textContent =
      `ROW ${row.label}`;

  }

  else {

    title.innerHTML = `

      <span>
        CTR TERMINAL ROW
      </span>

      <h4>
        ROW ${escapeHtml(
          row.label
        )}
      </h4>

    `;

  }


  const actions =
    document.createElement(
      "div"
    );


  actions.className =
    "row-header-actions";


  const addConductorButton =
    document.createElement(
      "button"
    );


  addConductorButton.type =
    "button";


  addConductorButton.className =
    "add-conductor-btn";


  addConductorButton.textContent =
    "+ Add Conductor";


  addConductorButton.addEventListener(
    "click",
    function () {

      row.terminals.push(

        createTerminal(
          row.terminals.length + 1
        )

      );


      rerender();

    }
  );


  const removeRowButton =
    document.createElement(
      "button"
    );


  removeRowButton.type =
    "button";


  removeRowButton.className =
    "remove-row-btn";


  removeRowButton.textContent =
    "Remove Row";


  removeRowButton.addEventListener(
    "click",
    function () {

      const confirmed =
        confirm(
          `Remove Row ${row.label}?`
        );


      if (
        !confirmed
      ) {

        return;

      }


      const index =
        rack.rows.indexOf(
          row
        );


      if (
        index !== -1
      ) {

        rack.rows.splice(
          index,
          1
        );


        relabelRows(
          rack
        );


        rerender();

      }

    }
  );


  actions.appendChild(
    addConductorButton
  );


  actions.appendChild(
    removeRowButton
  );


  header.appendChild(
    title
  );


  header.appendChild(
    actions
  );


  block.appendChild(
    header
  );


  const terminalStrip =
    document.createElement(
      "div"
    );


  terminalStrip.className =
    "terminal-strip dynamic-strip";


  row.terminals.forEach(
    function (terminal) {

      terminalStrip.appendChild(

        createTerminalVisual(
          rack,
          row,
          terminal,
          owner
        )

      );


      terminalStrip.appendChild(

        createRemoveTerminalButton(
          row,
          terminal,
          rerender
        )

      );

    }
  );


  block.appendChild(
    terminalStrip
  );


  return block;

}


/* =========================================================
   RENDER STATION CTR RACKS
========================================================= */

function renderStationCtrRacks() {

  if (
    !stationCtrRacksContainer
  ) {

    return;

  }


  stationCtrRacksContainer.innerHTML =
    "";


  stationCtrRacks.forEach(
    function (rack) {

      const card =
        document.createElement(
          "section"
        );


      card.className =
        "ctr-rack-card";


      const header =
        document.createElement(
          "div"
        );


      header.className =
        "rack-header";


      const titleArea =
        document.createElement(
          "div"
        );


      titleArea.className =
        "station-rack-title-area";


      const label =
        document.createElement(
          "span"
        );


      label.textContent =
        "CTR RACK";


      const rackNameInput =
        document.createElement(
          "input"
        );


      rackNameInput.type =
        "text";


      rackNameInput.className =
        "station-rack-name-input";


      rackNameInput.value =
        rack.name;


      rackNameInput.placeholder =
        "Enter CTR rack name";


      rackNameInput.addEventListener(
        "input",
        function () {

          rack.name =
            rackNameInput.value;

        }
      );


      titleArea.appendChild(
        label
      );


      titleArea.appendChild(
        rackNameInput
      );


      const actions =
        document.createElement(
          "div"
        );


      actions.className =
        "rack-header-actions";


      const status =
        document.createElement(
          "div"
        );


      status.className =
        "rack-status";


      status.textContent =
        "Initial Setup";


      const removeRackButton =
        document.createElement(
          "button"
        );


      removeRackButton.type =
        "button";


      removeRackButton.className =
        "remove-rack-btn";


      removeRackButton.textContent =
        "Remove Rack";


      removeRackButton.addEventListener(
        "click",
        function () {

          const confirmed =
            confirm(
              `Remove ${rack.name}?`
            );


          if (
            !confirmed
          ) {

            return;

          }


          const index =
            stationCtrRacks.indexOf(
              rack
            );


          if (
            index !== -1
          ) {

            stationCtrRacks.splice(
              index,
              1
            );


            renderStationCtrRacks();

          }

        }
      );


      actions.appendChild(
        status
      );


      actions.appendChild(
        removeRackButton
      );


      header.appendChild(
        titleArea
      );


      header.appendChild(
        actions
      );


      card.appendChild(
        header
      );


      const drawing =
        document.createElement(
          "div"
        );


      drawing.className =
        "rack-drawing";


      drawing.appendChild(

        buildFuseSection(
          rack,
          renderStationCtrRacks,
          "rack-fuse-section",
          "FIRST STAGE"
        )

      );


      const toolbar =
        document.createElement(
          "div"
        );


      toolbar.className =
        "rack-builder-toolbar";


      const toolbarTitle =
        document.createElement(
          "div"
        );


      toolbarTitle.innerHTML = `

        <span class="rack-sub-label">
          CTR TERMINALS
        </span>

        <h4>
          Row & Conductor Structure
        </h4>

      `;


      const addRowButton =
        document.createElement(
          "button"
        );


      addRowButton.type =
        "button";


      addRowButton.className =
        "builder-action-btn";


      addRowButton.textContent =
        "+ Add Row";


      addRowButton.addEventListener(
        "click",
        function () {

          rack.rows.push(

            createRow(

              getRowLabel(
                rack.rows.length
              ),

              12

            )

          );


          renderStationCtrRacks();

        }
      );


      toolbar.appendChild(
        toolbarTitle
      );


      toolbar.appendChild(
        addRowButton
      );


      drawing.appendChild(
        toolbar
      );


      rack.rows.forEach(
        function (row) {

          drawing.appendChild(

            buildRowBlock(
              rack,
              row,
              "station",
              renderStationCtrRacks,
              false
            )

          );

        }
      );


      card.appendChild(
        drawing
      );


      stationCtrRacksContainer.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   ADD STATION CTR RACK
========================================================= */

addStationCtrRackButton
  ?.addEventListener(
    "click",
    function () {

      stationCtrRacks.push(

        createCtrRack(

          getNextRackNumber(
            stationCtrRacks
          )

        )

      );


      renderStationCtrRacks();

    }
  );


/* =========================================================
   LOCATION BOX DIRECT ROW BUILDER
========================================================= */

function createLocationRackView(
  location
) {

  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.className =
    "location-racks-wrapper";


  /* =====================================================
     LEGACY DATA COMPATIBILITY
  ===================================================== */

  location.fuseDetails =
    Array.isArray(
      location.fuseDetails
    )
      ? location.fuseDetails
      : [];


  if (
    !Array.isArray(
      location.rows
    )
  ) {

    const migratedRows =
      [];


    if (
      Array.isArray(
        location.racks
      )
    ) {

      location.racks.forEach(
        function (legacyRack) {

          if (
            Array.isArray(
              legacyRack?.fuseDetails
            ) &&
            location.fuseDetails.length === 0
          ) {

            legacyRack.fuseDetails.forEach(
              function (fuse) {

                location.fuseDetails.push(
                  fuse
                );

              }
            );

          }


          if (
            Array.isArray(
              legacyRack?.rows
            )
          ) {

            legacyRack.rows.forEach(
              function (row) {

                migratedRows.push(
                  row
                );

              }
            );

          }

        }
      );

    }


    if (
      migratedRows.length === 0
    ) {

      migratedRows.push(

        createRow(
          "A",
          12
        ),

        createRow(
          "B",
          12
        ),

        createRow(
          "C",
          12
        ),

        createRow(
          "D",
          12
        )

      );

    }


    location.rows =
      migratedRows;


    relabelRows(
      location
    );

  }


  delete location.racks;


  /* =====================================================
     LOCATION BOX FUSE DETAILS
  ===================================================== */

  const locationFuseSection =
    buildFuseSection(
      location,
      renderConnectedEnds,
      "location-fuse-box",
      "FUSE DETAILS"
    );


  wrapper.appendChild(
    locationFuseSection
  );


  /* =====================================================
     TERMINAL ROW / COLUMN TOOLBAR
  ===================================================== */

  const toolbar =
    document.createElement(
      "div"
    );


  toolbar.className =
    "systematic-terminal-toolbar location-terminal-toolbar";


  const titleArea =
    document.createElement(
      "div"
    );


  titleArea.className =
    "systematic-toolbar-title";


  titleArea.innerHTML = `

    <span>
      LOCATION BOX TERMINALS
    </span>

    <strong>
      Row & Column Structure
    </strong>

  `;


  const actions =
    document.createElement(
      "div"
    );


  actions.className =
    "systematic-grid-actions";


  /* -----------------------------------------------------
     ADD ROW
  ----------------------------------------------------- */

  const addRowButton =
    document.createElement(
      "button"
    );


  addRowButton.type =
    "button";


  addRowButton.className =
    "systematic-grid-btn";


  addRowButton.textContent =
    "+ Add Row";


  addRowButton.addEventListener(
    "click",
    function () {

      const columns =
        location.rows[0]
          ?.terminals
          ?.length || 12;


      location.rows.push(

        createRow(

          getRowLabel(
            location.rows.length
          ),

          columns

        )

      );


      renderConnectedEnds();

    }
  );


  /* -----------------------------------------------------
     ADD COLUMN
  ----------------------------------------------------- */

  const addColumnButton =
    document.createElement(
      "button"
    );


  addColumnButton.type =
    "button";


  addColumnButton.className =
    "systematic-grid-btn";


  addColumnButton.textContent =
    "+ Add Column";


  addColumnButton.addEventListener(
    "click",
    function () {

      location.rows.forEach(
        function (row) {

          row.terminals =
            Array.isArray(
              row.terminals
            )
              ? row.terminals
              : [];


          row.terminals.push(

            createTerminal(
              row.terminals.length + 1
            )

          );


          renumberTerminals(
            row
          );

        }
      );


      renderConnectedEnds();

    }
  );


  /* -----------------------------------------------------
     REMOVE ROW
  ----------------------------------------------------- */

  const removeRowButton =
    document.createElement(
      "button"
    );


  removeRowButton.type =
    "button";


  removeRowButton.className =
    "systematic-grid-btn systematic-remove-btn";


  removeRowButton.textContent =
    "− Remove Row";


  removeRowButton.addEventListener(
    "click",
    function () {

      if (
        location.rows.length <= 1
      ) {

        alert(
          "At least one terminal row must remain."
        );

        return;

      }


      const lastRow =
        location.rows[
          location.rows.length - 1
        ];


      const confirmed =
        confirm(
          `Remove Row ${lastRow.label} from ${location.name}?`
        );


      if (!confirmed) {

        return;

      }


      location.rows.pop();


      relabelRows(
        location
      );


      renderConnectedEnds();

    }
  );


  /* -----------------------------------------------------
     REMOVE COLUMN
  ----------------------------------------------------- */

  const removeColumnButton =
    document.createElement(
      "button"
    );


  removeColumnButton.type =
    "button";


  removeColumnButton.className =
    "systematic-grid-btn systematic-remove-btn";


  removeColumnButton.textContent =
    "− Remove Column";


  removeColumnButton.addEventListener(
    "click",
    function () {

      const currentColumns =
        location.rows[0]
          ?.terminals
          ?.length || 0;


      if (
        currentColumns <= 1
      ) {

        alert(
          "At least one terminal column must remain."
        );

        return;

      }


      const confirmed =
        confirm(
          `Remove Column ${currentColumns} from all rows of ${location.name}?`
        );


      if (!confirmed) {

        return;

      }


      location.rows.forEach(
        function (row) {

          row.terminals.pop();


          renumberTerminals(
            row
          );

        }
      );


      renderConnectedEnds();

    }
  );


  actions.appendChild(
    addRowButton
  );


  actions.appendChild(
    addColumnButton
  );


  actions.appendChild(
    removeRowButton
  );


  actions.appendChild(
    removeColumnButton
  );


  toolbar.appendChild(
    titleArea
  );


  toolbar.appendChild(
    actions
  );


  wrapper.appendChild(
    toolbar
  );


  /* =====================================================
     LOCATION BOX ROWS
  ===================================================== */

  location.rows.forEach(
    function (row) {

      wrapper.appendChild(

        buildRowBlock(
          location,
          row,
          "location",
          renderConnectedEnds,
          true
        )

      );

    }
  );


  return wrapper;

}


/* =========================================================
   RENDER CONNECTED ENDS
========================================================= */

function renderConnectedEnds() {

  if (
    !connectedEndsContainer
  ) {

    return;

  }


  connectedEndsContainer.innerHTML =
    "";


  connectedEnds.forEach(
    function (end) {

      const card =
        document.createElement(
          "section"
        );


      card.className =
        "connected-end-card";


      const header =
        document.createElement(
          "div"
        );


      header.className =
        "connected-end-header";


      const titleArea =
        document.createElement(
          "div"
        );


      const label =
        document.createElement(
          "span"
        );


      label.textContent =
        "CONNECTED END";


      const endNameInput =
        document.createElement(
          "input"
        );


      endNameInput.type =
        "text";


      endNameInput.className =
        "end-name-input";


      endNameInput.value =
        end.name;


      endNameInput.placeholder =
        "Enter actual End name";


      endNameInput.addEventListener(
        "input",
        function () {

          end.name =
            endNameInput.value;

        }
      );


      titleArea.appendChild(
        label
      );


      titleArea.appendChild(
        endNameInput
      );


      const actions =
        document.createElement(
          "div"
        );


      actions.className =
        "end-header-actions";


      const addLocationButton =
        document.createElement(
          "button"
        );


      addLocationButton.type =
        "button";


      addLocationButton.className =
        "builder-action-btn";


      addLocationButton.textContent =
        "+ Add Location Box";


      addLocationButton.addEventListener(
        "click",
        function () {

          end.locations.push(

            createLocation(
              end
            )

          );


          renderConnectedEnds();

        }
      );


      const removeEndButton =
        document.createElement(
          "button"
        );


      removeEndButton.type =
        "button";


      removeEndButton.className =
        "remove-rack-btn";


      removeEndButton.textContent =
        "Remove End";


      removeEndButton.addEventListener(
        "click",
        function () {

          const confirmed =
            confirm(
              `Remove ${end.name}?`
            );


          if (
            !confirmed
          ) {

            return;

          }


          const index =
            connectedEnds.indexOf(
              end
            );


          if (
            index !== -1
          ) {

            connectedEnds.splice(
              index,
              1
            );


            renderConnectedEnds();

          }

        }
      );


      actions.appendChild(
        addLocationButton
      );


      actions.appendChild(
        removeEndButton
      );


      header.appendChild(
        titleArea
      );


      header.appendChild(
        actions
      );


      card.appendChild(
        header
      );


      const locationGrid =
        document.createElement(
          "div"
        );


      locationGrid.className =
        "dynamic-location-grid";


      if (
        end.locations.length ===
        0
      ) {

        const empty =
          document.createElement(
            "div"
          );


        empty.className =
          "location-empty-state";


        empty.textContent =
          "No location boxes added yet.";


        locationGrid.appendChild(
          empty
        );

      }


      end.locations.forEach(
        function (location) {

          const locationCard =
            document.createElement(
              "article"
            );


          locationCard.className =
            "dynamic-location-card";


          const locationHeader =
            document.createElement(
              "div"
            );


          locationHeader.className =
            "location-box-header";


          const title =
            document.createElement(
              "div"
            );


          title.className =
            "location-box-title-area";


          const locationLabel =
            document.createElement(
              "span"
            );


          locationLabel.textContent =
            "LOCATION BOX";


          const locationNameInput =
            document.createElement(
              "input"
            );


          locationNameInput.type =
            "text";


          locationNameInput.className =
            "location-name-input";


          locationNameInput.value =
            location.name;


          locationNameInput.placeholder =
            "Enter Location Box name";


          locationNameInput.addEventListener(
            "input",
            function () {

              location.name =
                locationNameInput.value;

            }
          );


          title.appendChild(
            locationLabel
          );


          title.appendChild(
            locationNameInput
          );


          const removeLocationButton =
            document.createElement(
              "button"
            );


          removeLocationButton.type =
            "button";


          removeLocationButton.className =
            "remove-rack-btn";


          removeLocationButton.textContent =
            "Remove Location Box";


          removeLocationButton.addEventListener(
            "click",
            function () {

              const confirmed =
                confirm(
                  `Remove ${location.name}?`
                );


              if (
                !confirmed
              ) {

                return;

              }


              const index =
                end.locations.indexOf(
                  location
                );


              if (
                index !== -1
              ) {

                end.locations.splice(
                  index,
                  1
                );


                renderConnectedEnds();

              }

            }
          );


          locationHeader.appendChild(
            title
          );


          locationHeader.appendChild(
            removeLocationButton
          );


          locationCard.appendChild(
            locationHeader
          );


          locationCard.appendChild(

            createLocationRackView(
              location
            )

          );


          locationGrid.appendChild(
            locationCard
          );

        }
      );


      card.appendChild(
        locationGrid
      );


      connectedEndsContainer.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   ADD CONNECTED END
========================================================= */

addConnectedEndButton
  ?.addEventListener(
    "click",
    function () {

      connectedEnds.push(
        createConnectedEnd()
      );


      renderConnectedEnds();

    }
  );


/* =========================================================
   NORMALIZE LOADED RACK DATA
========================================================= */

function normalizeRack(
  source,
  fallbackNumber
) {

  const rack =

    source &&
    typeof source === "object"

      ? source

      : {};


  rack.id =
    rack.id ||
    createId();


  rack.autoNumber =
    Number(
      rack.autoNumber
    ) ||
    fallbackNumber;


  rack.name =
    rack.name ||
    `K${rack.autoNumber}`;


  rack.fuseDetails =

    Array.isArray(
      rack.fuseDetails
    )

      ? rack.fuseDetails

      : [];


  rack.rows =

    Array.isArray(
      rack.rows
    )

      ? rack.rows

      : [];


  rack.fuseDetails.forEach(
    function (
      fuse,
      index
    ) {

      fuse.id =
        fuse.id ||
        createId();


      fuse.label =
        fuse.label ||
        `F${index + 1}`;


      fuse.details =
        fuse.details ||
        "";

    }
  );


  rack.rows.forEach(
    function (
      row,
      rowIndex
    ) {

      row.id =
        row.id ||
        createId();


      row.label =
        row.label ||
        getRowLabel(
          rowIndex
        );


      row.terminals =

        Array.isArray(
          row.terminals
        )

          ? row.terminals

          : [];


      row.terminals.forEach(
        function (
          terminal,
          terminalIndex
        ) {

          terminal.id =
            terminal.id ||
            createId();


          terminal.number =
            String(
              terminalIndex + 1
            )
              .padStart(
                2,
                "0"
              );


          terminal.status =
            terminal.status ||
            "SPARE";


          terminal.particular =
            terminal.particular ||
            "";


          terminal.locationBox =
            terminal.locationBox ||
            "";


          terminal.locationTerminal =
            terminal.locationTerminal ||
            "";


          terminal.remarks =
            terminal.remarks ||
            "";

        }
      );

    }
  );


  return rack;

}


/* =========================================================
   APPLY LOADED SUPABASE DRAFT
========================================================= */

function applyDraftData(data) {

  if (
    !data ||
    typeof data !== "object"
  ) {

    return;

  }


  /* -------------------------------------------------------
     STATION CTR RACKS
  ------------------------------------------------------- */

  if (
    Array.isArray(
      data.stationCtrRacks
    )
  ) {

    const racks =
      data.stationCtrRacks.map(
        function (
          rack,
          index
        ) {

          return normalizeRack(
            rack,
            index + 1
          );

        }
      );


    stationCtrRacks.splice(
      0,
      stationCtrRacks.length,
      ...racks
    );

  }


  /* -------------------------------------------------------
     CONNECTED ENDS
  ------------------------------------------------------- */

  if (
    Array.isArray(
      data.connectedEnds
    )
  ) {

    const ends =
      data.connectedEnds.map(
        function (
          sourceEnd,
          endIndex
        ) {

          const end =

            sourceEnd &&
            typeof sourceEnd === "object"

              ? sourceEnd

              : {};


          end.id =
            end.id ||
            createId();


          end.autoNumber =
            Number(
              end.autoNumber
            ) ||
            endIndex + 1;


          end.name =
            end.name ||
            `Connected End ${end.autoNumber}`;


          end.locations =

            Array.isArray(
              end.locations
            )

              ? end.locations

              : [];


          end.locations =
            end.locations.map(
              function (
                sourceLocation,
                locationIndex
              ) {

                const location =

                  sourceLocation &&
                  typeof sourceLocation === "object"

                    ? sourceLocation

                    : {};


                location.id =
                  location.id ||
                  createId();


                location.autoNumber =
                  Number(
                    location.autoNumber
                  ) ||
                  locationIndex + 1;


                location.name =
                  location.name ||
                  `Location Box ${location.autoNumber}`;


                /* =====================================================
                   LOCATION BOX FUSE MIGRATION

                   New:
                   Location Box -> fuseDetails

                   Old:
                   Location Box -> K1/K2 -> fuseDetails
                ===================================================== */

                let locationFuses =

                  Array.isArray(
                    location.fuseDetails
                  )

                    ? location.fuseDetails

                    : [];


                if (
                  locationFuses.length === 0 &&
                  Array.isArray(
                    location.racks
                  )
                ) {

                  location.racks.forEach(
                    function (legacyRack) {

                      if (
                        Array.isArray(
                          legacyRack?.fuseDetails
                        )
                      ) {

                        legacyRack.fuseDetails.forEach(
                          function (fuse) {

                            locationFuses.push(
                              fuse
                            );

                          }
                        );

                      }

                    }
                  );

                }


                locationFuses.forEach(
                  function (
                    fuse,
                    index
                  ) {

                    fuse.id =
                      fuse.id ||
                      createId();


                    fuse.label =
                      fuse.label ||
                      `F${index + 1}`;


                    fuse.details =
                      fuse.details ||
                      "";

                  }
                );


                location.fuseDetails =
                  locationFuses;


                /* =====================================================
                   LOCATION BOX ROW MIGRATION

                   New:
                   Location Box -> rows

                   Old:
                   Location Box -> K1/K2 -> rows
                ===================================================== */

                let locationRows =
                  [];


                if (
                  Array.isArray(
                    location.rows
                  )
                ) {

                  locationRows =
                    location.rows;

                }

                else if (
                  Array.isArray(
                    location.racks
                  )
                ) {

                  location.racks.forEach(
                    function (legacyRack) {

                      if (
                        Array.isArray(
                          legacyRack?.rows
                        )
                      ) {

                        legacyRack.rows.forEach(
                          function (row) {

                            locationRows.push(
                              row
                            );

                          }
                        );

                      }

                    }
                  );

                }


                if (
                  locationRows.length === 0
                ) {

                  locationRows = [

                    createRow(
                      "A",
                      12
                    ),

                    createRow(
                      "B",
                      12
                    ),

                    createRow(
                      "C",
                      12
                    ),

                    createRow(
                      "D",
                      12
                    )

                  ];

                }


                const normalizedLocationData =
                  normalizeRack(
                    {
                      rows:
                        locationRows,

                      fuseDetails:
                        []
                    },
                    1
                  );


                location.rows =
                  normalizedLocationData.rows;


                relabelRows(
                  location
                );


                /*
                  Old K-rack hierarchy removed only after
                  Fuse + Row data has been preserved.
                */

                delete location.racks;


                return location;

              }
            );


          return end;

        }
      );


    connectedEnds.splice(
      0,
      connectedEnds.length,
      ...ends
    );

  }

}


/* =========================================================
   AUTHENTICATED USER
========================================================= */

async function getCurrentUser() {

  const {
    data,
    error
  } =
    await supabaseClient
      .auth
      .getUser();


  if (
    error ||
    !data.user
  ) {

    throw new Error(
      "Login session not available."
    );

  }


  return data.user;

}


/* =========================================================
   SAVE CTR DRAFT TO SUPABASE
========================================================= */

async function saveCtrDraft() {

  if (
    !requireCurrentStationDraftEdit()
  ) {

    return;

  }


  if (
    !currentStationId
  ) {

    alert(
      "Station ID is missing."
    );


    return;

  }


  if (
    saveCtrDraftButton
  ) {

    saveCtrDraftButton.disabled =
      true;


    saveCtrDraftButton.textContent =
      "Saving...";

  }


  setDraftStatus(
    "Saving draft to database..."
  );


  try {

    const user =
      await getCurrentUser();


    const savedAt =
      new Date()
        .toISOString();


    const draftData = {

      schemaVersion:
        1,

      stationCtrRacks:
        stationCtrRacks,

      connectedEnds:
        connectedEnds,

      savedAt:
        savedAt

    };


    const {
      error
    } =
      await supabaseClient
        .from(
          "ctr_drafts"
        )
        .upsert(

          {

            station_id:
              currentStationId,

            draft_data:
              draftData,

            status:
              "DRAFT",

            last_saved_by:
              user.id

          },

          {

            onConflict:
              "station_id"

          }

        );


    if (
      error
    ) {

      throw error;

    }


    const {

      data:
        stationStatus,

      error:
        statusError

    } =
      await supabaseClient
        .rpc(

          "mark_station_as_draft",

          {

            p_station_id:
              currentStationId

          }

        );


    if (
      statusError
    ) {

      console.error(
        "Station status sync error:",
        statusError
      );


      throw new Error(

        "CTR Draft was saved, but station status could not be updated: " +
        statusError.message

      );

    }


    console.log(
      "Station CTR status:",
      stationStatus
    );


    if (
      typeof stationStatus ===
      "string"
    ) {

      currentStationWorkflowStatus =
        stationStatus;

    }

    else {

      currentStationWorkflowStatus =
        "DRAFT";

    }


    stationWorkflowStatusLoaded =
      true;


    applyStationBuilderAccessMode();


    const displayTime =
      new Date(
        savedAt
      )
        .toLocaleString();


    setDraftStatus(
      `Saved to database: ${displayTime}`
    );


    alert(
      "CTR Draft saved successfully."
    );

  }

  catch (error) {

    console.error(
      "CTR draft save error:",
      error
    );


    setDraftStatus(
      "Draft save failed"
    );


    alert(

      error.message ||
      "CTR Draft could not be saved."

    );

  }

  finally {

    if (
      saveCtrDraftButton
    ) {

      saveCtrDraftButton.disabled =
        false;


      saveCtrDraftButton.textContent =
        "Save Draft";

    }

  }

}



/* =========================================================
   LOAD CTR DRAFT FROM SUPABASE
========================================================= */

async function loadCtrDraft() {

  if (
    !currentStationId
  ) {

    setDraftStatus(
      "Station ID missing"
    );


    return;

  }


  setDraftStatus(
    "Checking database draft..."
  );


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from(
          "ctr_drafts"
        )
        .select(
          `
            draft_data,
            status,
            updated_at
          `
        )
        .eq(
          "station_id",
          currentStationId
        )
        .maybeSingle();


    if (
      error
    ) {

      throw error;

    }


    if (
      !data
    ) {

      setDraftStatus(
        "No database draft saved yet"
      );


      return;

    }


    applyDraftData(
      data.draft_data
    );


    const savedDate =

      data.updated_at

        ? new Date(
            data.updated_at
          )

        : null;


    if (
      savedDate
    ) {

      setDraftStatus(

        `Loaded from database: ${savedDate.toLocaleString()}`

      );

    }

    else {

      setDraftStatus(
        "Draft loaded from database"
      );

    }

  }

  catch (error) {

    console.error(
      "CTR draft load error:",
      error
    );


    setDraftStatus(
      "Unable to load database draft"
    );

  }

}


/* =========================================================
   RESET CTR DRAFT
========================================================= */

async function resetCtrDraft() {

  if (
    !requireCurrentStationDraftEdit()
  ) {

    return;

  }


  if (
    !currentStationId
  ) {

    alert(
      "Station ID is missing."
    );


    return;

  }


  const confirmed =
    confirm(

      "Reset this CTR draft? Current draft data for this station will be replaced with a fresh initial CTR structure."

    );


  if (
    !confirmed
  ) {

    return;

  }


  if (
    resetCtrDraftButton
  ) {

    resetCtrDraftButton.disabled =
      true;


    resetCtrDraftButton.textContent =
      "Resetting...";

  }


  try {

    const user =
      await getCurrentUser();


    const freshRack =
      createCtrRack(1);


    const resetAt =
      new Date()
        .toISOString();


    const freshDraftData = {

      schemaVersion:
        1,

      stationCtrRacks: [

        freshRack

      ],

      connectedEnds:
        [],

      savedAt:
        resetAt

    };


    const {
      error
    } =
      await supabaseClient
        .from(
          "ctr_drafts"
        )
        .upsert(

          {

            station_id:
              currentStationId,

            draft_data:
              freshDraftData,

            status:
              "INITIAL_SETUP",

            last_saved_by:
              user.id

          },

          {

            onConflict:
              "station_id"

          }

        );


    if (
      error
    ) {

      throw error;

    }


    stationCtrRacks.splice(
      0,
      stationCtrRacks.length,
      freshRack
    );


    connectedEnds.splice(
      0,
      connectedEnds.length
    );


    closeEditor();


    renderStationCtrRacks();


    renderConnectedEnds();


    setDraftStatus(

      `Reset in database: ${new Date(
        resetAt
      ).toLocaleString()}`

    );


    alert(
      "CTR Draft has been reset."
    );

  }

  catch (error) {

    console.error(
      "CTR draft reset error:",
      error
    );


    alert(

      error.message ||
      "CTR Draft could not be reset."

    );

  }

  finally {

    if (
      resetCtrDraftButton
    ) {

      resetCtrDraftButton.disabled =
        false;


      resetCtrDraftButton.textContent =
        "Reset Draft";

    }

  }

}


/* =========================================================
   SAVE / RESET EVENTS
========================================================= */

saveCtrDraftButton
  ?.addEventListener(
    "click",
    saveCtrDraft
  );


resetCtrDraftButton
  ?.addEventListener(
    "click",
    resetCtrDraft
  );


/* =========================================================
   INITIAL PAGE START
========================================================= */

async function initializeStationBuilder() {

  await loadCurrentStationWorkflowStatus();


  renderStationCtrRacks();


  renderConnectedEnds();


  if (
    window.ctrAccess?.ready
  ) {

    applyStationBuilderAccessMode();

  }


  await loadCtrDraft();


  renderStationCtrRacks();


  renderConnectedEnds();


  if (
    window.ctrAccess?.ready
  ) {

    applyStationBuilderAccessMode();

  }


  console.log(
    "Station CTR builder access:",
    {

      stationId:
        currentStationId,

      ctrStatus:
        currentStationWorkflowStatus,

      editAllowed:
        canEditCurrentStationDraft()

    }
  );

}


initializeStationBuilder();
/* =========================================================
   INITIAL DATA ENTRY BUTTON FIX
========================================================= */

const initialDataEntryButton =
  document.getElementById(
    "initialDataEntryButton"
  );


function openInitialDataEntryMode() {

  if (
    !requireCurrentStationDraftEdit()
  ) {

    return;

  }


  /*
    Builder already exists on the page.
    Re-apply the correct edit permissions before entering.
  */

  applyStationBuilderAccessMode();


  /*
    Show useful status to the user.
  */

  setDraftStatus(
    currentStationWorkflowStatus === "INITIAL_SETUP"
      ? "Initial data entry mode active. Enter CTR details and click Save Draft."
      : "Draft editing mode active. Continue editing and click Save Draft."
  );


  /*
    Move directly to the Station CTR drawing area.
  */

  const target =
    document.getElementById(
      "stationCtrRacksContainer"
    ) ||
    saveCtrDraftButton;


  if (target) {

    target.scrollIntoView({

      behavior:
        "smooth",

      block:
        "start"

    });

  }

}


initialDataEntryButton
  ?.addEventListener(
    "click",
    openInitialDataEntryMode
  );