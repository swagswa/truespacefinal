import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI('AIzaSyD2M-_L-WL_leAgKIMNaDe3NSbp6gEGyCs');

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Сообщение не может быть пустым' },
        { status: 400 }
      );
    }

    // Получаем модель Gemini (используем актуальное название модели)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Отправляем запрос к Gemini
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Ошибка при обращении к Gemini:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка при обработке запроса' },
      { status: 500 }
    );
  }
}