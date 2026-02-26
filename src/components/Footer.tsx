import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card py-16">
      <div className="container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="text-lg font-bold text-primary tracking-[0.3em] uppercase font-sans">
              Cedar
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Specialist property insurance for landlords and tenants. Fast quotes, comprehensive cover, expert support.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-foreground mb-4 font-sans">Products</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Landlord Insurance</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Tenant Insurance</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Rent Guarantee</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Liability Cover</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-foreground mb-4 font-sans">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Claims</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-foreground mb-4 font-sans">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Complaints</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Cedar Insurance MGA. All rights reserved.</p>
          <p className="mt-1">Cedar is a trading name. Authorised and regulated by the Financial Conduct Authority.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
