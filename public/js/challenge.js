document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");

  const loginHint = document.getElementById("loginHint");
  const openCreateChallengeBtn = document.getElementById("openCreateChallengeBtn");

  const challengeList = document.getElementById("challengeList");
  const challengeError = document.getElementById("challengeError");

  const createChallengeForm = document.getElementById("createChallengeForm");
  const createDescription = document.getElementById("createDescription");
  const createPoints = document.getElementById("createPoints");
  const createChallengeMsg = document.getElementById("createChallengeMsg");
  const createChallengeSubmitBtn = document.getElementById("createChallengeSubmitBtn");

  const challengeModal = document.getElementById("challengeModal");
  const challengeModalTitle = document.getElementById("challengeModalTitle");
  const challengeModalCreator = document.getElementById("challengeModalCreator");
  const challengeModalPoints = document.getElementById("challengeModalPoints");
  const challengeModalDesc = document.getElementById("challengeModalDesc");
  const challengeModalMsg = document.getElementById("challengeModalMsg");

  const completeChallengeForm = document.getElementById("completeChallengeForm");
  const completeDetails = document.getElementById("completeDetails");
  const completeBtn = document.getElementById("completeBtn");

  const ownerActions = document.getElementById("ownerActions");
  const notOwnerNote = document.getElementById("notOwnerNote");
  const editChallengeForm = document.getElementById("editChallengeForm");
  const editDescription = document.getElementById("editDescription");
  const editPoints = document.getElementById("editPoints");
  const saveEditBtn = document.getElementById("saveEditBtn");
  const deleteChallengeBtn = document.getElementById("deleteChallengeBtn");

  let currentChallenge = null;

  function showMsg(el, type, text) {
    el.classList.remove("d-none", "alert-success", "alert-danger", "alert-warning", "alert-info");
    el.classList.add("alert-" + type);
    el.innerText = text;
  }

  function hideMsg(el) {
    el.classList.add("d-none");
    el.innerText = "";
    el.classList.remove("alert-success", "alert-danger", "alert-warning", "alert-info");
  }

  function parseJwt(tokenStr) {
    try {
      const base64Url = tokenStr.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  const payload = token ? parseJwt(token) : null;
  const userId = payload && payload.userId ? parseInt(payload.userId) : null;

  if (!token) {
    loginHint.classList.remove("d-none");
    openCreateChallengeBtn.disabled = true;
    openCreateChallengeBtn.classList.add("disabled");
  }

  function loadChallenges() {
    hideMsg(challengeError);
    challengeList.innerHTML = "";

    const callback = (status, data) => {
      if (status !== 200) {
        showMsg(challengeError, "danger", data.message || "Failed to load challenges.");
        return;
      }

      if (!data || data.length === 0) {
        challengeList.innerHTML = `<div class="col-12"><div class="text-muted">No challenges found.</div></div>`;
        return;
      }

      for (let i = 0; i < data.length; i++) {
        const c = data[i];

        const col = document.createElement("div");
        col.className = "col-sm-6 col-lg-4";

        const disabled = !token ? "disabled" : "";
        const disabledAttr = !token ? "disabled" : "";

        col.innerHTML = `
          <div class="card h-100">
            <div class="card-body d-flex flex-column">
              <div class="display-6 mb-2">🎯</div>
              <h5 class="card-title fw-bold mb-2">Challenge #${c.challenge_id}</h5>
              <p class="card-text text-muted mb-3" style="min-height: 48px;">${c.description}</p>
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="badge text-bg-primary">Points: ${c.points}</span>
                <span class="badge text-bg-secondary">Creator: ${c.creator_id}</span>
              </div>

              <button
                class="btn btn-outline-primary mt-auto"
                data-bs-toggle="modal"
                data-bs-target="#challengeModal"
                data-challenge-id="${c.challenge_id}"
              >
                View
              </button>
            </div>
          </div>
        `;

        challengeList.appendChild(col);
      }
    };

    fetchMethod(currentUrl + "/api/challenges", callback, "GET");
  }

  function setupModalForChallenge(c) {
    currentChallenge = c;

    hideMsg(challengeModalMsg);

    challengeModalTitle.innerText = "Challenge #" + c.challenge_id;
    challengeModalCreator.innerText = c.creator_id;
    challengeModalPoints.innerText = c.points;
    challengeModalDesc.innerText = c.description;

    // complete form
    completeDetails.value = "";
    completeBtn.disabled = !token;

    if (!token) {
      showMsg(challengeModalMsg, "warning", "Login required to complete challenges.");
    }

    // owner actions
    const isOwner = token && userId !== null && parseInt(c.creator_id) === userId;

    if (isOwner) {
      ownerActions.classList.remove("d-none");
      notOwnerNote.classList.add("d-none");

      editDescription.value = c.description;
      editPoints.value = c.points;

      saveEditBtn.disabled = false;
      deleteChallengeBtn.disabled = false;
    } else {
      ownerActions.classList.add("d-none");

      if (token) {
        notOwnerNote.classList.remove("d-none");
      } else {
        notOwnerNote.classList.add("d-none");
      }
    }
  }

  challengeModal.addEventListener("show.bs.modal", function (event) {
    const button = event.relatedTarget;
    const id = button.getAttribute("data-challenge-id");

    const callback = (status, data) => {
      if (status !== 200) {
        showMsg(challengeModalMsg, "danger", data.message || "Failed to load challenge.");
        return;
      }
      setupModalForChallenge(data);
    };

    fetchMethod(currentUrl + "/api/challenges/" + id, callback, "GET");
  });

  // Create challenge
  createChallengeForm.addEventListener("submit", function (e) {
    e.preventDefault();
    hideMsg(createChallengeMsg);

    if (!token) {
      showMsg(createChallengeMsg, "warning", "Login required to create challenges.");
      return;
    }

    const data = {
      description: createDescription.value,
      points: parseInt(createPoints.value)
    };

    createChallengeSubmitBtn.disabled = true;

    const callback = (status, resData) => {
      createChallengeSubmitBtn.disabled = false;

      if (status !== 201) {
        showMsg(createChallengeMsg, "danger", resData.message || "Failed to create challenge.");
        return;
      }

      showMsg(createChallengeMsg, "success", "Challenge created successfully!");
      createChallengeForm.reset();
      loadChallenges();
    };

    fetchMethod(currentUrl + "/api/challenges", callback, "POST", data, token);
  });

  // Complete challenge
  completeChallengeForm.addEventListener("submit", function (e) {
    e.preventDefault();
    hideMsg(challengeModalMsg);

    if (!token) {
      showMsg(challengeModalMsg, "warning", "Login required.");
      return;
    }

    if (!currentChallenge) return;

    const data = {
      details: completeDetails.value
    };

    completeBtn.disabled = true;

    const callback = (status, resData) => {
      completeBtn.disabled = false;

      if (status !== 201) {
        showMsg(challengeModalMsg, "danger", resData.message || resData.error || "Failed to complete challenge.");
        return;
      }

      showMsg(challengeModalMsg, "success", resData.message || "Challenge completed!");
      loadChallenges();
    };

    fetchMethod(
      currentUrl + "/api/completion/challenges/" + currentChallenge.challenge_id,
      callback,
      "POST",
      data,
      token
    );
  });

  // Edit challenge (owner)
  editChallengeForm.addEventListener("submit", function (e) {
    e.preventDefault();
    hideMsg(challengeModalMsg);

    if (!token) return;
    if (!currentChallenge) return;

    const data = {
      description: editDescription.value,
      points: parseInt(editPoints.value)
    };

    saveEditBtn.disabled = true;

    const callback = (status, resData) => {
      saveEditBtn.disabled = false;

      if (status !== 200) {
        showMsg(challengeModalMsg, "danger", resData.message || "Failed to update challenge.");
        return;
      }

      showMsg(challengeModalMsg, "success", "Challenge updated!");
      loadChallenges();
      // keep modal in sync
      setupModalForChallenge(resData);
    };

    fetchMethod(currentUrl + "/api/challenges/" + currentChallenge.challenge_id, callback, "PUT", data, token);
  });

  // Delete challenge (owner)
  deleteChallengeBtn.addEventListener("click", function () {
    hideMsg(challengeModalMsg);

    if (!token) return;
    if (!currentChallenge) return;

    const callback = (status, resData) => {
      if (status !== 204) {
        showMsg(challengeModalMsg, "danger", resData.message || "Failed to delete challenge.");
        return;
      }

      showMsg(challengeModalMsg, "success", "Challenge deleted!");
      loadChallenges();

      // close modal after short delay
      setTimeout(() => {
        const modalInstance = bootstrap.Modal.getInstance(challengeModal);
        if (modalInstance) modalInstance.hide();
      }, 600);
    };

    fetchMethod(currentUrl + "/api/challenges/" + currentChallenge.challenge_id, callback, "DELETE", null, token);
  });

  loadChallenges();
});
