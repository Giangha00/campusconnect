import React, { useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Dropdown,
  Badge,
} from "react-bootstrap";

const Events = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date");

  // Sample events data
  const events = [
    {
      id: 1,
      title: "TechFest 2024",
      date: "2024-03-15",
      time: "9:00 AM - 6:00 PM",
      venue: "Main Auditorium",
      description:
        "Annual technology festival featuring workshops, competitions, and keynote speakers from leading tech companies.",
      image:
        "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=250&fit=crop",
      category: "Technical",
      status: "upcoming",
    },
    {
      id: 2,
      title: "Cultural Week",
      date: "2024-03-22",
      time: "10:00 AM - 8:00 PM",
      venue: "Cultural Center",
      description:
        "Celebrate diversity with music, dance, food, and cultural performances from around the world.",
      image:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=250&fit=crop",
      category: "Cultural",
      status: "upcoming",
    },
    {
      id: 3,
      title: "Sports Meet",
      date: "2024-03-29",
      time: "8:00 AM - 5:00 PM",
      venue: "Sports Complex",
      description:
        "Annual sports competition featuring athletics, team sports, and fun activities for all students.",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop",
      category: "Sports",
      status: "upcoming",
    },
    {
      id: 4,
      title: "Research Symposium",
      date: "2024-04-05",
      time: "9:00 AM - 4:00 PM",
      venue: "Research Center",
      description:
        "Showcase of student and faculty research projects and innovations across various disciplines.",
      image:
        "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=250&fit=crop",
      category: "Academic",
      status: "upcoming",
    },
    {
      id: 5,
      title: "Startup Pitch Competition",
      date: "2024-04-12",
      time: "2:00 PM - 6:00 PM",
      venue: "Innovation Hub",
      description:
        "Entrepreneurship competition where students pitch their innovative business ideas to industry experts.",
      image:
        "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=250&fit=crop",
      category: "Technical",
      status: "upcoming",
    },
    {
      id: 6,
      title: "Art Exhibition",
      date: "2024-04-19",
      time: "11:00 AM - 7:00 PM",
      venue: "Art Gallery",
      description:
        "Exhibition showcasing student artwork, photography, and creative projects from various art programs.",
      image:
        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=250&fit=crop",
      category: "Cultural",
      status: "upcoming",
    },
    {
      id: 7,
      title: "Environmental Awareness Workshop",
      date: "2024-04-26",
      time: "10:00 AM - 2:00 PM",
      venue: "Green Campus Center",
      description:
        "Interactive workshop on sustainability, climate change, and environmental conservation practices.",
      image:
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=250&fit=crop",
      category: "Academic",
      status: "upcoming",
    },
    {
      id: 8,
      title: "Music Festival",
      date: "2024-05-03",
      time: "6:00 PM - 11:00 PM",
      venue: "Open Air Theater",
      description:
        "Live music performances by student bands, solo artists, and guest musicians from the local community.",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop",
      category: "Cultural",
      status: "upcoming",
    },
    {
      id: 9,
      title: "Basketball Tournament",
      date: "2024-05-10",
      time: "9:00 AM - 6:00 PM",
      venue: "Sports Complex",
      description:
        "Inter-department basketball tournament with exciting matches and championship finals.",
      image:
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=250&fit=crop",
      category: "Sports",
      status: "upcoming",
    },
  ];

  const categories = ["All", "Technical", "Cultural", "Sports", "Academic"];

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (event) => event.category === selectedCategory
      );
    }

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(a.date) - new Date(b.date);
        case "name":
          return a.title.localeCompare(b.title);
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, sortBy]);

  const getCategoryColor = (category) => {
    const colors = {
      Technical: "primary",
      Cultural: "success",
      Sports: "warning",
      Academic: "info",
    };
    return colors[category] || "secondary";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div>
      {/* Header Section */}
      <section className="section-padding bg-primary text-white">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h1 className="display-4 fw-bold mb-4">Campus Events</h1>
              <p className="lead">
                Discover and join exciting events happening on campus. From
                technical workshops to cultural celebrations, there's something
                for everyone.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Filters and Search Section */}
      <section className="py-4 bg-light border-bottom">
        <Container>
          <Row className="align-items-center">
            <Col lg={4} className="mb-3 mb-lg-0">
              <InputGroup>
                <InputGroup.Text>
                  <i className="fas fa-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col lg={3} className="mb-3 mb-lg-0">
              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" className="w-100">
                  Category: {selectedCategory}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {categories.map((category) => (
                    <Dropdown.Item
                      key={category}
                      active={selectedCategory === category}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Col>
            <Col lg={3} className="mb-3 mb-lg-0">
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" className="w-100">
                  Sort by:{" "}
                  {sortBy === "date"
                    ? "Date"
                    : sortBy === "name"
                    ? "Name"
                    : "Category"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item
                    active={sortBy === "date"}
                    onClick={() => setSortBy("date")}
                  >
                    Date
                  </Dropdown.Item>
                  <Dropdown.Item
                    active={sortBy === "name"}
                    onClick={() => setSortBy("name")}
                  >
                    Event Name
                  </Dropdown.Item>
                  <Dropdown.Item
                    active={sortBy === "category"}
                    onClick={() => setSortBy("category")}
                  >
                    Category
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
            <Col lg={2} className="text-lg-end">
              <small className="text-muted">
                {filteredAndSortedEvents.length} events found
              </small>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Events Grid Section */}
      <section className="section-padding">
        <Container>
          {filteredAndSortedEvents.length === 0 ? (
            <Row>
              <Col className="text-center py-5">
                <div className="display-1 text-muted mb-3">
                  <i className="fas fa-calendar-times"></i>
                </div>
                <h3 className="text-muted">No events found</h3>
                <p className="text-muted">
                  Try adjusting your search criteria or filters to find more
                  events.
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                    setSortBy("date");
                  }}
                >
                  Clear Filters
                </Button>
              </Col>
            </Row>
          ) : (
            <Row>
              {filteredAndSortedEvents.map((event) => (
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
                        <Badge bg={getCategoryColor(event.category)}>
                          {event.category}
                        </Badge>
                      </div>
                      <div className="position-absolute top-0 end-0 m-3">
                        <Badge bg="success">{event.status}</Badge>
                      </div>
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="h5 text-primary mb-3">
                        {event.title}
                      </Card.Title>

                      <div className="mb-3">
                        <div className="text-muted mb-1">
                          <i className="fas fa-calendar-alt me-2"></i>
                          <strong>{formatDate(event.date)}</strong>
                        </div>
                        <div className="text-muted mb-1">
                          <i className="fas fa-clock me-2"></i>
                          {event.time}
                        </div>
                        <div className="text-muted">
                          <i className="fas fa-map-marker-alt me-2"></i>
                          {event.venue}
                        </div>
                      </div>

                      <Card.Text className="text-muted flex-grow-1">
                        {event.description}
                      </Card.Text>

                      <div className="d-grid gap-2 mt-auto">
                        <Button variant="primary">View Details</Button>
                        <Button variant="outline-primary">Register Now</Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>

      {/* Call to Action Section */}
      <section className="section-padding bg-light">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h2 className="text-primary mb-4">
                Don't See What You're Looking For?
              </h2>
              <p className="text-muted mb-4">
                Have an idea for an event? Want to organize something special?
                We're always looking for new and exciting events to add to our
                calendar.
              </p>
              <div className="d-flex gap-3 justify-content-center">
                <Button variant="primary" size="lg">
                  Suggest an Event
                </Button>
                <Button variant="outline-primary" size="lg">
                  Contact Organizers
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Events;
