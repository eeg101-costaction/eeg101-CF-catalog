import Image from "next/image";

export default function Tags({
  labels = [],
  variant = "default",
  themeColor = "grey",
  textSize = "caption",
  withIcon = false,
  className = "",
  maxTags = 99,
}) {
  const shown = labels.slice(0, maxTags);
  const hasMore = labels.length > maxTags;

  // Color gradients mapped from backend (constants.js)
  const colorGradients = {
    blue: "linear-gradient(to bottom, #76c9f3 0%, #90d4f6 100%)",
    violet: "linear-gradient(to bottom, #b794f6 0%, #c9aef8 100%)",
    orange: "linear-gradient(to bottom, #ffb366 0%, #ffc784 100%)",
    yellow: "linear-gradient(to bottom, #ffd966 0%, #ffe384 100%)",
    grey: "rgba(201, 201, 201, 0.5)",
  };

  const backgroundVar = colorGradients[themeColor] || colorGradients.grey;

  // Determine styling based on variant
  const getTagStyle = () => {
    if (variant === "framework") {
      return {
        background: "var(--surface-secondary)",
        border: "var(--separator-light)",
        color: "var(--text-quaternary)",
      };
    } else if (variant === "resource-type") {
      return {
        background: backgroundVar,
        color: "var(--text-tertiary)",
      };
    } else {
      return {
        background: backgroundVar,
        color: "var(--text-quaternary)",
      };
    }
  };

  const tagStyle = getTagStyle();

  return (
    <div className={`flex flex-nowrap gap-2 min-w-0 ${className}`}>
      {shown.map((tag, i) => (
        <span
          key={i}
          className="inline-flex items-center px-3 py-1.5 rounded-full whitespace-nowrap"
          style={{
            ...tagStyle,
            fontSize: "var(--font-size-caption)",
            fontWeight: 550,
          }}
          title={typeof tag === "string" ? tag : tag.label}
        >
          {/* Only show icon if withIcon is true and tag is an object with icon */}
          {withIcon && typeof tag === "object" && tag.icon && (
            <Image
              src={tag.icon}
              alt=""
              width={20}
              height={20}
              className="mr-1.5 inline-block align-middle mix-blend-overlay"
            />
          )}
          {typeof tag === "string" ? tag : tag.label}
        </span>
      ))}
      {hasMore && (
        <span
          className="px-2 rounded-full"
          style={{
            ...tagStyle,
            fontSize: "var(--font-size-small)",
            fontWeight: 600,
          }}
        >
          …
        </span>
      )}
    </div>
  );
}
