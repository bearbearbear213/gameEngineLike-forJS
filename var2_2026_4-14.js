  var canvas_text=`<body style="user-select: none;touch-action: none; -ms-touch-action: none;font-size:calc(min(5vw,5vh/9*15))">
  <div style="position: absolute; width: 100vw; height: 100vh; left: 0; top: 0">
    <div id="Main" style="
     overflow:hidden;
          color: white;
          font-size: calc(min(5vw,5vh/9*15));
          display: block;
          position: absolute;
          width: calc(min(100vw,100vh / 9 * 16));
          height: calc(min(100vw / 16 * 9,100vh));
          background:rgba(0,0,0,0);
        ">
        <canvas width="1600" height="900" id="canvas" style="width:100%;height:100%;position:absolute;"></canvas>
    </div>
  </div>
  </body>`
    document.getElementById("loadCanvas").innerHTML=canvas_text
// a,b,c,d は [x,y]
// 線分 AB と 線分 CD が交わる（端点で触れるのもOK）なら true
function lineCol(seg1, seg2) {
  const [a, b] = seg1;
  const [c, d] = seg2;

  const EPS = 1e-10;

  // 外積（符号付き面積）を使って向きを判定する
  function orient(p, q, r) {
    // (q - p) × (r - p)
    const v =
      (q[0] - p[0]) * (r[1] - p[1]) -
      (q[1] - p[1]) * (r[0] - p[0]);
    if (Math.abs(v) < EPS) return 0; // ほぼ一直線
    return v > 0 ? 1 : -1; // 反時計回り:+1 / 時計回り:-1
  }

  // 点 r が 線分 pq の上にあるか（一直線のときに使う）
  function onSegment(p, q, r) {
    return (
      Math.min(p[0], q[0]) - EPS <= r[0] && r[0] <= Math.max(p[0], q[0]) + EPS &&
      Math.min(p[1], q[1]) - EPS <= r[1] && r[1] <= Math.max(p[1], q[1]) + EPS
    );
  }

  const o1 = orient(a, b, c);
  const o2 = orient(a, b, d);
  const o3 = orient(c, d, a);
  const o4 = orient(c, d, b);

  // 一般ケース：互いに「違う側」にあるなら交差
  if (o1 * o2 < 0 && o3 * o4 < 0) return true;

  // 特殊ケース：一直線上で重なる/端点が乗る
  if (o1 === 0 && onSegment(a, b, c)) return true;
  if (o2 === 0 && onSegment(a, b, d)) return true;
  if (o3 === 0 && onSegment(c, d, a)) return true;
  if (o4 === 0 && onSegment(c, d, b)) return true;

  return false;
}
function pointInPolygon(point, poly) {
  let inside = false;
  const [px, py] = point;

  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[j];

    const intersect =
      ((y1 > py) !== (y2 > py)) &&
      (px < (x2 - x1) * (py - y1) / (y2 - y1) + x1);

    if (intersect) inside = !inside;
  }

  return inside;
}
function GameObject(...n/*[x,y]*/){
  this.vertex=n
  this.move=(mx,my)=>{
    for(var n of range(this.vertex.length)){
      this.vertex[n][0]+=mx
      this.vertex[n][1]+=my
    }
  }
  this.getBounds = () => {
  var minX = this.vertex[0][0];
  var maxX = this.vertex[0][0];
  var minY = this.vertex[0][1];
  var maxY = this.vertex[0][1];
    for (var v of this.vertex) {
      if (v[0] < minX) minX = v[0];
      if (v[0] > maxX) maxX = v[0];
      if (v[1] < minY) minY = v[1];
      if (v[1] > maxY) maxY = v[1];
    }
    return { minX, maxX, minY, maxY };
  };
  this.writePath=(canvas)=>{
    canvas.beginPath()
    canvas.moveTo(this.vertex[0][0]*expansionLate,this.vertex[0][1]*expansionLate)
    for(var n of this.vertex){
      canvas.lineTo(n[0]*expansionLate,n[1]*expansionLate)
    }
    canvas.closePath()
  }
  this.draw=(ctx,color="white")=>{
    this.writePath(ctx)
    ctx.fillStyle=color
    ctx.fill()
  }
  return this
}
function col(a,b){
  var bA = a.getBounds();
  var bB = b.getBounds();
  if (bA.maxX < bB.minX || bA.minX > bB.maxX ||
      bA.maxY < bB.minY || bA.minY > bB.maxY) {
    return false; 
  }
  for(var n of range(a.vertex.length)){
    for(var m of range(b.vertex.length)){
      if(lineCol([a.vertex[n],a.vertex[(n+1)%a.vertex.length]],[b.vertex[m],b.vertex[(m+1)%b.vertex.length]]))return true
    }
  }
  if (pointInPolygon(a.vertex[0], b.vertex)) return true;
  if (pointInPolygon(b.vertex[0], a.vertex)) return true;
  return false
}

