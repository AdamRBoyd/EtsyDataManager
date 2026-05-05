import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

const CATEGORY_OPTIONS = {
    metalworks: ["rings", "earrings", "pendants", "bracelets", "necklaces"],
    lightworks: ["wood", "slate", "leather", "stickers", "ornaments", "signs"],
};

const EMPTY_PRODUCT = {
    index: "",
    listingId: "",
    category: "",
    title: "",
    subtitle: "",
    description: [],
    state: "active",
    quantity: 0,
    creationDate: "",
    url: "",
    tags: [],
    materials: [],
    hasVariations: false,
    price: {
        amount: "",
        currency: "USD",
    },
    images: "",
    reviews: "",
    rating: "",
};

/********************************************/
/*                Styling                   */
/********************************************/

const Container = styled.main`
    padding: 2rem;
    max-width: 900px;
    margin: auto;
    font-family: system-ui, sans-serif;
`;

const Section = styled.div`
    margin-bottom: 1.5rem;
`;

const Row = styled.div`
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
`;

const Button = styled.button`
    padding: 0.5rem 0.75rem;
    border: none;
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
    background: ${({ $active }) => ($active ? "#333" : "#ddd")};
    color: ${({ $active }) => ($active ? "#fff" : "#000")};
    border-radius: 4px;
    opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};

    &:hover {
        opacity: ${({ disabled }) => (disabled ? 0.5 : 0.85)};
    }
`;

const Label = styled.label`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.85rem;
    margin-top: 1rem;
`;

const Input = styled.input`
    padding: 0.4rem;
    border-radius: 4px;

    border: 1px solid ${({ $error }) => ($error ? "var(--danger)" : "#ccc")};

    background: ${({ $error }) =>
        $error ? "rgba(239, 68, 68, 0.1)" : "white"};

    color: ${({ $error }) => ($error ? "white" : "inherit")};

    &:focus {
        outline: none;
        border-color: ${({ $error }) =>
            $error ? "var(--danger)" : "var(--accent)"};
    }
`;

const TextArea = styled.textarea`
    padding: 0.4rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    height: 300px;
`;

const Select = styled.select`
    padding: 0.4rem;
    border: 1px solid #ccc;
    border-radius: 4px;
`;

const SearchResults = styled.div`
    margin-top: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
    background: var(--surface);
    box-shadow: var(--shadow);
`;

const SearchResultButton = styled.button`
    width: 100%;
    padding: 0.75rem;
    border: 0;
    border-bottom: 1px solid var(--border);
    background: transparent;
    color: var(--text);
    text-align: left;
    cursor: pointer;

    display: flex;
    flex-direction: column;
    gap: 0.2rem;

    &:hover {
        background: var(--surface-2);
    }

    strong {
        color: var(--text-h);
        font-weight: 600;
    }

    span {
        font-size: 0.85rem;
        opacity: 0.75;
    }

    &:last-child {
        border-bottom: 0;
    }
`;

const NoResults = styled.div`
    padding: 0.75rem;
    color: var(--text);
    opacity: 0.7;
`;

/********************************************/
/*                Helpers                   */
/********************************************/

function unixToDateInput(timestamp) {
    if (!timestamp) return "";

    return new Date(Number(timestamp) * 1000).toISOString().split("T")[0];
}

function dateInputToUnix(dateString) {
    if (!dateString) return "";

    return Math.floor(new Date(dateString).getTime() / 1000);
}

function arrayToText(value) {
    return Array.isArray(value) ? value.join("\n") : "";
}

function commaArrayToText(value) {
    return Array.isArray(value) ? value.join(", ") : "";
}

