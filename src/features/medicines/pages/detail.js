import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../shared/components/layout/Header";
import Footer from "../../../shared/components/layout/Footer";
import { useCart } from "../../../app/contexts/CartContext";
import { requireAuthOrRedirect, getUserId } from "../../../shared/utils/auth";
import * as productApi from "../api/productApi";
import * as reviewApi from "../api/reviewApi";
import ConfirmIncreaseDialog from "../../cart/components/ConfirmIncreaseDialog";
import ReviewCard from "../components/ReviewCard";
import { PriceDisplay } from "../components/MedicineCard";
import PageTransition from "../../../shared/components/ui/PageTransition";
import { getAccessToken } from "../../../shared/utils/auth";
import useNotificationAction from "../../../shared/hooks/useNotificationAction";
import { useCampaign } from "../../../shared/hooks/useCampaign";
import { getCampaignPresentation } from "../../../shared/utils/discountUi";
import "../../../app/styles/storefront-premium.css";

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
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAddQty, setPendingAddQty] = useState(0);
  const [activeTab, setActiveTab] = useState("benefit");
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reviewSummary, setReviewSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: {},
  });
  const [reviews, setReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState(0);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    content: "",
  });
  const [reviewImages, setReviewImages] = useState([]);
  const { upsertItem, refreshCart } = useCart();
  const { notifyAfterSuccess } = useNotificationAction();
  const { activeCampaign } = useCampaign({ refreshIntervalMs: 180000 });
  const currentPath = `/medicines/${idOrSlug}`;
  const [existingQtyForPending, setExistingQtyForPending] = useState(0);
  const [actionMessage, setActionMessage] = useState("");

  const handleAddToCart = async () => {
    const token = getAccessToken();
    const userId = getUserId();

    if (!token || !userId) {
      setActionMessage("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      requireAuthOrRedirect(navigate, currentPath);
      return;
    }

    if (!product?.id) {
      setActionMessage("Không tìm thấy productId để thêm vào giỏ hàng.");
      return;
    }

    try {
      setActionMessage("");

      await notifyAfterSuccess({
        action: async () => {
          await upsertItem(product.id, quantity);
          await refreshCart();
        },
        notificationPayload: {
          category: "CART",
          title: "Thêm ảnh công",
          message: `Bạn đã thêm ${product.name} vào giỏ hàng`,
          sourceType: "PRODUCT",
          sourceId: String(product.id),
          sourceEventType: "CART_ITEM_ADDED",
          actionUrl: "/cart",
        },
        options: {
          silent: false,
          errorMessage: "Failed to create notification after add to cart:",
        },
      });

      setActionMessage("Đã thêm vào giỏ hàng.");
    } catch (err) {
      console.error("[AddToCart] failed", err);
      setActionMessage(err?.message || "Không thể thêm vào giỏ hàng");
    }
  };

  const handleBuyNow = async () => {
    const allowed = requireAuthOrRedirect(navigate, currentPath);
    if (!allowed) return;
    try {
      await notifyAfterSuccess({
        action: async () => {
          await upsertItem(product.id, quantity);
          await refreshCart();
        },
        notificationPayload: {
          category: "CART",
          title: "Thêm ảnh công",
          message: `Bạn đã thêm ${product.name} vào giỏ hàng`,
          sourceType: "PRODUCT",
          sourceId: String(product.id),
          sourceEventType: "CART_ITEM_ADDED",
          actionUrl: "/checkout",
        },
        options: {
          silent: false,
          errorMessage: "Failed to create notification after buy now:",
        },
      });
      navigate("/checkout");
    } catch (err) {
      console.error("Buy now failed", err);
      setActionMessage(err?.message || "Không thể mua ngay");
    }
  };

  const handleConfirmIncrease = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        setShowConfirm(false);
        requireAuthOrRedirect(navigate, currentPath);
        return;
      }
      const newQty = (existingQtyForPending || 0) + (pendingAddQty || 1);
      await notifyAfterSuccess({
        action: async () => {
          await upsertItem(product.id, newQty);
          await refreshCart();
        },
        notificationPayload: {
          category: "CART",
          title: "Cập nhật giỏ hàng thành công",
          message: `Số lượng ${product.name} đã được cập nhật trong giỏ hàng`,
          sourceType: "PRODUCT",
          sourceId: String(product.id),
          sourceEventType: "CART_ITEM_ADDED",
          actionUrl: "/cart",
        },
        options: {
          silent: false,
          errorMessage:
            "Failed to create notification after cart quantity update:",
        },
      });
      setActionMessage("Số lượng đã được cập nhật trong giỏ hàng.");
    } catch (err) {
      console.error("Confirm increase failed", err);
      setActionMessage(err?.message || "Không thể cập nhật giỏ hàng");
    } finally {
      setShowConfirm(false);
      setPendingAddQty(0);
      setExistingQtyForPending(0);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const payload = await productApi.getProductBySlug(idOrSlug);
        if (!isMounted) return;

        const attrs = parseAttributes(payload.attributes);
        const images = resolveGallery(attrs, payload.imageUrl || fallbackImage);

        setProduct(payload);
        setAttributes(attrs);
        setGallery(images);
        setActiveImage(0);

        // Load related products
        try {
          const listPayload = await productApi.getProducts({
            size: 12,
            sort: "name,asc",
          });
          if (isMounted) {
            const items = (listPayload.content || []).filter(
              (item) => item.id !== payload.id,
            );
            const sameCategory = items.filter(
              (item) =>
                item.categoryId && item.categoryId === payload.categoryId,
            );
            const picks = (sameCategory.length ? sameCategory : items).slice(
              0,
              4,
            );
            setRelated(picks);
          }
        } catch (err) {
          console.warn("Could not load related products", err);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Không thể tải chi tiết sản phẩm");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [idOrSlug]);

  useEffect(() => {
    if (!product?.id) return;
    let active = true;

    const loadSummary = async () => {
      try {
        const payload = await reviewApi.getProductReviewSummary(product.id);
        if (!active) return;
        setReviewSummary({
          averageRating: payload.averageRating || 0,
          totalReviews: payload.totalReviews || 0,
          ratingCounts: payload.ratingCounts || {},
        });
      } catch (err) {
        if (active) setReviewError(err.message || "Không thể tải đánh giá");
      }
    };

    loadSummary();
    return () => {
      active = false;
    };
  }, [product?.id]);

  useEffect(() => {
    if (!product?.id) return;
    let active = true;

    const loadReviews = async () => {
      setReviewLoading(true);
      setReviewError("");
      try {
        const payload = await reviewApi.listProductReviews(product.id, {
          page: reviewPage,
          size: 10,
        });
        if (!active) return;
        setReviews(payload.content || []);
        setReviewTotalPages(payload.totalPages || 1);
      } catch (err) {
        if (active) setReviewError(err.message || "Không thể tải đánh giá");
      } finally {
        if (active) setReviewLoading(false);
      }
    };

    loadReviews();
    return () => {
      active = false;
    };
  }, [product?.id, reviewPage]);

  const handleSubmitReview = async () => {
    const token = getAccessToken();
    const userId = getUserId();
    if (!token || !userId) {
      requireAuthOrRedirect(navigate, currentPath);
      return;
    }
    if (!product?.id) return;
    if (!reviewForm.content.trim()) {
      setReviewError("Vui lòng nhập nội dung đánh giá");
      return;
    }

    setReviewLoading(true);
    setReviewError("");
    try {
      let uploadedImages = [];
      if (reviewImages.length) {
        const uploadResult = await reviewApi.uploadReviewImages(reviewImages);
        uploadedImages = (uploadResult.items || []).map((item) => ({
          url: item.presignedUrl || item.url || "",
          bucket: item.bucket || null,
          key: item.key || null,
        }));
      }
      await reviewApi.createReview({
        productId: product.id,
        userId,
        rating: reviewForm.rating,
        title: reviewForm.title.trim() || null,
        content: reviewForm.content.trim(),
        images: uploadedImages,
      });
      setReviewForm({ rating: 5, title: "", content: "" });
      setReviewImages([]);
      setReviewPage(0);
      const summary = await reviewApi.getProductReviewSummary(product.id);
      setReviewSummary({
        averageRating: summary.averageRating || 0,
        totalReviews: summary.totalReviews || 0,
        ratingCounts: summary.ratingCounts || {},
      });
      const pagePayload = await reviewApi.listProductReviews(product.id, {
        page: 0,
        size: 10,
      });
      setReviews(pagePayload.content || []);
      setReviewTotalPages(pagePayload.totalPages || 1);
    } catch (err) {
      setReviewError(err.message || "Không thể gửi đánh giá");
    } finally {
      setReviewLoading(false);
    }
  };

  const renderStars = (value) => {
    const stars = [];
    const filled = Math.round(value);
    for (let i = 1; i <= 5; i += 1) {
      stars.push(
        <span
          key={`star-${i}`}
          className={`material-symbols-outlined text-[18px] ${
            i <= filled ? "text-amber-400" : "text-slate-300"
          }`}
        >
          star
        </span>,
      );
    }
    return stars;
  };

  const handleSelectReviewImages = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setReviewImages((prev) => [...prev, ...files]);
    event.target.value = "";
  };

  const handleRemoveReviewImage = (index) => {
    setReviewImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const productPriceLabel = useMemo(() => {
    if (!product) return "";
    return formatPrice(product.price);
  }, [product]);

  const productOriginalPriceLabel = useMemo(() => {
    if (!product) return "";
    const raw =
      product.oldPrice ?? product.originalPrice ?? attributes.oldPrice;
    if (raw === null || raw === undefined || raw === "") return "";
    return formatPrice(raw);
  }, [product, attributes.oldPrice]);

  const campaignPresentation = useMemo(
    () => getCampaignPresentation(activeCampaign),
    [activeCampaign],
  );

  const dosageFormText =
    product?.dosageForm || attributes.dosageForm || attributes.form;
  const packagingText =
    product?.packaging || attributes.packaging || attributes.packing;
  const activeIngredientText =
    product?.activeIngredient || attributes.activeIngredient || attributes.ingredient;
  const indicationsText =
    product?.indications || attributes.indications || attributes.usage;
  const usageDosageText =
    product?.usageDosage || attributes.usageDosage || attributes.dosage;
  const contraindicationsWarningText =
    product?.contraindicationsWarning ||
    attributes.contraindicationsWarning ||
    attributes.warning ||
    attributes.contraindications;
  const otherInformationText =
    product?.otherInformation || attributes.otherInformation || attributes.extraInfo;

  return (
    <PageTransition className="storefront-shell min-h-screen font-display flex flex-col text-slate-900 antialiased">
      <Header />

      <main className="storefront-container flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 mb-4">
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
            {product?.name || "Chi tiết sản phẩm"}
          </span>
        </div>

        {/* Loading / Error / Empty */}
        {loading ? (
          <div className="py-16 text-center text-slate-500">Đang tải...</div>
        ) : error ? (
          <div className="py-16 text-center text-red-500">{error}</div>
        ) : !product ? (
          <div className="py-16 text-center text-slate-500">
            Không tìm thấy sản phẩm.
          </div>
        ) : (
          <>
            <div className="storefront-hero storefront-fade-up grid grid-cols-1 gap-12 mb-16 rounded-[36px] border border-white/70 p-5 sm:p-8 lg:grid-cols-12 lg:p-10">
              <div className="lg:col-span-5 space-y-4">
                <div className="storefront-card aspect-square rounded-[30px] overflow-hidden group relative p-3">
                  <div
                    className="storefront-float w-full h-full bg-center bg-no-repeat bg-contain"
                    style={{
                      backgroundImage: `url(${gallery[activeImage] || fallbackImage})`,
                    }}
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {gallery.slice(0, 4).map((item, index) => (
                    <button
                      key={`${item}-${index}`}
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
                  {product.description || indicationsText || attributes.shortDescription || ""}
                </p>

                <div className="storefront-card rounded-[30px] mb-8 p-6">
                  <PriceDisplay
                    size="detail"
                    price={productPriceLabel}
                    originalPrice={productOriginalPriceLabel}
                    unitLabel={attributes.unitLabel}
                    showSavings
                  />

                  {campaignPresentation ? (
                    <div className="mt-5 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 p-4 shadow-sm dark:border-amber-400/20 dark:from-amber-500/10 dark:via-orange-500/10 dark:to-rose-500/10">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white dark:bg-white dark:text-slate-900">
                          {campaignPresentation.badge}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {campaignPresentation.headline}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-300">
                            {campaignPresentation.detail}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

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
                        <p className="font-semibold text-sm">
                          {dosageFormText || "Chưa cập nhật"}
                        </p>
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
                        <p className="font-semibold text-sm">
                          {packagingText || "Chưa cập nhật"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">
                        science
                      </span>
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">
                          Thêm ảnh
                        </p>
                        <p className="font-semibold text-sm">
                          {activeIngredientText || "Chưa cập nhật"}
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

                  <button
                    className="flex-1 h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                    onClick={handleAddToCart}
                    type="button"
                  >
                    <span className="material-symbols-outlined">
                      add_shopping_cart
                    </span>
                    Thêm vào giỏ
                  </button>

                  <button
                    className="flex-1 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-all"
                    onClick={handleBuyNow}
                    type="button"
                  >
                    Mua ngay
                  </button>
                </div>
                {actionMessage ? (
                  <p className="text-sm text-primary mt-3">{actionMessage}</p>
                ) : null}

                <ConfirmIncreaseDialog
                  open={showConfirm}
                  onOpenChange={(val) => setShowConfirm(val)}
                  productName={product?.name}
                  onConfirm={handleConfirmIncrease}
                  onCancel={() => setShowConfirm(false)}
                />

                <div className="storefront-soft-card rounded-[28px] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
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

            {/* Tabs */}
            <div className="mt-12">
              <div className="storefront-card rounded-[30px] p-4 sm:p-6">
              <div className="border-b border-slate-200 flex flex-wrap gap-8 mb-8 overflow-x-auto whitespace-nowrap">
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

              <div className="prose prose-slate max-w-none space-y-6">
                {activeTab === "benefit" ? (
                  <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                      <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
                        Công dụng &amp; Chỉ định
                      </h3>
                      <p className="whitespace-pre-line leading-8 text-slate-700">
                        {indicationsText || "Thêm ảnhật."}
                      </p>
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
                    <p className="whitespace-pre-line leading-8 text-slate-700">
                      {usageDosageText ||
                        "Vui lòng tham khảo hướng dẫn sử dụng trên bao bì hoặc hỏi dược sĩ."}
                    </p>
                  </section>
                ) : null}

                {activeTab === "warning" ? (
                  <section>
                    <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
                      Chống chỉ định &amp; Cảnh báo
                    </h3>
                    <p className="whitespace-pre-line leading-8 text-slate-700">
                      {contraindicationsWarningText || "Thêm ảnhật."}
                    </p>
                  </section>
                ) : null}

                {activeTab === "extra" ? (
                  <section>
                    <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
                      Thông tin khác
                    </h3>
                    <p className="whitespace-pre-line leading-8 text-slate-700">
                      {otherInformationText || "Thêm ảnhật."}
                    </p>
                  </section>
                ) : null}
              </div>
              </div>
            </div>

            {/* Related */}
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
                          {item.attributes?.categoryLabel || "Sản phẩm"}
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

            {/* Reviews */}
            <div className="mt-20">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Đánh giá sản phẩm
                  </h2>
                  <p className="text-sm text-slate-500">
                    {reviewSummary.totalReviews || 0} đánh giá
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-black text-amber-500">
                    {Number(reviewSummary.averageRating || 0).toFixed(1)}
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(reviewSummary.averageRating || 0)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    Gửi đánh giá của bạn
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={`rate-${star}`}
                        type="button"
                        onClick={() =>
                          setReviewForm((prev) => ({ ...prev, rating: star }))
                        }
                        className="focus:outline-none"
                      >
                        <span
                          className={`material-symbols-outlined text-[22px] ${
                            star <= reviewForm.rating
                              ? "text-amber-400"
                              : "text-slate-300"
                          }`}
                        >
                          star
                        </span>
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={reviewForm.title}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Tiêu đề (tùy chọn)"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm mb-3
                             dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  <textarea
                    rows={4}
                    value={reviewForm.content}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    placeholder="Chia sẻ cảm nhận của bạn..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm
                             dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  {reviewError ? (
                    <p className="mt-2 text-xs text-rose-500">{reviewError}</p>
                  ) : null}
                  {reviewImages.length ? (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {reviewImages.map((file, idx) => (
                        <div
                          key={`${file.name}-${idx}`}
                          className="relative h-20 w-full overflow-hidden rounded-lg border border-slate-200"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveReviewImage(idx)}
                            className="absolute right-1 top-1 rounded-full bg-white/80 p-1 text-slate-700 hover:bg-white"
                            aria-label="Xóa ảnh"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              close
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <label className="mt-3 inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    <span className="material-symbols-outlined text-[16px]">
                      add_photo_alternate
                    </span>
                    Thêm ảnh
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleSelectReviewImages}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleSubmitReview}
                    disabled={reviewLoading}
                    className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white
                             hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {reviewLoading ? "Đang gửi..." : "Gửi đánh giá"}
                  </button>
                </div>

                <div className="lg:col-span-7">
                  {reviewLoading && !reviews.length ? (
                    <div className="text-sm text-slate-500">
                      Đang tải đánh giá...
                    </div>
                  ) : reviews.length ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <ReviewCard
                          key={review.id}
                          review={review}
                          renderStars={renderStars}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500">
                      Chưa có đánh giá nào.
                    </div>
                  )}

                  {reviewTotalPages > 1 ? (
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setReviewPage((prev) => Math.max(0, prev - 1))
                        }
                        disabled={reviewPage === 0}
                        className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600
                                 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
                      >
                        Trước
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setReviewPage((prev) =>
                            Math.min(reviewTotalPages - 1, prev + 1),
                          )
                        }
                        disabled={reviewPage + 1 >= reviewTotalPages}
                        className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600
                                 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
                      >
                        Sau
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </PageTransition>
  );
};

export default ProductDetailPage;
