"use client";

import { useRef } from "react";
import { rand, useCanvasScene } from "./canvas";

/**
 * 색방울 — 색색의 공 여러 개가 화면을 자유롭게 떠다니다 가장자리에 부딪히면
 * 반대 방향으로 튕겨나간다. 공은 부드러운 글로우로 그려지고 가산 합성으로
 * 겹치는 부분은 색이 밝게 포화되어 메타볼처럼 뭉치는 느낌을 낸다.
 * 각 공의 색은 처음 정해진 뒤 바뀌지 않고, 부딪힐 때마다 각도에 약간의
 * 무작위성을 더해 궤적이 매번 달라진다.
 */
const TAU = Math.PI * 2; // 360도(라디안). 원을 한 바퀴 그리거나 각도를 랜덤으로 뽑을 때 쓴다.

// 여기 값들만 바꿔도 이펙트 전체 느낌이 달라진다. 숫자를 바꾼 뒤 저장하면
// dev 서버가 바로 반영해준다(플레이그라운드 페이지 새로고침).
const CONFIG = {
  count: 28, // 공 개수. 늘리면 화면이 더 붐비고 겹침(색 섞임)도 잦아진다.
  radiusFrac: [0.1, 0.25] as readonly [number, number], // 공 반지름 = "화면 짧은 변 길이" × [최소, 최대] 사이 랜덤 값.
  // 공마다 스폰될 때 이 범위 안에서 반지름을 하나씩 뽑아 크기가 제각각이 된다.
  // 두 값을 같게 만들면(예: [0.07, 0.07]) 예전처럼 모든 공이 같은 크기로 돌아간다.
  // 범위를 넓히면(예: [0.02, 0.15]) 크기 차이가 더 극단적으로 벌어진다.
  glowScale: 1.5, // 실제로 화면에 그려지는 글로우 반지름 = 공 반지름 × 이 값.
  // 1보다 크게 잡아서 공끼리 물리적으로 닿기 전에도 글로우가 먼저 겹쳐 색이 섞여 보이게 한다.
  // 값을 키우면 더 멀리서부터 색이 섞이고(뭉게뭉게해짐), 1에 가까울수록 경계가 또렷해진다.
  coreFrac: 0.5, // 글로우 반지름 중 "알파 1로 꽉 찬 단색 코어"가 차지하는 비율(0~1).
  // 0이면 중심부터 곧바로 옅어져 안개 같은 글로우가 되고, 0.5면 안쪽 절반이 단색 원판이고
  // 바깥 절반만 흐려져서 사진의 보케(초점 나간 빛망울)처럼 보인다. 1에 가까울수록 테두리가 또렷해진다.
  speed: [150, 500] as readonly [number, number], // 공의 이동 속도(px/초) [최소, 최대] 랜덤 범위.
  // 공마다 스폰될 때 이 범위 안에서 속도를 하나 뽑아 평생 그 빠르기를 유지한다
  // (벽에 튕겨도 rotateJitter가 방향만 바꾸고 빠르기는 그대로 보존한다).
  // 두 값을 같게 만들면 모든 공이 똑같은 속도로 움직인다.
  bounceJitter: 0.35, // 벽에 튕길 때 반사각에 더하는 무작위 각도(라디안, 최대치).
  // 0으로 두면 당구공처럼 정확히 반사되고 매번 같은 패턴으로 움직인다.
  // 값을 키우면 튕길 때마다 방향이 더 크게 흐트러져서 궤적이 예측하기 어려워진다.
  hueChoices: [0, 30, 60, 90, 130, 165, 190, 215, 250, 285, 315, 340], // 공 색상 후보(HSL의 hue, 0~360도).
  // 공은 스폰될 때 이 배열에서 하나를 골라 평생 그 색을 유지한다(충돌해도 안 바뀜).
  // 색을 더 넣거나 빼면 팔레트가 그만큼 다양해지거나 단조로워진다.
  // 아래 saturation/lightness가 순색(100%/50%)이라 노랑·연두(60~130도)도 탁해지지 않고 쨍하게 나온다.
  saturation: 100, // 채도(%). 100이 아니면 색에 회색이 섞여 겹칠 때 탁해진다.
  lightness: 50, // 명도(%). 50이 "순색"이다 — 예: hsl(0,100%,50%) = rgb(255,0,0).
  // 이 값을 올리면(예: 70) 색 자체에 흰색이 섞여서(rgb(247,110,110) 같은 연어살색) 파스텔톤이 되고,
  // 가산 합성 특성상 두 개만 겹쳐도 곧바로 흰색으로 포화돼 색이 다 날아간다. 50을 유지하는 게 좋다.
  bg: "#000000", // 캔버스 배경색. 매 프레임 이걸로 화면을 지우고 다시 그린다.
  // 검정에 가까울수록 가산 합성된 색이 선명하게 뜬다. 밝게 하면 전체적으로 뿌옇게 들뜬다.
} as const;