// 使い方例:
// const hit = segmentsIntersect([[x,y],[x1,y1]], [[x2,y2],[x3,y3]]);
  var changeCanvasSize = () => {
    var a = document.getElementById("Main")
    if ((window.innerWidth / 16 > window.innerHeight / 9)) {
      a.style.top = ""
      a.style.left = "calc(((100vw - (100vh / 9*16) ) / 2))"
    } else {
      a.style.left = ""
      a.style.top = "calc(((100vh - (100vw / 16 * 9) ) / 2))"
    }
  }
  window.onresize = changeCanvasSize
  onload = changeCanvasSize
  var makeAngle = (angle, speed = 10) => {
    const x = speed * Math.cos(angle * (Math.PI / 180));
    const y = speed * Math.sin(angle * (Math.PI / 180));
    return { x: x, y: y };
  };
  var toAngle = (x, y) => {
    return Math.atan(y / x) / (Math.PI / 180) + (x < 0 ? 180 : 0);
  };
  var to = (obj, to, speed = 1) => {
    var D = Math.sqrt((to.x - obj.x) ** 2 + (to.y - obj.y) ** 2);
    if (D > speed) {
      return [(speed * (to.x - obj.x)) / D, (speed * (to.y - obj.y)) / D]; //x,y
    } else {
      return [0, 0];
    }
  };
  var distance = (a, b) => {
    return Math.sqrt(((a.x - b.x) * (a.x - b.x)) + ((a.y - b.y) * (a.y - b.y)))
  }
  var expansionLate = 10
  function draw(x, y, w, h, angle = 0, imagedata = "", reverse = false, op = (ctx) => { }) {
    if (isNaN(x)) {
      return
    }
    canvas.save();
    canvas.translate(x * expansionLate, y * expansionLate);
    canvas.rotate((angle * Math.PI) / 180);
    op(canvas);
    if (imagedata == "") {
      canvas.fillRect(0, 0,
        w * expansionLate,
        h * expansionLate,
      );
    } else {
      if (reverse) {
        canvas.scale(-1, 1);
      }
      var img = imagedata
      canvas.drawImage(
        img, w * expansionLate * (!reverse ? 0 : -1), 0,
        w * expansionLate,
        h * expansionLate,
      );
    }
    canvas.restore();
  }
  async function wait(wh,f=true) {
    if(f)moreStop=true
    if (typeof wh == "function") {
      await new Promise((resolve) => {
        var a = setInterval(() => {
          if (wh()) {
            clearInterval(a);
            resolve();
          }
        });
      });
    } else {
      await new Promise((resolve) => {
        setTimeout(() => resolve(), wh);
      });
    }
    if(f)moreStop=false
  }
  var range = (n) => {
    return [...Array(n).keys()];
  };
  var random = (max, min) => {
    return Math.floor(Math.random() * (max - min)) + min;
  };var canvas = document.getElementById("canvas").getContext("2d")
  function fill(x, y, w, h) {
    canvas.fillRect(x * 10, y * 10, w * 10, h * 10)
  }
  var ok = console.log
  class Keyboard {
    constructor() {
      this.keyboard = {};
      this.keycodes = {};
      var n;
      for (n of `QAZWSXEDCRFVTGBYHNUJMIKOLP`.split("")) {
        this.keycodes[`Key${n}`] = n;
      }
      for (n of `Up/Down/Left/Right`.split("/")) {
        this.keycodes[`Arrow${n}`] = n;
      }
      for (n of `Space/Enter`.split("/")) {
        this.keycodes[`${n}`] = n;
      }
      for (n of Object.values(this.keycodes)) {
        this.keyboard[n] = false;
      }
      document.addEventListener("keydown", (e) => {
        if (Object.keys(this.keycodes).includes(e.code)) {
          this.keyboard[
            Object.keys(this.keyboard)[
            Object.keys(this.keycodes).indexOf(e.code)
            ]
          ] = true;
        }
      });
      document.addEventListener("keyup", (e) => {
        if (Object.keys(this.keycodes).includes(e.code)) {
          this.keyboard[
            Object.keys(this.keyboard)[
            Object.keys(this.keycodes).indexOf(e.code)
            ]
          ] = false;
        }
      });
    }
    get() {
      return this.keyboard;
    }
  }
