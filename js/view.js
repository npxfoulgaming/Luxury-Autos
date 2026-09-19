(($) => {
    "use strict";

    /*
     * ============================================================
     * LUXURY AUTOS
     * Advanced deep-link navigation
     * ============================================================
     *
     * Deep links:
     *
     * /view/special.html/#c10
     *
     * The browser's native hash navigation is disabled for the
     * initial load.
     *
     * JavaScript then performs a premium continuous scroll.
     *
     * IMPORTANT:
     *
     * The scroll duration is calculated from the distance.
     *
     * Example:
     *
     *   500px   -> short smooth movement
     *   3000px  -> slower movement
     *   8000px  -> long cinematic movement
     *
     * This makes navigation feel like REAL scrolling instead of
     * teleporting to the destination.
     * ============================================================
     */

    /*
     * ============================================================
     * INITIAL HASH PROTECTION
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
     * Browser history should not restore an old scroll position
     * while our own navigation system is running.
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
     * Remove the initial hash immediately so the browser does
     * not perform its own instant/native fragment jump.
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

        /*
         * Start the custom navigation from the very top.
         */
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
     * MODEL
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
     *
     * Always generates:
     *
     * /view/special.html/#c10
     *
     * instead of:
     *
     * /view/special.html#c10
     * ============================================================
     */

    function buildVehicleUrl(model) {
        const url =
            new URL(
                window.location.href
            );

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
     * CLIP VALUE
     * ============================================================
     */

    function clamp(
        value,
        min,
        max
    ) {
        return Math.min(
            Math.max(
                value,
                min
            ),
            max
        );
    }

    /*
     * ============================================================
     * COPY
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

        /*
         * Legacy fallback.
         */
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
         * Action / colors row
         * --------------------------------------------------------
         */

        let colors =
            details.querySelector(
                ":scope > .colors"
            );

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
         * Link icon
         * --------------------------------------------------------
         */

        let link =
            colors.querySelector(
                ".vehicle-link"
            );

        if (!link) {
            link =
                createLinkIcon(
                    model
                );

            /*
             * NORMAL:
             *
             * [Link] [Black] [White] [Red] [Green] [Blue]
             *
             * INVERT:
             *
             * [Black] [White] [Red] [Green] [Blue] [Link]
             *
             * CSS controls the actual ordering.
             */
            colors.prepend(
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

    /*
     * ============================================================
     * DECORATE ALL
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
     * PREMIUM SCROLL EASING
     * ============================================================
     *
     * Cubic easing is intentionally used instead of an aggressive
     * quartic/eased jump.
     *
     * This produces a more natural:
     *
     * start
     *   ↓
     * gradual acceleration
     *   ↓
     * steady movement
     *   ↓
     * gradual braking
     *   ↓
     * destination
     * ============================================================
     */

    function easeInOutCubic(t) {
        return t < 0.5
            ? 4 *
                t *
                t *
                t
            : 1 -
                Math.pow(
                    -2 * t + 2,
                    3
                ) /
                    2;
    }

    /*
     * ============================================================
     * SCROLL DURATION
     * ============================================================
     *
     * This is the most important change.
     *
     * The old code:
     *
     *     duration = 1500
     *
     * meant:
     *
     *     300px  -> 1.5 sec
     *     5000px -> 1.5 sec
     *     10000px -> 1.5 sec
     *
     * which feels like teleporting.
     *
     * Now duration is proportional to distance.
     * ============================================================
     */

    function getScrollDuration(
        distance
    ) {
        const absoluteDistance =
            Math.abs(
                distance
            );

        /*
         * Small movement.
         */
        if (
            absoluteDistance < 300
        ) {
            return 900;
        }

        /*
         * Distance-based movement.
         *
         * 1000px  ~= 1.9 sec
         * 3000px  ~= 3.2 sec
         * 5000px  ~= 4.4 sec
         * 8000px  ~= 6.3 sec
         * 12000px ~= 8.5 sec
         *
         * Maximum keeps extremely long pages from becoming
         * unnecessarily slow.
         */
        const duration =
            1250 +
            absoluteDistance *
                0.62;

        return clamp(
            duration,
            1100,
            9000
        );
    }

    /*
     * ============================================================
     * ACTIVE SCROLL STATE
     * ============================================================
     */

    let activeScrollFrame =
        null;

    let activeScrollToken =
        0;

    let scrollAnimationRunning =
        false;

    /*
     * ============================================================
     * CANCEL CUSTOM SCROLL
     * ============================================================
     *
     * If the user manually wheels/touches while the premium
     * animation is running, give control back to the user.
     * ============================================================
     */

    function cancelPremiumScroll() {
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

        activeScrollToken++;

        scrollAnimationRunning =
            false;
    }

    /*
     * User interaction should interrupt the custom movement.
     */
    window.addEventListener(
        "wheel",
        () => {
            if (
                scrollAnimationRunning
            ) {
                cancelPremiumScroll();
            }
        },
        {
            passive: true
        }
    );

    window.addEventListener(
        "touchstart",
        () => {
            if (
                scrollAnimationRunning
            ) {
                cancelPremiumScroll();
            }
        },
        {
            passive: true
        }
    );

    /*
     * ============================================================
     * PREMIUM CONTINUOUS SCROLL
     * ============================================================
     */

    function premiumScrollTo(
        targetY,
        customDuration = null
    ) {
        /*
         * Cancel any previous animation.
         */
        cancelPremiumScroll();

        const startY =
            window.scrollY;

        const distance =
            targetY -
            startY;

        if (
            Math.abs(distance) < 3
        ) {
            window.scrollTo(
                0,
                targetY
            );

            return;
        }

        /*
         * Automatically calculate duration from distance.
         */
        const duration =
            customDuration ||
            getScrollDuration(
                distance
            );

        const token =
            activeScrollToken;

        let startTime =
            null;

        scrollAnimationRunning =
            true;

        function animate(
            currentTime
        ) {
            /*
             * Stop if a newer animation has started or the user
             * interrupted the current one.
             */
            if (
                token !==
                activeScrollToken
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
                        duration,
                    1
                );

            const eased =
                easeInOutCubic(
                    progress
                );

            /*
             * This is continuous movement.
             *
             * We always calculate from the ORIGINAL starting
             * position, so the browser never teleports.
             */
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

                scrollAnimationRunning =
                    false;

                /*
                 * Exact final position.
                 */
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
         * Remove old target state.
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
         * Highlight current vehicle.
         */
        vehicle.classList.add(
            "hash-target"
        );

        /*
         * Direct URL navigation starts from the top.
         *
         * Normal clicks remain at the current scroll position.
         */
        if (fromTop) {
            cancelPremiumScroll();

            window.scrollTo(
                0,
                0
            );
        }

        /*
         * Wait one frame so layout/images/vehicle dimensions are
         * available before calculating the destination.
         */
        requestAnimationFrame(
            () => {
                const rect =
                    vehicle.getBoundingClientRect();

                const viewportHeight =
                    window.innerHeight;

                /*
                 * Center the vehicle.
                 */
                const vehicleCenter =
                    rect.top +
                    rect.height /
                        2;

                const viewportCenter =
                    viewportHeight /
                    2;

                /*
                 * Difference between where the vehicle is now and
                 * where we want it.
                 */
                const delta =
                    vehicleCenter -
                    viewportCenter;

                /*
                 * IMPORTANT:
                 *
                 * targetY is calculated from CURRENT scrollY.
                 *
                 * Therefore:
                 *
                 * bottom -> top
                 * top -> bottom
                 * middle -> any vehicle
                 *
                 * all work naturally.
                 */
                let targetY =
                    window.scrollY +
                    delta;

                /*
                 * Small visual offset for the fixed heading.
                 */
                const headerOffset =
                    window.innerWidth <=
                    700
                        ? 20
                        : 30;

                targetY -=
                    headerOffset;

                targetY =
                    Math.max(
                        0,
                        targetY
                    );

                /*
                 * Never exceed document bottom.
                 */
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

                /*
                 * Distance is based on CURRENT position.
                 *
                 * This is what allows the duration to adapt when
                 * navigating from very far away.
                 */
                const distance =
                    targetY -
                    window.scrollY;

                if (animated) {
                    premiumScrollTo(
                        targetY,
                        getScrollDuration(
                            distance
                        )
                    );
                } else {
                    cancelPremiumScroll();

                    window.scrollTo(
                        0,
                        targetY
                    );
                }

                /*
                 * Remove highlight after the movement finishes.
                 *
                 * Longer scrolls need more time before removing it.
                 */
                const highlightTime =
                    animated
                        ? clamp(
                            getScrollDuration(
                                distance
                            ) +
                                1800,
                            3000,
                            11000
                        )
                        : 2800;

                setTimeout(
                    () => {
                        vehicle.classList.remove(
                            "hash-target"
                        );
                    },
                    highlightTime
                );
            }
        );

        return true;
    }

    /*
     * ============================================================
     * WAIT FOR HASH TARGET
     * ============================================================
     */

    let hashTimer =
        null;

    let hashNavigationRunning =
        false;

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

        if (hashTimer) {
            clearTimeout(
                hashTimer
            );

            hashTimer =
                null;
        }

        let attempts = 0;

        /*
         * Prevent duplicate calls from restarting the same
         * navigation.
         */
        if (
            hashNavigationRunning &&
            !forcedModel
        ) {
            return;
        }

        hashNavigationRunning =
            true;

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
                hashNavigationRunning =
                    false;

                hashTimer =
                    null;

                return;
            }

            /*
             * Wait for dynamically rendered vehicles.
             *
             * 120 attempts x 100ms = 12 seconds.
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
                hashNavigationRunning =
                    false;

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
         * COLORS + LINK
         * ========================================================
         *
         * The link is inserted into this same row.
         *
         * Normal:
         *
         * [Link] [Black] [White] [Red] [Green] [Blue]
         *
         * Invert:
         *
         * [Black] [White] [Red] [Green] [Blue] [Link]
         * ========================================================
         */

        const colors =
            document.createElement(
                "div"
            );

        colors.className =
            "colors";

        const link =
            createLinkIcon(
                model
            );

        /*
         * Link is initially first.
         *
         * CSS changes its order for inverted vehicles.
         */
        colors.appendChild(
            link
        );

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
         * ========================================================
         * STATIC HTML VEHICLES
         * ========================================================
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

                /*
                 * Direct deep-link:
                 *
                 * TOP -> TARGET
                 */
                scrollToHashWhenReady(
                    true,
                    initialHashModel,
                    true
                );

                initialHashModel =
                    "";
            }

            return;
        }

        /*
         * ========================================================
         * DYNAMIC JSON
         * ========================================================
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

                        /*
                         * TOP -> TARGET
                         */
                        scrollToHashWhenReady(
                            true,
                            initialHashModel,
                            true
                        );

                        initialHashModel =
                            "";
                    }
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

                        initialHashModel =
                            "";
                    }
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
     * LINK CLICK
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
             * Update URL without triggering native hash
             * navigation.
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
             * IMPORTANT:
             *
             * false means:
             *
             * DO NOT go to top.
             *
             * Start from the user's current position.
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
            /*
             * User manually changed the hash.
             *
             * Keep the CURRENT position.
             */
            scrollToHashWhenReady(
                true,
                "",
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

            /*
             * Browser history navigation should also move from
             * the CURRENT position instead of teleporting.
             */
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
     * The old code called hash navigation at:
     *
     *   load
     *   +350ms
     *   +1000ms
     *   +2000ms
     *
     * That could restart the animation while it was already
     * moving.
     *
     * We intentionally do NOT do that anymore.
     *
     * loadVehicles() owns initial deep-link navigation.
     * hashchange/popstate own later navigation.
     * ============================================================
     */

    window.addEventListener(
        "load",
        () => {
            decorateAllVehicles();

            /*
             * Only handle a hash here if something external
             * restored/created one after the normal initialization.
             */
            const currentModel =
                getHashModel();

            if (
                currentModel &&
                !hashNavigationRunning
            ) {
                scrollToHashWhenReady(
                    true,
                    currentModel,
                    false
                );
            }
        }
    );

})(jQuery);