import type { FadeParams, TransitionConfig } from 'svelte/transition';
import { linear } from 'svelte/easing';

/** Fade transition that allows two elements to fade in and out over each-other without messing up the layout. */
export const overlay_fade: (n: Node, params?: FadeParams) => TransitionConfig = (_node, params) => {
	const delay = params?.delay || 0;
	const fadeDuration = params?.duration || 500;
	const totalDuration = delay + fadeDuration;
	return {
		duration: totalDuration,
		easing: params?.easing || linear,
		css: (t) => {
			const absT = t * totalDuration;
			const transition = 1 - (totalDuration - absT) / fadeDuration;
			const ret =
				absT < delay
					? 'position: absolute; top: 0; opacity: 0'
					: `position: relative; opacity: ${transition}`;
			return ret;
		}
	} as TransitionConfig;
};
