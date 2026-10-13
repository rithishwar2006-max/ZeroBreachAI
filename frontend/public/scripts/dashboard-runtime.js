(() => {
document.documentElement.classList.add('js');

  // Dynamic API URL Helper for Production Deployments & Local Dev
  window.getApiBase = function() {
    if (window.__API_BASE__) return window.__API_BASE__;
    try {
      var custom = localStorage.getItem('API_BASE_URL');
      if (custom) return custom;
    } catch(e){}
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://127.0.0.1:8000';
    }
    return '';
  };
  window.apiUrl = function(endpoint) {
    var base = window.getApiBase();
    if (!base) return endpoint;
    return base.replace(/\/+$/, '') + '/' + endpoint.replace(/^\/+/, '');
  };


  // Single global 3D registry and cleanup manager
  window.__ZB_3D_STATE__ = window.__ZB_3D_STATE__ || {};
  window.__ZB_CLEANUP_3D__ = function() {
    var s = window.__ZB_3D_STATE__;
    if (!s) return;
    if (s.earthAnimId) { cancelAnimationFrame(s.earthAnimId); s.earthAnimId = null; }
    if (s.earthRenderer) {
      try { s.earthRenderer.dispose(); s.earthRenderer.forceContextLoss(); } catch(e){}
      s.earthRenderer = null;
    }
    if (s.cosmosAnimId) { cancelAnimationFrame(s.cosmosAnimId); s.cosmosAnimId = null; }
    if (s.cosmosRenderer) {
      try { s.cosmosRenderer.dispose(); s.cosmosRenderer.forceContextLoss(); } catch(e){}
      s.cosmosRenderer = null;
    }
    if (s.waveAnimId) { cancelAnimationFrame(s.waveAnimId); s.waveAnimId = null; }
    if (s.waveRenderer) {
      try { s.waveRenderer.dispose(); s.waveRenderer.forceContextLoss(); } catch(e){}
      s.waveRenderer = null;
    }
    if (s.globeAnimId) { cancelAnimationFrame(s.globeAnimId); s.globeAnimId = null; }
    if (s.globeRenderer) {
      try { s.globeRenderer.dispose(); s.globeRenderer.forceContextLoss(); } catch(e){}
      s.globeRenderer = null;
    }
  };

  // ---- Count-up stats, once, on scroll into view ----
  function animateCount(id, end, opts){
    opts = opts || {};
    const el = document.getElementById(id);
    if (!el || !end) return;
    if (el.dataset.animating === String(end)) return;
    el.dataset.animating = String(end);

    const dur = 800, t0 = performance.now();
    function step(t){
      const p = Math.min((t - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const val = Math.round(end * ease);
      el.textContent = (opts.prefix||'') + val.toLocaleString('en-US') + (opts.suffix||'');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  // ---- Section-level reveal: whole blocks materialize as they enter view ----
  (function(){
    const targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;
    const ro = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting){
          e.target.classList.add('in');
          ro.unobserve(e.target);
        }
      });
    }, {threshold:0.15});
    targets.forEach(el => ro.observe(el));
  })();


  // ---- Scroll progress bar ----
  (function(){
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    function update(){
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', update, {passive:true});
    window.addEventListener('resize', update);
    update();
  })();

  // ---- Scrollspy: dynamically underline active nav tab on scroll ----
  (function initScrollspy(){
    window.safeScrollTo = function(id, fallbackY) {
      const el = document.getElementById(id);
      if (el) {
        const navHeight = 75;
        const currentY = window.pageYOffset || document.documentElement.scrollTop;
        const elTop = el.getBoundingClientRect().top + currentY;
        const targetY = Math.max(0, elTop - navHeight);
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      } else if (typeof fallbackY === 'number') {
        window.scrollTo({ top: fallbackY, behavior: 'smooth' });
      }
    };

    function setActiveNav(navId) {
      const allNavs = ['nav-dashboard', 'nav-monitor', 'nav-alerts', 'nav-intel', 'nav-reports', 'nav-support'];
      allNavs.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (id === navId) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      });
    }
    window.setActiveNav = setActiveNav;

    function handleScroll() {
      // If notifications dropdown popover is currently open, keep alerts active
      const pop = document.getElementById('notifications-popover');
      if (pop && pop.style.display === 'block') {
        setActiveNav('nav-alerts');
        return;
      }

      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const vh = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const triggerLine = scrollY + 160;

      // 1. If at top of page, always highlight Dashboard
      if (scrollY < 120) {
        setActiveNav('nav-dashboard');
        return;
      }

      // 2. At bottom of page -> highlight the lowest visible section
      if (scrollY + vh >= docHeight - 40) {
        const sectionsList = [
          { navId: 'nav-support', id: 'modules' },
          { navId: 'nav-support', id: 'support' },
          { navId: 'nav-support', id: 'admin-tickets' },
          { navId: 'nav-reports', id: 'reports' },
          { navId: 'nav-intel', id: 'threat-intel-analytics' },
          { navId: 'nav-monitor', id: 'preview' },
          { navId: 'nav-monitor', id: 'ingest' },
          { navId: 'nav-dashboard', id: 'hero' }
        ];
        for (let i = 0; i < sectionsList.length; i++) {
          const el = document.getElementById(sectionsList[i].id);
          if (!el || el.offsetParent === null) continue;
          const rect = el.getBoundingClientRect();
          if (rect.top < vh - 40) { // Top is visible in the viewport
            setActiveNav(sectionsList[i].navId);
            return;
          }
        }
      }

      const getTop = function(id) {
        const el = document.getElementById(id);
        if (!el || el.offsetParent === null) return null; // Skip hidden elements
        const rect = el.getBoundingClientRect();
        return rect.top + (window.scrollY || document.documentElement.scrollTop);
      };

      // 3. Check sections from bottom to top using true viewport bounding rect
      const sections = [
        { navId: 'nav-support', id: 'modules' },
        { navId: 'nav-support', id: 'support' },
        { navId: 'nav-support', id: 'admin-tickets' },
        { navId: 'nav-reports', id: 'reports' },
        { navId: 'nav-intel', id: 'threat-intel-analytics' },
        { navId: 'nav-monitor', id: 'preview' },
        { navId: 'nav-monitor', id: 'ingest' },
        { navId: 'nav-dashboard', id: 'hero' }
      ];

      for (let i = 0; i < sections.length; i++) {
        const top = getTop(sections[i].id);
        if (top !== null && triggerLine >= top) {
          setActiveNav(sections[i].navId);
          return;
        }
      }

      setActiveNav('nav-dashboard');
    }

    window.updateActiveNav = handleScroll;
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    setTimeout(handleScroll, 150);
  })();

  // ---- Ingest panel: mode switch (live capture <-> upload <-> stream) ----
  (function(){
    const tabs = document.querySelectorAll('.mode-btn');
    const thumb = document.getElementById('mode-thumb');
    const panes = document.querySelectorAll('.mode-pane');
    if (!tabs.length) return;

    function positionThumb(btn) {
      if (!thumb || !btn) return;
      thumb.style.width = btn.offsetWidth + 'px';
      thumb.style.transform = `translateX(${btn.offsetLeft - 3}px)`;
    }

    const activeBtn = document.querySelector('.mode-btn.active') || tabs[0];
    setTimeout(() => positionThumb(activeBtn), 80);

    tabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) return;
        tabs.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-selected','true');
        positionThumb(btn);

        const target = btn.dataset.mode;
        panes.forEach(p => {
          if (p.dataset.pane === target){
            p.hidden = false;
            p.classList.add('fading');
            requestAnimationFrame(() => requestAnimationFrame(() => p.classList.remove('fading')));
          } else {
            p.hidden = true;
          }
        });
      });
    });
  })();

  // ---- Unified File & Dataset Stream Controller (SSE) ----
  (function(){
    const scanBtn = document.getElementById('stream-scan-btn');
    const stopBtn = document.getElementById('stream-stop-btn');
    const datasetSelect = document.getElementById('stream-dataset');
    const chunkSelect = document.getElementById('stream-chunk-size');
    const maxFlowsSelect = document.getElementById('stream-max-flows');
    const statusText = document.getElementById('stream-status-text');
    const scannedCount = document.getElementById('stream-scanned-count');
    const anomCount = document.getElementById('stream-anom-count');
    const chunkIdEl = document.getElementById('stream-chunk-id');
    const tableBody = document.getElementById('stream-table-body');

    // Input Source Toggle Elements
    const tabBenchmark = document.getElementById('source-tab-benchmark');
    const tabCustom = document.getElementById('source-tab-custom');
    const viewBenchmark = document.getElementById('view-source-benchmark');
    const viewCustom = document.getElementById('view-source-custom');

    // Custom File Dropzone Elements
    const dropzone = document.getElementById('dropzone');
    const streamFileInput = document.getElementById('stream-file-input');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');

    if (!scanBtn) return;

    let activeSource = 'benchmark'; // 'benchmark' or 'custom'
    let selectedFile = null;
    let eventSource = null;
    let totalRows = 0;
    let totalAnoms = 0;
    const MAX_DOM_ROWS = 150; // Rolling window cap

    // Source toggle switching
    if (tabBenchmark && tabCustom) {
      tabBenchmark.addEventListener('click', () => {
        activeSource = 'benchmark';
        tabBenchmark.classList.add('active');
        tabBenchmark.style.background = 'rgba(0,200,212,0.15)';
        tabBenchmark.style.color = 'var(--signal)';
        tabBenchmark.style.fontWeight = '600';

        tabCustom.classList.remove('active');
        tabCustom.style.background = 'transparent';
        tabCustom.style.color = 'var(--text-low)';
        tabCustom.style.fontWeight = '500';

        if (viewBenchmark) viewBenchmark.style.display = 'block';
        if (viewCustom) viewCustom.style.display = 'none';
      });

      tabCustom.addEventListener('click', () => {
        activeSource = 'custom';
        tabCustom.classList.add('active');
        tabCustom.style.background = 'rgba(0,200,212,0.15)';
        tabCustom.style.color = 'var(--signal)';
        tabCustom.style.fontWeight = '600';

        tabBenchmark.classList.remove('active');
        tabBenchmark.style.background = 'transparent';
        tabBenchmark.style.color = 'var(--text-low)';
        tabBenchmark.style.fontWeight = '500';

        if (viewBenchmark) viewBenchmark.style.display = 'none';
        if (viewCustom) viewCustom.style.display = 'block';
      });
    }

    // Dropzone logic
    function formatBytes(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function setSelectedFile(file) {
      if (!file) return;
      selectedFile = file;
      if (fileName) fileName.textContent = file.name;
      if (fileSize) fileSize.textContent = formatBytes(file.size);
      if (fileInfo) fileInfo.hidden = false;
    }

    if (streamFileInput) {
      streamFileInput.addEventListener('change', () => {
        if (streamFileInput.files && streamFileInput.files[0]) {
          setSelectedFile(streamFileInput.files[0]);
        }
      });
    }

    if (dropzone) {
      ['dragover', 'dragenter'].forEach(evt => {
        dropzone.addEventListener(evt, (e) => {
          e.preventDefault();
          dropzone.classList.add('drag');
        });
      });
      ['dragleave', 'dragend'].forEach(evt => {
        dropzone.addEventListener(evt, () => dropzone.classList.remove('drag'));
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          setSelectedFile(e.dataTransfer.files[0]);
        }
      });
    }

    function resetUI() {
      scanBtn.style.display = 'inline-block';
      scanBtn.disabled = false;
      scanBtn.textContent = 'Start Streaming Scan';
      stopBtn.style.display = 'none';
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        if (statusText) {
          statusText.innerHTML = '<span class="dot" style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#ff0055;margin-right:6px"></span>STOPPED BY USER';
          statusText.style.color = '#ff0055';
        }
        resetUI();
      });
    }

    scanBtn.addEventListener('click', async () => {
      let targetDataset = '';

      if (activeSource === 'custom') {
        if (!selectedFile) {
          if (statusText) {
            statusText.innerHTML = '<span class="dot" style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#ff0055;margin-right:6px"></span>SELECT FILE FIRST';
            statusText.style.color = '#ff0055';
          }
          if (dropzone) {
            dropzone.style.borderColor = 'var(--critical)';
            setTimeout(() => { dropzone.style.borderColor = ''; }, 2000);
          }
          return;
        }

        scanBtn.disabled = true;
        scanBtn.textContent = 'Uploading payload...';
        if (statusText) {
          statusText.innerHTML = '<span class="dot" style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#00f0ff;margin-right:6px;animation:pulse 1s infinite"></span>UPLOADING FILE...';
          statusText.style.color = '#00f0ff';
        }

        try {
          const formData = new FormData();
          formData.append('file', selectedFile);
          const uploadRes = await fetch(window.apiUrl('/api/sniffer/upload-stream-file'), {
            method: 'POST',
            headers: window.getAuthHeaders ? window.getAuthHeaders() : {},
            body: formData
          });

          if (!uploadRes.ok) {
            throw new Error('Upload failed with status ' + uploadRes.status);
          }

          const uploadData = await uploadRes.json();
          targetDataset = uploadData.filename;
        } catch (err) {
          console.error("Stream upload error:", err);
          if (statusText) {
            statusText.innerHTML = '<span class="dot" style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#ff0055;margin-right:6px"></span>UPLOAD FAILED';
            statusText.style.color = '#ff0055';
          }
          resetUI();
          return;
        }
      } else {
        targetDataset = datasetSelect ? datasetSelect.value : 'friday.csv';
      }

      // Reset counters & live table (Stateless restart from row 1)
      totalRows = 0;
      totalAnoms = 0;
      window.__ZB_STREAM_ANOMALIES__ = 0;
      if (scannedCount) scannedCount.textContent = '0';
      if (anomCount) anomCount.textContent = '0';
      if (chunkIdEl) chunkIdEl.textContent = '#0';
      if (tableBody) tableBody.innerHTML = '';

      scanBtn.style.display = 'none';
      if (stopBtn) stopBtn.style.display = 'inline-block';

      if (statusText) {
        statusText.innerHTML = '<span class="dot" style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#00f0ff;margin-right:6px;animation:pulse 1s infinite"></span>STREAMING (SSE)';
        statusText.style.color = '#00f0ff';
      }

      const chunkSize = chunkSelect ? parseInt(chunkSelect.value, 10) : 2500;
      const maxFlows = maxFlowsSelect ? parseInt(maxFlowsSelect.value, 10) : 10000;

      let token = localStorage.getItem('token') || '';
      if (!token) {
        const username = localStorage.getItem('username') || localStorage.getItem('role') || 'admin';
        token = 'demo-token-' + username;
      }

      // High-speed stream with zero artificial delay
      const streamUrl = `${window.apiUrl("/")}/api/sniffer/scan-stream?dataset=${encodeURIComponent(targetDataset)}&chunk_size=${chunkSize}&max_flows=${maxFlows}&delay_ms=0&token=${encodeURIComponent(token)}`;

      if (eventSource) eventSource.close();
      eventSource = new EventSource(streamUrl);

      eventSource.addEventListener('start', (e) => {
        try {
          const data = JSON.parse(e.data);
          if (statusText) {
            statusText.innerHTML = `<span class="dot" style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#00f0ff;margin-right:6px"></span>STREAMING: ${data.dataset}`;
          }
        } catch(err) {}
      });

      let lastChartRefresh = 0;

      eventSource.addEventListener('chunk', (e) => {
        try {
          const data = JSON.parse(e.data);
          totalRows = data.total_scanned || (totalRows + (data.chunk_size || 50));
          totalAnoms = data.total_anomalies || totalAnoms;
          window.__ZB_STREAM_ANOMALIES__ = totalAnoms;

          if (scannedCount) scannedCount.textContent = totalRows.toLocaleString();
          if (anomCount) anomCount.textContent = totalAnoms.toLocaleString();
          if (chunkIdEl) chunkIdEl.textContent = '#' + (data.chunk_id || 1);

          // Update summary strip telemetry counters
          const v1 = document.getElementById('v1');
          const v2 = document.getElementById('v2');
          if (v2) v2.textContent = totalAnoms.toLocaleString();
          if (v1) {
            const currentV1 = parseInt((v1.textContent || '0').replace(/,/g, ''), 10) || 0;
            v1.textContent = Math.max(currentV1, totalAnoms).toLocaleString();
          }

          // Smoothly throttled dashboard refresh (at most once every 1.5s to keep UI at 60 FPS)
          const now = Date.now();
          if (data.anomalies_in_chunk > 0 && (now - lastChartRefresh > 1500)) {
            lastChartRefresh = now;
            if (typeof window.fetchAlerts === 'function') window.fetchAlerts();
            if (typeof window.fetchStats === 'function') window.fetchStats();
            if (typeof window.fetchFlowVolume === 'function') window.fetchFlowVolume();
            if (typeof window.fetchProtocols === 'function') window.fetchProtocols();
          }

          // Prepend new flows to rolling table (prioritize anomalies + fast DOM fragment)
          if (tableBody && data.flows && Array.isArray(data.flows)) {
            const frag = document.createDocumentFragment();
            const anomFlows = data.flows.filter(f => f.prediction !== 'BENIGN');
            const benignFlows = data.flows.filter(f => f.prediction === 'BENIGN');
            // Show all anomalies in this chunk plus recent benign flows up to 35 rows per chunk
            const flowsToRender = anomFlows.concat(benignFlows.slice(0, Math.max(5, 35 - anomFlows.length))).slice(0, 35);

            flowsToRender.forEach(flow => {
              const tr = document.createElement('tr');
              tr.style.borderBottom = '1px solid rgba(255,255,255,0.04)';
              const isMal = flow.prediction !== 'BENIGN';
              const sevColor = isMal ? (flow.risk_score >= 80 ? '#ff0055' : (flow.risk_score >= 60 ? '#f59e0b' : '#eab308')) : '#10b981';

              tr.innerHTML = `
                <td style="padding:6px 10px;color:var(--text-low);white-space:nowrap">${flow.time || '--:--:--'}</td>
                <td style="padding:6px 10px;color:#fff;font-family:var(--mono)">${flow.source || '0.0.0.0'}</td>
                <td style="padding:6px 10px;color:var(--text-low);font-family:var(--mono)">${flow.target || '0.0.0.0'}</td>
                <td style="padding:6px 10px;color:#38bdf8">${flow.protocol || 'TCP'}</td>
                <td style="padding:6px 10px">
                  <span style="display:inline-block;padding:1px 6px;border-radius:3px;font-size:9.5px;font-weight:700;color:${sevColor};background:${isMal ? 'rgba(255,0,85,0.1)' : 'rgba(16,185,129,0.1)'};border:1px solid ${sevColor}44">
                    ${flow.prediction}
                  </span>
                </td>
                <td style="padding:6px 10px;color:${sevColor};font-weight:700">${flow.risk_score || 0}</td>
                <td style="padding:6px 10px;color:var(--text-low);font-size:10px">${flow.model || 'RF'}</td>
              `;
              frag.appendChild(tr);
            });
            tableBody.insertBefore(frag, tableBody.firstChild);

            // Rolling window: Trim bottom rows if exceeded MAX_DOM_ROWS
            while (tableBody.children.length > MAX_DOM_ROWS) {
              tableBody.removeChild(tableBody.lastChild);
            }
          }
        } catch(err) {
          console.error("Chunk parse error:", err);
        }
      });

      eventSource.addEventListener('complete', (e) => {
        try {
          const data = JSON.parse(e.data);
          if (statusText) {
            statusText.innerHTML = '<span class="dot" style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#10b981;margin-right:6px"></span>SCAN COMPLETE';
            statusText.style.color = '#10b981';
          }
          if (typeof window.addNotificationEvent === 'function') {
            window.addNotificationEvent({
              source: 'Dataset Stream',
              anomalies: totalAnoms,
              time: new Date().toLocaleString('en-GB'),
              vector: (activeSource === 'custom' && selectedFile ? selectedFile.name : targetDataset) + ': ' + totalAnoms + ' anomalies detected'
            });
          }
          if (typeof window.fetchAlerts === 'function') window.fetchAlerts();
          if (typeof window.fetchStats === 'function') window.fetchStats();
          if (typeof window.fetchFlowVolume === 'function') window.fetchFlowVolume();
          if (typeof window.fetchProtocols === 'function') window.fetchProtocols();
        } catch(err) {}
        resetUI();
      });

      eventSource.addEventListener('error', (err) => {
        if (eventSource && eventSource.readyState === EventSource.CLOSED) {
          if (statusText) {
            statusText.innerHTML = '<span class="dot" style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#10b981;margin-right:6px"></span>SCAN FINISHED';
            statusText.style.color = '#10b981';
          }
        }
        resetUI();
      });
    });
  })();

  // ---- API Integration: Sniffer, Alerts, Flow Volume & Stats ----
  (function(){
    const toggle = document.getElementById('capture-toggle');
    const status = document.getElementById('live-status');
    const text = document.getElementById('capture-text');
    const bars = document.getElementById('mini-bars');
    const list = document.getElementById('log-list');
    const barEls = bars ? bars.querySelectorAll('span') : [];
    
    
    window.getAuthHeaders = function() {
      let token = localStorage.getItem('token');
      if (!token) {
        const username = localStorage.getItem('username') || localStorage.getItem('role') || 'admin';
        token = 'demo-token-' + username;
        localStorage.setItem('token', token);
      }
      return { 'Authorization': 'Bearer ' + token };
    }

    let capturing = false;

    async function checkStatus() {
      try {
        const res = await fetch(window.apiUrl('/api/sniffer/status'), {headers: window.getAuthHeaders()});
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'Running' && !capturing) {
            capturing = true;
            updateUIState();
          } else if (data.status !== 'Running' && capturing) {
            capturing = false;
            updateUIState();
          }
        }
      } catch (e) {
        console.warn('API Offline - Engaging Portfolio Demo Telemetry Fallback:', e);

          // Portfolio / Offline Fallback Alerts (Curated from CICIDS2017 Benchmark)
          if (!allAlerts || allAlerts.length === 0) {
            const now = Date.now();
            const fallbackAlerts = [
              { id: 'fl-101', timestamp: new Date(now - 1000*15).toISOString(), source_ip: '192.168.10.50', destination_ip: '172.16.0.1', protocol: 'TCP', prediction: 'Portscan', confidence: 0.984, risk_score: 69.0, severity: 'High', src_port: 44820, dst_port: 80, model_consensus: 'RF (0.98) | XGB (0.97)' },
              { id: 'fl-102', timestamp: new Date(now - 1000*48).toISOString(), source_ip: '172.16.0.1', destination_ip: '192.168.10.50', protocol: 'TCP', prediction: 'DDoS', confidence: 0.999, risk_score: 92.4, severity: 'Critical', src_port: 51230, dst_port: 80, model_consensus: 'XGBoost Winner (0.999)' },
              { id: 'fl-103', timestamp: new Date(now - 1000*95).toISOString(), source_ip: '192.168.10.14', destination_ip: '134.170.115.55', protocol: 'TCP', prediction: 'Botnet', confidence: 0.942, risk_score: 78.1, severity: 'Critical', src_port: 49447, dst_port: 443, model_consensus: 'RF (0.94) | ET (0.93)' },
              { id: 'fl-104', timestamp: new Date(now - 1000*160).toISOString(), source_ip: '192.168.10.8', destination_ip: '192.168.10.50', protocol: 'TCP', prediction: 'DoS Hulk', confidence: 0.995, risk_score: 88.5, severity: 'Critical', src_port: 53112, dst_port: 80, model_consensus: 'Dual-Consensus (0.995)' },
              { id: 'fl-105', timestamp: new Date(now - 1000*240).toISOString(), source_ip: '172.16.0.1', destination_ip: '192.168.10.50', protocol: 'TCP', prediction: 'Infiltration - Portscan', confidence: 0.923, risk_score: 74.0, severity: 'High', src_port: 48902, dst_port: 22, model_consensus: 'XGB (0.923)' },
              { id: 'fl-106', timestamp: new Date(now - 1000*360).toISOString(), source_ip: '192.168.10.17', destination_ip: '192.168.10.3', protocol: 'UDP', prediction: 'BENIGN', confidence: 0.999, risk_score: 2.1, severity: 'Low', src_port: 123, dst_port: 123, model_consensus: 'Dual-Consensus' },
              { id: 'fl-107', timestamp: new Date(now - 1000*480).toISOString(), source_ip: '172.16.0.1', destination_ip: '192.168.10.50', protocol: 'TCP', prediction: 'FTP-Patator', confidence: 0.967, risk_score: 64.2, severity: 'High', src_port: 41200, dst_port: 21, model_consensus: 'RF (0.967)' },
              { id: 'fl-108', timestamp: new Date(now - 1000*620).toISOString(), source_ip: '172.16.0.1', destination_ip: '192.168.10.50', protocol: 'TCP', prediction: 'SSH-Patator', confidence: 0.971, risk_score: 67.8, severity: 'High', src_port: 43100, dst_port: 22, model_consensus: 'XGB (0.971)' },
              { id: 'fl-109', timestamp: new Date(now - 1000*780).toISOString(), source_ip: '192.168.10.5', destination_ip: '205.174.165.73', protocol: 'TCP', prediction: 'Web Attack - Brute Force', confidence: 0.912, risk_score: 71.5, severity: 'High', src_port: 53888, dst_port: 8080, model_consensus: 'RF (0.912)' },
              { id: 'fl-110', timestamp: new Date(now - 1000*920).toISOString(), source_ip: '192.168.10.9', destination_ip: '192.168.10.50', protocol: 'TCP', prediction: 'DoS GoldenEye', confidence: 0.988, risk_score: 84.0, severity: 'Critical', src_port: 52140, dst_port: 80, model_consensus: 'Dual-Consensus' }
            ];
            allAlerts = fallbackAlerts;
            window.allAlerts = fallbackAlerts;
            renderLogItems(fallbackAlerts.slice(0, window.visibleLogs || 15));
          }
      }
    }

    let allAlerts = [];
    window.allAlerts = allAlerts;
    let modalCurrentPage = 1;
    const modalPageSize = 15;
    let modalFilteredAlerts = [];

    async function fetchAlerts() {
      try {
        const fetchLimit = Math.max(window.visibleLogs || 25, 50);
        const res = await fetch(window.apiUrl('/api/dashboard/alerts?limit=' + fetchLimit), {headers: window.getAuthHeaders()});
        if (res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/';
            return;
          }
          const alerts = await res.json();
          allAlerts = alerts;
          window.allAlerts = alerts;
          renderLogItems(alerts.slice(0, window.visibleLogs || 15));
        }
      } catch (e) {
        console.warn('API Offline - Engaging Portfolio Demo Telemetry Fallback:', e);

          // Portfolio / Offline Fallback Alerts (Curated from CICIDS2017 Benchmark)
          if (!allAlerts || allAlerts.length === 0) {
            const now = Date.now();
            const fallbackAlerts = [
              { id: 'fl-101', timestamp: new Date(now - 1000*15).toISOString(), source_ip: '192.168.10.50', destination_ip: '172.16.0.1', protocol: 'TCP', prediction: 'Portscan', confidence: 0.984, risk_score: 69.0, severity: 'High', src_port: 44820, dst_port: 80, model_consensus: 'RF (0.98) | XGB (0.97)' },
              { id: 'fl-102', timestamp: new Date(now - 1000*48).toISOString(), source_ip: '172.16.0.1', destination_ip: '192.168.10.50', protocol: 'TCP', prediction: 'DDoS', confidence: 0.999, risk_score: 92.4, severity: 'Critical', src_port: 51230, dst_port: 80, model_consensus: 'XGBoost Winner (0.999)' },
              { id: 'fl-103', timestamp: new Date(now - 1000*95).toISOString(), source_ip: '192.168.10.14', destination_ip: '134.170.115.55', protocol: 'TCP', prediction: 'Botnet', confidence: 0.942, risk_score: 78.1, severity: 'Critical', src_port: 49447, dst_port: 443, model_consensus: 'RF (0.94) | ET (0.93)' },
              { id: 'fl-104', timestamp: new Date(now - 1000*160).toISOString(), source_ip: '192.168.10.8', destination_ip: '192.168.10.50', protocol: 'TCP', prediction: 'DoS Hulk', confidence: 0.995, risk_score: 88.5, severity: 'Critical', src_port: 53112, dst_port: 80, model_consensus: 'Dual-Consensus (0.995)' },
              { id: 'fl-105', timestamp: new Date(now - 1000*240).toISOString(), source_ip: '172.16.0.1', destination_ip: '192.168.10.50', protocol: 'TCP', prediction: 'Infiltration - Portscan', confidence: 0.923, risk_score: 74.0, severity: 'High', src_port: 48902, dst_port: 22, model_consensus: 'XGB (0.923)' },
              { id: 'fl-106', timestamp: new Date(now - 1000*360).toISOString(), source_ip: '192.168.10.17', destination_ip: '192.168.10.3', protocol: 'UDP', prediction: 'BENIGN', confidence: 0.999, risk_score: 2.1, severity: 'Low', src_port: 123, dst_port: 123, model_consensus: 'Dual-Consensus' },
              { id: 'fl-107', timestamp: new Date(now - 1000*480).toISOString(), source_ip: '172.16.0.1', destination_ip: '192.168.10.50', protocol: 'TCP', prediction: 'FTP-Patator', confidence: 0.967, risk_score: 64.2, severity: 'High', src_port: 41200, dst_port: 21, model_consensus: 'RF (0.967)' },
              { id: 'fl-108', timestamp: new Date(now - 1000*620).toISOString(), source_ip: '172.16.0.1', destination_ip: '192.168.10.50', protocol: 'TCP', prediction: 'SSH-Patator', confidence: 0.971, risk_score: 67.8, severity: 'High', src_port: 43100, dst_port: 22, model_consensus: 'XGB (0.971)' },
              { id: 'fl-109', timestamp: new Date(now - 1000*780).toISOString(), source_ip: '192.168.10.5', destination_ip: '205.174.165.73', protocol: 'TCP', prediction: 'Web Attack - Brute Force', confidence: 0.912, risk_score: 71.5, severity: 'High', src_port: 53888, dst_port: 8080, model_consensus: 'RF (0.912)' },
              { id: 'fl-110', timestamp: new Date(now - 1000*920).toISOString(), source_ip: '192.168.10.9', destination_ip: '192.168.10.50', protocol: 'TCP', prediction: 'DoS GoldenEye', confidence: 0.988, risk_score: 84.0, severity: 'Critical', src_port: 52140, dst_port: 80, model_consensus: 'Dual-Consensus' }
            ];
            allAlerts = fallbackAlerts;
            window.allAlerts = fallbackAlerts;
            renderLogItems(fallbackAlerts.slice(0, window.visibleLogs || 15));
          }
      }
    }
    window.fetchAlerts = fetchAlerts;

    function renderLogItems(items) {
      if (!list) return;
      list.innerHTML = '';
      if (!items || items.length === 0) {
        list.innerHTML = '<div style="padding:24px; text-align:center; color:#64748b; font-family:var(--mono); font-size:12px;">No matching log events detected in live stream</div>';
        return;
      }
      items.forEach(alert => {
        const row = document.createElement('div');
        row.className = 'log-row';
        const isCrit = alert.severity_tier === 'Critical' || alert.severity_tier === 'High';
        const isElev = alert.risk_score >= 40 && !isCrit;
        const color = isCrit ? '#ff0055' : (isElev ? '#f59e0b' : '#00c8d4');
        const riskBg = isCrit ? 'rgba(255, 0, 85, 0.12)' : (isElev ? 'rgba(245, 158, 11, 0.12)' : 'rgba(0, 200, 212, 0.12)');
        const riskBorder = isCrit ? 'rgba(255, 0, 85, 0.35)' : (isElev ? 'rgba(245, 158, 11, 0.35)' : 'rgba(0, 200, 212, 0.35)');

        row.innerHTML = 
          '<div style="display:flex; align-items:center; gap:10px; width:250px; flex-shrink:0;">' +
            '<span class="log-dot" style="background:' + color + '; box-shadow:0 0 8px ' + color + ';"></span>' +
            '<span style="font-weight:700; color:#f8fafc; font-size:12.5px; text-transform:uppercase; letter-spacing:0.04em;">' + (alert.type || 'Anomaly') + '</span>' +
            '<span style="font-family:var(--mono); font-size:10px; font-weight:700; color:' + color + '; background:' + riskBg + '; border:1px solid ' + riskBorder + '; padding:2px 7px; border-radius:4px;">Risk: ' + (alert.risk_score || 0) + '</span>' +
          '</div>' +
          '<div style="display:flex; align-items:center; gap:10px; flex:1; font-family:var(--mono); font-size:12px; color:#cbd5e1;">' +
            '<span style="color:#f8fafc;">' + (alert.source_ip || '0.0.0.0') + '</span>' +
            '<span style="color:#00c8d4; font-size:13px;">&rarr;</span>' +
            '<span style="color:#f8fafc;">' + (alert.target_ip || '0.0.0.0') + '</span>' +
          '</div>' +
          '<div class="log-time" style="display:flex; align-items:center; gap:12px; font-family:var(--mono); font-size:11px; color:#64748b;">' +
            '<span>' + (alert.timestamp || '') + '</span>' +
          '</div>';

        const btn = document.createElement('button');
        btn.textContent = '+ Incident';
        btn.title = 'Escalate to Support Ticket';
        btn.style.cssText = 'background:rgba(43,212,173,0.1); border:1px solid rgba(43,212,173,0.3); color:var(--signal); border-radius:4px; padding:3px 9px; font-size:10.5px; font-weight:600; cursor:pointer; transition:all 0.2s; white-space:nowrap;';
        btn.onmouseover = function() { btn.style.background = 'rgba(43,212,173,0.25)'; };
        btn.onmouseout = function() { btn.style.background = 'rgba(43,212,173,0.1)'; };
        btn.onclick = function() { escalateAlert(alert.type, alert.source_ip, alert.risk_score); };
        row.querySelector('.log-time').appendChild(btn);
        list.appendChild(row);
      });

      const statusEl = document.getElementById('log-status-text');
      if (statusEl) {
        statusEl.textContent = 'Showing ' + items.length + ' live security anomaly logs';
      }
    }

    window.filterLogList = function(query) {
      if (!query || !query.trim()) {
        renderLogItems(allAlerts.slice(0, window.visibleLogs || 15));
        return;
      }
      var q = query.toLowerCase().trim();
      var filtered = allAlerts.filter(function(a) {
        return (a.type && a.type.toLowerCase().includes(q)) ||
               (a.source_ip && a.source_ip.toLowerCase().includes(q)) ||
               (a.target_ip && a.target_ip.toLowerCase().includes(q)) ||
               (a.timestamp && a.timestamp.toLowerCase().includes(q)) ||
               (String(a.risk_score).includes(q));
      });
      renderLogItems(filtered);
    };

    window.renderModalLogs = function(page) {
      if (page) modalCurrentPage = page;
      const tbody = document.getElementById('modal-log-tbody');
      const info = document.getElementById('modal-log-pagination-info');
      const curPageEl = document.getElementById('modal-current-page');
      const prevBtn = document.getElementById('modal-prev-btn');
      const nextBtn = document.getElementById('modal-next-btn');
      if (!tbody) return;

      const qEl = document.getElementById('modal-log-search');
      const sEl = document.getElementById('modal-severity-filter');
      const hasFilter = (qEl && qEl.value) || (sEl && sEl.value !== 'ALL');
      const items = hasFilter ? modalFilteredAlerts : allAlerts;

      const total = items.length;
      const totalPages = Math.max(1, Math.ceil(total / modalPageSize));
      modalCurrentPage = Math.max(1, Math.min(modalCurrentPage, totalPages));

      const start = (modalCurrentPage - 1) * modalPageSize;
      const end = Math.min(start + modalPageSize, total);
      const pageItems = items.slice(start, end);

      tbody.innerHTML = '';
      if (pageItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="padding: 28px; text-align: center; color: #64748b;">No log events matched the current filter.</td></tr>';
      } else {
        pageItems.forEach((a, idx) => {
          const row = document.createElement('tr');
          row.style.cssText = 'border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.15s;';
          row.onmouseover = function() { row.style.background = 'rgba(0,200,212,0.04)'; };
          row.onmouseout = function() { row.style.background = 'transparent'; };

          const isCrit = a.severity_tier === 'Critical' || a.severity_tier === 'High';
          const isElev = a.risk_score >= 40 && !isCrit;
          const color = isCrit ? '#ff0055' : (isElev ? '#f59e0b' : '#00c8d4');
          const tierName = isCrit ? 'CRITICAL' : (isElev ? 'ELEVATED' : 'NOMINAL');
          const riskBg = isCrit ? 'rgba(255,0,85,0.12)' : (isElev ? 'rgba(245,158,11,0.12)' : 'rgba(0,200,212,0.12)');

          row.innerHTML =
            '<td style="padding: 11px 10px; color: #64748b;">' + (start + idx + 1) + '</td>' +
            '<td style="padding: 11px 10px; color: #94a3b8; white-space: nowrap;">' + (a.timestamp || '--') + '</td>' +
            '<td style="padding: 11px 10px; font-weight: 700; color: #f8fafc;"><span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:' + color + '; margin-right:6px; box-shadow:0 0 6px ' + color + ';"></span>' + (a.type || 'Flow') + '</td>' +
            '<td style="padding: 11px 10px;"><span style="color:' + color + '; background:' + riskBg + '; border:1px solid ' + color + '44; border-radius:4px; padding:2px 7px; font-weight:700; font-size:10px;">' + tierName + ' (' + (a.risk_score || 0) + ')</span></td>' +
            '<td style="padding: 11px 10px; color: #cbd5e1;"><span style="color:#f8fafc;">' + (a.source_ip || '') + '</span> <span style="color:#00c8d4;">&rarr;</span> <span style="color:#f8fafc;">' + (a.target_ip || '') + '</span></td>' +
            '<td style="padding: 11px 10px; text-align: right;" class="modal-btn-cell"></td>';

          var incBtn = document.createElement('button');
          incBtn.textContent = '+ Incident';
          incBtn.style.cssText = 'background:rgba(43,212,173,0.1); border:1px solid rgba(43,212,173,0.35); color:#2bd4ad; border-radius:4px; padding:3px 8px; font-size:10px; cursor:pointer; font-weight:600;';
          incBtn.onclick = function() { escalateAlert(a.type || 'Incident', a.source_ip || '', a.risk_score || 0); };
          row.querySelector('.modal-btn-cell').appendChild(incBtn);
          tbody.appendChild(row);
        });
      }

      if (info) info.textContent = total > 0 ? ('Showing ' + (start + 1) + ' - ' + end + ' of ' + total + ' log records') : 'No records';
      if (curPageEl) curPageEl.textContent = 'Page ' + modalCurrentPage + ' of ' + totalPages;
      if (prevBtn) prevBtn.disabled = (modalCurrentPage <= 1);
      if (nextBtn) nextBtn.disabled = (modalCurrentPage >= totalPages);
    };

    window.changeModalLogPage = function(delta) {
      modalCurrentPage += delta;
      window.renderModalLogs();
    };

    window.openFullLogModal = function() {
      const modal = document.getElementById('full-log-history-modal');
      if (modal) {
        modal.style.display = 'flex';
        modalFilteredAlerts = allAlerts.slice();
        window.renderModalLogs(1);
      }
    };

    window.closeFullLogModal = function() {
      const modal = document.getElementById('full-log-history-modal');
      if (modal) modal.style.display = 'none';
    };

    window.filterModalLogs = function(q) {
      applyModalFilters();
    };

    window.filterModalSeverity = function(sev) {
      applyModalFilters();
    };

    function applyModalFilters() {
      const q = (document.getElementById('modal-log-search') ? document.getElementById('modal-log-search').value : '').toLowerCase().trim();
      const sev = document.getElementById('modal-severity-filter') ? document.getElementById('modal-severity-filter').value : 'ALL';

      modalFilteredAlerts = allAlerts.filter(function(a) {
        var matchQ = !q || (
          (a.type && a.type.toLowerCase().includes(q)) ||
          (a.source_ip && a.source_ip.toLowerCase().includes(q)) ||
          (a.target_ip && a.target_ip.toLowerCase().includes(q)) ||
          (a.timestamp && a.timestamp.toLowerCase().includes(q)) ||
          String(a.risk_score).includes(q)
        );
        var matchSev = true;
        var isCrit = a.severity_tier === 'Critical' || a.severity_tier === 'High';
        var isElev = a.risk_score >= 40 && !isCrit;
        if (sev === 'CRITICAL') matchSev = isCrit;
        else if (sev === 'ELEVATED') matchSev = isElev;
        else if (sev === 'LOW') matchSev = (!isCrit && !isElev);

        return matchQ && matchSev;
      });
      window.renderModalLogs(1);
    }

    window.exportModalLogsCSV = function() {
      var items = modalFilteredAlerts.length > 0 ? modalFilteredAlerts : allAlerts;
      if (!items || items.length === 0) { alert('No log records to export'); return; }
      var csv = 'Timestamp,Classification,Risk Score,Source IP,Target IP,Severity\n';
      items.forEach(function(a) {
        csv += '"' + (a.timestamp || '') + '","' + (a.type || '') + '",' + (a.risk_score || 0) + ',"' + (a.source_ip || '') + '","' + (a.target_ip || '') + '","' + (a.severity_tier || '') + '"\n';
      });
      var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'zerobreach_log_history_' + Date.now() + '.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    function updateUIState() {
      if (capturing) {
        if(toggle) toggle.textContent = 'Stop capture';
        if(status) status.classList.add('on');
        if(bars) bars.classList.add('on');
        if(text) text.textContent = 'Sniffing Network Traffic (Real-Time)';
        barEls.forEach(b => { b.style.height = (15 + Math.random() * 85) + '%'; });
      } else {
        if(toggle) toggle.textContent = 'Start capture';
        if(status) status.classList.remove('on');
        if(bars) bars.classList.remove('on');
        if(text) text.textContent = 'Not capturing';
        barEls.forEach(b => { b.style.height = '8%'; });
      }
    }


    let liveCaptureTimer = null;
    let liveCaptureStartMs = 0;
    let liveCaptureStopMs = 0;

    function formatElapsed(ms) {
      const totalSec = Math.floor(ms / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    function formatLocalTime(t) {
      if (!t) return null;
      try {
        if (typeof t === 'number' && t > 0) {
          return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
        if (typeof t === 'string' && (t.includes('T') || t.includes('-') || t.includes(':'))) {
          const d = new Date(t);
          if (!isNaN(d.getTime())) {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          }
        }
      } catch(e) {}
      return null;
    }

    window.showLiveCaptureReport = function(session) {
      const modal = document.getElementById('live-capture-modal');
      if (!modal || !session) return;

      const durEl = document.getElementById('lcr-duration');
      if (durEl) durEl.textContent = session.duration || '00m 00s';
      const trEl = document.getElementById('lcr-time-range');

      const clientStart = formatLocalTime(liveCaptureStartMs) || formatLocalTime(session.start_time_iso);
      const clientStop = formatLocalTime(liveCaptureStopMs) || formatLocalTime(session.stop_time_iso);
      const startDisplay = clientStart || session.start_time || '--';
      const stopDisplay = clientStop || session.stop_time || '--';

      if (trEl) trEl.textContent = startDisplay + ' - ' + stopDisplay;
      const ifaceEl = document.getElementById('lcr-interface');
      if (ifaceEl) ifaceEl.textContent = session.interface || 'Wi-Fi';
      const totEl = document.getElementById('lcr-total-flows');
      if (totEl) totEl.textContent = (session.total_flows || 0) + ' Flows';
      
      const anomEl = document.getElementById('lcr-anomalies');
      const anomBadge = document.getElementById('lcr-anom-badge');
      const anomCount = session.anomalies_count || 0;
      if (anomEl) {
        anomEl.textContent = anomCount + (anomCount === 1 ? ' Anomaly' : ' Anomalies');
        anomEl.style.color = anomCount > 0 ? 'var(--critical)' : '#10b981';
      }
      if (anomBadge) {
        if (anomCount > 0) {
          anomBadge.textContent = 'THREAT DETECTED';
          anomBadge.style.color = '#ff0055';
          anomBadge.style.borderColor = 'rgba(255,0,85,0.3)';
          anomBadge.style.background = 'rgba(255,0,85,0.1)';
        } else {
          anomBadge.textContent = 'ALL CLEAR // BENIGN';
          anomBadge.style.color = '#10b981';
          anomBadge.style.borderColor = 'rgba(16,185,129,0.3)';
          anomBadge.style.background = 'rgba(16,185,129,0.1)';
        }
      }

      const protoContainer = document.getElementById('lcr-protocols');
      if (protoContainer) {
        protoContainer.innerHTML = '';
        const protos = session.protocol_breakdown || {};
        const protoKeys = Object.keys(protos);
        if (protoKeys.length > 0) {
          protoKeys.forEach(k => {
            protoContainer.innerHTML += '<span style="background:rgba(0,240,255,0.1); border:1px solid rgba(0,240,255,0.25); color:#00f0ff; padding:2px 8px; border-radius:4px; font-size:11px; font-family:var(--mono);">' + k + ': ' + protos[k] + '</span>';
          });
        } else {
          protoContainer.innerHTML = '<span style="color:var(--text-low); font-size:11px;">TCP / UDP</span>';
        }
      }

      const threatContainer = document.getElementById('lcr-threats');
      if (threatContainer) {
        threatContainer.innerHTML = '';
        const threats = session.threat_breakdown || {};
        const threatKeys = Object.keys(threats);
        if (threatKeys.length > 0) {
          threatKeys.forEach(k => {
            threatContainer.innerHTML += '<span style="background:rgba(255,0,85,0.15); border:1px solid rgba(255,0,85,0.3); color:#ff3366; padding:2px 8px; border-radius:4px; font-size:11px; font-family:var(--mono);">' + k + ' (' + threats[k] + ')</span>';
          });
        } else {
          threatContainer.innerHTML = '<span style="color:#10b981; font-size:11px; font-family:var(--mono);">&#10003; 100% Benign Traffic</span>';
        }
      }

      const tbody = document.getElementById('lcr-flows-tbody');
      const emptyNote = document.getElementById('lcr-empty-note');
      if (tbody) {
        tbody.innerHTML = '';
        const flows = session.flows || [];
        if (flows.length > 0) {
          if (emptyNote) emptyNote.style.display = 'none';
          tbody.parentElement.style.display = 'table';
          flows.forEach(f => {
            const isBenign = f.prediction === 'BENIGN';
            const color = isBenign ? '#10b981' : '#ff3366';
            const bg = isBenign ? 'rgba(16,185,129,0.12)' : 'rgba(255,0,85,0.15)';
            tbody.innerHTML += '<tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">' +
              '<td style="padding: 8px 6px; font-family: var(--mono); color: var(--text-low); font-size: 11px;">' + (f.timestamp || '--') + '</td>' +
              '<td style="padding: 8px 6px; font-family: var(--mono); color: #fff; font-size: 11px;">' + (f.source_ip || '--') + '</td>' +
              '<td style="padding: 8px 6px; font-family: var(--mono); color: var(--text-high); font-size: 11px;">' + (f.destination_ip || '--') + '</td>' +
              '<td style="padding: 8px 6px; font-family: var(--mono); color: #38bdf8; font-size: 11px;">' + (f.protocol || 'TCP') + '</td>' +
              '<td style="padding: 8px 6px;"><span style="background:' + bg + '; color:' + color + '; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; font-family: var(--mono);">' + (f.prediction || 'BENIGN') + '</span></td>' +
              '<td style="padding: 8px 6px; font-family: var(--mono); font-weight: 700; font-size: 11px; color:' + color + ';">' + (f.risk_score || 0) + '</td>' +
            '</tr>';
          });
        } else {
          tbody.parentElement.style.display = 'none';
          if (emptyNote) emptyNote.style.display = 'block';
        }
      }

      window.lastLiveSessionData = session;
      modal.style.display = 'flex';
    };

    window.exportLiveCaptureSession = function() {
      if (!window.lastLiveSessionData) return;
      const str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.lastLiveSessionData, null, 2));
      const a = document.createElement('a');
      a.setAttribute("href", str);
      a.setAttribute("download", "zerobreach_live_capture_" + Date.now() + ".json");
      document.body.appendChild(a);
      a.click();
      a.remove();
    };

    if (toggle) {
      toggle.addEventListener('click', async () => {
        try {
          if (!capturing) {
            const ifaceSelect = document.getElementById('iface');
            const iface = ifaceSelect ? ifaceSelect.value : null;
            toggle.disabled = true;
            toggle.textContent = 'Starting...';
            
            const res = await fetch(window.apiUrl('/api/sniffer/start'), {
              method: 'POST',
              headers: { ...window.getAuthHeaders(), 'Content-Type': 'application/json' },
              body: JSON.stringify({ interface: iface })
            });
            toggle.disabled = false;
            
            if (res.ok) {
              capturing = true;
              liveCaptureStartMs = Date.now();
              liveCaptureStopMs = 0;
              updateUIState();
              if (liveCaptureTimer) clearInterval(liveCaptureTimer);
              liveCaptureTimer = setInterval(() => {
                if (capturing && text) {
                  const elapsed = formatElapsed(Date.now() - liveCaptureStartMs);
                  text.textContent = 'Sniffing Network Traffic [' + elapsed + ']';
                }
              }, 1000);
            } else {
              const err = await res.json();
              alert(err.detail || 'Failed to start sniffer');
              updateUIState();
            }
          } else {
            toggle.disabled = true;
            toggle.textContent = 'Stopping...';
            if (liveCaptureTimer) clearInterval(liveCaptureTimer);
            liveCaptureStopMs = Date.now();
            
            const res = await fetch(window.apiUrl('/api/sniffer/stop'), {
              method: 'POST',
              headers: window.getAuthHeaders()
            });
            toggle.disabled = false;
            capturing = false;
            updateUIState();
            
            if (res.ok) {
              const data = await res.json();
              if (data.session) {
                window.showLiveCaptureReport(data.session);
              }
              if (typeof window.fetchStats === 'function') window.fetchStats();
              if (typeof window.fetchAlerts === 'function') window.fetchAlerts();
              if (typeof window.fetchFlowVolume === 'function') window.fetchFlowVolume();
            }
          }
        } catch (e) {
          console.error('Capture toggle error:', e);
          toggle.disabled = false;
          updateUIState();
        }
      });
    }


    // ---- Live Flow Volume Chart ----
    async function fetchFlowVolume() {
      try {
        const res = await fetch(window.apiUrl('/api/dashboard/flow-volume'), {headers: window.getAuthHeaders()});
        if (!res.ok) return;
        const buckets = await res.json();
        const barsEl = document.getElementById('flow-bars');
        const labelsEl = document.getElementById('bar-labels');
        if (!barsEl || !buckets.length) return;

        barsEl.innerHTML = '';
        if (labelsEl) labelsEl.innerHTML = '';

        buckets.forEach(function(b) {
          // Bar
          const bar = document.createElement('div');
          bar.style.height = b.height + '%';
          bar.title = b.label + ' - ' + b.count + ' anomalies';
          if (b.spike) { bar.className = 'spike'; }
          barsEl.appendChild(bar);

          // Label
          if (labelsEl) {
            const lbl = document.createElement('div');
            lbl.style.cssText = 'flex: 1; text-align: center; padding: 7px 6px; font-family: var(--mono); background: rgba(7,16,36,0.92); border: 1px solid rgba(0,200,212,0.35); border-radius: 8px; margin: 0 4px; box-shadow: 0 4px 14px rgba(0,0,0,0.6); transition: all 0.2s; display: flex; flex-direction: column; justify-content: center; min-height: 62px;';
            
            const isLive = b.source_type === 'live_capture' || b.is_live || (b.filename && (b.filename.toLowerCase().includes('live') || b.filename.toLowerCase().includes('capture')));
            const fileBadge = isLive
              ? '<div style="color:#10b981; font-size:11px; font-weight:800; letter-spacing:0.04em; margin-bottom:3px; display:flex; align-items:center; justify-content:center; gap:5px;"><span style="width:6px;height:6px;border-radius:50%;background:#10b981;box-shadow:0 0 8px #10b981;display:inline-block;"></span>LIVE CAPTURE</div>'
              : (b.filename 
                ? '<div style="color:#38bdf8; font-size:11px; font-weight:700; letter-spacing:0.02em; margin-bottom:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="' + b.filename + '">' + b.filename + '</div>'
                : '');
              
            const dateText = b.date || (b.label ? b.label.split(', ')[0] : '');
            const timeText = b.time || (b.label ? b.label.split(', ')[1] : '');

            lbl.innerHTML = fileBadge +
                            '<div style="color:#ffffff; font-weight:700; font-size:12px; letter-spacing:0.02em;">' + dateText + '</div>' +
                            '<div style="color:#00f0ff; font-weight:600; font-size:10.5px; margin-top:2px; opacity:0.95;">' + timeText + '</div>';
            const titleDisplay = isLive ? 'Live Capture' : (b.filename ? b.filename + ' | ' : '');
            lbl.title = titleDisplay + b.label + ': ' + (typeof b.count === 'number' ? b.count.toLocaleString() : b.count) + ' anomalies';
            labelsEl.appendChild(lbl);
          }
        });
        if (typeof window.renderFlowWave === 'function') {
          window.renderFlowWave(buckets);
        }
      } catch(e) {
        console.warn('Flow volume offline - Generating Benchmark Flow Wave:', e);
        const buckets = [
          { label: 'Monday, 10:00', count: 0, height: 12, spike: false, filename: 'monday.csv' },
          { label: 'Tuesday, 11:30', count: 1840, height: 28, spike: false, filename: 'tuesday.csv' },
          { label: 'Wednesday, 14:15', count: 17200, height: 52, spike: false, filename: 'wednesday.csv' },
          { label: 'Thursday, 15:45', count: 8420, height: 40, spike: false, filename: 'thursday.csv' },
          { label: 'Friday, 13:00', count: 4800, height: 35, spike: false, filename: 'friday.csv' },
          { label: 'Friday, 16:30', count: 259207, height: 98, spike: true, filename: 'friday.csv' },
          { label: 'Live Session, 17:00', count: 240, height: 20, spike: false, is_live: true }
        ];
        const barsEl = document.getElementById('flow-bars');
        const labelsEl = document.getElementById('bar-labels');
        if (barsEl && !barsEl.children.length) {
          barsEl.innerHTML = '';
          if (labelsEl) labelsEl.innerHTML = '';
          buckets.forEach(function(b) {
            const bar = document.createElement('div');
            bar.style.height = b.height + '%';
            bar.title = b.label + ' - ' + b.count.toLocaleString() + ' anomalies';
            if (b.spike) bar.className = 'spike';
            barsEl.appendChild(bar);
            if (labelsEl) {
              const lbl = document.createElement('div');
              lbl.style.cssText = 'flex: 1; text-align: center; padding: 7px 6px; font-family: var(--mono); background: rgba(7,16,36,0.92); border: 1px solid rgba(0,200,212,0.35); border-radius: 8px; margin: 0 4px; display: flex; flex-direction: column; justify-content: center; min-height: 62px;';
              lbl.innerHTML = '<div style="color:#38bdf8; font-size:11px; font-weight:700;">' + b.filename + '</div>' +
                              '<div style="color:#ffffff; font-weight:700; font-size:12px;">' + b.label.split(', ')[0] + '</div>' +
                              '<div style="color:#00f0ff; font-weight:600; font-size:10.5px;">' + b.label.split(', ')[1] + '</div>';
              labelsEl.appendChild(lbl);
            }
          });
        }
        if (typeof window.renderFlowWave === 'function') {
          window.renderFlowWave(buckets);
        }
      }
    }
    window.fetchFlowVolume = fetchFlowVolume;

    // ---- Live Stat Band Metrics ----
    async function fetchStats() {
      try {
        const t0 = performance.now();
        const res = await fetch(window.apiUrl('/api/dashboard/stats'), {headers: window.getAuthHeaders()});
        const pingTime = (performance.now() - t0).toFixed(1);
        if (!res.ok) return;
        const data = await res.json();

        // Update Hero Telemetry Strip with Real Live Metrics
        const heroLat = document.getElementById('hero-telem-latency');
        if (heroLat) heroLat.textContent = pingTime + 'ms';
        const heroFlows = document.getElementById('hero-telem-flows');
        if (heroFlows && data.total_flows) {
          heroFlows.textContent = Math.floor(data.total_flows / 1000) + 'K+';
        }
        const heroAcc = document.getElementById('hero-telem-accuracy');
        if (heroAcc) heroAcc.textContent = data.model_accuracy || '99.93%';

        const v3 = document.getElementById('v3');
        if (v3) v3.textContent = data.model_accuracy || '99.93%';

        const streamAnoms = window.__ZB_STREAM_ANOMALIES__ || 0;
        const anomaliesToday = Math.max(data.anomalies_today || 0, streamAnoms);
        const totalMalicious = Math.max(data.total_flows || 0, anomaliesToday);

        if (typeof animateCount === 'function') {
          animateCount('v1', totalMalicious);
          animateCount('v2', anomaliesToday);
          animateCount('v4', data.threat_categories);
        } else {
          const v1 = document.getElementById('v1');
          const v2 = document.getElementById('v2');
          const v4 = document.getElementById('v4');
          if (v1) v1.textContent = Number(totalMalicious).toLocaleString('en-US');
          if (v2) v2.textContent = Number(anomaliesToday).toLocaleString('en-US');
          if (v4) v4.textContent = data.threat_categories;
        }
        
        const sp = document.querySelector('.status-pill');
        if (sp) {
          if (anomaliesToday > 0) {
            sp.innerHTML = '<span class="dot" style="background:var(--critical);box-shadow:0 0 0 3px rgba(255,92,92,0.2);"></span>' + Number(anomaliesToday).toLocaleString('en-US') + ' anomalies detected';
            sp.style.color = 'var(--critical)';
            sp.style.borderColor = 'rgba(255,92,92,0.3)';
            sp.style.background = 'rgba(255,92,92,0.05)';
          } else {
            sp.innerHTML = '<span class="dot"></span>All systems normal';
            sp.style.color = '';
            sp.style.borderColor = '';
            sp.style.background = '';
          }
        }
      } catch(e) {
        console.warn('Stats fetch offline - Using Benchmark Statistics:', e);
        const data = {
          total_flows: 2841920,
          anomalies_today: 14280,
          model_accuracy: '99.93%',
          threat_categories: 15
        };
        const heroLat = document.getElementById('hero-telem-latency');
        if (heroLat) heroLat.textContent = '12.4ms';
        const heroFlows = document.getElementById('hero-telem-flows');
        if (heroFlows) heroFlows.textContent = '2.8M+';
        const heroAcc = document.getElementById('hero-telem-accuracy');
        if (heroAcc) heroAcc.textContent = '99.93%';
        const v3 = document.getElementById('v3');
        if (v3) v3.textContent = '99.93%';
        if (typeof animateCount === 'function') {
          animateCount('v1', 2841920);
          animateCount('v2', 14280);
          animateCount('v4', 15);
        }
      }
    }
    window.fetchStats = fetchStats;

      async function fetchProtocols() {
        try {
          const res = await fetch(window.apiUrl('/api/dashboard/protocols'), {headers: window.getAuthHeaders()});
          if (!res.ok) return;
          const data = await res.json();
          if (typeof window.renderProtocolRadar === 'function') {
            window.renderProtocolRadar(data);
          }
          const pBars = document.getElementById('protocol-bars');
          if (!pBars) return;
          pBars.innerHTML = '';
          const colors = {'TCP': '#00c8d4', 'UDP': '#38bdf8', 'ICMP': '#ff0055', 'HTTP': '#a855f7', 'Other': '#94a3b8'};
          
          for (const [proto, pct] of Object.entries(data)) {
            const badge = document.createElement('div');
            badge.style.cssText = 'background:rgba(255,255,255,0.03); border:1px solid var(--line); border-radius:6px; padding:6px 8px; display:flex; flex-direction:column; gap:4px;';
            badge.innerHTML = '<div style="display:flex; align-items:center; justify-content:space-between; font-family:var(--mono); font-size:10px;">' +
              '<span style="display:flex; align-items:center; gap:5px; color:var(--text-high); font-weight:600;">' +
              '<span style="display:inline-block; width:5px; height:5px; border-radius:50%; background:' + (colors[proto] || colors['Other']) + '; box-shadow:0 0 6px ' + (colors[proto] || colors['Other']) + ';"></span>' +
              proto + '</span>' +
              '<span style="color:var(--text-low); font-weight:700;">' + pct + '%</span>' +
              '</div>' +
              '<div style="width:100%; height:3px; background:rgba(255,255,255,0.07); border-radius:2px; overflow:hidden;">' +
              '<div style="width:' + pct + '%; height:100%; background:' + (colors[proto] || colors['Other']) + '; border-radius:2px; transition:width 0.6s cubic-bezier(0.4,0,0.2,1);"></div>' +
              '</div>';
            pBars.appendChild(badge);
          }
        } catch(e) {}
      }
      window.fetchProtocols = fetchProtocols;


    // Initial load and poll
    checkStatus();
    fetchAlerts();
    fetchFlowVolume();
    fetchStats();
    setInterval(checkStatus, 3000);
    setInterval(fetchAlerts, 5000);
    setInterval(fetchFlowVolume, 10000);
    setInterval(fetchStats, 10000);
    setInterval(window.fetchProtocols, 10000);
    setInterval(() => { if (capturing) updateUIState(); }, 800);
  })();


  // Legacy blocking file upload controller has been unified into the Streaming Ingest Pipeline above.


  // ---- Stat band: decimal count-up, once, on scroll into view ----
  (function(){
    const el = document.querySelector('.statband .num');
    const band = document.querySelector('.statband');
    if (!el || !band) return;
    let done = false;
    const sio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !done){
          done = true;
          const end = 99.93, dur = 1200, t0 = performance.now();
          function step(t){
            const p = Math.min((t - t0) / dur, 1);
            el.textContent = (end * p).toFixed(2) + '%';
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        }
      });
    }, {threshold:0.5});
    sio.observe(band);
  })();

  // ---- Recent logs pagination ----
    (function(){
      window.visibleLogs = 15;
      const moreBtn = document.getElementById('log-more');
      if (moreBtn) {
        moreBtn.addEventListener('click', () => {
          window.visibleLogs += 20;
          if (typeof window.fetchAlerts === 'function') window.fetchAlerts();
        });
      }
    })();

  // ---- Floating screen: power on, then stay continuously alive ----
  (function(){
    const screen = document.querySelector('.screen');
    const stage = document.querySelector('.stage');
    if (!screen || !stage) return;

    const pwr = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) screen.classList.add('on');
      });
    }, {threshold:0.35});
    pwr.observe(stage);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const baseX = 6, baseY = -9;
    let targetMX = 0, targetMY = 0, curMX = 0, curMY = 0;
    let hover = 0, hoverTarget = 0;
    let revealedAt = null, entrance = 0;

    stage.addEventListener('mousemove', (e) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      targetMX = -py * 14;
      targetMY = px * 16;
      hoverTarget = 1;
    });
    stage.addEventListener('mouseleave', () => {
      targetMX = 0; targetMY = 0; hoverTarget = 0;
    });

    function easeOutCubic(x){ return 1 - Math.pow(1 - x, 3); }

    function loop(t){
      requestAnimationFrame(loop);
      if (screen.classList.contains('on') && revealedAt === null) revealedAt = t;
      if (revealedAt !== null) entrance = Math.min((t - revealedAt) / 650, 1);

      const sway  = revealedAt !== null ? Math.sin(t * 0.00045) * 2.2 : 0;
      const swayY = revealedAt !== null ? Math.cos(t * 0.00038) * 2.6 : 0;

      curMX += (targetMX - curMX) * 0.06;
      curMY += (targetMY - curMY) * 0.06;
      hover += (hoverTarget - hover) * 0.06;

      const rx = baseX + sway * (1 - hover) + curMX * hover;
      const ry = baseY + swayY * (1 - hover) + curMY * hover;
      const scale = 0.94 + 0.06 * easeOutCubic(entrance);

      screen.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    }
    requestAnimationFrame(loop);
  })();

  // ---- Pipeline flow dots: run once when the trace scrolls into view ----
  (function(){
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const svgns = 'http://www.w3.org/2000/svg';
    const xlinkns = 'http://www.w3.org/1999/xlink';
    const group = document.getElementById('flow-dots');
    const blueprint = document.querySelector('.blueprint');
    if (!group || !blueprint) return;
    let started = false;

    function makeDot(fill){
      const c = document.createElementNS(svgns, 'circle');
      c.setAttribute('r', '4');
      c.setAttribute('fill', fill);
      const anim = document.createElementNS(svgns, 'animateMotion');
      anim.setAttribute('dur', '3.4s');
      anim.setAttribute('begin', 'indefinite');
      anim.setAttribute('repeatCount', 'indefinite');
      const mpath = document.createElementNS(svgns, 'mpath');
      mpath.setAttribute('href', '#flow-path');
      mpath.setAttributeNS(xlinkns, 'href', '#flow-path');
      anim.appendChild(mpath);
      c.appendChild(anim);
      group.appendChild(c);
      return anim;
    }

    const dot1 = makeDot('#00c8d4');
    const dot2 = makeDot('rgba(61,219,217,0.5)');

    const pio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !started){
          started = true;
          blueprint.classList.add('in-view');
          setTimeout(() => dot1.beginElement(), 500);
          setTimeout(() => dot2.beginElement(), 1350);
        }
      });
    }, {threshold:0.3});
    pio.observe(blueprint);
  })();

          // ---- Photorealistic 3D Earth Engine (Hero Section) ----
    (function(){
      const canvas = document.getElementById('hero-canvas');
      if (!canvas || typeof THREE === 'undefined') return;
      const container = canvas.parentElement;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
      camera.position.set(0, 0, 8.8);

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });
      canvas.addEventListener('webglcontextlost', function(e){ e.preventDefault(); }, false);
      window.__ZB_3D_STATE__.earthRenderer = renderer;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);

      // Pinned gracefully to Lower-Left: frames the headline from below without EVER obscuring it!
      const group = new THREE.Group();
      function updateEarthPosition() {
        const isDesktop = container.clientWidth > 980;
        group.position.set(isDesktop ? -4.5 : 0, isDesktop ? -1.6 : -3.2, 0);
      }
      updateEarthPosition();
      scene.add(group);

      // Earth Axial Tilt (23.44 degrees)
      const earthPivot = new THREE.Group();
      earthPivot.rotation.z = -23.44 * (Math.PI / 180);
      group.add(earthPivot);

      // ── PROCEDURAL HIGH-RESOLUTION NASA-GRADE EARTH TEXTURES ──
      const texW = 2048, texH = 1024;
      function toX(lon) { return ((lon + 180) / 360) * texW; }
      function toY(lat) { return ((90 - lat) / 180) * texH; }

      // 1. Diffuse Albedo Canvas
      const diffCanvas = document.createElement('canvas');
      diffCanvas.width = texW; diffCanvas.height = texH;
      const dCtx = diffCanvas.getContext('2d');

      // Deep photorealistic sapphire-navy ocean
      const oceanGrad = dCtx.createLinearGradient(0, 0, 0, texH);
      oceanGrad.addColorStop(0.0, '#040b1e'); // Arctic deep abyss
      oceanGrad.addColorStop(0.2, '#061633');
      oceanGrad.addColorStop(0.5, '#071b3d'); // Tropical sapphire
      oceanGrad.addColorStop(0.8, '#061633');
      oceanGrad.addColorStop(1.0, '#040b1e');
      dCtx.fillStyle = oceanGrad;
      dCtx.fillRect(0, 0, texW, texH);

      // 2. Specular Canvas (Ocean = brilliant glint, Land = matte)
      const specCanvas = document.createElement('canvas');
      specCanvas.width = texW; specCanvas.height = texH;
      const sCtx = specCanvas.getContext('2d');
      sCtx.fillStyle = '#ffffff';
      sCtx.fillRect(0, 0, texW, texH);

      // 3. Nightside City Lights Canvas
      const nightCanvas = document.createElement('canvas');
      nightCanvas.width = texW; nightCanvas.height = texH;
      const nCtx = nightCanvas.getContext('2d');
      nCtx.fillStyle = '#000000';
      nCtx.fillRect(0, 0, texW, texH);

      // 4. Cloud Canopy Canvas
      const cloudCanvas = document.createElement('canvas');
      cloudCanvas.width = texW; cloudCanvas.height = texH;
      const cCtx = cloudCanvas.getContext('2d');
      cCtx.clearRect(0, 0, texW, texH);

      // High-Definition Detailed World Continents
      const continents = [
        // North America
        [[-168,65],[-162,70],[-152,71],[-138,69],[-124,70],[-105,68],[-90,72],[-80,62],[-65,58],[-55,52],[-64,45],[-70,42],[-76,38],[-80,25],[-82,30],[-88,30],[-90,29],[-97,26],[-97,19],[-90,20],[-85,14],[-80,9],[-84,10],[-95,16],[-105,23],[-117,32],[-124,40],[-124,48],[-130,54],[-140,59],[-150,60],[-165,55],[-168,65]],
        // Greenland
        [[-52,83],[-20,83],[-22,70],[-35,65],[-44,60],[-53,72],[-52,83]],
        // South America
        [[-77,10],[-72,12],[-62,10],[-50,0],[-36,-5],[-35,-9],[-39,-15],[-40,-22],[-48,-28],[-55,-35],[-65,-45],[-68,-55],[-74,-53],[-75,-45],[-70,-32],[-76,-18],[-81,-5],[-78,2],[-77,10]],
        // Eurasia (Europe + Asia)
        [[-9,36],[0,36],[3,43],[12,44],[16,38],[24,38],[28,41],[35,32],[42,30],[50,25],[55,18],[60,25],[68,24],[72,18],[76,12],[80,8],[85,14],[90,22],[96,17],[100,4],[104,10],[108,18],[114,22],[120,26],[122,32],[122,38],[128,40],[132,44],[140,50],[150,52],[160,54],[162,58],[175,66],[170,70],[150,72],[130,73],[105,78],[80,75],[60,73],[40,71],[25,71],[15,68],[5,60],[-5,58],[-9,43],[-9,36]],
        // Africa
        [[-5,36],[10,37],[15,32],[25,32],[32,31],[34,27],[43,12],[51,11],[44,2],[40,-10],[35,-22],[28,-32],[20,-34],[18,-34],[12,-20],[9,-5],[3,5],[-12,5],[-17,12],[-17,21],[-13,28],[-5,36]],
        // Australia
        [[114,-22],[120,-18],[130,-14],[136,-12],[142,-11],[148,-18],[153,-28],[150,-37],[142,-38],[135,-35],[128,-32],[118,-35],[115,-30],[114,-22]],
        // Antarctica
        [[-180,-68],[-130,-72],[-80,-70],[-60,-64],[-20,-70],[20,-68],[60,-66],[100,-65],[140,-66],[180,-68],[180,-90],[-180,-90],[-180,-68]],
        // Japan
        [[141,45],[142,38],[136,35],[131,32],[133,34],[139,38],[141,45]],
        // Great Britain
        [[-5,58],[-2,58],[1,53],[-1,51],[-5,50],[-6,55],[-5,58]]
      ];

      // Draw shallow turquoise continental shelf (soft glowing coastal waters)
      dCtx.save();
      dCtx.fillStyle = 'rgba(14, 165, 233, 0.35)';
      dCtx.filter = 'blur(6px)';
      continents.forEach(function(c) {
        dCtx.beginPath();
        c.forEach(function(p, i) {
          const x = toX(p[0]), y = toY(p[1]);
          if (i === 0) dCtx.moveTo(x, y); else dCtx.lineTo(x, y);
        });
        dCtx.closePath();
        dCtx.fill();
      });
      dCtx.restore();

      // Draw Landmasses with realistic ecological biomes (green forests, savannahs, deserts, snow)
      continents.forEach(function(c) {
        dCtx.save();
        dCtx.beginPath();
        c.forEach(function(p, i) {
          const x = toX(p[0]), y = toY(p[1]);
          if (i === 0) dCtx.moveTo(x, y); else dCtx.lineTo(x, y);
        });
        dCtx.closePath();

        // Realistic latitude-based biome gradient:
        // Polar snow -> Boreal forest -> Temperate green -> Golden savannah/desert -> Tropical rainforest
        const biomeGrad = dCtx.createLinearGradient(0, toY(75), 0, toY(-75));
        biomeGrad.addColorStop(0.00, '#f8fafc'); // Arctic ice sheet
        biomeGrad.addColorStop(0.12, '#2d5a3a'); // Taiga / Boreal evergreen
        biomeGrad.addColorStop(0.30, '#1e4d2b'); // Temperate woodland
        biomeGrad.addColorStop(0.48, '#a67c38'); // Sahara / desert amber
        biomeGrad.addColorStop(0.52, '#1b5e20'); // Tropical rainforest
        biomeGrad.addColorStop(0.68, '#8c7835'); // Savannah / steppe
        biomeGrad.addColorStop(0.85, '#2e4a32'); // Subpolar tundra
        biomeGrad.addColorStop(1.00, '#f8fafc'); // Antarctic ice sheet
        dCtx.fillStyle = biomeGrad;
        dCtx.fill();
        dCtx.restore();

        // Land is matte (non-reflective) in specular map
        sCtx.save();
        sCtx.beginPath();
        c.forEach(function(p, i) {
          const x = toX(p[0]), y = toY(p[1]);
          if (i === 0) sCtx.moveTo(x, y); else sCtx.lineTo(x, y);
        });
        sCtx.closePath();
        sCtx.fillStyle = '#080808';
        sCtx.fill();
        sCtx.restore();
      });

      // Realistic Nightside City Lights (clustered along actual global hubs)
      const cityHubs = [
        // North America
        [-74.0, 40.7, 7], [-118.2, 34.0, 7], [-87.6, 41.8, 6], [-95.3, 29.7, 5], [-122.4, 37.7, 6], [-79.4, 43.6, 5],
        // Europe
        [-0.1, 51.5, 7], [2.3, 48.8, 7], [13.4, 52.5, 5], [4.9, 52.3, 5], [9.1, 45.4, 5], [-3.7, 40.4, 5],
        // Asia
        [139.7, 35.6, 8], [121.4, 31.2, 8], [114.1, 22.3, 7], [116.4, 39.9, 7], [126.9, 37.5, 6], [103.8, 1.3, 6],
        // India
        [72.8, 19.0, 7], [77.2, 28.6, 7], [80.2, 13.0, 5], [77.5, 12.9, 6],
        // Middle East, Australia, South America
        [55.2, 25.2, 6], [151.2, -33.8, 6], [-46.6, -23.5, 6], [-58.3, -34.6, 5]
      ];

      nCtx.save();
      cityHubs.forEach(function(h) {
        const cx = toX(h[0]), cy = toY(h[1]), r = h[2];
        const g = nCtx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.8);
        g.addColorStop(0.0, '#ffffff');
        g.addColorStop(0.3, '#ffd166');
        g.addColorStop(0.7, '#f59e0b');
        g.addColorStop(1.0, 'rgba(245, 158, 11, 0)');
        nCtx.fillStyle = g;
        nCtx.beginPath(); nCtx.arc(cx, cy, r * 2.8, 0, Math.PI * 2); nCtx.fill();

        // Pinprick suburban filaments
        for (let k = 0; k < 12; k++) {
          const ang = Math.random() * Math.PI * 2;
          const dist = r + Math.random() * (r * 2.2);
          nCtx.fillStyle = '#ffd166';
          nCtx.fillRect(cx + Math.cos(ang) * dist, cy + Math.sin(ang) * dist, 1.5, 1.5);
        }
      });
      nCtx.restore();

      // Atmospheric Weather Cloud Swirls
      cCtx.save();
      for (let i = 0; i < 90; i++) {
        const cx = (i / 90) * texW + (Math.random() - 0.5) * 60;
        const cy = toY(Math.sin(i * 0.4) * 45) + (Math.random() - 0.5) * 60;
        const cr = 28 + Math.random() * 55;
        const cg = cCtx.createRadialGradient(cx, cy, 0, cx, cy, cr);
        cg.addColorStop(0.0, 'rgba(255, 255, 255, 0.72)');
        cg.addColorStop(0.5, 'rgba(255, 255, 255, 0.32)');
        cg.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
        cCtx.fillStyle = cg;
        cCtx.beginPath(); cCtx.arc(cx, cy, cr, 0, Math.PI * 2); cCtx.fill();
      }
      cCtx.restore();

      const diffTex = new THREE.CanvasTexture(diffCanvas);
      const specTex = new THREE.CanvasTexture(specCanvas);
      const nightTex = new THREE.CanvasTexture(nightCanvas);
      const cloudTex = new THREE.CanvasTexture(cloudCanvas);

      // Earth Sphere Body Mesh
      const earthRadius = 2.1;
      const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
      const earthMat = new THREE.MeshPhongMaterial({
        map: diffTex,
        specularMap: specTex,
        specular: new THREE.Color(0x38bdf8), // Natural ocean specular glint
        shininess: 38
      });
      const earthMesh = new THREE.Mesh(earthGeo, earthMat);
      earthPivot.add(earthMesh);

      // Nightside City Lights Shader (Smooth day/night terminator blend)
      const sunDir = new THREE.Vector3(-1.0, 0.4, 0.8).normalize();
      const nightGeo = new THREE.SphereGeometry(earthRadius + 0.006, 64, 64);
      const nightMat = new THREE.ShaderMaterial({
        uniforms: { nightTex: { value: nightTex }, sunDirection: { value: sunDir } },
        vertexShader: "varying vec3 vNormal; varying vec2 vUv; void main() { vNormal = normalize(normalMatrix * normal); vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader: "uniform sampler2D nightTex; uniform vec3 sunDirection; varying vec3 vNormal; varying vec2 vUv; void main() { float sunDot = dot(vNormal, sunDirection); float nightFactor = smoothstep(0.15, -0.20, sunDot); vec4 cityColor = texture2D(nightTex, vUv); gl_FragColor = vec4(cityColor.rgb * 1.6, cityColor.a * nightFactor * 0.95); }",
        blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
      });
      const nightMesh = new THREE.Mesh(nightGeo, nightMat);
      earthPivot.add(nightMesh);

      // Swirling Cloud Sphere
      const cloudGeo = new THREE.SphereGeometry(earthRadius + 0.024, 64, 64);
      const cloudMat = new THREE.MeshLambertMaterial({
        map: cloudTex, transparent: true, opacity: 0.65, blending: THREE.NormalBlending, depthWrite: false
      });
      const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
      earthPivot.add(cloudMesh);

      // Thin, Photorealistic Rayleigh Atmospheric Limb Glow (NASA ISS view)
      const atmoGeo = new THREE.SphereGeometry(earthRadius + 0.08, 48, 48);
      const atmoMat = new THREE.ShaderMaterial({
        vertexShader: "varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader: "varying vec3 vNormal; void main() { float intensity = pow(0.78 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.2); gl_FragColor = vec4(0.22, 0.78, 1.0, 1.0) * intensity * 1.6; }",
        side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
      });
      const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
      earthPivot.add(atmoMesh);

      // Sunlight and Ambient Illumination
      const earthSun = new THREE.DirectionalLight(0xfff8ee, 2.8);
      earthSun.position.set(-10, 4, 8);
      scene.add(earthSun);
      scene.add(new THREE.AmbientLight(0x040814, 0.45));

      // Pointer drag interaction
      let isDraggingEarth = false, prevEarthX = 0, prevEarthY = 0;
      let targetRotY = 0, earthVelX = 0;

      canvas.addEventListener('pointerdown', function(e) {
        isDraggingEarth = true; prevEarthX = e.clientX; prevEarthY = e.clientY; earthVelX = 0;
      });
      window.addEventListener('pointermove', function(e) {
        if (!isDraggingEarth) return;
        const dx = e.clientX - prevEarthX; prevEarthX = e.clientX;
        earthVelX = dx * 0.004; targetRotY += earthVelX;
      });
      window.addEventListener('pointerup', function() { isDraggingEarth = false; });

      // Resize
      function onResize() {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        updateEarthPosition();
      }
      window.addEventListener('resize', onResize);

      // Animation Loop
      function animateEarth() {
        window.__ZB_3D_STATE__.earthAnimId = requestAnimationFrame(animateEarth);
        if (!isDraggingEarth) targetRotY += 0.0016;
        earthMesh.rotation.y += (targetRotY - earthMesh.rotation.y) * 0.08;
        nightMesh.rotation.y = earthMesh.rotation.y;
        cloudMesh.rotation.y += 0.0022;
        renderer.render(scene, camera);
      }
      animateEarth();
    })();
