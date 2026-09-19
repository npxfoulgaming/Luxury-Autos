(($) => {
    "use strict";

    /*
     * ============================================================
     * LUXURY AUTOS
     * ============================================================
     *
     * CUSTOM DEEP-LINK SCROLL SYSTEM
     *
     * Example:
     *
     * https://luxury-autos.vercel.app/view/respected.html#zr3806str
     *
     * Behavior:
     *
     * PAGE LOAD
     *     ↓
     * START AT TOP
     *     ↓
     * VEHICLES RENDER
     *     ↓
     * SMOOTH CONTINUOUS SCROLL
     *     ↓
     * PASS THROUGH VEHICLE SECTIONS
     *     ↓
     * TARGET VEHICLE
     *
     * IMPORTANT:
     *
     * We intentionally DO NOT assign:
     *
     *     element.id = model
     *
     * because native browser fragment navigation would
     * otherwise instantly jump to the matching element.
     *
     * JavaScript completely owns deep-link scrolling.
     * ============================================================
     */

    /* ============================================================
       PAGE DATA
       ============================================================ */

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
       INITIAL DEEP LINK CAPTURE
       ============================================================

       THIS MUST HAPPEN BEFORE VEHICLE RENDERING.

       If the page was opened with:

       /view/respected.html#zr3806str

       we immediately remember the URL and remove the hash.

       Removing the hash prevents the browser from performing
       native fragment navigation when the vehicle elements are
       later inserted into the page.
       ============================================================ */

    const initialPageUrl =
        new URL(
            window.location.href
        );

    const initialHash =
        initialPageUrl.hash;

    let initialDeepLinkModel = "";

    if (initialHash) {
        try {
            initialDeepLinkModel =
                decodeURIComponent(
                    initialHash.substring(1)
                ).trim();
        } catch {
            initialDeepLinkModel =
                initialHash
                    .substring(1)
                    .trim();
        }

        /*
         * Remove the hash immediately.
         *
         * IMPORTANT:
         *
         * replaceState changes the URL without causing
         * native fragment scrolling.
         */
        history.replaceState(
            history.state,
            document.title,
            initialPageUrl.pathname +
                initialPageUrl.search
        );

        /*
         * Force the page to the actual top.
         *
         * This also defeats browser scroll restoration
         * if the page was previously open at another
         * scroll position.
         */
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto"
        });
    }

    /* ============================================================
       DEEP LINK STATE
       ============================================================ */

    let deepLinkAnimationId = null;

    let deepLinkTimer = null;

    let deepLinkRunning = false;

    let deepLinkRequestToken = 0;

    let initialDeepLinkHandled = false;

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

    function decodeHash(hash) {
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

    function getHashModel() {
        return decodeHash(
            window.location.hash
        );
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
            model.toLowerCase();

        const vehicles =
            container.querySelectorAll(
                ".vehicle"
            );

        for (
            const vehicle
            of vehicles
        ) {
            if (
                getVehicleModel(
                    vehicle
                ).toLowerCase() ===
                wanted
            ) {
                return vehicle;
            }
        }

        return null;
    }

    /* ============================================================
       COPY TO CLIPBOARD
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

        try {
            const textarea =
                document.createElement(
                    "textarea"
                );

            textarea.value =
                text;

            textarea.readOnly =
                true;

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
         * IMPORTANT:
         *
         * DO NOT DO THIS:
         *
         * vehicle.id = model;
         *
         * A matching DOM id allows the browser to perform
         * native #hash scrolling.
         *
         * data-model is enough for our JavaScript system.
         */

        vehicle.removeAttribute(
            "id"
        );

        vehicle.dataset.model =
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

        /* --------------------------------------------------------
           Vehicle name
           -------------------------------------------------------- */

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

        /* --------------------------------------------------------
           Link
           -------------------------------------------------------- */

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
       HEADER HEIGHT
       ============================================================ */

    function getHeaderOffset() {
        const header =
            document.querySelector(
                "h1"
            );

        if (!header) {
            return window.innerWidth <= 700
                ? 75
                : 100;
        }

        const rect =
            header.getBoundingClientRect();

        return (
            Math.ceil(
                rect.height
            ) +
            (
                window.innerWidth <= 700
                    ? 12
                    : 15
            )
        );
    }

    /* ============================================================
       MAX SCROLL
       ============================================================ */

    function getMaxScrollY() {
        return Math.max(
            0,
            document.documentElement
                .scrollHeight -
                window.innerHeight
        );
    }

    /* ============================================================
       TARGET POSITION
       ============================================================ */

    function getTargetScrollY(
        vehicle
    ) {
        if (!vehicle) {
            return 0;
        }

        const rect =
            vehicle.getBoundingClientRect();

        const absoluteTop =
            window.scrollY +
            rect.top;

        /*
         * Target is positioned underneath the
         * fixed page heading.
         */
        const target =
            absoluteTop -
            getHeaderOffset();

        return Math.max(
            0,
            Math.min(
                target,
                getMaxScrollY()
            )
        );
    }

    /* ============================================================
       EASING
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
       STOP DEEP LINK ANIMATION
       ============================================================ */

    function stopDeepLinkAnimation() {
        deepLinkRequestToken++;

        if (
            deepLinkAnimationId !==
            null
        ) {
            cancelAnimationFrame(
                deepLinkAnimationId
            );

            deepLinkAnimationId =
                null;
        }

        if (
            deepLinkTimer !==
            null
        ) {
            clearTimeout(
                deepLinkTimer
            );

            deepLinkTimer =
                null;
        }

        deepLinkRunning =
            false;
    }

    /* ============================================================
       SMOOTH SCROLL
       ============================================================ */

    function smoothScrollToVehicle(
        vehicle
    ) {
        stopDeepLinkAnimation();

        if (!vehicle) {
            return;
        }

        /*
         * Give the browser two frames to settle layout.
         */
        const startY =
            window.scrollY;

        const targetY =
            getTargetScrollY(
                vehicle
            );

        const distance =
            targetY -
            startY;

        /*
         * If already there, do nothing.
         */
        if (
            Math.abs(distance) <
            2
        ) {
            window.scrollTo({
                top: targetY,
                left: 0,
                behavior: "auto"
            });

            return;
        }

        /*
         * IMPORTANT:
         *
         * The farther the target is away,
         * the longer the animation lasts.
         *
         * This makes deep links visibly travel
         * through the vehicle sections.
         */
        const duration =
            Math.min(
                4200,
                Math.max(
                    1600,
                    Math.abs(distance) *
                        0.75
                )
            );

        const animationToken =
            ++deepLinkRequestToken;

        deepLinkRunning =
            true;

        let startTime =
            null;

        function animate(
            timestamp
        ) {
            if (
                !deepLinkRunning ||
                animationToken !==
                    deepLinkRequestToken
            ) {
                return;
            }

            if (
                startTime === null
            ) {
                startTime =
                    timestamp;
            }

            const elapsed =
                timestamp -
                startTime;

            const progress =
                Math.min(
                    elapsed /
                        duration,
                    1
                );

            const eased =
                easeInOutQuart(
                    progress
                );

            const position =
                startY +
                distance *
                    eased;

            /*
             * behavior:auto is intentional.
             *
             * The animation itself controls every frame.
             */
            window.scrollTo({
                top: position,
                left: 0,
                behavior: "auto"
            });

            if (
                progress <
                1
            ) {
                deepLinkAnimationId =
                    requestAnimationFrame(
                        animate
                    );
            } else {
                deepLinkAnimationId =
                    null;

                deepLinkRunning =
                    false;

                /*
                 * Recalculate once at the end in case
                 * document height changed while scrolling.
                 */
                const finalTarget =
                    getTargetScrollY(
                        vehicle
                    );

                window.scrollTo({
                    top: finalTarget,
                    left: 0,
                    behavior: "auto"
                });
            }
        }

        deepLinkAnimationId =
            requestAnimationFrame(
                animate
            );
    }

    /* ============================================================
       ACTIVATE TARGET
       ============================================================ */

    function activateVehicle(
        vehicle
    ) {
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

        vehicle.classList.add(
            "hash-target"
        );

        /*
         * Keep highlight temporarily.
         */
        setTimeout(
            () => {
                vehicle.classList.remove(
                    "hash-target"
                );
            },
            4500
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

        activateVehicle(
            vehicle
        );

        /*
         * Make sure the page is not using any
         * browser-native smooth scrolling.
         */
        document.documentElement.style
            .scrollBehavior = "auto";

        requestAnimationFrame(
            () => {
                requestAnimationFrame(
                    () => {
                        if (!findVehicle(model)) {
                            return;
                        }

                        if (animated) {
                            smoothScrollToVehicle(
                                vehicle
                            );
                        } else {
                            stopDeepLinkAnimation();

                            window.scrollTo({
                                top:
                                    getTargetScrollY(
                                        vehicle
                                    ),
                                left: 0,
                                behavior: "auto"
                            });
                        }
                    }
                );
            }
        );

        return true;
    }

    /* ============================================================
       RESTORE INITIAL HASH + SCROLL
       ============================================================ */

    function performInitialDeepLink() {
        if (
            initialDeepLinkHandled ||
            !initialDeepLinkModel
        ) {
            return;
        }

        const vehicle =
            findVehicle(
                initialDeepLinkModel
            );

        if (!vehicle) {
            return false;
        }

        initialDeepLinkHandled =
            true;

        /*
         * Make absolutely certain the animation
         * starts from the top.
         */
        stopDeepLinkAnimation();

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto"
        });

        /*
         * Wait for layout.
         */
        requestAnimationFrame(
            () => {
                requestAnimationFrame(
                    () => {
                        /*
                         * Restore the original URL hash.
                         *
                         * replaceState DOES NOT invoke
                         * native fragment scrolling.
                         */
                        history.replaceState(
                            history.state,
                            document.title,
                            initialPageUrl.href
                        );

                        /*
                         * Start the actual visual
                         * scrolling animation.
                         */
                        scrollToVehicle(
                            initialDeepLinkModel,
                            true
                        );
                    }
                );
            }
        );

        return true;
    }

    /* ============================================================
       WAIT FOR INITIAL TARGET
       ============================================================ */

    function waitForInitialDeepLink() {
        if (
            !initialDeepLinkModel ||
            initialDeepLinkHandled
        ) {
            return;
        }

        let attempts = 0;

        function attempt() {
            attempts++;

            decorateAllVehicles();

            if (
                performInitialDeepLink()
            ) {
                return;
            }

            if (
                attempts <
                150
            ) {
                deepLinkTimer =
                    setTimeout(
                        attempt,
                        100
                    );
            } else {
                deepLinkTimer =
                    null;
            }
        }

        attempt();
    }

    /* ============================================================
       HANDLE NORMAL HASH NAVIGATION
       ============================================================ */

    function scrollToHashWhenReady(
        animated = true
    ) {
        const model =
            getHashModel();

        if (!model) {
            document
                .querySelectorAll(
                    ".vehicle.hash-target"
                )
                .forEach(
                    (vehicle) => {
                        vehicle.classList.remove(
                            "hash-target"
                        );
                    }
                );

            return;
        }

        /*
         * Do not let this compete with the
         * initial deep-link system.
         */
        if (
            initialDeepLinkModel &&
            !initialDeepLinkHandled
        ) {
            return;
        }

        if (
            deepLinkTimer !==
            null
        ) {
            clearTimeout(
                deepLinkTimer
            );

            deepLinkTimer =
                null;
        }

        let attempts = 0;

        function attempt() {
            attempts++;

            decorateAllVehicles();

            const vehicle =
                findVehicle(
                    model
                );

            if (vehicle) {
                requestAnimationFrame(
                    () => {
                        requestAnimationFrame(
                            () => {
                                scrollToVehicle(
                                    model,
                                    animated
                                );
                            }
                        );
                    }
                );

                return;
            }

            if (
                attempts <
                120
            ) {
                deepLinkTimer =
                    setTimeout(
                        attempt,
                        100
                    );
            } else {
                deepLinkTimer =
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

        /*
         * IMPORTANT:
         *
         * There is deliberately NO:
         *
         * element.id = model;
         *
         * The model is stored only in data-model.
         */
        element.dataset.model =
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
            ([color, colorLabel]) => {
                const colorElement =
                    document.createElement(
                        "div"
                    );

                colorElement.className =
                    "color";

                colorElement.dataset.color =
                    color;

                colorElement.title =
                    colorLabel;

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
            waitForInitialDeepLink();

            return;
        }

        const staticVehicles =
            container.querySelectorAll(
                ".vehicle"
            );

        /* ========================================================
           STATIC VEHICLES
           ======================================================== */

        if (
            staticVehicles.length
        ) {
            decorateAllVehicles();

            loadServerRotation();

            /*
             * Initial deep link is handled ONCE.
             */
            waitForInitialDeepLink();

            return;
        }

        /* ========================================================
           DYNAMIC JSON
           ======================================================== */

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
                     * Start initial deep-link handling
                     * only after all vehicles exist.
                     */
                    waitForInitialDeepLink();
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

                    waitForInitialDeepLink();

                    /*
                     * If this was a normal hash navigation,
                     * allow it to resolve.
                     */
                    if (
                        !initialDeepLinkModel
                    ) {
                        scrollToHashWhenReady(
                            true
                        );
                    }
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
             * Stop any existing animation.
             */
            stopDeepLinkAnimation();

            /*
             * Push the hash into browser history.
             *
             * pushState does not perform native
             * fragment scrolling.
             */
            history.pushState(
                {
                    vehicle: model
                },
                "",
                fullUrl
            );

            /*
             * Scroll from the CURRENT position.
             */
            scrollToVehicle(
                model,
                true
            );

            /*
             * Copy URL.
             */
            const copied =
                await copyToClipboard(
                    fullUrl
                );

            if (copied) {
                link.classList.add(
                    "copied"
                );

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
             * There are no matching element IDs, so the
             * browser cannot perform its usual native
             * fragment jump.
             *
             * We therefore control the entire movement.
             */
            if (
                initialDeepLinkModel &&
                !initialDeepLinkHandled
            ) {
                return;
            }

            requestAnimationFrame(
                () => {
                    scrollToHashWhenReady(
                        true
                    );
                }
            );
        }
    );

    /* ============================================================
       BACK / FORWARD
       ============================================================ */

    window.addEventListener(
        "popstate",
        () => {
            requestAnimationFrame(
                () => {
                    scrollToHashWhenReady(
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
                event.key === "Escape"
            ) {
                try {
                    window.parent.postMessage(
                        "close",
                        "*"
                    );
                } catch {
                    // Normal browser.
                }
            }
        }
    );

    /* ============================================================
       INITIALIZATION
       ============================================================ */

    /*
     * Completely disable browser scroll restoration.
     *
     * JavaScript owns the deep-link movement.
     */
    if (
        "scrollRestoration" in
        history
    ) {
        history.scrollRestoration =
            "manual";
    }

    /*
     * Make sure CSS cannot introduce another smooth
     * scrolling implementation.
     */
    document.documentElement.style
        .scrollBehavior = "auto";

    /*
     * IMPORTANT:
     *
     * If this page started with a hash, the hash was already
     * captured and removed at the very beginning of this file.
     *
     * Therefore the page is currently at the top and the
     * browser cannot jump to a dynamically-created element.
     */

    decorateAllVehicles();

    loadVehicles();

    /* ============================================================
       PAGE LOAD
       ============================================================ */

    window.addEventListener(
        "load",
        () => {
            decorateAllVehicles();

            /*
             * Only attempt the initial deep link if it has
             * not already been started.
             */
            if (
                initialDeepLinkModel &&
                !initialDeepLinkHandled
            ) {
                waitForInitialDeepLink();
            }
        }
    );

})(jQuery);