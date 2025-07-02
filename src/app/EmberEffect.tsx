import React, { useRef, useEffect } from 'react';

const EMBER_COUNT = 160;
const EMBER_COLORS = [
    '#ffb300',
    '#ff6a00',
    '#ffd700',
    '#ff2e2e',
    '#ffae00',
    '#ff4500',
];

function randomBetween(a: number, b: number) {
    return a + Math.random() * (b - a);
}

export default function EmberEffect() {
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

        const embers = Array.from({ length: EMBER_COUNT }, () => ({
            x: randomBetween(0, width),
            y: randomBetween(-height, 0),
            r: randomBetween(3, 7),
            o: randomBetween(0.5, 1),
            speed: randomBetween(1.2, 2.8),
            drift: randomBetween(-0.3, 0.3),
            color: EMBER_COLORS[
                Math.floor(Math.random() * EMBER_COLORS.length)
            ],
            flicker: randomBetween(0.7, 1.2),
        }));

        function draw() {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);
            for (const ember of embers) {
                ctx.save();
                ctx.globalAlpha =
                    ember.o * (0.7 + Math.random() * 0.3) * ember.flicker;
                ctx.beginPath();
                ctx.arc(
                    ember.x,
                    ember.y,
                    ember.r * (0.8 + Math.random() * 0.4),
                    0,
                    2 * Math.PI
                );
                ctx.fillStyle = ember.color;
                ctx.shadowColor = ember.color;
                ctx.shadowBlur = 16;
                ctx.fill();
                ctx.restore();
                ember.x += ember.drift;
                ember.y += ember.speed;
                if (ember.y > height + 12) {
                    ember.x = randomBetween(0, width);
                    ember.y = randomBetween(-20, 0);
                    ember.r = randomBetween(3, 7);
                    ember.o = randomBetween(0.5, 1);
                    ember.speed = randomBetween(1.2, 2.8);
                    ember.drift = randomBetween(-0.3, 0.3);
                    ember.color =
                        EMBER_COLORS[
                            Math.floor(Math.random() * EMBER_COLORS.length)
                        ];
                    ember.flicker = randomBetween(0.7, 1.2);
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
