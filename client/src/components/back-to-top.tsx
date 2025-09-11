import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 300;
      setIsVisible(shouldShow);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      window.scrollTo(0, 0);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <Button
        onClick={scrollToTop}
        size="icon"
        className="rounded-full shadow-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 border border-black/5"
        aria-label="Back to top"
        data-testid="button-back-to-top"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
}


