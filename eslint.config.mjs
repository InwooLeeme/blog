import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // 마운트 시 브라우저 API 읽기·하이드레이션 보정 등 정당한 effect 패턴까지 오탐하므로 완화
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default eslintConfig;
