import { NextResponse } from 'next/server'

export async function GET() {
  const number1 = Math.floor(Math.random() * 101)
  let number2 = Math.floor(Math.random() * 101)

  // Ensure numbers are different
  while (number2 === number1) {
    number2 = Math.floor(Math.random() * 101)
  }

  return NextResponse.json({ number1, number2 })
}