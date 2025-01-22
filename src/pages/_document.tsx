import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="Conception Musicale et Instrumentale / Musical and Instrumental Design" />
        <meta name="author" content="Maxence Fulconis" />
        <meta name="keywords" content="Maxence Fulconis, music, musical design, instrumental design, composer, musician" />
        
        <meta property="og:title" content="Maxence Fulconis - Musical and Instrumental Design" />
        <meta property="og:description" content="Conception Musicale et Instrumentale / Musical and Instrumental Design" />
        <meta property="og:type" content="website" />
        
        <meta name="robots" content="index, follow" />
        
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}