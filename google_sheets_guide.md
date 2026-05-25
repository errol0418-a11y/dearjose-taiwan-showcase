# 📊 Dear José 雲端自動選品系統：Google Sheets 連動操作指南

本系統已成功升級為**「Google Sheets 動態連動版本」**。您未來只需要在 Google 試算表中新增商品或修改價格，網頁在消費者打開時便會**自動加載最新數據**，並在前端依據核心財務公式自動精算台幣售價。

---

## 🛠️ 第一步：在 Google Sheets 建立欄位

請在您的 Google 試算表中，將**第一行（Header）**嚴格設定為以下欄位名稱（大小寫均可相容）：

| 欄位名稱 (Headers) | 說明 | 填寫範例 |
| :--- | :--- | :--- |
| **`Title_EN`** | 商品英文全名（顯示於卡片主標題） | `Love In Peace Mini Dress` |
| **`Title_ZH`** | 商品中文譯名（顯示於英文名下方） | `經典浪漫蕾絲迷你洋裝` |
| **`Category`** | 商品分類（系統會依此自動將商品歸類） | `Dresses`、`Tops`、`Bottoms`、`Outerwear` |
| **`Price_VND`** | 原始越南盾價格（純數字，不含逗號與貨幣符號） | `2600000` |
| **`Image_URL`** | 商品主圖片雲端網址 | `https://images.unsplash.com/...` |
| **`Is_New_Arrival`** | 是否為新品（填 `TRUE` 會在卡片右上角亮起香檳金 **New** 標籤） | `TRUE` 或 `FALSE` |
| **`Is_Sale`** | 是否為折扣品（填 `TRUE` 會亮起復古紅 **Sale** 標籤） | `TRUE` 或 `FALSE` |

> 💡 **自動分類提示**：網頁會自動讀取 `Category` 欄位。只要您填入 `Dresses`，該商品就會自動出現在網頁的 "Dresses" 分類頁籤中，不需修改任何代碼！

---

## 🌐 第二步：發布 Google Sheets 並取得 CSV 網址

為了讓網頁能讀取您的試算表，請按照以下步驟將其發布：

1. 打開您的 Google 試算表，點擊左上角的 **「檔案 (File)」** ➔ **「共用 (Share)」** ➔ **「發布到網路 (Publish to web)」**。
2. 在彈出的視窗中：
   * 將第一個下拉選單（預設為「整份文件」）保持不變，或選擇您放商品的特定工作表。
   * 將第二個下拉選單（預設為「網頁」）改選為 **「逗號分隔值 (.csv)」**。
3. 點擊 **「發布 (Publish)」** 按鈕並確認。
4. 複製系統產生的那一串 **`https://docs.google.com/spreadsheets/d/e/.../pub?output=csv`** 網址。

---

## ✍️ 第三步：將網址貼入網頁代碼中

您的專屬 CSV 網址需要貼在網頁原始碼的指定位置：

* **檔案路徑**：`client/src/pages/Home.tsx`
* **修改位置**：**第 23 行**
* **代碼片段**：
  ```typescript
  // ⚠️ 在這裡貼上您的 Google Sheets 釋出的 CSV 網址 ⚠️
  // 您的 Google 試算表需要發布為網頁，並選擇「逗號分隔值 (.csv)」格式，將其網址複製並貼在下方：
  const GOOGLE_SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/您的專屬ID/pub?output=csv";
  ```

---

## 🧮 前端自動財務精算機制

本系統已將您的核心財務公式寫死在前端瀏覽器渲染邏輯中。當消費者打開網頁時，系統會自動進行以下運算，完全不洩漏內部匯率：

$$\text{台灣售價 (NT\$)} = \text{無條件進位到個位數} \left( \frac{\text{原始 VND}}{800} \times 1.4 \right)$$

### 📊 精算範例對照表：
* **洋裝**：官網 ₫2,600,000 ➔ 實際成本 NT$3,250 ➔ 1.4 倍售價 ➔ **NT$4,550** (與官網 VND 並列顯示)
* **上衣**：官網 ₫1,850,000 ➔ 實際成本 NT$2,312.5 ➔ 1.4 倍售價 ➔ **NT$3,240** (個位數無條件進位，與官網 VND 並列顯示)
