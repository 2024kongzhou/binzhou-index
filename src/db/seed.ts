import { db } from "./index";
import { users, posts, products, chronicles } from "./schema";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Create admin if not exists
  const adminExists = db.select().from(users).where(eq(users.email, "admin@keyi.de5.net")).get();
  if (!adminExists) {
    const hash = await hashPassword("admin123");
    db.insert(users).values({
      username: "admin",
      email: "admin@keyi.de5.net",
      passwordHash: hash,
      role: "admin",
    }).run();
    console.log("Admin created: admin@keyi.de5.net / admin123");
  }

  // Seed chronicles
  const existingChronicles = db.select().from(chronicles).all();
  if (existingChronicles.length === 0) {
    db.insert(chronicles).values([
      {
        title: "滨州历史沿革",
        content: "滨州，山东省下辖地级市，位于山东省北部、黄河三角洲腹地。滨州历史悠久，早在新石器时代就有人类在此繁衍生息。春秋战国时期属齐国，秦汉设县，隋唐置州。1982年设立滨州地区，2000年撤地设市。",
        category: "历史",
        era: "先秦-现代",
        tags: "历史,沿革,行政区划",
      },
      {
        title: "黄河三角洲文化",
        content: "滨州地处黄河三角洲腹地，是黄河文化的重要发祥地之一。黄河入海口的冲积平原孕育了独特的三角洲文化，包括海盐文化、渔业文化、农耕文化等多元融合的地域文化体系。",
        category: "文化",
        era: "古代-现代",
        tags: "黄河,三角洲,文化",
      },
      {
        title: "孙子故里",
        content: "滨州惠民县是兵圣孙武的故乡。孙武所著的《孙子兵法》被誉为\"兵学圣典\"，对世界军事思想产生了深远影响。惠民县现存孙子兵法城等文化遗址，是研究孙子文化的重要基地。",
        category: "人物",
        era: "春秋",
        tags: "孙武,孙子兵法,军事",
      },
      {
        title: "魏氏庄园",
        content: "魏氏庄园位于滨州市惠民县魏集镇，是中国现存最大、保存最完整的清代城堡式民居。始建于清光绪十六年（1890年），占地40余亩，由住宅、花园、池塘、广场等组成，体现了鲁北地区民居建筑特色。",
        category: "建筑",
        era: "清代",
        tags: "魏氏庄园,古建筑,民居",
      },
      {
        title: "滨州海盐文化",
        content: "滨州濒临渤海，拥有丰富的海盐资源。自春秋时期起，这里就是重要的海盐产区。无棣县的埕口盐场历史悠久，至今仍保留着传统晒盐工艺。海盐文化深深融入了当地人的生活和民俗之中。",
        category: "风俗",
        era: "春秋-现代",
        tags: "海盐,制盐,民俗",
      },
      {
        title: "杜受田故居",
        content: "杜受田故居位于滨州市滨城区，是清代咸丰皇帝老师杜受田的故居。杜受田（1788-1852），字芝农，滨州人，道光年间进士，曾任协办大学士、礼部尚书等职。其故居现为山东省重点文物保护单位。",
        category: "人物",
        era: "清代",
        tags: "杜受田,故居,文物",
      },
    ]).run();
    console.log("Seeded 6 chronicles");
  }

  // Seed products
  const existingProducts = db.select().from(products).all();
  if (existingProducts.length === 0) {
    db.insert(products).values([
      {
        name: "精品窗帘定制",
        description: "高端面料，多种款式可选，免费上门测量安装",
        price: 128,
        originalPrice: 198,
        stock: 999,
        status: "active",
        storeName: "滨州窗帘布艺",
        storeAddress: "滨城区黄河五路388号",
        storePhone: "0543-1234567",
        isSoftAd: true,
      },
      {
        name: "环保无缝墙布",
        description: "进口环保材料，无缝拼接，十年质保",
        price: 68,
        originalPrice: 98,
        stock: 500,
        status: "active",
        storeName: "滨州墙布艺术",
        storeAddress: "滨城区渤海七路256号",
        storePhone: "0543-7654321",
        isSoftAd: true,
      },
      {
        name: "滨州冬枣",
        description: "沾化冬枣，皮薄肉脆，甜度高，国家地理标志产品",
        price: 38,
        originalPrice: 58,
        stock: 200,
        status: "active",
        storeName: "沾化冬枣直销",
        storeAddress: "沾化区下洼镇",
        storePhone: "0543-8888888",
        isSoftAd: false,
      },
      {
        name: "手工老粗布",
        description: "传统手工纺织，纯棉材质，滨州非物质文化遗产",
        price: 158,
        stock: 50,
        status: "active",
        storeName: "博兴老粗布",
        storeAddress: "博兴县城东街道",
        storePhone: "0543-6666666",
        isSoftAd: false,
      },
    ]).run();
    console.log("Seeded 4 products");
  }

  // Seed posts
  const existingPosts = db.select().from(posts).all();
  if (existingPosts.length === 0) {
    db.insert(posts).values([
      {
        title: "滨州：黄河之畔的明珠",
        slug: "binzhou-yellow-river-pearl",
        content: "滨州，这座位于黄河三角洲的城市，正以其独特的魅力吸引着越来越多的目光。从孙子兵法城到魏氏庄园，从沾化冬枣到无棣海盐，滨州的历史文化底蕴深厚，自然资源丰富。",
        excerpt: "探索滨州的历史文化与自然风光",
        status: "published",
        aiGenerated: true,
      },
      {
        title: "2026年滨州经济发展亮点",
        slug: "binzhou-economic-highlights-2026",
        content: "2026年，滨州市在经济发展方面取得了显著成就。新材料、新能源、高端装备制造等战略性新兴产业快速发展，传统产业数字化转型加速推进。",
        excerpt: "回顾滨州2026年经济发展成就",
        status: "published",
        aiGenerated: true,
      },
      {
        title: "滨州美食指南：不可错过的地道风味",
        slug: "binzhou-food-guide",
        content: "滨州的美食文化源远流长，既有黄河入海口的鲜美海鲜，也有鲁北平原的传统面食。锅子饼、芝麻酥糖、大山烧鸡等特色美食值得一试。",
        excerpt: "带你品尝滨州地道美食",
        status: "published",
        aiGenerated: false,
      },
    ]).run();
    console.log("Seeded 3 posts");
  }

  console.log("Seed complete!");
}

seed().catch(console.error);
