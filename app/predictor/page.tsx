"use client"

import { useState } from "react"
import CO2Form from "@/components/co2/CO2Form"
import ResultsDisplay from "@/components/co2/ResultsDisplay"

// Update the FormData type to match the API's expected format
export type FormData = {
  Make?: string
  Vehicle_Class?: string
  Engine_Size?: string
  Cylinders?: string
  Transmission?: string
  Fuel_Type?: string
  Fuel_Consumption_City?: string
  Fuel_Consumption_Hwy?: string
  Fuel_Consumption_Comb?: string
}

// Update the PredictionResult type to match the API's response format
export type PredictionResult = {
  CO2_Emissions_Prediction: number
  Reduction_Tips: string[]
}

export default function PredictorPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PredictionResult | null>(null)

  const fetchPrediction = async (data: FormData): Promise<PredictionResult> => {
    const response = await fetch("https://vehicle-co2-emission-production.up.railway.app/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to get prediction. Please try again.")
    }

    return await response.json()
  }

 const handleSubmit = async (data: FormData) => {
  setIsLoading(true)
  setError(null)
  setResult(null)

  const maxRetries = 3
  let attempts = 0

  while (attempts < maxRetries) {
    try {
      const result = await fetchPrediction(data)
      setResult(result)
      return // Exit the loop on success
    } catch (err) {
      attempts++
      if (attempts < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000 * attempts)) // Exponential backoff
      } else {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      }
    }
  }

  setIsLoading(false)
};


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-green-800 mb-8 text-center">CO2 Emissions Predictor</h1>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-green-700 mb-4">Vehicle Information</h2>
          <p className="mb-6 text-gray-600">
            Enter your vehicle details below to get an estimate of CO2 emissions and personalized suggestions for
            reducing your carbon footprint. All fields are optional, but providing more information will result in a
            more accurate prediction.
          </p>

          <CO2Form onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {result && <ResultsDisplay result={result} />}
      </div>
    </div>
  )
}

