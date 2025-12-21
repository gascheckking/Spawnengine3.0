/* ============================================================
   SPAWNENGINE · Forge Terminal v1.0
   Command-line interface to ForgeAI & MeshKernel
   ============================================================ */

import { ForgeAI } from "./forge-ai.js";
import { MeshKernel } from "../kernel/mesh-kernel.js";
import { AutoBuilder } from "../kernel/autobuilder.js";

export const ForgeTerminal = {
  history: [],
  container: null,

  init(containerId = "forgeTerminal") {
    this.container = document.getElementById(containerId);
    if (!this.container) return console.warn("⚠️ ForgeTerminal: container missing");
    this.container.innerHTML = this.template();
    this.bindInput();
    console.log("💻 ForgeTerminal online");
  },

  template() {
    return `
      <div class="terminal-header">FORGE TERMINAL v1.0</div>
      <div id="terminalOutput" class="terminal-output">
        <div class="line">Welcome to SpawnEngine Forge Terminal.</div>
        <div class="line">Type <span class="cmd">/help</span> to see available commands.</div>
      </div>
      <div class="terminal-input">
        <span class="prompt">></span>
        <input id="terminalCmd" type="text" placeholder="Enter command..." autocomplete="off" />
      </div>
    `;
  },

  bindInput() {
    const input = document.getElementById("terminalCmd");
    const output = document.getElementById("terminalOutput");

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const cmd = input.value.trim();
        if (!cmd) return;
        this.history.push(cmd);
        this.handleCommand(cmd, output);
        input.value = "";
      }
    });
  },

  handleCommand(cmd, output) {
    const addLine = (text, cls = "") => {
      const div = document.createElement("div");
      div.className = `line ${cls}`;
      div.innerHTML = text;
      output.appendChild(div);
      output.scrollTop = output.scrollHeight;
    };

    addLine(`> ${cmd}`, "cmd");

    if (cmd === "/help") {
      addLine("Available commands:");
      addLine("<span class='cmd'>/help</span> — Show commands");
      addLine("<span class='cmd'>/build [name]</span> — Generate module idea");
      addLine("<span class='cmd'>/analyze kernel</span> — Show MeshKernel state");
      addLine("<span class='cmd'>/modules</span> — List registered modules");
      addLine("<span class='cmd'>/clear</span> — Clear terminal");
      return;
    }

    if (cmd.startsWith("/build")) {
      const name = cmd.split(" ")[1] || "UnnamedModule";
      const idea = {
        title: name,
        desc: "Auto-generated via terminal command.",
      };
      const module = ForgeAI.generateModuleSuggestion(idea);
      ForgeAI.state.generatedModules.push(module);
      addLine(`🧱 Module built: <b>${module.name}</b>`);
      return;
    }

    if (cmd === "/analyze kernel") {
      const state = MeshKernel.state;
      addLine(`🧠 Uptime: ${state.uptime}s`);
      addLine(`📊 Total Events: ${state.totalEvents}`);
      addLine(`🧩 Active Modules: ${Object.keys(state.modules).length}`);
      addLine(`💡 Last Update: ${new Date(state.lastUpdate).toLocaleTimeString()}`);
      return;
    }

    if (cmd === "/modules") {
      const mods = Object.keys(MeshKernel.state.modules);
      if (mods.length === 0) addLine("No modules registered.");
      else mods.forEach(m => addLine(`• ${m}`));
      return;
    }

    if (cmd === "/clear") {
      output.innerHTML = "";
      return;
    }

    addLine(`Unknown command: ${cmd}. Type /help`);
  },
};
window.ForgeTerminal = ForgeTerminal;
