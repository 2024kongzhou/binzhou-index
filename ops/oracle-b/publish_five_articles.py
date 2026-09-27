"""One-off, source-cited Binzhou article refresh. Run only with --publish on Oracle B."""
import re
import sys

from main import SiteClient, generate_cover_image, upload_image_to_oracle

ARTICLES = [
    {
        "title": "博兴吕剧：乡音如何走上更大的舞台",
        "slug": "boxing-luju-village-stage",
        "excerpt": "从乡间小戏到国家级非遗，读懂吕剧与博兴的乡土联系。",
        "image_prompt": "山东滨州博兴乡村戏台上的吕剧演出，演员穿传统戏服，台下乡亲安静观看，鲁北村落庭院，温暖夕阳，纪实感水彩插画，无文字",
        "content": "吕剧的故事，先从乡音说起。中国非物质文化遗产数字博物馆介绍，鲁北一带的早期小戏与乡间歌谣、小调和生活故事相连。资料把它的形成脉络追溯到十九世纪后期：当时一些农民把熟悉的乡音编成小戏，在村落和集市演出。早期剧目《王小赶脚》使用驴形道具，因而有“驴戏”的俗称；此后名称逐渐演变为“吕戏”，再到今天熟悉的吕剧。这样的来路，让它始终带着乡村生活的温度。\n\n吕剧并非只靠舞台上的唱腔留在人们记忆里。戏里的赶路、持家、邻里往来和人情选择，都是观众能够听懂的日常。艺人用当地方言组织唱词，观众则在熟悉的节奏中辨认家乡的语气。一个小戏能够一代代传下去，靠的是演员练功、乐师伴奏、戏班走村，也靠普通观众愿意听、愿意讲给下一代。\n\n非遗名录为这门艺术留下了可查的记录。国家级非遗资料将吕剧列入传统戏剧类，项目编号为Ⅳ—116，并记载相关项目申报地区包括山东省滨州市。资料还提到，1940年前后《渤海日报》刊发吕剧《双寻夫》，推动“吕剧”这一名称传播。今天谈传承，既要珍惜老唱腔和经典剧目，也要让青年观众有机会走进剧场、了解后台的乐器与身段。传承不是把戏锁在展柜里，而是让它继续出现在真实的生活中。\n\n博兴与吕剧的联系，使这段乡土艺术史有了具体的地方坐标。看一场戏，听的不只是故事，也是地方语言怎样被保存、改写，再传给新一代。为传统艺术鼓掌，也是在为愿意长期练习、教戏和搭台的人鼓掌。\n\n栏目：滨州文化\n资料来源：中国非物质文化遗产数字博物馆《吕剧》项目资料\nhttps://www.ihchina.cn/project_details/13518/\n配图说明：AI辅助生成的主题插画，不是实地摄影。本文依据公开资料整理。",
    },
    {
        "title": "阳信鸭梨：一枚果子的家乡标准",
        "slug": "yangxin-pear-local-standard",
        "excerpt": "从产地范围到地方标准，了解阳信鸭梨如何建立清晰的品质坐标。",
        "image_prompt": "山东滨州阳信县梨园秋季，金黄色鸭梨挂在枝头，树下果农轻轻采收，平原田园与远处村庄，清新写实水彩插画，无文字",
        "content": "在阳信，梨不仅是一种水果，也是一张与土地相连的名片。梨园的季节有自己的节奏：春日花开时，枝头先铺出一层轻柔的白；果实逐渐长大，果农要照料树势、关注天气，采摘时又要轻拿轻放。把一枚梨从枝头送到餐桌，需要的不只是好天气，也需要稳定的栽培和分级方法。\n\n地理标志制度强调产品与特定地域之间的关系。国家知识产权局2023年发布的第554号公告，受理了阳信鸭梨地理标志产品保护申请，并把建议保护范围列为山东省滨州市阳信县现辖行政区域。这个表述很重要：它为“阳信鸭梨”这个名称划出了明确的地域边界，也提醒经营者和消费者，地理标志不是任意贴上的宣传词。\n\n标准则把这种地域名片落实到生产管理。全国标准信息公共服务平台收录的地方标准《地理标志产品 阳信鸭梨》编号为DB3716/T 88—2025，由滨州市市场监督管理局归口，发布日期为2024年3月28日，实施日期为2025年4月28日。标准的价值在于让生产、检验和使用标志有共同依据。它不替每个果园作保证，却让经营主体有规可循，也让消费者能按规范辨认产品。\n\n对乡村产业来说，标准化不是把果园变成流水线，而是把经验整理成可以传递的方法。老果农熟悉土壤和树势，新技术帮助记录和改进流程，合作社与销售渠道则把不同环节连接起来。把产地保护、生产规范和品牌诚信放在一起，才能让特色农产品长期赢得信任。\n\n阳信鸭梨的故事，最终落在一件朴素的事上：尊重产地、守住标准、认真对待每一批果子。读懂一项地方标准，也是在读懂家乡如何把自然条件和劳动经验转化为可持续的产业。\n\n栏目：滨州风物\n资料来源：国家知识产权局第554号公告；全国标准信息公共服务平台《地理标志产品 阳信鸭梨》\nhttps://www.cnipa.gov.cn/art/2023/11/16/art_575_188588.html\nhttps://std.samr.gov.cn/db/search/stdDBDetailed?id=36E3973C31355260E06397BE0A0A16DD\n配图说明：AI辅助生成的主题插画，不是实地摄影。本文依据公开资料整理。",
    },
    {
        "title": "沾化冬枣：把好味道写进质量规范",
        "slug": "zhanhua-winter-jujube-standard",
        "excerpt": "一项国家标准背后，是地方特产对质量、产地与信誉的长期守护。",
        "image_prompt": "山东滨州沾化冬枣园，成熟红绿相间的冬枣枝头特写，果农在秋日阳光中采摘，背景是鲁北平原果园小路，细腻纪实插画，无文字",
        "content": "沾化冬枣的名字，让人想到滨州秋日的果园。枣树从春芽、夏叶到秋果，经历漫长的照料；采收时如何判断成熟、怎样轻放和分级，都会影响果实从枝头到市场的过程。消费者看到的是一颗果子，果农和经营者面对的却是一整套生产、采后处理和运输环节。\n\n地方特色产品要走得远，既要靠风味，也要靠可信的质量规范。国家标准信息公共服务平台显示，《地理标志产品 沾化冬枣》国家标准编号为GB/T 18846—2008，发布日期为2008年6月3日，实施日期为同年12月1日，当前状态为现行。标准由原国家质量监督检验检疫总局、国家标准化管理委员会发布，主管部门为国家知识产权局。它为地理标志产品的质量管理提供共同参照，也使产地和产品名称之间的关系更加清晰。\n\n标准并不能替代果农的经验。每块园地的树龄、土壤和天气都不相同，生产者仍要观察枝叶、安排田间管理，并在采收、包装、储运中认真操作。规范的作用，是把必要的质量要求说清楚，让不同环节知道怎样配合，减少因为处理不当造成的损耗。消费者购买时，也可以关注正规渠道和标志信息，不被夸张宣传左右。\n\n沾化冬枣背后还有许多日常劳动：剪枝、疏果、巡园、采收、分拣，每一项都需要耐心。把产品做好，不只为了一个季节的销售，也是在维护地方产业的口碑。对滨州来说，保护地理标志、尊重国家标准、支持诚信经营，能让一份家乡风物以更稳妥的方式走向更多地方。\n\n一颗果子有它的自然时令，也有它的质量边界。了解标准，不是让生活变得生硬，而是帮助我们更踏实地品尝地方风物。\n\n栏目：滨州风物\n资料来源：国家标准信息公共服务平台《地理标志产品 沾化冬枣》（GB/T 18846—2008）\nhttps://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=A35383BC68D817B930E5D8B92D3BD2B5\n配图说明：AI辅助生成的主题插画，不是实地摄影。本文依据公开资料整理。",
    },
    {
        "title": "惠民魏氏庄园：在院落与高墙之间读懂乡土建筑",
        "slug": "huimin-weishi-manor-architecture",
        "excerpt": "惠民魏氏庄园的保护范围与建筑特色，记录着鲁北民居的空间智慧。",
        "image_prompt": "山东滨州惠民县魏氏庄园清代城堡式民居院落，高墙、灰瓦、木门与角楼在柔和晨光中，尊重历史建筑不出现现代游客，写实水彩插画，无文字",
        "content": "走近惠民魏氏庄园，最先感受到的往往是院落与围墙共同形成的秩序。它不是一座孤立的老房子，而是一组与家族生活、地方社会相连的建筑空间。山东省文化和旅游厅公布的全国重点文物保护单位保护范围文件，将魏氏庄园列在第四批名单中，并分别列出福寿堂、徙义堂和树德堂的保护边界。几个堂院的名字和位置，让这处遗产的整体格局有了可以核对的记录。\n\n\n\n文物保护文件划定保护范围，不是给建筑贴上标签就结束了。修缮需要尊重原有材料和形制，周边建设也要避免损害遗产环境。惠民县农村公路建设的公开报道提到，交通改善推动了道路沿线产业与乡村旅游融合，魏氏庄园等景点由此获得新的发展条件。交通便利带来更多参观机会，同时也要求游览活动服从保护要求，避免把历史空间变成只供拍照的背景。\n\n参观时可以慢一点：看看砖墙和屋顶的衔接，观察门窗比例，读一读院落之间的关系。不要触碰脆弱构件，不在文物上刻画，也不把未经证实的传说当作史实。对一处庄园最好的欣赏，是在理解它的历史价值时，也尊重它仍然需要维护的现实。\n\n魏氏庄园属于惠民，也属于滨州共同的文化记忆。保护好堂院、建筑和周边环境，才有机会让后来的孩子继续看见鲁北乡土建筑的真实面貌。\n\n栏目：滨州历史与文化\n资料来源：山东省文化和旅游厅文物保护范围文件；山东省交通运输厅惠民县农村公路报道；山东省文化和旅游厅齐鲁文化标识报道\nhttps://whhly.shandong.gov.cn/module/download/downfile.jsp?classid=0&filename=7dfd1c59d14947558ead43458d35e1cf.pdf\nhttps://jtt.shandong.gov.cn/art/2022/12/5/art_14098_10306926.html\nhttps://whhly.shandong.gov.cn/art/2026/4/2/art_341816_10356057.html\n配图说明：AI辅助生成的主题插画，不是实地摄影。本文依据公开资料整理。",
    },
    {
        "title": "无棣贝壳堤岛与湿地：海岸线上留下的自然档案",
        "slug": "wudi-shell-ridge-wetland",
        "excerpt": "滨州北部的贝壳堤岛与滨海湿地，展示河海共同塑造的海岸景观。",
        "image_prompt": "山东滨州无棣北部渤海岸边的贝壳堤岛与潮间湿地，浅水、盐生植被和远处海面，几只水鸟掠过，辽阔安静的海岸风景，环保主题水彩插画，无文字",
        "content": "滨州北部面向渤海，海岸不是一条静止的线。潮汐、风浪、泥沙和生物长期作用，让海边形成各具特点的滩涂、湿地和贝壳堤景观。走近无棣北部海岸，最值得珍惜的不是某一个打卡角度，而是这些自然过程留下的空间：地表有高低变化，水道随着潮汐呼吸，盐生植物在适应环境的地方生长。\n\n国家林业和草原局公开资料记载，滨州贝壳堤岛与湿地国家级自然保护区于2006年经国务院办公厅批准设立，保护对象以贝壳堤岛和滨海湿地生态系统为主。后续范围和功能区调整后，保护区总面积为43541.54公顷。面积数字背后，是一片需要整体看待的生态空间，而不是可以随意取用的景观资源。保护区的意义在于保存自然遗迹和湿地生态过程，让海岸系统有机会持续发挥作用。\n\n湿地对当地生活也有现实价值。它能够涵养水分、缓冲海岸环境变化，并为多种生物提供栖息条件。人们观察海岸时，容易只看到水面和天际线；但生态保护关注的是水、土、植物和动物之间的联系。保护湿地，既要关注显眼的景色，也要避免垃圾污染、随意进入敏感区域或干扰野生动物。\n\n如果在海边散步，请沿允许通行的道路和步道活动，带走垃圾，不采集贝壳堤上的自然物，不追逐或投喂野生鸟类。潮汐、天气和保护区管理要求都会影响现场安排，出行前应查询当地最新公告。把“看见”变成“理解”，把“游览”变成尊重自然的体验，才能让滨州的海岸风景长久留在这里。\n\n贝壳堤岛与湿地是滨州珍贵的自然档案。读懂它的形成与保护，也是在重新认识家乡与渤海之间的关系。\n\n栏目：滨州自然风光\n资料来源：国家林业和草原局《关于调整滨州贝壳堤岛与湿地国家级自然保护区范围和功能区的建议复文》\nhttps://www.forestry.gov.cn/c/www/gkjyfw/74926.jhtml\n配图说明：AI辅助生成的主题插画，不是实地摄影。本文依据公开资料整理。",
    },
]


