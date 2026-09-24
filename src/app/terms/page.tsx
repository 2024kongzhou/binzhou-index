import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "用户协议 | 滨州索引",
  description: "滨州索引网站用户协议。",
};

export default function TermsPage() {
  return (
    <div className="container py-12 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">用户协议</h1>
      <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground leading-relaxed">
        <p>欢迎使用滨州索引。使用本站即表示你同意以下条款。</p>
        <h2 className="text-2xl font-semibold text-foreground">内容说明</h2>
        <p>
          村庄名录来自公开地情资料整理，可能存在缺漏或转写误差。我们会持续校对，但不对历史文本的绝对准确性作保证。
        </p>
        <h2 className="text-2xl font-semibold text-foreground">账号</h2>
        <p>
          你应妥善保管登录信息，不得将账号用于违法或侵权用途。管理员可在发现滥用时停用账号。
        </p>
        <h2 className="text-2xl font-semibold text-foreground">联系</h2>
        <p>
          如有异议或纠错需求，请发送邮件至 admin@keyi.de5.net。
        </p>
      </div>
    </div>
  );
}
