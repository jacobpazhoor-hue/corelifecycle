import {createContext} from 'react';

// Per-scene occurrence index (0-based): "this is the Nth time THIS template renders in the
// episode." Lets a topic-agnostic template (scenes.tsx/stage.tsx) vary its own pose/prop/lighting
// when a script reuses it several times, instead of rendering pixel-identical repeats every time
// (reviewer defect: boardroomNotes/window/signing and iceBathRoom's clock numeral read as static
// duplicates across a run). Video2.tsx computes the index per scene and provides it; templates
// read it via useContext and default to 0 (original look) when no provider is present.
export const SceneVariantContext = createContext<number>(0);
