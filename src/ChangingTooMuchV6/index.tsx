import { EssayVideo } from '../lib/essay-sdk/EssayVideo.tsx';
import { movie } from '../ChangingTooMuchV5/plan.ts';
export const CHANGING_TOO_MUCH_V6_DURATION = movie.duration;
export const ChangingTooMuchV6: React.FC = () => <EssayVideo movie={movie} />;
