import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import ContentToolbar from "../../components/content/ContentToolbar";
import ContentTable from "../../components/content/ContentTable";
import ContentQuickDraft from "../../components/content/ContentQuickDraft";
import ContentStats from "../../components/content/ContentStats";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../shared/components/ui/dialog";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import FigureImage from "../../../content/editor/tiptap/FigureImage";
import {
  approveModeration,
  createPost,
  deletePost,
  getAdminPostBySlug,
  getAdminPosts,
  getAdminQuestions,
  getTags,
  hideModeration,
  publishPost,
  rejectModeration,
  updatePost,
  unpublishPost,
  uploadMediaImage,
  generateProductPrDraft,
  createTag,
} from "../../../content/api/contentApi";
import {
  fetchMediaImageAsDataUrl,
  fileToDataUrl,
  resolveHtmlImagesToDataUrls,
  resolveJsonImagesToDataUrls,
} from "../../../../shared/utils/media";
import {
  listCatalogCategories,
  listCatalogProducts,
} from "../../api/adminInventoryApi";

const resolveImagesToBase64 = async (images = []) => {
  if (!images.length) return [];
  const results = [];
  for (let index = 0; index < images.length; index += 1) {
    const item = images[index];
    if (!item?.url) continue;
    let base64Url = item.url;
    try {
      base64Url = await fetchMediaImageAsDataUrl(item.url);
    } catch (err) {
      base64Url = item.url;
    }
    results.push({
      ...item,
      url: base64Url,
      position: Number.isFinite(item.position) ? item.position : index,
    });
  }
  return results;
};

