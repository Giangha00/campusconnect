import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

const Contact = () => {
  // Sample contact data for event coordinators/faculty
  const contacts = [
    {
      name: "Dr. Sarah Johnson",
      role: "Event Coordinator",
      department: "Student Affairs",
      phone: "+1 (555) 123-4567",
      email: "sarah.johnson@campusconnect.edu",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
    },
    {
      name: "Prof. Michael Chen",
      role: "Technical Events Director",
      department: "Computer Science",
      phone: "+1 (555) 234-5678",
      email: "michael.chen@campusconnect.edu",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    },
    {
      name: "Ms. Emily Rodriguez",
      role: "Cultural Events Manager",
      department: "Arts & Culture",
      phone: "+1 (555) 345-6789",
      email: "emily.rodriguez@campusconnect.edu",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    },
    {
      name: "Dr. James Wilson",
      role: "Sports Coordinator",
      department: "Physical Education",
      phone: "+1 (555) 456-7890",
      email: "james.wilson@campusconnect.edu",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    },
    {
      name: "Ms. Lisa Thompson",
      role: "Academic Events Specialist",
      department: "Academic Affairs",
      phone: "+1 (555) 567-8901",
      email: "lisa.thompson@campusconnect.edu",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
    },
    {
      name: "Mr. David Park",
      role: "Student Engagement Officer",
      department: "Student Life",
      phone: "+1 (555) 678-9012",
      email: "david.park@campusconnect.edu",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    },
  ];

  return (
    <div>
      {/* Header Section */}
      <section className="section-padding bg-primary text-white">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h1 className="display-4 fw-bold mb-4">Contact Us</h1>
              <p className="lead">
                Get in touch with our event coordinators and faculty members.
                We're here to help you with any questions about campus events
                and activities.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Contact Cards Section */}
      <section className="section-padding">
        <Container>
          <Row>
            <Col lg={12} className="text-center mb-5">
              <h2 className="section-title">Our Team</h2>
              <p className="text-muted">
                Meet the dedicated team members who organize and manage our
                campus events
              </p>
            </Col>
          </Row>
          <Row>
            {contacts.map((contact, index) => (
              <Col lg={4} md={6} className="mb-4" key={index}>
                <Card className="contact-card h-100">
                  <Card.Body className="text-center p-4">
                    <div className="mb-3">
                      <img
                        src={contact.image}
                        alt={contact.name}
                        className="rounded-circle"
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <h5 className="text-primary mb-2">{contact.name}</h5>
                    <h6 className="text-warning mb-2">{contact.role}</h6>
                    <p className="text-muted mb-3">{contact.department}</p>

                    <div className="contact-info">
                      <div className="mb-2">
                        <i className="fas fa-phone text-primary me-2"></i>
                        <small className="text-muted">{contact.phone}</small>
                      </div>
                      <div className="mb-3">
                        <i className="fas fa-envelope text-primary me-2"></i>
                        <small className="text-muted">{contact.email}</small>
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      <Button variant="outline-primary" size="sm">
                        <i className="fas fa-envelope me-1"></i>
                        Send Email
                      </Button>
                      <Button variant="outline-secondary" size="sm">
                        <i className="fas fa-phone me-1"></i>
                        Call Now
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Map Section */}
      <section className="section-padding bg-light">
        <Container>
          <Row>
            <Col lg={12} className="text-center mb-5">
              <h2 className="section-title">Find Us</h2>
              <p className="text-muted">
                Visit our campus and explore the beautiful facilities where our
                events take place
              </p>
            </Col>
          </Row>
          <Row>
            <Col lg={8} className="mx-auto">
              <Card className="border-0 shadow-lg">
                <Card.Body className="p-0">
                  {/* Embedded Google Map */}
                  <div
                    style={{
                      height: "400px",
                      background:
                        "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "1.2rem",
                    }}
                  >
                    <div className="text-center">
                      <i className="fas fa-map-marker-alt fa-3x mb-3"></i>
                      <h4>University Campus Location</h4>
                      <p className="mb-0">
                        University of Technology & Innovation
                        <br />
                        Tech City, Innovation State 12345
                        <br />
                        United States
                      </p>
                      <Button
                        variant="warning"
                        className="mt-3"
                        onClick={() =>
                          window.open("https://maps.google.com", "_blank")
                        }
                      >
                        <i className="fas fa-external-link-alt me-2"></i>
                        Open in Google Maps
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Quick Contact Section */}
      <section className="section-padding">
        <Container>
          <Row>
            <Col lg={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="contact-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <h5 className="text-primary mb-3">Visit Us</h5>
                  <p className="text-muted mb-3">
                    University of Technology & Innovation
                    <br />
                    Tech City, Innovation State 12345
                    <br />
                    United States
                  </p>
                  <Button variant="outline-primary">Get Directions</Button>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="contact-icon">
                    <i className="fas fa-phone"></i>
                  </div>
                  <h5 className="text-primary mb-3">Call Us</h5>
                  <p className="text-muted mb-3">
                    Main Office: +1 (555) 123-4567
                    <br />
                    Event Hotline: +1 (555) 987-6543
                    <br />
                    Emergency: +1 (555) 911-0000
                  </p>
                  <Button variant="outline-primary">Call Now</Button>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="contact-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <h5 className="text-primary mb-3">Email Us</h5>
                  <p className="text-muted mb-3">
                    General Info: info@campusconnect.edu
                    <br />
                    Events: events@campusconnect.edu
                    <br />
                    Support: support@campusconnect.edu
                  </p>
                  <Button variant="outline-primary">Send Email</Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Office Hours Section */}
      <section className="section-padding bg-primary text-white">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h2 className="text-white mb-4">Office Hours</h2>
              <Row>
                <Col md={6} className="mb-3">
                  <div className="p-3 bg-white bg-opacity-10 rounded-3">
                    <h5 className="text-warning">Monday - Friday</h5>
                    <p className="mb-0">8:00 AM - 6:00 PM</p>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="p-3 bg-white bg-opacity-10 rounded-3">
                    <h5 className="text-warning">Saturday</h5>
                    <p className="mb-0">9:00 AM - 4:00 PM</p>
                  </div>
                </Col>
              </Row>
              <p className="mt-4 mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Closed on Sundays and public holidays. Emergency contact
                available 24/7.
              </p>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Contact;
