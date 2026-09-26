import type { Row } from './core';
import { facts } from './village-facts';

// Transcribed and visually checked against the supplied gazetteer, PDF page 11 / printed page 183.
export const verifiedPlaces = [
  {name:'北关', pinyin:'Běiguān', population:'1930—1944年记载：100户、500人；编志时记载625人（统计年份待核）', farmland:'1930—1944年记载：耕地1500亩；编志时记载797亩（统计年份待核）', location:'以编志时市府为参照，西北12.2公里；滨城镇驻地以北1公里。', history:'《滨州市地名志》记载杜雄飞于洪武二年由枣强迁此，并注明存谱。该迁徙记载尚未与族谱独立互证。', surnames:'原书列顾、耿、单、张、程、陈、刘、冯、赵等姓。'},
  {name:'东街', pinyin:'Dōngjiē', population:'1930—1944年记载：340人；编志时记载552人（统计年份待核）', farmland:'1930—1944年记载：耕地760亩；编志时记载400亩（统计年份待核）', location:'以编志时市府为参照，位于其西北11.2公里。', history:'原书记载明清属秦台乡，光绪间属城区乡、滨州北路19保；1930—1944年属滨一区城关镇，1947—1952年属城关区城关镇。', surnames:'本次未完成姓氏逐字核对，暂不补写。'},
];

export function verifiedVillage(v:Row):Row {
  if(v.district!=='滨城区'||v.township!=='滨城镇') return v;
  const f=verifiedPlaces.find(f=>f.name===String(v.name).replace(/村$/,''));
  if(!f) {
    const supplemental=facts.find(f=>f.town===v.township&&f.name.replace(/村$/,'')===String(v.name).replace(/村$/,''));
    if(!supplemental) return v;
    return {...v,population:supplemental.year+'：'+supplemental.population,farmland:supplemental.year+'：'+supplemental.land,
      surnames:supplemental.surnames,history:supplemental.history,evolution:supplemental.migration,
      source_file:'《滨州市小康村志》1998年7月第1版，'+supplemental.name+'章；公开镜像已核。',
      remark:'本页采用已核的历史资料，不是现状数据；统计时点以各字段说明为准。',version_tag:'来源核验 · 历史记录'};
  }
  return {...v, population:f.population,farmland:f.farmland,location:f.location,history:f.history,surnames:f.surnames,
    evolution:'历史行政隶属按原书保留，现行社区与行政村对应关系待核实。',
    source_file:'《滨州市地名志》用户提供本，PDF第11页／书内第183页，已目视核对。',
    remark:'原汇编人口、耕地与原页冲突，本页采用已核原文；旧值保留在原始档案。编志时数据不是2026年现状。',
    version_tag:'原页核验 · 历史记录'};
}