function initController(a,x="0",y="0",late=1,id="") {
  var K=new Keyboard()
  this.x=0
  this.y=0
  var d=document.createElement("canvas")
  d.style=`
  position:absolute;
  width:calc(100*${late*30}/160)%;
  height:${30*late}%;
  touch-action:none;
  left:${x};
  top:${y};
  `
  d.id=id
  d.width=d.height="100"
  a.appendChild(d)
  var ctx=d.getContext('2d')
  var mx=0
  var my=0
  var ing=false
  d.onpointerup=()=>{
    mx=my=0
    this.x=this.y=0
    ing=false
  }
  d.onpointerdown=()=>{
    ing=true
  }
  d.onpointermove=(e)=>{
    if(ing){
    var x,y,w,h
    w=d.clientWidth
    h=d.clientHeight
    x=e.offsetX/w
    y=e.offsetY/h
    mx=x-0.5
    my=y-0.5
    if((4*mx*mx+4*my*my)>1){
      var arc=Math.atan((my)/(mx))
      var f=mx<0?-1:1
      mx=Math.cos(arc)/2*f
      my=Math.sin(arc)/2*f
    }
    this.x=mx*2
    this.y=my*2
    }
  }
  this.update=(()=>{
    ctx.clearRect(0,0,100,100)
    ctx.fillStyle="rgba(100,100,100,0.3)"
    ctx.beginPath(); 
    ctx.arc(50,50,50,0,2*Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle="rgba(50,50,50,0.3)"
    ctx.beginPath(); 
    ctx.arc(mx*100+50,my*100+50,10,0,2*Math.PI);
    ctx.closePath();
    ctx.fill();
    var n1=[]
    var m=0
    for (var n of `Up/Down/Left/Right`.split("/")) {
      if(K.get()[`Up/Down/Left/Right`.split("/")[m]]){
        n1.push(1)
      }else{
        n1.push(0)
      }
      m++
    }
    var mx2,my2
    mx2=my2=0
    if(n1[0]==1)my2=0.5
    else if(n1[1]==1)my2=-0.5
    if(n1[2]==1)mx2=-0.5
    else if(n1[3]==1)mx2=0.5
    if((4*mx2*mx2+4*my2*my2)>1){
      var arc=Math.atan((my2)/(mx2))
      var f=mx2<0?-1:1
      mx2=Math.cos(arc)/2*f
      my2=Math.sin(arc)/2*f
    }
    this.x=(mx2==0?mx:mx2)*2
    this.y=(my2==0?my:-my2)*2
  })
  return this
}
class SpaceButton{
  constructor(a,x=0,y=0,late=1,color="rgba(100,100,100,0.4)",id="")
  { var d=document.createElement("div")
    d.style=`
    position:absolute;
    width:calc(${late*30}vh);
    height:${30*late}%;
    touch-action:none;
    left:${x};
    top:${y};
    background:${color};
    `
    this.flag=0
    var key={space:0}
    d.id=id
    d.onpointerdown=()=>{key.space=true}
    d.onclick=()=>{key.space=false}
    d.onpointerleave=()=>{key.space=false}
    a.appendChild(d)
    document.addEventListener("keydown",(e)=>{
      if(e.code=="Space")key.space=true
    })
    document.addEventListener("keyup",(e)=>{
      if(e.code=="Space")key.space=false
    })
    this.update=(()=>{
      if(key.space){
        this.flag++
      }else{
        this.flag=0
      }
    })
  }
}
