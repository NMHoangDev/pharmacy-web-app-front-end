import React, { useEffect, useMemo, useRef, useState } from "react";

const FeaturedProducts = () => {
  // Demo data (bạn thay bằng data API sau cũng được)
  const products = useMemo(
    () => [
      {
        id: "p1",
        tag: { text: "-15%", tone: "sale" },
        category: "Vitamin & TPCN",
        title: "Multi-Vitamin Complex Daily Support 60 Viên",
        price: "212.000đ",
        oldPrice: "250.000đ",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCLDci1rffV4qD_ZorsdGyK_k-4R1-xtJXbxzTCKEGB83K-lHQMGkAzfUkbQvleq_m0LUgvmMMDnfaRUz1G0F0K0hfA13uARn6tbU8DvGxK6RCJRS9D9kvI4-CxLGlCg_3lYYRYxRHlu6VCjIfuS-jNEIMaMB7Us2sFQtJL2H7f63yNs2-ze2cE5Y0l13G87Wx1YNsTrMXiOQV2-4c-G2f7N9RFw3IPw3fGv_pAxwEotJYwwpZu99Z-BNM4bNuuZ1He5gaz2xbVldrs",
      },
      {
        id: "p2",
        category: "Thuốc không kê đơn",
        title: "Panadol Extra with Optizorb 120 Tablets",
        price: "185.000đ",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCl6PogJnuegeusY9-nJZjZ1FKHcBZgnIfLpGDwJXNDXX_eUqOpMI8E5lBDf4SF0gK24arGe1PbpgVja25_UwVE603Nsr5ZAUPEjRZURF-rqChZapcLHpBZu1S8WPgN1KTUtbNt9PKfQY9BMzcHnInGQSCeZwz9y7fMXTQSQG-FN0y_i64oRKOHB71CP0puafJ0OnCTm9RfFjf4f47_ctWVPImilOqFAJN1Mv2cQ4x86W-QcB2xBYbw3RqsfiPGbL8T7pr1sXbJ7kbp",
      },
      {
        id: "p3",
        tag: { text: "Mới", tone: "new" },
        category: "Tim mạch",
        title: "Omega 3 Fish Oil Premium 1000mg",
        price: "320.000đ",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDJdkQUZknEd4wNkQnbfuIxBAFGbcCr14GLvSLjFI8FeQVfXriH3SgkoDG_znwwtIGewTAvlAWHA4jjfmNmnsAAZj9N2DWVNb_d8Eso-S49qTW3qh9ZcoWkYuk-swFteMNKkgFTLnQsCSuWk5dUTAN8nvRavMK8SQ8rGbdMuv4RBPfAL09vlQKu5e0lMQZwQZm6II62a8hva2IZQKqRC96bzaXB2EHR1VegsS7WbzKq3s4BqhqDV56hMN1b8tfvgb4e5fZbGBQXQ8Br",
      },
      {
        id: "p4",
        category: "Mẹ và Bé",
        title: "Siro ho thảo dược Prospan 100ml",
        price: "85.000đ",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDE-eNcotkYoLVWPvPKvKgdQPqb3YvhQgq8cw8tCAnC5NXZOp9YJOMHn_fHjDWx0kwnIXCXV0XriIY6eT5A6fd58pEr4868yPiutUqxZI3p9DE-rgGN10xQhPSV2MB4qxP7kwg26r14ex6tJEgl5MviXkvOS9K072qSMEiFdJxGI9mustvw8K7gg98byi7PGcEfyR45yT-9n2q0gRvZda_bts8QRjQTVwaFFVodS0KS70y3uo93ISuPfNe3LjdJ0qbbTkStpj3OLq1V",
      },

      // thêm vài item để slider “đã” hơn (có thể thay bằng data thật)
      {
        id: "p5",
        tag: { text: "-10%", tone: "sale" },
        category: "Vitamin & TPCN",
        title: "Vitamin C 1000mg – Tăng đề kháng (60 viên)",
        price: "179.000đ",
        oldPrice: "199.000đ",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCLDci1rffV4qD_ZorsdGyK_k-4R1-xtJXbxzTCKEGB83K-lHQMGkAzfUkbQvleq_m0LUgvmMMDnfaRUz1G0F0K0hfA13uARn6tbU8DvGxK6RCJRS9D9kvI4-CxLGlCg_3lYYRYxRHlu6VCjIfuS-jNEIMaMB7Us2sFQtJL2H7f63yNs2-ze2cE5Y0l13G87Wx1YNsTrMXiOQV2-4c-G2f7N9RFw3IPw3fGv_pAxwEotJYwwpZu99Z-BNM4bNuuZ1He5gaz2xbVldrs",
      },
      {
        id: "p6",
        category: "Da liễu",
        title: "Kem dưỡng phục hồi hàng rào da (50ml)",
        price: "265.000đ",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDE-eNcotkYoLVWPvPKvKgdQPqb3YvhQgq8cw8tCAnC5NXZOp9YJOMHn_fHjDWx0kwnIXCXV0XriIY6eT5A6fd58pEr4868yPiutUqxZI3p9DE-rgGN10xQhPSV2MB4qxP7kwg26r14ex6tJEgl5MviXkvOS9K072qSMEiFdJxGI9mustvw8K7gg98byi7PGcEfyR45yT-9n2q0gRvZda_bts8QRjQTVwaFFVodS0KS70y3uo93ISuPfNe3LjdJ0qbbTkStpj3OLq1V",
      },
      {
        id: "p7",
        tag: { text: "Hot", tone: "hot" },
        category: "Giảm đau",
        title: "Gel giảm đau cơ xương khớp (tuýp 30g)",
        price: "98.000đ",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCl6PogJnuegeusY9-nJZjZ1FKHcBZgnIfLpGDwJXNDXX_eUqOpMI8E5lBDf4SF0gK24arGe1PbpgVja25_UwVE603Nsr5ZAUPEjRZURF-rqChZapcLHpBZu1S8WPgN1KTUtbNt9PKfQY9BMzcHnInGQSCeZwz9y7fMXTQSQG-FN0y_i64oRKOHB71CP0puafJ0OnCTm9RfFjf4f47_ctWVPImilOqFAJN1Mv2cQ4x86W-QcB2xBYbw3RqsfiPGbL8T7pr1sXbJ7kbp",
      },
      {
        id: "p8",
        category: "Tiêu hóa",
        title: "Men vi sinh hỗ trợ tiêu hóa (10 gói)",
        price: "145.000đ",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDJdkQUZknEd4wNkQnbfuIxBAFGbcCr14GLvSLjFI8FeQVfXriH3SgkoDG_znwwtIGewTAvlAWHA4jjfmNmnsAAZj9N2DWVNb_d8Eso-S49qTW3qh9ZcoWkYuk-swFteMNKkgFTLnQsCSuWk5dUTAN8nvRavMK8SQ8rGbdMuv4RBPfAL09vlQKu5e0lMQZwQZm6II62a8hva2IZQKqRC96bzaXB2EHR1VegsS7WbzKq3s4BqhqDV56hMN1b8tfvgb4e5fZbGBQXQ8Br",
      },
    ],
    []
  );

  // perView responsive
  const [perView, setPerView] = useState(4);
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w < 640) return 1;
      if (w < 1024) return 2;
      return 4;
    };
    const apply = () => setPerView(calc());
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  // infinite loop via clones
  const slides = useMemo(() => {
    const head = products.slice(-perView);
    const tail = products.slice(0, perView);
    return [...head, ...products, ...tail];
  }, [products, perView]);

  const [index, setIndex] = useState(perView);
  const [transitionOn, setTransitionOn] = useState(true);
  const [locked, setLocked] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    // when perView changes, reset to a stable start
    setTransitionOn(false);
    setIndex(perView);
    requestAnimationFrame(() => requestAnimationFrame(() => setTransitionOn(true)));
  }, [perView]);

  const maxIndex = products.length + perView; // last clone start boundary

  const goNext = () => {
    if (locked) return;
    setLocked(true);
    setIndex((v) => v + 1);
  };

  const goPrev = () => {
    if (locked) return;
    setLocked(true);
    setIndex((v) => v - 1);
  };

  const onTransitionEnd = () => {
    setLocked(false);

    // Left side clone zone
    if (index <= perView - 1) {
      setTransitionOn(false);
      setIndex(index + products.length);
      requestAnimationFrame(() => requestAnimationFrame(() => setTransitionOn(true)));
      return;
    }

    // Right side clone zone
    if (index >= maxIndex + 1) {
      setTransitionOn(false);
      setIndex(index - products.length);
      requestAnimationFrame(() => requestAnimationFrame(() => setTransitionOn(true)));
    }
  };

  const slideWidthPct = 100 / perView;
  const translatePct = -(index * slideWidthPct);

  const badgeClass = (tone) => {
    if (tone === "sale") return "bg-rose-500 text-white";
    if (tone === "new") return "bg-emerald-500 text-white";
    if (tone === "hot") return "bg-amber-500 text-white";
    return "bg-slate-900 text-white";
  };

  return (
    <section className="py-12 bg-white dark:bg-surface-dark">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Sản phẩm nổi bật
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Gợi ý theo xu hướng & nhu cầu sức khỏe
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Trượt sang trái"
              className="size-10 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950
                         hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 transition
                         focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <span className="material-symbols-outlined text-[20px]">
                chevron_left
              </span>
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Trượt sang phải"
              className="size-10 flex items-center justify-center rounded-full border border-primary bg-primary text-white transition
                         hover:opacity-95 active:scale-95
                         focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <span className="material-symbols-outlined text-[20px]">
                chevron_right
              </span>
            </button>
          </div>
        </div>

        {/* Slider */}
        <div className="relative overflow-hidden rounded-2xl">
          <div
            ref={trackRef}
            onTransitionEnd={onTransitionEnd}
            className="flex"
            style={{
              transform: `translateX(${translatePct}%)`,
              transition: transitionOn ? "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)" : "none",
              willChange: "transform",
            }}
          >
            {slides.map((p, i) => (
              <div
                key={`${p.id}-${i}`}
                className="shrink-0 px-3"
                style={{ width: `${slideWidthPct}%` }}
              >
                <div className="group relative bg-white dark:bg-surface-dark rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
                  {p.tag?.text ? (
                    <div className="absolute top-3 left-3 z-10">
                      <span
                        className={[
                          "text-[10px] font-extrabold px-2 py-1 rounded-full uppercase tracking-wider",
                          badgeClass(p.tag.tone),
                        ].join(" ")}
                      >
                        {p.tag.text}
                      </span>
                    </div>
                  ) : null}

                  <div className="relative aspect-square bg-slate-50 dark:bg-slate-900/40 overflow-hidden p-6">
                    <div
                      className="w-full h-full bg-center bg-contain bg-no-repeat transition-transform duration-500 group-hover:scale-110 mix-blend-multiply dark:mix-blend-normal"
                      style={{ backgroundImage: `url('${p.image}')` }}
                    />
                    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-black/5 to-transparent" />
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      {p.category}
                    </div>

                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                      {p.title}
                    </h3>

                    <div className="mt-auto pt-3 flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        {p.oldPrice ? (
                          <p className="text-xs text-slate-400 line-through">
                            {p.oldPrice}
                          </p>
                        ) : null}
                        <p className="text-lg font-extrabold text-primary">
                          {p.price}
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-label="Thêm vào giỏ"
                        className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center
                                   hover:bg-primary hover:text-white transition active:scale-95
                                   focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <span className="material-symbols-outlined">
                          add_shopping_cart
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white dark:from-surface-dark to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white dark:from-surface-dark to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
