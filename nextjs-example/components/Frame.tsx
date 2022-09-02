import React from "react";

interface FrameProps {
  title: string;
  sourceCodeUrl?: string;
  children: React.ReactNode;
}
const Frame: React.FC<FrameProps> = ({ title, sourceCodeUrl, children }) => {
  return (
    <div className="mx-auto flex flex-col w-[30rem] p-4">
      <p className="bg-gray-200 p-2 rounded-t-lg text-lg font-bold w-fit">
        {title}
        {sourceCodeUrl && (
          <a
            href={sourceCodeUrl}
            target="_blank"
            rel="noreferrer"
            className="pl-2 font-light text-xs"
          >
            (source code)
          </a>
        )}
      </p>
      <div className="bg-gray-100">{children}</div>
    </div>
  );
};

export default Frame;
