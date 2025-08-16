"use client"

interface ToastProps {
  message: string
  type?: "success" | "error" | "info"
}

let toastContainer: HTMLDivElement | null = null

export const toast = {
  success: (message: string) => showToast(message, "success"),
  error: (message: string) => showToast(message, "error"),
  info: (message: string) => showToast(message, "info"),
}

function showToast(message: string, type: "success" | "error" | "info") {
  if (!toastContainer) {
    toastContainer = document.createElement("div")
    toastContainer.className = "fixed top-4 right-4 z-50 space-y-2"
    document.body.appendChild(toastContainer)
  }

  const toastElement = document.createElement("div")
  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }[type]

  toastElement.className = `${bgColor} text-white px-4 py-2 rounded-md shadow-lg transition-all duration-300`
  toastElement.textContent = message

  toastContainer.appendChild(toastElement)

  setTimeout(() => {
    toastElement.remove()
  }, 3000)
}

export function Toaster() {
  return null
}
