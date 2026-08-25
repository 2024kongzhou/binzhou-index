import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-lg">滨州索引</h3>
            <p className="text-sm text-muted-foreground">
              滨州地名志与综合服务平台，记录地方文化，服务本地生活。
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">内容</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/place" className="hover:text-primary">地方志</Link></li>
              <li><Link href="/blog" className="hover:text-primary">博客文章</Link></li>
              <li><Link href="/product" className="hover:text-primary">商品展示</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">关于</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">关于我们</Link></li>
              <li><Link href="/privacy" className="hover:text-primary">隐私政策</Link></li>
              <li><Link href="/contact" className="hover:text-primary">联系方式</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">联系</h4>
            <p className="text-sm text-muted-foreground">
              电话：13326280320<br />
              邮箱：admin@keyi.de5.net
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2026 滨州索引. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
