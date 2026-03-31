// ================================================================
// 莫奈的画境 / Monet's Dreamscape v2.0 — 游戏主逻辑
// ================================================================
//
// 印象派风格横版卷轴探索游戏 / Impressionist Side-scrolling Platformer
// 纯 HTML5 Canvas 2D + Web Audio API 实现，无第三方框架依赖
//
// 代码结构 / Code Structure:
// ----------------------------------------------------------
// SECTION 0   : i18n 国际化系统（中/英双语，~130 条翻译）
// SECTION 0.5 : 语音旁白系统（21条莫奈/卡米耶语音 + 字幕）
// SECTION 1   : 音频引擎（4层生成式音乐 + 8种音效）
// SECTION 2   : 粒子系统（收集特效、跳跃粒子、环境粒子）
// SECTION 3   : 输入处理（键盘 + 触屏 + 跳跃边沿检测）
// SECTION 4   : 玩家角色（物理、碰撞、精灵贴图渲染）
// SECTION 5   : 收集物系统（钥匙/颜料/碎片三种类型）
// SECTION 6   : 关卡数据（3关：睡莲、日出印象、日本桥）
// SECTION 7   : 游戏核心（状态机、相机、渲染管线、UI）
// SECTION 8   : 初始化与事件绑定
// ----------------------------------------------------------
//
// 核心玩法 / Core Gameplay:
//   - 横版卷轴探索，← → 移动，↑/空格 跳跃
//   - 每关 3 把金色颜料管钥匙（必须全部收集才能通关）
//   - 每关 5 个可选纪念品（颜料滴/画作碎片，存入图鉴）
//   - 浮动/移动平台增加跳跃挑战
//   - 通关后揭示对应莫奈名画详细信息
//   - 莫奈与卡米耶的对话语音在特定位置触发
//
// 技术亮点 / Technical Highlights:
//   - AI 生成贴图的黑色背景自动去除（亮度阈值法）
//   - 3层视差滚动背景 + 雾气/光柱/暗角/噪点视觉特效
//   - Web Audio API 实时生成环境音乐（和弦pad+旋律+贝斯+纹理）
//   - edge-tts 生成英文语音，HTML5 Audio 播放，优雅降级为纯字幕
//   - localStorage 持久化语言偏好和纪念品收集状态
// ================================================================

// ============================================================
// SECTION 0: INTERNATIONALIZATION (i18n)
// ============================================================
let currentLang = localStorage.getItem('monet_lang') || 'zh';

const LANG = {
  zh: {
    loading_title: '莫奈的画境', loading_subtitle: "MONET'S DREAMSCAPE",
    loading_text: '正在唤醒画中世界...', loading_progress: '加载中... {pct}%',
    menu_title: '莫奈的画境', menu_subtitle: "MONET'S DREAMSCAPE",
    btn_start: '开始旅程', btn_gallery: '画作画廊', btn_continue: '继续旅程',
    btn_gallery_back: '← 返回', gallery_header: '画 作 画 廊',
    gallery_locked: '🔒 未解锁', gallery_return: '返回画廊',
    lang_toggle: 'EN',
    // Pause
    pause_title: '暂停', btn_resume: '继续游戏', btn_back_menu: '返回主菜单',
    // Collectibles
    gate_locked_hint: '收集所有金色颜料管解锁画框',
    gate_unlocked_hint: '画框已解锁！前往终点！',
    key_label: '颜料管', backpack_title: '背包', btn_album: '图鉴',
    levelsel_header: '选 择 关 卡', levelsel_locked: '🔒 通关前一关解锁',
    album_header: '纪念品图鉴', album_empty: '暂无纪念品',
    hint_key_explain: '收集金色颜料管解锁终点画框',
    hint_souvenir_explain: '颜料滴和碎片是可选纪念品',
    // Level 1
    l1_name: '睡莲', l1_nameEn: 'Water Lilies', l1_subtitle: '1906 · 莫奈的吉维尼花园',
    l1_painting_title: '睡莲 Water Lilies', l1_artist: 'Claude Monet, 1906',
    l1_painting_desc: '莫奈在吉维尼花园创作了约250幅睡莲作品。他痴迷于捕捉水面上光影的瞬间变化——倒影、涟漪与漂浮的睡莲交织出一个超越现实的梦幻世界。这组作品被视为抽象表现主义的先驱。',
    l1_hint1: '← → 移动  ↑/空格 跳跃', l1_hint2: '收集金色颜料管解锁终点画框', l1_hint3: '颜料滴和碎片是可选纪念品', l1_hint4: '到达发光的画框完成关卡',
    // Level 2
    l2_name: '日出·印象', l2_nameEn: 'Impression, Sunrise', l2_subtitle: '1872 · 勒阿弗尔港',
    l2_painting_title: '日出·印象 Impression, Sunrise', l2_artist: 'Claude Monet, 1872',
    l2_painting_desc: '这幅画不仅给了印象派以名字，更彻底改变了艺术的方向。莫奈捕捉了勒阿弗尔港口清晨薄雾中的一瞬——橙红色的太阳映照在波光粼粼的水面上，工业港口的轮廓若隐若现。这是光与色彩的革命宣言。',
    l2_hint1: '踏上港口的船只和桅杆前行', l2_hint2: '日出的光芒照亮了前方的路', l2_hint3: '黎明将至，继续前进',
    // Level 3
    l3_name: '日本桥', l3_nameEn: 'The Japanese Bridge', l3_subtitle: '1899 · 吉维尼花园',
    l3_painting_title: '日本桥 The Japanese Bridge', l3_artist: 'Claude Monet, 1899',
    l3_painting_desc: '莫奈在吉维尼花园中建造了一座日式拱桥，并反复描绘它。浓郁的绿色、紫色和粉色交织在一起，紫藤花从桥上垂落，与水面的倒影融为一体。这是莫奈晚期对色彩与形式的极致探索——自然与艺术完美合一。',
    l3_hint1: '穿越莫奈的秘密花园', l3_hint2: '登上日本桥，俯瞰花园全景', l3_hint3: '画作的尽头等待着你',
    // Souvenirs
    sv_l1_1: '紫色梦幻颜料', sv_l1_2: '粉色花瓣颜料', sv_l1_3: '睡莲画作碎片',
    sv_l1_4: '莲影绿颜料', sv_l1_5: '倒影画作碎片',
    sv_l1_1_desc: '从睡莲池水面提取的紫色颜料。在不同的光线下会呈现出蓝色到粉紫色的变化，如同莫奈描绘的水中倒影。',
    sv_l1_2_desc: '用睡莲花瓣研磨而成的粉色颜料。每一管都带着吉维尼花园清晨的露水气息。',
    sv_l1_3_desc: '一块睡莲画作的碎片，描绘着浮在水面上的莲叶与倒映的天光。莫奈用三十年时间反复描绘同一池睡莲。',
    sv_l1_4_desc: '从水面莲叶倒影中提取的绿色颜料。它的色调随水波涟漪而不断变化——这正是莫奈毕生追寻的瞬间之美。',
    sv_l1_5_desc: '一块描绘水中树影的画作碎片。水面上的倒影和现实之间的界限在莫奈的画笔下变得模糊不清。',
    sv_l2_1: '晨曦橙颜料', sv_l2_2: '火焰红颜料', sv_l2_3: '日出画作碎片',
    sv_l2_4: '港湾蓝颜料', sv_l2_5: '黄昏画作碎片',
    sv_l2_1_desc: '黎明时分港口上空的橙色光芒凝结成的颜料。每一天的日出颜色都不同，但莫奈只记住了这一个清晨。',
    sv_l2_2_desc: '太阳刚跃出海面时最炽热的红色。这管颜料里藏着勒阿弗尔港口最短暂也最璀璨的一刻。',
    sv_l2_3_desc: '一块描绘日出港口的画作碎片。橙红色的太阳映在粼粼的水面上——这幅画让"印象派"得名。',
    sv_l2_4_desc: '从晨雾笼罩的港湾中提取的蓝灰色颜料。远处船只的轮廓在薄雾中若隐若现，如同一首视觉的诗。',
    sv_l2_5_desc: '一块描绘港口暮色的碎片。烟囱的剪影、水面的倒映，在日落余晖中交织成橙紫色的交响曲。',
    sv_l3_1: '花园翠绿颜料', sv_l3_2: '紫藤紫颜料', sv_l3_3: '拱桥画作碎片',
    sv_l3_4: '睡莲粉颜料', sv_l3_5: '花园画作碎片',
    sv_l3_1_desc: '从吉维尼花园最茂盛的角落采集的翠绿颜料。每一滴都蕴含着莫奈对自然的深情凝视。',
    sv_l3_2_desc: '紫藤花串垂下日本桥时那令人心醉的紫色。莫奈说紫藤花落下的样子，就像大自然在画水彩。',
    sv_l3_3_desc: '一块描绘绿色拱桥及其水中倒影的画作碎片。桥与倒影——哪一个更真实？莫奈一直在追问。',
    sv_l3_4_desc: '日本桥下莲池中睡莲的粉色。宁静的水面上，粉色花朵与翠绿莲叶构成了莫奈最钟爱的画面。',
    sv_l3_5_desc: '一块描绘花园小径的碎片。紫藤、鸢尾和蜿蜒的步道——这就是莫奈为自己创造的人间天堂。',
    // Voiceovers
    vo_l1_1: '"这水面上的光……每一秒都在变化。"',
    vo_l1_2: '"我花了整整三十年，才学会如何看见睡莲。"',
    vo_l1_3: '"Claude，你看这片紫色的倒影多美。" —— 卡米耶',
    vo_l1_4: '"卡米耶，你就是这花园里最美的光。"',
    vo_l1_4r: '"别说傻话了，快画你的画吧。" —— 卡米耶',
    vo_l1_5: '"画画不是画你看到的，而是画你感受到的。"',
    vo_l1_6: '"终于……这一刻的光，被永远留住了。"',
    vo_l2_1: '"日出时分，港口像一首沉默的诗。"',
    vo_l2_2: '"他们嘲笑这幅画，说它只是一个\u2018印象\u2019。也许他们是对的。"',
    vo_l2_3: '"Claude，雾散了你就看不到那种光了。" —— 卡米耶',
    vo_l2_4: '"正因如此我才必须快点画完。"',
    vo_l2_4r: '"那你今天又要来不及吃早饭了。" —— 卡米耶',
    vo_l2_5: '"颜色不是物体的属性——它是光赋予物体的礼物。"',
    vo_l2_6: '"这一瞬间的印象，值得用一生去追寻。"',
    vo_l3_1: '"这座小桥，我画了不下二十次。每次都不一样。"',
    vo_l3_2: '"紫藤花落下的样子，像是大自然在画水彩。"',
    vo_l3_3: '"Claude，花园里的紫藤开了。" —— 卡米耶',
    vo_l3_4: '"我知道，我已经支好了画架。"',
    vo_l3_4r: '"你总是比花先准备好。" —— 卡米耶',
    vo_l3_5: '"自然不需要被理解，只需要被感受。"',
    vo_l3_6: '"桥的倒影和桥本身——哪一个更真实？"',
    // ---- New Levels (v3) ----
    // Level 4: Woman in the Green Dress (Light & Shadow)
    l4_name: '穿绿裙的女人', l4_subtitle: '1866 · 巴黎画室',
    l4_painting_title: '穿绿裙的女人 Woman in the Green Dress', l4_artist: 'Claude Monet, 1866',
    l4_painting_desc: '这幅画是莫奈在沙龙展出的成名作，画中的模特正是他未来的妻子卡米耶·东西欧。深绿色的丝绸长裙在昏暗的画室中熠熠生辉，窗外的光线为她镀上一层金色的轮廓。这是莫奈第一次被光芒击中的时刻。',
    l4_hint1: '← → 移动  ↑/空格 跳跃', l4_hint2: '靠近光源照亮隐藏的路', l4_hint3: '在黑暗中探索画室的秘密', l4_hint4: '收集颜料管解锁画框',
    sv_l4_1: '素描炭笔', sv_l4_2: '松节油瓶', sv_l4_3: '调色刀',
    sv_l4_4: '绿色丝绸布样', sv_l4_5: '沙龙邀请函',
    sv_l4_1_desc: '莫奈随身携带的炭笔，笔尖已被磨平。画室角落的素描本上留着卡米耶的速写轮廓。',
    sv_l4_2_desc: '用来稀释油画颜料的松节油，瓶身沾满了彩色的指纹。画室里弥漫着它独特的气味。',
    sv_l4_3_desc: '这把调色刀陪伴莫奈多年，刀刃上堆积着无数层干燥的颜料。它既是工具，也是时光的印记。',
    sv_l4_4_desc: '卡米耶那条绿裙的布料样品。深绿色的丝绸在窗光下闪烁着微妙的色彩变化——这正是莫奈想要捕捉的。',
    sv_l4_5_desc: '1866年巴黎沙龙的正式邀请函。凭借《穿绿裙的女人》，年轻的莫奈第一次在艺术界崭露头角。',
    vo_l4_1: '"这间画室虽暗，但窗外的光……足够了。"',
    vo_l4_2: '"我请不起职业模特，但这位年轻女子……她答应为我摆姿势。"',
    vo_l4_3: '"莫奈先生，我站在这里可以吗？在光里？" —— 卡米耶',
    vo_l4_4: '"对，就是那里。别动。你裙子的绿色接住了光，太完美了。"',
    vo_l4_4r: '"你看我的样子……好像在看别人看不见的东西。" —— 卡米耶',
    vo_l4_5: '"我从未如此专注地画过任何人。"',
    vo_l4_6: '"这幅画将改变一切。我能感觉到。"',
    // Level 5: Women in the Garden (Wind)
    l5_name: '花园中的女人们', l5_subtitle: '1866 · 维尔达弗莱',
    l5_painting_title: '花园中的女人们 Women in the Garden', l5_artist: 'Claude Monet, 1866',
    l5_painting_desc: '为了捕捉户外真实的光线，莫奈在花园中挖了一条壕沟来安放巨幅画布。卡米耶一人扮演了画中的全部四位女性。风不时吹乱她的裙摆和帽子，阳光在树叶间跳跃。这是印象派户外写生精神的完美体现。',
    l5_hint1: '注意风向，把握跳跃时机', l5_hint2: '风旗会提示风的方向', l5_hint3: '在风停的间隙快速前进', l5_hint4: '树枝在风中会摇摆',
    sv_l5_1: '白色阳伞', sv_l5_2: '花冠', sv_l5_3: '丝绸缎带',
    sv_l5_4: '花园草帽', sv_l5_5: '蕾丝手套',
    sv_l5_1_desc: '卡米耶在花园里常用的白色蕾丝阳伞。伞面上能看到阳光透过蕾丝留下的斑驳花纹。',
    sv_l5_2_desc: '用花园里新摘的雏菊和薰衣草编成的花冠。卡米耶戴上它，一人扮演四位花园女郎。',
    sv_l5_3_desc: '柔软的粉色丝绸缎带，被风吹得翩翩起舞。它让莫奈想起了光在织物上流动的样子。',
    sv_l5_4_desc: '一顶装饰着干花和缎带的宽檐草帽。风不止一次把它从卡米耶头上吹跑，却每次都被画进了画里。',
    sv_l5_5_desc: '精致的白色蕾丝手套，是那个时代优雅女性的标配。卡米耶戴着它在花园茶桌旁小憩。',
    vo_l5_1: '"在室外画画，你必须和阳光赛跑。"',
    vo_l5_2: '"卡米耶扮演了画中所有的女人。她说一个人就够了。"',
    vo_l5_3: '"Claude，风又把我的帽子吹跑了！" —— 卡米耶',
    vo_l5_4: '"别动！光刚好落在你身上——就是这一刻！"',
    vo_l5_4r: '"你更在意光落在哪里，还是我站在哪里？" —— 卡米耶',
    vo_l5_5: '"光不等人，但画笔可以追上它。"',
    vo_l5_6: '"四个女人，一个卡米耶。这是我们的秘密。"',
    // Level 6: Woman with a Parasol (Glide)
    l6_name: '撑阳伞的女人', l6_subtitle: '1875 · 阿让特伊的山坡',
    l6_painting_title: '撑阳伞的女人 Woman with a Parasol', l6_artist: 'Claude Monet, 1875',
    l6_painting_desc: '这是莫奈最著名的画作之一。卡米耶和小让站在山坡上，风吹动她的裙摆和面纱，阳伞倾斜着挡住阳光。天空占据了画面的大部分，云朵在风中飞掠。这一刻的轻盈与自由，是莫奈一生中最幸福的时光。',
    l6_hint1: '按住跳跃键可以滑翔', l6_hint2: '上升气流会带你飞向高处', l6_hint3: '蒲公英随风飘舞，跟随它们', l6_hint4: '在山坡上不断攀登',
    sv_l6_1: '蒲公英', sv_l6_2: '让的玩具船', sv_l6_3: '野餐篮',
    sv_l6_4: '草帽', sv_l6_5: '情书',
    sv_l6_1_desc: '一朵完整的蒲公英种子头。风一吹，白色的种子便漫天飞舞，像莫奈笔下流动的光点。',
    sv_l6_2_desc: '小让心爱的手工木船，漆面已经斑驳。每个周末他都带着它去池塘放船，而父亲在一旁写生。',
    sv_l6_3_desc: '柳条编织的野餐篮里装着面包和葡萄。在山坡上，一家三口共度的午后时光是最好的颜料。',
    sv_l6_4_desc: '卡米耶那顶系着蓝色丝带的草帽。风总是把它吹歪，阳光就从帽檐缝隙洒落在她的笑脸上。',
    sv_l6_5_desc: '莫奈写给卡米耶的情书。娟秀的字迹间满是对光影的痴迷和对她的爱慕——两者密不可分。',
    vo_l6_1: '"山坡上的风把一切都吹得那么轻。"',
    vo_l6_2: '"卡米耶举着阳伞的样子，像一只蝴蝶。"',
    vo_l6_3: '"Claude，小让说他想飞！" —— 卡米耶',
    vo_l6_4: '"告诉他——画笔可以让任何人飞翔。"',
    vo_l6_4r: '"那你呢？你想飞去哪里？" —— 卡米耶',
    vo_l6_5: '"飞去任何有你的地方。"',
    vo_l6_6: '"这一刻的风、光和她的微笑——我要永远留住它们。"',
  },
  en: {
    loading_title: "Monet's Dreamscape", loading_subtitle: "MONET'S DREAMSCAPE",
    loading_text: 'Awakening the painted world...', loading_progress: 'Loading... {pct}%',
    menu_title: "Monet's Dreamscape", menu_subtitle: "MONET'S DREAMSCAPE",
    btn_start: 'Begin Journey', btn_gallery: 'Gallery', btn_continue: 'Continue',
    btn_gallery_back: '← Back', gallery_header: 'PAINTING GALLERY',
    gallery_locked: '🔒 Locked', gallery_return: 'Return to Gallery',
    lang_toggle: '中文',
    pause_title: 'Paused', btn_resume: 'Resume', btn_back_menu: 'Back to Menu',
    gate_locked_hint: 'Collect all golden paint tubes to unlock the gate',
    gate_unlocked_hint: 'Gate unlocked! Head to the finish!',
    key_label: 'Paint Tubes', backpack_title: 'Backpack', btn_album: 'Album',
    levelsel_header: 'SELECT LEVEL', levelsel_locked: '🔒 Complete previous level',
    album_header: 'Souvenir Album', album_empty: 'No souvenirs yet',
    hint_key_explain: 'Collect golden paint tubes to unlock the finish gate',
    hint_souvenir_explain: 'Paint drops and fragments are optional souvenirs',
    l1_name: 'Water Lilies', l1_nameEn: 'Water Lilies', l1_subtitle: "1906 · Monet's Garden, Giverny",
    l1_painting_title: 'Water Lilies', l1_artist: 'Claude Monet, 1906',
    l1_painting_desc: 'Monet created about 250 water lily paintings in his Giverny garden. He was obsessed with capturing the fleeting changes of light on water — reflections, ripples, and floating lilies weaving a dreamlike world beyond reality. This series is considered a precursor to Abstract Expressionism.',
    l1_hint1: '← → Move  ↑/Space Jump', l1_hint2: 'Collect golden paint tubes to unlock the gate', l1_hint3: 'Paint drops and fragments are optional souvenirs', l1_hint4: 'Reach the glowing frame to complete the level',
    l2_name: 'Impression, Sunrise', l2_nameEn: 'Impression, Sunrise', l2_subtitle: '1872 · Le Havre Harbor',
    l2_painting_title: 'Impression, Sunrise', l2_artist: 'Claude Monet, 1872',
    l2_painting_desc: "This painting not only gave Impressionism its name but fundamentally changed the direction of art. Monet captured a fleeting moment in the morning mist of Le Havre harbor — an orange-red sun reflected on shimmering water, with the industrial port's silhouette barely visible. It is a revolutionary manifesto of light and color.",
    l2_hint1: 'Board the boats and climb the masts', l2_hint2: 'The sunrise illuminates the way ahead', l2_hint3: 'Dawn approaches — keep moving forward',
    l3_name: 'The Japanese Bridge', l3_nameEn: 'The Japanese Bridge', l3_subtitle: "1899 · Giverny Garden",
    l3_painting_title: 'The Japanese Bridge', l3_artist: 'Claude Monet, 1899',
    l3_painting_desc: "Monet built a Japanese-style arched bridge in his Giverny garden and painted it repeatedly. Rich greens, purples, and pinks intertwine as wisteria cascades from the bridge, merging with reflections on the water. This is Monet's late-period exploration of color and form — nature and art in perfect unity.",
    l3_hint1: "Journey through Monet's secret garden", l3_hint2: 'Cross the Japanese Bridge for a panoramic view', l3_hint3: 'The end of the painting awaits you',
    sv_l1_1: 'Purple Dream Pigment', sv_l1_2: 'Pink Petal Pigment', sv_l1_3: 'Water Lily Fragment',
    sv_l1_4: 'Lily Reflection Green', sv_l1_5: 'Reflection Fragment',
    sv_l1_1_desc: 'Purple pigment extracted from the surface of the lily pond. It shifts from blue to violet under different light — much like the reflections Monet spent decades capturing.',
    sv_l1_2_desc: 'Pink pigment ground from water lily petals, carrying the morning dew fragrance of the Giverny garden.',
    sv_l1_3_desc: 'A fragment depicting lily pads floating on water with sky reflections. Monet spent thirty years painting the same pond over and over.',
    sv_l1_4_desc: 'Green pigment drawn from the reflections of lily leaves on water. Its hue shifts with every ripple — the fleeting beauty Monet pursued all his life.',
    sv_l1_5_desc: 'A fragment showing tree reflections in water. The boundary between reflection and reality dissolves beneath Monet\'s brush.',
    sv_l2_1: 'Dawn Orange Pigment', sv_l2_2: 'Flame Red Pigment', sv_l2_3: 'Sunrise Fragment',
    sv_l2_4: 'Harbor Blue Pigment', sv_l2_5: 'Twilight Fragment',
    sv_l2_1_desc: 'The orange glow above the harbor at dawn, condensed into pigment. Every sunrise is different, but Monet remembered only this one morning.',
    sv_l2_2_desc: 'The most intense red when the sun first breaks above the sea. This tube holds the briefest yet most brilliant moment of Le Havre harbor.',
    sv_l2_3_desc: 'A fragment depicting the sun rising over the misty harbor. The orange-red sun shimmering on water — the painting that gave Impressionism its name.',
    sv_l2_4_desc: 'Blue-gray pigment extracted from the fog-shrouded harbor. Distant ship silhouettes emerge and vanish in the mist, like a visual poem.',
    sv_l2_5_desc: 'A fragment showing the harbor at dusk. Smokestack silhouettes and water reflections weave an orange-purple symphony beneath the fading light.',
    sv_l3_1: 'Garden Emerald Pigment', sv_l3_2: 'Wisteria Purple Pigment', sv_l3_3: 'Bridge Fragment',
    sv_l3_4: 'Water Lily Pink Pigment', sv_l3_5: 'Garden Fragment',
    sv_l3_1_desc: 'Emerald pigment gathered from the lushest corner of the Giverny garden. Every drop holds Monet\'s deep, lingering gaze upon nature.',
    sv_l3_2_desc: 'The intoxicating purple of wisteria cascading from the Japanese bridge. Monet said wisteria falls like nature painting watercolors.',
    sv_l3_3_desc: 'A fragment depicting the green arched bridge and its reflection in still water. Bridge and reflection — which is more real? Monet never stopped asking.',
    sv_l3_4_desc: 'The pink of water lilies in the pond beneath the Japanese bridge. Pink blossoms and green leaves compose Monet\'s most beloved scene.',
    sv_l3_5_desc: 'A fragment showing a garden path with overhanging wisteria and irises — the earthly paradise Monet created for himself.',
    vo_l1_1: '"The light on this water... it changes every second."',
    vo_l1_2: '"It took me thirty years to learn how to see water lilies."',
    vo_l1_3: '"Claude, look at this beautiful purple reflection." — Camille',
    vo_l1_4: '"Camille, you are the most beautiful light in this garden."',
    vo_l1_4r: '"Stop being silly and paint your painting." — Camille',
    vo_l1_5: '"Painting is not about what you see, but what you feel."',
    vo_l1_6: '"At last... this moment of light, captured forever."',
    vo_l2_1: '"At sunrise, the harbor is like a silent poem."',
    vo_l2_2: '"They mocked this painting, called it just an \'impression.\' Perhaps they were right."',
    vo_l2_3: '"Claude, once the fog lifts you won\'t see that light anymore." — Camille',
    vo_l2_4: '"That\'s precisely why I must finish painting quickly."',
    vo_l2_4r: '"So you\'ll miss breakfast again today." — Camille',
    vo_l2_5: '"Color is not a property of objects — it is a gift that light gives them."',
    vo_l2_6: '"This fleeting impression is worth a lifetime of pursuit."',
    vo_l3_1: '"I have painted this little bridge over twenty times. Each time it is different."',
    vo_l3_2: '"The way wisteria falls is like nature painting watercolors."',
    vo_l3_3: '"Claude, the wisteria in the garden is blooming." — Camille',
    vo_l3_4: '"I know. I have already set up my easel."',
    vo_l3_4r: '"You\'re always ready before the flowers." — Camille',
    vo_l3_5: '"Nature does not need to be understood — only felt."',
    vo_l3_6: '"The bridge\'s reflection and the bridge itself — which is more real?"',
    // ---- New Levels (v3) ----
    l4_name: 'Woman in the Green Dress', l4_subtitle: '1866 · Paris Studio',
    l4_painting_title: 'Woman in the Green Dress', l4_artist: 'Claude Monet, 1866',
    l4_painting_desc: "This painting was Monet's breakthrough at the Salon. The model was Camille Doncieux, who would become his wife. Her deep green silk dress gleams in the dim studio, with window light tracing a golden outline around her silhouette. This was the moment Monet was first struck by light.",
    l4_hint1: '← → Move  ↑/Space Jump', l4_hint2: 'Move near light to reveal hidden paths', l4_hint3: 'Explore the secrets of the dark studio', l4_hint4: 'Collect paint tubes to unlock the gate',
    sv_l4_1: 'Sketch Charcoal', sv_l4_2: 'Turpentine Bottle', sv_l4_3: 'Palette Knife',
    sv_l4_4: 'Green Silk Swatch', sv_l4_5: 'Salon Invitation',
    sv_l4_1_desc: 'Monet\'s well-worn charcoal stick, its tip ground flat. His sketchbook in the studio corner holds faint outlines of Camille\'s silhouette.',
    sv_l4_2_desc: 'A small bottle of turpentine for thinning oil paint, covered in colorful fingerprints. Its distinctive scent fills the studio air.',
    sv_l4_3_desc: 'This palette knife accompanied Monet for years, its blade layered with countless dried pigments. It is both a tool and a record of time passing.',
    sv_l4_4_desc: 'A fabric sample from Camille\'s green dress. The deep green silk shimmers with subtle color shifts in window light — exactly what Monet sought to capture.',
    sv_l4_5_desc: 'A formal invitation to the 1866 Paris Salon. With "Woman in the Green Dress," the young Monet made his first mark on the art world.',
    vo_l4_1: '"This studio is dark, but the light through that window... it\'s enough."',
    vo_l4_2: '"I cannot afford a professional model. But this young woman... she has agreed to pose."',
    vo_l4_3: '"Monsieur Monet, shall I stand here? In the light?" — Camille',
    vo_l4_4: '"Yes, exactly there. Don\'t move. The green of your dress catches the light perfectly."',
    vo_l4_4r: '"You look at me as if you\'re seeing something others cannot." — Camille',
    vo_l4_5: '"I have never painted anyone with such intensity."',
    vo_l4_6: '"This painting will change everything. I can feel it."',
    l5_name: 'Women in the Garden', l5_subtitle: '1866 · Ville-d\'Avray',
    l5_painting_title: 'Women in the Garden', l5_artist: 'Claude Monet, 1866',
    l5_painting_desc: "To capture real outdoor light, Monet dug a trench in a garden to lower his enormous canvas. Camille posed as all four women. Wind kept blowing her dress and hat, sunlight danced between leaves. This painting embodies the Impressionist spirit of plein-air painting.",
    l5_hint1: 'Watch the wind, time your jumps', l5_hint2: 'Wind flags show gust direction', l5_hint3: 'Move quickly between wind gusts', l5_hint4: 'Tree branches sway in the wind',
    sv_l5_1: 'White Parasol', sv_l5_2: 'Flower Crown', sv_l5_3: 'Silk Ribbon',
    sv_l5_4: 'Garden Hat', sv_l5_5: 'Lace Glove',
    sv_l5_1_desc: 'Camille\'s white lace parasol from the garden. Sunlight through the lace leaves dappled patterns on her face — a sight Monet painted many times.',
    sv_l5_2_desc: 'A crown woven from freshly picked daisies and lavender. Camille wore it to play all four women in the painting.',
    sv_l5_3_desc: 'A soft pink silk ribbon dancing in the breeze. It reminded Monet of how light flows across fabric.',
    sv_l5_4_desc: 'A wide-brimmed hat decorated with dried flowers and ribbon. The wind blew it off Camille\'s head more than once, yet it found its way into every painting.',
    sv_l5_5_desc: 'Delicate white lace gloves, the mark of an elegant lady of the era. Camille wore them while resting at the garden tea table.',
    vo_l5_1: '"To paint outdoors, you must race against the sunlight."',
    vo_l5_2: '"Camille played all the women in the painting. She said one person was enough."',
    vo_l5_3: '"Claude, the wind blew my hat away again!" — Camille',
    vo_l5_4: '"Don\'t move! The light just fell on you — this is the moment!"',
    vo_l5_4r: '"Do you care more about where the light falls, or where I stand?" — Camille',
    vo_l5_5: '"Light waits for no one, but a brush can chase it."',
    vo_l5_6: '"Four women, one Camille. That is our secret."',
    l6_name: 'Woman with a Parasol', l6_subtitle: '1875 · Hilltop in Argenteuil',
    l6_painting_title: 'Woman with a Parasol', l6_artist: 'Claude Monet, 1875',
    l6_painting_desc: "One of Monet's most iconic works. Camille and young Jean stand on a hilltop, wind billowing her dress and veil, parasol tilted against the sun. Sky dominates the canvas as clouds race past. This moment of lightness and freedom captures the happiest time in Monet's life.",
    l6_hint1: 'Hold jump to glide with the parasol', l6_hint2: 'Updrafts will lift you higher', l6_hint3: 'Dandelion seeds dance in the wind — follow them', l6_hint4: 'Keep climbing the hillside',
    sv_l6_1: 'Dandelion', sv_l6_2: "Jean's Toy Boat", sv_l6_3: 'Picnic Basket',
    sv_l6_4: 'Straw Hat', sv_l6_5: 'Love Letter',
    sv_l6_1_desc: 'A perfect dandelion seed head. One gust and its white seeds scatter like the dancing points of light in Monet\'s paintings.',
    sv_l6_2_desc: 'Little Jean\'s beloved handmade wooden sailboat, its paint worn and chipped. Every weekend he sailed it on the pond while his father sketched nearby.',
    sv_l6_3_desc: 'A wicker picnic basket with bread and grapes. Afternoons on the hillside with his family were the finest pigment of all.',
    sv_l6_4_desc: 'Camille\'s straw hat with its blue ribbon. The wind always tilted it askew, letting sunlight spill through the brim onto her smiling face.',
    sv_l6_5_desc: 'A love letter from Monet to Camille. Between elegant lines of handwriting, his obsession with light and his love for her are inseparable.',
    vo_l6_1: '"The wind on this hilltop makes everything feel weightless."',
    vo_l6_2: '"Camille with her parasol looks like a butterfly."',
    vo_l6_3: '"Claude, little Jean says he wants to fly!" — Camille',
    vo_l6_4: '"Tell him — a paintbrush can make anyone fly."',
    vo_l6_4r: '"And you? Where would you fly to?" — Camille',
    vo_l6_5: '"Anywhere you are."',
    vo_l6_6: '"This moment of wind, light, and her smile — I must keep them forever."',
  }
};

