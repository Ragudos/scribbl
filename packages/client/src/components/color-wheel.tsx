import type { RGB } from "@scribbl/shared-types";

import React from "react";

import { Pencil1Icon } from "@radix-ui/react-icons";

import { hexToRgb } from "@/lib/utils";

type Props = {
	changeColor: (_color: RGB) => void;
};

const ColorWheel: React.FC<Props> = React.memo(({ changeColor }) => (
	<label
		htmlFor="color-picker"
		className="hover:bg-accent/20 flex flex-col items-center"
	>
		<Pencil1Icon className="w-6 h-6" />
		<input
			id="color-picker"
			title="color-picker"
			aria-label="color-picker"
			type="color"
			onChange={(e) => changeColor(hexToRgb(e.target.value) ?? [0, 0, 0])}
			className="border-0 w-full h-1"
		/>
	</label>
));

ColorWheel.displayName = "ColorWheel";
export default ColorWheel;
