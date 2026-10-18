import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Settings } from '../storage/storage';

const settings: Settings = { language: 'de', effects: true, effectVolume: 0.25, music: false, musicVolume: 0.2, textSize: 'normal' };

class FakeAudio extends EventTarget {
  readyState = 0;
  currentTime = 0;
  volume = 1;
  preload = '';
  loop = false;
  load = vi.fn();
  play = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  pause = vi.fn();
  constructor(readonly src: string) { super(); }
}

function installAudio() {
  const files: FakeAudio[] = [];
  const oscillators: { stop: ReturnType<typeof vi.fn> }[] = [];
  const createOscillator = vi.fn(() => {
    const node = { frequency: { value: 0 }, connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(), onended: null };
    oscillators.push(node);
    return node;
  });
  const context = {
    state: 'running', currentTime: 0, destination: {}, resume: vi.fn().mockResolvedValue(undefined), createOscillator,
    createGain: vi.fn(() => ({ connect: vi.fn(), disconnect: vi.fn(), gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() } })),
  };
  vi.stubGlobal('AudioContext', class { constructor() { return context; } });
  vi.stubGlobal('Audio', class { constructor(src: string) { const file = new FakeAudio(src); files.push(file); return file; } });
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  return { files, oscillators, context };
}

describe('optional audio and generated fallback', () => {
  beforeEach(() => { vi.resetModules(); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('uses immediate generated effects while loading or missing and only fetches a file once', async () => {
    const { files, context } = installAudio();
    const { audioConfig } = await import('./config');
    audioConfig.effects.correct = 'audio/missing.mp3';
    const { audio } = await import('./audio');
    audio.configure(settings);
    audio.unlock();
    expect(files).toHaveLength(1);
    expect(files[0]!.src).toBe(`${import.meta.env.BASE_URL}audio/missing.mp3`);
    expect(files[0]!.load).toHaveBeenCalledTimes(1);
    audio.play('correct');
    expect(context.createOscillator).toHaveBeenCalledTimes(1);
    files[0]!.dispatchEvent(new Event('error'));
    audio.unlock();
    audio.play('correct');
    audio.play('correct');
    expect(files).toHaveLength(1);
    expect(files[0]!.load).toHaveBeenCalledTimes(1);
    expect(files[0]!.play).not.toHaveBeenCalled();
    expect(context.createOscillator).toHaveBeenCalledTimes(3);
  });

  it('uses a ready local effect and falls back if playback is rejected', async () => {
    const { files, context } = installAudio();
    const { audioConfig } = await import('./config');
    audioConfig.effects.correct = 'audio/correct.mp3';
    const { audio } = await import('./audio');
    audio.configure(settings);
    audio.unlock();
    const file = files[0]!;
    file.readyState = 4;
    file.dispatchEvent(new Event('canplaythrough'));
    audio.play('correct');
    expect(file.play).toHaveBeenCalledTimes(1);
    expect(file.volume).toBe(settings.effectVolume);
    expect(context.createOscillator).not.toHaveBeenCalled();
    file.play.mockRejectedValueOnce(new Error('Playback rejected'));
    audio.play('correct');
    await Promise.resolve();
    expect(context.createOscillator).toHaveBeenCalledTimes(1);
  });

  it('keeps absent music silent and stops active effects on pause', async () => {
    const { files, oscillators, context } = installAudio();
    const { audio } = await import('./audio');
    audio.configure({ ...settings, music: true });
    audio.unlock();
    expect(files).toHaveLength(0);
    expect(context.createOscillator).not.toHaveBeenCalled();
    audio.play('simon0');
    audio.pause();
    expect(oscillators[0]!.stop).toHaveBeenLastCalledWith();
    audio.configure({ ...settings, effects: false });
    audio.play('correct');
    expect(context.createOscillator).toHaveBeenCalledTimes(1);
  });

  it('does not retry missing optional music after its first failure', async () => {
    const { files, context } = installAudio();
    const { audioConfig } = await import('./config');
    audioConfig.music = 'audio/missing-music.mp3';
    const { audio } = await import('./audio');
    audio.configure({ ...settings, music: true });
    audio.unlock();
    files[0]!.dispatchEvent(new Event('error'));
    audio.unlock();
    expect(files).toHaveLength(1);
    expect(files[0]!.play).toHaveBeenCalledTimes(1);
    expect(files[0]!.pause).toHaveBeenCalled();
    expect(context.createOscillator).not.toHaveBeenCalled();
  });

  it('does not start a late fallback after the game has paused', async () => {
    const { files, context } = installAudio();
    const { audioConfig } = await import('./config');
    audioConfig.effects.correct = 'audio/correct.mp3';
    const { audio } = await import('./audio');
    audio.unlock();
    const file = files[0]!;
    file.readyState = 4;
    file.dispatchEvent(new Event('canplaythrough'));
    file.play.mockRejectedValueOnce(new Error('Delayed playback rejection'));
    audio.play('correct');
    audio.pause();
    await Promise.resolve();
    expect(context.createOscillator).not.toHaveBeenCalled();
  });
});
