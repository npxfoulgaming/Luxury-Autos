(($) => {
    "use strict";

    /*
     * ============================================================
     * LUXURY AUTOS
     * ADVANCED VEHICLE HASH NAVIGATION
     * ============================================================
     *
     * Canonical vehicle URL:
     *
     * /view/special.html/#pulse
     *
     * Link placement:
     *
     * DETAILS LEFT:
     * [BLACK] [WHITE] [RED] [GREEN] [BLUE] [LINK]
     *
     * DETAILS RIGHT:
     * [LINK] [BLACK] [WHITE] [RED] [GREEN] [BLUE]
     *
     * Color files:
     *
     * black -> _mb
     * white -> _mw
     * red   -> _r
     * green -> _g
     * blue  -> _b
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
     * HISTORY / SCROLL RESTORATION
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
    } catch {}

    /*
     * ============================================================
     * URL HELPERS
     * ============================================================
     */

    function getCanonicalVehiclePath(
        pathname
    ) {
        let path =
            pathname ||
            window.location.pathname;

        /*
         * Remove existing trailing slash.
         */

        path =
            path.replace(
                /\/+$/,
                ""
            );

        /*
         * Always restore exactly one slash.
         *
         * /special.html
         *       ↓
         * /special.html/
         */

        if (!path.endsWith("/")) {
            path += "/";
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
            String(model).trim();

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

    /*
     * ============================================================
     * CANONICALIZE CURRENT URL
     * ============================================================
     */

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

    /*
     * Always keep:
     *
     * /special.html/#model
     */

    canonicalizeCurrentUrl();

    /*
     * ============================================================
     * PREVENT NATIVE HASH JUMP
     * ============================================================
     */

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

    /*
     * ============================================================
     * FIND VEHICLE
     * ============================================================
     */

    function findVehicle(model) {
        if (!model) {
            return null;
        }

        const wanted =
            String(model)
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

    /*
     * ============================================================
     * DECORATE VEHICLE
     * ============================================================
     */

    function decorateVehicle(vehicle) {
        if (!vehicle) {
            return;
        }

        let model =
            vehicle.dataset.model ||
            vehicle.id ||
            "";

        model =
            String(model).trim();

        if (!model) {
            return;
        }

        vehicle.id =
            model;

        vehicle.dataset.model =
            model;

        /*
         * --------------------------------------------------------
         * COLORS
         * --------------------------------------------------------
         */

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

            vehicle.appendChild(
                colors
            );
        }

        /*
         * --------------------------------------------------------
         * LINK
         * --------------------------------------------------------
         */

        let link =
            colors.querySelector(
                ".vehicle-link"
            );

        /*
         * Remove duplicate links.
         */

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

        /*
         * ========================================================
         * IMPORTANT LINK POSITION FIX
         * ========================================================
         *
         * Details LEFT:
         *
         * [BLACK] [WHITE] [RED] [GREEN] [BLUE] [LINK]
         *
         * Details RIGHT / INVERT:
         *
         * [LINK] [BLACK] [WHITE] [RED] [GREEN] [BLUE]
         *
         * The old code had these reversed.
         */

        if (
            vehicle.classList.contains(
                "invert"
            )
        ) {
            /*
             * Details are on RIGHT.
             *
             * Link goes BEFORE black.
             */

            colors.insertBefore(
                link,
                colors.firstElementChild
            );
        } else {
            /*
             * Details are on LEFT.
             *
             * Link goes AFTER blue.
             */

            colors.appendChild(
                link
            );
        }
    }

    /*
     * ============================================================
     * DECORATE ALL VEHICLES
     * ============================================================
     */

    function decorateAllVehicles() {
        document
            .querySelectorAll(
                ".vehicle"
            )
            .forEach(
                decorateVehicle
            );
    }

    /*
     * ============================================================
     * PREMIUM SCROLL ENGINE
     * ============================================================
     */

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
            2400,
            Math.max(
                750,
                650 +
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
            window.scrollY;

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

    /*
     * ============================================================
     * TARGET POSITION
     * ============================================================
     */

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

        const target =
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

        return Math.max(
            0,
            Math.min(
                target,
                maxScroll
            )
        );
    }

    /*
     * ============================================================
     * ACTIVE HASH TARGET
     * ============================================================
     */

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
            findVehicle(
                model
            );

        if (!vehicle) {
            return false;
        }

        cancelPremiumScroll();

        clearHashTarget();

        vehicle.classList.add(
            "hash-target"
        );

        if (fromTop) {
            window.scrollTo(
                0,
                0
            );
        }

        requestAnimationFrame(
            () => {
                requestAnimationFrame(
                    () => {
                        const targetY =
                            calculateVehicleTarget(
                                vehicle
                            );

                        const currentY =
                            window.scrollY;

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

    /*
     * ============================================================
     * WAIT FOR DYNAMIC VEHICLES
     * ============================================================
     */

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

    /*
     * ============================================================
     * RESTORE INITIAL HASH
     * ============================================================
     */

    function restoreInitialHash() {
        if (
            !initialHashModel
        ) {
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

        canonicalizeCurrentUrl();
    }

    /*
     * ============================================================
     * LOAD VEHICLES
     * ============================================================
     */

    async function loadVehicles() {
        const container =
            document.querySelector(
                "#page"
            );

        if (!container) {
            decorateAllVehicles();

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

            return;
        }

        /*
         * --------------------------------------------------------
         * STATIC
         * --------------------------------------------------------
         */

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

            return;
        }

        /*
         * --------------------------------------------------------
         * DYNAMIC JSON
         * --------------------------------------------------------
         */

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
        } catch (error) {
            console.error(
                "Luxury Autos: failed to load vehicles",
                error
            );

            decorateAllVehicles();

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
    }

    /*
     * ============================================================
     * RENDER VEHICLE
     * ============================================================
     */

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
         * Alternate vehicle direction.
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

                    <div class="vehicle-name">
                        ${label}
                    </div>

                    ${
                        price
                            ? `
                                <div class="price">
                                    ${price}
                                </div>
                              `
                            : ""
                    }

                    <div class="model">
                        ${model}
                    </div>

                    <div class="colors">

                        <div
                            class="color black"
                            data-color="mb"
                            title="Black"
                            aria-label="Black"
                        ></div>

                        <div
                            class="color white"
                            data-color="mw"
                            title="White"
                            aria-label="White"
                        ></div>

                        <div
                            class="color red"
                            data-color="r"
                            title="Red"
                            aria-label="Red"
                        ></div>

                        <div
                            class="color green"
                            data-color="g"
                            title="Green"
                            aria-label="Green"
                        ></div>

                        <div
                            class="color blue"
                            data-color="b"
                            title="Blue"
                            aria-label="Blue"
                        ></div>

                    </div>

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

        container.appendChild(
            vehicle
        );
    }

    /*
     * ============================================================
     * COLOR SWITCHING
     * ============================================================
     */

    $(document).on(
        "click",
        ".vehicle .color",
        function (event) {
            event.preventDefault();
            event.stopPropagation();

            const color =
                this.dataset.color ||
                "";

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

            const source =
                image.getAttribute(
                    "src"
                ) || "";

            /*
             * Canonical color suffix.
             */

            const suffixMap = {
                mb: "_mb",
                mw: "_mw",
                r: "_r",
                g: "_g",
                b: "_b"
            };

            const suffix =
                suffixMap[
                    color
                        .toLowerCase()
                ];

            if (
                typeof suffix ===
                "undefined"
            ) {
                return;
            }

            /*
             * Remove any existing vehicle
             * color suffix.
             *
             * Example:
             *
             * pulse_mb.png
             *       ↓
             * pulse_r.png
             */

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

            /*
             * Active color.
             */

            vehicle
                .querySelectorAll(
                    ".color"
                )
                .forEach(
                    (item) => {
                        item.classList.toggle(
                            "active",
                            item === this
                        );
                    }
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

            cancelPremiumScroll();

            scrollToVehicle(
                model,
                true,
                false
            );

            /*
             * Copy canonical URL.
             */

            try {
                await navigator.clipboard.writeText(
                    fullUrl
                );
            } catch {}

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

    /*
     * ============================================================
     * HASH CHANGE
     * ============================================================
     */

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

    /*
     * ============================================================
     * POPSTATE
     * ============================================================
     */

    window.addEventListener(
        "popstate",
        () => {
            canonicalizeCurrentUrl();

            let model =
                window.location.hash
                    .substring(1);

            if (!model) {
                return;
            }

            try {
                model =
                    decodeURIComponent(
                        model
                    );
            } catch {}

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

    /*
     * ============================================================
     * INITIALIZATION
     * ============================================================
     */

    decorateAllVehicles();

    loadVehicles();

    /*
     * ============================================================
     * WINDOW LOAD
     * ============================================================
     */

    $(window).on(
        "load",
        function () {
            decorateAllVehicles();

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