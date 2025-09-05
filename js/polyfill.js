(function() {
    if (navigator.userAgent.indexOf("CitizenFX/") != -1) {
        const style = document.createElement("style");
        style.innerHTML = `h1, .vehicle .details, #footer, .section {backdrop-filter: none !important; background: rgba(255, 255, 255, 0.75) !important}`;
        document.head.appendChild(style);
    }
})();