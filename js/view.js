(($) => {
    "use strict";

    const key = title + " Imports";

    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    /* ==========================================================
       BACKGROUND
    ========================================================== */

    $("head").append(`
        <style>
            body::before {
                background-image: url("/images/main/${category}_floor.png");
            }
        </style>
    `);

    /* ==========================================================
       HELPERS
    ========================================================== */

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getHashModel() {
        let hash = window.location.hash;

        if (!hash) {
            return "";
        }

        hash = hash.substring(1);

        if (!hash) {
            return "";
        }

        try {
            return decodeURIComponent(hash).trim();
        } catch (error) {
            return hash.trim();
        }
    }

    /*
     * Build the complete URL that should be shared/copied.
     */
    function getVehicleUrl(modelName) {
        const url = new URL(window.location.href);

        url.hash = modelName;

        return url.href;
    }

    /* ==========================================================
       LINK ICON
    ========================================================== */

    function createLinkIcon() {
        const svg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );

        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("fill", "none");
        svg.setAttribute("stroke", "currentColor");
        svg.setAttribute("stroke-width", "2");
        svg.setAttribute("stroke-linecap", "round");
        svg.setAttribute("stroke-linejoin", "round");
        svg.setAttribute("aria-hidden", "true");

        const path1 =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "path"
            );

        path1.setAttribute(
            "d",
            "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.71 1.71"
        );

        const path2 =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "path"
            );

        path2.setAttribute(
            "d",
            "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
        );

        svg.appendChild(path1);
        svg.appendChild(path2);

        return svg;
    }

    /*
     * Create the link button using the DOM.
     *
     * This guarantees the icon exists even though
     * view/notused.html contains no link icon.
     */
    function createVehicleLink(modelName, label) {
        const link = document.createElement("a");

        link.className = "vehicle-link";

        link.href =
            "#" + encodeURIComponent(modelName);

        link.dataset.model = modelName;

        link.title = "Copy link";

        link.setAttribute(
            "aria-label",
            "Copy link to " + label
        );

        link.appendChild(
            createLinkIcon()
        );

        return link;
    }

    /* ==========================================================
       FIND VEHICLE
    ========================================================== */

    function findVehicle(modelName) {
        const wanted = String(modelName || "")
            .trim()
            .toLowerCase();

        if (!wanted) {
            return null;
        }

        const vehicles =
            document.querySelectorAll(
                ".vehicle"
            );

        for (const vehicle of vehicles) {
            const model = String(
                vehicle.dataset.model || ""
            )
                .trim()
                .toLowerCase();

            if (model === wanted) {
                return vehicle;
            }
        }

        return null;
    }

    /* ==========================================================
       SCROLL TO VEHICLE
    ========================================================== */

    function scrollToVehicle(modelName, behavior = "smooth") {
        if (!modelName) {
            return false;
        }

        const vehicle =
            findVehicle(modelName);

        if (!vehicle) {
            return false;
        }

        document
            .querySelectorAll(
                ".vehicle.hash-target"
            )
            .forEach((element) => {
                element.classList.remove(
                    "hash-target"
                );
            });

        vehicle.classList.add(
            "hash-target"
        );

        /*
         * Wait for the browser to finish layout.
         */
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                vehicle.scrollIntoView({
                    behavior: behavior,
                    block: "center",
                    inline: "nearest"
                });
            });
        });

        clearTimeout(
            window.__hashTargetTimer
        );

        window.__hashTargetTimer =
            setTimeout(() => {
                vehicle.classList.remove(
                    "hash-target"
                );
            }, 3000);

        return true;
    }

    /* ==========================================================
       WAIT FOR VEHICLE
    ========================================================== */

    function scrollToCurrentHash(
        behavior = "smooth"
    ) {
        const modelName =
            getHashModel();

        if (!modelName) {
            return;
        }

        /*
         * Usually vehicles already exist here.
         */
        if (
            scrollToVehicle(
                modelName,
                behavior
            )
        ) {
            return;
        }

        /*
         * Safety fallback:
         * keep checking briefly in case another
         * script is still creating the vehicle DOM.
         */
        let attempts = 0;

        const timer =
            setInterval(() => {
                attempts++;

                if (
                    scrollToVehicle(
                        modelName,
                        behavior
                    )
                ) {
                    clearInterval(timer);
                    return;
                }

                if (attempts >= 30) {
                    clearInterval(timer);
                }
            }, 100);
    }

    /* ==========================================================
       UPDATE URL
    ========================================================== */

    function updateBrowserUrl(modelName) {
        const url =
            new URL(
                window.location.href
            );

        url.hash = modelName;

        /*
         * Update address bar without reload.
         */
        window.history.pushState(
            {
                vehicle: modelName
            },
            "",
            url.href
        );

        return url.href;
    }

    /* ==========================================================
       COPY CLIPBOARD
    ========================================================== */

    async function copyToClipboard(text) {
        /*
         * Modern browser.
         */
        if (
            navigator.clipboard &&
            typeof navigator.clipboard.writeText ===
                "function"
        ) {
            try {
                await navigator.clipboard.writeText(
                    text
                );

                return true;
            } catch (error) {
                console.warn(
                    "Clipboard API failed, using fallback.",
                    error
                );
            }
        }

        /*
         * Fallback for restricted/embedded browsers.
         */
        try {
            const textarea =
                document.createElement(
                    "textarea"
                );

            textarea.value = text;

            textarea.setAttribute(
                "readonly",
                ""
            );

            textarea.style.position =
                "fixed";

            textarea.style.left =
                "-999999px";

            textarea.style.top =
                "0";

            textarea.style.width =
                "1px";

            textarea.style.height =
                "1px";

            textarea.style.opacity =
                "0";

            document.body.appendChild(
                textarea
            );

            textarea.focus();

            textarea.select();

            textarea.setSelectionRange(
                0,
                textarea.value.length
            );

            const result =
                document.execCommand(
                    "copy"
                );

            textarea.remove();

            return result;
        } catch (error) {
            console.error(
                "Unable to copy URL.",
                error
            );

            return false;
        }
    }

    /* ==========================================================
       COPY FEEDBACK
    ========================================================== */

    function copiedFeedback(link, success) {
        clearTimeout(
            link.__copyTimer
        );

        if (success) {
            link.classList.add(
                "copied"
            );

            link.title =
                "Link copied!";

            link.__copyTimer =
                setTimeout(() => {
                    link.classList.remove(
                        "copied"
                    );

                    link.title =
                        "Copy link";
                }, 1600);

            return;
        }

        link.title =
            "Copy failed";

        link.__copyTimer =
            setTimeout(() => {
                link.title =
                    "Copy link";
            }, 1600);
    }

    /* ==========================================================
       RENDER VEHICLE
    ========================================================== */

    function renderVehicle(
        index,
        count,
        vehicle
    ) {
        let mask =
            index % 2 === 0
                ? "0 0, calc(100% - 80px) 0, 100% 80px, 100% calc(100% - 80px), calc(100% - 80px) 100%, 0 100%"
                : "0 80px, 80px 0, 100% 0, 100% 100%, 80px 100%, 0 calc(100% - 80px)";

        if (index === 0) {
            mask =
                "0 0, 100% 0, 100% calc(100% - 80px), calc(100% - 80px) 100%, 0 100%";
        } else if (
            index === count - 1
        ) {
            mask =
                index % 2 === 0
                    ? "0 0, calc(100% - 80px) 0, 100% 80px, 100% 100%, 0 100%"
                    : "0 80px, 80px 0, 100% 0, 100% 100%, 0 100%";
        }

        const modelName =
            String(
                vehicle.modelName ?? ""
            ).trim();

        const label =
            String(
                vehicle.label ?? ""
            );

        /*
         * Main vehicle container.
         */
        const el =
            document.createElement(
                "div"
            );

        el.className =
            "vehicle" +
            (index % 2 === 0
                ? " invert"
                : "");

        el.dataset.model =
            modelName;

        /*
         * DETAILS
         */
        const details =
            document.createElement(
                "div"
            );

        details.className =
            "details";

        /*
         * INNER
         */
        const inner =
            document.createElement(
                "div"
            );

        inner.className =
            "inner";

        /*
         * NAME CONTAINER
         */
        const name =
            document.createElement(
                "div"
            );

        name.className =
            "vehicle-name";

        /*
         * NAME
         */
        const nameSpan =
            document.createElement(
                "span"
            );

        nameSpan.textContent =
            label;

        /*
         * LINK ICON
         */
        const link =
            createVehicleLink(
                modelName,
                label
            );

        name.appendChild(
            nameSpan
        );

        name.appendChild(
            link
        );

        /*
         * PRICE
         */
        const price =
            document.createElement(
                "small"
            );

        price.textContent =
            formatter.format(
                vehicle.price
            );

        /*
         * MODEL
         */
        const model =
            document.createElement(
                "pre"
            );

        model.textContent =
            modelName;

        inner.appendChild(
            name
        );

        inner.appendChild(
            price
        );

        inner.appendChild(
            model
        );

        /*
         * COLORS
         */
        const colors =
            document.createElement(
                "div"
            );

        colors.className =
            "colors";

        const colorData = [
            ["mb", "Matte Black"],
            ["mw", "Matte White"],
            ["r", "Red"],
            ["g", "Green"],
            ["b", "Blue"]
        ];

        colorData.forEach(
            ([color, colorTitle]) => {
                const colorElement =
                    document.createElement(
                        "div"
                    );

                colorElement.className =
                    "color";

                colorElement.dataset.color =
                    color;

                colorElement.title =
                    colorTitle;

                colors.appendChild(
                    colorElement
                );
            }
        );

        details.appendChild(
            inner
        );

        details.appendChild(
            colors
        );

        /*
         * IMAGE
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

        image.alt = label;

        image.src =
            `/images/${category}/${encodeURIComponent(
                modelName
            )}.png`;

        image.loading =
            "lazy";

        imageContainer.appendChild(
            image
        );

        /*
         * COMPLETE VEHICLE
         */
        el.appendChild(
            details
        );

        el.appendChild(
            imageContainer
        );

        return el;
    }

    /* ==========================================================
       LOAD VEHICLES
    ========================================================== */

    $.get(
        "/json?_=" +
            Date.now(),
        (data) => {
            const vehicles =
                Array.isArray(
                    data[key]
                )
                    ? data[key]
                    : [];

            vehicles.sort(
                (a, b) =>
                    String(
                        a.label || ""
                    ).localeCompare(
                        String(
                            b.label || ""
                        )
                    )
            );

            /*
             * Clear any old generated vehicles.
             */
            $("#vehicles").empty();

            vehicles.forEach(
                (vehicle, index) => {
                    $("#vehicles").append(
                        renderVehicle(
                            index,
                            vehicles.length,
                            vehicle
                        )
                    );
                }
            );

            /*
             * Footer.
             */
            if (
                !document.getElementById(
                    "footer"
                )
            ) {
                $("#page").append(`
                    <p id="footer">
                        &copy; Luxury Autos By FouL Gaming
                    </p>
                `);
            }

            /*
             * THIS IS THE IMPORTANT PART:
             *
             * The URL hash is processed AFTER
             * all vehicles have been rendered.
             */
            if (
                getHashModel()
            ) {
                setTimeout(() => {
                    scrollToCurrentHash(
                        "smooth"
                    );
                }, 150);
            }

            loadServerRotation();
        }
    ).fail(
        (error) => {
            console.error(
                "Unable to load vehicle JSON.",
                error
            );
        }
    );

    /* ==========================================================
       LINK ICON CLICK
    ========================================================== */

    $(document).on(
        "click",
        ".vehicle-link",
        async function (event) {
            event.preventDefault();
            event.stopPropagation();

            const link =
                this;

            const modelName =
                String(
                    link.dataset.model ||
                        ""
                ).trim();

            if (!modelName) {
                return;
            }

            /*
             * Build exact full URL.
             */
            const fullUrl =
                getVehicleUrl(
                    modelName
                );

            /*
             * Update browser URL.
             */
            window.history.pushState(
                {
                    vehicle:
                        modelName
                },
                "",
                fullUrl
            );

            /*
             * Copy full URL.
             */
            const copied =
                await copyToClipboard(
                    fullUrl
                );

            /*
             * Show copied status.
             */
            copiedFeedback(
                link,
                copied
            );

            /*
             * Scroll to selected vehicle.
             */
            scrollToVehicle(
                modelName,
                "smooth"
            );
        }
    );

    /* ==========================================================
       HASH CHANGE
    ========================================================== */

    window.addEventListener(
        "hashchange",
        () => {
            scrollToCurrentHash(
                "smooth"
            );
        }
    );

    /* ==========================================================
       BROWSER BACK / FORWARD
    ========================================================== */

    window.addEventListener(
        "popstate",
        () => {
            scrollToCurrentHash(
                "smooth"
            );
        }
    );

    /* ==========================================================
       COLORS
    ========================================================== */

    $(document).on(
        "click",
        ".color",
        function (event) {
            event.preventDefault();
            event.stopPropagation();

            const target =
                $(this);

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

            src = src.replace(
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

    /* ==========================================================
       SERVER ROTATION
    ========================================================== */

    function loadServerRotation() {
        if (!server) {
            return;
        }

        $("body").addClass(
            "loading-rotation"
        );

        $.get(
            "/rotation/" +
                encodeURIComponent(
                    server
                ),
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

                data.rotation.forEach(
                    (modelName) => {
                        const vehicle =
                            findVehicle(
                                modelName
                            );

                        if (!vehicle) {
                            return;
                        }

                        vehicle.classList.add(
                            "in-rotation"
                        );

                        vehicle.classList.remove(
                            "not-in-rotation"
                        );
                    }
                );
            }
        ).fail(() => {
            $("body").removeClass(
                "loading-rotation"
            );
        });
    }

    /* ==========================================================
       ESCAPE
    ========================================================== */

    $(document).on(
        "keyup",
        (event) => {
            if (
                event.key ===
                "Escape"
            ) {
                window.parent.postMessage(
                    "close",
                    "*"
                );
            }
        }
    );
})(jQuery);