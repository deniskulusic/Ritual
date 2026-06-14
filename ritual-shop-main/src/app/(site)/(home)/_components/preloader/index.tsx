'use client';

import React, { useEffect, useRef } from 'react';
import './preloader.css';

export default function Preloader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId: number;

    const syncSize = () => {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `precision highp float;

varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
    vec2 uv = v_texCoord;
    
    // Liquid level goes from 0.0 at bottom to 1.0 at top over time, looping
    // Using a sawtooth wave for the fill level: 0.0 to 1.0
    float fillLevel = min(u_time * 0.5, 1.2);
    
    // Wave math
    float wave1 = sin(uv.x * 10.0 + u_time * 5.0) * 0.02;
    float wave2 = sin(uv.x * 20.0 - u_time * 3.0) * 0.01;
    float totalWave = wave1 + wave2;
    
    // In standard UV coordinates, y=0 is the bottom and y=1 is the top.
    // To fill from bottom to top, we want to color pixels where uv.y < fillLevel + totalWave.
    float liquidLine = fillLevel + totalWave;
    
    // Brand color: #788668 (Sage Green)
    // Normalized: R: 120/255, G: 134/255, B: 104/255
    vec3 liquidColor = vec3(0.47, 0.52, 0.41);
    vec3 bgColor = vec3(1.0, 1.0, 1.0); // White
    
    // Mask is 1.0 when uv.y is below the liquid line
    float mask = step(uv.y, liquidLine);
    vec3 color = mix(bgColor, liquidColor, mask);
    
    gl_FragColor = vec4(color, 1.0);
}`;

    function createShader(type: number, src: string) {
      if (!gl) return null;
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    const prog = gl.createProgram();
    if (!prog) return;

    const vertexShader = createShader(gl.VERTEX_SHADER, vs);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fs);

    if (!vertexShader || !fragmentShader) return;

    gl.attachShader(prog, vertexShader);
    gl.attachShader(prog, fragmentShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    if (!buf) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    const mouse = { x: canvas.width / 2, y: canvas.height / 2 };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    let startTime: number | null = null;
    const render = (t: number) => {
      // 1. Capture the exact timestamp of the first frame
      if (startTime === null) startTime = t;
      
      // 2. Calculate true elapsed time since the component mounted
      const elapsedTime = t - startTime;

      if (!resizeObserver) syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      
      // 3. Pass the reset elapsed time into the shader instead of the global 't'
      if (uTime) gl.uniform1f(uTime, elapsedTime * 0.001); 
      
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="preloader-container">
      <canvas
        ref={canvasRef}
        className="preloader-canvas"
      />
      <div className="preloader-svg-wrapper">
        <svg className="preloader-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 983" preserveAspectRatio="xMidYMid meet">
  <defs>
    <mask id="letter-r-mask">
      <rect x="-5000" y="-5000" width="10000" height="10000" fill="white"></rect>
      
      <path fill="black" d="M561.5 93.1064C242.736 153.438 134.863 405.696 280 617.606L282 981.606H0V981.606L2 1.10642H381.5C609.5 -4.89359 677 35.6064 677 35.6064C977.1 172.271 798.908 424.814 792.5 424.606C701.5 529.606 520.5 539.606 520.5 539.606L522.5 549.106C908 536.606 857 981.606 857 981.606H551.5C544 729.606 494 688.606 494 688.606L467 662.606L438 644.106L387.5 620.106L352 598.606C227.69 507.106 323.5 295.106 430 235.606C536.5 176.106 434.5 246.106 434.5 246.106C330.5 339.106 344 464.106 352 469.106L359 476.106C432.5 509.606 530 409.106 539.5 313.106L544 266.606V158.106L543 124.606L546 117.606L553.5 114.106L561.5 110.106Z"></path>
    </mask>
  </defs>
  
  <rect x="-5000" y="-5000" width="10000" height="10000" fill="white" mask="url(#letter-r-mask)"></rect>
</svg>
      </div>
    </div>
  );
}
