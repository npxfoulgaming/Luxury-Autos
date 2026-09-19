(($) => {
    "use strict";

    /*
     * ============================================================
     * LUXURY AUTOS
     * ADVANCED VEHICLE HASH NAVIGATION
     * ============================================================
     *
     * Features:
     *
     * 1. Direct deep-link:
     *
     *    /view/respected.html/#zr3806str
     *
     *    Starts from the top and smoothly travels to the vehicle.
     *
     * 2. Normal vehicle-link click:
     *
     *    Starts from the user's CURRENT scroll position.
     *
     * 3. Target below current position:
     *
     *    Smooth downward cinematic scroll.
     *
     * 4. Target above current position:
     *
     *    Smooth upward cinematic scroll.
     *
     * 5. Distance-aware animation:
     *
     *    Short distance = shorter animation.
     *    Long distance  = longer animation.
     *
     * 6. Existing animations are cancelled before
     *    a new navigation starts.
     *
     * 7. Link icon belongs to the color row:
     *
     *    Normal:
     *    LINK | BLACK | WHITE | RED | GREEN | BLUE
     *
     *    Inverted:
     *    BLACK | WHITE | RED | GREEN | BLUE | LINK
     *
     * ============================================================
     */


    /*
     * ============================================================
     * INITIAL HASH
     * ============================================================
     */

    let initialHash =
        window.location.hash || "";

    let initialHashModel = "";

    if (
        initialHash &&
        initialHash.length > 1
    ) {
        try {
            initialHashModel =
                decodeURIComponent(
                    initialHash.substring(1)
                ).trim();
        } catch {
            initialHashModel =
                initialHash
                    .substring(1)
                    .trim();
        }
    }


    /*
     * ============================================================
     * HISTORY SCROLL RESTORATION
     * ============================================================
     */

    try {
        if (
            "scrollRestoration" in
            window.history
        ) {
            window.history.scrollRestoration =
                "manual";
        }
    } catch {
        // Ignore unsupported browsers.
    }


    /*
     * ============================================================
     * PREVENT NATIVE HASH JUMP
     * ============================================================
     *
     * The browser may attempt to jump directly to:
     *
     * #vehicle
     *
     * before our JavaScript is ready.
     *
     * Remove the hash immediately and restore it later.
     */

    if (initialHashModel) {
        const cleanInitialUrl =
            window.location.pathname +
            window.location.search;

        try {
            window.history.replaceState(
                {
                    luxuryAutosInitialHash:
                        initialHashModel
                },
                "",
                cleanInitialUrl
            );
        } catch {
            // Ignore history API errors.
        }

        window.scrollTo(
            0,
            0
        );
    }


    /*
     * ============================================================
     * PAGE DATA
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


    /*
     * ============================================================
     * PRICE FORMATTER
     * ============================================================
     */

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


    /*
     * ============================================================
     * BACKGROUND
     * ============================================================
     */

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


    /*
     * ============================================================
     * VEHICLE CONTAINER
     * ============================================================
     */

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


    /*
     * ============================================================
     * VEHICLE MODEL
     * ============================================================
     */

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


    /*
     * ============================================================
     * HASH
     * ============================================================
     */

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


    /*
     * ============================================================
     * URL
     * ============================================================
     */

    function buildVehicleUrl(model) {
        const url =
            new URL(
                window.location.href
            );

        /*
         * Always force:
         *
         * /page.html/#model
         *
         * instead of:
         *
         * /page.html#model
         */

        if (
            !url.pathname.endsWith("/")
        ) {
            url.pathname += "/";
        }

        url.hash = "";

        url.hash = model;

        return url.href;
    }


    /*
     * ============================================================
     * RESTORE INITIAL HASH
     * ============================================================
     */

    function restoreInitialHash() {
        if (!initialHashModel) {
            return;
        }

        const targetUrl =
            buildVehicleUrl(
                initialHashModel
            );

        try {
            window.history.replaceState(
                {
                    vehicle:
                        initialHashModel
                },
                "",
                targetUrl
            );
        } catch {
            // Ignore history API errors.
        }
    }


    /*
     * ============================================================
     * FIND VEHICLE
     * ============================================================
     */

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


    /*
     * ============================================================
     * COPY TO CLIPBOARD
     * ============================================================
     */

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


    /*
     * ============================================================
     * LINK ICON
     * ============================================================
     */

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


    /*
     * ============================================================
     * DECORATE VEHICLE
     * ============================================================
     */

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
         * VEHICLE NAME
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
         * COLOR ROW
         * --------------------------------------------------------
         */

        let colors =
            details.querySelector(
                ":scope > .colors"
            );

        /*
         * If older/static HTML already has
         * a colors container, keep it.
         */

        if (!colors) {
            colors =
                document.createElement(
                    "div"
                );

            colors.className =
                "colors";

            details.appendChild(
                colors
            );
        }


        /*
         * --------------------------------------------------------
         * LINK ICON
         * --------------------------------------------------------
         */

        let link =
            colors.querySelector(
                ":scope > .vehicle-link"
            );

        if (!link) {
            link =
                createLinkIcon(
                    model
                );
        } else {
            link.href =
                buildVehicleUrl(
                    model
                );

            link.dataset.model =
                model;
        }

        /*
         * Remove duplicate icons.
         */

        colors
            .querySelectorAll(
                ":scope > .vehicle-link"
            )
            .forEach(
                (duplicate) => {
                    if (
                        duplicate !==
                        link
                    ) {
                        duplicate.remove();
                    }
                }
            );


        /*
         * ========================================================
         * IMPORTANT ICON POSITION
         * ========================================================
         *
         * Normal vehicle:
         *
         * LINK | BLACK | WHITE | RED | GREEN | BLUE
         *
         * Inverted vehicle:
         *
         * BLACK | WHITE | RED | GREEN | BLUE | LINK
         */

        if (
            vehicle.classList.contains(
                "invert"
            )
        ) {
            colors.appendChild(
                link
            );
        } else {
            colors.insertBefore(
                link,
                colors.firstElementChild
            );
        }
    }


    /*
     * ============================================================
     * DECORATE ALL VEHICLES
     * ============================================================
     */

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


    /*
     * ============================================================
     * PREMIUM EASING
     * ============================================================
     */

    function easeInOutQuint(t) {
        return t < 0.5
            ? 16 *
                t *
                t *
                t *
                t *
                t
            : 1 -
                Math.pow(
                    -2 * t + 2,
                    5
                ) /
                    2;
    }


    /*
     * ============================================================
     * SCROLL STATE
     * ============================================================
     */

    let activeScrollFrame =
        null;

    let scrollAnimationToken =
        0;


    /*
     * ============================================================
     * CANCEL SCROLL
     * ============================================================
     */

    function cancelPremiumScroll() {
        scrollAnimationToken++;

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


    /*
     * ============================================================
     * ADAPTIVE SCROLL DURATION
     * ============================================================
     *
     * The farther the destination is,
     * the longer the animation becomes.
     *
     * This prevents:
     *
     * 50px  -> 1500ms
     *
     * while also avoiding:
     *
     * 5000px -> 400ms
     */

    function getScrollDuration(
        distance
    ) {
        const absoluteDistance =
            Math.abs(distance);

        if (
            absoluteDistance < 120
        ) {
            return 500;
        }

        if (
            absoluteDistance < 400
        ) {
            return 700;
        }

        if (
            absoluteDistance < 900
        ) {
            return 950;
        }

        if (
            absoluteDistance < 1600
        ) {
            return 1200;
        }

        if (
            absoluteDistance < 2800
        ) {
            return 1500;
        }

        if (
            absoluteDistance < 4500
        ) {
            return 1800;
        }

        return 2150;
    }


    /*
     * ============================================================
     * PREMIUM SMART SCROLL
     * ============================================================
     */

    function premiumScrollTo(
        targetY,
        duration = null
    ) {
        cancelPremiumScroll();

        const startY =
            window.scrollY;

        const distance =
            targetY -
            startY;

        if (
            Math.abs(distance) < 2
        ) {
            window.scrollTo(
                0,
                targetY
            );

            return;
        }

        /*
         * Respect reduced-motion accessibility.
         */

        if (
            window.matchMedia &&
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
        ) {
            window.scrollTo(
                0,
                targetY
            );

            return;
        }

        const animationDuration =
            duration ||
            getScrollDuration(
                distance
            );

        const animationToken =
            scrollAnimationToken;

        let startTime =
            null;

        function animate(
            currentTime
        ) {
            /*
             * A new scroll has started.
             */

            if (
                animationToken !==
                scrollAnimationToken
            ) {
                return;
            }

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
                        animationDuration,
                    1
                );

            /*
             * Strong acceleration at the beginning,
             * long deceleration at the end.
             */

            const eased =
                easeInOutQuint(
                    progress
                );

            const currentY =
                startY +
                distance *
                    eased;

            window.scrollTo(
                0,
                currentY
            );

            if (
                progress < 1
            ) {
                activeScrollFrame =
                    requestAnimationFrame(
                        animate
                    );
            } else {
                activeScrollFrame =
                    null;

                window.scrollTo(
                    0,
                    targetY
                );
            }
        }

        activeScrollFrame =
            requestAnimationFrame(
                animate
            );
    }


    /*
     * ============================================================
     * CALCULATE SMART TARGET
     * ============================================================
     */

    function calculateVehicleTarget(
        vehicle
    ) {
        const rect =
            vehicle.getBoundingClientRect();

        const viewportHeight =
            window.innerHeight;

        /*
         * Fixed heading offset.
         */

        const headerOffset =
            window.innerWidth <= 700
                ? 25
                : 35;

        /*
         * Center the vehicle.
         *
         * This works whether the target is:
         *
         * - above
         * - below
         * - partially visible
         * - completely visible
         */

        const vehicleCenter =
            rect.top +
            rect.height / 2;

        const desiredCenter =
            viewportHeight / 2 +
            headerOffset / 2;

        const delta =
            vehicleCenter -
            desiredCenter;

        let targetY =
            window.scrollY +
            delta;

        /*
         * Keep target inside page.
         */

        targetY =
            Math.max(
                0,
                targetY
            );

        const maxScroll =
            Math.max(
                0,
                document.documentElement
                    .scrollHeight -
                    window.innerHeight
            );

        targetY =
            Math.min(
                targetY,
                maxScroll
            );

        return targetY;
    }


    /*
     * ============================================================
     * VEHICLE TARGET STATE
     * ============================================================
     */

    let highlightTimer =
        null;

    function clearVehicleHighlights() {
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
    }


    /*
     * ============================================================
     * SCROLL TO VEHICLE
     * ============================================================
     */

    function scrollToVehicle(
        model,
        animated = true,
        fromTop = false
    ) {
        const vehicle =
            findVehicle(model);

        if (!vehicle) {
            return false;
        }

        /*
         * Stop previous animation immediately.
         */

        cancelPremiumScroll();

        /*
         * Clear previous highlight.
         */

        clearVehicleHighlights();

        if (highlightTimer) {
            clearTimeout(
                highlightTimer
            );

            highlightTimer =
                null;
        }

        /*
         * Highlight current target.
         */

        vehicle.classList.add(
            "hash-target"
        );


        /*
         * --------------------------------------------------------
         * DIRECT DEEP LINK
         * --------------------------------------------------------
         *
         * Start from the absolute top.
         */

        if (fromTop) {
            window.scrollTo(
                0,
                0
            );
        }


        /*
         * Wait one frame so the browser has
         * a fresh layout before measuring.
         */

        requestAnimationFrame(
            () => {
                const targetY =
                    calculateVehicleTarget(
                        vehicle
                    );

                const distance =
                    targetY -
                    window.scrollY;

                /*
                 * Smart duration based on actual distance.
                 */

                const duration =
                    getScrollDuration(
                        distance
                    );

                if (animated) {
                    premiumScrollTo(
                        targetY,
                        duration
                    );
                } else {
                    window.scrollTo(
                        0,
                        targetY
                    );
                }


                /*
                 * Keep target highlight long enough
                 * for the navigation to complete.
                 */

                const highlightDuration =
                    Math.max(
                        2500,
                        duration +
                            1200
                    );

                highlightTimer =
                    setTimeout(
                        () => {
                            vehicle.classList.remove(
                                "hash-target"
                            );

                            highlightTimer =
                                null;
                        },
                        highlightDuration
                    );
            }
        );

        return true;
    }


    /*
     * ============================================================
     * HASH TARGET LOADING
     * ============================================================
     */

    let hashTimer =
        null;

    let lastNavigationModel =
        "";

    function scrollToHashWhenReady(
        animated = true,
        forcedModel = "",
        fromTop = false
    ) {
        const model =
            forcedModel ||
            getHashModel();

        if (!model) {
            return;
        }

        /*
         * Avoid duplicate animations caused by
         * repeated lifecycle events.
         */

        if (
            lastNavigationModel ===
                model &&
            !fromTop &&
            findVehicle(model)
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

        let attempts = 0;

        function attempt() {
            attempts++;

            decorateAllVehicles();

            const found =
                scrollToVehicle(
                    model,
                    animated,
                    fromTop
                );

            if (found) {
                lastNavigationModel =
                    model;

                hashTimer =
                    null;

                return;
            }

            /*
             * Wait for dynamically loaded vehicles.
             */

            if (
                attempts < 120
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


    /*
     * ============================================================
     * RENDER VEHICLE
     * ============================================================
     */

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

        element.dataset.model =
            model;

        element.id =
            model;


        /*
         * ========================================================
         * DETAILS
         * ========================================================
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
         * ========================================================
         * COLORS
         * ========================================================
         */

        const colors =
            document.createElement(
                "div"
            );

        colors.className =
            "colors";


        /*
         * Link will be inserted by
         * decorateVehicle().
         */

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

                colorElement.setAttribute(
                    "aria-label",
                    colorLabel
                );

                colors.appendChild(
                    colorElement
                );
            }
        );

        details.appendChild(
            colors
        );


        /*
         * ========================================================
         * IMAGE
         * ========================================================
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


    /*
     * ============================================================
     * LOAD VEHICLES
     * ============================================================
     */

    function loadVehicles() {
        const container =
            getVehiclesContainer();

        if (!container) {
            scrollToHashWhenReady(
                false,
                initialHashModel,
                Boolean(
                    initialHashModel
                )
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

            if (initialHashModel) {
                restoreInitialHash();

                scrollToHashWhenReady(
                    true,
                    initialHashModel,
                    true
                );
            }

            initialHashModel =
                "";

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


                    if (
                        initialHashModel
                    ) {
                        restoreInitialHash();

                        scrollToHashWhenReady(
                            true,
                            initialHashModel,
                            true
                        );
                    }

                    initialHashModel =
                        "";
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

                    if (
                        initialHashModel
                    ) {
                        restoreInitialHash();

                        scrollToHashWhenReady(
                            true,
                            initialHashModel,
                            true
                        );
                    }

                    initialHashModel =
                        "";
                }
            );
    }


    /*
     * ============================================================
     * FOOTER
     * ============================================================
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


    /*
     * ============================================================
     * COLORS
     * ============================================================
     */

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


    /*
     * ============================================================
     * VEHICLE LINK CLICK
     * ============================================================
     */

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
             * Update URL without triggering
             * native browser fragment scrolling.
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
             * Allow another navigation to this
             * same model later.
             */

            lastNavigationModel =
                "";


            /*
             * IMPORTANT:
             *
             * false = DON'T start from top.
             *
             * The animation begins exactly
             * from the user's current position.
             */

            scrollToVehicle(
                model,
                true,
                false
            );


            /*
             * Copy full URL.
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


    /*
     * ============================================================
     * HASH CHANGE
     * ============================================================
     */

    window.addEventListener(
        "hashchange",
        () => {
            const model =
                getHashModel();

            if (!model) {
                return;
            }

            lastNavigationModel =
                "";

            scrollToHashWhenReady(
                true,
                model,
                false
            );
        }
    );


    /*
     * ============================================================
     * BACK / FORWARD
     * ============================================================
     */

    window.addEventListener(
        "popstate",
        () => {
            const model =
                getHashModel();

            if (!model) {
                return;
            }

            lastNavigationModel =
                "";

            scrollToHashWhenReady(
                true,
                model,
                false
            );
        }
    );


    /*
     * ============================================================
     * ESCAPE
     * ============================================================
     */

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


    /*
     * ============================================================
     * INITIALIZATION
     * ============================================================
     */

    decorateAllVehicles();

    loadVehicles();


    /*
     * ============================================================
     * PAGE LOAD
     * ============================================================
     *
     * IMPORTANT:
     *
     * We intentionally do NOT repeatedly call
     * scrollToHashWhenReady() at:
     *
     * 350ms
     * 1000ms
     * 2000ms
     *
     * Those repeated calls were capable of restarting
     * the premium animation while it was already running.
     */

    window.addEventListener(
        "load",
        () => {
            decorateAllVehicles();
        }
    );


})(jQuery);