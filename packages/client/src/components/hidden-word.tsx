import { MAX_TIME_IN_SECONDS } from "@scribbl/shared-types";
import React from "react";

type Props = {
	word: string;
	time: number;
};

const getNewWord = (currentTime: number, word: string) => {
	let newString = "";

	const halfQuarter = MAX_TIME_IN_SECONDS * 0.75;
	const half = MAX_TIME_IN_SECONDS * 0.5;
	const quarter = MAX_TIME_IN_SECONDS * 0.25;

	for (let idx = 0; idx < word.length; ++idx) {
		if (word[idx] !== " ") {
			if (currentTime <= quarter) {
				if (idx === 0 || idx === word.length - 1) {
					newString += word[idx];
					continue;
				}
				if (word.length > 3) {
					if (idx === Math.floor(word.length / 2)) {
						newString += word[idx];
						continue;
					}
				}
			}

			if (currentTime <= half && currentTime > quarter) {
				if (idx === 0 || idx === word.length - 1) {
					newString += word[idx];
					continue;
				}
			}

			if (currentTime <= halfQuarter && currentTime > half) {
				if (idx === 0) {
					newString += word[idx];
					continue;
				}
			}

			newString += "_";
		} else {
			newString += word[idx];
		}
	}

	return newString;
};

const HiddenWord: React.FC<Props> = React.memo(({ time, word }) => (
	<span className=" tracking-widest">{getNewWord(time, word)}</span>
));

HiddenWord.displayName = "HiddenWord";
export default HiddenWord;