// 공을 그릴 원형 그라디언트의 알파 곡선. 모든 공이 같은 모양을 쓰므로 한 번만 만들어 두고,
// 공마다 hue만 갈아끼워 색 문자열로 굳힌다(spawnBall 참고).
// stop을 0/1 두 개만 쓰면(선형 보간) 가장자리에서 알파가 뚝 끊겨 "테두리"처럼 보이므로,
// smoothstep 곡선을 다섯 점으로 흉내 내 경계 없이 부드럽게 사라지게 한다.
// 첫 stop이 t=coreFrac이라 그 안쪽(0~coreFrac)은 캔버스가 첫 stop 색으로 꽉 채운다 = 단색 코어.
// t는 중심(0)~가장자리(1) 위치, a는 그 지점의 상대 알파(1=진하게, 0=투명).
const FALLOFF = [0, 0.25, 0.5, 0.75, 1].map((u) => ({
  t: CONFIG.coreFrac + (1 - CONFIG.coreFrac) * u,
  a: 1 - u * u * (3 - 2 * u), // 1 - smoothstep(u)
}));

// 공 하나의 상태값. x,y는 위치, vx,vy는 초당 이동량(속도 벡터), r은 반지름, hue는 색상.
// glowR·stops는 r·hue가 정해지면 다시 안 바뀌는 값이라(둘 다 평생 고정), 매 프레임 다시
// 계산하지 않도록 스폰 시 미리 만들어 둔 파생값이다 — render()의 핫 패스를 가볍게 해준다.
type Ball = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  hue: number;
  glowR: number; // 실제로 그려지는 글로우 반지름(= r × glowScale)
  stops: { t: number; color: string }[]; // FALLOFF를 이 공의 hue로 미리 색칠해 둔 그라디언트 stop
};

/** 공 하나를 화면 안 랜덤 위치·랜덤 방향으로 새로 만든다. resize(최초 생성) 때 호출된다. */
function spawnBall(width: number, height: number): Ball {
  // radiusFrac [최소, 최대] 범위 안에서 이 공만의 반지름 비율을 랜덤으로 하나 뽑는다.
  const r = rand(...CONFIG.radiusFrac) * Math.min(width, height);
  const angle = rand(0, TAU); // 0~360도 중 랜덤 방향으로 출발
  // speed [최소, 최대] 범위 안에서 이 공만의 빠르기를 랜덤으로 하나 뽑는다.
  const speed = rand(...CONFIG.speed);
  const hue = CONFIG.hueChoices[Math.floor(rand(0, CONFIG.hueChoices.length))]; // 팔레트에서 랜덤 색 하나 고정
  return {
    // 공이 화면 밖으로 튀어나가지 않도록 반지름만큼 안쪽 범위에서만 스폰 위치를 뽑는다.
    x: rand(r, width - r),
    y: rand(r, height - r),
    r,
    vx: Math.cos(angle) * speed, // 방향(angle)을 x,y 속도 성분으로 분해
    vy: Math.sin(angle) * speed,
    hue,
    glowR: r * CONFIG.glowScale,
    stops: FALLOFF.map(({ t, a }) => ({
      t,
      color: `hsla(${hue}, ${CONFIG.saturation}%, ${CONFIG.lightness}%, ${a})`,
    })),
  };
}

/**
 * 한 축(가로 또는 세로)의 벽 충돌만 검사해, 튕겼으면 위치를 벽에 붙게 보정하고 속도를 반사시킨다.
 * x축·y축 충돌 로직이 필드 이름만 다를 뿐 완전히 같은 모양이라, 볼 필드명을 인자로 받아 공용으로 뺐다.
 * pos/vel은 ball의 필드 이름("x"/"vx" 또는 "y"/"vy"), extent는 그 축의 화면 크기.
 * 튕겼으면 true를 돌려주고, 호출부는 그때만 jitter를 더한다.
 */
function bounceAxis(ball: Ball, pos: "x" | "y", vel: "vx" | "vy", extent: number): boolean {
  if (ball[pos] < ball.r) {
    ball[pos] = ball.r;
    ball[vel] = Math.abs(ball[vel]);
    return true;
  }
  if (ball[pos] > extent - ball.r) {
    ball[pos] = extent - ball.r;
    ball[vel] = -Math.abs(ball[vel]);
    return true;
  }
  return false;
}

