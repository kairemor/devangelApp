import { createSelector } from "@reduxjs/toolkit";
import isToday from "date-fns/isToday";
import isYesterday from "date-fns/isYesterday";
import format from "date-fns/format";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { productsByCategory } from "./productsByCategory";

const createDisplayLabel = date => {
  let displayLabel = "";
  if (isToday(date)) {
    displayLabel = "Today";
  } else if (isYesterday(date)) {
    displayLabel = "Yesterday";
  } else {
    displayLabel = format(date, "MMMM do");
  }
  return displayLabel;
};

// Group products by day
export const productsSelector = createSelector(
  [productsByCategory],
  products => {
    const dateMappings = new Map();
    let currentKey = null;
    let currentDate = null;
    let parsedProductsByDay = [];
    let sortedProducts = [];
    products.map(product => sortedProducts.push(product));
    sortedProducts.sort((p1, p2) => {
      return new Date(p2.created_at) - new Date(p1.created_at);
    });
    sortedProducts.map(product => {
      //  Create new instance of product so we can mutate it
      const newProduct = { ...product };
      const currentProductDate = new Date(product.created_at);
      newProduct.created_at = currentProductDate;
      newProduct.relativeDate = formatDistanceToNow(currentProductDate, {
        addSuffix: true
      });
      // Create key for current product based on the date to group the products by
      const currentProductDateKey = format(currentProductDate, "MM/dd/yyyy");
      // Initialize currentKey and currentDate with the values from the first product
      if (!currentKey) {
        currentKey = currentProductDateKey;
        currentDate = currentProductDate;
      }
      // The current product is in a different date than the previously set key
      // This means the date has changed
      if (currentProductDateKey !== currentKey) {
        // Create display label to use as a separator between products
        // Label is Today, Yesterday, or the date like April 10th
        const displayLabel = createDisplayLabel(currentDate);
        // Since the date has changed, we add all the products from the previous date to the Map and switch the
        // currentKey and currentDate for the new date
        const obj = {
          dateKey: currentKey,
          displayLabel: displayLabel,
          products: parsedProductsByDay
        };
        dateMappings.set(currentKey, obj);
        // Reset parsedProductsByDay array
        parsedProductsByDay = [];
        currentKey = currentProductDateKey;
        currentDate = currentProductDate;
      }
      // Add the current product to the parsedProductsByDay array, to be later added to the Map
      parsedProductsByDay.push(newProduct);
    });
    // Add last batch of products to Map
    if (parsedProductsByDay.length > 0) {
      const displayLabel = createDisplayLabel(currentDate);
      const obj = {
        dateKey: currentKey,
        displayLabel: displayLabel,
        products: parsedProductsByDay
      };
      dateMappings.set(currentKey, obj);
    }
    console.log("parsedProductsByDay: ", parsedProductsByDay);
    console.log("mappings: ", dateMappings);
    return Array.from(dateMappings);
  }
);
