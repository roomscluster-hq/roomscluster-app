import { useRef, useState, useCallback, useEffect } from "react";
import { Socket } from "socket.io-client";

export type Tool = "pen" | "eraser" | "rectangle" | "circle" | "line" | "select";

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  tool: Tool;
  color: string;
  lineWidth: number;
  points: Point[];
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
}

export interface DrawEvent {
  type: "stroke" | "clear" | "undo" | "redo";
  stroke?: Stroke;
  strokeId?: string;
}

// Generate unique ID for strokes
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function useWhiteboard(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  socketRef: React.RefObject<Socket | null>,
  canDraw: boolean
) {
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#ffffff");
  const [lineWidth, setLineWidth] = useState(3);
  
  // History for undo/redo
  const [history, setHistory] = useState<Stroke[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  
  const isDrawing = useRef(false);
  const startPos = useRef<Point | null>(null);
  const snapshotRef = useRef<ImageData | null>(null);

  // Get canvas position
  const getPos = useCallback((e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width * window.devicePixelRatio);
    const scaleY = canvas.height / (rect.height * window.devicePixelRatio);
    return {
      x: (e.clientX - rect.left) * scaleX * window.devicePixelRatio,
      y: (e.clientY - rect.top) * scaleY * window.devicePixelRatio,
    };
  }, [canvasRef]);

  // Get canvas context with settings
  const getContext = useCallback((): CanvasRenderingContext2D | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    
    ctx.strokeStyle = tool === "eraser" ? "#1f2937" : color;
    ctx.lineWidth = tool === "eraser" ? lineWidth * 4 : lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    return ctx;
  }, [canvasRef, tool, color, lineWidth]);

  // Draw a single stroke
  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    ctx.strokeStyle = stroke.tool === "eraser" ? "#1f2937" : stroke.color;
    ctx.lineWidth = stroke.tool === "eraser" ? stroke.lineWidth * 4 : stroke.lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (stroke.tool === "pen" || stroke.tool === "eraser") {
      if (stroke.points && stroke.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }
    } else if (stroke.startX !== undefined && stroke.endX !== undefined) {
      drawShape(ctx, stroke.tool, 
        { x: stroke.startX, y: stroke.startY! },
        { x: stroke.endX, y: stroke.endY! }
      );
    }
  }, []);

  // Redraw all strokes from history
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    // Clear and fill background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes up to current history step
    const strokesToDraw = history.slice(0, historyStep + 1);
    strokesToDraw.forEach(stroke => drawStroke(ctx, stroke));
  }, [canvasRef, history, historyStep, drawStroke]);

  // Draw shape helper
  function drawShape(
    ctx: CanvasRenderingContext2D,
    shapeTool: Tool,
    start: Point,
    end: Point
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

  // Pointer down handler
  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!canDraw) return;
      
      isDrawing.current = true;
      const pos = getPos(e);
      startPos.current = pos;

      const newStroke: Stroke = {
        id: generateId(),
        tool,
        color,
        lineWidth,
        points: [pos],
      };
      
      setCurrentStroke(newStroke);

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
    [canDraw, getPos, tool, color, lineWidth, canvasRef]
  );

  // Pointer move handler
  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current || !canDraw || !currentStroke) return;
      
      const pos = getPos(e);
      const ctx = getContext();
      if (!ctx || !canvasRef.current) return;

      if (tool === "pen" || tool === "eraser") {
        // Add point to current stroke
        const updatedStroke = {
          ...currentStroke,
          points: [...currentStroke.points, pos],
        };
        setCurrentStroke(updatedStroke);

        // Draw line segment
        ctx.beginPath();
        const lastPoint = currentStroke.points[currentStroke.points.length - 1];
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else {
        // Restore snapshot for shape preview
        if (snapshotRef.current) {
          ctx.putImageData(snapshotRef.current, 0, 0);
        }
        drawShape(ctx, tool, startPos.current!, pos);
      }
    },
    [canDraw, currentStroke, getPos, getContext, tool, canvasRef]
  );

  // Pointer up handler
  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current || !canDraw) return;
      isDrawing.current = false;
      
      const pos = getPos(e);
      const ctx = getContext();
      if (!ctx) return;

      let finalStroke: Stroke;

      if (tool === "pen" || tool === "eraser") {
        finalStroke = {
          ...currentStroke!,
          points: [...currentStroke!.points, pos],
        };
      } else {
        // For shapes, include start and end positions
        finalStroke = {
          id: generateId(),
          tool,
          color,
          lineWidth,
          points: [],
          startX: startPos.current!.x,
          startY: startPos.current!.y,
          endX: pos.x,
          endY: pos.y,
        };
        
        // Draw final shape
        drawShape(ctx, tool, startPos.current!, pos);
      }

      // Add to history
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(finalStroke);
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
      setCurrentStroke(null);

      // Emit to other users
      socketRef.current?.emit("whiteboard:draw", {
        type: "stroke",
        stroke: finalStroke,
      });

      startPos.current = null;
      snapshotRef.current = null;
    },
    [canDraw, getPos, getContext, tool, color, lineWidth, currentStroke, history, historyStep, socketRef]
  );

  // Draw remote stroke
  const drawRemoteEvent = useCallback((event: DrawEvent) => {
    if (event.type === "clear") {
      // Clear without emitting
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#1f2937";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      setHistory([]);
      setHistoryStep(-1);
      return;
    }

    if (event.type === "stroke" && event.stroke) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) return;

      // Add to history
      setHistory(prev => [...prev, event.stroke!]);
      setHistoryStep(prev => prev + 1);

      // Draw the stroke
      drawStroke(ctx, event.stroke);
    }
  }, [canvasRef, drawStroke]);

  // Clear canvas
  const clearCanvas = useCallback((emit: boolean = true) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    
    // Clear to background color
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Reset history
    setHistory([]);
    setHistoryStep(-1);
    
    if (emit) {
      socketRef.current?.emit("whiteboard:clear");
    }
  }, [canvasRef, socketRef]);

  // Undo
  const undo = useCallback(() => {
    if (historyStep >= 0) {
      setHistoryStep(prev => prev - 1);
      redrawCanvas();
      socketRef.current?.emit("whiteboard:draw", { type: "undo" });
    }
  }, [historyStep, redrawCanvas, socketRef]);

  // Redo
  const redo = useCallback(() => {
    if (historyStep < history.length - 1) {
      setHistoryStep(prev => prev + 1);
      redrawCanvas();
      socketRef.current?.emit("whiteboard:draw", { type: "redo" });
    }
  }, [historyStep, history.length, redrawCanvas, socketRef]);

  // Check if can undo/redo
  const canUndo = historyStep >= 0;
  const canRedo = historyStep < history.length - 1;

  // Export canvas to data URL
  const exportCanvas = useCallback((): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL("image/png");
  }, [canvasRef]);

  // Initialize canvas with background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill with background color
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [canvasRef]);

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
    undo,
    redo,
    canUndo,
    canRedo,
    exportCanvas,
    history,
    historyStep,
  };
}
