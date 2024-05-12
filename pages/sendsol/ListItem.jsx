import React from "react";
import { ExternalLinkIcon } from "@heroicons/react/outline";

const ListItem = ({ title , dependency , href , index}) => {
  return (
    <li
      key={title}
      className={`flex justify-between items-center ${index !== 0 && "mt-4"}`}
    >
      <p className="tracking-wider">{title}</p>
      {dependency && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex text-[#80ebff] italic ${
            href && "hover:text-white"
          } transition-all duration-200`}
        >
          {dependency.toString().slice(0, 25)}
          {href && <ExternalLinkIcon className="w-5 ml-1" />}
        </a>
      )}
    </li>
  );
};

export default ListItem;
