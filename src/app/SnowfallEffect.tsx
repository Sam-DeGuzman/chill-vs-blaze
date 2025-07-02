import React, { useRef, useEffect } from 'react';

const SNOWFLAKE_COUNT = 200;

function randomBetween(a: number, b: number) {
    return a + Math.random() * (b - a);
}

export default function SnowfallEffect() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        let ctx = canvas.getContext('2d');
        if (!ctx) return;
        let animationFrameId: number;
        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        function handleResize() {
            width = window.innerWidth;
            height = window.innerHeight;
            if (canvas) {
                canvas.width = width;
                canvas.height = height;
                ctx = canvas.getContext('2d');
            }
        }
        window.addEventListener('resize', handleResize);

        const snowflakes = Array.from({ length: SNOWFLAKE_COUNT }, () => ({
            x: randomBetween(0, width),
            y: randomBetween(-height, 0),
            r: randomBetween(2, 6),
            o: randomBetween(0.5, 1),
            speed: randomBetween(0.7, 2.2),
            drift: randomBetween(-0.5, 0.5),
        }));

        function draw() {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);
            for (const flake of snowflakes) {
                ctx.save();
                ctx.globalAlpha = flake.o;
                ctx.beginPath();
                ctx.arc(flake.x, flake.y, flake.r, 0, 2 * Math.PI);
                ctx.fillStyle = '#fff';
                ctx.shadowColor = '#00c6fb';
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.restore();
                flake.x += flake.drift;
                flake.y += flake.speed;
                if (flake.y > height + 8) {
                    flake.x = randomBetween(0, width);
                    flake.y = randomBetween(-20, 0);
                    flake.r = randomBetween(2, 6);
                    flake.o = randomBetween(0.5, 1);
                    flake.speed = randomBetween(0.7, 2.2);
                    flake.drift = randomBetween(-0.5, 0.5);
                }
            }
            animationFrameId = requestAnimationFrame(draw);
        }
        draw();
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 40,
            }}
        />
    );
}
