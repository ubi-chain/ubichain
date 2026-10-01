export type ShelfBook = {
  id: string;
  authorJa: string;
  authorEn: string;
  titleJa: string;
  titleEn: string;
  titleFr: string;
  year: string;
  noteJa: string;
  noteEn: string;
  pages: { ja: string; en: string; fr: string }[];
};

export const BOOKS: ShelfBook[] = [
  {
    id: "manifesto",
    authorJa: "マルクス / エンゲルス",
    authorEn: "Marx / Engels",
    titleJa: "共産党宣言（抄）",
    titleEn: "Manifesto of the Communist Party (excerpts)",
    titleFr: "Manifeste du parti communiste (extraits)",
    year: "1848",
    noteJa: "英語は1888年ムーア訳（パブリックドメイン）。日本語は当サイトの独自要約であり、市販訳の複製ではない。",
    noteEn: "English: 1888 Moore translation (public domain). Japanese is an original paraphrase, not a published translation.",
    pages: [
      {
        en: "A spectre is haunting Europe — the spectre of Communism. All the Powers of old Europe have entered into a holy alliance to exorcise this spectre.",
        ja: "ヨーロッパをさまよっている幻がある。共産の幻である。古いヨーロッパの諸勢力は、この幻を払うために同盟した。",
        fr: "Un spectre hante l'Europe : le spectre du communisme. Toutes les puissances de la vieille Europe se sont unies pour le conjurer.",
      },
      {
        en: "The history of all hitherto existing society is the history of class struggles.",
        ja: "これまでの社会の歴史は、階級の争いの歴史である。",
        fr: "L'histoire de toute société jusqu'à nos jours est l'histoire de luttes de classes.",
      },
      {
        en: "Working men of all countries, unite!",
        ja: "すべての国の労働者は、結び合え。",
        fr: "Prolétaires de tous les pays, unissez-vous !",
      },
      {
        en: "UBICHAIN reads this as a pledge of a floor, not a warrant for harm. The current phase is an economic stability guarantee: capital still sits in banks that can fail.",
        ja: "UBICHAINはこれを最低線の公約として読む。害の許可ではない。現行フェーズは経済の安定保障である。資本はまだ倒産しうる銀行にある。",
        fr: "UBICHAIN lit ceci comme un plancher, non comme un permis de nuire. La phase actuelle est une garantie de stabilité : le capital reste dans des banques qui peuvent faire faillite.",
      },
    ],
  },
  {
    id: "wage",
    authorJa: "カール・マルクス",
    authorEn: "Karl Marx",
    titleJa: "賃労働と資本（抄）",
    titleEn: "Wage Labour and Capital (excerpts)",
    titleFr: "Travail salarié et capital (extraits)",
    year: "1849",
    noteJa: "独自要約。賃金は労働力の値段であり、人の値段ではない。",
    noteEn: "Original paraphrase. Wages price labour-power, not the person.",
    pages: [
      {
        en: "Wages are the price of labour-power. They are not the moral worth of a life. A floor paid without a dossier is closer to that distinction than a wage that vanishes when a bank fails.",
        ja: "賃金は労働力の値段である。生命の道徳的価値ではない。銀行が倒れても残る最低線の方が、その区別に近い。",
        fr: "Le salaire est le prix de la force de travail, non la valeur morale d'une vie. Un plancher qui survit à la banque est plus fidèle à cette distinction.",
      },
      {
        en: "Capital is a social relation. It can sit in a megabank and still be a claim on other people's time. Moving part of it into a public reserve does not abolish the relation; it stops using the poorest as the shock absorber.",
        ja: "資本は社会関係である。メガバンクに置いても、他人の時間への請求である。一部を保障準備金へ移すことは関係の廃止ではない。最貧を衝撃の吸収材にすることをやめることである。",
        fr: "Le capital est un rapport social. Le déplacer en partie dans une réserve publique n'abolit pas le rapport ; cela cesse d'en faire porter le choc aux plus pauvres.",
      },
    ],
  },
  {
    id: "engels",
    authorJa: "フリードリヒ・エンゲルス",
    authorEn: "Friedrich Engels",
    titleJa: "空想から科学へ（抄）",
    titleEn: "Socialism: Utopian and Scientific (excerpts)",
    titleFr: "Socialisme utopique et scientifique (extraits)",
    year: "1880",
    noteJa: "独自要約。科学は予言ではなく、条件を見ること。",
    noteEn: "Original paraphrase. Science is seeing conditions, not fortune-telling.",
    pages: [
      {
        en: "Utopia paints the good city. Science asks which forces already move. UBICHAIN's current phase starts from a fact: capital is concentrated in banks, including megabanks that can fail.",
        ja: "空想は良い都市を描く。科学は、すでに動いている力を問う。UBICHAINの現行フェーズは事実から始まる。資本は銀行に集中し、メガバンクも倒産する。",
        fr: "L'utopie peint la bonne cité. La science demande quelles forces bougent déjà. La phase actuelle part d'un fait : le capital est concentré dans des banques, y compris des mégabanques faillibles.",
      },
      {
        en: "Literature and arts are not a luxury after the reserve. They are how a species keeps a memory of itself. The library company exists so that work can be read, not owned as a trophy.",
        ja: "文芸は準備金のあとで足す贅沢ではない。種が自分の記憶を保つ方法である。図書公司は、作品が読まれるためにある。トロフィーとして所有されるためではない。",
        fr: "Les lettres ne sont pas un luxe après la réserve. Elles sont la mémoire d'une espèce. La maison d'édition existe pour qu'on lise, non pour qu'on collectionne.",
      },
    ],
  },
  {
    id: "hegel-spirit",
    authorJa: "ゲオルク・ヴィルヘルム・フリードリヒ・ヘーゲル",
    authorEn: "G. W. F. Hegel",
    titleJa: "精神現象学 序文（抄）",
    titleEn: "Phenomenology of Spirit, Preface (excerpts)",
    titleFr: "Phénoménologie de l'esprit, préface (extraits)",
    year: "1807",
    noteJa: "独自要約。真理は結果だけでなく、そこに至る過程である。",
    noteEn: "Original paraphrase. Truth is the process as well as the result.",
    pages: [
      {
        en: "The true is the whole. A number that hides insolvency is not a whole. Daily learning that names bank stress, then moves capital into a public reserve, is closer to a process than a slogan.",
        ja: "真なるものは全体である。倒産を隠す数字は全体ではない。銀行の応力を名指し、資本を保障準備金へ移す日次学習の方が、スローガンより過程に近い。",
        fr: "Le vrai est le tout. Un chiffre qui cache l'insolvabilité n'est pas un tout. L'apprentissage quotidien qui nomme la tension bancaire s'approche davantage d'un processus.",
      },
    ],
  },
  {
    id: "hegel-right",
    authorJa: "ゲオルク・ヴィルヘルム・フリードリヒ・ヘーゲル",
    authorEn: "G. W. F. Hegel",
    titleJa: "法の哲学（抄）— 国家から国際法へ",
    titleEn: "Philosophy of Right (excerpts) — from the state to international law",
    titleFr: "Philosophie du droit (extraits) — de l'État au droit international",
    year: "1821",
    noteJa: "英語の有名句は19世紀訳に基づく短い引用。日本語は独自。法と国家から国際法を樹立する。",
    noteEn: "Short 19th-century English lines plus original commentary. From right and the state toward international law.",
    pages: [
      {
        en: "The state is the actuality of the ethical Idea. That actuality is not a license to starve a person on the far side of a border.",
        ja: "国家は倫理的理念の現実である。その現実は、国境の向こうの人を飢えさせる免許ではない。",
        fr: "L'État est l'effectivité de l'idée éthique. Cette effectivité n'est pas un permis de laisser affamer au-delà de la frontière.",
      },
      {
        en: "International law is the thin promise between states. UBICHAIN treats the person as the end of that promise: a floor that follows them, thicker where war, conflict, or disaster has already taken the rest.",
        ja: "国際法は国家のあいだの薄い約束である。UBICHAINはその約束の目的を人とする。戦争・紛争・災害ですでに失われた場所ほど、最低線を厚くする。",
        fr: "Le droit international est la promesse mince entre États. UBICHAIN en fait une fin : la personne. Le plancher s'épaissit là où guerre, conflit ou désastre ont déjà tout pris.",
      },
    ],
  },
  {
    id: "mendel",
    authorJa: "グレゴール・メンデル",
    authorEn: "Gregor Mendel",
    titleJa: "植物雑種の実験（公開要約）",
    titleEn: "Experiments on Plant Hybrids (public summary)",
    titleFr: "Expériences sur les hybrides végétaux (résumé public)",
    year: "1866",
    noteJa: "原著 Versuche über Pflanzen-Hybriden（1866）はパブリックドメイン。本文は書庫の要約であり、写しではない。",
    noteEn: "Bibliographic summary of the 1866 paper. Not a facsimile.",
    pages: [
      {
        ja: "エンドウの交配で、対立する形質は雑種第一代では一方が現れ、次代で一定の比に分かれた。これが分離の観察である。",
        en: "In pea crosses, one contrasting trait showed in the first hybrid generation and split in a regular ratio in the next. That is the observation behind segregation.",
        fr: "Chez le pois, un caractère domine en première génération, puis se sépare selon un rapport régulier. C'est l'observation de la ségrégation.",
      },
      {
        ja: "別の形質の組は、互いに縛られずに分かれることがある。公開されている法則の呼び名は独立の法則である。",
        en: "Separate trait pairs can sort without being tied to each other. The public name for that observation is independent assortment.",
        fr: "Des paires de caractères distinctes peuvent se répartir sans être liées. Le nom public est l'assortiment indépendant.",
      },
    ],
  },
  {
    id: "mendel-laws",
    authorJa: "グレゴール・メンデル",
    authorEn: "Gregor Mendel",
    titleJa: "メンデルの法則（公開要約）",
    titleEn: "Mendel's laws (public summary)",
    titleFr: "Lois de Mendel (résumé public)",
    year: "1866",
    noteJa: "依頼表記の「マーべリングの法則」に対応する公開文献は見当たらない。この棚はメンデルの分離・独立・優劣として載せる。架空の法則は作らない。",
    noteEn: "No public law matches the wording “マーべリング”. This shelf is Mendel's dominance, segregation, and independent assortment.",
    pages: [
      {
        ja: "優劣・分離・独立。三つは1866年のエンドウ実験から後年に整理された呼び名である。粒子としての遺伝因子は、のちの遺伝子概念の手前にある。",
        en: "Dominance, segregation, and independent assortment are later names for the 1866 pea experiments. The hereditary factors sit before the later word gene.",
        fr: "Dominance, ségrégation, indépendance : noms posés plus tard sur les expériences de 1866. Les facteurs héréditaires précèdent le mot gène.",
      },
    ],
  },
  {
    id: "watson-crick",
    authorJa: "ワトソン / クリック",
    authorEn: "Watson / Crick",
    titleJa: "核酸の分子構造（書誌）",
    titleEn: "Molecular structure of nucleic acids (citation)",
    titleFr: "Structure moléculaire des acides nucléiques (notice)",
    year: "1953",
    noteJa: "Nature 171, 737–738（1953）。論文本文は転載しない。書誌と一行の説明だけ。",
    noteEn: "Citation only: Nature 171, 737–738 (1953). The article text is not reproduced.",
    pages: [
      {
        ja: "J. D. Watson と F. H. C. Crick は1953年、DNAが二本の鎖でらせんをなす構造を提案した、と書誌に残る。この頁はその論文の複製ではない。",
        en: "The 1953 Nature note by J. D. Watson and F. H. C. Crick proposed a double helical structure for DNA. This page is not a copy of that article.",
        fr: "La note de 1953 dans Nature propose une double hélice pour l'ADN. Cette page n'en est pas une copie.",
      },
    ],
  },
  {
    id: "barcode",
    authorJa: "ウッドランド / シルバー",
    authorEn: "Woodland / Silver",
    titleJa: "バーコード（公開史）",
    titleEn: "Barcode (public history)",
    titleFr: "Code-barres (histoire publique)",
    year: "1952",
    noteJa: "米国特許 2,612,994（Norman Joseph Woodland, Bernard Silver, 1952）。UPCは1970年代の店頭規格。",
    noteEn: "US patent 2,612,994 (1952). UPC is the later retail standard.",
    pages: [
      {
        ja: "太さの違う縦線で数字を機械が読む。特許は1952年。店のUPCとして広がったのは1970年代である。",
        en: "Bars of different widths let a machine read a number. The patent is 1952. Retail UPC spread in the 1970s.",
        fr: "Des barres de largeurs différentes permettent à une machine de lire un nombre. Brevet de 1952. L'UPC se répand dans les années 1970.",
      },
    ],
  },
  {
    id: "qr",
    authorJa: "原 昌宏 / デンソーウェーブ",
    authorEn: "Masahiro Hara / Denso Wave",
    titleJa: "QRコード（公開史）",
    titleEn: "QR Code (public history)",
    titleFr: "QR Code (histoire publique)",
    year: "1994",
    noteJa: "1994年、デンソー（現デンソーウェーブ）が公開。規格は ISO/IEC 18004。仕様書は転載しない。",
    noteEn: "Released in 1994 by Denso, now Denso Wave. Specified as ISO/IEC 18004. The specification is not copied.",
    pages: [
      {
        ja: "二次元の白黒モジュールと、三つの切り出しシンボルで向きを取る。工場の部品管理から始まった公開規格である。",
        en: "A grid of modules plus three finder patterns that set orientation. A public standard that started in factory part tracking.",
        fr: "Une grille de modules et trois repères d'orientation. Norme publique née du suivi de pièces en usine.",
      },
    ],
  },
  {
    id: "led",
    authorJa: "公開記録",
    authorEn: "Public record",
    titleJa: "LEDの公開史",
    titleEn: "LED, public history",
    titleFr: "LED, histoire publique",
    year: "1962",
    noteJa: "巻島昇美という著者のLED原著は、参照した公開目録に見当たらない。架空の著作は載せない。可視光LEDはNick Holonyak Jr.（1962）。青色は赤崎勇・天野浩・中村修二（ノーベル物理学賞 2014）。",
    noteEn: "No LED monograph by 巻島昇美 was found in the public record used here, so none is invented. Visible LED: Nick Holonyak Jr., 1962. Blue LED: Isamu Akasaki, Hiroshi Amano, Shuji Nakamura, Nobel Prize in Physics 2014.",
    pages: [
      {
        ja: "1907年に炭化ケイ素の電界発光が報告され、1962年に可視の赤いLEDが作られた。白い照明に必要な明るい青は、窒化ガリウムの結晶とp型化のあとで実用になった。",
        en: "Electroluminescence in silicon carbide was reported in 1907. A visible red LED was made in 1962. Bright blue, needed for white lamps, became practical after gallium nitride crystals and p-type doping.",
        fr: "L'électroluminescence du carbure de silicium est signalée en 1907. Une LED rouge visible date de 1962. Le bleu utile pour le blanc suit les cristaux de nitrure de gallium.",
      },
    ],
  },
];
