import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
 
// ─── TYPES ────────────────────────────────────────────────────────────────────
 
type BadgeLevel = 1 | 2 | 3 | 4 | 5;

interface Song { title: string; artist: string; duration: string; }

interface PhotoPost { type: 'photo'; src: string; caption: string; }

interface GpxPost { type: 'gpx'; title: string; distance: string; elevation: string; duration: string; points: [number, number][]; }

interface TextPost { type: 'text'; content: string; }

type Post = PhotoPost | GpxPost | TextPost;

interface DayData { badge: BadgeLevel; comment: string; playlist: Song[]; posts: Post[]; }

interface MonthData { label: string; days: Record<number, DayData>; }
 
// ─── BADGE CONFIG ─────────────────────────────────────────────────────────────
 
const BADGE: Record<BadgeLevel, { label: string; text: string; border: string; bg: string; glow: string; pulse?: boolean; flicker?: boolean }> = {

  1: { label: 'AWESOME',     text: '#00ff88', border: '#00bb55', bg: '#001a0d', glow: '0 0 18px #00ff8855, 0 0 4px #00ff88' },

  2: { label: 'NICE',        text: '#4499ff', border: '#2266cc', bg: '#000d22', glow: '0 0 14px #4499ff44' },

  3: { label: 'OK',          text: '#ffee00', border: '#ccbb00', bg: '#282200', glow: '0 0 22px #ffee0066, 0 0 7px #ffee00', pulse: true },

  4: { label: 'CHAOTIC',     text: '#ff5533', border: '#cc2200', bg: '#220800', glow: '0 0 14px #ff553344' },

  5: { label: 'WHAT A DAY!', text: '#dd00ff', border: '#8800bb', bg: '#0b0018', glow: '0 0 30px #cc00ff77, 0 0 60px #9900cc33, 0 0 4px #ffffff33', flicker: true },

};
 
// ─── PIXEL ART ────────────────────────────────────────────────────────────────
 
const PC: Record<number, string> = {

  1: '#100820', 2: '#2d1055', 3: '#5b21b6',

  4: '#8b5cf6', 5: '#c4b5fd', 6: '#f8c967',

  7: '#7c3f24', 8: '#d4903c',

};

type Sprite = number[][];

const SW = 12, SH = 20, SS = 3;

const CW = SW * SS, CH = SH * SS;

const CHAR_SPEED = 44.4;
 
const WALK1: Sprite = [

  [0,0,0,1,1,1,1,0,0,0,0,0],

  [0,0,1,2,3,3,2,1,0,0,0,0],

  [0,1,2,3,4,4,3,2,1,0,0,0],

  [0,1,2,4,6,6,4,2,1,0,0,0],

  [0,1,2,4,6,6,4,2,1,0,0,0],

  [0,0,1,2,3,3,2,1,0,0,0,0],

  [0,1,2,3,4,4,3,2,7,0,0,0],

  [1,2,3,4,5,5,4,3,7,0,0,0],

  [1,2,3,4,5,5,4,3,7,0,0,0],

  [0,1,2,3,4,4,3,2,7,0,0,0],

  [0,0,1,2,3,3,2,1,7,0,0,0],

  [0,0,0,1,2,2,1,0,7,0,0,0],

  [0,0,1,2,1,1,2,1,7,0,0,0],

  [0,1,2,1,0,0,1,2,7,0,0,0],

  [0,1,2,1,0,0,0,1,7,0,0,0],

  [0,0,1,1,0,0,0,0,7,0,0,0],

  [0,0,0,0,0,0,0,0,7,0,0,0],

  [0,0,0,0,0,0,0,0,7,0,0,0],

  [0,0,0,0,0,0,0,0,8,0,0,0],

  [0,0,0,0,0,0,0,0,8,7,0,0],

];

const WALK2: Sprite = [

  [0,0,0,1,1,1,1,0,0,0,0,0],

  [0,0,1,2,3,3,2,1,0,0,0,0],

  [0,1,2,3,4,4,3,2,1,0,0,0],

  [0,1,2,4,6,6,4,2,1,0,0,0],

  [0,1,2,4,6,6,4,2,1,0,0,0],

  [0,0,1,2,3,3,2,1,0,0,0,0],

  [0,1,2,3,4,4,3,2,7,0,0,0],

  [1,2,3,4,5,5,4,3,7,0,0,0],

  [1,2,3,4,5,5,4,3,7,0,0,0],

  [0,1,2,3,4,4,3,2,7,0,0,0],

  [0,0,1,2,3,3,2,1,7,0,0,0],

  [0,0,0,1,2,2,1,0,7,0,0,0],

  [0,0,1,2,1,1,2,1,7,0,0,0],

  [0,1,2,1,0,0,1,2,7,0,0,0],

  [0,0,0,1,2,1,0,0,7,0,0,0],

  [0,0,0,0,1,1,0,0,7,0,0,0],

  [0,0,0,0,0,0,0,0,7,0,0,0],

  [0,0,0,0,0,0,0,0,7,0,0,0],

  [0,0,0,0,0,0,0,0,8,0,0,0],

  [0,0,0,0,0,0,0,0,8,7,0,0],

];

