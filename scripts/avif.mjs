import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
const dir="assets/img", out=path.join(dir,"opt");
const files=(await fs.readdir(dir)).filter(f=>/\.(jpe?g)$/i.test(f));
for(const file of files){
  const base=path.basename(file,path.extname(file));
  const meta=await sharp(path.join(dir,file)).metadata();
  const widths=[...new Set([900,1600,meta.width].filter(w=>w&&w<=meta.width))].sort((a,b)=>a-b);
  for(const width of widths){
    const target=path.join(out,`${base}-${width}.avif`);
    await sharp(path.join(dir,file)).resize({width,withoutEnlargement:true}).avif({quality:58,effort:6}).toFile(target);
    const s=await fs.stat(target); console.log(`${target} ${Math.round(s.size/1024)} KB`);
  }
}
