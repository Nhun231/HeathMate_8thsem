
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Clock, Utensils, Coffee, Cookie, Trash2 } from "lucide-react"

const availableDishes = [
  { id: 1, name: "Phở bò", calories: 350, type: "Bữa sáng", protein: 20, fat: 8, carbs: 45 },
  { id: 2, name: "Bánh mì thịt", calories: 280, type: "Bữa sáng", protein: 15, fat: 12, carbs: 35 },
  { id: 3, name: "Cơm gà nướng", calories: 520, type: "Bữa trưa", protein: 35, fat: 18, carbs: 55 },
  { id: 4, name: "Bún bò Huế", calories: 420, type: "Bữa trưa", protein: 25, fat: 15, carbs: 48 },
  { id: 5, name: "Chả cá Lã Vọng", calories: 380, type: "Bữa tối", protein: 28, fat: 20, carbs: 25 },
  { id: 6, name: "Bánh xèo", calories: 320, type: "Bữa tối", protein: 12, fat: 18, carbs: 30 },
  { id: 7, name: "Chè đậu xanh", calories: 180, type: "Món tráng miệng", protein: 6, fat: 2, carbs: 38 },
  { id: 8, name: "Bánh flan", calories: 220, type: "Món tráng miệng", protein: 8, fat: 10, carbs: 28 },
]

const ingredients = [
  { id: 1, name: "Thịt bò (100g)", calories: 250, protein: 26, fat: 15, carbs: 0, fiber: 0 },
  { id: 2, name: "Gạo trắng (100g)", calories: 130, protein: 2.7, fat: 0.3, carbs: 28, fiber: 0.4 },
  { id: 3, name: "Rau xanh (100g)", calories: 25, protein: 3, fat: 0.4, carbs: 5, fiber: 3 },
  { id: 4, name: "Trứng gà (1 quả)", calories: 70, protein: 6, fat: 5, carbs: 0.6, fiber: 0 },
  { id: 5, name: "Dầu ăn (1 thìa)", calories: 40, protein: 0, fat: 4.5, carbs: 0, fiber: 0 },
  { id: 6, name: "Bánh phở (100g)", calories: 109, protein: 0.9, fat: 0.2, carbs: 25, fiber: 0.9 },
  { id: 7, name: "Thịt gà (100g)", calories: 165, protein: 31, fat: 3.6, carbs: 0, fiber: 0 },
  { id: 8, name: "Cà chua (100g)", calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9, fiber: 1.2 },
]

const mealTypes = [
  { value: "breakfast", label: "Bữa sáng", icon: Coffee },
  { value: "lunch", label: "Bữa trưa", icon: Utensils },
  { value: "dinner", label: "Bữa tối", icon: Clock },
  { value: "snack", label: "Món tráng miệng", icon: Cookie },
]