;

window.openDoc = function(title, content) {
  document.getElementById('doc-title').innerText = title;
  document.getElementById('doc-content').innerText = content;
  document.getElementById('doc-modal').style.display = 'flex';
};
;


(function() {
    const userRole = (localStorage.getItem('role') || 'analyst').toLowerCase();
    
    

    const navMonitor = document.getElementById('nav-monitor');
    const navAlerts = document.getElementById('nav-alerts');
    const navIntel = document.getElementById('nav-intel');
    
    const ingestSection = document.getElementById('ingest');

    
    const adminTickets = document.getElementById('admin-tickets');
    const ticketForm = document.getElementById('ticket-form-container');
    
    if (userRole === 'soc' || userRole === 'admin') {
        if (adminTickets) adminTickets.style.display = 'block';
        if (ticketForm) ticketForm.style.display = 'none'; // Admins don't submit tickets
    }


    const feedCard = document.querySelector('.feed-card');
    const modulesSection = document.getElementById('modules');
    
    if (userRole === 'analyst') {
        if (navMonitor) navMonitor.remove();
        // Security Analysts have full access to ingest, live telemetry, and notifications
    } 
    else if (userRole === 'enterprise') {
        if (navMonitor) navMonitor.remove();
        if (feedCard) feedCard.remove();
        if (ingestSection) ingestSection.remove();
    }
})();

