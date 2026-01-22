export default function TextSection({ title, subtitle, children }) {
  return (
    <section className="bg-gray-50 py-12 pb-6">
      <div
        className="mx-auto px-20"
        style={{ maxWidth: "var(--container-max)" }}
      >
        {title && (
          <h2
            className="font-bold text-gray-900 mb-4"
            style={{ fontSize: "var(--font-size-h2)" }}
          >
            {title}
          </h2>
        )}
        {subtitle && (
          <div
            className="text-gray-700 mb-6"
            style={{ fontSize: "var(--font-size-body)" }}
          >
            {subtitle}
          </div>
        )}
        {children && <div>{children}</div>}
      </div>
    </section>
  );
}
