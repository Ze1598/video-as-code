import { EssayVideo } from '../lib/essay-sdk/EssayVideo.tsx';
import { movie } from './plan.ts';
export const CHANGING_TOO_MUCH_V8_DURATION = movie.duration;
export const ChangingTooMuchV8: React.FC = () => <EssayVideo movie={movie} />;
