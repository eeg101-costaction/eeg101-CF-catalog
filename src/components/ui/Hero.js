export default function Hero({ title, subtitle, children }) {
  return (
    <section className="w-full bg-gray-50 py-35">
      <div className="container mx-auto px-50 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-10">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
          {subtitle}
        </p>
        {children && <div className="mt-20 flex justify-center">{children}</div>}
      </div>
    </section>
  );
}
