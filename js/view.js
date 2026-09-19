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
     * NOT:
     *
     * /view/special.html#pulse
     *
     * Features:
     *
     * 1. Deep links work from Discord / browser / new tab.
     * 2. Vehicle URLs always use .html/#model.
     * 3. Initial deep links start from the top.
     * 4. Smooth cinematic scrolling to the vehicle.
     * 5. Scrolling works naturally both upward and downward.
     * 6. Vehicle link icons are placed:
     *
     *    Normal:
     *    [LINK] [BLACK] [WHITE] [RED] [GREEN] [BLUE]
     *
     *    Inverted:
     *    [BLACK] [WHITE] [RED] [GREEN] [BLUE] [LINK]
     *
     * 7. Active hash vehicle receives a highlighted link icon.
     * 8. Dynamic vehicle loading is supported.
     * 9. Hash survives page navigation and sharing.
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

    let initialHash = window.location.hash || "";
    let initialHashModel = "";

    if (initialHash && initialHash.length > 1) {
        try {
            initialHashModel = decodeURIComponent(
                initialHash.substring(1)
            ).trim();
        } catch {
            initialHashModel =
                initialHash.substring(1).trim();
        }
    }

    /*
     * ============================================================
     * HISTORY / SCROLL RESTORATION
     * ============================================================
     */

    try {
        if ("scrollRestoration" in window.history) {
            window.history.scrollRestoration = "manual";
        }
    } catch {}

    /*
     * ============================================================
     * URL HELPERS
     * ============================================================
     *
     * ALWAYS produce:
     *
     * /view/special.html/#pulse
     *
     * The slash BEFORE the hash is intentional.
     */

    function getCanonicalVehiclePath(pathname) {
        let path = pathname || window.location.pathname;

        /*
         * Remove any accidental trailing slashes first.
         *
         * Example:
         *
         * /view/special.html/
         *        ↓
         * /view/special.html
         */

        path = path.replace(/\/+$/, "");

        /*
         * Now add exactly ONE slash.
         *
         * /view/special.html
         *        ↓
         * /view/special.html/
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

        const url = new URL(window.location.href);

        /*
         * Force canonical .html/ path.
         */

        url.pathname = getCanonicalVehiclePath(
            url.pathname
        );

        /*
         * Set hash through URL API so special characters
         * are handled safely.
         */

        url.hash = String(model).trim();

        return url.href;
    }

    function buildCleanCanonicalUrl() {
        const url = new URL(window.location.href);

        url.pathname = getCanonicalVehiclePath(
            url.pathname
        );

        url.hash = "";

        return url.href;
    }

    /*
     * ============================================================
     * CANONICALIZE CURRENT PAGE
     * ============================================================
     *
     * If the browser/Vercel currently gives us:
     *
     * /view/special.html#pulse
     *
     * convert it to:
     *
     * /view/special.html/#pulse
     *
     * without reloading the page.
     */

    function canonicalizeCurrentUrl() {
        const currentPath =
            window.location.pathname;

        const canonicalPath =
            getCanonicalVehiclePath(currentPath);

        if (currentPath === canonicalPath) {
            return;
        }

        const url = new URL(window.location.href);

        url.pathname = canonicalPath;

        try {
            window.history.replaceState(
                window.history.state,
                "",
                url.href
            );
        } catch {}
    }

    /*
     * IMPORTANT:
     *
     * Do this BEFORE temporarily removing the hash.
     * This guarantees that a deep link such as:
     *
     * /special.html/#pulse
     *
     * is always converted back to the same canonical format.
     */

    canonicalizeCurrentUrl();

    /*
     * ============================================================
     * PREVENT NATIVE HASH JUMP DURING INITIAL LOAD
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

        /*
         * Always begin deep-link animation from the top.
         */

        window.scrollTo(0, 0);
    }

    /*
     * ============================================================
     * VEHICLE LOOKUP
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

        for (const vehicle of vehicles) {
            const dataModel =
                String(
                    vehicle.dataset.model ||
                    vehicle.id ||
                    ""
                )
                    .trim()
                    .toLowerCase();

            if (dataModel === wanted) {
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
            document.createElement("a");

        link.className =
            "vehicle-link";

        link.href =
            buildVehicleUrl(model);

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

        /*
         * Canonical ID.
         */

        vehicle.id = model;

        vehicle.dataset.model =
            model;

        /*
         * --------------------------------------------------------
         * VEHICLE NAME
         * --------------------------------------------------------
         */

        let name =
            vehicle.querySelector(
                ".vehicle-name"
            );

        if (!name) {
            name =
                document.createElement("div");

            name.className =
                "vehicle-name";

            const inner =
                vehicle.querySelector(
                    ".inner"
                );

            if (inner) {
                inner.prepend(name);
            }
        }

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
                document.createElement("div");

            colors.className =
                "colors";

            vehicle.appendChild(colors);
        }

        /*
         * --------------------------------------------------------
         * LINK ICON
         * --------------------------------------------------------
         */

        let link =
            colors.querySelector(
                ".vehicle-link"
            );

        /*
         * Remove duplicate link icons.
         */

        const duplicateLinks =
            colors.querySelectorAll(
                ".vehicle-link"
            );

        if (duplicateLinks.length > 1) {
            duplicateLinks.forEach(
                (duplicate, index) => {
                    if (index > 0) {
                        duplicate.remove();
                    }
                }
            );
        }

        if (!link) {
            link =
                createLinkIcon(model);

            colors.appendChild(link);
        }

        /*
         * Always update the href because the page may have
         * been loaded from a different URL.
         */

        link.href =
            buildVehicleUrl(model);

        link.dataset.model =
            model;

        /*
         * --------------------------------------------------------
         * LINK POSITION
         * --------------------------------------------------------
         *
         * NORMAL:
         *
         * [LINK] [BLACK] [WHITE] [RED] [GREEN] [BLUE]
         *
         * INVERT:
         *
         * [BLACK] [WHITE] [RED] [GREEN] [BLUE] [LINK]
         */

        if (
            vehicle.classList.contains(
                "invert"
            )
        ) {
            colors.appendChild(link);
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
        document
            .querySelectorAll(".vehicle")
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

        if (activeScrollFrame !== null) {
            cancelAnimationFrame(
                activeScrollFrame
            );

            activeScrollFrame =
                null;
        }
    }

    /*
     * Smooth cinematic easing.
     */

    function easeInOutQuint(t) {
        return t < 0.5
            ? 16 * t * t * t * t * t
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
            Math.abs(distance);

        /*
         * Short movement:
         * ~750ms
         *
         * Long movement:
         * ~2400ms
         */

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
            targetY - startY;

        if (
            Math.abs(distance) < 2
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
                now - startTime;

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
                distance * eased;

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

        /*
         * Put the vehicle slightly above center.
         */

        const mobile =
            window.innerWidth <= 700;

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
     * ACTIVE TARGET
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
            findVehicle(model);

        if (!vehicle) {
            return false;
        }

        cancelPremiumScroll();

        clearHashTarget();

        vehicle.classList.add(
            "hash-target"
        );

        /*
         * Deep links ALWAYS start from top.
         */

        if (fromTop) {
            window.scrollTo(
                0,
                0
            );
        }

        /*
         * Wait one frame so the browser has
         * finished layout/rendering.
         */

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
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
            });
        });

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
                findVehicle(model);

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

        /*
         * Make absolutely sure the URL is:
         *
         * /special.html/#pulse
         */

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

        /*
         * No dynamic container.
         */

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
         * STATIC VEHICLES
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
                        cache: "no-store"
                    }
                );

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}`
                );
            }

            const data =
                await response.json();

            /*
             * Support both:
             *
             * []
             *
             * and:
             *
             * { vehicles: [] }
             */

            let vehicles =
                Array.isArray(data)
                    ? data
                    : Array.isArray(
                          data.vehicles
                      )
                    ? data.vehicles
                    : [];

            /*
             * Sort alphabetically when possible.
             */

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
                            numeric: true,
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

            /*
             * Restore deep-link URL only after
             * vehicles actually exist.
             */

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
         * Preserve the existing alternating layout.
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
                            data-color="b"
                            title="Black"
                        ></div>

                        <div
                            class="color white"
                            data-color="w"
                            title="White"
                        ></div>

                        <div
                            class="color red"
                            data-color="r"
                            title="Red"
                        ></div>

                        <div
                            class="color green"
                            data-color="g"
                            title="Green"
                        ></div>

                        <div
                            class="color blue"
                            data-color="blue"
                            title="Blue"
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

            const model =
                vehicle.dataset.model ||
                vehicle.id;

            if (!model) {
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
             * Keep original extension.
             */

            const source =
                image.getAttribute(
                    "src"
                ) || "";

            const extensionMatch =
                source.match(
                    /(\.[a-z0-9]+)(?:[?#].*)?$/i
                );

            const extension =
                extensionMatch
                    ? extensionMatch[1]
                    : ".png";

            let suffix =
                "";

            switch (
                color.toLowerCase()
            ) {
                case "b":
                    suffix = "_mb";
                    break;

                case "w":
                    suffix = "_mw";
                    break;

                case "r":
                    suffix = "_r";
                    break;

                case "g":
                    suffix = "_g";
                    break;

                case "blue":
                    suffix = "_b";
                    break;

                default:
                    suffix = "";
            }

            /*
             * Remove old color suffix if present.
             */

            const cleanBase =
                source
                    .replace(
                        /_(?:mb|mw|r|g|b)(?=\.[a-z0-9]+(?:[?#]|$))/i,
                        ""
                    );

            const newSource =
                cleanBase.replace(
                    extension,
                    `${suffix}${extension}`
                );

            image.src =
                newSource;

            /*
             * Active color state.
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

            /*
             * Always use:
             *
             * /special.html/#model
             */

            const fullUrl =
                buildVehicleUrl(
                    model
                );

            /*
             * Update browser URL without
             * causing native hash jump.
             */

            try {
                window.history.pushState(
                    {
                        vehicle: model
                    },
                    "",
                    fullUrl
                );
            } catch {}

            /*
             * Clear previous navigation state.
             */

            cancelPremiumScroll();

            /*
             * Scroll from CURRENT position.
             */

            scrollToVehicle(
                model,
                true,
                false
            );

            /*
             * Copy exact canonical URL.
             */

            try {
                await navigator.clipboard.writeText(
                    fullUrl
                );
            } catch {
                /*
                 * Clipboard can fail in
                 * insecure contexts.
                 */
            }

            /*
             * Visual copied state.
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

            /*
             * Make sure hash URL is canonical.
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
                            vehicle: model
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
     * ------------------------------------------------------------
     * LOAD
     * ------------------------------------------------------------
     */

    $(window).on(
        "load",
        function () {
            decorateAllVehicles();

            /*
             * If browser/Vercel somehow gave us the
             * non-slash version, repair it.
             */

            canonicalizeCurrentUrl();

            /*
             * Extra safety for deep links.
             */

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