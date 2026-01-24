export default function InformationCard({ content }) {
  return (
    <div
      className="rounded-2xl p-8 hover:shadow-lg transition-shadow flex items-center justify-center h-full min-h-[180px]"
      style={{ background: "var(--brand-secondary)" }}
    >
      <p
        className="font-semibold leading-relaxed text-center"
        style={{
          fontSize: "var(--font-size-body)",
          color: "var(--text-primary)",
        }}
      >
        {content}
      </p>
    </div>
  );
}
