import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import contactData from "@/data/contacts.json";

export default function Contact() {
  const { college, coordinators, office_hours, social_media } = contactData;

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="hero-section h-[50vh] min-h-[250px]">
        <div
          className="hero-background"
          style={{
            backgroundImage: "url('/images/schools/School_7.jpg')",
          }}
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="hero-content">
          <h1
            className="hero-title text-6xl"
            data-testid="text-contact-hero-title"
          >
            Contact Us
          </h1>
          <p
            className="hero-description text-2xl"
            data-testid="text-contact-hero-description"
          >
            Get in touch with us for any inquiries, support, or information
            about campus events and activities.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Details */}
            <div>
              <h2
                className="text-3xl font-bold text-foreground mb-8"
                data-testid="text-contact-details-title"
              >
                Get in Touch
              </h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-primary-foreground p-3 rounded-lg flex-shrink-0">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Address
                    </h3>
                    <p
                      className="text-muted-foreground"
                      data-testid="text-college-address"
                    >
                      {college.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-primary-foreground p-3 rounded-lg flex-shrink-0">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Phone
                    </h3>
                    <p
                      className="text-muted-foreground"
                      data-testid="text-college-phone"
                    >
                      {college.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-primary-foreground p-3 rounded-lg flex-shrink-0">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Email
                    </h3>
                    <p
                      className="text-muted-foreground"
                      data-testid="text-college-email"
                    >
                      {college.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-primary-foreground p-3 rounded-lg flex-shrink-0">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Office Hours
                    </h3>
                    <div className="space-y-1 text-muted-foreground">
                      <p data-testid="text-office-hours-weekdays">
                        {office_hours.weekdays}
                      </p>
                      <p data-testid="text-office-hours-weekends">
                        {office_hours.weekends}
                      </p>
                      <p data-testid="text-office-hours-holidays">
                        {office_hours.holidays}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-8">
                <h3 className="font-semibold text-foreground mb-4">
                  Follow Us
                </h3>
                <div className="flex space-x-4">
                  <a
                    href={social_media.facebook}
                    className="bg-primary text-primary-foreground p-3 rounded-lg hover:bg-primary/90 transition-colors"
                    data-testid="link-social-facebook"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a
                    href={social_media.twitter}
                    className="bg-primary text-primary-foreground p-3 rounded-lg hover:bg-primary/90 transition-colors"
                    data-testid="link-social-twitter"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a
                    href={social_media.instagram}
                    className="bg-primary text-primary-foreground p-3 rounded-lg hover:bg-primary/90 transition-colors"
                    data-testid="link-social-instagram"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href={social_media.linkedin}
                    className="bg-primary text-primary-foreground p-3 rounded-lg hover:bg-primary/90 transition-colors"
                    data-testid="link-social-linkedin"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Campus Image */}
            <div>
              <img
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
                alt="Campus aerial view"
                className="rounded-xl shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Faculty Coordinators */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl font-bold text-foreground mb-4"
              data-testid="text-faculty-coordinators-title"
            >
              Faculty Coordinators
            </h2>
            <p
              className="text-lg text-muted-foreground"
              data-testid="text-faculty-coordinators-description"
            >
              Connect with our dedicated faculty members who organize and
              coordinate campus events
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coordinators.faculty.map((faculty) => (
              <Card
                key={faculty.id}
                className="text-center card-hover"
                data-testid={`card-faculty-${faculty.id}`}
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary text-2xl font-bold">
                      {faculty.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <CardTitle
                    className="text-lg"
                    data-testid={`text-faculty-name-${faculty.id}`}
                  >
                    {faculty.name}
                  </CardTitle>
                  <p
                    className="text-sm text-primary"
                    data-testid={`text-faculty-designation-${faculty.id}`}
                  >
                    {faculty.designation}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p data-testid={`text-faculty-department-${faculty.id}`}>
                      {faculty.department}
                    </p>
                    <p data-testid={`text-faculty-phone-${faculty.id}`}>
                      {faculty.phone}
                    </p>
                    <p data-testid={`text-faculty-email-${faculty.id}`}>
                      {faculty.email}
                    </p>
                    <p
                      className="text-xs italic"
                      data-testid={`text-faculty-specialization-${faculty.id}`}
                    >
                      {faculty.specialization}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Student Coordinators */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl font-bold text-foreground mb-4"
              data-testid="text-student-coordinators-title"
            >
              Student Coordinators
            </h2>
            <p
              className="text-lg text-muted-foreground"
              data-testid="text-student-coordinators-description"
            >
              Meet our student leaders who help organize and manage various
              campus activities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coordinators.students.map((student) => (
              <Card
                key={student.id}
                className="text-center card-hover"
                data-testid={`card-student-${student.id}`}
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-secondary text-2xl font-bold">
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <CardTitle
                    className="text-lg"
                    data-testid={`text-student-name-${student.id}`}
                  >
                    {student.name}
                  </CardTitle>
                  <p
                    className="text-sm text-secondary"
                    data-testid={`text-student-designation-${student.id}`}
                  >
                    {student.designation}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p data-testid={`text-student-department-${student.id}`}>
                      {student.department}
                    </p>
                    <p data-testid={`text-student-year-${student.id}`}>
                      {student.year}
                    </p>
                    <p data-testid={`text-student-phone-${student.id}`}>
                      {student.phone}
                    </p>
                    <p data-testid={`text-student-email-${student.id}`}>
                      {student.email}
                    </p>
                    <p
                      className="text-xs italic"
                      data-testid={`text-student-specialization-${student.id}`}
                    >
                      {student.specialization}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* College Information */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-3xl font-bold mb-6"
            data-testid="text-college-info-title"
          >
            About {college.name}
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">Established</h3>
              <p
                className="text-primary-foreground/90"
                data-testid="text-college-established"
              >
                {college.established}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Affiliation</h3>
              <p
                className="text-primary-foreground/90"
                data-testid="text-college-affiliation"
              >
                {college.affiliation}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Website</h3>
              <p
                className="text-primary-foreground/90"
                data-testid="text-college-website"
              >
                {college.website}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
