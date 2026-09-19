import { cameraTransformFactory } from "../archive/lib/Camera.ts";
import { CAMERA_FRAMES, CAMERA_X, CAMERA_Y, CAMERA_ZOOM } from "./layout.ts";

export const cameraTransform = cameraTransformFactory(CAMERA_FRAMES, CAMERA_X, CAMERA_Y, CAMERA_ZOOM);
