import type { Metadata } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Script from "next/script";
import { GoogleOAuthProvider } from "@react-oauth/google";

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

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const FACEBOOK_APP_ID  = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID  ?? "";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="vi"
      className={`${bodoniModa.variable} ${jost.variable}`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="antialiased">
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          {children}
        </GoogleOAuthProvider>
        <Toaster richColors position="top-right" />

        {/* Facebook JS SDK — khởi tạo async sau khi trang load */}
        <Script id="fb-sdk-init" strategy="afterInteractive">{`
          window.fbAsyncInit = function() {
            FB.init({
              appId   : '${FACEBOOK_APP_ID}',
              cookie  : true,
              xfbml   : true,
              version : 'v19.0'
            });
          };
          (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/vi_VN/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
          }(document, 'script', 'facebook-jssdk'));
        `}</Script>
      </body>
    </html>
  );
}
