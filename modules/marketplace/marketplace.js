// mock marketplace
import { MeshCore } from "../../core/MeshCore.js";
import { MeshBridge } from "../../core/mesh-bridge.js";

const list = document.getElementById("marketItems");
const items = [
  { id:1, name:"XP Boost Pack", cost:50, reward:"+10 XP" },
  { id:2, name:"Relic Synth Fuel", cost:120, reward:"+1 Relic" },
  { id:3, name:"Mesh Theme", cost:30, reward:"New Skin" }
];

items.forEach(i=>{
  const div=document.createElement("div");
  div.className="market-card";
  div.innerHTML=`<h3>${i.name}</h3><p>Cost: ${i.cost} XP</p><button>Buy</button>`;
  div.querySelector("button").onclick=()=>{
    if(MeshCore.state.xp>=i.cost){
      MeshCore.state.xp-=i.cost;
      MeshBridge.event("MARKET","Purchased "+i.name);
      alert(`Trade complete: ${i.reward}`);
    } else alert("Not enough XP");
  };
  list.appendChild(div);
});