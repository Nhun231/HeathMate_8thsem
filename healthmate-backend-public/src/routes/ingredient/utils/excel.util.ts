import * as XLSX from 'xlsx'
import * as path from 'path'

export function readExcelFile(): any[] {
    const filePath = path.join(process.cwd(), 'src', 'routes', 'ingredient', 'upload', 'NutritiousPer100g.xlsx')
    const workbook = XLSX.readFile(filePath, { cellText: true, cellDates: false })

    const sheetName = workbook.SheetNames[0] // first sheet
    const sheet = workbook.Sheets[sheetName]

    // Convert sheet to JSON
    const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: true })
    return jsonData;
}
