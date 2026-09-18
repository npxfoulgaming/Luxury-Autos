(($) => {
    "use strict";

    /*
     * ============================================================
     * Luxury Autos vehicle deep-link system
     *
     * Example:
     * https://luxury-autos.vercel.app/view/heroic.html/#xkgt
     *
     * No changes to view/*.html are required.
     * ============================================================
     */

    const pageTitle = typeof title !== "undefined" ? title : "";
    const vehicleCategory =
        typeof category !== "undefined" ? category : "";
    const serverName =
        typeof server !== "undefined" ? server : "";

    const key = pageTitle + " Imports";

    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    /*
     * ------------------------------------------------------------
     * Background
     * ------------------------------------------------------------
     */
    if (vehicleCategory) {
        $("head").append(
            `<style>
                body::before {
                    background-image: url("/images/main/${vehicleCategory}_floor.png");
                }
            </style>`
        );
    }

    /*
     * ------------------------------------------------------------
     * Find the actual vehicle container.
     *
     * Some older generated pages can contain duplicate #vehicles.
     * We choose the container which already contains vehicles.
     * Otherwise use the first one.
     * ------------------------------------------------------------
     */
    function getVehiclesContainer() {
        const containers = Array.from(
            document.querySelectorAll("#vehicles")
        );

        if (!containers.length) {
            return null;
        }

        const existing = containers.find(
            (container) =>
                container.querySelector(".vehicle")
        );

        return existing || containers[0];
    }

    /*
     * ------------------------------------------------------------
     * Get vehicle model
     * ------------------------------------------------------------
     */
    function getVehicleModel(vehicle) {
        if (!vehicle) {
            return "";
        }

        return (
            vehicle.getAttribute("data-model") ||
            vehicle.dataset.model ||
            ""
        ).trim();
    }

    /*
     * ------------------------------------------------------------
     * Get the model from the browser URL.
     *
     * Supports:
     * #xkgt
     * #rmodsuprapandem
     * #some%20model
     * ------------------------------------------------------------
     */
    function getHashModel() {
        const rawHash = window.location.hash;

        if (!rawHash || rawHash.length <= 1) {
            return "";
        }

        try {
            return decodeURIComponent(
                rawHash.substring(1)
            ).trim();
        } catch {
            return rawHash.substring(1).trim();
        }
    }

    /*
     * ------------------------------------------------------------
     * Build the exact shareable URL.
     *
     * Example:
     * https://luxury-autos.vercel.app/view/heroic.html/#xkgt
     * ------------------------------------------------------------
     */
    function buildVehicleUrl(model) {
        const url = new URL(
            window.location.href
        );

        url.hash = model;

        return url.href;
    }

    /*
     * ------------------------------------------------------------
     * Find a vehicle safely.
     *
     * Do NOT use:
     *
     * document.querySelector(`[data-model="${model}"]`)
     *
     * because a model can contain characters which break a CSS
     * selector.
     * ------------------------------------------------------------
     */
    function findVehicle(model) {
        if (!model) {
            return null;
        }

        const container = getVehiclesContainer();

        if (!container) {
            return null;
        }

        const wanted = model.toLowerCase();

        const vehicles = container.querySelectorAll(
            ".vehicle"
        );

        for (const vehicle of vehicles) {
            const current =
                getVehicleModel(vehicle).toLowerCase();

            if (current === wanted) {
                return vehicle;
            }
        }

        return null;
    }

    /*
     * ------------------------------------------------------------
     * Copy text.
     *
     * Clipboard API first.
     * execCommand fallback for embedded browsers / older browsers.
     * ------------------------------------------------------------
     */
    async function copyToClipboard(text) {
        try {
            if (
                navigator.clipboard &&
                typeof navigator.clipboard.writeText === "function"
            ) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch (error) {
            console.warn(
                "Clipboard API failed, using fallback.",
                error
            );
        }

        try {
            const textarea =
                document.createElement("textarea");

            textarea.value = text;

            textarea.setAttribute(
                "readonly",
                ""
            );

            textarea.style.position = "fixed";
            textarea.style.top = "0";
            textarea.style.left = "-9999px";
            textarea.style.opacity = "0";

            document.body.appendChild(textarea);

            textarea.focus();
            textarea.select();

            textarea.setSelectionRange(
                0,
                textarea.value.length
            );

            const successful =
                document.execCommand("copy");

            textarea.remove();

            return successful;
        } catch (error) {
            console.error(
                "Unable to copy vehicle link:",
                error
            );

            return false;
        }
    }

    /*
     * ------------------------------------------------------------
     * Link icon
     * ------------------------------------------------------------
     */
    function createLinkIcon(model) {
        const link =
            document.createElement("a");

        link.className = "vehicle-link";

        link.href =
            buildVehicleUrl(model);

        link.setAttribute(
            "aria-label",
            `Copy link to ${model}`
        );

        link.setAttribute(
            "title",
            "Copy link"
        );

        link.dataset.model = model;

        link.innerHTML = `
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
            <span class="link-tooltip">Copy link</span>
        `;

        return link;
    }

    /*
     * ------------------------------------------------------------
     * Add / repair link icon on ONE vehicle.
     *
     * Works with:
     * - existing static HTML
     * - dynamically created vehicles
     * ------------------------------------------------------------
     */
    function decorateVehicle(vehicle) {
        if (!vehicle) {
            return;
        }

        const model =
            getVehicleModel(vehicle);

        if (!model) {
            return;
        }

        /*
         * Give the vehicle its actual HTML id.
         *
         * This is also useful as a native browser fragment target.
         */
        vehicle.id = model;

        const inner =
            vehicle.querySelector(
                ".details .inner"
            );

        if (!inner) {
            return;
        }

        const nameSpan =
            inner.querySelector(":scope > span");

        if (!nameSpan) {
            return;
        }

        /*
         * If already decorated, only make sure the URL is correct.
         */
        let wrapper =
            inner.querySelector(
                ":scope > .vehicle-name"
            );

        if (!wrapper) {
            wrapper =
                document.createElement("div");

            wrapper.className =
                "vehicle-name";

            inner.insertBefore(
                wrapper,
                nameSpan
            );

            wrapper.appendChild(
                nameSpan
            );
        }

        /*
         * Don't create duplicate icons.
         */
        let link =
            wrapper.querySelector(
                ".vehicle-link"
            );

        if (!link) {
            link =
                createLinkIcon(model);

            wrapper.appendChild(link);
        } else {
            link.href =
                buildVehicleUrl(model);

            link.dataset.model =
                model;
        }
    }

    /*
     * ------------------------------------------------------------
     * Decorate every currently existing vehicle.
     * ------------------------------------------------------------
     */
    function decorateAllVehicles() {
        const container =
            getVehiclesContainer();

        if (!container) {
            return;
        }

        const vehicles =
            container.querySelectorAll(
                ".vehicle"
            );

        vehicles.forEach(
            decorateVehicle
        );
    }

    /*
     * ------------------------------------------------------------
     * Scroll directly to vehicle.
     *
     * We calculate the scroll position manually instead of relying
     * only on scrollIntoView because the original design uses
     * negative margins between vehicle sections.
     * ------------------------------------------------------------
     */
    function scrollToVehicle(
        model,
        smooth = true
    ) {
        const vehicle =
            findVehicle(model);

        if (!vehicle) {
            return false;
        }

        /*
         * Remove previous highlight.
         */
        document
            .querySelectorAll(
                ".vehicle.hash-target"
            )
            .forEach((element) => {
                element.classList.remove(
                    "hash-target"
                );
            });

        vehicle.classList.add(
            "hash-target"
        );

        const rect =
            vehicle.getBoundingClientRect();

        /*
         * Keep the fixed title/header away from
         * the top of the vehicle.
         */
        const headerOffset =
            window.innerWidth <= 700
                ? 75
                : 100;

        const targetTop =
            window.scrollY +
            rect.top -
            headerOffset;

        window.scrollTo({
            top: Math.max(
                0,
                targetTop
            ),
            behavior:
                smooth
                    ? "smooth"
                    : "auto"
        });

        /*
         * Remove highlight later.
         */
        window.setTimeout(() => {
            vehicle.classList.remove(
                "hash-target"
            );
        }, 2500);

        return true;
    }

    /*
     * ------------------------------------------------------------
     * IMPORTANT:
     *
     * When opening:
     *
     * /view/heroic.html/#xkgt
     *
     * the browser may process #xkgt before AJAX has created
     * the vehicles.
     *
     * Therefore keep checking until the target exists.
     * ------------------------------------------------------------
     */
    let hashScrollTimer = null;

    function scrollToHashWhenReady(
        smooth = false
    ) {
        const model =
            getHashModel();

        if (!model) {
            return;
        }

        if (hashScrollTimer) {
            clearTimeout(
                hashScrollTimer
            );
        }

        let attempts = 0;

        const tryScroll = () => {
            attempts++;

            decorateAllVehicles();

            const found =
                scrollToVehicle(
                    model,
                    smooth && attempts > 1
                );

            if (found) {
                return;
            }

            /*
             * Continue for up to 10 seconds.
             */
            if (attempts < 100) {
                hashScrollTimer =
                    window.setTimeout(
                        tryScroll,
                        100
                    );
            }
        };

        tryScroll();
    }

    /*
     * ------------------------------------------------------------
     * Render dynamic vehicle.
     * ------------------------------------------------------------
     */
    function renderVehicle(
        index,
        count,
        vehicle
    ) {
        const model =
            vehicle.modelName || "";

        const label =
            vehicle.label || model;

        const price =
            Number(vehicle.price) || 0;

        const invert =
            index % 2 === 0;

        let mask =
            invert
                ? "0 0, calc(100% - 80px) 0, 100% 80px, 100% calc(100% - 80px), calc(100% - 80px) 100%, 0 100%"
                : "0 80px, 80px 0, 100% 0, 100% 100%, 80px 100%, 0 calc(100% - 80px)";

        if (index === 0) {
            mask =
                "0 0, 100% 0, 100% calc(100% - 80px), calc(100% - 80px) 100%, 0 100%";
        } else if (index === count - 1) {
            mask =
                invert
                    ? "0 0, calc(100% - 80px) 0, 100% 80px, 100% 100%, 0 100%"
                    : "0 80px, 80px 0, 100% 0, 100% 100%, 0 100%";
        }

        const el =
            document.createElement("div");

        el.className =
            `vehicle${invert ? " invert" : ""}`;

        el.setAttribute(
            "data-model",
            model
        );

        el.id = model;

        /*
         * Details
         */
        const details =
            document.createElement("div");

        details.className =
            "details";

        const inner =
            document.createElement("div");

        inner.className =
            "inner";

        const name =
            document.createElement("span");

        name.textContent =
            label;

        const priceElement =
            document.createElement("small");

        priceElement.textContent =
            formatter.format(price);

        const modelElement =
            document.createElement("pre");

        modelElement.textContent =
            model;

        inner.appendChild(name);
        inner.appendChild(priceElement);
        inner.appendChild(modelElement);

        details.appendChild(inner);

        /*
         * Colors
         */
        const colors =
            document.createElement("div");

        colors.className =
            "colors";

        const colorData = [
            ["mb", "Matte Black"],
            ["mw", "Matte White"],
            ["r", "Red"],
            ["g", "Green"],
            ["b", "Blue"]
        ];

        colorData.forEach(
            ([color, colorTitle]) => {
                const colorElement =
                    document.createElement(
                        "div"
                    );

                colorElement.className =
                    "color";

                colorElement.dataset.color =
                    color;

                colorElement.title =
                    colorTitle;

                colors.appendChild(
                    colorElement
                );
            }
        );

        details.appendChild(colors);

        /*
         * Image
         */
        const imageContainer =
            document.createElement("div");

        imageContainer.className =
            "image";

        imageContainer.style.clipPath =
            `polygon(${mask})`;

        const image =
            document.createElement("img");

        image.alt =
            `${label} vehicle`;

        image.src =
            `/images/${vehicleCategory}/${model}.png`;

        image.loading =
            "lazy";

        imageContainer.appendChild(
            image
        );

        el.appendChild(details);
        el.appendChild(
            imageContainer
        );

        return el;
    }

    /*
     * ------------------------------------------------------------
     * Load vehicles from JSON only if the page does not already
     * contain static vehicle sections.
     *
     * This is important for old/generated view/*.html pages.
     * ------------------------------------------------------------
     */
    function loadVehicles() {
        const container =
            getVehiclesContainer();

        if (!container) {
            console.warn(
                "Luxury Autos: #vehicles not found."
            );

            scrollToHashWhenReady(false);

            return;
        }

        /*
         * FIRST:
         * Handle existing static HTML immediately.
         */
        const existingVehicles =
            container.querySelectorAll(
                ".vehicle"
            );

        if (existingVehicles.length > 0) {
            decorateAllVehicles();

            loadServerRotation();

            /*
             * This handles:
             * /view/heroic.html/#xkgt
             */
            scrollToHashWhenReady(false);

            return;
        }

        /*
         * No static vehicles.
         * Load the normal JSON catalog.
         */
        $.get(
            "/json?_=" +
                Date.now()
        )
            .done((data) => {
                const vehicles =
                    Array.isArray(data?.[key])
                        ? data[key]
                        : [];

                vehicles.sort(
                    (a, b) =>
                        String(
                            a?.label || ""
                        ).localeCompare(
                            String(
                                b?.label || ""
                            )
                        )
                );

                /*
                 * Clear the correct container.
                 */
                container.innerHTML =
                    "";

                vehicles.forEach(
                    (vehicle, index) => {
                        const element =
                            renderVehicle(
                                index,
                                vehicles.length,
                                vehicle
                            );

                        container.appendChild(
                            element
                        );
                    }
                );

                decorateAllVehicles();

                addFooter();

                loadServerRotation();

                /*
                 * THIS is the important part:
                 * after JSON rendering, check #hash again.
                 */
                scrollToHashWhenReady(
                    true
                );
            })
            .fail((error) => {
                console.error(
                    "Luxury Autos: failed to load /json",
                    error
                );

                /*
                 * Still attempt hash navigation.
                 */
                decorateAllVehicles();

                loadServerRotation();

                scrollToHashWhenReady(
                    false
                );
            });
    }

    /*
     * ------------------------------------------------------------
     * Footer
     * ------------------------------------------------------------
     */
    function addFooter() {
        if (
            document.querySelector(
                "#footer"
            )
        ) {
            return;
        }

        const page =
            document.querySelector(
                "#page"
            );

        if (!page) {
            return;
        }

        const footer =
            document.createElement("p");

        footer.id =
            "footer";

        footer.innerHTML =
            "&copy; 2022-2024 coalaura";

        page.appendChild(
            footer
        );
    }

    /*
     * ------------------------------------------------------------
     * Color selector
     * ------------------------------------------------------------
     */
    $(document).on(
        "click",
        ".color",
        function (e) {
            const target =
                $(e.currentTarget);

            const vehicle =
                target.closest(
                    ".vehicle"
                );

            const image =
                $(".image img", vehicle);

            const color =
                target.data(
                    "color"
                );

            const original =
                image.data(
                    "original"
                );

            if (
                target.hasClass(
                    "active"
                )
            ) {
                target.removeClass(
                    "active"
                );

                if (original) {
                    image.attr(
                        "src",
                        original
                    );
                }

                return;
            }

            let src =
                original ||
                image.attr("src");

            if (!original) {
                image.data(
                    "original",
                    src
                );
            }

            src =
                src.replace(
                    /\.png$/i,
                    `_${color}.png`
                );

            image.attr(
                "src",
                src
            );

            $(".color.active", vehicle)
                .removeClass(
                    "active"
                );

            target.addClass(
                "active"
            );
        }
    );

    /*
     * ------------------------------------------------------------
     * Link icon click
     *
     * 1. Creates:
     *    https://luxury-autos.vercel.app/view/heroic.html/#xkgt
     *
     * 2. Updates browser address bar.
     *
     * 3. Copies the COMPLETE URL.
     *
     * 4. Scrolls to the vehicle.
     * ------------------------------------------------------------
     */
    $(document).on(
        "click",
        ".vehicle-link",
        async function (e) {
            e.preventDefault();
            e.stopPropagation();

            const link =
                e.currentTarget;

            const model =
                link.dataset.model;

            if (!model) {
                return;
            }

            const fullUrl =
                buildVehicleUrl(
                    model
                );

            /*
             * Update browser URL immediately.
             *
             * This does NOT reload the page.
             */
            window.history.pushState(
                {
                    vehicle: model
                },
                "",
                fullUrl
            );

            /*
             * Scroll to selected vehicle.
             */
            scrollToVehicle(
                model,
                true
            );

            /*
             * Copy complete URL.
             */
            const copied =
                await copyToClipboard(
                    fullUrl
                );

            /*
             * Update icon tooltip.
             */
            const tooltip =
                link.querySelector(
                    ".link-tooltip"
                );

            if (copied) {
                link.classList.add(
                    "copied"
                );

                if (tooltip) {
                    tooltip.textContent =
                        "Link copied!";
                }

                link.setAttribute(
                    "title",
                    "Link copied!"
                );

                window.setTimeout(
                    () => {
                        link.classList.remove(
                            "copied"
                        );

                        if (tooltip) {
                            tooltip.textContent =
                                "Copy link";
                        }

                        link.setAttribute(
                            "title",
                            "Copy link"
                        );
                    },
                    1600
                );
            } else {
                if (tooltip) {
                    tooltip.textContent =
                        "Copy failed";
                }

                link.setAttribute(
                    "title",
                    "Copy failed"
                );

                window.setTimeout(
                    () => {
                        if (tooltip) {
                            tooltip.textContent =
                                "Copy link";
                        }

                        link.setAttribute(
                            "title",
                            "Copy link"
                        );
                    },
                    1600
                );
            }
        }
    );

    /*
     * ------------------------------------------------------------
     * Browser Back / Forward
     * ------------------------------------------------------------
     */
    window.addEventListener(
        "popstate",
        () => {
            scrollToHashWhenReady(
                true
            );
        }
    );

    /*
     * ------------------------------------------------------------
     * Hash changes
     *
     * Handles:
     * location.hash = "#xkgt"
     * ------------------------------------------------------------
     */
    window.addEventListener(
        "hashchange",
        () => {
            scrollToHashWhenReady(
                true
            );
        }
    );

    /*
     * ------------------------------------------------------------
     * Escape closes embedded catalog
     * ------------------------------------------------------------
     */
    $(document).on(
        "keyup",
        (e) => {
            if (
                e.key === "Escape"
            ) {
                try {
                    window.parent.postMessage(
                        "close",
                        "*"
                    );
                } catch {
                    // Ignore if not embedded.
                }
            }
        }
    );

    /*
     * ------------------------------------------------------------
     * INITIAL START
     * ------------------------------------------------------------
     */

    /*
     * Decorate existing static vehicles BEFORE doing anything else.
     */
    decorateAllVehicles();

    /*
     * Start loading/rendering.
     */
    loadVehicles();

    /*
     * Also retry after DOM/images finish loading.
     */
    window.addEventListener(
        "load",
        () => {
            decorateAllVehicles();

            /*
             * Multiple attempts are intentional because the
             * original catalog can have lazy-loaded images.
             */
            scrollToHashWhenReady(
                false
            );

            setTimeout(
                () =>
                    scrollToHashWhenReady(
                        false
                    ),
                250
            );

            setTimeout(
                () =>
                    scrollToHashWhenReady(
                        false
                    ),
                750
            );

            setTimeout(
                () =>
                    scrollToHashWhenReady(
                        false
                    ),
                1500
            );
        }
    );
})(jQuery);