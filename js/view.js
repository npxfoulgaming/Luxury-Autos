(($) => {
    "use strict";

    /*
     * ============================================================
     * LUXURY AUTOS
     * ADVANCED VEHICLE HASH NAVIGATION
     * ============================================================
     *
     * Canonical URL:
     *
     * /view/legendary.html#mst
     *
     * Normal:
     *
     * [BLACK] [WHITE] [RED] [GREEN] [BLUE] [LINK]
     *
     * Inverted:
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
       BACKGROUND
       ============================================================ */

    if (vehicleCategory) {
        $("head").append(`
            <style id="luxury-autos-background-style">
                body::before {
                    background-image:
                        url(/images/main/${vehicleCategory}_floor.png);
                }
            </style>
        `);
    }


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
       HISTORY / SCROLL RESTORATION
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

    /*
     * Keep the URL as:
     *
     * /view/legendary.html#mst
     *
     * NOT:
     *
     * /view/legendary.html/#mst
     */
    function getCanonicalVehiclePath(pathname) {
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

        return path;
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
       CANONICALIZE URL
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
         * IMPORTANT:
         *
         * Do NOT use title here.
         *
         * The browser's native title tooltip was appearing
         * over neighbouring vehicle content when the icon
         * was hovered.
         */
        link.removeAttribute(
            "title"
        );

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
                        vehicleName.textContent.trim();

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
            duplicateLinks.length > 1
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

        link.setAttribute(
            "aria-label",
            `Copy link to ${model}`
        );

        /*
         * Remove browser native tooltip.
         */
        link.removeAttribute(
            "title"
        );


        /* --------------------------------------------------------
           LINK POSITION
           -------------------------------------------------------- */

        if (
            vehicle.classList.contains(
                "invert"
            )
        ) {
            /*
             * [LINK] [BLACK] [WHITE] [RED] [GREEN] [BLUE]
             */
            colors.insertBefore(
                link,
                colors.firstElementChild
            );
        } else {
            /*
             * [BLACK] [WHITE] [RED] [GREEN] [BLUE] [LINK]
             */
            colors.appendChild(
                link
            );
        }
    }


    /* ============================================================
       DECORATE ALL VEHICLES
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


    function getScrollDuration(
        distance
    ) {
        const absolute =
            Math.abs(
                distance
            );

        return Math.min(
            3200,
            Math.max(
                850,
                700 +
                    absolute *
                        1.05
            )
        );
    }


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
                        frame
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

        const offset =
            mobile
                ? 25
                : 35;

        const vehicleCenter =
            rect.top +
            rect.height / 2;

        let target =
            currentScroll +
            vehicleCenter -
            viewportHeight / 2 -
            offset;

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
       ACTIVE VEHICLE
       ============================================================ */

    function clearHashTarget() {
        document
            .querySelectorAll(
                ".vehicle.hash-target"
            )
            .forEach(
                (vehicle) => {
                    vehicle.classList.remove(
                        "hash-target"
                    );

                    const link =
                        vehicle.querySelector(
                            ".vehicle-link"
                        );

                    if (link) {
                        link.classList.remove(
                            "active-link"
                        );
                    }
                }
            );

        /*
         * Safety cleanup:
         * no stale active links anywhere.
         */
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
    }


    function setActiveVehicle(model) {
        clearHashTarget();

        if (!model) {
            return null;
        }

        const vehicle =
            findVehicle(
                model
            );

        if (!vehicle) {
            return null;
        }

        /*
         * Only this vehicle receives
         * the active state.
         */
        vehicle.classList.add(
            "hash-target"
        );

        const link =
            vehicle.querySelector(
                ".vehicle-link"
            );

        if (link) {
            link.classList.add(
                "active-link"
            );
        }

        return vehicle;
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

        cancelPremiumScroll();

        /*
         * Activate only this vehicle.
         */
        setActiveVehicle(
            model
        );

        /*
         * Initial deep-link starts from top.
         */
        if (fromTop) {
            window.scrollTo(
                0,
                0
            );
        }

        /*
         * Wait for layout to settle.
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

                        if (
                            !animated ||
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


        /* --------------------------------------------------------
           NO PAGE CONTAINER
           -------------------------------------------------------- */

        if (!container) {
            decorateAllVehicles();

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

            if (
                typeof window
                    .loadVehicleRotation ===
                "function"
            ) {
                try {
                    window.loadVehicleRotation();
                } catch {}
            }

            if (
                typeof window
                    .loadServerRotation ===
                "function"
            ) {
                try {
                    window.loadServerRotation();
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


            /* ----------------------------------------------------
               SORT
               ---------------------------------------------------- */

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


            /* ----------------------------------------------------
               RENDER
               ---------------------------------------------------- */

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


            /* ----------------------------------------------------
               ROTATION
               ---------------------------------------------------- */

            if (
                typeof window
                    .loadVehicleRotation ===
                "function"
            ) {
                try {
                    window.loadVehicleRotation();
                } catch {}
            } else {
                loadServerRotation();
            }


            /* ----------------------------------------------------
               INITIAL HASH
               ---------------------------------------------------- */

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
                data.modelName ||
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

        /*
         * Preserve explicit image values.
         */
        const image =
            data.image ||
            data.img ||
            `/images/${vehicleCategory}/${model}.png`;


        const vehicle =
            document.createElement(
                "div"
            );

        vehicle.className =
            "vehicle";


        /*
         * Alternate direction.
         */
        if (
            index % 2 === 0
        ) {
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
             * Save original image.
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
             * Clicking the selected color
             * restores the original image.
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
             * Remove active colors.
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
             * Activate clicked color.
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
       SERVER ROTATION
       ============================================================ */

    function loadServerRotation() {
        if (!serverName) {
            return;
        }

        $("body").addClass(
            "loading-rotation"
        );

        $.get(
            `/rotation/${serverName}`,
            (data) => {
                $("body").removeClass(
                    "loading-rotation"
                );

                if (
                    !data ||
                    !Array.isArray(
                        data.rotation
                    )
                ) {
                    return;
                }

                $(".vehicle").addClass(
                    "not-in-rotation"
                );

                for (
                    const modelName
                    of data.rotation
                ) {
                    const vehicle =
                        $(
                            `.vehicle[data-model="${modelName}"]`
                        );

                    if (
                        vehicle.length ===
                        0
                    ) {
                        continue;
                    }

                    vehicle.addClass(
                        "in-rotation"
                    );

                    vehicle.removeClass(
                        "not-in-rotation"
                    );
                }
            }
        ).fail(
            () => {
                $("body").removeClass(
                    "loading-rotation"
                );
            }
        );
    }


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


            const fullUrl =
                buildVehicleUrl(
                    model
                );


            /*
             * Update URL.
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
             * Activate target.
             */
            setActiveVehicle(
                model
            );


            /*
             * Smoothly travel from
             * current scroll position.
             */
            scrollToVehicle(
                model,
                true,
                false
            );


            /*
             * Copy URL.
             */
            try {
                if (
                    navigator.clipboard &&
                    typeof navigator
                        .clipboard
                        .writeText ===
                        "function"
                ) {
                    await navigator.clipboard.writeText(
                        fullUrl
                    );
                }
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
                clearHashTarget();

                return;
            }


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
                clearHashTarget();

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
                clearHashTarget();

                return;
            }

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
        "keyup",
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

    loadVehicles();


    /* ============================================================
       WINDOW LOAD
       ============================================================ */

    $(window).on(
        "load",
        function () {
            decorateAllVehicles();

            canonicalizeCurrentUrl();

            /*
             * Reapply background after page load.
             */
            if (vehicleCategory) {
                const backgroundStyle =
                    document.getElementById(
                        "luxury-autos-background-style"
                    );

                if (!backgroundStyle) {
                    $("head").append(`
                        <style id="luxury-autos-background-style">
                            body::before {
                                background-image:
                                    url(/images/main/${vehicleCategory}_floor.png);
                            }
                        </style>
                    `);
                }
            }


            /*
             * Remove any stale native title
             * tooltip source from generated links.
             */
            document
                .querySelectorAll(
                    ".vehicle-link"
                )
                .forEach(
                    (link) => {
                        link.removeAttribute(
                            "title"
                        );
                    }
                );


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