const DUCK: Sprite = [

  [0,0,0,0,0,0,0,0,0,0,0,0],

  [0,0,0,0,0,0,0,0,0,0,0,0],

  [0,0,0,0,0,0,0,0,0,0,0,0],

  [0,0,0,0,0,0,0,0,0,0,0,0],

  [0,0,0,1,1,1,1,0,0,0,0,0],

  [0,0,1,2,3,3,2,1,0,0,0,0],

  [0,1,2,3,4,4,3,2,1,0,0,0],

  [0,1,2,4,6,6,4,2,7,0,0,0],

  [1,2,3,4,5,5,4,3,7,0,0,0],

  [1,2,3,4,5,5,4,3,7,0,0,0],

  [0,1,2,3,4,4,3,2,7,0,0,0],

  [0,1,2,2,3,3,2,2,7,0,0,0],

  [0,1,2,1,2,2,1,2,7,0,0,0],

  [0,1,1,0,1,1,0,1,8,0,0,0],

  [0,0,0,0,0,0,0,0,8,7,0,0],

  [0,0,0,0,0,0,0,0,0,0,0,0],

  [0,0,0,0,0,0,0,0,0,0,0,0],

  [0,0,0,0,0,0,0,0,0,0,0,0],

  [0,0,0,0,0,0,0,0,0,0,0,0],

  [0,0,0,0,0,0,0,0,0,0,0,0],

];

const LOOK: Sprite = [

  [0,0,0,1,1,1,1,0,0,0,0,0],

  [0,0,1,2,3,3,2,1,0,0,0,0],

  [0,1,2,3,4,4,3,2,1,0,0,0],

  [0,1,2,4,1,6,4,2,1,0,0,0],

  [0,1,2,4,6,1,4,2,1,0,0,0],

  [0,0,1,2,3,3,2,1,0,0,0,0],

  [0,1,2,3,4,4,3,2,7,0,0,0],

  [1,2,3,4,5,5,4,3,7,0,0,0],

  [1,2,3,4,5,5,4,3,7,0,0,0],

  [0,1,2,3,4,4,3,2,7,0,0,0],

  [0,0,1,2,3,3,2,1,7,0,0,0],

  [0,0,0,1,2,2,1,0,7,0,0,0],

  [0,0,0,1,2,2,1,0,7,0,0,0],

  [0,0,0,1,2,2,1,0,7,0,0,0],

  [0,0,0,0,1,1,0,0,7,0,0,0],

  [0,0,0,0,0,0,0,0,7,0,0,0],

  [0,0,0,0,0,0,0,0,7,0,0,0],

  [0,0,0,0,0,0,0,0,7,0,0,0],

  [0,0,0,0,0,0,0,0,8,0,0,0],

  [0,0,0,0,0,0,0,0,8,7,0,0],

];

const LOOK2: Sprite = LOOK.map((row, i) => {

  if (i === 3) return [0,1,2,4,6,1,4,2,1,0,0,0];

  if (i === 4) return [0,1,2,4,1,6,4,2,1,0,0,0];

  return [...row];

});
 
// ─── DATA ─────────────────────────────────────────────────────────────────────
 
function trail(seed: number): [number, number][] {

  const pts: [number, number][] = [];

  let x = 0.08, y = 0.5;

  for (let i = 0; i < 80; i++) {

    x = Math.min(0.92, x + Math.abs(Math.sin(i * 0.32 + seed)) * 0.018 + 0.007);

    y = Math.max(0.06, Math.min(0.94, y + Math.cos(i * 0.47 + seed * 1.3) * 0.032));

    pts.push([x, y]);

  }

  return pts;

}
 
