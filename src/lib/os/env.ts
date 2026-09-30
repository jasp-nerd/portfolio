// Shared media queries, eases and constants for jasp.os.
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(Draggable, InertiaPlugin, CustomEase);
CustomEase.create("house", "0.23, 1, 0.32, 1");
CustomEase.create("drawer", "0.32, 0.72, 0, 1");

export const PHONE = matchMedia("(max-width: 767px)");
export const STILL = matchMedia("(prefers-reduced-motion: reduce)");
export const MENU_H = 28;
