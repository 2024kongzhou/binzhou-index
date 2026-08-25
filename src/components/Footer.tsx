import Link from "next/link";
import { MapPin, Mail, Phone, Landmark, FileText, ShoppingBag, Newspaper, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Landmark className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">滨州索引</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              滨州地名志与综合服务平台，记录地方文化，服务本地生活。
              致力于打造滨州最全面的本地信息门户。
            </p>
            <div className="flex gap-3 pt-2">
              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                <span className="text-xs font-bold text-white">微</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                <span className="text-xs font-bold text-white">抖</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">内容</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/place" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                  <Landmark className="h-4 w-4" /> 地方志
                </Link>
              </li>
              <li>
                <Link href="/blog" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                  <FileText className="h-4 w-4" /> 博客文章
                </Link>
              </li>
              <li>
                <Link href="/product" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                  <ShoppingBag className="h-4 w-4" /> 商品展示
                </Link>
              </li>
              <li>
                <Link href="/about" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                  <Newspaper className="h-4 w-4" /> 关于我们
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">服务</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/contact" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                  <ArrowUpRight className="h-4 w-4" /> 窗帘定制
                </Link>
              </li>
              <li>
                <Link href="/contact" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                  <ArrowUpRight className="h-4 w-4" /> 墙布施工
                </Link>
              </li>
              <li>
                <Link href="/contact" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                  <ArrowUpRight className="h-4 w-4" /> 免费测量
                </Link>
              </li>
              <li>
                <Link href="/contact" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                  <ArrowUpRight className="h-4 w-4" /> 上门安装
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">联系我们</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-amber-400" />
                <span>13326280320</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-amber-400" />
                <span>admin@keyi.de5.net</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-amber-400 mt-0.5" />
                <span>山东省滨州市</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} 滨州索引. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">隐私政策</Link>
            <Link href="/about" className="hover:text-slate-300 transition-colors">关于我们</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">联系方式</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
