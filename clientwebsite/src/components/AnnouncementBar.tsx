const announcements = [
  "Fast Delivery in Coimbatore & Tirupur",
  "COD Available across Tamil Nadu",
  "New Arrivals updated every week",
  "Express shipping on all Orders",
  "Get flat 10% off on your app purchase Use code: APP10",
];

const AnnouncementBar = () => {
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
