import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/types/project";
import type { CompanyInfoContent } from "@/lib/data/site-content";

export default function Footer({
  projects,
  companyInfo,
}: {
  projects: Project[];
  companyInfo: CompanyInfoContent;
}) {
  return (
    <footer className="bg-charcoal text-white">
      <div className="container-custom py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Image
                src="/logo-crg.png"
                alt="CRG | Crafted Residential Group"
                width={160}
                height={58}
                className="h-12 w-auto brightness-0 invert"
              />
            </div>
            <p className="font-sans text-sm text-white/40 leading-relaxed max-w-sm">
              {companyInfo.brandDescription}
            </p>
            <div className="mt-8 flex flex-col gap-2 text-sm text-white/30 font-sans">
              <span>{companyInfo.address}</span>
              <a href={`mailto:${companyInfo.email}`}
                 className="hover:text-crg-red transition-colors">
                {companyInfo.email}
              </a>
              <a href={`tel:${companyInfo.phone.replace(/\s+/g, "")}`}
                 className="hover:text-crg-red transition-colors">
                {companyInfo.phone}
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-sans text-[10px] tracking-[0.3em] uppercase text-crg-red mb-6">
              Navigazione
            </h3>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Home",      href: "/" },
                { label: "Chi siamo", href: "/chi-siamo" },
                { label: "Progetti",  href: "/progetti" },
                { label: "Contatti",  href: "/contatti" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-white/40 hover:text-crg-red transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Projects */}
          <div>
            <h3 className="font-sans text-[10px] tracking-[0.3em] uppercase text-crg-red mb-6">
              Progetti
            </h3>
            <ul className="flex flex-col gap-3">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/progetti/${project.slug}`}
                    className="font-sans text-sm text-white/40 hover:text-crg-red transition-colors"
                  >
                    {project.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-xs text-white/20">
            © {new Date().getFullYear()} CRG | Crafted Residential Group. Tutti i diritti riservati.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="font-sans text-xs text-white/20 hover:text-crg-red transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="font-sans text-xs text-white/20 hover:text-crg-red transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
