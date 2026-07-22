(() => {
  "use strict";

  const CONFIG = window.CONVERGENCE_CONFIG || {};
  const NS = "http://www.w3.org/2000/svg";
  const FW = 980, FH = 600, DC = [-77.036, 38.907];
  const MODE_COLOR = { bus: "#e0a458", train: "#7fb3c8", plane: "#c98ba8" };
  const US_OUTLINE = [[-124.7,48.4],[-123.0,49.0],[-95.2,49.0],[-94.6,48.7],[-92.0,46.8],[-90.4,46.6],[-88.4,48.2],[-84.8,46.8],[-83.4,45.3],[-82.4,43.0],[-82.7,41.7],[-78.9,42.9],[-76.8,43.3],[-74.8,45.0],[-71.5,45.0],[-69.2,47.4],[-66.9,44.8],[-70.7,43.1],[-70.0,41.7],[-74.0,40.5],[-75.5,39.2],[-76.0,37.2],[-75.8,36.5],[-76.5,34.7],[-78.5,33.9],[-81.0,32.0],[-81.5,30.7],[-80.0,26.8],[-80.4,25.2],[-81.8,26.0],[-82.7,27.9],[-84.0,30.1],[-85.4,29.9],[-89.1,30.3],[-90.9,29.1],[-93.8,29.7],[-97.1,26.0],[-99.5,27.5],[-101.4,29.8],[-103.3,29.0],[-104.9,30.6],[-106.5,31.8],[-108.2,31.3],[-111.1,31.3],[-114.8,32.5],[-117.1,32.5],[-118.4,34.0],[-120.6,34.6],[-121.9,36.6],[-123.7,38.9],[-124.4,40.4],[-124.1,43.4]];

  const flowSvg = document.getElementById("flowSvg");
  const flowTip = document.getElementById("flowTip");
  const flowDataBody = document.getElementById("flowDataBody");
  const flowA11yStatus = document.getElementById("flowA11yStatus");
  const pauseToggle = document.getElementById("pauseToggle");
  const loadError = document.getElementById("loadError");
  const dataVersion = document.getElementById("dataVersion");
  const mediaReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let flows = [];
  let arcs = [];
  let flowMode = "all";
  let manualPaused = false;
  let documentVisible = !document.hidden;
  let mapVisible = true;
  let persistentTip = null;

  function project(lon, lat) {
    return [(lon + 126) / (126 - 65) * FW, (50 - lat) / (50 - 23.6) * FH];
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]));
  }

  function plural(mode, count) {
    if (mode === "bus") return count === 1 ? "bus" : "buses";
    return count === 1 ? mode : `${mode}s`;
  }

  async function loadLocalData() {
    const response = await fetch(CONFIG.localDataUrl || "./data/mobilization-origins.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Local data request failed: ${response.status}`);
    return response.json();
  }

  async function loadArcGisData() {
    const base = CONFIG.arcgisFeatureLayerUrl;
    if (!base) throw new Error("ArcGIS feature-layer URL is not configured");
    const url = new URL(base.replace(/\/$/, "") + "/query");
    url.search = new URLSearchParams({ where: "1=1", outFields: "*", returnGeometry: "true", f: "json" }).toString();
    const response = await fetch(url);
    if (!response.ok) throw new Error(`ArcGIS request failed: ${response.status}`);
    const payload = await response.json();
    if (payload.error) throw new Error(payload.error.message || "ArcGIS service error");
    return (payload.features || []).map(feature => ({
      ...feature.attributes,
      longitude: feature.geometry?.x ?? feature.attributes.longitude,
      latitude: feature.geometry?.y ?? feature.attributes.latitude
    }));
  }

  async function loadData() {
    if (CONFIG.dataMode === "arcgis") {
      try {
        const data = await loadArcGisData();
        dataVersion.textContent = `Data source: ArcGIS hosted feature layer (${data.length} records).`;
        return data;
      } catch (error) {
        console.warn("ArcGIS data unavailable; using bundled snapshot.", error);
        const fallback = await loadLocalData();
        dataVersion.textContent = `Data source: bundled JSON fallback (${fallback.length} records).`;
        return fallback;
      }
    }
    const data = await loadLocalData();
    dataVersion.textContent = `${CONFIG.dataVersionLabel || "Local JSON snapshot"} · ${data.length} records.`;
    return data;
  }

  function validateData(data) {
    const required = ["flow_id","mode","archival_label","map_label","charter_count","longitude","latitude","geometry_note"];
    if (!Array.isArray(data) || data.length === 0) throw new Error("No flow records were found");
    const ids = new Set();
    for (const row of data) {
      for (const key of required) if (row[key] === undefined || row[key] === null || row[key] === "") throw new Error(`Missing ${key} in a flow record`);
      if (!MODE_COLOR[row.mode]) throw new Error(`Unsupported mode: ${row.mode}`);
      if (ids.has(row.flow_id)) throw new Error(`Duplicate flow_id: ${row.flow_id}`);
      ids.add(row.flow_id);
    }
    return data;
  }

  function buildTable() {
    flowDataBody.innerHTML = [...flows]
      .sort((a,b) => a.archival_label.localeCompare(b.archival_label) || a.mode.localeCompare(b.mode))
      .map(f => `<tr data-mode="${escapeHtml(f.mode)}"><th scope="row">${escapeHtml(f.archival_label)}</th><td>${escapeHtml(f.mode[0].toUpperCase()+f.mode.slice(1))}</td><td>${Number(f.charter_count).toLocaleString()}</td><td>${escapeHtml(f.geometry_note)}</td></tr>`)
      .join("");
  }

  function showTip(event, flow, node, persist = false) {
    const rect = flowSvg.getBoundingClientRect();
    let clientX = event?.clientX, clientY = event?.clientY;
    if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) {
      const circle = node.querySelector("circle");
      const point = flowSvg.createSVGPoint();
      point.x = Number(circle.getAttribute("cx")); point.y = Number(circle.getAttribute("cy"));
      const screen = point.matrixTransform(flowSvg.getScreenCTM());
      clientX = screen.x; clientY = screen.y;
    }
    flowTip.style.display = "block";
    flowTip.style.left = `${Math.max(12, Math.min(rect.width - Math.min(282, rect.width - 24), clientX - rect.left + 14))}px`;
    flowTip.style.top = `${Math.max(10, Math.min(rect.height - 118, clientY - rect.top + 10))}px`;
    flowTip.innerHTML = `<b>${escapeHtml(flow.archival_label)}</b><br>${Number(flow.charter_count).toLocaleString()} ${plural(flow.mode, Number(flow.charter_count))} chartered — “definitely coming,” Aug. 22<br><small>${escapeHtml(flow.geometry_note)}</small>`;
    if (persist) persistentTip = node;
  }

  function hideTip(force = false) {
    if (!persistentTip || force) {
      flowTip.style.display = "none";
      if (force) persistentTip = null;
    }
  }

  function buildFlow() {
    flowSvg.replaceChildren();
    arcs = [];
    const bg = document.createElementNS(NS, "g");
    const outline = US_OUTLINE.map((p,i) => (i ? "L" : "M") + project(p[0],p[1]).map(v => v.toFixed(1)).join(",")).join(" ") + " Z";
    bg.innerHTML = `<rect width="${FW}" height="${FH}" fill="#191d26"/><path d="${outline}" fill="#20242f" stroke="#343b4c" stroke-width="1.4"/><text x="24" y="${FH-20}" fill="#5b6272" font-family="ui-sans-serif,system-ui" font-size="12" font-weight="700">SCHEMATIC — origins from the Aug. 22, 1963 memo; arcs are symbolic, not routes</text>`;
    flowSvg.appendChild(bg);

    const arcLayer = document.createElementNS(NS, "g");
    const dotLayer = document.createElementNS(NS, "g");
    const nodeLayer = document.createElementNS(NS, "g");
    flowSvg.append(arcLayer, dotLayer, nodeLayer);
    const [dx,dy] = project(DC[0],DC[1]);

    flows.forEach(f => {
      const [x,y] = project(Number(f.longitude),Number(f.latitude));
      const mx = (x+dx)/2, my = (y+dy)/2 - Math.min(140, Math.hypot(dx-x,dy-y)*0.22);
      const d = `M ${x.toFixed(1)},${y.toFixed(1)} Q ${mx.toFixed(1)},${my.toFixed(1)} ${dx.toFixed(1)},${dy.toFixed(1)}`;
      const count = Number(f.charter_count);
      const width = Math.max(1, Math.min(9, Math.sqrt(count)*0.9));
      const path = document.createElementNS(NS, "path");
      path.setAttribute("d", d); path.setAttribute("fill", "none");
      path.setAttribute("stroke", MODE_COLOR[f.mode]); path.setAttribute("stroke-width", width);
      path.setAttribute("stroke-opacity", "0.16"); path.setAttribute("stroke-linecap", "round");
      arcLayer.appendChild(path);

      const particleCount = Math.max(1, Math.min(14, Math.round(Math.sqrt(count)*1.4)));
      const particles = Array.from({length:particleCount},(_,i)=>i/particleCount);
      arcs.push({...f, path, len:path.getTotalLength(), particles, speed:(0.05+Math.random()*0.03)*(f.mode === "plane" ? 1.9 : f.mode === "train" ? 1.25 : 1), width});

      const node = document.createElementNS(NS, "g");
      const radius = Math.max(2.5, Math.min(9, Math.sqrt(count)*0.95));
      node.innerHTML = `<circle cx="${x}" cy="${y}" r="${radius}" fill="${MODE_COLOR[f.mode]}" fill-opacity=".85" stroke="#10131a" stroke-width="1"/>`;
      node.style.cursor = "pointer";
      node.dataset.mode = f.mode;
      node.dataset.flowId = f.flow_id;
      node.addEventListener("pointermove", event => { if (!persistentTip) showTip(event, f, node); });
      node.addEventListener("pointerleave", () => hideTip());
      node.addEventListener("click", event => {
        event.stopPropagation();
        if (persistentTip === node) hideTip(true); else { persistentTip = null; showTip(event, f, node, true); }
      });
      nodeLayer.appendChild(node);
    });

    const destination = document.createElementNS(NS, "g");
    destination.innerHTML = `<circle cx="${dx}" cy="${dy}" r="11" fill="#fffdf8"/><circle cx="${dx}" cy="${dy}" r="5.5" fill="#8d3e2d"/><text x="${dx+16}" y="${dy+5}" fill="#fffdf8" font-family="ui-sans-serif,system-ui" font-size="14" font-weight="800">WASHINGTON</text>`;
    nodeLayer.appendChild(destination);

    arcs.forEach(arc => {
      arc.dots = arc.particles.map(() => {
        const dot = document.createElementNS(NS, "circle");
        dot.setAttribute("r", Math.max(1.6, arc.width*0.55));
        dot.setAttribute("fill", MODE_COLOR[arc.mode]);
        dotLayer.appendChild(dot);
        return dot;
      });
    });
  }

  function applyMode(mode) {
    flowMode = mode;
    document.querySelectorAll(".mode-toggle").forEach(button => {
      const selected = button.dataset.mode === mode;
      button.classList.toggle("on", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    flowSvg.querySelectorAll("[data-mode]").forEach(node => {
      node.style.opacity = (mode === "all" || mode === node.dataset.mode) ? "1" : "0.12";
    });
    const rows = [...flowDataBody.querySelectorAll("tr")];
    rows.forEach(row => row.hidden = !(mode === "all" || mode === row.dataset.mode));
    const shown = rows.filter(row => !row.hidden).length;
    flowA11yStatus.textContent = `Showing ${shown} ${mode === "all" ? "documented origin-and-mode entries" : mode + " entries"}.`;
    hideTip(true);
  }

  function setPaused(paused) {
    manualPaused = paused;
    pauseToggle.setAttribute("aria-pressed", String(paused));
    pauseToggle.textContent = paused ? "Resume motion" : "Pause motion";
  }

  function animate() {
    let last = performance.now();
    function tick(now) {
      const dt = Math.min(0.05, (now-last)/1000); last = now;
      const canMove = mapVisible && documentVisible && !manualPaused && !mediaReducedMotion.matches;
      arcs.forEach(arc => {
        const on = flowMode === "all" || flowMode === arc.mode;
        arc.path.setAttribute("stroke-opacity", on ? "0.16" : "0.03");
        arc.dots.forEach((dot,index) => {
          if (!on) { dot.setAttribute("opacity", "0"); return; }
          if (canMove) arc.particles[index] = (arc.particles[index] + arc.speed*dt) % 1;
          const point = arc.path.getPointAtLength(arc.particles[index]*arc.len);
          dot.setAttribute("cx", point.x); dot.setAttribute("cy", point.y);
          dot.setAttribute("opacity", String(mediaReducedMotion.matches ? 0.58 : 0.35 + 0.65*Math.sin(Math.PI*arc.particles[index])));
        });
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  document.querySelectorAll(".mode-toggle").forEach(button => button.addEventListener("click", () => applyMode(button.dataset.mode)));
  pauseToggle.addEventListener("click", () => setPaused(!manualPaused));
  document.addEventListener("visibilitychange", () => { documentVisible = !document.hidden; });
  document.addEventListener("keydown", event => { if (event.key === "Escape") hideTip(true); });
  document.addEventListener("click", event => { if (!event.target.closest("#flowSvg") && !event.target.closest("#flowTip")) hideTip(true); });
  new IntersectionObserver(entries => { mapVisible = entries[0]?.isIntersecting ?? true; }, {threshold:0.05}).observe(flowSvg);

  loadData().then(validateData).then(data => {
    flows = data;
    buildTable();
    buildFlow();
    applyMode("all");
    if (mediaReducedMotion.matches) {
      setPaused(true);
      flowA11yStatus.textContent += " Motion is paused because reduced motion is enabled.";
    }
    animate();
  }).catch(error => {
    console.error(error);
    loadError.hidden = false;
    flowA11yStatus.textContent = "The interactive map data could not load.";
  });
})();
