(function () {
  "use strict";

  var data = {
    quiz: [],
    laboratory: [],
    exam: [],
    activities: []
  };

  var nextId = 1;
  var rotations = [-3, 2, -1.5, 1, -2.5, 3, -1, 2];
  var currentModalSection = null;
  var pendingImageDataUrl = null;

  var sectionLabels = {
    quiz: "quiz",
    laboratory: "lab activity",
    exam: "exam",
    activities: "activity"
  };

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : str;
    return div.innerHTML;
  }

  // ---------- Tabs ----------
  var tabs = document.querySelectorAll(".tab");
  var panels = document.querySelectorAll(".panel");

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });

      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      var target = tab.getAttribute("data-tab");

      panels.forEach(function (panel) {
        panel.classList.toggle("active", panel.id === target);
      });
    });
  });

  // ---------- Profile ----------
  var profileDisplay = document.getElementById("profile-display");
  var profileForm = document.getElementById("profile-form");
  var editBtn = document.getElementById("edit-profile-btn");
  var cancelProfileBtn = document.getElementById("cancel-profile-btn");
  var inputName = document.getElementById("input-name");
  var inputDesc = document.getElementById("input-desc");
  var profileNameEl = document.getElementById("profile-name");
  var profileDescEl = document.getElementById("profile-desc");
  var heroName = document.getElementById("hero-name");
  var heroDesc = document.getElementById("hero-desc");

  if (editBtn) {
    editBtn.addEventListener("click", function () {
      inputName.value = profileNameEl.textContent;
      inputDesc.value = profileDescEl.textContent;
      profileDisplay.classList.add("hidden");
      profileForm.classList.add("active");
      inputName.focus();
    });
  }

  cancelProfileBtn.addEventListener("click", function () {
    profileForm.classList.remove("active");
    profileDisplay.classList.remove("hidden");
  });

  profileForm.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = inputName.value.trim() || "Your Name";
    var desc = inputDesc.value.trim();

    profileNameEl.textContent = name;
    profileDescEl.textContent = desc;
    heroName.textContent = name;
    heroDesc.textContent = desc ||
      "Write a short introduction about yourself in the Profile tab.";

    profileForm.classList.remove("active");
    profileDisplay.classList.remove("hidden");
  });

  // ---------- Image viewer ----------
  var viewer = document.createElement("div");

  viewer.style.cssText =
    "display:none;position:fixed;inset:0;z-index:1000;" +
    "background:rgba(0,0,0,.8);padding:20px;" +
    "align-items:center;justify-content:center;overflow:auto;";

  var viewerBox = document.createElement("div");

  viewerBox.style.cssText =
    "background:#FBF8EF;color:#2B3A55;padding:20px;" +
    "width:100%;max-width:850px;max-height:90vh;" +
    "overflow:auto;border:8px solid #4A3728;border-radius:6px;";

  var closeViewer = document.createElement("button");
  closeViewer.textContent = "✕ Close";
  closeViewer.type = "button";

  closeViewer.style.cssText =
    "display:block;margin:0 0 15px auto;padding:8px 16px;" +
    "cursor:pointer;border:1px solid #c7bfa8;border-radius:4px;" +
    "background:#FBF8EF;color:#2B3A55;";

  var viewerTitle = document.createElement("h2");
  viewerTitle.style.cssText =
    "font-family:'Caveat',cursive;font-size:32px;";

  var viewerImage = document.createElement("img");
  viewerImage.alt = "Selected portfolio image";

  viewerImage.style.cssText =
    "display:block;width:100%;max-height:70vh;" +
    "object-fit:contain;margin:auto;";

  var viewerNotes = document.createElement("p");
  viewerNotes.style.cssText =
    "white-space:pre-wrap;overflow-wrap:anywhere;";

  viewerBox.appendChild(closeViewer);
  viewerBox.appendChild(viewerTitle);
  viewerBox.appendChild(viewerImage);
  viewerBox.appendChild(viewerNotes);
  viewer.appendChild(viewerBox);
  document.body.appendChild(viewer);

  function openViewer(item) {
    viewerTitle.textContent = item.title;
    viewerImage.src = item.image;
    viewerNotes.textContent = item.notes || "";

    viewer.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  function closeImageViewer() {
    viewer.style.display = "none";
    viewerImage.removeAttribute("src");
    document.body.style.overflow = "";
  }

  closeViewer.addEventListener("click", closeImageViewer);

  viewer.addEventListener("click", function (e) {
    if (e.target === viewer) closeImageViewer();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeImageViewer();
      closeModal();
    }
  });

  // ---------- Render picture boxes ----------
  function renderSection(section) {
    var grid = document.getElementById(section + "-cards");
    var items = data[section];

    if (!items.length) {
      grid.innerHTML =
        '<p class="empty-note">No pictures yet. Click "' +
        escapeHtml(sectionLabels[section]) +
        '" above to add a picture.</p>';
      return;
    }

    grid.innerHTML = items.map(function (item, index) {
      var rot = rotations[index % rotations.length];

      return (
        '<article class="card" data-id="' + item.id + '"' +
        ' tabindex="0" role="button" aria-label="View ' +
        escapeHtml(item.title) + '"' +
        ' style="--rot:' + rot + 'deg;cursor:pointer">' +
        '<span class="tape"></span>' +
        '<img class="card-img" src="' + item.image +
        '" alt="' + escapeHtml(item.title) + '">' +
        '<h3>' + escapeHtml(item.title) + '</h3>' +
        '</article>'
      );
    }).join("");
  }

  ["quiz", "laboratory", "exam", "activities"].forEach(function (section) {
    var grid = document.getElementById(section + "-cards");

    grid.addEventListener("click", function (e) {
      var card = e.target.closest(".card");
      if (!card) return;

      var id = Number(card.getAttribute("data-id"));

      var item = data[section].find(function (entry) {
        return entry.id === id;
      });

      if (item) openViewer(item);
    });

    grid.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;

      var card = e.target.closest(".card");
      if (!card) return;

      e.preventDefault();

      var id = Number(card.getAttribute("data-id"));

      var item = data[section].find(function (entry) {
        return entry.id === id;
      });

      if (item) openViewer(item);
    });

    renderSection(section);
  });

  // ---------- Add picture modal ----------
  var overlay = document.getElementById("modal-overlay");
  var modalTitle = document.getElementById("modal-title");
  var cardForm = document.getElementById("card-form");
  var cardTitleInput = document.getElementById("card-title");
  var cardNotesInput = document.getElementById("card-notes");
  var cardImageInput = document.getElementById("card-image");
  var imagePreview = document.getElementById("image-preview");
  var cancelCardBtn = document.getElementById("cancel-card-btn");

  document.querySelectorAll(".add-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      currentModalSection = btn.getAttribute("data-section");

      modalTitle.textContent =
        "Add " + sectionLabels[currentModalSection];

      cardForm.reset();
      pendingImageDataUrl = null;
      imagePreview.style.display = "none";

      overlay.classList.add("active");
      cardTitleInput.focus();
    });
  });

  function closeModal() {
    overlay.classList.remove("active");
    currentModalSection = null;
    pendingImageDataUrl = null;
  }

  cancelCardBtn.addEventListener("click", closeModal);

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });

  cardImageInput.addEventListener("change", function () {
    var file = cardImageInput.files[0];

    if (!file) {
      pendingImageDataUrl = null;
      imagePreview.style.display = "none";
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      cardImageInput.value = "";
      pendingImageDataUrl = null;
      imagePreview.style.display = "none";
      return;
    }

    var reader = new FileReader();

    reader.onload = function (e) {
      pendingImageDataUrl = e.target.result;
      imagePreview.src = pendingImageDataUrl;
      imagePreview.style.display = "block";
    };

    reader.readAsDataURL(file);
  });

  cardForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!currentModalSection) return;

    var title = cardTitleInput.value.trim();
    if (!title) return;

    if (!pendingImageDataUrl) {
      alert("Please upload a picture for your portfolio box.");
      return;
    }

    data[currentModalSection].push({
      id: nextId++,
      title: title,
      notes: cardNotesInput.value.trim(),
      image: pendingImageDataUrl
    });

    renderSection(currentModalSection);
    closeModal();
  });

})();
