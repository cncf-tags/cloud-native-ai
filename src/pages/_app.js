import "@/styles/globals.css";
import Layout from '../component/Layout';

export default function App({ Component, pageProps }) {
  return (
  <Layout>
    <Component {...pageProps} />
  </Layout>
  )
}