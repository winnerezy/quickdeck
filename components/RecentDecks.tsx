'use client'

import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import { DeckCard } from "./DeckCard";

export const RecentDecks = () => {
  return (
    <Swiper 
    spaceBetween={50}  
    breakpoints={{
      0: {
        slidesPerView: 1.3
      },
      640: {
        slidesPerView: 2
      },
      1024: {
        slidesPerView: 2
      }
    }}
    className="max-w-screen-xl w-full">
      {Array(10)
        .fill(null)
        .map((_, index) => (
          <SwiperSlide key={index}>
            <DeckCard />
          </SwiperSlide>
        ))}
    </Swiper>
  );
};
