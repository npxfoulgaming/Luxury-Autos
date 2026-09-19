(($) => {
    "use strict";

    /*
     * ============================================================
     * LUXURY AUTOS
     * Advanced deep-link navigation
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
        new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }
        );

    /* ============================================================
       BACKGROUND
       ============================================================ */

    if (vehicleCategory) {
        $("head").append(`
            <style>
                body::before {
                    background-image:
                        url(
                            "/images/main/${vehicleCategory}_floor.png"
                        );
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
       HASH
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
       URL
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

        if (
            !container ||
            !model
        ) {
            return null;
        }

        const wanted =
            String(model)
                .trim()
                .toLowerCase();

        const vehicles =
            container.querySelectorAll(
                ".vehicle"
            );

        for (
            const vehicle
            of vehicles
        ) {
            const vehicleModel =
                getVehicleModel(
                    vehicle
                )
                    .trim()
                    .toLowerCase();

            if (
                vehicleModel ===
                wanted
            ) {
                return vehicle;
            }
        }

        return null;
    }

    /* ============================================================
       COPY
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
                "Clipboard API unavailable.",
                error
            );
        }

        /*
         * Legacy fallback.
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

            textarea.style.top =
                "0";

            textarea.style.opacity =
                "0";

            document.body.appendChild(
                textarea
            );

            textarea.focus();

            textarea.select();

            textarea.setSelectionRange(
                0,
                text.length
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

        /*
         * No visible text.
         * No tooltip.
         */
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
                <path
                    d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.71 1.71"
                ></path>

                <path
                    d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                ></path>
            </svg>
        `;

        return link;
    }

    /* ============================================================
       DECORATE VEHICLE
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
         * Native fragment target.
         *
         * Keep the ID for accessibility / direct targeting,
         * but our JavaScript controls the actual scrolling.
         */
        vehicle.id =
            model;

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
         * --------------------------------------------------------
         * Vehicle name
         * --------------------------------------------------------
         */

        let nameWrapper =
            inner.querySelector(
                ":scope > .vehicle-name"
            );

        const originalName =
            inner.querySelector(
                ":scope > span"
            );

        if (
            !nameWrapper &&
            originalName
        ) {
            nameWrapper =
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
         * --------------------------------------------------------
         * Link icon
         *
         * It is inserted directly into .details.
         * Existing CSS controls its position.
         * --------------------------------------------------------
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
       DECORATE ALL
       ============================================================ */

    function decorateAllVehicles() {
        const container =
            getVehiclesContainer();

        if (!container) {
            return;
        }

        container
            .querySelectorAll(
                ".vehicle"
            )
            .forEach(
                decorateVehicle
            );
    }

    /* ============================================================
       ADVANCED EASING
       ============================================================ */

    function easeInOutQuart(t) {
        return t < 0.5
            ? 8 *
                t *
                t *
                t *
                t
            : 1 -
                Math.pow(
                    -2 * t + 2,
                    4
                ) /
                    2;
    }

    /* ============================================================
       SCROLL STATE
       ============================================================ */

    let activeScrollFrame =
        null;

    let activeScrollToken =
        0;

    let hashTimer =
        null;

    let lastHandledHash =
        "";

    let initialHash =
        "";

    /*
     * Capture the hash immediately.
     *
     * This is important because the browser may attempt its own
     * native fragment jump before the dynamic vehicle list exists.
     */
    initialHash =
        getHashModel();

    /* ============================================================
       SCROLL LIMIT
       ============================================================ */

    function getMaxScrollY() {
        return Math.max(
            0,
            document.documentElement
                .scrollHeight -
                window.innerHeight
        );
    }

    function clampScrollY(value) {
        return Math.max(
            0,
            Math.min(
                Number(value) || 0,
                getMaxScrollY()
            )
        );
    }

    /* ============================================================
       CANCEL ACTIVE SCROLL
       ============================================================ */

    function cancelActiveScroll() {
        activeScrollToken++;

        if (
            activeScrollFrame !==
            null
        ) {
            cancelAnimationFrame(
                activeScrollFrame
            );

            activeScrollFrame =
                null;
        }
    }

    /* ============================================================
       PREMIUM SMOOTH SCROLL
       ============================================================ */

    function premiumScrollTo(
        targetY,
        duration
    ) {
        cancelActiveScroll();

        const token =
            activeScrollToken;

        const startY =
            window.scrollY;

        const finalY =
            clampScrollY(
                targetY
            );

        const distance =
            finalY -
            startY;

        if (
            Math.abs(distance) <
            2
        ) {
            window.scrollTo(
                0,
                finalY
            );

            return;
        }

        /*
         * Distance-aware duration.
         *
         * Short jumps stay quick.
         * Long jumps get a smooth cinematic movement.
         */
        const calculatedDuration =
            typeof duration ===
            "number"
                ? duration
                : Math.min(
                      1900,
                      Math.max(
                          650,
                          520 +
                              Math.abs(
                                  distance
                              ) *
                                  0.32
                      )
                  );

        let startTime =
            null;

        function animate(
            currentTime
        ) {
            /*
             * Another scroll has started.
             */
            if (
                token !==
                activeScrollToken
            ) {
                return;
            }

            if (
                startTime ===
                null
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
                        calculatedDuration,
                    1
                );

            const eased =
                easeInOutQuart(
                    progress
                );

            window.scrollTo(
                0,
                startY +
                    distance *
                        eased
            );

            if (
                progress <
                1
            ) {
                activeScrollFrame =
                    requestAnimationFrame(
                        animate
                    );
            } else {
                activeScrollFrame =
                    null;

                /*
                 * Final exact correction.
                 */
                window.scrollTo(
                    0,
                    clampScrollY(
                        finalY
                    )
                );
            }
        }

        activeScrollFrame =
            requestAnimationFrame(
                animate
            );
    }

    /* ============================================================
       GET VEHICLE TARGET POSITION
       ============================================================ */

    function getVehicleScrollTarget(
        vehicle
    ) {
        if (!vehicle) {
            return 0;
        }

        const rect =
            vehicle.getBoundingClientRect();

        /*
         * Keep the vehicle comfortably below the top navigation
         * while still showing most/all of the vehicle section.
         */
        const topBias =
            window.innerWidth <=
            700
                ? 72
                : 92;

        /*
         * Prefer centering the vehicle.
         *
         * If the vehicle is taller than the viewport,
         * place its upper area below the heading instead.
         */
        let desiredTop;

        if (
            rect.height +
                topBias <
            window.innerHeight
        ) {
            desiredTop =
                (
                    window.innerHeight -
                    rect.height
                ) /
                    2 +
                topBias;
        } else {
            desiredTop =
                topBias;
        }

        const targetY =
            window.scrollY +
            rect.top -
            desiredTop;

        return clampScrollY(
            targetY
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
         * Cancel any previous movement.
         */
        cancelActiveScroll();

        /*
         * Remove previous focus.
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
         * Activate selected vehicle.
         */
        vehicle.classList.add(
            "hash-target"
        );

        /*
         * Scroll after two animation frames.
         *
         * This gives dynamic DOM/CSS layout time to settle.
         */
        requestAnimationFrame(
            () => {
                requestAnimationFrame(
                    () => {
                        if (
                            !document.documentElement.contains(
                                vehicle
                            )
                        ) {
                            return;
                        }

                        const targetY =
                            getVehicleScrollTarget(
                                vehicle
                            );

                        if (
                            animated
                        ) {
                            premiumScrollTo(
                                targetY
                            );
                        } else {
                            window.scrollTo(
                                0,
                                targetY
                            );
                        }

                        /*
                         * ------------------------------------------------
                         * IMAGE / LAYOUT CORRECTION
                         * ------------------------------------------------
                         *
                         * Vehicle images may change layout after loading.
                         * Measure again once the browser has painted.
                         */
                        requestAnimationFrame(
                            () => {
                                requestAnimationFrame(
                                    () => {
                                        if (
                                            !document
                                                .documentElement
                                                .contains(
                                                    vehicle
                                                )
                                        ) {
                                            return;
                                        }

                                        const correctedY =
                                            getVehicleScrollTarget(
                                                vehicle
                                            );

                                        if (
                                            Math.abs(
                                                correctedY -
                                                    window.scrollY
                                            ) >
                                            8
                                        ) {
                                            premiumScrollTo(
                                                correctedY,
                                                550
                                            );
                                        }
                                    }
                                );
                            }
                        );

                        /*
                         * ------------------------------------------------
                         * IMAGE LOAD CORRECTION
                         * ------------------------------------------------
                         */
                        const images =
                            vehicle.querySelectorAll(
                                "img"
                            );

                        images.forEach(
                            (image) => {
                                if (
                                    !image.complete
                                ) {
                                    image.addEventListener(
                                        "load",
                                        () => {
                                            if (
                                                !document
                                                    .documentElement
                                                    .contains(
                                                        vehicle
                                                    )
                                            ) {
                                                return;
                                            }

                                            const correctedY =
                                                getVehicleScrollTarget(
                                                    vehicle
                                                );

                                            if (
                                                Math.abs(
                                                    correctedY -
                                                        window.scrollY
                                                ) >
                                                8
                                            ) {
                                                premiumScrollTo(
                                                    correctedY,
                                                    500
                                                );
                                            }
                                        },
                                        {
                                            once: true
                                        }
                                    );
                                }
                            }
                        );

                        /*
                         * Remove highlight after a few seconds.
                         */
                        setTimeout(
                            () => {
                                vehicle.classList.remove(
                                    "hash-target"
                                );
                            },
                            3200
                        );
                    }
                );
            }
        );

        return true;
    }

    /* ============================================================
       PREVENT NATIVE HASH JUMP
       ============================================================ */

    function preventNativeHashJump() {
        const model =
            getHashModel();

        if (!model) {
            return;
        }

        /*
         * The browser can automatically jump to #model before
         * dynamically generated content exists.
         *
         * Reset to the top immediately, then our own controller
         * performs the correct animated movement later.
         */
        window.scrollTo(
            0,
            0
        );
    }

    /*
     * Run as early as possible.
     */
    preventNativeHashJump();

    /* ============================================================
       WAIT FOR HASH TARGET
       ============================================================ */

    function scrollToHashWhenReady(
        animated = true,
        force = false
    ) {
        const model =
            getHashModel();

        if (!model) {
            return;
        }

        /*
         * Prevent the same hash from repeatedly starting a new
         * animation because load/render callbacks may fire more
         * than once.
         */
        const hashKey =
            model.toLowerCase();

        if (
            !force &&
            lastHandledHash ===
                hashKey
        ) {
            return;
        }

        if (hashTimer) {
            clearTimeout(
                hashTimer
            );

            hashTimer =
                null;
        }

        let attempts =
            0;

        function attempt() {
            attempts++;

            /*
             * Dynamic rendering may have just created the vehicle.
             */
            decorateAllVehicles();

            const vehicle =
                findVehicle(
                    model
                );

            if (vehicle) {
                lastHandledHash =
                    hashKey;

                scrollToVehicle(
                    model,
                    animated
                );

                hashTimer =
                    null;

                return;
            }

            /*
             * Wait up to 12 seconds.
             */
            if (
                attempts <
                120
            ) {
                hashTimer =
                    setTimeout(
                        attempt,
                        100
                    );
            } else {
                hashTimer =
                    null;
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

        if (
            index === 0
        ) {
            mask =
                "0 0, 100% 0, 100% calc(100% - 80px), calc(100% - 80px) 100%, 0 100%";
        }

        if (
            index ===
            count - 1
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

        /* ========================================================
           DETAILS
           ======================================================== */

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

        /* ========================================================
           COLORS
           ======================================================== */

        const colors =
            document.createElement(
                "div"
            );

        colors.className =
            "colors";

        [
            ["mb", "Matte Black"],
            ["mw", "Matte White"],
            ["r", "Red"],
            ["g", "Green"],
            ["b", "Blue"]
        ].forEach(
            ([color, label]) => {
                const colorElement =
                    document.createElement(
                        "div"
                    );

                colorElement.className =
                    "color";

                colorElement.dataset.color =
                    color;

                colorElement.title =
                    label;

                colors.appendChild(
                    colorElement
                );
            }
        );

        details.appendChild(
            colors
        );

        /* ========================================================
           IMAGE
           ======================================================== */

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
            /*
             * Keep checking because the container can be created
             * by another script.
             */
            scrollToHashWhenReady(
                false
            );

            return;
        }

        /*
         * STATIC HTML VEHICLES
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
             * Deep-link after static DOM exists.
             */
            scrollToHashWhenReady(
                true
            );

            return;
        }

        /*
         * DYNAMIC JSON
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
                     * Deep-link AFTER
                     * vehicles are rendered.
                     */
                    scrollToHashWhenReady(
                        true
                    );
                }
            )
            .fail(
                (error) => {
                    console.error(
                        "Luxury Autos /json error:",
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
       COLORS
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
       LINK CLICK
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
             * Mark this hash as a new navigation.
             */
            lastHandledHash =
                "";

            /*
             * Update browser URL WITHOUT reload.
             */
            window.history.pushState(
                {
                    vehicle:
                        model
                },
                "",
                fullUrl
            );

            /*
             * Smooth navigation.
             */
            scrollToHashWhenReady(
                true,
                true
            );

            /*
             * Copy full URL.
             */
            const copied =
                await copyToClipboard(
                    fullUrl
                );

            if (copied) {
                /*
                 * GREEN STATE
                 */
                link.classList.add(
                    "copied"
                );

                /*
                 * Exactly 3 seconds.
                 */
                setTimeout(
                    () => {
                        link.classList.remove(
                            "copied"
                        );
                    },
                    3000
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
            /*
             * New hash means new navigation.
             */
            lastHandledHash =
                "";

            scrollToHashWhenReady(
                true,
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
            lastHandledHash =
                "";

            /*
             * Give the browser one frame to update
             * location/hash state.
             */
            requestAnimationFrame(
                () => {
                    scrollToHashWhenReady(
                        true,
                        true
                    );
                }
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
                event.key ===
                "Escape"
            ) {
                try {
                    window.parent.postMessage(
                        "close",
                        "*"
                    );
                } catch {
                    /*
                     * Normal browser.
                     */
                }
            }
        }
    );

    /* ============================================================
       INITIALIZATION
       ============================================================ */

    /*
     * Immediately decorate any
     * server-rendered vehicle sections.
     */
    decorateAllVehicles();

    /*
     * Load/render catalog.
     */
    loadVehicles();

    /*
     * ------------------------------------------------------------
     * INITIAL HASH HANDLING
     * ------------------------------------------------------------
     *
     * DO NOT repeatedly call the scroll function at 350ms,
     * 1000ms and 2000ms.
     *
     * That was one of the main causes of the scroll animation
     * restarting/fighting itself.
     */
    window.addEventListener(
        "load",
        () => {
            decorateAllVehicles();

            /*
             * Use the hash that existed when the script started.
             */
            if (initialHash) {
                lastHandledHash =
                    "";

                scrollToHashWhenReady(
                    true,
                    true
                );
            }
        }
    );

    /* ============================================================
       FINAL HASH FALLBACK
       ============================================================ */

    /*
     * If the JSON request finishes slightly after load,
     * this observer notices the vehicle DOM being created.
     *
     * It does NOT continuously scroll.
     * It only acts while the requested hash has not been handled.
     */
    if (
        initialHash &&
        typeof MutationObserver !==
            "undefined"
    ) {
        const observer =
            new MutationObserver(
                () => {
                    if (
                        lastHandledHash
                    ) {
                        return;
                    }

                    const vehicle =
                        findVehicle(
                            initialHash
                        );

                    if (
                        vehicle
                    ) {
                        observer.disconnect();

                        scrollToHashWhenReady(
                            true,
                            true
                        );
                    }
                }
            );

        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );

        /*
         * Safety timeout.
         */
        setTimeout(
            () => {
                observer.disconnect();
            },
            15000
        );
    }

})(jQuery);