import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userType: "",
    eventAttended: "",
    rating: "",
    comments: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);

  // Sample events for dropdown
  const events = [
    "TechFest 2024",
    "Cultural Week",
    "Sports Meet",
    "Research Symposium",
    "Startup Pitch Competition",
    "Art Exhibition",
    "Environmental Workshop",
    "Music Festival",
    "Basketball Tournament",
    "Other",
  ];

  const userTypes = ["Student", "Faculty", "Visitor"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    console.log("Feedback submitted:", formData);
    setShowSuccess(true);
    // Reset form
    setFormData({
      name: "",
      email: "",
      userType: "",
      eventAttended: "",
      rating: "",
      comments: "",
    });
    // Hide success message after 5 seconds
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const isFormValid = () => {
    return (
      formData.name &&
      formData.email &&
      formData.userType &&
      formData.eventAttended &&
      formData.rating &&
      formData.comments
    );
  };

  return (
    <div>
      {/* Header Section */}
      <section className="section-padding bg-primary text-white">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h1 className="display-4 fw-bold mb-4">Feedback</h1>
              <p className="lead">
                Your feedback helps us improve our events and services. We value
                your opinion and use it to make CampusConnect even better.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Feedback Form Section */}
      <section className="section-padding">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              {showSuccess && (
                <Alert variant="success" className="mb-4">
                  <Alert.Heading>Thank you for your feedback!</Alert.Heading>
                  <p>
                    Your feedback has been submitted successfully. We appreciate
                    you taking the time to share your thoughts with us.
                  </p>
                </Alert>
              )}

              <Card className="border-0 shadow-lg">
                <Card.Header className="bg-primary text-white text-center py-4">
                  <h3 className="mb-0">
                    <i className="fas fa-comment-dots me-2"></i>
                    Share Your Experience
                  </h3>
                </Card.Header>
                <Card.Body className="p-5">
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">
                            <i className="fas fa-user me-2 text-primary"></i>
                            Full Name *
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">
                            <i className="fas fa-envelope me-2 text-primary"></i>
                            Email Address *
                          </Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email address"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">
                            <i className="fas fa-users me-2 text-primary"></i>
                            User Type *
                          </Form.Label>
                          <Form.Select
                            name="userType"
                            value={formData.userType}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select your role</option>
                            {userTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">
                            <i className="fas fa-calendar-alt me-2 text-primary"></i>
                            Event Attended *
                          </Form.Label>
                          <Form.Select
                            name="eventAttended"
                            value={formData.eventAttended}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select an event</option>
                            {events.map((event) => (
                              <option key={event} value={event}>
                                {event}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        <i className="fas fa-star me-2 text-warning"></i>
                        Overall Rating *
                      </Form.Label>
                      <div className="d-flex gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Form.Check
                            key={star}
                            type="radio"
                            name="rating"
                            value={star}
                            id={`rating-${star}`}
                            checked={formData.rating === star.toString()}
                            onChange={handleInputChange}
                            className="d-none"
                          />
                        ))}
                        <div className="d-flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <label
                              key={star}
                              htmlFor={`rating-${star}`}
                              className="star-rating"
                              style={{
                                fontSize: "2rem",
                                color:
                                  star <= parseInt(formData.rating)
                                    ? "#fbbf24"
                                    : "#e5e7eb",
                                cursor: "pointer",
                                transition: "color 0.2s ease",
                              }}
                            >
                              ★
                            </label>
                          ))}
                        </div>
                        <span className="ms-3 text-muted">
                          {formData.rating
                            ? `${formData.rating} out of 5`
                            : "Select a rating"}
                        </span>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        <i className="fas fa-comment me-2 text-primary"></i>
                        Comments *
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="comments"
                        value={formData.comments}
                        onChange={handleInputChange}
                        placeholder="Please share your detailed feedback about the event. What did you like? What could be improved?"
                        required
                      />
                      <Form.Text className="text-muted">
                        Minimum 10 characters required
                      </Form.Text>
                    </Form.Group>

                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      <Button
                        type="button"
                        variant="outline-secondary"
                        size="lg"
                        className="me-md-2"
                        onClick={() => {
                          setFormData({
                            name: "",
                            email: "",
                            userType: "",
                            eventAttended: "",
                            rating: "",
                            comments: "",
                          });
                        }}
                      >
                        Clear Form
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={!isFormValid()}
                      >
                        <i className="fas fa-paper-plane me-2"></i>
                        Submit Feedback
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Additional Information Section */}
      <section className="section-padding bg-light">
        <Container>
          <Row>
            <Col lg={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="display-4 text-primary mb-3">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <h5 className="text-primary">Privacy Protected</h5>
                  <p className="text-muted">
                    Your feedback is confidential and will only be used to
                    improve our services.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="display-4 text-warning mb-3">
                    <i className="fas fa-clock"></i>
                  </div>
                  <h5 className="text-primary">Quick Response</h5>
                  <p className="text-muted">
                    We review all feedback and respond to important suggestions
                    within 48 hours.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="display-4 text-success mb-3">
                    <i className="fas fa-heart"></i>
                  </div>
                  <h5 className="text-primary">We Value You</h5>
                  <p className="text-muted">
                    Your opinion matters to us and helps shape the future of
                    campus events.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Feedback;
