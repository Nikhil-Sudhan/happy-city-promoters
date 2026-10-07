export const STORAGE_KEY = 'happycity-layout-v1';
export const rupees = value => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value);
export const number = value => new Intl.NumberFormat('en-IN',{maximumFractionDigits:2}).format(value);
export function areaOf(points) { return Math.abs(points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p[0]*q[1]-q[0]*p[1];},0))/2; }
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const onSegment=(p,a,b)=>Math.abs(cross(a,b,p))<1e-7&&p[0]>=Math.min(a[0],b[0])-1e-7&&p[0]<=Math.max(a[0],b[0])+1e-7&&p[1]>=Math.min(a[1],b[1])-1e-7&&p[1]<=Math.max(a[1],b[1])+1e-7;
function intersects(a,b,c,d){const x=cross(a,b,c),y=cross(a,b,d),z=cross(c,d,a),w=cross(c,d,b);return (x*y<0&&z*w<0)||onSegment(c,a,b)||onSegment(d,a,b)||onSegment(a,c,d)||onSegment(b,c,d);}
export function validPolygon(points) {
  if(!Array.isArray(points)||points.length<3||points.length>200||points.some(p=>!Array.isArray(p)||p.length!==2||p.some(n=>!Number.isFinite(n)||Math.abs(n)>100000))) return false;
  if(new Set(points.map(p=>p.join(','))).size!==points.length||areaOf(points)<1) return false;
  for(let i=0;i<points.length;i++) for(let j=i+1;j<points.length;j++) {
    if(j===i+1||(i===0&&j===points.length-1)) continue;
    if(intersects(points[i],points[(i+1)%points.length],points[j],points[(j+1)%points.length])) return false;
  }
  return true;
}
export function pointInside(p,polygon) {
  let inside=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
    const a=polygon[j],b=polygon[i];if(onSegment(p,a,b))return true;
    if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }return inside;
}
export function polygonInside(points,boundary) {
  if(!points.every(p=>pointInside(p,boundary)))return false;
  // A concave boundary can cut across an edge even when its endpoints are inside.
  for(let i=0;i<points.length;i++){
    const a=points[i],b=points[(i+1)%points.length];
    const cuts=[0,1];
    for(let j=0;j<boundary.length;j++){
      const c=boundary[j],d=boundary[(j+1)%boundary.length];const dx=b[0]-a[0],dy=b[1]-a[1],ex=d[0]-c[0],ey=d[1]-c[1],den=dx*ey-dy*ex;
      if(Math.abs(den)>1e-9){const t=((c[0]-a[0])*ey-(c[1]-a[1])*ex)/den,u=((c[0]-a[0])*dy-(c[1]-a[1])*dx)/den;if(t>0&&t<1&&u>=0&&u<=1)cuts.push(t);}
    }
    cuts.sort((x,y)=>x-y);for(let j=1;j<cuts.length;j++){const t=(cuts[j]+cuts[j-1])/2;if(!pointInside([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],boundary))return false;}
  }return true;
}
export function localToGeo([x,z],origin){return {lat:origin.lat-z/111320,lng:origin.lng+x/(111320*Math.cos(origin.lat*Math.PI/180))};}
export function geoToLocal(point,origin){return [(point.lng-origin.lng)*111320*Math.cos(origin.lat*Math.PI/180),(origin.lat-point.lat)*111320];}
export function seedLayout(){return {version:1,origin:{lat:10.3673,lng:77.9803},boundary:[[-43,-51],[43,-51],[43,51],[-43,51]],interests:[],plots:['A','B'].flatMap((row,side)=>Array.from({length:8},(_,i)=>{const x=side===0?-34:10,z=-43+i*10.5;return {id:`${row}${i+1}`,name:`${row}${i+1}`,points:[[x,z],[x+24,z],[x+24,z+9],[x,z+9]],area:216,rate:8500+(i%3)*500,interested:[7,4,9,3,6,2,5,8][i],status:(side===0&&i===3)||(side===1&&i===5)?'reserved':(side===1&&i===2)||(side===0&&i===6)?'sold':'available',note:'Sample residential plot. Road access and on-site features are illustrative.'};}))};}
export function validateLayout(input){
  if(!input||input.version!==1||!input.origin||!Number.isFinite(input.origin.lat)||Math.abs(input.origin.lat)>85||!Number.isFinite(input.origin.lng)||Math.abs(input.origin.lng)>180)throw Error('Invalid site coordinates or unsupported file version.');
  if(!validPolygon(input.boundary))throw Error('The site boundary must be a simple polygon with at least 1 m² area.');
  if(!Array.isArray(input.plots)||input.plots.length<1||input.plots.length>500)throw Error('A layout must contain 1–500 plots.');
  const ids=new Set(),names=new Set();
  const plots=input.plots.map(p=>{
    if(!p||typeof p.id!=='string'||!p.id||p.id.length>80||ids.has(p.id))throw Error('Every plot needs a unique ID.');ids.add(p.id);
    if(typeof p.name!=='string'||!p.name.trim()||p.name.length>30||names.has(p.name.trim().toLowerCase()))throw Error('Every plot needs a unique name (up to 30 characters).');names.add(p.name.trim().toLowerCase());
    if(!validPolygon(p.points)||!polygonInside(p.points,input.boundary))throw Error(`Plot ${p.name} has an invalid shape or extends beyond the site.`);
    if(!Number.isFinite(p.area)||p.area<1||p.area>1e8||!Number.isFinite(p.rate)||p.rate<0||p.rate>1e8||!Number.isInteger(p.interested)||p.interested<0||p.interested>1e7)throw Error(`Plot ${p.name} has invalid numeric details.`);
    if(!['available','reserved','sold'].includes(p.status)||typeof p.note!=='string'||p.note.length>500)throw Error(`Plot ${p.name} has invalid status or notes.`);
    return {id:p.id,name:p.name.trim(),points:p.points.map(p=>[...p]),area:p.area,rate:p.rate,interested:p.interested,status:p.status,note:p.note};
  });
  return {version:1,origin:{lat:input.origin.lat,lng:input.origin.lng},boundary:input.boundary.map(p=>[...p]),plots,interests:Array.isArray(input.interests)?[...new Set(input.interests.filter(id=>ids.has(id)))]:[]};
}
export function toGeoJSON(layout){const polygon=points=>{const ring=points.map(p=>{const c=localToGeo(p,layout.origin);return[c.lng,c.lat];});return {type:'Polygon',coordinates:[[...ring,ring[0]]]};};return {type:'FeatureCollection',features:[{type:'Feature',properties:{type:'site',name:'Site boundary'},geometry:polygon(layout.boundary)},...layout.plots.map(p=>({type:'Feature',properties:{id:p.id,name:p.name,area_m2:p.area,price_per_m2:p.rate,total_price:p.area*p.rate,currency:'INR',status:p.status,interested:p.interested,note:p.note},geometry:polygon(p.points)}))]};}
