import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container py-12 max-w-2xl">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold">联系我们</h1>
        <p className="text-muted-foreground">
          需要窗帘测量或墙布施工？立即预约
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="text-center">
          <CardHeader>
            <Phone className="h-12 w-12 text-primary mx-auto" />
            <CardTitle className="mt-4">电话咨询</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">13326280320</p>
            <p className="text-sm text-muted-foreground mt-2">
              工作日 9:00-18:00
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <MessageCircle className="h-12 w-12 text-primary mx-auto" />
            <CardTitle className="mt-4">在线私信</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/messages">
              <Button className="w-full">发送私信</Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-2">
              注册账号后即可给管理员发送私信
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
