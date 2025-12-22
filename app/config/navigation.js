// /app/config/navigation.js
import { FaBolt, FaFlask, FaCubes, FaUserAstronaut, FaChartLine, FaSatellite } from "react-icons/fa";

export const NAVIGATION = [
  {
    id: "dashboard",
    label: "HUD",
    icon: FaChartLine,
    path: "/dashboard",
    description: "Overview of XP, Spawn tokens and chain activity",
  },
  {
    id: "packs",
    label: "Packs",
    icon: FaCubes,
    path: "/packs",
    description: "Open, manage and mint reward packs",
  },
  {
    id: "quests",
    label: "Quests",
    icon: FaBolt,
    path: "/quests",
    description: "Daily tasks and rewards to boost your XP streak",
  },
  {
    id: "forge",
    label: "Forge",
    icon: FaFlask,
    path: "/forge",
    description: "Creator tools for minting, staking and XP crafting",
  },
  {
    id: "mesh",
    label: "Mesh",
    icon: FaSatellite,
    path: "/mesh",
    description: "Cross-app mesh linking & Base onchain sync",
  },
  {
    id: "profile",
    label: "Profile",
    icon: FaUserAstronaut,
    path: "/profile",
    description: "Your wallet, stats, and onchain reputation",
  },
];

export const NAVBAR_SETTINGS = {
  position: "bottom",
  theme: "glass", // glass | solid | transparent
  activeColor: "#00E0FF",
  inactiveColor: "#9BA0B4",
  background: "rgba(10, 15, 31, 0.85)",
  borderTop: "1px solid rgba(255, 255, 255, 0.05)",
  shadow: "0 -8px 25px rgba(0, 224, 255, 0.15)",
};

export default { NAVIGATION, NAVBAR_SETTINGS };
