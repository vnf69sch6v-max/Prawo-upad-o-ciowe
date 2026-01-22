'use client'

// src/components/admin/ExcelImport.tsx
// Import pytań z Excel/CSV

import { useState, useRef } from 'react'
import { useBulkImport } from '@/hooks/useQuestionManagement'
import { useCategories } from '@/hooks/use-categories'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    Upload,
    FileSpreadsheet,
    AlertCircle,
    CheckCircle2,
    X,
    Download,
    Loader2
} from 'lucide-react'
import * as XLSX from 'xlsx'

interface ParsedRow {
    question_text: string
    answers: { id: string; text: string }[]
    correct_answer_ids: string[]
    explanation?: string
    legal_basis?: string
    legal_area?: string
    difficulty?: number
    source?: string
    exam_type?: string
}

export function ExcelImport() {
    // State
    const [file, setFile] = useState<File | null>(null)
    const [parsedData, setParsedData] = useState<ParsedRow[]>([])
    const [parseErrors, setParseErrors] = useState<string[]>([])
    const [categoryId, setCategoryId] = useState('')
    const [autoPublish, setAutoPublish] = useState(false)
    const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'done'>('upload')
    const [importResult, setImportResult] = useState<any>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    // Hooks
    const { categories } = useCategories()
    const bulkImport = useBulkImport()

    // Parsowanie pliku
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        setFile(selectedFile)
        setParseErrors([])

        try {
            const data = await selectedFile.arrayBuffer()
            const workbook = XLSX.read(data, { type: 'array' })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            const rows = XLSX.utils.sheet_to_json(worksheet) as any[]

            const parsed: ParsedRow[] = []
            const errors: string[] = []

            rows.forEach((row, index) => {
                try {
                    const question = transformRow(row)
                    if (question.question_text && question.answers.length >= 2) {
                        parsed.push(question)
                    } else {
                        errors.push(`Wiersz ${index + 2}: Brak treści pytania lub za mało odpowiedzi`)
                    }
                } catch (err: any) {
                    errors.push(`Wiersz ${index + 2}: ${err.message}`)
                }
            })

            setParsedData(parsed)
            setParseErrors(errors)
            setStep('preview')

        } catch (err: any) {
            setParseErrors(['Błąd parsowania pliku: ' + err.message])
        }
    }

    // Transformacja wiersza
    const transformRow = (row: any): ParsedRow => {
        const getText = (keys: string[]) => {
            for (const key of keys) {
                if (row[key]) return String(row[key]).trim()
            }
            return ''
        }

        const questionText = getText(['question_text', 'pytanie', 'treść', 'question', 'Pytanie'])

        // Parsuj odpowiedzi
        const answers: { id: string; text: string }[] = []
        const correctIds: string[] = []

        const answerKeys = ['a', 'b', 'c', 'd', 'e', 'f']
        for (const key of answerKeys) {
            const text = getText([
                `answer_${key}`,
                `odpowiedź_${key}`,
                `odp_${key}`,
                key.toUpperCase(),
                `odpowiedz_${key}`
            ])
            if (text) {
                answers.push({ id: key, text })
            }
        }

        // Poprawne odpowiedzi
        const correctRaw = getText(['correct', 'correct_answer', 'poprawna', 'prawidłowa', 'poprawne'])
        if (correctRaw) {
            const chars = correctRaw.toUpperCase().replace(/[^A-F1-6]/g, '')
            for (const char of chars) {
                if (char >= 'A' && char <= 'F') {
                    correctIds.push(char.toLowerCase())
                } else if (char >= '1' && char <= '6') {
                    correctIds.push(answerKeys[parseInt(char) - 1])
                }
            }
        }

        return {
            question_text: questionText,
            answers,
            correct_answer_ids: correctIds.length > 0 ? correctIds : ['a'],
            explanation: getText(['explanation', 'wyjaśnienie', 'uzasadnienie']),
            legal_basis: getText(['legal_basis', 'podstawa_prawna', 'art', 'artykuł']),
            legal_area: getText(['legal_area', 'dziedzina', 'obszar']) || 'civil',
            difficulty: parseInt(getText(['difficulty', 'trudność', 'poziom'])) || 5,
            source: getText(['source', 'źródło']),
            exam_type: getText(['exam_type', 'egzamin', 'typ_egzaminu'])
        }
    }

    // Import
    const handleImport = async () => {
        setStep('importing')

        try {
            const result = await bulkImport.mutateAsync({
                questions: parsedData,
                categoryId: categoryId || undefined,
                autoPublish
            })

            setImportResult(result)
            setStep('done')
        } catch (err: any) {
            setParseErrors(['Błąd importu: ' + err.message])
            setStep('preview')
        }
    }

    // Reset
    const handleReset = () => {
        setFile(null)
        setParsedData([])
        setParseErrors([])
        setStep('upload')
        setImportResult(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Import pytań</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Zaimportuj wiele pytań z pliku Excel lub CSV
                </p>
            </div>

            {/* Step: Upload */}
            {step === 'upload' && (
                <Card className="p-8">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                            <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Wybierz plik</h3>
                        <p className="text-gray-500 mb-6">
                            Obsługiwane formaty: .xlsx, .xls, .csv
                        </p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        <Button
                            size="lg"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-5 h-5 mr-2" />
                            Wybierz plik
                        </Button>

                        {/* Format info */}
                        <div className="mt-8 text-left bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <h4 className="font-medium mb-2">Wymagane kolumny:</h4>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">pytanie</code> lub <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">question_text</code> - treść pytania</li>
                                <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">A, B, C, D</code> lub <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">odpowiedź_a</code> - odpowiedzi</li>
                                <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">poprawna</code> lub <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">correct</code> - poprawna odpowiedź (np. "A" lub "A,C")</li>
                            </ul>
                            <h4 className="font-medium mt-4 mb-2">Opcjonalne kolumny:</h4>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">wyjaśnienie</code> - wyjaśnienie odpowiedzi</li>
                                <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">podstawa_prawna</code> - np. "Art. 415 KC"</li>
                                <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">trudność</code> - 1-10</li>
                                <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">źródło</code> - np. "Egzamin 2023"</li>
                            </ul>
                        </div>
                    </div>
                </Card>
            )}

            {/* Step: Preview */}
            {step === 'preview' && (
                <>
                    {/* Errors */}
                    {parseErrors.length > 0 && (
                        <Card className="p-4 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                <div>
                                    <p className="font-medium text-red-700 dark:text-red-400">
                                        Znaleziono błędy ({parseErrors.length})
                                    </p>
                                    <ul className="mt-2 text-sm text-red-600 dark:text-red-300 list-disc list-inside max-h-32 overflow-y-auto">
                                        {parseErrors.map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Summary */}
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                                <div>
                                    <p className="font-medium">{file?.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {parsedData.length} pytań gotowych do importu
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" onClick={handleReset}>
                                <X className="w-4 h-4 mr-1" />
                                Anuluj
                            </Button>
                        </div>
                    </Card>

                    {/* Options */}
                    <Card className="p-6">
                        <h3 className="font-medium mb-4">Opcje importu</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Domyślna kategoria
                                </label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                                >
                                    <option value="">-- Bez kategorii --</option>
                                    {categories?.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={autoPublish}
                                        onChange={(e) => setAutoPublish(e.target.checked)}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span>Automatycznie publikuj pytania</span>
                                </label>
                            </div>
                        </div>
                    </Card>

                    {/* Preview table */}
                    <Card className="overflow-hidden">
                        <div className="p-4 border-b dark:border-gray-700">
                            <h3 className="font-medium">Podgląd (pierwsze 10)</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-sm">#</th>
                                        <th className="px-4 py-2 text-left text-sm">Pytanie</th>
                                        <th className="px-4 py-2 text-left text-sm">Odpowiedzi</th>
                                        <th className="px-4 py-2 text-left text-sm">Poprawna</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700">
                                    {parsedData.slice(0, 10).map((q, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-4 py-2 text-sm text-gray-500">{i + 1}</td>
                                            <td className="px-4 py-2">
                                                <p className="truncate max-w-md">{q.question_text}</p>
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {q.answers.length} odp.
                                            </td>
                                            <td className="px-4 py-2 text-sm font-mono">
                                                {q.correct_answer_ids.map(id => id.toUpperCase()).join(', ')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={handleReset}>
                            Anuluj
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={parsedData.length === 0}
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Importuj {parsedData.length} pytań
                        </Button>
                    </div>
                </>
            )}

            {/* Step: Importing */}
            {step === 'importing' && (
                <Card className="p-8 text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
                    <h3 className="text-lg font-medium">Importowanie...</h3>
                    <p className="text-gray-500">Proszę czekać, to może chwilę potrwać</p>
                </Card>
            )}

            {/* Step: Done */}
            {step === 'done' && importResult && (
                <Card className="p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Import zakończony!</h3>

                    <div className="grid grid-cols-3 gap-4 my-6 max-w-md mx-auto">
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{importResult.successful}</p>
                            <p className="text-sm text-gray-500">Dodane</p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                            <p className="text-2xl font-bold text-yellow-600">{importResult.duplicates}</p>
                            <p className="text-sm text-gray-500">Duplikaty</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                            <p className="text-2xl font-bold text-red-600">{importResult.failed}</p>
                            <p className="text-sm text-gray-500">Błędy</p>
                        </div>
                    </div>

                    <div className="flex justify-center gap-3">
                        <Button variant="secondary" onClick={handleReset}>
                            Importuj kolejne
                        </Button>
                        <a
                            href="/admin/cms/questions"
                            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Przejdź do listy pytań
                        </a>
                    </div>
                </Card>
            )}
        </div>
    )
}
