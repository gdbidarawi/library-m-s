import React from 'react';

const Footer = () => (
  <footer style={{ textAlign: 'center', padding: '16px', fontSize: 12, color: 'var(--text-muted)' }}>
    © {new Date().getFullYear()} Library Management System — Final Year Thesis Project (MERN Stack)
  </footer>
);

export default Footer;