function t(key) { return (LANG[currentLang] && LANG[currentLang][key]) || (LANG.zh[key]) || key; }

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('monet_lang', lang);
  updateUIStrings();
}

function updateUIStrings() {
  const q = (sel) => document.querySelector(sel);
  const g = (id) => document.getElementById(id);
  if (q('#loading-screen h1')) q('#loading-screen h1').textContent = t('loading_title');
  if (q('#loading-screen .subtitle')) q('#loading-screen .subtitle').textContent = t('loading_subtitle');
  if (g('loading-text')) g('loading-text').textContent = t('loading_text');
  if (q('.menu-title')) q('.menu-title').textContent = t('menu_title');
  if (q('.menu-subtitle')) q('.menu-subtitle').textContent = t('menu_subtitle');
  if (g('btn-start')) g('btn-start').textContent = t('btn_start');
  if (g('btn-gallery')) g('btn-gallery').textContent = t('btn_gallery');
  if (g('btn-continue')) g('btn-continue').textContent = t('btn_continue');
  if (g('btn-gallery-back')) g('btn-gallery-back').textContent = t('btn_gallery_back');
  if (q('.gallery-header h2')) q('.gallery-header h2').textContent = t('gallery_header');
  if (g('btn-lang')) g('btn-lang').textContent = t('lang_toggle');
  if (g('hud-lang-btn')) g('hud-lang-btn').textContent = t('lang_toggle');
  if (g('btn-album')) g('btn-album').textContent = t('btn_album');
  if (g('pause-title')) g('pause-title').textContent = t('pause_title');
  if (g('btn-resume')) g('btn-resume').textContent = t('btn_resume');
  if (g('btn-back-menu')) g('btn-back-menu').textContent = t('btn_back_menu');
}

// ============================================================
// SECTION 0.5: VOICEOVER SYSTEM
// 语音旁白系统：位置/事件触发 → 英文TTS音频播放 + 中英字幕显示
// 支持连锁对话（莫奈-卡米耶对话自动排队播放）
// 音频加载失败时优雅降级为纯字幕模式
// ============================================================
const VoiceoverSystem = {
  active: false,
  currentAudio: null,
  subtitleText: '',
  speakerName: '',
  displayTimer: 0,
  fadeAlpha: 0,
  triggered: {}, // track which triggers have fired
  queue: [],
  pending: [], // queued VOs waiting for current to finish

  // Voiceover trigger definitions per level
  triggers: [
    // Index 0: Woman in the Green Dress
    [
      { x: 200, key: 'vo_l4_1', speaker: 'Monet', audio: 'vo/l4_v1.mp3' },
      { x: 500, key: 'vo_l4_2', speaker: 'Monet', audio: 'vo/l4_v2.mp3' },
      { x: 800, key: 'vo_l4_3', speaker: 'Camille', audio: 'vo/l4_v3.mp3', chain: [
        { key: 'vo_l4_4', speaker: 'Monet', audio: 'vo/l4_v4.mp3', delay: 4 },
        { key: 'vo_l4_4r', speaker: 'Camille', audio: 'vo/l4_v4r.mp3', delay: 4 },
      ]},
      { x: 1400, key: 'vo_l4_5', speaker: 'Monet', audio: 'vo/l4_v5.mp3' },
      { event: 'gate_unlock', key: 'vo_l4_6', speaker: 'Monet', audio: 'vo/l4_v6.mp3' },
    ],
    // Index 1: Women in the Garden
    [
      { x: 200, key: 'vo_l5_1', speaker: 'Monet', audio: 'vo/l5_v1.mp3' },
      { x: 600, key: 'vo_l5_2', speaker: 'Monet', audio: 'vo/l5_v2.mp3' },
      { x: 900, key: 'vo_l5_3', speaker: 'Camille', audio: 'vo/l5_v3.mp3', chain: [
        { key: 'vo_l5_4', speaker: 'Monet', audio: 'vo/l5_v4.mp3', delay: 4 },
        { key: 'vo_l5_4r', speaker: 'Camille', audio: 'vo/l5_v4r.mp3', delay: 4 },
      ]},
      { x: 1500, key: 'vo_l5_5', speaker: 'Monet', audio: 'vo/l5_v5.mp3' },
      { event: 'gate_unlock', key: 'vo_l5_6', speaker: 'Monet', audio: 'vo/l5_v6.mp3' },
    ],
    // Index 2: Woman with a Parasol
    [
      { x: 150, key: 'vo_l6_1', speaker: 'Monet', audio: 'vo/l6_v1.mp3' },
      { x: 450, key: 'vo_l6_2', speaker: 'Monet', audio: 'vo/l6_v2.mp3' },
      { x: 700, key: 'vo_l6_3', speaker: 'Camille', audio: 'vo/l6_v3.mp3', chain: [
        { key: 'vo_l6_4', speaker: 'Monet', audio: 'vo/l6_v4.mp3', delay: 4 },
        { key: 'vo_l6_4r', speaker: 'Camille', audio: 'vo/l6_v4r.mp3', delay: 4 },
      ]},
      { x: 1100, key: 'vo_l6_5', speaker: 'Monet', audio: 'vo/l6_v5.mp3' },
      { event: 'gate_unlock', key: 'vo_l6_6', speaker: 'Monet', audio: 'vo/l6_v6.mp3' },
    ],
    // Index 3: Water Lilies
    [
      { x: 200, key: 'vo_l1_1', speaker: 'Monet', audio: 'vo/l1_v1.mp3' },
      { x: 500, key: 'vo_l1_2', speaker: 'Monet', audio: 'vo/l1_v2.mp3' },
      { x: 700, key: 'vo_l1_3', speaker: 'Camille', audio: 'vo/l1_v3.mp3', chain: [
        { key: 'vo_l1_4', speaker: 'Monet', audio: 'vo/l1_v4.mp3', delay: 4 },
        { key: 'vo_l1_4r', speaker: 'Camille', audio: 'vo/l1_v4r.mp3', delay: 4 },
      ]},
      { x: 1100, key: 'vo_l1_5', speaker: 'Monet', audio: 'vo/l1_v5.mp3' },
      { event: 'gate_unlock', key: 'vo_l1_6', speaker: 'Monet', audio: 'vo/l1_v6.mp3' },
    ],
    // Index 4: Impression, Sunrise
    [
      { x: 200, key: 'vo_l2_1', speaker: 'Monet', audio: 'vo/l2_v1.mp3' },
      { x: 500, key: 'vo_l2_2', speaker: 'Monet', audio: 'vo/l2_v2.mp3' },
      { x: 800, key: 'vo_l2_3', speaker: 'Camille', audio: 'vo/l2_v3.mp3', chain: [
        { key: 'vo_l2_4', speaker: 'Monet', audio: 'vo/l2_v4.mp3', delay: 4 },
        { key: 'vo_l2_4r', speaker: 'Camille', audio: 'vo/l2_v4r.mp3', delay: 4 },
      ]},
      { x: 1200, key: 'vo_l2_5', speaker: 'Monet', audio: 'vo/l2_v5.mp3' },
      { event: 'gate_unlock', key: 'vo_l2_6', speaker: 'Monet', audio: 'vo/l2_v6.mp3' },
    ],
    // Index 5: The Japanese Bridge
    [
      { x: 200, key: 'vo_l3_1', speaker: 'Monet', audio: 'vo/l3_v1.mp3' },
      { x: 550, key: 'vo_l3_2', speaker: 'Monet', audio: 'vo/l3_v2.mp3' },
      { x: 900, key: 'vo_l3_3', speaker: 'Camille', audio: 'vo/l3_v3.mp3', chain: [
        { key: 'vo_l3_4', speaker: 'Monet', audio: 'vo/l3_v4.mp3', delay: 3.5 },
        { key: 'vo_l3_4r', speaker: 'Camille', audio: 'vo/l3_v4r.mp3', delay: 3.5 },
      ]},
      { x: 1300, key: 'vo_l3_5', speaker: 'Monet', audio: 'vo/l3_v5.mp3' },
      { event: 'gate_unlock', key: 'vo_l3_6', speaker: 'Monet', audio: 'vo/l3_v6.mp3' },
    ],
  ],

  reset(levelIdx) {
    this.active = false;
    this.subtitleText = '';
    this.speakerName = '';
    this.displayTimer = 0;
    this.fadeAlpha = 0;
    this.triggered = {};
    this.queue = [];
    this.pending = [];
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  },

  // Check if system is busy (playing or still displaying subtitle)
  isBusy() {
    return (this.currentAudio && !this.currentAudio.ended) || (this.active && this.displayTimer > 1.5);
  },

  // Smoothly fade out current audio, then call callback
  _fadeOutCurrent(callback) {
    if (this.currentAudio && !this.currentAudio.ended) {
      const audio = this.currentAudio;
      const startVol = audio.volume;
      const fadeSteps = 15;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        audio.volume = Math.max(0, startVol * (1 - step / fadeSteps));
        if (step >= fadeSteps) {
          clearInterval(interval);
          audio.pause();
          if (this.currentAudio === audio) this.currentAudio = null;
          if (callback) callback();
        }
      }, 30); // 450ms total fade
    } else {
      if (callback) callback();
    }
  },

  // Internal: actually play an entry immediately
  _playNow(entry) {
    this.triggered[entry.key] = true;
    this.speakerName = entry.speaker;
    this.subtitleText = t(entry.key);
    this.displayTimer = 5;
    this.fadeAlpha = 0; // Start at 0, will ramp up in update()
    this._fadeInTimer = 0;
    this.active = true;

    // Try audio playback, graceful fallback to subtitle-only
    try {
      if (this.currentAudio) { this.currentAudio.pause(); this.currentAudio = null; }
      const audio = new Audio(entry.audio);
      audio.volume = 0; // Start silent for fade-in
      audio.play().catch(() => {});
      // Fade in audio volume over 400ms
      let fadeStep = 0;
      const fadeIn = setInterval(() => {
        fadeStep++;
        audio.volume = Math.min(0.7, 0.7 * (fadeStep / 12));
        if (fadeStep >= 12) clearInterval(fadeIn);
      }, 33); // ~400ms to reach 0.7
      audio.onended = () => {
        if (this.currentAudio === audio) {
          this.currentAudio = null;
          // When audio ends, let subtitle linger briefly then advance
          this.displayTimer = Math.min(this.displayTimer, 1.8);
        }
      };
      this.currentAudio = audio;
    } catch (e) {
      // Subtitle-only fallback
    }

    // Queue chained dialogue
    if (entry.chain) {
      let totalDelay = 0;
      entry.chain.forEach(ch => {
        totalDelay += (ch.delay || 4);
        this.queue.push({ ...ch, triggerTime: totalDelay });
      });
      this._chainTimer = 0;
    }
  },

  play(entry, priority) {
    if (this.triggered[entry.key]) return;
    // High priority (events like gate_unlock): fade out current, then play
    if (priority === 'high') {
      if (this.currentAudio && !this.currentAudio.ended) {
        this.triggered[entry.key] = true;
        this._fadeOutCurrent(() => { this._playNow(entry); });
      } else {
        this._playNow(entry);
      }
      return;
    }
    // If busy, queue it for later (don't interrupt)
    if (this.isBusy()) {
      this.triggered[entry.key] = true; // prevent re-trigger
      this.pending.push(entry);
      return;
    }
    this._playNow(entry);
  },

  fireEvent(eventName, levelIdx) {
    const lvlTriggers = this.triggers[levelIdx];
    if (!lvlTriggers) return;
    lvlTriggers.forEach(tr => {
      if (tr.event === eventName && !this.triggered[tr.key]) {
        this.play(tr, 'high');
      }
    });
  },

  update(dt, playerX, levelIdx) {
    // Check position-based triggers
    const lvlTriggers = this.triggers[levelIdx];
    if (lvlTriggers) {
      lvlTriggers.forEach(tr => {
        if (tr.x !== undefined && !this.triggered[tr.key]) {
          if (Math.abs(playerX - tr.x) < 60) {
            this.play(tr);
          }
        }
      });
    }

    // Process chain queue
    if (this.queue.length > 0) {
      this._chainTimer = (this._chainTimer || 0) + dt;
      const next = this.queue[0];
      if (this._chainTimer >= next.triggerTime) {
        this.queue.shift();
        this.play(next);
        if (this.queue.length === 0) this._chainTimer = 0;
      }
    }

    // Subtitle fade-in/fade-out
    if (this.displayTimer > 0) {
      this.displayTimer -= dt;
      this._fadeInTimer = (this._fadeInTimer || 0) + dt;

      // Fade in: ramp from 0 to 1 over 0.4s
      if (this._fadeInTimer < 0.4) {
        this.fadeAlpha = Math.min(1, this._fadeInTimer / 0.4);
      } else if (this.displayTimer > 1.2) {
        this.fadeAlpha = 1;
      }

      // Fade out subtitle: smooth ramp over last 1.2s
      if (this.displayTimer <= 1.2) {
        this.fadeAlpha = Math.max(0, this.displayTimer / 1.2);
      }

      // Start fading out audio 0.8s before subtitle ends
      if (this.displayTimer <= 0.8 && this.displayTimer > 0.3 && this.currentAudio && !this.currentAudio.ended) {
        this.currentAudio.volume = Math.max(0, 0.7 * (this.displayTimer - 0.3) / 0.5);
      }

      if (this.displayTimer <= 0) {
        this.active = false;
        this.subtitleText = '';
        this._fadeInTimer = 0;
        // Play next pending VO if any
        if (this.pending.length > 0) {
          const next = this.pending.shift();
          this._playNow(next);
        }
      }
    }
  },

  draw(ctx, w, h) {
    if (!this.active || !this.subtitleText || this.fadeAlpha <= 0) return;

    const barH = 60;
    const y = 50;
    const isCamille = this.speakerName === 'Camille';

    ctx.save();
    ctx.globalAlpha = this.fadeAlpha * 0.85;

    // Background bar
    ctx.fillStyle = 'rgba(10,10,18,0.7)';
    ctx.fillRect(0, y, w, barH);
    // Accent left border (speaker-specific color)
    ctx.fillStyle = isCamille ? 'rgba(220,180,200,0.5)' : 'rgba(200,180,120,0.5)';
    ctx.fillRect(0, y, 3, barH);
    // Top/bottom borders
    ctx.fillStyle = 'rgba(245,234,208,0.1)';
    ctx.fillRect(0, y, w, 1);
    ctx.fillRect(0, y + barH - 1, w, 1);

    ctx.globalAlpha = this.fadeAlpha;

    // Speaker icon (small circle avatar)
    const iconX = w / 2 - 180;
    const iconY = y + barH / 2;
    const iconR = 16;
    ctx.save();
    // Circle background
    ctx.fillStyle = isCamille ? 'rgba(220,180,200,0.25)' : 'rgba(200,180,120,0.25)';
    ctx.beginPath();
    ctx.arc(iconX, iconY, iconR, 0, Math.PI * 2);
    ctx.fill();
    // Circle border
    ctx.strokeStyle = isCamille ? 'rgba(220,180,200,0.4)' : 'rgba(200,180,120,0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Silhouette icon
    ctx.fillStyle = isCamille ? 'rgba(220,180,200,0.7)' : 'rgba(200,180,120,0.7)';
    if (isCamille) {
      // Flower icon for Camille
      for (let p = 0; p < 5; p++) {
        const angle = (p / 5) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.ellipse(iconX + Math.cos(angle) * 5, iconY + Math.sin(angle) * 5, 3.5, 2.5, angle, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = isCamille ? 'rgba(240,210,220,0.8)' : 'rgba(220,200,140,0.8)';
      ctx.beginPath();
      ctx.arc(iconX, iconY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Beret + head for Monet
      ctx.beginPath();
      ctx.arc(iconX, iconY + 2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(iconX, iconY - 5, 9, 4, 0, Math.PI, 0);
      ctx.fill();
    }
    ctx.restore();

    // Speaker name (shifted right of icon)
    const textCenterX = w / 2 + 10;
    ctx.font = '600 0.75em Georgia, serif';
    ctx.fillStyle = isCamille ? 'rgba(220,180,200,0.8)' : 'rgba(240,220,160,0.8)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isCamille ? '卡米耶 Camille' : '莫奈 Claude Monet', textCenterX, y + 18);

    // Quote text
    ctx.font = '300 0.9em Georgia, serif';
    ctx.fillStyle = 'rgba(245,234,208,0.9)';
    ctx.fillText(this.subtitleText, textCenterX, y + 42);

    ctx.restore();
  }
};

// ============================================================
// SECTION 1: AUDIO ENGINE
// 音频引擎：基于 Web Audio API 的程序化环境音乐生成
// 4层音乐：和弦Pad + 五声音阶旋律 + 低音Bass + 滤波噪声纹理
// 8种音效：跳跃、着陆、收集、碎片、关卡完成、脚步、提示、菜单
// ============================================================
const AudioEngine = {
  ctx: null,
  initialized: false,
  tracks: {},
  masterGain: null,
  reverbNode: null,
  musicScheduler: null,

  init() {
    if (this.initialized) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Master gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.85;
    // Simple reverb via delay feedback
    const delay = this.ctx.createDelay(0.5);
    delay.delayTime.value = 0.25;
    const feedback = this.ctx.createGain();
    feedback.gain.value = 0.2;
    const wetGain = this.ctx.createGain();
    wetGain.gain.value = 0.15;
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wetGain);
    wetGain.connect(this.ctx.destination);
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.connect(delay);
    this.reverbNode = delay;
    this.initialized = true;
  },

  _note(freq, type, startTime, duration, vol, dest) {
    const c = this.ctx;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    // Soft ADSR
    const a = Math.min(0.04, duration * 0.15);
    const r = Math.min(0.15, duration * 0.4);
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(vol, startTime + a);
    g.gain.setValueAtTime(vol, startTime + duration - r);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(g);
    g.connect(dest || this.masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
    return osc;
  },

  // ========================
  // BACKGROUND MUSIC - layered generative music per level
  // ========================
  playAmbient(levelIdx) {
    this.init();
    this.stopMusic();
    const c = this.ctx;
    const busGain = c.createGain();
    busGain.gain.value = 0;
    busGain.gain.linearRampToValueAtTime(1, c.currentTime + 2.5);
    busGain.connect(this.masterGain);

    // === Layer 1: Warm pad (sustained chords) ===
    const padGain = c.createGain();
    padGain.gain.value = 0.045;
    padGain.connect(busGain);
    const padChords = [
      [[130.81,164.81,196.00,261.63],[146.83,174.61,220.00,293.66],[164.81,207.65,246.94,329.63],[174.61,220.00,261.63,349.23]],
      [[146.83,185.00,220.00,293.66],[164.81,207.65,261.63,329.63],[174.61,220.00,277.18,349.23],[146.83,185.00,233.08,293.66]],
      [[164.81,207.65,246.94,329.63],[196.00,246.94,293.66,392.00],[174.61,220.00,261.63,349.23],[164.81,207.65,246.94,329.63]]
    ][levelIdx] || [[130.81,164.81,196.00,261.63]];
    const padOscs = [];
    const padChordDur = 4.0;
    const loopLen = padChords.length * padChordDur;

    const schedulePad = (baseTime) => {
      padChords.forEach((chord, ci) => {
        const t = baseTime + ci * padChordDur;
        chord.forEach(freq => {
          ['sine','triangle'].forEach((type, ti) => {
            const o = c.createOscillator();
            o.type = type;
            o.frequency.value = freq * (ti === 1 ? 2.005 : 1); // slight detune for richness
            const g = c.createGain();
            const vol = ti === 0 ? 0.3 : 0.12;
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(vol, t + 0.8);
            g.gain.setValueAtTime(vol, t + padChordDur - 1.0);
            g.gain.linearRampToValueAtTime(0, t + padChordDur);
            o.connect(g); g.connect(padGain);
            // LFO shimmer
            const lfo = c.createOscillator();
            lfo.frequency.value = 0.08 + Math.random() * 0.2;
            const lfoG = c.createGain();
            lfoG.gain.value = 1.5;
            lfo.connect(lfoG); lfoG.connect(o.frequency);
            lfo.start(t); lfo.stop(t + padChordDur + 0.1);
            o.start(t); o.stop(t + padChordDur + 0.1);
            padOscs.push(o);
          });
        });
      });
    };

    // === Layer 2: Gentle melody (pentatonic, level-specific) ===
    const melGain = c.createGain();
    melGain.gain.value = 0.06;
    melGain.connect(busGain);
    const melodies = [
      // Water Lilies: dreamy C pentatonic
      [523.25,0,587.33,0,659.25,0,783.99,659.25,0,523.25,0,0,587.33,0,783.99,659.25],
      // Sunrise: warm D pentatonic
      [587.33,0,659.25,0,783.99,0,880.00,783.99,0,659.25,0,0,587.33,0,659.25,783.99],
      // Bridge: bright E pentatonic
      [659.25,0,783.99,0,880.00,0,1046.50,880.00,0,783.99,0,0,659.25,0,783.99,880.00]
    ][levelIdx] || [];
    const melNoteLen = loopLen / melodies.length;
    const melOscs = [];

    const scheduleMelody = (baseTime) => {
      melodies.forEach((freq, i) => {
        if (freq === 0) return;
        const t = baseTime + i * melNoteLen;
        const dur = melNoteLen * 0.85;
        const o = c.createOscillator();
        o.type = 'sine';
        o.frequency.value = freq;
        const g = c.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.5, t + 0.06);
        g.gain.setValueAtTime(0.35, t + dur * 0.5);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.connect(g); g.connect(melGain);
        o.start(t); o.stop(t + dur + 0.01);
        melOscs.push(o);
      });
    };

    // === Layer 3: Bass note (root of each chord) ===
    const bassGain = c.createGain();
    bassGain.gain.value = 0.04;
    bassGain.connect(busGain);
    const bassOscs = [];

    const scheduleBass = (baseTime) => {
      padChords.forEach((chord, ci) => {
        const t = baseTime + ci * padChordDur;
        const o = c.createOscillator();
        o.type = 'sine';
        o.frequency.value = chord[0] * 0.5; // one octave below root
        const g = c.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.5, t + 0.3);
        g.gain.setValueAtTime(0.4, t + padChordDur - 0.5);
        g.gain.linearRampToValueAtTime(0, t + padChordDur);
        o.connect(g); g.connect(bassGain);
        o.start(t); o.stop(t + padChordDur + 0.1);
        bassOscs.push(o);
      });
    };

    // === Layer 4: Atmospheric texture (filtered noise bursts) ===
    const texGain = c.createGain();
    texGain.gain.value = 0.012;
    texGain.connect(busGain);

    const scheduleTexture = (baseTime) => {
      for (let i = 0; i < 6; i++) {
        const t = baseTime + (loopLen / 6) * i + Math.random() * 1.5;
        const dur = 1.5 + Math.random() * 2;
        const bufLen = c.sampleRate * dur;
        const buf = c.createBuffer(1, bufLen, c.sampleRate);
        const data = buf.getChannelData(0);
        for (let s = 0; s < bufLen; s++) {
          data[s] = (Math.random() * 2 - 1);
        }
        const src = c.createBufferSource();
        src.buffer = buf;
        const filt = c.createBiquadFilter();
        filt.type = 'bandpass';
        filt.frequency.value = 800 + levelIdx * 400;
        filt.Q.value = 5;
        const g = c.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(1, t + 0.5);
        g.gain.linearRampToValueAtTime(0, t + dur);
        src.connect(filt); filt.connect(g); g.connect(texGain);
        src.start(t); src.stop(t + dur + 0.01);
      }
    };

    // Schedule first two loops immediately
    const startT = c.currentTime + 0.1;
    schedulePad(startT);
    scheduleMelody(startT);
    scheduleBass(startT);
    scheduleTexture(startT);
    schedulePad(startT + loopLen);
    scheduleMelody(startT + loopLen);
    scheduleBass(startT + loopLen);
    scheduleTexture(startT + loopLen);

    // Continuously schedule ahead
    let nextLoop = startT + loopLen * 2;
    this.musicScheduler = setInterval(() => {
      if (c.currentTime > nextLoop - loopLen) {
        schedulePad(nextLoop);
        scheduleMelody(nextLoop);
        scheduleBass(nextLoop);
        scheduleTexture(nextLoop);
        nextLoop += loopLen;
      }
    }, 2000);

    this.tracks.ambient = { gain: busGain, allOscs: padOscs.concat(melOscs, bassOscs) };
  },

  stopMusic() {
    if (this.musicScheduler) {
      clearInterval(this.musicScheduler);
      this.musicScheduler = null;
    }
    if (this.tracks.ambient) {
      const t = this.ctx.currentTime;
      this.tracks.ambient.gain.gain.linearRampToValueAtTime(0, t + 1.5);
      setTimeout(() => {
        try { this.tracks.ambient.allOscs.forEach(o => { try{o.stop();}catch(e){} }); } catch(e){}
      }, 1600);
      this.tracks.ambient = null;
    }
  },

  // ========================
  // SOUND EFFECTS - richer, more musical
  // ========================
  playJump() {
    this.init();
    const c = this.ctx; const t = c.currentTime;
    // Bright ascending twinkle
    [400, 600, 900].forEach((f, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = i === 0 ? 'sine' : 'triangle';
      o.frequency.setValueAtTime(f, t + i * 0.04);
      o.frequency.exponentialRampToValueAtTime(f * 1.5, t + i * 0.04 + 0.12);
      g.gain.setValueAtTime(0, t + i * 0.04);
      g.gain.linearRampToValueAtTime(0.07 - i * 0.015, t + i * 0.04 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.18);
      o.connect(g); g.connect(this.masterGain);
      o.start(t + i * 0.04); o.stop(t + i * 0.04 + 0.2);
    });
  },

  playCollect() {
    this.init();
    const c = this.ctx; const t = c.currentTime;
    // Sparkling harp-like arpeggio with shimmer
    const notes = [783.99, 987.77, 1174.66, 1567.98, 1975.53];
    notes.forEach((f, i) => {
      const delay = i * 0.06;
      // Main tone
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t + delay);
      g.gain.linearRampToValueAtTime(0.1 - i * 0.012, t + delay + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.45);
      o.connect(g); g.connect(this.masterGain);
      o.start(t + delay); o.stop(t + delay + 0.5);
      // Octave shimmer
      const o2 = c.createOscillator();
      const g2 = c.createGain();
      o2.type = 'triangle';
      o2.frequency.value = f * 2;
      g2.gain.setValueAtTime(0, t + delay + 0.01);
      g2.gain.linearRampToValueAtTime(0.03, t + delay + 0.03);
      g2.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.3);
      o2.connect(g2); g2.connect(this.masterGain);
      o2.start(t + delay); o2.stop(t + delay + 0.35);
    });
  },

  playPaintingFragment() {
    this.init();
    const c = this.ctx; const t = c.currentTime;
    // Magical chime with reverb tail - for special collectibles
    const notes = [659.25, 880.00, 1046.50, 1318.51, 1046.50, 1567.98];
    notes.forEach((f, i) => {
      const delay = i * 0.09;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = i % 2 === 0 ? 'sine' : 'triangle';
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t + delay);
      g.gain.linearRampToValueAtTime(0.12, t + delay + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.7);
      o.connect(g); g.connect(this.masterGain);
      o.start(t + delay); o.stop(t + delay + 0.75);
    });
    // Deep resonance underneath
    const bass = c.createOscillator();
    const bg = c.createGain();
    bass.type = 'sine'; bass.frequency.value = 220;
    bg.gain.setValueAtTime(0, t);
    bg.gain.linearRampToValueAtTime(0.06, t + 0.1);
    bg.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    bass.connect(bg); bg.connect(this.masterGain);
    bass.start(t); bass.stop(t + 1.3);
  },

  playLevelComplete() {
    this.init();
    this.stopMusic();
    const c = this.ctx; const t = c.currentTime;
    // Grand ascending fanfare with harmony
    const melody = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    const harmony = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
    melody.forEach((f, i) => {
      const delay = i * 0.18;
      const dur = 0.6 + (i === melody.length - 1 ? 1.2 : 0);
      // Melody
      this._note(f, 'triangle', t + delay, dur, 0.1, this.masterGain);
      // Harmony (third below)
      this._note(harmony[i], 'sine', t + delay + 0.02, dur * 0.9, 0.06, this.masterGain);
    });
    // Final chord sustain
    const chordT = t + melody.length * 0.18 + 0.3;
    [523.25, 659.25, 783.99, 1046.50].forEach(f => {
      this._note(f, 'sine', chordT, 2.5, 0.07, this.masterGain);
    });
    // Shimmer dust
    for (let s = 0; s < 10; s++) {
      const sf = 1000 + Math.random() * 3000;
      const st = chordT + Math.random() * 2;
      this._note(sf, 'sine', st, 0.15 + Math.random() * 0.2, 0.015, this.masterGain);
    }
  },

  playStep() {
    this.init();
    const c = this.ctx; const t = c.currentTime;
    // Soft water droplet footstep
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    const baseF = 230 + Math.random() * 120;
    o.frequency.setValueAtTime(baseF, t);
    o.frequency.exponentialRampToValueAtTime(baseF * 0.6, t + 0.07);
    g.gain.setValueAtTime(0.025 + Math.random() * 0.01, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    o.connect(g); g.connect(this.masterGain);
    o.start(t); o.stop(t + 0.1);
  },

  playLand() {
    this.init();
    const c = this.ctx; const t = c.currentTime;
    // Soft thud with splash
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(80, t + 0.12);
    g.gain.setValueAtTime(0.07, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g); g.connect(this.masterGain);
    o.start(t); o.stop(t + 0.2);
    // Splash component
    const bufLen = c.sampleRate * 0.1;
    const buf = c.createBuffer(1, bufLen, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i/bufLen);
    const src = c.createBufferSource(); src.buffer = buf;
    const filt = c.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 600;
    const sg = c.createGain(); sg.gain.value = 0.025;
    src.connect(filt); filt.connect(sg); sg.connect(this.masterGain);
    src.start(t); src.stop(t + 0.12);
  },

  playHint() {
    this.init();
    const c = this.ctx; const t = c.currentTime;
    // Gentle notification chime
    this._note(880, 'sine', t, 0.3, 0.06, this.masterGain);
    this._note(1108.73, 'sine', t + 0.1, 0.25, 0.04, this.masterGain);
    this._note(1318.51, 'triangle', t + 0.2, 0.4, 0.03, this.masterGain);
  },

  playMenuClick() {
    this.init();
    const c = this.ctx; const t = c.currentTime;
    this._note(880, 'sine', t, 0.08, 0.05, this.masterGain);
    this._note(1318.51, 'sine', t + 0.04, 0.1, 0.04, this.masterGain);
  },

  playDeath() {
    this.init();
    const c = this.ctx; const t = c.currentTime;
    // Descending dissolve tone
    [600, 450, 300, 180].forEach((f, i) => {
      const delay = i * 0.12;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(f, t + delay);
      o.frequency.exponentialRampToValueAtTime(f * 0.5, t + delay + 0.3);
      g.gain.setValueAtTime(0, t + delay);
      g.gain.linearRampToValueAtTime(0.06 - i * 0.01, t + delay + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.35);
      o.connect(g); g.connect(this.masterGain);
      o.start(t + delay); o.stop(t + delay + 0.4);
    });
    // Splash noise
    const bufLen = c.sampleRate * 0.2;
    const buf = c.createBuffer(1, bufLen, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen);
    const src = c.createBufferSource(); src.buffer = buf;
    const filt = c.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 400;
    const sg = c.createGain(); sg.gain.value = 0.04;
    src.connect(filt); filt.connect(sg); sg.connect(this.masterGain);
    src.start(t + 0.1); src.stop(t + 0.35);
  }
};

