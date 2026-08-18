import { cameraTransformFactory } from "../lib/Camera";
import { CAMERA_FRAMES, CAMERA_X, CAMERA_Y, CAMERA_ZOOM } from "./layout";

export const cameraTransform = cameraTransformFactory(CAMERA_FRAMES, CAMERA_X, CAMERA_Y, CAMERA_ZOOM);
