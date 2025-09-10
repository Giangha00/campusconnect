import React, { useState } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Navbar
      bg="primary"
      variant="dark"
      expand="lg"
      fixed="top"
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
      className="shadow"
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <img
            src="/logo192.png"
            width="40"
            height="40"
            className="d-inline-block align-top me-2"
            alt="CampusConnect Logo"
          />
          CampusConnect
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link
              as={Link}
              to="/"
              className={isActive("/") ? "active fw-semibold" : ""}
              onClick={() => setExpanded(false)}
            >
              Home
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/about"
              className={isActive("/about") ? "active fw-semibold" : ""}
              onClick={() => setExpanded(false)}
            >
              About
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/events"
              className={isActive("/events") ? "active fw-semibold" : ""}
              onClick={() => setExpanded(false)}
            >
              Events
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/gallery"
              className={isActive("/gallery") ? "active fw-semibold" : ""}
              onClick={() => setExpanded(false)}
            >
              Gallery
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/feedback"
              className={isActive("/feedback") ? "active fw-semibold" : ""}
              onClick={() => setExpanded(false)}
            >
              Feedback
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/contact"
              className={isActive("/contact") ? "active fw-semibold" : ""}
              onClick={() => setExpanded(false)}
            >
              Contact
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
