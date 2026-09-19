import { EssayVideo } from "../lib/essay-sdk/EssayVideo.tsx";
import { movie } from "./plan.ts";
export const CHANGING_TOO_MUCH_V11_DURATION = movie.duration;
export const ChangingTooMuchV11: React.FC = () => <EssayVideo movie={movie} />;
