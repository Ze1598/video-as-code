import { Audio } from '@remotion/media';
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { frameState, renderSvg, type Movie } from './index.ts';

export const EssayVideo: React.FC<{ movie: Movie }> = ({ movie }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill>
    <div dangerouslySetInnerHTML={{ __html: renderSvg(frameState(movie, frame)) }} />
    {movie.scenes.map(scene => scene.audio ? <Sequence key={scene.id} from={scene.from} durationInFrames={scene.audio.duration}>
      <Audio src={staticFile(scene.audio.src)} />
    </Sequence> : null)}
  </AbsoluteFill>;
};
