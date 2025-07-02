'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Loader2 } from 'lucide-react';
import SnowfallEffect from './SnowfallEffect';
import EmberEffect from './EmberEffect';
// import SnowfallEffect and EmberEffect (to be implemented)

const CHILL = 'X';
const BLAZE = 'O';
const CHILL_EMOJI = '❄️';
const BLAZE_EMOJI = '🔥';

function ScoreBoard({
    xScore,
    oScore,
    draws,
}: {
    xScore: number;
    oScore: number;
    draws: number;
}) {
    return (
        <div className='flex gap-8 mb-4 text-lg font-semibold'>
            <div className='flex flex-col items-center'>
                <span className='chill-title'>Chill (❄️)</span>
                <span>{xScore}</span>
            </div>
            <div className='flex flex-col items-center'>
                <span className='text-gray-500'>Draws</span>
                <span>{draws}</span>
            </div>
            <div className='flex flex-col items-center'>
                <span className='blaze-title'>Blaze (🔥)</span>
                <span>{oScore}</span>
            </div>
        </div>
    );
}

export default function Home() {
    const [squares, setSquares] = useState<(string | null)[]>(
        Array(9).fill(null)
    );
    const [xIsNext, setXIsNext] = useState(true);
    const [xScore, setXScore] = useState(0);
    const [oScore, setOScore] = useState(0);
    const [draws, setDraws] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [resetAnim, setResetAnim] = useState(false);
    const [resetting, setResetting] = useState(false);

    const winnerObj = calculateWinner(squares);
    const winner = winnerObj?.winner ?? null;
    const isDraw = !winner && squares.every(Boolean);

    // Load scores from localStorage on mount
    useEffect(() => {
        const x = localStorage.getItem('ttt_xScore');
        const o = localStorage.getItem('ttt_oScore');
        const d = localStorage.getItem('ttt_draws');
        if (x) setXScore(Number(x));
        if (o) setOScore(Number(o));
        if (d) setDraws(Number(d));
    }, []);

    // Persist scores to localStorage
    useEffect(() => {
        localStorage.setItem('ttt_xScore', String(xScore));
        localStorage.setItem('ttt_oScore', String(oScore));
        localStorage.setItem('ttt_draws', String(draws));
    }, [xScore, oScore, draws]);

    // Auto-reset board after win/draw
    const resetTimeout = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if ((winner || isDraw) && gameOver) {
            setResetting(true);
            resetTimeout.current = setTimeout(() => {
                setSquares(Array(9).fill(null));
                setXIsNext(Math.random() < 0.5);
                setGameOver(false);
                setResetting(false);
            }, 3000);
        }
        return () => {
            if (resetTimeout.current) clearTimeout(resetTimeout.current);
        };
    }, [winner, isDraw, gameOver]);

    // Update scores when the game ends
    React.useEffect(() => {
        if (winner && !gameOver) {
            if (winner === CHILL) setXScore((s) => s + 1);
            else if (winner === BLAZE) setOScore((s) => s + 1);
            setGameOver(true);
        } else if (isDraw && !gameOver) {
            setDraws((d) => d + 1);
            setGameOver(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [winner, isDraw]);

    function handleClick(i: number) {
        if (squares[i] || winner || isDraw) return;
        const nextSquares = squares.slice();
        nextSquares[i] = xIsNext ? CHILL : BLAZE;
        setSquares(nextSquares);
        setXIsNext(!xIsNext);
    }

    function handleReset() {
        setSquares(Array(9).fill(null));
        setXIsNext(Math.random() < 0.5);
        setGameOver(false);
        setResetAnim(true);
    }

    function handleAnimationEnd() {
        setResetAnim(false);
    }

    let status;
    if (winner) {
        status = `Winner: ${winner === CHILL ? 'Chill (❄️)' : 'Blaze (🔥)'}`;
    } else if (isDraw) {
        status = 'Draw!';
    } else {
        status = `${xIsNext ? 'Chill (❄️)' : 'Blaze (🔥)'}'s turn`;
    }

    // Helper to estimate win probability (very basic: count possible win lines for each)
    function getWinProbabilities(squares: (string | null)[]) {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        let chillChances = 0;
        let blazeChances = 0;
        lines.forEach((line) => {
            const vals = line.map((i) => squares[i]);
            if (!vals.includes(BLAZE)) chillChances++;
            if (!vals.includes(CHILL)) blazeChances++;
        });
        const total = chillChances + blazeChances;
        return {
            chill: total ? chillChances / total : 0.5,
            blaze: total ? blazeChances / total : 0.5,
        };
    }

    // Calculate win probabilities and set background class
    const { chill, blaze } = getWinProbabilities(squares);
    let bgClass = 'bg-icyfire';
    if (winner) {
        bgClass = winner === CHILL ? 'bg-chill-win' : 'bg-blaze-win';
    } else if (chill - blaze > 0.2) {
        bgClass = 'bg-icyfire-chill';
    } else if (blaze - chill > 0.2) {
        bgClass = 'bg-icyfire-blaze';
    }

    return (
        <>
            {/* Custom win effects will be rendered here */}
            {winner === CHILL && gameOver && <SnowfallEffect />}
            {winner === BLAZE && gameOver && <EmberEffect />}
            <div
                className={`flex flex-col items-center justify-center min-h-screen gap-8 ${bgClass}`}
            >
                <h1 className='text-3xl font-bold flex items-center gap-2'>
                    <span className='chill-title'>Chill</span>
                    <span className='mx-1 text-black drop-shadow'>vs</span>
                    <span className='blaze-title'>Blaze</span>
                </h1>
                <div className='info-card'>
                    <ScoreBoard xScore={xScore} oScore={oScore} draws={draws} />
                    <div
                        className={`text-lg mb-0 ${
                            status === 'Draw!'
                                ? 'text-gray-300'
                                : winner
                                ? winner === CHILL
                                    ? 'chill-title'
                                    : 'blaze-title'
                                : xIsNext
                                ? 'chill-title'
                                : 'blaze-title'
                        }`}
                    >
                        {status}
                    </div>
                </div>
                <div className='grid grid-cols-3 gap-2'>
                    {squares.map((value, i) => (
                        <Button
                            key={i}
                            variant='outline'
                            className={`w-20 h-20 text-2xl font-bold p-0 glass-cell${
                                !squares[i] && !winner && !isDraw
                                    ? ' cursor-pointer'
                                    : ''
                            }
                                ${
                                    squares[i] === CHILL
                                        ? ' pulse-icy'
                                        : squares[i] === BLAZE
                                        ? ' pulse-fiery'
                                        : ''
                                }`}
                            onClick={() => handleClick(i)}
                            disabled={!!squares[i] || !!winner || isDraw}
                            onMouseEnter={(e) => {
                                if (!squares[i] && !winner && !isDraw) {
                                    e.currentTarget.classList.add(
                                        xIsNext ? 'pulse-icy' : 'pulse-fiery'
                                    );
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!squares[i] && !winner && !isDraw) {
                                    e.currentTarget.classList.remove(
                                        'pulse-icy',
                                        'pulse-fiery'
                                    );
                                }
                            }}
                        >
                            <span className='cell-emoji'>
                                {value === CHILL
                                    ? CHILL_EMOJI
                                    : value === BLAZE
                                    ? BLAZE_EMOJI
                                    : ''}
                            </span>
                        </Button>
                    ))}
                </div>
                {/* Reset Button or Loading Indicator */}
                {!resetting ? (
                    <Button
                        className='mt-6 glass-reset-btn transition-transform duration-200 flex items-center gap-2 cursor-pointer'
                        variant='secondary'
                        onClick={handleReset}
                        onAnimationEnd={handleAnimationEnd}
                    >
                        <RotateCcw
                            className={`w-5 h-5 ${
                                resetAnim ? 'icon-spin-ccw' : ''
                            }`}
                        />
                        <span>Reset Board</span>
                    </Button>
                ) : (
                    <div className='mt-6 flex flex-col items-center'>
                        <Loader2
                            className='animate-spin text-gray-200 mb-1'
                            size={28}
                        />
                        <div className='text-gray-200 text-base font-medium'>
                            Resetting board...
                        </div>
                    </div>
                )}
                {/* Tech stack and AI model label */}
                <div className='mt-10 text-center text-xs text-gray-800 select-none'>
                    Built with <b>Next.js 15</b>, <b>React 19</b>,{' '}
                    <b>Tailwind CSS</b>, <b>shadcn/ui</b>, <b>Lucide</b>, custom
                    canvas effects
                    <br />
                    AI assistant: <b>OpenAI GPT-4</b>
                    <div className='mt-1 text-[11px] text-gray-800 font-bold'>
                        By: Sam De Guzman
                    </div>
                </div>
            </div>
        </>
    );
}

function calculateWinner(squares: (string | null)[]) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (const line of lines) {
        const [a, b, c] = line;
        if (
            squares[a] &&
            squares[a] === squares[b] &&
            squares[a] === squares[c]
        ) {
            return { winner: squares[a], line };
        }
    }
    return null;
}
