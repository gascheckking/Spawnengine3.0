// MeshCore.ts — Handles XP, feed, and cross-chain state.

export class MeshCore {
  private xp = 1575;
  private spawn = 497;
  private feed: string[] = [];
  private listeners: Record<string, Function[]> = {};

  on(event: string, callback: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event: string, data: any) {
    (this.listeners[event] || []).forEach(cb => cb(data));
  }

  getStats() {
    return { xp: this.xp, spawn: this.spawn, events: this.feed.length };
  }

  pushEvent(event: string) {
  this.feed.unshift(event);
  if (this.feed.length > 50) {
    this.feed.pop(); // Rensa äldre event
  }
  this.emit("feedUpdate", event);
}

  gainXP(amount: number, reason = "action") {
    this.xp += amount;
    this.pushEvent(`XP +${amount} (${reason})`);
    this.emit("xpUpdate", this.xp);
  }

  getFeed() {
    return this.feed;
  }
}

export const meshCore = new MeshCore();