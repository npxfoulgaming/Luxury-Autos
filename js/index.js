(function() {
    const expires = $("#expires"),
        expiresAt = parseInt(expires.text());

    function format() {
        let seconds = Math.max(0, expiresAt - Math.floor(Date.now() / 1000));
        let text = [];
        const days = Math.floor(seconds / 86400);
        seconds -= days * 86400;
        days === 0 || text.push(`${days}d`);
        const hours = Math.floor(seconds / 3600);
        seconds -= hours * 3600;
        hours === 0 || text.push(`${hours}h`);
        const minutes = Math.floor(seconds / 60);
        seconds -= minutes * 60;
        minutes === 0 || text.push(`${minutes}m`);
        seconds === 0 || text.push(`${seconds}s`);
        if (text.length === 0) {
            return "now";
        }
        return text.join(" ");
    }

    function update() {
        expires.text(format());
    }
    if (expiresAt > 0) {
        update();
        setInterval(update, 1000);
    } else {
        expires.remove();
    }
    $(document).on("keyup", e => {
        if (e.key === "Escape") {
            window.parent.postMessage("close", "*");
        }
    });
})();