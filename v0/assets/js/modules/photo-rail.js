import { initContinuousRail } from "./continuous-rail.js";

export function initPhotoRail(root) {
  return initContinuousRail(root, {
    hookPrefix: "photo-rail",
    speed: 22,
    motionLabel: "das fotos",
  });
}
