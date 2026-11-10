import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "风起 · 动态设计档案馆",
  description: "从一支世界赛视觉解析出发。9 个可操作的动态设计实验，逐帧参考、效果对照与实现拆解。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