const DATA: Record<string, MonthData> = {

  '1': {

    label: 'Sobre o projeto',

        badge: 5,

        comment: 'Informações sobre o projeto de reestruturação do Ego e eliminação de personas desatualizadas',

        playlist: [

          { title: 'Midnight City', artist: 'M83', duration: '4:03' },

          { title: 'Intro', artist: 'The xx', duration: '2:07' },

          { title: 'Running Up That Hill', artist: 'Kate Bush', duration: '5:02' },

        ],

        posts: [

          { type: 'photo', src: 'https://i.imgur.com/x8zwC5C.jpeg', caption: 'Uma foto minha atual (temporaria, até eu achar uma foto que exprima melhor o processo e torne o projeto público)' },

          { type: 'text', content: 'A ideia do projeto é simples, modificar quem eu sou até ficar irreconhecivel e isso se dará em diversas frentes! \n\n Começarei descendo o mais fundo possível no nigredo e o vivenciando, mas evitando os vícios e compulsões com a ajuda do Revia 25mg, Atentah 10mg manhã e noite, além do diário de sonhos, sentimentos e projeções e o de estudos intelectuais.' },
        
        ],

      },

      
  '2': {

    label: 'Diários dos sonhos',

    days: {

      0: {

        badge: 4,

        comment: 'Diário dos sonhos por dia e/ou impressões ao acordar',

        playlist: [

          { title: 'Welcome to the Black Parade', artist: 'My Chemical Romance', duration: '5:11' },

          { title: 'Killing in the Name', artist: 'Rage Against the Machine', duration: '5:14' },

        ],

        posts: [

          { type: 'text', content: 'xx.\n\nyy' },

          { type: 'photo', src: 'https://i.imgur.com/47XZEGu.jpeg&fit=crop&auto=format', caption: 'Imagem temporaria.' },
  
         
        ],

      },

      10: {

        badge: 5,

        comment: 'Exemplo de entrada.',

        playlist: [

          { title: 'Pyramid Song', artist: 'Radiohead', duration: '4:48' },

          { title: 'Motion Picture Soundtrack', artist: 'Radiohead', duration: '7:02' },

          { title: "Comptine d'Un Autre Été", artist: 'Yann Tiersen', duration: '2:18' },

          { title: 'Experience', artist: 'Ludovico Einaudi', duration: '5:13' },

        ],

        posts: [

          { type: 'photo', src: 'https://i.imgur.com/u59Nnrj.jpeg&fit=crop&auto=format', caption: 'Temporaria.' },

          { type: 'text', content: 'Exemplo.\n\nExemplo.' },


        ],

      },
/*
      17: {

        badge: 1,

        comment: 'Mountain bike perfeita. Trilha nova descoberta, condições ideais.',

        playlist: [

          { title: "Don't Stop Me Now", artist: 'Queen', duration: '3:29' },

          { title: 'Mr. Brightside', artist: 'The Killers', duration: '3:42' },

          { title: 'Take Me Out', artist: 'Franz Ferdinand', duration: '3:57' },

        ],

        posts: [

          { type: 'gpx', title: 'Mountain Bike — Trilha Pedra Branca', distance: '22,6 km', elevation: '↑ 934 m', duration: '1h 48min', points: trail(5) },

          { type: 'text', content: 'Descobri uma trilha nova que desce pela face norte. Barro perfeito depois da chuva de quinta — aderência ideal, sem lama excessiva. Três descidas técnicas com pedras expostas que exigiram atenção total.\n\nMédia geral de 12,5 km/h. No segmento principal de descida, 47 km/h máximo. Adrenalina total.' },

          { type: 'photo', src: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&h=600&fit=crop&auto=format', caption: 'Descida técnica — trilha Pedra Branca, face norte.' },

        ],

      },

    },

  },
*/
  '07/2026': {

    label: 'Julho de 2026',

    days: {

      3: {

        badge: 1,

        comment: 'Prelúdio a um final de semana estressante',

        playlist: [

          { title: 'Fast Car', artist: 'Tracy Chapman', duration: '4:57' },

          { title: 'Breathe (2 AM)', artist: 'Anna Nalick', duration: '4:23' },

        ],

        posts: [


          { type: 'photo', src: 'https://i.imgur.com/D3Fw7pQ.jpeg', caption: 'Temporario' },

          { type: 'text', content: 'Iniciarei aqui o diário de uma tentativa de mudança estrutural na minha vida. /n//n/ Utilizarei Revia 25mg e Atentah 10mg de manhã e a noite como auxilio.' },

        ],

      }};
/*
      12: {

        badge: 3,

        comment: 'Caminhada urbana exploratória. Agradável, mas nada extraordinário.',

        playlist: [

          { title: 'Yellow', artist: 'Coldplay', duration: '4:29' },

          { title: 'The Scientist', artist: 'Coldplay', duration: '5:09' },

        ],

        posts: [

          { type: 'text', content: 'Saída sem objetivo definido. Caminhei pelos bairros antigos, explorando ruelas que nunca tinha notado antes. 9 km no total, a pé, sem pressão de tempo.\n\nVi três feiras abertas, dois murais novos, e descobri uma padaria dos anos 60 que ainda usa o forno a lenha original.' },

          { type: 'photo', src: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600&fit=crop&auto=format', caption: 'Centro histórico — luz de final de tarde nas fachadas do século XIX.' },

        ],

      },

    },

  },

};*/
// ─── UTILS ────────────────────────────────────────────────────────────────────
 
const parseDur = (d: string) => { const [m, s] = d.split(':').map(Number); return m * 60 + (s || 0); };

const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

const CM = "'CMU Serif','Computer Modern','Times New Roman',serif";
 
// ─── BADGE ────────────────────────────────────────────────────────────────────
 
function BadgeTag({ level, large }: { level: BadgeLevel; large?: boolean }) {

  const b = BADGE[level];

  return (
<span style={{

      display: 'inline-flex', alignItems: 'center',

      color: b.text, border: `1px solid ${b.border}`,

      background: b.bg, boxShadow: b.glow,

      fontFamily: "'Courier New',monospace",

      fontSize: large ? '11px' : '9px',

      padding: large ? '7px 18px' : '3px 8px',

      letterSpacing: '0.22em', fontWeight: 700,

      borderRadius: '2px',

      animation: b.flicker ? 'neonFlicker 4s ease-in-out infinite' : b.pulse ? 'badgePulse 1.6s ease-in-out infinite' : undefined,

    }}>

      {b.label}
</span>

  );

}
 
// ─── MUSIC PLAYER ─────────────────────────────────────────────────────────────
 
function MusicPlayer({ songs }: { songs: Song[] }) {

  const [idx, setIdx] = useState(0);

  const [playing, setPlaying] = useState(false);

  const [elapsed, setElapsed] = useState(0);

  const timer = useRef<ReturnType<typeof setInterval>>();
 
  const song = songs[idx];

  const total = parseDur(song.duration);
 
  useEffect(() => {

    clearInterval(timer.current);

    if (playing) {

      timer.current = setInterval(() => {

        setElapsed(e => {

          if (e >= total - 1) { setIdx(i => (i + 1) % songs.length); return 0; }

          return e + 1;

        });

      }, 1000);

    }

    return () => clearInterval(timer.current);

  }, [playing, total, songs.length]);
 
  const prev = () => { setIdx(i => (i - 1 + songs.length) % songs.length); setElapsed(0); };

  const next = () => { setIdx(i => (i + 1) % songs.length); setElapsed(0); };

  const prog = total > 0 ? elapsed / total : 0;
 
  return (
<div style={{ background: '#090718', border: '1px solid #1e1035', borderRadius: '2px', padding: '12px 14px', width: '100%', marginBottom: '28px' }}>
<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
<button onClick={prev} style={{ color: '#4a2d6a', fontFamily: 'monospace', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', padding: '0 2px' }}>◂◂</button>
<button onClick={() => setPlaying(p => !p)} style={{ color: '#c084fc', background: '#16082e', border: '1px solid #4c1d95', borderRadius: '2px', width: '28px', height: '28px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: playing ? '0 0 8px #8b5cf633' : 'none', transition: 'box-shadow 0.3s' }}>

          {playing ? '▮▮' : '▶'}
</button>
<button onClick={next} style={{ color: '#4a2d6a', fontFamily: 'monospace', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', padding: '0 2px' }}>▸▸</button>
<div style={{ flex: 1, minWidth: 0 }}>
<div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#c4b5fd', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</div>
<div style={{ fontFamily: 'monospace', fontSize: '9px', color: '#5b3380', marginTop: '1px' }}>{song.artist}</div>
</div>
<span style={{ fontFamily: 'monospace', fontSize: '9px', color: '#3a2255', flexShrink: 0 }}>{fmtTime(elapsed)} / {song.duration}</span>
</div>
<div style={{ height: '2px', background: '#16082e', borderRadius: '1px', marginBottom: '8px' }}>
<div style={{ width: `${prog * 100}%`, height: '100%', background: 'linear-gradient(to right, #5b21b6, #c084fc)', boxShadow: '0 0 6px #8b5cf655', borderRadius: '1px', transition: 'width 0.8s linear' }} />
</div>
<div>

        {songs.map((s, i) => (
<button key={i} onClick={() => { setIdx(i); setElapsed(0); }} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '3px 6px', fontFamily: 'monospace', fontSize: '9px', color: i === idx ? '#c084fc' : '#3d2260', background: i === idx ? '#130a28' : 'none', border: 'none', cursor: 'pointer', textAlign: 'left', letterSpacing: '0.03em', borderRadius: '1px' }}>
<span>{i === idx && playing ? '♪ ' : '  '}{s.title}</span>
<span style={{ color: '#2d1a4a' }}>{s.duration}</span>
</button>

        ))}
</div>
</div>

  );

}
 
// ─── GPX TRAIL ────────────────────────────────────────────────────────────────
 
function GpxTrail({ post }: { post: GpxPost }) {

  const W = 560, H = 155, PAD = 16;

  const uid = useRef(`glow-${Math.random().toString(36).slice(2)}`).current;
 
  const pathD = useMemo(() => post.points.map((p, i) => {

    const x = PAD + p[0] * (W - PAD * 2);

    const y = PAD + (1 - p[1]) * (H - PAD * 2);

    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;

  }).join(' '), [post.points]);
 
  const elevPath = useMemo(() => {

    const N = post.points.length;

    const parts = post.points.map((p, i) => {

      const x = PAD + (i / (N - 1)) * (W - PAD * 2);

      const elev = Math.sin(i * 0.18) * 0.38 + p[1] * 0.62;

      const y = 50 - elev * 36;

      return `${i === 0 ? `M${x.toFixed(1)},${y.toFixed(1)}` : `L${x.toFixed(1)},${y.toFixed(1)}`}`;

    });

    parts.push(`L${(PAD + W - PAD * 2).toFixed(1)},54 L${PAD},54 Z`);

    return parts.join(' ');

  }, [post.points]);
 
  return (
<div style={{ width: '100%', background: '#07051a', border: '1px solid #1a0e32', borderRadius: '2px', overflow: 'hidden' }}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px 4px', fontFamily: 'monospace', fontSize: '9px' }}>
<span style={{ color: '#8b5cf6', letterSpacing: '0.08em' }}>{post.title}</span>
<div style={{ display: 'flex', gap: '14px', color: '#4c2d7a' }}>
<span>{post.distance}</span>
<span>{post.elevation}</span>
<span>{post.duration}</span>
</div>
</div>
<svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '130px' }} preserveAspectRatio="xMidYMid meet">
<defs>
<filter id={uid}>
<feGaussianBlur stdDeviation="2.5" result="blur"/>
<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
</defs>

        {[0.25, 0.5, 0.75].flatMap(v => [
<line key={`v${v}`} x1={v * W} y1={0} x2={v * W} y2={H} stroke="#110930" strokeWidth="1"/>,
<line key={`h${v}`} x1={0} y1={v * H} x2={W} y2={v * H} stroke="#110930" strokeWidth="1"/>,

        ])}
<path d={pathD} fill="none" stroke="#4c1d9525" strokeWidth="9"/>
<path d={pathD} fill="none" stroke="#8b5cf650" strokeWidth="3.5"/>
<path d={pathD} fill="none" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${uid})`}/>

        {post.points.length > 0 && <>
<circle cx={PAD + post.points[0][0] * (W - PAD * 2)} cy={PAD + (1 - post.points[0][1]) * (H - PAD * 2)} r="5" fill="#00ff88" style={{ filter: 'drop-shadow(0 0 5px #00ff88)' }}/>
<circle cx={PAD + post.points[post.points.length - 1][0] * (W - PAD * 2)} cy={PAD + (1 - post.points[post.points.length - 1][1]) * (H - PAD * 2)} r="5" fill="#ff5533" style={{ filter: 'drop-shadow(0 0 5px #ff5533)' }}/>
</>}
</svg>
<div style={{ borderTop: '1px solid #110930', height: '46px' }}>
<svg viewBox={`0 0 ${W} 56`} style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
<defs>
<linearGradient id={`${uid}-eg`} x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stopColor="#8b5cf622"/>
<stop offset="100%" stopColor="transparent"/>
</linearGradient>
</defs>
<path d={elevPath} fill={`url(#${uid}-eg)`} stroke="#7c3aed" strokeWidth="1.2"/>
<text x="8" y="52" fontSize="8" fill="#2d1a4a" fontFamily="monospace">elev.</text>
</svg>
</div>
</div>

  );

}
 
// ─── PHOTO BLOCK ─────────────────────────────────────────────────────────────
 
function PhotoBlock({ post, onZoom, elRef }: {

  post: PhotoPost;

  onZoom: () => void;

  elRef: (el: HTMLElement | null) => void;

}) {

  return (
<div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
<div

        ref={el => elRef(el)}

        onClick={onZoom}

        style={{ width: '100%', cursor: 'zoom-in', position: 'relative', lineHeight: 0, overflow: 'hidden' }}
>
<img

          src={post.src}

          alt={post.caption}

          style={{ width: '100%', maxHeight: '460px', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}

          loading="lazy"

          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.015)')}

          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}

        />
<div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 65%, #08051288)', pointerEvents: 'none' }}/>
<div style={{ position: 'absolute', top: '8px', right: '8px', fontFamily: 'monospace', fontSize: '8px', color: '#4c2d7a', letterSpacing: '0.1em', pointerEvents: 'none' }}>[ zoom ]</div>
</div>
<p style={{ fontFamily: CM, fontSize: '10px', color: '#5a3d78', marginTop: '5px', fontStyle: 'italic', textAlign: 'center', width: '100%', letterSpacing: '0.01em', lineHeight: 1.5 }}>

        {post.caption}
</p>
</div>

  );

}
 
// ─── PHOTO MODAL ─────────────────────────────────────────────────────────────
 
function PhotoModal({ post, onClose }: { post: PhotoPost; onClose: () => void }) {

  useEffect(() => {

    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();

    document.addEventListener('keydown', h);

    return () => document.removeEventListener('keydown', h);

  }, [onClose]);
 
  return (
<div

      onClick={onClose}

      style={{ position: 'fixed', inset: 0, background: 'rgba(4,2,12,0.97)', zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
>
<div onClick={e => e.stopPropagation()} style={{ maxWidth: '920px', width: '100%', position: 'relative' }}>
<img

          src={post.src.replace('w=800&h=600', 'w=1800&h=1200')}

          alt={post.caption}

          style={{ width: '100%', maxHeight: '82vh', objectFit: 'contain', display: 'block' }}

        />
<p style={{ fontFamily: CM, fontSize: '11px', color: '#c4b5fd', textAlign: 'center', marginTop: '12px', fontStyle: 'italic', lineHeight: 1.6 }}>

          {post.caption}
</p>
<button

          onClick={onClose}

          style={{ position: 'absolute', top: '8px', right: '8px', background: '#0c0820', border: '1px solid #2d1a4d', color: '#6b4d99', fontFamily: 'monospace', fontSize: '11px', padding: '3px 8px', cursor: 'pointer', borderRadius: '2px' }}
>

          ✕
</button>
</div>
</div>

  );

}
 
// ─── TEXT BLOCK ───────────────────────────────────────────────────────────────
 
function TextBlock({ post }: { post: TextPost }) {

  return (
<div className="text-post-block" style={{ width: '100%' }}>

      {post.content.split('\n\n').map((para, i) => (
<p key={i} style={{ fontFamily: CM, fontSize: '15px', color: '#cbbfe8', textAlign: 'center', maxWidth: '640px', margin: '0 auto 1.25em', lineHeight: '1.85' }}>

          {para}
</p>

      ))}
</div>

  );

}
 
// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
 
function Sidebar({ selMonth, selDay, onSelect }: { selMonth: string; selDay: number; onSelect: (m: string, d: number) => void }) {

  const [openM, setOpenM] = useState<Set<string>>(() => new Set([selMonth]));

  const [openD, setOpenD] = useState<Set<string>>(new Set());
 
  const toggleM = (k: string) => setOpenM(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });

  const toggleD = (k: string) => setOpenD(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });
 
  return (
<nav style={{ width: '196px', flexShrink: 0, height: '100vh', position: 'sticky', top: 0, overflowY: 'auto', background: '#05030f', borderRight: '1px solid #14092a' }}>
<div style={{ padding: '22px 12px 40px' }}>
<div style={{ fontFamily: CM, fontSize: '18px', color: '#a78bfa', textAlign: 'center', marginBottom: '28px', letterSpacing: '0.1em', textShadow: '0 0 28px #7c3aed55' }}>

          Naltretah
</div>

        {Object.entries(DATA).map(([mKey, mData]) => {

          const isOpen = openM.has(mKey);

          return (
<div key={mKey} style={{ marginBottom: '4px' }}>
<button

                onClick={() => toggleM(mKey)}

                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 8px', fontFamily: 'monospace', fontSize: '10px', color: isOpen ? '#b08ef8' : '#3d2460', background: isOpen ? '#0e0620' : 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.1em', borderRadius: '2px', transition: 'background 0.2s' }}
>
<span>{mKey}</span>
<span style={{ fontSize: '8px' }}>{isOpen ? '▾' : '▸'}</span>
</button>

              {isOpen && (
<div style={{ marginLeft: '8px', marginTop: '2px' }}>

                  {Object.entries(mData.days)

                    .sort(([a], [b]) => +a - +b)

                    .map(([dStr, dData]) => {

                      const day = +dStr;

                      const dKey = `${mKey}-${day}`;

                      const isDayOpen = openD.has(dKey);

                      const isSel = selMonth === mKey && selDay === day;

                      const b = BADGE[dData.badge];

                      return (
<div key={day}>
<button

                            onClick={() => { onSelect(mKey, day); toggleD(dKey); }}

                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 6px', fontFamily: 'monospace', fontSize: '10px', color: isSel ? b.text : '#3d2460', background: isSel ? '#110830' : 'none', border: 'none', cursor: 'pointer', boxShadow: isSel ? `inset 2px 0 0 ${b.border}` : 'none', letterSpacing: '0.05em', transition: 'all 0.15s' }}
>
<span style={{ width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0, background: b.text, boxShadow: `0 0 5px ${b.text}66` }}/>
<span>dia {day}</span>
<span style={{ marginLeft: 'auto', fontSize: '8px', color: isSel ? b.text : '#2a1540' }}>{isDayOpen ? '▾' : '▸'}</span>
</button>

                          {isDayOpen && (
<div style={{ marginLeft: '14px', padding: '5px 8px', fontFamily: CM, fontSize: '10px', color: '#5a3d80', fontStyle: 'italic', borderLeft: `1px solid ${b.border}33`, lineHeight: '1.55', marginBottom: '2px' }}>

                              {dData.comment}
</div>

                          )}
</div>

                      );

                    })}
</div>

              )}
</div>

          );

        })}
</div>
</nav>

  );

}
 
// ─── PIXEL CHARACTER ─────────────────────────────────────────────────────────
 
function PixelChar({ imgRefs }: { imgRefs: React.MutableRefObject<Map<string, HTMLElement>> }) {

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const posRef = useRef({ x: 500, y: 300 });

  const mouseRef = useRef({ x: 500, y: 300 });

  const facingRef = useRef<'r' | 'l'>('r');

  const frameRef = useRef(0);

  const lastT = useRef(0);

  const stillT = useRef(0);

  const lastMouse = useRef({ x: 500, y: 300 });

  const raf = useRef(0);

  const lookToggle = useRef(0);
 
  const drawSprite = useCallback((sprite: Sprite, flip: boolean) => {

    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.clearRect(0, 0, CW, CH);

    ctx.save();

    if (flip) { ctx.translate(CW, 0); ctx.scale(-1, 1); }

    for (let y = 0; y < sprite.length; y++) {

      for (let x = 0; x < sprite[y].length; x++) {

        const px = sprite[y][x];

        if (px) { ctx.fillStyle = PC[px]; ctx.fillRect(x * SS, y * SS, SS, SS); }

      }

    }

    ctx.restore();

  }, []);
 
  useEffect(() => {

    const onMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };

    window.addEventListener('mousemove', onMove);
 
    const loop = (now: number) => {

      const dt = Math.min((now - lastT.current) / 1000, 0.05);

      lastT.current = now;

      const canvas = canvasRef.current;

      if (!canvas) { raf.current = requestAnimationFrame(loop); return; }
 
      const pos = posRef.current;

      const mouse = mouseRef.current;

      const cx = pos.x + CW / 2;

      const cy = pos.y + CH / 2;

      const dx = mouse.x - cx;

      const dy = mouse.y - cy;

      const dist = Math.sqrt(dx * dx + dy * dy);
 
      // Mouse still detection

      const lm = lastMouse.current;

      if (Math.abs(mouse.x - lm.x) > 2 || Math.abs(mouse.y - lm.y) > 2) {

        stillT.current = 0;

        lastMouse.current = { ...mouse };

      } else {

        stillT.current += dt;

      }
 
      // Move toward mouse

      if (dist > 6) {

        const move = Math.min(CHAR_SPEED * dt, dist);

        pos.x += (dx / dist) * move;

        pos.y += (dy / dist) * move;

        facingRef.current = dx < 0 ? 'l' : 'r';

      }
 
      // Image interaction: elevate image over character when overlapping

      for (const [, el] of imgRefs.current) {

        const r = el.getBoundingClientRect();

        if (cx > r.left + 6 && cx < r.right - 6 && cy > r.top + 6 && cy < r.bottom - 6) {

          el.style.position = 'relative';

          el.style.zIndex = '600';

        } else {

          el.style.position = '';

          el.style.zIndex = '';

        }

      }
 
      // Update canvas position

      canvas.style.left = `${pos.x}px`;

      canvas.style.top = `${pos.y}px`;
 
      // Check text overlap for ducking

      let ducking = false;

      document.querySelectorAll('.text-post-block').forEach(el => {

        const r = el.getBoundingClientRect();

        if (cx > r.left && cx < r.right && cy > r.top && cy < r.bottom) ducking = true;

      });
 
      // Choose sprite

      const isStill = stillT.current > 2.2 && dist < 50;

      const moving = dist > 6;

      frameRef.current += dt * (moving ? 7.5 : 1.5);
 
      let sprite: Sprite;

      if (ducking) {

        sprite = DUCK;

      } else if (isStill) {

        lookToggle.current += dt;

        sprite = Math.floor(lookToggle.current * 0.8) % 2 === 0 ? LOOK : LOOK2;

      } else if (moving) {

        sprite = Math.floor(frameRef.current) % 2 === 0 ? WALK1 : WALK2;

      } else {

        sprite = WALK1;

      }
 
      drawSprite(sprite, facingRef.current === 'l');

      raf.current = requestAnimationFrame(loop);

    };
 
    raf.current = requestAnimationFrame(loop);

    return () => {

      cancelAnimationFrame(raf.current);

      window.removeEventListener('mousemove', onMove);

    };

  }, [drawSprite, imgRefs]);
 
  return (
<canvas

      ref={canvasRef}

      width={CW}

      height={CH}

      style={{ position: 'fixed', left: posRef.current.x, top: posRef.current.y, zIndex: 500, pointerEvents: 'none', imageRendering: 'pixelated' }}

    />

  );

}
 
// ─── DAY VIEW ─────────────────────────────────────────────────────────────────
 
function DayView({ monthKey, day, onZoom, onImgRef }: {

  monthKey: string;

  day: number;

  onZoom: (p: PhotoPost) => void;

  onImgRef: (id: string, el: HTMLElement | null) => void;

}) {

  const dData = DATA[monthKey]?.days[day];

  if (!dData) return (
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: CM, color: '#2d1a4d', fontSize: '13px', letterSpacing: '0.1em' }}>

      Selecione um dia no menu lateral.
</div>

  );
 
  const pad2 = (n: number) => String(n).padStart(2, '0');
 
  return (
<article style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '44px 36px 80px', maxWidth: '760px', margin: '0 auto', width: '100%' }}>
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', marginBottom: '36px' }}>
<span style={{ fontFamily: CM, fontSize: '11px', color: '#3a2460', letterSpacing: '0.28em', textTransform: 'uppercase' }}>

          {pad2(day)} · {monthKey}
</span>
<BadgeTag level={dData.badge} large />
<div style={{ width: '100%', maxWidth: '480px' }}>
<MusicPlayer songs={dData.playlist} />
</div>
<div style={{ width: '100%', height: '1px', background: 'linear-gradient(to right, transparent, #1e1035 30%, #1e1035 70%, transparent)' }}/>
</div>
 
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '36px' }}>

        {dData.posts.map((post, i) => {

          const id = `${monthKey}-${day}-${i}`;

          if (post.type === 'photo') return (
<PhotoBlock key={id} post={post} onZoom={() => onZoom(post)} elRef={el => onImgRef(id, el)}/>

          );

          if (post.type === 'gpx') return <GpxTrail key={id} post={post}/>;

          if (post.type === 'text') return <TextBlock key={id} post={post}/>;

          return null;

        })}
