export type EffectMeta = {
  id: string;
  title: string;
  description: string;
};

export const EFFECT_CATALOG = [
  { id: "cluster", title: "구상성단", description: "중심에 밀집한 별의 분포와 밝기 변화를 표현했습니다." },
  { id: "color-bubbles", title: "색방울", description: "화면 가장자리에서 튕기는 색방울입니다. 서로 겹치는 부분은 더 밝아집니다." },
] as const satisfies readonly EffectMeta[];

export type EffectId = (typeof EFFECT_CATALOG)[number]["id"];
