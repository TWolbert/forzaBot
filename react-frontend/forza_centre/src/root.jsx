import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { redirect } from "react-router-dom";

export default function Root() {
  useEffect(() => {
    // redirect to /join if not already there
    if (window.location.pathname === "/") {
      // random number from 1 to 1000
      const guestId = Math.floor(Math.random() * 1000) + 1;
      redirect("/join/guest" + guestId);
    }
  }, []);
  return (
    <>
      {/* all the other elements */}
      <div id="detail">
        <Outlet />
      </div>
    </>
  );
}