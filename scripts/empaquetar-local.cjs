// index.html autónomo para proveedores content:// que no permiten leer archivos vecinos.
const fs=require('node:fs');
const archivo='index.html';let html=fs.readFileSync(archivo,'utf8');
const bloques=/<script (?:src|data-local)="([^"]+)">[\s\S]*?<\/script>/g;
let cantidad=0;
html=html.replace(bloques,(_,ruta)=>{
 const codigo=fs.readFileSync(ruta,'utf8');
 if(/<\/script/i.test(codigo))throw Error('Cierre HTML inesperado en '+ruta);
 cantidad++;return '<script data-local="'+ruta+'">\n'+codigo+'\n</script>';
});
if(cantidad!==22)throw Error('Se esperaban veintidós dependencias locales, hay '+cantidad);
if(process.argv.includes('--check')){if(html!==fs.readFileSync(archivo,'utf8'))throw Error('index.html requiere npm run empaquetar:local');}
else fs.writeFileSync(archivo,html);
console.log('JavaScript local autónomo: '+cantidad+' archivos incorporados sin alterar sus fuentes.');
