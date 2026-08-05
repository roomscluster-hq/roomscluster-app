"use client";

import { useRef, useEffect, useCallback } from "react";
import { useWhiteboard } from "@/hooks/useWhiteboard";
import { cn } from "@/lib/utils";
import { 
  Pencil, 
  Eraser, 
  Square, 
  Circle, 
  Minus, 
  Undo2, 
  Redo2, 
  Trash2, 
  FileImage,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import type { DrawEvent } from "@/types/whiteboard";

interface WhiteboardProps {
    socketRef: React.RefObject<unknown>;
    canDraw: boolean;
    isHost: boolean;
    onRemoteDraw?: (fn: (event: DrawEvent) => void) => void;
    onRemoteClear?: (fn: () => void) => void;
}

const COLORS = [
    { color: "#ffffff", label: "White" },
    { color: "#ef4444", label: "Red" },
    { color: "#f97316", label: "Orange" },
    { color: "#eab308", label: "Yellow" },
    { color: "#22c55e", label: "Green" },
    { color: "#3b82f6", label: "Blue" },
    { color: "#a855f7", label: "Purple" },
    { color: "#ec4899", label: "Pink" },
    { color: "#000000", label: "Black" },
];

const TOOLS = [
    { id: "pen" as const, label: "Pen", icon: Pencil },
    { id: "eraser" as const, label: "Eraser", icon: Eraser },
    { id: "line" as const, label: "Line", icon: Minus },
    { id: "rectangle" as const, label: "Rectangle", icon: Square },
    { id: "circle" as const, label: "Circle", icon: Circle },
] as const;

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
        undo,
        redo,
        canUndo,
        canRedo,
        exportCanvas,
    } = useWhiteboard(canvasRef, socketRef, canDraw);

    // Register remote draw/clear callbacks
    useEffect(() => {
        onRemoteDraw?.(drawRemoteEvent);
        onRemoteClear?.(() => clearCanvas(false));
    }, [drawRemoteEvent, clearCanvas, onRemoteDraw, onRemoteClear]);

    // Set canvas size on mount
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const initCanvas = () => {
            if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) return;

            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = canvas.offsetHeight * dpr;

            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.scale(dpr, dpr);
                // Fill with dark background
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

    // Export as PNG
    const exportAsPNG = useCallback(() => {
        const dataUrl = exportCanvas();
        if (!dataUrl) {
            toast.error("Failed to export whiteboard");
            return;
        }

        const link = document.createElement("a");
        link.download = `whiteboard-${new Date().toISOString().split("T")[0]}.png`;
        link.href = dataUrl;
        link.click();
        toast.success("Whiteboard exported as PNG");
    }, [exportCanvas]);

    // Export as PDF
    const exportAsPDF = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            toast.error("Failed to export whiteboard");
            return;
        }

        try {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "px",
                format: [canvas.width, canvas.height],
            });

            // Calculate aspect ratio to fit on PDF page
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
            
            const imgX = (pageWidth - imgWidth * ratio) / 2;
            const imgY = (pageHeight - imgHeight * ratio) / 2;

            pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`whiteboard-${new Date().toISOString().split("T")[0]}.pdf`);
            toast.success("Whiteboard exported as PDF");
        } catch (error) {
            console.error("PDF export error:", error);
            toast.error("Failed to export as PDF");
        }
    }, []);

    // Handle clear with confirmation
    const handleClear = useCallback(() => {
        if (confirm("Clear the whiteboard for everyone? This action cannot be undone.")) {
            clearCanvas(true);
            toast.success("Whiteboard cleared");
        }
    }, [clearCanvas]);

    return (
        <div className="flex flex-col h-full bg-gray-800">
            {/* Toolbar */}
            <div className="shrink-0 flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-gray-700 flex-wrap">
                {/* Tools */}
                <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                    {TOOLS.map((t) => {
                        const Icon = t.icon;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTool(t.id)}
                                title={t.label}
                                disabled={!canDraw}
                                className={cn(
                                    "w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200",
                                    tool === t.id
                                        ? "bg-primary-600 text-white shadow-md"
                                        : "text-gray-400 hover:bg-gray-700 hover:text-white",
                                    !canDraw && "opacity-40 cursor-not-allowed"
                                )}
                            >
                                <Icon size={16} />
                            </button>
                        );
                    })}
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-gray-700" />

                {/* Colors */}
                <div className="flex items-center gap-1.5">
                    {COLORS.map((c) => (
                        <button
                            key={c.color}
                            onClick={() => setColor(c.color)}
                            disabled={!canDraw}
                            title={c.label}
                            className={cn(
                                "w-6 h-6 rounded-full border-2 transition-all duration-200",
                                color === c.color 
                                    ? "border-white scale-110 shadow-md" 
                                    : "border-transparent hover:scale-105",
                                !canDraw && "opacity-40 cursor-not-allowed"
                            )}
                            style={{ backgroundColor: c.color }}
                        />
                    ))}
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-gray-700" />

                {/* Stroke width */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium">Size</span>
                    <input
                        type="range"
                        min={1}
                        max={20}
                        value={lineWidth}
                        onChange={(e) => setLineWidth(Number(e.target.value))}
                        disabled={!canDraw}
                        className="w-20 accent-primary-500 cursor-pointer"
                    />
                    <span className="text-xs text-gray-400 w-5 text-center">{lineWidth}</span>
                </div>

                <div className="flex-1" />

                {/* History Controls */}
                <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                    <button
                        onClick={undo}
                        disabled={!canUndo || !canDraw}
                        title="Undo (Ctrl+Z)"
                        className={cn(
                            "w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200",
                            canUndo && canDraw
                                ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                                : "text-gray-600 cursor-not-allowed"
                        )}
                    >
                        <Undo2 size={16} />
                    </button>
                    <button
                        onClick={redo}
                        disabled={!canRedo || !canDraw}
                        title="Redo (Ctrl+Y)"
                        className={cn(
                            "w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200",
                            canRedo && canDraw
                                ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                                : "text-gray-600 cursor-not-allowed"
                        )}
                    >
                        <Redo2 size={16} />
                    </button>
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-gray-700" />

                {/* Export Options */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={exportAsPNG}
                        title="Export as PNG"
                        className="w-8 h-8 rounded-md flex items-center justify-center text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                    >
                        <FileImage size={16} />
                    </button>
                    <button
                        onClick={exportAsPDF}
                        title="Export as PDF"
                        className="w-8 h-8 rounded-md flex items-center justify-center text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                    >
                        <FileText size={16} />
                    </button>
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-gray-700" />

                {/* Clear — host only */}
                {isHost && (
                    <button
                        onClick={handleClear}
                        title="Clear all"
                        className="w-8 h-8 rounded-md flex items-center justify-center text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-all duration-200"
                    >
                        <Trash2 size={16} />
                    </button>
                )}

                {/* Read-only badge for guests */}
                {!canDraw && (
                    <span className="text-xs text-gray-400 italic bg-gray-800 px-2 py-1 rounded">
                        View only
                    </span>
                )}
            </div>

            {/* Canvas Container */}
            <div className="flex-1 relative overflow-hidden bg-gray-800">
                <canvas
                    ref={canvasRef}
                    style={{
                        cursor: canDraw ? (tool === "select" ? "default" : "crosshair") : "default",
                        touchAction: "none",
                        width: "100%",
                        height: "100%",
                        display: "block",
                    }}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerLeave={onPointerUp}
                    className="absolute inset-0"
                />
            </div>
        </div>
    );
}