const parseProductAttributes = (value) => {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const normalizeCatalogProduct = (product, categoryMap) => {
  const attrs = parseProductAttributes(product?.attributes);
  return {
    id: product?.id,
    name: product?.name || "",
    categoryName:
      product?.categoryName || categoryMap.get(product?.categoryId) || "",
    shortDescription:
      product?.shortDescription || product?.description || attrs.shortDescription || "",
    dosageForm: product?.dosageForm || attrs.dosageForm || attrs.form || "",
    packaging: product?.packaging || attrs.packaging || attrs.packing || "",
    activeIngredient:
      product?.activeIngredient || attrs.activeIngredient || attrs.ingredient || "",
    indications: product?.indications || attrs.indications || attrs.usage || "",
    usageDosage: product?.usageDosage || attrs.usageDosage || attrs.dosage || "",
    contraindicationsWarning:
      product?.contraindicationsWarning ||
      attrs.contraindicationsWarning ||
      attrs.warning ||
      attrs.contraindications ||
      "",
    otherInformation:
      product?.otherInformation || attrs.otherInformation || attrs.extraInfo || "",
    prescriptionRequired: !!product?.prescriptionRequired,
    salePrice:
      product?.effectivePrice ?? product?.baseSalePrice ?? product?.salePrice ?? 0,
    coverImageUrl:
      product?.imageUrl || attrs.imageUrl || attrs.image || attrs.images?.[0] || "",
  };
};

const slugifyTag = (value) =>
  (value || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const mapAiDraftToSeed = (draft, product) => ({
  seedId: `content-${product?.id || "manual"}-${Date.now()}`,
  selectedProductId: product?.id || "",
  sourceProductName: product?.name || "",
  title: draft?.title || "",
  excerpt: draft?.excerpt || "",
  caption: draft?.caption || "",
  contentHtml: draft?.contentHtml || "",
  tags: draft?.suggestedTags || [],
  disclaimer: draft?.disclaimer || "",
  coverImageUrl: product?.coverImageUrl || "",
});

const AdminContentPage = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [postsPagination, setPostsPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState("");
  const [postsRefresh, setPostsRefresh] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [questionsPagination, setQuestionsPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState("");
  const [questionsRefresh, setQuestionsRefresh] = useState(0);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [author, setAuthor] = useState("all");
  const [fullEditorOpen, setFullEditorOpen] = useState(false);
  const [fullTitle, setFullTitle] = useState("");
  const [fullPostId, setFullPostId] = useState(null);
  const [fullSaving, setFullSaving] = useState(false);
  const [fullError, setFullError] = useState("");
  const [fullInitialHtml, setFullInitialHtml] = useState("");
  const [fullInitialJson, setFullInitialJson] = useState(null);
  const [fullImages, setFullImages] = useState([]);
  const [fullUploading, setFullUploading] = useState(false);
  const [fullUploadError, setFullUploadError] = useState("");
  const [fullAlbumId, setFullAlbumId] = useState(null);
  const [fullCoverImageUrl, setFullCoverImageUrl] = useState("");
  const [fullCoverPreviewUrl, setFullCoverPreviewUrl] = useState("");
  const [fullCoverUploading, setFullCoverUploading] = useState(false);
  const [fullCoverError, setFullCoverError] = useState("");
  const [fullExcerpt, setFullExcerpt] = useState("");
  const [fullCaption, setFullCaption] = useState("");
  const [fullTags, setFullTags] = useState([]);
  const [fullDisclaimer, setFullDisclaimer] = useState("");
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [quickDraftSeed, setQuickDraftSeed] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewPost, setPreviewPost] = useState(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const fullFileInputRef = useRef(null);
  const fullCoverInputRef = useRef(null);

  const fullEditor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      FigureImage,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Placeholder.configure({
        placeholder: "Soạn thảo nội dung đầy đủ...",
      }),
    ],
    content: "",
  });

  const currentHeading = () => {
    if (fullEditor?.isActive("heading", { level: 1 })) return "h1";
    if (fullEditor?.isActive("heading", { level: 2 })) return "h2";
    if (fullEditor?.isActive("heading", { level: 3 })) return "h3";
    return "paragraph";
  };

  const setHeading = (value) => {
    if (!fullEditor) return;
    if (value === "paragraph") {
      fullEditor.chain().focus().setParagraph().run();
      return;
    }
    const level = Number(value.replace("h", ""));
    fullEditor.chain().focus().toggleHeading({ level }).run();
  };

  const handleLink = () => {
    if (!fullEditor) return;
    const previousUrl = fullEditor.getAttributes("link").href;
    const url = window.prompt("Nhập URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      fullEditor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    fullEditor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  const handleInsertImage = () => {
    if (!fullEditor) return;
    fullFileInputRef.current?.click();
  };

  const handleFullImageSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !fullEditor) return;
    setFullUploading(true);
    setFullUploadError("");
    try {
      const localPreview = await fileToDataUrl(file);
      const { albumId, url } = await uploadMediaImage(file, fullAlbumId);
      if (!url) throw new Error("Không thể tải ảnh lên.");
      if (albumId) setFullAlbumId(albumId);
      const altText = window.prompt("Mô tả hình ảnh", "") || "";
      let displayUrl = localPreview || url;
      if (!localPreview) {
        try {
          displayUrl = await fetchMediaImageAsDataUrl(url);
        } catch (err) {
          displayUrl = url;
        }
      }
      const captionText = altText.trim();
      fullEditor
        .chain()
        .focus()
        .insertFigureImage({
          src: displayUrl,
          alt: altText,
          caption: captionText,
        })
        .run();
      setFullImages((prev) => [
        ...prev,
        { url, altText, position: prev.length },
      ]);
    } catch (err) {
      setFullUploadError(err?.message || "Không thể tải ảnh.");
    } finally {
      setFullUploading(false);
    }
  };

  const handleCoverPick = () => {
    fullCoverInputRef.current?.click();
  };

  const handleCoverSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setFullCoverUploading(true);
    setFullCoverError("");
    try {
      const localPreview = await fileToDataUrl(file);
      const { url } = await uploadMediaImage(file, fullAlbumId);
      if (!url) throw new Error("Không thể tải ảnh bìa.");
      let displayUrl = localPreview || url;
      if (!localPreview) {
        try {
          displayUrl = await fetchMediaImageAsDataUrl(url);
        } catch (err) {
          displayUrl = url;
        }
      }
      setFullCoverImageUrl(displayUrl);
      setFullCoverPreviewUrl(displayUrl);
    } catch (err) {
      setFullCoverError(err?.message || "Không thể tải ảnh bìa.");
    } finally {
      setFullCoverUploading(false);
    }
  };

  const formatDate = (value) =>
    value ? new Date(value).toLocaleString("vi-VN") : "";

  const toInitials = (name) => {
    if (!name) return "AD";
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  };

  const mapStatus = (statusValue) => {
    switch ((statusValue || "").toUpperCase()) {
      case "PUBLISHED":
        return "published";
      case "DRAFT":
        return "draft";
      case "PENDING":
        return "pending";
      case "REJECTED":
        return "rejected";
      case "HIDDEN":
        return "hidden";
      case "ARCHIVED":
        return "archived";
      default:
        return "draft";
    }
  };

  useEffect(() => {
    let active = true;

    const loadCatalogProducts = async () => {
      try {
        const [productData, categoryData] = await Promise.all([
          listCatalogProducts({ page: 0, pageSize: 100 }),
          listCatalogCategories(),
        ]);
        if (!active) return;
        const categoryMap = new Map(
          (Array.isArray(categoryData) ? categoryData : []).map((item) => [
            item.id,
            item.name,
          ]),
        );
        const items = productData?.items || productData?.content || [];
        setCatalogProducts(
          items.map((product) => normalizeCatalogProduct(product, categoryMap)),
        );
      } catch (err) {
        console.warn("Không thể tải danh sách sản phẩm cho AI content", err);
      }
    };

    loadCatalogProducts();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const draft = location.state?.contentDraft;
    if (!draft) return;
    setActiveTab("posts");
    setQuickDraftSeed({
      ...draft,
      seedId: draft.seedId || `route-${Date.now()}`,
    });
    navigate(location.pathname + location.search, {
      replace: true,
      state: null,
    });
  }, [location.pathname, location.search, location.state, navigate]);

  useEffect(() => {
    if (activeTab !== "posts") return;
    const loadPosts = async () => {
      setPostsLoading(true);
      setPostsError("");
      try {
        const params = {
          page: postsPagination.page,
          pageSize: postsPagination.pageSize,
          sortBy: "publishedAt",
          sortDir: "desc",
        };
        if (query.trim()) params.q = query.trim();
        if (status !== "all") params.status = status;
        const data = await getAdminPosts(params);
        setPosts(data.items || []);
        setPostsPagination(
          data.pagination || { page: 1, pageSize: 10, total: 0 },
        );
      } catch (err) {
        setPostsError(err.message || "KhÃ´ng thá»ƒ táº£i bÃ i viáº¿t");
      } finally {
        setPostsLoading(false);
      }
    };
    loadPosts();
  }, [
    activeTab,
    query,
    status,
    postsPagination.page,
    postsPagination.pageSize,
    postsRefresh,
  ]);

  useEffect(() => {
    if (activeTab === "questions" && status !== "all") {
      setStatus("all");
    }
  }, [activeTab, status]);

  useEffect(() => {
    if (activeTab !== "questions") return;
    const loadQuestions = async () => {
      setQuestionsLoading(true);
      setQuestionsError("");
      try {
        const params = {
          page: questionsPagination.page,
          pageSize: questionsPagination.pageSize,
          sortBy: "createdAt",
          sortDir: "desc",
        };
        if (query.trim()) params.q = query.trim();
        const data = await getAdminQuestions(params);
        setQuestions(data.items || []);
        setQuestionsPagination(
          data.pagination || { page: 1, pageSize: 10, total: 0 },
        );
      } catch (err) {
        setQuestionsError(err.message || "Không thể tải câu hỏi");
      } finally {
        setQuestionsLoading(false);
      }
    };
    loadQuestions();
  }, [
    activeTab,
    query,
    questionsPagination.page,
    questionsPagination.pageSize,
    questionsRefresh,
  ]);

  const postRows = useMemo(() => {
    const authorFilter = author === "all" ? "" : author.toLowerCase();
    return posts
      .filter((post) => {
        if (!authorFilter) return true;
        return post.author?.displayName?.toLowerCase().includes(authorFilter);
      })
      .map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        category: post.tags?.[0]?.name || "Bài viết",
        readTime: post.readingMinutes ? `${post.readingMinutes} phút đọc` : "—",
        status: mapStatus(post.moderationStatus),
        author: post.author?.displayName || "Hệ thống",
        authorInitials: toInitials(post.author?.displayName || "AD"),
        updatedAt: formatDate(post.publishedAt),
        thumbnail:
          post.coverImageUrl || "https://placehold.co/160x120/png?text=Post",
        raw: post,
      }));
  }, [posts, author]);

  const stats = useMemo(() => {
    const published = posts.filter(
      (p) => (p.moderationStatus || "").toUpperCase() === "PUBLISHED",
    ).length;
    const pending = posts.filter(
      (p) => (p.moderationStatus || "").toUpperCase() === "PENDING",
    ).length;
    const draft = posts.filter(
      (p) => (p.moderationStatus || "").toUpperCase() === "DRAFT",
    ).length;
    return { published, pending, draft };
  }, [posts]);

  const handlePreview = async (item) => {
    if (!item?.slug) {
      alert(`Xem trước: ${item?.title || "Bài viết"}`);
      return;
    }

    try {
      setPreviewOpen(true);
      setPreviewLoading(true);
      setPreviewError("");
      setPreviewPost(null);
      setPreviewHtml("");

      const data = await getAdminPostBySlug(item.slug);
      const resolvedHtml = await resolveHtmlImagesToDataUrls(
        data?.contentHtml || "",
      ).catch(() => data?.contentHtml || "");

      setPreviewPost(data || null);
      setPreviewHtml(resolvedHtml || data?.contentHtml || "");
    } catch (err) {
      setPreviewError(err.message || "Không thể tải preview bài viết.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleEdit = async (item) => {
    if (!item?.slug) {
      alert("Không tìm thấy bài viết để chỉnh sửa.");
      return;
    }
    try {
      const data = await getAdminPostBySlug(item.slug);
      setFullEditorOpen(true);
      setFullError("");
      setFullPostId(data?.id || null);
      setFullTitle(data?.title || "");
      setFullInitialHtml(data?.contentHtml || "");
      setFullInitialJson(data?.contentJson || null);
      setFullExcerpt(data?.excerpt || "");
      setFullCaption(data?.excerpt || "");
      setFullDisclaimer(data?.disclaimer || "");
      setFullTags((data?.tags || []).map((tag) => tag?.name).filter(Boolean));
      setFullImages(data?.images || []);
      setFullCoverImageUrl(data?.coverImageUrl || "");
      setFullCoverPreviewUrl(data?.coverImageUrl || "");
    } catch (err) {
      alert(err.message || "Không thể tải bài viết.");
    }
  };

  const handleDelete = async (item) => {
    if (!item?.id) return;
    const confirmDelete = window.confirm(
      "Xóa bài viết này vĩnh viễn? Hành động không thể hoàn tác.",
    );
    if (!confirmDelete) return;
    try {
      await deletePost(item.id);
      setPostsRefresh((v) => v + 1);
    } catch (err) {
      alert(err.message || "Không thể xóa bài viết");
    }
  };

  const handleTogglePublish = async (item) => {
    try {
      if (item.status === "published") {
        await unpublishPost(item.id);
      } else {
        await publishPost(item.id);
      }
      setPostsRefresh((v) => v + 1);
    } catch (err) {
      alert(err.message || "Không thể cập nhật trạng thái bài viết");
    }
  };

  const ensurePostTags = async (tags = []) => {
    const candidates = (Array.isArray(tags) ? tags : [])
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);

    if (!candidates.length) {
      return [];
    }

    const existing = await getTags({ type: "POST" });
    const bySlug = new Map(
      (Array.isArray(existing) ? existing : []).map((tag) => [
        (tag.slug || "").trim().toLowerCase(),
        tag,
      ]),
    );
    const byName = new Map(
      (Array.isArray(existing) ? existing : []).map((tag) => [
        (tag.name || "").trim().toLowerCase(),
        tag,
      ]),
    );

    const resolved = [];
    for (const rawTag of candidates) {
      const name = rawTag.trim();
      const slug = slugifyTag(name);
      if (!slug) {
        continue;
      }

      const reused = bySlug.get(slug) || byName.get(name.toLowerCase());
      if (reused?.slug) {
        resolved.push(reused.slug);
        continue;
      }

      try {
        const created = await createTag({
          name,
          slug,
          type: "POST",
        });
        if (created?.slug) {
          bySlug.set(created.slug.trim().toLowerCase(), created);
          byName.set((created.name || name).trim().toLowerCase(), created);
          resolved.push(created.slug);
        }
      } catch (error) {
        const refreshed = await getTags({ type: "POST", q: name });
        const fallback = (Array.isArray(refreshed) ? refreshed : []).find(
          (tag) =>
            (tag.slug || "").trim().toLowerCase() === slug ||
            (tag.name || "").trim().toLowerCase() === name.toLowerCase(),
        );
        if (fallback?.slug) {
          resolved.push(fallback.slug);
        }
      }
    }

    return [...new Set(resolved)];
  };

  const handleSaveDraft = async ({
    title,
    excerpt,
    caption,
    disclaimer,
    tags,
    contentHtml,
    contentJson,
    images,
    coverImageUrl,
  }) => {
    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề");
      return;
    }
    try {
      const resolvedHtml = await resolveHtmlImagesToDataUrls(contentHtml || "");
      const resolvedJson = await resolveJsonImagesToDataUrls(
        contentJson || null,
      );
      const resolvedImages = await resolveImagesToBase64(images || []);
      const resolvedTags = await ensurePostTags(tags);
      await createPost({
        title: title.trim(),
        excerpt: (caption || excerpt || "").trim() || null,
        disclaimer: disclaimer?.trim() || null,
        contentHtml: resolvedHtml,
        contentJson: resolvedJson,
        images: resolvedImages,
        coverImageUrl: coverImageUrl || null,
        tags: resolvedTags,
      });
      setPostsPagination((p) => ({ ...p, page: 1 }));
      setActiveTab("posts");
      setPostsRefresh((v) => v + 1);
    } catch (err) {
      alert(err.message || "Không thể lưu nháp");
    }
  };

  const openFullEditor = ({
    title,
    excerpt,
    caption,
    disclaimer,
    tags,
    contentHtml,
    contentJson,
    images,
    coverImageUrl,
  }) => {
    setFullEditorOpen(true);
    setFullError("");
    setFullPostId(null);
    setFullTitle(title || "");
    setFullExcerpt(excerpt || "");
    setFullCaption(caption || "");
    setFullDisclaimer(disclaimer || "");
    setFullTags(Array.isArray(tags) ? tags : []);
    setFullInitialHtml(contentHtml || "");
    setFullInitialJson(contentJson || null);
    setFullImages(images || []);
    setFullCoverImageUrl(coverImageUrl || "");
    setFullCoverPreviewUrl(coverImageUrl || "");
  };

  useEffect(() => {
    if (!fullEditor || !fullEditorOpen) return;
    let active = true;

    const loadContent = async () => {
      if (fullInitialJson) {
        const resolvedJson = await resolveJsonImagesToDataUrls(fullInitialJson);
        if (!active) return;
        fullEditor.commands.setContent(resolvedJson);
        return;
      }
      if (fullInitialHtml) {
        const resolvedHtml = await resolveHtmlImagesToDataUrls(fullInitialHtml);
        if (!active) return;
        fullEditor.commands.setContent(resolvedHtml, false);
        return;
      }
      fullEditor.commands.setContent("");
    };

    loadContent();
    return () => {
      active = false;
    };
  }, [fullEditor, fullEditorOpen, fullInitialHtml, fullInitialJson]);

  const saveFullDraft = async () => {
    if (!fullTitle.trim()) {
      setFullError("Vui lòng nhập tiêu đề.");
      return null;
    }
    const contentHtml = fullEditor?.getHTML() || "";
    const contentJson = fullEditor?.getJSON() || null;
    setFullSaving(true);
    setFullError("");
    try {
      const resolvedHtml = await resolveHtmlImagesToDataUrls(contentHtml);
      const resolvedJson = await resolveJsonImagesToDataUrls(contentJson);
      const resolvedImages = await resolveImagesToBase64(fullImages || []);
      const resolvedTags = await ensurePostTags(fullTags);
      const payload = {
        title: fullTitle.trim(),
        excerpt: (fullCaption || fullExcerpt || "").trim() || null,
        disclaimer: fullDisclaimer?.trim() || null,
        contentHtml: resolvedHtml,
        contentJson: resolvedJson,
        images: resolvedImages,
        coverImageUrl: fullCoverImageUrl || null,
        tags: resolvedTags,
      };
      if (fullPostId) {
        await updatePost(fullPostId, payload);
        return fullPostId;
      }
      const created = await createPost(payload);
      const createdId = created?.id || null;
      setFullPostId(createdId);
      setPostsRefresh((v) => v + 1);
      return createdId;
    } catch (err) {
      setFullError(err.message || "Không thể lưu nháp.");
      return null;
    } finally {
      setFullSaving(false);
    }
  };

  const publishFullPost = async () => {
    const savedId = await saveFullDraft();
    const targetId = savedId || fullPostId;
    if (!targetId) return;
    try {
      await publishPost(targetId);
      setPostsRefresh((v) => v + 1);
      setFullEditorOpen(false);
    } catch (err) {
      setFullError(err.message || "Không thể xuất bản.");
    }
  };

  const handleGenerateAiDraft = async (productId) => {
    const product = catalogProducts.find(
      (item) => String(item.id) === String(productId),
    );
    if (!product) {
      throw new Error("Không tìm thấy sản phẩm để AI viết bài.");
    }

    const draft = await generateProductPrDraft({
      name: product.name,
      categoryName: product.categoryName,
      shortDescription: product.shortDescription,
      dosageForm: product.dosageForm,
      packaging: product.packaging,
      activeIngredient: product.activeIngredient,
      indications: product.indications,
      usageDosage: product.usageDosage,
      contraindicationsWarning: product.contraindicationsWarning,
      otherInformation: product.otherInformation,
      prescriptionRequired: product.prescriptionRequired,
      salePrice: product.salePrice,
      toneHint: "tinh tế, đáng tin cậy, không lộ quảng cáo",
      campaignGoal: "tạo bản nháp bài PR để admin review trước khi xuất bản",
    });

    const nextSeed = mapAiDraftToSeed(draft, product);
    setQuickDraftSeed(nextSeed);
    return nextSeed;
  };

  const handleModerateQuestion = async (action, question) => {
    const targetType = "THREAD";
    if (!question?.id) return;
    try {
      if (action === "approve") {
        await approveModeration(targetType, question.id);
      } else if (action === "reject") {
        const reason = window.prompt(
          "Lý do từ chối:",
          "Nội dung không phù hợp",
        );
        if (!reason) return;
        await rejectModeration(targetType, question.id, reason);
      } else if (action === "hide") {
        const reason = window.prompt("Lý do ẩn:", "Nội dung không phù hợp");
        if (!reason) return;
        await hideModeration(targetType, question.id, reason);
      }
      setQuestionsRefresh((v) => v + 1);
    } catch (err) {
      alert(err.message || "Không thể cập nhật câu hỏi");
    }
  };

  return (
    <AdminLayout activeKey="content">
      <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-text-main dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                  Quản lý nội dung
                </h1>
                <p className="text-text-secondary dark:text-gray-400 text-base font-normal max-w-2xl">
                  Quản lý bài viết sức khỏe, banner quảng cáo và các trang thông
                  tin tĩnh trên website nhà thuốc.
                </p>
              </div>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-[#e7edf3] dark:border-gray-800 overflow-hidden">
              <div className="border-b border-[#e7edf3] dark:border-gray-700 px-6">
                <div className="flex gap-8 overflow-x-auto">
                  <button
                    className={`flex items-center justify-center border-b-[3px] py-4 px-2 transition-colors whitespace-nowrap ${
                      activeTab === "posts"
                        ? "border-primary text-primary"
                        : "border-transparent text-text-secondary dark:text-gray-400 hover:text-primary"
                    }`}
                    type="button"
                    onClick={() => setActiveTab("posts")}
                  >
                    <p className="text-sm font-bold tracking-[0.015em]">
                      Bài viết
                    </p>
                  </button>
                  <button
                    className={`flex items-center justify-center border-b-[3px] py-4 px-2 transition-colors whitespace-nowrap ${
                      activeTab === "questions"
                        ? "border-primary text-primary"
                        : "border-transparent text-text-secondary dark:text-gray-400 hover:text-primary"
                    }`}
                    type="button"
                    onClick={() => setActiveTab("questions")}
                  >
                    <p className="text-sm font-bold tracking-[0.015em]">
                      Câu hỏi
                    </p>
                  </button>
                </div>
              </div>

              <ContentToolbar
                query={query}
                status={status}
                author={author}
                onQueryChange={setQuery}
                onStatusChange={setStatus}
                onAuthorChange={setAuthor}
              />

              {activeTab === "posts" ? (
                <>
                  {postsError && (
                    <div className="px-6 py-3 text-sm text-rose-500">
                      {postsError}
                    </div>
                  )}
                  {postsLoading ? (
                    <div className="px-6 py-6 text-sm text-text-secondary">
                      Đang tải bài viết...
                    </div>
                  ) : (
                    <ContentTable
                      articles={postRows}
                      onPreview={handlePreview}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onTogglePublish={handleTogglePublish}
                    />
                  )}
                </>
              ) : (
                <div className="overflow-x-auto">
                  {questionsError && (
                    <div className="px-6 py-3 text-sm text-rose-500">
                      {questionsError}
                    </div>
                  )}
                  {questionsLoading ? (
                    <div className="px-6 py-6 text-sm text-text-secondary">
                      Đang tải câu hỏi...
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/80 dark:bg-gray-800/80 border-y border-gray-200 dark:border-gray-700">
                          <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary dark:text-gray-400">
                            Câu hỏi
                          </th>
                          <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary dark:text-gray-400">
                            Người hỏi
                          </th>
                          <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary dark:text-gray-400">
                            Trạng thái
                          </th>
                          <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary dark:text-gray-400 text-right">
                            Hành động
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-surface-light dark:bg-surface-dark">
                        {questions.map((q) => (
                          <tr
                            key={q.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <td className="py-4 px-6">
                              <p className="text-sm font-semibold text-text-main dark:text-white">
                                {q.title}
                              </p>
                              <p className="text-xs text-text-secondary dark:text-gray-400 mt-1">
                                {formatDate(q.createdAt)} · {q.answerCount} trả
                                lời
                              </p>
                            </td>
                            <td className="py-4 px-6">
                              <p className="text-sm text-text-main dark:text-gray-300">
                                {q.asker?.displayName || "Ẩn danh"}
                              </p>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-xs font-semibold text-text-secondary dark:text-gray-400">
                                {q.moderationStatus}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {q.moderationStatus === "PENDING" && (
                                  <button
                                    type="button"
                                    className="px-3 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-600"
                                    onClick={() =>
                                      handleModerateQuestion("approve", q)
                                    }
                                  >
                                    Duyệt
                                  </button>
                                )}
                                {q.moderationStatus === "PENDING" && (
                                  <button
                                    type="button"
                                    className="px-3 py-1 text-xs font-semibold rounded-md bg-rose-50 text-rose-600"
                                    onClick={() =>
                                      handleModerateQuestion("reject", q)
                                    }
                                  >
                                    Từ chối
                                  </button>
                                )}
                                {q.moderationStatus === "PUBLISHED" && (
                                  <button
                                    type="button"
                                    className="px-3 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-600"
                                    onClick={() =>
                                      handleModerateQuestion("hide", q)
                                    }
                                  >
                                    Ẩn
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                <p className="text-sm text-text-secondary dark:text-gray-400">
                  Hiển thị{" "}
                  <span className="font-medium text-text-main dark:text-white">
                    {activeTab === "posts"
                      ? postsPagination.page
                      : questionsPagination.page}
                  </span>{" "}
                  đến
                  <span className="font-medium text-text-main dark:text-white">
                    {" "}
                    {activeTab === "posts" ? postRows.length : questions.length}
                  </span>{" "}
                  trong số
                  <span className="font-medium text-text-main dark:text-white">
                    {" "}
                    {activeTab === "posts"
                      ? postsPagination.total
                      : questionsPagination.total}
                  </span>{" "}
                  kết quả
                </p>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 text-sm font-medium rounded-md border border-gray-200 dark:border-gray-700 text-text-secondary dark:text-gray-400 disabled:opacity-50"
                    type="button"
                    disabled={
                      (activeTab === "posts"
                        ? postsPagination.page
                        : questionsPagination.page) <= 1
                    }
                    onClick={() =>
                      activeTab === "posts"
                        ? setPostsPagination((p) => ({
                            ...p,
                            page: Math.max(1, p.page - 1),
                          }))
                        : setQuestionsPagination((p) => ({
                            ...p,
                            page: Math.max(1, p.page - 1),
                          }))
                    }
                  >
                    Trước
                  </button>
                  <button
                    className="px-3 py-1 text-sm font-medium rounded-md bg-primary text-white"
                    type="button"
                  >
                    {activeTab === "posts"
                      ? postsPagination.page
                      : questionsPagination.page}
                  </button>
                  <button
                    className="px-3 py-1 text-sm font-medium rounded-md border border-gray-200 dark:border-gray-700 text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                    type="button"
                    disabled={
                      activeTab === "posts"
                        ? postRows.length < postsPagination.pageSize
                        : questions.length < questionsPagination.pageSize
                    }
                    onClick={() =>
                      activeTab === "posts"
                        ? setPostsPagination((p) => ({
                            ...p,
                            page: p.page + 1,
                          }))
                        : setQuestionsPagination((p) => ({
                            ...p,
                            page: p.page + 1,
                          }))
                    }
                  >
                    Tiếp
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ContentQuickDraft
                products={catalogProducts}
                onGenerateAiDraft={handleGenerateAiDraft}
                draftSeed={quickDraftSeed}
                onSave={handleSaveDraft}
                onOpenFullEditor={openFullEditor}
              />
              <ContentStats
                published={stats.published}
                pending={stats.pending}
                drafts={stats.draft}
              />
            </div>

            <div className="flex justify-center pb-6">
              <p className="text-text-secondary dark:text-gray-400 text-sm">
                © 2024 Pharmacy Admin Portal. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {previewPost?.title || "Xem trước bài viết"}
            </DialogTitle>
            <DialogDescription>
              Preview nội bộ cho admin. Nội dung này có thể vẫn là draft hoặc pending.
            </DialogDescription>
          </DialogHeader>

          {previewLoading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-600">
              Đang tải preview bài viết...
            </div>
          ) : previewError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
              {previewError}
            </div>
          ) : previewPost ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                {(previewPost.tags || []).map((tag) => (
                  <span
                    key={tag.id || tag.slug || tag.name}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>

              {previewPost.excerpt ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                  {previewPost.excerpt}
                </div>
              ) : null}

              {previewPost.coverImageUrl ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <img
                    src={previewPost.coverImageUrl}
                    alt={previewPost.title || "Cover"}
                    className="h-auto max-h-[320px] w-full object-cover"
                  />
                </div>
              ) : null}

              <article
                className="prose max-w-none prose-slate"
                dangerouslySetInnerHTML={{ __html: previewHtml || "" }}
              />

              {previewPost.disclaimer ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                  {previewPost.disclaimer}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-600">
              Chưa có dữ liệu preview.
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={fullEditorOpen} onOpenChange={setFullEditorOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Soạn thảo bài viết</DialogTitle>
            <DialogDescription>
              Chỉnh sửa nội dung đầy đủ trước khi xuất bản.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <input
              value={fullTitle}
              onChange={(e) => setFullTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-primary focus:border-primary"
              placeholder="Tiêu đề bài viết..."
              type="text"
            />

            <div className="grid gap-3 md:grid-cols-2">
              <textarea
                value={fullExcerpt}
                onChange={(e) => setFullExcerpt(e.target.value)}
                className="min-h-[110px] w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-900"
                placeholder="Tóm tắt ngắn để hiển thị danh sách bài viết..."
              />
              <textarea
                value={fullCaption}
                onChange={(e) => setFullCaption(e.target.value)}
                className="min-h-[110px] w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-900"
                placeholder="Caption dẫn bài tự nhiên, tinh tế, không quá quảng cáo..."
              />
            </div>

            <input
              value={fullTags.join(", ")}
              onChange={(e) =>
                setFullTags(
                  e.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                )
              }
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-900"
              placeholder="Tags gợi ý, cách nhau bằng dấu phẩy"
              type="text"
            />

            <textarea
              value={fullDisclaimer}
              onChange={(e) => setFullDisclaimer(e.target.value)}
              className="min-h-[90px] w-full rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm focus:border-amber-400 focus:ring-amber-300 dark:border-amber-700/60 dark:bg-amber-950/20"
              placeholder="Lưu ý y tế hoặc disclaimer nếu cần..."
            />

            <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-3 bg-gray-50/60 dark:bg-gray-900/40">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-main dark:text-white">
                    Ảnh bìa bài viết
                  </p>
                  <p className="text-xs text-text-secondary dark:text-gray-400">
                    Ảnh đại diện khi hiển thị danh sách và trang chi tiết.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {fullCoverImageUrl ? (
                    <button
                      type="button"
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => {
                        setFullCoverImageUrl("");
                        setFullCoverPreviewUrl("");
                      }}
                      disabled={fullCoverUploading}
                    >
                      Xóa ảnh
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90"
                    onClick={handleCoverPick}
                    disabled={fullCoverUploading}
                  >
                    {fullCoverUploading ? "Đang tải..." : "Chọn ảnh"}
                  </button>
                </div>
              </div>
              {fullCoverPreviewUrl ? (
                <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                  <img
                    src={fullCoverPreviewUrl}
                    alt="Ảnh bìa"
                    className="w-full h-48 object-cover"
                  />
                </div>
              ) : null}
              {fullCoverError ? (
                <p className="text-xs text-rose-500 mt-2">{fullCoverError}</p>
              ) : null}
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 py-2 flex gap-1 items-center flex-wrap">
                <div className="flex items-center gap-1 mr-2">
                  {[1, 2, 3].map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={`px-2 py-1 text-xs font-semibold rounded-md ${
                        fullEditor?.isActive("heading", { level })
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                      }`}
                      onClick={() => setHeading(`h${level}`)}
                      disabled={!fullEditor}
                    >
                      H{level}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`px-2 py-1 text-xs font-semibold rounded-md ${
                      currentHeading() === "paragraph"
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                    onClick={() => setHeading("paragraph")}
                    disabled={!fullEditor}
                  >
                    Normal
                  </button>
                </div>
                <button
                  className={`p-1 rounded ${
                    fullEditor?.isActive("bold")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                  type="button"
                  onClick={() => fullEditor?.chain().focus().toggleBold().run()}
                  disabled={
                    !fullEditor?.can().chain().focus().toggleBold().run()
                  }
                >
                  <span className="material-symbols-outlined text-[18px]">
                    format_bold
                  </span>
                </button>
                <button
                  className={`p-1 rounded ${
                    fullEditor?.isActive("italic")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                  type="button"
                  onClick={() =>
                    fullEditor?.chain().focus().toggleItalic().run()
                  }
                  disabled={
                    !fullEditor?.can().chain().focus().toggleItalic().run()
                  }
                >
                  <span className="material-symbols-outlined text-[18px]">
                    format_italic
                  </span>
                </button>
                <button
                  className={`p-1 rounded ${
                    fullEditor?.isActive("underline")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                  type="button"
                  onClick={() =>
                    fullEditor?.chain().focus().toggleUnderline().run()
                  }
                  disabled={
                    !fullEditor?.can().chain().focus().toggleUnderline().run()
                  }
                >
                  <span className="material-symbols-outlined text-[18px]">
                    format_underlined
                  </span>
                </button>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
                <button
                  className={`p-1 rounded ${
                    fullEditor?.isActive("bulletList")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                  type="button"
                  onClick={() =>
                    fullEditor?.chain().focus().toggleBulletList().run()
                  }
                  disabled={
                    !fullEditor?.can().chain().focus().toggleBulletList().run()
                  }
                >
                  <span className="material-symbols-outlined text-[18px]">
                    format_list_bulleted
                  </span>
                </button>
                <button
                  className={`p-1 rounded ${
                    fullEditor?.isActive("orderedList")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                  type="button"
                  onClick={() =>
                    fullEditor?.chain().focus().toggleOrderedList().run()
                  }
                  disabled={
                    !fullEditor?.can().chain().focus().toggleOrderedList().run()
                  }
                >
                  <span className="material-symbols-outlined text-[18px]">
                    format_list_numbered
                  </span>
                </button>
                <button
                  className={`p-1 rounded ${
                    fullEditor?.isActive("blockquote")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                  type="button"
                  onClick={() =>
                    fullEditor?.chain().focus().toggleBlockquote().run()
                  }
                  disabled={
                    !fullEditor?.can().chain().focus().toggleBlockquote().run()
                  }
                >
                  <span className="material-symbols-outlined text-[18px]">
                    format_quote
                  </span>
                </button>
                <button
                  className={`p-1 rounded ${
                    fullEditor?.isActive("codeBlock")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                  type="button"
                  onClick={() =>
                    fullEditor?.chain().focus().toggleCodeBlock().run()
                  }
                  disabled={
                    !fullEditor?.can().chain().focus().toggleCodeBlock().run()
                  }
                >
                  <span className="material-symbols-outlined text-[18px]">
                    code
                  </span>
                </button>
                <button
                  className={`p-1 rounded ${
                    fullEditor?.isActive("link")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                  type="button"
                  onClick={handleLink}
                  disabled={!fullEditor}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    link
                  </span>
                </button>
                <button
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
                  type="button"
                  onClick={handleInsertImage}
                  disabled={!fullEditor || fullUploading}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    image
                  </span>
                </button>
                <button
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
                  type="button"
                  onClick={() =>
                    fullEditor
                      ?.chain()
                      .focus()
                      .unsetAllMarks()
                      .clearNodes()
                      .run()
                  }
                  disabled={
                    !fullEditor
                      ?.can()
                      .chain()
                      .focus()
                      .unsetAllMarks()
                      .clearNodes()
                      .run()
                  }
                >
                  <span className="material-symbols-outlined text-[18px]">
                    format_clear
                  </span>
                </button>
                <button
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
                  type="button"
                  onClick={() => fullEditor?.chain().focus().undo().run()}
                  disabled={!fullEditor?.can().chain().focus().undo().run()}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    undo
                  </span>
                </button>
                <button
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
                  type="button"
                  onClick={() => fullEditor?.chain().focus().redo().run()}
                  disabled={!fullEditor?.can().chain().focus().redo().run()}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    redo
                  </span>
                </button>
              </div>
              <EditorContent
                editor={fullEditor}
                className="tiptap content-editor w-full px-4 py-3 bg-white dark:bg-gray-900 text-sm border-none focus:ring-0 resize-none text-text-main dark:text-white min-h-[260px]"
              />
            </div>
            <input
              ref={fullCoverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverSelected}
            />
            <input
              ref={fullFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFullImageSelected}
            />
            {fullUploadError ? (
              <p className="text-xs text-red-500">{fullUploadError}</p>
            ) : null}

            {fullError ? (
              <p className="text-sm text-rose-500">{fullError}</p>
            ) : null}
          </div>

          <DialogFooter>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              onClick={() => setFullEditorOpen(false)}
            >
              Đóng
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              onClick={saveFullDraft}
              disabled={fullSaving}
            >
              {fullSaving ? "Đang lưu..." : "Lưu nháp"}
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-blue-600 rounded-lg shadow-sm"
              onClick={publishFullPost}
              disabled={fullSaving}
            >
              Xuất bản
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminContentPage;
