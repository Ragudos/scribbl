import React from "react";
import { Button } from "./ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { images } from "@/assets";

type Props = {
	setImage: React.Dispatch<
		React.SetStateAction<Partial<(typeof images)[number]> | undefined>
	>;
};

export const ProfileSlider: React.FC<Props> = React.memo(({ setImage }) => {
	const [idx, setIdx] = React.useState(0);

	const creditsRef = React.useRef<HTMLDivElement>(null);

	const previous = () => {
		setIdx((prev) =>
			!isNaN(images.length % prev) ? images.length % prev : prev + 1,
		);
	};

	const next = () => {
		setIdx((prev) =>
			!isNaN(images.length % prev) ? images.length % prev : prev + 1,
		);
	};

	React.useEffect(() => {
		setImage(images[idx]);
		if (!creditsRef.current) {
			return;
		}

		const el = creditsRef.current;

		if (images[idx].credits) {
			el.innerHTML = images[idx].credits;
		}
	}, [idx, setImage]);

	return (
		<div className="flex gap-4 items-center">
			<div>
				<Button
					variant="ghost"
					size="icon"
					title="Previous"
					aria-label="Previous"
					onClick={previous}
				>
					<ChevronLeftIcon className="w-8 h-8" />
				</Button>
			</div>

			<div className="flex flex-col gap-2 items-center">
				<div className="w-32 h-32 rounded-full overflow-hidden">
					<img
						src={images[idx].src}
						alt="Display picture"
						width={112}
						height={112}
						className="rounded-full w-full h-full"
					/>
				</div>
				<div
					title="Credits"
					className="hover:underline hover:underline-offset-2"
					ref={creditsRef}
				></div>
			</div>

			<div>
				<Button
					variant="ghost"
					size="icon"
					title="Next"
					aria-label="Next"
					onClick={next}
				>
					<ChevronRightIcon className="w-8 h-8" />
				</Button>
			</div>
		</div>
	);
});

ProfileSlider.displayName = "ProfileSlider";
