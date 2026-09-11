/* =========================================================
   CTR DRAWING GRID CONTROLS V2
   Systematic Row / Column controls
   Fuse + CTR Terminals + Location Racks
========================================================= */

(function () {

  "use strict";


  /* =====================================================
     EDIT ACCESS
  ===================================================== */

  function canEdit() {

    if (
      typeof canEditCurrentStationDraft ===
      "function"
    ) {

      return !!canEditCurrentStationDraft();

    }

    return true;

  }


  function requireEdit() {

    if (
      typeof requireCurrentStationDraftEdit ===
      "function"
    ) {

      return requireCurrentStationDraftEdit();

    }

    return canEdit();

  }


  /* =====================================================
     CONFIRM
  ===================================================== */

  function confirmAction(message) {

    return window.confirm(message);

  }


  /* =====================================================
     FUSE HELPERS
  ===================================================== */

  function createNewFuse(rack) {

    const nextNumber =
      typeof getNextFuseNumber ===
      "function"

        ? getNextFuseNumber(
            rack.fuseDetails
          )

        : rack.fuseDetails.length + 1;


    if (
      typeof createFusePoint ===
      "function"
    ) {

      return createFusePoint(
        nextNumber
      );

    }


    return {

      id:
        `${Date.now()}-${Math.random()}`,

      label:
        `F${nextNumber}`,

      details:
        ""

    };

  }


  function getFuseColumns(rack) {

    const saved =
      Number(
        rack.fuseGridColumns
      );


    if (
      Number.isInteger(saved) &&
      saved > 0
    ) {

      return saved;

    }


    const count =
      Array.isArray(
        rack.fuseDetails
      )

        ? rack.fuseDetails.length

        : 0;


    /*
      Existing fuse points become first row.
    */

    rack.fuseGridColumns =
      Math.max(
        1,
        count || 1
      );


    return rack.fuseGridColumns;

  }


  function getFuseRows(rack) {

    const columns =
      getFuseColumns(rack);


    const count =
      Array.isArray(
        rack.fuseDetails
      )

        ? rack.fuseDetails.length

        : 0;


    return Math.max(
      1,
      Math.ceil(
        count / columns
      )
    );

  }


  /* =====================================================
     ADD FUSE ROW
  ===================================================== */

  function addFuseRow(
    rack,
    rerender
  ) {

    if (
      !requireEdit()
    ) {

      return;

    }


    rack.fuseDetails =
      Array.isArray(
        rack.fuseDetails
      )

        ? rack.fuseDetails

        : [];


    const columns =
      getFuseColumns(rack);


    for (
      let i = 0;
      i < columns;
      i += 1
    ) {

      rack.fuseDetails.push(
        createNewFuse(rack)
      );

    }


    rerender();

  }


  /* =====================================================
     ADD FUSE COLUMN
  ===================================================== */

  function addFuseColumn(
    rack,
    rerender
  ) {

    if (
      !requireEdit()
    ) {

      return;

    }


    rack.fuseDetails =
      Array.isArray(
        rack.fuseDetails
      )

        ? rack.fuseDetails

        : [];


    const oldColumns =
      getFuseColumns(rack);


    const oldRows =
      getFuseRows(rack);


    const source =
      [...rack.fuseDetails];


    const rebuilt =
      [];


    for (
      let rowIndex = 0;
      rowIndex < oldRows;
      rowIndex += 1
    ) {

      const rowItems =
        source.slice(

          rowIndex * oldColumns,

          rowIndex * oldColumns +
          oldColumns

        );


      while (
        rowItems.length <
        oldColumns
      ) {

        rowItems.push(
          createNewFuse(rack)
        );

      }


      rebuilt.push(
        ...rowItems
      );


      rebuilt.push(
        createNewFuse(rack)
      );

    }


    rack.fuseGridColumns =
      oldColumns + 1;


    rack.fuseDetails =
      rebuilt;


    rerender();

  }


  /* =====================================================
     REMOVE FUSE ROW
  ===================================================== */

  function removeFuseRow(
    rack,
    rerender
  ) {

    if (
      !requireEdit()
    ) {

      return;

    }


    const rows =
      getFuseRows(rack);


    const columns =
      getFuseColumns(rack);


    if (
      rows <= 1
    ) {

      alert(
        "At least one fuse row must remain."
      );

      return;

    }


    if (
      !confirmAction(
        "Remove the last Fuse Row? Fuse details in that row will also be removed."
      )
    ) {

      return;

    }


    const startIndex =
      (rows - 1) *
      columns;


    rack.fuseDetails.splice(
      startIndex
    );


    rerender();

  }


  /* =====================================================
     REMOVE FUSE COLUMN
  ===================================================== */

  function removeFuseColumn(
    rack,
    rerender
  ) {

    if (
      !requireEdit()
    ) {

      return;

    }


    const columns =
      getFuseColumns(rack);


    const rows =
      getFuseRows(rack);


    if (
      columns <= 1
    ) {

      alert(
        "At least one fuse column must remain."
      );

      return;

    }


    if (
      !confirmAction(
        "Remove the last Fuse Column? Fuse details in that column will also be removed."
      )
    ) {

      return;

    }


    const source =
      [...rack.fuseDetails];


    const rebuilt =
      [];


    for (
      let rowIndex = 0;
      rowIndex < rows;
      rowIndex += 1
    ) {

      const rowItems =
        source.slice(

          rowIndex * columns,

          rowIndex * columns +
          columns

        );


      /*
        Remove last column item.
      */

      rowItems.splice(
        columns - 1,
        1
      );


      rebuilt.push(
        ...rowItems
      );

    }


    rack.fuseGridColumns =
      columns - 1;


    rack.fuseDetails =
      rebuilt;


    rerender();

  }


  /* =====================================================
     TERMINAL HELPERS
  ===================================================== */

  function getTerminalColumns(rack) {

    const rows =
      Array.isArray(
        rack.rows
      )

        ? rack.rows

        : [];


    const highest =
      rows.reduce(

        function (
          current,
          row
        ) {

          const count =
            Array.isArray(
              row.terminals
            )

              ? row.terminals.length

              : 0;


          return Math.max(
            current,
            count
          );

        },

        0

      );


    return highest || 12;

  }


  /* =====================================================
     ADD TERMINAL ROW
  ===================================================== */

  function addTerminalRow(
    rack,
    rerender
  ) {

    if (
      !requireEdit()
    ) {

      return;

    }


    rack.rows =
      Array.isArray(
        rack.rows
      )

        ? rack.rows

        : [];


    const columns =
      getTerminalColumns(rack);


    const label =
      typeof getRowLabel ===
      "function"

        ? getRowLabel(
            rack.rows.length
          )

        : String.fromCharCode(
            65 +
            rack.rows.length
          );


    if (
      typeof createRow ===
      "function"
    ) {

      rack.rows.push(

        createRow(
          label,
          columns
        )

      );

    }


    rerender();

  }


  /* =====================================================
     ADD TERMINAL COLUMN
  ===================================================== */

  function addTerminalColumn(
    rack,
    rerender
  ) {

    if (
      !requireEdit()
    ) {

      return;

    }


    rack.rows =
      Array.isArray(
        rack.rows
      )

        ? rack.rows

        : [];


    if (
      rack.rows.length === 0
    ) {

      addTerminalRow(
        rack,
        rerender
      );

      return;

    }


    rack.rows.forEach(
      function (row) {

        row.terminals =
          Array.isArray(
            row.terminals
          )

            ? row.terminals

            : [];


        if (
          typeof createTerminal ===
          "function"
        ) {

          row.terminals.push(

            createTerminal(
              row.terminals.length + 1
            )

          );

        }


        if (
          typeof renumberTerminals ===
          "function"
        ) {

          renumberTerminals(
            row
          );

        }

      }
    );


    rerender();

  }


  /* =====================================================
     REMOVE TERMINAL ROW
  ===================================================== */

  function removeTerminalRow(
    rack,
    rerender
  ) {

    if (
      !requireEdit()
    ) {

      return;

    }


    rack.rows =
      Array.isArray(
        rack.rows
      )

        ? rack.rows

        : [];


    if (
      rack.rows.length <= 1
    ) {

      alert(
        "At least one terminal row must remain."
      );

      return;

    }


    const lastRow =
      rack.rows[
        rack.rows.length - 1
      ];


    const label =
      lastRow?.label ||
      "";


    if (
      !confirmAction(
        `Remove Terminal Row ${label}? All terminals in this row will also be removed.`
      )
    ) {

      return;

    }


    rack.rows.pop();


    if (
      typeof relabelRows ===
      "function"
    ) {

      relabelRows(
        rack
      );

    }


    rerender();

  }


  /* =====================================================
     REMOVE TERMINAL COLUMN
  ===================================================== */

  function removeTerminalColumn(
    rack,
    rerender
  ) {

    if (
      !requireEdit()
    ) {

      return;

    }


    rack.rows =
      Array.isArray(
        rack.rows
      )

        ? rack.rows

        : [];


    const columns =
      getTerminalColumns(rack);


    if (
      columns <= 1
    ) {

      alert(
        "At least one terminal column must remain."
      );

      return;

    }


    if (
      !confirmAction(
        `Remove Terminal Column ${columns}? This terminal will be removed from every row.`
      )
    ) {

      return;

    }


    rack.rows.forEach(
      function (row) {

        row.terminals =
          Array.isArray(
            row.terminals
          )

            ? row.terminals

            : [];


        if (
          row.terminals.length > 0
        ) {

          row.terminals.pop();

        }


        if (
          typeof renumberTerminals ===
          "function"
        ) {

          renumberTerminals(
            row
          );

        }

      }
    );


    rerender();

  }


  /* =====================================================
     BUTTON
  ===================================================== */

  function makeButton(
    label,
    type,
    onClick
  ) {

    const button =
      document.createElement(
        "button"
      );


    button.type =
      "button";


    button.className =
      "systematic-grid-btn";


    if (
      type ===
      "remove"
    ) {

      button.classList.add(
        "systematic-remove-btn"
      );

    }


    button.textContent =
      label;


    button.hidden =
      !canEdit();


    button.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        event.stopPropagation();

        onClick();

      }
    );


    return button;

  }


  /* =====================================================
     CONTROL GROUP
  ===================================================== */

  function makeControls(
    kind,
    rack,
    rerender
  ) {

    const box =
      document.createElement(
        "div"
      );


    box.className =
      "systematic-grid-actions";


    box.dataset.gridKind =
      kind;


    if (
      kind ===
      "fuse"
    ) {

      box.append(

        makeButton(
          "+ Add Row",
          "add",
          function () {

            addFuseRow(
              rack,
              rerender
            );

          }
        ),


        makeButton(
          "+ Add Column",
          "add",
          function () {

            addFuseColumn(
              rack,
              rerender
            );

          }
        ),


        makeButton(
          "− Remove Row",
          "remove",
          function () {

            removeFuseRow(
              rack,
              rerender
            );

          }
        ),


        makeButton(
          "− Remove Column",
          "remove",
          function () {

            removeFuseColumn(
              rack,
              rerender
            );

          }
        )

      );

    }

    else {

      box.append(

        makeButton(
          "+ Add Row",
          "add",
          function () {

            addTerminalRow(
              rack,
              rerender
            );

          }
        ),


        makeButton(
          "+ Add Column",
          "add",
          function () {

            addTerminalColumn(
              rack,
              rerender
            );

          }
        ),


        makeButton(
          "− Remove Row",
          "remove",
          function () {

            removeTerminalRow(
              rack,
              rerender
            );

          }
        ),


        makeButton(
          "− Remove Column",
          "remove",
          function () {

            removeTerminalColumn(
              rack,
              rerender
            );

          }
        )

      );

    }


    return box;

  }


  /* =====================================================
     ENHANCE FUSE
  ===================================================== */

  function enhanceFuseSection(
    section,
    rack,
    rerender
  ) {

    if (
      !section ||
      !rack
    ) {

      return;

    }


    const header =
      section.querySelector(
        ".fuse-builder-header"
      );


    if (
      !header
    ) {

      return;

    }


    /*
      Hide original '+ Add Fuse Point'.
    */

    header
      .querySelectorAll(
        ".add-conductor-btn"
      )
      .forEach(
        function (button) {

          button.style.display =
            "none";

        }
      );


    if (
      !header.querySelector(
        '[data-grid-kind="fuse"]'
      )
    ) {

      header.appendChild(

        makeControls(
          "fuse",
          rack,
          rerender
        )

      );

    }


    const strip =
      section.querySelector(
        ".pdf-fuse-strip"
      );


    if (
      strip
    ) {

      const columns =
        getFuseColumns(rack);


      strip.classList.add(
        "systematic-fuse-grid"
      );


      strip.style.gridTemplateColumns =
        `repeat(${columns}, 145px)`;

    }


    let status =
      section.querySelector(
        ".fuse-grid-status"
      );


    if (
      !status
    ) {

      status =
        document.createElement(
          "div"
        );


      status.className =
        "fuse-grid-status";


      section.appendChild(
        status
      );

    }


    status.textContent =
      `Rows: ${getFuseRows(rack)} • Columns: ${getFuseColumns(rack)}`;

  }


  /* =====================================================
     ENHANCE TERMINALS
  ===================================================== */

  function enhanceTerminalSection(
    container,
    rack,
    rerender,
    locationMode
  ) {

    if (
      !container ||
      !rack
    ) {

      return;

    }


    /*
      Clean old per-row controls:
      Add Conductor / Remove Row.
    */

    container
      .querySelectorAll(
        ".row-header-actions"
      )
      .forEach(
        function (actions) {

          actions.style.display =
            "none";

        }
      );


    /*
      Clean red X beside every terminal.
      Column controls now manage columns systematically.
    */

    container
      .querySelectorAll(
        ".remove-conductor-btn"
      )
      .forEach(
        function (button) {

          button.style.display =
            "none";

        }
      );


    if (
      locationMode
    ) {

      /*
        Hide location-rack original Add Row.
      */

      const oldAddRow =
        container.querySelector(
          ".location-rack-header .add-conductor-btn"
        );


      if (
        oldAddRow
      ) {

        oldAddRow.style.display =
          "none";

      }


      if (
        !container.querySelector(
          ".systematic-terminal-toolbar"
        )
      ) {

        const toolbar =
          document.createElement(
            "div"
          );


        toolbar.className =
          "systematic-terminal-toolbar";


        const title =
          document.createElement(
            "div"
          );


        title.className =
          "systematic-toolbar-title";


        title.innerHTML = `

          <span>
            CTR TERMINALS
          </span>

          <strong>
            Row & Column Structure
          </strong>

        `;


        toolbar.append(

          title,

          makeControls(
            "terminal",
            rack,
            rerender
          )

        );


        const header =
          container.querySelector(
            ".location-rack-header"
          );


        header
          ?.insertAdjacentElement(
            "afterend",
            toolbar
          );

      }

    }

    else {

      const toolbar =
        container.querySelector(
          ".rack-builder-toolbar"
        );


      if (
        !toolbar
      ) {

        return;

      }


      /*
        Hide existing Add Row button.
      */

      toolbar
        .querySelectorAll(
          ":scope > .builder-action-btn"
        )
        .forEach(
          function (button) {

            button.style.display =
              "none";

          }
        );


      if (
        !toolbar.querySelector(
          '[data-grid-kind="terminal"]'
        )
      ) {

        toolbar.appendChild(

          makeControls(
            "terminal",
            rack,
            rerender
          )

        );

      }

    }

  }


  /* =====================================================
     LOCATION RACK DATA
  ===================================================== */

  function getLocationRacks() {

    const result =
      [];


    if (
      typeof connectedEnds ===
      "undefined" ||
      !Array.isArray(
        connectedEnds
      )
    ) {

      return result;

    }


    connectedEnds.forEach(
      function (end) {

        (
          end.locations ||
          []
        ).forEach(
          function (location) {

            (
              location.racks ||
              []
            ).forEach(
              function (rack) {

                result.push(
                  rack
                );

              }
            );

          }
        );

      }
    );


    return result;

  }


  /* =====================================================
     ROW LABELS
  ===================================================== */

  function normalizeRowLabels() {

    document
      .querySelectorAll(

        ".dynamic-row-header h4, .location-row-block .dynamic-row-header > strong"

      )
      .forEach(
        function (element) {

          const text =
            element.textContent
              .trim();


          const match =
            text.match(
              /^ROW\s*([A-Z]+)$/i
            );


          if (
            match
          ) {

            element.textContent =
              match[1]
                .toUpperCase();

          }

        }
      );

  }


  /* =====================================================
     STATION RACKS
  ===================================================== */

  function enhanceStationRacks() {

    if (
      typeof stationCtrRacks ===
      "undefined" ||
      !Array.isArray(
        stationCtrRacks
      )
    ) {

      return;

    }


    const cards =
      document.querySelectorAll(

        "#stationCtrRacksContainer .ctr-rack-card"

      );


    cards.forEach(
      function (
        card,
        index
      ) {

        const rack =
          stationCtrRacks[
            index
          ];


        if (
          !rack
        ) {

          return;

        }


        const rerender =
          typeof renderStationCtrRacks ===
          "function"

            ? renderStationCtrRacks

            : function () {};


        enhanceFuseSection(

          card.querySelector(
            ".rack-fuse-section"
          ),

          rack,

          rerender

        );


        enhanceTerminalSection(

          card,

          rack,

          rerender,

          false

        );

      }
    );

  }


  /* =====================================================
     LOCATION RACKS
  ===================================================== */

  function enhanceLocationRacks() {

    const racks =
      getLocationRacks();


    const cards =
      document.querySelectorAll(

        "#connectedEndsContainer .location-rack-card"

      );


    cards.forEach(
      function (
        card,
        index
      ) {

        const rack =
          racks[
            index
          ];


        if (
          !rack
        ) {

          return;

        }


        const rerender =
          typeof renderConnectedEnds ===
          "function"

            ? renderConnectedEnds

            : function () {};


        enhanceFuseSection(

          card.querySelector(
            ".location-fuse-box"
          ),

          rack,

          rerender

        );


        enhanceTerminalSection(

          card,

          rack,

          rerender,

          true

        );

      }
    );

  }


  /* =====================================================
     CSS
  ===================================================== */

  function injectStyles() {

    document
      .getElementById(
        "systematicGridControlsStyle"
      )
      ?.remove();


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "systematicGridControlsStyle";


    style.textContent = `

      /* ===============================================
         CONTROL GROUP
      =============================================== */

      .systematic-grid-actions {

        display:
          flex;

        align-items:
          center;

        justify-content:
          flex-end;

        gap:
          7px;

        flex-wrap:
          wrap;

      }


      /* ===============================================
         BUTTON
      =============================================== */

      .systematic-grid-btn {

        min-width:
          105px;

        min-height:
          32px;

        padding:
          6px
          10px;

        border:
          1px solid #5d6975;

        border-radius:
          2px;

        background:
          #ffffff;

        color:
          #1e344b;

        font-size:
          10px;

        font-weight:
          700;

        cursor:
          pointer;

        white-space:
          nowrap;

      }


      .systematic-grid-btn:hover {

        background:
          #edf1f4;

      }


      /* ===============================================
         REMOVE BUTTON
      =============================================== */

      .systematic-remove-btn {

        border-color:
          #bd3c3c;

        color:
          #a62020;

      }


      .systematic-remove-btn:hover {

        background:
          #fff3f3;

      }


      /* ===============================================
         FUSE TOOLBAR POSITION
      =============================================== */

      .fuse-builder-header
      .systematic-grid-actions {

        position:
          absolute;

        top:
          0;

        right:
          0;

      }


      /* ===============================================
         FUSE GRID
      =============================================== */

      .systematic-fuse-grid {

        display:
          grid !important;

        align-items:
          start !important;

        justify-content:
          start !important;

        gap:
          14px
          8px !important;

        width:
          max-content !important;

        min-width:
          100% !important;

      }


      .fuse-grid-status {

        margin-top:
          8px;

        padding-right:
          4px;

        color:
          #657687;

        font-size:
          9px;

        font-weight:
          500;

        text-align:
          right;

      }


      /* ===============================================
         STATION TERMINAL TOOLBAR
      =============================================== */

      .rack-builder-toolbar
      > .systematic-grid-actions {

        position:
          absolute;

        top:
          14px;

        right:
          0;

      }


      /* ===============================================
         LOCATION TERMINAL TOOLBAR
      =============================================== */

      .systematic-terminal-toolbar {

        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          16px;

        min-height:
          62px;

        padding:
          10px
          12px;

        border-bottom:
          1px solid #8f969d;

        background:
          #ffffff;

      }


      .systematic-toolbar-title span {

        display:
          block;

        color:
          #50667b;

        font-size:
          9px;

        font-weight:
          500;

      }


      .systematic-toolbar-title strong {

        display:
          block;

        margin-top:
          2px;

        color:
          #142e49;

        font-size:
          13px;

        font-weight:
          700;

      }


      /* ===============================================
         REMOVE OLD RANDOM DRAWING BUTTONS
      =============================================== */

      .row-header-actions,

      .remove-conductor-btn {

        display:
          none !important;

      }


      /* ===============================================
         VIEW MODE
      =============================================== */

      body[data-station-edit-mode="view"]
      .systematic-grid-actions {

        display:
          none !important;

      }


      /* ===============================================
         MOBILE
      =============================================== */

      @media
      (max-width: 900px) {

        .fuse-builder-header {

          padding-bottom:
            82px !important;

        }


        .fuse-builder-header
        .systematic-grid-actions {

          top:
            auto;

          right:
            0;

          bottom:
            5px;

          max-width:
            100%;

        }


        .rack-builder-toolbar {

          padding-bottom:
            82px !important;

        }


        .rack-builder-toolbar
        > .systematic-grid-actions {

          top:
            auto;

          right:
            0;

          bottom:
            6px;

        }

      }


      @media
      (max-width: 600px) {

        .systematic-grid-actions {

          width:
            100%;

          display:
            grid;

          grid-template-columns:
            repeat(
              2,
              minmax(
                0,
                1fr
              )
            );

          gap:
            6px;

        }


        .systematic-grid-btn {

          width:
            100%;

          min-width:
            0;

          font-size:
            9px;

        }


        .systematic-terminal-toolbar {

          align-items:
            stretch;

          flex-direction:
            column;

        }

      }

    `;


    document.head.appendChild(
      style
    );

  }


  /* =====================================================
     APPLY
  ===================================================== */

  let applying =
    false;


  function applyAll() {

    if (
      applying
    ) {

      return;

    }


    applying =
      true;


    try {

      normalizeRowLabels();

      enhanceStationRacks();

      enhanceLocationRacks();


      document
        .querySelectorAll(
          ".systematic-grid-btn"
        )
        .forEach(
          function (button) {

            button.hidden =
              !canEdit();

          }
        );

    }

    finally {

      applying =
        false;

    }

  }


  /* =====================================================
     START
  ===================================================== */

  function start() {

    injectStyles();

    applyAll();


    const observer =
      new MutationObserver(
        function () {

          requestAnimationFrame(
            applyAll
          );

        }
      );


    observer.observe(

      document.body,

      {
        childList:
          true,

        subtree:
          true
      }

    );


    window.addEventListener(
      "ctr-access-ready",
      applyAll
    );

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      start
    );

  }

  else {

    start();

  }

})();