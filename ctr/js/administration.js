/* =========================================================
   CTR MANAGEMENT SYSTEM
   USER PROFILE + ROLE ADMINISTRATION
   SECURE RPC VERSION
========================================================= */


/* =========================================================
   DOM REFERENCES
========================================================= */

const roleAssignmentPanel =
  document.getElementById("roleAssignmentPanel");

const roleUser =
  document.getElementById("roleUser");

const roleCode =
  document.getElementById("roleCode");

const roleScopeType =
  document.getElementById("roleScopeType");

const roleDivision =
  document.getElementById("roleDivision");

const roleDivisionField =
  document.getElementById("roleDivisionField");

const roleStation =
  document.getElementById("roleStation");

const roleStationField =
  document.getElementById("roleStationField");

const clearRoleFormButton =
  document.getElementById("clearRoleForm");

const assignRoleButton =
  document.getElementById("assignRole");

const userSearch =
  document.getElementById("userSearch");

const userCount =
  document.getElementById("userCount");

const userList =
  document.getElementById("userList");

const usersEmptyState =
  document.getElementById("usersEmptyState");


/* =========================================================
   PROFILE EDITOR DOM
========================================================= */

const profileEditPanel =
  document.getElementById("profileEditPanel");

const profileEditTitle =
  document.getElementById("profileEditTitle");

const profileFullName =
  document.getElementById("profileFullName");

const profileEmployeeNumber =
  document.getElementById("profileEmployeeNumber");

const profileDesignation =
  document.getElementById("profileDesignation");

const profilePhone =
  document.getElementById("profilePhone");

const closeProfileEditButton =
  document.getElementById("closeProfileEdit");

const cancelProfileEditButton =
  document.getElementById("cancelProfileEdit");

const saveProfileButton =
  document.getElementById("saveProfile");


/* =========================================================
   APPLICATION STATE
========================================================= */

let currentUserId = null;

let editingProfileUserId = null;

let users = [];

let divisions = [];

let stations = [];

let roles = [];


/* =========================================================
   ROLE CONFIGURATION
========================================================= */

const ROLE_LABELS = {

  SYSTEM_ADMIN:
    "System Administrator",

  STATION_USER:
    "Station User",

  EMPLOYEE:
    "Employee",

  REVIEW_OFFICER:
    "Review Officer",

  APPROVING_OFFICER:
    "Approving Officer",

  FINAL_SIGNATORY:
    "Final Signatory",

  CORRECTION_AUTHORITY:
    "Correction Authority",

  VIEWER:
    "Viewer"

};


const STATION_ONLY_ROLES = [
  "STATION_USER",
  "EMPLOYEE"
];


const OFFICER_SCOPE_ROLES = [

  "REVIEW_OFFICER",

  "APPROVING_OFFICER",

  "FINAL_SIGNATORY",

  "CORRECTION_AUTHORITY",

  "VIEWER"

];


/* =========================================================
   SAFE HTML
========================================================= */

function escapeHtml(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   USER DISPLAY NAME
========================================================= */

function getUserDisplayName(user) {

  if (!user) {

    return "Unknown User";

  }


  if (
    user.full_name &&
    user.full_name.trim()
  ) {

    return user.full_name.trim();

  }


  if (
    user.employee_number &&
    user.employee_number.trim()
  ) {

    return (
      `Employee ${user.employee_number.trim()}`
    );

  }


  return (
    `User ${String(user.id).slice(0, 8)}`
  );

}


/* =========================================================
   FIND HELPERS
========================================================= */

function findDivision(divisionId) {

  return divisions.find(
    function (division) {

      return division.id === divisionId;

    }
  );

}


function findStation(stationId) {

  return stations.find(
    function (station) {

      return station.id === stationId;

    }
  );

}


function findUser(userId) {

  return users.find(
    function (user) {

      return user.id === userId;

    }
  );

}


/* =========================================================
   VERIFY SYSTEM ADMIN
========================================================= */

async function verifySystemAdmin() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.getUser();


    if (
      error ||
      !data.user
    ) {

      window.location.replace(
        "login.html"
      );

      return false;

    }


    currentUserId =
      data.user.id;


    const {
      data: adminRole,
      error: roleError
    } =
      await supabaseClient
        .from("user_roles")
        .select("id")
        .eq(
          "user_id",
          currentUserId
        )
        .eq(
          "role_code",
          "SYSTEM_ADMIN"
        )
        .eq(
          "is_active",
          true
        )
        .is(
          "station_id",
          null
        )
        .is(
          "division_id",
          null
        )
        .maybeSingle();


    if (roleError) {

      throw roleError;

    }


    if (!adminRole) {

      alert(
        "System Administrator access is required."
      );


      window.location.replace(
        "index.html"
      );


      return false;

    }


    return true;

  }

  catch (error) {

    console.error(
      "Administrator verification error:",
      error
    );


    alert(
      "Unable to verify administrator access."
    );


    window.location.replace(
      "index.html"
    );


    return false;

  }

}


