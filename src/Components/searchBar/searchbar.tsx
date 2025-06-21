import { useState } from "react";

interface Props {
  onSearch: (name: string) => void;
}

const SearchBar = ({ onSearch }: Props) => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
      setQuery("");
    }
  };

  return (
    <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search satellite..."
        style={{
          padding: "6px 10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          width: "200px",
          marginRight: "8px",
        }}
      />
      <button onClick={handleSearch} style={{ padding: "6px 12px", borderRadius: "6px", cursor: "pointer" }}>
        Add
      </button>
    </div>
  );
};

export default SearchBar;

