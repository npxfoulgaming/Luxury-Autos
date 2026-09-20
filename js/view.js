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
     * /view/legendary.html/#mst
     *
     * Normal details:
     *
     * [BLACK] [WHITE] [RED] [GREEN] [BLUE] [LINK]
     *
     * Inverted details:
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
       PAGE BACKGROUND
       ============================================================ */

    /*
     * Same background behavior as the original vehicle page.
     *
     * Example:
     *
     * category = "legendary"
     *
     * becomes:
     *
     * /images/main/legendary_floor.png
     */

    if (vehicleCategory) {
        $("head").append(`
            <style>
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

    function getCanonicalVehiclePath(pathname) {
        let path =
            pathname ||
            window.location.pathname ||
            "/";

        /*
         * Remove all existing trailing slashes first.
         */
        path =
            path.replace(
                /\/+$/,
                ""
            );

        /*
         * Root remains "/".
         */
        if (!path) {
            return "/";
        }

        /*
         * IMPORTANT:
         *
         * Always add exactly ONE trailing slash.
         *
         * Example:
         *
         * /view/heroic.html
         *
         * becomes:
         *
         * /view/heroic.html/
         */
        return `${path}/`;
    }


    /*
     * Build vehicle URL.
     *
     * Example:
     *
     * https://luxury-autos.vercel.app/view/heroic.html/#filthynsx
     */
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


    /*
     * Build clean canonical URL.
     */
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

        /*
         * Always begin deep-link navigation
         * from the top.
         */
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
     * Cinematic easing.
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
     * Distance-based duration.
     */
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


    /*
     * Continuous smooth scrolling.
     *
     * Starts from the CURRENT position.
     *
     * Therefore:
     *
     * bottom -> top
     *
     * smoothly travels upward.
     *
     * top -> bottom
     *
     * smoothly travels downward.
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

        /*
         * Center vehicle in viewport.
         */
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
       ACTIVE HASH
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
    }


    function setActiveVehicle(
        model
    ) {
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
         * Make the target active immediately.
         */
        setActiveVehicle(
            model
        );

        /*
         * Initial deep-link:
         *
         * TOP
         *  ↓
         * smooth cinematic movement
         *  ↓
         * TARGET VEHICLE
         */
        if (fromTop) {
            window.scrollTo(
                0,
                0
            );
        }

        /*
         * Wait for layout/image rendering.
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
             * Clicking active color
             * restores original.
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
             * Remove active from
             * other colors.
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
             * Select color.
             */
            this.classList.add(
                "active"
            );


            /*
             * Color suffixes.
             */
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


            /*
             * Remove an existing
             * color suffix.
             */
            const source =
                image.getAttribute(
                    "src"
                ) || "";

            const cleanSource =
                source.replace(
                    /_(?:mb|mw|r|g|b)(?=\.[a-z0-9]+(?:[?#]|$))/i,
                    ""
                );


            /*
             * Find extension.
             */
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


            /*
             * Example:
             *
             * pulse.png
             *
             * ->
             *
             * pulse_r.png
             */
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
                    !data.rotation
                ) {
                    return;
                }

                $(".vehicle").addClass(
                    "not-in-rotation"
                );

                const rotation =
                    data.rotation;

                for (
                    const modelName
                    of rotation
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


            /*
             * Build exact URL.
             */
            const fullUrl =
                buildVehicleUrl(
                    model
                );


            /*
             * Update URL without reload.
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
             * Scroll from CURRENT position.
             */
            scrollToVehicle(
                model,
                true,
                false
            );


            /*
             * Copy exact URL.
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
                clearHashTarget();

                return;
            }


            /*
             * Normalize current URL.
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
             * Existing page:
             * scroll from current position.
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
                return;
            }

            /*
             * Back/forward also scrolls
             * smoothly from current position.
             */
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
             * Apply background again after
             * page resources have loaded.
             */
            if (vehicleCategory) {
                $("head").append(`
                    <style>
                        body::before {
                            background-image:
                                url(/images/main/${vehicleCategory}_floor.png);
                        }
                    </style>
                `);
            }

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