(($) => {
    "use strict";

    /*
     * ============================================================
     * LUXURY AUTOS
     * Advanced deep-link navigation
     * ============================================================
     *
     * IMPORTANT:
     *
     * Browsers perform native hash scrolling before JavaScript
     * finishes loading the page.
     *
     * Example:
     *
     * /view/respected.html/#zr3806str
     *
     * The browser can automatically jump to #zr3806str before
     * our premium animation starts.
     *
     * We temporarily remove the hash during initial page loading,
     * force the page to the top, render the vehicles, then restore
     * the hash and perform our own smooth scroll.
     *
     * This means a direct deep link always animates from the top.
     *
     * Normal clicks inside the page still animate from the current
     * scroll position.
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
     * Prevent browser native restoration from fighting
     * with our own navigation system.
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
     * If this page was opened with a hash, immediately remove
     * the hash before the browser performs its native fragment
     * navigation.
     *
     * The hash will be restored after vehicles are rendered.
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
         * Make absolutely sure the initial position is top.
         */
        window.scrollTo(
            0,
            0
        );
    }

    /*
     * ============================================================
     * LUXURY AUTOS
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
     * ALWAYS generates:
     *
     * /view/respected.html/#zr3806str
     *
     * NOT:
     *
     * /view/respected.html#zr3806str
     * ============================================================
     */

    function buildVehicleUrl(model) {
        const url =
            new URL(
                window.location.href
            );

        /*
         * Force the pathname to end with "/".
         *
         * This creates:
         *
         * /respected.html/#model
         */
        if (
            !url.pathname.endsWith("/")
        ) {
            url.pathname += "/";
        }

        /*
         * Clear any existing hash first.
         */
        url.hash = "";

        /*
         * Let URL handle proper fragment encoding.
         */
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
         * Link icon
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
     * ADVANCED EASING
     * ============================================================
     */

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

    /*
     * ============================================================
     * PREMIUM SMOOTH SCROLL
     * ============================================================
     */

    let activeScrollFrame =
        null;

    function premiumScrollTo(
        targetY,
        duration = 1500
    ) {
        /*
         * Cancel an existing custom animation.
         */
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

        let startTime =
            null;

        function animate(
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
                progress < 1
            ) {
                activeScrollFrame =
                    requestAnimationFrame(
                        animate
                    );
            } else {
                activeScrollFrame =
                    null;

                /*
                 * Force the exact final position.
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
         * Activate selected section.
         */
        vehicle.classList.add(
            "hash-target"
        );

        /*
         * IMPORTANT:
         *
         * For a direct browser deep-link, start from the TOP.
         *
         * For a normal link click, fromTop is false and the
         * current scroll position is preserved.
         */
        if (fromTop) {
            window.scrollTo(
                0,
                0
            );
        }

        /*
         * Wait for layout before calculating target.
         */
        requestAnimationFrame(
            () => {
                const rect =
                    vehicle.getBoundingClientRect();

                const viewportHeight =
                    window.innerHeight;

                /*
                 * Center the vehicle in the viewport.
                 */
                const vehicleCenter =
                    rect.top +
                    rect.height /
                        2;

                const viewportCenter =
                    viewportHeight /
                    2;

                const delta =
                    vehicleCenter -
                    viewportCenter;

                /*
                 * IMPORTANT:
                 *
                 * Calculate target from the CURRENT position.
                 *
                 * This means:
                 *
                 * Direct URL:
                 *   current position = 0
                 *
                 * Normal click:
                 *   current position = user's current scroll
                 */
                let targetY =
                    window.scrollY +
                    delta;

                /*
                 * Account for fixed heading.
                 */
                const headerOffset =
                    window.innerWidth <=
                    700
                        ? 25
                        : 35;

                targetY -=
                    headerOffset;

                targetY =
                    Math.max(
                        0,
                        targetY
                    );

                /*
                 * Prevent scrolling beyond document.
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

                if (animated) {
                    premiumScrollTo(
                        targetY,
                        1500
                    );
                } else {
                    window.scrollTo(
                        0,
                        targetY
                    );
                }

                /*
                 * Keep focus effect.
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

        return true;
    }

    /*
     * ============================================================
     * WAIT FOR HASH TARGET
     * ============================================================
     */

    let hashTimer =
        null;

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
                return;
            }

            /*
             * Wait up to 12 seconds for
             * dynamically loaded vehicles.
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

            /*
             * Restore the URL only after
             * native browser hash navigation
             * has been neutralized.
             */
            if (initialHashModel) {
                restoreInitialHash();
            }

            /*
             * Deep-link from TOP.
             */
            scrollToHashWhenReady(
                true,
                initialHashModel,
                Boolean(
                    initialHashModel
                )
            );

            /*
             * Prevent this from being used
             * repeatedly as a new initial hash.
             */
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

                    /*
                     * Restore exact slash + hash URL.
                     */
                    if (
                        initialHashModel
                    ) {
                        restoreInitialHash();
                    }

                    /*
                     * Deep-link from TOP.
                     */
                    scrollToHashWhenReady(
                        true,
                        initialHashModel,
                        Boolean(
                            initialHashModel
                        )
                    );

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
                    }

                    scrollToHashWhenReady(
                        true,
                        initialHashModel,
                        Boolean(
                            initialHashModel
                        )
                    );

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

            /*
             * Build:
             *
             * /respected.html/#zr3806str
             */
            const fullUrl =
                buildVehicleUrl(
                    model
                );

            /*
             * Update browser URL.
             *
             * pushState does NOT trigger hashchange,
             * which is exactly what we want because we
             * manually control the animation.
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
             * Scroll from the user's CURRENT position.
             *
             * Do NOT use fromTop here.
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
     *
     * Handles manually changed URLs such as:
     *
     * /view/respected.html/#zr3806str
     * ============================================================
     */

    window.addEventListener(
        "hashchange",
        () => {
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
     */

    window.addEventListener(
        "load",
        () => {
            decorateAllVehicles();

            /*
             * Only run these extra checks for a normal
             * hash already present in the URL.
             *
             * Initial deep-link navigation is already
             * handled by loadVehicles().
             */
            const currentModel =
                getHashModel();

            if (
                currentModel
            ) {
                scrollToHashWhenReady(
                    true,
                    currentModel,
                    false
                );
            }

            setTimeout(
                () => {
                    decorateAllVehicles();

                    const model =
                        getHashModel();

                    if (model) {
                        scrollToHashWhenReady(
                            true,
                            model,
                            false
                        );
                    }
                },
                350
            );

            setTimeout(
                () => {
                    decorateAllVehicles();

                    const model =
                        getHashModel();

                    if (model) {
                        scrollToHashWhenReady(
                            true,
                            model,
                            false
                        );
                    }
                },
                1000
            );

            setTimeout(
                () => {
                    decorateAllVehicles();

                    const model =
                        getHashModel();

                    if (model) {
                        scrollToHashWhenReady(
                            true,
                            model,
                            false
                        );
                    }
                },
                2000
            );
        }
    );

})(jQuery);