/* =========================================================
   LOAD USERS
========================================================= */

async function loadUsers() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("user_profiles")
      .select(`
        id,
        full_name,
        employee_number,
        phone,
        designation,
        is_active,
        created_at,
        updated_at
      `)
      .order(
        "full_name",
        {
          ascending: true
        }
      );


  if (error) {

    throw error;

  }


  users =
    data || [];

}


/* =========================================================
   LOAD DIVISIONS
========================================================= */

async function loadDivisions() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("divisions")
      .select(`
        id,
        division_name,
        division_code,
        zone_name,
        display_order,
        is_active
      `)
      .eq(
        "is_active",
        true
      )
      .order(
        "display_order",
        {
          ascending: true
        }
      )
      .order(
        "division_name",
        {
          ascending: true
        }
      );


  if (error) {

    throw error;

  }


  divisions =
    data || [];

}


/* =========================================================
   LOAD STATIONS
========================================================= */

async function loadStations() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("stations")
      .select(`
        id,
        station_name,
        station_code,
        division_id,
        sectional_incharge_designation,
        is_active
      `)
      .eq(
        "is_active",
        true
      )
      .order(
        "station_name",
        {
          ascending: true
        }
      );


  if (error) {

    throw error;

  }


  stations =
    data || [];

}


/* =========================================================
   LOAD ROLES
========================================================= */

async function loadRoles() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("user_roles")
      .select(`
        id,
        user_id,
        role_code,
        station_id,
        division_id,
        is_active,
        created_by,
        created_at
      `)
      .order(
        "created_at",
        {
          ascending: true
        }
      );


  if (error) {

    throw error;

  }


  roles =
    data || [];

}


/* =========================================================
   PROFILE EDITOR
========================================================= */

function openProfileEditor(userId) {

  const user =
    findUser(userId);


  if (!user) {

    return;

  }


  editingProfileUserId =
    user.id;


  profileEditTitle.textContent =
    `Edit Profile — ${getUserDisplayName(user)}`;


  profileFullName.value =
    user.full_name || "";


  profileEmployeeNumber.value =
    user.employee_number || "";


  profileDesignation.value =
    user.designation || "";


  profilePhone.value =
    user.phone || "";


  profileEditPanel.classList.add(
    "open"
  );


  profileEditPanel.scrollIntoView({

    behavior:
      "smooth",

    block:
      "start"

  });


  setTimeout(
    function () {

      profileFullName.focus();

    },
    150
  );

}


function closeProfileEditor() {

  editingProfileUserId =
    null;


  profileEditPanel.classList.remove(
    "open"
  );


  profileFullName.value =
    "";


  profileEmployeeNumber.value =
    "";


  profileDesignation.value =
    "";


  profilePhone.value =
    "";

}


/* =========================================================
   SAVE PROFILE
========================================================= */

