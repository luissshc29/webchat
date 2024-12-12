import React from "react";
import {
  AiOutlineInstagram,
  AiOutlineLinkedin,
  AiOutlineGithub,
} from "react-icons/ai";
import { FiExternalLink } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="z-[100] flex justify-center items-center gap-2 lg:col-span-2 py-6 w-full text-neutral-700 text-xs md:text-sm">
      <div className="flex items-center gap-[3px] h-full">
        Coded by{" "}
        <a
          href="https://luishenrique-dev.com.br/"
          className="flex items-center gap-[3px] underline"
          target="_blank"
          rel="noreferrer"
        >
          Luis Henrique <FiExternalLink />
        </a>{" "}
        |
      </div>
      <a
        href="https://www.instagram.com/luissshc_/"
        target="_blank"
        rel="noreferrer"
      >
        <AiOutlineInstagram />
      </a>
      <a
        href="https://www.linkedin.com/in/luis-henrique-6a7425165/"
        target="_blank"
        rel="noreferrer"
      >
        <AiOutlineLinkedin />
      </a>
      <a href="https://github.com/luissshc29" target="_blank" rel="noreferrer">
        <AiOutlineGithub />
      </a>
    </footer>
  );
}
