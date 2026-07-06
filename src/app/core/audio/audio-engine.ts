import { Injectable } from '@angular/core';
import { midiToFreq } from '../music';

/** Small Juno-style Web Audio synth: two detuned saws through a low-pass filter. */
@Injectable({ providedIn: 'root' })
export class AudioEngine {
  private ctx: AudioContext | null = null;

  private context(): AudioContext {
    this.ctx ??= new AudioContext();
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  now(): number {
    return this.context().currentTime;
  }

  playNote(midi: number, at?: number, duration = 0.8, gain = 0.16): void {
    const ctx = this.context();
    const t = at ?? ctx.currentTime + 0.03;

    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0, t);
    amp.gain.linearRampToValueAtTime(gain, t + 0.015);
    amp.gain.setTargetAtTime(0, t + duration * 0.6, duration * 0.25);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2600, t);
    filter.frequency.exponentialRampToValueAtTime(700, t + duration);
    filter.Q.value = 0.8;

    for (const detune of [-6, 6]) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = midiToFreq(midi);
      osc.detune.value = detune;
      osc.connect(filter);
      osc.start(t);
      osc.stop(t + duration + 0.3);
    }

    filter.connect(amp);
    amp.connect(ctx.destination);
  }

  playChord(midis: readonly number[], at?: number): void {
    const t = at ?? this.now() + 0.03;
    for (const midi of midis) {
      this.playNote(midi, t, 1.1, 0.13);
    }
  }

  playSequence(midis: readonly number[], stepSeconds = 0.22): void {
    const t0 = this.now() + 0.05;
    midis.forEach((midi, i) => this.playNote(midi, t0 + i * stepSeconds, 0.35, 0.15));
  }

  playProgression(chords: readonly (readonly number[])[], stepSeconds = 0.85): void {
    const t0 = this.now() + 0.05;
    chords.forEach((midis, i) => this.playChord(midis, t0 + i * stepSeconds));
  }
}