async function saveUserProfile() {

  if (!editingProfileUserId) {

    alert(
      "No user selected."
    );

    return;

  }


  const fullName =
    profileFullName
      .value
      .trim();


  const employeeNumber =
    profileEmployeeNumber
      .value
      .trim();


  const designation =
    profileDesignation
      .value
      .trim();


  const phone =
    profilePhone
      .value
      .trim();


  if (!fullName) {

    alert(
      "Full Name is required."
    );


    profileFullName.focus();


    return;

  }


  saveProfileButton.disabled =
    true;


  saveProfileButton.textContent =
    "Saving...";


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .rpc(
          "admin_update_user_profile",
          {

            p_user_id:
              editingProfileUserId,

            p_full_name:
              fullName,

            p_employee_number:
              employeeNumber || null,

            p_phone:
              phone || null,

            p_designation:
              designation || null

          }
        );


    if (error) {

      throw error;

    }


    console.log(
      "Profile update result:",
      data
    );


    closeProfileEditor();


    await loadUsers();


    populateUserDropdown();


    renderUsers();


    alert(
      "User profile updated successfully."
    );

  }

  catch (error) {

    console.error(
      "Profile update error:",
      error
    );


    if (
      error.code === "23505"
    ) {

      alert(
        "This employee number is already assigned to another user."
      );

    }

    else {

      alert(
        error.message ||
        "User profile could not be updated."
      );

    }

  }

  finally {

    saveProfileButton.disabled =
      false;


    saveProfileButton.textContent =
      "Save Profile";

  }

}


/* =========================================================
   POPULATE USERS
========================================================= */

function populateUserDropdown() {

  roleUser.innerHTML = `

    <option value="">
      Select User
    </option>

  `;


  users
    .filter(
      function (user) {

        return (
          user.is_active !== false
        );

      }
    )
    .forEach(
      function (user) {

        const option =
          document.createElement(
            "option"
          );


        option.value =
          user.id;


        const employee =
          user.employee_number
            ? ` (${user.employee_number})`
            : "";


        const designation =
          user.designation
            ? ` — ${user.designation}`
            : "";


        option.textContent =
          `${getUserDisplayName(user)}${employee}${designation}`;


        roleUser.appendChild(
          option
        );

      }
    );

}


/* =========================================================
   POPULATE DIVISIONS
========================================================= */

function populateDivisionDropdown() {

  roleDivision.innerHTML = `

    <option value="">
      Select Division
    </option>

  `;


  divisions.forEach(
    function (division) {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        division.id;


      const code =
        division.division_code
          ? ` (${division.division_code})`
          : "";


      option.textContent =
        `${division.division_name}${code}`;


      roleDivision.appendChild(
        option
      );

    }
  );

}


/* =========================================================
   POPULATE STATIONS
========================================================= */

function populateStationDropdown() {

  const divisionId =
    roleDivision.value;


  roleStation.innerHTML =
    "";


  if (!divisionId) {

    roleStation.innerHTML = `

      <option value="">
        Select Division First
      </option>

    `;


    roleStation.disabled =
      true;


    return;

  }


  roleStation.disabled =
    false;


  const firstOption =
    document.createElement(
      "option"
    );


  firstOption.value =
    "";


  firstOption.textContent =
    "Select Station";


  roleStation.appendChild(
    firstOption
  );


  const matchingStations =
    stations.filter(
      function (station) {

        return (
          station.division_id ===
          divisionId
        );

      }
    );


  matchingStations.forEach(
    function (station) {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        station.id;


      const code =
        station.station_code
          ? ` (${station.station_code})`
          : "";


      option.textContent =
        `${station.station_name}${code}`;


      roleStation.appendChild(
        option
      );

    }
  );


  if (
    matchingStations.length ===
    0
  ) {

    roleStation.innerHTML = `

      <option value="">
        No active stations in this division
      </option>

    `;


    roleStation.disabled =
      true;

  }

}


/* =========================================================
   FIELD VISIBILITY
========================================================= */

function setFieldVisible(
  field,
  visible
) {

  if (!field) {

    return;

  }


  field.style.display =
    visible
      ? ""
      : "none";

}


/* =========================================================
   ROLE SCOPE OPTIONS
========================================================= */

