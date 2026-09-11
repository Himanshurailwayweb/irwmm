/* =========================================================
   CTR STATION DRAWING BUILDER
   ROLE-AWARE SUPABASE VERSION
========================================================= */

/* -------------------- BASIC HELPERS -------------------- */

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
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function createFusePoint(number) {
  return {
    id: createId(),
    label: `F${number}`,
    details: ""
  };
}


function createTerminal(number) {
  return {
    id: createId(),

    number:
      String(number).padStart(
        2,
        "0"
      ),

    status: "SPARE",

    particular: "",

    locationBox: "",

    locationTerminal: "",

    remarks: ""
  };
}


function createRow(
  label,
  conductorCount = 12
) {
  return {
    id: createId(),

    label,

    terminals:
      Array.from(
        {
          length:
            conductorCount
        },
        (_, i) =>
          createTerminal(
            i + 1
          )
      )
  };
}


function createCtrRack(number) {
  return {
    id: createId(),

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

  for (
    const rack of racks
  ) {
    highest =
      Math.max(
        highest,
        Number(
          rack.autoNumber
        ) || 0
      );

    const match =
      String(
        rack.name || ""
      )
        .trim()
        .match(
          /^K(\d+)$/i
        );

    if (
      match
    ) {
      highest =
        Math.max(
          highest,
          Number(
            match[1]
          )
        );
    }
  }

  return highest + 1;
}


function getNextFuseNumber(
  fuses
) {
  let highest =
    0;

  for (
    const fuse of fuses
  ) {
    const match =
      String(
        fuse.label || ""
      )
        .trim()
        .match(
          /^F(\d+)$/i
        );

    if (
      match
    ) {
      highest =
        Math.max(
          highest,
          Number(
            match[1]
          )
        );
    }
  }

  return highest + 1;
}


function renumberTerminals(row) {
  row.terminals.forEach(
    (
      terminal,
      index
    ) => {

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
    (
      row,
      index
    ) => {

      row.label =
        getRowLabel(
          index
        );

    }
  );
}


/* =========================================================
   MAIN DATA
========================================================= */

const stationCtrRacks = [
  createCtrRack(1)
];


const connectedEnds =
  [];


const currentStationId =
  document.body.dataset.stationId ||
  null;


/* =========================================================
   CONNECTED END HELPERS
========================================================= */

function getNextEndNumber() {
  return (
    connectedEnds.reduce(
      (
        max,
        end
      ) =>
        Math.max(
          max,
          Number(
            end.autoNumber
          ) || 0
        ),
      0
    ) + 1
  );
}


function getNextLocationNumber(
  end
) {
  return (
    end.locations.reduce(
      (
        max,
        item
      ) =>
        Math.max(
          max,
          Number(
            item.autoNumber
          ) || 0
        ),
      0
    ) + 1
  );
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

    racks: [
      createCtrRack(1)
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


const modifyCtrButton =
  document.getElementById(
    "modifyCtrButton"
  );


const initialDataEntryButton =
  document.getElementById(
    "initialDataEntryButton"
  );


/* =========================================================
   ROLE + WORKFLOW ACCESS
========================================================= */

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


/*
  Hide editing controls until user role
  and station status are known.
*/

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


/* =========================================================
   LOAD STATION WORKFLOW STATUS
========================================================= */

async function loadCurrentStationWorkflowStatus() {

  if (
    !currentStationId
  ) {

    stationWorkflowStatusLoaded =
      true;


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


    if (
      error
    ) {

      throw error;

    }


    currentStationWorkflowStatus =
      data?.ctr_status ||
      null;


    stationWorkflowStatusLoaded =
      true;


    return (
      currentStationWorkflowStatus
    );

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
   CHECK EDIT PERMISSION
========================================================= */

function canEditCurrentStationDraft() {

  if (
    !currentStationId ||
    !stationWorkflowStatusLoaded ||
    !window.ctrAccess?.ready
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


  return (
    window.ctrAccess.hasStationRole(
      currentStationId,
      STATION_DRAFT_EDITOR_ROLES
    )
  );

}


/* =========================================================
   REQUIRE EDIT PERMISSION
========================================================= */

function requireCurrentStationDraftEdit() {

  if (
    canEditCurrentStationDraft()
  ) {

    return true;

  }


  if (
    stationWorkflowStatusLoaded &&
    currentStationWorkflowStatus &&
    !EDITABLE_STATION_STATUSES.includes(
      currentStationWorkflowStatus
    )
  ) {

    alert(
      "This station is no longer in an editable initial draft state. Approved or workflow-controlled CTR data must be changed through the alteration process."
    );

  }

  else {

    alert(
      "You have view-only access to this station CTR."
    );

  }


  return false;

}


/* =========================================================
   APPLY EDIT / VIEW MODE
========================================================= */

function applyStationBuilderAccessMode() {

  const editable =
    canEditCurrentStationDraft();


  document.body.dataset.stationEditMode =
    editable
      ? "edit"
      : "view";


  /* STATIC CONTROLS */

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


  /* MODIFY CTR - LATER WORKFLOW */

  if (
    modifyCtrButton
  ) {

    modifyCtrButton.disabled =
      true;


    modifyCtrButton.title =
      "CTR alteration workflow will be enabled after baseline approval workflow is implemented.";

  }


  /* DYNAMIC ACTION BUTTONS */

  document
    .querySelectorAll(
      [
        ".remove-conductor-btn",
        ".pdf-fuse-remove",
        ".add-conductor-btn",
        ".remove-row-btn",
        ".remove-rack-btn",
        "#stationCtrRacksContainer .builder-action-btn",
        "#connectedEndsContainer .builder-action-btn"
      ].join(",")
    )
    .forEach(
      function (element) {

        element.hidden =
          !editable;

      }
    );


  /* DYNAMIC TEXT INPUTS */

  document
    .querySelectorAll(
      ".station-rack-name-input, .location-rack-name-input, .end-name-input, .location-name-input"
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


  /* TERMINAL + FUSE DRAWING */

  document
    .querySelectorAll(
      ".terminal, .pdf-fuse-symbol-btn"
    )
    .forEach(
      function (button) {

        button.disabled =
          !editable;


        if (
          !editable
        ) {

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


  if (
    !editable
  ) {

    closeEditor();

    closeFuseEditor();

  }

}


/* =========================================================
   ROLE ACCESS READY
========================================================= */

window.addEventListener(
  "ctr-access-ready",
  function () {

    renderStationCtrRacks();

    renderConnectedEnds();

    applyStationBuilderAccessMode();

  }
);


/* =========================================================
   DRAFT STATUS
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
    !canEditCurrentStationDraft() ||
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
      terminal.particular ||
      "";

  }


  if (
    locationBox
  ) {

    locationBox.value =
      terminal.locationBox ||
      "";

  }


  if (
    locationTerminal
  ) {

    locationTerminal.value =
      terminal.locationTerminal ||
      "";

  }


  if (
    terminalStatus
  ) {

    terminalStatus.value =
      terminal.status ||
      "SPARE";

  }


  if (
    terminalRemarks
  ) {

    terminalRemarks.value =
      terminal.remarks ||
      "";

  }


  terminalEditor.hidden =
    false;


  terminalEditor.classList.add(
    "open"
  );


  terminalEditor.scrollIntoView(
    {
      behavior:
        "smooth",

      block:
        "center"
    }
  );

}


function closeEditor() {

  terminalEditor
    ?.classList
    .remove(
      "open"
    );


  selectedTerminal =
    null;

}


/* =========================================================
   SAVE TERMINAL
========================================================= */

function saveTerminalData() {

  if (
    !requireCurrentStationDraftEdit() ||
    !selectedTerminal
  ) {

    return;

  }


  selectedTerminal.particular =
    circuitParticular
      ?.value
      .trim() ||
    "";


  selectedTerminal.locationBox =
    locationBox
      ?.value
      .trim() ||
    "";


  selectedTerminal.locationTerminal =
    locationTerminal
      ?.value
      .trim() ||
    "";


  selectedTerminal.status =
    terminalStatus
      ?.value ||
    "SPARE";


  selectedTerminal.remarks =
    terminalRemarks
      ?.value
      .trim() ||
    "";


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
    terminal.status ===
    "IN USE"
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


  button.disabled =
    !canEditCurrentStationDraft();


  button.title =
    button.disabled
      ? "View only"
      : "Click to edit conductor";


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
   REMOVE TERMINAL BUTTON
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


  button.hidden =
    !canEditCurrentStationDraft();


  button.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();


      if (
        !requireCurrentStationDraftEdit()
      ) {

        return;

      }


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
    !canEditCurrentStationDraft() ||
    !fuseEditor
  ) {

    return;

  }


  selectedFuse =
    fuse;


  selectedFuseRerender =
    rerender;


  if (
    selectedFuseTitle
  ) {

    selectedFuseTitle.textContent =
      `${rack.name} / ${fuse.label || "Fuse Point"}`;

  }


  if (
    fuseLabelInput
  ) {

    fuseLabelInput.value =
      fuse.label ||
      "";

  }


  if (
    fuseDetailsInput
  ) {

    fuseDetailsInput.value =
      fuse.details ||
      "";

  }


  fuseEditor.hidden =
    false;


  fuseEditor.classList.add(
    "open"
  );


  fuseEditor.scrollIntoView(
    {
      behavior:
        "smooth",

      block:
        "center"
    }
  );


  setTimeout(
    function () {

      fuseDetailsInput
        ?.focus();

    },
    150
  );

}


function closeFuseEditor() {

  fuseEditor
    ?.classList
    .remove(
      "open"
    );


  selectedFuse =
    null;


  selectedFuseRerender =
    null;

}


/* =========================================================
   SAVE FUSE
========================================================= */

function saveFuseData() {

  if (
    !requireCurrentStationDraftEdit() ||
    !selectedFuse
  ) {

    return;

  }


  selectedFuse.label =
    fuseLabelInput
      ?.value
      .trim() ||
    selectedFuse.label ||
    "F1";


  selectedFuse.details =
    fuseDetailsInput
      ?.value
      .trim() ||
    "";


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


  /* REMOVE FUSE */

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


  removeButton.hidden =
    !canEditCurrentStationDraft();


  removeButton.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();


      if (
        !requireCurrentStationDraftEdit()
      ) {

        return;

      }


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


  /* CAPTION */

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


  caption.append(
    description,
    rackReference
  );


  /* FUSE SYMBOL */

  const symbolButton =
    document.createElement(
      "button"
    );


  symbolButton.type =
    "button";


  symbolButton.className =
    "pdf-fuse-symbol-btn";


  symbolButton.disabled =
    !canEditCurrentStationDraft();


  symbolButton.title =
    symbolButton.disabled
      ? "View only"
      : "Click to edit fuse details";


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
    fuse.label ||
    "-";


  const note =
    document.createElement(
      "div"
    );


  note.className =
    "pdf-fuse-note";


  note.textContent =
    canEditCurrentStationDraft()
      ? "Click symbol to edit"
      : "View only";


  item.append(
    removeButton,
    caption,
    symbolButton,
    fuseLabel,
    note
  );


  return item;

}


/* =========================================================
   FUSE SECTION
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


  title.append(
    headingLabel,
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


  addButton.hidden =
    !canEditCurrentStationDraft();


  addButton.addEventListener(
    "click",
    function () {

      if (
        !requireCurrentStationDraftEdit()
      ) {

        return;

      }


      const fuse =
        createFusePoint(
          getNextFuseNumber(
            rack.fuseDetails
          )
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


  header.append(
    title,
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


  addConductorButton.hidden =
    !canEditCurrentStationDraft();


  addConductorButton.addEventListener(
    "click",
    function () {

      if (
        !requireCurrentStationDraftEdit()
      ) {

        return;

      }


      row.terminals.push(
        createTerminal(
          row.terminals.length +
          1
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


  removeRowButton.hidden =
    !canEditCurrentStationDraft();


  removeRowButton.addEventListener(
    "click",
    function () {

      if (
        !requireCurrentStationDraftEdit()
      ) {

        return;

      }


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


  actions.append(
    addConductorButton,
    removeRowButton
  );


  header.append(
    title,
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

      terminalStrip.append(
        createTerminalVisual(
          rack,
          row,
          terminal,
          owner
        ),

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


  const editable =
    canEditCurrentStationDraft();


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


      rackNameInput.readOnly =
        !editable;


      rackNameInput.addEventListener(
        "input",
        function () {

          if (
            editable
          ) {

            rack.name =
              rackNameInput.value;

          }

        }
      );


      titleArea.append(
        label,
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
        editable
          ? "Initial Setup"
          : "View Only";


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


      removeRackButton.hidden =
        !editable;


      removeRackButton.addEventListener(
        "click",
        function () {

          if (
            !requireCurrentStationDraftEdit()
          ) {

            return;

          }


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


      actions.append(
        status,
        removeRackButton
      );


      header.append(
        titleArea,
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


      addRowButton.hidden =
        !editable;


      addRowButton.addEventListener(
        "click",
        function () {

          if (
            !requireCurrentStationDraftEdit()
          ) {

            return;

          }


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


      toolbar.append(
        toolbarTitle,
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

      if (
        !requireCurrentStationDraftEdit()
      ) {

        return;

      }


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
   LOCATION RACK VIEW
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


  const editable =
    canEditCurrentStationDraft();


  const addRackButton =
    document.createElement(
      "button"
    );


  addRackButton.type =
    "button";


  addRackButton.className =
    "builder-action-btn";


  addRackButton.textContent =
    "+ Add Rack / Section";


  addRackButton.hidden =
    !editable;


  addRackButton.addEventListener(
    "click",
    function () {

      if (
        !requireCurrentStationDraftEdit()
      ) {

        return;

      }


      location.racks.push(
        createCtrRack(
          getNextRackNumber(
            location.racks
          )
        )
      );


      renderConnectedEnds();

    }
  );


  wrapper.appendChild(
    addRackButton
  );


  location.racks.forEach(
    function (rack) {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "location-rack-card";


      const header =
        document.createElement(
          "div"
        );


      header.className =
        "location-rack-header";


      const rackNameInput =
        document.createElement(
          "input"
        );


      rackNameInput.type =
        "text";


      rackNameInput.className =
        "location-rack-name-input";


      rackNameInput.value =
        rack.name;


      rackNameInput.placeholder =
        "Enter rack / section name";


      rackNameInput.readOnly =
        !editable;


      rackNameInput.addEventListener(
        "input",
        function () {

          if (
            editable
          ) {

            rack.name =
              rackNameInput.value;

          }

        }
      );


      const actions =
        document.createElement(
          "div"
        );


      actions.className =
        "rack-header-actions";


      const addRowButton =
        document.createElement(
          "button"
        );


      addRowButton.type =
        "button";


      addRowButton.className =
        "add-conductor-btn";


      addRowButton.textContent =
        "+ Add Row";


      addRowButton.hidden =
        !editable;


      addRowButton.addEventListener(
        "click",
        function () {

          if (
            !requireCurrentStationDraftEdit()
          ) {

            return;

          }


          rack.rows.push(
            createRow(
              getRowLabel(
                rack.rows.length
              ),
              12
            )
          );


          renderConnectedEnds();

        }
      );


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


      removeRackButton.hidden =
        !editable;


      removeRackButton.addEventListener(
        "click",
        function () {

          if (
            !requireCurrentStationDraftEdit()
          ) {

            return;

          }


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
            location.racks.indexOf(
              rack
            );


          if (
            index !== -1
          ) {

            location.racks.splice(
              index,
              1
            );


            renderConnectedEnds();

          }

        }
      );


      actions.append(
        addRowButton,
        removeRackButton
      );


      header.append(
        rackNameInput,
        actions
      );


      card.appendChild(
        header
      );


      card.appendChild(
        buildFuseSection(
          rack,
          renderConnectedEnds,
          "location-fuse-box",
          "FUSE DETAILS"
        )
      );


      rack.rows.forEach(
        function (row) {

          card.appendChild(
            buildRowBlock(
              rack,
              row,
              "location",
              renderConnectedEnds,
              true
            )
          );

        }
      );


      wrapper.appendChild(
        card
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


  const editable =
    canEditCurrentStationDraft();


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


      endNameInput.readOnly =
        !editable;


      endNameInput.addEventListener(
        "input",
        function () {

          if (
            editable
          ) {

            end.name =
              endNameInput.value;

          }

        }
      );


      titleArea.append(
        label,
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


      addLocationButton.hidden =
        !editable;


      addLocationButton.addEventListener(
        "click",
        function () {

          if (
            !requireCurrentStationDraftEdit()
          ) {

            return;

          }


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


      removeEndButton.hidden =
        !editable;


      removeEndButton.addEventListener(
        "click",
        function () {

          if (
            !requireCurrentStationDraftEdit()
          ) {

            return;

          }


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


      actions.append(
        addLocationButton,
        removeEndButton
      );


      header.append(
        titleArea,
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


          locationNameInput.readOnly =
            !editable;


          locationNameInput.addEventListener(
            "input",
            function () {

              if (
                editable
              ) {

                location.name =
                  locationNameInput.value;

              }

            }
          );


          title.append(
            locationLabel,
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


          removeLocationButton.hidden =
            !editable;


          removeLocationButton.addEventListener(
            "click",
            function () {

              if (
                !requireCurrentStationDraftEdit()
              ) {

                return;

              }


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


          locationHeader.append(
            title,
            removeLocationButton
          );


          locationCard.append(
            locationHeader,
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

      if (
        !requireCurrentStationDraftEdit()
      ) {

        return;

      }


      connectedEnds.push(
        createConnectedEnd()
      );


      renderConnectedEnds();

    }
  );


/* =========================================================
   NORMALIZE LOADED RACK
========================================================= */

function normalizeRack(
  source,
  fallbackNumber
) {

  const rack =
    source &&
    typeof source ===
    "object"
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
              terminalIndex +
              1
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
   APPLY LOADED DRAFT DATA
========================================================= */

function applyDraftData(data) {

  if (
    !data ||
    typeof data !==
    "object"
  ) {

    return;

  }


  /* STATION RACKS */

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


  /* CONNECTED ENDS */

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
            typeof sourceEnd ===
            "object"
              ? sourceEnd
              : {};


          end.id =
            end.id ||
            createId();


          end.autoNumber =
            Number(
              end.autoNumber
            ) ||
            endIndex +
            1;


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
                  typeof sourceLocation ===
                  "object"
                    ? sourceLocation
                    : {};


                location.id =
                  location.id ||
                  createId();


                location.autoNumber =
                  Number(
                    location.autoNumber
                  ) ||
                  locationIndex +
                  1;


                location.name =
                  location.name ||
                  `Location Box ${location.autoNumber}`;


                location.racks =
                  Array.isArray(
                    location.racks
                  )
                    ? location.racks
                    : [
                        createCtrRack(1)
                      ];


                location.racks =
                  location.racks.map(
                    function (
                      rack,
                      rackIndex
                    ) {

                      return normalizeRack(
                        rack,
                        rackIndex +
                        1
                      );

                    }
                  );


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
   GET AUTHENTICATED USER
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
   SAVE CTR DRAFT
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

      stationCtrRacks,

      connectedEnds,

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


    /* STATUS SYNC */

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

      throw new Error(
        "CTR Draft was saved, but station status could not be updated: " +
        statusError.message
      );

    }


    currentStationWorkflowStatus =
      typeof stationStatus ===
      "string"
        ? stationStatus
        : "DRAFT";


    stationWorkflowStatusLoaded =
      true;


    applyStationBuilderAccessMode();


    setDraftStatus(
      `Saved to database: ${new Date(
        savedAt
      ).toLocaleString()}`
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
   LOAD CTR DRAFT
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


    if (
      data.updated_at
    ) {

      setDraftStatus(
        `Loaded from database: ${new Date(
          data.updated_at
        ).toLocaleString()}`
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

    closeFuseEditor();


    renderStationCtrRacks();

    renderConnectedEnds();


    applyStationBuilderAccessMode();


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
   INITIAL DATA ENTRY BUTTON
========================================================= */

initialDataEntryButton
  ?.addEventListener(
    "click",
    function () {

      document
        .getElementById(
          "station-racks"
        )
        ?.scrollIntoView(
          {
            behavior:
              "smooth",

            block:
              "start"
          }
        );

    }
  );


/* =========================================================
   INITIAL START
========================================================= */

async function initializeStationBuilder() {

  /*
    First load station workflow status.
  */

  await loadCurrentStationWorkflowStatus();


  /*
    Initial render.
  */

  renderStationCtrRacks();

  renderConnectedEnds();


  /*
    Apply access if role-access.js already loaded.
  */

  if (
    window.ctrAccess?.ready
  ) {

    applyStationBuilderAccessMode();

  }


  /*
    Load saved CTR draft.
  */

  await loadCtrDraft();


  /*
    Render database data.
  */

  renderStationCtrRacks();

  renderConnectedEnds();


  /*
    Apply permissions again because dynamic
    elements were rebuilt.
  */

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