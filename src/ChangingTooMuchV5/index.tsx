import { EssayVideo } from '../lib/essay-sdk/EssayVideo.tsx';
import { movie } from './plan.ts';
export const CHANGING_TOO_MUCH_V5_DURATION = movie.duration;
export const ChangingTooMuchV5: React.FC = () => <EssayVideo movie={movie} />;
