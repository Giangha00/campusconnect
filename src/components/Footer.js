import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-5 mt-5">
      <Container>
        <Row>
          <Col lg={4} md={6} className="mb-4">
            <h5 className="text-warning mb-3">CampusConnect</h5>
            <p className="text-light-emphasis">
              Your gateway to campus events, activities, and community
              engagement. Stay connected with the latest happenings at our
              university.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-warning fs-4">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="text-warning fs-4">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-warning fs-4">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-warning fs-4">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </Col>

          <Col lg={2} md={6} className="mb-4">
            <h6 className="text-warning mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link
                  to="/"
                  className="text-light-emphasis text-decoration-none"
                >
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/about"
                  className="text-light-emphasis text-decoration-none"
                >
                  About
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/events"
                  className="text-light-emphasis text-decoration-none"
                >
                  Events
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/gallery"
                  className="text-light-emphasis text-decoration-none"
                >
                  Gallery
                </Link>
              </li>
            </ul>
          </Col>

          <Col lg={3} md={6} className="mb-4">
            <h6 className="text-warning mb-3">Contact Info</h6>
            <div className="text-light-emphasis">
              <p className="mb-2">
                <i className="fas fa-map-marker-alt text-warning me-2"></i>
                University Campus, City, State 12345
              </p>
              <p className="mb-2">
                <i className="fas fa-phone text-warning me-2"></i>
                +1 (555) 123-4567
              </p>
              <p className="mb-2">
                <i className="fas fa-envelope text-warning me-2"></i>
                info@campusconnect.edu
              </p>
            </div>
          </Col>

          <Col lg={3} md={6} className="mb-4">
            <h6 className="text-warning mb-3">Newsletter</h6>
            <p className="text-light-emphasis mb-3">
              Subscribe to get updates about upcoming events and activities.
            </p>
            <div className="input-group">
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                aria-label="Email"
              />
              <button className="btn btn-warning" type="button">
                Subscribe
              </button>
            </div>
          </Col>
        </Row>

        <hr className="my-4" />

        <Row>
          <Col md={6}>
            <p className="text-light-emphasis mb-0">
              &copy; 2024 CampusConnect. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <Link
              to="/contact"
              className="text-light-emphasis text-decoration-none me-3"
            >
              Contact Us
            </Link>
            <a href="#" className="text-light-emphasis text-decoration-none">
              Privacy Policy
            </a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
