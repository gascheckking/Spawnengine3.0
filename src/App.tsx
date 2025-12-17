import React, { useState, useEffect } from "react";
import { MeshBackground } from "./components/MeshBackground";
import { HUDStats } from "./components/HUDStats";
import { DailyRitual } from "./components/DailyRitual";
import { FactoryAI } from "./components/FactoryAI";
import { SpawnBotPanel } from "./components/SpawnBotPanel";
import { Roadmap } from "./components/Roadmap";
import { meshCore } from "./core/mesh-core";

export default function App() {
  const [tab, setTab] = useState("home");
  const [feed, setFeed] = useState<string[]>(meshCore.getFeed());

  useEffect(() => {
    meshCore.on("feedUpdate", () => setFeed([...meshCore.getFeed()]));
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-950 text-gray-100 font-inter overflow-hidden">
      <MeshBackground />
      <div className="relative z-10 p-4">
        <header className="flex justify-between items-center py-3 border-b border-gray-800">
          <h1 className="text-xl font-extrabold tracking-tight">SpawnEngine · Mesh OS</h1>
          <div className="flex space-x-2">
            <button className="px-3 py-1 rounded bg-indigo-600 text-white font-semibold">Connect Wallet</button>
          </div>
        </header>

        <nav className="flex space-x-2 text-sm font-medium mt-3 border-b border-gray-800 pb-2">
          {["home", "factory", "bot", "roadmap"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded ${tab === t ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>

        <main className="mt-6 space-y-6">
          {tab === "home" && (
            <>
              <HUDStats />
              <DailyRitual />
              <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800">
                <h3 className="text-sm font-semibold mb-2 text-gray-300">Activity Feed</h3>
                <ul className="text-xs text-gray-400 space-y-1 font-mono">
                  {feed.map((e, i) => (
                    <li key={i}>→ {e}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
          {tab === "factory" && <FactoryAI />}
          {tab === "bot" && <SpawnBotPanel />}
          {tab === "roadmap" && <Roadmap />}
        </main>
      </div>
    </div>
  );
}