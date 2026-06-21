import { useLayoutEffect, useState } from 'react';

const OUTLINE_GAP_REM = 0.25;
const OUTLINE_STROKE_PX = 1.5;

function getOutlineRadii() {
  const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const gapPx = remPx * OUTLINE_GAP_REM;
  return { inner: gapPx, outer: gapPx + OUTLINE_STROKE_PX };
}

/** Shared SVG filter — dashed blue ring outside sticker alpha with a clear gap. */
export default function StickerOutlineDefs() {
  const [radii, setRadii] = useState(() =>
    typeof document === 'undefined' ? { inner: 4, outer: 5.5 } : getOutlineRadii(),
  );

  useLayoutEffect(() => {
    setRadii(getOutlineRadii());
  }, []);

  return (
    <svg aria-hidden="true" className="stickers-outline-defs" focusable="false">
      <defs>
        <filter
          id="sticker-collection-outline"
          filterUnits="objectBoundingBox"
          primitiveUnits="userSpaceOnUse"
          x="-0.25"
          y="-0.25"
          width="1.5"
          height="1.5"
          colorInterpolationFilters="sRGB"
        >
          <feMorphology
            in="SourceAlpha"
            operator="dilate"
            radius={radii.outer}
            result="outer"
          />
          <feMorphology
            in="SourceAlpha"
            operator="dilate"
            radius={radii.inner}
            result="inner"
          />
          <feComposite in="outer" in2="inner" operator="out" result="ring" />
          <feFlood floodColor="#4775FF" result="color" />
          <feComposite in="color" in2="ring" operator="in" result="outline" />
          <feMerge>
            <feMergeNode in="outline" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
