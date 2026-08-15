/**
 * Luminous Celestial Voice Orb Visualizer
 * Uses the exact sky/cloud voice logo asset with audio-reactive lighting and ripple shaders
 */

class VoiceOrbVisualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.time = 0;
    this.intensity = 1.0;
    this.audioAmplitude = 0.0;
    this.isListening = true;
    this.animationFrameId = null;

    // Load exact logo asset
    this.logoImage = new Image();
    this.logoImage.src = 'assets/voice_logo.png';
    this.imageLoaded = false;
    this.logoImage.onload = () => {
      this.imageLoaded = true;
    };

    this.init();
  }

  init() {
    this.resize();
    this.start();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const size = (rect.width > 20) ? rect.width : 160;
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.ctx.scale(dpr, dpr);
    this.size = size;
  }

  setAmplitude(amp) {
    this.audioAmplitude = amp;
  }

  setListening(isListening) {
    this.isListening = isListening;
  }

  draw() {
    const ctx = this.ctx;
    const size = this.size;
    const center = size / 2;
    const radius = size * 0.45;

    ctx.clearRect(0, 0, size, size);
    this.time += 0.025;

    // Breathing & audio pulse
    const pulse = Math.sin(this.time * 2.2) * 0.025 + (this.audioAmplitude * 0.12);
    const dynamicRadius = radius * (1 + pulse);

    ctx.save();

    // 1. Outer Neon Aura Glow
    const glowGrad = ctx.createRadialGradient(center, center, dynamicRadius * 0.85, center, center, size * 0.5);
    glowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    glowGrad.addColorStop(0.6, 'rgba(29, 161, 242, 0.22)');
    glowGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(center, center, size * 0.49, 0, Math.PI * 2);
    ctx.fill();

    // 2. Crisp Circular Clip for the Orb
    ctx.beginPath();
    ctx.arc(center, center, dynamicRadius, 0, Math.PI * 2);
    ctx.clip();

    // 3. Render the Exact Voice Logo Asset (or fallback procedural gradient)
    if (this.imageLoaded && this.logoImage.complete) {
      // Subtle float motion
      const floatOffset = Math.sin(this.time * 1.5) * 2;
      ctx.drawImage(
        this.logoImage, 
        center - dynamicRadius, 
        center - dynamicRadius + floatOffset, 
        dynamicRadius * 2, 
        dynamicRadius * 2
      );
    } else {
      // High-fidelity procedural fallback
      const baseGrad = ctx.createLinearGradient(
        center - dynamicRadius, center + dynamicRadius,
        center + dynamicRadius, center - dynamicRadius
      );
      baseGrad.addColorStop(0, '#0076fe');
      baseGrad.addColorStop(0.4, '#1da1f2');
      baseGrad.addColorStop(0.65, '#e0f2fe');
      baseGrad.addColorStop(1, '#ffffff');

      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, size, size);
    }

    // 4. Subtle Specular Highlight on top edge
    const specularGrad = ctx.createRadialGradient(
      center - dynamicRadius * 0.35, 
      center - dynamicRadius * 0.35, 
      1, 
      center - dynamicRadius * 0.35, 
      center - dynamicRadius * 0.35, 
      dynamicRadius * 0.5
    );
    specularGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    specularGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.15)');
    specularGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = specularGrad;
    ctx.beginPath();
    ctx.arc(center - dynamicRadius * 0.35, center - dynamicRadius * 0.35, dynamicRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // 5. Crisp Glass Border Stroke
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(center, center, dynamicRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  start() {
    const loop = () => {
      this.draw();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}

window.VoiceOrbVisualizer = VoiceOrbVisualizer;
