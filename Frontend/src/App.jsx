import { useEffect, useState } from "react";

function App() {
    const [brand, setBrand] = useState("metalworks");
    const [products, setProducts] = useState([]);
    const [selectedId, setSelectedId] = useState("");
    const [title, setTitle] = useState("");

    // Load products when brand changes
    useEffect(() => {
        const loadProducts = async () => {
            const res = await fetch(
                `http://localhost:3001/api/products/${brand}`,
            );
            const data = await res.json();

            setProducts(data);
            setSelectedId("");
            setTitle("");
        };

        loadProducts();
    }, [brand]);

    const handleSelectProduct = (e) => {
        const id = e.target.value;
        const product = products.find((p) => p.listingId === id);

        setSelectedId(id);
        setTitle(product?.title || "");
    };

    const handleSave = async () => {
        const updated = products.map((p) =>
            p.listingId === selectedId ? { ...p, title } : p,
        );

        const res = await fetch(`http://localhost:3001/api/products/${brand}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated),
        });

        const result = await res.json();

        if (result.success) {
            setProducts(updated);
            alert("Saved!");
        }
    };

    return (
        <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h1>Etsy JSON Editor</h1>

            {/* Brand Selector */}
            <div style={{ marginBottom: "1rem" }}>
                <button
                    onClick={() => setBrand("metalworks")}
                    style={{
                        marginRight: "1rem",
                        background: brand === "metalworks" ? "#333" : "#ccc",
                        color: brand === "metalworks" ? "#fff" : "#000",
                    }}
                >
                    Metalworks
                </button>

                <button
                    onClick={() => setBrand("lightworks")}
                    style={{
                        background: brand === "lightworks" ? "#333" : "#ccc",
                        color: brand === "lightworks" ? "#fff" : "#000",
                    }}
                >
                    Lightworks
                </button>
            </div>

            {/* Product Dropdown */}
            <select value={selectedId} onChange={handleSelectProduct}>
                <option value="">Select a product</option>

                {products.map((p) => (
                    <option key={p.listingId} value={p.listingId}>
                        {p.title}
                    </option>
                ))}
            </select>

            {/* Editor */}
            {selectedId && (
                <div style={{ marginTop: "1rem" }}>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ width: "400px" }}
                    />

                    <br />
                    <br />

                    <button onClick={handleSave}>Save</button>
                </div>
            )}
        </main>
    );
}

export default App;
