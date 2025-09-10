import React from "react";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";

const About = () => {
  // Sample school information
  const schoolInfo = {
    name: "University of Technology & Innovation",
    location: "Tech City, Innovation State 12345",
    established: "1985",
    affiliation: "Accredited by the National Board of Education",
    achievements: [
      "Ranked #1 in Technology Education",
      "Awarded 'Best Campus Community' 2023",
      "500+ Industry Partnerships",
      "95% Student Satisfaction Rate",
    ],
  };

  // Sample annual events
  const annualEvents = [
    {
      id: 1,
      name: "TechFest",
      month: "March",
      description:
        "Annual technology festival featuring workshops, hackathons, and industry speakers",
      category: "Technical",
    },
    {
      id: 2,
      name: "Cultural Week",
      month: "April",
      description:
        "Celebration of diversity with music, dance, food, and cultural performances",
      category: "Cultural",
    },
    {
      id: 3,
      name: "Sports Meet",
      month: "September",
      description:
        "Annual sports competition with athletics, team sports, and fun activities",
      category: "Sports",
    },
    {
      id: 4,
      name: "Research Symposium",
      month: "October",
      description:
        "Showcase of student and faculty research projects and innovations",
      category: "Academic",
    },
    {
      id: 5,
      name: "Alumni Reunion",
      month: "November",
      description:
        "Annual gathering of alumni with networking and career guidance sessions",
      category: "Networking",
    },
    {
      id: 6,
      name: "Winter Festival",
      month: "December",
      description:
        "Holiday celebration with music, food, and winter-themed activities",
      category: "Cultural",
    },
  ];

  // Sample departments/clubs
  const departments = [
    {
      name: "Computer Science Department",
      description:
        "Organizes technical workshops, coding competitions, and AI/ML events",
      events: ["Hackathon", "Tech Talks", "Code Review Sessions"],
      image:
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop",
    },
    {
      name: "Cultural Society",
      description:
        "Promotes cultural diversity through music, dance, and art events",
      events: ["Cultural Night", "Art Exhibition", "Music Festival"],
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop",
    },
    {
      name: "Sports Club",
      description:
        "Manages all sports activities, tournaments, and fitness programs",
      events: ["Sports Day", "Inter-college Tournament", "Fitness Challenge"],
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
    },
    {
      name: "Entrepreneurship Cell",
      description:
        "Fosters innovation and startup culture through workshops and competitions",
      events: [
        "Startup Pitch",
        "Business Plan Competition",
        "Mentorship Program",
      ],
      image:
        "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=300&h=200&fit=crop",
    },
    {
      name: "Environmental Club",
      description:
        "Raises awareness about sustainability and environmental issues",
      events: ["Green Week", "Tree Plantation", "Sustainability Workshop"],
      image:
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&h=200&fit=crop",
    },
    {
      name: "Literary Society",
      description:
        "Promotes reading, writing, and literary discussions among students",
      events: ["Poetry Slam", "Book Club", "Writing Workshop"],
      image:
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop",
    },
  ];

  const getCategoryColor = (category) => {
    const colors = {
      Technical: "primary",
      Cultural: "success",
      Sports: "warning",
      Academic: "info",
      Networking: "secondary",
    };
    return colors[category] || "light";
  };

  return (
    <div>
      {/* School Information Section */}
      <section className="section-padding">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <div className="text-center mb-5">
                <h1 className="section-title">{schoolInfo.name}</h1>
                <p className="lead text-muted">
                  {schoolInfo.location} • Established {schoolInfo.established}
                </p>
                <p className="text-muted">{schoolInfo.affiliation}</p>
              </div>

              <Row className="mb-5">
                <Col md={6} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="text-center p-4">
                      <div className="display-4 text-primary mb-3">
                        <i className="fas fa-university"></i>
                      </div>
                      <h5 className="text-primary">Our Mission</h5>
                      <p className="text-muted">
                        To provide a vibrant campus environment that fosters
                        learning, innovation, and community engagement through
                        diverse events and activities.
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="text-center p-4">
                      <div className="display-4 text-warning mb-3">
                        <i className="fas fa-users"></i>
                      </div>
                      <h5 className="text-primary">Our Vision</h5>
                      <p className="text-muted">
                        To be the leading platform for campus community
                        building, creating lasting connections and memorable
                        experiences for all students.
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <div className="text-center mb-5">
                <h3 className="text-primary mb-4">Key Achievements</h3>
                <Row>
                  {schoolInfo.achievements.map((achievement, index) => (
                    <Col md={6} lg={3} className="mb-3" key={index}>
                      <div className="p-3 bg-light rounded-3">
                        <i className="fas fa-trophy text-warning me-2"></i>
                        <small className="text-muted">{achievement}</small>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Annual Events Section */}
      <section className="section-padding bg-light">
        <Container>
          <Row>
            <Col lg={12} className="text-center mb-5">
              <h2 className="section-title">Annual Events</h2>
              <p className="text-muted">
                Our campus hosts a variety of exciting events throughout the
                year
              </p>
            </Col>
          </Row>
          <Row>
            {annualEvents.map((event, index) => (
              <Col lg={4} md={6} className="mb-4" key={event.id}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <Badge
                        bg={getCategoryColor(event.category)}
                        className="mb-2"
                      >
                        {event.category}
                      </Badge>
                      <div className="text-primary fw-bold fs-4">
                        {event.month}
                      </div>
                    </div>
                    <Card.Title className="h5 text-primary mb-3">
                      {event.name}
                    </Card.Title>
                    <Card.Text className="text-muted">
                      {event.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Departments & Clubs Section */}
      <section className="section-padding">
        <Container>
          <Row>
            <Col lg={12} className="text-center mb-5">
              <h2 className="section-title">Departments & Clubs</h2>
              <p className="text-muted">
                Various departments and student clubs that organize amazing
                events
              </p>
            </Col>
          </Row>
          <Row>
            {departments.map((dept, index) => (
              <Col lg={4} md={6} className="mb-4" key={index}>
                <Card className="h-100 border-0 shadow-sm">
                  <div className="position-relative">
                    <Card.Img
                      variant="top"
                      src={dept.image}
                      alt={dept.name}
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <div className="position-absolute top-0 start-0 m-3">
                      <Badge bg="primary" className="opacity-90">
                        {dept.events.length} Events
                      </Badge>
                    </div>
                  </div>
                  <Card.Body className="p-4">
                    <Card.Title className="h5 text-primary mb-3">
                      {dept.name}
                    </Card.Title>
                    <Card.Text className="text-muted mb-3">
                      {dept.description}
                    </Card.Text>
                    <div>
                      <h6 className="text-primary mb-2">Popular Events:</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {dept.events.map((event, eventIndex) => (
                          <Badge
                            key={eventIndex}
                            bg="light"
                            text="dark"
                            className="border"
                          >
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Call to Action Section */}
      <section className="section-padding bg-primary text-white">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h2 className="text-white mb-4">Join Our Community</h2>
              <p className="lead mb-4">
                Be part of our vibrant campus community and create unforgettable
                memories through our diverse range of events and activities.
              </p>
              <div className="d-flex gap-3 justify-content-center">
                <button className="btn btn-warning btn-lg px-4">
                  Explore Events
                </button>
                <button className="btn btn-outline-light btn-lg px-4">
                  Join a Club
                </button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default About;
