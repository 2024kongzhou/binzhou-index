import fs from 'node:fs';
const account='531f4a664191e3c97ac06c639bbe921e';
const candidates=[['current',process.env.CF_CURRENT_TOKEN,process.env.CF_CURRENT_ACCOUNT],['legacy',process.env.CF_LEGACY_TOKEN,process.env.CF_LEGACY_ACCOUNT]];
let selected;
for(const [label,token,configuredAccount] of candidates){
 if(!token){console.log(JSON.stringify({credential:label,present:false}));continue;}
 const report={credential:label,present:true,configuredAccountMatches:configuredAccount?.trim()===account};
 for(const [name,path] of [['verify','/user/tokens/verify'],['project',`/accounts/${account}/pages/projects/binzhou-index`]]){
  try{const r=await fetch('https://api.cloudflare.com/client/v4'+path,{headers:{Authorization:'Bearer '+token.trim()},signal:AbortSignal.timeout(15000)});const data=await r.json();report[name]={http:r.status,success:data.success===true,codes:(data.errors||[]).map(e=>e.code)};if(name==='project'&&r.ok&&data.success&&!selected)selected=token.trim();}
  catch{report[name]={error:'network_or_response_error'};}
 }
 console.log(JSON.stringify(report));
}
if(!selected){console.error('No configured credential can access the target Pages project. Deployment stopped before upload.');process.exitCode=1;}
else {fs.appendFileSync(process.env.GITHUB_ENV,`CF_DEPLOY_TOKEN=${selected}\nCF_DEPLOY_ACCOUNT=${account}\n`);console.log('Selected a credential with confirmed target-project access.');}
