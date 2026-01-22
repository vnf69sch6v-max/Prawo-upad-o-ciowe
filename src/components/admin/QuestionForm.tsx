'use client'

// src/components/admin/QuestionForm.tsx
// Formularz tworzenia/edycji pytania

import { useState, useEffect } from 'react'
import { useCategories } from '@/hooks/use-categories'
import { useCreateQuestion, useUpdateQuestion } from '@/hooks/useQuestionManagement'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Plus,
    Trash2,
    Save,
    X,
    CheckCircle,
    AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Answer {
    id: string
    text: string
}

interface QuestionFormProps {
    initialData?: {
        id?: string
        question_text?: string
        question_type?: string
        answers?: Answer[]
        correct_answer_ids?: string[]
        explanation?: string
        legal_basis?: string
        legal_area?: string
        category_id?: string
        difficulty?: number
        source?: string
        exam_type?: string
    }
    onSuccess?: () => void
    onCancel?: () => void
}

const LEGAL_AREAS = [
    { value: 'civil', label: 'Prawo cywilne' },
    { value: 'criminal', label: 'Prawo karne' },
    { value: 'administrative', label: 'Prawo administracyjne' },
    { value: 'commercial', label: 'Prawo handlowe' },
    { value: 'labor', label: 'Prawo pracy' },
    { value: 'constitutional', label: 'Prawo konstytucyjne' },
    { value: 'european', label: 'Prawo europejskie' },
    { value: 'other', label: 'Inne' }
]

const EXAM_TYPES = [
    { value: 'radcowski', label: 'Egzamin radcowski' },
    { value: 'adwokacki', label: 'Egzamin adwokacki' },
    { value: 'aplikacja', label: 'Egzamin na aplikację' },
    { value: 'notarialny', label: 'Egzamin notarialny' },
    { value: 'komorniczy', label: 'Egzamin komorniczy' },
    { value: 'other', label: 'Inny' }
]

