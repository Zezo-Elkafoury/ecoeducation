import type React from "react"
import { useState } from "react"
import type { FormData } from "@/app/predictor/page"

type CO2FormProps = {
  onSubmit: (data: FormData) => void
  isLoading: boolean
}

export default function CO2Form({ onSubmit, isLoading }: CO2FormProps) {
  const [formData, setFormData] = useState<FormData>({
    Make: "",
    Vehicle_Class: "",
    Engine_Size: "",
    Cylinders: "",
    Transmission: "",
    Fuel_Type: "",
    Fuel_Consumption_City: "",
    Fuel_Consumption_Hwy: "",
    Fuel_Consumption_Comb: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: "Make", id: "Make", type: "text", placeholder: "e.g., Toyota, Honda" },
          { label: "Engine Size (L)", id: "Engine_Size", type: "number", placeholder: "e.g., 2.0" },
          { label: "Cylinders", id: "Cylinders", type: "number", placeholder: "e.g., 4" },
          { label: "Fuel Consumption City (L/100km)", id: "Fuel_Consumption_City", type: "number", placeholder: "e.g., 9.5" },
          { label: "Fuel Consumption Highway (L/100km)", id: "Fuel_Consumption_Hwy", type: "number", placeholder: "e.g., 7.2" },
          { label: "Fuel Consumption Combined (L/100km)", id: "Fuel_Consumption_Comb", type: "number", placeholder: "e.g., 8.3" }
        ].map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <input
              type={field.type}
              id={field.id}
              name={field.id}
              value={formData[field.id as keyof FormData] || ""}
              onChange={handleChange}
              step={field.type === "number" ? "0.1" : undefined}
              min={field.type === "number" ? "1" : undefined}
              max={field.type === "number" ? "30" : undefined}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-black placeholder-gray-400"
              placeholder={field.placeholder}
            />
          </div>
        ))}

        {/* Dropdown Fields */}
        <div>
          <label htmlFor="Vehicle_Class" className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle Class
          </label>
          <select
            id="Vehicle_Class"
            name="Vehicle_Class"
            value={formData.Vehicle_Class}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-black"
          >
            <option value="">Select Vehicle Class</option>
            <option value="SUV">SUV</option>
            <option value="COMPACT">Compact</option>
            <option value="MID-SIZE">Mid-Size</option>
            <option value="FULL-SIZE">Full-Size</option>
            <option value="PICKUP TRUCK">Pickup Truck</option>
            <option value="MINIVAN">Minivan</option>
          </select>
        </div>

        <div>
          <label htmlFor="Transmission" className="block text-sm font-medium text-gray-700 mb-1">
            Transmission
          </label>
          <select
            id="Transmission"
            name="Transmission"
            value={formData.Transmission}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-black"
          >
            <option value="">Select Transmission</option>
            <option value="A">Automatic</option>
            <option value="M">Manual</option>
            <option value="AM">Automated Manual</option>
            <option value="CVT">Continuously Variable</option>
          </select>
        </div>

        <div>
          <label htmlFor="Fuel_Type" className="block text-sm font-medium text-gray-700 mb-1">
            Fuel Type
          </label>
          <select
            id="Fuel_Type"
            name="Fuel_Type"
            value={formData.Fuel_Type}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-black"
          >
            <option value="">Select Fuel Type</option>
            <option value="X">Regular Gasoline</option>
            <option value="Z">Premium Gasoline</option>
            <option value="D">Diesel</option>
            <option value="E">Ethanol</option>
          </select>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <button
          type="submit"
          disabled={isLoading}
          className={`bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Calculating..." : "Calculate CO2 Emissions"}
        </button>
      </div>
    </form>
  )
}
