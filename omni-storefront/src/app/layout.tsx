import type { Metadata } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import "./globals.css";

const bodoniModa = Bodoni_Moda({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Omni — Nền tảng thương mại premium",
  description:
    "Omni — Nền tảng thương mại B2B2C kết nối hàng nghìn cửa hàng uy tín với hàng triệu người mua. Mua sắm thông minh, bán hàng dễ dàng.",
  keywords: ["mua sắm online", "thương mại điện tử", "sàn thương mại", "omni"],
  authors: [{ name: "Omni Marketplace" }],
  openGraph: {
    title: "Omni — Nền tảng thương mại premium",
    description: "Kết nối hàng nghìn cửa hàng uy tín với hàng triệu người mua.",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="vi"
      className={`${bodoniModa.variable} ${jost.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
