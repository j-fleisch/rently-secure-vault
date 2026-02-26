import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin } from "lucide-react";

interface SuggestionItem {
  placeId: string;
  mainText: string;
  secondaryText: string;
  description: string;
  matchedSubstrings?: { startOffset: number; endOffset: number }[];
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
  const [predictions, setPredictions] = useState<SuggestionItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteSuggestionRef = useRef<any>(null);
  const sessionTokenRef = useRef<any>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();
  const requestIdRef = useRef(0);

  useEffect(() => {
    const apiKey = "AIzaSyD9xwpFwqvZlEA-R6hdNJK4xNWMK9IF7Po";

    const initPlaces = async () => {
      if (!(window as any).google?.maps) return;
      const placesLib = await (window as any).google.maps.importLibrary("places");
      autocompleteSuggestionRef.current = placesLib.AutocompleteSuggestion;
      sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
    };

    if ((window as any).google?.maps?.importLibrary) {
      initPlaces();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initPlaces();
    };
    document.head.appendChild(script);
  }, []);

  const normalizeSuggestion = (rawSuggestion: any): SuggestionItem | null => {
    const placePrediction = rawSuggestion?.placePrediction;
    if (!placePrediction) return null;

    const mainText =
      placePrediction?.structuredFormat?.mainText?.text ||
      placePrediction?.text?.text ||
      "";

    const secondaryText =
      placePrediction?.structuredFormat?.secondaryText?.text || "";

    const description =
      typeof placePrediction?.text?.toString === "function"
        ? placePrediction.text.toString()
        : [mainText, secondaryText].filter(Boolean).join(", ");

    return {
      placeId: placePrediction?.placeId || description,
      mainText: mainText || description,
      secondaryText,
      description,
      matchedSubstrings: placePrediction?.structuredFormat?.mainText?.matches,
    };
  };

  const fetchPredictions = useCallback(async (input: string) => {
    if (!autocompleteSuggestionRef.current || input.trim().length < 3) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    const currentRequestId = ++requestIdRef.current;

    try {
      const result = await autocompleteSuggestionRef.current.fetchAutocompleteSuggestions({
        input,
        includedRegionCodes: ["ca"],
        sessionToken: sessionTokenRef.current,
      });

      if (currentRequestId !== requestIdRef.current) return;

      const nextPredictions = (result?.suggestions || [])
        .map(normalizeSuggestion)
        .filter(Boolean) as SuggestionItem[];

      setPredictions(nextPredictions);
      setIsOpen(nextPredictions.length > 0);
    } catch (error) {
      console.error("Autocomplete suggestions failed:", error);
      setPredictions([]);
      setIsOpen(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setActiveIndex(-1);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchPredictions(value), 220);
  };

  const handleSelect = (prediction: SuggestionItem) => {
    setQuery(prediction.description);
    setPredictions([]);
    setIsOpen(false);
    onSelect?.(prediction.description, prediction.placeId);
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

  const highlightMainText = (prediction: SuggestionItem) => {
    const matches = prediction.matchedSubstrings || [];
    if (!matches.length) return prediction.mainText;

    const sorted = [...matches].sort((a, b) => b.startOffset - a.startOffset);
    const parts: { text: string; bold: boolean }[] = [];
    let lastIndex = prediction.mainText.length;

    for (const match of sorted) {
      if (match.endOffset < lastIndex) {
        parts.unshift({ text: prediction.mainText.slice(match.endOffset, lastIndex), bold: false });
      }
      parts.unshift({ text: prediction.mainText.slice(match.startOffset, match.endOffset), bold: true });
      lastIndex = match.startOffset;
    }

    if (lastIndex > 0) {
      parts.unshift({ text: prediction.mainText.slice(0, lastIndex), bold: false });
    }

    return parts.map((part, i) =>
      part.bold ? (
        <span key={i} className="font-bold text-foreground">
          {part.text}
        </span>
      ) : (
        <span key={i}>{part.text}</span>
      )
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
          className="absolute z-[60] left-0 right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {predictions.map((prediction, index) => (
            <li
              key={`${prediction.placeId}-${index}`}
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
                {highlightMainText(prediction)}
                {prediction.secondaryText && (
                  <span className="text-muted-foreground"> {prediction.secondaryText}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressAutocomplete;
