export type CharterLine = { ja: string; en: string; fr: string };

export type CharterBlock = {
  id: string;
  title: CharterLine;
  paras: CharterLine[];
};

export const CHARTER: CharterBlock[] = [
  {
    id: "preamble",
    title: { ja: "前文", en: "Preamble", fr: "Préambule" },
    paras: [
      {
        ja: "私たちは、人間の尊厳と共同体の繁栄は対立するものではなく、互いに支え合うことで実現されると信じる。",
        en: "We believe that human dignity and the prosperity of the community are not opposites: they are realized by supporting one another.",
        fr: "Nous croyons que la dignité humaine et la prospérité de la communauté ne s'opposent pas : elles se réalisent en se soutenant.",
      },
      {
        ja: "経済は人間のために存在し、国家は国民全体の利益のために存在する。市場は豊かさを生み出す力を持つ一方で、放置すれば格差や独占を生み出す。国家は自由を奪う存在ではなく、公正な競争と生活の安定を保障するための公共機関でなければならない。",
        en: "The economy exists for people; the state exists for the interest of the people as a whole. Markets can create plenty, yet left alone they produce inequality and monopoly. The state must not take freedom away: it is a public institution that guarantees fair competition and a stable life.",
        fr: "L'économie existe pour les êtres humains ; l'État existe pour l'intérêt de l'ensemble du peuple. Le marché peut créer l'abondance, mais laissé à lui-même il produit l'inégalité et le monopole. L'État ne doit pas ôter la liberté : il est une institution publique qui garantit une concurrence juste et une vie stable.",
      },
      {
        ja: "私たちは、自由、民主主義、法の支配、社会的連帯を基礎とし、科学的知見と現実に基づく政策によって、人間の能力が最大限に発揮される「共栄社会」の実現を目指す。",
        en: "On the basis of freedom, democracy, the rule of law, and social solidarity, and by policy grounded in scientific knowledge and fact, we aim at a society of shared prosperity in which human capacities can be fully exercised.",
        fr: "Sur le fondement de la liberté, de la démocratie, de l'État de droit et de la solidarité sociale, par une politique fondée sur la connaissance scientifique et le réel, nous visons une société de coprospérité où les capacités humaines s'exercent pleinement.",
      },
      {
        ja: "国家は公共善を実現するために存在し、労働は人間の尊厳の表現であり、経済は国民生活を豊かにするための手段である。私たちは、市場経済の活力と公共の責任を調和させ、社会全体が共に発展する経済秩序を築く。",
        en: "The state exists to realize the public good. Labor is an expression of human dignity. The economy is a means to enrich the life of the people. We will reconcile the vigor of a market economy with public responsibility, and build an economic order in which society as a whole develops together.",
        fr: "L'État existe pour réaliser le bien public. Le travail est une expression de la dignité humaine. L'économie est un moyen d'enrichir la vie du peuple. Nous concilierons la vigueur de l'économie de marché et la responsabilité publique, et bâtirons un ordre où la société entière se développe ensemble.",
      },
    ],
  },
  {
    id: "1",
    title: { ja: "第一章　国家", en: "Chapter I · The state", fr: "Chapitre I · L'État" },
    paras: [
      {
        ja: "国家は国民全体の利益を代表し、法の支配と民主主義を基礎とする。",
        en: "The state represents the interest of the people as a whole, and is founded on the rule of law and democracy.",
        fr: "L'État représente l'intérêt de l'ensemble du peuple, et se fonde sur l'État de droit et la démocratie.",
      },
      {
        ja: "国家権力は憲法に拘束され、基本的人権、司法の独立及び地方自治を保障する。",
        en: "State power is bound by the constitution, and guarantees fundamental human rights, the independence of the judiciary, and local self-government.",
        fr: "Le pouvoir d'État est lié par la Constitution et garantit les droits fondamentaux, l'indépendance de la justice et l'autonomie locale.",
      },
      {
        ja: "行政は透明性と説明責任を負い、腐敗及び権力の私物化を許さない。",
        en: "The administration bears transparency and accountability, and does not permit corruption or the private capture of power.",
        fr: "L'administration assume la transparence et la responsabilité, et n'admet ni la corruption ni la captation privée du pouvoir.",
      },
      {
        ja: "国家は公共利益を実現するための制度であり、自由と秩序の調和を図る。",
        en: "The state is an institution for realizing the public interest, and seeks a harmony of freedom and order.",
        fr: "L'État est une institution pour réaliser l'intérêt public, et vise l'harmonie de la liberté et de l'ordre.",
      },
    ],
  },
  {
    id: "2",
    title: { ja: "第二章　経済", en: "Chapter II · The economy", fr: "Chapitre II · L'économie" },
    paras: [
      {
        ja: "市場経済を基本としつつ、公共利益のため国家は必要かつ適切な役割を果たす。",
        en: "The market economy is the basis; for the public interest the state plays a necessary and proper role.",
        fr: "L'économie de marché est la base ; pour l'intérêt public l'État joue un rôle nécessaire et approprié.",
      },
      {
        ja: "完全雇用を国家の重要目標とする。",
        en: "Full employment is a principal aim of the state.",
        fr: "Le plein emploi est un objectif majeur de l'État.",
      },
      {
        ja: "景気後退時には積極財政を行い、有効需要を創出する。",
        en: "In recession the state conducts an active fiscal policy and creates effective demand.",
        fr: "En récession, l'État mène une politique budgétaire active et crée une demande effective.",
      },
      {
        ja: "教育、医療、科学技術、交通、情報通信及びインフラへの公共投資を推進する。",
        en: "Public investment is advanced in education, medicine, science and technology, transport, information and communications, and infrastructure.",
        fr: "L'investissement public est poussé dans l'éducation, la médecine, la science et la technique, les transports, l'information et les communications, et les infrastructures.",
      },
      {
        ja: "独占及び投機を防止し、公正な競争を維持する。",
        en: "Monopoly and speculation are prevented, and fair competition is maintained.",
        fr: "Le monopole et la spéculation sont empêchés, et une concurrence juste est maintenue.",
      },
      {
        ja: "中小企業及び地域産業を国家戦略として育成する。",
        en: "Small and medium firms and regional industry are fostered as a national strategy.",
        fr: "Les PME et l'industrie régionale sont élevées comme stratégie nationale.",
      },
    ],
  },
  {
    id: "3",
    title: { ja: "第三章　労働", en: "Chapter III · Labor", fr: "Chapitre III · Le travail" },
    paras: [
      {
        ja: "労働は単なる商品ではなく、人間の尊厳の表現である。",
        en: "Labor is not a mere commodity; it is an expression of human dignity.",
        fr: "Le travail n'est pas une simple marchandise ; il est une expression de la dignité humaine.",
      },
      {
        ja: "適正な賃金、安全な労働環境及び十分な休暇を保障する。",
        en: "Fair wages, a safe workplace, and sufficient rest are guaranteed.",
        fr: "Un salaire juste, un lieu de travail sûr et un repos suffisant sont garantis.",
      },
      {
        ja: "労使協議を重視し、対立より協調を基本原則とする。",
        en: "Labor–management consultation is given weight; cooperation, not confrontation, is the basic principle.",
        fr: "La concertation patronale-salariale est primordiale ; la coopération, non l'affrontement, est le principe.",
      },
      {
        ja: "労働組合の活動を保障するとともに、生産性向上への協力を促進する。",
        en: "Trade-union activity is guaranteed, and cooperation toward higher productivity is promoted.",
        fr: "L'activité syndicale est garantie, et la coopération à la productivité est encouragée.",
      },
      {
        ja: "AI及び自動化による利益は社会全体へ還元される制度を整備する。",
        en: "Gains from AI and automation are returned to society as a whole by institution.",
        fr: "Les gains de l'IA et de l'automatisation sont restitués à l'ensemble de la société par institution.",
      },
    ],
  },
  {
    id: "4",
    title: { ja: "第四章　社会保障", en: "Chapter IV · Social security", fr: "Chapitre IV · Sécurité sociale" },
    paras: [
      {
        ja: "医療、教育、年金及び介護を普遍的な社会保障として維持・充実する。",
        en: "Medicine, education, pensions, and care are maintained and thickened as universal social security.",
        fr: "La médecine, l'éducation, les pensions et le soin sont maintenus et épaissis comme sécurité sociale universelle.",
      },
      {
        ja: "子育て支援を国家の責務とする。",
        en: "Support for raising children is a duty of the state.",
        fr: "Le soutien à l'éducation des enfants est un devoir de l'État.",
      },
      {
        ja: "住宅政策を充実させ、誰もが安心して暮らせる社会を実現する。",
        en: "Housing policy is thickened so that everyone can live in security.",
        fr: "La politique du logement est épaissie pour que chacun vive en sécurité.",
      },
      {
        ja: "高齢者、障害者及び子どもの権利を保障する。",
        en: "The rights of older people, disabled people, and children are guaranteed.",
        fr: "Les droits des aînés, des personnes handicapées et des enfants sont garantis.",
      },
    ],
  },
  {
    id: "5",
    title: { ja: "第五章　税制", en: "Chapter V · Taxation", fr: "Chapitre V · Fiscalité" },
    paras: [
      {
        ja: "応能負担を基本原則とする。",
        en: "Ability to pay is the basic principle.",
        fr: "La contribution selon les moyens est le principe.",
      },
      {
        ja: "富の過度な集中を防止する。",
        en: "Excessive concentration of wealth is prevented.",
        fr: "La concentration excessive de la richesse est empêchée.",
      },
      {
        ja: "生産、投資及び技術革新を阻害しない税制を構築する。",
        en: "A tax system is built that does not obstruct production, investment, or technical innovation.",
        fr: "Un régime fiscal est bâti qui n'entrave ni la production, ni l'investissement, ni l'innovation.",
      },
      {
        ja: "租税は公共サービスの財源として公平かつ透明に運用する。",
        en: "Tax is administered fairly and transparently as the means of public service.",
        fr: "L'impôt est administré avec équité et transparence comme ressource des services publics.",
      },
      {
        ja: "必要に応じて税制改革及び社会保障制度改革を行う。",
        en: "Tax reform and social-security reform are undertaken as needed.",
        fr: "La réforme fiscale et celle de la sécurité sociale sont menées au besoin.",
      },
    ],
  },
  {
    id: "6",
    title: { ja: "第六章　産業と科学", en: "Chapter VI · Industry and science", fr: "Chapitre VI · Industrie et science" },
    paras: [
      {
        ja: "国家は科学技術への長期投資を推進する。",
        en: "The state advances long-term investment in science and technology.",
        fr: "L'État pousse l'investissement de long terme dans la science et la technique.",
      },
      {
        ja: "エネルギー及び食料安全保障を国家戦略とする。",
        en: "Energy and food security are a national strategy.",
        fr: "La sécurité énergétique et alimentaire est une stratégie nationale.",
      },
      {
        ja: "AI、半導体、宇宙、バイオテクノロジー及び量子技術を重点育成産業とする。",
        en: "AI, semiconductors, space, biotechnology, and quantum technology are priority industries.",
        fr: "L'IA, les semi-conducteurs, l'espace, les biotechnologies et le quantique sont des industries prioritaires.",
      },
      {
        ja: "環境保全と産業発展を両立する。",
        en: "Environmental conservation and industrial development are held together.",
        fr: "La conservation de l'environnement et le développement industriel sont tenus ensemble.",
      },
    ],
  },
  {
    id: "7",
    title: { ja: "第七章　法", en: "Chapter VII · Law", fr: "Chapitre VII · Le droit" },
    paras: [
      {
        ja: "法は権力を拘束し、市民の自由を保障するために存在する。",
        en: "Law exists to bind power and to guarantee the freedom of citizens.",
        fr: "Le droit existe pour lier le pouvoir et garantir la liberté des citoyens.",
      },
      {
        ja: "すべての人は法の下に平等である。",
        en: "All persons are equal under the law.",
        fr: "Toutes les personnes sont égales devant la loi.",
      },
      {
        ja: "司法の独立を保障する。",
        en: "The independence of the judiciary is guaranteed.",
        fr: "L'indépendance de la justice est garantie.",
      },
      {
        ja: "刑罰は社会防衛と更生を目的とする。",
        en: "Punishment has as its aim the defense of society and rehabilitation.",
        fr: "La peine a pour but la défense de la société et la réhabilitation.",
      },
    ],
  },
  {
    id: "8",
    title: { ja: "第八章　外交・安全保障", en: "Chapter VIII · Diplomacy and security", fr: "Chapitre VIII · Diplomatie et sécurité" },
    paras: [
      {
        ja: "自主独立を基本とする。",
        en: "Independence is the basis.",
        fr: "L'indépendance est la base.",
      },
      {
        ja: "国際協力及び平和外交を推進する。",
        en: "International cooperation and peaceful diplomacy are advanced.",
        fr: "La coopération internationale et la diplomatie de paix sont poussées.",
      },
      {
        ja: "国民の生命、自由及び領土を守るため必要な防衛力を整備する。",
        en: "The defense needed to protect the life, freedom, and territory of the people is prepared.",
        fr: "La défense nécessaire pour protéger la vie, la liberté et le territoire du peuple est préparée.",
      },
      {
        ja: "経済安全保障を国家戦略の柱とする。",
        en: "Economic security is a pillar of national strategy.",
        fr: "La sécurité économique est un pilier de la stratégie nationale.",
      },
    ],
  },
  {
    id: "9",
    title: { ja: "第九章　環境", en: "Chapter IX · Environment", fr: "Chapitre IX · Environnement" },
    paras: [
      {
        ja: "次世代へ豊かな自然を継承する。",
        en: "A rich nature is handed on to the next generation.",
        fr: "Une nature riche est transmise à la génération suivante.",
      },
      {
        ja: "脱炭素と産業競争力を両立する。",
        en: "Decarbonization and industrial competitiveness are held together.",
        fr: "La décarbonation et la compétitivité industrielle sont tenues ensemble.",
      },
      {
        ja: "循環型経済を推進する。",
        en: "A circular economy is advanced.",
        fr: "Une économie circulaire est poussée.",
      },
    ],
  },
  {
    id: "10",
    title: { ja: "第十章　住まいと自立支援", en: "Chapter X · Housing and independence", fr: "Chapitre X · Logement et autonomie" },
    paras: [
      {
        ja: "住まいは人間の尊厳を支える基本的な社会基盤である。",
        en: "Housing is a basic social foundation that supports human dignity.",
        fr: "Le logement est une infrastructure sociale de base qui soutient la dignité humaine.",
      },
      {
        ja: "国及び地方自治体は、公営住宅、学生寮、職業訓練寮及び若年就労者向け住宅を整備し、安心して自立できる生活環境を保障する。",
        en: "The nation and local governments prepare public housing, student halls, vocational dormitories, and housing for young workers, and guarantee a living environment in which people can stand independently in security.",
        fr: "L'État et les collectivités préparent le logement public, les internats, les foyers de formation et le logement des jeunes travailleurs, et garantissent un cadre de vie où l'on peut s'établir en sécurité.",
      },
      {
        ja: "共同生活及び地域交流を促進し、孤立のない地域社会を形成する。",
        en: "Shared living and local exchange are promoted, so that no one is isolated in the community.",
        fr: "La vie commune et l'échange local sont encouragés, pour une communauté sans isolement.",
      },
    ],
  },
  {
    id: "11",
    title: { ja: "第十一章　教育・人材育成", en: "Chapter XI · Education and formation", fr: "Chapitre XI · Éducation et formation" },
    paras: [
      {
        ja: "教育は国家及び社会の発展の基礎である。",
        en: "Education is the foundation of the development of the state and of society.",
        fr: "L'éducation est le fondement du développement de l'État et de la société.",
      },
      {
        ja: "家庭の経済状況に左右されない教育機会を保障する。",
        en: "Educational opportunity is guaranteed without regard to a household's economic situation.",
        fr: "L'accès à l'éducation est garanti sans égard à la situation économique du foyer.",
      },
      {
        ja: "職業訓練及び技能教育を充実させ、生涯学習を推進する。",
        en: "Vocational and skill education are thickened, and lifelong learning is advanced.",
        fr: "La formation professionnelle et les métiers sont épaissis, et l'apprentissage tout au long de la vie est poussé.",
      },
      {
        ja: "AI、医療、製造業、農業及び科学技術分野の高度人材を育成する。",
        en: "Highly skilled people are formed in AI, medicine, manufacturing, agriculture, and science and technology.",
        fr: "Des personnes hautement formées sont élevées en IA, médecine, industrie, agriculture, science et technique.",
      },
    ],
  },
  {
    id: "12",
    title: { ja: "第十二章　医療・福祉・先端医療研究", en: "Chapter XII · Medicine, welfare, and advanced medical research", fr: "Chapitre XII · Médecine, soin et recherche médicale avancée" },
    paras: [
      {
        ja: "国家は再生医療、神経科学、AI医療、生体工学及びリハビリテーション医療への長期投資を行う。",
        en: "The state makes long-term investment in regenerative medicine, neuroscience, AI medicine, biomedical engineering, and rehabilitation medicine.",
        fr: "L'État investit à long terme dans la médecine régénérative, les neurosciences, la médecine par IA, le génie biomédical et la rééducation.",
      },
      {
        ja: "事故、疾病及び先天性疾患による障害に対する身体機能回復技術の研究を推進する。",
        en: "Research into restoring bodily function after disability from accident, disease, or congenital condition is advanced.",
        fr: "La recherche sur le rétablissement des fonctions corporelles après un handicap dû à un accident, une maladie ou une condition congénitale est poussée.",
      },
      {
        ja: "音波、超音波その他の物理エネルギーを利用した医療技術について、安全性及び有効性を科学的に検証し、その研究開発を推進する。",
        en: "Medical techniques that use sound, ultrasound, and other physical energy are scientifically verified for safety and efficacy, and their research and development are advanced.",
        fr: "Les techniques médicales qui usent du son, des ultrasons et d'autres énergies physiques sont vérifiées scientifiquement pour la sûreté et l'efficacité, et leur recherche est poussée.",
      },
      {
        ja: "細胞生物学、アポトーシス及びネクローシスに関する研究を推進し、再生医療及び難治性疾患の新たな治療法の確立を目指す。",
        en: "Research in cell biology, apoptosis, and necrosis is advanced, aiming at new treatments in regenerative medicine and intractable disease.",
        fr: "La recherche en biologie cellulaire, apoptose et nécrose est poussée, visant de nouveaux traitements en médecine régénérative et maladies réfractaires.",
      },
      {
        ja: "障害の有無にかかわらず、すべての人が尊厳を持って生活し、社会参加できる共生社会を実現する。",
        en: "A shared society is realized in which every person, with or without disability, lives with dignity and takes part in society.",
        fr: "Une société partagée est réalisée où chaque personne, avec ou sans handicap, vit dans la dignité et prend part à la société.",
      },
    ],
  },
  {
    id: "13",
    title: { ja: "第十三章　国民所得保障", en: "Chapter XIII · National income guarantee", fr: "Chapitre XIII · Garantie de revenu" },
    paras: [
      {
        ja: "すべての国民に最低限の生活を保障するため、持続可能な所得保障制度を整備する。",
        en: "A sustainable income guarantee is prepared so that every person has a floor of living.",
        fr: "Une garantie de revenu soutenable est préparée pour que chacun ait un plancher de vie.",
      },
      {
        ja: "ベーシックインカムについては、財政及び経済状況を踏まえ、段階的導入を検討する。",
        en: "Basic income is considered for stepwise introduction, in light of fiscal and economic conditions.",
        fr: "Le revenu de base est examiné pour une introduction par étapes, à la lumière des conditions budgétaires et économiques.",
      },
      {
        ja: "医療、教育及び介護などの公共サービスは維持・充実し、現金給付と公共サービスの調和を図る。",
        en: "Public services such as medicine, education, and care are maintained and thickened, and cash transfers are held in harmony with those services.",
        fr: "Les services publics — médecine, éducation, soin — sont maintenus et épaissis, et les transferts en espèces sont tenus en harmonie avec ces services.",
      },
    ],
  },
  {
    id: "14",
    title: { ja: "第十四章　共助と社会的連帯", en: "Chapter XIV · Mutual aid and solidarity", fr: "Chapitre XIV · Entraide et solidarité" },
    paras: [
      {
        ja: "困難に直面する人々を社会全体で支える連帯を尊重する。",
        en: "Solidarity that supports people in difficulty, by society as a whole, is respected.",
        fr: "La solidarité qui soutient les personnes en difficulté, par la société entière, est respectée.",
      },
      {
        ja: "生活困窮者、災害被災者、高齢者、障害者及び子どもへの支援を充実させる。",
        en: "Support is thickened for people in poverty, disaster survivors, older people, disabled people, and children.",
        fr: "Le soutien est épaissi pour les personnes en pauvreté, les sinistrés, les aînés, les personnes handicapées et les enfants.",
      },
      {
        ja: "市民、企業及び地域社会との協力を促進し、自助・共助・公助の調和した社会を築く。",
        en: "Cooperation among citizens, firms, and local society is promoted, to build a society in which self-help, mutual aid, and public aid are in harmony.",
        fr: "La coopération entre citoyens, entreprises et société locale est encouragée, pour une société où l'auto-aide, l'entraide et l'aide publique s'accordent.",
      },
    ],
  },
  {
    id: "15",
    title: { ja: "第十五章　機会の平等", en: "Chapter XV · Equality of opportunity", fr: "Chapitre XV · Égalité des chances" },
    paras: [
      {
        ja: "教育、就業及び起業の機会は、家庭環境や経済状況によって制限されてはならない。",
        en: "Opportunity in education, work, and founding a firm must not be limited by household or economic situation.",
        fr: "L'accès à l'éducation, au travail et à la création d'entreprise ne doit pas être limité par le foyer ou la situation économique.",
      },
      {
        ja: "学び直し、職業能力開発及びデジタル教育を推進する。",
        en: "Returning to study, vocational development, and digital education are advanced.",
        fr: "Le retour aux études, le développement professionnel et l'éducation numérique sont poussés.",
      },
      {
        ja: "AI及び情報技術の恩恵をすべての国民が享受できる社会を目指す。",
        en: "A society is aimed at in which every person can enjoy the benefits of AI and information technology.",
        fr: "Une société est visée où chacun peut jouir des bienfaits de l'IA et des technologies de l'information.",
      },
    ],
  },
  {
    id: "end",
    title: { ja: "終章　共に築き、共に発展する社会", en: "Closing · A society built and developed together", fr: "Clôture · Une société bâtie et développée ensemble" },
    paras: [
      {
        ja: "共栄科学社会主義は、自由、民主主義、法の支配、人間の尊厳及び社会的連帯を基本理念とする。",
        en: "Co-prosperity scientific socialism takes as its basic ideas freedom, democracy, the rule of law, human dignity, and social solidarity.",
        fr: "Le socialisme scientifique de coprospérité a pour idées de base la liberté, la démocratie, l'État de droit, la dignité humaine et la solidarité sociale.",
      },
      {
        ja: "本綱領は固定された教義ではない。社会、経済及び科学技術は常に発展する。私たちは科学的方法と民主的議論を重視し、現実の経験と知見に基づいて不断に綱領を検証し、より良い社会制度へ発展させる。",
        en: "This program is not a fixed dogma. Society, the economy, and science and technology are always developing. We give weight to scientific method and democratic debate, continually verify the program on experience and knowledge, and develop it toward a better social institution.",
        fr: "Ce programme n'est pas un dogme fixe. La société, l'économie, la science et la technique se développent sans cesse. Nous donnons du poids à la méthode scientifique et au débat démocratique, vérifions sans relâche le programme sur l'expérience et le savoir, et le faisons progresser vers une meilleure institution sociale.",
      },
      {
        ja: "共栄とは、一人だけの繁栄ではなく、社会全体が共に発展することである。私たちは、自由と責任、競争と協力、市場と公共の調和を実現し、すべての人が能力を発揮できる共栄社会を未来へ築くことをここに宣言する。",
        en: "Co-prosperity is not the flourishing of one person alone, but the development of society as a whole together. We declare here that we will realize a harmony of freedom and responsibility, competition and cooperation, market and public, and build toward the future a society of shared prosperity in which every person can exercise their capacity.",
        fr: "La coprospérité n'est pas l'essor d'une seule personne, mais le développement de la société entière ensemble. Nous déclarons ici que nous réaliserons l'harmonie de la liberté et de la responsabilité, de la concurrence et de la coopération, du marché et du public, et bâtirons vers l'avenir une société de coprospérité où chacun peut exercer ses capacités.",
      },
    ],
  },
];
