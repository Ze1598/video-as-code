import { EssayVideo } from "../lib/essay-sdk/EssayVideo.tsx";
import { movie } from "./plan.ts";
export const CHANGING_TOO_MUCH_V10_DURATION = movie.duration;
export const ChangingTooMuchV10: React.FC = () => <EssayVideo movie={movie} />;
