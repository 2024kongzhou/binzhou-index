import type { Row } from './core';
import { quarantinedValues } from './quarantined-village-values';

// Transcribed and visually checked against the supplied gazetteer, PDF page 11 / printed page 183.
export const verifiedPlaces = [
  {name:'柳家',pinyin:'Liǔjiā',page:'PDF第12页／书内第184页',population:'1930—1944年：25户、85人；1947—1952年：28户、90人；原书“现有”：156人（年份待核）',farmland:'1930—1944年：耕地260亩；1947—1952年：300亩；原书“现有”：205亩（年份待核）',location:'原书：市府西北12.8公里，滨城镇驻地东北2.2公里，东临张义公路。参照点为编志时的位置。',history:'原书载洪武二年李氏自枣强迁来，兄居丁家庄，弟于此立村；因当地有古柳而名柳家。清属秦台乡，光绪间属城区乡、滨州北路19保；1930—1944年属滨一区杀虎乡，1947—1952年属城关区山王乡。',surnames:'本条记载李氏，并列王、薛姓。'},
  {name:'姚家',pinyin:'Yáojiā',page:'PDF第19—20页／书内第191—192页',population:'1930—1944年：80户、330人；原书“现有”：98户、375人（年份待核）',farmland:'1930—1944年：耕地870亩；原书“现有”：746亩（年份待核）',location:'原书：市府西北12.1公里，滨城镇驻地西南3.2公里，西距西沙河0.5公里。',history:'曾名打磨姚家。原书记洪武二年姚封由枣强迁此，以姓立村，后人以打磨为生；清初刘氏由无棣迁入。清属秦台乡，光绪间属城区乡、滨州西路4保；1930—1944年属滨一区袁庵乡，1947年属城关区顾家乡。',surnames:'本条记载姚、刘两姓；迁徙叙述按方志保留，未独立核验族谱。'},
  {name:'东寨子',pinyin:'Dōngzhàizi',page:'PDF第41页／书内第213页',population:'1930—1944年：70户、290人；原书“现有”：80户、350人（年份待核）',farmland:'1930—1944年：耕地1600亩；原书“现有”：1000亩（年份待核）',location:'原书：市府北10.1公里，滨城镇驻地东5公里，北临利禹公路。',history:'曾名寨子。原书记周氏为宋代末居户，石氏由沾化永丰迁入；赵匡胤驻营得名说在原书中属于传说。明清属秦台乡、滨州东路36保；1930—1944年属滨七区秦台乡，1947—1952年属单寺区李家乡。',surnames:'原书记周、石，并另列高、周、韩、张、王等姓；保留原文重复列周的情况。'},
  {name:'八里王',pinyin:'Bālǐwáng',page:'PDF第41—42页／书内第213—214页',population:'1930—1944年：114户、480人；原书“现有”：120户、458人（年份待核）',farmland:'1930—1944年：耕地2300亩；原书“现有”：892亩（年份待核）',location:'原书：市府北8.1公里，滨城镇驻地东南5公里。',history:'曾名八里庄，原与八里耿同村，村名来自距县衙八里。原书记王氏为元代户，居村东；1945年与耿姓分村，王氏取村名八里王。明清属秦台乡、滨州东路35保；1930—1944年属滨七区罗家乡，曾为乡驻地。',surnames:'原书记王氏，另有史、石姓。关于王氏来源，《小康村志》有不同说法，不能合并成同一事实。'},
  {name:'北关', pinyin:'Běiguān', population:'1930—1944年记载：100户、500人；编志时记载625人（统计年份待核）', farmland:'1930—1944年记载：耕地1500亩；编志时记载797亩（统计年份待核）', location:'以编志时市府为参照，西北12.2公里；滨城镇驻地以北1公里。', history:'《滨州市地名志》记载杜雄飞于洪武二年由枣强迁此，并注明存谱。该迁徙记载尚未与族谱独立互证。', surnames:'原书列顾、耿、单、张、程、陈、刘、冯、赵等姓。'},
  {name:'东街', pinyin:'Dōngjiē', population:'1930—1944年记载：340人；编志时记载552人（统计年份待核）', farmland:'1930—1944年记载：耕地760亩；编志时记载400亩（统计年份待核）', location:'以编志时市府为参照，位于其西北11.2公里。', history:'原书记载明清属秦台乡，光绪间属城区乡、滨州北路19保；1930—1944年属滨一区城关镇，1947—1952年属城关区城关镇。', surnames:'本次未完成姓氏逐字核对，暂不补写。'},
];

export function verifiedVillage(v:Row):Row {
  const pending={...v,version_tag:'旧汇编 · 尚未逐页核验',remark:'此条尚未逐页对照《滨州市地名志》，旧汇编可能存在错填、漏项或年代混用，不应视为已核定资料。'+String(v.remark||'')};
  const suspect=quarantinedValues[[v.district,v.township,v.name].join('|')];
  if(suspect) for(const field of ['population','farmland','history','evolution','surnames']) {
    if(suspect[field]&&String(v[field])===suspect[field])
      (pending as Row)[field]='待原页核验（旧汇编疑似重复错填或无依据推断，已隔离）';
  }
  if(v.district!=='滨城区'||v.township!=='滨城镇') return pending;
  const f=verifiedPlaces.find(f=>f.name===String(v.name).replace(/村$/,''));
  if(!f) return pending;
  return {...v, population:f.population,farmland:f.farmland,location:f.location,history:f.history,surnames:f.surnames,
    evolution:'历史行政隶属按原书保留，现行社区与行政村对应关系待核实。',
    source_file:'《滨州市地名志》用户提供本，'+(f.page||'PDF第11页／书内第183页')+'，已目视核对。',
    remark:'原汇编人口、耕地与原页冲突，本页采用已核原文；旧值保留在原始档案。编志时数据不是2026年现状。',
    version_tag:'《滨州市地名志》原页核验 · 历史记录'};
}
