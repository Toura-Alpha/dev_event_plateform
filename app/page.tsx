import React from "react";
import ExploreBtn from "../components/ExploreBtn";
import EventCard from "@/components/EventCard";
import events from "@/lib/constants";

const page = () => {
  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event You Can&#39;t Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups, and Conferences, All in One Place{" "}
      </p>

      <ExploreBtn />

      <div className="mt-20 space-y-7 mx-4 sm:mx-8 md:mx-16 lg:mx-24 xl:mx-32 2xl:mx-40">
        <h3>Featured Events</h3>
        <u className="events ">
          {events.map((event) => (
            <li key={event.title}>
              <EventCard {...event} />
            </li>
          ))}
        </u>
      </div>
    </section>
  );
};

export default page;
