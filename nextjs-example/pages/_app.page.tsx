import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useInitParentSocketEffect } from "@pbkit/wrp-jotai/parent";

function MyApp({ Component, pageProps }: AppProps) {
  useInitParentSocketEffect();
  return <Component {...pageProps} />;
}

export default MyApp;
