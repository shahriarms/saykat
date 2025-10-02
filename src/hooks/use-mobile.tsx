
import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768; 

export function useIsMobile() {
  // Initialize state to a value that is safe for server-side rendering
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // This effect will only run on the client
    const checkIsMobile = () => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }
    
    // Set the initial value on client-side mount
    checkIsMobile();
    
    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile);
    
    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
}
