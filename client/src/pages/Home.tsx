import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingBag, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  Globe, 
  TrendingUp, 
  HelpCircle,
  Menu,
  X,
  Search,
  Filter
} from "lucide-react";
import rawData from "../dearjose_financial_master.json";

// 定義商品介面
interface Product {
  display_seq: number;
  database_id: number;
  slug: string;
  product_url: string;
  name_en: string;
  name_zh: string;
  primary_category: string;
  categories: string;
  image_url: string;
  image_local_path: string;
  official_vnd_display: string;
  vnd_price: number;
  exchange_vnd_per_twd: number;
  actual_cost_ntd: number;
  customer_price_ntd: number;
  kol_commission_ntd: number;
  boss_net_profit_ntd: number;
  profit_margin_pct: number;
  customer_price_display: string;
  actual_cost_display: string;
  kol_commission_display: string;
  boss_net_profit_display: string;
  profit_margin_display: string;
  is_new_arrival: boolean;
  is_sale: boolean;
}

const products = rawData as Product[];

// 高質感生成圖片連結
const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663319085540/ii8vJZA79cWbsKnwmtZxNC/dearjose_hero-BiQJQWvcRoRqrYvbR6k8yL.webp";
const BRAND_STORY_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663319085540/ii8vJZA79cWbsKnwmtZxNC/dearjose_brand_story-Vnt4LSa35rcQMKgvh62zDP.webp";
const ANNOUNCEMENT_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663319085540/ii8vJZA79cWbsKnwmtZxNC/dearjose_announcement_bg-ggFxGyqNvvCCDCyYf87AiX.webp";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterNew, setFilterNew] = useState<boolean>(false);
  const [filterSale, setFilterSale] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // 所有可用分類
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.primary_category));
    return ["All", ...Array.from(cats).filter(Boolean)];
  }, []);

  // 篩選商品
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = activeCategory === "All" || p.primary_category === activeCategory;
      const matchesSearch = p.name_en.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (p.name_zh && p.name_zh.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesNew = !filterNew || p.is_new_arrival;
      const matchesSale = !filterSale || p.is_sale;
      return matchesCategory && matchesSearch && matchesNew && matchesSale;
    });
  }, [activeCategory, searchQuery, filterNew, filterSale]);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#2d2621] selection:bg-[#b39274] selection:text-white">
      {/* 頂部全包公告 Banner */}
      <div 
        className="relative bg-cover bg-center py-4 px-4 text-center border-b border-[#e6dfd5]"
        style={{ backgroundImage: `linear-gradient(rgba(250, 248, 245, 0.9), rgba(250, 248, 245, 0.9)), url(${ANNOUNCEMENT_BG})` }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-3">
          <Badge className="bg-[#b39274] text-white hover:bg-[#b39274]/90 px-3 py-1 font-sans text-xs tracking-wider">
            100% 跨境全包承諾
          </Badge>
          <p className="text-xs md:text-sm font-medium tracking-wide text-[#4a3e3d] leading-relaxed">
            本站所有顯示價格已包含：<span className="text-[#b39274] font-bold">國際直郵運費、台灣進口手續費、專業買手代購費</span>，絕無後續隱藏費用！一鍵直郵到府！
          </p>
        </div>
      </div>

      {/* 導覽列 */}
      <header className="sticky top-0 z-40 bg-[#faf8f5]/90 backdrop-blur-md border-b border-[#e6dfd5]/60 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo / 品牌名 */}
          <div className="flex flex-col">
            <span className="font-serif text-2xl md:text-3xl tracking-[0.2em] font-light uppercase text-[#2d2621]">
              Dear José
            </span>
            <span className="text-[9px] tracking-[0.3em] uppercase text-[#b39274] font-sans -mt-0.5">
              Taiwan Select Shop
            </span>
          </div>

          {/* 桌面導覽 */}
          <nav className="hidden md:flex items-center gap-8 font-sans text-xs uppercase tracking-[0.15em] font-medium">
            <a href="#story" className="hover:text-[#b39274] transition-colors duration-200">品牌故事</a>
            <a href="#catalog" className="hover:text-[#b39274] transition-colors duration-200">商品目錄</a>
            <a href="#service" className="hover:text-[#b39274] transition-colors duration-200">服務承諾</a>
          </nav>

          {/* 右側按鈕與手機選單切換 */}
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => {
                const el = document.getElementById("catalog");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="hidden sm:flex bg-[#b39274] text-white hover:bg-[#9e7d60] rounded-none px-6 py-5 text-xs uppercase tracking-[0.15em] transition-all duration-300 shadow-sm"
            >
              瀏覽目錄 <ShoppingBag className="ml-2 w-4 h-4" />
            </Button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#2d2621] hover:text-[#b39274]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* 手機選單 */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#faf8f5] border-b border-[#e6dfd5] px-6 py-6 flex flex-col gap-4 animate-fade-in">
            <a 
              href="#story" 
              onClick={() => setMobileMenuOpen(false)}
              className="font-sans text-sm uppercase tracking-wider py-2 border-b border-[#e6dfd5]/40"
            >
              品牌故事
            </a>
            <a 
              href="#catalog" 
              onClick={() => setMobileMenuOpen(false)}
              className="font-sans text-sm uppercase tracking-wider py-2 border-b border-[#e6dfd5]/40"
            >
              商品目錄
            </a>
            <a 
              href="#service" 
              onClick={() => setMobileMenuOpen(false)}
              className="font-sans text-sm uppercase tracking-wider py-2"
            >
              服務承諾
            </a>
          </div>
        )}
      </header>

      {/* Hero 區塊 */}
      <section className="relative h-[65vh] md:h-[80vh] flex items-center overflow-hidden">
        {/* 背景大圖 */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        {/* 遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2d2621]/70 via-[#2d2621]/40 to-transparent" />
        
        {/* 內容 */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 text-white">
          <div className="max-w-2xl">
            <span className="font-sans text-xs uppercase tracking-[0.3em] font-medium text-[#f0e1dc] mb-4 block">
              Romantic Provencal Breeze
            </span>
            <h1 className="text-4xl md:text-6xl font-light leading-tight mb-6 tracking-wide font-serif">
              南法微風中的<br />浪漫優雅與現代摩登
            </h1>
            <p className="font-sans text-sm md:text-base text-stone-200 font-light leading-relaxed mb-8 tracking-wide">
              Dear José 專為尋求詩意與浪漫的現代女性設計。我們提供全站 100% 零漏商品代購，以最即時的匯率精算，為您呈現無隱藏費用的極致直郵體驗。
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => {
                  const el = document.getElementById("catalog");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-white text-[#2d2621] hover:bg-[#f0e1dc] rounded-none px-8 py-6 text-xs uppercase tracking-[0.15em] transition-all duration-300"
              >
                立即探索商品
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 品牌故事與特點 */}
      <section id="story" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <div className="lg:col-span-5 relative">
            <div className="aspect-square overflow-hidden rounded-none border border-[#e6dfd5] p-2 bg-white">
              <img 
                src={BRAND_STORY_IMG} 
                alt="Dear José Brand Aesthetic" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* 懸浮裝飾卡片 */}
            <div className="absolute -bottom-6 -right-6 bg-[#b39274] text-white p-6 hidden sm:block max-w-xs shadow-lg">
              <p className="font-serif italic text-lg mb-2">"Poetry in motion, romanticism in every thread."</p>
              <p className="font-sans text-[10px] tracking-widest uppercase opacity-80">Dear José Paris & Saigon</p>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="font-sans text-xs uppercase tracking-[0.2em] text-[#b39274] mb-2 block font-semibold">
              Brand Story & Concept
            </span>
            <h2 className="text-3xl md:text-4xl font-light tracking-wide mb-6 font-serif">
              源自浪漫詩意的優雅美學
            </h2>
            <p className="font-sans text-sm text-[#70635c] font-light leading-relaxed mb-8">
              Dear José 是一個充滿法式浪漫與熱帶風情的女裝品牌。每一件服飾都如同寫給生活的情書，採用輕盈飄逸的雪紡、精緻的手工蕾絲與復古的花卉印花。
              我們在台灣為您建立專屬的買手直郵通道，確保您能以與官網 100% 同步的完整商品目錄，享受無縫、透明、安心的購物旅程。
            </p>

            {/* 3大特點 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[#e6dfd5]">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#b39274]">
                  <Globe className="w-5 h-5" />
                  <span className="font-sans text-xs uppercase tracking-wider font-bold">100% 零漏同步</span>
                </div>
                <p className="text-xs text-[#70635c] font-light leading-relaxed">
                  官網 91 件 Women Fashion 商品全數收錄，無任何遺漏。
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#b39274]">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-sans text-xs uppercase tracking-wider font-bold">專屬跨境匯率</span>
                </div>
                <p className="text-xs text-[#70635c] font-light leading-relaxed">
                  採用 1 TWD = 800 VND 專屬匯率精算，到手價格超值透明。
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#b39274]">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-sans text-xs uppercase tracking-wider font-bold">直郵免手續費</span>
                </div>
                <p className="text-xs text-[#70635c] font-light leading-relaxed">
                  標價即為到手價，已含進口關稅與代購費，一鍵直郵到府。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 商品目錄區塊 */}
      <section id="catalog" className="py-20 bg-[#faf8f5] border-t border-[#e6dfd5]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 標題 */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-sans text-xs uppercase tracking-[0.2em] text-[#b39274] mb-2 block font-semibold">
              The Collection Catalog
            </span>
            <h2 className="text-3xl md:text-5xl font-light tracking-wide mb-4 font-serif">
              全站商品精選目錄
            </h2>
            <div className="w-16 h-[1px] bg-[#b39274] mx-auto my-6" />
            <p className="font-sans text-sm text-[#70635c] font-light leading-relaxed">
              共計收錄官網 91 件熱銷商品。提供中文/英文對照名稱，以及台灣客人專屬全包到手價 (NT$)。
            </p>
          </div>

          {/* 搜尋與篩選控制列 */}
          <div className="bg-white border border-[#e6dfd5] p-6 mb-10 flex flex-col md:flex-row gap-6 items-center justify-between shadow-sm">
            {/* 搜尋框 */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#70635c]" />
              <input 
                type="text" 
                placeholder="搜尋英文或中文商品名稱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#e6dfd5] py-2.5 pl-10 pr-4 text-xs font-sans tracking-wider rounded-none focus:outline-none focus:border-[#b39274] focus:ring-1 focus:ring-[#b39274]/50 transition-all duration-300"
              />
            </div>

            {/* 篩選標籤 */}
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-start md:justify-end">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-sans tracking-wider">
                <input 
                  type="checkbox" 
                  checked={filterNew}
                  onChange={(e) => setFilterNew(e.target.checked)}
                  className="rounded border-[#e6dfd5] text-[#b39274] focus:ring-[#b39274] w-4 h-4"
                />
                <span>新品 New Arrivals</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-sans tracking-wider">
                <input 
                  type="checkbox" 
                  checked={filterSale}
                  onChange={(e) => setFilterSale(e.target.checked)}
                  className="rounded border-[#e6dfd5] text-[#b39274] focus:ring-[#b39274] w-4 h-4"
                />
                <span>折扣 Sale</span>
              </label>
              <span className="text-xs text-[#70635c] font-sans pl-2 border-l border-[#e6dfd5]">
                已篩選出 <span className="font-bold text-[#b39274]">{filteredProducts.length}</span> 件商品
              </span>
            </div>
          </div>

          {/* 分類 Tabs */}
          <div className="flex justify-center mb-12">
            <Tabs 
              value={activeCategory} 
              onValueChange={setActiveCategory}
              className="w-full"
            >
              <TabsList className="w-full flex flex-wrap justify-center gap-2 bg-transparent h-auto p-0">
                {categories.map(cat => (
                  <TabsTrigger 
                    key={cat} 
                    value={cat}
                    className={`px-5 py-2.5 text-xs uppercase tracking-[0.15em] font-sans font-medium rounded-none border transition-all duration-300 cursor-pointer
                      ${activeCategory === cat 
                        ? "bg-[#b39274] text-white border-[#b39274]" 
                        : "bg-white text-[#70635c] border-[#e6dfd5] hover:border-[#b39274] hover:text-[#b39274]"
                      }`}
                  >
                    {cat === "All" ? "全部商品" : cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* 商品 Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white border border-[#e6dfd5] rounded-none">
              <ShoppingBag className="w-12 h-12 text-[#b39274]/40 mx-auto mb-4" />
              <p className="font-serif italic text-lg text-[#70635c] mb-2">沒有找到符合條件的商品</p>
              <p className="font-sans text-xs text-[#70635c]/80">請嘗試更換搜尋關鍵字或篩選條件。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {filteredProducts.map((p) => (
                <Card 
                  key={p.slug} 
                  className="group bg-white rounded-none border border-[#e6dfd5] overflow-hidden transition-all duration-500 hover:shadow-md hover:border-[#b39274]/50 flex flex-col h-full"
                >
                  {/* 商品圖片 */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                    <img 
                      src={p.image_url} 
                      alt={p.name_en} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* 標籤 */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                      {p.is_new_arrival && (
                        <Badge className="bg-[#b39274] text-white border-none rounded-none text-[9px] uppercase tracking-widest px-2 py-0.5">
                          New
                        </Badge>
                      )}
                      {p.is_sale && (
                        <Badge className="bg-[#a34e36] text-white border-none rounded-none text-[9px] uppercase tracking-widest px-2 py-0.5">
                          Sale
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* 商品資訊 */}
                  <CardContent className="p-6 flex flex-col flex-grow justify-between">
                    <div className="mb-4">
                      {/* 分類 */}
                      <span className="text-[10px] uppercase tracking-widest text-[#b39274] font-sans font-semibold block mb-2">
                        {p.primary_category}
                      </span>
                      {/* 英文名 */}
                      <h3 className="font-serif text-base font-normal tracking-wide text-[#2d2621] line-clamp-1 group-hover:text-[#b39274] transition-colors duration-300 mb-1">
                        {p.name_en}
                      </h3>
                      {/* 中文譯名 */}
                      <p className="font-sans text-xs text-[#70635c] font-light line-clamp-1">
                        {p.name_zh || "經典優雅時尚單品"}
                      </p>
                    </div>

                    {/* 價格區塊 */}
                    <div className="pt-4 border-t border-[#e6dfd5]/40 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-[#b39274] font-sans font-bold">
                          到手專屬價
                        </span>
                        <span className="text-xs text-[#70635c]/60 font-sans">
                          全包直郵到府
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xl font-sans font-bold text-[#b39274]">
                          {p.customer_price_display}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 服務承諾與說明 */}
      <section id="service" className="py-20 md:py-28 bg-[#faf8f5] border-t border-[#e6dfd5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="font-sans text-xs uppercase tracking-[0.2em] text-[#b39274] mb-2 block font-semibold">
              Our Commitments
            </span>
            <h2 className="text-3xl md:text-4xl font-light tracking-wide mb-4 font-serif">
              跨境代購服務與保障
            </h2>
            <div className="w-12 h-[1px] bg-[#b39274] mx-auto my-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-white p-8 border border-[#e6dfd5] flex gap-4">
              <div className="text-[#b39274] shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg mb-2 font-normal">全包透明標價</h3>
                <p className="text-xs text-[#70635c] font-light leading-relaxed">
                  本站所有商品顯示之新台幣 (NT$) 售價，即為您最終支付的金額。其中已完整包含越南當地購買成本、國際航空快遞、台灣海關進口稅費、以及買手服務費，絕不於收貨時向您加收任何稅費。
                </p>
              </div>
            </div>

            <div className="bg-white p-8 border border-[#e6dfd5] flex gap-4">
              <div className="text-[#b39274] shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg mb-2 font-normal">正品與品質保證</h3>
                <p className="text-xs text-[#70635c] font-light leading-relaxed">
                  所有商品皆由專業買手於越南胡志明市 Dear José 官方旗艦店或官方線上商城親自採購，100% 保證正品，隨單附帶原廠吊牌與包裝，並在出貨前經過雙重品質檢驗，確保無任何瑕疵。
                </p>
              </div>
            </div>

            <div className="bg-white p-8 border border-[#e6dfd5] flex gap-4">
              <div className="text-[#b39274] shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg mb-2 font-normal">極速直郵配送</h3>
                <p className="text-xs text-[#70635c] font-light leading-relaxed">
                  確認訂單並完成採購後，商品將直接通過國際快遞（如 DHL / FedEx / SF Express）從胡志明市直郵寄往您在台灣的指定地址。全程提供國際單號可實時追蹤，預計 5-7 個工作天送達。
                </p>
              </div>
            </div>

            <div className="bg-white p-8 border border-[#e6dfd5] flex gap-4">
              <div className="text-[#b39274] shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg mb-2 font-normal">專業客服諮詢</h3>
                <p className="text-xs text-[#70635c] font-light leading-relaxed">
                  由於 Dear José 版型偏向法式修身，我們的客服團隊可根據您的身形數據（胸圍、腰圍、臀圍），提供最精準的尺碼建議。歡迎隨時聯繫我們，獲取一對一尊榮選購諮詢。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 頁尾 */}
      <footer className="bg-[#2d2621] text-white py-12 border-t border-[#e6dfd5]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b border-white/10 pb-8 mb-8">
            <div className="flex flex-col">
              <span className="font-serif text-xl tracking-[0.2em] font-light uppercase">
                Dear José
              </span>
              <span className="text-[8px] tracking-[0.3em] uppercase text-[#b39274] font-sans -mt-0.5">
                Taiwan Select Shop
              </span>
            </div>
            <div className="text-center text-xs text-stone-400 font-sans">
              本站為獨立買手代購展示服務，非 Dear José 官方直營網站。
            </div>
            <div className="text-right text-xs text-[#b39274] font-sans font-medium">
              1 TWD = 832.34 VND 基準精算
            </div>
          </div>
          <div className="text-center text-[10px] text-stone-500 font-sans tracking-wider">
            &copy; 2026 Dear José Taiwan Select. All Rights Reserved. Designed for Romanticists.
          </div>
        </div>
      </footer>
    </div>
  );
}
