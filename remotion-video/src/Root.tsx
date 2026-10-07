import './index.css';
import { Composition } from 'remotion';
import { MyComposition } from './Composition';
import { HelloDeterminism } from './compositions/HelloDeterminism';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HelloDeterminism"
        component={HelloDeterminism}
        durationInFrames={60}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: 'Motion Studio',
          subtitle: 'Deterministic Motion Engine',
        }}
      />
      <MyComposition />
    </>
  );
};
