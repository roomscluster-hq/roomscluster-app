import { Inter, Roboto, Open_Sans, Lato, Poppins, Montserrat, Nunito, Merriweather } from "next/font/google";

export const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
export const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-roboto" });
export const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans" });
export const lato = Lato({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-lato" });
export const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins" });
export const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
export const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
export const merriweather = Merriweather({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-merriweather" });

export const fontVariables = [
  inter.variable,
  roboto.variable,
  openSans.variable,
  lato.variable,
  poppins.variable,
  montserrat.variable,
  nunito.variable,
  merriweather.variable,
].join(" ");