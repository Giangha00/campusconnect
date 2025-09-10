import React, { useState, useMemo } from "react";
import { Container, Row, Col, Modal, Dropdown, Badge } from "react-bootstrap";

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Sample gallery data
  const galleryImages = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&h=400&fit=crop",
      title: "TechFest 2024 Opening Ceremony",
      category: "Technical",
      year: "2023-24",
      description:
        "Students showcasing their innovative projects at the annual TechFest",
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop",
      title: "Cultural Week Performance",
      category: "Cultural",
      year: "2023-24",
      description:
        "Traditional dance performance during Cultural Week celebrations",
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
      title: "Sports Meet Champions",
      category: "Sports",
      year: "2023-24",
      description: "Winners of the annual sports meet receiving their medals",
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&h=400&fit=crop",
      title: "Research Symposium",
      category: "Academic",
      year: "2023-24",
      description:
        "Students presenting their research projects to faculty and peers",
    },
    {
      id: 5,
      src: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop",
      title: "Startup Pitch Competition",
      category: "Technical",
      year: "2023-24",
      description:
        "Entrepreneurial students pitching their innovative business ideas",
    },
    {
      id: 6,
      src: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=400&fit=crop",
      title: "Art Exhibition",
      category: "Cultural",
      year: "2023-24",
      description: "Student artwork displayed in the annual art exhibition",
    },
    {
      id: 7,
      src: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=400&fit=crop",
      title: "Environmental Workshop",
      category: "Academic",
      year: "2023-24",
      description:
        "Students learning about sustainability and environmental conservation",
    },
    {
      id: 8,
      src: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
      title: "Music Festival",
      category: "Cultural",
      year: "2023-24",
      description: "Live music performances by student bands and artists",
    },
    {
      id: 9,
      src: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop",
      title: "Basketball Tournament",
      category: "Sports",
      year: "2023-24",
      description:
        "Intense basketball action during the inter-department tournament",
    },
    {
      id: 10,
      src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop",
      title: "Graduation Ceremony",
      category: "Academic",
      year: "2022-23",
      description: "Graduating students celebrating their achievements",
    },
    {
      id: 11,
      src: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400&fit=crop",
      title: "Hackathon Winners",
      category: "Technical",
      year: "2022-23",
      description: "Winning team of the 48-hour coding competition",
    },
    {
      id: 12,
      src: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop",
      title: "Literary Society Meeting",
      category: "Cultural",
      year: "2022-23",
      description:
        "Students discussing literature and sharing their creative writing",
    },
  ];

  const years = ["All", "2023-24", "2022-23", "2021-22"];
  const categories = ["All", "Technical", "Cultural", "Sports", "Academic"];

  // Filter images based on selected filters
  const filteredImages = useMemo(() => {
    return galleryImages.filter((image) => {
      const yearMatch = selectedYear === "All" || image.year === selectedYear;
      const categoryMatch =
        selectedCategory === "All" || image.category === selectedCategory;
      return yearMatch && categoryMatch;
    });
  }, [selectedYear, selectedCategory]);

  const getCategoryColor = (category) => {
    const colors = {
      Technical: "primary",
      Cultural: "success",
      Sports: "warning",
      Academic: "info",
    };
    return colors[category] || "secondary";
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  return (
    <div>
      {/* Header Section */}
      <section className="section-padding bg-primary text-white">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h1 className="display-4 fw-bold mb-4">Event Gallery</h1>
              <p className="lead">
                Relive the memories of our amazing campus events through these
                beautiful photographs. From technical competitions to cultural
                celebrations, every moment captured.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Filters Section */}
      <section className="py-4 bg-light border-bottom">
        <Container>
          <Row className="align-items-center">
            <Col lg={4} className="mb-3 mb-lg-0">
              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" className="w-100">
                  Academic Year: {selectedYear}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {years.map((year) => (
                    <Dropdown.Item
                      key={year}
                      active={selectedYear === year}
                      onClick={() => setSelectedYear(year)}
                    >
                      {year}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Col>
            <Col lg={4} className="mb-3 mb-lg-0">
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" className="w-100">
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
            <Col lg={4} className="text-lg-end">
              <small className="text-muted">
                {filteredImages.length} photos found
              </small>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Gallery Grid Section */}
      <section className="section-padding">
        <Container>
          {filteredImages.length === 0 ? (
            <Row>
              <Col className="text-center py-5">
                <div className="display-1 text-muted mb-3">
                  <i className="fas fa-images"></i>
                </div>
                <h3 className="text-muted">No photos found</h3>
                <p className="text-muted">
                  Try adjusting your filters to see more photos from our
                  gallery.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedYear("All");
                    setSelectedCategory("All");
                  }}
                >
                  Clear Filters
                </button>
              </Col>
            </Row>
          ) : (
            <Row>
              {filteredImages.map((image) => (
                <Col lg={4} md={6} className="mb-4" key={image.id}>
                  <div
                    className="gallery-item"
                    onClick={() => handleImageClick(image)}
                  >
                    <img
                      src={image.src}
                      alt={image.title}
                      className="img-fluid rounded"
                    />
                    <div className="gallery-overlay">
                      <div className="text-center text-white">
                        <i className="fas fa-search-plus fa-2x mb-2"></i>
                        <h6 className="mb-1">{image.title}</h6>
                        <small>
                          {image.category} • {image.year}
                        </small>
                      </div>
                    </div>
                    <div className="position-absolute top-0 start-0 m-3">
                      <Badge bg={getCategoryColor(image.category)}>
                        {image.category}
                      </Badge>
                    </div>
                    <div className="position-absolute top-0 end-0 m-3">
                      <Badge bg="dark">{image.year}</Badge>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>

      {/* Image Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        {selectedImage && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedImage.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="img-fluid w-100"
                style={{ maxHeight: "70vh", objectFit: "contain" }}
              />
            </Modal.Body>
            <Modal.Footer>
              <div className="d-flex justify-content-between align-items-center w-100">
                <div>
                  <Badge
                    bg={getCategoryColor(selectedImage.category)}
                    className="me-2"
                  >
                    {selectedImage.category}
                  </Badge>
                  <Badge bg="secondary">{selectedImage.year}</Badge>
                </div>
                <button
                  className="btn btn-outline-primary"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </Modal.Footer>
            <div className="px-3 pb-3">
              <p className="text-muted mb-0">{selectedImage.description}</p>
            </div>
          </>
        )}
      </Modal>

      {/* Call to Action Section */}
      <section className="section-padding bg-light">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h2 className="text-primary mb-4">Share Your Memories</h2>
              <p className="text-muted mb-4">
                Have photos from campus events that you'd like to share? We'd
                love to feature them in our gallery!
              </p>
              <div className="d-flex gap-3 justify-content-center">
                <button className="btn btn-primary btn-lg">
                  Submit Photos
                </button>
                <button className="btn btn-outline-primary btn-lg">
                  Follow Us
                </button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Gallery;
