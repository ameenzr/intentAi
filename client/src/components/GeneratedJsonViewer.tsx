import { useState } from "react";
import type { GeneratedInterface } from "../types/generatedInterface";

type GeneratedJsonViewerProps = {
  generatedInterface: GeneratedInterface;
};

function GeneratedJsonViewer({
  generatedInterface
}: GeneratedJsonViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="generated-json-viewer">
      <button
        className="json-viewer-toggle"
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((currentValue) => !currentValue)}
      >
        <span>{isExpanded ? "⌄" : "›"}</span>
        View generated UI JSON
      </button>

      {isExpanded ? (
        <pre>
          {JSON.stringify(generatedInterface, null, 2)}
        </pre>
      ) : null}
    </section>
  );
}

export default GeneratedJsonViewer;