;

window.downloadCSV = function() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Session expired. Please log in again.');
        window.location.href = '/';
        return;
    }
    const url = window.apiUrl('/api/dashboard/export?token=' + encodeURIComponent(token));
    window.location.href = url;
};
;

window.submitTicket = async function() {
    const subj = document.getElementById('ticket-subject').value;
    const desc = document.getElementById('ticket-desc').value;
    if (!subj || !desc) {
        alert('Please fill out both subject and description.');
        return;
    }
    
    try {
        const res = await fetch(window.apiUrl('/api/dashboard/tickets'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...window.getAuthHeaders()
            },
            body: JSON.stringify({ subject: subj, description: desc })
        });
        
        if (res.ok) {
            alert('Ticket submitted successfully! An Admin will review it shortly.');
            document.getElementById('ticket-subject').value = '';
            document.getElementById('ticket-desc').value = '';
        } else {
            alert('Failed to submit ticket.');
        }
    } catch (e) {
        alert('Connection error.');
    }
};
;

window.formatTicketDate = function(dateStr) {
    if (!dateStr) return '--';
    try {
        let s = String(dateStr).trim().replace(' ', 'T');
        if (!s.endsWith('Z') && !s.includes('+')) {
            s += 'Z';
        }
        const d = new Date(s);
        if (!isNaN(d.getTime())) {
            return d.toLocaleString('en-GB');
        }
    } catch(e) {}
    return dateStr;
};

