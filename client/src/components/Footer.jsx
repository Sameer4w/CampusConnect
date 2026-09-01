function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-content">
          <p className="footer-copyright">
            © {new Date().getFullYear()} CampusConnect.
            All rights reserved.
          </p>

          <p className="footer-credit">
            Designed and developed by{' '}
            <strong>Sameer</strong>
          </p>
        </div>

        <p className="footer-tech">
          Built with the MERN Stack
        </p>

      </div>
    </footer>
  );
}

export default Footer;