"use client";

import { useRef, useEffect } from "react";
import { useWhiteboard, Tool } from "@/hooks/useWhiteboard";
import { cn } from "@/lib/utils";

interface WhiteboardProps {
    socketRef: React.RefObject<any>;
    canDraw: boolean;
    isHost: boolean;
    onRemoteDraw?: (fn: (event: any) => void) => void;
    onRemoteClear?: (fn: () => void) => void;
}

const COLORS = [
    "#ffffff", "#ef4444", "#f97316", "#eab308",
    "#22c55e", "#3b82f6", "#a855f7", "#ec4899",
];

const TOOLS: { id: Tool; label: string; icon: string }[] = [
    { id: "pen", label: "Pen", icon: "✏️" },
    { id: "eraser", label: "Eraser", icon: "⬜" },
    { id: "line", label: "Line", icon: "╱" },
    { id: "rectangle", label: "Rectangle", icon: "▭" },
    { id: "circle", label: "Circle", icon: "○" },
];

export function Whiteboard({
    socketRef,
    canDraw,
    isHost,
    onRemoteDraw,
    onRemoteClear,
}: WhiteboardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const {
        tool,
        setTool,
        color,
        setColor,
        lineWidth,
        setLineWidth,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        drawRemoteEvent,
        clearCanvas,
    } = useWhiteboard(canvasRef, socketRef, canDraw);

    // Register remote draw/clear callbacks
    useEffect(() => {
        onRemoteDraw?.(drawRemoteEvent);
        onRemoteClear?.(clearCanvas);
    }, [drawRemoteEvent, clearCanvas]);

    // Set canvas size on mount
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const initCanvas = () => {
            if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) return;

            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;

            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
                ctx.fillStyle = "#1f2937";
                ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
            }
        };

        // Try immediately in case it's already visible
        initCanvas();

        // Also watch for when it becomes visible (display: none → block)
        const observer = new ResizeObserver(() => {
            if (canvas.offsetWidth > 0 && canvas.width === 0) {
                initCanvas();
            }
        });

        observer.observe(canvas);

        return () => observer.disconnect();
    }, []);

    return (
        <div className="flex flex-col h-full bg-gray-800">
            {/* Toolbar */}
            <div className="shrink-0 flex items-center gap-3 px-4 py-2 bg-gray-900 border-b border-gray-700 flex-wrap">

                {/* Tools */}
                <div className="flex gap-1">
                    {TOOLS.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTool(t.id)}
                            title={t.label}
                            disabled={!canDraw}
                            className={cn(
                                "w-8 h-8 rounded text-sm transition",
                                tool === t.id
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600",
                                !canDraw && "opacity-40 cursor-not-allowed"
                            )}
                        >
                            {t.icon}
                        </button>
                    ))}
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-gray-700" />

                {/* Colors */}
                <div className="flex gap-1">
                    {COLORS.map((c) => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            disabled={!canDraw}
                            className={cn(
                                "w-6 h-6 rounded-full border-2 transition",
                                color === c ? "border-blue-400 scale-110" : "border-transparent",
                                !canDraw && "opacity-40 cursor-not-allowed"
                            )}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-gray-700" />

                {/* Stroke width */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Size</span>
                    <input
                        type="range"
                        min={1}
                        max={20}
                        value={lineWidth}
                        onChange={(e) => setLineWidth(Number(e.target.value))}
                        disabled={!canDraw}
                        className="w-20 accent-blue-500"
                    />
                    <span className="text-xs text-gray-400 w-4">{lineWidth}</span>
                </div>

                <div className="flex-1" />

                {/* Clear — host only */}
                {isHost && (
                    <button
                        onClick={() => {
                            if (confirm("Clear the whiteboard for everyone?")) clearCanvas();
                        }}
                        className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                    >
                        Clear All
                    </button>
                )}

                {/* Read-only badge for guests */}
                {!canDraw && (
                    <span className="text-xs text-gray-400 italic">
                        View only — host can promote you to speaker
                    </span>
                )}
            </div>

            {/* Canvas */}
            <div className="flex-1 relative overflow-hidden">
                <canvas
                    ref={canvasRef}
                    style={{
                        cursor: canDraw ? "crosshair" : "default",
                        touchAction: "none",
                        width: "100%",
                        height: "100%",
                        display: "block",
                    }}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerLeave={onPointerUp}
                />
            </div>
        </div>
    );
}