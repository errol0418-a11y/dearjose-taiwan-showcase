import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingBag,
  CheckCircle2,
  Globe,
  TrendingUp,
  Menu,
  X,
  Search,
  Loader2,
  Star,
  ClipboardList,
  Minus,
  Plus,
  Trash2,
  MessageCircle,
  Send,
  History,
  Ruler,
  Shirt,
  Heart
} from "lucide-react";
import backupRawData from "../dearjose_financial_master.json";

const GOOGLE_SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT5K76uR-YxUu6rW20-VvO8Z6U_XN6W377-M1u0U_Lp8R73_U8W7X6O_Z9_example/pub?output=csv";
const LINE_URL = "https://line.me/R/ti/p/%40915otjhs";

interface Product {
  display_seq: number;
  name_en: string;
  name_zh: string;
  primary_category: string;
  image_url: string;
  product_url: string;
  vnd_price: number;
  is_new_arrival: boolean;
  is_sale: boolean;
  is_kol_pick: boolean;
  description: string;
  size_info: string;
  care_instructions: string;
  official_vnd_display: string;
  customer_price_display: string;
  customer_price_ntd: number;
}

interface CartItem extends Product {
  cartId: string;
  quantity: number;
  selectedSize: string;
}

interface CustomerForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  paymentMethod: "bank_transfer";
}

interface SavedOrder {
  id: string;
  createdAt: string;
  customer: CustomerForm;
  items: CartItem[];
  total: number;
  status: string;
}

const formatNtd = (value: number) => `NT$${value.toLocaleString("zh-TW")}`;

function normalizeProduct(raw: any, idx: number): Product {
  const vndPrice = Number(raw.Price_VND ?? raw.price_vnd ?? raw.vnd_price ?? 0) || 0;
  const customerPriceNtd = Number(raw.customer_price_ntd) || Math.ceil(((vndPrice / 800) * 1.4) / 10) * 10;
  const category = raw.Category || raw.category || raw.primary_category || "Dresses";
  const nameEn = raw.Title_EN || raw.title_en || raw.name_en || "Elegant Item";
  const nameZh = raw.Title_ZH || raw.title_zh || raw.name_zh || "法式設計單品";
  const description = raw.Description || raw.description || `${nameZh}延續 Dear José 的法式浪漫線條，適合日常約會、旅行與正式聚會。實際材質、版型與細節請搭配官網商品頁確認。`;
  const sizeInfo = raw.Size_Info || raw.size_info || raw.Size || raw.size || "建議參考官網尺寸表；下單備註可填身高、體重、胸圍、腰圍與平常尺寸，客服會協助確認衣長與版型。";
  const care = raw.Care_Instructions || raw.care_instructions || raw.Care || raw.care || "建議冷水手洗或裝洗衣袋低速清洗，深淺色分開，避免烘乾與長時間曝曬；蕾絲、雪紡與刺繡款建議送洗。";

  return {
    display_seq: Number(raw.display_seq) || idx + 1,
    name_en: nameEn,
    name_zh: nameZh,
    primary_category: category,
    image_url: raw.Image_URL || raw.image_url || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=60",
    product_url: raw.Product_URL || raw.product_url || "https://www.dearjose.com/en/categories/women-fashion",
    vnd_price: vndPrice,
    is_new_arrival: String(raw.Is_New_Arrival ?? raw.is_new_arrival ?? "").toLowerCase() === "true" || !!raw.is_new_arrival,
    is_sale: String(raw.Is_Sale ?? raw.is_sale ?? "").toLowerCase() === "true" || !!raw.is_sale,
    is_kol_pick: String(raw.Is_KOL_Pick ?? raw.is_kol_pick ?? "").toLowerCase() === "true" || idx < 6,
    description,
    size_info: sizeInfo,
    care_instructions: care,
    official_vnd_display: raw.official_vnd_display || `₫${vndPrice.toLocaleString("en-US")}`,
    customer_price_display: raw.customer_price_display || formatNtd(customerPriceNtd),
    customer_price_ntd: customerPriceNtd
  };
}

