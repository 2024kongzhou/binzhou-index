export default function PrivacyPage() {
  return (
    <div className="container py-12 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">隐私政策</h1>
      <div className="prose prose-slate max-w-none">
        <h2 className="text-2xl font-semibold mt-8 mb-4">信息收集</h2>
        <p className="text-muted-foreground leading-relaxed">
          我们收集您在使用本网站时提供的必要信息，包括用户名、邮箱地址等。
          这些信息仅用于账号认证和为您提供服务。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">信息使用</h2>
        <p className="text-muted-foreground leading-relaxed">
          您的个人信息仅用于网站功能实现，我们不会将您的信息出售或分享给第三方。
          私信系统仅支持向管理员发送消息，无法向其他用户发送。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">数据安全</h2>
        <p className="text-muted-foreground leading-relaxed">
          我们采用业界标准的安全措施保护您的数据，
          包括密码哈希存储、JWT认证、HTTPS传输加密等。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Cookie使用</h2>
        <p className="text-muted-foreground leading-relaxed">
          我们使用Cookie来维持您的登录状态，这些Cookie具有HttpOnly和Secure属性，
          无法被JavaScript读取，有效防止XSS攻击。
        </p>
      </div>
    </div>
  );
}
