import React, { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import FigureImage from "../../../content/editor/tiptap/FigureImage";
import { uploadMediaImage } from "../../../content/api/contentApi";
import {
  fetchMediaImageAsDataUrl,
  fileToDataUrl,
  resolveHtmlImagesToDataUrls,
  resolveJsonImagesToDataUrls,
} from "../../../../shared/utils/media";

const ContentQuickDraft = ({
  onSave,
  onOpenFullEditor,
  products = [],
  onGenerateAiDraft,
  draftSeed,
}) => {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [caption, setCaption] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [disclaimer, setDisclaimer] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [draftImages, setDraftImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState("");
  const [mediaAlbumId, setMediaAlbumId] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Underline,
      FigureImage,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Placeholder.configure({
        placeholder: "Nội dung bài viết...",
      }),
    ],
    content: "",
  });

  const canSubmit = useMemo(() => title.trim().length > 0, [title]);

  const applyDraft = (draft) => {
    if (!draft) return;
    setTitle(draft.title || "");
    setExcerpt(draft.excerpt || "");
    setCaption(draft.caption || "");
    setSuggestedTags(Array.isArray(draft.tags) ? draft.tags : []);
    setDisclaimer(draft.disclaimer || "");
    setSelectedProductId(draft.selectedProductId || "");
    setCoverImageUrl(draft.coverImageUrl || "");
    setCoverPreviewUrl(draft.coverImageUrl || "");
    if (editor) {
      editor.commands.setContent(draft.contentHtml || "");
    }
    setStatus(
      draft.sourceProductName
        ? `Đã nạp bản nháp AI cho ${draft.sourceProductName}. Bạn có thể rà soát và chỉnh sửa trước khi lưu.`
        : "Đã nạp bản nháp AI để bạn rà soát.",
    );
  };

  useEffect(() => {
    if (!draftSeed || !editor) return;
    applyDraft(draftSeed);
  }, [draftSeed, editor]);

  const resolveImagesToBase64 = async (images) => {
    if (!images?.length) return [];
    const results = [];
    for (let index = 0; index < images.length; index += 1) {
      const item = images[index];
      if (!item?.url) continue;
      let base64Url = item.url;
      try {
        base64Url = await fetchMediaImageAsDataUrl(item.url);
      } catch {
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

  const buildPayload = async () => ({
    title,
    excerpt,
    caption,
    disclaimer,
    tags: suggestedTags,
    selectedProductId,
    contentHtml: await resolveHtmlImagesToDataUrls(editor?.getHTML() || ""),
    contentJson: await resolveJsonImagesToDataUrls(editor?.getJSON() || null),
    images: await resolveImagesToBase64(draftImages),
    coverImageUrl: coverImageUrl || null,
  });

  const handleSave = async () => {
    if (!canSubmit) {
      setStatus("Vui lòng nhập tiêu đề trước khi lưu.");
      return;
    }
    setSaving(true);
    setStatus("");
    try {
      if (onSave) {
        await onSave(await buildPayload());
      }
      setStatus("Đã lưu nháp thành công.");
    } catch (err) {
      setStatus(err?.message || "Không thể lưu nháp.");
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = async () => {
    if (!onOpenFullEditor) return;
    try {
      onOpenFullEditor(await buildPayload());
    } catch (err) {
      setStatus(err?.message || "Không thể mở trình soạn thảo đầy đủ.");
    }
  };

  const handleGenerate = async () => {
    if (!selectedProductId) {
      setAiError("Vui lòng chọn sản phẩm trước khi dùng AI generate.");
      return;
    }
    if (!onGenerateAiDraft) return;
    setAiLoading(true);
    setAiError("");
    setStatus("");
    try {
      applyDraft(await onGenerateAiDraft(selectedProductId));
    } catch (err) {
      setAiError(err?.message || "Không thể tạo bản nháp AI lúc này.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Nhập URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const handleCoverSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setCoverUploading(true);
    setCoverError("");
    try {
      const localPreview = await fileToDataUrl(file);
      const { url } = await uploadMediaImage(file, mediaAlbumId);
      if (!url) throw new Error("Không thể tải ảnh bìa.");
      const displayUrl =
        localPreview || (await fetchMediaImageAsDataUrl(url).catch(() => url));
      setCoverImageUrl(displayUrl);
      setCoverPreviewUrl(displayUrl);
    } catch (err) {
      setCoverError(err?.message || "Không thể tải ảnh bìa.");
    } finally {
      setCoverUploading(false);
    }
  };

  const handleImageSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editor) return;
    setUploading(true);
    setUploadError("");
    try {
      const localPreview = await fileToDataUrl(file);
      const { albumId, url } = await uploadMediaImage(file, mediaAlbumId);
      if (!url) throw new Error("Không thể tải ảnh lên.");
      if (albumId) setMediaAlbumId(albumId);
      const altText = window.prompt("Mô tả hình ảnh", "") || "";
      const displayUrl =
        localPreview || (await fetchMediaImageAsDataUrl(url).catch(() => url));
      editor
        .chain()
        .focus()
        .insertFigureImage({
          src: displayUrl,
          alt: altText,
          caption: altText.trim(),
        })
        .run();
      setDraftImages((prev) => [
        ...prev,
        { url: displayUrl, altText, position: prev.length },
      ]);
    } catch (err) {
      setUploadError(err?.message || "Không thể tải ảnh.");
    } finally {
      setUploading(false);
    }
  };

  const toolbarBtn = (active) =>
    `rounded-xl p-1 ${
      active
        ? "bg-primary/10 text-primary"
        : "text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
    }`;

  return (
    <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <span className="material-symbols-outlined text-primary">
              edit_note
            </span>
            Soạn thảo nhanh
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tạo nháp bài viết và dùng AI để lên tiêu đề, caption dẫn bài cùng
            khung nội dung.
          </p>
        </div>
        <button
          type="button"
          className="rounded-2xl px-4 py-2 text-sm font-semibold text-primary transition hover:bg-blue-50 dark:hover:bg-slate-800"
          onClick={handleContinue}
        >
          Mở trình soạn thảo đầy đủ
        </button>
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4 shadow-sm dark:border-amber-900/40 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Chọn sản phẩm để AI viết bài PR mềm
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="">Chọn sản phẩm</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                    {product.categoryName ? ` • ${product.categoryName}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={aiLoading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-lg shadow-amber-200/60 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
            >
              <span className="material-symbols-outlined animate-pulse text-[18px]">
                auto_awesome
              </span>
              {aiLoading ? "AI đang lên bài..." : "Generate bằng AI"}
            </button>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
            AI sẽ gợi ý tiêu đề đầy đủ, excerpt, caption dẫn bài và nội dung theo
            hướng tinh tế, bớt cảm giác quảng cáo trực diện.
          </p>
          {aiError ? (
            <p className="mt-2 text-xs font-medium text-rose-600">{aiError}</p>
          ) : null}
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          placeholder="Tiêu đề bài viết..."
          type="text"
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Tóm tắt mở bài
            </span>
            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              placeholder="1-2 câu giới thiệu nhanh cho bài viết..."
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Caption dẫn bài
            </span>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              placeholder="Caption nhẹ nhàng, khơi gợi đọc tiếp nhưng không quá quảng cáo..."
            />
          </label>
        </div>

        {suggestedTags.length ? (
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        {disclaimer ? (
          <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-xs leading-5 text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-200">
            <strong>Lưu ý AI:</strong> {disclaimer}
          </div>
        ) : null}

        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/40">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                Ảnh bìa bài viết
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ảnh đại diện cho bài viết khi hiển thị trong danh sách nội dung.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {coverImageUrl ? (
                <button
                  type="button"
                  className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  onClick={() => {
                    setCoverImageUrl("");
                    setCoverPreviewUrl("");
                  }}
                  disabled={coverUploading}
                >
                  Xóa ảnh
                </button>
              ) : null}
              <button
                type="button"
                className="rounded-2xl bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-blue-600"
                onClick={() => coverInputRef.current?.click()}
                disabled={coverUploading}
              >
                {coverUploading ? "Đang tải..." : "Chọn ảnh"}
              </button>
            </div>
          </div>
          {coverPreviewUrl ? (
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <img
                src={coverPreviewUrl}
                alt="Ảnh bìa"
                className="h-44 w-full object-cover"
              />
            </div>
          ) : null}
          {coverError ? (
            <p className="mt-2 text-xs text-rose-500">{coverError}</p>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
            <div className="mr-2 flex items-center gap-1">
              {[1, 2].map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`${toolbarBtn(editor?.isActive("heading", { level }))} rounded-xl px-2 py-1 text-xs font-semibold`}
                  onClick={() =>
                    editor?.chain().focus().toggleHeading({ level }).run()
                  }
                  disabled={
                    !editor?.can().chain().focus().toggleHeading({ level }).run()
                  }
                >
                  H{level}
                </button>
              ))}
              <button
                type="button"
                className={`${
                  editor?.isActive("paragraph")
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
                } rounded-xl px-2 py-1 text-xs font-semibold`}
                onClick={() => editor?.chain().focus().setParagraph().run()}
                disabled={!editor}
              >
                Normal
              </button>
            </div>
            <button
              className={toolbarBtn(editor?.isActive("bold"))}
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              disabled={!editor?.can().chain().focus().toggleBold().run()}
            >
              <span className="material-symbols-outlined text-[18px]">
                format_bold
              </span>
            </button>
            <button
              className={toolbarBtn(editor?.isActive("italic"))}
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              disabled={!editor?.can().chain().focus().toggleItalic().run()}
            >
              <span className="material-symbols-outlined text-[18px]">
                format_italic
              </span>
            </button>
            <button
              className={toolbarBtn(editor?.isActive("underline"))}
              type="button"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              disabled={!editor?.can().chain().focus().toggleUnderline().run()}
            >
              <span className="material-symbols-outlined text-[18px]">
                format_underlined
              </span>
            </button>
            <button
              className={toolbarBtn(editor?.isActive("bulletList"))}
              type="button"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              disabled={!editor?.can().chain().focus().toggleBulletList().run()}
            >
              <span className="material-symbols-outlined text-[18px]">
                format_list_bulleted
              </span>
            </button>
            <button
              className={toolbarBtn(editor?.isActive("orderedList"))}
              type="button"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              disabled={!editor?.can().chain().focus().toggleOrderedList().run()}
            >
              <span className="material-symbols-outlined text-[18px]">
                format_list_numbered
              </span>
            </button>
            <button
              className={toolbarBtn(editor?.isActive("blockquote"))}
              type="button"
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              disabled={!editor?.can().chain().focus().toggleBlockquote().run()}
            >
              <span className="material-symbols-outlined text-[18px]">
                format_quote
              </span>
            </button>
            <button
              className={toolbarBtn(editor?.isActive("link"))}
              type="button"
              onClick={handleLink}
              disabled={!editor}
            >
              <span className="material-symbols-outlined text-[18px]">
                link
              </span>
            </button>
            <button
              className="rounded-xl p-1 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!editor || uploading}
            >
              <span className="material-symbols-outlined text-[18px]">
                image
              </span>
            </button>
            <button
              className="rounded-xl p-1 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
              type="button"
              onClick={() => editor?.chain().focus().undo().run()}
              disabled={!editor?.can().chain().focus().undo().run()}
            >
              <span className="material-symbols-outlined text-[18px]">
                undo
              </span>
            </button>
            <button
              className="rounded-xl p-1 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
              type="button"
              onClick={() => editor?.chain().focus().redo().run()}
              disabled={!editor?.can().chain().focus().redo().run()}
            >
              <span className="material-symbols-outlined text-[18px]">
                redo
              </span>
            </button>
          </div>
          <EditorContent
            editor={editor}
            className="tiptap content-editor min-h-[180px] w-full bg-white px-4 py-3 text-sm text-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>

        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverSelected}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelected}
        />

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs italic text-slate-500 dark:text-slate-400">
            {uploadError ||
              status ||
              "AI gợi ý bản nháp, admin quyết định phiên bản cuối cùng."}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-2xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={handleSave}
              disabled={saving || uploading}
            >
              {saving
                ? "Đang lưu..."
                : uploading
                  ? "Đang tải ảnh..."
                  : "Lưu nháp"}
            </button>
            <button
              type="button"
              className="rounded-2xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-600"
              onClick={handleContinue}
              disabled={uploading}
            >
              Tiếp tục
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentQuickDraft;
