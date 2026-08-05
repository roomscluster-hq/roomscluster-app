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
