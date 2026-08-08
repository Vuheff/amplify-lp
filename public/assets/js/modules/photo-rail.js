import { initContinuousRail } from "./continuous-rail.js?v=20260808-4";

export function initPhotoRail(root) {
  return initContinuousRail(root, {
    hookPrefix: "photo-rail",
    speed: 22,
    motionLabel: "das fotos",
  });
}
