(($) => {
    "use strict";

    /*
     * ============================================================
     * LUXURY AUTOS
     * ADVANCED VEHICLE HASH NAVIGATION
     * ============================================================
     *
     * Vehicle URL:
     *
     * /view/legendary.html/#mst
     *
     * NORMAL:
     *
     * [BLACK] [WHITE] [RED] [GREEN] [BLUE] [LINK]
     *
     * INVERT:
     *
     * [LINK] [BLACK] [WHITE] [RED] [GREEN] [BLUE]
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


    /* ============================================================
       INITIAL HASH
       ============================================================ */

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


    /* ============================================================
       HISTORY
       ============================================================ */

    try {
        if (
            "scrollRestoration" in
            window.history
        ) {
            window.history.scrollRestoration =
                "manual";
        }
    } catch {}


    /* ============================================================
       URL HELPERS
       ============================================================ */

    function getCanonicalVehiclePath(
        pathname
    ) {
        let path =
            pathname ||
            window.location.pathname ||
            "/";

        path =
            path.replace(
                /\/+$/,
                ""
            );

        if (!path) {
            return "/";
        }

        /*
         * Keep exactly ONE slash before
         * the hash:
         *
         * /view/legendary.html/#mst
         */

        return `${path}/`;
    }


    function buildVehicleUrl(model) {
        if (!model) {
            return window.location.href;
        }

        const url =
            new URL(
                window.location.href
            );

        url.pathname =
            getCanonicalVehiclePath(
                url.pathname
            );

        url.hash =
            String(
                model
            ).trim();

        return url.href;
    }


    function buildCleanCanonicalUrl() {
        const url =
            new URL(
                window.location.href
            );

        url.pathname =
            getCanonicalVehiclePath(
                url.pathname
            );

        url.hash = "";

        return url.href;
    }


    /* ============================================================
       CANONICALIZE CURRENT URL
       ============================================================ */

    function canonicalizeCurrentUrl() {
        const currentPath =
            window.location.pathname;

        const canonicalPath =
            getCanonicalVehiclePath(
                currentPath
            );

        if (
            currentPath ===
            canonicalPath
        ) {
            return;
        }

        const url =
            new URL(
                window.location.href
            );

        url.pathname =
            canonicalPath;

        try {
            window.history.replaceState(
                window.history.state,
                "",
                url.href
            );
        } catch {}
    }


    canonicalizeCurrentUrl();


    /* ============================================================
       PREVENT NATIVE HASH JUMP
       ============================================================ */

    if (initialHashModel) {
        const cleanUrl =
            buildCleanCanonicalUrl();

        try {
            window.history.replaceState(
                {
                    luxuryAutosInitialHash:
                        initialHashModel
                },
                "",
                cleanUrl
            );
        } catch {}

        window.scrollTo(
            0,
            0
        );
    }


    /* ============================================================
       BACKGROUND
       ============================================================ */

    function escapeCssUrlValue(value) {
        return String(value)
            .replace(
                /\\/g,
                "\\\\"
            )
            .replace(
                /"/g,
                '\\"'
            )
            .replace(
                /\)/g,
                "\\)"
            );
    }


    function getConfiguredBackground() {
        const candidates = [
            document.body?.dataset?.background,
            document.body?.dataset?.bg,
            document.documentElement?.dataset?.background,
            document.documentElement?.dataset?.bg,

            document.querySelector(
                "#page[data-background]"
            )?.dataset?.background,

            document.querySelector(
                "#page[data-bg]"
            )?.dataset?.bg,

            document.querySelector(
                "[data-background]"
            )?.dataset?.background
        ];


        for (
            const candidate of candidates
        ) {
            if (
                candidate &&
                String(
                    candidate
                ).trim()
            ) {
                return String(
                    candidate
                ).trim();
            }
        }


        const inlineBackground =
            document.body?.style?.backgroundImage ||
            "";


        if (
            inlineBackground &&
            inlineBackground !== "none"
        ) {
            const match =
                inlineBackground.match(
                    /url\(["']?(.*?)["']?\)/i
                );

            if (
                match &&
                match[1]
            ) {
                return match[1];
            }
        }


        return "";
    }


    function setPageBackground() {
        let source =
            getConfiguredBackground();


        /*
         * Fallback:
         *
         * Use the first vehicle image
         * if no explicit background exists.
         */

        if (!source) {
            const firstImage =
                document.querySelector(
                    ".vehicle .image img"
                );

            if (firstImage) {
                source =
                    firstImage.currentSrc ||
                    firstImage.src ||
                    firstImage.getAttribute(
                        "src"
                    ) ||
                    "";
            }
        }


        if (!source) {
            return;
        }


        try {
            const absoluteUrl =
                new URL(
                    source,
                    window.location.href
                ).href;

            document.documentElement.style.setProperty(
                "--luxury-autos-background",
                `url("${escapeCssUrlValue(absoluteUrl)}")`
            );
        } catch {
            document.documentElement.style.setProperty(
                "--luxury-autos-background",
                `url("${escapeCssUrlValue(source)}")`
            );
        }
    }


    setPageBackground();


    /* ============================================================
       FIND VEHICLE
       ============================================================ */

    function findVehicle(model) {
        if (!model) {
            return null;
        }

        const wanted =
            String(
                model
            )
                .trim()
                .toLowerCase();


        const vehicles =
            document.querySelectorAll(
                ".vehicle"
            );


        for (
            const vehicle of vehicles
        ) {
            const dataModel =
                String(
                    vehicle.dataset.model ||
                    vehicle.id ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            if (
                dataModel ===
                wanted
            ) {
                return vehicle;
            }
        }


        return null;
    }


    /* ============================================================
       CLEAR ACTIVE LINK STATE
       ============================================================ */

    function clearActiveLinks() {
        document
            .querySelectorAll(
                ".vehicle.active-hash"
            )
            .forEach(
                (vehicle) => {
                    vehicle.classList.remove(
                        "active-hash"
                    );
                }
            );


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


        document
            .querySelectorAll(
                ".vehicle-link.active-link"
            )
            .forEach(
                (link) => {
                    link.classList.remove(
                        "active-link"
                    );
                }
            );


        document
            .querySelectorAll(
                ".colors.active-link-row"
            )
            .forEach(
                (colors) => {
                    colors.classList.remove(
                        "active-link-row"
                    );
                }
            );
    }


    /* ============================================================
       SYNC ACTIVE LINK
       ============================================================ */

    function syncActiveLink(model) {
        clearActiveLinks();

        if (!model) {
            return;
        }


        const vehicle =
            findVehicle(
                model
            );


        if (!vehicle) {
            return;
        }


        const link =
            vehicle.querySelector(
                ".vehicle-link"
            );


        const colors =
            vehicle.querySelector(
                ".colors"
            );


        vehicle.classList.add(
            "hash-target"
        );


        vehicle.classList.add(
            "active-hash"
        );


        if (link) {
            link.classList.add(
                "active-link"
            );
        }


        if (colors) {
            colors.classList.add(
                "active-link-row"
            );
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


        link.title =
            `Copy link to ${model}`;


        link.innerHTML = `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
            >
                <path
                    d="M10.59 13.41a1.99 1.99 0 0 0 2.82 0l3.59-3.59a2 2 0 0 0-2.83-2.83l-2.12 2.12"
                />

                <path
                    d="M13.41 10.59a1.99 1.99 0 0 0-2.82 0L7 14.18a2 2 0 0 0 2.83 2.83l2.12-2.12"
                />
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


        let model =
            vehicle.dataset.model ||
            vehicle.id ||
            "";


        model =
            String(
                model
            ).trim();


        if (!model) {
            return;
        }


        vehicle.id =
            model;


        vehicle.dataset.model =
            model;


        /* --------------------------------------------------------
           VEHICLE NAME
           -------------------------------------------------------- */

        const inner =
            vehicle.querySelector(
                ".details .inner"
            );


        if (inner) {
            const vehicleName =
                inner.querySelector(
                    ".vehicle-name"
                );


            if (vehicleName) {
                let nameSpan =
                    vehicleName.querySelector(
                        ":scope > span"
                    );


                if (!nameSpan) {
                    const text =
                        vehicleName
                            .textContent
                            .trim();


                    vehicleName.textContent =
                        "";


                    nameSpan =
                        document.createElement(
                            "span"
                        );


                    nameSpan.textContent =
                        text;


                    vehicleName.appendChild(
                        nameSpan
                    );
                }
            }
        }


        /* --------------------------------------------------------
           COLORS
           -------------------------------------------------------- */

        let colors =
            vehicle.querySelector(
                ".colors"
            );


        if (!colors) {
            colors =
                document.createElement(
                    "div"
                );


            colors.className =
                "colors";


            const details =
                vehicle.querySelector(
                    ".details"
                );


            if (details) {
                details.appendChild(
                    colors
                );
            } else {
                vehicle.appendChild(
                    colors
                );
            }
        }


        /* --------------------------------------------------------
           LINK
           -------------------------------------------------------- */

        let link =
            colors.querySelector(
                ".vehicle-link"
            );


        const duplicateLinks =
            colors.querySelectorAll(
                ".vehicle-link"
            );


        if (
            duplicateLinks.length >
            1
        ) {
            duplicateLinks.forEach(
                (
                    duplicate,
                    index
                ) => {
                    if (index > 0) {
                        duplicate.remove();
                    }
                }
            );
        }


        if (!link) {
            link =
                createLinkIcon(
                    model
                );


            colors.appendChild(
                link
            );
        }


        link.href =
            buildVehicleUrl(
                model
            );


        link.dataset.model =
            model;


        /* --------------------------------------------------------
           LINK POSITION
           -------------------------------------------------------- */

        /*
         * INVERT:
         *
         * [LINK] [BLACK] [WHITE] [RED] [GREEN] [BLUE]
         */

        if (
            vehicle.classList.contains(
                "invert"
            )
        ) {
            colors.insertBefore(
                link,
                colors.firstElementChild
            );
        }


        /*
         * NORMAL:
         *
         * [BLACK] [WHITE] [RED] [GREEN] [BLUE] [LINK]
         */

        else {
            colors.appendChild(
                link
            );
        }
    }


    /* ============================================================
       DECORATE ALL
       ============================================================ */

    function decorateAllVehicles() {
        document
            .querySelectorAll(
                ".vehicle"
            )
            .forEach(
                decorateVehicle
            );
    }


    /* ============================================================
       PREMIUM SCROLL ENGINE
       ============================================================ */

    let activeScrollFrame =
        null;


    let scrollAnimationToken =
        0;


    /*
     * Stop the existing scroll animation.
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
     * Smooth cinematic easing.
     *
     * The beginning and ending are soft,
     * while the middle moves naturally.
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
     * Calculate duration based on distance.
     *
     * Long-distance navigation gets more
     * time so it feels like actual scrolling
     * instead of a teleport.
     */

    function getScrollDuration(
        distance
    ) {
        const absoluteDistance =
            Math.abs(
                distance
            );


        /*
         * Minimum:
         *
         * 900ms
         *
         * Maximum:
         *
         * 3200ms
         */

        return Math.min(
            3200,
            Math.max(
                900,
                750 +
                    absoluteDistance *
                        1.15
            )
        );
    }


    /*
     * Actual continuous scrolling.
     *
     * IMPORTANT:
     *
     * startY is captured from the user's
     * CURRENT position.
     *
     * This means:
     *
     * current top -> target below
     *
     * OR
     *
     * current bottom -> target above
     *
     * both animate continuously.
     */

    function premiumScrollTo(
        targetY,
        duration
    ) {
        cancelPremiumScroll();


        const token =
            scrollAnimationToken;


        const startY =
            window.scrollY ||
            window.pageYOffset ||
            0;


        const distance =
            targetY -
            startY;


        /*
         * Already at the target.
         */

        if (
            Math.abs(
                distance
            ) < 2
        ) {
            window.scrollTo(
                0,
                targetY
            );

            return;
        }


        const startTime =
            performance.now();


        function frame(now) {
            /*
             * A newer navigation has
             * cancelled this animation.
             */

            if (
                token !==
                scrollAnimationToken
            ) {
                return;
            }


            const elapsed =
                now -
                startTime;


            const progress =
                Math.min(
                    1,
                    elapsed /
                        duration
                );


            const eased =
                easeInOutQuint(
                    progress
                );


            /*
             * Continuous movement:
             *
             * startY -> targetY
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
                progress <
                1
            ) {
                activeScrollFrame =
                    requestAnimationFrame(
                        frame
                    );
            } else {
                activeScrollFrame =
                    null;


                /*
                 * Final exact position.
                 */

                window.scrollTo(
                    0,
                    targetY
                );
            }
        }


        activeScrollFrame =
            requestAnimationFrame(
                frame
            );
    }


    /* ============================================================
       TARGET POSITION
       ============================================================ */

    function calculateVehicleTarget(
        vehicle
    ) {
        if (!vehicle) {
            return 0;
        }


        const rect =
            vehicle.getBoundingClientRect();


        const currentScroll =
            window.scrollY ||
            window.pageYOffset ||
            0;


        const viewportHeight =
            window.innerHeight ||
            document.documentElement
                .clientHeight;


        const mobile =
            window.innerWidth <=
            700;


        /*
         * Keep the target slightly above
         * absolute center so fixed header/footer
         * do not visually interfere.
         */

        const targetOffset =
            mobile
                ? 25
                : 35;


        const vehicleCenter =
            rect.top +
            rect.height /
                2;


        let target =
            currentScroll +
            vehicleCenter -
            viewportHeight /
                2 -
            targetOffset;


        const maxScroll =
            Math.max(
                0,
                document.documentElement
                    .scrollHeight -
                    viewportHeight
            );


        target =
            Math.max(
                0,
                Math.min(
                    target,
                    maxScroll
                )
            );


        return target;
    }


    /* ============================================================
       SCROLL TO VEHICLE
       ============================================================ */

    function scrollToVehicle(
        model,
        animated = true,
        fromTop = false
    ) {
        const vehicle =
            findVehicle(
                model
            );


        if (!vehicle) {
            return false;
        }


        /*
         * Stop the previous navigation.
         */

        cancelPremiumScroll();


        /*
         * Update active link immediately.
         */

        syncActiveLink(
            model
        );


        /*
         * Update active vehicle.
         */

        clearHashTarget();


        vehicle.classList.add(
            "hash-target"
        );


        /*
         * Deep-link behavior:
         *
         * Start from top.
         *
         * Then animate to the vehicle.
         */

        if (fromTop) {
            window.scrollTo(
                0,
                0
            );
        }


        /*
         * Wait for layout to settle.
         *
         * This is especially important
         * when vehicles were loaded from JSON.
         */

        requestAnimationFrame(
            () => {
                requestAnimationFrame(
                    () => {

                        const targetY =
                            calculateVehicleTarget(
                                vehicle
                            );


                        const currentY =
                            window.scrollY ||
                            window.pageYOffset ||
                            0;


                        const distance =
                            targetY -
                            currentY;


                        /*
                         * No animation requested.
                         */

                        if (
                            !animated
                        ) {
                            window.scrollTo(
                                0,
                                targetY
                            );

                            return;
                        }


                        /*
                         * Already there.
                         */

                        if (
                            Math.abs(
                                distance
                            ) < 2
                        ) {
                            window.scrollTo(
                                0,
                                targetY
                            );

                            return;
                        }


                        /*
                         * Continuous cinematic
                         * movement from current
                         * position.
                         */

                        premiumScrollTo(
                            targetY,
                            getScrollDuration(
                                distance
                            )
                        );
                    }
                );
            }
        );


        return true;
    }


    /* ============================================================
       WAIT FOR VEHICLE
       ============================================================ */

    function scrollToHashWhenReady(
        animated = true,
        forcedModel = "",
        fromTop = false
    ) {
        const model =
            forcedModel ||
            initialHashModel;


        if (!model) {
            return;
        }


        let attempts = 0;


        const maxAttempts =
            120;


        function attempt() {
            const vehicle =
                findVehicle(
                    model
                );


            if (vehicle) {

                decorateVehicle(
                    vehicle
                );


                /*
                 * Active icon is set
                 * before scrolling.
                 */

                syncActiveLink(
                    model
                );


                scrollToVehicle(
                    model,
                    animated,
                    fromTop
                );


                return;
            }


            attempts++;


            if (
                attempts <
                maxAttempts
            ) {
                setTimeout(
                    attempt,
                    100
                );
            }
        }


        attempt();
    }


    /* ============================================================
       RESTORE INITIAL HASH
       ============================================================ */

    function restoreInitialHash() {
        if (!initialHashModel) {
            return;
        }


        const fullUrl =
            buildVehicleUrl(
                initialHashModel
            );


        try {
            window.history.replaceState(
                {
                    luxuryAutosInitialHash:
                        initialHashModel
                },
                "",
                fullUrl
            );
        } catch {}
    }


    /* ============================================================
       LOAD VEHICLES
       ============================================================ */

    async function loadVehicles() {
        const container =
            document.querySelector(
                "#page"
            );


        /*
         * No page container.
         */

        if (!container) {
            decorateAllVehicles();

            setPageBackground();


            if (initialHashModel) {
                restoreInitialHash();


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


        /* --------------------------------------------------------
           STATIC VEHICLES
           -------------------------------------------------------- */

        const staticVehicles =
            container.querySelectorAll(
                ".vehicle"
            );


        if (
            staticVehicles.length
        ) {
            decorateAllVehicles();

            setPageBackground();


            if (
                typeof window
                    .loadVehicleRotation ===
                "function"
            ) {
                try {
                    window.loadVehicleRotation();
                } catch {}
            }


            if (initialHashModel) {
                restoreInitialHash();


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


        /* --------------------------------------------------------
           DYNAMIC JSON
           -------------------------------------------------------- */

        try {
            const response =
                await fetch(
                    `/json?_=${Date.now()}`,
                    {
                        cache:
                            "no-store"
                    }
                );


            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}`
                );
            }


            const data =
                await response.json();


            let vehicles =
                Array.isArray(data)
                    ? data
                    : Array.isArray(
                          data.vehicles
                      )
                    ? data.vehicles
                    : [];


            vehicles.sort(
                (a, b) => {
                    const aName =
                        String(
                            a.label ||
                            a.name ||
                            a.model ||
                            ""
                        );


                    const bName =
                        String(
                            b.label ||
                            b.name ||
                            b.model ||
                            ""
                        );


                    return aName.localeCompare(
                        bName,
                        undefined,
                        {
                            numeric:
                                true,
                            sensitivity:
                                "base"
                        }
                    );
                }
            );


            container.innerHTML =
                "";


            vehicles.forEach(
                (
                    vehicleData,
                    index
                ) => {
                    renderVehicle(
                        container,
                        vehicleData,
                        index
                    );
                }
            );


            decorateAllVehicles();

            setPageBackground();


            if (
                typeof window
                    .loadVehicleRotation ===
                "function"
            ) {
                try {
                    window.loadVehicleRotation();
                } catch {}
            }


            if (initialHashModel) {
                restoreInitialHash();


                scrollToHashWhenReady(
                    true,
                    initialHashModel,
                    true
                );


                initialHashModel =
                    "";
            }

        } catch (error) {

            console.error(
                "Luxury Autos: failed to load vehicles",
                error
            );


            decorateAllVehicles();

            setPageBackground();


            if (initialHashModel) {
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
    }


    /* ============================================================
       RENDER VEHICLE
       ============================================================ */

    function renderVehicle(
        container,
        data,
        index
    ) {
        if (!data) {
            return;
        }


        const model =
            String(
                data.model ||
                data.hash ||
                data.id ||
                ""
            ).trim();


        if (!model) {
            return;
        }


        const label =
            data.label ||
            data.name ||
            model;


        const price =
            data.price ||
            "";


        const image =
            data.image ||
            data.img ||
            `/images/${model}.png`;


        const vehicle =
            document.createElement(
                "div"
            );


        vehicle.className =
            "vehicle";


        /*
         * Alternate direction.
         */

        const invert =
            index % 2 === 0;


        if (invert) {
            vehicle.classList.add(
                "invert"
            );
        }


        vehicle.id =
            model;


        vehicle.dataset.model =
            model;


        vehicle.innerHTML = `
            <div class="details">

                <div class="inner">

                    <span>
                        ${label}
                    </span>

                    ${
                        price
                            ? `
                                <small>
                                    ${price}
                                </small>
                              `
                            : ""
                    }

                    <pre>${model}</pre>

                </div>

                <div class="colors">

                    <div
                        class="color"
                        data-color="mb"
                        title="Matte Black"
                        aria-label="Matte Black"
                    ></div>

                    <div
                        class="color"
                        data-color="mw"
                        title="Matte White"
                        aria-label="Matte White"
                    ></div>

                    <div
                        class="color"
                        data-color="r"
                        title="Red"
                        aria-label="Red"
                    ></div>

                    <div
                        class="color"
                        data-color="g"
                        title="Green"
                        aria-label="Green"
                    ></div>

                    <div
                        class="color"
                        data-color="b"
                        title="Blue"
                        aria-label="Blue"
                    ></div>

                </div>

            </div>

            <div class="image">

                <img
                    src="${image}"
                    alt="${label}"
                    loading="lazy"
                >

            </div>
        `;


        /*
         * Store original image.
         */

        const imageElement =
            vehicle.querySelector(
                ".image img"
            );


        if (imageElement) {
            imageElement.dataset.originalSrc =
                imageElement.getAttribute(
                    "src"
                ) || "";
        }


        container.appendChild(
            vehicle
        );
    }


    /* ============================================================
       COLOR SWITCHING
       ============================================================ */

    $(document).on(
        "click",
        ".vehicle .color",
        function (event) {
            event.preventDefault();

            event.stopPropagation();


            const color =
                String(
                    this.dataset.color ||
                    ""
                ).toLowerCase();


            const vehicle =
                this.closest(
                    ".vehicle"
                );


            if (!vehicle) {
                return;
            }


            const image =
                vehicle.querySelector(
                    ".image img"
                );


            if (!image) {
                return;
            }


            /*
             * Save original source.
             */

            if (
                !image.dataset.originalSrc
            ) {
                image.dataset.originalSrc =
                    image.getAttribute(
                        "src"
                    ) || "";
            }


            /*
             * Clicking the active color
             * again removes it.
             */

            const alreadyActive =
                this.classList.contains(
                    "active"
                );


            if (alreadyActive) {
                this.classList.remove(
                    "active"
                );


                const original =
                    image.dataset.originalSrc;


                if (original) {
                    image.src =
                        original;
                }


                return;
            }


            /*
             * Clear other colors.
             */

            vehicle
                .querySelectorAll(
                    ".color"
                )
                .forEach(
                    (item) => {
                        item.classList.remove(
                            "active"
                        );
                    }
                );


            /*
             * Set active color.
             */

            this.classList.add(
                "active"
            );


            const suffixMap = {
                mb: "_mb",
                mw: "_mw",
                r: "_r",
                g: "_g",
                b: "_b"
            };


            const suffix =
                suffixMap[color];


            if (
                typeof suffix ===
                "undefined"
            ) {
                this.classList.remove(
                    "active"
                );

                return;
            }


            const source =
                image.getAttribute(
                    "src"
                ) || "";


            const cleanSource =
                source.replace(
                    /_(?:mb|mw|r|g|b)(?=\.[a-z0-9]+(?:[?#]|$))/i,
                    ""
                );


            const extensionMatch =
                cleanSource.match(
                    /(\.[a-z0-9]+)(?:[?#].*)?$/i
                );


            if (
                !extensionMatch
            ) {
                this.classList.remove(
                    "active"
                );

                return;
            }


            const extension =
                extensionMatch[1];


            const newSource =
                cleanSource.replace(
                    extension,
                    `${suffix}${extension}`
                );


            image.src =
                newSource;
        }
    );


    /* ============================================================
       VEHICLE LINK CLICK
       ============================================================ */

    $(document).on(
        "click",
        ".vehicle-link",
        async function (event) {
            event.preventDefault();

            event.stopPropagation();


            const model =
                this.dataset.model ||
                this.closest(
                    ".vehicle"
                )?.dataset.model ||
                "";


            if (!model) {
                return;
            }


            /*
             * Build exact share URL:
             *
             * /view/legendary.html/#model
             */

            const fullUrl =
                buildVehicleUrl(
                    model
                );


            /*
             * Activate immediately.
             */

            syncActiveLink(
                model
            );


            /*
             * Change URL without reload.
             */

            try {
                window.history.pushState(
                    {
                        vehicle:
                            model
                    },
                    "",
                    fullUrl
                );
            } catch {}


            /*
             * Scroll from CURRENT position.
             *
             * false = do not jump to top.
             */

            scrollToVehicle(
                model,
                true,
                false
            );


            /*
             * Copy link.
             */

            try {
                await navigator.clipboard.writeText(
                    fullUrl
                );
            } catch {}


            /*
             * Copied state.
             */

            this.classList.add(
                "copied"
            );


            window.setTimeout(
                () => {
                    this.classList.remove(
                        "copied"
                    );
                },
                3000
            );
        }
    );


    /* ============================================================
       HASH CHANGE
       ============================================================ */

    window.addEventListener(
        "hashchange",
        () => {
            let model =
                window.location.hash
                    .substring(1);


            try {
                model =
                    decodeURIComponent(
                        model
                    );
            } catch {}


            model =
                model.trim();


            if (!model) {
                clearActiveLinks();

                return;
            }


            /*
             * Normalize to:
             *
             * /view/legendary.html/#model
             */

            const canonicalUrl =
                buildVehicleUrl(
                    model
                );


            if (
                window.location.href !==
                canonicalUrl
            ) {
                try {
                    window.history.replaceState(
                        {
                            vehicle:
                                model
                        },
                        "",
                        canonicalUrl
                    );
                } catch {}
            }


            /*
             * Activate immediately.
             */

            syncActiveLink(
                model
            );


            /*
             * Scroll from the current
             * position.
             */

            scrollToHashWhenReady(
                true,
                model,
                false
            );
        }
    );


    /* ============================================================
       POPSTATE
       ============================================================ */

    window.addEventListener(
        "popstate",
        () => {
            canonicalizeCurrentUrl();


            let model =
                window.location.hash
                    .substring(1);


            if (!model) {
                clearActiveLinks();

                return;
            }


            try {
                model =
                    decodeURIComponent(
                        model
                    );
            } catch {}


            model =
                model.trim();


            if (!model) {
                clearActiveLinks();

                return;
            }


            syncActiveLink(
                model
            );


            scrollToHashWhenReady(
                true,
                model,
                false
            );
        }
    );


    /* ============================================================
       ESCAPE
       ============================================================ */

    $(document).on(
        "keydown",
        function (event) {
            if (
                event.key ===
                "Escape"
            ) {
                try {
                    window.parent.postMessage(
                        "close",
                        "*"
                    );
                } catch {}
            }
        }
    );


    /* ============================================================
       INITIALIZATION
       ============================================================ */

    decorateAllVehicles();

    setPageBackground();

    loadVehicles();


    /* ============================================================
       WINDOW LOAD
       ============================================================ */

    $(window).on(
        "load",
        function () {
            decorateAllVehicles();

            setPageBackground();

            canonicalizeCurrentUrl();


            if (
                window.location.hash
            ) {
                let model =
                    window.location.hash
                        .substring(1);


                try {
                    model =
                        decodeURIComponent(
                            model
                        );
                } catch {}


                model =
                    model.trim();


                if (model) {
                    syncActiveLink(
                        model
                    );


                    scrollToHashWhenReady(
                        true,
                        model,
                        false
                    );
                }
            }
        }
    );

})(jQuery);