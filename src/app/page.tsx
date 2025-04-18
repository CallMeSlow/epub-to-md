import styles from "./page.module.css";
import { EpubConverter } from "@/features/epub-converter/components/EpubConverter";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <EpubConverter />
      </main>
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} EPUB 转 Markdown 转换器</p>
      </footer>
    </div>
  );
}
