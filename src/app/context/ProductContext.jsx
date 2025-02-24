"use client";

import { createContext, useContext, useState } from "react";

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <ProductContext.Provider value={{ selectedCategory, setSelectedCategory }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProductContext() {
  return useContext(ProductContext);
}
