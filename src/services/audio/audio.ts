import type { Settings } from '../storage/storage';
import { audioConfig, type Sound } from './config';

class AudioService {
  private context?: AudioContext;
  private settings: Pick<Settings, 'effects' | 'effectVolume' | 'music' | 'musicVolume'> = { effects: true, effectVolume: 0.5, music: false, musicVolume: 0.5 };
  private files = new Map<Sound, HTMLAudioElement>();
  private attempted = new Set<Sound>();
  private active = new Map<OscillatorNode, Sound>();
  private music?: HTMLAudioElement;
  private musicFailed = false;
  private generation = 0;
  configure(settings: Settings) {
    this.settings = settings;
    if (!settings.effects) this.stopEffects();
    if (this.music) { this.music.volume = settings.musicVolume; if (!settings.music) this.music.pause(); }
  }
  unlock() {
    try {
      this.context ??= new AudioContext();
      void this.context.resume().catch(() => {});
      for (const [name, path] of Object.entries(audioConfig.effects)) {
        const sound = name as Sound;
        if (this.attempted.has(sound)) continue;
        this.attempted.add(sound);
        const file = new Audio(`${import.meta.env.BASE_URL}${path}`);
        file.preload = 'auto';
        file.addEventListener('canplaythrough', () => this.files.set(sound, file), { once: true });
        file.addEventListener('error', () => this.files.delete(sound), { once: true });
        file.load();
      }
      if (audioConfig.music && !this.music && !this.musicFailed) {
        this.music = new Audio(`${import.meta.env.BASE_URL}${audioConfig.music}`);
        this.music.loop = true;
        this.music.addEventListener('error', () => { this.musicFailed = true; this.music?.pause(); }, { once: true });
      }
      if (this.settings.music && this.music && !this.musicFailed) {
        this.music.volume = this.settings.musicVolume;
        void this.music.play().catch(() => {});
      }
    } catch { /* Audio is optional, including in browsers that deny access. */ }
  }
  play(sound: Sound) {
    if (!this.settings.effects || this.settings.effectVolume === 0 || document.hidden) return;
    const file = this.files.get(sound);
    if (file && file.readyState >= 3) {
      const generation = this.generation;
      file.currentTime = 0;
      file.volume = this.settings.effectVolume;
      void file.play().catch(() => {
        if (generation === this.generation) this.synthesize(sound);
      });
      return;
    }
    this.synthesize(sound);
  }
  private synthesize(sound: Sound) {
    if (!this.settings.effects || this.settings.effectVolume === 0 || document.hidden) return;
    try {
      const ctx = this.context;
      if (!ctx || ctx.state !== 'running') return;
      const frequencies: Record<Sound, number> = { ui: 950, click: 450, correct: 660, error: 180, record: 880, simon0: 262, simon1: 330, simon2: 392, simon3: 523 };
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const duration = sound === 'ui' ? 0.045 : sound.startsWith('simon') ? 0.36 : 0.13;
      oscillator.frequency.value = frequencies[sound];
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(this.settings.effectVolume * (sound === 'ui' ? 0.09 : 0.25), ctx.currentTime + (sound === 'ui' ? 0.004 : 0.015));
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      oscillator.connect(gain); gain.connect(ctx.destination);
      this.active.set(oscillator, sound);
      oscillator.onended = () => { this.active.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(); oscillator.stop(ctx.currentTime + duration + 0.01);
    } catch { /* Playback failures must never interrupt a round. */ }
  }
  stopEffects({ preserveUi = false }: { preserveUi?: boolean } = {}) {
    this.generation++;
    for (const [node, sound] of this.active) {
      if (preserveUi && sound === 'ui') continue;
      try { node.stop(); } catch { /* Already stopped. */ }
      this.active.delete(node);
    }
    for (const [sound, file] of this.files) if (!preserveUi || sound !== 'ui') file.pause();
  }
  pause(options?: { preserveUi?: boolean }) { this.stopEffects(options); this.music?.pause(); }
}
export const audio = new AudioService();