const backupProducts: Product[] = (backupRawData as any[]).map(normalizeProduct);

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663319085540/ii8vJZA79cWbsKnwmtZxNC/dearjose_hero-BiQJQWvcRoRqrYvbR6k8yL.webp";
const BRAND_STORY_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663319085540/ii8vJZA79cWbsKnwmtZxNC/dearjose_brand_story-Vnt4LSa35rcQMKgvh62zDP.webp";
const ANNOUNCEMENT_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663319085540/ii8vJZA79cWbsKnwmtZxNC/dearjose_announcement_bg-ggFxGyqNvvCCDCyYf87AiX.webp";

function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);

  const headers = rows[0]?.map((h) => h.replace(/^"|"$/g, "")) || [];
  return rows.slice(1).map((values) => {
    const item: Record<string, string> = {};
    headers.forEach((header, index) => {
      item[header] = (values[index] || "").replace(/^"|"$/g, "");
    });
    return item;
  });
}

function loadLocalOrders(): SavedOrder[] {
  try {
    return JSON.parse(localStorage.getItem("dearjose_orders") || "[]");
  } catch {
    return [];
  }
}

function saveLocalOrder(order: SavedOrder) {
  const orders = loadLocalOrders();
  localStorage.setItem("dearjose_orders", JSON.stringify([order, ...orders]));
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterNew, setFilterNew] = useState(false);
  const [filterSale, setFilterSale] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<0 | 1 | 2>(0);
  const [latestOrder, setLatestOrder] = useState<SavedOrder | null>(null);
  const [orderLookupPhone, setOrderLookupPhone] = useState("");
  const [lookupResults, setLookupResults] = useState<SavedOrder[]>([]);
  const [lookupMessage, setLookupMessage] = useState("");
  const [form, setForm] = useState<CustomerForm>({ name: "", phone: "", email: "", address: "", note: "", paymentMethod: "bank_transfer" });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(GOOGLE_SHEETS_CSV_URL);
        if (!response.ok) throw new Error("無法讀取 Google Sheets 數據，已改用備用商品資料。");
        const parsedRows = parseCSV(await response.text());
        const loadedProducts = parsedRows.map(normalizeProduct).filter((p) => p.name_en || p.name_zh);
        setProducts(loadedProducts.length ? loadedProducts : backupProducts);
      } catch (err: any) {
        setError(err.message || "加載商品失敗，已改用備用商品資料。");
        setProducts(backupProducts);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.primary_category));
    return ["All", ...Array.from(cats).filter(Boolean)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeCategory === "All" || p.primary_category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = p.name_en.toLowerCase().includes(q) || p.name_zh.toLowerCase().includes(q);
      return matchesCategory && matchesSearch && (!filterNew || p.is_new_arrival) && (!filterSale || p.is_sale);
    });
  }, [products, activeCategory, searchQuery, filterNew, filterSale]);

  const kolProducts = useMemo(() => products.filter((p) => p.is_kol_pick).slice(0, 6), [products]);
  const cartTotal = cart.reduce((sum, item) => sum + item.customer_price_ntd * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product, selectedSize = "客服協助確認") => {
    setCart((current) => {
      const existing = current.find((item) => item.display_seq === product.display_seq && item.selectedSize === selectedSize);
      if (existing) {
        return current.map((item) => item.cartId === existing.cartId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { ...product, selectedSize, quantity: 1, cartId: `${product.display_seq}-${Date.now()}` }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart((current) => current.map((item) => item.cartId === cartId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  const removeFromCart = (cartId: string) => setCart((current) => current.filter((item) => item.cartId !== cartId));

  const submitOrder = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || cart.length === 0) {
      alert("請填寫姓名、手機、收件地址，並確認購物車內已有商品。");
      return;
    }
    const order: SavedOrder = {
      id: `DJ${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      customer: form,
      items: cart,
      total: cartTotal,
      status: "代購申請已送出，等待匯款回報"
    };
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });
      if (!response.ok) throw new Error("server unavailable");
    } catch {
      saveLocalOrder(order);
    }
    saveLocalOrder(order);
    setLatestOrder(order);
    setCart([]);
    setCartOpen(false);
    setCheckoutStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const lookupOrders = async () => {
    const phone = orderLookupPhone.trim();
    if (!phone) {
      setLookupMessage("請先輸入下單手機號碼。");
      setLookupResults([]);
      return;
    }
    try {
      const response = await fetch(`/api/orders?phone=${encodeURIComponent(phone)}`);
      if (response.ok) {
        const data = await response.json();
        setLookupResults(data.orders || []);
        setLookupMessage((data.orders || []).length ? "已找到以下代購紀錄。" : "目前查無此手機的代購紀錄。");
        return;
      }
    } catch {}
    const local = loadLocalOrders().filter((order) => order.customer.phone.replace(/\D/g, "") === phone.replace(/\D/g, ""));
    setLookupResults(local);
    setLookupMessage(local.length ? "已找到以下本機瀏覽器代購紀錄。" : "目前查無此手機的代購紀錄。");
  };

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const ProductCard = ({ p, compact = false }: { p: Product; compact?: boolean }) => (
    <Card className="group bg-white rounded-none border border-[#e6dfd5] overflow-hidden transition-all duration-500 hover:shadow-md hover:border-[#b39274]/50 flex flex-col h-full">
      <a href={p.product_url} target="_blank" rel="noopener noreferrer" className="relative aspect-[3/4] overflow-hidden bg-stone-100 block">
        <img src={p.image_url} alt={p.name_en} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {p.is_kol_pick && <Badge className="bg-[#2d2621] text-white border-none rounded-none text-[9px] uppercase tracking-widest px-2 py-0.5">KOL Pick</Badge>}
          {p.is_new_arrival && <Badge className="bg-[#b39274] text-white border-none rounded-none text-[9px] uppercase tracking-widest px-2 py-0.5">New</Badge>}
          {p.is_sale && <Badge className="bg-[#a34e36] text-white border-none rounded-none text-[9px] uppercase tracking-widest px-2 py-0.5">Sale</Badge>}
        </div>
      </a>
      <CardContent className="p-6 flex flex-col flex-grow justify-between">
        <div className="mb-4">
          <span className="text-[10px] uppercase tracking-widest text-[#b39274] font-sans font-semibold block mb-2">{p.primary_category}</span>
          <h3 className="font-serif text-base font-normal tracking-wide text-[#2d2621] line-clamp-1 mb-1">{p.name_en}</h3>
          <p className="font-sans text-xs text-[#70635c] font-light line-clamp-1">{p.name_zh}</p>
          {!compact && (
            <div className="mt-4 space-y-3 text-xs text-[#70635c] leading-relaxed border-t border-[#e6dfd5]/50 pt-4">
              <p className="line-clamp-3">{p.description}</p>
              <p className="flex gap-2"><Ruler className="w-4 h-4 text-[#b39274] shrink-0 mt-0.5" /><span className="line-clamp-2">{p.size_info}</span></p>
              <p className="flex gap-2"><Shirt className="w-4 h-4 text-[#b39274] shrink-0 mt-0.5" /><span className="line-clamp-2">{p.care_instructions}</span></p>
            </div>
          )}
        </div>
        <div className="pt-4 border-t border-[#e6dfd5]/40 flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-4">
            <div className="flex flex-col"><span className="text-[9px] uppercase tracking-wider text-[#70635c]/60 font-sans">官網原價</span><span className="text-xs text-[#70635c]/80 font-sans font-light">{p.official_vnd_display}</span></div>
            <div className="flex flex-col items-end"><span className="text-[9px] uppercase tracking-wider text-[#b39274] font-sans font-bold">到手專屬價</span><span className="text-lg md:text-xl font-sans font-bold text-[#b39274]">{p.customer_price_display}</span></div>
          </div>
          <Button onClick={() => addToCart(p)} className="w-full bg-[#2d2621] hover:bg-[#b39274] text-white rounded-none text-[10px] tracking-widest uppercase font-sans py-5">加入代購車</Button>
          <a href={p.product_url} target="_blank" rel="noopener noreferrer" className="w-full text-center py-2 border border-[#e6dfd5] text-[10px] font-sans uppercase tracking-widest text-[#70635c] hover:bg-[#b39274] hover:text-white hover:border-[#b39274] transition-all duration-300 block">前往官網對照</a>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#2d2621] selection:bg-[#b39274] selection:text-white">
      {checkoutStep === 2 && latestOrder && (
        <section className="bg-white border-b border-[#e6dfd5] py-10 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
            <div>
              <Badge className="bg-[#b39274] text-white rounded-none mb-4">代購申請完成</Badge>
              <h1 className="text-3xl md:text-5xl font-serif font-light mb-4">代購申請已送出！</h1>
              <p className="text-sm text-[#70635c] leading-relaxed mb-6">訂單編號：<strong className="text-[#2d2621]">{latestOrder.id}</strong>。請完成匯款後加入官方 LINE 回報，客服會依回報資訊核對款項並安排代購。</p>
              <div className="bg-[#faf8f5] border border-[#b39274]/40 p-6 mb-6">
                <h2 className="font-serif text-xl mb-3">匯款後請依規定回報</h2>
                <p className="text-sm text-[#70635c] leading-relaxed">請加官方 LINE，並回報：<strong>手機號碼、匯款日期、匯款帳號末五碼</strong>。為避免誤會，本頁不顯示 QR Code，請直接點擊下方綠色按鈕跳轉官方 LINE。</p>
              </div>
              <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-[#06c755] text-white px-8 py-4 text-sm font-sans tracking-wider hover:bg-[#05b44c] transition-colors"><MessageCircle className="w-5 h-5 mr-2" />加入官方 LINE 回報匯款</a>
            </div>
            <div className="bg-[#2d2621] text-white p-6">
              <h3 className="font-serif text-xl mb-4">申請摘要</h3>
              <div className="space-y-3 text-xs text-stone-300">{latestOrder.items.map((item) => <div key={item.cartId} className="flex justify-between gap-3 border-b border-white/10 pb-3"><span>{item.name_zh} × {item.quantity}</span><span>{formatNtd(item.customer_price_ntd * item.quantity)}</span></div>)}</div>
              <div className="flex justify-between pt-4 mt-4 border-t border-white/20"><span>合計</span><strong>{formatNtd(latestOrder.total)}</strong></div>
            </div>
          </div>
        </section>
      )}

      <div className="relative bg-cover bg-center py-4 px-4 text-center border-b border-[#e6dfd5]" style={{ backgroundImage: `linear-gradient(rgba(250, 248, 245, 0.9), rgba(250, 248, 245, 0.9)), url(${ANNOUNCEMENT_BG})` }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-3"><Badge className="bg-[#b39274] text-white hover:bg-[#b39274]/90 px-3 py-1 font-sans text-xs tracking-wider">100% 跨境全包承諾</Badge><p className="text-xs md:text-sm font-medium tracking-wide text-[#4a3e3d] leading-relaxed">本站所有顯示價格已包含國際直郵、進口手續費與代購費；送出代購申請後才會顯示匯款與回報方式。</p></div>
      </div>

      <header className="sticky top-0 z-40 bg-[#faf8f5]/90 backdrop-blur-md border-b border-[#e6dfd5]/60 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <button onClick={() => scrollTo("top")} className="flex flex-col text-left"><span className="font-serif text-2xl md:text-3xl tracking-[0.2em] font-light uppercase text-[#2d2621]">Dear José</span><span className="text-[9px] tracking-[0.3em] uppercase text-[#b39274] font-sans -mt-0.5">Taiwan Select Shop</span></button>
          <nav className="hidden md:flex items-center gap-7 font-sans text-xs uppercase tracking-[0.15em] font-medium"><a href="#catalog" className="hover:text-[#b39274]">商品目錄</a><a href="#kol-picks" className="hover:text-[#b39274]">KOL 主推款</a><a href="#order-lookup" className="hover:text-[#b39274]">訂單查詢</a><a href="#service" className="hover:text-[#b39274]">服務承諾</a></nav>
          <div className="flex items-center gap-3"><Button onClick={() => setCartOpen(true)} className="bg-[#2d2621] text-white hover:bg-[#b39274] rounded-none px-4 py-5 text-xs tracking-[0.15em]"><ShoppingBag className="w-4 h-4 mr-2" />{cartCount}</Button><button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-[#2d2621] hover:text-[#b39274]">{mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button></div>
        </div>
        {mobileMenuOpen && <div className="md:hidden bg-[#faf8f5] border-b border-[#e6dfd5] px-6 py-6 flex flex-col gap-4"><a href="#catalog" onClick={() => setMobileMenuOpen(false)} className="font-sans text-sm uppercase tracking-wider py-2 border-b border-[#e6dfd5]/40">商品目錄</a><a href="#kol-picks" onClick={() => setMobileMenuOpen(false)} className="font-sans text-sm uppercase tracking-wider py-2 border-b border-[#e6dfd5]/40">KOL 主推款</a><a href="#order-lookup" onClick={() => setMobileMenuOpen(false)} className="font-sans text-sm uppercase tracking-wider py-2">訂單查詢</a></div>}
      </header>

      <section id="top" className="relative h-[65vh] md:h-[80vh] flex items-center overflow-hidden"><div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105" style={{ backgroundImage: `url(${HERO_BG})` }} /><div className="absolute inset-0 bg-gradient-to-r from-[#2d2621]/70 via-[#2d2621]/40 to-transparent" /><div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 text-white"><div className="max-w-2xl"><span className="font-sans text-xs uppercase tracking-[0.3em] font-medium text-[#f0e1dc] mb-4 block">Romantic Provencal Breeze</span><h1 className="text-4xl md:text-6xl font-light leading-tight mb-6 tracking-wide font-serif">南法微風中的<br />浪漫優雅與現代摩登</h1><p className="font-sans text-sm md:text-base text-stone-200 font-light leading-relaxed mb-8 tracking-wide">先收藏主推款，再送出代購申請；確認申請後才進入匯款回報流程，讓客人更清楚每一步。</p><div className="flex flex-wrap gap-4"><Button onClick={() => scrollTo("catalog")} className="bg-white text-[#2d2621] hover:bg-[#f0e1dc] rounded-none px-8 py-6 text-xs uppercase tracking-[0.15em]">立即探索商品</Button><Button onClick={() => scrollTo("order-lookup")} className="bg-transparent border border-white text-white hover:bg-white hover:text-[#2d2621] rounded-none px-8 py-6 text-xs uppercase tracking-[0.15em]">訂單查詢</Button></div></div></div></section>

      <section id="story" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center"><div className="lg:col-span-5 relative"><div className="aspect-square overflow-hidden rounded-none border border-[#e6dfd5] p-2 bg-white"><img src={BRAND_STORY_IMG} alt="Dear José Brand Aesthetic" className="w-full h-full object-cover" /></div></div><div className="lg:col-span-7"><span className="font-sans text-xs uppercase tracking-[0.2em] text-[#b39274] mb-2 block font-semibold">Brand Story & Concept</span><h2 className="text-3xl md:text-4xl font-light tracking-wide mb-6 font-serif">源自浪漫詩意的優雅美學</h2><p className="font-sans text-sm text-[#70635c] font-light leading-relaxed mb-8">Dear José 是充滿法式浪漫與熱帶風情的女裝品牌。我們在台灣建立專屬買手直郵通道，讓商品瀏覽、代購申請、匯款回報與訂單查詢集中在同一個網站完成。</p><div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[#e6dfd5]"><div><div className="flex items-center gap-2 text-[#b39274]"><Globe className="w-5 h-5" /><span className="font-sans text-xs uppercase tracking-wider font-bold">全包同步</span></div><p className="text-xs text-[#70635c] mt-2 leading-relaxed">展示到手價，降低詢問成本。</p></div><div><div className="flex items-center gap-2 text-[#b39274]"><TrendingUp className="w-5 h-5" /><span className="font-sans text-xs uppercase tracking-wider font-bold">主推導購</span></div><p className="text-xs text-[#70635c] mt-2 leading-relaxed">KOL 主推款集中曝光。</p></div><div><div className="flex items-center gap-2 text-[#b39274]"><CheckCircle2 className="w-5 h-5" /><span className="font-sans text-xs uppercase tracking-wider font-bold">清楚回報</span></div><p className="text-xs text-[#70635c] mt-2 leading-relaxed">送出申請後才提示匯款回報資訊。</p></div></div></div></div></section>

      <section id="kol-picks" className="py-20 bg-white border-y border-[#e6dfd5]"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"><div><span className="font-sans text-xs uppercase tracking-[0.2em] text-[#b39274] mb-2 block font-semibold">KOL Recommended</span><h2 className="text-3xl md:text-5xl font-light tracking-wide font-serif">KOL 主推款</h2></div><p className="max-w-xl text-sm text-[#70635c] leading-relaxed">為社群推廣預留的主推區塊。若 Google Sheets 新增 <strong>Is_KOL_Pick</strong> 欄位並填 true，網站會優先抓取；未填時會以精選商品自動補足。</p></div>{loading ? <div className="py-16 text-center text-[#70635c]">載入主推款中...</div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">{kolProducts.map((p) => <ProductCard key={`kol-${p.display_seq}`} p={p} compact />)}</div>}</div></section>

      <section id="order-lookup" className="py-20 bg-[#faf8f5] border-b border-[#e6dfd5]"><div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"><div className="bg-white border border-[#e6dfd5] p-8 md:p-10"><div className="flex items-start gap-4 mb-6"><History className="w-7 h-7 text-[#b39274]" /><div><span className="font-sans text-xs uppercase tracking-[0.2em] text-[#b39274] block font-semibold">Order Lookup</span><h2 className="text-3xl md:text-4xl font-serif font-light mt-2">訂單查詢</h2><p className="text-sm text-[#70635c] mt-3 leading-relaxed">客人可回到首頁輸入下單手機，查詢此網站送出的代購申請紀錄。</p></div></div><div className="flex flex-col sm:flex-row gap-3"><input value={orderLookupPhone} onChange={(e) => setOrderLookupPhone(e.target.value)} placeholder="請輸入下單手機" className="flex-1 bg-[#faf8f5] border border-[#e6dfd5] px-4 py-3 text-sm focus:outline-none focus:border-[#b39274]" /><Button onClick={lookupOrders} className="bg-[#2d2621] hover:bg-[#b39274] text-white rounded-none px-8 py-6">查詢紀錄</Button></div>{lookupMessage && <p className="text-sm text-[#70635c] mt-4">{lookupMessage}</p>}{lookupResults.length > 0 && <div className="mt-6 space-y-4">{lookupResults.map((order) => <div key={order.id} className="border border-[#e6dfd5] p-5"><div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-3"><strong>{order.id}</strong><span className="text-sm text-[#70635c]">{new Date(order.createdAt).toLocaleString("zh-TW")}</span></div><p className="text-sm text-[#70635c] mb-2">{order.status}</p><div className="text-xs text-[#70635c]">{order.items.map((item) => `${item.name_zh} × ${item.quantity}`).join("、")}</div><div className="text-right font-bold text-[#b39274] mt-3">{formatNtd(order.total)}</div></div>)}</div>}</div></div></section>

      <section id="catalog" className="py-20 bg-[#faf8f5] border-t border-[#e6dfd5]/60"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center max-w-3xl mx-auto mb-16"><span className="font-sans text-xs uppercase tracking-[0.2em] text-[#b39274] mb-2 block font-semibold">The Collection Catalog</span><h2 className="text-3xl md:text-5xl font-light tracking-wide mb-4 font-serif">全站商品精選目錄</h2><div className="w-16 h-[1px] bg-[#b39274] mx-auto my-6" /><p className="font-sans text-sm text-[#70635c] font-light leading-relaxed">商品卡已加入文字說明、衣長尺寸提醒與洗滌方式，讓服飾類商品在導購時更清楚。</p></div><div className="bg-white border border-[#e6dfd5] p-6 mb-10 flex flex-col md:flex-row gap-6 items-center justify-between shadow-sm"><div className="relative w-full md:max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#70635c]" /><input type="text" placeholder="搜尋英文或中文商品名稱..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#faf8f5] border border-[#e6dfd5] py-2.5 pl-10 pr-4 text-xs font-sans tracking-wider rounded-none focus:outline-none focus:border-[#b39274]" /></div><div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-start md:justify-end"><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={filterNew} onChange={(e) => setFilterNew(e.target.checked)} />新品</label><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={filterSale} onChange={(e) => setFilterSale(e.target.checked)} />折扣</label><span className="text-xs text-[#70635c]">已篩選出 <strong className="text-[#b39274]">{filteredProducts.length}</strong> 件商品</span></div></div><div className="flex justify-center mb-12"><Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full"><TabsList className="w-full flex flex-wrap justify-center gap-2 bg-transparent h-auto p-0">{categories.map((cat) => <TabsTrigger key={cat} value={cat} className={`px-5 py-2.5 text-xs uppercase tracking-[0.15em] font-sans font-medium rounded-none border ${activeCategory === cat ? "bg-[#b39274] text-white border-[#b39274]" : "bg-white text-[#70635c] border-[#e6dfd5] hover:border-[#b39274]"}`}>{cat === "All" ? "全部商品" : cat}</TabsTrigger>)}</TabsList></Tabs></div>{error && <div className="mb-10 bg-white border border-[#b39274]/30 p-5 text-sm text-[#70635c]">{error}</div>}{loading ? <div className="text-center py-32 bg-white border border-[#e6dfd5]"><Loader2 className="w-10 h-10 text-[#b39274] animate-spin mb-4 mx-auto" /><p className="text-[#70635c] text-sm">正在載入商品...</p></div> : filteredProducts.length === 0 ? <div className="text-center py-20 bg-white border border-[#e6dfd5]"><ShoppingBag className="w-12 h-12 text-[#b39274]/40 mx-auto mb-4" /><p className="font-serif italic text-lg text-[#70635c]">沒有找到符合條件的商品</p></div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">{filteredProducts.map((p) => <ProductCard key={p.display_seq} p={p} />)}</div>}</div></section>

      <section id="service" className="py-20 md:py-28 bg-[#faf8f5] border-t border-[#e6dfd5]"><div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center mb-16"><span className="font-sans text-xs uppercase tracking-[0.2em] text-[#b39274] mb-2 block font-semibold">Our Commitments</span><h2 className="text-3xl md:text-4xl font-light tracking-wide mb-4 font-serif">跨境代購服務與保障</h2><div className="w-12 h-[1px] bg-[#b39274] mx-auto my-4" /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-10">{["全包透明標價：顯示價格即到手估算價，送出代購申請後再依客服確認完成付款。","正品與品質保證：由買手於官方通路採購，出貨前協助檢查。","極速直郵配送：確認款項與採購後安排國際配送並提供追蹤資訊。","專業客服諮詢：可回報身形資訊，協助判斷尺寸、衣長與版型。"].map((text) => <div key={text} className="bg-white p-8 border border-[#e6dfd5] flex gap-4"><CheckCircle2 className="w-6 h-6 text-[#b39274] shrink-0" /><p className="text-xs text-[#70635c] leading-relaxed">{text}</p></div>)}</div></div></section>

      <footer className="bg-[#2d2621] text-white py-12 border-t border-[#e6dfd5]/10"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b border-white/10 pb-8 mb-8"><div className="flex flex-col"><span className="font-serif text-xl tracking-[0.2em] font-light uppercase">Dear José</span><span className="text-[8px] tracking-[0.3em] uppercase text-[#b39274] font-sans -mt-0.5">Taiwan Select Shop</span></div><div className="text-center text-xs text-stone-400 font-sans">本站為獨立買手代購服務，非 Dear José 官方直營網站。</div><div className="text-right text-xs text-[#b39274] font-sans font-medium"><a href="#order-lookup">訂單查詢</a> · <a href="#kol-picks">KOL 主推款</a></div></div><div className="text-center text-[10px] text-stone-500 font-sans tracking-wider">© 2026 Dear José Taiwan Select. All Rights Reserved.</div></div></footer>

      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={() => setCartOpen(false)}>
          <div className="w-full max-w-lg bg-[#faf8f5] h-full overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[#faf8f5] border-b border-[#e6dfd5] p-5 flex justify-between items-center"><h2 className="font-serif text-2xl">代購車</h2><button onClick={() => setCartOpen(false)}><X /></button></div>
            <div className="p-5 space-y-4">{cart.length === 0 ? <p className="text-sm text-[#70635c] py-12 text-center">目前代購車是空的。</p> : cart.map((item) => <div key={item.cartId} className="bg-white border border-[#e6dfd5] p-4 flex gap-4"><img src={item.image_url} alt={item.name_zh} className="w-20 h-24 object-cover" /><div className="flex-1"><h3 className="font-serif text-sm">{item.name_zh}</h3><p className="text-xs text-[#70635c] mt-1">尺寸：{item.selectedSize}</p><p className="text-sm text-[#b39274] font-bold mt-2">{item.customer_price_display}</p><div className="flex items-center gap-3 mt-3"><button onClick={() => updateQuantity(item.cartId, -1)} className="border p-1"><Minus className="w-3 h-3" /></button><span className="text-sm">{item.quantity}</span><button onClick={() => updateQuantity(item.cartId, 1)} className="border p-1"><Plus className="w-3 h-3" /></button><button onClick={() => removeFromCart(item.cartId)} className="ml-auto text-[#a34e36]"><Trash2 className="w-4 h-4" /></button></div></div></div>)}</div>
            {cart.length > 0 && <div className="p-5 border-t border-[#e6dfd5] bg-white"><div className="flex justify-between mb-4"><span>合計</span><strong className="text-[#b39274]">{formatNtd(cartTotal)}</strong></div><Button onClick={() => { setCartOpen(false); setCheckoutStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="w-full bg-[#2d2621] hover:bg-[#b39274] text-white rounded-none py-6">前往結帳頁面</Button></div>}
          </div>
        </div>
      )}

      {checkoutStep === 1 && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto bg-[#faf8f5] border border-[#e6dfd5]">
            <div className="p-6 border-b border-[#e6dfd5] flex justify-between items-center"><div><Badge className="bg-[#b39274] text-white rounded-none mb-2">Checkout Step 1</Badge><h2 className="font-serif text-3xl">確認代購申請資料</h2></div><button onClick={() => setCheckoutStep(0)}><X /></button></div>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-8 p-6">
              <div className="space-y-4"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="姓名" className="w-full border border-[#e6dfd5] bg-white px-4 py-3" /><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="手機" className="w-full border border-[#e6dfd5] bg-white px-4 py-3" /><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email（選填）" className="w-full border border-[#e6dfd5] bg-white px-4 py-3" /><textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="收件地址" className="w-full border border-[#e6dfd5] bg-white px-4 py-3 min-h-24" /><textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="備註：可填身高、體重、平常尺寸、想確認的衣長或尺寸問題" className="w-full border border-[#e6dfd5] bg-white px-4 py-3 min-h-24" /><div className="bg-white border border-[#e6dfd5] p-5"><h3 className="font-serif text-xl mb-2">付款方式：銀行轉帳</h3><p className="text-sm text-[#70635c] leading-relaxed">送出代購申請後才會顯示匯款與回報方式。本頁不提供帳戶資料，避免誤會此刻就需要付款。</p></div></div>
              <div className="bg-white border border-[#e6dfd5] p-5 h-fit"><h3 className="font-serif text-xl mb-4">訂單摘要</h3><div className="space-y-3 text-sm">{cart.map((item) => <div key={item.cartId} className="flex justify-between gap-3 border-b border-[#e6dfd5] pb-3"><span>{item.name_zh} × {item.quantity}</span><span>{formatNtd(item.customer_price_ntd * item.quantity)}</span></div>)}</div><div className="flex justify-between font-bold text-[#b39274] mt-5 pt-4 border-t border-[#e6dfd5]"><span>合計</span><span>{formatNtd(cartTotal)}</span></div><Button onClick={submitOrder} className="w-full mt-6 bg-[#2d2621] hover:bg-[#b39274] text-white rounded-none py-6"><Send className="w-4 h-4 mr-2" />送出代購申請</Button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