function updateRoleScopeOptions() {

  const selectedRole =
    roleCode.value;


  roleScopeType.innerHTML =
    "";


  roleDivision.value =
    "";


  roleStation.innerHTML = `

    <option value="">
      Select Division First
    </option>

  `;


  roleStation.disabled =
    true;


  if (!selectedRole) {

    roleScopeType.innerHTML = `

      <option value="">
        Select Role First
      </option>

    `;


    roleScopeType.disabled =
      true;


    setFieldVisible(
      roleDivisionField,
      false
    );


    setFieldVisible(
      roleStationField,
      false
    );


    return;

  }


  roleScopeType.disabled =
    false;


  if (
    selectedRole ===
    "SYSTEM_ADMIN"
  ) {

    roleScopeType.innerHTML = `

      <option value="GLOBAL">
        Entire CTR System
      </option>

    `;


    roleScopeType.value =
      "GLOBAL";


    setFieldVisible(
      roleDivisionField,
      false
    );


    setFieldVisible(
      roleStationField,
      false
    );


    return;

  }


  if (
    STATION_ONLY_ROLES.includes(
      selectedRole
    )
  ) {

    roleScopeType.innerHTML = `

      <option value="STATION">
        Station
      </option>

    `;


    roleScopeType.value =
      "STATION";


    setFieldVisible(
      roleDivisionField,
      true
    );


    setFieldVisible(
      roleStationField,
      true
    );


    return;

  }


  if (
    OFFICER_SCOPE_ROLES.includes(
      selectedRole
    )
  ) {

    roleScopeType.innerHTML = `

      <option value="">
        Select Scope
      </option>

      <option value="DIVISION">
        Division
      </option>

      <option value="STATION">
        Station
      </option>

    `;


    setFieldVisible(
      roleDivisionField,
      false
    );


    setFieldVisible(
      roleStationField,
      false
    );

  }

}


/* =========================================================
   SCOPE FIELD DISPLAY
========================================================= */

function updateScopeFields() {

  const scope =
    roleScopeType.value;


  if (
    scope ===
    "GLOBAL"
  ) {

    setFieldVisible(
      roleDivisionField,
      false
    );


    setFieldVisible(
      roleStationField,
      false
    );


    roleDivision.value =
      "";


    return;

  }


  if (
    scope ===
    "DIVISION"
  ) {

    setFieldVisible(
      roleDivisionField,
      true
    );


    setFieldVisible(
      roleStationField,
      false
    );


    roleStation.innerHTML = `

      <option value="">
        Select Station
      </option>

    `;


    return;

  }


  if (
    scope ===
    "STATION"
  ) {

    setFieldVisible(
      roleDivisionField,
      true
    );


    setFieldVisible(
      roleStationField,
      true
    );


    populateStationDropdown();


    return;

  }


  setFieldVisible(
    roleDivisionField,
    false
  );


  setFieldVisible(
    roleStationField,
    false
  );

}


/* =========================================================
   CLEAR ROLE FORM
========================================================= */

function clearRoleForm() {

  roleUser.value =
    "";


  roleCode.value =
    "";


  roleDivision.value =
    "";


  roleStation.innerHTML = `

    <option value="">
      Select Division First
    </option>

  `;


  roleStation.disabled =
    true;


  updateRoleScopeOptions();

}


/* =========================================================
   ASSIGN ROLE - SECURE RPC
========================================================= */