window.fetchTickets = async function() {
    const tbody = document.getElementById('tickets-table-body');
    try {
        const res = await fetch(window.apiUrl('/api/dashboard/tickets'), {
            headers: window.getAuthHeaders()
        });
        if (!res.ok) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:10px; color:red;">Failed to load tickets (Unauthorized).</td></tr>';
            return;
        }
        const tickets = await res.json();
        if (tickets.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-low);">No tickets found in queue.</td></tr>';
            return;
        }
        tbody.innerHTML = tickets.map(function(t) {
            return '<tr style="border-bottom:1px solid var(--line);">' +
                '<td style="padding:12px 14px; color:var(--text-low); font-family:var(--mono); font-size:12px;">' + window.formatTicketDate(t.created_at) + '</td>' +
                '<td style="padding:12px 14px; font-weight:600;">' + t.username + '</td>' +
                '<td style="padding:12px 14px;"><span style="color:var(--signal); background:rgba(0,240,255,0.08); border:1px solid rgba(0,240,255,0.25); padding:2px 8px; border-radius:4px; font-size:11px; font-family:var(--mono); text-transform:uppercase;">' + t.role + '</span></td>' +
                '<td style="padding:12px 14px; font-weight:600; color:var(--text-high);">' + t.subject + '</td>' +
                '<td style="padding:12px 14px; color:var(--text-low); font-size:12px;">' + t.description + '</td>' +
                '<td style="padding:12px 14px; text-align:right;">' +
                    '<button onclick="window.deleteSingleTicket(' + t.id + ')" title="Delete Ticket" style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); color:#ef4444; border-radius:4px; padding:4px 10px; font-size:11px; cursor:pointer;">Delete</button>' +
                '</td>' +
            '</tr>';
        }).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:10px; color:red;">Connection error.</td></tr>';
    }
};

window.showCyberConfirm = function(title, message, onConfirm, isDanger = false) {
    let modal = document.getElementById('cyber-confirm-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cyber-confirm-modal';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.75); backdrop-filter:blur(8px); z-index:99999; display:flex; align-items:center; justify-content:center;';
        document.body.appendChild(modal);
    }
    const confirmBtnColor = isDanger 
        ? 'background:linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); border:1px solid #ef4444; color:#fff;' 
        : 'background:linear-gradient(135deg, #00c8d4 0%, #0077b6 100%); border:1px solid #00f0ff; color:#020617;';
    const accentColor = isDanger ? '#ef4444' : '#00f0ff';
    const iconSymbol = isDanger ? '&#9888;' : '&#128737;';
    modal.innerHTML = 
        '<div style="background:rgba(6,11,25,0.96); border:1px solid ' + (isDanger ? 'rgba(239,68,68,0.5)' : 'rgba(0,200,212,0.4)') + '; border-radius:12px; padding:28px 30px; max-width:440px; width:90%; box-shadow:0 25px 60px rgba(0,0,0,0.9), 0 0 30px ' + (isDanger ? 'rgba(239,68,68,0.2)' : 'rgba(0,200,212,0.15)') + '; font-family:var(--body, sans-serif);">' +
            '<div style="display:flex; align-items:center; gap:12px; margin-bottom:14px;">' +
                '<div style="width:36px; height:36px; border-radius:8px; background:' + (isDanger ? 'rgba(239,68,68,0.15)' : 'rgba(0,200,212,0.15)') + '; border:1px solid ' + accentColor + '; display:flex; align-items:center; justify-content:center; font-size:18px; color:' + accentColor + '; font-weight:bold;">' +
                    iconSymbol +
                '</div>' +
                '<h3 style="margin:0; font-size:16.5px; font-weight:700; color:#ffffff; letter-spacing:0.02em;">' + title + '</h3>' +
            '</div>' +
            '<p style="margin:0 0 24px 0; color:#94a3b8; font-size:13.5px; line-height:1.55;">' + message + '</p>' +
            '<div style="display:flex; justify-content:flex-end; gap:10px;">' +
                '<button id="cyber-modal-cancel" style="padding:9px 18px; border-radius:6px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.14); color:#e2e8f0; font-size:13px; font-weight:500; cursor:pointer;">Cancel</button>' +
                '<button id="cyber-modal-ok" style="padding:9px 20px; border-radius:6px; ' + confirmBtnColor + ' font-size:13px; font-weight:700; cursor:pointer;">Confirm</button>' +
            '</div>' +
        '</div>';
    modal.style.display = 'flex';
    document.getElementById('cyber-modal-cancel').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('cyber-modal-ok').onclick = () => {
        modal.style.display = 'none';
        if (typeof onConfirm === 'function') onConfirm();
    };
};

window.showCyberToast = function(msg, isError = false) {
    let t = document.getElementById('cyber-toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'cyber-toast';
        t.style.cssText = 'position:fixed; bottom:24px; right:24px; z-index:99999; padding:12px 20px; border-radius:8px; font-size:13px; font-family:var(--mono, monospace); transition:all 0.3s ease; transform:translateY(100px); opacity:0; pointer-events:none;';
        document.body.appendChild(t);
    }
    t.style.background = isError ? 'rgba(239,68,68,0.92)' : 'rgba(6,182,212,0.92)';
    t.style.color = '#ffffff';
    t.style.border = isError ? '1px solid #ef4444' : '1px solid #00f0ff';
    t.style.boxShadow = isError ? '0 10px 30px rgba(239,68,68,0.4)' : '0 10px 30px rgba(0,200,212,0.4)';
    t.innerHTML = (isError ? '&#9888; ' : '&#10003; ') + msg;
    t.style.transform = 'translateY(0)';
    t.style.opacity = '1';
    setTimeout(() => {
        t.style.transform = 'translateY(100px)';
        t.style.opacity = '0';
    }, 3800);
};

window.clearTickets = function() {
    window.showCyberConfirm(
        'Clear Ticket Queue',
        'Are you sure you want to clear all tickets from the operational queue? This action cannot be undone.',
        async function() {
            try {
                const res = await fetch(window.apiUrl('/api/dashboard/tickets'), {
                    method: 'DELETE',
                    headers: window.getAuthHeaders()
                });
                if (res.ok) {
                    window.showCyberToast('All tickets cleared successfully.');
                    if (window.fetchTickets) window.fetchTickets();
                } else {
                    const err = await res.json().catch(() => ({}));
                    window.showCyberToast('Failed to clear tickets: ' + (err.detail || 'Unauthorized'), true);
                }
            } catch(e) {
                window.showCyberToast('Error clearing tickets: ' + e, true);
            }
        },
        true
    );
};

