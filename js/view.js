(($) => {
    const key = title + " Imports";

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    $("head").append(`
        <style>
            body::before {
                background-image: url(/images/main/${category}_floor.png);
            }

            .vehicle-link {
                display: contents;
                color: inherit;
                text-decoration: none;
            }

            .vehicle-link:focus-visible {
                outline: 2px solid #fff;
                outline-offset: 4px;
            }
        </style>
    `);

    function renderVehicle(index, count, vehicle) {
        let mask = index % 2 === 0
            ? "0 0, calc(100% - 80px) 0, 100% 80px, 100% calc(100% - 80px), calc(100% - 80px) 100%, 0 100%"
            : "0 80px, 80px 0, 100% 0, 100% 100%, 80px 100%, 0 calc(100% - 80px)";

        if (index === 0) {
            mask = "0 0, 100% 0, 100% calc(100% - 80px), calc(100% - 80px) 100%, 0 100%";
        } else if (index === count - 1) {
            mask = index % 2 === 0
                ? "0 0, calc(100% - 80px) 0, 100% 80px, 100% 100%, 0 100%"
                : "0 80px, 80px 0, 100% 0, 100% 100%, 0 100%";
        }

        // Vehicle-specific URL from JSON
        const vehicleLink = vehicle.link || vehicle.url || "#";

        const el = $(`
            <div class="vehicle ${index % 2 === 0 ? 'invert' : ''}">
                
                <div class="details">
                    <div class="inner">
                        <span>${vehicle.label}</span>
                        <small>${formatter.format(vehicle.price)}</small>
                        <pre>${vehicle.modelName}</pre>
                    </div>

                    <div class="colors">
                        <div class="color"
                             data-color="mb"
                             title="Matte Black"></div>

                        <div class="color"
                             data-color="mw"
                             title="Matte White"></div>

                        <div class="color"
                             data-color="r"
                             title="Red"></div>

                        <div class="color"
                             data-color="g"
                             title="Green"></div>

                        <div class="color"
                             data-color="b"
                             title="Blue"></div>
                    </div>
                </div>

                <a
                    class="vehicle-link"
                    href="${vehicleLink}"
                    ${vehicleLink !== "#" ? 'target="_self"' : ''}
                >
                    <div
                        class="image"
                        style="clip-path: polygon(${mask})"
                    >
                        <img
                            alt="${vehicle.label || 'Vehicle'}"
                            src="/images/${category}/${vehicle.modelName}.png"
                            loading="lazy"
                        />
                    </div>
                </a>

            </div>
        `);

        el.attr("data-model", vehicle.modelName);
        el.attr("data-link", vehicleLink);

        return el;
    }

    $.get("/json?_=" + Date.now(), data => {
        const vehicles = data[key];

        if (!vehicles || !Array.isArray(vehicles)) {
            console.error(`No vehicle data found for "${key}"`);
            return;
        }

        vehicles.sort((a, b) => {
            return a.label.localeCompare(b.label);
        });

        $.each(vehicles, (index, vehicle) => {
            $("#vehicles").append(
                renderVehicle(index, vehicles.length, vehicle)
            );
        });

        $("#page").append(
            `<p id="footer">&copy; 2022-2024 coalaura</p>`
        );

        loadServerRotation();
    });

    /*
     * Vehicle color selector
     */
    $(document).on("click", ".color", e => {
        e.preventDefault();
        e.stopPropagation();

        const target = $(e.target);
        const vehicle = target.closest(".vehicle");
        const image = $(".image img", vehicle);
        const color = target.data("color");
        const original = image.data("original");

        if (target.hasClass("active")) {
            target.removeClass("active");
            image.attr("src", original);
        } else {
            let src = original || image.attr("src");

            if (!original) {
                image.data("original", src);
            }

            src = src.replace(/\.png$/m, `_${color}.png`);

            image.attr("src", src);

            $(".color.active", vehicle).removeClass("active");
            target.addClass("active");
        }
    });

    /*
     * Load server rotation
     */
    function loadServerRotation() {
        if (!server) return;

        $("body").addClass("loading-rotation");

        $.get("/rotation/" + server, (data) => {
            $("body").removeClass("loading-rotation");

            if (!data || !data.rotation) return;

            $(".vehicle").addClass("not-in-rotation");

            const rotation = data.rotation;

            for (const modelName of rotation) {
                const vehicle = $(`[data-model="${modelName}"]`);

                if (vehicle.length === 0) continue;

                vehicle.addClass("in-rotation");
                vehicle.removeClass("not-in-rotation");
            }
        });
    }

    /*
     * Escape key closes the parent window
     */
    $(document).on("keyup", e => {
        if (e.key === "Escape") {
            window.parent.postMessage("close", "*");
        }
    });

})(jQuery);