import type { MapNode } from './knowledge-map.ts';

type Position = { x: number; y: number; depth: number; cluster: string };
type Member = { id: string; x: number; y: number; z: number; hub: boolean };
type Cluster = { satelliteOf?: string; id: string; x: number; y: number; radius: number; angle: number; speed: number; tilt: number; roll: number; moving: boolean; velocity: number; target: number; from: number; elapsed: number; members: Member[] };

function seed(value: string) {
  let h=2166136261;
  for(const char of value) h=Math.imul(h^char.charCodeAt(0),16777619);
  return (h>>>0)/4294967296;
}

/** A post belongs to its first tag; all other tag edges remain cross-cluster links. */
export function createSphereClusters(nodes: MapNode[]) {
  const groups = new Map<string, MapNode[]>();
  for (const node of nodes) {
    const key = node.kind === 'tag' ? node.title : node.tags[0] ?? '태그 없음';
    const group = groups.get(key) ?? []; group.push(node); groups.set(key,group);
  }
  const clusters: Cluster[] = [...groups].sort(([a],[b])=>a.localeCompare(b)).map(([id,group])=>{
    const posts = group.filter(n=>n.kind==='post').sort((a,b)=>a.id.localeCompare(b.id));
    const radius = posts.length ? 21+Math.sqrt(posts.length)*13 : 15;
    const members = group.filter(n=>n.kind==='tag').map(n=>({id:n.id,x:0,y:0,z:0,hub:true}));
    posts.forEach((n,i)=>{
      const y = posts.length === 1 ? .3 : 1-2*(i+.5)/posts.length;
      const r = Math.sqrt(1-y*y), phi=i*Math.PI*(3-Math.sqrt(5));
      members.push({id:n.id,x:Math.cos(phi)*r,y,z:Math.sin(phi)*r,hub:false});
    });
    return {id,x:0,y:0,radius,angle:seed(id)*Math.PI*2,members,
      speed:(.000075+seed(id+"speed")*.00007)*(seed(id+"direction")>.5?1:-1),
      tilt:.15+seed(id+"tilt")*.85,roll:(seed(id+"roll")-.5)*1.1,
      moving:posts.length>0,velocity:1,target:1,from:1,elapsed:600};
  });
  // Secondary-only tags orbit the primary cluster containing most of their articles.
  for (const c of clusters) if (!c.moving) {
    const counts = new Map<string, number>();
    for (const n of nodes) if (n.kind === 'post' && n.tags.includes(c.id)) {
      const owner=n.tags[0] ?? '태그 없음';counts.set(owner,(counts.get(owner)??0)+1);
    }
    c.satelliteOf=[...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0]?.[0];
  }
  const positions = new Map<string,Position>();
  const project = (c: Cluster) => {
    const cos=Math.cos(c.angle),sin=Math.sin(c.angle);
    for (const m of c.members) {
      const x=m.x*cos+m.z*sin, z=m.z*cos-m.x*sin;
      const tiltedY=m.y*Math.cos(c.tilt)-z*Math.sin(c.tilt), depth=m.y*Math.sin(c.tilt)+z*Math.cos(c.tilt);
      const screenX=x*Math.cos(c.roll)-tiltedY*Math.sin(c.roll), screenY=x*Math.sin(c.roll)+tiltedY*Math.cos(c.roll);
      const perspective=1+depth*.13;
      const p=positions.get(m.id) ?? {x:0,y:0,depth:0,cluster:c.id};
      p.x=c.x+screenX*c.radius*perspective;p.y=c.y+screenY*c.radius*perspective;p.depth=m.hub?0:depth;
      positions.set(m.id,p);
    }
  };
  return {
    clusters, positions,
    layout(aspect: number) {
      // Bounded layout only at mount/resize: springs pull related tags together.
      const ratio=Math.sqrt(Math.max(.3,Math.min(3,aspect)));
      clusters.forEach((c,i)=>{
        const theta=i*2.399963+seed(c.id), distance=55*Math.sqrt(i+1);
        c.x=Math.cos(theta)*distance*ratio;c.y=Math.sin(theta)*distance/ratio;
      });
      const index=new Map(clusters.map((c,i)=>[c.id,i]));
      const links: [number,number][]=[];
      for(const n of nodes) if(n.kind==='post') {
        const a=index.get(n.tags[0]??'태그 없음');
        for(const tag of new Set(n.tags.slice(1))) {const b=index.get(tag);if(a!==undefined&&b!==undefined&&a!==b)links.push([a,b]);}
      }
      const separate=()=>{
        for(let i=0;i<clusters.length;i++) for(let j=i+1;j<clusters.length;j++) {
          const a=clusters[i],b=clusters[j],dx=b.x-a.x,dy=b.y-a.y;
          const d=Math.hypot(dx,dy)||.001, min=(a.radius+b.radius)*1.2+18;
          if(d<min) {const push=(min-d)*.51,nx=d===.001?1:dx/d,ny=d===.001?0:dy/d;
            a.x-=nx*push;a.y-=ny*push;b.x+=nx*push;b.y+=ny*push;}
        }
      };
      for(let iteration=0;iteration<180;iteration++) {
        for(const [i,j] of links) {
          const a=clusters[i],b=clusters[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;
          const satellite=a.satelliteOf===b.id||b.satelliteOf===a.id;
          const target=(a.radius+b.radius)*1.2+(satellite?20:38), pull=(d-target)*(satellite?.075:.018);
          a.x+=dx/d*pull;a.y+=dy/d*pull;b.x-=dx/d*pull;b.y-=dy/d*pull;
        }
        for(const c of clusters) {c.x*=1-.004/ratio;c.y*=1-.004*ratio;}
        separate();
      }
      for(let i=0;i<40;i++) separate();
      clusters.forEach(project);
    },
    advance(dt: number, stopped: ReadonlySet<string>) {
      let changed=false;
      for(const c of clusters) {
        if(!c.moving) continue;
        const target=stopped.has(c.id)?0:1;
        if(target!==c.target) {c.target=target;c.from=c.velocity;c.elapsed=0;}
        const delta=Math.max(0,Math.min(dt,50)), previous=c.velocity;
        c.elapsed+=delta;
        const t=Math.min(1,c.elapsed/(target===0?300:600));
        c.velocity=c.from+(target-c.from)*t*t*(3-2*t);
        if(previous===0&&c.velocity===0) continue;
        c.angle=(c.angle+delta*c.speed*(previous+c.velocity)/2)%(Math.PI*2);project(c);changed=true;
      }
      return changed;
    },
    hit(x:number,y:number, current: string | null = null, margin = 0) {
      const previous=clusters.find(c=>c.id===current);
      if(previous && Math.hypot(x-previous.x,y-previous.y)<previous.radius*1.15+8+margin) return previous.id;
      let found: string|null=null, distance=Infinity;
      for(const c of clusters) {const d=Math.hypot(x-c.x,y-c.y);if(d<c.radius*1.15+8 && d<distance){found=c.id;distance=d;}}
      return found;
    },
    translate(id:string,dx:number,dy:number) {
      const c=clusters.find(c=>c.id===id);if(c){c.x+=dx;c.y+=dy;project(c);}
    },
  };
}