window.deleteSingleTicket = function(id) {
    window.showCyberConfirm(
        'Delete Ticket',
        'Are you sure you want to permanently delete ticket #' + id + '?',
        async function() {
            try {
                const res = await fetch(window.apiUrl('/api/dashboard/tickets/' + id), {
                    method: 'DELETE',
                    headers: window.getAuthHeaders()
                });
                if (res.ok) {
                    window.showCyberToast('Ticket #' + id + ' deleted.');
                    if (window.fetchTickets) window.fetchTickets();
                } else {
                    const err = await res.json().catch(() => ({}));
                    window.showCyberToast('Failed to delete ticket: ' + (err.detail || 'Error'), true);
                }
            } catch(e) {
                window.showCyberToast('Error deleting ticket: ' + e, true);
            }
        },
        true
    );
};
;

window.toggleChat = function() {
    const w = document.getElementById('chat-window');
    w.style.display = w.style.display === 'none' ? 'flex' : 'none';
};

window.sendChatMessage = function() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;
    
    const msgs = document.getElementById('chat-messages');
    
    // User message
    const userDiv = document.createElement('div');
    userDiv.style.cssText = 'background: rgba(255, 255, 255, 0.1); border: 1px solid var(--line); padding: 10px; border-radius: 6px; color: #fff; align-self: flex-end; max-width: 85%;';
    userDiv.innerText = msg;
    msgs.appendChild(userDiv);
    
    input.value = '';
    msgs.scrollTop = msgs.scrollHeight;
    
    // Loading indicator
    const aiDiv = document.createElement('div');
    aiDiv.style.cssText = 'background: rgba(43, 212, 173, 0.1); border: 1px solid rgba(43, 212, 173, 0.2); padding: 10px; border-radius: 6px; color: var(--text-high); align-self: flex-start; max-width: 85%;';
    aiDiv.innerHTML = `<span style="opacity:0.6;">Thinking...</span>`;
    msgs.appendChild(aiDiv);
    msgs.scrollTop = msgs.scrollHeight;

    // Real AI response
    fetch(window.apiUrl('/api/dashboard/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
    })
    .then(res => res.json())
    .then(data => {
        aiDiv.innerHTML = data.response.split('\n').join('<br/>');
        msgs.scrollTop = msgs.scrollHeight;
    })
    .catch(e => {
        aiDiv.innerHTML = `<span style="color:red;">Failed to reach AI backend.</span>`;
    });
};
;

window.downloadSIEM = function() {
    const token = localStorage.getItem('token');
    const url = window.apiUrl('/api/dashboard/export-siem' + (token ? '?token=' + encodeURIComponent(token) : ''));
    window.location.href = url;
};


window.escalateAlert = function(type, ip, risk) {
    window.showCyberConfirm(
        'Escalate Security Incident',
        'Escalate anomaly (' + type + ' on ' + ip + ') to an official incident ticket for SOC triage?',
        async function() {
            try {
                const authHeaders = (window.getAuthHeaders ? window.getAuthHeaders() : {});
                const res = await fetch(window.apiUrl('/api/dashboard/tickets'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...authHeaders
                    },
                    body: JSON.stringify({
                        subject: '[Incident] ' + type + ' detected on ' + ip,
                        description: 'Automated SOC escalation. Risk score: ' + risk + '. Immediate host isolation and flow audit requested.'
                    })
                });
                if (res.ok) {
                    window.showCyberToast('Incident Ticket dispatched to Admin Queue!');
                    if (window.fetchTickets) window.fetchTickets();
                } else {
                    const errData = await res.json().catch(() => ({}));
                    const errMsg = errData.detail || errData.message || ('HTTP ' + res.status);
                    window.showCyberToast('Failed to escalate incident: ' + errMsg, true);
                }
            } catch(e) {
                window.showCyberToast('Escalation error: ' + e, true);
            }
        },
        false
    );
};
;

window.fetchThreatIntelligence = async function() {
    try {
        const res = await fetch(window.apiUrl('/api/dashboard/intelligence'), {
            headers: window.getAuthHeaders()
        });
        if (!res.ok) return;
        const data = await res.json();
        
        // 1. Update Behavioral Insights
        const vEl = document.getElementById('intel-vector');
        const hEl = document.getElementById('intel-host');
        const tEl = document.getElementById('intel-total');
        if (vEl) vEl.innerText = data.insights.dominant_vector;
        if (hEl) hEl.innerText = data.insights.most_targeted_host;
        if (tEl) tEl.innerText = data.insights.total_anomalies_detected + ' Events';
        
        // 2. Populate Attackers Table
        const aBody = document.getElementById('top-attackers-body');
        if (aBody && data.top_attackers) {
            aBody.innerHTML = data.top_attackers.map(a => 
                '<tr style="border-bottom:1px solid var(--line);">' +
                    '<td style="padding:8px 4px; font-family:var(--mono); font-weight:600; color:#fff;">' + a.ip + '</td>' +
                    '<td style="padding:8px 4px; color:var(--text-high);">' + a.attack_type + '</td>' +
                    '<td style="padding:8px 4px; font-family:var(--mono); color:var(--text-low);">' + a.count + '</td>' +
                    '<td style="padding:8px 4px;"><span style="background:rgba(229,57,53,0.15); color:#e53935; padding:2px 6px; border-radius:3px; font-size:11px; font-weight:700;">' + a.risk_score + '</span></td>' +
                '</tr>'
            ).join('');
        }
        
        // 3. Populate Targets Table
        const tBody = document.getElementById('top-targets-body');
        if (tBody && data.top_targets) {
            tBody.innerHTML = data.top_targets.map(t => 
                '<tr style="border-bottom:1px solid var(--line);">' +
                    '<td style="padding:8px 4px; font-family:var(--mono); font-weight:600; color:#fff;">' + t.ip + '</td>' +
                    '<td style="padding:8px 4px; font-family:var(--mono); color:var(--text-low);">' + t.count + '</td>' +
                    '<td style="padding:8px 4px;"><span style="background:rgba(232,175,99,0.15); color:var(--signal); padding:2px 6px; border-radius:3px; font-size:11px; font-weight:700;">' + t.risk_score + '</span></td>' +
                    '<td style="padding:8px 4px; color:#e53935; font-size:11px; font-weight:600;">' + t.status + '</td>' +
                '</tr>'
            ).join('');
        }
        
        // User-Specific Notification Seen Persistence
        function getCurrentUsername() {
            return localStorage.getItem('username') || localStorage.getItem('role') || 'admin';
        }
        function isNotificationSeen(id) {
            if (!id) return false;
            try {
                const u = getCurrentUsername();
                const seen = JSON.parse(localStorage.getItem('seen_notifs_' + u) || '[]');
                return seen.includes(id);
            } catch(e) { return false; }
        }
        window.markNotificationSeen = function(id) {
            if (!id) return;
            try {
                const u = getCurrentUsername();
                const seen = JSON.parse(localStorage.getItem('seen_notifs_' + u) || '[]');
                if (!seen.includes(id)) {
                    seen.push(id);
                    localStorage.setItem('seen_notifs_' + u, JSON.stringify(seen));
                }
            } catch(e) {}
        };

        // 4. Role-Based Notification Badge & Event Initialization
        const userRole = (localStorage.getItem('role') || 'analyst').toLowerCase();
        const count = data.insights.latest_anomalies_detected || data.insights.total_anomalies_detected || 205;
        const notifId = 'ingest_' + (data.insights.last_incident_time || 'latest').replace(/[^a-zA-Z0-9]/g, '_') + '_' + count;
        const alreadySeen = isNotificationSeen(notifId);

        // Initialize with 1 incident notification batch representing database state
        if (count > 0 && window.socNotifications.length === 0) {
            window.socNotifications.push({
                id: notifId,
                source: 'Upload Ingest',
                anomalies: count,
                time: data.insights.last_incident_time,
                vector: (data.insights.dominant_vector || 'Threat') + ' attack surge detected',
                seen: alreadySeen
            });
            window.renderNotifications();
            
            // Only pop up toast banner if THIS user has NOT seen it before!
            if (!alreadySeen) {
                const toast = document.getElementById('soc-alert-toast');
                const msg = document.getElementById('soc-alert-msg');
                const toastTitle = document.getElementById('soc-toast-title');
                if (toastTitle) {
                    if (userRole === 'analyst') toastTitle.innerText = 'Security Analyst Incident Alert';
                    else if (userRole === 'soc') toastTitle.innerText = 'SOC Priority Notification';
                    else if (userRole === 'admin') toastTitle.innerText = 'SOC Incident Lead Alert';
                    else toastTitle.innerText = 'Network Defense Alert';
                }
                if (toast && msg) {
                    msg.innerHTML = '<strong>' + count.toLocaleString() + ' network anomalies</strong> flagged.<br/><span style="color:var(--text-low); font-size:12px;">Last detected: ' + data.insights.last_incident_time + '</span><br/><span style="color:#e53935; font-weight:600;">1 unread notification batch</span> on Alerts icon.';
                    toast.style.display = 'block';
                    setTimeout(() => {
                        if (toast) toast.style.display = 'none';
                        if (window.markNotificationSeen) window.markNotificationSeen(notifId);
                    }, 6000);
                }
            }
        }
    } catch(e) {
        console.error('Threat intelligence fetch failed:', e);
    }
};

// Hook into initial execution
setTimeout(() => {
    if (window.fetchThreatIntelligence) window.fetchThreatIntelligence();
}, 800);
;

window.socNotifications = [];

window.renderNotifications = function() {
    const badge = document.getElementById('alerts-icon-badge');
    const countText = document.getElementById('notif-count-text');
    const list = document.getElementById('notifications-list');
    
    // Only count UNSEEN notifications for the red icon superscript!
    const unseenCount = window.socNotifications.filter(n => !n.seen).length;
    if (badge) {
        if (unseenCount > 0) {
            badge.innerText = unseenCount;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    }
    if (countText) countText.innerText = window.socNotifications.length;
    
    if (list) {
        if (window.socNotifications.length === 0) {
            list.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-low); font-size: 12px;">No active notifications.</div>';
        } else {
            list.innerHTML = window.socNotifications.map((n, idx) => {
                const countDisplay = typeof n.anomalies === 'number' ? n.anomalies.toLocaleString() : n.anomalies;
                return '<div style="background: rgba(0,0,0,0.25); border: 1px solid var(--line); border-radius: 6px; padding: 10px 12px; font-size: 12px; position: relative;">' +
                    '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">' +
                        '<span style="background:' + (n.source === 'Upload Ingest' ? 'rgba(61,130,219,0.2)' : 'rgba(229,57,53,0.2)') + '; color:' + (n.source === 'Upload Ingest' ? '#3D82DB' : '#e53935') + '; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 3px; font-family: var(--mono);">' + n.source + '</span>' +
                        '<span style="color: var(--text-low); font-size: 11px;">' + n.time + '</span>' +
                    '</div>' +
                    '<div style="font-weight: 600; color: var(--text-high); margin-bottom: 4px;">' + countDisplay + ' Anomalies Detected</div>' +
                    '<div style="color: var(--text-low); font-size: 11px; margin-bottom: 8px;">' + n.vector + '</div>' +
                    '<div style="text-align: right;">' +
                        '<a href="#preview" onclick="document.getElementById(\'notifications-popover\').style.display=\'none\'; let el=document.getElementById(\'preview\'); if(el) el.scrollIntoView({behavior:\'smooth\'});" style="color: var(--signal); font-size: 11px; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">Investigate Threat &rarr;</a>' +
                    '</div>' +
                '</div>';
            }).join('');
        }
    }
};

window.addNotificationEvent = function(notif) {
    const userRole = (localStorage.getItem('role') || 'analyst').toLowerCase();
    // All security roles (analyst, soc, admin, enterprise) receive incident notifications
    
    notif.seen = false;
    window.socNotifications = [notif, ...window.socNotifications.filter(n => n.source !== notif.source)];
    window.renderNotifications();
    
    // Popup toast alert for new event
    const toast = document.getElementById('soc-alert-toast');
    const msg = document.getElementById('soc-alert-msg');
    const toastTitle = document.getElementById('soc-toast-title');
    if (toastTitle) {
        if (userRole === 'analyst') toastTitle.innerText = 'Security Analyst Incident Alert';
        else if (userRole === 'soc') toastTitle.innerText = 'SOC Priority Notification';
        else if (userRole === 'admin') toastTitle.innerText = 'SOC Incident Lead Alert';
        else toastTitle.innerText = 'Network Defense Alert';
    }
    if (toast && msg) {
        const countDisplay = typeof notif.anomalies === 'number' ? notif.anomalies.toLocaleString() : notif.anomalies;
        msg.innerHTML = '<strong>' + notif.source + ' Complete!</strong><br/><span style="color:var(--text-low); font-size:12px;">Analyzed at ' + notif.time + '</span><br/><span style="color:#e53935; font-weight:600;">' + countDisplay + ' anomalies detected</span>. Click bell icon to investigate.';
        toast.style.display = 'block';
        setTimeout(() => { if (toast) toast.style.display = 'none'; }, 6000);
    }
};

window.toggleNotificationsPopover = function(e) {
    if (e) e.stopPropagation();
    const p = document.getElementById('notifications-popover');
    if (p) {
        const isOpening = (p.style.display === 'none' || p.style.display === '');
        p.style.display = isOpening ? 'block' : 'none';
        if (isOpening) {
            // Once opened and viewed, all notifications are marked as seen for this user
            window.socNotifications.forEach(n => {
                n.seen = true;
                if (n.id && window.markNotificationSeen) window.markNotificationSeen(n.id);
            });
            // Hide the red superscript badge immediately!
            const badge = document.getElementById('alerts-icon-badge');
            if (badge) badge.style.display = 'none';
            if (window.setActiveNav) window.setActiveNav('nav-alerts');
        } else {
            if (window.updateActiveNav) window.updateActiveNav();
        }
    }
};

window.clearNotifications = function(e) {
    if (e) e.stopPropagation();
    window.socNotifications.forEach(n => {
        if (n.id && window.markNotificationSeen) window.markNotificationSeen(n.id);
    });
    window.socNotifications = [];
    window.renderNotifications();
};

// Close popover when clicking anywhere outside
document.addEventListener('click', function(e) {
    const p = document.getElementById('notifications-popover');
    const btn = document.getElementById('nav-alerts');
    if (p && p.style.display === 'block') {
        if (!p.contains(e.target) && !btn.contains(e.target)) {
            p.style.display = 'none';
            if (window.updateActiveNav) window.updateActiveNav();
        }
    }
});
;

window.downloadBackup = function() {
    const token = localStorage.getItem('token');
    const url = window.apiUrl('/api/dashboard/backup' + (token ? '?token=' + encodeURIComponent(token) : ''));
    window.location.href = url;
};

window.fetchSystemHealth = async function() {
    try {
        const res = await fetch(window.apiUrl('/api/dashboard/health'), {
            headers: window.getAuthHeaders()
        });
        if (!res.ok) return;
        const data = await res.json();
        
        const sqlEl = document.getElementById('health-sql-ping');
        const mongoEl = document.getElementById('health-mongo-ping');
        const countEl = document.getElementById('health-mongo-count');
        const modelEl = document.getElementById('health-model-status');
        const cpuEl = document.getElementById('health-cpu');
        const ramUsedEl = document.getElementById('health-ram-used');
        const ramTotalEl = document.getElementById('health-ram-total');
        const ramPctEl = document.getElementById('health-ram-pct');
        
        if (sqlEl) sqlEl.innerText = data.data_storage_layer.user_database.latency_ms;
        if (mongoEl) mongoEl.innerText = data.data_storage_layer.application_database.latency_ms;
        if (countEl) countEl.innerText = data.data_storage_layer.application_database.record_count.toLocaleString();
        if (modelEl) modelEl.innerText = data.data_storage_layer.model_artifacts.status;
        
        if (cpuEl) cpuEl.innerText = data.infrastructure_layer.host_telemetry.cpu_usage_pct;
        if (ramUsedEl) ramUsedEl.innerText = data.infrastructure_layer.host_telemetry.ram_used_gb;
        if (ramTotalEl) ramTotalEl.innerText = data.infrastructure_layer.host_telemetry.ram_total_gb;
        if (ramPctEl) ramPctEl.innerText = data.infrastructure_layer.host_telemetry.ram_pct;
    } catch(e) {
        console.error('Failed to fetch system health:', e);
    }
};

setTimeout(() => {
    if (window.fetchSystemHealth) window.fetchSystemHealth();
}, 1000);
;

// ==========================================
// 1. GLOBAL 3D COSMOS ENGINE (THREE.JS)
// Inspired by behfar.dev (Awwwards Nominee)
// ==========================================

// ==========================================
// 1. GLOBAL 3D COSMOS & SOLAR SYSTEM ENGINE
// Inspired by behfar.dev (Awwwards Nominee)
// Full 360° Drag & Scroll Deep Space Exploration
// ==========================================

// ==========================================
// 1. GLOBAL 3D COSMOS & SOLAR SYSTEM ENGINE
// Inspired by behfar.dev (Awwwards Nominee)
// Full 360° Drag & Scroll Deep Space Exploration
// ==========================================

