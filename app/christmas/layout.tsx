import { Berkshire_Swash, Nunito_Sans } from "next/font/google";
const christmas = Berkshire_Swash({ weight: "400", subsets: ["latin"], variable: "--font-christmas", display: "swap" });
const cabin = Nunito_Sans({ subsets: ["latin"], variable: "--font-cabin", display: "swap" });
export default function ChristmasLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${christmas.variable} ${cabin.variable}`}>{children}</div>;
}
