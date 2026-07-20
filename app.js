(() => {
  "use strict";
  const links = [
    ["Inicio", "index.html", "home"],
    ["Plan de Acción", "Plan_Accion_Centro_Norte.html", "plan"],
    ["Competidores", "competidores_cn.html", "map"],
    ["Regional Review", "regional-review.html", "chart"],
    ["Transferencias", "https://enriquecesar.github.io/Transferencia/", "swap", true],
    ["Calculadora de Ritmo", "https://enriquecesar.github.io/Calculadora_Ritmo/", "calc", true]
  ];
  const icons = {
    home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5M9 21v-7h6v7"/>',
    plan:'<path d="M6 3h12v18H6zM9 7h6M9 11h6M9 15h4"/>',
    map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15"/>',
    chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    swap:'<path d="M7 7h13l-3-3M17 17H4l3 3"/>',
    calc:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01"/>',
    arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>'
  };
  const current = location.pathname.split("/").pop() || "index.html";
  const bar = document.createElement("header");
  bar.className = "cn-shellbar";
  bar.innerHTML = `<a class="cn-campaign" href="index.html" aria-label="JUNTÉMONOS más, CentroNorteConnect"><strong>JUNTÉMONOS</strong><em>más</em></a><button class="cn-menu-toggle" type="button" aria-expanded="false" aria-controls="cn-main-nav" aria-label="Abrir navegación"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button><nav id="cn-main-nav" class="cn-nav" aria-label="Navegación principal">${links.map(([label, href, icon, external]) => `<a href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}${!external && href === current ? ' aria-current="page"' : ''}><svg viewBox="0 0 24 24" aria-hidden="true">${icons[icon]}</svg><span>${label}</span></a>`).join("")}</nav>`;
  const lastView = localStorage.getItem("cnLastView");
  if (current === "index.html") {
    const resume = document.createElement("a");
    const validLastView = links.some(link => !link[3] && link[1] === lastView && lastView !== "index.html");
    resume.href = validLastView ? lastView : "regional-review.html";
    resume.className = "cn-continue";
    resume.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${icons.arrow}</svg><span>Continuar</span>`;
    resume.setAttribute("aria-label", validLastView ? "Continuar en la última vista" : "Continuar a Regional Review");
    bar.querySelector(".cn-nav").append(resume);
  }
  document.body.prepend(bar);
  localStorage.setItem("cnLastView", current);

  const menuButton = bar.querySelector(".cn-menu-toggle");
  const closeMenu = () => {
    bar.classList.remove("is-menu-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir navegación");
  };
  menuButton.addEventListener("click", () => {
    const open = bar.classList.toggle("is-menu-open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Cerrar navegación" : "Abrir navegación");
  });
  bar.querySelector(".cn-nav").addEventListener("click", event => { if (event.target.closest("a")) closeMenu(); });
  document.addEventListener("pointerdown", event => { if (!bar.contains(event.target)) closeMenu(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape") { closeMenu(); menuButton.focus(); } });

  fetch("campaign.json")
    .then(response => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)))
    .then(({campaign}) => {
      if (!campaign) return;
      document.documentElement.style.setProperty("--cn-green", campaign.primaryColor || "#006241");
      bar.querySelector(".cn-campaign strong").textContent = campaign.primary || "JUNTÉMONOS";
      bar.querySelector(".cn-campaign em").textContent = campaign.accent || "más";
    })
    .catch(() => {});

  const network = document.createElement("div");
  network.className = "cn-network cn-hidden";
  network.setAttribute("role", "status");
  network.textContent = "Sin conexión · Contenido disponible offline";
  document.body.append(network);
  const syncNetwork = () => {
    network.classList.toggle("cn-hidden", navigator.onLine);
    if (navigator.onLine) document.documentElement.dataset.network = "online";
  };
  addEventListener("online", syncNetwork);
  addEventListener("offline", syncNetwork);
  syncNetwork();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("./sw.js");
        const showUpdate = worker => {
          if (!worker || !navigator.serviceWorker.controller) return;
          if (document.querySelector(".cn-update")) return;
          const notice = document.createElement("div");
          notice.className = "cn-update";
          notice.setAttribute("role", "status");
          notice.innerHTML = 'Nueva versión disponible.<button type="button">Actualizar</button>';
          notice.querySelector("button").addEventListener("click", () => worker.postMessage({type:"SKIP_WAITING"}));
          document.body.append(notice);
        };
        if (registration.waiting) showUpdate(registration.waiting);
        registration.addEventListener("updatefound", () => registration.installing.addEventListener("statechange", () => {
          if (registration.installing.state === "installed") showUpdate(registration.installing);
        }));
        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (!refreshing) { refreshing = true; location.reload(); }
        });
        setInterval(() => registration.update(), 60 * 60 * 1000);
      } catch (error) { console.warn("No fue posible registrar el modo offline.", error); }
    });
  }
})();
