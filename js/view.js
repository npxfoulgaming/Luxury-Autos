(($) => {
    const key = title + " Imports";

    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    $("head").append(
        `<style>
            body::before {
                background-image: url(/images/main/${category}_floor.png);
            }
        </style>`
    );

    /*
    |--------------------------------------------------------------------------
    | Get hash model
    |--------------------------------------------------------------------------
    */

    function getHashModel() {
        const hash = window.location.hash;

        if (!hash || hash.length <= 1) {
            return null;
        }

        try {
            return decodeURIComponent(hash.substring(1)).trim();
        } catch (error) {
            return hash.substring(1).trim();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Escape HTML
    |--------------------------------------------------------------------------
    */

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /*
    |--------------------------------------------------------------------------
    | Escape attribute values
    |--------------------------------------------------------------------------
    */

    function escapeAttribute(value) {
        return escapeHtml(value);
    }

    /*
    |--------------------------------------------------------------------------
    | Create vehicle link URL
    |--------------------------------------------------------------------------
    */

    function getVehicleUrl(modelName) {
        const url = new URL(window.location.href);

        url.hash = modelName;

        return url.toString();
    }

    /*
    |--------------------------------------------------------------------------
    | Link SVG
    |--------------------------------------------------------------------------
    */

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
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
        `;
    }

    /*
    |--------------------------------------------------------------------------
    | Render vehicle
    |--------------------------------------------------------------------------
    */

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

        const modelName = String(vehicle.modelName ?? "");
        const label = String(vehicle.label ?? "");

        const safeModel = escapeAttribute(modelName);
        const safeLabel = escapeHtml(label);

        const el = $(`
            <div class="vehicle ${index % 2 === 0 ? "invert" : ""}"
                 data-model="${safeModel}">

                <div class="details">

                    <div class="inner">

                        <div class="vehicle-name">
                            <span>${safeLabel}</span>

                            <a
                                class="vehicle-link"
                                href="#${encodeURIComponent(modelName)}"
                                data-model="${safeModel}"
                                title="Copy vehicle link"
                                aria-label="Copy link to ${safeLabel}"
                            >
                                ${getLinkIcon()}
                            </a>
                        </div>

                        <small>${formatter.format(vehicle.price)}</small>

                        <pre>${escapeHtml(modelName)}</pre>

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

    /*
    |--------------------------------------------------------------------------
    | Find vehicle by model
    |--------------------------------------------------------------------------
    */

    function findVehicle(modelName) {
        if (!modelName) {
            return $();
        }

        let found = $();

        $(".vehicle").each(function () {
            const currentModel = String(
                $(this).attr("data-model") || ""
            );

            if (
                currentModel.toLowerCase() ===
                String(modelName).toLowerCase()
            ) {
                found = $(this);
                return false;
            }
        });

        return found;
    }

    /*
    |--------------------------------------------------------------------------
    | Scroll to vehicle from URL hash
    |--------------------------------------------------------------------------
    */

    function scrollToHashVehicle(behavior = "smooth") {
        const modelName = getHashModel();

        if (!modelName) {
            return false;
        }

        const vehicle = findVehicle(modelName);

        if (!vehicle.length) {
            return false;
        }

        $(".vehicle.direct-link-target").removeClass(
            "direct-link-target"
        );

        vehicle.addClass("direct-link-target");

        const element = vehicle[0];

        /*
         * Use a small delay because the list is dynamically inserted.
         * This also gives the browser time to calculate the layout.
         */
        setTimeout(() => {
            element.scrollIntoView({
                behavior,
                block: "center",
                inline: "nearest"
            });

            /*
             * Keep the highlight for a short time.
             */
            setTimeout(() => {
                vehicle.removeClass("direct-link-target");
            }, 2200);
        }, 80);

        return true;
    }

    /*
    |--------------------------------------------------------------------------
    | Load vehicles
    |--------------------------------------------------------------------------
    */

    $.get("/json?_=" + Date.now(), (data) => {
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

        $("#page").append(
            `<p id="footer">&copy; Luxury Autos By FouL Gaming</p>`
        );

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT:
        | Scroll after dynamic vehicle rendering.
        |--------------------------------------------------------------------------
        */

        if (getHashModel()) {
            scrollToHashVehicle("smooth");
        }

        loadServerRotation();
    });

    /*
    |--------------------------------------------------------------------------
    | Color selector
    |--------------------------------------------------------------------------
    */

    $(document).on("click", ".color", (e) => {
        const target = $(e.target);
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

        src = src.replace(/\.png$/i, `_${color}.png`);

        image.attr("src", src);

        $(".color.active", vehicle).removeClass("active");

        target.addClass("active");
    });

    /*
    |--------------------------------------------------------------------------
    | Vehicle direct-link icon
    |--------------------------------------------------------------------------
    |
    | Clicking:
    |   1. Updates the URL hash
    |   2. Scrolls to the vehicle
    |   3. Copies the complete URL when possible
    |
    */

    $(document).on("click", ".vehicle-link", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const link = $(e.currentTarget);
        const modelName = String(
            link.attr("data-model") || ""
        ).trim();

        if (!modelName) {
            return;
        }

        const url = getVehicleUrl(modelName);

        /*
         * Update browser URL without reloading the page.
         */
        history.pushState(
            {
                vehicle: modelName
            },
            "",
            `#${encodeURIComponent(modelName)}`
        );

        /*
         * Copy URL.
         */
        try {
            if (
                navigator.clipboard &&
                window.isSecureContext
            ) {
                await navigator.clipboard.writeText(url);

                link.attr("title", "Link copied!");

                setTimeout(() => {
                    link.attr("title", "Copy vehicle link");
                }, 1400);
            }
        } catch (error) {
            /*
             * Clipboard can be blocked by browser permissions.
             * The URL has still been updated, so the link works.
             */
        }

        scrollToHashVehicle("smooth");
    });

    /*
    |--------------------------------------------------------------------------
    | Browser back / forward
    |--------------------------------------------------------------------------
    */

    $(window).on("hashchange", () => {
        if (getHashModel()) {
            scrollToHashVehicle("smooth");
        }
    });

    /*
    |--------------------------------------------------------------------------
    | Server rotation
    |--------------------------------------------------------------------------
    */

    function loadServerRotation() {
        if (!server) {
            return;
        }

        $("body").addClass("loading-rotation");

        $.get("/rotation/" + server, (data) => {
            $("body").removeClass("loading-rotation");

            if (!data || !data.rotation) {
                return;
            }

            $(".vehicle").addClass("not-in-rotation");

            const rotation = data.rotation;

            for (const modelName of rotation) {
                const vehicle = findVehicle(modelName);

                if (!vehicle.length) {
                    continue;
                }

                vehicle.addClass("in-rotation");
                vehicle.removeClass("not-in-rotation");
            }
        }).fail(() => {
            $("body").removeClass("loading-rotation");
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Escape
    |--------------------------------------------------------------------------
    */

    $(document).on("keyup", (e) => {
        if (e.key === "Escape") {
            window.parent.postMessage("close", "*");
        }
    });
})(jQuery);