// Audio prosedural via Web Audio API (mengikuti panduan skill game-engine:
// OscillatorNode untuk musik & SFX, GainNode untuk amplop/volume).
// Tanpa file audio berhak cipta — semua nada disintesis saat runtime.
// AudioContext harus dimulai dari gestur pengguna (tombol "Mulai Bermain").

class AudioManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private muted = false;
  private melodyTimer: number | null = null;

  // melodi ceria (pentatonik) — kesan riang khas perayaan
  private readonly melody = [659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 523.25, 587.33];
  private readonly bass = [130.81, 0, 196.0, 0, 174.61, 0, 130.81, 0];
  private readonly beat = 0.26; // detik per nada

  /** Dipanggil dari gestur pengguna (klik tombol). Aman dipanggil berulang. */
  start() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx();
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.muted ? 0 : 0.1;
      this.musicGain.connect(this.ctx.destination);
    }
    void this.ctx.resume();
    if (this.melodyTimer === null) this.scheduleBar();
  }

  private note(freq: number, start: number, dur: number, dest: AudioNode, type: OscillatorType, vol: number) {
    if (!this.ctx || freq <= 0) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(vol, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g);
    g.connect(dest);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }

  /** Jadwalkan satu birama melodi+bass, lalu ulang menjelang selesai (loop). */
  private scheduleBar() {
    if (!this.ctx || !this.musicGain) return;
    const t0 = this.ctx.currentTime + 0.05;
    this.melody.forEach((f, i) => this.note(f, t0 + i * this.beat, this.beat * 0.9, this.musicGain!, 'triangle', 0.5));
    this.bass.forEach((f, i) => this.note(f, t0 + i * this.beat, this.beat * 0.9, this.musicGain!, 'sine', 0.6));
    const barLen = this.melody.length * this.beat;
    this.melodyTimer = window.setTimeout(() => this.scheduleBar(), barLen * 1000 - 60);
  }

  // ---- Efek suara (lewat destination langsung, tak terpengaruh volume musik) ----
  private blip(freqs: number[], step: number, type: OscillatorType, vol: number) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + 0.02;
    freqs.forEach((f, i) => this.note(f, t0 + i * step, step * 1.6, this.ctx!.destination, type, vol));
  }

  /** Nada naik ceria saat mengunjungi tempat. */
  sfxVisit() {
    this.blip([523.25, 659.25, 783.99, 1046.5], 0.08, 'square', 0.16);
  }

  /** Blip singkat saat NPC menyapa. */
  sfxTalk() {
    this.blip([587.33, 783.99], 0.07, 'triangle', 0.12);
  }

  /** Fanfare kemenangan. */
  sfxWin() {
    this.blip([523.25, 659.25, 783.99, 1046.5, 1046.5, 1318.51], 0.13, 'square', 0.18);
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.muted ? 0 : 0.1, this.ctx.currentTime, 0.02);
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }
}

// singleton dipakai lintas scene
export const audio = new AudioManager();
