pc.script.createLoadingScreen(function (app) {

    // ──────────────────────────────────────────────
    // 1. CREATE THE SPLASH SCREEN HTML
    // ──────────────────────────────────────────────
var showSplash = function () {
    var wrapper = document.createElement('div');
    wrapper.id = 'custom-splash-wrapper';

    // 1. Keep your environment check (needed for PlayCanvas editor)
    var isDev = window.location.href.includes('playcanvas') || window.location.href.includes('localhost');

    // 2. Safely find the container
    // If it's Dev, use body. If it's Production, try to find the wrapper, 
    // BUT fallback to body if the wrapper isn't ready yet.
    var container = isDev 
        ? document.body 
        : (document.getElementById('playcanvas-wrapper') || document.body);

    container.appendChild(wrapper);


        // LOGO (State 1: big / centered)
        var logo = document.createElement('img');
        logo.id = 'custom-splash-logo';
        logo.src = "https://cdn.prod.website-files.com/65c83fbb9f2750d119b43fb3/69eef1045ce66f44d7f5ee77_Patek-logo.png";
        wrapper.appendChild(logo);

        // TITLE GROUP
        var titleGroup = document.createElement('div');
        titleGroup.id = 'custom-title-group';

        var title = document.createElement('div');
        title.id = 'custom-title';
        title.textContent = 'An invitation to travel';

        var subtitle = document.createElement('div');
        subtitle.id = 'custom-subtitle';
        subtitle.textContent = ' ';

        titleGroup.appendChild(title);
        titleGroup.appendChild(subtitle);
        wrapper.appendChild(titleGroup);

        // CTA
        var cta = document.createElement('div');
        cta.id = 'custom-cta';
        cta.textContent = 'STEP INTO TIME';
        titleGroup.appendChild(cta);

        // ──────────────────────────────────────────
        // CTA CLICK → Logo handoff + dismiss splash
        // ──────────────────────────────────────────
        cta.addEventListener('click', function () {
            var wrapper = document.getElementById('custom-splash-wrapper');
            var logo = document.getElementById('custom-splash-logo');

            // Detach logo from wrapper → body so it survives DOM removal
            if (logo) {
                var rect = logo.getBoundingClientRect();

                // Temporarily pin to exact pixels so the visual position
                // doesn't jump when we re-parent into <body>
                logo.style.position = 'fixed';
                logo.style.top  = rect.top + 'px';
                logo.style.left = rect.left + 'px';
                logo.style.transform = 'none';
                logo.style.width = rect.width + 'px';
                logo.style.zIndex = '999';
                document.body.appendChild(logo);

                // Now convert to responsive centering so it re-centers on resize.
                // We keep the same visual width and vertical position, but
                // switch left back to 50% + translateX(-50%).
                logo.style.left = '50%';
                logo.style.transform = 'translateX(-50%)';

                // Store the "resting" values so WebsiteManager's scroll
                // handler can animate back to them after scrolling up.
                logo.dataset.originTop   = rect.top + 'px';
                logo.dataset.originLeft  = '50%';
                logo.dataset.originWidth = rect.width + 'px';
                logo.dataset.originTransform = 'translateX(-50%)';
            }

            // Fade out wrapper
            if (wrapper) {
                wrapper.classList.add('clicked');
                wrapper.addEventListener('transitionend', function () {
                    if (wrapper.parentNode) {
                        wrapper.parentNode.removeChild(wrapper);
                    }

                    // Fire global event so WebsiteManager can take ownership of the logo
                    window.dispatchEvent(new CustomEvent('logoHandoff', {
                        detail: { logoElement: logo }
                    }));
                }, { once: true });
            }

            // Trigger PlayCanvas watch intro
            var watch = app.root.findByName('Watch_Pivot');
            if (watch && watch.script && watch.script.watchIntro) {
                watch.script.watchIntro.play();
            } else {
                console.warn('[Loading] Watch entity or watchIntro script not found');
            }
        });

        // PROGRESS BAR
        var progressText = document.createElement('div');
        progressText.id = 'custom-progress-text';
        progressText.textContent = '0%';
        wrapper.appendChild(progressText);

        var progressContainer = document.createElement('div');
        progressContainer.id = 'custom-progress-container';
        wrapper.appendChild(progressContainer);

        var progressBar = document.createElement('div');
        progressBar.id = 'custom-progress-bar';
        progressContainer.appendChild(progressBar);
    };

    // ──────────────────────────────────────────────
    // 2. TRANSITION: loading finished → reveal title
    // ──────────────────────────────────────────────
    var hideSplash = function () {
        var splash = document.getElementById('custom-splash-wrapper');
        if (splash) {
            splash.classList.add('loaded');

            setTimeout(function () {
                animateTitle();
            }, 200);
        }
    };

    // ──────────────────────────────────────────────
    // 3. PROGRESS
    // ──────────────────────────────────────────────
    var setProgress = function (value) {
        var bar = document.getElementById('custom-progress-bar');
        var text = document.getElementById('custom-progress-text');

        if (bar && text) {
            value = Math.min(1, Math.max(0, value));
            bar.style.width = (value * 100) + '%';
            text.textContent = Math.floor(value * 100) + '%';
        }
    };

    // ──────────────────────────────────────────────
    // GSAP LETTER ANIMATION
    // ──────────────────────────────────────────────
    var animateTitle = function () {
        var title = document.getElementById('custom-title');
        if (!title || !window.gsap) return;

        var text = title.textContent;
        title.textContent = '';

        var letters = [];

        for (var i = 0; i < text.length; i++) {
            var span = document.createElement('span');
            span.textContent = text[i];
            span.style.opacity = '0';
            title.appendChild(span);
            letters.push(span);
        }

        var shuffled = letters.slice().sort(function () {
            return Math.random() - 0.5;
        });

        shuffled.forEach(function (letter, index) {
            gsap.fromTo(letter,
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: 1.2,
                    delay: 0.5 + (index * 0.06),
                    ease: "expo.out"
                }
            );
        });
    };

    // ──────────────────────────────────────────────
    // 4. CSS  (splash-screen styles ONLY)
    // ──────────────────────────────────────────────
var createCss = function () {
    var css = [
        '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@100;400;600&family=Playfair+Display:wght@400&display=swap");',

        '#playcanvas-wrapper, #playcanvas-wrapper * {',
        '    box-sizing: border-box;',
        '    margin: 0;',
        '    padding: 0;',
        '  line-height: normal !important;',
        '}',

        /* DISABLE TEXT SELECTION */
        '#custom-splash-wrapper, #custom-splash-wrapper * {',
        '    user-select: none;',
        '    -webkit-user-select: none;',
        '    -ms-user-select: none;',
        '}',

        /* FIXED FULLSCREEN ROOT (IMPORTANT FIX) */
        '#custom-splash-wrapper {',
        '    position: fixed;',
        '    top: 0;',
        '    left: 0;',
        '    width: 100vw;',
        '    height: 100svh;',
        '    background-color: #000000;',
        '    z-index: 1000;',
        '    overflow: hidden;',
        '}',

        '#custom-splash-wrapper::after {',
        '    content: "";',
        '    position: absolute;',
        '    top: 0;',
        '    left: 0;',
        '    width: 100%;',
        '    height: 100%;',
        '    background: rgba(0,0,0,0.3);',
        '    pointer-events: none;',
        '    opacity: 1;',
        '    z-index: 1;',
        '    transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);',
        '}',

        /* CONTENT LAYERS */
        '#custom-title-group {',
        '    position: absolute;',
        '    top: 50%;',
        '    left: 50%;',
        '    transform: translate(-50%, -50%);',
        '    text-align: center;',
        '    opacity: 0;',
        '    transition: opacity 3s ease 0.3s;',
        '    width: 100%;',
        '    z-index: 2;',
        '}',

        '#custom-cta {',
        '    position: relative;',
        '    z-index: 3;',
        '}',

        '#custom-splash-logo {',
        '    position: absolute;',
        '    top: 45%;',
        '    left: 50%;',
        '    transform: translate(-50%, -50%) scale(1);',
        '    width: clamp(180px, 20vw, 320px);',
        '    transition: transform 1s cubic-bezier(0.25,0.1,0.25,1), top 1s cubic-bezier(0.25,0.1,0.25,1);',
        '    z-index: 3;',
        '}',

        '#custom-title {',
        '    font-family: "Playfair Display", serif;',
        '    font-size: clamp(2.5rem, 5vw, 5.5rem);',
        '    color: #ffffff;',

        '}',

        '#custom-subtitle {',
        '    font-family: "Inter", sans-serif;',
        '    font-size: 1.125rem;',
        '    margin-top: 0.75rem;',
        '    color: #ffffff;',
        '    opacity: 0.8;',

        '}',

        '#custom-cta {',
        '    position: relative;',
        '    display: inline-block;',
        '    margin-top: 2rem;',
        '    padding: 1.2rem 3rem;',
        '    border: 1px solid #ffffff;',
        '    color: #ffffff;',
        '    font-family: "Inter", sans-serif;',
        '    font-size: 0.75rem;',
        '    letter-spacing: 0.1em;',
        '    background: transparent;',
        '    opacity: 0;',
        '    transition: opacity 3s ease 0.5s;',
        '    cursor: pointer;',
        '    pointer-events: auto;',
        '    transition: opacity 1.5s ease, padding 0.3s ease;',
        '}',

         '#custom-cta:hover {',
        '    padding: 1.2rem 3.5rem;',
        '}',

        '#custom-progress-text {',
        '    position: absolute;',
        '    bottom: 13rem;',
        '    left: 50%;',
        '    transform: translateX(-50%);',
        '    color: #ffffff;',
        '    font-family: "Inter", sans-serif;',
        '    font-size: 0.75rem;',
        '    transition: opacity 0.5s ease;',
        '    z-index: 2;',
        '}',

        '#custom-progress-container {',
        '    position: absolute;',
        '    bottom: 12rem;',
        '    left: 50%;',
        '    transform: translateX(-50%);',
        '    width: 12rem;',
        '    height: 0.25rem;',
        '    background-color: #333;',
        '    transition: opacity 0.5s ease;',
        '    z-index: 2;',
        '}',

        '#custom-progress-bar {',
        '    width: 0%;',
        '    height: 100%;',
        '    background-color: #fff;',
        '}',

        /* LOADED STATE */
        '#custom-splash-wrapper.loaded {',
        '    background-color: transparent;',
        '    pointer-events: none;',
        '}',

        '#custom-splash-wrapper.loaded #custom-splash-logo {',
        '    top: 4%;',
        '    transform: translate(-50%, 0) scale(0.7);',
        '}',

        '#custom-splash-wrapper.loaded #custom-progress-text,',
        '#custom-splash-wrapper.loaded #custom-progress-container {',
        '    opacity: 0;',
        '}',

        '#custom-splash-wrapper.loaded #custom-title-group {',
        '    opacity: 1;',
        '}',

        '#custom-splash-wrapper.loaded #custom-cta {',
        '    opacity: 1;',
        '}',

        /* CLICKED STATE */
        '#custom-splash-wrapper.clicked #custom-title-group,',
        '#custom-splash-wrapper.clicked #custom-cta {',
        '    opacity: 0;',
        '    transition: opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1);',
        '}',

        '#custom-splash-wrapper.clicked::after {',
        '    opacity: 0;',
        '}'
    ].join('\n');

    var style = document.createElement('style');
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    // GSAP LOAD
    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
    document.head.appendChild(script);
};
    // ──────────────────────────────────────────────
    // SHADER WARM-UP
    // Forces PlayCanvas to compile shader variants
    // for the watch model while the splash screen
    // is still covering the canvas → no visible stutter.
    // ──────────────────────────────────────────────
    var warmUpShaders = function () {
        var watchPivot = app.root.findByName('Watch_Pivot');
        var patek = app.root.findByName('Patek');
        var camera = app.root.findByName('Camera');

        // Debug: log what's in the scene so we can verify entity names
        if (!watchPivot || !patek) {
            console.warn('[Warm-up] Entity not found. watchPivot:', !!watchPivot, '| patek:', !!patek);
            console.warn('[Warm-up] Root children:', app.root.children.map(function (c) { return c.name; }));

            // Try to find them deeper in the hierarchy
            var allEntities = app.root.find(function () { return true; });
            var names = allEntities.map(function (e) { return e.name; });
            console.warn('[Warm-up] All entity names in scene:', names);
            return;
        }

        console.log('[Warm-up] Found Watch_Pivot and patek — starting shader warm-up');

        // 1. Save the original transform so we can restore it
        var origPos = watchPivot.getLocalPosition().clone();
        var origScale = watchPivot.getLocalScale().clone();
        var origRot = watchPivot.getLocalRotation().clone();

        // 2. Temporarily disable frustum culling so the GPU definitely sees the mesh
        var cameraComp = camera && camera.camera;
        var origCulling = true;
        if (cameraComp) {
            origCulling = cameraComp.frustumCulling;
            cameraComp.frustumCulling = false;
        }

        // 3. Make sure every mesh instance on the watch is visible & not culled
        var meshInstances = [];

        // Collect from 'render' components (Engine v1.55+)
        var renders = patek.findComponents('render');
        renders.forEach(function (renderComp) {
            renderComp.meshInstances.forEach(function (mi) {
                meshInstances.push({ mi: mi, origVisible: mi.visible, origCull: mi.cull });
                mi.visible = true;
                mi.cull = false;
            });
        });

        // Also collect from legacy 'model' components
        var models = patek.findComponents('model');
        models.forEach(function (modelComp) {
            if (modelComp.meshInstances) {
                modelComp.meshInstances.forEach(function (mi) {
                    meshInstances.push({ mi: mi, origVisible: mi.visible, origCull: mi.cull });
                    mi.visible = true;
                    mi.cull = false;
                });
            }
        });

        console.log('[Warm-up] Mesh instances to warm up:', meshInstances.length);

        // 4. Move the watch in front of the camera so the GPU processes it
        //    Scale to near-zero so it's invisible even if a frame leaks through
        watchPivot.setLocalScale(0.001, 0.001, 0.001);
        if (camera) {
            // Place at the camera's world position (camera at 1.237, 0.714, 1.906)
            watchPivot.setPosition(camera.getPosition());
        } else {
            watchPivot.setLocalPosition(0, 0, 0);
        }

        console.log('[Warm-up] Rendering watch for shader compilation…');

        // 5. Wait 2 rendered frames for the GPU to compile, then restore
        var framesLeft = 2;
        var onPostRender = function () {
            framesLeft--;
            if (framesLeft > 0) return;

            app.off('postrender', onPostRender);

            // Restore original position, rotation, and scale
            watchPivot.setLocalPosition(origPos.x, origPos.y, origPos.z);
            watchPivot.setLocalRotation(origRot.x, origRot.y, origRot.z, origRot.w);
            watchPivot.setLocalScale(origScale.x, origScale.y, origScale.z);

            // Restore frustum culling
            if (cameraComp) {
                cameraComp.frustumCulling = origCulling;
            }

            // Restore mesh instance visibility / cull flags
            meshInstances.forEach(function (entry) {
                entry.mi.visible = entry.origVisible;
                entry.mi.cull = entry.origCull;
            });

            console.log('[Warm-up] Shader warm-up complete – watch restored to start position');
        };

        app.on('postrender', onPostRender);
    };

    // ──────────────────────────────────────────────
    // INIT
    // ──────────────────────────────────────────────
    createCss();
    showSplash();

    app.on('preload:progress', setProgress);

    app.on('preload:end', function () {
        app.off('preload:progress');
    });

    app.on('start', function () {
        // Defer warm-up to the first update frame so the scene hierarchy
        // is fully built (loading screen script runs before entities exist)
        app.once('update', function () {
            warmUpShaders();
        });

        setTimeout(function () {
            hideSplash();
        }, 500); // slightly longer delay to ensure warm-up frames complete
    });
});