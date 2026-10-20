import { ImportForm } from "./import-form";

export default function ImportPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">가져오기</h1>
      <p className="mt-1 text-sm text-muted">
        Claude in Chrome이 만든 스냅샷 JSON을 붙여 넣고 저장하세요. 같은 계정을 같은 날 다시 저장하면 덮어씁니다.
        &quot;1.2만&quot;, &quot;3,401&quot; 같은 화면 표기 숫자는 자동으로 변환됩니다.
      </p>
      <ImportForm />
    </div>
  );
}
