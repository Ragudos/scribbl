import type { DrawMode, RGB, Sizes } from "@scribbl/shared-types";

import React from "react";

import * as Toolbar from "@radix-ui/react-toolbar";

import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import ColorWheel from "./color-wheel";

type Props = {
  color: RGB;
  size: Sizes;
  lineCap: CanvasLineCap;
  mode: DrawMode;
  changeColor: (_color: RGB) => void;
  changeSize: (_size: Sizes) => void;
  changeLineCap: (_lineCap: CanvasLineCap) => void;
  changeMode: (_mode: DrawMode) => void;
};

const sizes = [5, 10, 15, 20] as Sizes[];
const lineCaps = ["butt", "square", "round"] as CanvasLineCap[];

export const DrawingToolbar: React.FC<Props> = ({
  color,
  size,
  lineCap,
  mode,
  changeColor,
  changeLineCap,
  changeMode,
  changeSize,

}) => (
  <Toolbar.Root className="shadow-xl shadow-black/90 flex flex-wrap gap-y-4 gap-x-2 border-t-2 items-center">
    <Toolbar.ToggleGroup
      type="multiple"
      className="flex gap-2 items-center py-1 pl-2"
    >
      <ColorWheel changeColor={changeColor} />

      {sizes.map((s) => (
        <Toolbar.Button key={s} asChild>
          <Button
            onClick={() => changeSize(s)}
            value={s}
            title="Change brush stroke size"
            aria-label="Change brush stroke size"
            className={cn(
              "p-1 h-6 w-6 border",
              { "w-7 h-7": s === 20 },
              { "bg-accent/20": size === s },
            )}
            size="icon"
            variant="ghost"
          >
            <MiniCanvas
              color={color}
              size={s}
              lineCap={lineCap}
            />
          </Button>
        </Toolbar.Button>
      ))}
    </Toolbar.ToggleGroup>

    <Toolbar.Separator />

    <Toolbar.ToggleGroup className="flex gap-2 items-center" type="multiple">
      <Toolbar.Button asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "p-1 w-8 h-8 border",
            { "bg-accent/20": mode === "fill" }
          )}
          onClick={() => {
            changeMode("fill");
          }}
          title="Fill"
          aria-label="Fill"
        >
          <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill={`rgb(${color[0]}, ${color[1]}, ${color[2]})`} fillOpacity=".01" d="M0 0h48v48H0z" />
            <path fillRule="evenodd" clipRule="evenodd" d="M37 37a4 4 0 0 0 4-4c0-1.473-1.333-3.473-4-6-2.667 2.527-4 4.527-4 6a4 4 0 0 0 4 4Z" fill={`rgb(${color[0]}, ${color[1]}, ${color[2]})`} />
            <path d="m20.854 5.504 3.535 3.536" stroke={`rgb(${color[0]}, ${color[1]}, ${color[2]})`} strokeWidth="4" strokeLinecap="round" />
            <path d="M23.682 8.333 8.125 23.889 19.44 35.203l15.556-15.557L23.682 8.333Z" stroke={`rgb(${color[0]}, ${color[1]}, ${color[2]})`} strokeWidth="4" strokeLinejoin="round" />
            <path d="m12 20.073 16.961 5.577M4 43h40" stroke={`rgb(${color[0]}, ${color[1]}, ${color[2]})`} strokeWidth="4" strokeLinecap="round" />
          </svg>
        </Button>
      </Toolbar.Button>

      <Toolbar.Button asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "p-1 w-8 h-8 border",
            { "bg-accent/20": mode === "brush" }
          )}
          onClick={() => {
            changeMode("brush");
          }}
          title="Brush"
          aria-label="Brush"
        >
          <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={`rgb(${color[0]}, ${color[1]}, ${color[2]})`} className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
          </svg>
        </Button>
      </Toolbar.Button>
    </Toolbar.ToggleGroup>

    <Toolbar.Separator />

    <Toolbar.ToggleGroup className="flex items-center gap-2" type="multiple">
      {lineCaps.map(l => (
        <Toolbar.Button key={l} asChild>
          <Button
            size="icon"
            className={cn(
              "p-1 w-8 h-8 border hover:bg-accent/20",
              { "bg-accent/20": l === lineCap }
            )}
            onClick={() => changeLineCap(l)}
            title="Change line cap"
            aria-label="Change line cap"
          >
            <MiniCanvas
              color={color}
              lineCap={l}
              size={10}
            />
          </Button>
        </Toolbar.Button>
      ))}
    </Toolbar.ToggleGroup>
  </Toolbar.Root>
);

const MiniCanvas: React.FC<{ lineCap: CanvasLineCap, size: Sizes, color: RGB }> = React.memo(
  ({ lineCap, size, color }) => {
    const [ctx, setCtx] = React.useState<CanvasRenderingContext2D | null>(null);
    const ref = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
      if (!ref.current) {
        return;
      }
      const el = ref.current;
      setCtx(el.getContext("2d"));
    }, []);

    React.useEffect(() => {
      if (!ref.current) {
        return;
      }

      const el = ref.current;

      if (!ctx) {
        return;
      }

      ctx.clearRect(0, 0, el.width, el.height);

      ctx.beginPath();
      ctx.lineWidth = size;
      ctx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      ctx.lineCap = lineCap;
      if (lineCap === "butt") {
        ctx.moveTo(0, 0);
        ctx.lineTo(el.width, el.height);
      } else {
        ctx.moveTo(el.width / 2, el.height / 2);
        ctx.lineTo(el.width / 2, el.height / 2);
      }
      ctx.stroke();
    }, [color, ctx, lineCap, size]);
    return (
      <canvas ref={ref} width={size} height={size}>
      </canvas>
    );
  }
);

MiniCanvas.displayName = "MiniCanvas";
DrawingToolbar.displayName = "DrawingToolbar";