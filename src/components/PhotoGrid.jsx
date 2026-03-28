import ImgSlot from "./ImgSlot";
export default function PhotoGrid({ images, accent }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
      {images.map((img, i) => {
        const r = i===0?"8px 0 0 0":i===1?"0 8px 0 0":i===2?"0 0 0 8px":"0 0 8px 0";
        return (
          <div key={i} style={{ aspectRatio: "4/3", overflow: "hidden", borderRadius: r }}>
            <ImgSlot src={img.src} alt={img.alt} accent={accent} style={{ height: "100%", borderRadius: 0 }} />
          </div>
        );
      })}
    </div>
  );
}
