import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  User,
  GraduationCap,
  Calendar,
} from "lucide-react";
import contactData from "@/data/contacts.json";

export default function Contact() {
  const { college, coordinators, office_hours, social_media } = contactData;

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="hero-section h-[50vh] min-h-[250px]">
        <div
          className="hero-background bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/schools/School_7.jpg')",
          }}
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="hero-content">
          <h1
            className="hero-title text-5xl"
            data-testid="text-contact-hero-title"
          >
            Contact Us
          </h1>
          <p
            className="hero-description text-xl"
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
                <h3 className="font-semibold text-foreground mb-6">
                  Follow Us
                </h3>
                <div className="flex space-x-4">
                  <a
                    href={social_media.facebook}
                    className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                    data-testid="link-social-facebook"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                  </a>
                  <a
                    href={social_media.twitter}
                    className="group bg-gradient-to-br from-sky-400 to-sky-500 text-white p-4 rounded-xl hover:from-sky-500 hover:to-sky-600 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                    data-testid="link-social-twitter"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                  </a>
                  <a
                    href={social_media.instagram}
                    className="group bg-gradient-to-br from-pink-500 to-purple-600 text-white p-4 rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                    data-testid="link-social-instagram"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                  </a>
                  <a
                    href={social_media.linkedin}
                    className="group bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                    data-testid="link-social-linkedin"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                  </a>
                </div>
              </div>
            </div>

            {/* Campus Image */}
            <div className="group">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
                  alt="Campus aerial view"
                  className="rounded-2xl shadow-xl w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="mt-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                <h4 className="font-bold text-foreground mb-1">CampusConnect College</h4>
                <p className="text-sm text-muted-foreground">Aerial view of our beautiful campus</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Faculty Coordinators */}
      <section className="py-16 bg-muted">
        <div className="max-w-full mx-auto px-5">
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {coordinators.faculty.map((faculty) => (
              <Card
                key={faculty.id}  
                className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                data-testid={`card-faculty-${faculty.id}`}
              >
                <CardHeader className="text-center pb-4">
                  <div className="relative mx-auto mb-6">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                      <AvatarImage 
                        src={faculty.avatar} 
                        alt={faculty.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-xl font-bold">
                        {faculty.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <CardTitle
                    className="text-xl font-bold text-foreground mb-2"
                    data-testid={`text-faculty-name-${faculty.id}`}
                  >
                    {faculty.name}
                  </CardTitle>
                  <Badge 
                    variant="secondary" 
                    className="bg-primary/10 text-primary mb-3 mx-auto w-fit"
                    data-testid={`text-faculty-designation-${faculty.id}`}
                  >
                    {faculty.designation}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      <span data-testid={`text-faculty-department-${faculty.id}`}>
                        {faculty.department}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 text-primary" />
                      <span data-testid={`text-faculty-phone-${faculty.id}`}>
                        {faculty.phone}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4 text-primary" />
                      <span data-testid={`text-faculty-email-${faculty.id}`}>
                        {faculty.email}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-muted">
                      <p
                        className="text-xs text-muted-foreground italic leading-relaxed"
                        data-testid={`text-faculty-specialization-${faculty.id}`}
                      >
                        {faculty.specialization}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Student Coordinators */}
      <section className="py-16 bg-muted">
        <div className="max-w-full mx-auto px-5">
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {coordinators.students.map((student) => (
              <Card
                key={student.id}
                className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                data-testid={`card-student-${student.id}`}
              >
                <CardHeader className="text-center pb-4">
                  <div className="relative mx-auto mb-6">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                      <AvatarImage 
                        src={student.avatar} 
                        alt={student.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-secondary to-secondary/80 text-white text-xl font-bold">
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <CardTitle
                    className="text-xl font-bold text-foreground mb-2"
                    data-testid={`text-student-name-${student.id}`}
                  >
                    {student.name}
                  </CardTitle>
                  <Badge 
                    variant="secondary" 
                    className="bg-secondary/10 text-secondary mb-3 mx-auto w-fit"
                    data-testid={`text-student-designation-${student.id}`}
                  >
                    {student.designation}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <GraduationCap className="w-4 h-4 text-secondary" />
                      <span data-testid={`text-student-department-${student.id}`}>
                        {student.department}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 text-secondary" />
                      <span data-testid={`text-student-year-${student.id}`}>
                        {student.year}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 text-secondary" />
                      <span data-testid={`text-student-phone-${student.id}`}>
                        {student.phone}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4 text-secondary" />
                      <span data-testid={`text-student-email-${student.id}`}>
                        {student.email}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-muted">
                      <p
                        className="text-xs text-muted-foreground italic leading-relaxed"
                        data-testid={`text-student-specialization-${student.id}`}
                      >
                        {student.specialization}
                      </p>
                    </div>
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
