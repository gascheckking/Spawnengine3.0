/* ============================================================
   SPAWNENGINE · Mesh API Adapter v1.0
   Unifies mock/local data with future live endpoints
   ============================================================ */

import * as API from "./index.js";
import { SystemEvents } from "./system-events.js";

export const MeshAPIAdapter = {
  async getProfile() {
    const data = await API.getProfile();
    SystemEvents.log("PROFILE_LOADED", data);
    return data;
  },

  async openPack() {
    const result = API.simulatePackOpen();
    SystemEvents.log("PACK_OPEN", result);
    if (result.success) SystemEvents.xp("PACK_REWARD", 15);
    return result;
  },

  async synthesize() {
    const result = API.simulateSynthesis();
    SystemEvents.log("FORGE_SYNTH", result);
    if (result.success) SystemEvents.xp("RELIC_MINT", 25);
    return result;
  },

  async getMarket() {
    const listings = API.getMarketplaceListings();
    SystemEvents.log("MARKET_REFRESH", { count: listings.length });
    return listings;
  },

  async getFeed() {
    const feed = API.getHomeFeed();
    SystemEvents.log("FEED_UPDATE");
    return feed;
  },
};

if (typeof window !== "undefined") window.MeshAPIAdapter = MeshAPIAdapter;