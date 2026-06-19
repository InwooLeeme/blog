/**
 * schema.org JSON-LD를 <script>로 삽입.
 * 객체 하나 또는 배열을 받는다. `<`를 escape해 스크립트 조기 종료(XSS)를 막는다.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
