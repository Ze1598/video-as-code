import { EssayVideo } from '../lib/essay-sdk/EssayVideo.tsx';
import { movie } from './plan.ts';
export const CHANGING_TOO_MUCH_V7_DURATION = movie.duration;
export const ChangingTooMuchV7: React.FC = () => <EssayVideo movie={movie} />;