export default function ColorBubbles() {
  const ref = useRef<HTMLCanvasElement>(null);

  // useCanvasScene이 캔버스 크기 조정·requestAnimationFrame 루프·정리(cleanup)를 대신 해주고,
  // 우리는 resize/frame/drawStatic 세 콜백만 채워 넣으면 된다.
  useCanvasScene(ref, ({ ctx }) => {
    let width = 0;
    let height = 0;
    let balls: Ball[] = [];

    /** 현재 balls 배열 상태를 캔버스에 한 프레임 그린다. */
    const render = () => {
      // 1) 배경을 불투명하게 덮어써서 이전 프레임 잔상을 지운다(일반 합성 모드).
      ctx.fillStyle = CONFIG.bg;
      ctx.fillRect(0, 0, width, height);

      // 2) "lighter"는 가산(더하기) 합성 모드다. 두 도형이 겹치는 픽셀은 RGB 값이
      //    그냥 더해진다(255에서 saturate). 그래서 서로 다른 색 공이 겹치면 색이
      //    섞이면서 더 밝아지고, 같은 색끼리 겹치면 하얗게 포화된다 — 이게 "메타볼처럼
      //    겹친 부분이 밝아지는" 효과의 핵심이다. 이 줄을 "source-over"로 바꾸면
      //    그냥 마지막에 그린 공이 앞의 공을 덮어써서 섞임 효과가 사라진다.
      ctx.globalCompositeOperation = "lighter";
      for (const b of balls) {
        // 공 하나를 "가운데는 진하고 가장자리로 갈수록 투명해지는" 원형 그라디언트로 그린다.
        // 이 그라디언트 자체가 공의 실제 모양이다(별도의 단색 원을 덧그리지 않는다).
        // stops·glowR은 스폰 시 미리 계산해 둔 값이라(r·hue가 안 바뀌므로) 매 프레임 다시
        // 만들지 않는다 — 위치(g의 중심)만 매 프레임 새로 잡고 색은 재사용한다.
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.glowR);
        for (const { t, color } of b.stops) g.addColorStop(t, color);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.glowR, 0, TAU);
        ctx.fill();
      }
      // 3) 이후 다른 곳에서 이 컨텍스트를 또 쓸 수 있으니 합성 모드를 기본값으로 되돌려 둔다.
      ctx.globalCompositeOperation = "source-over";
    };

    return {
      // 최초 마운트 시 + 창 크기가 바뀔 때마다 호출된다. 여기서 공 배열을 새로 만든다.
      // (리사이즈될 때마다 공이 리셋되는 게 싫다면, 기존 balls를 유지하고 위치만
      //  화면 안으로 clamp하는 식으로 바꿀 수 있다.)
      resize(w, h) {
        width = w;
        height = h;
        balls = Array.from({ length: CONFIG.count }, () => spawnBall(w, h));
      },
      // 매 애니메이션 프레임마다 호출된다. dt는 직전 프레임과의 시간 간격(초)이라,
      // "속도(px/초) × dt"로 이동시키면 프레임 속도(FPS)와 무관하게 일정한 속도로 움직인다.
      frame(dt) {
        for (const ball of balls) {
          ball.x += ball.vx * dt;
          ball.y += ball.vy * dt;

          // 벽 충돌 판정: 공의 중심이 "반지름만큼 벽에서 떨어진 지점"을 넘어서면 튕긴다.
          // x축·y축 각각 bounceAxis로 위치 보정 + 반사를 처리하고, 튕긴 축에서만 jitter를 더한다.
          // (모서리에 부딪히면 두 축 다 true라 jitter가 두 번 적용된다 — 의도한 동작이다.)
          if (bounceAxis(ball, "x", "vx", width)) rotateJitter(ball);
          if (bounceAxis(ball, "y", "vy", height)) rotateJitter(ball);
        }

        render();
      },
      // prefers-reduced-motion 사용자거나 리사이즈 직후처럼 "애니메이션 없이 한 장만"
      // 그려야 할 때 호출된다. frame과 달리 dt가 없어 물리 갱신 없이 render()만 한다.
      drawStatic: render,
    };
  });

  return <canvas ref={ref} aria-hidden className="absolute inset-0" />;
}

/**
 * 벽에 반사된 직후의 속도 벡터에 랜덤한 각도를 살짝 더해준다.
 * 이게 없으면 모든 공이 처음 튕긴 각도 그대로 영원히 똑같은 패턴으로 왕복해서
 * (당구공처럼) 움직임이 금방 반복돼 보인다. CONFIG.bounceJitter로 흔들림 정도를 조절한다.
 */
function rotateJitter(ball: Ball) {
  const speed = Math.hypot(ball.vx, ball.vy); // 속도 벡터의 크기(빠르기)는 그대로 보존
  const angle = Math.atan2(ball.vy, ball.vx) + rand(-CONFIG.bounceJitter, CONFIG.bounceJitter);
  ball.vx = Math.cos(angle) * speed; // 같은 빠르기, 살짝 다른 방향으로 재분해
  ball.vy = Math.sin(angle) * speed;
}