def plain(text):
    return re.sub(r"<[^>]*>", "", text).strip()


def publish():
    site = SiteClient()
    old_posts = site.get_posts("published")
    titles = {p.get("title") for p in old_posts}
    slugs = {p.get("slug") for p in old_posts}
    if len(ARTICLES) != 5 or len({p["slug"] for p in ARTICLES}) != 5:
        raise RuntimeError("Batch must contain five unique articles")
    for article in ARTICLES:
        length = len(plain(article["content"]))
        if not 600 <= length <= 1000:
            raise ValueError(f"{article['slug']} length={length}")
        if article["title"] in titles or article["slug"] in slugs:
            raise RuntimeError(f"Duplicate title or slug: {article['slug']}")
        if "资料来源：" not in article["content"]:
            raise ValueError("Missing source disclosure")

    created = []
    for article in ARTICLES:
        image, mime = generate_cover_image(article["image_prompt"])
        if not mime.startswith("image/") or len(image) < 2000:
            raise RuntimeError("Image generator returned invalid media")
        cover = upload_image_to_oracle(image, mime)
        if not cover.startswith("/api/img/"):
            raise RuntimeError("Unexpected cover path")
        result = site.create_post(
            title=article["title"], slug=article["slug"],
            content=article["content"], excerpt=article["excerpt"],
            status="published", coverImage=cover, aiGenerated=True,
        )
        if "error" in result:
            raise RuntimeError(f"Site rejected {article['slug']}: {result.get('status_code')}")
        created.append({"title": article["title"], "slug": article["slug"],
                        "length": len(plain(article["content"])), "cover": cover})

    # Remove noncompliant legacy articles from public pages while preserving them
    # in the site's archive and keeping any comment history intact.
    refresh = site.get_posts("published")
    archived = []
    for post in refresh:
        content = str(post.get("content", ""))
        cover = post.get("coverImage", post.get("cover_image", ""))
        if not 600 <= len(plain(content)) <= 1000 or not cover:
            result = site.update_post(
                post.get("slug"), title=post.get("title", ""),
                content=content, excerpt=post.get("excerpt", ""),
                status="archived", coverImage=cover,
                aiGenerated=bool(post.get("aiGenerated", post.get("ai_generated", False))),
            )
            if "error" in result:
                raise RuntimeError(f"Could not archive legacy slug {post.get('slug')}")
            archived.append(post.get("slug"))

    visible = site.get_posts("published")
    final = []
    for article in ARTICLES:
        post = next((p for p in visible if p.get("slug") == article["slug"]), None)
        if not post:
            raise RuntimeError(f"Published post not visible: {article['slug']}")
        final.append({"title": post.get("title"), "slug": post.get("slug"),
                      "length": len(plain(post.get("content", ""))),
                      "cover": post.get("coverImage", post.get("cover_image", ""))})
    print({"created": created, "archived": archived, "publishedCount": len(visible), "verified": final})


if __name__ == "__main__":
    if "--publish" not in sys.argv:
        raise SystemExit("Refusing to publish without --publish")
    publish()