// ============================================================
// SECTION 2: PARTICLE SYSTEM
// 粒子系统：对象池管理，支持 glow/circle 两种渲染模式
// 用于跳跃尘埃、收集爆发、角色拖尾、环境萤火虫等效果
// ============================================================
class Particle {
  constructor(x, y, config = {}) {
    this.x = x;
    this.y = y;
    this.vx = config.vx || (Math.random() - 0.5) * 2;
    this.vy = config.vy || (Math.random() - 0.5) * 2;
    this.life = config.life || 1;
    this.maxLife = this.life;
    this.size = config.size || 3;
    this.color = config.color || 'rgba(245,234,208,';
    this.gravity = config.gravity || 0;
    this.friction = config.friction || 0.99;
    this.type = config.type || 'circle'; // circle, brush, glow
  }

  update(dt) {
    this.vy += this.gravity * dt;
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    this.life -= dt;
    return this.life > 0;
  }

  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    const s = this.size * (0.5 + alpha * 0.5);

    if (this.type === 'glow') {
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, s * 3);
      gradient.addColorStop(0, this.color + (alpha * 0.6) + ')');
      gradient.addColorStop(0.5, this.color + (alpha * 0.2) + ')');
      gradient.addColorStop(1, this.color + '0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(this.x - s * 3, this.y - s * 3, s * 6, s * 6);
    } else if (this.type === 'brush') {
      ctx.save();
      ctx.globalAlpha = alpha * 0.7;
      ctx.fillStyle = this.color + '1)';
      ctx.beginPath();
      // Irregular brush stroke shape
      ctx.ellipse(this.x, this.y, s * 1.5, s * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = this.color + alpha + ')';
      ctx.beginPath();
      ctx.arc(this.x, this.y, s, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

const ParticleSystem = {
  particles: [],

  emit(x, y, count, config) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, typeof config === 'function' ? config(i) : config));
    }
  },

  update(dt) {
    this.particles = this.particles.filter(p => p.update(dt));
  },

  draw(ctx) {
    this.particles.forEach(p => p.draw(ctx));
  },

  clear() {
    this.particles = [];
  }
};

// ============================================================
// SECTION 3: INPUT HANDLER
// 输入处理：键盘 + 移动端触屏，支持跳跃边沿检测（按下瞬间触发，非持续触发）
// ESC=暂停  Tab/B=背包  ←→=移动  ↑/空格=跳跃
// ============================================================
const Input = {
  keys: {},
  touches: { left: false, right: false, jump: false },
  prevJump: false,
  jumpPressed: false,

  init() {
    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        e.preventDefault();
      }
      if (e.code === 'Escape') {
        Game.togglePause();
      }
      if (e.code === 'Tab' || e.code === 'KeyB') {
        e.preventDefault();
        Game.toggleBackpack();
      }
    });
    window.addEventListener('keyup', e => { this.keys[e.code] = false; });

    // Mobile controls
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 800;
    if (isMobile) {
      document.getElementById('mobile-controls').style.display = 'flex';
    }

    const addTouch = (id, key) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('touchstart', e => { e.preventDefault(); this.touches[key] = true; });
      btn.addEventListener('touchend', e => { e.preventDefault(); this.touches[key] = false; });
      btn.addEventListener('touchcancel', e => { this.touches[key] = false; });
      btn.addEventListener('mousedown', e => { this.touches[key] = true; });
      btn.addEventListener('mouseup', e => { this.touches[key] = false; });
    };
    addTouch('btn-left', 'left');
    addTouch('btn-right', 'right');
    addTouch('btn-jump', 'jump');
  },

  isLeft() { return this.keys['ArrowLeft'] || this.keys['KeyA'] || this.touches.left; },
  isRight() { return this.keys['ArrowRight'] || this.keys['KeyD'] || this.touches.right; },
  isJump() { return this.keys['Space'] || this.keys['ArrowUp'] || this.keys['KeyW'] || this.touches.jump; },

  updateJumpEdge() {
    const held = this.isJump();
    this.jumpPressed = held && !this.prevJump;
    this.prevJump = held;
  },
};

// ============================================================
// SECTION 4: PLAYER CHARACTER
// 玩家角色：物理引擎（重力/速度/碰撞）+ AI贴图精灵渲染
// 精灵处理：自动去除黑色背景 → 裁剪内容边界 → 缓存为离屏Canvas
// 状态机：idle/walk/jump/fall，对应精灵表的4帧
// 跳跃机制：土狼时间(100ms) + 跳跃缓冲(120ms) + 可变跳跃高度
// ============================================================
class Player {
  constructor() {
    this.x = 150;
    this.y = 400;
    this.w = 40;
    this.h = 50;
    this.vx = 0;
    this.vy = 0;
    this.speed = 280;
    this.jumpForce = -520;
    this.gravity = 1200;
    this.onGround = false;
    this.facing = 1; // 1 right, -1 left
    this.state = 'idle'; // idle, walk, jump, fall
    this.prevState = 'idle';
    this.stateBlend = 1; // 0→1 transition progress
    this.animFrame = 0;
    this.animTimer = 0;
    this.idleBob = 0;
    this.glowPhase = 0;
    this.trailTimer = 0;
    this.stepTimer = 0;
    this.wasOnGround = false;
    this.spriteImg = null;
    this.coyoteTime = 0;
    this.jumpBuffered = false;
    this.jumpBufferTime = 0;
    this.lastSafePos = { x: 150, y: 400 };
    this.landSquash = 0;
    // Smooth animation state
    this.walkCycle = 0;       // continuous walk cycle phase (0→2π)
    this.breathCycle = 0;     // idle breathing phase
    this.idleSwayTimer = 0;   // idle micro-sway accumulator
    this.jumpPhase = 0;       // 0→1 during jump arc
    this.fallTimer = 0;       // time spent falling
    this.stretchY = 1;        // vertical stretch factor (smoothed)
    this.stretchX = 1;        // horizontal stretch factor (smoothed)
    this.tiltAngle = 0;       // body tilt in radians (smoothed)
    this.targetTilt = 0;
    this.targetStretchX = 1;
    this.targetStretchY = 1;
    this.sparkleTimer = 0;    // idle sparkle particles
    this._processedFrames = null;
  }

  update(dt, platforms) {
    // Horizontal movement
    let moveX = 0;
    if (Input.isLeft()) { moveX = -1; this.facing = -1; }
    if (Input.isRight()) { moveX = 1; this.facing = 1; }

    this.vx = moveX * this.speed;

    // Coyote time
    if (this.onGround) {
      this.coyoteTime = 0.1;
    } else {
      this.coyoteTime -= dt;
    }

    // Jump buffer — only on key press (edge), not hold
    if (Input.jumpPressed) {
      this.jumpBuffered = true;
      this.jumpBufferTime = 0.12;
    }
    if (this.jumpBufferTime > 0) this.jumpBufferTime -= dt;
    else this.jumpBuffered = false;

    // Jumping
    if (this.jumpBuffered && this.coyoteTime > 0) {
      this.vy = this.jumpForce;
      this.onGround = false;
      this.coyoteTime = 0;
      this.jumpBuffered = false;
      AudioEngine.playJump();
      // Jump particles
      ParticleSystem.emit(this.x + this.w / 2, this.y + this.h, 8, (i) => ({
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 2 + 1,
        life: 0.5 + Math.random() * 0.3,
        size: 2 + Math.random() * 3,
        color: 'rgba(245,234,208,',
        type: 'glow',
        gravity: 1,
        friction: 0.95
      }));
    }

    // Variable jump height
    if (!Input.isJump() && this.vy < 0) {
      this.vy *= 0.9;
    }

    // Gravity
    this.vy += this.gravity * dt;
    if (this.vy > 800) this.vy = 800;

    // Move
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Platform collision (one-way: land on top only, fall through from below/sides)
    this.wasOnGround = this.onGround;
    this.onGround = false;
    this._onPlatform = null; // track which platform we're standing on
    const prevBottom = this.y + this.h - this.vy * dt;

    for (const p of platforms) {
      if (this.x + this.w > p.x + 4 && this.x < p.x + p.w - 4) {
        // Only land when falling downward AND previous bottom was above or at platform top
        if (this.vy >= 0 && prevBottom <= p.y + 2 && this.y + this.h > p.y && this.y + this.h < p.y + p.h + 10) {
          this.y = p.y - this.h;
          this.vy = 0;
          this.onGround = true;
          this._onPlatform = p;
          // Ride moving platform
          if (p.platformVx) this.x += p.platformVx * dt;
          if (p.platformVy) this.y += p.platformVy * dt;
        }
      }
    }

    // Land sound + squash + safe pos tracking
    if (this.onGround && !this.wasOnGround) {
      AudioEngine.playLand();
      this.landSquash = 0.15;
      // Landing particle burst
      ParticleSystem.emit(this.x + this.w / 2, this.y + this.h, 6, (i) => ({
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 1.5,
        life: 0.3 + Math.random() * 0.2,
        size: 2 + Math.random() * 2,
        color: 'rgba(245,234,208,',
        type: 'glow',
        gravity: 0.5,
        friction: 0.94
      }));
    }
    if (this.onGround) {
      // Never save safe position on disappearing or submerged tidal platforms
      const plat = this._onPlatform;
      if (!plat || (!plat.disappear && !plat.submerged)) {
        this.lastSafePos.x = this.x;
        this.lastSafePos.y = this.y;
      }
    }
    if (this.landSquash > 0) this.landSquash -= dt;

    // State (with transition tracking)
    const newState = !this.onGround
      ? (this.vy < 0 ? 'jump' : 'fall')
      : (Math.abs(this.vx) > 10 ? 'walk' : 'idle');

    if (newState !== this.state) {
      this.prevState = this.state;
      this.state = newState;
      this.stateBlend = 0; // start transition
    }
    // Smooth state blend (0→1)
    if (this.stateBlend < 1) {
      this.stateBlend = Math.min(1, this.stateBlend + dt * 4); // ~250ms transition
    }

    // Animation timers
    this.animTimer += dt;
    this.glowPhase += dt * 2;
    this.breathCycle += dt * 2.5; // idle breathing
    this.idleSwayTimer += dt;

    // Walk cycle — continuous sinusoidal phase tied to speed
    if (this.state === 'walk') {
      const walkSpeed = Math.abs(this.vx) / this.speed; // 0→1 normalized speed
      this.walkCycle += dt * (8 + walkSpeed * 6); // faster walk = faster cycle
      // Target: body lean in movement direction, rhythmic bob
      this.targetTilt = this.facing * 0.06 * walkSpeed;
      const bobPhase = Math.sin(this.walkCycle);
      this.targetStretchX = 1.0 + bobPhase * 0.04;
      this.targetStretchY = 1.0 - bobPhase * 0.03;
    } else {
      this.walkCycle = 0;
    }

    // Jump/fall animation targets
    if (this.state === 'jump') {
      this.jumpPhase = Math.min(1, (this.jumpPhase || 0) + dt * 3);
      this.fallTimer = 0;
      // Stretch upward on launch, normalize near apex
      const launchT = Math.max(0, 1 - this.jumpPhase * 2); // strong at start
      this.targetStretchX = 1.0 - launchT * 0.1;
      this.targetStretchY = 1.0 + launchT * 0.15;
      this.targetTilt = this.facing * 0.04 * (1 - this.jumpPhase);
    } else if (this.state === 'fall') {
      this.jumpPhase = 0;
      this.fallTimer += dt;
      // Elongate slightly as fall speed increases
      const fallIntensity = Math.min(1, this.fallTimer * 1.5);
      this.targetStretchX = 1.0 - fallIntensity * 0.06;
      this.targetStretchY = 1.0 + fallIntensity * 0.08;
      this.targetTilt = 0;
    } else if (this.state === 'idle') {
      this.jumpPhase = 0;
      this.fallTimer = 0;
      // Gentle breathing: subtle scale oscillation
      const breath = Math.sin(this.breathCycle);
      this.targetStretchX = 1.0 + breath * 0.015;
      this.targetStretchY = 1.0 - breath * 0.012;
      // Micro-sway
      const sway = Math.sin(this.idleSwayTimer * 1.2) * 0.015;
      this.targetTilt = sway;
    }

    // Smooth interpolation of stretch/tilt (lerp toward targets)
    const lerpRate = dt * 10;
    this.stretchX += (this.targetStretchX - this.stretchX) * lerpRate;
    this.stretchY += (this.targetStretchY - this.stretchY) * lerpRate;
    this.tiltAngle += (this.targetTilt - this.tiltAngle) * lerpRate;

    // Idle bob (used for vertical position offset)
    this.idleBob += dt * 3;

    if (this.state === 'walk') {
      if (this.animTimer > 0.12) {
        this.animFrame = (this.animFrame + 1) % 4;
        this.animTimer = 0;
      }
      // Walk trail
      this.trailTimer += dt;
      if (this.trailTimer > 0.08) {
        this.trailTimer = 0;
        ParticleSystem.emit(this.x + this.w / 2 - this.facing * 5, this.y + this.h - 5, 1, {
          vx: -this.facing * (0.5 + Math.random()),
          vy: -Math.random() * 1.5,
          life: 0.4 + Math.random() * 0.3,
          size: 2 + Math.random() * 2,
          color: 'rgba(220,210,240,',
          type: 'glow',
          gravity: 0.3,
          friction: 0.96
        });
      }
      // Step sounds (varied timing)
      this.stepTimer += dt;
      if (this.stepTimer > 0.22 + Math.random() * 0.1) {
        this.stepTimer = 0;
        AudioEngine.playStep();
      }
    }

    // Idle sparkle particles (occasional)
    if (this.state === 'idle') {
      this.sparkleTimer += dt;
      if (this.sparkleTimer > 1.5 + Math.random() * 2) {
        this.sparkleTimer = 0;
        const hue = (this.glowPhase * 20) % 360;
        ParticleSystem.emit(this.x + this.w / 2, this.y + this.h * 0.3, 2, (i) => ({
          vx: (Math.random() - 0.5) * 1.5,
          vy: -1 - Math.random() * 1.5,
          life: 0.6 + Math.random() * 0.4,
          size: 1.5 + Math.random() * 2,
          color: `hsla(${hue + i * 30},60%,85%,`,
          type: 'glow',
          gravity: -0.4,
          friction: 0.97
        }));
      }
    }

    // Death — fell off world
    if (this.y > 700) {
      Game.triggerDeath();
    }
  }

