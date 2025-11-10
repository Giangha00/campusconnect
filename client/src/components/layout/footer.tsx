import { Link } from "wouter";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { safeUrl } from "@/components/common/safe-text";

export function Footer() {
  const address = "13 Trinh Van Bo, Xuan Phuong, Nam Tu Liem, Hanoi, Vietnam";
  const mapsQuery = encodeURIComponent(address);
  const mapsUrlRaw = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}&hl=en`;
  const mapsEmbedRaw = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1331.8859212928248!2d105.74562903738041!3d21.037764385158315!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3134552afb2bc2b9%3A0xf94b886472c56b9e!2zRlBUIEFwdGVjaCAtIEjhu4cgdGjhu5FuZyDEkcOgbyB04bqhbyBM4bqtcCB0csOsbmggdmnDqm4gUXXhu5FjIHThur8!5e0!3m2!1svi!2s!4v1762774839810!5m2!1svi!2s`;
  const mapsUrl = safeUrl(mapsUrlRaw, undefined, true) || mapsUrlRaw;
  const mapsEmbed = safeUrl(mapsEmbedRaw, undefined, true) || mapsEmbedRaw;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-bold mb-4">CampusConnect</h3>
            <p className="text-primary-foreground/80 mb-4">
              Your gateway to campus events and activities. Stay connected, stay
              informed.
            </p>
            <div className="flex space-x-4">
              <a
                href={
                  safeUrl(
                    "https://facebook.com/campusconnect",
                    undefined,
                    true
                  ) || "#"
                }
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                data-testid="link-social-facebook"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={
                  safeUrl(
                    "https://twitter.com/campusconnect",
                    undefined,
                    true
                  ) || "#"
                }
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                data-testid="link-social-twitter"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href={
                  safeUrl(
                    "https://instagram.com/campusconnect",
                    undefined,
                    true
                  ) || "#"
                }
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                data-testid="link-social-instagram"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={
                  safeUrl(
                    "https://linkedin.com/company/campusconnect",
                    undefined,
                    true
                  ) || "#"
                }
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                data-testid="link-social-linkedin"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" data-testid="link-footer-home">
                  <span className="text-primary-foreground/80 hover:text-primary-foreground hover:underline underline-offset-4 transition-colors">
                    Home
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/about" data-testid="link-footer-about">
                  <span className="text-primary-foreground/80 hover:text-primary-foreground hover:underline underline-offset-4 transition-colors">
                    About
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/events" data-testid="link-footer-events">
                  <span className="text-primary-foreground/80 hover:text-primary-foreground hover:underline underline-offset-4 transition-colors">
                    Events
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/gallery" data-testid="link-footer-gallery">
                  <span className="text-primary-foreground/80 hover:text-primary-foreground hover:underline underline-offset-4 transition-colors">
                    Gallery
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Event Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Event Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/events?category=academic"
                  data-testid="link-footer-category-academic"
                  onClick={scrollToTop}
                >
                  <span className="text-primary-foreground/80 hover:text-primary-foreground hover:underline underline-offset-4 transition-colors">
                    Academic Events
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/events?category=cultural"
                  data-testid="link-footer-category-cultural"
                  onClick={scrollToTop}
                >
                  <span className="text-primary-foreground/80 hover:text-primary-foreground hover:underline underline-offset-4 transition-colors">
                    Cultural Events
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/events?category=sports"
                  data-testid="link-footer-category-sports"
                  onClick={scrollToTop}
                >
                  <span className="text-primary-foreground/80 hover:text-primary-foreground hover:underline underline-offset-4 transition-colors">
                    Sports Events
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/events?category=technical"
                  data-testid="link-footer-category-technical"
                  onClick={scrollToTop}
                >
                  <span className="text-primary-foreground/80 hover:text-primary-foreground hover:underline underline-offset-4 transition-colors">
                    Technical Events
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3 text-primary-foreground/80">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>
                  13 Trinh Van Bo, Xuan Phuong, Nam Tu Liem, Hanoi, Vietnam
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+1 (555) 154-7896</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>aptech.fpt@fe.edu.vn</span>
              </li>
            </ul>
            <div className="mt-4">
              <div className="relative w-full h-32 md:h-36 rounded-md overflow-hidden border border-primary-foreground/20">
                <iframe
                  src={mapsEmbed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 w-full h-full"
                  title="CampusConnect location map"
                />
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open in Google Maps"
                  className="absolute inset-0"
                />
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm underline underline-offset-4 text-primary-foreground/90 hover:text-primary-foreground"
                data-testid="link-footer-map"
              >
                View on Google Maps
              </a>
            </div>
          </div>
        </div>

        <hr className="border-primary-foreground/20 my-8" />

        <div className="text-center text-primary-foreground/80">
          <p>&copy; 2025 CampusConnect College. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
