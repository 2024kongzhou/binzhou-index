import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "资质说明 | 滨州索引",
  description: "滨州索引工作室运营主体与证照说明。",
};

export default function CredentialsPage() {
  return (
    <div className="container py-12 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">资质说明</h1>
      <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground leading-relaxed">
        <p>
          本站由<strong className="text-foreground">滨州索引工作室</strong>运营，用于收录滨州村庄名录、地方故事与本地生活服务信息。
        </p>
        <p>
          营业执照与相关资质证照正在整理上线。如需核验运营主体，请通过
          <a className="text-primary mx-1" href="mailto:admin@keyi.de5.net">admin@keyi.de5.net</a>
          或电话
          <a className="text-primary mx-1" href="tel:13326280320">13326280320</a>
          联系。
        </p>
        <p>
          本站目前使用免费二级域名 <code>keyi.de5.net</code> 提供访问。ICP 备案将在启用自有域名后办理。
        </p>
        <p>
          <Link href="/contact/" className="text-primary">前往联系我们</Link>
        </p>
      </div>
    </div>
  );
}
