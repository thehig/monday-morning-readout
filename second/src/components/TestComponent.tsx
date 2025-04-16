import { useState } from "react";

interface TestComponentProps {
  title: string;
}

export const TestComponent = ({ title }: TestComponentProps) => {
  const [count, setCount] = useState(0);

  return (
    <div className="test-component">
      <h1>{title}</h1>
      <button onClick={() => setCount((prev) => prev + 1)}>
        Count is: {count}
      </button>
    </div>
  );
};
