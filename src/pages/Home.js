import React, { useState, useEffect } from "react";
import { Container, Row, Col, Carousel, Card, Button } from "react-bootstrap";

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Sample event data
  const upcomingEvents = [
    {
      id: 1,
      title: "TechFest 2024",
      date: "March 15, 2024",
      time: "9:00 AM - 6:00 PM",
      description:
        "Annual technology festival featuring workshops, competitions, and keynote speakers from leading tech companies.",
      image:
        "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=250&fit=crop",
      category: "Technical",
    },
    {
      id: 2,
      title: "Cultural Week",
      date: "March 22, 2024",
      time: "10:00 AM - 8:00 PM",
      description:
        "Celebrate diversity with music, dance, food, and cultural performances from around the world.",
      image:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=250&fit=crop",
      category: "Cultural",
    },
    {
      id: 3,
      title: "Sports Meet",
      date: "March 29, 2024",
      time: "8:00 AM - 5:00 PM",
      description:
        "Annual sports competition featuring athletics, team sports, and fun activities for all students.",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop",
      category: "Sports",
    },
  ];

  // Sample slideshow images
  const slideshowImages = [
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop",
    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=400&fit=crop",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop",
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="hero-content">
              <h1 className="display-4 fw-bold mb-4 fade-in">
                Welcome to the Event Hub
              </h1>
              <p className="lead mb-4 slide-in-left">
                Stay updated, join now! Discover amazing events, connect with
                your community, and make the most of your campus experience.
              </p>
              <div className="d-flex gap-3 slide-in-right">
                <Button variant="warning" size="lg" className="px-4">
                  Explore Events
                </Button>
                <Button variant="outline-light" size="lg" className="px-4">
                  Learn More
                </Button>
              </div>
            </Col>
            <Col lg={6}>
              <div className="slide-in-right">
                <Carousel
                  activeIndex={currentSlide}
                  onSelect={setCurrentSlide}
                  indicators={false}
                  controls={false}
                  interval={3000}
                >
                  {slideshowImages.map((image, index) => (
                    <Carousel.Item key={index}>
                      <img
                        className="d-block w-100 rounded-3 shadow-lg"
                        src={image}
                        alt={`Event slide ${index + 1}`}
                        style={{ height: "400px", objectFit: "cover" }}
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
                <div className="d-flex justify-content-center mt-3">
                  {slideshowImages.map((_, index) => (
                    <button
                      key={index}
                      className={`btn btn-sm mx-1 ${
                        currentSlide === index
                          ? "btn-warning"
                          : "btn-outline-warning"
                      }`}
                      onClick={() => setCurrentSlide(index)}
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        padding: 0,
                      }}
                    />
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Quick Intro Section */}
      <section className="section-padding bg-light">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <h2 className="section-title">About CampusConnect</h2>
              <p className="lead text-muted">
                CampusConnect is your one-stop destination for all campus events
                and activities. We bring together students, faculty, and the
                community through engaging events, cultural celebrations, and
                educational programs. Whether you're interested in technology,
                arts, sports, or academic pursuits, we have something exciting
                for everyone.
              </p>
              <p className="text-muted">
                Join thousands of students who have already discovered the power
                of campus community through our platform. Stay connected, stay
                informed, and make lasting memories.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Upcoming Events Section */}
      <section className="section-padding">
        <Container>
          <Row>
            <Col lg={12} className="text-center mb-5">
              <h2 className="section-title">Upcoming Events</h2>
              <p className="text-muted">
                Don't miss out on these exciting upcoming events. Mark your
                calendar and join us!
              </p>
            </Col>
          </Row>
          <Row>
            {upcomingEvents.map((event, index) => (
              <Col lg={4} md={6} className="mb-4" key={event.id}>
                <Card className="event-card h-100">
                  <div className="position-relative">
                    <Card.Img
                      variant="top"
                      src={event.image}
                      alt={event.title}
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <div className="position-absolute top-0 start-0 m-3">
                      <span className="event-date">{event.category}</span>
                    </div>
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="h5 text-primary">
                      {event.title}
                    </Card.Title>
                    <div className="text-muted mb-2">
                      <small>
                        <i className="fas fa-calendar-alt me-1"></i>
                        {event.date}
                      </small>
                    </div>
                    <div className="text-muted mb-3">
                      <small>
                        <i className="fas fa-clock me-1"></i>
                        {event.time}
                      </small>
                    </div>
                    <Card.Text className="text-muted flex-grow-1">
                      {event.description}
                    </Card.Text>
                    <Button variant="primary" className="mt-auto">
                      View Details
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <Row>
            <Col className="text-center mt-4">
              <Button variant="outline-primary" size="lg">
                View All Events
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-primary text-white">
        <Container>
          <Row className="text-center">
            <Col md={3} className="mb-4">
              <div className="h2 fw-bold text-warning">500+</div>
              <p className="mb-0">Events Organized</p>
            </Col>
            <Col md={3} className="mb-4">
              <div className="h2 fw-bold text-warning">10,000+</div>
              <p className="mb-0">Students Connected</p>
            </Col>
            <Col md={3} className="mb-4">
              <div className="h2 fw-bold text-warning">50+</div>
              <p className="mb-0">Clubs & Societies</p>
            </Col>
            <Col md={3} className="mb-4">
              <div className="h2 fw-bold text-warning">15+</div>
              <p className="mb-0">Departments</p>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;
