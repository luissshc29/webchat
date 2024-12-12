"use client";

import { useMediaQuery } from "@uidotdev/usehooks";

const useDevice = () => {
  const isLgWidth = useMediaQuery("only screen and (min-width : 1024px)");
  const isLgHeight = useMediaQuery("only screen and (min-height : 450px)");

  return {
    isLgWidth,
    isLgHeight,
  };
};

export default useDevice;
