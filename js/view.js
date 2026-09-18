(($) => {
    "use strict";

    const key = title + " Imports";

    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    $("head").append(`
        <style>
            body::before {
                background-image: url("/images/main/${category}_floor.png");
            }
        </style>
    `);

    /* ==========================================================
       HELPERS
    ========================================================== */

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getHashModel() {
        const hash = window.location.hash;

        if (!hash || hash.length < 2) {
            return "";
        }

        const raw = hash.substring(1);

        try {
            return decodeURIComponent(raw).trim();
        } catch (error) {
            return raw.trim();
        }
    }

    function getVehicleUrl(modelName) {
        /*
         * This creates the EXACT current page URL.
         *
         * Example:
         * https://luxury-autos.vercel.app/view/notused.html/#ocnetrongt18
         */
        return (
            window.location.origin +
            window.location.pathname +
            window.location.search +
            "#" +
            encodeURIComponent(modelName)
        );
    }

    function getLinkIcon() {
        return `
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.71 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3-3a5 5 0 0 0-7.07 7.07l1.71-1.71"></path>
            </svg>
        `;
    }

    /* ==========================================================
       FIND VEHICLE
    ========================================================== */

    function findVehicle(modelName) {
        const wanted = String(modelName || "")
            .trim()
            .toLowerCase();

        if (!wanted) {
            return $();
        }

        let result = $();

        $(".vehicle").each(function () {
            const current = String(
                $(this).attr("data-model") || ""
            )
                .trim()
                .toLowerCase();

            if (current === wanted) {
                result = $(this);
                return false;
            }
        });

        return result;
    }

    /* ==========================================================
       SCROLL TO HASH
    ========================================================== */

    function scrollToHashVehicle(behavior) {
        const modelName = getHashModel();

        if (!modelName) {
            $(".vehicle.hash-target").removeClass("hash-target");
            return false;
        }

        const vehicle = findVehicle(modelName);

        if (!vehicle.length) {
            return false;
        }

        $(".vehicle.hash-target").removeClass("hash-target");

        vehicle.addClass("hash-target");

        /*
         * Wait until browser has completed the layout.
         */
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                const element = vehicle[0];

                if (!element) {
                    return;
                }

                element.scrollIntoView({
                    behavior: behavior || "smooth",
                    block: "center",
                    inline: "nearest"
                });
            });
        });

        /*
         * Remove highlight later.
         */
        clearTimeout(window.__vehicleHashHighlightTimer);

        window.__vehicleHashHighlightTimer = setTimeout(() => {
            vehicle.removeClass("hash-target");
        }, 2500);

        return true;
    }

    /* ==========================================================
       UPDATE BROWSER URL
    ========================================================== */

    function updateVehicleUrl(modelName) {
        const encodedModel = encodeURIComponent(modelName);

        const newUrl =
            window.location.pathname +
            window.location.search +
            "#" +
            encodedModel;

        /*
         * pushState changes the address bar without reloading.
         */
        window.history.pushState(
            {
                vehicle: modelName
            },
            "",
            newUrl
        );

        return getVehicleUrl(modelName);
    }

    /* ==========================================================
       COPY TO CLIPBOARD
    ========================================================== */

    async function copyText(text) {
        /*
         * Modern Clipboard API.
         */
        if (
            navigator.clipboard &&
            typeof navigator.clipboard.writeText === "function"
        ) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (error) {
                /*
                 * Continue to fallback below.
                 */
            }
        }

        /*
         * Legacy fallback.
         * This is useful in embedded browsers / restricted contexts.
         */
        try {
            const textarea = document.createElement("textarea");

            textarea.value = text;

            textarea.setAttribute("readonly", "");
            textarea.style.position = "fixed";
            textarea.style.left = "-9999px";
            textarea.style.top = "0";
            textarea.style.opacity = "0";

            document.body.appendChild(textarea);

            textarea.focus();
            textarea.select();
            textarea.setSelectionRange(
                0,
                textarea.value.length
            );

            const copied = document.execCommand("copy");

            textarea.remove();

            return copied;
        } catch (error) {
            return false;
        }
    }

    /* ==========================================================
       COPY UI
    ========================================================== */

    function showCopied(link, copied) {
        link.removeClass("copied");

        if (!copied) {
            link.attr("title", "Copy failed");
            return;
        }

        link.addClass("copied");
        link.attr("title", "Link copied!");

        clearTimeout(link.data("copyTimer"));

        const timer = setTimeout(() => {
            link.removeClass("copied");
            link.attr("title", "Copy link");
        }, 1600);

        link.data("copyTimer", timer);
    }

    /* ==========================================================
       RENDER VEHICLE
    ========================================================== */

    function renderVehicle(index, count, vehicle) {
        let mask =
            index % 2 === 0
                ? "0 0, calc(100% - 80px) 0, 100% 80px, 100% calc(100% - 80px), calc(100% - 80px) 100%, 0 100%"
                : "0 80px, 80px 0, 100% 0, 100% 100%, 80px 100%, 0 calc(100% - 80px)";

        if (index === 0) {
            mask =
                "0 0, 100% 0, 100% calc(100% - 80px), calc(100% - 80px) 100%, 0 100%";
        } else if (index === count - 1) {
            mask =
                index % 2 === 0
                    ? "0 0, calc(100% - 80px) 0, 100% 80px, 100% 100%, 0 100%"
                    : "0 80px, 80px 0, 100% 0, 100% 100%, 0 100%";
        }

        const modelName = String(
            vehicle.modelName ?? ""
        ).trim();

        const label = String(
            vehicle.label ?? ""
        );

        const safeModel = escapeHtml(modelName);
        const safeLabel = escapeHtml(label);

        const vehicleUrl = getVehicleUrl(modelName);

        const el = $(`
            <div
                class="vehicle ${index % 2 === 0 ? "invert" : ""}"
                data-model="${safeModel}"
            >

                <div class="details">

                    <div class="inner">

                        <div class="vehicle-name">

                            <span>${safeLabel}</span>

                            <a
                                class="vehicle-link"
                                href="#${encodeURIComponent(modelName)}"
                                data-model="${safeModel}"
                                title="Copy link"
                                aria-label="Copy link to ${safeLabel}"
                            >
                                ${getLinkIcon()}
                            </a>

                        </div>

                        <small>
                            ${formatter.format(vehicle.price)}
                        </small>

                        <pre>${safeModel}</pre>

                    </div>

                    <div class="colors">

                        <div
                            class="color"
                            data-color="mb"
                            title="Matte Black"
                        ></div>

                        <div
                            class="color"
                            data-color="mw"
                            title="Matte White"
                        ></div>

                        <div
                            class="color"
                            data-color="r"
                            title="Red"
                        ></div>

                        <div
                            class="color"
                            data-color="g"
                            title="Green"
                        ></div>

                        <div
                            class="color"
                            data-color="b"
                            title="Blue"
                        ></div>

                    </div>

                </div>

                <div
                    class="image"
                    style="clip-path: polygon(${mask})"
                >
                    <img
                        alt="${safeLabel}"
                        src="/images/${category}/${encodeURIComponent(modelName)}.png"
                        loading="lazy"
                    />
                </div>

            </div>
        `);

        el.attr("data-model", modelName);

        return el;
    }

    /* ==========================================================
       LOAD VEHICLES
    ========================================================== */

    $.get(
        "/json?_=" + Date.now(),
        (data) => {
            const vehicles = Array.isArray(data[key])
                ? data[key]
                : [];

            vehicles.sort((a, b) => {
                return String(a.label || "").localeCompare(
                    String(b.label || "")
                );
            });

            $.each(vehicles, (index, vehicle) => {
                $("#vehicles").append(
                    renderVehicle(
                        index,
                        vehicles.length,
                        vehicle
                    )
                );
            });

            $("#page").append(`
                <p id="footer">
                    &copy; Luxury Autos By FouL Gaming
                </p>
            `);

            /*
             * IMPORTANT:
             * Hash scrolling happens ONLY after vehicles exist.
             */
            if (getHashModel()) {
                setTimeout(() => {
                    scrollToHashVehicle("smooth");
                }, 100);
            }

            loadServerRotation();
        }
    );

    /* ==========================================================
       LINK ICON CLICK
    ========================================================== */

    $(document).on(
        "click",
        ".vehicle-link",
        async function (event) {
            event.preventDefault();
            event.stopPropagation();

            const link = $(this);

            const modelName = String(
                link.attr("data-model") || ""
            ).trim();

            if (!modelName) {
                return;
            }

            /*
             * 1. Update the browser address bar.
             */
            const fullUrl = updateVehicleUrl(modelName);

            /*
             * 2. Copy the FULL URL.
             */
            const copied = await copyText(fullUrl);

            /*
             * 3. Show feedback.
             */
            showCopied(link, copied);

            /*
             * 4. Scroll to the vehicle.
             */
            scrollToHashVehicle("smooth");
        }
    );

    /* ==========================================================
       HASH CHANGED
    ========================================================== */

    $(window).on("hashchange", () => {
        if (getHashModel()) {
            scrollToHashVehicle("smooth");
        }
    });

    /* ==========================================================
       BACK / FORWARD
    ========================================================== */

    window.addEventListener("popstate", () => {
        if (getHashModel()) {
            scrollToHashVehicle("smooth");
        }
    });

    /* ==========================================================
       COLORS
    ========================================================== */

    $(document).on("click", ".color", function (event) {
        event.preventDefault();
        event.stopPropagation();

        const target = $(this);

        const vehicle = target.closest(".vehicle");

        const image = $(".image img", vehicle);

        const color = target.data("color");

        const original = image.data("original");

        if (target.hasClass("active")) {
            target.removeClass("active");

            if (original) {
                image.attr("src", original);
            }

            return;
        }

        let src = original || image.attr("src");

        if (!original) {
            image.data("original", src);
        }

        src = src.replace(
            /\.png$/i,
            `_${color}.png`
        );

        image.attr("src", src);

        $(".color.active", vehicle)
            .removeClass("active");

        target.addClass("active");
    });

    /* ==========================================================
       SERVER ROTATION
    ========================================================== */

    function loadServerRotation() {
        if (!server) {
            return;
        }

        $("body").addClass("loading-rotation");

        $.get(
            "/rotation/" + encodeURIComponent(server),
            (data) => {
                $("body").removeClass(
                    "loading-rotation"
                );

                if (
                    !data ||
                    !Array.isArray(data.rotation)
                ) {
                    return;
                }

                $(".vehicle")
                    .addClass("not-in-rotation");

                for (
                    const modelName of data.rotation
                ) {
                    const vehicle =
                        findVehicle(modelName);

                    if (!vehicle.length) {
                        continue;
                    }

                    vehicle
                        .addClass("in-rotation")
                        .removeClass(
                            "not-in-rotation"
                        );
                }
            }
        ).fail(() => {
            $("body").removeClass(
                "loading-rotation"
            );
        });
    }

    /* ==========================================================
       ESCAPE
    ========================================================== */

    $(document).on("keyup", (event) => {
        if (event.key === "Escape") {
            window.parent.postMessage(
                "close",
                "*"
            );
        }
    });
})(jQuery);