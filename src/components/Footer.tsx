import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-background/10 rounded-lg flex items-center justify-center">
                <span className="text-lg font-heading font-bold">IJ</span>
              </div>
              <span className="font-heading font-bold">IJAMR</span>
            </div>
            <p className="text-background/70 text-sm leading-relaxed">
              International Journal of Applied Medical Research - an international scientific journals platform. 
              Publishing quality research and uniting the scholarly community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Editorial Board
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Publication Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Open Access
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Ethics Guidelines
                </a>
              </li>
            </ul>
          </div>

          {/* For Authors */}
          <div>
            <h4 className="font-heading font-bold mb-4">For Authors</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Submit Article
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Author Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Review Process
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Publication Fees
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors flex items-center gap-1">
                  <span>Article Status</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-bold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-background/50" />
                <span className="text-background/70">
                  123 Research Avenue, New York, NY 10001, USA
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-background/50" />
                <a href="tel:+12345678901" className="text-background/70 hover:text-background transition-colors">
                  +1 (234) 567-8901
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-background/50" />
                <a href="mailto:info@ijamr.com" className="text-background/70 hover:text-background transition-colors">
                  info@ijamr.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-background/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-sm">
            © 2024 International Journal of Applied Medical Research. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-background/50 hover:text-background transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-background/50 hover:text-background transition-colors">
              Terms of Use
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
