import { useLightbox } from "./Lightbox";
import ImgSlot from "./ImgSlot";
export default function ArtGrid({ images, accent, cols = 2, ratio = "4/3" }) {
  const openLb = useLightbox();
  const n = images.length;
  const getBR = i => {
    const tl = i===0, tr = i===cols-1, bl = i===n-cols, br = i===n-1;
    return `${tl?"8px":"0"} ${tr?"8px":"0"} ${br?"8px":"0"} ${bl?"8px":"0"}`;
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: 4 }}>
      {images.map((img, i) => (
        <div key={i} onClick={() => openLb && openLb(img.src, img.alt)}
          style={{ aspectRatio: ratio, overflow: "hidden", cursor: "zoom-in",
            borderRadius: getBR(i), transition: "opacity 0.12s" }}
          onMouseEnter={e => e.currentTarget.style.opacity="0.78"}
          onMouseLeave={e => e.currentTarget.style.opacity="1"}>
          <ImgSlot src={img.src} alt={img.alt} accent={accent} style={{ height: "100%", borderRadius: 0 }} />
        </div>
      ))}
    </div>
  );
}