export function QuestionForm({ initialData, onSuccess, onCancel }: QuestionFormProps) {
    // State
    const [questionText, setQuestionText] = useState(initialData?.question_text || '')
    const [questionType, setQuestionType] = useState(initialData?.question_type || 'single_choice')
    const [answers, setAnswers] = useState<Answer[]>(
        initialData?.answers || [
            { id: 'a', text: '' },
            { id: 'b', text: '' },
            { id: 'c', text: '' },
            { id: 'd', text: '' }
        ]
    )
    const [correctIds, setCorrectIds] = useState<string[]>(initialData?.correct_answer_ids || [])
    const [explanation, setExplanation] = useState(initialData?.explanation || '')
    const [legalBasis, setLegalBasis] = useState(initialData?.legal_basis || '')
    const [legalArea, setLegalArea] = useState(initialData?.legal_area || 'civil')
    const [categoryId, setCategoryId] = useState(initialData?.category_id || '')
    const [difficulty, setDifficulty] = useState(initialData?.difficulty || 5)
    const [source, setSource] = useState(initialData?.source || '')
    const [examType, setExamType] = useState(initialData?.exam_type || '')
    const [errors, setErrors] = useState<string[]>([])

    // Hooks
    const { categories } = useCategories()
    const createQuestion = useCreateQuestion()
    const updateQuestion = useUpdateQuestion()

    const isEditing = !!initialData?.id

    // Walidacja
    const validate = (): boolean => {
        const errs: string[] = []

        if (questionText.length < 10) {
            errs.push('Pytanie musi mieć minimum 10 znaków')
        }

        const filledAnswers = answers.filter(a => a.text.trim().length > 0)
        if (filledAnswers.length < 2) {
            errs.push('Minimum 2 odpowiedzi')
        }

        if (correctIds.length === 0) {
            errs.push('Zaznacz przynajmniej jedną poprawną odpowiedź')
        }

        // Sprawdź czy poprawne odpowiedzi mają tekst
        const correctWithText = correctIds.filter(id =>
            answers.find(a => a.id === id && a.text.trim().length > 0)
        )
        if (correctWithText.length !== correctIds.length) {
            errs.push('Poprawne odpowiedzi muszą mieć treść')
        }

        setErrors(errs)
        return errs.length === 0
    }

    // Submit
    const handleSubmit = async () => {
        if (!validate()) return

        const data = {
            question_text: questionText,
            question_type: questionType,
            answers: answers.filter(a => a.text.trim().length > 0),
            correct_answer_ids: correctIds,
            explanation,
            legal_basis: legalBasis,
            legal_area: legalArea,
            category_id: categoryId || undefined,
            difficulty,
            source,
            exam_type: examType
        }

        try {
            if (isEditing) {
                await updateQuestion.mutateAsync({ id: initialData!.id!, updates: data })
            } else {
                await createQuestion.mutateAsync(data)
            }
            onSuccess?.()
        } catch (err: any) {
            setErrors([err.message || 'Błąd zapisu'])
        }
    }

    // Dodaj odpowiedź
    const addAnswer = () => {
        if (answers.length >= 6) return
        const nextId = String.fromCharCode(97 + answers.length) // a, b, c, d, e, f
        setAnswers([...answers, { id: nextId, text: '' }])
    }

    // Usuń odpowiedź
    const removeAnswer = (id: string) => {
        if (answers.length <= 2) return
        setAnswers(answers.filter(a => a.id !== id))
        setCorrectIds(correctIds.filter(cid => cid !== id))
    }

    // Toggle poprawna odpowiedź
    const toggleCorrect = (id: string) => {
        if (questionType === 'single_choice') {
            setCorrectIds([id])
        } else {
            if (correctIds.includes(id)) {
                setCorrectIds(correctIds.filter(cid => cid !== id))
            } else {
                setCorrectIds([...correctIds, id])
            }
        }
    }

    return (
        <div className="space-y-6">
            {/* Błędy */}
            {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                            <p className="font-medium text-red-700">Popraw błędy:</p>
                            <ul className="mt-1 text-sm text-red-600 list-disc list-inside">
                                {errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Treść pytania */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    Treść pytania <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    rows={4}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Wpisz treść pytania..."
                />
                <p className="text-sm text-gray-500 mt-1">
                    {questionText.length}/2000 znaków
                </p>
            </div>

            {/* Typ pytania */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Typ pytania</label>
                    <select
                        value={questionType}
                        onChange={(e) => {
                            setQuestionType(e.target.value)
                            if (e.target.value === 'single_choice' && correctIds.length > 1) {
                                setCorrectIds([correctIds[0]])
                            }
                        }}
                        className="w-full border rounded-lg px-3 py-2"
                    >
                        <option value="single_choice">Jednokrotny wybór</option>
                        <option value="multiple_choice">Wielokrotny wybór</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Trudność (1-10)</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={difficulty}
                            onChange={(e) => setDifficulty(parseInt(e.target.value))}
                            className="flex-1"
                        />
                        <span className="w-8 text-center font-medium">{difficulty}</span>
                    </div>
                </div>
            </div>

            {/* Odpowiedzi */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">
                        Odpowiedzi <span className="text-red-500">*</span>
                    </label>
                    {answers.length < 6 && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={addAnswer}
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Dodaj odpowiedź
                        </Button>
                    )}
                </div>
                <div className="space-y-3">
                    {answers.map((answer, index) => (
                        <div key={answer.id} className="flex items-start gap-3">
                            {/* Checkbox poprawnej odpowiedzi */}
                            <button
                                type="button"
                                onClick={() => toggleCorrect(answer.id)}
                                className={cn(
                                    'mt-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                                    correctIds.includes(answer.id)
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'border-gray-300 hover:border-green-400'
                                )}
                            >
                                {correctIds.includes(answer.id) && (
                                    <CheckCircle className="w-4 h-4" />
                                )}
                            </button>

                            {/* Litera */}
                            <span className="mt-2 w-6 text-center font-bold text-gray-500">
                                {answer.id.toUpperCase()}.
                            </span>

                            {/* Pole tekstowe */}
                            <input
                                type="text"
                                value={answer.text}
                                onChange={(e) => {
                                    const newAnswers = [...answers]
                                    newAnswers[index].text = e.target.value
                                    setAnswers(newAnswers)
                                }}
                                placeholder={`Odpowiedź ${answer.id.toUpperCase()}`}
                                className={cn(
                                    'flex-1 border rounded-lg px-3 py-2',
                                    correctIds.includes(answer.id) && 'border-green-500 bg-green-50'
                                )}
                            />

                            {/* Usuń */}
                            {answers.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => removeAnswer(answer.id)}
                                    className="mt-2 text-gray-400 hover:text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    Kliknij kółko aby oznaczyć poprawną odpowiedź
                </p>
            </div>

            {/* Wyjaśnienie */}
            <div>
                <label className="block text-sm font-medium mb-2">Wyjaśnienie</label>
                <textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Wyjaśnienie dlaczego ta odpowiedź jest poprawna..."
                />
            </div>

            {/* Podstawa prawna */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Podstawa prawna</label>
                    <Input
                        value={legalBasis}
                        onChange={(e) => setLegalBasis(e.target.value)}
                        placeholder="np. Art. 415 KC"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Dziedzina prawa</label>
                    <select
                        value={legalArea}
                        onChange={(e) => setLegalArea(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                    >
                        {LEGAL_AREAS.map(area => (
                            <option key={area.value} value={area.value}>
                                {area.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Kategoria i egzamin */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Kategoria</label>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                    >
                        <option value="">-- Wybierz kategorię --</option>
                        {categories?.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Typ egzaminu</label>
                    <select
                        value={examType}
                        onChange={(e) => setExamType(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                    >
                        <option value="">-- Brak --</option>
                        {EXAM_TYPES.map(exam => (
                            <option key={exam.value} value={exam.value}>
                                {exam.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Źródło */}
            <div>
                <label className="block text-sm font-medium mb-2">Źródło</label>
                <Input
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="np. Egzamin radcowski 2023, pytanie 45"
                />
            </div>

            {/* Przyciski */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="secondary" onClick={onCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Anuluj
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={createQuestion.isPending || updateQuestion.isPending}
                >
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? 'Zapisz zmiany' : 'Utwórz pytanie'}
                </Button>
            </div>
        </div>
    )
}
