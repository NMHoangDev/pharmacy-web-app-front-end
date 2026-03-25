import React, { useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import FigureImage from "../../../tiptap/FigureImage";
import { uploadMediaImage } from "../../../api/contentApi";
import {
  fetchMediaImageAsDataUrl,
  fileToDataUrl,
  resolveHtmlImagesToDataUrls,
  resolveJsonImagesToDataUrls,
} from "../../../utils/media";

const ContentQuickDraft = ({ onSave, onOpenFullEditor }) => {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [draftContentHtml, setDraftContentHtml] = useState("");
  const [draftContentJson, setDraftContentJson] = useState(null);
  const [draftImages, setDraftImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState("");
  const [mediaAlbumId, setMediaAlbumId] = useState(null);
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
    onUpdate: ({ editor: current }) => {
      setDraftContentHtml(current.getHTML());
      setDraftContentJson(current.getJSON());
    },
  });

  const canSubmit = useMemo(() => title.trim().length > 0, [title]);

  const resolveImagesToBase64 = async (images) => {
    if (!images?.length) return [];
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

  const handleSave = async () => {
    if (!canSubmit) {
      setStatus("Vui lòng nhập tiêu đề trước khi lưu.");
      return;
    }
    const bodyHtml = editor?.getHTML() || "";
    const bodyJson = editor?.getJSON() || null;
    setSaving(true);
    setStatus("");
    try {
      if (onSave) {
        const resolvedHtml = await resolveHtmlImagesToDataUrls(bodyHtml);
        const resolvedJson = await resolveJsonImagesToDataUrls(bodyJson);
        const resolvedImages = await resolveImagesToBase64(draftImages);
        await onSave({
          title,
          contentHtml: resolvedHtml,
          contentJson: resolvedJson,
          images: resolvedImages,
          coverImageUrl: coverImageUrl || null,
        });
      }
      setStatus("Đã lưu nháp thành công.");
    } catch (err) {
      setStatus(err?.message || "Không thể lưu nháp.");
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = async () => {
    if (!onOpenFullEditor) {
      alert("Mở trình soạn thảo đầy đủ (mock)");
      return;
    }
    const bodyHtml = editor?.getHTML() || "";
    const bodyJson = editor?.getJSON() || null;
    const resolvedHtml = await resolveHtmlImagesToDataUrls(bodyHtml);
    const resolvedJson = await resolveJsonImagesToDataUrls(bodyJson);
    const resolvedImages = await resolveImagesToBase64(draftImages);
    onOpenFullEditor({
      title,
      contentHtml: resolvedHtml,
      contentJson: resolvedJson,
      images: resolvedImages,
      coverImageUrl: coverImageUrl || null,
    });
  };

  const currentHeading = () => {
    if (editor?.isActive("heading", { level: 1 })) return "h1";
    if (editor?.isActive("heading", { level: 2 })) return "h2";
    return "paragraph";
  };

  const setHeading = (value) => {
    if (!editor) return;
    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run();
      return;
    }
    const level = Number(value.replace("h", ""));
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const canToggleHeading = (level) =>
    !!editor?.can().chain().focus().toggleHeading({ level }).run();

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

  const handleInsertImage = () => {
    if (!editor) return;
    fileInputRef.current?.click();
  };

  const handleCoverPick = () => {
    coverInputRef.current?.click();
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
      let displayUrl = localPreview || url;
      if (!localPreview) {
        try {
          displayUrl = await fetchMediaImageAsDataUrl(url);
        } catch (err) {
          displayUrl = url;
        }
      }
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
      let displayUrl = localPreview || url;
      if (!localPreview) {
        try {
          displayUrl = await fetchMediaImageAsDataUrl(url);
        } catch (err) {
          displayUrl = url;
        }
      }
      const captionText = altText.trim();
      editor
        .chain()
        .focus()
        .insertFigureImage({
          src: displayUrl,
          alt: altText,
          caption: captionText,
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

  return (
    <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-[#e7edf3] dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            edit_note
          </span>
          Soạn thảo nhanh
        </h3>
        <button
          type="button"
          className="text-sm text-primary font-medium hover:underline"
          onClick={handleContinue}
        >
          Mở trình soạn thảo đầy đủ
        </button>
      </div>
      <div className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-primary focus:border-primary"
          placeholder="Tiêu đề bài viết..."
          type="text"
        />
        <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-3 bg-gray-50/60 dark:bg-gray-900/40">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-text-main dark:text-white">
                Ảnh bìa bài viết
              </p>
              <p className="text-xs text-text-secondary dark:text-gray-400">
                Ảnh đại diện cho bài viết khi hiển thị danh sách.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {coverImageUrl ? (
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
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
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90"
                onClick={handleCoverPick}
                disabled={coverUploading}
              >
                {coverUploading ? "Đang tải..." : "Chọn ảnh"}
              </button>
            </div>
          </div>
          {coverPreviewUrl ? (
            <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <img
                src={coverPreviewUrl}
                alt="Ảnh bìa"
                className="w-full h-40 object-cover"
              />
            </div>
          ) : null}
          {coverError ? (
            <p className="text-xs text-rose-500 mt-2">{coverError}</p>
          ) : null}
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 py-2 flex gap-1 items-center flex-wrap">
            <div className="flex items-center gap-1 mr-2">
              {[1, 2].map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`px-2 py-1 text-xs font-semibold rounded-md ${
                    editor?.isActive("heading", { level })
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                  onClick={() =>
                    editor?.chain().focus().toggleHeading({ level }).run()
                  }
                  disabled={!canToggleHeading(level)}
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
                disabled={!editor}
              >
                Normal
              </button>
            </div>
            <button
              className={`p-1 rounded ${
                editor?.isActive("bold")
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              disabled={!editor?.can().chain().focus().toggleBold().run()}
            >
              <span className="material-symbols-outlined text-[18px]">
                format_bold
              </span>
            </button>
            <button
              className={`p-1 rounded ${
                editor?.isActive("italic")
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              disabled={!editor?.can().chain().focus().toggleItalic().run()}
            >
              <span className="material-symbols-outlined text-[18px]">
                format_italic
              </span>
            </button>
            <button
              className={`p-1 rounded ${
                editor?.isActive("underline")
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
              type="button"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              disabled={!editor?.can().chain().focus().toggleUnderline().run()}
            >
              <span className="material-symbols-outlined text-[18px]">
                format_underlined
              </span>
            </button>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
            <button
              className={`p-1 rounded ${
                editor?.isActive("bulletList")
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
              type="button"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              disabled={!editor?.can().chain().focus().toggleBulletList().run()}
            >
              <span className="material-symbols-outlined text-[18px]">
                format_list_bulleted
              </span>
            </button>
            <button
              className={`p-1 rounded ${
                editor?.isActive("orderedList")
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
              type="button"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              disabled={
                !editor?.can().chain().focus().toggleOrderedList().run()
              }
            >
              <span className="material-symbols-outlined text-[18px]">
                format_list_numbered
              </span>
            </button>
            <button
              className={`p-1 rounded ${
                editor?.isActive("blockquote")
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
              type="button"
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              disabled={!editor?.can().chain().focus().toggleBlockquote().run()}
            >
              <span className="material-symbols-outlined text-[18px]">
                format_quote
              </span>
            </button>
            <button
              className={`p-1 rounded ${
                editor?.isActive("codeBlock")
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
              type="button"
              onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
              disabled={!editor?.can().chain().focus().toggleCodeBlock().run()}
            >
              <span className="material-symbols-outlined text-[18px]">
                code
              </span>
            </button>
            <button
              className={`p-1 rounded ${
                editor?.isActive("link")
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
              type="button"
              onClick={handleLink}
              disabled={!editor}
            >
              <span className="material-symbols-outlined text-[18px]">
                link
              </span>
            </button>
            <button
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
              type="button"
              onClick={handleInsertImage}
              disabled={!editor || uploading}
            >
              <span className="material-symbols-outlined text-[18px]">
                image
              </span>
            </button>
            <button
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
              type="button"
              onClick={() =>
                editor?.chain().focus().unsetAllMarks().clearNodes().run()
              }
              disabled={
                !editor
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
              onClick={() => editor?.chain().focus().undo().run()}
              disabled={!editor?.can().chain().focus().undo().run()}
            >
              <span className="material-symbols-outlined text-[18px]">
                undo
              </span>
            </button>
            <button
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
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
            className="tiptap content-editor w-full px-4 py-3 bg-white dark:bg-gray-900 text-sm border-none focus:ring-0 resize-none text-text-main dark:text-white min-h-[140px]"
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
        <div className="flex justify-between items-center">
          <p className="text-xs text-text-secondary dark:text-gray-500 italic">
            {uploadError || status || "Tự động lưu 2 phút trước"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
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
              className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-blue-600 rounded-lg shadow-sm"
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
