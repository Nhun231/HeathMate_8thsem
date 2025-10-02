"use client"

import { createContext, useContext, useState } from "react"

const DiaryContext = createContext()

export const useDiary = () => {
  const context = useContext(DiaryContext)
  if (!context) {
    throw new Error("useDiary must be used within DiaryProvider")
  }
  return context
}

// Mock data for public dishes
const publicDishes = [
  {
    id: 1,
    name: "Phở bò",
    calories: 350,
    protein: 25,
    fat: 8,
    carbs: 45,
    fiber: 3,
    mealType: "Bữa sáng",
  },
  {
    id: 2,
    name: "Bánh mì thịt",
    calories: 280,
    protein: 15,
    fat: 12,
    carbs: 35,
    fiber: 2,
    mealType: "Bữa sáng",
  },
  {
    id: 3,
    name: "Cơm gà nướng",
    calories: 520,
    protein: 35,
    fat: 15,
    carbs: 60,
    fiber: 2,
    mealType: "Bữa trưa",
  },
  {
    id: 4,
    name: "Canh chua",
    calories: 80,
    protein: 8,
    fat: 2,
    carbs: 12,
    fiber: 4,
    mealType: "Bữa trưa",
  },
  {
    id: 5,
    name: "Cá phê sữa",
    calories: 70,
    protein: 2,
    fat: 3,
    carbs: 8,
    fiber: 0,
    mealType: "Bữa sáng",
  },
  {
    id: 6,
    name: "Nước cam",
    calories: 50,
    protein: 1,
    fat: 0,
    carbs: 12,
    fiber: 0,
    mealType: "Bữa trưa",
  },
  {
    id: 7,
    name: "Bánh mì que",
    calories: 150,
    protein: 4,
    fat: 6,
    carbs: 20,
    fiber: 1,
    mealType: "Ăn vặt",
  },
]

// Mock data for ingredients
const ingredients = [
  { id: 1, name: "Thịt bò (100g)", calories: 250, protein: 26, fat: 15, carbs: 0, fiber: 0 },
  { id: 2, name: "Gạo trắng (100g)", calories: 130, protein: 2.7, fat: 0.3, carbs: 28, fiber: 0.4 },
  { id: 3, name: "Rau xanh (100g)", calories: 25, protein: 2, fat: 0.3, carbs: 5, fiber: 2 },
  { id: 4, name: "Cà chua (100g)", calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9, fiber: 1.2 },
  { id: 5, name: "Hành tây (100g)", calories: 40, protein: 1.1, fat: 0.1, carbs: 9.3, fiber: 1.7 },
  { id: 6, name: "Trứng gà (1 quả)", calories: 70, protein: 6, fat: 5, carbs: 0.6, fiber: 0 },
  { id: 7, name: "Dầu ăn (1 thìa)", calories: 120, protein: 0, fat: 14, carbs: 0, fiber: 0 },
  { id: 8, name: "Cá hồi (100g)", calories: 206, protein: 22, fat: 13, carbs: 0, fiber: 0 },
]

export const DiaryProvider = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [diaryEntries, setDiaryEntries] = useState({
    [new Date().toDateString()]: {
      "Bữa sáng": [
        { ...publicDishes[0], entryId: Date.now() + 1 },
        { ...publicDishes[4], entryId: Date.now() + 2 },
      ],
      "Bữa trưa": [
        { ...publicDishes[2], entryId: Date.now() + 3 },
        { ...publicDishes[3], entryId: Date.now() + 4 },
        { ...publicDishes[5], entryId: Date.now() + 5 },
      ],
      "Bữa tối": [],
      "Ăn vặt": [{ ...publicDishes[6], entryId: Date.now() + 6 }],
    },
  })

  const addDishToMeal = (mealType, dish) => {
    const dateKey = selectedDate.toDateString()
    setDiaryEntries((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [mealType]: [...(prev[dateKey]?.[mealType] || []), { ...dish, entryId: Date.now() }],
      },
    }))
  }

  const removeDishFromMeal = (mealType, entryId) => {
    const dateKey = selectedDate.toDateString()
    setDiaryEntries((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [mealType]: prev[dateKey][mealType].filter((dish) => dish.entryId !== entryId),
      },
    }))
  }

  const getDayEntries = (date) => {
    const dateKey = date.toDateString()
    return (
      diaryEntries[dateKey] || {
        "Bữa sáng": [],
        "Bữa trưa": [],
        "Bữa tối": [],
        "Ăn vặt": [],
      }
    )
  }

  const getTotalCalories = (date) => {
    const entries = getDayEntries(date)
    return Object.values(entries)
      .flat()
      .reduce((sum, dish) => sum + dish.calories, 0)
  }

  return (
    <DiaryContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        diaryEntries,
        publicDishes,
        ingredients,
        addDishToMeal,
        removeDishFromMeal,
        getDayEntries,
        getTotalCalories,
      }}
    >
      {children}
    </DiaryContext.Provider>
  )
}
