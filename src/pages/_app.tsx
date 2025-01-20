import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import { Header } from "@/components/Header";
import { LanguageProvider } from "@/contexts/LanguageContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <Layout>
        <link rel="shortcut icon" href="/favicon.ico" />
        <title>Maxence Fulconis</title>
        <div className="flex flex-col w-full justify-center items-center">
          <Header />
          <Component {...pageProps} />
        </div>
      </Layout>
    </LanguageProvider>
  );
}
