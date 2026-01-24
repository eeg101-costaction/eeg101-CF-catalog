import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full mt-28" style={{ backgroundColor: "#76A6E6" }}>
      {/* Main Footer Content */}
      <div className="px-10 py-4">
        <div className="grid grid-cols-4 gap-12 mb-6">
          {/* Identity Section */}
          <div>
            <h3
              className="font-bold mb-3"
              style={{ color: "var(--text-tertiary)" }}
            >
              Identity
            </h3>
            <p
              className="space-y-2"
              style={{
                color: "var(--text-secondary)",
                fontSize: "var(--font-size-small)",
              }}
            >
              EEG101 WorkingGroup3.
            </p>
            <div className="flex gap-2">
              <Image
                src="/assets/icons/logo%20CNRS.png"
                alt="CNRS"
                width={32}
                height={32}
                className="w-8 h-8"
              />
            </div>
          </div>

          <div>
            <h3
              className="font-bold mb-3"
              style={{ color: "var(--text-tertiary)" }}
            >
              Menu
            </h3>
            <ul
              className="space-y-2"
              style={{
                color: "var(--text-secondary)",
                fontSize: "var(--font-size-small)",
              }}
            >
              <li>
                <Link href="/" className="hover:text-gray-900 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="hover:text-gray-900 transition"
                >
                  Resources
                </Link>
              </li>
              <li>
                <a href="/about" className="hover:text-gray-900 transition">
                  About us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3
              className="font-bold mb-3"
              style={{ color: "var(--text-tertiary)" }}
            >
              Contact
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "var(--font-size-small)",
              }}
            >
              Email:{" "}
              <a
                href="mailto:eegcf@proton.me"
                style={{ color: "var(--text-primary)" }}
              >
                eegcf@proton.me
              </a>
            </p>
          </div>

          <div>
            <h3
              className="font-bold mb-3"
              style={{ color: "var(--text-tertiary)" }}
            >
              Follow Us
            </h3>
            <div className="flex gap-3">
              <a
                href="https://twitter.com/cnrs"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition"
              >
                <svg
                  className="w-5 h-5 text-gray-800"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 9-1 9-5.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/cnrs"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition"
              >
                <svg
                  className="w-5 h-5 text-gray-800"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-6 flex justify-between items-center text-xs text-gray-800">
          <p className="flex-1">© 2025 CNRS - All rights reserved.</p>
          <div className="flex gap-2 justify-center flex-1">
            <a href="#" className="hover:text-gray-900 transition">
              Legal Notice
            </a>
            <span>|</span>
            <a href="#" className="hover:text-gray-900 transition">
              Privacy Policy
            </a>
            <span>|</span>
            <a href="#" className="hover:text-gray-900 transition">
              Sitemap
            </a>
          </div>
          <p className="flex-1 text-right">
            Website by Floria Léger and Sofia Sojic.
          </p>
        </div>
      </div>
    </footer>
  );
}
