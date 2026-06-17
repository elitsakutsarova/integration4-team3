import { ACHIEVEMENT_STICKER_SHAPES } from '../../data/achievementStickerShapes';

const SILHOUETTE_FILL = '#b0b0b0';
const OUTLINE_STROKE = '#8a8a8a';
const OUTLINE_DASH = '6 4';

function parseViewBoxSize(viewBox) {
  const parts = viewBox.split(/\s+/).map(Number);
  return { width: parts[2], height: parts[3] };
}

function ClipShape({ shape }) {
  if (shape.shapeKind === 'circle') {
    return <circle cx={shape.cx} cy={shape.cy} r={shape.r} />;
  }

  return <path d={shape.d} />;
}

function ShapeOutline({ shape }) {
  if (shape.shapeKind === 'circle') {
    return (
      <circle
        cx={shape.cx}
        cy={shape.cy}
        r={shape.r}
        fill="none"
        stroke={OUTLINE_STROKE}
        strokeWidth="2"
        strokeDasharray={OUTLINE_DASH}
      />
    );
  }

  return (
    <path
      d={shape.d}
      fill="none"
      stroke={OUTLINE_STROKE}
      strokeWidth="2"
      strokeDasharray={OUTLINE_DASH}
    />
  );
}

export default function LockedAchievementSilhouette({ stickerId }) {
  const shape = ACHIEVEMENT_STICKER_SHAPES[stickerId];
  if (!shape) return null;

  const clipId = `achievement-clip-${stickerId}`;
  const { width, height } = parseViewBoxSize(shape.viewBox);

  return (
    <svg
      className="stickers-achievement-silhouette-svg"
      viewBox={shape.viewBox}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <ClipShape shape={shape} />
        </clipPath>
      </defs>

      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill={SILHOUETTE_FILL}
        clipPath={`url(#${clipId})`}
      />

      <ShapeOutline shape={shape} />

      <text
        x={shape.questionMark.x}
        y={shape.questionMark.y}
        textAnchor="middle"
        fontFamily="'Press Start 2P', monospace"
        fontSize={shape.fontSize}
        fill="#fff"
      >
        ?
      </text>
    </svg>
  );
}