  _processSprite() {
    if (!this.spriteImg || this._processedFrames) return;
    const img = this.spriteImg;
    const numFrames = Math.max(1, Math.round(img.width / (img.height * 0.45)));
    const frameW = Math.floor(img.width / numFrames);
    const frameH = img.height;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = frameW;
    tempCanvas.height = frameH;
    const tempCtx = tempCanvas.getContext('2d');

    // Pass 1: find bounding box for each frame, then compute uniform size
    const boxes = [];
    for (let f = 0; f < numFrames; f++) {
      tempCtx.clearRect(0, 0, frameW, frameH);
      tempCtx.drawImage(img, f * frameW, 0, frameW, frameH, 0, 0, frameW, frameH);
      const imageData = tempCtx.getImageData(0, 0, frameW, frameH);
      const data = imageData.data;
      let minX = frameW, minY = frameH, maxX = 0, maxY = 0;
      for (let y = 0; y < frameH; y++) {
        for (let x = 0; x < frameW; x++) {
          const idx = (y * frameW + x) * 4;
          if (data[idx] + data[idx + 1] + data[idx + 2] > 80) {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }
      boxes.push({ minX, minY, maxX, maxY });
    }

    // Compute uniform canvas size: max width & height across all frames + padding
    const pad = 10;
    let uniW = 0, uniH = 0;
    for (const b of boxes) {
      uniW = Math.max(uniW, b.maxX - b.minX + 1);
      uniH = Math.max(uniH, b.maxY - b.minY + 1);
    }
    uniW += pad * 2;
    uniH += pad * 2;
    const uniAspect = uniW / uniH;

    // Pass 2: extract each frame centered in the uniform canvas, remove black bg
    this._processedFrames = [];
    for (let f = 0; f < numFrames; f++) {
      tempCtx.clearRect(0, 0, frameW, frameH);
      tempCtx.drawImage(img, f * frameW, 0, frameW, frameH, 0, 0, frameW, frameH);

      const b = boxes[f];
      const cw = b.maxX - b.minX + 1;
      const ch = b.maxY - b.minY + 1;
      const croppedData = tempCtx.getImageData(b.minX, b.minY, cw, ch);
      const cd = croppedData.data;

      // Remove black background with smooth edges
      for (let i = 0; i < cd.length; i += 4) {
        const brightness = (cd[i] + cd[i + 1] + cd[i + 2]) / 3;
        if (brightness < 25) {
          cd[i + 3] = 0;
        } else if (brightness < 60) {
          cd[i + 3] = Math.floor((brightness - 25) / 35 * cd[i + 3]);
        }
      }

      // Place centered in uniform-size canvas
      const frameCanvas = document.createElement('canvas');
      frameCanvas.width = uniW;
      frameCanvas.height = uniH;
      const fCtx = frameCanvas.getContext('2d');
      const tmpCrop = document.createElement('canvas');
      tmpCrop.width = cw;
      tmpCrop.height = ch;
      tmpCrop.getContext('2d').putImageData(croppedData, 0, 0);
      const offX = Math.floor((uniW - cw) / 2);
      const offY = Math.floor((uniH - ch) / 2);
      fCtx.drawImage(tmpCrop, offX, offY);

      this._processedFrames.push({
        canvas: frameCanvas,
        w: uniW,
        h: uniH,
        aspect: uniAspect
      });
    }
  }

  draw(ctx) {
    // Process sprite on first draw call
    if (!this._processedFrames && this.spriteImg) {
      this._processSprite();
    }

    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    // Vertical offset matches sprite rendering
    let bobY = 0;
    if (this.state === 'idle') bobY = Math.sin(this.idleBob) * 3;
    else if (this.state === 'walk') bobY = Math.sin((this.walkCycle || 0) * 2) * 2.5;

    // Draw outer glow aura (pulsing)
    const glowSize = 60 + Math.sin(this.glowPhase) * 10;
    const gradient = ctx.createRadialGradient(cx, cy + bobY, 4, cx, cy + bobY, glowSize);
    gradient.addColorStop(0, 'rgba(255,255,255,0.28)');
    gradient.addColorStop(0.15, 'rgba(245,234,208,0.18)');
    gradient.addColorStop(0.4, 'rgba(220,215,250,0.07)');
    gradient.addColorStop(1, 'rgba(200,200,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(cx - glowSize, cy + bobY - glowSize, glowSize * 2, glowSize * 2);

    // Draw sprite if available, otherwise fallback to procedural
    if (this._processedFrames) {
      this.drawSprite(ctx);
    } else {
      this.drawProcedural(ctx);
    }
  }

  drawSprite(ctx) {
    const nf = this._processedFrames.length;

    // Frame selection adapts to sprite sheet frame count
    let frameIdx = 0;
    if (nf >= 8) {
      // 8-frame sheet: 0:idle, 1:idle_look, 2:walk_a, 3:walk_b,
      // 4:jump_crouch, 5:jump_apex, 6:fall, 7:landing
      if (this.state === 'idle') {
        frameIdx = (Math.floor(this.idleBob / 12) % 2 === 0) ? 0 : 1;
      } else if (this.state === 'walk') {
        frameIdx = (Math.sin(this.walkCycle) > 0) ? 2 : 3;
      } else if (this.state === 'jump') {
        // Smooth: crouch when launching fast, apex pose when slowing
        const jumpProgress = Math.min(1, Math.max(0, (-this.vy - 50) / 300));
        frameIdx = jumpProgress > 0.5 ? 4 : 5;
      } else if (this.state === 'fall') {
        frameIdx = (this.landSquash > 0) ? 7 : 6;
      }
    } else {
      // 4-frame sheet: 0:idle, 1:walk, 2:jump, 3:fall
      const frameMap = { idle: 0, walk: 1, jump: 2, fall: 3 };
      frameIdx = frameMap[this.state] || 0;
    }

    const frame = this._processedFrames[frameIdx];
    if (!frame) return;

    // Previous state frame for cross-fade
    const prevMap = nf >= 8
      ? { idle: 0, walk: 2, jump: 4, fall: 6 }
      : { idle: 0, walk: 1, jump: 2, fall: 3 };
    const prevFrameIdx = prevMap[this.prevState] || 0;
    const prevFrame = this._processedFrames[prevFrameIdx];

    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;

    // Vertical offset: idle bob + walk bob
    let offsetY = 0;
    if (this.state === 'idle') {
      offsetY = Math.sin(this.idleBob) * 3;
    } else if (this.state === 'walk') {
      // Rhythmic bob synced to walk cycle
      offsetY = Math.sin(this.walkCycle * 2) * 2.5;
    }

    const targetH = this.h * 1.6;
    const targetW = targetH * frame.aspect;

    ctx.save();
    ctx.translate(cx, cy + offsetY);

    // Flip when facing left
    if (this.facing < 0) {
      ctx.scale(-1, 1);
    }

    // Apply body tilt (rotation around bottom-center pivot)
    if (Math.abs(this.tiltAngle) > 0.002) {
      ctx.rotate(this.tiltAngle);
    }

    // Combine smooth stretch with landing squash
    let sx = this.stretchX;
    let sy = this.stretchY;
    const landT = Math.max(0, this.landSquash / 0.15);
    if (landT > 0) {
      sx *= 1 + landT * 0.2;
      sy *= 1 - landT * 0.18;
    }
    ctx.scale(sx, sy);

    // Cross-fade: draw previous frame with fading opacity during transition
    if (this.stateBlend < 1 && prevFrame && prevFrameIdx !== frameIdx) {
      const prevH = targetH;
      const prevW = prevH * prevFrame.aspect;
      ctx.globalAlpha = 1 - this.stateBlend;
      ctx.drawImage(prevFrame.canvas, -prevW / 2, -prevH / 2, prevW, prevH);
      ctx.globalAlpha = this.stateBlend;
    }

    // Draw current state sprite
    ctx.drawImage(frame.canvas, -targetW / 2, -targetH / 2, targetW, targetH);
    ctx.globalAlpha = 1;

    ctx.restore();

    // Paint drip particles
    if (Math.random() < 0.1) {
      const hue1 = (this.glowPhase * 15) % 360;
      const worldX = this.x + this.w / 2;
      const worldY = this.y + this.h / 2 + 28 + offsetY;
      ParticleSystem.emit(worldX, worldY, 1, {
        vx: (Math.random() - 0.5) * 0.4,
        vy: 0.5 + Math.random() * 0.8,
        life: 0.3 + Math.random() * 0.25,
        size: 1 + Math.random() * 1.8,
        color: `hsla(${hue1},55%,90%,`,
        type: 'glow',
        gravity: 0.6,
        friction: 0.97
      });
    }
  }

  drawProcedural(ctx) {
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    const bobY = this.state === 'idle' ? Math.sin(this.idleBob) * 3 : 0;
    const landT2 = Math.max(0, this.landSquash / 0.15);
    const squish = (this.state === 'jump' ? 0.92 : this.state === 'fall' ? 1.08 : 1) + landT2 * 0.18;
    const stretch = (this.state === 'jump' ? 1.1 : this.state === 'fall' ? 0.94 : 1) - landT2 * 0.15;

    ctx.save();
    ctx.translate(cx, cy + bobY);
    ctx.scale(this.facing * squish, stretch);

    // Iridescent color cycling (slow, gentle)
    const hue1 = (this.glowPhase * 15) % 360;
    const hue2 = (hue1 + 80) % 360;

    // === BODY: teardrop/paint-drop shape ===
    const bodyPath = () => {
      ctx.beginPath();
      // Rounder teardrop - wider body, pointed top drip
      ctx.moveTo(0, -20);
      ctx.bezierCurveTo(4, -22, 10, -20, 15, -14);
      ctx.bezierCurveTo(19, -8, 20, 0, 18, 8);
      ctx.bezierCurveTo(16, 16, 10, 22, 0, 24);
      ctx.bezierCurveTo(-10, 22, -16, 16, -18, 8);
      ctx.bezierCurveTo(-20, 0, -19, -8, -15, -14);
      ctx.bezierCurveTo(-10, -20, -4, -22, 0, -20);
      ctx.closePath();
    };

    // Shadow underneath
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath();
    ctx.ellipse(0, 26, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main body fill with iridescent gradient
    const bodyGrad = ctx.createRadialGradient(-3, -5, 2, 0, 2, 24);
    bodyGrad.addColorStop(0, 'rgba(255,255,255,0.97)');
    bodyGrad.addColorStop(0.25, `hsla(${hue1},55%,93%,0.9)`);
    bodyGrad.addColorStop(0.55, `hsla(${hue2},45%,88%,0.7)`);
    bodyGrad.addColorStop(0.85, `hsla(${(hue2+40)%360},40%,82%,0.4)`);
    bodyGrad.addColorStop(1, 'rgba(200,195,230,0.1)');
    ctx.fillStyle = bodyGrad;
    bodyPath();
    ctx.fill();

    // Subtle inner paint strokes (impressionist texture)
    ctx.save();
    ctx.clip();
    ctx.globalAlpha = 0.12;
    for (let s = 0; s < 5; s++) {
      const sx = -10 + s * 5 + Math.sin(this.glowPhase * 0.3 + s) * 2;
      const sy = -15 + s * 7;
      const sw = 8 + s * 2;
      ctx.fillStyle = `hsla(${(hue1 + s * 40) % 360},50%,85%,1)`;
      ctx.beginPath();
      ctx.ellipse(sx, sy, sw, 2.5, 0.3 + s * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Bright inner highlight (top-left specular)
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(-5, -11, 7, 6, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Small secondary highlight
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.ellipse(6, -6, 3, 4, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Thin semi-transparent outline
    ctx.strokeStyle = `hsla(${hue2},30%,80%,0.3)`;
    ctx.lineWidth = 1;
    bodyPath();
    ctx.stroke();

    // === EYES ===
    const eyeY = -3;
    const blinkCycle = Math.sin(this.glowPhase * 0.7);
    const eyeH = blinkCycle > 0.95 ? 0.4 : 3.2;

    // Eye whites
    if (eyeH > 1) {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.ellipse(-6, eyeY, 4, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(6, eyeY, 4, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pupils
    ctx.fillStyle = 'rgba(50,40,70,0.9)';
    ctx.beginPath();
    ctx.ellipse(-5.5, eyeY + 0.3, 2.5, eyeH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5.5, eyeY + 0.3, 2.5, eyeH, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye sparkles
    if (eyeH > 1) {
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.beginPath();
      ctx.arc(-4.5, eyeY - 1.2, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(6.5, eyeY - 1.2, 1.2, 0, Math.PI * 2);
      ctx.fill();
      // Small secondary sparkle
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.arc(-6.5, eyeY + 1, 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(4.5, eyeY + 1, 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Blush spots
    ctx.fillStyle = `hsla(${(hue1+30)%360},60%,85%,0.25)`;
    ctx.beginPath();
    ctx.ellipse(-10, eyeY + 4, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(10, eyeY + 4, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // === EXPRESSION ===
    if (this.state === 'jump') {
      ctx.fillStyle = 'rgba(50,40,70,0.35)';
      ctx.beginPath();
      ctx.ellipse(0, eyeY + 8, 3.5, 2.8, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.state === 'fall') {
      ctx.strokeStyle = 'rgba(50,40,70,0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, eyeY + 10, 3, 1.15 * Math.PI, 1.85 * Math.PI);
      ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(50,40,70,0.4)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, eyeY + 6, 4.5, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    }

    // === ARMS ===
    ctx.strokeStyle = 'rgba(240,235,250,0.6)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    if (this.state === 'walk') {
      const arm = Math.sin(this.animTimer * 18);
      ctx.beginPath();
      ctx.moveTo(-16, 3);
      ctx.quadraticCurveTo(-20 - arm * 4, 10, -17 - arm * 6, 16);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(16, 3);
      ctx.quadraticCurveTo(20 + arm * 4, 10, 17 + arm * 6, 16);
      ctx.stroke();
    } else if (this.state === 'jump') {
      ctx.beginPath();
      ctx.moveTo(-16, 1);
      ctx.quadraticCurveTo(-22, -6, -18, -15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(16, 1);
      ctx.quadraticCurveTo(22, -6, 18, -15);
      ctx.stroke();
    } else if (this.state === 'fall') {
      ctx.beginPath();
      ctx.moveTo(-16, 1);
      ctx.quadraticCurveTo(-24, 3, -26, 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(16, 1);
      ctx.quadraticCurveTo(24, 3, 26, 10);
      ctx.stroke();
    } else {
      const idleArm = Math.sin(this.idleBob * 0.7) * 2;
      ctx.beginPath();
      ctx.moveTo(-16, 3);
      ctx.quadraticCurveTo(-20, 10 + idleArm, -15, 16 + idleArm);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(16, 3);
      ctx.quadraticCurveTo(20, 10 - idleArm, 15, 16 - idleArm);
      ctx.stroke();
    }

    // === LEGS ===
    const legY = 19;
    ctx.strokeStyle = 'rgba(240,235,250,0.55)';
    ctx.lineWidth = 2.8;

    if (this.state === 'walk') {
      const leg = Math.sin(this.animTimer * 18) * 7;
      ctx.beginPath();
      ctx.moveTo(-5, legY);
      ctx.quadraticCurveTo(-5 + leg * 0.4, legY + 5, -5 + leg, legY + 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(5, legY);
      ctx.quadraticCurveTo(5 - leg * 0.4, legY + 5, 5 - leg, legY + 10);
      ctx.stroke();
    } else if (this.state === 'jump') {
      ctx.beginPath();
      ctx.moveTo(-5, legY);
      ctx.quadraticCurveTo(-9, legY + 3, -11, legY + 1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(5, legY);
      ctx.quadraticCurveTo(9, legY + 3, 11, legY + 1);
      ctx.stroke();
    } else if (this.state === 'fall') {
      const d = Math.sin(this.glowPhase * 3) * 2;
      ctx.beginPath();
      ctx.moveTo(-5, legY);
      ctx.lineTo(-6 + d, legY + 11);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(5, legY);
      ctx.lineTo(6 - d, legY + 11);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(-4, legY);
      ctx.lineTo(-4, legY + 9);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(4, legY);
      ctx.lineTo(4, legY + 9);
      ctx.stroke();
    }

    // === PAINT DRIP particles ===
    if (Math.random() < 0.12) {
      const worldX = this.x + this.w / 2;
      const worldY = this.y + this.h / 2 + 28 + bobY;
      ParticleSystem.emit(worldX, worldY, 1, {
        vx: (Math.random() - 0.5) * 0.4,
        vy: 0.5 + Math.random() * 0.8,
        life: 0.3 + Math.random() * 0.25,
        size: 1 + Math.random() * 1.8,
        color: `hsla(${hue1},55%,90%,`,
        type: 'glow',
        gravity: 0.6,
        friction: 0.97
      });
    }

    ctx.restore();
  }
}

// ============================================================
// SECTION 5: COLLECTIBLE ITEMS
// 收集物系统：3种类型
//   'key'      — 金色颜料管（必须收集，解锁终点画框）
//   'pigment'  — 颜料滴（可选纪念品，存入图鉴）
//   'fragment' — 画作碎片（可选纪念品，迷你画框造型）
// 所有收集物都有浮动动画和发光效果
// ============================================================
class Collectible {
  constructor(x, y, type, data) {
    this.x = x;
    this.y = y;
    this.w = 28;
    this.h = 28;
    this.type = type; // 'key', 'pigment', 'fragment'
    this.data = data || {};
    this.collected = false;
    this.phase = Math.random() * Math.PI * 2;
    this.glowPhase = Math.random() * Math.PI * 2;
    this.color = this.data.color || 'rgba(245,234,208,';
  }

  update(dt) {
    this.phase += dt * 2;
    this.glowPhase += dt * 3;
  }

  draw(ctx) {
    if (this.collected) return;

    const bobY = Math.sin(this.phase) * 5;
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2 + bobY;
    const glowAlpha = 0.3 + Math.sin(this.glowPhase) * 0.15;

    // Outer glow
    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 25);
    grad.addColorStop(0, this.color + glowAlpha + ')');
    grad.addColorStop(0.5, this.color + (glowAlpha * 0.3) + ')');
    grad.addColorStop(1, this.color + '0)');
    ctx.fillStyle = grad;
    ctx.fillRect(cx - 25, cy - 25, 50, 50);

    if (this.type === 'key') {
      // Golden paint tube
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.sin(this.phase * 0.7) * 0.15);
      // Tube body
      const tubeGrad = ctx.createLinearGradient(-5, -10, 5, -10);
      tubeGrad.addColorStop(0, '#c8a030');
      tubeGrad.addColorStop(0.4, '#f0d060');
      tubeGrad.addColorStop(1, '#c89020');
      ctx.fillStyle = tubeGrad;
      ctx.beginPath();
      ctx.roundRect(-5, -10, 10, 16, 2);
      ctx.fill();
      // Tube cap
      ctx.fillStyle = '#a08020';
      ctx.beginPath();
      ctx.roundRect(-4, -14, 8, 5, 1);
      ctx.fill();
      // Nozzle
      ctx.fillStyle = '#d0b040';
      ctx.beginPath();
      ctx.roundRect(-2, 6, 4, 4, 1);
      ctx.fill();
      // Paint drip
      ctx.fillStyle = 'rgba(240,200,60,0.8)';
      ctx.beginPath();
      ctx.arc(0, 12, 2.5, 0, Math.PI * 2);
      ctx.fill();
      // Sparkle
      const sp = Math.sin(this.glowPhase * 2) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(255,255,220,${0.5 + sp * 0.5})`;
      ctx.beginPath();
      ctx.arc(-2, -7, 1.5 + sp, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (this.type === 'pigment') {
      // Paint drop shape
      ctx.fillStyle = this.color + '0.9)';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 10);
      ctx.bezierCurveTo(cx + 8, cy - 5, cx + 8, cy + 5, cx, cy + 10);
      ctx.bezierCurveTo(cx - 8, cy + 5, cx - 8, cy - 5, cx, cy - 10);
      ctx.fill();

      // Shine
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.arc(cx - 2, cy - 3, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'fragment') {
      // Painting fragment - small canvas piece
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.sin(this.phase * 0.5) * 0.1);

      ctx.fillStyle = '#f5ead0';
      ctx.shadowColor = this.color + '0.5)';
      ctx.shadowBlur = 15;
      ctx.fillRect(-10, -8, 20, 16);
      ctx.shadowBlur = 0;

      // Mini painting content
      const colors = this.data.colors || ['#8fbc8f', '#dda0dd', '#87ceeb'];
      colors.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.fillRect(-8 + i * 6, -6, 5, 12);
      });

      // Frame
      ctx.strokeStyle = 'rgba(180,160,120,0.8)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-10, -8, 20, 16);

      ctx.restore();
    }
  }

  checkCollision(player) {
    if (this.collected) return false;
    const bobY = Math.sin(this.phase) * 5;
    return player.x + player.w > this.x &&
           player.x < this.x + this.w &&
           player.y + player.h > this.y + bobY &&
           player.y < this.y + this.h + bobY;
  }
}

// ============================================================
// SECTION 6: LEVEL DATA & DEFINITIONS
// 3个关卡定义，每关包含：
//   - i18n 键（名称/副标题/画作信息）
//   - 背景图片和配色方案
//   - 平台数组（部分带 move 属性实现浮动/移动）
//   - 收集物数组（3钥匙 + 5纪念品）
//   - 位置触发提示
// 关卡1: 睡莲 Water Lilies (1906) — 莲叶平台，花园氛围
// 关卡2: 日出·印象 Impression, Sunrise (1872) — 船/桅杆平台，港口晨雾
// 关卡3: 日本桥 The Japanese Bridge (1899) — 石/桥/藤蔓平台，花园秘境
// ============================================================
const LEVELS = [
  // ---- Index 0: Woman in the Green Dress (1866) — Light & Shadow ----
  {
    nameKey: 'l4_name', subtitleKey: 'l4_subtitle',
    paintingTitleKey: 'l4_painting_title', paintingArtistKey: 'l4_artist', paintingDescKey: 'l4_painting_desc',
    background: 'green_dress.jpg',
    paintingImage: 'paintings/painting_l4.jpg',
    bgColor: '#12100a',
    paintRevealMode: 'radial',
    mechanic: 'light', // unique: player lantern + spotlights
    lightZones: [ // fixed spotlights in the level (x, y, radius)
      { x: 80, y: 350, r: 200 },   // start area
      { x: 500, y: 300, r: 180 },  // window light
      { x: 1000, y: 250, r: 160 }, // candle
      { x: 1500, y: 280, r: 200 }, // window
      { x: 2000, y: 320, r: 250 }, // finish area
    ],
    colors: {
      primary: 'rgba(180,150,80,',
      secondary: 'rgba(100,80,50,',
      accent: 'rgba(60,120,60,',
    },
    platforms: [
      { x: 40, y: 480, w: 200, h: 24, type: 'shelf' },
      { x: 250, y: 420, w: 80, h: 60, type: 'easel' },
      { x: 400, y: 380, w: 140, h: 20, type: 'shelf' },
      { x: 550, y: 320, w: 70, h: 55, type: 'easel' },
      { x: 680, y: 370, w: 100, h: 18, type: 'frame' },
      { x: 820, y: 430, w: 160, h: 22, type: 'shelf' },
      { x: 980, y: 350, w: 80, h: 55, type: 'easel' },
      { x: 1100, y: 290, w: 120, h: 18, type: 'frame' },
      { x: 1250, y: 360, w: 140, h: 22, type: 'shelf' },
      { x: 1400, y: 300, w: 70, h: 55, type: 'easel' },
      { x: 1550, y: 400, w: 160, h: 24, type: 'shelf' },
      { x: 1720, y: 340, w: 100, h: 18, type: 'frame' },
      { x: 1880, y: 420, w: 120, h: 22, type: 'shelf' },
      { x: 2050, y: 360, w: 80, h: 55, type: 'easel' },
      { x: 2200, y: 450, w: 160, h: 30, type: 'finish' },
    ],
    collectibles: [
      { x: 260, y: 350, type: 'key' },
      { x: 990, y: 280, type: 'key' },
      { x: 1730, y: 270, type: 'key' },
      { x: 420, y: 310, type: 'pigment', color: 'rgba(50,50,50,', nameKey: 'sv_l4_1' },
      { x: 700, y: 300, type: 'pigment', color: 'rgba(180,160,100,', nameKey: 'sv_l4_2' },
      { x: 1120, y: 220, type: 'fragment', colors: ['#b49650', '#3c783c', '#645032'], nameKey: 'sv_l4_3' },
      { x: 1560, y: 330, type: 'pigment', color: 'rgba(60,120,60,', nameKey: 'sv_l4_4' },
      { x: 1900, y: 350, type: 'fragment', colors: ['#c8a060', '#4a9a4a', '#8b7355'], nameKey: 'sv_l4_5' },
    ],
    levelWidth: 2400,
    hints: [
      { x: 100, textKey: 'l4_hint1' },
      { x: 400, textKey: 'l4_hint2' },
      { x: 1200, textKey: 'l4_hint3' },
      { x: 1800, textKey: 'l4_hint4' },
    ]
  },
  // ---- Index 1: Women in the Garden (1866) — Wind ----
  {
    nameKey: 'l5_name', subtitleKey: 'l5_subtitle',
    paintingTitleKey: 'l5_painting_title', paintingArtistKey: 'l5_artist', paintingDescKey: 'l5_painting_desc',
    background: 'women_garden.jpg',
    paintingImage: 'paintings/painting_l5.jpg',
    bgColor: '#1a2810',
    paintRevealMode: 'global',
    mechanic: 'wind', // unique: periodic wind gusts
    windConfig: {
      interval: 5,     // seconds between gusts
      duration: 1.5,   // gust duration
      force: 120,      // horizontal push force px/s
    },
    colors: {
      primary: 'rgba(100,180,80,',
      secondary: 'rgba(220,200,100,',
      accent: 'rgba(240,180,200,',
    },
    platforms: [
      { x: 40, y: 480, w: 200, h: 24, type: 'hedge' },
      { x: 280, y: 430, w: 120, h: 20, type: 'bench' },
      { x: 450, y: 380, w: 100, h: 16, type: 'branch', move: { type: 'float', range: 5, speed: 0.8 } },
      { x: 600, y: 440, w: 180, h: 26, type: 'hedge' },
      { x: 820, y: 370, w: 120, h: 20, type: 'bench' },
      { x: 980, y: 310, w: 110, h: 16, type: 'branch', move: { type: 'float', range: 8, speed: 1 } },
      { x: 1130, y: 390, w: 160, h: 26, type: 'hedge' },
      { x: 1320, y: 330, w: 100, h: 16, type: 'branch', move: { type: 'float', range: 6, speed: 0.9 } },
      { x: 1480, y: 420, w: 120, h: 20, type: 'bench' },
      { x: 1640, y: 360, w: 180, h: 26, type: 'hedge' },
      { x: 1860, y: 300, w: 100, h: 16, type: 'branch', move: { type: 'float', range: 7, speed: 1.1 } },
      { x: 2020, y: 380, w: 140, h: 22, type: 'hedge' },
      { x: 2200, y: 430, w: 120, h: 20, type: 'bench' },
      { x: 2380, y: 460, w: 160, h: 30, type: 'finish' },
    ],
    collectibles: [
      { x: 300, y: 360, type: 'key' },
      { x: 1000, y: 240, type: 'key' },
      { x: 1870, y: 230, type: 'key' },
      { x: 470, y: 310, type: 'pigment', color: 'rgba(255,255,255,', nameKey: 'sv_l5_1' },
      { x: 840, y: 300, type: 'pigment', color: 'rgba(240,180,200,', nameKey: 'sv_l5_2' },
      { x: 1150, y: 320, type: 'fragment', colors: ['#64b450', '#dcc864', '#f0b4c8'], nameKey: 'sv_l5_3' },
      { x: 1500, y: 350, type: 'pigment', color: 'rgba(200,180,120,', nameKey: 'sv_l5_4' },
      { x: 2040, y: 310, type: 'fragment', colors: ['#80c860', '#f0e080', '#e0c0d0'], nameKey: 'sv_l5_5' },
    ],
    levelWidth: 2600,
    hints: [
      { x: 100, textKey: 'l5_hint1' },
      { x: 600, textKey: 'l5_hint2' },
      { x: 1300, textKey: 'l5_hint3' },
      { x: 1900, textKey: 'l5_hint4' },
    ]
  },
  // ---- Index 2: Woman with a Parasol (1875) — Glide ----
  {
    nameKey: 'l6_name', subtitleKey: 'l6_subtitle',
    paintingTitleKey: 'l6_painting_title', paintingArtistKey: 'l6_artist', paintingDescKey: 'l6_painting_desc',
    background: 'parasol.jpg',
    paintingImage: 'paintings/painting_l6.jpg',
    bgColor: '#1a2838',
    paintRevealMode: 'layer',
    mechanic: 'glide', // unique: hold jump to glide, updraft zones
    updraftZones: [ // {x, y, w, h} areas that push player up
      { x: 300, y: 200, w: 120, h: 300 },
      { x: 700, y: 150, w: 100, h: 350 },
      { x: 1100, y: 100, w: 130, h: 400 },
      { x: 1500, y: 180, w: 110, h: 320 },
    ],
    colors: {
      primary: 'rgba(130,190,230,',
      secondary: 'rgba(200,220,140,',
      accent: 'rgba(255,255,255,',
    },
    platforms: [
      { x: 40, y: 480, w: 180, h: 22, type: 'grass' },
      { x: 240, y: 420, w: 120, h: 20, type: 'grass' },
      { x: 400, y: 350, w: 100, h: 18, type: 'grass' },
      { x: 550, y: 280, w: 80, h: 16, type: 'cloud', move: { type: 'float', range: 10, speed: 0.5 } },
      { x: 700, y: 380, w: 140, h: 22, type: 'grass' },
      { x: 850, y: 300, w: 70, h: 14, type: 'kite', move: { type: 'float', range: 15, speed: 0.7 } },
      { x: 980, y: 220, w: 100, h: 18, type: 'grass' },
      { x: 1120, y: 340, w: 120, h: 20, type: 'grass' },
      { x: 1260, y: 260, w: 80, h: 16, type: 'cloud', move: { type: 'float', range: 12, speed: 0.6 } },
      { x: 1400, y: 180, w: 100, h: 18, type: 'grass' },
      { x: 1550, y: 300, w: 140, h: 22, type: 'grass' },
      { x: 1700, y: 220, w: 70, h: 14, type: 'kite', move: { type: 'float', range: 12, speed: 0.8 } },
      { x: 1820, y: 380, w: 120, h: 20, type: 'grass' },
      { x: 1950, y: 450, w: 160, h: 30, type: 'finish' },
    ],
    collectibles: [
      { x: 260, y: 350, type: 'key' },
      { x: 860, y: 230, type: 'key' },
      { x: 1420, y: 110, type: 'key' },
      { x: 560, y: 210, type: 'pigment', color: 'rgba(255,255,220,', nameKey: 'sv_l6_1' },
      { x: 720, y: 310, type: 'pigment', color: 'rgba(180,140,100,', nameKey: 'sv_l6_2' },
      { x: 1000, y: 150, type: 'fragment', colors: ['#82bee6', '#c8dc8c', '#ffffff'], nameKey: 'sv_l6_3' },
      { x: 1280, y: 190, type: 'pigment', color: 'rgba(220,200,140,', nameKey: 'sv_l6_4' },
      { x: 1560, y: 230, type: 'fragment', colors: ['#a0d0f0', '#e0e8b0', '#f0e0c0'], nameKey: 'sv_l6_5' },
    ],
    levelWidth: 2100,
    hints: [
      { x: 100, textKey: 'l6_hint1' },
      { x: 500, textKey: 'l6_hint2' },
      { x: 1000, textKey: 'l6_hint3' },
      { x: 1600, textKey: 'l6_hint4' },
    ]
  },
  // ---- Index 3: Water Lilies (1906) — Disappearing platforms + Radial paint ----
  {
    nameKey: 'l1_name', subtitleKey: 'l1_subtitle',
    paintingTitleKey: 'l1_painting_title', paintingArtistKey: 'l1_artist', paintingDescKey: 'l1_painting_desc',
    background: 'water_lilies.jpg',
    paintingImage: 'paintings/painting_l1.jpg',
    bgColor: '#1a2a1a',
    paintRevealMode: 'radial',
    colors: {
      primary: 'rgba(140,180,140,',
      secondary: 'rgba(200,170,210,',
      accent: 'rgba(180,200,160,',
    },
    platforms: [
      // Ground sections (lily pad style)
      { x: 0, y: 520, w: 300, h: 40, type: 'lily' },
      { x: 350, y: 500, w: 200, h: 35, type: 'lily', move: {type:'float', range:30, speed:1.2}, disappear: { delay: 2, reform: 3 } },
      { x: 620, y: 470, w: 180, h: 35, type: 'lily' },
      { x: 870, y: 440, w: 160, h: 35, type: 'lily', move: {type:'float', range:25, speed:0.9}, disappear: { delay: 2, reform: 3 } },
      { x: 1100, y: 480, w: 220, h: 35, type: 'lily' },
      { x: 1400, y: 450, w: 180, h: 35, type: 'lily' },
      { x: 1650, y: 420, w: 150, h: 35, type: 'lily' },
      // Upper platforms
      { x: 250, y: 370, w: 120, h: 25, type: 'lily' },
      { x: 500, y: 340, w: 130, h: 25, type: 'lily', move: {type:'float', range:20, speed:1.5}, disappear: { delay: 1.5, reform: 2.5 } },
      { x: 750, y: 310, w: 100, h: 25, type: 'lily' },
      { x: 1000, y: 350, w: 140, h: 25, type: 'lily' },
      { x: 1250, y: 320, w: 120, h: 25, type: 'lily' },
      { x: 1500, y: 350, w: 130, h: 25, type: 'lily' },
      // High platforms
      { x: 400, y: 240, w: 100, h: 20, type: 'lily' },
      { x: 700, y: 220, w: 90, h: 20, type: 'lily' },
      { x: 1150, y: 230, w: 110, h: 20, type: 'lily' },
      // Finish area
      { x: 1850, y: 400, w: 250, h: 40, type: 'finish' },
    ],
    collectibles: [
      // Keys (3) - golden paint tubes required to unlock gate
      { x: 420, y: 290, type: 'key' },
      { x: 770, y: 180, type: 'key' },
      { x: 1170, y: 190, type: 'key' },
      // Souvenirs (5) - optional pigments and fragments
      { x: 350, y: 460, type: 'pigment', color: 'rgba(140,200,140,', nameKey: 'sv_l1_4' },
      { x: 650, y: 430, type: 'pigment', color: 'rgba(200,170,210,', nameKey: 'sv_l1_1' },
      { x: 530, y: 300, type: 'pigment', color: 'rgba(240,200,220,', nameKey: 'sv_l1_2' },
      { x: 1050, y: 310, type: 'fragment', colors: ['#8fbc8f', '#dda0dd', '#87ceeb'], nameKey: 'sv_l1_3' },
      { x: 1530, y: 310, type: 'fragment', colors: ['#98d998', '#c0a0d0', '#90c0e0'], nameKey: 'sv_l1_5' },
    ],
    levelWidth: 2200,
    hints: [
      { x: 100, textKey: 'l1_hint1' },
      { x: 600, textKey: 'l1_hint2' },
      { x: 1400, textKey: 'l1_hint4' },
    ]
  },
  // ---- Index 4: Impression, Sunrise (1872 flashback) — Tidal ----
  {
    nameKey: 'l2_name', subtitleKey: 'l2_subtitle',
    paintingTitleKey: 'l2_painting_title', paintingArtistKey: 'l2_artist', paintingDescKey: 'l2_painting_desc',
    background: 'impression_sunrise.jpg',
    paintingImage: 'paintings/painting_l2.jpg',
    bgColor: '#1a1510',
    paintRevealMode: 'global',
    mechanic: 'tidal',
    tidalConfig: { period: 12, amplitude: 60, baseY: 580 },
    colors: {
      primary: 'rgba(230,160,80,',
      secondary: 'rgba(100,120,150,',
      accent: 'rgba(255,120,60,',
    },
    platforms: [
      // Boat/dock platforms — all well above tidal high-water mark (520)
      { x: 0, y: 460, w: 350, h: 40, type: 'dock' },
      { x: 400, y: 440, w: 180, h: 30, type: 'boat', move: {type:'float', range:10, speed:0.8} },
      { x: 640, y: 420, w: 200, h: 30, type: 'boat' },
      { x: 900, y: 450, w: 170, h: 30, type: 'dock' },
      { x: 1130, y: 410, w: 190, h: 30, type: 'boat', move: {type:'float', range:10, speed:1.0} },
      { x: 1380, y: 430, w: 160, h: 30, type: 'dock' },
      { x: 1600, y: 400, w: 180, h: 30, type: 'boat' },
      // Crane/mast platforms
      { x: 300, y: 400, w: 100, h: 20, type: 'mast' },
      { x: 550, y: 370, w: 110, h: 20, type: 'mast' },
      { x: 800, y: 390, w: 90, h: 20, type: 'mast' },
      { x: 1050, y: 360, w: 120, h: 20, type: 'mast' },
      { x: 1300, y: 380, w: 100, h: 20, type: 'mast' },
      { x: 1520, y: 350, w: 110, h: 20, type: 'mast' },
      // Tidal platforms — these submerge/emerge with the tide
      { x: 200, y: 530, w: 140, h: 20, type: 'dock', tidal: true },
      { x: 500, y: 540, w: 120, h: 20, type: 'dock', tidal: true },
      { x: 1000, y: 535, w: 130, h: 20, type: 'dock', tidal: true },
      // High platforms
      { x: 450, y: 270, w: 80, h: 18, type: 'mast' },
      { x: 750, y: 250, w: 90, h: 18, type: 'mast' },
      { x: 1200, y: 260, w: 100, h: 18, type: 'mast' },
      // Finish
      { x: 1850, y: 380, w: 250, h: 40, type: 'finish' },
    ],
    collectibles: [
      // Keys (3)
      { x: 470, y: 230, type: 'key' },
      { x: 770, y: 210, type: 'key' },
      { x: 1200, y: 220, type: 'key' },
      // Souvenirs (5)
      { x: 330, y: 360, type: 'pigment', color: 'rgba(230,160,80,', nameKey: 'sv_l2_1' },
      { x: 580, y: 330, type: 'pigment', color: 'rgba(255,140,60,', nameKey: 'sv_l2_2' },
      { x: 830, y: 350, type: 'fragment', colors: ['#e6a050', '#6a7896', '#d4500a'], nameKey: 'sv_l2_3' },
      { x: 1330, y: 340, type: 'pigment', color: 'rgba(100,120,160,', nameKey: 'sv_l2_4' },
      { x: 1550, y: 310, type: 'fragment', colors: ['#e09040', '#7888a6', '#f06030'], nameKey: 'sv_l2_5' },
    ],
    levelWidth: 2200,
    hints: [
      { x: 100, textKey: 'l2_hint1' },
      { x: 700, textKey: 'l2_hint2' },
      { x: 1500, textKey: 'l2_hint3' },
    ]
  },
  // ---- Index 5: The Japanese Bridge (1899) — Season Shift ----
  {
    nameKey: 'l3_name', subtitleKey: 'l3_subtitle',
    paintingTitleKey: 'l3_painting_title', paintingArtistKey: 'l3_artist', paintingDescKey: 'l3_painting_desc',
    background: 'japanese_bridge.jpg',
    paintingImage: 'paintings/painting_l3.jpg',
    bgColor: '#0f1a10',
    paintRevealMode: 'global',
    mechanic: 'season',
    colors: {
      primary: 'rgba(100,160,100,',
      secondary: 'rgba(180,140,200,',
      accent: 'rgba(220,180,200,',
    },
    platforms: [
      // Garden path
      { x: 0, y: 530, w: 280, h: 40, type: 'stone' },
      { x: 340, y: 510, w: 200, h: 35, type: 'stone' },
      { x: 600, y: 490, w: 180, h: 35, type: 'stone' },
      // Bridge arch (ascending)
      { x: 840, y: 460, w: 150, h: 30, type: 'bridge' },
      { x: 1020, y: 410, w: 160, h: 30, type: 'bridge' },
      { x: 1210, y: 380, w: 180, h: 30, type: 'bridge' },
      { x: 1420, y: 410, w: 160, h: 30, type: 'bridge' },
      { x: 1610, y: 460, w: 150, h: 30, type: 'bridge' },
      // Vine platforms
      { x: 200, y: 380, w: 110, h: 22, type: 'vine', move: {type:'move', range:60, speed:0.5} },
      { x: 450, y: 350, w: 100, h: 22, type: 'vine' },
      { x: 700, y: 340, w: 120, h: 22, type: 'vine', move: {type:'float', range:22, speed:1.1} },
      { x: 950, y: 300, w: 100, h: 22, type: 'vine' },
      { x: 1250, y: 280, w: 110, h: 22, type: 'vine' },
      { x: 1500, y: 310, w: 100, h: 22, type: 'vine' },
      // High flower platforms
      { x: 350, y: 250, w: 90, h: 18, type: 'vine' },
      { x: 650, y: 230, w: 80, h: 18, type: 'vine' },
      { x: 1100, y: 210, w: 100, h: 18, type: 'vine' },
      // Path after bridge
      { x: 1800, y: 490, w: 250, h: 40, type: 'finish' },
    ],
    collectibles: [
      // Keys (3)
      { x: 370, y: 210, type: 'key' },
      { x: 670, y: 190, type: 'key' },
      { x: 1100, y: 170, type: 'key' },
      // Souvenirs (5)
      { x: 230, y: 340, type: 'pigment', color: 'rgba(100,180,100,', nameKey: 'sv_l3_1' },
      { x: 480, y: 310, type: 'pigment', color: 'rgba(180,140,200,', nameKey: 'sv_l3_2' },
      { x: 730, y: 300, type: 'fragment', colors: ['#64a064', '#b48cc8', '#dc8cac'], nameKey: 'sv_l3_3' },
      { x: 980, y: 260, type: 'pigment', color: 'rgba(220,180,200,', nameKey: 'sv_l3_4' },
      { x: 1530, y: 270, type: 'fragment', colors: ['#70b070', '#a080c0', '#e0a0b0'], nameKey: 'sv_l3_5' },
    ],
    levelWidth: 2150,
    hints: [
      { x: 100, textKey: 'l3_hint1' },
      { x: 800, textKey: 'l3_hint2' },
      { x: 1600, textKey: 'l3_hint3' },
    ]
  }
];

// ============================================================
// SECTION 7: GAME CORE
// 游戏核心对象：状态机 + 主循环 + 渲染管线
// 状态：loading → menu → playing ↔ paused → reveal → menu
// 渲染管线（每帧）：
//   1. 背景色填充
//   2. 3层视差滚动背景图
//   3. 水面倒影
//   4. 环境粒子（萤火虫）
//   5. 平台绘制（含终点画框门控视觉）
//   6. 收集物绘制
//   7. 玩家角色
//   8. 粒子特效
//   9. 屏幕后处理（雾/光柱/暗角/噪点/笔触纹理）
//   10. 关卡名称淡入淡出
//   11. 语音字幕条
// ============================================================
const Game = {
  canvas: null,
  ctx: null,
  menuCanvas: null,
  menuCtx: null,
  player: null,
  currentLevel: -1,
  state: 'loading', // loading, menu, playing, paused, reveal, gallery
  camera: { x: 0, y: 0 },
  bgImages: {},
  spriteImg: null,
  collectibles: [],
  platforms: [],
  collected: 0,
  totalCollectibles: 0,
  unlockedLevels: new Array(LEVELS.length).fill(false),
  time: 0,
  hintTimer: 0,
  currentHint: '',
  levelTransition: false,
  bgParallaxLayers: [],
  envParticles: [],
  lastTime: 0,
  finishGlow: 0,

  async init() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.menuCanvas = document.getElementById('menu-canvas');
    this.menuCtx = this.menuCanvas.getContext('2d');

    this.resize();
    window.addEventListener('resize', () => this.resize());

    Input.init();

    // Restore unlocked levels from localStorage
    const savedUnlocks = JSON.parse(localStorage.getItem('monet_unlocked') || '{"0":true}');
    Object.keys(savedUnlocks).forEach(k => {
      const idx = parseInt(k);
      if (idx >= 0 && idx < this.unlockedLevels.length) this.unlockedLevels[idx] = true;
    });

    // Load assets
    await this.loadAssets();

    // Show menu
    this.state = 'menu';
    document.getElementById('loading-screen').classList.add('fade-out');
    setTimeout(() => {
      document.getElementById('loading-screen').style.display = 'none';
      document.getElementById('main-menu').style.display = 'flex';
    }, 1000);

    // Start game loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  },

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = w;
    this.canvas.height = h;
    this.menuCanvas.width = w;
    this.menuCanvas.height = h;
    this.viewW = w;
    this.viewH = h;
  },

  async loadAssets() {
    // Dynamically build asset list from LEVELS data
    const bgAssets = LEVELS.map(l => {
      const name = l.background.replace('.jpg', '').replace('.png', '');
      return { name, src: l.background };
    });
    // De-duplicate (in case multiple levels share same background)
    const uniqueBg = [];
    const seen = new Set();
    bgAssets.forEach(a => { if (!seen.has(a.name)) { seen.add(a.name); uniqueBg.push(a); } });

    const assets = [...uniqueBg, { name: 'sprite', src: 'sprite_sheet_v3.png' }];
    let loaded = 0;
    const total = assets.length;

    const loadImg = (src) => new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const done = (result) => {
        loaded++;
        const pct = (loaded / total) * 100;
        const bar = document.getElementById('loading-bar');
        const text = document.getElementById('loading-text');
        if (bar) bar.style.width = pct + '%';
        if (text) text.textContent = t('loading_progress').replace('{pct}', Math.round(pct));
        resolve(result);
      };
      img.onload = () => done(img);
      img.onerror = () => done(null);
      setTimeout(() => { if (loaded < total) done(null); }, 15000);
      img.src = src;
    });

    const results = await Promise.all(assets.map(a => loadImg(a.src)));

    // Store background images by name
    uniqueBg.forEach((a, i) => { this.bgImages[a.name] = results[i]; });
    this.spriteImg = results[results.length - 1];
  },

  startLevel(idx) {
    AudioEngine.init();
    this.currentLevel = idx;
    const level = LEVELS[idx];

    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('gallery').style.display = 'none';
    document.getElementById('game-hud').style.display = 'block';

    // Mobile controls
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 800;
    if (isMobile) {
      document.getElementById('mobile-controls').style.display = 'flex';
    }

    // Setup player
    this.player = new Player();
    this.player.spriteImg = this.spriteImg;
    this.player.x = 80;
    this.player.y = 400;

    // Setup platforms
    this.platforms = level.platforms.map(p => {
      const plat = {...p};
      if (p.move) {
        plat.origX = p.x;
        plat.origY = p.y;
        plat.movePhase = Math.random() * Math.PI * 2;
        plat.platformVx = 0;
        plat.platformVy = 0;
      }
      return plat;
    });

    // Setup collectibles
    this.collectibles = level.collectibles.map(c =>
      new Collectible(c.x, c.y, c.type, { color: c.color, colors: c.colors, nameKey: c.nameKey })
    );
    this.collected = 0;
    this.totalCollectibles = this.collectibles.length;
    this.keysCollected = 0;
    this.totalKeys = this.collectibles.filter(c => c.type === 'key').length;
    this.gateUnlocked = false;
    this._gateLockHintShown = false;

    // Progressive painting system
    this.paintProgress = 0; // 0.0 to 1.0
    this.paintRevealMode = level.paintRevealMode || 'global'; // 'global', 'radial', 'layer'
    this.revealPoints = []; // {x, y, radius, targetRadius} for radial mode
    this.paintShimmerTimer = 0;

    // Level-specific mechanics
    this.windTimer = 0;
    this.windActive = false;
    this.windDirection = 1;
    this.windForce = 0;
    this.glideEnergy = 2; // seconds of glide available
    this.glideMaxEnergy = 2;
    this.isGliding = false;

    this.tidalPhase = 0;
    this.tidalWaterY = 600;
    this.tidalGraceTimer = 3.5; // grace period: no tidal death for 3.5s after level start
    this.seasonProgress = 0;

    // Reset voiceover system
    VoiceoverSystem.reset(idx);

    // Update HUD
    this.updateHUD();

    // Camera — initialize to player position for smooth start
    this.camera = { x: Math.max(0, 80 - this.viewW * 0.35), y: Math.max(-100, 400 - this.viewH * 0.5) };

    // Environment particles
    this.envParticles = [];
    this.spawnEnvParticles();

    // Audio
    AudioEngine.playAmbient(idx);

    // Transition
    this.state = 'playing';
    this.time = 0;
    this.hintTimer = 0;
    this.finishGlow = 0;
    this.levelIntroTimer = 3.5; // Show level name for 3.5 seconds

    const overlay = document.getElementById('transition-overlay');
    overlay.classList.add('active');
    setTimeout(() => overlay.classList.remove('active'), 100);

    // Show initial hint
    this.showHint(t(level.hints[0]?.textKey) || '');
  },

  spawnEnvParticles() {
    const level = LEVELS[this.currentLevel];
    const colors = level.colors;
    const lvl = this.currentLevel;

    // Tier 1: Large soft glows (slow drift)
    for (let i = 0; i < 12; i++) {
      this.envParticles.push({
        x: Math.random() * level.levelWidth,
        y: Math.random() * 580,
        size: 4 + Math.random() * 5,
        speed: 0.1 + Math.random() * 0.2,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.06 + Math.random() * 0.12,
        color: [colors.primary, colors.secondary][Math.floor(Math.random() * 2)],
        tier: 'large',
        driftX: lvl === 1 ? -0.3 : 0 // L2: fog wisps drift left
      });
    }

    // Tier 2: Medium (standard fireflies / wisps)
    for (let i = 0; i < 30; i++) {
      this.envParticles.push({
        x: Math.random() * level.levelWidth,
        y: Math.random() * 580,
        size: 1.5 + Math.random() * 2.5,
        speed: 0.2 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.1 + Math.random() * 0.25,
        color: [colors.primary, colors.secondary, colors.accent][Math.floor(Math.random() * 3)],
        tier: 'medium',
        driftX: lvl === 1 ? -0.15 : 0
      });
    }

    // Tier 3: Small fast sparkles
    for (let i = 0; i < 20; i++) {
      this.envParticles.push({
        x: Math.random() * level.levelWidth,
        y: Math.random() * 580,
        size: 0.8 + Math.random() * 1.2,
        speed: 0.5 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.15 + Math.random() * 0.3,
        color: colors.accent,
        tier: 'small',
        twinkle: Math.random() * Math.PI * 2,
        driftX: lvl === 2 ? 0.1 : 0
      });
    }
  },

  updateHUD() {
    const level = LEVELS[this.currentLevel];
    document.getElementById('hud-level-name').textContent = t(level.nameKey);

    // Key indicators (golden) + souvenir dots
    let html = '<div class="hud-keys">';
    for (let i = 0; i < this.totalKeys; i++) {
      html += `<div class="key-dot ${i < this.keysCollected ? 'collected' : ''}">🎨</div>`;
    }
    html += `</div><span class="hud-sep">|</span>`;
    const souvenirCount = this.collected - this.keysCollected;
    const totalSouvenirs = this.totalCollectibles - this.totalKeys;
    html += `<span class="hud-souvenir-count">\u2727 ${souvenirCount}/${totalSouvenirs}</span>`;
    // Paint progress bar (easel icon + progress)
    const pct = Math.round((this.paintProgress || 0) * 100);
    html += `<span class="hud-sep">|</span><span class="hud-paint-progress">🎨 <span class="paint-bar"><span class="paint-fill" style="width:${pct}%"></span></span></span>`;
    document.getElementById('hud-collectibles').innerHTML = html;
  },

  showHint(text) {
    this.currentHint = text;
    this.hintTimer = 4;
    const el = document.getElementById('hint-overlay');
    el.textContent = text;
    el.classList.add('show');
    AudioEngine.playHint();
    setTimeout(() => el.classList.remove('show'), 3500);
  },

  showPaintingReveal() {
    this.state = 'reveal';
    this._galleryMode = false;
    const level = LEVELS[this.currentLevel];
    const paintingSrc = level.paintingImage || level.background.replace('.jpg','').replace('.png','') + '.jpg';

    // Set painting image directly — no background layer needed
    const paintImg = document.getElementById('reveal-img');
    paintImg.src = paintingSrc;
    paintImg.style.opacity = '';

    document.getElementById('reveal-title').textContent = t(level.paintingTitleKey);
    document.getElementById('reveal-artist').textContent = t(level.paintingArtistKey);
    document.getElementById('reveal-desc').textContent = t(level.paintingDescKey);

    const el = document.getElementById('painting-reveal');
    el.style.display = 'flex';
    // Detect painting orientation and apply layout
    const probeImg = new Image();
    probeImg.onload = () => {
      const ratio = probeImg.width / probeImg.height;
      el.classList.remove('layout-landscape', 'layout-portrait');
      el.classList.add(ratio > 1.15 ? 'layout-landscape' : 'layout-portrait');
    };
    probeImg.src = paintingSrc;
    // Restore default button text
    const btn = el.querySelector('.continue-btn');
    btn.textContent = t('btn_continue');
    btn.onclick = null;
    // Trigger entrance animation
    setTimeout(() => el.classList.add('show'), 50);

    this.unlockedLevels[this.currentLevel] = true;
    const saved = JSON.parse(localStorage.getItem('monet_unlocked') || '{"0":true}');
    saved[String(this.currentLevel)] = true;
    if (this.currentLevel + 1 < LEVELS.length) saved[String(this.currentLevel + 1)] = true;
    localStorage.setItem('monet_unlocked', JSON.stringify(saved));
    AudioEngine.playLevelComplete();
  },

  closePaintingReveal() {
    // If triggered from gallery mode, delegate to gallery close handler
    if (this._galleryMode) {
      this._closeGalleryReveal();
      return;
    }
    if (this._revealTimer) { clearTimeout(this._revealTimer); this._revealTimer = null; }
    const el = document.getElementById('painting-reveal');
    el.classList.remove('show');
    setTimeout(() => {
      el.style.display = 'none';
      el.classList.remove('layout-landscape', 'layout-portrait');
      // Clean up painting image
      document.getElementById('reveal-img').src = '';
      // Next level or menu
      if (this.currentLevel < LEVELS.length - 1) {
        this.startLevel(this.currentLevel + 1);
      } else {
        this.returnToMenu();
      }
    }, 800);
  },

  returnToMenu() {
    this.state = 'menu';
    document.getElementById('game-hud').style.display = 'none';
    document.getElementById('mobile-controls').style.display = 'none';
    document.getElementById('pause-overlay').className = '';
    document.getElementById('pause-overlay').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
    ParticleSystem.clear();
  },

  triggerDeath() {
    if (this.state === 'dying') return;
    this.state = 'dying';
    this.deathTimer = 0;
    AudioEngine.playDeath();
    // Dissolve particles from player position
    ParticleSystem.emit(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, 20, (i) => ({
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5 - 2,
      life: 0.6 + Math.random() * 0.4,
      size: 2 + Math.random() * 4,
      color: 'rgba(245,234,208,',
      type: 'glow',
      gravity: 0.8,
      friction: 0.95
    }));
  },

  updateDeath(dt) {
    this.deathTimer += dt;
    ParticleSystem.update(dt);
    if (this.deathTimer > 1.2) {
      // Respawn at last safe position
      const safe = this.player.lastSafePos;
      this.player.x = safe.x;
      this.player.y = safe.y;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.onGround = false;
      this.state = 'respawning';
      this.deathTimer = 0;
      // Reset disappearing platform states so player doesn't respawn onto gone platforms
      for (const p of this.platforms) {
        if (p.disappear) {
          p._disappearState = 'solid';
          p._disappearTimer = 0;
          p._disappearAlpha = 1;
          p._noCollision = false;
        }
      }
      // Reset glide energy on respawn
      this.glideEnergy = this.glideMaxEnergy;
      this.isGliding = false;
      // Extend tidal grace period on respawn to prevent death loops
      this.tidalGraceTimer = 3.5;
      // Respawn glow particles
      ParticleSystem.emit(safe.x + this.player.w / 2, safe.y + this.player.h / 2, 12, (i) => ({
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        life: 0.5 + Math.random() * 0.3,
        size: 3 + Math.random() * 3,
        color: 'rgba(200,220,255,',
        type: 'glow',
        gravity: -0.3,
        friction: 0.96
      }));
    }
  },

  updateRespawn(dt) {
    this.deathTimer += dt;
    ParticleSystem.update(dt);
    if (this.deathTimer > 0.6) {
      this.state = 'playing';
      this.lastTime = performance.now();
    }
  },

  renderDeath(dt) {
    const ctx = this.ctx;
    const w = this.viewW;
    const h = this.viewH;
    // Render frozen game frame
    this.render(0);
    // Darken overlay
    const alpha = Math.min(this.deathTimer / 0.8, 0.7);
    ctx.fillStyle = `rgba(10,10,18,${alpha})`;
    ctx.fillRect(0, 0, w, h);
  },

  renderRespawn(dt) {
    const ctx = this.ctx;
    const w = this.viewW;
    const h = this.viewH;
    // Render game scene at respawn point
    this.render(0);
    // Brighten-in overlay fading out
    const alpha = Math.max(0, 0.7 - this.deathTimer / 0.6 * 0.7);
    ctx.fillStyle = `rgba(10,10,18,${alpha})`;
    ctx.fillRect(0, 0, w, h);
  },

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      const el = document.getElementById('pause-overlay');
      el.style.display = 'flex';
      requestAnimationFrame(() => el.classList.add('show'));
    } else if (this.state === 'paused') {
      this.resumeGame();
    }
  },

  resumeGame() {
    const el = document.getElementById('pause-overlay');
    el.classList.remove('show');
    setTimeout(() => { el.style.display = 'none'; }, 400);
    this.state = 'playing';
    this.lastTime = performance.now();
  },

  toggleBackpack() {
    const el = document.getElementById('backpack-overlay');
    if (el.classList.contains('show')) {
      el.classList.remove('show');
      setTimeout(() => { el.style.display = 'none'; }, 300);
      return;
    }
    if (this.state !== 'playing' && this.state !== 'paused') return;
    // Populate backpack
    const grid = document.getElementById('backpack-grid');
    grid.innerHTML = '';
    // Keys
    this.collectibles.filter(c => c.type === 'key').forEach((c, i) => {
      const div = document.createElement('div');
      div.className = 'backpack-item key-item' + (c.collected ? ' collected' : '');
      div.innerHTML = `<span class="bp-icon">${c.collected ? '🎨' : '?'}</span><span class="bp-name">${t('key_label')} ${i + 1}</span>`;
      if (!c.collected) div.style.opacity = '0.35';
      grid.appendChild(div);
    });
    // Souvenirs
    this.collectibles.filter(c => c.type !== 'key').forEach(c => {
      const div = document.createElement('div');
      const icon = c.type === 'fragment' ? '🖼' : '💧';
      div.className = 'backpack-item' + (c.collected ? ' collected' : '');
      div.innerHTML = c.collected
        ? `<span class="bp-icon">${icon}</span><span class="bp-name">${t(c.data.nameKey || 'unknown')}</span>`
        : `<span class="bp-icon">?</span><span class="bp-name">???</span>`;
      if (!c.collected) div.style.opacity = '0.3';
      grid.appendChild(div);
    });
    document.getElementById('backpack-title').textContent = t('backpack_title');
    el.style.display = 'flex';
    requestAnimationFrame(() => el.classList.add('show'));
  },

  showLevelSelect() {
    document.getElementById('main-menu').style.display = 'none';
    const el = document.getElementById('level-select');
    el.style.display = 'flex';
    document.getElementById('levelsel-header').textContent = t('levelsel_header');

    const grid = document.getElementById('levelsel-grid');
    grid.innerHTML = '';
    const saved = JSON.parse(localStorage.getItem('monet_unlocked') || '{"0":true}');

    LEVELS.forEach((level, i) => {
      const unlocked = i === 0 || saved[String(i)] || this.unlockedLevels[i - 1];
      const div = document.createElement('div');
      div.className = 'levelsel-card' + (unlocked ? '' : ' locked');
      div.innerHTML = `
        <img src="${level.background}" alt="${t(level.nameKey)}">
        <div class="lsc-info">
          <div class="lsc-name">${t(level.nameKey)}</div>
          <div class="lsc-sub">${t(level.subtitleKey)}</div>
          ${unlocked ? '' : `<div class="lsc-lock">${t('levelsel_locked')}</div>`}
        </div>
      `;
      if (unlocked) {
        div.addEventListener('click', () => {
          el.style.display = 'none';
          AudioEngine.init();
          AudioEngine.playMenuClick();
          this.startLevel(i);
        });
      }
      grid.appendChild(div);
    });
  },

  closeLevelSelect() {
    document.getElementById('level-select').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
  },

  showAlbum() {
    document.getElementById('main-menu').style.display = 'none';
    const el = document.getElementById('album');
    el.style.display = 'flex';
    document.getElementById('album-header').textContent = t('album_header');

    const body = document.getElementById('album-body');
    body.innerHTML = '';
    const saved = JSON.parse(localStorage.getItem('monet_souvenirs') || '{}');
    this._activeDrawer = null;

    const souvenirGroups = [
      { levelKey: 'l4_name', items: [
        {nameKey:'sv_l4_1',icon:'✏️'},{nameKey:'sv_l4_2',icon:'🧴'},{nameKey:'sv_l4_3',icon:'🔪'},
        {nameKey:'sv_l4_4',icon:'🟢'},{nameKey:'sv_l4_5',icon:'💌'},
      ]},
      { levelKey: 'l5_name', items: [
        {nameKey:'sv_l5_1',icon:'☂️'},{nameKey:'sv_l5_2',icon:'👑'},{nameKey:'sv_l5_3',icon:'🎀'},
        {nameKey:'sv_l5_4',icon:'👒'},{nameKey:'sv_l5_5',icon:'🧤'},
      ]},
      { levelKey: 'l6_name', items: [
        {nameKey:'sv_l6_1',icon:'🌾'},{nameKey:'sv_l6_2',icon:'⛵'},{nameKey:'sv_l6_3',icon:'🧺'},
        {nameKey:'sv_l6_4',icon:'👒'},{nameKey:'sv_l6_5',icon:'💌'},
      ]},
      { levelKey: 'l1_name', items: [
        {nameKey:'sv_l1_1',icon:'💜'},{nameKey:'sv_l1_2',icon:'🌸'},{nameKey:'sv_l1_3',icon:'🖼'},
        {nameKey:'sv_l1_4',icon:'💚'},{nameKey:'sv_l1_5',icon:'🪞'},
      ]},
      { levelKey: 'l2_name', items: [
        {nameKey:'sv_l2_1',icon:'🌅'},{nameKey:'sv_l2_2',icon:'🔥'},{nameKey:'sv_l2_3',icon:'🖼'},
        {nameKey:'sv_l2_4',icon:'🌊'},{nameKey:'sv_l2_5',icon:'🌇'},
      ]},
      { levelKey: 'l3_name', items: [
        {nameKey:'sv_l3_1',icon:'🍃'},{nameKey:'sv_l3_2',icon:'💐'},{nameKey:'sv_l3_3',icon:'🖼'},
        {nameKey:'sv_l3_4',icon:'🌷'},{nameKey:'sv_l3_5',icon:'🌿'},
      ]},
    ];

    souvenirGroups.forEach(group => {
      const section = document.createElement('div');
      section.className = 'album-level-section';

      const header = document.createElement('div');
      header.className = 'album-level-header';
      header.textContent = t(group.levelKey);
      section.appendChild(header);

      const row = document.createElement('div');
      row.className = 'album-items-row';

      // Create a drawer element for this group
      const drawer = document.createElement('div');
      drawer.className = 'sv-detail-drawer';
      drawer.innerHTML = `<div class="sv-detail-inner">
        <div class="sv-img-wrap"><img class="sv-drawer-img" src="" alt=""></div>
        <div class="sv-text">
          <h3 class="sv-drawer-name"></h3>
          <div class="sv-level-tag sv-drawer-level"></div>
          <p class="sv-drawer-desc"></p>
        </div>
        <button class="sv-close-btn">&times;</button>
      </div>`;

      drawer.querySelector('.sv-close-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this._closeDrawer(drawer, section);
      });

      group.items.forEach(s => {
        const unlocked = saved[s.nameKey];
        const div = document.createElement('div');
        div.className = 'album-item' + (unlocked ? '' : ' locked');
        div._nameKey = s.nameKey;
        div.innerHTML = `<div class="icon">${s.icon}</div><div class="name">${unlocked ? t(s.nameKey) : '???'}</div>`;
        if (unlocked) {
          div.addEventListener('click', () => {
            this._openDrawer(drawer, section, div, s.nameKey, group.levelKey);
          });
        }
        row.appendChild(div);
      });

      section.appendChild(row);
      section.appendChild(drawer);
      body.appendChild(section);
    });

    if (Object.keys(saved).length === 0) {
      body.innerHTML = `<div style="color:rgba(245,234,208,0.3);padding:40px;text-align:center;letter-spacing:0.2em">${t('album_empty')}</div>`;
    }
  },

  _openDrawer(drawer, section, itemEl, nameKey, levelKey) {
    // Close any other open drawer first
    if (this._activeDrawer && this._activeDrawer !== drawer) {
      this._activeDrawer.classList.remove('open');
      const prevSection = this._activeDrawer.closest('.album-level-section');
      if (prevSection) prevSection.querySelectorAll('.album-item.selected').forEach(el => el.classList.remove('selected'));
    }

    // Toggle if clicking same item
    if (this._activeDrawer === drawer && drawer.classList.contains('open') && itemEl.classList.contains('selected')) {
      this._closeDrawer(drawer, section);
      return;
    }

    // Fill drawer content
    const img = drawer.querySelector('.sv-drawer-img');
    img.src = 'souvenirs/' + nameKey + '.jpg';
    img.style.display = 'block';
    img.parentElement.style.background = 'rgba(245,234,208,0.02)';
    img.onerror = function() { this.style.display = 'none'; this.parentElement.style.background = 'linear-gradient(135deg, rgba(245,234,208,0.06), rgba(245,234,208,0.02))'; };
    img.onload = function() { this.style.display = 'block'; this.parentElement.style.background = 'none'; };
    drawer.querySelector('.sv-drawer-name').textContent = t(nameKey);
    drawer.querySelector('.sv-drawer-level').textContent = t(levelKey);
    drawer.querySelector('.sv-drawer-desc').textContent = t(nameKey + '_desc') || '';

    // Highlight selected item
    section.querySelectorAll('.album-item.selected').forEach(el => el.classList.remove('selected'));
    itemEl.classList.add('selected');

    // Open drawer
    drawer.classList.add('open');
    this._activeDrawer = drawer;

    // Scroll drawer into view
    setTimeout(() => {
      drawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  },

  _closeDrawer(drawer, section) {
    drawer.classList.remove('open');
    if (section) section.querySelectorAll('.album-item.selected').forEach(el => el.classList.remove('selected'));
    if (this._activeDrawer === drawer) this._activeDrawer = null;
  },

  closeSouvenirDetail() {
    // Close any active drawer
    if (this._activeDrawer) {
      this._activeDrawer.classList.remove('open');
      this._activeDrawer = null;
    }
    document.querySelectorAll('.album-item.selected').forEach(el => el.classList.remove('selected'));
  },

  closeAlbum() {
    this.closeSouvenirDetail();
    document.getElementById('album').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
  },

  showGallery() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('gallery').style.display = 'flex';

    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';
    const saved = JSON.parse(localStorage.getItem('monet_unlocked') || '{"0":true}');

    LEVELS.forEach((level, i) => {
      const unlocked = this.unlockedLevels[i] || saved[String(i)];
      const div = document.createElement('div');
      div.className = 'gallery-item' + (unlocked ? '' : ' locked');
      div.innerHTML = `
        <img src="${level.background}" alt="${t(level.nameKey)}">
        <div class="label">${t(level.nameKey)} · ${t(level.paintingArtistKey)}${unlocked ? '' : ' · ' + t('gallery_locked')}</div>
      `;
      if (unlocked) {
        div.onclick = () => {
          this._showGalleryDetail(level);
        };
      }
      grid.appendChild(div);
    });
  },

  closeGallery() {
    document.getElementById('gallery').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
  },

  _showGalleryDetail(level) {
    this._galleryMode = true;
    const bgKey = level.background.replace('.jpg', '').replace('.png', '');
    const paintingSrc = level.paintingImage || bgKey + '.jpg';
    // Show painting directly using the new painting-centric approach
    const paintImg = document.getElementById('reveal-img');
    paintImg.src = paintingSrc;
    paintImg.style.opacity = '';
    document.getElementById('reveal-title').textContent = t(level.paintingTitleKey);
    document.getElementById('reveal-artist').textContent = t(level.paintingArtistKey);
    document.getElementById('reveal-desc').textContent = t(level.paintingDescKey);
    const el = document.getElementById('painting-reveal');
    el.style.display = 'flex';
    // Detect painting orientation and apply layout
    const probeImg = new Image();
    probeImg.onload = () => {
      const ratio = probeImg.width / probeImg.height;
      el.classList.remove('layout-landscape', 'layout-portrait');
      el.classList.add(ratio > 1.1 ? 'layout-landscape' : 'layout-portrait');
    };
    probeImg.src = paintingSrc;
    const btn = el.querySelector('.continue-btn');
    btn.textContent = t('gallery_return');
    btn.onclick = (e) => {
      e.stopPropagation();
      this._closeGalleryReveal();
    };
    setTimeout(() => el.classList.add('show'), 50);
  },

  _closeGalleryReveal() {
    const el = document.getElementById('painting-reveal');
    el.classList.remove('show');
    setTimeout(() => {
      el.style.display = 'none';
      el.classList.remove('layout-landscape', 'layout-portrait');
      document.getElementById('reveal-img').src = '';
      this._galleryMode = false;
      // Restore default continue button behavior
      const btn = el.querySelector('.continue-btn');
      btn.textContent = t('btn_continue');
      btn.onclick = null;
    }, 400);
  },

  // === GAME LOOP ===
  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;
    this.time += dt;

    if (this.state === 'menu') {
      this.renderMenu(dt);
    } else if (this.state === 'playing') {
      this.update(dt);
      this.render(dt);
    } else if (this.state === 'paused') {
      this.render(0); // Frozen frame
    } else if (this.state === 'dying') {
      this.updateDeath(dt);
      this.renderDeath(dt);
    } else if (this.state === 'respawning') {
      this.updateRespawn(dt);
      this.renderRespawn(dt);
    }

    requestAnimationFrame((t) => this.loop(t));
  },

  renderMenu(dt) {
    const ctx = this.menuCtx;
    const w = this.menuCanvas.width;
    const h = this.menuCanvas.height;

    // Dark gradient background
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0a0a12');
    grad.addColorStop(0.5, '#12121e');
    grad.addColorStop(1, '#0a0a12');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Smooth crossfade between paintings (6s display + 2s blend)
    const bgKeys = LEVELS.map(l => l.background.replace('.jpg', '').replace('.png', ''));
    const numBgs = bgKeys.length;
    const cycleDur = 8;
    const fadeDur = 2;
    const cyclePos = this.time % cycleDur;
    const activeBg = Math.floor(this.time / cycleDur) % numBgs;
    const nextBg = (activeBg + 1) % numBgs;
    const fadeProgress = cyclePos > (cycleDur - fadeDur) ? (cyclePos - (cycleDur - fadeDur)) / fadeDur : 0;

    const drawBg = (key, alpha) => {
      const bgImg = this.bgImages[key];
      if (!bgImg || alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = 0.15 * alpha;
      const bgR = bgImg.width / bgImg.height;
      let bw = w * 1.2;
      let bh = bw / bgR;
      if (bh < h) { bh = h * 1.1; bw = bh * bgR; }
      const bx = (w - bw) / 2 + Math.sin(this.time * 0.1) * 20;
      const by = (h - bh) / 2 + Math.cos(this.time * 0.08) * 15;
      ctx.drawImage(bgImg, bx, by, bw, bh);
      ctx.restore();
    };

    drawBg(bgKeys[activeBg], 1 - fadeProgress);
    if (fadeProgress > 0) drawBg(bgKeys[nextBg], fadeProgress);

    // Overlay to keep menu readable
    ctx.fillStyle = 'rgba(10,10,18,0.6)';
    ctx.fillRect(0, 0, w, h);

    // Floating paint particles
    for (let i = 0; i < 40; i++) {
      const x = (Math.sin(this.time * 0.3 + i * 1.7) * 0.5 + 0.5) * w;
      const y = (Math.cos(this.time * 0.2 + i * 2.3) * 0.5 + 0.5) * h;
      const alpha = 0.06 + Math.sin(this.time + i) * 0.04;
      const size = 2 + Math.sin(this.time * 0.5 + i) * 1.5;

      const colors = ['rgba(140,180,140,', 'rgba(230,160,80,', 'rgba(180,140,200,', 'rgba(245,234,208,'];
      const color = colors[i % colors.length];

      const g = ctx.createRadialGradient(x, y, 0, x, y, size * 8);
      g.addColorStop(0, color + alpha + ')');
      g.addColorStop(1, color + '0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - size * 8, y - size * 8, size * 16, size * 16);
    }
  },

  update(dt) {
    const level = LEVELS[this.currentLevel];

    // Update jump edge detection (press vs hold)
    Input.updateJumpEdge();

    // Animate moving platforms
    for (const p of this.platforms) {
      if (!p.move) continue;
      p.movePhase += dt * p.move.speed;
      const prevX = p.x;
      const prevY = p.y;
      if (p.move.type === 'float') {
        // Vertical oscillation (lily pads, boats bobbing)
        p.y = p.origY + Math.sin(p.movePhase) * p.move.range;
      } else if (p.move.type === 'move') {
        // Horizontal patrol
        p.x = p.origX + Math.sin(p.movePhase) * p.move.range;
      }
      p.platformVx = (p.x - prevX) / dt;
      p.platformVy = (p.y - prevY) / dt;
    }

    // Disappearing platforms
    for (const p of this.platforms) {
      if (p.disappear) {
        if (!p._disappearState) p._disappearState = 'solid'; // solid, fading, gone, reforming
        if (!p._disappearTimer) p._disappearTimer = 0;

        // Check if player is standing on this platform
        const playerOn = this.player.onGround &&
          this.player.x + this.player.w > p.x && this.player.x < p.x + p.w &&
          Math.abs((this.player.y + this.player.h) - p.y) < 5;

        if (p._disappearState === 'solid' && playerOn) {
          p._disappearState = 'fading';
          p._disappearTimer = p.disappear.delay;
        }
        if (p._disappearState === 'fading') {
          p._disappearTimer -= dt;
          p._disappearAlpha = Math.max(0, p._disappearTimer / p.disappear.delay);
          if (p._disappearTimer <= 0) {
            p._disappearState = 'gone';
            p._disappearTimer = p.disappear.reform;
            p._noCollision = true;
          }
        }
        if (p._disappearState === 'gone') {
          p._disappearAlpha = 0;
          p._disappearTimer -= dt;
          if (p._disappearTimer <= 0) {
            p._disappearState = 'reforming';
            p._disappearTimer = 0.5;
          }
        }
        if (p._disappearState === 'reforming') {
          p._disappearTimer -= dt;
          p._disappearAlpha = 1 - (p._disappearTimer / 0.5);
          if (p._disappearTimer <= 0) {
            p._disappearState = 'solid';
            p._disappearAlpha = 1;
            p._noCollision = false;
          }
        }
      }
    }

    // Update player
    this.player.update(dt, this.platforms.filter(p => !p._noCollision && !p.submerged));

    // Camera follow
    const targetCamX = this.player.x - this.viewW * 0.35;
    const targetCamY = this.player.y - this.viewH * 0.5;
    this.camera.x += (targetCamX - this.camera.x) * 4 * dt;
    this.camera.y += (targetCamY - this.camera.y) * 3 * dt;
    this.camera.x = Math.max(0, Math.min(this.camera.x, level.levelWidth - this.viewW));
    this.camera.y = Math.max(-100, Math.min(this.camera.y, 200));

    // === Level mechanic updates ===
    const mechanic = level.mechanic;

    // Wind mechanic
    if (mechanic === 'wind') {
      const wc = level.windConfig;
      this.windTimer += dt;
      const cycleLen = wc.interval + wc.duration;
      const cyclePos = this.windTimer % cycleLen;
      if (cyclePos > wc.interval) {
        // Wind is blowing
        if (!this.windActive) {
          this.windActive = true;
          this.windDirection = Math.random() > 0.5 ? 1 : -1;
        }
        const gustProgress = (cyclePos - wc.interval) / wc.duration;
        const gustStrength = Math.sin(gustProgress * Math.PI); // ramp up then down
        this.windForce = this.windDirection * wc.force * gustStrength;
        this.player.x += this.windForce * dt;
      } else {
        this.windActive = false;
        this.windForce = 0;
      }
    }

    // Glide mechanic
    if (mechanic === 'glide') {
      // Recharge on ground
      if (this.player.onGround) {
        this.glideEnergy = Math.min(this.glideMaxEnergy, this.glideEnergy + dt * 1.5);
        this.isGliding = false;
      }
      // Glide while holding jump in air
      if (!this.player.onGround && Input.keys['jump'] && this.glideEnergy > 0 && this.player.vy > 0) {
        this.isGliding = true;
        this.glideEnergy -= dt;
        this.player.vy = Math.min(this.player.vy, 60); // cap fall speed
        this.player.vy *= Math.pow(0.85, dt * 60); // frame-rate independent damping
      } else if (this.player.onGround) {
        this.isGliding = false;
      }
      // Updraft zones
      if (level.updraftZones) {
        for (const uz of level.updraftZones) {
          const px = this.player.x + this.player.w / 2;
          const py = this.player.y + this.player.h / 2;
          if (px > uz.x && px < uz.x + uz.w && py > uz.y && py < uz.y + uz.h) {
            this.player.vy = Math.max(this.player.vy - 800 * dt, -350);
          }
        }
      }
    }

    // Tidal mechanic
    if (mechanic === 'tidal') {
      const tc = level.tidalConfig;
      this.tidalPhase = (this.tidalPhase || 0) + dt;
      this.tidalWaterY = tc.baseY - tc.amplitude * (0.5 + 0.5 * Math.sin(this.tidalPhase * Math.PI * 2 / tc.period));
      // Submerge tidal platforms below water level
      for (const p of this.platforms) {
        if (p.tidal) {
          p.submerged = (p.y + p.h * 0.5) > this.tidalWaterY;
        }
      }
      // Kill player if submerged (with grace period after spawn/respawn)
      if (this.tidalGraceTimer > 0) {
        this.tidalGraceTimer -= dt;
      } else if (this.player.y + this.player.h > this.tidalWaterY + 15) {
        this.triggerDeath();
        this.tidalGraceTimer = 2; // grace period after respawn too
      }
    }

    // Season shift mechanic
    if (mechanic === 'season') {
      const px = this.player.x;
      const lw = level.levelWidth;
      this.seasonProgress = Math.min(1, px / (lw * 0.9));
      // 0-0.3: Spring, 0.3-0.7: Summer, 0.7-1.0: Autumn
    }

    // Collectibles
    this.collectibles.forEach(c => {
      c.update(dt);
      if (c.checkCollision(this.player)) {
        c.collected = true;
        this.collected++;
        if (c.type === 'key') {
          this.keysCollected++;
          if (this.keysCollected >= this.totalKeys) {
            this.gateUnlocked = true;
            this.showHint(t('gate_unlocked_hint'));
            VoiceoverSystem.fireEvent('gate_unlock', this.currentLevel);
          }
        } else {
          // Save souvenir to localStorage
          if (c.data.nameKey) {
            const saved = JSON.parse(localStorage.getItem('monet_souvenirs') || '{}');
            saved[c.data.nameKey] = true;
            localStorage.setItem('monet_souvenirs', JSON.stringify(saved));
          }
        }
        this.updateHUD();
        AudioEngine.playCollect();
        if (c.type === 'fragment') AudioEngine.playPaintingFragment();

        // Update paint progress
        this.paintProgress = this.collected / this.totalCollectibles;
        if (this.paintRevealMode === 'radial') {
          this.revealPoints.push({
            x: c.x + c.w / 2, y: c.y + c.h / 2,
            radius: 0, targetRadius: 400,
          });
        }

        // Paint splash particles (in level palette colors)
        const level = LEVELS[this.currentLevel];
        const splashColors = [level.colors.primary, level.colors.secondary, level.colors.accent];

        // Collect + paint splash particles
        ParticleSystem.emit(c.x + c.w / 2, c.y + c.h / 2, 18, (i) => ({
          vx: (Math.random() - 0.5) * (i < 10 ? 6 : 10),
          vy: (Math.random() - 0.5) * (i < 10 ? 6 : 10),
          life: 0.5 + Math.random() * (i < 10 ? 0.5 : 0.8),
          size: i < 10 ? 2 + Math.random() * 4 : 4 + Math.random() * 6,
          color: i >= 10 ? splashColors[i % 3] : (c.color || 'rgba(245,234,208,'),
          type: i % 3 === 0 ? 'glow' : 'circle',
          gravity: i < 10 ? -0.5 : -0.3,
          friction: 0.95
        }));
      }
    });

    // Check finish
    const finish = this.platforms.find(p => p.type === 'finish');
    if (finish) {
      this.finishGlow += dt;
      if (this.player.x + this.player.w > finish.x + 20 && this.player.x < finish.x + finish.w - 20 && this.player.onGround) {
        if (this.player.y + this.player.h >= finish.y && this.player.y + this.player.h <= finish.y + 10) {
          if (this.gateUnlocked) {
            this.showPaintingReveal();
          } else if (!this._gateLockHintShown) {
            this.showHint(t('gate_locked_hint'));
            this._gateLockHintShown = true;
          }
        }
      }
    }

    // Hints
    if (level.hints) {
      level.hints.forEach(h => {
        const hText = t(h.textKey);
        if (Math.abs(this.player.x - h.x) < 50 && this.currentHint !== hText) {
          this.showHint(hText);
        }
      });
    }

    // Voiceover system
    VoiceoverSystem.update(dt, this.player.x, this.currentLevel);

    // Environment particles
    this.envParticles.forEach(p => {
      p.phase += dt * p.speed;
      p.y -= p.speed * 20 * dt;
      p.x += Math.sin(p.phase * 1.5) * p.speed * 25 * dt;
      if (p.driftX) p.x += p.driftX * 60 * dt;
      if (p.twinkle !== undefined) p.twinkle += dt * 4;
      if (p.y < -20) { p.y = 600; p.x = Math.random() * (LEVELS[this.currentLevel]?.levelWidth || 2000); }
    });

    ParticleSystem.update(dt);
  },

  render(dt) {
    const ctx = this.ctx;
    const w = this.viewW;
    const h = this.viewH;
    const level = LEVELS[this.currentLevel];
    const cam = this.camera;

    // Clear with level background color
    ctx.fillStyle = level.bgColor;
    ctx.fillRect(0, 0, w, h);

    // Draw background image with multi-layer parallax + progressive painting
    const bgKey = level.background.replace('.jpg', '').replace('.png', '');
    const bgImg = this.bgImages[bgKey];

    if (bgImg) {
      const bgRatio = bgImg.width / bgImg.height;
      const screenRatio = w / h;
      let drawW, drawH;

      // Cover the screen fully
      if (bgRatio > screenRatio) {
        drawH = h * 1.2;
        drawW = drawH * bgRatio;
      } else {
        drawW = w * 1.3;
        drawH = drawW / bgRatio;
      }

      const pp = this.paintProgress; // 0.0 to 1.0
      const mode = this.paintRevealMode;

      // --- Progressive painting: draw sketch base first, then overlay color ---
      // Sketch pass (desaturated, dimmed) — visible when progress < 1
      if (pp < 1) {
        const sketchAlpha = Math.max(0, 1 - pp * 1.2); // fade sketch as progress increases
        ctx.save();
        ctx.filter = `grayscale(1) contrast(1.2) brightness(0.65)`;

        // Layer 1: Deep (sketch)
        ctx.globalAlpha = 0.55 * sketchAlpha;
        const p1x = -cam.x * 0.15 - (drawW - w) * 0.3;
        const p1y = -cam.y * 0.1 - (drawH - h) * 0.3;
        ctx.drawImage(bgImg, p1x, p1y, drawW * 1.2, drawH * 1.1);

        // Layer 2: Main (sketch)
        ctx.globalAlpha = 0.75 * sketchAlpha;
        const p2x = -cam.x * 0.4 - (drawW - w) * 0.2;
        const p2y = -cam.y * 0.25 - (drawH - h) * 0.2;
        ctx.drawImage(bgImg, p2x, p2y, drawW, drawH);

        ctx.restore();

        // Sepia tint over sketch
        ctx.save();
        ctx.globalAlpha = 0.08 * sketchAlpha;
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      // Color pass — painting reveals based on mode
      if (pp > 0) {
        if (mode === 'global') {
          // Mode A: Global fade — saturation + brightness ramp up
          ctx.save();
          const sat = 0.2 + pp * 0.8; // 0.2 to 1.0
          const bright = 0.7 + pp * 0.3; // 0.7 to 1.0
          ctx.filter = `saturate(${sat}) brightness(${bright})`;

          // Layer 1
          ctx.globalAlpha = 0.55 * pp;
          const p1x = -cam.x * 0.15 - (drawW - w) * 0.3;
          const p1y = -cam.y * 0.1 - (drawH - h) * 0.3;
          ctx.drawImage(bgImg, p1x, p1y, drawW * 1.2, drawH * 1.1);

          ctx.globalAlpha = 0.12 * pp;
          ctx.fillStyle = level.bgColor;
          ctx.fillRect(0, 0, w, h);

          // Layer 2
          ctx.globalAlpha = 0.75 * pp;
          const p2x = -cam.x * 0.4 - (drawW - w) * 0.2;
          const p2y = -cam.y * 0.25 - (drawH - h) * 0.2;
          ctx.drawImage(bgImg, p2x, p2y, drawW, drawH);

          // Layer 3
          ctx.globalAlpha = 0.3 * pp;
          const p3x = -cam.x * 0.7 - (drawW - w) * 0.1;
          const p3y = h * 0.35 - cam.y * 0.5;
          ctx.drawImage(bgImg, 0, bgImg.height * 0.5, bgImg.width, bgImg.height * 0.5,
            p3x, p3y, drawW * 1.1, drawH * 0.6);

          ctx.restore();

        } else if (mode === 'radial') {
          // Mode B: Radial spread — color blooms from collection points
          // Animate reveal point radii
          this.revealPoints.forEach(rp => {
            if (rp.radius < rp.targetRadius) {
              rp.radius = Math.min(rp.targetRadius, rp.radius + rp.targetRadius * dt * 1.2);
            }
          });

          // Create clipping mask from reveal circles (in screen space)
          ctx.save();
          ctx.beginPath();
          this.revealPoints.forEach(rp => {
            // Convert world coords to screen coords
            const sx = rp.x - cam.x;
            const sy = rp.y - cam.y;
            ctx.moveTo(sx + rp.radius, sy);
            ctx.arc(sx, sy, rp.radius, 0, Math.PI * 2);
          });
          // Also add a base circle around the player (50px always visible)
          const psx = this.player.x + this.player.w / 2 - cam.x;
          const psy = this.player.y + this.player.h / 2 - cam.y;
          ctx.moveTo(psx + 80, psy);
          ctx.arc(psx, psy, 80, 0, Math.PI * 2);
          ctx.clip();

          // Draw full-color image within the clipped region
          const p1x = -cam.x * 0.15 - (drawW - w) * 0.3;
          const p1y = -cam.y * 0.1 - (drawH - h) * 0.3;
          ctx.globalAlpha = 0.55;
          ctx.drawImage(bgImg, p1x, p1y, drawW * 1.2, drawH * 1.1);
          ctx.globalAlpha = 0.12;
          ctx.fillStyle = level.bgColor;
          ctx.fillRect(0, 0, w, h);
          ctx.globalAlpha = 0.75;
          const p2x = -cam.x * 0.4 - (drawW - w) * 0.2;
          const p2y = -cam.y * 0.25 - (drawH - h) * 0.2;
          ctx.drawImage(bgImg, p2x, p2y, drawW, drawH);
          ctx.globalAlpha = 0.3;
          const p3x = -cam.x * 0.7 - (drawW - w) * 0.1;
          const p3y = h * 0.35 - cam.y * 0.5;
          ctx.drawImage(bgImg, 0, bgImg.height * 0.5, bgImg.width, bgImg.height * 0.5,
            p3x, p3y, drawW * 1.1, drawH * 0.6);

          ctx.restore();

        } else if (mode === 'layer') {
          // Mode C: Layer reveal — horizontal bands reveal bottom-to-top
          const bands = 4;
          const bandH = h / bands;
          const collectsPerBand = Math.ceil(this.totalCollectibles / bands);
          const revealedBands = Math.min(bands, Math.floor(this.collected / collectsPerBand) + (this.collected % collectsPerBand > 0 ? 1 : 0));

          ctx.save();
          for (let b = 0; b < revealedBands; b++) {
            const bandIdx = bands - 1 - b; // bottom-to-top
            const bandY = bandIdx * bandH;
            // Partial reveal for current band
            const bandsCollected = Math.min(collectsPerBand, this.collected - b * collectsPerBand);
            const bandAlpha = Math.min(1, bandsCollected / collectsPerBand);

            ctx.save();
            ctx.beginPath();
            ctx.rect(0, bandY, w, bandH);
            ctx.clip();
            ctx.globalAlpha = bandAlpha;

            const p1x = -cam.x * 0.15 - (drawW - w) * 0.3;
            const p1y = -cam.y * 0.1 - (drawH - h) * 0.3;
            ctx.globalAlpha = 0.55 * bandAlpha;
            ctx.drawImage(bgImg, p1x, p1y, drawW * 1.2, drawH * 1.1);
            ctx.globalAlpha = 0.75 * bandAlpha;
            const p2x = -cam.x * 0.4 - (drawW - w) * 0.2;
            const p2y = -cam.y * 0.25 - (drawH - h) * 0.2;
            ctx.drawImage(bgImg, p2x, p2y, drawW, drawH);

            ctx.restore();
          }
          ctx.restore();
        }
      }

      // Subtle border glow when painting fully complete
      if (pp >= 1) {
        this.paintShimmerTimer = (this.paintShimmerTimer || 0) + dt;
        if (this.paintShimmerTimer < 3) {
          const t = this.paintShimmerTimer;
          const pulse = Math.sin(t * Math.PI * 1.5) * 0.5 + 0.5;
          const fade = t < 0.5 ? t * 2 : t > 2.5 ? (3 - t) * 2 : 1;
          const alpha = pulse * fade * 0.35;
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          // Top edge glow
          const gT = ctx.createLinearGradient(0, 0, 0, 60);
          gT.addColorStop(0, `rgba(245,220,140,${alpha})`);
          gT.addColorStop(1, 'rgba(245,220,140,0)');
          ctx.fillStyle = gT;
          ctx.fillRect(0, 0, w, 60);
          // Bottom edge glow
          const gB = ctx.createLinearGradient(0, h, 0, h - 60);
          gB.addColorStop(0, `rgba(245,220,140,${alpha})`);
          gB.addColorStop(1, 'rgba(245,220,140,0)');
          ctx.fillStyle = gB;
          ctx.fillRect(0, h - 60, w, 60);
          // Left edge glow
          const gL = ctx.createLinearGradient(0, 0, 60, 0);
          gL.addColorStop(0, `rgba(245,220,140,${alpha})`);
          gL.addColorStop(1, 'rgba(245,220,140,0)');
          ctx.fillStyle = gL;
          ctx.fillRect(0, 0, 60, h);
          // Right edge glow
          const gR = ctx.createLinearGradient(w, 0, w - 60, 0);
          gR.addColorStop(0, `rgba(245,220,140,${alpha})`);
          gR.addColorStop(1, 'rgba(245,220,140,0)');
          ctx.fillStyle = gR;
          ctx.fillRect(w - 60, 0, 60, h);
          ctx.restore();
        }
      }
    }

    // Atmospheric gradient overlays
    // Top fog
    const topFog = ctx.createLinearGradient(0, 0, 0, h * 0.35);
    topFog.addColorStop(0, level.bgColor + 'aa');
    topFog.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = topFog;
    ctx.fillRect(0, 0, w, h * 0.35);

    // Bottom depth
    const bottomFog = ctx.createLinearGradient(0, h * 0.7, 0, h);
    bottomFog.addColorStop(0, 'rgba(0,0,0,0)');
    bottomFog.addColorStop(1, level.bgColor + 'cc');
    ctx.fillStyle = bottomFog;
    ctx.fillRect(0, h * 0.7, w, h * 0.3);

    // Light rays effect (subtle god-rays from top)
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.globalCompositeOperation = 'screen';
    for (let r = 0; r < 5; r++) {
      const rx = w * (0.2 + r * 0.15) + Math.sin(this.time * 0.3 + r * 2) * 30;
      const rayGrad = ctx.createLinearGradient(rx, 0, rx + 40, h * 0.8);
      rayGrad.addColorStop(0, 'rgba(255,240,200,1)');
      rayGrad.addColorStop(0.5, 'rgba(255,240,200,0.3)');
      rayGrad.addColorStop(1, 'rgba(255,240,200,0)');
      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(rx - 5, 0);
      ctx.lineTo(rx + 25 + r * 5, 0);
      ctx.lineTo(rx + 60 + r * 10, h * 0.8);
      ctx.lineTo(rx + 20, h * 0.8);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(-cam.x, -cam.y);

    // Wind visual (gusting particles)
    if (level.mechanic === 'wind' && this.windActive) {
      ctx.save();
      ctx.globalAlpha = 0.15;
      const wDir = this.windDirection;
      for (let i = 0; i < 20; i++) {
        const wx = cam.x + Math.random() * w;
        const wy = cam.y + Math.random() * h * 0.8;
        const wLen = 15 + Math.random() * 25;
        ctx.strokeStyle = 'rgba(245,234,208,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx + wLen * wDir, wy - 2 + Math.random() * 4);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Updraft visual
    if (level.mechanic === 'glide' && level.updraftZones) {
      ctx.save();
      ctx.globalAlpha = 0.08;
      for (const uz of level.updraftZones) {
        for (let i = 0; i < 5; i++) {
          const ux = uz.x + Math.random() * uz.w;
          const uy = uz.y + uz.h - ((this.time * 60 + i * 50) % uz.h);
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.beginPath();
          ctx.arc(ux, uy, 3 + Math.random() * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // Glide visual on player
    if (level.mechanic === 'glide' && this.isGliding) {
      const px = this.player.x + this.player.w / 2;
      const py = this.player.y - 10;
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = 'rgba(245,234,208,0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px - 25, py + 5);
      ctx.quadraticCurveTo(px, py - 8, px + 25, py + 5);
      ctx.stroke();
      // Parasol handle
      ctx.beginPath();
      ctx.moveTo(px, py - 5);
      ctx.lineTo(px, py + 15);
      ctx.stroke();
      ctx.restore();
    }

    // Tidal water rendering
    if (level.mechanic === 'tidal') {
      const wy = this.tidalWaterY;
      const wh = 200;
      ctx.save();
      // Animated water surface
      const waterGrad = ctx.createLinearGradient(cam.x, wy - 5, cam.x, wy + wh);
      waterGrad.addColorStop(0, 'rgba(60,90,140,0.0)');
      waterGrad.addColorStop(0.05, 'rgba(40,70,120,0.35)');
      waterGrad.addColorStop(0.3, 'rgba(20,40,80,0.55)');
      waterGrad.addColorStop(1, 'rgba(10,15,30,0.8)');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(cam.x, wy, w, wh);
      // Wave surface lines
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = 'rgba(180,200,230,0.4)';
      ctx.lineWidth = 1.5;
      for (let wv = 0; wv < 3; wv++) {
        ctx.beginPath();
        for (let wx = cam.x - 10; wx < cam.x + w + 10; wx += 4) {
          const sy = wy + wv * 6 + Math.sin(wx * 0.025 + this.time * (2 + wv * 0.4) + wv) * 3;
          if (wx === cam.x - 10) ctx.moveTo(wx, sy);
          else ctx.lineTo(wx, sy);
        }
        ctx.stroke();
      }
      // Foam particles
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = 'rgba(220,230,245,0.5)';
      for (let i = 0; i < 12; i++) {
        const fx = cam.x + ((this.time * 30 + i * 137) % w);
        const fy = wy + Math.sin(this.time * 1.5 + i * 2) * 4;
        ctx.beginPath();
        ctx.arc(fx, fy, 1.5 + Math.random(), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Season shift visual overlay
    if (level.mechanic === 'season') {
      const sp = this.seasonProgress;
      ctx.save();
      // Spring (0-0.3): pink tint, cherry blossom particles
      if (sp < 0.35) {
        const intensity = sp < 0.3 ? 1 : (0.35 - sp) / 0.05;
        ctx.globalAlpha = 0.06 * intensity;
        ctx.fillStyle = '#ffb7c5';
        ctx.fillRect(0, 0, w, h);
        // Blossom petals
        ctx.globalAlpha = 0.12 * intensity;
        for (let i = 0; i < 8; i++) {
          const bx = cam.x + ((this.time * 20 + i * 173) % (w + 100)) - 50;
          const by = cam.y + ((this.time * 35 + i * 97) % (h * 0.8));
          ctx.fillStyle = `rgba(255,${180 + i * 5},${190 + i * 3},0.4)`;
          ctx.beginPath();
          ctx.ellipse(bx, by, 4, 2.5, this.time + i, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // Summer (0.3-0.7): warm green tint, firefly particles
      if (sp >= 0.25 && sp < 0.75) {
        const intensity = sp < 0.3 ? (sp - 0.25) / 0.05 : sp > 0.7 ? (0.75 - sp) / 0.05 : 1;
        ctx.globalAlpha = 0.04 * intensity;
        ctx.fillStyle = '#2d5016';
        ctx.fillRect(0, 0, w, h);
        // Fireflies
        ctx.globalAlpha = 0.2 * intensity;
        for (let i = 0; i < 6; i++) {
          const fx = cam.x + (Math.sin(this.time * 0.4 + i * 2.5) * 0.5 + 0.5) * w;
          const fy = cam.y + (Math.cos(this.time * 0.3 + i * 1.7) * 0.5 + 0.5) * h * 0.7;
          const fa = 0.5 + Math.sin(this.time * 3 + i * 4) * 0.5;
          const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, 8);
          fg.addColorStop(0, `rgba(240,230,100,${fa * 0.6})`);
          fg.addColorStop(1, `rgba(240,230,100,0)`);
          ctx.fillStyle = fg;
          ctx.fillRect(fx - 8, fy - 8, 16, 16);
        }
      }
      // Autumn (0.7-1.0): orange/gold tint, falling leaves
      if (sp >= 0.65) {
        const intensity = sp < 0.7 ? (sp - 0.65) / 0.05 : 1;
        ctx.globalAlpha = 0.06 * intensity;
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(0, 0, w, h);
        // Falling leaves
        ctx.globalAlpha = 0.15 * intensity;
        const leafColors = ['#c84c09', '#d4760a', '#a83c09', '#e09040', '#cc6600'];
        for (let i = 0; i < 10; i++) {
          const lx = cam.x + ((this.time * 15 + i * 193) % (w + 80)) - 40;
          const ly = cam.y + ((this.time * 40 + i * 127) % (h * 0.9));
          ctx.fillStyle = leafColors[i % leafColors.length];
          ctx.save();
          ctx.translate(lx, ly);
          ctx.rotate(this.time * 0.8 + i * 1.3);
          ctx.beginPath();
          ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.restore();
    }

    // Death zone water/void at bottom (below platforms)
    this.drawDeathZoneWater(ctx, w, h, cam, level);

    // Water reflections below platforms (subtle shimmer)
    ctx.save();
    ctx.globalAlpha = 0.08;
    this.platforms.forEach(p => {
      if (p.type === 'finish') return;
      const reflY = p.y + p.h;
      const reflH = 40 + Math.sin(this.time * 2 + p.x * 0.01) * 10;
      const rGrad = ctx.createLinearGradient(p.x, reflY, p.x, reflY + reflH);
      rGrad.addColorStop(0, level.colors.primary + '0.3)');
      rGrad.addColorStop(1, level.colors.primary + '0)');
      ctx.fillStyle = rGrad;
      ctx.fillRect(p.x - 5, reflY, p.w + 10, reflH);
    });
    ctx.restore();

    // Environment particles (behind everything)
    this.envParticles.forEach(p => {
      let a = p.alpha;
      // Twinkle for small sparkles
      if (p.twinkle !== undefined) {
        a *= 0.5 + Math.sin(p.twinkle) * 0.5;
      }
      const r = p.size * (p.tier === 'large' ? 6 : p.tier === 'small' ? 3 : 5);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, p.color + a + ')');
      g.addColorStop(0.6, p.color + (a * 0.3) + ')');
      g.addColorStop(1, p.color + '0)');
      ctx.fillStyle = g;
      ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
    });

    // Draw platforms
    this.platforms.forEach(p => {
      this.drawPlatform(ctx, p, level);
    });

    // Draw collectibles
    this.collectibles.forEach(c => c.draw(ctx));

    // Draw player
    this.player.draw(ctx);

    // Draw particles on top of player for glow effect
    ParticleSystem.draw(ctx);

    ctx.restore();

    // Light & shadow darkness overlay (for 'light' mechanic)
    if (level.mechanic === 'light') {
      const plx = this.player.x + this.player.w / 2 - cam.x;
      const ply = this.player.y + this.player.h / 2 - cam.y;

      // --- Darkness overlay ---
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(5,3,0,0.55)';
      ctx.fillRect(0, 0, w, h);

      // --- Cut out light zones using destination-out ---
      ctx.globalCompositeOperation = 'destination-out';

      // Player lantern (wide radius, bright core)
      const lanternR = 260;
      const lg = ctx.createRadialGradient(plx, ply, 0, plx, ply, lanternR);
      lg.addColorStop(0, 'rgba(0,0,0,1)');
      lg.addColorStop(0.3, 'rgba(0,0,0,0.95)');
      lg.addColorStop(0.6, 'rgba(0,0,0,0.5)');
      lg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lg;
      ctx.fillRect(plx - lanternR, ply - lanternR, lanternR * 2, lanternR * 2);

      // Fixed light zones from level data
      if (level.lightZones) {
        for (const lz of level.lightZones) {
          const lzx = lz.x - cam.x;
          const lzy = lz.y - cam.y;
          const lzr = lz.radius || lz.r || 200;
          const lzg = ctx.createRadialGradient(lzx, lzy, 0, lzx, lzy, lzr);
          lzg.addColorStop(0, 'rgba(0,0,0,1)');
          lzg.addColorStop(0.4, 'rgba(0,0,0,0.6)');
          lzg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = lzg;
          ctx.fillRect(lzx - lzr, lzy - lzr, lzr * 2, lzr * 2);
        }
      }
      ctx.restore();

      // --- Redraw player ON TOP of darkness so character is always visible ---
      ctx.save();
      ctx.translate(-cam.x, -cam.y);
      this.player.draw(ctx);
      ctx.restore();

      // --- Character glow aura (warm pulsing light around player) ---
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const glowPulse = 0.3 + 0.12 * Math.sin(this.time * 2.5);
      ctx.globalAlpha = glowPulse;
      const auraR = 90;
      const aura = ctx.createRadialGradient(plx, ply, 0, plx, ply, auraR);
      aura.addColorStop(0, 'rgba(255,220,130,0.9)');
      aura.addColorStop(0.25, 'rgba(255,200,100,0.5)');
      aura.addColorStop(0.6, 'rgba(255,170,60,0.15)');
      aura.addColorStop(1, 'rgba(255,140,40,0)');
      ctx.fillStyle = aura;
      ctx.fillRect(plx - auraR, ply - auraR, auraR * 2, auraR * 2);
      ctx.restore();

      // --- Warm ambient glow (additive) ---
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.25;
      const wgR = 180;
      const wg = ctx.createRadialGradient(plx, ply, 0, plx, ply, wgR);
      wg.addColorStop(0, 'rgba(255,210,120,0.5)');
      wg.addColorStop(0.35, 'rgba(255,180,80,0.25)');
      wg.addColorStop(1, 'rgba(255,150,50,0)');
      ctx.fillStyle = wg;
      ctx.fillRect(plx - wgR, ply - wgR, wgR * 2, wgR * 2);
      ctx.restore();
    }

    // Screen-space effects
    this.drawScreenEffects(ctx, w, h);

    // Voiceover subtitle bar (on top of everything)
    VoiceoverSystem.draw(ctx, w, h);
  },

  drawDeathZoneWater(ctx, w, h, cam, level) {
    const waterY = 600; // world-space Y where water begins
    const waterH = 200;
    const t = this.time;

    // Dark water gradient
    const waterGrad = ctx.createLinearGradient(cam.x, waterY, cam.x, waterY + waterH);
    waterGrad.addColorStop(0, 'rgba(0,0,0,0)');
    waterGrad.addColorStop(0.15, level.colors.primary + '0.08)');
    waterGrad.addColorStop(0.4, 'rgba(10,15,25,0.5)');
    waterGrad.addColorStop(1, 'rgba(5,5,12,0.9)');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(cam.x, waterY, w, waterH);

    // Animated wave ripples
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = level.colors.primary + '0.5)';
    ctx.lineWidth = 1;
    for (let wv = 0; wv < 3; wv++) {
      ctx.beginPath();
      const wy = waterY + 8 + wv * 15;
      for (let wx = cam.x - 20; wx < cam.x + w + 20; wx += 5) {
        const y = wy + Math.sin(wx * 0.02 + t * (1.5 + wv * 0.3) + wv * 2) * (3 + wv);
        if (wx === cam.x - 20) ctx.moveTo(wx, y);
        else ctx.lineTo(wx, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  },

  drawPlatform(ctx, p, level) {
    const colors = level.colors;
    const t = this.time;

    // Handle disappearing platform alpha
    if (p._disappearAlpha !== undefined && p._disappearAlpha < 1) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p._disappearAlpha);
    }
    // Handle submerged tidal platform alpha
    if (p.submerged) {
      ctx.save();
      ctx.globalAlpha = 0.25;
    }

    if (p.type === 'finish') {
      const glowAlpha = 0.3 + Math.sin(this.finishGlow * 2) * 0.15;
      const cx = p.x + p.w / 2;
      const cy = p.y;

      // Painting frame on an easel appearance
      // Pillar of golden light
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 3; i++) {
        const pillarGrad = ctx.createLinearGradient(cx, cy - 250, cx, cy + 10);
        pillarGrad.addColorStop(0, 'rgba(245,234,208,0)');
        pillarGrad.addColorStop(0.3, `rgba(245,234,208,${glowAlpha * 0.05 * (3-i)})`);
        pillarGrad.addColorStop(0.8, `rgba(245,220,160,${glowAlpha * 0.12 * (3-i)})`);
        pillarGrad.addColorStop(1, `rgba(245,220,160,${glowAlpha * 0.2 * (3-i)})`);
        ctx.fillStyle = pillarGrad;
        const w = 40 + i * 25;
        ctx.fillRect(cx - w, cy - 250, w * 2, 260);
      }
      ctx.restore();

      // Floating sparkles around finish
      ctx.save();
      for (let s = 0; s < 8; s++) {
        const sx = cx + Math.sin(t * 1.5 + s * 0.8) * (40 + s * 8);
        const sy = cy - 20 - Math.abs(Math.sin(t * 0.8 + s * 1.2)) * 80;
        const sa = 0.3 + Math.sin(t * 3 + s) * 0.2;
        ctx.fillStyle = `rgba(255,240,200,${sa})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5 + Math.sin(t * 2 + s) * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Golden platform with ornate top
      const grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
      grad.addColorStop(0, `rgba(245,220,160,${0.6 + glowAlpha})`);
      grad.addColorStop(0.5, `rgba(220,190,120,${0.5 + glowAlpha})`);
      grad.addColorStop(1, `rgba(180,150,80,${0.3 + glowAlpha})`);
      ctx.fillStyle = grad;

      const r = 6;
      ctx.beginPath();
      ctx.moveTo(p.x + r, p.y);
      ctx.lineTo(p.x + p.w - r, p.y);
      ctx.quadraticCurveTo(p.x + p.w, p.y, p.x + p.w, p.y + r);
      ctx.lineTo(p.x + p.w, p.y + p.h);
      ctx.lineTo(p.x, p.y + p.h);
      ctx.lineTo(p.x, p.y + r);
      ctx.quadraticCurveTo(p.x, p.y, p.x + r, p.y);
      ctx.fill();

      // Ornate top border
      ctx.strokeStyle = `rgba(245,234,208,${0.6 + glowAlpha * 0.4})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x + 4, p.y + 1);
      ctx.lineTo(p.x + p.w - 4, p.y + 1);
      ctx.stroke();

      // Frame icon
      ctx.strokeStyle = `rgba(245,234,208,${0.5 + glowAlpha * 0.5})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 15, p.y - 32, 30, 24);
      // Inner frame
      ctx.strokeStyle = `rgba(245,234,208,${0.3 + glowAlpha * 0.3})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 12, p.y - 29, 24, 18);

      // Gate lock/unlock indicator
      if (!Game.gateUnlocked) {
        // Lock icon
        ctx.fillStyle = `rgba(180,140,80,${0.6 + glowAlpha * 0.3})`;
        ctx.fillRect(cx - 6, p.y - 22, 12, 10);
        ctx.strokeStyle = `rgba(180,140,80,${0.7})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, p.y - 24, 5, Math.PI, 0);
        ctx.stroke();
      } else {
        // Bright glow when unlocked
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const uglow = ctx.createRadialGradient(cx, p.y - 20, 2, cx, p.y - 20, 30);
        uglow.addColorStop(0, `rgba(255,240,180,${0.4 + glowAlpha})`);
        uglow.addColorStop(1, 'rgba(255,240,180,0)');
        ctx.fillStyle = uglow;
        ctx.fillRect(cx - 30, p.y - 50, 60, 60);
        ctx.restore();
      }

      return;
    }

    // === Regular Platforms ===
    // Each type has a unique visual identity

    ctx.save();

    // Platform body shape
    const r = Math.min(p.h * 0.4, 10);

    // Different visual treatments per type
    if (p.type === 'lily') {
      // Lily pad - organic oval with leaf detail
      const lcx = p.x + p.w / 2;
      const lcy = p.y + p.h / 2;
      const wobble = Math.sin(t * 1.5 + p.x * 0.01) * 2;

      // Shadow below
      ctx.fillStyle = 'rgba(0,30,20,0.15)';
      ctx.beginPath();
      ctx.ellipse(lcx, lcy + p.h * 0.6 + 3, p.w * 0.48, p.h * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lily pad body
      const lilyGrad = ctx.createRadialGradient(lcx - p.w * 0.1, lcy - 3, 2, lcx, lcy, p.w * 0.5);
      lilyGrad.addColorStop(0, 'rgba(140,195,120,0.92)');
      lilyGrad.addColorStop(0.5, 'rgba(100,165,90,0.85)');
      lilyGrad.addColorStop(1, 'rgba(70,135,70,0.7)');
      ctx.fillStyle = lilyGrad;

      ctx.beginPath();
      ctx.ellipse(lcx, lcy + wobble, p.w * 0.5, p.h * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();

      // Leaf vein
      ctx.strokeStyle = 'rgba(90,140,80,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lcx, lcy + wobble - p.h * 0.3);
      ctx.lineTo(lcx, lcy + wobble + p.h * 0.3);
      ctx.stroke();

      // Top highlight
      ctx.strokeStyle = 'rgba(180,220,160,0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(lcx, lcy + wobble - 2, p.w * 0.35, p.h * 0.25, 0, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();

    } else if (p.type === 'boat') {
      // Boat - curved hull shape with rocking motion
      const rock = Math.sin(t * 1.2 + p.x * 0.02) * 1.5;

      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.rotate(Math.sin(t * 0.8 + p.x * 0.01) * 0.02);
      ctx.translate(-(p.x + p.w / 2), -(p.y + p.h / 2));

      const boatGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
      boatGrad.addColorStop(0, 'rgba(120,100,80,0.8)');
      boatGrad.addColorStop(1, 'rgba(80,65,50,0.5)');
      ctx.fillStyle = boatGrad;

      ctx.beginPath();
      ctx.moveTo(p.x + 8, p.y);
      ctx.lineTo(p.x + p.w - 8, p.y);
      ctx.lineTo(p.x + p.w - 15, p.y + p.h);
      ctx.lineTo(p.x + 15, p.y + p.h);
      ctx.closePath();
      ctx.fill();

      // Boat rim
      ctx.strokeStyle = 'rgba(160,140,110,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p.x + 5, p.y + 1);
      ctx.lineTo(p.x + p.w - 5, p.y + 1);
      ctx.stroke();

      // Small mast
      ctx.strokeStyle = 'rgba(100,80,60,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x + p.w * 0.4, p.y);
      ctx.lineTo(p.x + p.w * 0.4, p.y - 20);
      ctx.stroke();

      ctx.restore();

    } else if (p.type === 'dock') {
      // Dock - wooden planks appearance
      const dockGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
      dockGrad.addColorStop(0, 'rgba(110,90,70,0.8)');
      dockGrad.addColorStop(1, 'rgba(80,65,50,0.6)');
      ctx.fillStyle = dockGrad;

      ctx.beginPath();
      ctx.moveTo(p.x + r, p.y);
      ctx.lineTo(p.x + p.w - r, p.y);
      ctx.quadraticCurveTo(p.x + p.w, p.y, p.x + p.w, p.y + r);
      ctx.lineTo(p.x + p.w, p.y + p.h);
      ctx.lineTo(p.x, p.y + p.h);
      ctx.lineTo(p.x, p.y + r);
      ctx.quadraticCurveTo(p.x, p.y, p.x + r, p.y);
      ctx.fill();

      // Plank lines
      ctx.strokeStyle = 'rgba(70,55,40,0.3)';
      ctx.lineWidth = 1;
      const plankW = p.w / 5;
      for (let i = 1; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(p.x + i * plankW, p.y + 2);
        ctx.lineTo(p.x + i * plankW, p.y + p.h - 2);
        ctx.stroke();
      }

      // Support posts
      ctx.fillStyle = 'rgba(80,65,50,0.5)';
      ctx.fillRect(p.x + 10, p.y + p.h, 6, 15);
      ctx.fillRect(p.x + p.w - 16, p.y + p.h, 6, 15);

    } else if (p.type === 'mast') {
      // Mast/crane crossbar
      const mastGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
      mastGrad.addColorStop(0, 'rgba(90,100,110,0.7)');
      mastGrad.addColorStop(1, 'rgba(60,70,80,0.4)');
      ctx.fillStyle = mastGrad;

      ctx.fillRect(p.x, p.y, p.w, p.h);

      // Vertical mast support
      ctx.fillStyle = 'rgba(70,80,90,0.5)';
      ctx.fillRect(p.x + p.w * 0.45, p.y + p.h, 4, 25);

      // Rigging detail
      ctx.strokeStyle = 'rgba(120,130,140,0.25)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + p.h);
      ctx.lineTo(p.x + p.w * 0.47, p.y + p.h + 25);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p.x + p.w, p.y + p.h);
      ctx.lineTo(p.x + p.w * 0.47, p.y + p.h + 25);
      ctx.stroke();

    } else if (p.type === 'bridge') {
      // Japanese bridge arch segment
      const bridgeGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
      bridgeGrad.addColorStop(0, 'rgba(70,140,90,0.8)');
      bridgeGrad.addColorStop(0.5, 'rgba(50,120,70,0.7)');
      bridgeGrad.addColorStop(1, 'rgba(40,100,60,0.5)');
      ctx.fillStyle = bridgeGrad;

      // Arched top
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + p.h);
      ctx.lineTo(p.x, p.y + 5);
      ctx.quadraticCurveTo(p.x + p.w * 0.5, p.y - 5, p.x + p.w, p.y + 5);
      ctx.lineTo(p.x + p.w, p.y + p.h);
      ctx.closePath();
      ctx.fill();

      // Railing posts
      ctx.strokeStyle = 'rgba(60,110,70,0.5)';
      ctx.lineWidth = 2;
      const postCount = Math.floor(p.w / 25);
      for (let i = 1; i < postCount; i++) {
        const px = p.x + (p.w / postCount) * i;
        ctx.beginPath();
        ctx.moveTo(px, p.y + 2);
        ctx.lineTo(px, p.y - 12);
        ctx.stroke();
      }

      // Top railing
      ctx.strokeStyle = 'rgba(80,150,100,0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p.x + 5, p.y - 12);
      ctx.lineTo(p.x + p.w - 5, p.y - 12);
      ctx.stroke();

      // Wisteria hanging (decorative)
      ctx.fillStyle = 'rgba(180,140,200,0.3)';
      for (let v = 0; v < 3; v++) {
        const vx = p.x + 15 + v * (p.w - 30) / 2;
        const vy = p.y - 10;
        const vLen = 15 + Math.sin(t + v * 2) * 3;
        ctx.beginPath();
        ctx.ellipse(vx, vy + vLen * 0.5, 4, vLen, 0, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (p.type === 'stone') {
      // Stepping stone
      const stoneGrad = ctx.createRadialGradient(
        p.x + p.w * 0.4, p.y + p.h * 0.3, 2,
        p.x + p.w * 0.5, p.y + p.h * 0.5, p.w * 0.5
      );
      stoneGrad.addColorStop(0, 'rgba(160,150,130,0.8)');
      stoneGrad.addColorStop(0.6, 'rgba(130,120,100,0.65)');
      stoneGrad.addColorStop(1, 'rgba(100,90,75,0.4)');
      ctx.fillStyle = stoneGrad;

      ctx.beginPath();
      ctx.ellipse(p.x + p.w / 2, p.y + p.h / 2, p.w * 0.5, p.h * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();

      // Moss spots
      ctx.fillStyle = 'rgba(100,140,80,0.25)';
      ctx.beginPath();
      ctx.ellipse(p.x + p.w * 0.3, p.y + p.h * 0.4, 8, 4, 0.5, 0, Math.PI * 2);
      ctx.fill();

    } else if (p.type === 'vine') {
      // Vine/flower platform
      const vineGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
      vineGrad.addColorStop(0, 'rgba(160,130,180,0.7)');
      vineGrad.addColorStop(1, 'rgba(120,100,140,0.4)');
      ctx.fillStyle = vineGrad;

      // Organic wavy shape
      ctx.beginPath();
      ctx.moveTo(p.x + 5, p.y + p.h);
      ctx.lineTo(p.x, p.y + 5);
      ctx.quadraticCurveTo(p.x + p.w * 0.25, p.y - 3, p.x + p.w * 0.5, p.y + 2);
      ctx.quadraticCurveTo(p.x + p.w * 0.75, p.y - 3, p.x + p.w, p.y + 5);
      ctx.lineTo(p.x + p.w - 5, p.y + p.h);
      ctx.closePath();
      ctx.fill();

      // Small flowers on vine
      const flowerColors = ['rgba(220,180,200,0.6)', 'rgba(240,200,220,0.5)', 'rgba(200,170,220,0.5)'];
      for (let f = 0; f < 3; f++) {
        const fx = p.x + 12 + (p.w - 24) * (f / 2);
        const fy = p.y + 2 + Math.sin(t * 1.5 + f * 2) * 2;
        ctx.fillStyle = flowerColors[f];
        ctx.beginPath();
        ctx.arc(fx, fy, 3 + Math.sin(t + f) * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Hanging tendrils
      ctx.strokeStyle = 'rgba(100,140,80,0.25)';
      ctx.lineWidth = 1;
      for (let td = 0; td < 2; td++) {
        const tx = p.x + 10 + td * (p.w - 20);
        ctx.beginPath();
        ctx.moveTo(tx, p.y + p.h);
        ctx.quadraticCurveTo(tx + Math.sin(t + td) * 5, p.y + p.h + 12, tx - 3, p.y + p.h + 18);
        ctx.stroke();
      }
    } else {
      // Default platform
      const grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
      grad.addColorStop(0, colors.primary + '0.65)');
      grad.addColorStop(1, colors.primary + '0.35)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(p.x + r, p.y);
      ctx.lineTo(p.x + p.w - r, p.y);
      ctx.quadraticCurveTo(p.x + p.w, p.y, p.x + p.w, p.y + r);
      ctx.lineTo(p.x + p.w, p.y + p.h);
      ctx.lineTo(p.x, p.y + p.h);
      ctx.lineTo(p.x, p.y + r);
      ctx.quadraticCurveTo(p.x, p.y, p.x + r, p.y);
      ctx.fill();
    }

    // Restore disappearing/submerged platform alpha
    if (p.submerged) {
      ctx.restore();
    }
    if (p._disappearAlpha !== undefined && p._disappearAlpha < 1) {
      ctx.restore();
    }

    ctx.restore();
  },

  drawScreenEffects(ctx, w, h) {
    // Vignette
    const vigGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.8);
    vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vigGrad.addColorStop(0.7, 'rgba(0,0,0,0.15)');
    vigGrad.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle canvas texture (paint-like grain)
    ctx.save();
    ctx.globalAlpha = 0.025;
    const grainCount = Math.min(60, Math.floor(w * h / 30000));
    for (let i = 0; i < grainCount; i++) {
      const gx = Math.random() * w;
      const gy = Math.random() * h;
      const gs = 1 + Math.random() * 2.5;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,250,240,1)' : 'rgba(0,0,0,1)';
      ctx.fillRect(gx, gy, gs, gs);
    }
    ctx.restore();

    // Impressionist brushstroke overlay
    ctx.save();
    ctx.globalAlpha = 0.025;
    ctx.globalCompositeOperation = 'overlay';
    for (let i = 0; i < 15; i++) {
      const ox = (Math.sin(this.time * 0.1 + i * 7) * 0.5 + 0.5) * w;
      const oy = (Math.cos(this.time * 0.08 + i * 5) * 0.5 + 0.5) * h;
      ctx.fillStyle = `hsl(${(i * 30 + this.time * 10) % 360}, 40%, 65%)`;
      ctx.beginPath();
      ctx.ellipse(ox, oy, 25 + i * 2, 6, i * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Level intro overlay
    if (this.levelIntroTimer > 0) {
      this.levelIntroTimer -= 1/60;
      const level = LEVELS[this.currentLevel];
      const introAlpha = this.levelIntroTimer > 2.5 ? Math.min(1, (3.5 - this.levelIntroTimer) * 2) :
                         this.levelIntroTimer < 0.8 ? this.levelIntroTimer / 0.8 : 1;

      // Backdrop
      ctx.save();
      ctx.fillStyle = `rgba(10,10,18,${introAlpha * 0.6})`;
      ctx.fillRect(0, 0, w, h);

      ctx.globalAlpha = introAlpha;

      // Level name
      ctx.fillStyle = '#f5ead0';
      ctx.font = '300 3em Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t(level.nameKey), w / 2, h / 2 - 25);

      // Subtitle
      ctx.fillStyle = 'rgba(245,234,208,0.5)';
      ctx.font = '300 1em Georgia, serif';
      ctx.fillText(t(level.subtitleKey), w / 2, h / 2 + 25);

      // Decorative line
      ctx.strokeStyle = `rgba(245,234,208,${introAlpha * 0.3})`;
      ctx.lineWidth = 1;
      const lineW = 80;
      ctx.beginPath();
      ctx.moveTo(w / 2 - lineW, h / 2 + 55);
      ctx.lineTo(w / 2 + lineW, h / 2 + 55);
      ctx.stroke();

      ctx.restore();
    }
  }
};

// ============================================================
// SECTION 8: INITIALIZATION
// DOMContentLoaded 事件入口：
//   1. 应用保存的语言偏好
//   2. 绑定所有按钮事件监听（不使用内联onclick，兼容mule.page）
//   3. 绑定语言切换、暂停、图鉴等交互
//   4. 初始化游戏引擎并启动主循环
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved language on load
  updateUIStrings();

  // Wire up menu buttons (no inline onclick to avoid being stripped by hosting platforms)
  document.getElementById('btn-start').addEventListener('click', () => {
    AudioEngine.init(); AudioEngine.playMenuClick(); Game.showLevelSelect();
  });
  document.getElementById('btn-gallery').addEventListener('click', () => {
    AudioEngine.init(); AudioEngine.playMenuClick(); Game.showGallery();
  });
  document.getElementById('btn-continue').addEventListener('click', () => {
    Game.closePaintingReveal();
  });
  document.getElementById('btn-gallery-back').addEventListener('click', () => {
    Game.closeGallery();
  });
  document.getElementById('btn-levelsel-back').addEventListener('click', () => {
    Game.closeLevelSelect();
  });

  // Language toggle buttons
  const toggleLang = () => {
    setLang(currentLang === 'zh' ? 'en' : 'zh');
    if (Game.state === 'playing' && Game.currentLevel >= 0) Game.updateHUD();
  };
  document.getElementById('btn-lang').addEventListener('click', toggleLang);
  document.getElementById('hud-lang-btn').addEventListener('click', toggleLang);

  // Pause buttons
  document.getElementById('hud-pause-btn').addEventListener('click', () => {
    Game.togglePause();
  });
  document.getElementById('btn-resume').addEventListener('click', () => {
    Game.resumeGame();
  });
  document.getElementById('btn-back-menu').addEventListener('click', () => {
    Game.returnToMenu();
  });

  // Album buttons
  document.getElementById('btn-album').addEventListener('click', () => {
    AudioEngine.init(); AudioEngine.playMenuClick(); Game.showAlbum();
  });
  document.getElementById('btn-album-back').addEventListener('click', () => {
    Game.closeAlbum();
  });

  Game.init().catch(err => {
    console.error('Game init failed:', err);
    // Force show menu even on error
    const ls = document.getElementById('loading-screen');
    if (ls) { ls.classList.add('fade-out'); setTimeout(() => ls.style.display = 'none', 500); }
    document.getElementById('main-menu').style.display = 'flex';
  });
});
