"use client";

import * as React from "react";
import { TourCard } from "@/src/components/ui/tour-card";
import { Toaster, toast } from "sonner";

export default function TourCardDemo() {
  const [isLiked, setIsLiked] = React.useState(false);

  const handleLike = () => {
    setIsLiked((prev) => !prev);
    if (!isLiked) {
      toast.success("Added to favorites!", {
        description: "You can find this tour in your saved list.",
      });
    }
  };

  const handleBooking = () => {
    toast.info("Booking process started", {
      description: "Redirecting you to the secure checkout page...",
    });
  };

  return (
    <div className="min-h-screen w-full bg-theme-grid flex items-center justify-center p-6 dark:bg-gray-950">
      <Toaster richColors position="top-center" />
      
      <div className="w-full max-w-sm h-[600px]">
         {/* Using the merged TourCard component */}
        <TourCard
          imageUrl="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop"
          category="Adventure"
          title="Manhattan Green Camp"
          location="Cloud City, Atmosphere 78910"
          rating={4.9}
          reviewCount={24}
          nextDate="May 15, 2026"
          price={120}
          pricePeriod="Per Night"
          isLiked={isLiked}
          onLike={handleLike}
          onBookNow={handleBooking}
        />
      </div>
    </div>
  );
}
