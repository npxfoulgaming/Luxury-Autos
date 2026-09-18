(($) => {
    "use strict";

    /*
     * ============================================================
     * LUXURY AUTOS
     * Advanced vehicle deep-link / navigation system
     *
     * Example:
     *
     * /view/heroic.html/#xkgt
     *
     * NO view/*.html modification required.
     * ============================================================
     */

    const pageTitle =
        typeof title !== "undefined"
            ? title
            : "";

    const vehicleCategory =
        typeof category !== "undefined"
            ? category
            : "";

    const serverName =
        typeof server !== "undefined"
            ? server
            : "";

    const jsonKey =
        pageTitle + " Imports";

    const formatter =
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });

    /* ============================================================
       BACKGROUND
       ============================================================ */

    if (vehicleCategory) {
        $("head").append(`
            <style>
                body::before {
                    background-image:
                        url("/images/main/${vehicleCategory}_floor.png");
                }
            </style>
        `);
    }

    /* ============================================================
       VEHICLE CONTAINER
       ============================================================ */

    function getVehiclesContainer() {
        const containers =
            Array.from(
                document.querySelectorAll(
                    "#vehicles"
                )
            );

        if (!containers.length) {
            return null;
        }

        /*
         * Some old pages may contain duplicate
         * #vehicles elements.
         *
         * Prefer the one which already has vehicles.
         */
        const populated =
            containers.find(
                (container) =>
                    container.querySelector(
                        ".vehicle"
                    )
            );

        return (
            populated ||
            containers[0]
        );
    }

    /* ============================================================
       MODEL
       ============================================================ */

    function getVehicleModel(vehicle) {
        if (!vehicle) {
            return "";
        }

        return (
            vehicle.dataset.model ||
            vehicle.getAttribute(
                "data-model"
            ) ||
            ""
        ).trim();
    }

    /* ============================================================
       CURRENT HASH
       ============================================================ */

    function getHashModel() {
        const hash =
            window.location.hash;

        if (
            !hash ||
            hash.length <= 1
        ) {
            return "";
        }

        try {
            return decodeURIComponent(
                hash.substring(1)
            ).trim();
        } catch {
            return hash
                .substring(1)
                .trim();
        }
    }

    /* ============================================================
       SHARE URL
       ============================================================ */

    function buildVehicleUrl(model) {
        const url =
            new URL(
                window.location.href
            );

        url.hash = model;

        return url.href;
    }

    /* ============================================================
       FIND VEHICLE
       ============================================================ */

    function findVehicle(model) {
        const container =
            getVehiclesContainer();

        if (!container || !model) {
            return null;
        }

        const wanted =
            model.toLowerCase();

        const vehicles =
            container.querySelectorAll(
                ".vehicle"
            );

        for (
            const vehicle
            of vehicles
        ) {
            const current =
                getVehicleModel(
                    vehicle
                ).toLowerCase();

            if (
                current === wanted
            ) {
                return vehicle;
            }
        }

        return null;
    }

    /* ============================================================
       CLIPBOARD
       ============================================================ */

    async function copyToClipboard(text) {
        try {
            if (
                navigator.clipboard &&
                typeof navigator
                    .clipboard
                    .writeText ===
                    "function"
            ) {
                await navigator
                    .clipboard
                    .writeText(text);

                return true;
            }
        } catch (error) {
            console.warn(
                "Clipboard API failed.",
                error
            );
        }

        /*
         * Fallback for older / embedded browsers.
         */
        try {
            const textarea =
                document.createElement(
                    "textarea"
                );

            textarea.value = text;

            textarea.readOnly = true;

            textarea.style.position =
                "fixed";

            textarea.style.left =
                "-9999px";

            textarea.style.top = "0";

            textarea.style.opacity =
                "0";

            document.body.appendChild(
                textarea
            );

            textarea.focus();

            textarea.select();

            textarea.setSelectionRange(
                0,
                textarea.value.length
            );

            const success =
                document.execCommand(
                    "copy"
                );

            textarea.remove();

            return success;
        } catch (error) {
            console.error(
                "Copy failed:",
                error
            );

            return false;
        }
    }

    /* ============================================================
       LINK ICON
       ============================================================ */

    function createLinkIcon(model) {
        const link =
            document.createElement(
                "a"
            );

        link.className =
            "vehicle-link";

        link.href =
            buildVehicleUrl(
                model
            );

        link.dataset.model =
            model;

        link.setAttribute(
            "aria-label",
            `Copy link to ${model}`
        );

        link.setAttribute(
            "title",
            "Copy vehicle link"
        );

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
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.71 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>

            <span class="link-tooltip">
                Copy vehicle link
            </span>
        `;

        return link;
    }

    /* ============================================================
       DECORATE ONE VEHICLE
       ============================================================ */

    function decorateVehicle(vehicle) {
        if (!vehicle) {
            return;
        }

        const model =
            getVehicleModel(
                vehicle
            );

        if (!model) {
            return;
        }

        /*
         * Give the actual vehicle a real HTML ID.
         */
        vehicle.id = model;

        const details =
            vehicle.querySelector(
                ".details"
            );

        if (!details) {
            return;
        }

        const inner =
            details.querySelector(
                ".inner"
            );

        if (!inner) {
            return;
        }

        /*
         * ========================================================
         * NAME
         * ========================================================
         */

        const originalName =
            inner.querySelector(
                ":scope > span"
            );

        if (
            originalName &&
            !inner.querySelector(
                ".vehicle-name"
            )
        ) {
            const nameWrapper =
                document.createElement(
                    "div"
                );

            nameWrapper.className =
                "vehicle-name";

            inner.insertBefore(
                nameWrapper,
                originalName
            );

            nameWrapper.appendChild(
                originalName
            );
        }

        /*
         * ========================================================
         * LINK BUTTON
         *
         * It lives inside .details,
         * positioned on the same side as .colors.
         * ========================================================
         */

        let link =
            details.querySelector(
                ".vehicle-link"
            );

        if (!link) {
            link =
                createLinkIcon(
                    model
                );

            details.appendChild(
                link
            );
        } else {
            link.href =
                buildVehicleUrl(
                    model
                );

            link.dataset.model =
                model;
        }
    }

    /* ============================================================
       DECORATE ALL VEHICLES
       ============================================================ */

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

    /* ============================================================
       ADVANCED SMOOTH SCROLL
       ============================================================ */

    function easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 -
                Math.pow(
                    -2 * t + 2,
                    3
                ) /
                    2;
    }

    function smoothScrollTo(
        targetY,
        duration = 1250
    ) {
        const startY =
            window.scrollY;

        const distance =
            targetY - startY;

        /*
         * Don't animate tiny movements.
         */
        if (
            Math.abs(distance) <
            5
        ) {
            window.scrollTo(
                0,
                targetY
            );

            return;
        }

        let startTime =
            null;

        function animation(
            currentTime
        ) {
            if (
                startTime === null
            ) {
                startTime =
                    currentTime;
            }

            const elapsed =
                currentTime -
                startTime;

            const progress =
                Math.min(
                    elapsed /
                        duration,
                    1
                );

            const eased =
                easeInOutCubic(
                    progress
                );

            window.scrollTo(
                0,
                startY +
                    distance *
                        eased
            );

            if (
                progress < 1
            ) {
                requestAnimationFrame(
                    animation
                );
            } else {
                window.scrollTo(
                    0,
                    targetY
                );
            }
        }

        requestAnimationFrame(
            animation
        );
    }

    /* ============================================================
       SCROLL TO VEHICLE
       ============================================================ */

    function scrollToVehicle(
        model,
        animated = true
    ) {
        const vehicle =
            findVehicle(model);

        if (!vehicle) {
            return false;
        }

        /*
         * Remove old target.
         */
        document
            .querySelectorAll(
                ".vehicle.hash-target"
            )
            .forEach(
                (element) => {
                    element.classList.remove(
                        "hash-target"
                    );
                }
            );

        /*
         * Target selected vehicle.
         */
        vehicle.classList.add(
            "hash-target"
        );

        /*
         * Wait one frame so the browser
         * has applied the target styling.
         */
        requestAnimationFrame(
            () => {
                const rect =
                    vehicle.getBoundingClientRect();

                const viewportHeight =
                    window.innerHeight;

                /*
                 * Center the vehicle in the
                 * viewport rather than simply
                 * placing it at the top.
                 */
                const vehicleCenter =
                    rect.top +
                    rect.height / 2;

                const viewportCenter =
                    viewportHeight / 2;

                const difference =
                    vehicleCenter -
                    viewportCenter;

                const targetY =
                    window.scrollY +
                    difference;

                if (animated) {
                    smoothScrollTo(
                        Math.max(
                            0,
                            targetY
                        ),
                        1350
                    );
                } else {
                    window.scrollTo(
                        0,
                        Math.max(
                            0,
                            targetY
                        )
                    );
                }

                /*
                 * Extra visual pulse.
                 */
                window.setTimeout(
                    () => {
                        vehicle.classList.remove(
                            "hash-target"
                        );
                    },
                    2800
                );
            }
        );

        return true;
    }

    /* ============================================================
       WAIT FOR HASH TARGET
       ============================================================ */

    let hashTimer = null;

    function scrollToHashWhenReady(
        animated = true
    ) {
        const model =
            getHashModel();

        if (!model) {
            return;
        }

        if (hashTimer) {
            clearTimeout(
                hashTimer
            );
        }

        let attempts = 0;

        function attempt() {
            attempts++;

            decorateAllVehicles();

            const success =
                scrollToVehicle(
                    model,
                    animated
                );

            if (success) {
                return;
            }

            /*
             * Keep waiting while the
             * vehicle catalog loads.
             */
            if (
                attempts < 120
            ) {
                hashTimer =
                    setTimeout(
                        attempt,
                        100
                    );
            }
        }

        attempt();
    }

    /* ============================================================
       RENDER VEHICLE
       ============================================================ */

    function renderVehicle(
        index,
        count,
        vehicle
    ) {
        const model =
            vehicle.modelName ||
            "";

        const label =
            vehicle.label ||
            model;

        const price =
            Number(
                vehicle.price
            ) || 0;

        const invert =
            index % 2 === 0;

        let mask =
            invert
                ? "0 0, calc(100% - 80px) 0, 100% 80px, 100% calc(100% - 80px), calc(100% - 80px) 100%, 0 100%"
                : "0 80px, 80px 0, 100% 0, 100% 100%, 80px 100%, 0 calc(100% - 80px)";

        if (index === 0) {
            mask =
                "0 0, 100% 0, 100% calc(100% - 80px), calc(100% - 80px) 100%, 0 100%";
        }

        if (
            index === count - 1
        ) {
            mask =
                invert
                    ? "0 0, calc(100% - 80px) 0, 100% 80px, 100% 100%, 0 100%"
                    : "0 80px, 80px 0, 100% 0, 100% 100%, 0 100%";
        }

        const element =
            document.createElement(
                "div"
            );

        element.className =
            "vehicle" +
            (
                invert
                    ? " invert"
                    : ""
            );

        element.dataset.model =
            model;

        element.id =
            model;

        /*
         * DETAILS
         */
        const details =
            document.createElement(
                "div"
            );

        details.className =
            "details";

        const inner =
            document.createElement(
                "div"
            );

        inner.className =
            "inner";

        const name =
            document.createElement(
                "span"
            );

        name.textContent =
            label;

        const priceElement =
            document.createElement(
                "small"
            );

        priceElement.textContent =
            formatter.format(
                price
            );

        const modelElement =
            document.createElement(
                "pre"
            );

        modelElement.textContent =
            model;

        inner.appendChild(
            name
        );

        inner.appendChild(
            priceElement
        );

        inner.appendChild(
            modelElement
        );

        details.appendChild(
            inner
        );

        /*
         * COLORS
         */
        const colors =
            document.createElement(
                "div"
            );

        colors.className =
            "colors";

        const colorList = [
            [
                "mb",
                "Matte Black"
            ],
            [
                "mw",
                "Matte White"
            ],
            [
                "r",
                "Red"
            ],
            [
                "g",
                "Green"
            ],
            [
                "b",
                "Blue"
            ]
        ];

        colorList.forEach(
            ([color, name]) => {
                const colorElement =
                    document.createElement(
                        "div"
                    );

                colorElement.className =
                    "color";

                colorElement.dataset.color =
                    color;

                colorElement.title =
                    name;

                colors.appendChild(
                    colorElement
                );
            }
        );

        details.appendChild(
            colors
        );

        /*
         * IMAGE
         */
        const imageContainer =
            document.createElement(
                "div"
            );

        imageContainer.className =
            "image";

        imageContainer.style.clipPath =
            `polygon(${mask})`;

        const image =
            document.createElement(
                "img"
            );

        image.alt =
            `${label} vehicle`;

        image.src =
            `/images/${vehicleCategory}/${model}.png`;

        image.loading =
            "lazy";

        imageContainer.appendChild(
            image
        );

        element.appendChild(
            details
        );

        element.appendChild(
            imageContainer
        );

        return element;
    }

    /* ============================================================
       LOAD VEHICLES
       ============================================================ */

    function loadVehicles() {
        const container =
            getVehiclesContainer();

        if (!container) {
            scrollToHashWhenReady(
                false
            );

            return;
        }

        /*
         * STATIC VEHICLES
         */
        const staticVehicles =
            container.querySelectorAll(
                ".vehicle"
            );

        if (
            staticVehicles.length
        ) {
            decorateAllVehicles();

            loadServerRotation();

            /*
             * Give direct hash navigation
             * priority after static DOM exists.
             */
            scrollToHashWhenReady(
                true
            );

            return;
        }

        /*
         * DYNAMIC VEHICLES
         */
        $.get(
            "/json?_=" +
                Date.now()
        )
            .done(
                (data) => {
                    const vehicles =
                        Array.isArray(
                            data?.[
                                jsonKey
                            ]
                        )
                            ? data[
                                jsonKey
                            ]
                            : [];

                    vehicles.sort(
                        (a, b) =>
                            String(
                                a?.label ||
                                    ""
                            ).localeCompare(
                                String(
                                    b?.label ||
                                        ""
                                )
                            )
                    );

                    container.innerHTML =
                        "";

                    vehicles.forEach(
                        (
                            vehicle,
                            index
                        ) => {
                            container.appendChild(
                                renderVehicle(
                                    index,
                                    vehicles.length,
                                    vehicle
                                )
                            );
                        }
                    );

                    decorateAllVehicles();

                    addFooter();

                    loadServerRotation();

                    /*
                     * Important:
                     * after rendering, scroll again.
                     */
                    scrollToHashWhenReady(
                        true
                    );
                }
            )
            .fail(
                (error) => {
                    console.error(
                        "Luxury Autos JSON error:",
                        error
                    );

                    decorateAllVehicles();

                    loadServerRotation();

                    scrollToHashWhenReady(
                        true
                    );
                }
            );
    }

    /* ============================================================
       FOOTER
       ============================================================ */

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
            document.createElement(
                "p"
            );

        footer.id =
            "footer";

        footer.innerHTML =
            "&copy; 2022-2024 coalaura";

        page.appendChild(
            footer
        );
    }

    /* ============================================================
       COLOR SWITCHING
       ============================================================ */

    $(document).on(
        "click",
        ".color",
        function (event) {
            const target =
                $(event.currentTarget);

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
                image.attr(
                    "src"
                );

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

    /* ============================================================
       LINK BUTTON
       ============================================================ */

    $(document).on(
        "click",
        ".vehicle-link",
        async function (event) {
            event.preventDefault();
            event.stopPropagation();

            const link =
                event.currentTarget;

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
             * Update browser URL without reload.
             */
            window.history.pushState(
                {
                    vehicle: model
                },
                "",
                fullUrl
            );

            /*
             * Smoothly move to the vehicle.
             */
            scrollToVehicle(
                model,
                true
            );

            /*
             * Copy COMPLETE URL.
             */
            const copied =
                await copyToClipboard(
                    fullUrl
                );

            const tooltip =
                link.querySelector(
                    ".link-tooltip"
                );

            if (copied) {
                link.classList.add(
                    "copied"
                );

                link.setAttribute(
                    "title",
                    "Link copied!"
                );

                if (tooltip) {
                    tooltip.textContent =
                        "Link copied!";
                }

                setTimeout(
                    () => {
                        link.classList.remove(
                            "copied"
                        );

                        link.setAttribute(
                            "title",
                            "Copy vehicle link"
                        );

                        if (tooltip) {
                            tooltip.textContent =
                                "Copy vehicle link";
                        }
                    },
                    1700
                );
            } else {
                link.setAttribute(
                    "title",
                    "Copy failed"
                );

                if (tooltip) {
                    tooltip.textContent =
                        "Copy failed";
                }

                setTimeout(
                    () => {
                        link.setAttribute(
                            "title",
                            "Copy vehicle link"
                        );

                        if (tooltip) {
                            tooltip.textContent =
                                "Copy vehicle link";
                        }
                    },
                    1700
                );
            }
        }
    );

    /* ============================================================
       HASH CHANGE
       ============================================================ */

    window.addEventListener(
        "hashchange",
        () => {
            scrollToHashWhenReady(
                true
            );
        }
    );

    /* ============================================================
       BACK / FORWARD
       ============================================================ */

    window.addEventListener(
        "popstate",
        () => {
            scrollToHashWhenReady(
                true
            );
        }
    );

    /* ============================================================
       ESCAPE
       ============================================================ */

    $(document).on(
        "keyup",
        (event) => {
            if (
                event.key === "Escape"
            ) {
                try {
                    window.parent.postMessage(
                        "close",
                        "*"
                    );
                } catch {
                    // Not embedded.
                }
            }
        }
    );

    /* ============================================================
       INITIALIZE
       ============================================================ */

    decorateAllVehicles();

    loadVehicles();

    /*
     * Extra attempts after images/layout have settled.
     */
    window.addEventListener(
        "load",
        () => {
            decorateAllVehicles();

            scrollToHashWhenReady(
                true
            );

            setTimeout(
                () => {
                    decorateAllVehicles();

                    scrollToHashWhenReady(
                        true
                    );
                },
                300
            );

            setTimeout(
                () => {
                    decorateAllVehicles();

                    scrollToHashWhenReady(
                        true
                    );
                },
                900
            );

            setTimeout(
                () => {
                    decorateAllVehicles();

                    scrollToHashWhenReady(
                        true
                    );
                },
                1800
            );
        }
    );

})(jQuery);