async function assignRole() {

  const userId =
    roleUser.value;


  const selectedRole =
    roleCode.value;


  const scope =
    roleScopeType.value;


  if (!userId) {

    alert(
      "Please select a user."
    );

    return;

  }


  if (!selectedRole) {

    alert(
      "Please select a role."
    );

    return;

  }


  if (!scope) {

    alert(
      "Please select an access scope."
    );

    return;

  }


  let stationId =
    null;


  let divisionId =
    null;


  if (
    scope ===
    "GLOBAL"
  ) {

    if (
      selectedRole !==
      "SYSTEM_ADMIN"
    ) {

      alert(
        "Only System Administrator can have global access."
      );

      return;

    }

  }


  else if (
    scope ===
    "DIVISION"
  ) {

    if (
      !OFFICER_SCOPE_ROLES.includes(
        selectedRole
      )
    ) {

      alert(
        "This role cannot be assigned at Division level."
      );

      return;

    }


    divisionId =
      roleDivision.value;


    if (!divisionId) {

      alert(
        "Please select a Division."
      );

      return;

    }

  }


  else if (
    scope ===
    "STATION"
  ) {

    stationId =
      roleStation.value;


    if (!stationId) {

      alert(
        "Please select a Station."
      );

      return;

    }


    divisionId =
      null;

  }


  else {

    alert(
      "Invalid access scope."
    );

    return;

  }


  assignRoleButton.disabled =
    true;


  assignRoleButton.textContent =
    "Assigning...";


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .rpc(
          "admin_assign_user_role",
          {

            p_user_id:
              userId,

            p_role_code:
              selectedRole,

            p_station_id:
              stationId || null,

            p_division_id:
              divisionId || null

          }
        );


    if (error) {

      throw error;

    }


    console.log(
      "Role assignment result:",
      data
    );


    await loadRoles();


    clearRoleForm();


    renderUsers();


    alert(
      "Role assigned successfully."
    );

  }

  catch (error) {

    console.error(
      "Role assignment error:",
      error
    );


    alert(
      error.message ||
      "Role could not be assigned."
    );

  }

  finally {

    assignRoleButton.disabled =
      false;


    assignRoleButton.textContent =
      "Assign Role";

  }

}


/* =========================================================
   ROLE SCOPE LABEL
========================================================= */

function getRoleScopeLabel(role) {

  if (
    !role.station_id &&
    !role.division_id
  ) {

    return "Entire CTR System";

  }


  if (
    role.division_id
  ) {

    const division =
      findDivision(
        role.division_id
      );


    if (!division) {

      return "Unknown Division";

    }


    const code =
      division.division_code
        ? ` (${division.division_code})`
        : "";


    return (
      `${division.division_name}${code}`
    );

  }


  if (
    role.station_id
  ) {

    const station =
      findStation(
        role.station_id
      );


    if (!station) {

      return "Unknown Station";

    }


    const code =
      station.station_code
        ? ` (${station.station_code})`
        : "";


    const division =
      findDivision(
        station.division_id
      );


    const divisionName =
      division
        ? ` — ${division.division_name}`
        : "";


    return (
      `${station.station_name}${code}${divisionName}`
    );

  }


  return "Unknown Scope";

}


/* =========================================================
   DEACTIVATE ROLE - SECURE RPC
========================================================= */

async function deactivateRole(
  roleId
) {

  const selectedRole =
    roles.find(
      function (role) {

        return (
          String(role.id) ===
          String(roleId)
        );

      }
    );


  if (!selectedRole) {

    return;

  }


  const roleName =
    ROLE_LABELS[
      selectedRole.role_code
    ] ||
    selectedRole.role_code;


  const confirmed =
    confirm(

      `Deactivate ${roleName}?\n\nScope: ${getRoleScopeLabel(selectedRole)}`

    );


  if (!confirmed) {

    return;

  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .rpc(
          "admin_deactivate_user_role",
          {

            p_role_id:
              String(roleId)

          }
        );


    if (error) {

      throw error;

    }


    console.log(
      "Role deactivation result:",
      data
    );


    await loadRoles();


    renderUsers();


    alert(
      "Role deactivated successfully."
    );

  }

  catch (error) {

    console.error(
      "Role deactivation error:",
      error
    );


    alert(
      error.message ||
      "Role could not be deactivated."
    );

  }

}


/* =========================================================
   SELECT USER FOR ROLE
========================================================= */

function selectUserForRole(
  userId
) {

  roleUser.value =
    userId;


  roleAssignmentPanel.scrollIntoView({

    behavior:
      "smooth",

    block:
      "start"

  });

}


/* =========================================================
   RENDER USERS
========================================================= */

