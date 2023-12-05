import { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  bounceCount: number;
}

const ColorSplash: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  const getRandomVelocity = (): number => (Math.random() - 0.5) * 10;

  const randomColor = (): string => {
    const r: number = Math.floor(Math.random() * 256);
    const g: number = Math.floor(Math.random() * 256);
    const b: number = Math.floor(Math.random() * 256);
    return `rgba(${r},${g},${b},1)`;
  };

  const drawCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string): void => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
  };

  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle): void => {
    drawCircle(ctx, particle.x, particle.y, particle.radius, particle.color);
  };

  const updateParticle = (particle: Particle): void => {
    const canvas = canvasRef.current;
    if (canvas) {
      if (particle.x + particle.radius > canvas.width || particle.x - particle.radius < 0) {
        particle.vx = -particle.vx; // Reverse horizontal velocity on collision with sides
        particle.bounceCount++;
      }
      if (particle.y + particle.radius > canvas.height || particle.y - particle.radius < 0) {
        particle.vy = -particle.vy; // Reverse vertical velocity on collision with top or bottom
        particle.bounceCount++;
      }
  
      if (particle.bounceCount > 3) {
        // Remove particles after bouncing three times
        particlesRef.current = particlesRef.current.filter((p) => p !== particle);
        return;
      }
  
      particle.x += particle.vx;
      particle.y += particle.vy;
    }
  };
  

  const createParticles = (x: number, y: number, numParticles: number = 30): Particle[] => {
    const particles: Particle[] = [];
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x,
        y,
        radius: Math.random() * 8 + 2,
        color: randomColor(),
        vx: getRandomVelocity(),
        vy: getRandomVelocity(),
        bounceCount: 0,
      });
    }
    return particles;
  };

  const shoot = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, e: MouseEvent): void => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newParticles = createParticles(x, y);
    particlesRef.current = [...particlesRef.current, ...newParticles];
  };

  const update = (): void => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particlesRef.current.forEach((particle) => {
          drawParticle(ctx, particle);
          updateParticle(particle);
        });

        requestAnimationFrame(update);
      }
    }
  };

  const resizeCanvas = (): void => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  };

  const handleResize = (): void => {
    resizeCanvas();
    update();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      window.addEventListener('resize', handleResize);
      resizeCanvas();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.addEventListener('mousedown', (e) => shoot(canvas, ctx, e));
        update();

        return () => {
          window.removeEventListener('resize', handleResize);
          canvas.removeEventListener('mousedown', (e) => shoot(canvas, ctx, e));
        };
      }
    }
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default ColorSplash;