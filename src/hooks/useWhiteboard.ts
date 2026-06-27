import { useRef, useState, useCallback, useEffect } from "react";
import { Socket } from "socket.io-client";

export type Tool = "pen" | "eraser" | "rectangle" | "circle" | "line";

export interface DrawEvent {
  type: "draw" | "clear";
  tool?: Tool;
  color?: string;
  lineWidth?: number;
  points?: { x: number; y: number }[];
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
}

export function useWhiteboard(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  socketRef: React.RefObject<any>,
  canDraw: boolean
) {
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#ffffff");
  const [lineWidth, setLineWidth] = useState(3);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const snapshotRef = useRef<ImageData | null>(null);

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function getContext() {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.strokeStyle = tool === "eraser" ? "#1f2937" : color;
    ctx.lineWidth = tool === "eraser" ? lineWidth * 4 : lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    return ctx;
  }

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!canDraw) return;
      isDrawing.current = true;
      const pos = getPos(e);
      lastPos.current = pos;
      startPos.current = pos;

      // Save snapshot for shape preview
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx && canvasRef.current) {
        snapshotRef.current = ctx.getImageData(
          0, 0,
          canvasRef.current.width,
          canvasRef.current.height
        );
      }
    },
    [canDraw, tool]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current || !canDraw) return;
      const ctx = getContext();
      if (!ctx || !canvasRef.current) return;
      const pos = getPos(e);

      if (tool === "pen" || tool === "eraser") {
        ctx.beginPath();
        ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastPos.current = pos;

        socketRef.current?.emit("whiteboard:draw", {
          type: "draw",
          tool,
          color,
          lineWidth,
          points: [lastPos.current, pos],
        });
      } else {
        // Restore snapshot for shape preview
        if (snapshotRef.current) {
          ctx.putImageData(snapshotRef.current, 0, 0);
        }
        drawShape(ctx, tool, startPos.current!, pos);
      }
    },
    [canDraw, tool, color, lineWidth]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current || !canDraw) return;
      isDrawing.current = false;
      const pos = getPos(e);
      const ctx = getContext();
      if (!ctx) return;

      if (tool !== "pen" && tool !== "eraser") {
        drawShape(ctx, tool, startPos.current!, pos);
        socketRef.current?.emit("whiteboard:draw", {
          type: "draw",
          tool,
          color,
          lineWidth,
          startX: startPos.current!.x,
          startY: startPos.current!.y,
          endX: pos.x,
          endY: pos.y,
        });
      }

      lastPos.current = null;
      startPos.current = null;
      snapshotRef.current = null;
    },
    [canDraw, tool, color, lineWidth]
  );

  function drawShape(
    ctx: CanvasRenderingContext2D,
    shapeTool: Tool,
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) {
    ctx.beginPath();
    if (shapeTool === "rectangle") {
      ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
    } else if (shapeTool === "circle") {
      const rx = (end.x - start.x) / 2;
      const ry = (end.y - start.y) / 2;
      ctx.ellipse(
        start.x + rx,
        start.y + ry,
        Math.abs(rx),
        Math.abs(ry),
        0, 0, 2 * Math.PI
      );
      ctx.stroke();
    } else if (shapeTool === "line") {
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
  }

  // ── Draw incoming remote events ──────────────────────
  const drawRemoteEvent = useCallback((event: DrawEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    if (event.type === "clear") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    ctx.strokeStyle =
      event.tool === "eraser" ? "#1f2937" : (event.color ?? "#ffffff");
    ctx.lineWidth =
      event.tool === "eraser"
        ? (event.lineWidth ?? 3) * 4
        : (event.lineWidth ?? 3);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (event.tool === "pen" || event.tool === "eraser") {
      if (event.points && event.points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(event.points[0].x, event.points[0].y);
        ctx.lineTo(event.points[1].x, event.points[1].y);
        ctx.stroke();
      }
    } else if (event.startX !== undefined && event.endX !== undefined) {
      drawShape(
        ctx,
        event.tool!,
        { x: event.startX, y: event.startY! },
        { x: event.endX, y: event.endY! }
      );
    }
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socketRef.current?.emit("whiteboard:clear");
  }, []);

  return {
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
  };
}