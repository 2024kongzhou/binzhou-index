import { esc, Row } from './core';
import { villageSources } from './village-sources';

export const facts = [
  {name:'高杜村', town:'市中街道办事处', chapter:3, year:'1996年', population:'234户，607人', land:'耕地300亩', surnames:'高、杜、王等14姓', history:'据村志，高家与杜家于1956年合为高杜村；1982年设居委会，1984年居民转为非农业户口。', migration:'村志记载杜氏先由河北枣强迁到滨州南街，清康熙年间后人迁至村址；不同姓氏迁入时间各异。'},
  {name:'小周家村', town:'市东街道办事处', chapter:19, year:'1996年', population:'45户，135人', land:'村志记载当时耕地已被工厂企业、机关占用，未提供面积', surnames:'周、蔡、蔺、张、高、许、齐、吴、程', history:'村名曾为周家、西周家；1988年村民转为非农业户口，设小周家居委会。此处为原市东办事处的小周家，不是杜店镇同名村。', migration:'据村志，明初周氏来自山西洪洞，蔡氏来自河北枣强，蔺氏来自山西龙门；该迁徙叙述尚未与族谱互证。'},
  {name:'八里王村', town:'滨城镇', chapter:44, year:'1996年', population:'136户，473人', land:'耕地886亩', surnames:'王、史、耿、石、刘、张', history:'村志记载原与八里耿同属八里庄，1945年分村，1984年设村委会。', migration:'据村志，明洪武年间王、耿两氏由河北枣强迁来；村名与距原县衙八里有关。'},
  {name:'张豹村', town:'滨城镇', chapter:47, year:'1996年', population:'129户，444人', land:'耕地980亩', surnames:'李、张', history:'村志记载清末与李吉村合并后曾称张箔村，1984年恢复张豹村名。与现有“张豹家”条目的对应关系仍待核实。', migration:'据村志的立村记载，张氏祖先于1369年从河北枣强迁来；这是地方文献记载，并非已核验的个人世系。'},
  {name:'东寨子村', town:'滨城镇', chapter:48, year:'1997年', population:'90户，349人；另载1930—1944年间为70户、290人', land:'1997年耕地1000亩；1930—1944年间记载1600亩', surnames:'周、石、高、韩、张、王、袁、肖', history:'村志记载明清属滨州秦台乡东路36保，1930—1944年属滨七区秦台乡。关于赵匡胤驻营与村名的联系，原书明确作为传说记述。', migration:'村志称周氏为元代以前的本地住户，石氏由沾化永丰迁入；暂未查得独立族谱佐证。'},
  {name:'姚家村', town:'滨城镇', chapter:49, year:'1997年初', population:'106户，373人', land:'耕地651亩', surnames:'姚、刘', history:'村志称村庄曾俗称“打磨姚家”，与传统打磨营生有关；此条对应滨城镇姚家，不对应其他县同名村。', migration:'据村志，姚氏于1369年由枣强迁入，刘氏于清初由无棣迁来。'},
];

export function factCard(f:typeof facts[number]) {
  return `<section class="info-card" id="village-${f.chapter}"><span class="eyebrow">${esc(f.town)} · 历史资料</span><h2>${esc(f.name)}</h2><p>统计时点：${esc(f.year)}，不是现状数据。</p><div class="facts">${[['人口与户数',f.population],['土地记载',f.land],['姓氏记载',f.surnames]].map(([k,v])=>`<div><span>${k}</span><strong>${esc(v)}</strong></div>`).join('')}</div><p>${esc(f.history)}</p><h3>迁徙线索</h3><p>${esc(f.migration)}</p><p class="source-note">依据《滨州市小康村志》（1998年7月第1版），<a href="https://shandong-chorography.org/database/xzcz/section/5/article/${f.chapter}/" rel="noopener noreferrer">查看本村原文镜像 ↗</a>。现有人口、土地及完整世系尚待补证。</p></section>`;
}

export function villageSupplement(v:Row) {
  if(v.district!=='滨城区'||v.township!=='滨城镇') return '';
  // Only attach identities verified against name, district and historical township.
  const name=String(v.name).replace(/村$/,'');
  const f=facts.find(f=>f.town==='滨城镇'&&f.name.replace(/村$/,'')===name);
  return f ? factCard(f):'';
}

export function researchPage() {
  return `<div class="container reading"><a class="breadcrumb" href="/place/">← 村庄名录</a><div class="article-heading"><span class="eyebrow">VILLAGE RESEARCH</span><h1>村庄资料补遗</h1><p>逐村核对，让每一个数字都有年代与出处。</p></div><div class="source-note">首批整理《滨州市小康村志》46个村庄章节，6村已提取并核对基础事实。书中沿用历史行政区划；资料索引不等于已完成全部村庄调查。2026年现有人口、户数与土地资料未获得可靠来源的，保持待核实。<a href="https://shandong-chorography.org/database/xzcz/section/5/article/53/">版本依据与编纂说明</a>。</div>${facts.map(factCard).join('')}<section class="section"><h2>46个村庄的原始资料入口</h2><p>以下为文献镜像链接。未完成核验的章节不自动填入村庄数据，尤其不凭同名合并。</p><div class="village-grid">${villageSources.map(v=>`<a class="village-card" href="${v.source}" rel="noopener noreferrer"><span>${esc(v.town)}</span><h3>${esc(v.name)}</h3><p>《滨州市小康村志》· 查看资料原文 ↗</p></a>`).join('')}</div></section></div>`;
}