// ==========================================
// 1. GLOBAL 3D COSMOS & SOLAR SYSTEM ENGINE
// Inspired by behfar.dev (Awwwards Nominee)
// Full 360° Drag & Scroll Deep Space Exploration
// ==========================================
function initCosmosBackground() {
  var canvas = document.getElementById("cosmos-canvas");
  if (!canvas || typeof THREE === "undefined") return;

  var renderer = new THREE.WebGLRenderer({
    canvas: canvas, alpha: false, antialias: true, powerPreference: "high-performance"
  });
  canvas.addEventListener('webglcontextlost', function(e){ e.preventDefault(); }, false);
  window.__ZB_3D_STATE__.cosmosRenderer = renderer;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000104, 1.0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.30;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 1, 16000);

  // High-Intensity Solid-Core Gaussian Star Sprite (Guarantees crisp visibility at any distance!)
  var starSprite = (function() {
    var c = document.createElement("canvas");
    c.width = 64; c.height = 64;
    var ctx = c.getContext("2d");
    var g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0.00, "rgba(255, 255, 255, 1.0)");
    g.addColorStop(0.28, "rgba(255, 255, 255, 1.0)"); // Solid bright core prevents vanishing!
    g.addColorStop(0.55, "rgba(220, 240, 255, 0.75)");
    g.addColorStop(0.80, "rgba(140, 180, 255, 0.25)");
    g.addColorStop(1.00, "rgba(0, 0, 0, 0.0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
    var tex = new THREE.CanvasTexture(c);
    tex.generateMipmaps = true;
    return tex;
  })();

  // Sunlight and Cosmic Ambient Lighting
  var sunLight = new THREE.DirectionalLight(0xfff8ee, 3.6);
  sunLight.position.set(-1800, 1200, 1600);
  scene.add(sunLight);

  var coreLight = new THREE.PointLight(0xffbe76, 2.6, 6000);
  coreLight.position.set(0, 0, 0);
  scene.add(coreLight);

  scene.add(new THREE.AmbientLight(0x0c1e34, 0.90));

  // ── 14,000 BRILLIANT MULTI-SPECTRAL SHIMMERING STARS ──────────
  var starFieldPoints = (function buildStarfield() {
    var N = 14000;
    var positions = new Float32Array(N * 3);
    var colors = new Float32Array(N * 3);

    var starPalette = [
      new THREE.Color("#ffeaa7"), // Warm golden G-type (Sun)
      new THREE.Color("#fdcb6e"), // Amber K-type
      new THREE.Color("#f39c12"), // Deep warm amber
      new THREE.Color("#74b9ff"), // Cool azure B-type
      new THREE.Color("#81ecec"), // Ethereal teal O-type
      new THREE.Color("#a29bfe"), // Soft lavender
      new THREE.Color("#ffffff"), // Pure diamond white A-type
      new THREE.Color("#e056fd")  // Cosmic violet
    ];

    for (var i = 0; i < N; i++) {
      // Distributed in full 3D sphere surrounding the viewer (never empty!)
      var r = 800 + Math.random() * 6500;
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.65;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      var sc = starPalette[Math.floor(Math.random() * starPalette.length)];
      var lum = 0.65 + Math.random() * 0.35;
      colors[i * 3]     = sc.r * lum;
      colors[i * 3 + 1] = sc.g * lum;
      colors[i * 3 + 2] = sc.b * lum;
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    var mat = new THREE.PointsMaterial({
      size: 3.2,
      map: starSprite,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    var pts = new THREE.Points(geo, mat);
    scene.add(pts);
    return pts;
  })();

  // ── 36,000-PARTICLE ROTATING SPIRAL GALAXY ────────────────────
  var centralGalaxyGroup = new THREE.Group();
  scene.add(centralGalaxyGroup);

  (function buildGalacticDisc() {
    var count = 36000;
    var radius = 1600;
    var arms = 4;
    var armTwist = 3.2;

    var geo = new THREE.BufferGeometry();
    var pos = new Float32Array(count * 3);
    var cols = new Float32Array(count * 3);

    var cCore = new THREE.Color("#ffffff");
    var cGold = new THREE.Color("#ffc048"); // Honey gold
    var cWarm = new THREE.Color("#f0932b"); // Amber
    var cArm  = new THREE.Color("#38ada9"); // Teal/cyan nebula arm
    var cEdge = new THREE.Color("#be2edd"); // Deep magenta
    var cFar  = new THREE.Color("#22a6b3"); // Sapphire

    for (var i = 0; i < count; i++) {
      var armIndex = i % arms;
      var t = Math.pow(Math.random(), 2.1);
      var r = t * radius + 5.0;
      var armAngle = (armIndex / arms) * Math.PI * 2;
      var spiralOffset = armTwist * Math.log(1.0 + t * 4.2);
      var scatter = (1.0 - t * 0.45) * (radius * 0.08);

      var angle = armAngle + spiralOffset + (Math.random() - 0.5) * (0.8 - t * 0.45);
      var px = Math.cos(angle) * r + (Math.random() - 0.5) * scatter;
      var py = (Math.random() - 0.5) * (0.045 * radius) * Math.exp(-r / (radius * 0.38));
      var pz = Math.sin(angle) * r + (Math.random() - 0.5) * scatter;

      // Bulge
      if (Math.random() < 0.32) {
        var br = Math.pow(Math.random(), 2.8) * (radius * 0.16);
        var bTheta = Math.random() * Math.PI * 2;
        var bPhi = (Math.random() - 0.5) * Math.PI;
        px = Math.cos(bTheta) * Math.cos(bPhi) * br;
        py = Math.sin(bPhi) * br * 0.55;
        pz = Math.sin(bTheta) * Math.cos(bPhi) * br;
        t = 0.0;
      }

      pos[i * 3]     = px;
      pos[i * 3 + 1] = py;
      pos[i * 3 + 2] = pz;

      var distNorm = Math.sqrt(px * px + pz * pz) / radius;
      var c;
      if (distNorm < 0.08) {
        c = cCore.clone().lerp(cGold, distNorm / 0.08);
      } else if (distNorm < 0.24) {
        c = cGold.clone().lerp(cWarm, (distNorm - 0.08) / 0.16);
      } else if (distNorm < 0.52) {
        c = cWarm.clone().lerp(cArm, (distNorm - 0.24) / 0.28);
      } else if (distNorm < 0.78) {
        c = cArm.clone().lerp(cEdge, (distNorm - 0.52) / 0.26);
      } else {
        c = cEdge.clone().lerp(cFar, Math.min(1.0, (distNorm - 0.78) / 0.22));
      }

      var lum = 0.75 + Math.random() * 0.30;
      cols[i * 3]     = c.r * lum;
      cols[i * 3 + 1] = c.g * lum;
      cols[i * 3 + 2] = c.b * lum;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));

    var mat = new THREE.PointsMaterial({
      size: 3.0,
      map: starSprite,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    var pts = new THREE.Points(geo, mat);
    centralGalaxyGroup.add(pts);
  })();

  // ── SOLAR SYSTEM PLANETS (INCLUDING PHOTOREALISTIC EARTH) ─────
  var planetGroup = new THREE.Group();
  scene.add(planetGroup);

  function makeHighResCanvasTexture(w, h, drawFn) {
    var c = document.createElement("canvas");
    c.width = w; c.height = h;
    var ctx = c.getContext("2d");
    drawFn(ctx, w, h);
    var tex = new THREE.CanvasTexture(c);
    tex.generateMipmaps = true;
    return tex;
  }

  // 1. MARS: Red-ochre, basalt maria, white polar cap
  var marsMesh = (function() {
    var tex = makeHighResCanvasTexture(1024, 512, function(ctx, w, h) {
      var bg = ctx.createLinearGradient(0, 0, w, 0);
      bg.addColorStop(0.0, "#b84224"); bg.addColorStop(0.25, "#d45832");
      bg.addColorStop(0.5, "#c24a28"); bg.addColorStop(0.75, "#aa381c");
      bg.addColorStop(1.0, "#b84224");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

      ctx.globalAlpha = 0.45; ctx.fillStyle = "#5c1e10";
      ctx.beginPath(); ctx.ellipse(w * 0.35, h * 0.52, w * 0.18, h * 0.18, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(w * 0.72, h * 0.44, w * 0.22, h * 0.15, -0.2, 0, Math.PI * 2); ctx.fill();

      ctx.globalAlpha = 1.0;
      var np = ctx.createLinearGradient(0, 0, 0, h * 0.16);
      np.addColorStop(0, "rgba(255, 255, 255, 0.98)");
      np.addColorStop(0.7, "rgba(240, 240, 240, 0.85)");
      np.addColorStop(1, "rgba(200, 190, 180, 0.0)");
      ctx.fillStyle = np; ctx.fillRect(0, 0, w, h * 0.16);
    });

    var geo = new THREE.SphereGeometry(38, 48, 48);
    var mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, metalness: 0.08 });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(380, 190, -360);
    mesh.rotation.z = 0.44;
    planetGroup.add(mesh);

    var atGeo = new THREE.SphereGeometry(40, 32, 32);
    var atMat = new THREE.MeshBasicMaterial({
      color: 0xe17055, transparent: true, opacity: 0.25, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false
    });
    mesh.add(new THREE.Mesh(atGeo, atMat));
    return mesh;
  })();

  // 2. PHOTOREALISTIC 3D EARTH (Blue Marble: Oceans, Green/Brown Continents, Cloud Canopy)
  var earthMeshGroup = new THREE.Group();
  (function buildRealisticEarth() {
    var tex = makeHighResCanvasTexture(1024, 512, function(ctx, w, h) {
      // Sapphire Deep Oceans
      var bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0.0, "#040e24"); bg.addColorStop(0.5, "#0b254a"); bg.addColorStop(1.0, "#040e24");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

      // Realistic Continents with Green / Ochre Biomes
      ctx.fillStyle = "#1e4d2b"; // Lush temperate forest
      // Americas
      ctx.beginPath(); ctx.ellipse(w * 0.26, h * 0.35, w * 0.09, h * 0.15, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(w * 0.32, h * 0.65, w * 0.08, h * 0.18, 0.2, 0, Math.PI * 2); ctx.fill();
      // Eurasia & Africa
      ctx.beginPath(); ctx.ellipse(w * 0.62, h * 0.32, w * 0.18, h * 0.14, -0.1, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#a67c38"; // Sahara desert amber
      ctx.beginPath(); ctx.ellipse(w * 0.58, h * 0.46, w * 0.09, h * 0.08, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#1b5e20"; // Central Africa
      ctx.beginPath(); ctx.ellipse(w * 0.60, h * 0.60, w * 0.08, h * 0.12, 0.1, 0, Math.PI * 2); ctx.fill();
      // Australia
      ctx.fillStyle = "#9c7636";
      ctx.beginPath(); ctx.ellipse(w * 0.84, h * 0.70, w * 0.07, h * 0.08, 0, 0, Math.PI * 2); ctx.fill();
      // Polar ice
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, w, h * 0.10); ctx.fillRect(0, h * 0.90, w, h * 0.10);
    });

    var geo = new THREE.SphereGeometry(44, 48, 48);
    var mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0.10 });
    var mesh = new THREE.Mesh(geo, mat);

    // Cloud sphere
    var cloudTex = makeHighResCanvasTexture(512, 256, function(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
      for (var k = 0; k < 45; k++) {
        var cx = Math.random() * w, cy = Math.random() * h, cr = 14 + Math.random() * 28;
        ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.fill();
      }
    });
    var cGeo = new THREE.SphereGeometry(45.2, 32, 32);
    var cMat = new THREE.MeshLambertMaterial({ map: cloudTex, transparent: true, opacity: 0.68 });
    var cMesh = new THREE.Mesh(cGeo, cMat);
    mesh.add(cMesh);

    // Atmosphere limb
    var atGeo = new THREE.SphereGeometry(46.5, 32, 32);
    var atMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, transparent: true, opacity: 0.28, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false
    });
    mesh.add(new THREE.Mesh(atGeo, atMat));

    earthMeshGroup.add(mesh);
    earthMeshGroup.position.set(560, 150, -390);
    earthMeshGroup.rotation.z = -23.44 * (Math.PI / 180);
    planetGroup.add(earthMeshGroup);
  })();

  // 3. JUPITER: 16 cloud zones and Great Red Spot
  var jupiterMesh = (function() {
    var tex = makeHighResCanvasTexture(1024, 512, function(ctx, w, h) {
      var bands = [
        { y: 0.00, col: "#9e7046" }, { y: 0.08, col: "#d8ba8e" },
        { y: 0.18, col: "#ab7a52" }, { y: 0.28, col: "#e8d2b0" },
        { y: 0.38, col: "#b87848" }, { y: 0.48, col: "#d4a872" },
        { y: 0.58, col: "#c58c56" }, { y: 0.68, col: "#eccca2" },
        { y: 0.78, col: "#b06c38" }, { y: 0.88, col: "#dfba8c" },
        { y: 1.00, col: "#7c4424" }
      ];
      var bg = ctx.createLinearGradient(0, 0, 0, h);
      bands.forEach(function(b) { bg.addColorStop(b.y, b.col); });
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

      // Great Red Spot
      ctx.save();
      ctx.translate(w * 0.60, h * 0.62);
      ctx.scale(2.2, 1.0);
      var rsg = ctx.createRadialGradient(0, 0, 4, 0, 0, 36);
      rsg.addColorStop(0, "#c0392b"); rsg.addColorStop(0.65, "#d35400"); rsg.addColorStop(1, "rgba(211, 84, 0, 0.0)");
      ctx.fillStyle = rsg; ctx.beginPath(); ctx.arc(0, 0, 36, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    var geo = new THREE.SphereGeometry(72, 64, 64);
    var mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.78, metalness: 0.05 });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(800, 100, -430);
    mesh.rotation.z = 0.05;
    planetGroup.add(mesh);
    return mesh;
  })();

  // 4. SATURN: Golden gas giant with wide concentric rings & Cassini division
  var saturnMesh = (function() {
    var bodyTex = makeHighResCanvasTexture(1024, 512, function(ctx, w, h) {
      var bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0.00, "#a88e58"); bg.addColorStop(0.30, "#d8c48a");
      bg.addColorStop(0.60, "#c4ae72"); bg.addColorStop(1.00, "#887038");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    });

    var geo = new THREE.SphereGeometry(56, 64, 64);
    var mat = new THREE.MeshStandardMaterial({ map: bodyTex, roughness: 0.75, metalness: 0.08 });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(1100, 50, -470);
    mesh.rotation.z = 0.48; mesh.rotation.x = 0.22;
    planetGroup.add(mesh);

    var ringTex = makeHighResCanvasTexture(1024, 64, function(ctx, w, h) {
      var rg = ctx.createLinearGradient(0, 0, w, 0);
      rg.addColorStop(0.00, "rgba(0,0,0,0)");
      rg.addColorStop(0.18, "rgba(130, 110, 80, 0.35)");
      rg.addColorStop(0.35, "rgba(215, 190, 140, 0.85)");
      rg.addColorStop(0.65, "rgba(235, 210, 160, 0.95)");
      rg.addColorStop(0.68, "rgba(10, 8, 5, 0.05)"); // Cassini Division
      rg.addColorStop(0.72, "rgba(180, 155, 110, 0.78)");
      rg.addColorStop(0.92, "rgba(160, 135, 95, 0.55)");
      rg.addColorStop(1.00, "rgba(0,0,0,0)");
      ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
    });

    var rGeo = new THREE.RingGeometry(68, 145, 128);
    var posAttr = rGeo.attributes.position;
    var uvs = new Float32Array((posAttr.count) * 2);
    for (var i = 0; i < posAttr.count; i++) {
      var x = posAttr.getX(i), y = posAttr.getY(i);
      var dist = Math.sqrt(x * x + y * y);
      uvs[i * 2] = (dist - 68) / (145 - 68);
      uvs[i * 2 + 1] = 0.5;
    }
    rGeo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

    var rMat = new THREE.MeshStandardMaterial({
      map: ringTex, side: THREE.DoubleSide, transparent: true, opacity: 0.92, roughness: 0.85
    });
    var ringMesh = new THREE.Mesh(rGeo, rMat);
    ringMesh.rotation.x = Math.PI / 2;
    mesh.add(ringMesh);
    return mesh;
  })();

  // 5. URANUS: Icy aquamarine with vertical ring
  var uranusMesh = (function() {
    var tex = makeHighResCanvasTexture(512, 256, function(ctx, w, h) {
      var bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0.0, "#a5f3fc"); bg.addColorStop(0.5, "#67e8f9"); bg.addColorStop(1.0, "#0284c7");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    });

    var geo = new THREE.SphereGeometry(38, 48, 48);
    var mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45, metalness: 0.12 });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(1360, 20, -510);
    mesh.rotation.z = 1.70;
    planetGroup.add(mesh);

    var atGeo = new THREE.SphereGeometry(40, 32, 32);
    var atMat = new THREE.MeshBasicMaterial({
      color: 0x67e8f9, transparent: true, opacity: 0.25, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false
    });
    mesh.add(new THREE.Mesh(atGeo, atMat));

    var urGeo = new THREE.RingGeometry(44, 58, 64);
    var urMat = new THREE.MeshBasicMaterial({ color: 0xa5f3fc, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false });
    var urRing = new THREE.Mesh(urGeo, urMat);
    urRing.rotation.x = Math.PI / 2;
    mesh.add(urRing);
    return mesh;
  })();

  // 6. NEPTUNE: Deep royal azure blue
  var neptuneMesh = (function() {
    var tex = makeHighResCanvasTexture(512, 256, function(ctx, w, h) {
      var bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0.0, "#60a5fa"); bg.addColorStop(0.5, "#2563eb"); bg.addColorStop(1.0, "#172554");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    });

    var geo = new THREE.SphereGeometry(36, 48, 48);
    var mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.50, metalness: 0.15 });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(1580, -10, -550);
    mesh.rotation.z = 0.50;
    planetGroup.add(mesh);
    return mesh;
  })();

  // ── 3D SCROLL CHOREOGRAPHY & 360 SPIN ─────────────────────────
  var targetTheta = 0.0, currentTheta = 0.0;
  var targetPhi = 0.32, currentPhi = 0.32;
  var targetCamDist = 1200, currentCamDist = 1200;
  var manualTheta = 0.0;
  var isDragging = false;
  var prevX = 0, prevY = 0;
  var velX = 0, velY = 0;

  function updateScrollChoreography() {
    var scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    var heroThreshold = 380;

    var tiltFrac = Math.min(1.0, scrollY / heroThreshold);
    var smoothTilt = 0.5 * (1.0 - Math.cos(tiltFrac * Math.PI));
    var basePhi = 0.32 * (1.0 - smoothTilt);

    var spinScroll = Math.max(0, scrollY - heroThreshold);
    var scrollSpinTheta = spinScroll * 0.0034;

    targetPhi = basePhi;
    targetTheta = manualTheta + scrollSpinTheta;
  }

  window.addEventListener("scroll", updateScrollChoreography, { passive: true });
  updateScrollChoreography();

  // Mouse & Touch 360 Drag
  window.addEventListener("pointerdown", function(e) {
    if (e.target.closest && e.target.closest("button, a, input, select, textarea, #cyber-chat-window, .aerospace-hud-card")) return;
    isDragging = true; prevX = e.clientX; prevY = e.clientY; velX = 0; velY = 0;
  });
  window.addEventListener("pointermove", function(e) {
    if (!isDragging) return;
    var dx = e.clientX - prevX, dy = e.clientY - prevY;
    prevX = e.clientX; prevY = e.clientY;
    velX = dx * 0.0032; velY = dy * 0.0032;
    manualTheta -= velX;
    targetPhi = Math.max(-1.40, Math.min(1.40, targetPhi + velY));
    targetTheta = manualTheta;
  });
  window.addEventListener("pointerup", function() { isDragging = false; });

  // Touch
  window.addEventListener("touchstart", function(e) {
    if (e.target.closest && e.target.closest("button, a, input, select, textarea, #cyber-chat-window, .aerospace-hud-card")) return;
    isDragging = true; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; velX = 0; velY = 0;
  }, { passive: true });
  window.addEventListener("touchmove", function(e) {
    if (!isDragging) return;
    var dx = e.touches[0].clientX - prevX, dy = e.touches[0].clientY - prevY;
    prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
    velX = dx * 0.0032; velY = dy * 0.0032;
    manualTheta -= velX;
    targetPhi = Math.max(-1.40, Math.min(1.40, targetPhi + velY));
    targetTheta = manualTheta;
  }, { passive: true });
  window.addEventListener("touchend", function() { isDragging = false; });

  // Wheel horizontal swipe
  window.addEventListener("wheel", function(e) {
    if (e.target.closest && e.target.closest(".aerospace-hud-card, .table-wrap, #cyber-chat-window")) return;
    var dx = e.deltaX || 0;
    if (Math.abs(dx) > 4) { manualTheta -= dx * 0.0016; targetTheta = manualTheta; }
  }, { passive: true });

  // ── DYNAMIC CELESTIAL ANIMATION LOOP (LIVING, VIBRANT MOTION) ──
  var clock = new THREE.Timer();
  function animateCosmos() {
    window.__ZB_3D_STATE__.cosmosAnimId = requestAnimationFrame(animateCosmos);
    clock.update();
    var t = clock.getElapsed();

    // Noticeable smooth continuous ambient rotation
    if (!isDragging) {
      manualTheta += 0.0006; // Clearly noticeable cosmic drift
      if (Math.abs(velX) > 0.0001) { manualTheta -= velX * 0.88; velX *= 0.88; }
      if (Math.abs(velY) > 0.0001) { targetPhi = Math.max(-1.40, Math.min(1.40, targetPhi + velY * 0.88)); velY *= 0.88; }
    }

    currentTheta   += (targetTheta   - currentTheta)   * 0.065;
    currentPhi     += (targetPhi     - currentPhi)     * 0.065;
    currentCamDist += (targetCamDist - currentCamDist) * 0.065;

    camera.position.x = currentCamDist * Math.sin(currentTheta) * Math.cos(currentPhi);
    camera.position.y = currentCamDist * Math.sin(currentPhi);
    camera.position.z = currentCamDist * Math.cos(currentTheta) * Math.cos(currentPhi);
    camera.lookAt(0, 0, 0);

    // Dynamic, visibly noticeable planet rotations!
    marsMesh.rotation.y = t * 0.06;
    earthMeshGroup.rotation.y = t * 0.07;
    jupiterMesh.rotation.y = t * 0.05;
    saturnMesh.rotation.y = t * 0.04;
    uranusMesh.rotation.y = t * 0.05;
    neptuneMesh.rotation.y = t * 0.05;

    // Gentle floating planetary oscillation
    planetGroup.position.y = Math.sin(t * 0.8) * 8;

    // Visibly rotating spiral galaxy
    centralGalaxyGroup.rotation.y = t * 0.022;

    // Scintillating starfield twinkle
    if (starFieldPoints && starFieldPoints.material) {
      starFieldPoints.material.opacity = 0.88 + Math.sin(t * 2.8) * 0.10;
    }

    renderer.render(scene, camera);
  }
  animateCosmos();

  window.addEventListener("resize", function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}


