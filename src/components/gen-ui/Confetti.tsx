import React, { useEffect, useRef } from 'react';

interface ConfettiProps {
    isActive: boolean;
    duration?: number;
}

const Confetti: React.FC<ConfettiProps> = ({ isActive, duration = 3000 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!isActive) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: Particle[] = [];
        const particleCount = 150;
        const colors = ['#2563EB', '#7C3AED', '#DB2777', '#EA580C', '#16A34A'];

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            color: string;
            alpha: number;
            size: number;

            constructor() {
                this.x = canvas!.width / 2;
                this.y = canvas!.height / 2;
                this.vx = (Math.random() - 0.5) * 20;
                this.vy = (Math.random() - 0.5) * 20;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.alpha = 1;
                this.size = Math.random() * 5 + 2;
            }

            draw() {
                if (!ctx) return;
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.vy += 0.5; // Gravity
                this.alpha -= 0.01;
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        let animationId: number;
        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p, index) => {
                p.update();
                p.draw();
                if (p.alpha <= 0) {
                    particles.splice(index, 1);
                }
            });

            if (particles.length > 0) {
                animationId = requestAnimationFrame(animate);
            }
        };

        animate();

        const timeout = setTimeout(() => {
            cancelAnimationFrame(animationId);
            if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, duration);

        const handleResize = () => {
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        }

        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(timeout);
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
        };
    }, [isActive, duration]);

    if (!isActive) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
        />
    );
};

export default Confetti;
