// Opening animation: about a second, once per visit, over the already-rendered page.
// Loaded first thing in <body> so the overlay is up before the hero paints.
(function () {
    var HOLD = 700;
    var OUT = 480;

    if (window.__patRedirect) return;
    try {
        if (sessionStorage.getItem('intro-played')) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (location.hash.length > 1) return;
        sessionStorage.setItem('intro-played', '1');
    } catch (e) {
        return;
    }

    var intro = document.createElement('div');
    intro.className = 'intro';
    intro.setAttribute('aria-hidden', 'true');
    intro.innerHTML =
        '<div class="intro-card">' +
            '<img class="intro-logo" src="images/logo.png" alt="" width="166" height="110">' +
            '<svg class="intro-trace" viewBox="0 0 320 24" fill="none">' +
                '<path d="M2 4 H150 L166 20 H306" pathLength="100"></path>' +
                '<circle cx="311" cy="20" r="4"></circle>' +
            '</svg>' +
            '<p class="intro-sub">Smart Home Automation</p>' +
        '</div>';
    document.body.appendChild(intro);

    var skipEvents = ['keydown', 'pointerdown', 'wheel', 'touchstart'];
    var holdTimer, removeTimer, leaving = false;

    function remove() {
        clearTimeout(removeTimer);
        if (intro.parentNode) intro.parentNode.removeChild(intro);
    }

    function leave() {
        if (leaving) return;
        leaving = true;
        clearTimeout(holdTimer);
        skipEvents.forEach(function (name) { window.removeEventListener(name, leave); });
        intro.setAttribute('data-state', 'out');
        removeTimer = setTimeout(remove, OUT + 80);
    }

    skipEvents.forEach(function (name) {
        window.addEventListener(name, leave, { passive: true });
    });
    holdTimer = setTimeout(leave, HOLD);
})();