// ==========================================
// 2. THREE.JS 3D ISOMETRIC FROSTED GLASS PILLARS (CONCEPT 1)
// Award-Winning Sci-Fi Volumetric Anomaly Pillars
// ==========================================
(function() {
  var activeBuckets = [
    { label: "10:00", count: 14340, height: 28, spike: false },
    { label: "10:10", count: 24100, height: 45, spike: false },
    { label: "10:20", count: 18200, height: 32, spike: false },
    { label: "10:30", count: 344073, height: 92, spike: true },
    { label: "10:40", count: 32000, height: 48, spike: false },
    { label: "10:50", count: 41200, height: 56, spike: false },
    { label: "11:00", count: 21000, height: 38, spike: false },
    { label: "11:10", count: 289000, height: 86, spike: true },
    { label: "11:20", count: 31000, height: 42, spike: false },
    { label: "11:30", count: 48000, height: 54, spike: false }
  ];

  window.renderFlowWave = function(buckets) {
    if (Array.isArray(buckets) && buckets.length > 0) {
      activeBuckets = buckets;
      rebuildPillars();
    }
  };

  var waveRenderer, waveScene, waveCamera, waveClock;
  var pillarGroup, gridGroup, particleGroup;
  var waveAnimId;
  var pillarEntries = [];
  var raycaster, mouseVec;
  var hoveredIndex = -1;
  var targetCamX = 0, targetCamY = 6.2, curCamX = 0, curCamY = 6.2;
  var tooltip = null;

  function initWaveCanvas() {
    var canvas = document.getElementById("flow-wave-canvas");
    tooltip = document.getElementById("flow-wave-tooltip");
    if (!canvas || typeof THREE === "undefined") return;

    var W = canvas.clientWidth || 600;
    var H = canvas.clientHeight || 310;

    waveRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    canvas.addEventListener('webglcontextlost', function(e){ e.preventDefault(); }, false);
    window.__ZB_3D_STATE__.waveRenderer = waveRenderer;
    waveRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
    waveRenderer.setSize(W, H);
    waveRenderer.setClearColor(0x000000, 0);
    waveRenderer.shadowMap.enabled = true;
    waveRenderer.shadowMap.type = THREE.PCFShadowMap;

    waveScene = new THREE.Scene();
    waveScene.fog = new THREE.FogExp2(0x050c18, 0.038);

    waveCamera = new THREE.PerspectiveCamera(38, W / H, 0.1, 500);
    waveCamera.position.set(0, 6.2, 13.8);
    waveCamera.lookAt(0, 1.8, 0);
    waveClock = new THREE.Timer();

    raycaster = new THREE.Raycaster();
    mouseVec = new THREE.Vector2(-999, -999);

    // --- LIGHTING ---
    var ambLight = new THREE.AmbientLight(0x081528, 1.4);
    waveScene.add(ambLight);

    var sunLight = new THREE.DirectionalLight(0x00f0ff, 2.2);
    sunLight.position.set(10, 16, 12);
    sunLight.castShadow = true;
    waveScene.add(sunLight);

    var rimLight = new THREE.DirectionalLight(0xff0055, 1.3);
    rimLight.position.set(-12, 10, -8);
    waveScene.add(rimLight);

    var goldFill = new THREE.DirectionalLight(0xffb703, 1.0);
    goldFill.position.set(0, 12, -10);
    waveScene.add(goldFill);

    var floorPoint = new THREE.PointLight(0x00c8d4, 2.4, 25);
    floorPoint.position.set(0, 1.2, 2);
    waveScene.add(floorPoint);

    // --- BASE GRID FLOOR & RADAR CIRCLES ---
    buildIsometricFloor();

    // --- PILLAR GROUP ---
    pillarGroup = new THREE.Group();
    waveScene.add(pillarGroup);

    // --- ENERGY PARTICLES ---
    buildEnergyParticles();

    // --- BUILD INITIAL PILLARS ---
    rebuildPillars();

    // --- MOUSE MOVE & RAYCASTING ---
    canvas.addEventListener("mousemove", function(e) {
      var rect = canvas.getBoundingClientRect();
      var rawX = e.clientX - rect.left;
      var rawY = e.clientY - rect.top;
      mouseVec.x = (rawX / rect.width) * 2 - 1;
      mouseVec.y = -(rawY / rect.height) * 2 + 1;

      targetCamX = mouseVec.x * 1.5;
      targetCamY = 6.2 + mouseVec.y * 0.8;

      if (raycaster && pillarEntries.length > 0) {
        raycaster.setFromCamera(mouseVec, waveCamera);
        var hitboxes = [];
        for (var pi = 0; pi < pillarEntries.length; pi++) {
          hitboxes.push(pillarEntries[pi].hitbox);
        }
        var intersects = raycaster.intersectObjects(hitboxes);
        if (intersects.length > 0) {
          var hitIdx = intersects[0].object.userData.index;
          setHoveredPillar(hitIdx, rawX, rawY, rect.width);
        } else {
          setHoveredPillar(-1);
        }
      }
    });

    canvas.addEventListener("mouseleave", function() {
      mouseVec.set(-999, -999);
      targetCamX = 0;
      targetCamY = 6.2;
      setHoveredPillar(-1);
    });

    // --- RESIZE ---
    window.addEventListener("resize", function() {
      var W2 = canvas.clientWidth || 600;
      var H2 = canvas.clientHeight || 310;
      waveCamera.aspect = W2 / H2;
      waveCamera.updateProjectionMatrix();
      waveRenderer.setSize(W2, H2);
    });

    animateWave();
  }

  function setHoveredPillar(idx, clientX, clientY, canvasW) {
    hoveredIndex = idx;
    if (idx >= 0 && idx < pillarEntries.length) {
      var entry = pillarEntries[idx];
      var b = entry.data;
      if (tooltip) {
        var countFmt = typeof b.count === "number" ? b.count.toLocaleString() : b.count;
        var tierHTML = entry.tier === "CRITICAL"
          ? "<span style='color:#ff0055;font-weight:700;'>⚡ CRITICAL SURGE (" + countFmt + " ANOMALIES)</span>"
          : (entry.tier === "ELEVATED"
            ? "<span style='color:#ffb703;font-weight:700;'>▲ ELEVATED THREAT (" + countFmt + " ANOMALIES)</span>"
            : "<span style='color:#00f0ff;font-weight:700;'>✓ NOMINAL BASELINE (" + countFmt + " ANOMALIES)</span>");

        var isLive = b.source_type === "live_capture" || b.is_live || (b.filename && (b.filename.toLowerCase().includes("live") || b.filename.toLowerCase().includes("capture")));
        var titleText = isLive 
          ? "<span style='color:#10b981;font-weight:800;'>● LIVE CAPTURE</span> &bull; " + (b.label || "")
          : (b.filename 
            ? "<span style='color:#38bdf8;'>" + b.filename + "</span> &bull; " + (b.label || "")
            : (b.label || "Session"));

        var headerBadge = isLive
          ? "<span style='width:7px;height:7px;border-radius:50%;background:#10b981;box-shadow:0 0 10px #10b981;'></span>HARDWARE SNIFFER // LIVE CAPTURE"
          : "<span style='width:7px;height:7px;border-radius:50%;background:#00f0ff;box-shadow:0 0 10px #00f0ff;'></span>TELEMETRY RECORD // SESSION " + (idx + 1);

        tooltip.innerHTML = "<div style='font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:" + (isLive ? "#10b981" : "#00f0ff") + ";margin-bottom:4px;display:flex;align-items:center;gap:7px;'>" + headerBadge + "</div>" +
          "<div style='font-size:14.5px;font-weight:700;color:#ffffff;margin-bottom:6px;'>" + titleText + "</div>" +
          "<div style='margin-bottom:6px;font-size:13px;'>" + tierHTML + "</div>" +
          "<div style='font-size:11px;color:#94a3b8;border-top:1px solid rgba(255,255,255,0.1);padding-top:6px;margin-top:6px;'>" + (isLive ? "Real-time Hardware Network Interface Capture" : "Verified Deep Packet Flow Inspection") + "</div>";
        tooltip.style.display = "block";
        var tipX = clientX ? Math.min(clientX + 16, canvasW - 270) : 20;
        tooltip.style.left = Math.max(10, tipX) + "px";
        tooltip.style.top = "12px";
      }
    } else {
      if (tooltip) tooltip.style.display = "none";
    }
  }

  function buildIsometricFloor() {
    gridGroup = new THREE.Group();
    gridGroup.position.y = 0;

    var floorGeo = new THREE.PlaneGeometry(28, 18);
    var floorMat = new THREE.MeshBasicMaterial({ color: 0x050c18, transparent: true, opacity: 0.92 });
    var floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.02;
    gridGroup.add(floorMesh);

    var cols = 28, rows = 18;
    var cw = 28 / cols, rw = 18 / rows;

    for (var r = 0; r <= rows; r++) {
      var z = -9 + r * rw;
      var isMajor = (r % 3 === 0);
      var alpha = isMajor ? 0.32 : 0.12;
      var distZ = Math.abs(z) / 9;
      alpha *= Math.max(0.08, 1 - distZ * 0.7);

      var lineMat = new THREE.LineBasicMaterial({ color: 0x00c8d4, transparent: true, opacity: alpha });
      var lg = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-14, 0, z),
        new THREE.Vector3(14, 0, z)
      ]);
      gridGroup.add(new THREE.Line(lg, lineMat));
    }

    for (var c = 0; c <= cols; c++) {
      var x = -14 + c * cw;
      var isMajor2 = (c % 4 === 0);
      var alpha2 = isMajor2 ? 0.32 : 0.12;
      var distX = Math.abs(x) / 14;
      alpha2 *= Math.max(0.08, 1 - distX * 0.7);

      var lineMat2 = new THREE.LineBasicMaterial({ color: 0x00c8d4, transparent: true, opacity: alpha2 });
      var vg = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, 0, -9),
        new THREE.Vector3(x, 0, 9)
      ]);
      gridGroup.add(new THREE.Line(vg, lineMat2));
    }

    // Concentric ambient radar circles on floor
    var rRingMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.16 });
    var radii = [4, 7.5, 11];
    for (var ri = 0; ri < radii.length; ri++) {
      var rad = radii[ri];
      var circlePts = [];
      for (var a = 0; a <= 64; a++) {
        var th = (a / 64) * Math.PI * 2;
        circlePts.push(new THREE.Vector3(Math.cos(th) * rad, 0.005, Math.sin(th) * rad * 0.55));
      }
      var cGeo = new THREE.BufferGeometry().setFromPoints(circlePts);
      gridGroup.add(new THREE.Line(cGeo, rRingMat));
    }

    waveScene.add(gridGroup);
  }

  function buildEnergyParticles() {
    particleGroup = new THREE.Group();
    var pColors = [0x00f0ff, 0x00e5ff, 0xffb703, 0xff0055];
    for (var p = 0; p < 45; p++) {
      var pgeo = new THREE.SphereGeometry(0.045, 6, 6);
      var col = pColors[Math.floor(Math.random() * pColors.length)];
      var pmat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.7 + Math.random() * 0.3 });
      var pmesh = new THREE.Mesh(pgeo, pmat);
      pmesh.position.set(
        (Math.random() - 0.5) * 16,
        0.1 + Math.random() * 5.5,
        (Math.random() - 0.5) * 6
      );
      pmesh.userData = {
        vx: (Math.random() - 0.5) * 0.012,
        vy: 0.008 + Math.random() * 0.016,
        vz: (Math.random() - 0.5) * 0.01,
        phase: Math.random() * Math.PI * 2
      };
      particleGroup.add(pmesh);
    }
    waveScene.add(particleGroup);
  }

  function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function createGroundGlowTexture(colorStr) {
    var c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    var ctx = c.getContext("2d");
    var grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, colorStr);
    grad.addColorStop(0.28, colorStr);
    grad.addColorStop(0.68, "rgba(0,0,0,0.08)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    var tex = new THREE.CanvasTexture(c);
    return tex;
  }

  function createBadgeTexture(count, tier, hexStr) {
    var bCanvas = document.createElement("canvas");
    bCanvas.width = 640;
    bCanvas.height = 200;
    var ctx = bCanvas.getContext("2d");

    var countFmt = typeof count === "number"
      ? (count >= 1000000 ? (count / 1000000).toFixed(1) + "M" : (count >= 1000 ? (count / 1000).toFixed(1) + "K" : count.toLocaleString()))
      : count.toString();

    // 1. Glassmorphic pill container
    drawRoundedRect(ctx, 8, 8, 624, 184, 30);
    var bgGrad = ctx.createLinearGradient(8, 8, 624, 184);
    bgGrad.addColorStop(0, "rgba(5, 12, 28, 0.97)");
    bgGrad.addColorStop(1, "rgba(9, 20, 44, 0.95)");
    ctx.fillStyle = bgGrad;
    ctx.fill();

    // 2. High-intensity glowing neon border
    ctx.lineWidth = 4;
    ctx.strokeStyle = hexStr;
    ctx.shadowColor = hexStr;
    ctx.shadowBlur = 18;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 3. Inner border accent
    drawRoundedRect(ctx, 15, 15, 610, 170, 24);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
    ctx.stroke();

    // 4. Left Status Beacon Dot
    ctx.fillStyle = hexStr;
    ctx.shadowColor = hexStr;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(52, 100, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = hexStr;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(52, 100, 26, 0, Math.PI * 2);
    ctx.stroke();

    // 5. Huge Bold Metric Number
    ctx.font = "bold 84px 'IBM Plex Mono', 'JetBrains Mono', monospace, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.9)";
    ctx.shadowBlur = 10;
    ctx.fillText(countFmt, 92, 100);
    ctx.shadowBlur = 0;

    // 6. Right Status Pill Badge (Massive, bold & readable)
    drawRoundedRect(ctx, 400, 30, 216, 140, 22);
    ctx.fillStyle = hexStr + "35";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = hexStr;
    ctx.shadowColor = hexStr;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    var tierLine1 = tier;
    var tierLine2 = "THREAT";
    if (tier === "CRITICAL") {
      tierLine1 = "CRITICAL";
      tierLine2 = "SURGE";
    } else if (tier === "ELEVATED") {
      tierLine1 = "ELEVATED";
      tierLine2 = "RISK";
    } else if (tier === "LOW") {
      tierLine1 = "NOMINAL";
      tierLine2 = "BASE";
    }

    ctx.font = "bold 34px 'IBM Plex Mono', 'JetBrains Mono', monospace, sans-serif";
    ctx.fillStyle = hexStr;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tierLine1, 508, 76);

    ctx.font = "bold 26px 'IBM Plex Mono', 'JetBrains Mono', monospace, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(tierLine2, 508, 122);

    var texture = new THREE.CanvasTexture(bCanvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  function rebuildPillars() {
    if (!waveScene || !pillarGroup) return;

    while (pillarGroup.children.length) {
      pillarGroup.remove(pillarGroup.children[0]);
    }
    pillarEntries = [];

    var n = activeBuckets.length;
    if (n === 0) return;

    var totalSpan = Math.min(14.5, Math.max(8.5, n * 2.3));
    var step = n > 1 ? totalSpan / (n - 1) : 0;
    var startX = n > 1 ? -(totalSpan / 2) : 0;

    for (var i = 0; i < n; i++) {
      var b = activeBuckets[i];
      var count = typeof b.count === "number" ? b.count : (b.anomaly_count || 0);

      var h = 1.0;
      if (count > 0) {
        var logVal = Math.log10(Math.max(10, count));
        var norm = (logVal - 1.8) / (5.8 - 1.8);
        norm = Math.max(0.12, Math.min(1.0, norm));
        h = 1.1 + Math.pow(norm, 0.82) * 3.8;
      }

      // Legend Consistent Tiers:
      // <1K: LOW (Cyan)
      // 1K - 50K: ELEVATED (Cyber Gold / Amber)
      // >50K: CRITICAL (Laser Crimson / Magenta)
      var tier = "LOW";
      var colorHex = 0x00f0ff;
      var edgeHex = 0x38bdf8;
      var cssHex = "#00f0ff";
      var haloColor = "rgba(0, 240, 255, 0.45)";

      if (count > 50000) {
        tier = "CRITICAL";
        colorHex = 0xff0055;
        edgeHex = 0xff2a6d;
        cssHex = "#ff0055";
        haloColor = "rgba(255, 0, 85, 0.45)";
      } else if (count >= 1000) {
        tier = "ELEVATED";
        colorHex = 0xffb703;
        edgeHex = 0xfbbf24;
        cssHex = "#ffb703";
        haloColor = "rgba(255, 183, 3, 0.45)";
      }

      var radius = 0.82;
      var px = startX + i * step;
      var pz = 0;

      var singlePillarGroup = new THREE.Group();
      singlePillarGroup.position.set(px, 0, pz);
      pillarGroup.add(singlePillarGroup);

      // --- A. GROUND GLOW BLOOM ---
      var glowGeo = new THREE.PlaneGeometry(radius * 4.6, radius * 4.6);
      var glowMat = new THREE.MeshBasicMaterial({
        map: createGroundGlowTexture(haloColor),
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      var groundGlowMesh = new THREE.Mesh(glowGeo, glowMat);
      groundGlowMesh.rotation.x = -Math.PI / 2;
      groundGlowMesh.position.y = 0.015;
      singlePillarGroup.add(groundGlowMesh);

      // --- B. PEDESTAL BASE ---
      var baseGeo1 = new THREE.CylinderGeometry(radius * 1.55, radius * 1.70, 0.12, 8);
      var baseMat1 = new THREE.MeshPhongMaterial({
        color: 0x091426,
        specular: colorHex,
        shininess: 90
      });
      var baseMesh1 = new THREE.Mesh(baseGeo1, baseMat1);
      baseMesh1.position.y = 0.06;
      singlePillarGroup.add(baseMesh1);

      var baseEdgeGeo1 = new THREE.EdgesGeometry(baseGeo1);
      var baseEdgeMat1 = new THREE.LineBasicMaterial({ color: edgeHex, transparent: true, opacity: 0.5 });
      baseMesh1.add(new THREE.LineSegments(baseEdgeGeo1, baseEdgeMat1));

      var baseGeo2 = new THREE.CylinderGeometry(radius * 1.25, radius * 1.38, 0.08, 8);
      var baseMat2 = new THREE.MeshPhongMaterial({ color: 0x050d1a, specular: 0x00c8d4, shininess: 70 });
      var baseMesh2 = new THREE.Mesh(baseGeo2, baseMat2);
      baseMesh2.position.y = 0.15;
      singlePillarGroup.add(baseMesh2);

      var torusGeo = new THREE.TorusGeometry(radius * 1.15, 0.028, 8, 32);
      var torusMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.85 });
      var torusMesh = new THREE.Mesh(torusGeo, torusMat);
      torusMesh.rotation.x = Math.PI / 2;
      torusMesh.position.y = 0.19;
      singlePillarGroup.add(torusMesh);

      // --- C. INNER LASER PLASMA CORE BEAM ---
      var coreGeo = new THREE.CylinderGeometry(radius * 0.28, radius * 0.28, h * 0.96, 16);
      var coreMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.88 });
      var coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.y = 0.20 + h / 2;
      singlePillarGroup.add(coreMesh);

      var shroudGeo = new THREE.CylinderGeometry(radius * 0.48, radius * 0.48, h * 0.94, 16);
      var shroudMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.22, depthWrite: false });
      var shroudMesh = new THREE.Mesh(shroudGeo, shroudMat);
      shroudMesh.position.y = 0.20 + h / 2;
      singlePillarGroup.add(shroudMesh);

      // --- D. OUTER FROSTED CRYSTAL GLASS SHELL (Octagonal Faceted Prism) ---
      var outerGeo = new THREE.CylinderGeometry(radius, radius * 1.04, h, 8, 1, false);
      var outerMat = new THREE.MeshPhongMaterial({
        color: 0x0c223c,
        emissive: colorHex,
        emissiveIntensity: 0.14,
        specular: 0x90e0ef,
        shininess: 120,
        transparent: true,
        opacity: 0.42,
        depthWrite: false
      });
      var outerMesh = new THREE.Mesh(outerGeo, outerMat);
      outerMesh.position.y = 0.20 + h / 2;
      singlePillarGroup.add(outerMesh);

      var edgeGeo = new THREE.EdgesGeometry(outerGeo);
      var edgeMat = new THREE.LineBasicMaterial({ color: edgeHex, transparent: true, opacity: 0.80 });
      var edgesMesh = new THREE.LineSegments(edgeGeo, edgeMat);
      outerMesh.add(edgesMesh);

      // --- E. QUANTUM ENERGY RUNGS ---
      var rungs = [];
      var rungSpacing = 0.58;
      var numRungs = Math.max(2, Math.floor((h - 0.35) / rungSpacing));
      for (var r = 1; r <= numRungs; r++) {
        var ry = -h / 2 + r * rungSpacing;
        var rungGeo = new THREE.TorusGeometry(radius * 0.72, 0.024, 6, 24);
        var rungMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.65 });
        var rungMesh = new THREE.Mesh(rungGeo, rungMat);
        rungMesh.rotation.x = Math.PI / 2;
        rungMesh.position.y = ry;
        rungMesh.userData = { rungIdx: r, totalRungs: numRungs };
        outerMesh.add(rungMesh);
        rungs.push(rungMesh);
      }

      // --- F. TOP EMITTER CROWN & CRYSTAL LENS ---
      var capGeo = new THREE.CylinderGeometry(radius * 0.85, radius * 1.0, 0.08, 8);
      var capMat = new THREE.MeshPhongMaterial({ color: 0x0d1a2d, specular: colorHex, shininess: 100 });
      var capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.y = 0.20 + h + 0.04;
      singlePillarGroup.add(capMesh);

      var capEdgeGeo = new THREE.EdgesGeometry(capGeo);
      var capEdgeMesh = new THREE.LineSegments(capEdgeGeo, new THREE.LineBasicMaterial({ color: edgeHex, transparent: true, opacity: 0.8 }));
      capMesh.add(capEdgeMesh);

      var lensGeo = new THREE.SphereGeometry(radius * 0.25, 12, 12);
      var lensMat = new THREE.MeshBasicMaterial({ color: colorHex });
      var lensMesh = new THREE.Mesh(lensGeo, lensMat);
      lensMesh.position.y = 0.20 + h + 0.09;
      singlePillarGroup.add(lensMesh);

      // --- G. VERTICAL HOLOGRAPHIC PROJECTION LASER BEAM ---
      var laserGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.20 + h + 0.09, 0),
        new THREE.Vector3(0, 0.20 + h + 0.90, 0)
      ]);
      var laserMat = new THREE.LineBasicMaterial({ color: edgeHex, transparent: true, opacity: 0.65 });
      var laserLine = new THREE.Line(laserGeo, laserMat);
      singlePillarGroup.add(laserLine);

      // --- H. HOLOGRAPHIC HUD BADGE SPRITE ---
      var badgeTex = createBadgeTexture(count, tier, cssHex);
      var badgeMat = new THREE.SpriteMaterial({ map: badgeTex, transparent: true, opacity: 0.98 });
      var badgeSprite = new THREE.Sprite(badgeMat);
      badgeSprite.scale.set(3.5, 1.1, 1.0);
      badgeSprite.position.set(0, 0.20 + h + 0.96, 0);
      singlePillarGroup.add(badgeSprite);

      // --- I. INTERACTIVE HITBOX ---
      var hitGeo = new THREE.CylinderGeometry(radius * 1.6, radius * 1.6, h + 1.8, 8);
      var hitMat = new THREE.MeshBasicMaterial({ visible: false });
      var hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.set(px, (h + 1.8) / 2, pz);
      hitMesh.userData = { index: i };
      pillarGroup.add(hitMesh);

      pillarEntries.push({
        index: i,
        data: b,
        tier: tier,
        count: count,
        hitbox: hitMesh,
        coreMesh: coreMesh,
        shroudMesh: shroudMesh,
        outerMesh: outerMesh,
        edgesMesh: edgesMesh,
        rungs: rungs,
        groundGlowMesh: groundGlowMesh,
        badgeSprite: badgeSprite,
        baseY: 0.20 + h / 2,
        badgeBaseY: 0.20 + h + 0.96,
        colorHex: colorHex,
        edgeHex: edgeHex,
        phase: i * 0.95
      });
    }
  }

  function animateWave() {
    waveAnimId = requestAnimationFrame(animateWave);
    window.__ZB_3D_STATE__.waveAnimId = waveAnimId;
    waveClock.update();
    var t = waveClock.getElapsed();

    curCamX += (targetCamX - curCamX) * 0.06;
    curCamY += (targetCamY - curCamY) * 0.06;
    waveCamera.position.x = curCamX;
    waveCamera.position.y = curCamY;
    waveCamera.lookAt(0, 1.8, 0);

    for (var i = 0; i < pillarEntries.length; i++) {
      var entry = pillarEntries[i];
      var isHovered = (hoveredIndex === i);

      var corePulse = isHovered ? 0.98 : (0.80 + 0.12 * Math.sin(t * 3.0 + entry.phase));
      entry.coreMesh.material.opacity = corePulse;

      entry.outerMesh.material.emissiveIntensity = isHovered ? 0.32 : (0.12 + 0.06 * Math.sin(t * 2.2 + entry.phase));
      entry.edgesMesh.material.opacity = isHovered ? 1.0 : (0.75 + 0.15 * Math.sin(t * 2.0 + entry.phase));

      if (entry.rungs && entry.rungs.length > 0) {
        for (var ri = 0; ri < entry.rungs.length; ri++) {
          var rung = entry.rungs[ri];
          var speed = isHovered ? 5.5 : 3.2;
          var rungOp = 0.35 + 0.45 * Math.sin(t * speed - rung.userData.rungIdx * 0.65 + entry.phase);
          rung.material.opacity = Math.max(0.2, rungOp);
        }
      }

      if (entry.groundGlowMesh) {
        var gScale = isHovered ? 1.25 : (1.0 + 0.08 * Math.sin(t * 2.5 + entry.phase));
        entry.groundGlowMesh.scale.set(gScale, gScale, gScale);
        entry.groundGlowMesh.material.opacity = isHovered ? 0.95 : (0.75 + 0.15 * Math.sin(t * 2.0 + entry.phase));
      }

      var badgeBob = isHovered ? 0.16 : (0.06 * Math.sin(t * 2.0 + entry.phase));
      entry.badgeSprite.position.y = entry.badgeBaseY + badgeBob;
      var targetScale = isHovered ? 3.85 : 3.5;
      var curScale = entry.badgeSprite.scale.x;
      var nextScale = curScale + (targetScale - curScale) * 0.1;
      entry.badgeSprite.scale.set(nextScale, nextScale * (1.1 / 3.5), 1.0);
    }

    if (particleGroup) {
      particleGroup.children.forEach(function(p) {
        p.position.x += p.userData.vx;
        p.position.y += p.userData.vy * (0.7 + 0.3 * Math.sin(t * 1.5 + p.userData.phase));
        p.position.z += p.userData.vz;
        p.material.opacity = 0.4 + 0.5 * Math.sin(t * 3.0 + p.userData.phase);
        if (p.position.y > 6.5) {
          p.position.y = 0.1;
          p.position.x = (Math.random() - 0.5) * 16;
          p.position.z = (Math.random() - 0.5) * 6;
        }
        if (Math.abs(p.position.x) > 9) p.userData.vx *= -1;
        if (Math.abs(p.position.z) > 4) p.userData.vz *= -1;
      });
    }

    waveRenderer.render(waveScene, waveCamera);
  }

  window.addEventListener("DOMContentLoaded", initWaveCanvas);
  setTimeout(initWaveCanvas, 600);
})();




