import { esc, Row } from './core';
import { villageSources } from './village-sources';

import { facts } from "./village-facts";

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
  return `<div class="container reading"><a class="breadcrumb" href="/place/">← 村庄名录</a><div class="article-heading"><span class="eyebrow">VILLAGE RESEARCH</span><h1>村庄资料补遗</h1><p>逐村核对，让每一个数字都有年代与出处。</p></div><div class="source-note">首批整理《滨州市小康村志》46个村庄章节，7村已提取并核对基础事实。书中沿用历史行政区划；资料索引不等于已完成全部村庄调查。2026年现有人口、户数与土地资料未获得可靠来源的，保持待核实。<a href="https://shandong-chorography.org/database/xzcz/section/5/article/53/">版本依据与编纂说明</a>。</div>${facts.map(factCard).join('')}<section class="section"><h2>46个村庄的原始资料入口</h2><p>以下为文献镜像链接。未完成核验的章节不自动填入村庄数据，尤其不凭同名合并。</p><div class="village-grid">${villageSources.map(v=>`<a class="village-card" href="${v.source}" rel="noopener noreferrer"><span>${esc(v.town)}</span><h3>${esc(v.name)}</h3><p>《滨州市小康村志》· 查看资料原文 ↗</p></a>`).join('')}</div></section></div>`;
}
