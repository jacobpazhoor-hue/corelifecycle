import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import {Video2} from './Video2';
import {Short} from './Short';
import {FaceTest} from './FaceTest';
import {StageTest} from './StageTest';
import {Slice, SLICE_FRAMES} from './director';
import {Avatar, AvatarOptions, AvatarPreview, BannerA, BannerB, BannerC} from './Brand';
import {Thumbnail, ThumbAll} from './thumbs';
import timeline from './timeline.json';
import short from './short.json';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* LIVE renderer = director (Video2): multi-shot editing + money count-ups. */}
      <Composition
        id="EveryLevelLawyer"
        component={Video2}
        durationInFrames={timeline.totalFrames}
        fps={timeline.fps}
        width={timeline.width}
        height={timeline.height}
      />
      {/* old single-framing renderer, kept as a fallback / for comparison */}
      <Composition
        id="EveryLevelV1"
        component={Video}
        durationInFrames={timeline.totalFrames}
        fps={timeline.fps}
        width={timeline.width}
        height={timeline.height}
      />
      <Composition id="FaceTest" component={FaceTest} durationInFrames={120} fps={30} width={1920} height={1080} />
      <Composition id="StageTest" component={StageTest} durationInFrames={150} fps={30} width={1920} height={1080} />
      <Composition id="Slice" component={Slice} durationInFrames={SLICE_FRAMES} fps={30} width={1920} height={1080} />
      <Composition
        id="Short"
        component={Short}
        durationInFrames={short.totalFrames}
        fps={short.fps}
        width={short.width}
        height={short.height}
      />
      <Composition id="AvatarOptions" component={AvatarOptions} durationInFrames={1} fps={30} width={1632} height={1700} />
      <Composition id="AvatarPreview" component={AvatarPreview} durationInFrames={1} fps={30} width={1576} height={760} />
      <Composition id="Avatar" component={Avatar} durationInFrames={1} fps={30} width={800} height={800} />
      <Composition id="Thumbnail" component={Thumbnail} durationInFrames={1} fps={30} width={1280} height={720} />
      <Composition id="ThumbAll" component={ThumbAll} durationInFrames={1} fps={30} width={1280} height={1100} />
      <Composition id="BannerA" component={BannerA} durationInFrames={1} fps={30} width={2560} height={1440} />
      <Composition id="BannerB" component={BannerB} durationInFrames={1} fps={30} width={2560} height={1440} />
      <Composition id="BannerC" component={BannerC} durationInFrames={1} fps={30} width={2560} height={1440} />
    </>
  );
};
