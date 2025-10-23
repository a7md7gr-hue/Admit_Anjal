import "./globals.css";
import { Tajawal, Inter } from "next/font/google";

const tajawal = Tajawal({ subsets: ["arabic"], weight: ["400", "500", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600"] });

export const metadata = {
  title: "نظام اختبارات القبول - مدارس الأنجال",
  description: "مدارس الأنجال الأهلية والدولية",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.className} ${inter.className}`}>
        {children}
      </body>
    </html>
  );
}
