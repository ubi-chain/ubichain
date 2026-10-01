import { createFileRoute } from "@tanstack/react-router";
import { DeskFrame } from "@/components/desk-frame";
import { KindleReader } from "@/components/kindle-reader";
import { tx } from "@/lib/ubi/i18n";
import { useUbi } from "@/lib/ubi/store";

export const Route = createFileRoute("/library")({ component: LibraryPage });

function LibraryPage() {
  const lang = useUbi((s) => s.lang);
  return (
    <DeskFrame
      lang={lang}
      kicker={tx(lang, { ja: "国際共産図書公司", en: "International Communist Library Co.", fr: "Maison internationale des livres" })}
      title={tx(lang, { ja: "図書", en: "Library", fr: "Bibliothèque" })}
      lede={tx(lang, {
        ja: "書庫から開きます。紙面だけ紙色です。パスワードは使いません。",
        en: "Opened from the study. Only the page is paper. No password.",
        fr: "Ouvert depuis l'étude. Seule la page est papier. Pas de mot de passe.",
      })}
      fill
    >
      <KindleReader lang={lang} />
    </DeskFrame>
  );
}