</div>
</article>

  );

}
 
// ─── APP ──────────────────────────────────────────────────────────────────────
 
export default function App() {

  const [selMonth, setSelMonth] = useState('02/2024');

  const [selDay, setSelDay] = useState(10);

  const [zoomed, setZoomed] = useState<PhotoPost | null>(null);

  const imgRefs = useRef<Map<string, HTMLElement>>(new Map());
 
  const onImgRef = useCallback((id: string, el: HTMLElement | null) => {

    el ? imgRefs.current.set(id, el) : imgRefs.current.delete(id);

  }, []);
 
  const onSelect = useCallback((m: string, d: number) => {

    setSelMonth(m);

    setSelDay(d);

  }, []);
 
  return (
<div style={{ display: 'flex', minHeight: '100vh', background: '#080512', color: '#d0c4e8' }} className="dark">
<style>{`

        @keyframes badgePulse {

          0%,100% { opacity:1; }

          50%     { opacity:0.55; }

        }

        @keyframes neonFlicker {

          0%,92%,96%,100% { filter:brightness(1); }

          93%             { filter:brightness(1.5) drop-shadow(0 0 8px #ee00ff); }

          95%             { filter:brightness(0.7); }

          97%             { filter:brightness(1.3) drop-shadow(0 0 4px #ee00ff); }

        }

        ::-webkit-scrollbar { width:3px; height:3px; }

        ::-webkit-scrollbar-track { background:transparent; }

        ::-webkit-scrollbar-thumb { background:#1e1035; border-radius:2px; }

        * { scrollbar-width:thin; scrollbar-color:#1e1035 transparent; }

        body { background:#080512; }

      `}</style>
 
      <Sidebar selMonth={selMonth} selDay={selDay} onSelect={onSelect}/>
 
      <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
<DayView

          key={`${selMonth}-${selDay}`}

          monthKey={selMonth}

          day={selDay}

          onZoom={setZoomed}

          onImgRef={onImgRef}

        />
</main>
 
      {zoomed && <PhotoModal post={zoomed} onClose={() => setZoomed(null)}/>}
<PixelChar imgRefs={imgRefs}/>
</div>

  );

}
 
