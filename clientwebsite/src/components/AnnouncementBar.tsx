import { useState, useEffect } from "react";

const AnnouncementBar = () => {
  const [announcements, setAnnouncements] = useState<string[]>([
    "Fast Delivery in Coimbatore & Tirupur",
    "COD Available across Tamil Nadu",
    "New Arrivals updated every week",
    "Express shipping on all Orders",
    "Get flat 10% off on your app purchase Use code: APP10",
  ]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/api/announcements');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setAnnouncements(data.map((a: { text: string }) => a.text));
          }
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="bg-announcement text-announcement-foreground overflow-hidden py-0.5 text-[9px] md:text-[11px] tracking-widest uppercase font-medium">
      <div className="flex animate-[marquee_15s_linear_infinite] whitespace-nowrap items-center">
        {[...announcements, ...announcements, ...announcements].map((text, i) => (
          <div key={i} className="flex items-center">
            <span className="mx-12 inline-block">
              {text}
            </span>
            <span className="opacity-20">|</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBar;
