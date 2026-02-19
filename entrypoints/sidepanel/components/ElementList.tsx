import type { SelectedElement, ElementTag } from "@/lib/types";
import ElementItem from "./ElementItem";

interface ElementListProps {
  elements: SelectedElement[];
  onTagChange: (id: string, tag: ElementTag) => void;
  onRemove: (id: string) => void;
  onGuidanceChange: (id: string, guidance: string) => void;
}

export default function ElementList({ elements, onTagChange, onRemove, onGuidanceChange }: ElementListProps) {
  if (elements.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-400">
        No elements selected yet. Click elements on the page to select them.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {elements.map((el) => (
        <ElementItem
          key={el.id}
          element={el}
          onTagChange={onTagChange}
          onRemove={onRemove}
          onGuidanceChange={onGuidanceChange}
        />
      ))}
    </div>
  );
}