export function AddDishModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [newDish, setNewDish] = useState({
    name: "",
    type: "",
    calories: 0,
  })

  const totalCalories = selectedIngredients.reduce((sum, ing) => sum + ing.calories, 0)

  const filteredDishes = availableDishes.filter((dish) => dish.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const addIngredient = (ingredient) => {
    if (!selectedIngredients.find((ing) => ing.id === ingredient.id)) {
      setSelectedIngredients([...selectedIngredients, ingredient])
    }
  }

  const removeIngredient = (ingredientId) => {
    setSelectedIngredients(selectedIngredients.filter((ing) => ing.id !== ingredientId))
  }

  const getMealTypeIcon = (type) => {
    const mealType = mealTypes.find((mt) => mt.label === type)
    return mealType ? mealType.icon : Utensils
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-white to-light-green/20">
        <DialogHeader className="border-b border-light-green/50 pb-6">
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-text-green to-main-green bg-clip-text text-transparent flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-main-green to-green-hover rounded-full flex items-center justify-center">
              <Plus className="h-6 w-6 text-white" />
            </div>
            Thêm món ăn mới
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="available" className="w-full h-full">
          <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-light-green/30 to-light-green/50 p-2 rounded-xl mb-6 h-14">
            <TabsTrigger
              value="available"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-main-green data-[state=active]:to-green-hover data-[state=active]:text-white data-[state=active]:shadow-lg text-text-green font-semibold py-3 rounded-lg transition-all duration-300"
            >
              <Utensils className="h-5 w-5 mr-2" />
              Món có sẵn
            </TabsTrigger>
            <TabsTrigger
              value="create"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-main-green data-[state=active]:to-green-hover data-[state=active]:text-white data-[state=active]:shadow-lg text-text-green font-semibold py-3 rounded-lg transition-all duration-300"
            >
              <Plus className="h-5 w-5 mr-2" />
              Tạo món mới
            </TabsTrigger>
            <TabsTrigger
              value="ingredients"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-main-green data-[state=active]:to-green-hover data-[state=active]:text-white data-[state=active]:shadow-lg text-text-green font-semibold py-3 rounded-lg transition-all duration-300"
            >
              <Coffee className="h-5 w-5 mr-2" />
              Nguyên liệu
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[calc(95vh-220px)] pr-2">
            <TabsContent value="available" className="space-y-4 mt-0">
              <div className="relative">
                <Search className="absolute left-4 top-4 h-5 w-5 text-text-green/60" />
                <Input
                  placeholder="Tìm kiếm món ăn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 border-light-green focus:border-main-green focus:ring-main-green/20 bg-white"
                />
              </div>

              <div className="grid gap-4">
                {filteredDishes.map((dish) => {
                  const Icon = getMealTypeIcon(dish.type)
                  return (
                    <Card
                      key={dish.id}
                      className="ingredient-card hover:shadow-xl hover:border-main-green/50 transition-all duration-300 border-light-green/50"
                    >
                      <CardContent className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-6 flex-1">
                          <div className="w-14 h-14 bg-gradient-to-br from-light-green to-light-green/70 rounded-xl flex items-center justify-center">
                            <Icon className="h-7 w-7 text-main-green" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-text-green text-xl mb-2">{dish.name}</h4>
                            <div className="flex items-center gap-4 mb-3">
                              <Badge
                                variant="secondary"
                                className="bg-gradient-to-r from-light-green to-light-green/70 text-text-green px-3 py-1 text-sm font-medium"
                              >
                                {dish.type}
                              </Badge>
                              <span className="text-lg font-bold text-main-green">{dish.calories} kcal</span>
                            </div>
                            <div className="flex gap-6 text-sm text-text-green/70">
                              <span>
                                Protein: <strong>{dish.protein}g</strong>
                              </span>
                              <span>
                                Fat: <strong>{dish.fat}g</strong>
                              </span>
                              <span>
                                Carbs: <strong>{dish.carbs}g</strong>
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button size="lg" className="add-dish-button text-white px-6 py-3 text-lg font-semibold">
                          <Plus className="h-5 w-5 mr-2" />
                          Thêm vào bữa ăn
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="create" className="space-y-6 mt-0">
              <Card className="border-2 border-light-green/50 bg-gradient-to-br from-white to-light-green/10">
                <CardHeader className="bg-gradient-to-r from-light-green/40 to-light-green/60">
                  <CardTitle className="text-2xl text-text-green flex items-center gap-3">
                    <div className="w-8 h-8 bg-main-green rounded-lg flex items-center justify-center">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    Tạo món ăn mới
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <Label htmlFor="dish-name" className="text-text-green font-semibold text-lg">
                        Tên món ăn
                      </Label>
                      <Input
                        id="dish-name"
                        value={newDish.name}
                        onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                        placeholder="Nhập tên món ăn"
                        className="mt-3 h-12 text-lg border-2 border-light-green focus:border-main-green focus:ring-main-green/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dish-type" className="text-text-green font-semibold text-lg">
                        Loại món
                      </Label>
                      <Select>
                        <SelectTrigger className="mt-3 h-12 text-lg border-2 border-light-green focus:border-main-green">
                          <SelectValue placeholder="Chọn loại món" />
                        </SelectTrigger>
                        <SelectContent>
                          {mealTypes.map((type) => {
                            const Icon = type.icon
                            return (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-3">
                                  <Icon className="h-5 w-5" />
                                  <span className="text-lg">{type.label}</span>
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-text-green font-semibold text-lg">Nguyên liệu đã chọn</Label>
                    <div className="mt-4 space-y-4">
                      {selectedIngredients.length > 0 ? (
                        <div className="space-y-3">
                          {selectedIngredients.map((ingredient) => (
                            <div
                              key={ingredient.id}
                              className="ingredient-card p-4 rounded-lg flex items-center justify-between"
                            >
                              <div>
                                <span className="font-semibold text-text-green">{ingredient.name}</span>
                                <span className="ml-3 text-main-green font-medium">({ingredient.calories} cal)</span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeIngredient(ingredient.id)}
                                className="text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gradient-to-br from-light-green/20 to-light-green/40 rounded-lg border-2 border-dashed border-light-green">
                          <Coffee className="h-12 w-12 text-main-green mx-auto mb-3" />
                          <p className="text-text-green/70">Chưa chọn nguyên liệu nào</p>
                          <p className="text-sm text-text-green/50 mt-1">Chuyển sang tab "Nguyên liệu" để chọn</p>
                        </div>
                      )}

                      <div className="bg-gradient-to-r from-main-green/10 to-green-hover/10 p-6 rounded-xl border border-main-green/20">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-main-green mb-2">{totalCalories}</div>
                          <div className="text-lg text-text-green">Tổng calories</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t-2 border-light-green">
                    <Button className="add-dish-button text-white px-8 py-3 text-lg font-semibold flex-1">
                      <Plus className="h-5 w-5 mr-2" />
                      Tạo món ăn
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="border-2 border-light-green text-text-green hover:bg-light-green/50 bg-transparent px-8 py-3 text-lg font-semibold"
                    >
                      Hủy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ingredients" className="space-y-4 mt-0">
              <div className="relative">
                <Search className="absolute left-4 top-4 h-5 w-5 text-text-green/60" />
                <Input
                  placeholder="Tìm kiếm nguyên liệu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 border-light-green focus:border-main-green focus:ring-main-green/20 bg-white"
                />
              </div>

              <div className="grid gap-4">
                {filteredIngredients.map((ingredient) => (
                  <Card
                    key={ingredient.id}
                    className="ingredient-card hover:shadow-xl hover:border-main-green/50 transition-all duration-300 border-light-green/50"
                  >
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-6 flex-1">
                        <div className="w-14 h-14 bg-gradient-to-br from-light-green to-light-green/70 rounded-xl flex items-center justify-center">
                          <Coffee className="h-7 w-7 text-main-green" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-text-green text-xl mb-2">{ingredient.name}</h4>
                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-lg font-bold text-main-green">{ingredient.calories} kcal</span>
                            {selectedIngredients.find((ing) => ing.id === ingredient.id) && (
                              <Badge className="bg-main-green text-white">Đã chọn</Badge>
                            )}
                          </div>
                          <div className="flex gap-6 text-sm text-text-green/70">
                            <span>
                              P: <strong>{ingredient.protein}g</strong>
                            </span>
                            <span>
                              F: <strong>{ingredient.fat}g</strong>
                            </span>
                            <span>
                              C: <strong>{ingredient.carbs}g</strong>
                            </span>
                            <span>
                              Fiber: <strong>{ingredient.fiber}g</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="lg"
                        onClick={() => addIngredient(ingredient)}
                        disabled={selectedIngredients.find((ing) => ing.id === ingredient.id)}
                        className="add-dish-button text-white px-6 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        {selectedIngredients.find((ing) => ing.id === ingredient.id) ? "Đã thêm" : "Thêm"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
