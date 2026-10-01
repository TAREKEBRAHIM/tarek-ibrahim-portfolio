const http=require('node:http');const fs=require('node:fs');const path=require('node:path');
const root=__dirname;
const rootFiles=new Set(['index.html','en.html','styles.css','app.js','contact-config.js','favicon.svg','intro_vid.mp4']);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.mp4':'video/mp4','.md':'text/plain; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
http.createServer((req,res)=>{let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
const rel=pathname==='/'?'index.html':pathname.slice(1);const parts=rel.split('/');
const allowed=rootFiles.has(rel)||rel==='saas-admin-dashboard/README.md'||(['ecommerce-website','medical-clinic-dashboard','home-service-platform'].includes(parts[0])&&parts.every(p=>p&&!p.startsWith('.')&&!p.includes('\\')&&!p.includes(':')));
const file=path.resolve(root,rel);if(!allowed||!file.startsWith(root+path.sep)){res.writeHead(404).end('Not found');return;}
if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
fs.stat(file,(err,stat)=>{if(err||!stat.isFile()){res.writeHead(404).end('Not found');return;}const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'};let start=0,end=stat.size-1,status=200;
if(req.headers.range){const m=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);if(!m||(!m[1]&&!m[2])){res.writeHead(416,{'Content-Range':'bytes */'+stat.size}).end();return;}if(!m[1])start=Math.max(0,stat.size-Number(m[2]));else{start=Number(m[1]);if(m[2])end=Math.min(end,Number(m[2]));}if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':'bytes */'+stat.size}).end();return;}status=206;headers['Content-Range']='bytes '+start+'-'+end+'/'+stat.size;}
headers['Content-Length']=end-start+1;res.writeHead(status,headers);if(req.method==='HEAD'){res.end();return;}const stream=fs.createReadStream(file,{start,end});stream.on('error',()=>res.destroy());stream.pipe(res);});
}).listen(8080,'127.0.0.1',()=>console.log('Portfolio: http://localhost:8080'));