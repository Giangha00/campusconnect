import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useValidation } from "@/hooks/use-validation";
import {
  validateName,
  validateEmail,
  validateFeedback,
} from "@/lib/validation";

export default function Feedback() {
  const { toast } = useToast();
  const { errors, validate, clearError, clearAllErrors } = useValidation();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userType: "",
    eventAttended: "",
    feedback: "",
    suggestions: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    const isNameValid = validate("feedback-name", formData.name, {
      required: true,
    });
    const isEmailValid = validate("feedback-email", formData.email, {
      required: true,
    });
    const isUserTypeValid = validate("feedback-user-type", formData.userType, {
      required: true,
    });
    const isEventValid = validate("feedback-event", formData.eventAttended, {
      required: true,
    });
    const isFeedbackValid = validate("feedback-content", formData.feedback, {
      required: true,
    });
    const isRatingValid = rating > 0;

    if (
      !isNameValid ||
      !isEmailValid ||
      !isUserTypeValid ||
      !isEventValid ||
      !isFeedbackValid ||
      !isRatingValid
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and provide a rating",
        variant: "destructive",
      });
      return;
    }

    // Show success message
    toast({
      title: "Feedback Success",
      description:
        "Thank you for your feedback! We appreciate your input and will use it to improve our events.",
      duration: 5000,
    });

    // Reset form after successful submission
    setFormData({
      name: "",
      email: "",
      userType: "",
      eventAttended: "",
      feedback: "",
      suggestions: "",
    });
    setRating(0);
    setHoveredRating(0);
    clearAllErrors();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearError(`feedback-${field}`);
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="hero-section h-[50vh] min-h-[250px]">
        <div
          className="hero-background"
          style={{
            backgroundImage: "url('/images/schools/School_2.jpg')",
          }}
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="hero-content">
          <h1
            className="hero-title text-6xl"
            data-testid="text-feedback-hero-title"
          >
            Event Feedback
          </h1>
          <p
            className="hero-description text-2xl"
            data-testid="text-feedback-hero-description"
          >
            We value your feedback to improve our events and services. Share
            your experience and help us make future events even better.
          </p>
        </div>
      </section>

      {/* Feedback Form */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle
                className="text-2xl text-center"
                data-testid="text-feedback-form-title"
              >
                Share Your Event Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      onBlur={() =>
                        validate("feedback-name", formData.name, {
                          required: true,
                        })
                      }
                      className={
                        errors["feedback-name"] ? "border-red-500" : ""
                      }
                      required
                      data-testid="input-feedback-name"
                    />
                    {errors["feedback-name"] && (
                      <p className="text-sm text-red-500">
                        {errors["feedback-name"]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      onBlur={() =>
                        validate("feedback-email", formData.email, {
                          required: true,
                        })
                      }
                      className={
                        errors["feedback-email"] ? "border-red-500" : ""
                      }
                      required
                      data-testid="input-feedback-email"
                    />
                    {errors["feedback-email"] && (
                      <p className="text-sm text-red-500">
                        {errors["feedback-email"]}
                      </p>
                    )}
                  </div>
                </div>

                {/* User Type and Event */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="user-type">User Type *</Label>
                    <Select
                      value={formData.userType}
                      onValueChange={(value) =>
                        handleInputChange("userType", value)
                      }
                      required
                    >
                      <SelectTrigger
                        data-testid="select-feedback-user-type"
                        className={
                          errors["feedback-user-type"] ? "border-red-500" : ""
                        }
                      >
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="faculty">Faculty</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="visitor">Visitor</SelectItem>
                        <SelectItem value="alumni">Alumni</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors["feedback-user-type"] && (
                      <p className="text-sm text-red-500">
                        {errors["feedback-user-type"]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-attended">Event Attended *</Label>
                    <Select
                      value={formData.eventAttended}
                      onValueChange={(value) =>
                        handleInputChange("eventAttended", value)
                      }
                      required
                    >
                      <SelectTrigger
                        data-testid="select-feedback-event"
                        className={
                          errors["feedback-event"] ? "border-red-500" : ""
                        }
                      >
                        <SelectValue placeholder="Select event" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="techfest-2024">
                          TechFest 2024
                        </SelectItem>
                        <SelectItem value="cultural-week">
                          Cultural Week 2024
                        </SelectItem>
                        <SelectItem value="sports-meet">
                          Inter-College Sports Meet
                        </SelectItem>
                        <SelectItem value="innovation-expo">
                          Innovation Expo
                        </SelectItem>
                        <SelectItem value="annual-day">
                          Annual Day Celebration
                        </SelectItem>
                        <SelectItem value="robotics-championship">
                          Robotics Championship
                        </SelectItem>
                        <SelectItem value="music-festival">
                          Music Festival
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <Label>Event Rating *</Label>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground">Poor</span>
                    <div className="flex space-x-1" data-testid="rating-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingClick(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="p-1 hover:scale-110 transition-transform"
                          data-testid={`button-rating-${star}`}
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= (hoveredRating || rating)
                                ? "fill-secondary text-secondary"
                                : "text-gray-300"
                            } transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Excellent
                    </span>
                  </div>
                  {rating > 0 && (
                    <p
                      className="text-sm text-primary"
                      data-testid="text-rating-selected"
                    >
                      You rated this event {rating} out of 5 stars
                    </p>
                  )}
                </div>

                {/* Comments */}
                <div className="space-y-2">
                  <Label htmlFor="comments">Comments & Suggestions *</Label>
                  <Textarea
                    id="comments"
                    placeholder="Share your thoughts, suggestions, or feedback about the event... (minimum 10 characters)"
                    rows={5}
                    value={formData.feedback}
                    onChange={(e) =>
                      handleInputChange("feedback", e.target.value)
                    }
                    onBlur={() =>
                      validate("feedback-content", formData.feedback, {
                        required: true,
                        minLength: 10,
                      })
                    }
                    className={
                      errors["feedback-content"] ? "border-red-500" : ""
                    }
                    data-testid="textarea-feedback-comments"
                  />
                  {errors["feedback-content"] && (
                    <p className="text-sm text-red-500">
                      {errors["feedback-content"]}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="text-center space-y-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full md:w-auto"
                    data-testid="button-submit-feedback"
                  >
                    Submit Feedback
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Additional Information */}
      <section className="py-16 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl font-bold text-foreground mb-4"
              data-testid="text-feedback-info-title"
            >
              Why Your Feedback Matters
            </h2>
            <p
              className="text-lg text-muted-foreground"
              data-testid="text-feedback-info-description"
            >
              Your insights help us continuously improve our events and campus
              experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Event Improvement",
                description:
                  "Help us identify what works well and what can be enhanced for future events",
              },
              {
                title: "Student Satisfaction",
                description:
                  "Ensure our events meet student expectations and contribute to campus life",
              },
              {
                title: "Community Building",
                description:
                  "Shape events that bring our campus community closer together",
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="text-center p-6"
                data-testid={`card-feedback-benefit-${index}`}
              >
                <h3
                  className="text-xl font-semibold text-foreground mb-3"
                  data-testid={`text-benefit-title-${index}`}
                >
                  {item.title}
                </h3>
                <p
                  className="text-muted-foreground"
                  data-testid={`text-benefit-description-${index}`}
                >
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
