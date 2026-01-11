import React from "react";

const AuthHero = ({
  title,
  description,
  image,
  badgeIcon = "verified_user",
  badgeText = "Đối tác tin cậy",
  bullets = [],
  badgeNote,
}) => {
  return (
    <div className="absolute inset-0">
      <img
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
        src={image}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/20 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 w-full p-12 xl:p-16 text-white z-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-sm font-medium mb-4">
            <span className="material-symbols-outlined text-[16px]">
              {badgeIcon}
            </span>
            {badgeText}
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">{title}</h2>
          {description && (
            <p className="text-white/90 text-lg leading-relaxed">
              {description}
            </p>
          )}
          {badgeNote && (
            <p className="text-white/80 text-sm font-semibold mt-3">
              {badgeNote}
            </p>
          )}
          {bullets.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mt-8 w-full text-left border border-white/20 shadow-xl">
              <ul className="space-y-4">
                {bullets.map((item) => (
                  <li key={item.title} className="flex items-start gap-4">
                    <div className="bg-white/20 p-2 rounded-lg text-white shrink-0">
                      <span className="material-symbols-outlined">
                        {item.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">
                        {item.title}
                      </h4>
                      <p className="text-blue-100 text-sm">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthHero;
