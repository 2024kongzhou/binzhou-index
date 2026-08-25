import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container py-12 max-w-4xl">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold">关于我们</h1>
        <p className="text-muted-foreground">
          滨州索引 - 记录地方文化，服务本地生活
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>我们的使命</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              滨州索引致力于建立滨州最全面的地方文化数字档案，
              收录历史沿革、地名变迁、民俗文化等内容，
              同时提供本地生活服务信息，连接线上线下。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>联系方式</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <span>13326280320</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <span>admin@keyi.de5.net</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <span>山东省滨州市</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
