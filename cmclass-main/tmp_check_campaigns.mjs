const url='http://localhost:3000/campaigns'; 
fetch(url).then(async r => { const t = await r.text(); console.log(r.status); console.log(t.slice(0,1000)); }).catch(e => { console.error(String(e)); process.exit(1); }); 
