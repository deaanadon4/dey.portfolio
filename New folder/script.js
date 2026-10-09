
document.addEventListener("DOMContentLoaded", function () {
    // Kunin ang mga tabs at panels
    const tabs = document.querySelectorAll(".tab");
    const panels = document.querySelectorAll(".panel");

    // Image viewer
    const viewer = document.createElement("div");
    viewer.id = "image-viewer";

    viewer.style.cssText = `
        display: none;
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: rgba(0, 0, 0, 0.92);
        justify-content: center;
        align-items: center;
        padding: 20px;
        box-sizing: border-box;
        cursor: zoom-out;
    `;

    const enlargedImage = document.createElement("img");
    enlargedImage.style.cssText = `
        max-width: 95%;
        max-height: 90%;
        object-fit: contain;
        display: block;
        cursor: default;
    `;

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "×";
    closeButton.setAttribute("aria-label", "Close image");

    closeButton.style.cssText = `
        position: absolute;
        top: 15px;
        right: 25px;
        color: white;
        background: transparent;
        border: none;
        font-size: 42px;
        cursor: pointer;
    `;

    viewer.appendChild(enlargedImage);
    viewer.appendChild(closeButton);
    document.body.appendChild(viewer);

    function closeViewer() {
        viewer.style.display = "none";
        enlargedImage.removeAttribute("src");
    }

    closeButton.addEventListener("click", function (event) {
        event.stopPropagation();
        closeViewer();
    });

    viewer.addEventListener("click", function (event) {
        if (event.target === viewer) {
            closeViewer();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeViewer();
        }
    });

    // Gawing clickable ang mga image na nasa HTML na
    function makeImagesClickable() {
        const images = document.querySelectorAll(
            ".panel img, .board img, .cards-grid img"
        );

        images.forEach(function (img) {
            if (img.dataset.viewerReady === "true") return;

            img.dataset.viewerReady = "true";
            img.style.cursor = "zoom-in";

            img.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();

                const imageSource =
                    img.currentSrc || img.src || img.getAttribute("src");

                if (!imageSource) return;

                enlargedImage.src = imageSource;
                viewer.style.display = "flex";
            });
        });
    }

    // Tab switching
    tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            const target = tab.dataset.tab;

            tabs.forEach(function (item) {
                item.classList.remove("active");
            });

            panels.forEach(function (panel) {
                panel.classList.remove("active");
            });

            tab.classList.add("active");

            const targetPanel = document.getElementById(target);

            if (targetPanel) {
                targetPanel.classList.add("active");
            }

            makeImagesClickable();
        });
    });

    // Huwag ipakita ang delete buttons o add/upload controls
    document.querySelectorAll(
        ".delete-btn, .add-btn, #add-quiz, #add-laboratory, #add-exam, #add-activities"
    ).forEach(function (button) {
        button.style.display = "none";
    });

    // I-disable ang dating modal kung mayroon sa HTML
    const modal = document.getElementById("modal-overlay");
    if (modal) {
        modal.style.display = "none";
    }

    // I-activate ang images na nasa page na
    makeImagesClickable();
});

