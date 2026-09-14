export type EffectMeta = {
  id: string;
  title: string;
  description: string;
};

export const EFFECT_CATALOG = [
  { id: "cluster", title: "구상성단", description: "밤하늘 한 자리에 촘촘히 모여 은은하게 깜빡이는 별 무리" },
  { id: "color-bubbles", title: "색방울", description: "화면을 떠다니다 가장자리에서 튕겨나가며, 서로 겹치면 빛이 밝게 섞이는 색색의 공들" },
] as const satisfies readonly EffectMeta[];

export type EffectId = (typeof EFFECT_CATALOG)[number]["id"];