function textToCommaArray(value) {
    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

/*****************************************/
/*            Main Component             */
/*****************************************/

function App() {
    const [brand, setBrand] = useState("metalworks");
    const [mode, setMode] = useState("modify");
    const [products, setProducts] = useState([]);
    const [selectedId, setSelectedId] = useState("");
    const [formData, setFormData] = useState(EMPTY_PRODUCT);
    const [searchTerm, setSearchTerm] = useState("");

    const nextIndex = useMemo(() => {
        if (!products.length) return 1;

        return Math.max(...products.map((p) => Number(p.index) || 0)) + 1;
    }, [products]);

    const filteredProducts = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();

        if (!query) return products;

        return products.filter((product) => {
            return (
                String(product.listingId).includes(query) ||
                product.title?.toLowerCase().includes(query) ||
                product.category?.toLowerCase().includes(query) ||
                product.state?.toLowerCase().includes(query)
            );
        });
    }, [products, searchTerm]);

    useEffect(() => {
        const loadProducts = async () => {
            const res = await fetch(
                `http://localhost:3001/api/products/${brand}`,
            );

            const data = await res.json();

            setProducts(data);
            setSelectedId("");
            setSearchTerm("");
            setMode("modify");
            setFormData(EMPTY_PRODUCT);
        };

        loadProducts();
    }, [brand]);

    const createEmptyProduct = () => ({
        ...EMPTY_PRODUCT,
        index: nextIndex,
        category: CATEGORY_OPTIONS[brand][0],
        creationDate: Math.floor(Date.now() / 1000),
        price: {
            amount: "",
            currency: "USD",
        },
    });

    const handleModeChange = (newMode) => {
        setMode(newMode);
        setSelectedId("");
        setSearchTerm("");

        if (newMode === "create") {
            setFormData(createEmptyProduct());
        } else {
            setFormData(EMPTY_PRODUCT);
        }
    };

    const handleChange = (field, value) => {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handlePriceChange = (value) => {
        setFormData((current) => ({
            ...current,
            price: {
                ...current.price,
                amount: value,
                currency: "USD",
            },
        }));
    };

    const normalizeProduct = () => ({
        ...formData,
        index: Number(formData.index),
        listingId: Number(formData.listingId),
        quantity: Number(formData.quantity),
        creationDate: Number(formData.creationDate),
        description: arrayToText(formData.description)
            .split("\n")
            .map((line) => line.trimEnd()),
        tags: textToCommaArray(commaArrayToText(formData.tags)),
        materials: textToCommaArray(commaArrayToText(formData.materials)),
        hasVariations:
            formData.hasVariations === true ||
            formData.hasVariations === "true",
        price: {
            amount: Number(formData.price.amount),
            currency: "USD",
        },
        images: Number(formData.images),
        reviews: Number(formData.reviews),
        rating: Number(formData.rating),
    });

    const saveProducts = async (updatedProducts) => {
        const res = await fetch(`http://localhost:3001/api/products/${brand}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedProducts),
        });

        const result = await res.json();

        if (result.success) {
            setProducts(updatedProducts);
            alert("Saved!");
        }
    };

    const handleCreate = async () => {
        if (!formData.listingId) {
            alert("Listing ID is required.");
            return;
        }

        const alreadyExists = products.some(
            (p) => String(p.listingId) === String(formData.listingId),
        );

        if (alreadyExists) {
            alert("A product with that Listing ID already exists.");
            return;
        }

        const newProduct = normalizeProduct();
        await saveProducts([...products, newProduct]);

        setSelectedId(String(newProduct.listingId));
        setMode("modify");
    };

    const handleModify = async () => {
        if (!selectedId) {
            alert("Select a product to modify.");
            return;
        }

        const updatedProduct = normalizeProduct();

        const updatedProducts = products.map((product) =>
            String(product.listingId) === selectedId ? updatedProduct : product,
        );

        await saveProducts(updatedProducts);
    };

    const handleDelete = async () => {
        if (!selectedId) {
            alert("Select a product to delete.");
            return;
        }

        const confirmed = window.confirm(
            `Delete "${formData.title}" from ${brand}?`,
        );

        if (!confirmed) return;

        const updatedProducts = products.filter(
            (product) => String(product.listingId) !== selectedId,
        );

        await saveProducts(updatedProducts);

        setSelectedId("");
        setFormData(EMPTY_PRODUCT);
    };

    const handleDuplicate = () => {
        if (!selectedId) {
            alert("Select a product to duplicate.");
            return;
        }

        const duplicateProduct = {
            ...formData,
            index: nextIndex,
            listingId: "",
            title: `${formData.title} Copy`,
            creationDate: Math.floor(Date.now() / 1000),
        };

        setMode("create");
        setSelectedId("");
        setFormData(duplicateProduct);
    };

    const showProductDropdown = mode === "modify" || mode === "delete";
    const showEditor = mode === "create" || (mode === "modify" && selectedId);
    const showDeletePreview = mode === "delete" && selectedId;

    const quantityError =
        formData.state === "sold_out" && Number(formData.quantity) > 0;

    /*****************************************/
    /*                Return                 */
    /*****************************************/

    return (
        <Container>
            <h1>Etsy JSON Editor</h1>

            <Row>
                <Button
                    onClick={() => {
                        setBrand("metalworks");
                    }}
                    $active={brand === "metalworks"}
                >
                    Metalworks
                </Button>

                <Button
                    onClick={() => {
                        setBrand("lightworks");
                    }}
                    $active={brand === "lightworks"}
                >
                    Lightworks
                </Button>
            </Row>

            <Row>
                <Button onClick={() => handleModeChange("create")}>
                    Create
                </Button>

                <Button onClick={() => handleModeChange("modify")}>
                    Modify
                </Button>

                <Button onClick={handleDuplicate}>Duplicate</Button>

                <Button onClick={() => handleModeChange("delete")}>
                    Delete
                </Button>
            </Row>

            {showProductDropdown && (
                <Section>
                    <Label>
                        Search / Select Product
                        <Input
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setSelectedId("");
                            }}
                            placeholder="Search title, listing ID, category, or state..."
                        />
                    </Label>

                    {searchTerm && (
                        <SearchResults>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((p) => (
                                    <SearchResultButton
                                        key={p.listingId}
                                        type="button"
                                        onClick={() => {
                                            setSelectedId(String(p.listingId));
                                            setSearchTerm(`${p.title}`);
                                            setFormData(p);
                                        }}
                                    >
                                        <strong>{p.title}</strong>
                                        <span>
                                            {p.listingId} • {p.category} •{" "}
                                            {p.state} • {" "}
                                            {p.state === "sold_out" && p.quantity > 0 ? (
                                                <span
                                                    style={{
                                                        color: "var(--danger)",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    {p.quantity}
                                                </span>
                                            ) : (
                                                p.quantity
                                            )}
                                             {" "}in stock
                                        </span>
                                    </SearchResultButton>
                                ))
                            ) : (
                                <NoResults>No matching products</NoResults>
                            )}
                        </SearchResults>
                    )}
                </Section>
            )}

            {showDeletePreview && (
                <Section>
                    <h2>Delete Product</h2>
                    <p>
                        <strong>{formData.title}</strong>
                    </p>
                    <p>Listing ID: {formData.listingId}</p>

                    <Button onClick={handleDelete}>Confirm Delete</Button>
                </Section>
            )}

            {showEditor && (
                <Section>
                    <h2>Index: {formData.index}</h2>

                    <Label>
                        Listing ID
                        <Input
                            value={formData.listingId}
                            onChange={(e) =>
                                handleChange("listingId", e.target.value)
                            }
                        />
                    </Label>

                    <Label>
                        Category
                        <Select
                            value={formData.category}
                            onChange={(e) =>
                                handleChange("category", e.target.value)
                            }
                        >
                            {CATEGORY_OPTIONS[brand].map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </Select>
                    </Label>

                    <Label>
                        Title
                        <Input
                            value={formData.title}
                            onChange={(e) =>
                                handleChange("title", e.target.value)
                            }
                        />
                    </Label>

                    <Label>
                        Subtitle
                        <Input
                            value={formData.subtitle}
                            onChange={(e) =>
                                handleChange("subtitle", e.target.value)
                            }
                        />
                    </Label>

                    <Label>
                        Description
                        <TextArea
                            rows={10}
                            value={arrayToText(formData.description)}
                            onChange={(e) =>
                                handleChange(
                                    "description",
                                    e.target.value.split("\n"),
                                )
                            }
                        />
                    </Label>

                    <Label>
                        State
                        <Select
                            value={formData.state}
                            onChange={(e) =>
                                handleChange("state", e.target.value)
                            }
                        >
                            <option value="active">active</option>
                            <option value="sold_out">sold_out</option>
                            <option value="edit">edit</option>
                        </Select>
                    </Label>

                    <Label>
                        Quantity
                        <Input
                            type="number"
                            value={formData.quantity}
                            $error={quantityError}
                            onChange={(e) =>
                                handleChange("quantity", e.target.value)
                            }
                        />
                        {quantityError && (
                            <span
                                style={{
                                    color: "var(--danger)",
                                    fontSize: "0.8rem",
                                }}
                            >
                                Sold out items should have quantity 0
                            </span>
                        )}
                    </Label>

                    <Label>
                        Creation Date
                        <Input
                            type="date"
                            value={unixToDateInput(formData.creationDate)}
                            onChange={(e) =>
                                handleChange(
                                    "creationDate",
                                    dateInputToUnix(e.target.value),
                                )
                            }
                        />
                    </Label>

                    <Label>
                        URL
                        <Input
                            value={formData.url}
                            onChange={(e) =>
                                handleChange("url", e.target.value)
                            }
                        />
                    </Label>

                    <Label>
                        Tags
                        <Input
                            value={commaArrayToText(formData.tags)}
                            onChange={(e) =>
                                handleChange(
                                    "tags",
                                    textToCommaArray(e.target.value),
                                )
                            }
                        />
                    </Label>

                    <Label>
                        Materials
                        <Input
                            value={commaArrayToText(formData.materials)}
                            onChange={(e) =>
                                handleChange(
                                    "materials",
                                    textToCommaArray(e.target.value),
                                )
                            }
                        />
                    </Label>

                    <Label>
                        Has Variations
                        <Select
                            value={String(formData.hasVariations)}
                            onChange={(e) =>
                                handleChange("hasVariations", e.target.value)
                            }
                        >
                            <option value="false">false</option>
                            <option value="true">true</option>
                        </Select>
                    </Label>

                    <Label>
                        Price Amount
                        <Input
                            type="number"
                            value={formData.price.amount}
                            onChange={(e) => handlePriceChange(e.target.value)}
                        />
                    </Label>

                    <Label>
                        Images
                        <Input
                            type="number"
                            value={formData.images}
                            onChange={(e) =>
                                handleChange("images", e.target.value)
                            }
                        />
                    </Label>

                    <Label>
                        Reviews
                        <Input
                            type="number"
                            value={formData.reviews}
                            onChange={(e) =>
                                handleChange("reviews", e.target.value)
                            }
                        />
                    </Label>

                    <Label>
                        Rating
                        <Input
                            type="number"
                            step="0.1"
                            value={formData.rating}
                            onChange={(e) =>
                                handleChange("rating", e.target.value)
                            }
                        />
                    </Label>

                    {mode === "create" && (
                        <Button
                            style={{ margin: "2rem 0 4rem" }}
                            onClick={handleCreate}
                        >
                            Create Product
                        </Button>
                    )}

                    {mode === "modify" && (
                        <Button
                            style={{ margin: "2rem 0 4rem" }}
                            onClick={handleModify}
                        >
                            Save Changes
                        </Button>
                    )}
                </Section>
            )}
        </Container>
    );
}

export default App;
