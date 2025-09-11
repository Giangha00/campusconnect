import { Link } from 'wouter';
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-bold mb-4">CampusConnect</h3>
            <p className="text-primary-foreground/80 mb-4">
              Your gateway to campus events and activities. Stay connected, stay informed.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com/campusconnect"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                data-testid="link-social-facebook"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/campusconnect"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                data-testid="link-social-twitter"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/campusconnect"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                data-testid="link-social-instagram"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com/company/campusconnect"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                data-testid="link-social-linkedin"
                aria-label="LinkedIn"
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
            <ul className="space-y-2 text-primary-foreground/80">
              <li>Academic Events</li>
              <li>Cultural Events</li>
              <li>Sports Events</li>
              <li>Technical Events</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3 text-primary-foreground/80">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>13 College Street, Education City, EC 14953</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+1 (555) 154-7896</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>info@campusconnect.edu</span>
              </li>
            </ul>
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
