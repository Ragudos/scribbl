export const RotatingLoader: React.FC = () => (
	<div className="flex flex-col gap-2 items-center">
		<div className="w-6 h-6 rounded-full border border-r-foreground/80 animate-spin" />
		<div>Loading...</div>
	</div>
);