// ==========================================
// 3. THREE.JS 3D HOLOGRAPHIC PROTOCOL GLOBE
// Award-Winning Rotating Protocol Sphere
// ==========================================
(function() {
  var protocolData = { TCP: 64, UDP: 22, ICMP: 9, HTTP: 5 };

  window.renderProtocolRadar = function(data) {
    if (data && typeof data === "object") {
      protocolData = data;
      rebuildGlobeArcs();
      var pBars = document.getElementById("protocol-bars");
      if (pBars) {
        pBars.innerHTML = "";
        var colors2 = { TCP: "#00c8d4", UDP: "#c49a28", ICMP: "#ff3366", HTTP: "#7b4fcf", Other: "#64748b" };
        for (var k in data) {
          var badge = document.createElement("div");
          badge.style.cssText = "display:inline-flex;align-items:center;gap:6px;background:rgba(4,9,20,0.8);border:1px solid " + (colors2[k] || "#64748b") + ";border-radius:6px;padding:4px 10px;font-family:var(--font-mono,monospace);font-size:10px;color:#f8fafc;box-shadow:0 0 10px rgba(0, 200, 212, 0.07);";
          badge.innerHTML = "<span style='width:6px;height:6px;border-radius:50%;background:" + (colors2[k] || "#64748b") + ";box-shadow:0 0 6px " + (colors2[k] || "#64748b") + ";'></span> " + k + ": <strong>" + data[k] + "%</strong>";
          pBars.appendChild(badge);
        }
      }
    }
  };

  var globeRenderer, globeScene, globeCamera, globeClock;
  var globeGroup, arcGroup, pulseRings;
  var outerAtmo, innerGlobe;

  function initGlobeCanvas() {
    var canvas = document.getElementById("protocol-radar-canvas");
    if (!canvas || typeof THREE === "undefined") return;

    var W = canvas.clientWidth || 300;
    var H = canvas.clientHeight || 320;

    globeRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    canvas.addEventListener('webglcontextlost', function(e){ e.preventDefault(); }, false);
    window.__ZB_3D_STATE__.globeRenderer = globeRenderer;
    globeRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
    globeRenderer.setSize(W, H);
    globeRenderer.setClearColor(0x000000, 0);

    globeScene = new THREE.Scene();
    globeCamera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    globeCamera.position.set(0, 0, 5.8);
    globeClock = new THREE.Timer();

    // Lights
    var sunLight2 = new THREE.DirectionalLight(0x00c8d4, 2.2);
    sunLight2.position.set(5, 5, 5);
    globeScene.add(sunLight2);
    globeScene.add(new THREE.AmbientLight(0x0a0f1e, 0.8));
    var pinkLight2 = new THREE.PointLight(0xc49a28, 3, 12);
    pinkLight2.position.set(-3, 2, 3);
    globeScene.add(pinkLight2);
    var violetLight2 = new THREE.PointLight(0x7b4fcf, 2, 10);
    violetLight2.position.set(3, -2, 2);
    globeScene.add(violetLight2);

    globeGroup = new THREE.Group();
    globeScene.add(globeGroup);

    // ---- Core holographic globe ----
    var coreGeo = new THREE.SphereGeometry(1.45, 48, 48);
    // Canvas texture for globe surface
    var globeCanvas = document.createElement("canvas");
    globeCanvas.width = 512;
    globeCanvas.height = 512;
    var gc = globeCanvas.getContext("2d");
    var gGrad = gc.createRadialGradient(256, 256, 40, 256, 256, 256);
    gGrad.addColorStop(0, "rgba(0, 30, 50, 0.9)");
    gGrad.addColorStop(0.5, "rgba(0, 15, 30, 0.95)");
    gGrad.addColorStop(1, "rgba(0, 5, 15, 0.98)");
    gc.fillStyle = gGrad;
    gc.fillRect(0, 0, 512, 512);
    // Hex grid pattern on sphere
    gc.strokeStyle = "rgba(0, 200, 212, 0.08)";
    gc.lineWidth = 1;
    for (var hx = 0; hx < 512; hx += 28) {
      for (var hy = 0; hy < 512; hy += 24) {
        var ox = (hy % 48 === 0) ? 0 : 14;
        gc.beginPath();
        for (var hd = 0; hd < 6; hd++) {
          var hangle = (hd * Math.PI) / 3;
          var hpx = hx + ox + Math.cos(hangle) * 13;
          var hpy = hy + Math.sin(hangle) * 13;
          if (hd === 0) gc.moveTo(hpx, hpy); else gc.lineTo(hpx, hpy);
        }
        gc.closePath();
        gc.stroke();
      }
    }
    var globeTex = new THREE.CanvasTexture(globeCanvas);
    var coreMat = new THREE.MeshPhongMaterial({
      map: globeTex,
      transparent: true,
      opacity: 0.9,
      shininess: 60,
      specular: new THREE.Color(0x004466)
    });
    innerGlobe = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(innerGlobe);

    // ---- Wireframe overlay ----
    var wireGeo2 = new THREE.SphereGeometry(1.455, 24, 24);
    var wireMat2 = new THREE.MeshBasicMaterial({ color: 0x00c8d4, wireframe: true, transparent: true, opacity: 0.12 });
    globeGroup.add(new THREE.Mesh(wireGeo2, wireMat2));

    // ---- Atmospheric outer glow ----
    var atmoGeo = new THREE.SphereGeometry(1.62, 32, 32);
    var atmoMat = new THREE.ShaderMaterial({
      vertexShader: "varying vec3 vN; void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader: "varying vec3 vN; void main(){float i=pow(0.65-dot(vN,vec3(0.,0.,1.)),2.8);gl_FragColor=vec4(0.,0.9,1.,1.)*i*1.2;}",
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
    });
    outerAtmo = new THREE.Mesh(atmoGeo, atmoMat);
    globeGroup.add(outerAtmo);

    // ---- Equatorial data ring ----
    var eqRingGeo = new THREE.TorusGeometry(1.58, 0.008, 8, 96);
    var eqRingMat = new THREE.MeshBasicMaterial({ color: 0x00c8d4, transparent: true, opacity: 0.6 });
    var eqRing = new THREE.Mesh(eqRingGeo, eqRingMat);
    eqRing.rotation.x = Math.PI / 2;
    globeGroup.add(eqRing);

    // ---- Orbiting scanner ring ----
    var scanGroup = new THREE.Group();
    scanGroup.rotation.x = Math.PI / 3.5;
    globeGroup.add(scanGroup);
    var scanGeo = new THREE.TorusGeometry(2.1, 0.015, 8, 80);
    var scanMat = new THREE.MeshBasicMaterial({ color: 0x00c8d4, transparent: true, opacity: 0.4 });
    scanGroup.add(new THREE.Mesh(scanGeo, scanMat));
    // Scan dot
    var sdotGeo = new THREE.SphereGeometry(0.07, 8, 8);
    var sdotMat = new THREE.MeshBasicMaterial({ color: 0x00c8d4 });
    var sdot = new THREE.Mesh(sdotGeo, sdotMat);
    sdot.position.set(2.1, 0, 0);
    scanGroup.add(sdot);
    scanGroup.userData = { sdot: sdot, angle: 0 };
    globeGroup.userData = { scanGroup: scanGroup };

    // ---- Pulsing rings at equator ----
    pulseRings = [];
    for (var pr = 0; pr < 3; pr++) {
      var prGeo = new THREE.RingGeometry(1.55, 1.58, 48);
      var prMat = new THREE.MeshBasicMaterial({ color: 0x00c8d4, transparent: true, opacity: 0.0, side: THREE.DoubleSide });
      var prMesh = new THREE.Mesh(prGeo, prMat);
      prMesh.rotation.x = Math.PI / 2;
      prMesh.userData = { phase: (pr / 3) * Math.PI * 2 };
      globeScene.add(prMesh);
      pulseRings.push(prMesh);
    }

    // ---- Arc group (protocol distribution) ----
    arcGroup = new THREE.Group();
    globeGroup.add(arcGroup);
    rebuildGlobeArcs();

    // ---- Data node dots on surface ----
    var dotColors = [0x00c8d4, 0xe8af63, 0xc49a28, 0x7b4fcf, 0x22c55e, 0xfbbf24];
    for (var dn = 0; dn < 22; dn++) {
      var phi2 = Math.acos(2 * Math.random() - 1);
      var theta2 = Math.random() * Math.PI * 2;
      var dnGeo = new THREE.SphereGeometry(0.042, 8, 8);
      var dnMat = new THREE.MeshBasicMaterial({
        color: dotColors[Math.floor(Math.random() * dotColors.length)],
        transparent: true, opacity: 0.85
      });
      var dnMesh = new THREE.Mesh(dnGeo, dnMat);
      dnMesh.position.set(
        1.48 * Math.sin(phi2) * Math.cos(theta2),
        1.48 * Math.cos(phi2),
        1.48 * Math.sin(phi2) * Math.sin(theta2)
      );
      dnMesh.userData = { phase: Math.random() * Math.PI * 2 };
      globeGroup.add(dnMesh);
    }

    window.addEventListener("resize", function() {
      var W2 = canvas.clientWidth || 300;
      var H2 = canvas.clientHeight || 320;
      globeCamera.aspect = W2 / H2;
      globeCamera.updateProjectionMatrix();
      globeRenderer.setSize(W2, H2);
    });

    animateGlobe();
  }

  function rebuildGlobeArcs() {
    if (!arcGroup) return;
    while (arcGroup.children.length) arcGroup.remove(arcGroup.children[0]);

    var arcColors2 = { TCP: 0x00c8d4, UDP: 0xc49a28, ICMP: 0xff3366, HTTP: 0x7b4fcf, Other: 0x64748b };
    var arcRadii = { TCP: 1.65, UDP: 1.78, ICMP: 1.91, HTTP: 2.04, Other: 2.17 };
    var arcWidths = { TCP: 0.028, UDP: 0.024, ICMP: 0.020, HTTP: 0.016, Other: 0.013 };
    var keys = Object.keys(protocolData);

    keys.forEach(function(key, ki) {
      var pct = protocolData[key] || 0;
      var arcLen = (pct / 100) * Math.PI * 2;
      var r = arcRadii[key] || (1.65 + ki * 0.13);
      var w = arcWidths[key] || 0.018;
      var col = arcColors2[key] || 0x64748b;
      var tileAngle = -Math.PI / 2;

      var arcGeo = new THREE.TorusGeometry(r, w, 8, 96, arcLen);
      var arcMat = new THREE.MeshBasicMaterial({
        color: col, transparent: true, opacity: 0.9
      });
      var arcMesh = new THREE.Mesh(arcGeo, arcMat);
      arcMesh.rotation.x = Math.PI / 2 + ki * 0.22;
      arcMesh.rotation.y = tileAngle;
      arcMesh.userData = { phase: ki * 1.2, col: col };
      arcGroup.add(arcMesh);

      // Glow duplicate
      var glowArcMat = new THREE.MeshBasicMaterial({
        color: col, transparent: true, opacity: 0.25
      });
      var glowArcGeo = new THREE.TorusGeometry(r + 0.06, w * 2.5, 8, 96, arcLen);
      var glowArc = new THREE.Mesh(glowArcGeo, glowArcMat);
      glowArc.rotation.x = arcMesh.rotation.x;
      glowArc.rotation.y = arcMesh.rotation.y;
      arcGroup.add(glowArc);
    });
  }

  function animateGlobe() {
    window.__ZB_3D_STATE__.globeAnimId = requestAnimationFrame(animateGlobe);
    globeClock.update();
    var t2 = globeClock.getElapsed();

    // Globe auto-rotate
    if (innerGlobe) innerGlobe.rotation.y = t2 * 0.22;
    globeGroup.rotation.y = t2 * 0.18;
    globeGroup.rotation.x = Math.sin(t2 * 0.12) * 0.12;

    // Scanner ring orbit
    var sg = globeGroup.userData.scanGroup;
    if (sg) {
      sg.rotation.z = t2 * 1.4;
      var sdotLocal = sg.userData.sdot;
      if (sdotLocal) {
        sdotLocal.material.opacity = 0.6 + 0.4 * Math.sin(t2 * 5);
      }
    }

    // Pulsing rings
    pulseRings.forEach(function(ring) {
      var sc2 = 1 + 0.6 * ((Math.sin(t2 * 2.2 + ring.userData.phase) + 1) / 2);
      ring.scale.set(sc2, sc2, sc2);
      ring.material.opacity = 0.5 * (1 - (sc2 - 1) / 0.6);
    });

    // Arc glow animation
    if (arcGroup) {
      arcGroup.children.forEach(function(arc) {
        if (arc.userData.phase !== undefined) {
          arc.material.opacity = 0.6 + 0.4 * Math.sin(t2 * 1.8 + arc.userData.phase);
        }
      });
    }

    // Camera gentle orbit
    globeCamera.position.x = Math.sin(t2 * 0.14) * 0.6;
    globeCamera.position.y = Math.cos(t2 * 0.1) * 0.5;
    globeCamera.lookAt(0, 0, 0);

    globeRenderer.render(globeScene, globeCamera);
  }

  window.addEventListener("DOMContentLoaded", initGlobeCanvas);
  setTimeout(initGlobeCanvas, 700);
})();



// ==========================================
// 4. REAL-TIME THREAT FREQUENCY SPECTRUM (LIVE BACKEND TELEMETRY)
// ==========================================
(function() {
  function initSpectrum() {
    const canvas = document.getElementById("threat-spectrum-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const summaryEl = document.getElementById("threat-spectrum-summary");
    const dominantEl = document.getElementById("threat-spectrum-dominant");
    const statusBadge = document.getElementById("threat-spectrum-status-badge");
    const tooltipEl = document.getElementById("threat-spectrum-tooltip");
    const container = document.getElementById("threat-spectrum-container");

    const barCount = 28;
    const currentHeights = new Array(barCount).fill(6);
    const targetHeights = new Array(barCount).fill(6);
    const peakHeights = new Array(barCount).fill(6);
    const peakHoldCounters = new Array(barCount).fill(0);
    const channelCounts = new Array(barCount).fill(0);
    let channelDefs = [];
    let hoveredBar = -1;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
    window.addEventListener("resize", resize);
    resize();

    // Fetch real live telemetry from backend
    async function fetchSpectrumData() {
      try {
        const headers = window.getAuthHeaders ? window.getAuthHeaders() : {};
        const res = await fetch(window.apiUrl("/api/dashboard/threat-spectrum"), { headers });
        if (!res.ok) return;
        const data = await res.json();
        
        if (data && data.amplitudes && Array.isArray(data.amplitudes)) {
          const rect = canvas.getBoundingClientRect();
          const h = rect.height > 0 ? rect.height : 86;
          
          channelDefs = data.channel_defs || [];
          
          for (let b = 0; b < barCount; b++) {
            const amp = data.amplitudes[b] !== undefined ? data.amplitudes[b] : 0.06;
            targetHeights[b] = Math.max(6, amp * (h - 14));
            channelCounts[b] = (data.raw_counts && data.raw_counts[b] !== undefined) ? data.raw_counts[b] : 0;
          }

          if (summaryEl) {
            summaryEl.textContent = "[SAMPLED: " + data.total_sampled + " FLOWS // PEAK: CH " + ((data.peak_channel || 0) + 1) + " " + (data.peak_name || '') + "]";
          }

          if (dominantEl && data.dominant_band) {
            const bandMap = {
              "CRITICAL_ANOMALIES": { text: "CRITICAL", bg: "rgba(255,0,85,0.15)", col: "#ff0055", border: "rgba(255,0,85,0.3)" },
              "SUSPICIOUS_PROBES": { text: "SUSPICIOUS", bg: "rgba(168,85,247,0.15)", col: "#a855f7", border: "rgba(168,85,247,0.3)" },
              "BASELINE_TRAFFIC": { text: "BASELINE", bg: "rgba(56,189,248,0.15)", col: "#38bdf8", border: "rgba(56,189,248,0.3)" },
              "LOW_RISK_BAND": { text: "NOMINAL", bg: "rgba(0,200,212,0.15)", col: "#00c8d4", border: "rgba(0,200,212,0.3)" }
            };
            const bandInfo = bandMap[data.dominant_band] || bandMap["CRITICAL_ANOMALIES"];
            dominantEl.textContent = bandInfo.text;
            dominantEl.style.background = bandInfo.bg;
            dominantEl.style.color = bandInfo.col;
            dominantEl.style.borderColor = bandInfo.border;
          }

          if (statusBadge) {
            statusBadge.style.color = "#00c8d4";
            statusBadge.style.borderColor = "rgba(0,200,212,0.4)";
          }
        }
      } catch (err) {
        console.warn("Spectrum telemetry sync notice:", err);
      }
    }

    // Initial fetch + recurring poll every 2.5s for real live data
    fetchSpectrumData();
    setInterval(fetchSpectrumData, 2500);

    // Interactive mouse hover
    if (canvas && container && tooltipEl) {
      canvas.addEventListener("mousemove", function(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const w = rect.width;
        const barWidth = (w - (barCount * 4)) / barCount;
        
        let foundIdx = -1;
        for (let b = 0; b < barCount; b++) {
          const x = b * (barWidth + 4);
          if (mouseX >= x && mouseX <= x + barWidth) {
            foundIdx = b;
            break;
          }
        }
        hoveredBar = foundIdx;
        if (foundIdx >= 0) {
          const def = channelDefs[foundIdx] || { id: foundIdx + 1, name: "CHANNEL_" + (foundIdx + 1), band: "TELEMETRY" };
          const cnt = channelCounts[foundIdx] || 0;
          tooltipEl.innerHTML = "<strong>CH " + (foundIdx + 1) + ": " + def.name + "</strong><br/><span style='color:#64748b;'>" + def.band + "</span> &bull; <strong>" + cnt + "</strong> flows";
          tooltipEl.style.display = "block";
          const tipX = Math.min(rect.width - 150, Math.max(8, mouseX - 60));
          tooltipEl.style.left = tipX + "px";
          tooltipEl.style.top = "6px";
        } else {
          tooltipEl.style.display = "none";
        }
      });

      canvas.addEventListener("mouseleave", function() {
        hoveredBar = -1;
        tooltipEl.style.display = "none";
      });
    }

    function drawSpectrum() {
      requestAnimationFrame(drawSpectrum);

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w <= 0 || h <= 0) return;

      ctx.clearRect(0, 0, w, h);

      const barWidth = (w - (barCount * 4)) / barCount;

      for (let b = 0; b < barCount; b++) {
        const x = b * (barWidth + 4);
        
        // Physics easing: smoothly interpolate toward real target height (NO SINE OSCILLATION)
        currentHeights[b] += (targetHeights[b] - currentHeights[b]) * 0.12;
        const barH = currentHeights[b];
        const y = h - barH;

        // Peak Hold logic
        if (barH >= peakHeights[b]) {
          peakHeights[b] = barH;
          peakHoldCounters[b] = 35; // Hold peak for ~35 frames
        } else {
          if (peakHoldCounters[b] > 0) {
            peakHoldCounters[b]--;
          } else {
            peakHeights[b] = Math.max(barH, peakHeights[b] - 0.7); // Smooth decay
          }
        }

        const peakY = h - peakHeights[b];

        // Band-specific styling
        let baseColor, gradStart, gradEnd, isHovered = (hoveredBar === b);
        if (b >= 21) {
          // Critical Anomalies (CH 22 - 28)
          baseColor = "#ff0055";
          gradStart = isHovered ? "rgba(255, 0, 85, 0.95)" : "rgba(255, 0, 85, 0.85)";
          gradEnd = "rgba(255, 0, 85, 0.15)";
        } else if (b >= 14) {
          // Suspicious Probes (CH 15 - 21)
          baseColor = "#a855f7";
          gradStart = isHovered ? "rgba(168, 85, 247, 0.95)" : "rgba(168, 85, 247, 0.8)";
          gradEnd = "rgba(168, 85, 247, 0.15)";
        } else if (b >= 7) {
          // Baseline Traffic (CH 8 - 14)
          baseColor = "#38bdf8";
          gradStart = isHovered ? "rgba(56, 189, 248, 0.95)" : "rgba(56, 189, 248, 0.8)";
          gradEnd = "rgba(56, 189, 248, 0.12)";
        } else {
          // Low Risk Band (CH 1 - 7)
          baseColor = "#00c8d4";
          gradStart = isHovered ? "rgba(0, 200, 212, 0.95)" : "rgba(0, 200, 212, 0.8)";
          gradEnd = "rgba(0, 200, 212, 0.1)";
        }

        // Draw frequency bar
        const grad = ctx.createLinearGradient(0, y, 0, h);
        grad.addColorStop(0, gradStart);
        grad.addColorStop(1, gradEnd);

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barH);

        // Highlight stroke if hovered
        if (isHovered) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, barWidth, barH);
        }

        // Peak Hold LED cap
        ctx.fillStyle = isHovered ? "#ffffff" : baseColor;
        ctx.fillRect(x, Math.max(0, peakY - 3), barWidth, 2);
      }
    }

    drawSpectrum();
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initSpectrum);
  } else {
    initSpectrum();
  }
})();

// ==========================================
// 5. INTERACTIVE STARLIGHT CYBER CURSOR
// ==========================================
(function() {
  const dot = document.getElementById("cyber-cursor-dot");
  const ring = document.getElementById("cyber-cursor-ring");
  if (!dot || !ring) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener("mousemove", function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + "px";
    dot.style.top = mouseY + "px";
  });

  function animateCursor() {
    requestAnimationFrame(animateCursor);
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = ringX + "px";
    ring.style.top = ringY + "px";
  }
  animateCursor();

  document.addEventListener("mouseover", function(e) {
    if (e.target.closest("button, a, input, select, .chart-card, .feed-card, .chip, .cyber-panel")) {
      ring.classList.add("active");
    } else {
      ring.classList.remove("active");
    }
  });
})();


// ========================================
// COSMOS SCROLL ZONE VISUAL HINT
// Shows top hint bar when in cosmos-scroll zone
// ========================================
(function() {
  var hint = document.getElementById("cosmos-scroll-hint");
  var scrollCue = document.querySelector(".scroll-cue");
  window.addEventListener("scroll", function() {
    var scrollY = window.scrollY || document.documentElement.scrollTop;
    var heroH = window.innerHeight;
    if (hint) {
      if (scrollY < heroH * 0.5) {
        hint.classList.add("active");
      } else {
        hint.classList.remove("active");
      }
    }
    // Fade scroll cue on first scroll
    if (scrollCue && scrollY > 50) {
      scrollCue.style.opacity = "0";
      scrollCue.style.transition = "opacity 0.6s ease";
    }
  }, { passive: true });
})();

// Auto-initialize Cosmos background once Three.js is loaded
window.addEventListener("DOMContentLoaded", function() {
  if (typeof initCosmosBackground === "function") {
    initCosmosBackground();
  }
});
setTimeout(function() {
  if (typeof initCosmosBackground === "function") {
    initCosmosBackground();
  }
}, 800);

})();
