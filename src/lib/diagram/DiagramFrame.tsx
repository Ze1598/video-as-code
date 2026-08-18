// Safe-zone defaults: the diagram's camera can zoom out far enough (wide/
// reveal shots) that node labels sit in the same screen region as a bottom-
// anchored caption. Scaling the whole diagram uniformly and anchoring it to
// the top edge fixes its lowest possible pixel regardless of camera
// position/zoom, so it structurally cannot render into the caption's
// territory — see the skill's "Caption/diagram safe zone". Position the
// caption in the now-permanently-clear band below (top: ~860 on a
// 1080-tall frame), not by nudging offsets per beat.
export const DEFAULT_DIAGRAM_SCALE = 0.75;
export const DEFAULT_CAPTION_TOP = 860;

export type DiagramFrameProps = {
  frame: number;
  worldOpacity: number;
  cameraTransform: (frame: number) => string;
  diagramScale?: number;
  children: React.ReactNode;
  /**
   * Rendered in the SAME camera-transformed `<g>` as `children`, but
   * always AFTER it. Packets/markers (see `PacketMarker`) belong here, not
   * in `children` — a packet idling exactly at a node's center is fully
   * painted over by that node's opaque fill if it renders underneath it
   * (the same occlusion mechanic connectors rely on, working against a
   * packet instead of for a connector — see the skill's "Node occlusion").
   * Putting nodes/connectors in `children` and packets in `overlay` makes
   * the correct z-order structural instead of a JSX-ordering convention a
   * future video can forget.
   */
  overlay?: React.ReactNode;
};

export const DiagramFrame: React.FC<DiagramFrameProps> = ({
  frame,
  worldOpacity,
  cameraTransform,
  diagramScale = DEFAULT_DIAGRAM_SCALE,
  children,
  overlay,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `scale(${diagramScale})`,
        transformOrigin: "50% 0%",
      }}
    >
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ opacity: worldOpacity }}>
        <g transform={cameraTransform(frame)}>
          {children}
          {overlay}
        </g>
      </svg>
    </div>
  );
};
