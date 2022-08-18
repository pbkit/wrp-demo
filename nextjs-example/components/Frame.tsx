import React from 'react';

interface FrameProps {
  title: string;
  children: React.ReactNode;
}
const Frame: React.FC<FrameProps> = ({ title, children }) => {
  return (
    <div className="mx-auto flex flex-col w-[30rem] p-4">
      <p className="bg-gray-200 p-2 rounded-t-lg text-lg font-bold w-fit">
        {title}
      </p>
      <div className="bg-gray-100">{children}</div>
    </div>
  );
};

export default Frame;