function renderUsers() {

  const searchTerm =
    userSearch
      .value
      .trim()
      .toLowerCase();


  const filteredUsers =
    users.filter(
      function (user) {

        const activeRoles =
          roles.filter(
            function (role) {

              return (
                role.user_id === user.id &&
                role.is_active === true
              );

            }
          );


        const roleText =
          activeRoles
            .map(
              function (role) {

                return (

                  (
                    ROLE_LABELS[
                      role.role_code
                    ] ||
                    role.role_code
                  ) +

                  " " +

                  getRoleScopeLabel(
                    role
                  )

                );

              }
            )
            .join(" ");


        const searchable =
          [

            user.full_name || "",

            user.employee_number || "",

            user.designation || "",

            user.phone || "",

            roleText

          ]
            .join(" ")
            .toLowerCase();


        return searchable.includes(
          searchTerm
        );

      }
    );


  userCount.textContent =
    `${filteredUsers.length} ${
      filteredUsers.length === 1
        ? "User"
        : "Users"
    }`;


  userList.innerHTML =
    "";


  if (
    filteredUsers.length ===
    0
  ) {

    usersEmptyState.classList.add(
      "show"
    );


    return;

  }


  usersEmptyState.classList.remove(
    "show"
  );


  filteredUsers.forEach(
    function (user) {

      const activeUserRoles =
        roles.filter(
          function (role) {

            return (
              role.user_id === user.id &&
              role.is_active === true
            );

          }
        );


      const card =
        document.createElement(
          "article"
        );


      card.className =
        "station-management-card";


      /* ---------------------------------------------------
         USER HEADER
      --------------------------------------------------- */

      const header =
        document.createElement(
          "div"
        );


      header.className =
        "station-card-top";


      const headerInfo =
        document.createElement(
          "div"
        );


      const label =
        document.createElement(
          "span"
        );


      label.textContent =
        "RAILWAY USER";


      const name =
        document.createElement(
          "h3"
        );


      name.textContent =
        getUserDisplayName(
          user
        );


      headerInfo.appendChild(
        label
      );


      headerInfo.appendChild(
        name
      );


      const status =
        document.createElement(
          "span"
        );


      status.className =
        "station-status-badge";


      status.textContent =
        user.is_active === false
          ? "INACTIVE"
          : "ACTIVE";


      header.appendChild(
        headerInfo
      );


      header.appendChild(
        status
      );


      card.appendChild(
        header
      );


      /* ---------------------------------------------------
         USER DETAILS
      --------------------------------------------------- */

      const details =
        document.createElement(
          "div"
        );


      details.className =
        "station-card-details";


      details.innerHTML = `

        <div>

          <span>
            Employee Number
          </span>

          <strong>
            ${escapeHtml(
              user.employee_number ||
              "-"
            )}
          </strong>

        </div>


        <div>

          <span>
            Designation
          </span>

          <strong>
            ${escapeHtml(
              user.designation ||
              "-"
            )}
          </strong>

        </div>


        <div>

          <span>
            Phone
          </span>

          <strong>
            ${escapeHtml(
              user.phone ||
              "-"
            )}
          </strong>

        </div>


        <div>

          <span>
            Active Roles
          </span>

          <strong>
            ${activeUserRoles.length}
          </strong>

        </div>

      `;


      card.appendChild(
        details
      );


      /* ---------------------------------------------------
         ROLE SECTION
      --------------------------------------------------- */

      const roleSection =
        document.createElement(
          "div"
        );


      roleSection.style.marginTop =
        "18px";


      const roleHeading =
        document.createElement(
          "strong"
        );


      roleHeading.textContent =
        "Assigned Roles";


      roleSection.appendChild(
        roleHeading
      );


      if (
        activeUserRoles.length ===
        0
      ) {

        const empty =
          document.createElement(
            "p"
          );


        empty.textContent =
          "No active CTR role assigned.";


        roleSection.appendChild(
          empty
        );

      }


      activeUserRoles.forEach(
        function (role) {

          const row =
            document.createElement(
              "div"
            );


          row.style.display =
            "flex";


          row.style.justifyContent =
            "space-between";


          row.style.alignItems =
            "center";


          row.style.gap =
            "12px";


          row.style.padding =
            "10px 0";


          row.style.borderBottom =
            "1px solid #e3e9f1";


          const info =
            document.createElement(
              "div"
            );


          const roleName =
            document.createElement(
              "strong"
            );


          roleName.textContent =
            ROLE_LABELS[
              role.role_code
            ] ||
            role.role_code;


          const scope =
            document.createElement(
              "div"
            );


          scope.style.fontSize =
            "13px";


          scope.style.marginTop =
            "3px";


          scope.textContent =
            getRoleScopeLabel(
              role
            );


          info.appendChild(
            roleName
          );


          info.appendChild(
            scope
          );


          const deactivateButton =
            document.createElement(
              "button"
            );


          deactivateButton.type =
            "button";


          deactivateButton.className =
            "remove-rack-btn";


          deactivateButton.textContent =
            "Deactivate Role";


          deactivateButton.dataset.roleId =
            role.id;


          row.appendChild(
            info
          );


          row.appendChild(
            deactivateButton
          );


          roleSection.appendChild(
            row
          );

        }
      );


      card.appendChild(
        roleSection
      );


      /* ---------------------------------------------------
         CARD ACTIONS
      --------------------------------------------------- */

      const actions =
        document.createElement(
          "div"
        );


      actions.className =
        "station-card-actions";


      const editProfileButton =
        document.createElement(
          "button"
        );


      editProfileButton.type =
        "button";


      editProfileButton.className =
        "secondary-action";


      editProfileButton.textContent =
        "Edit Profile";


      editProfileButton.dataset.editProfile =
        user.id;


      const assignButton =
        document.createElement(
          "button"
        );


      assignButton.type =
        "button";


      assignButton.className =
        "primary-action";


      assignButton.textContent =
        "Assign Role";


      assignButton.dataset.userId =
        user.id;


      actions.appendChild(
        editProfileButton
      );


      actions.appendChild(
        assignButton
      );


      card.appendChild(
        actions
      );


      userList.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   USER CARD EVENTS
========================================================= */

userList.addEventListener(
  "click",
  function (event) {

    const roleButton =
      event.target.closest(
        "[data-role-id]"
      );


    if (roleButton) {

      deactivateRole(
        roleButton.dataset.roleId
      );


      return;

    }


    const profileButton =
      event.target.closest(
        "[data-edit-profile]"
      );


    if (profileButton) {

      openProfileEditor(
        profileButton.dataset.editProfile
      );


      return;

    }


    const userButton =
      event.target.closest(
        "[data-user-id]"
      );


    if (userButton) {

      selectUserForRole(
        userButton.dataset.userId
      );

    }

  }
);


/* =========================================================
   EVENTS
========================================================= */

roleCode.addEventListener(
  "change",
  function () {

    updateRoleScopeOptions();

    updateScopeFields();

  }
);


roleScopeType.addEventListener(
  "change",
  updateScopeFields
);


roleDivision.addEventListener(
  "change",
  function () {

    if (
      roleScopeType.value ===
      "STATION"
    ) {

      populateStationDropdown();

    }

  }
);


clearRoleFormButton.addEventListener(
  "click",
  clearRoleForm
);


assignRoleButton.addEventListener(
  "click",
  assignRole
);


userSearch.addEventListener(
  "input",
  renderUsers
);


closeProfileEditButton.addEventListener(
  "click",
  closeProfileEditor
);


cancelProfileEditButton.addEventListener(
  "click",
  closeProfileEditor
);


saveProfileButton.addEventListener(
  "click",
  saveUserProfile
);


/* =========================================================
   INITIALISE
========================================================= */

async function initializeAdministration() {

  roleAssignmentPanel.classList.add(
    "open"
  );


  setFieldVisible(
    roleDivisionField,
    false
  );


  setFieldVisible(
    roleStationField,
    false
  );


  const authorized =
    await verifySystemAdmin();


  if (!authorized) {

    return;

  }


  try {

    await Promise.all([

      loadUsers(),

      loadDivisions(),

      loadStations(),

      loadRoles()

    ]);


    populateUserDropdown();


    populateDivisionDropdown();


    populateStationDropdown();


    updateRoleScopeOptions();


    renderUsers();


    console.log(
      "CTR Administration loaded successfully."
    );

  }

  catch (error) {

    console.error(
      "Administration load error:",
      error
    );


    alert(
      error.message ||
      "Administration data could not be loaded."
    );

  }

}


initializeAdministration();