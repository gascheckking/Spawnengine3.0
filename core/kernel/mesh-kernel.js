/* ============================================================
   SPAWNENGINE · SpawnMesh Kernel v1.0
   Core AI layer for modular Mesh evolution
   ============================================================ */

export const MeshKernel = {
  state: {
    uptime: 0,
    totalEvents: 0,
    modules: {},
    suggestions: [],
    lastUpdate: Date.now(),
  },

  init() {
    console.log("🧠 MeshKernel initialized");
    this.bootTime = Date.now();
    this.logEvent("Kernel initialized");
    this.startTicker();
  },

  startTicker() {
    setInterval(() => {
      this.state.uptime = Math.floor((Date.now() - this.bootTime) / 1000);
      if (this.state.uptime % 10 === 0) this.generateInsight();
    }, 1000);
  },

  logEvent(event) {
    this.state.totalEvents++;
    this.state.lastUpdate = Date.now();
    console.log(`⚙️ [Kernel] Event: ${event}`);
  },

  registerModule(name, version = "1.0") {
    this.state.modules[name] = { version, active: true, added: Date.now() };
    this.logEvent(`Module registered: ${name} v${version}`);
  },

  deactivateModule(name) {
    if (this.state.modules[name]) {
      this.state.modules[name].active = false;
      this.logEvent(`Module deactivated: ${name}`);
    }
  },

  generateInsight() {
    const total = Object.keys(this.state.modules).length;
    const insight = `System stable · ${total} modules active · ${this.state.totalEvents} events logged`;
    this.state.suggestions.push({
      id: Date.now(),
      text: insight,
      type: "status",
      ts: new Date().toLocaleTimeString(),
    });
    console.log(`🧩 [Insight] ${insight}`);
  },

  getInsights() {
    return this.state.suggestions.slice(-10);
  },
};
