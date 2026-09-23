/* =========================================================
   CTR MANAGEMENT SYSTEM
   DIGITAL SIGNING WORKSPACE

   STEP 51F

   BACKEND
   ---------------------------------------------------------
   get_ctr_signing_workspace(uuid)

   sign_and_forward_ctr(
     uuid,
     uuid,
     text,
     text,
     text,
     text,
     text
   )

   final_sign_and_approve_initial_ctr(
     uuid,
     uuid,
     text,
     text,
     text,
     text,
     text
   )

   STORAGE
   ---------------------------------------------------------
   Private bucket:
   ctr-workflow-documents

   IMPORTANT
   ---------------------------------------------------------
   - This application does not create a fake signature.
   - Officer must use an authorized DSC / eSign process.
   - Browser calculates SHA-256 of the returned signed PDF.
   - Signed PDF is stored as a new immutable object.
   - Existing workflow PDFs are never overwritten.
========================================================= */


(() => {

  "use strict";


  /* =====================================================
     CONFIGURATION
  ===================================================== */

  const STORAGE_BUCKET =
    "ctr-workflow-documents";


  const SIGNED_URL_LIFETIME_SECONDS =
    120;


  /* =====================================================
     ELEMENTS
  ===================================================== */

  const signingStatus =
    document.getElementById(
      "signingStatus"
    );


  const signingHeroStatus =
    document.getElementById(
      "signingHeroStatus"
    );


  const signingStation =
    document.getElementById(
      "signingStation"
    );


  const signingStationCode =
    document.getElementById(
      "signingStationCode"
    );


  const signingRecordName =
    document.getElementById(
      "signingRecordName"
    );


  const signingCurrentStage =
    document.getElementById(
      "signingCurrentStage"
    );


  const signingStepProgress =
    document.getElementById(
      "signingStepProgress"
    );


  const signingAssignedName =
    document.getElementById(
      "signingAssignedName"
    );


  const signingAssignedDesignation =
    document.getElementById(
      "signingAssignedDesignation"
    );


  const currentDocumentStatus =
    document.getElementById(
      "currentDocumentStatus"
    );


  const currentDocumentType =
    document.getElementById(
      "currentDocumentType"
    );


  const currentDocumentHash =
    document.getElementById(
      "currentDocumentHash"
    );


  const currentDocumentSignedAt =
    document.getElementById(
      "currentDocumentSignedAt"
    );


  const openCurrentDocument =
    document.getElementById(
      "openCurrentDocument"
    );


  const downloadCurrentDocument =
    document.getElementById(
      "downloadCurrentDocument"
    );


  const signatureMethod =
    document.getElementById(
      "signatureMethod"
    );


  const signatureReference =
    document.getElementById(
      "signatureReference"
    );


  const signedPdfFile =
    document.getElementById(
      "signedPdfFile"
    );


  const signedFileResult =
    document.getElementById(
      "signedFileResult"
    );


  const signingRemarks =
    document.getElementById(
      "signingRemarks"
    );


  const verifySignedDocument =
    document.getElementById(
      "verifySignedDocument"
    );


  const completeSigningAction =
    document.getElementById(
      "completeSigningAction"
    );


  const signingRoute =
    document.getElementById(
      "signingRoute"
    );


  const signingDocumentChain =
    document.getElementById(
      "signingDocumentChain"
    );


  const signingFinalProcessText =
    document.getElementById(
      "signingFinalProcessText"
    );


  const signingFinalProcessDescription =
    document.getElementById(
      "signingFinalProcessDescription"
    );


  /* =====================================================
     STATE
  ===================================================== */

  let workflowId =
    null;


  let workspace =
    null;


  let selectedSignedFile =
    null;


  let selectedSignedFileHash =
    null;


  let selectedSignedFileVerified =
    false;


  let signingActionRunning =
    false;


  /* =====================================================
     SUPABASE
  ===================================================== */

  function getSupabaseClient() {

    try {

      if (
        typeof supabaseClient !==
          "undefined" &&
        supabaseClient &&
        typeof supabaseClient.rpc ===
          "function"
      ) {

        return supabaseClient;

      }

    }

    catch (error) {

      console.warn(
        "Supabase client check:",
        error
      );

    }


    if (
      window.supabaseClient &&
      typeof window.supabaseClient.rpc ===
        "function"
    ) {

      return window.supabaseClient;

    }


    return null;

  }


  async function waitForSupabaseClient() {

    for (
      let attempt = 0;
      attempt < 100;
      attempt += 1
    ) {

      const client =
        getSupabaseClient();


      if (client) {

        return client;

      }


      await new Promise(
        (resolve) => {

          setTimeout(
            resolve,
            50
          );

        }
      );

    }


    return null;

  }


  /* =====================================================
     BASIC HELPERS
  ===================================================== */

  function escapeHtml(value) {

    if (
      value === null ||
      value === undefined
    ) {

      return "";

    }


    return String(value)

      .replaceAll(
        "&",
        "&amp;"
      )

      .replaceAll(
        "<",
        "&lt;"
      )

      .replaceAll(
        ">",
        "&gt;"
      )

      .replaceAll(
        '"',
        "&quot;"
      )

      .replaceAll(
        "'",
        "&#039;"
      );

  }


  function displayValue(
    value,
    fallback = "—"
  ) {

    if (
      value === null ||
      value === undefined ||
      String(value).trim() === ""
    ) {

      return fallback;

    }


    return String(value).trim();

  }


  function formatDateTime(value) {

    if (!value) {

      return "—";

    }


    const date =
      new Date(value);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "—";

    }


    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );

  }


  function formatFileSize(bytes) {

    if (
      !Number.isFinite(bytes) ||
      bytes < 0
    ) {

      return "—";

    }


    if (bytes < 1024) {

      return `${bytes} B`;

    }


    const kb =
      bytes / 1024;


    if (kb < 1024) {

      return `${kb.toFixed(1)} KB`;

    }


    const mb =
      kb / 1024;


    return `${mb.toFixed(2)} MB`;

  }


  function getWorkflowIdFromUrl() {

    const params =
      new URLSearchParams(
        window.location.search
      );


    return (
      params.get("workflow") ||
      params.get("id") ||
      ""
    ).trim();

  }


  function getStageName(stepType) {

    if (stepType === "PREPARER") {

      return "Preparation";

    }


    if (
      stepType ===
      "FINAL_APPROVAL"
    ) {

      return "Final Approval";

    }


    return "Officer Review";

  }


  function getDocumentTypeName(type) {

    if (type === "GENERATED") {

      return "Generated CTR PDF";

    }


    if (
      type ===
      "SIGNED_FORWARD"
    ) {

      return "Digitally Signed & Forwarded PDF";

    }


    if (
      type ===
      "FINAL_SIGNED"
    ) {

      return "Final Approved Signed PDF";

    }


    return "CTR PDF";

  }


  /* =====================================================
     STATUS
  ===================================================== */

  function showStatus(
    message,
    type = "normal"
  ) {

    if (!signingStatus) {

      return;

    }


    signingStatus.hidden =
      false;


    signingStatus.textContent =
      message;


    if (type === "error") {

      signingStatus.style.background =
        "#fff4f4";

      signingStatus.style.borderColor =
        "#dfbcbc";

      signingStatus.style.color =
        "#8a3434";

      return;

    }


    if (type === "success") {

      signingStatus.style.background =
        "#f3f8f4";

      signingStatus.style.borderColor =
        "#bfd6c3";

      signingStatus.style.color =
        "#356345";

      return;

    }


    signingStatus.style.background =
      "#f8fafc";

    signingStatus.style.borderColor =
      "#d3dde7";

    signingStatus.style.color =
      "#526b82";

  }


  /* =====================================================
     SUMMARY
  ===================================================== */

  function renderSummary() {

    const currentStep =
      workspace?.current_step || {};


    if (signingStation) {

      signingStation.textContent =
        displayValue(
          workspace?.station_name
        );

    }


    if (signingStationCode) {

      const code =
        displayValue(
          workspace?.station_code,
          ""
        );


      const division =
        displayValue(
          workspace?.division_name,
          ""
        );


      signingStationCode.textContent =
        [
          code,
          division
        ]
          .filter(Boolean)
          .join(" · ") ||
        "—";

    }


    if (signingRecordName) {

      signingRecordName.textContent =
        displayValue(
          workspace?.record_name,
          "CTR Record"
        );

    }


    if (signingCurrentStage) {

      signingCurrentStage.textContent =
        getStageName(
          currentStep.step_type
        );

    }


    if (signingStepProgress) {

      signingStepProgress.textContent =
        `Step ${
          workspace?.current_step_order ||
          "—"
        } of ${
          workspace?.total_steps ||
          "—"
        }`;

    }


    if (signingAssignedName) {

      signingAssignedName.textContent =
        displayValue(
          currentStep.assigned_name,
          "Not recorded"
        );

    }


    if (
      signingAssignedDesignation
    ) {

      signingAssignedDesignation.textContent =
        displayValue(
          currentStep.assigned_designation
        );

    }

  }


  /* =====================================================
     PRIVATE STORAGE SIGNED URL
  ===================================================== */

  async function createDocumentSignedUrl(
    storagePath,
    download = false
  ) {

    if (!storagePath) {

      throw new Error(
        "Controlled PDF storage path is missing."
      );

    }


    const client =
      await waitForSupabaseClient();


    if (!client) {

      throw new Error(
        "Supabase connection is unavailable."
      );

    }


    const options =
      download
        ? {
            download:
              getDownloadFilename()
          }
        : undefined;


    const {
      data,
      error
    } =
      await client
        .storage
        .from(
          STORAGE_BUCKET
        )
        .createSignedUrl(
          storagePath,
          SIGNED_URL_LIFETIME_SECONDS,
          options
        );


    if (error) {

      throw error;

    }


    if (!data?.signedUrl) {

      throw new Error(
        "Temporary PDF access link could not be created."
      );

    }


    return data.signedUrl;

  }


  function getDownloadFilename() {

    const stationCode =
      displayValue(
        workspace?.station_code,
        "STATION"
      )
        .replace(
          /[^a-zA-Z0-9_-]/g,
          "_"
        );


    const record =
      displayValue(
        workspace?.record_name,
        "CTR"
      )
        .replace(
          /[^a-zA-Z0-9_-]/g,
          "_"
        );


    return `${stationCode}_${record}.pdf`;

  }


  /* =====================================================
     CURRENT DOCUMENT BUTTONS
  ===================================================== */

  async function openControlledDocument() {

    const path =
      workspace
        ?.current_document
        ?.storage_path;


    if (!path) {

      showStatus(
        "Current controlled PDF is not available.",
        "error"
      );

      return;

    }


    try {

      showStatus(
        "Opening current controlled PDF..."
      );


      const signedUrl =
        await createDocumentSignedUrl(
          path,
          false
        );


      window.open(
        signedUrl,
        "_blank",
        "noopener,noreferrer"
      );


      showStatus(
        "Current controlled PDF opened."
      );

    }

    catch (error) {

      console.error(
        "Open PDF error:",
        error
      );


      showStatus(
        error?.message ||
        "Unable to open current PDF.",
        "error"
      );

    }

  }


  async function downloadControlledDocument() {

    const path =
      workspace
        ?.current_document
        ?.storage_path;


    if (!path) {

      showStatus(
        "Current controlled PDF is not available.",
        "error"
      );

      return;

    }


    try {

      showStatus(
        "Preparing controlled PDF download..."
      );


      const signedUrl =
        await createDocumentSignedUrl(
          path,
          true
        );


      const link =
        document.createElement(
          "a"
        );


      link.href =
        signedUrl;


      link.rel =
        "noopener";


      document.body.appendChild(
        link
      );


      link.click();


      link.remove();


      showStatus(
        "Controlled PDF prepared for the authorized digital-signature process."
      );

    }

    catch (error) {

      console.error(
        "Download PDF error:",
        error
      );


      showStatus(
        error?.message ||
        "Unable to download current PDF.",
        "error"
      );

    }

  }


  /* =====================================================
     CURRENT DOCUMENT
  ===================================================== */

  function renderCurrentDocument() {

    const documentRecord =
      workspace?.current_document;


    if (!documentRecord) {

      if (currentDocumentStatus) {

        currentDocumentStatus.textContent =
          "No controlled PDF registered";

      }


      if (currentDocumentType) {

        currentDocumentType.textContent =
          "—";

      }


      if (currentDocumentHash) {

        currentDocumentHash.textContent =
          "—";

      }


      if (currentDocumentSignedAt) {

        currentDocumentSignedAt.textContent =
          "—";

      }


      if (openCurrentDocument) {

        openCurrentDocument.disabled =
          true;

      }


      if (downloadCurrentDocument) {

        downloadCurrentDocument.disabled =
          true;

      }


      return;

    }


    if (currentDocumentStatus) {

      currentDocumentStatus.textContent =
        documentRecord.is_final
          ? "Final document"
          : "Current controlled document";

    }


    if (currentDocumentType) {

      currentDocumentType.textContent =
        getDocumentTypeName(
          documentRecord.document_type
        );

    }


    if (currentDocumentHash) {

      currentDocumentHash.textContent =
        displayValue(
          documentRecord.sha256,
          "Hash not recorded"
        );

    }


    if (currentDocumentSignedAt) {

      currentDocumentSignedAt.textContent =
        formatDateTime(
          documentRecord.signed_at
        );

    }


    if (openCurrentDocument) {

      openCurrentDocument.disabled =
        false;

    }


    if (downloadCurrentDocument) {

      downloadCurrentDocument.disabled =
        false;

    }

  }


  /* =====================================================
     ROUTE
  ===================================================== */

  function renderRoute() {

    if (!signingRoute) {

      return;

    }


    const route =
      Array.isArray(
        workspace?.route
      )
        ? workspace.route
        : [];


    if (route.length === 0) {

      signingRoute.innerHTML = `

        <div class="signing-route-step">

          <div class="signing-route-order">
            —
          </div>

          <div>

            <strong>
              Route not available
            </strong>

          </div>

        </div>

      `;

      return;

    }


    signingRoute.innerHTML =
      route.map(
        (step) => {

          const status =
            String(
              step.step_status || ""
            ).toUpperCase();


          const statusClass =
            status === "CURRENT"
              ? "current"
              : status === "COMPLETED"
                ? "completed"
                : "";


          return `

            <div class="signing-route-step">

              <div class="signing-route-order">

                ${escapeHtml(
                  step.step_order
                )}

              </div>


              <div>

                <strong>

                  ${escapeHtml(
                    displayValue(
                      step.assigned_name,
                      "User not recorded"
                    )
                  )}

                </strong>


                <small>

                  ${escapeHtml(
                    displayValue(
                      step.assigned_designation
                    )
                  )}

                  ·

                  ${escapeHtml(
                    getStageName(
                      step.step_type
                    )
                  )}

                </small>

              </div>


              <span
                class="
                  signing-route-state
                  ${statusClass}
                "
              >

                ${escapeHtml(
                  displayValue(
                    status,
                    "WAITING"
                  )
                )}

              </span>

            </div>

          `;

        }
      )
      .join("");

  }


  /* =====================================================
     DOCUMENT CHAIN
  ===================================================== */

  function renderDocumentChain() {

    if (!signingDocumentChain) {

      return;

    }


    const chain =
      Array.isArray(
        workspace?.document_chain
      )
        ? workspace.document_chain
        : [];


    if (chain.length === 0) {

      signingDocumentChain.innerHTML = `

        <div class="signing-route-step">

          <div class="signing-route-order">
            —
          </div>

          <div>

            <strong>
              No controlled PDF registered
            </strong>

            <small>
              PDF generation and registration is required.
            </small>

          </div>

        </div>

      `;

      return;

    }


    signingDocumentChain.innerHTML =
      chain.map(
        (
          documentRecord,
          index
        ) => {

          const state =
            documentRecord.is_final
              ? "FINAL"
              : documentRecord.document_type ===
                "GENERATED"
                ? "GENERATED"
                : "SIGNED";


          const stateClass =
            documentRecord.is_final
              ? "current"
              : documentRecord.document_type ===
                "SIGNED_FORWARD"
                ? "completed"
                : "";


          return `

            <div class="signing-route-step">

              <div class="signing-route-order">

                ${index + 1}

              </div>


              <div>

                <strong>

                  ${escapeHtml(
                    getDocumentTypeName(
                      documentRecord.document_type
                    )
                  )}

                </strong>


                <small>

                  ${escapeHtml(
                    formatDateTime(
                      documentRecord.signed_at ||
                      documentRecord.created_at
                    )
                  )}

                </small>

              </div>


              <span
                class="
                  signing-route-state
                  ${stateClass}
                "
              >

                ${escapeHtml(state)}

              </span>

            </div>

          `;

        }
      )
      .join("");

  }


  /* =====================================================
     ACTION MODE
  ===================================================== */

  function configureActionMode() {

    const canFinalApprove =
      workspace?.can_final_approve ===
      true;


    const canForward =
      workspace?.can_sign_and_forward ===
      true;


    const isCurrentHolder =
      workspace?.is_current_holder ===
      true;


    if (canFinalApprove) {

      if (completeSigningAction) {

        completeSigningAction.textContent =
          "Digital Sign & Final Approve";

      }


      if (signingFinalProcessText) {

        signingFinalProcessText.textContent =
          "Final Approve";

      }


      if (
        signingFinalProcessDescription
      ) {

        signingFinalProcessDescription.textContent =
          "The final signed PDF becomes the permanent approved CTR document and the workflow is closed.";

      }


      if (signingHeroStatus) {

        signingHeroStatus.textContent =
          "● Final Approval";

      }

    }

    else if (canForward) {

      if (completeSigningAction) {

        completeSigningAction.textContent =
          "Digital Sign & Forward";

      }


      if (signingFinalProcessText) {

        signingFinalProcessText.textContent =
          "Forward to Next Officer";

      }


      if (
        signingFinalProcessDescription
      ) {

        signingFinalProcessDescription.textContent =
          "The newly signed PDF becomes the current controlled document and moves to the next assigned officer.";

      }


      if (signingHeroStatus) {

        signingHeroStatus.textContent =
          "● Ready for Signing";

      }

    }

    else {

      if (signingHeroStatus) {

        signingHeroStatus.textContent =
          isCurrentHolder
            ? "● Action Not Available"
            : "● Read Only";

      }

    }


    updateSigningReadiness();

  }


  /* =====================================================
     PDF CHECK
  ===================================================== */

  async function isPdfFile(file) {

    if (!file) {

      return false;

    }


    const firstBytes =
      await file
        .slice(
          0,
          5
        )
        .arrayBuffer();


    const bytes =
      new Uint8Array(
        firstBytes
      );


    const header =
      Array.from(bytes)
        .map(
          (byte) =>
            String.fromCharCode(
              byte
            )
        )
        .join("");


    return header === "%PDF-";

  }


  /* =====================================================
     SHA-256
  ===================================================== */

  async function calculateSha256(file) {

    if (
      !window.crypto ||
      !window.crypto.subtle
    ) {

      throw new Error(
        "This browser does not support SHA-256 verification."
      );

    }


    const fileBuffer =
      await file.arrayBuffer();


    const digest =
      await window.crypto.subtle.digest(
        "SHA-256",
        fileBuffer
      );


    return Array
      .from(
        new Uint8Array(
          digest
        )
      )
      .map(
        (byte) =>
          byte
            .toString(16)
            .padStart(
              2,
              "0"
            )
      )
      .join("");

  }


  /* =====================================================
     FILE STATE
  ===================================================== */

  function resetSignedFileState() {

    selectedSignedFile =
      null;


    selectedSignedFileHash =
      null;


    selectedSignedFileVerified =
      false;


    if (verifySignedDocument) {

      verifySignedDocument.disabled =
        true;

    }


    if (signedFileResult) {

      signedFileResult.hidden =
        true;

      signedFileResult.innerHTML =
        "";

    }


    updateSigningReadiness();

  }


  function handleSignedFileSelection() {

    selectedSignedFile =
      null;


    selectedSignedFileHash =
      null;


    selectedSignedFileVerified =
      false;


    const file =
      signedPdfFile
        ?.files
        ?.[0];


    if (!file) {

      resetSignedFileState();

      return;

    }


    selectedSignedFile =
      file;


    if (verifySignedDocument) {

      verifySignedDocument.disabled =
        false;

    }


    if (signedFileResult) {

      signedFileResult.hidden =
        false;


      signedFileResult.innerHTML = `

        <strong>
          Selected PDF
        </strong>

        <br>

        ${escapeHtml(file.name)}

        <br>

        Size:
        ${escapeHtml(
          formatFileSize(
            file.size
          )
        )}

        <br>

        Verification pending.

      `;

    }


    updateSigningReadiness();

  }


  /* =====================================================
     LOCAL FILE VERIFICATION
  ===================================================== */

  async function verifySelectedSignedPdf() {

    if (!selectedSignedFile) {

      showStatus(
        "Select the digitally signed PDF first.",
        "error"
      );

      return;

    }


    if (
      selectedSignedFile.size >
      26214400
    ) {

      showStatus(
        "PDF exceeds the 25 MB storage limit.",
        "error"
      );

      return;

    }


    verifySignedDocument.disabled =
      true;


    showStatus(
      "Checking PDF and calculating SHA-256..."
    );


    try {

      const validPdf =
        await isPdfFile(
          selectedSignedFile
        );


      if (!validPdf) {

        throw new Error(
          "Selected file is not a valid PDF document."
        );

      }


      const calculatedHash =
        await calculateSha256(
          selectedSignedFile
        );


      /*
         A real PDF digital signature changes the PDF bytes.

         If the uploaded file has exactly the same SHA-256
         as the source controlled document, then no document
         change occurred.
      */

      const sourceHash =
        workspace
          ?.current_document
          ?.sha256
          ?.toLowerCase();


      if (
        sourceHash &&
        calculatedHash ===
          sourceHash
      ) {

        throw new Error(
          "The selected PDF is identical to the current controlled PDF. Please upload the PDF returned by the authorized digital-signature process."
        );

      }


      selectedSignedFileHash =
        calculatedHash;


      selectedSignedFileVerified =
        true;


      if (signedFileResult) {

        signedFileResult.hidden =
          false;


        signedFileResult.innerHTML = `

          <strong>
            PDF Ready for Controlled Upload
          </strong>

          <br>

          ${escapeHtml(
            selectedSignedFile.name
          )}

          <br>

          Size:
          ${escapeHtml(
            formatFileSize(
              selectedSignedFile.size
            )
          )}

          <br><br>

          SHA-256:

          <span class="document-hash">

            ${escapeHtml(
              selectedSignedFileHash
            )}

          </span>

          <br><br>

          <small>
            File structure and SHA-256 have been checked locally.
            Cryptographic DSC/eSign certificate validity is not independently verified by this browser step.
          </small>

        `;

      }


      showStatus(
        "Signed PDF is ready for controlled upload. Confirm the signing method and real signature/transaction reference.",
        "success"
      );


      updateSigningReadiness();

    }

    catch (error) {

      console.error(
        "PDF verification error:",
        error
      );


      selectedSignedFileHash =
        null;


      selectedSignedFileVerified =
        false;


      showStatus(
        error?.message ||
        "Unable to verify the selected PDF.",
        "error"
      );


      updateSigningReadiness();

    }

    finally {

      verifySignedDocument.disabled =
        false;

    }

  }


  /* =====================================================
     READINESS
  ===================================================== */

  function isSigningReady() {

    const hasMethod =
      Boolean(
        signatureMethod
          ?.value
          ?.trim()
      );


    const hasReference =
      Boolean(
        signatureReference
          ?.value
          ?.trim()
      );


    const hasDocument =
      Boolean(
        workspace
          ?.current_document
          ?.document_id
      );


    const canAct =
      workspace?.can_sign_and_forward ===
        true ||
      workspace?.can_final_approve ===
        true;


    return Boolean(
      hasMethod &&
      hasReference &&
      selectedSignedFile &&
      selectedSignedFileVerified &&
      selectedSignedFileHash &&
      hasDocument &&
      canAct &&
      !signingActionRunning
    );

  }


  function updateSigningReadiness() {

    if (!completeSigningAction) {

      return;

    }


    const ready =
      isSigningReady();


    completeSigningAction.disabled =
      !ready;


    if (signingActionRunning) {

      completeSigningAction.title =
        "Workflow action is being processed.";

      return;

    }


    if (!workspace?.current_document) {

      completeSigningAction.title =
        "A controlled source PDF must exist before digital signing.";

      return;

    }


    if (
      !workspace?.can_sign_and_forward &&
      !workspace?.can_final_approve
    ) {

      completeSigningAction.title =
        "This workflow is not currently assigned to you.";

      return;

    }


    if (!selectedSignedFileVerified) {

      completeSigningAction.title =
        "Select and verify the digitally signed PDF.";

      return;

    }


    if (
      !signatureMethod
        ?.value
        ?.trim()
    ) {

      completeSigningAction.title =
        "Select the authorized signing method.";

      return;

    }


    if (
      !signatureReference
        ?.value
        ?.trim()
    ) {

      completeSigningAction.title =
        "Enter the real signature or transaction reference.";

      return;

    }


    completeSigningAction.title =
      workspace?.can_final_approve
        ? "Upload this signed PDF and complete Final Approval."
        : "Upload this signed PDF and forward the CTR to the next officer.";

  }


  /* =====================================================
     CONTROLLED STORAGE PATH

     Hash is used as filename so repeated submission of the
     same exact signed PDF refers to the same object path.
  ===================================================== */

  function buildSignedStoragePath() {

    if (
      !workflowId ||
      !selectedSignedFileHash
    ) {

      throw new Error(
        "Workflow or PDF hash is unavailable."
      );

    }


    const folder =
      workspace?.can_final_approve
        ? "final"
        : "signed";


    return (
      `${workflowId}/` +
      `${folder}/` +
      `${selectedSignedFileHash}.pdf`
    );

  }


  /* =====================================================
     CHECK EXISTING OBJECT

     Useful when:
       upload succeeded,
       but RPC failed,
       and user retries same PDF.

     We do not overwrite.
  ===================================================== */

  async function storageObjectExists(
    storagePath
  ) {

    const client =
      await waitForSupabaseClient();


    if (!client) {

      throw new Error(
        "Supabase connection is unavailable."
      );

    }


    const slashIndex =
      storagePath.lastIndexOf(
        "/"
      );


    const folder =
      storagePath.substring(
        0,
        slashIndex
      );


    const filename =
      storagePath.substring(
        slashIndex + 1
      );


    const {
      data,
      error
    } =
      await client
        .storage
        .from(
          STORAGE_BUCKET
        )
        .list(
          folder,
          {
            search:
              filename,
            limit:
              10
          }
        );


    if (error) {

      return false;

    }


    return Array.isArray(data)
      &&
      data.some(
        (item) =>
          item.name ===
          filename
      );

  }


  /* =====================================================
     UPLOAD SIGNED PDF
  ===================================================== */

  async function uploadSignedPdf() {

    if (
      !selectedSignedFile ||
      !selectedSignedFileHash
    ) {

      throw new Error(
        "Verified signed PDF is unavailable."
      );

    }


    const client =
      await waitForSupabaseClient();


    if (!client) {

      throw new Error(
        "Supabase connection is unavailable."
      );

    }


    const storagePath =
      buildSignedStoragePath();


    const {
      error
    } =
      await client
        .storage
        .from(
          STORAGE_BUCKET
        )
        .upload(
          storagePath,
          selectedSignedFile,
          {
            contentType:
              "application/pdf",

            cacheControl:
              "3600",

            upsert:
              false
          }
        );


    if (!error) {

      return storagePath;

    }


    /*
       Do not overwrite.

       If an identical object already exists because the
       previous attempt uploaded successfully but the RPC
       failed afterwards, allow the workflow RPC to retry.
    */

    const exists =
      await storageObjectExists(
        storagePath
      );


    if (exists) {

      return storagePath;

    }


    throw error;

  }


  /* =====================================================
     INTERMEDIATE SIGN + FORWARD
  ===================================================== */

  async function performSignAndForward(
    storagePath
  ) {

    const client =
      await waitForSupabaseClient();


    if (!client) {

      throw new Error(
        "Supabase connection is unavailable."
      );

    }


    const {
      data,
      error
    } =
      await client.rpc(
        "sign_and_forward_ctr",
        {

          p_workflow_id:
            workflowId,

          p_source_document_id:
            workspace
              .current_document
              .document_id,

          p_signature_method:
            signatureMethod
              .value
              .trim(),

          p_signature_reference:
            signatureReference
              .value
              .trim(),

          p_signed_document_path:
            storagePath,

          p_signed_document_sha256:
            selectedSignedFileHash,

          p_remarks:
            signingRemarks
              ?.value
              ?.trim() ||
            null

        }
      );


    if (error) {

      throw error;

    }


    return data;

  }


  /* =====================================================
     FINAL SIGN + APPROVE
  ===================================================== */

  async function performFinalApproval(
    storagePath
  ) {

    const client =
      await waitForSupabaseClient();


    if (!client) {

      throw new Error(
        "Supabase connection is unavailable."
      );

    }


    const {
      data,
      error
    } =
      await client.rpc(
        "final_sign_and_approve_initial_ctr",
        {

          p_workflow_id:
            workflowId,

          p_source_document_id:
            workspace
              .current_document
              .document_id,

          p_signature_method:
            signatureMethod
              .value
              .trim(),

          p_signature_reference:
            signatureReference
              .value
              .trim(),

          p_final_signed_document_path:
            storagePath,

          p_final_signed_document_sha256:
            selectedSignedFileHash,

          p_remarks:
            signingRemarks
              ?.value
              ?.trim() ||
            null

        }
      );


    if (error) {

      throw error;

    }


    return data;

  }


  /* =====================================================
     COMPLETE SIGNING ACTION
  ===================================================== */

  async function completeWorkflowSigning() {

    if (
      signingActionRunning ||
      !isSigningReady()
    ) {

      return;

    }


    const finalApproval =
      workspace?.can_final_approve ===
      true;


    const actionName =
      finalApproval
        ? "Digital Sign & Final Approve"
        : "Digital Sign & Forward";


    const confirmation =
      window.confirm(
        finalApproval

          ? (
              "Confirm Final Approval?\n\n" +
              "The uploaded PDF will become the permanent final approved CTR document. This workflow cannot be withdrawn after Final Approval."
            )

          : (
              "Confirm Digital Sign & Forward?\n\n" +
              "The uploaded signed PDF will become the current controlled document and will be forwarded to the next officer."
            )
      );


    if (!confirmation) {

      return;

    }


    signingActionRunning =
      true;


    updateSigningReadiness();


    if (completeSigningAction) {

      completeSigningAction.textContent =
        finalApproval
          ? "Final Approval Processing..."
          : "Forwarding...";

    }


    try {

      /*
         Recalculate hash immediately before upload.

         This protects against accidental stale local state.
      */

      showStatus(
        "Rechecking signed PDF integrity..."
      );


      const freshHash =
        await calculateSha256(
          selectedSignedFile
        );


      if (
        freshHash !==
        selectedSignedFileHash
      ) {

        throw new Error(
          "Selected PDF changed after verification. Verify the PDF again."
        );

      }


      /*
         Current workflow may have changed while page was
         open. Reload context immediately before performing
         the irreversible workflow action.
      */

      showStatus(
        "Checking current workflow stage..."
      );


      await refreshWorkspaceBeforeAction();


      if (
        !workspace
          ?.current_document
          ?.document_id
      ) {

        throw new Error(
          "Current controlled PDF is no longer available."
        );

      }


      if (
        finalApproval &&
        !workspace?.can_final_approve
      ) {

        throw new Error(
          "Final Approval is no longer assigned to this user. Refresh the workflow."
        );

      }


      if (
        !finalApproval &&
        !workspace?.can_sign_and_forward
      ) {

        throw new Error(
          "This workflow is no longer available for forwarding by this user."
        );

      }


      /*
         Upload to private immutable storage.
      */

      showStatus(
        "Uploading digitally signed PDF to controlled storage..."
      );


      const storagePath =
        await uploadSignedPdf();


      /*
         Commit workflow action.
      */

      showStatus(
        finalApproval
          ? "Completing Final Approval..."
          : "Forwarding CTR to the next officer..."
      );


      let result;


      if (finalApproval) {

        result =
          await performFinalApproval(
            storagePath
          );

      }

      else {

        result =
          await performSignAndForward(
            storagePath
          );

      }


      console.log(
        "CTR signing action completed:",
        result
      );


      showStatus(
        finalApproval
          ? "Final signed CTR approved successfully."
          : "CTR digitally signed and forwarded successfully.",
        "success"
      );


      if (signingHeroStatus) {

        signingHeroStatus.textContent =
          finalApproval
            ? "● Final Approved"
            : "● Forwarded";

      }


      /*
         Prevent accidental second click.
      */

      if (completeSigningAction) {

        completeSigningAction.disabled =
          true;

      }


      if (signedPdfFile) {

        signedPdfFile.disabled =
          true;

      }


      if (signatureMethod) {

        signatureMethod.disabled =
          true;

      }


      if (signatureReference) {

        signatureReference.disabled =
          true;

      }


      if (signingRemarks) {

        signingRemarks.disabled =
          true;

      }


      /*
         Send user back to the correct register.
      */

      window.setTimeout(
        () => {

          if (finalApproval) {

            window.location.href =
              "approved.html";

          }

          else {

            window.location.href =
              "approvals.html";

          }

        },
        1200
      );

    }

    catch (error) {

      console.error(
        `${actionName} error:`,
        error
      );


      showStatus(
        error?.message ||
        `${actionName} could not be completed.`,
        "error"
      );


      signingActionRunning =
        false;


      configureActionMode();

    }

  }


  /* =====================================================
     REFRESH BEFORE IRREVERSIBLE ACTION
  ===================================================== */

  async function refreshWorkspaceBeforeAction() {

    const client =
      await waitForSupabaseClient();


    if (!client) {

      throw new Error(
        "Supabase connection is unavailable."
      );

    }


    const oldDocumentId =
      workspace
        ?.current_document
        ?.document_id;


    const {
      data,
      error
    } =
      await client.rpc(
        "get_ctr_signing_workspace",
        {
          p_workflow_id:
            workflowId
        }
      );


    if (error) {

      throw error;

    }


    if (!data) {

      throw new Error(
        "Workflow could not be refreshed."
      );

    }


    const newDocumentId =
      data
        ?.current_document
        ?.document_id;


    if (
      oldDocumentId !==
      newDocumentId
    ) {

      workspace =
        data;


      renderWorkspace();


      throw new Error(
        "The controlled PDF changed while this page was open. Review the latest document before signing."
      );

    }


    workspace =
      data;

  }


  /* =====================================================
     LOAD WORKSPACE
  ===================================================== */

  async function fetchWorkspace() {

    const client =
      await waitForSupabaseClient();


    if (!client) {

      throw new Error(
        "Supabase connection is unavailable."
      );

    }


    const {
      data,
      error
    } =
      await client.rpc(
        "get_ctr_signing_workspace",
        {
          p_workflow_id:
            workflowId
        }
      );


    if (error) {

      throw error;

    }


    if (!data) {

      throw new Error(
        "CTR workflow could not be loaded."
      );

    }


    return data;

  }


  function renderWorkspace() {

    renderSummary();

    renderCurrentDocument();

    renderRoute();

    renderDocumentChain();

    configureActionMode();

  }


  async function loadSigningWorkspace() {

    workflowId =
      getWorkflowIdFromUrl();


    if (!workflowId) {

      showStatus(
        "Workflow ID is missing. Open Digital Signing from Pending Approvals.",
        "error"
      );


      if (signingHeroStatus) {

        signingHeroStatus.textContent =
          "● Workflow Missing";

      }


      return;

    }


    showStatus(
      "Loading signing workspace..."
    );


    try {

      workspace =
        await fetchWorkspace();


      console.log(
        "CTR SIGNING WORKSPACE:",
        workspace
      );


      renderWorkspace();


      if (
        !workspace?.is_current_holder
      ) {

        showStatus(
          "You may view this workflow, but it is currently assigned to another user."
        );

      }

      else if (
        !workspace?.current_document
      ) {

        showStatus(
          "No controlled CTR PDF has been registered yet. Generate and register the CTR PDF before digital signing."
        );

      }

      else if (
        workspace?.can_final_approve
      ) {

        showStatus(
          "Review the latest controlled PDF. After completing the authorized digital-signature process, upload the signed PDF for Final Approval."
        );

      }

      else if (
        workspace?.can_sign_and_forward
      ) {

        showStatus(
          "Review and download the current controlled PDF. Sign it through the authorized DSC/eSign process, then upload the signed PDF to continue the workflow."
        );

      }

      else {

        showStatus(
          "No signing action is currently available for this workflow."
        );

      }

    }

    catch (error) {

      console.error(
        "Unable to load signing workspace:",
        error
      );


      showStatus(
        error?.message ||
        "Unable to load signing workspace.",
        "error"
      );


      if (signingHeroStatus) {

        signingHeroStatus.textContent =
          "● Load Error";

      }

    }

  }


  /* =====================================================
     EVENTS
  ===================================================== */

  openCurrentDocument
    ?.addEventListener(
      "click",
      openControlledDocument
    );


  downloadCurrentDocument
    ?.addEventListener(
      "click",
      downloadControlledDocument
    );


  signedPdfFile
    ?.addEventListener(
      "change",
      handleSignedFileSelection
    );


  verifySignedDocument
    ?.addEventListener(
      "click",
      verifySelectedSignedPdf
    );


  signatureMethod
    ?.addEventListener(
      "change",
      updateSigningReadiness
    );


  signatureReference
    ?.addEventListener(
      "input",
      updateSigningReadiness
    );


  completeSigningAction
    ?.addEventListener(
      "click",
      completeWorkflowSigning
    );


  /* =====================================================
     START
  ===================================================== */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      loadSigningWorkspace
    );

  }

  else {

    loadSigningWorkspace();

  }


})();