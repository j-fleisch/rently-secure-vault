import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin } from "lucide-react";

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    main_text_matched_substrings?: { offset: number; length: number }[];
    secondary_text: string;
  };
}

interface AddressAutocompleteProps {
  onSelect?: (address: string, placeId: string) => void;
  placeholder?: string;
}

const AddressAutocomplete = ({
  onSelect,
  placeholder = "Enter your property address...",
}: AddressAutocompleteProps) => {
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [serviceReady, setServiceReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<any>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("Google Maps API key not configured");
      return;
    }

    if ((window as any).google?.maps?.places) {
      autocompleteService.current = new (window as any).google.maps.places.AutocompleteService();
      setServiceReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      autocompleteService.current = new (window as any).google.maps.places.AutocompleteService();
      setServiceReady(true);
    };
    document.head.appendChild(script);
  }, []);

  const fetchPredictions = useCallback(
    (input: string) => {
      if (!autocompleteService.current || input.length < 2) {
        setPredictions([]);
        setIsOpen(false);
        return;
      }

      autocompleteService.current.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: "ca" },
          types: ["address"],
        },
        (results: any[] | null, status: string) => {
          if (status === "OK" && results) {
            setPredictions(results as Prediction[]);
            setIsOpen(true);
          } else {
            setPredictions([]);
            setIsOpen(false);
          }
        }
      );
    },
    [serviceReady]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setActiveIndex(-1);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchPredictions(value), 300);
  };

  const handleSelect = (prediction: Prediction) => {
    setQuery(prediction.description);
    setPredictions([]);
    setIsOpen(false);
    onSelect?.(prediction.description, prediction.place_id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || predictions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < predictions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : predictions.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(predictions[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const highlightMatch = (prediction: Prediction) => {
    const { main_text, main_text_matched_substrings, secondary_text } =
      prediction.structured_formatting;

    if (main_text_matched_substrings && main_text_matched_substrings.length > 0) {
      const sorted = [...main_text_matched_substrings].sort(
        (a, b) => b.offset - a.offset
      );
      const parts: { text: string; bold: boolean }[] = [];
      let lastIndex = main_text.length;

      for (const sub of sorted) {
        if (sub.offset + sub.length < lastIndex) {
          parts.unshift({ text: main_text.slice(sub.offset + sub.length, lastIndex), bold: false });
        }
        parts.unshift({ text: main_text.slice(sub.offset, sub.offset + sub.length), bold: true });
        lastIndex = sub.offset;
      }
      if (lastIndex > 0) {
        parts.unshift({ text: main_text.slice(0, lastIndex), bold: false });
      }

      return (
        <span>
          {parts.map((p, i) =>
            p.bold ? (
              <span key={i} className="font-bold text-foreground">{p.text}</span>
            ) : (
              <span key={i}>{p.text}</span>
            )
          )}
          {secondary_text && (
            <span className="text-muted-foreground"> {secondary_text}</span>
          )}
        </span>
      );
    }

    return (
      <span>
        {main_text}
        {secondary_text && (
          <span className="text-muted-foreground"> {secondary_text}</span>
        )}
      </span>
    );
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => predictions.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        className="w-full h-12 pl-10 pr-4 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      />

      {isOpen && predictions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 left-0 right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {predictions.map((prediction, index) => (
            <li
              key={prediction.place_id}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => handleSelect(prediction)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer text-sm transition-colors border-b border-border last:border-b-0 ${
                index === activeIndex ? "bg-accent/10" : "hover:bg-muted/50"
              }`}
            >
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">
                {highlightMatch(prediction)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressAutocomplete;
