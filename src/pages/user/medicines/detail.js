import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

const fallbackImage =
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=700&q=80";

const formatPrice = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")} đ`;

const parseAttributes = (value) => {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const resolveGallery = (attrs, imageUrl) => {
  const gallery = Array.isArray(attrs.gallery) ? attrs.gallery : [];
  const images = [imageUrl, ...gallery].filter(Boolean);
  return images.length ? images : [fallbackImage];
};

const ProductDetailPage = () => {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [attributes, setAttributes] = useState({});
  const [gallery, setGallery] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("benefit");
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/api/catalog/public/products/${idOrSlug}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error("Không thể tải chi tiết sản phẩm");
        }
        const payload = await response.json();
        const attrs = parseAttributes(payload.attributes);
        const images = resolveGallery(attrs, payload.imageUrl || fallbackImage);
        if (!controller.signal.aborted) {
          setProduct(payload);
          setAttributes(attrs);
          setGallery(images);
          setActiveImage(0);
        }

        const listResponse = await fetch(
          "/api/catalog/public/products?size=12&sort=name,asc",
          { signal: controller.signal },
        );
        if (listResponse.ok) {
          const listPayload = await listResponse.json();
          const items = (listPayload.content || []).filter(
            (item) => item.id !== payload.id,
          );
          const sameCategory = items.filter(
            (item) => item.categoryId && item.categoryId === payload.categoryId,
          );
          const picks = (sameCategory.length ? sameCategory : items).slice(
            0,
            4,
          );
          setRelated(picks);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Không thể tải chi tiết sản phẩm");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => controller.abort();
  }, [idOrSlug]);

  const priceLabel = useMemo(() => {
    if (!product) return "";
    return formatPrice(product.price);
  }, [product]);

  const categoryLabel = attributes.categoryLabel || "Sản phẩm";
  const dosageForm =
    attributes.dosageForm || attributes.form || "Chưa cập nhật";
  const packing = attributes.packing || attributes.packaging || "Chưa cập nhật";
  const ingredient = attributes.ingredient || attributes.activeIngredient || "";
  const usage = attributes.usage || attributes.indications || "";
  const warning = attributes.warning || attributes.contraindications || "";
  const extraInfo = attributes.extraInfo || "";

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-display flex flex-col text-slate-900 dark:text-slate-100 antialiased">
      <Header />
      <main className="max-w-7xl mx-auto px-4 md:px-10 py-6 w-full flex-grow">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary mb-6"
        >
          <span className="material-symbols-outlined text-[20px]">
            arrow_back
          </span>
          Quay lại
        </button>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            Đang tải chi tiết sản phẩm...
          </div>
        ) : null}
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {product ? (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-8 text-sm">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-slate-500 hover:text-primary transition-colors font-medium"
              >
                Trang chủ
              </button>
              <span className="text-slate-300">/</span>
              <button
                type="button"
                onClick={() => navigate("/medicines")}
                className="text-slate-500 hover:text-primary transition-colors font-medium"
              >
                Danh mục
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 dark:text-slate-100 font-semibold">
                {product.name}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
              <div className="lg:col-span-5 space-y-4">
                <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 group relative">
                  <div
                    className="w-full h-full bg-center bg-no-repeat bg-contain"
                    style={{
                      backgroundImage: `url(${gallery[activeImage] || fallbackImage})`,
                    }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {gallery.slice(0, 4).map((item, index) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={`aspect-square border rounded-lg overflow-hidden p-1 ${
                        index === activeImage
                          ? "border-primary border-2"
                          : "border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div
                        className="w-full h-full bg-center bg-cover rounded-md"
                        style={{ backgroundImage: `url(${item})` }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {product.prescriptionRequired ? "Thuốc kê đơn" : "OTC"}
                  </span>
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <span className="material-symbols-outlined text-[18px]">
                      check_circle
                    </span>
                    Còn hàng
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">
                  {product.name}
                </h1>
                <p className="text-slate-500 mb-6 text-lg">
                  {product.description || attributes.shortDescription || ""}
                </p>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl mb-8 border border-slate-100 dark:border-slate-800">
                  <div className="text-3xl font-black text-primary mb-1">
                    {priceLabel}
                    {attributes.unitLabel ? (
                      <span className="text-sm font-normal text-slate-500">
                        {` / ${attributes.unitLabel}`}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-400 mb-6 font-medium italic">
                    *Giá có thể thay đổi tùy vào thời điểm và chương trình
                    khuyến mãi.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">
                        pill
                      </span>
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">
                          Dạng bào chế
                        </p>
                        <p className="font-semibold text-sm">{dosageForm}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">
                        package_2
                      </span>
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">
                          Quy cách
                        </p>
                        <p className="font-semibold text-sm">{packing}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">
                        science
                      </span>
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">
                          Thành phần chính
                        </p>
                        <p className="font-semibold text-sm">
                          {ingredient || "Chưa cập nhật"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl px-2 h-14 bg-white dark:bg-slate-900">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((prev) => Math.max(1, prev - 1))
                      }
                      className="p-2 text-slate-500 hover:text-primary"
                    >
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <input
                      className="w-12 text-center border-none focus:ring-0 bg-transparent font-bold"
                      readOnly
                      type="text"
                      value={quantity}
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => prev + 1)}
                      className="p-2 text-slate-500 hover:text-primary"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                  <button className="flex-1 h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined">
                      add_shopping_cart
                    </span>
                    Thêm vào giỏ
                  </button>
                  <button className="flex-1 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-all">
                    Mua ngay
                  </button>
                </div>

                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-4">
                    <div className="size-14 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-3xl">
                        medical_services
                      </span>
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-white">
                        Bạn đang dùng thuốc khác?
                      </p>
                      <p className="text-sm text-slate-500">
                        Hãy tham vấn dược sĩ để đảm bảo an toàn.
                      </p>
                    </div>
                  </div>
                  <button className="w-full md:w-auto px-8 py-3 bg-white dark:bg-slate-800 text-primary border border-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-all">
                    Hỏi dược sĩ
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <div className="border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-8 mb-8 overflow-x-auto whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => setActiveTab("benefit")}
                  className={`pb-4 font-semibold border-b-2 ${
                    activeTab === "benefit"
                      ? "text-primary border-primary"
                      : "text-slate-500 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Công dụng
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("usage")}
                  className={`pb-4 font-semibold border-b-2 ${
                    activeTab === "usage"
                      ? "text-primary border-primary"
                      : "text-slate-500 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Cách dùng &amp; Liều dùng
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("warning")}
                  className={`pb-4 font-semibold border-b-2 ${
                    activeTab === "warning"
                      ? "text-primary border-primary"
                      : "text-slate-500 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Chống chỉ định &amp; Cảnh báo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("extra")}
                  className={`pb-4 font-semibold border-b-2 ${
                    activeTab === "extra"
                      ? "text-primary border-primary"
                      : "text-slate-500 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Thông tin khác
                </button>
              </div>
              <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                {activeTab === "benefit" ? (
                  <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                      <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
                        Công dụng &amp; Chỉ định
                      </h3>
                      {usage ? (
                        <p>{usage}</p>
                      ) : (
                        <p>Thông tin đang được cập nhật.</p>
                      )}
                    </div>
                    <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 h-fit">
                      <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined">
                          lightbulb
                        </span>
                        Lời khuyên
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {attributes.tip ||
                          "Nên tham khảo hướng dẫn sử dụng và tư vấn chuyên môn trước khi dùng."}
                      </p>
                    </div>
                  </section>
                ) : null}
                {activeTab === "usage" ? (
                  <section>
                    <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
                      Cách dùng &amp; Liều dùng
                    </h3>
                    <p>
                      {attributes.dosage ||
                        "Vui lòng tham khảo hướng dẫn sử dụng trên bao bì hoặc hỏi dược sĩ."}
                    </p>
                  </section>
                ) : null}
                {activeTab === "warning" ? (
                  <section>
                    <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
                      Chống chỉ định &amp; Cảnh báo
                    </h3>
                    <p>{warning || "Thông tin đang được cập nhật."}</p>
                  </section>
                ) : null}
                {activeTab === "extra" ? (
                  <section>
                    <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
                      Thông tin khác
                    </h3>
                    <p>{extraInfo || "Thông tin đang được cập nhật."}</p>
                  </section>
                ) : null}
              </div>
            </div>

            {related.length ? (
              <div className="mt-20">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Sản phẩm liên quan
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {related.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        navigate(`/medicines/${item.slug || item.id}`)
                      }
                      className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300 text-left"
                    >
                      <div className="aspect-square bg-slate-50 dark:bg-slate-800 relative overflow-hidden">
                        <div
                          className="w-full h-full bg-center bg-no-repeat bg-contain p-6"
                          style={{
                            backgroundImage: `url(${item.imageUrl || fallbackImage})`,
                          }}
                        />
                        <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                          {item.prescriptionRequired ? "Rx" : "OTC"}
                        </span>
                      </div>
                      <div className="p-5">
                        <p className="text-xs text-slate-500 font-bold mb-1">
                          {categoryLabel}
                        </p>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-primary font-black text-lg">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
