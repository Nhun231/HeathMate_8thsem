import { createContext, useContext, useState, useEffect } from "react";
import {getMeals} from "../services/Meal.js";
const DiaryContext = createContext();

export function DiaryProvider({ children }) {
  // Lấy ngày hôm trước theo giờ Việt Nam
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1); // lùi 1 ngày

// Chuyển sang format "YYYY-MM-DD" để dùng trong context
const defaultDate = yesterday.toLocaleDateString("en-CA"); // "2025-10-14"

const [selectedDate, setSelectedDate] = useState(defaultDate);

  const [entries, setEntries] = useState({}); // { "2025-10-15": [meal1, meal2] }
  const [nutritionTotals, setNutritionTotals] = useState({}); // { "2025-10-15": {calories, carbs, protein...} }

  useEffect(() => {
    loadMealsForDate(selectedDate);
  }, [selectedDate]);

  const loadMealsForDate = async (date) => {
    try {
      const dateObj = new Date(date);
      const data = await getMeals(dateObj);

      const totals = {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
        sugar: 0,
      };

      data?.forEach((meal) => {
        totals.calories += meal.calories || 0;
        totals.protein += meal.protein || 0;
        totals.fat += meal.fat || 0;
        totals.carbs += meal.carbs || 0;
        totals.fiber += meal.fiber || 0;
        totals.sugar += meal.sugar || 0;
      });

      setEntries((prev) => ({ ...prev, [date]: data || [] }));
      setNutritionTotals((prev) => ({ ...prev, [date]: totals }));
    } catch (err) {
      console.error("Error loading meals:", err);
    }
  };

  const getDayEntries = (date = selectedDate) => {
    return entries[date] || [];
  };

  const getTotalNutrition = (date = selectedDate) => {
    return (
      nutritionTotals[date] || {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
        sugar: 0,
      }
    );
  };

  return (
    <DiaryContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        getDayEntries,
        getTotalNutrition,
        reloadDate: loadMealsForDate,
      }}
    >
      {children}
    </DiaryContext.Provider>
  );
}

export const useDiary = () => useContext(DiaryContext);
