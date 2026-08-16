import { NextResponse } from 'next/server';

const ARTIFACTS = [
  { id: 1, name: 'Bronze Age Celtic Torc', origin: 'Ireland', period: '800 BCE', material: 'Gold', location: 'Dublin Museum' },
  { id: 2, name: 'Ming Dynasty Vase', origin: 'China', period: '15th Century', material: 'Porcelain', location: 'Forbidden City' },
  { id: 3, name: 'Olmec Colossal Head', origin: 'Mesoamerica', period: '1200 BCE', material: 'Basalt', location: 'Villahermosa' },
  { id: 4, name: 'Ancient Egyptian Canopic Jar', origin: 'Egypt', period: 'New Kingdom', material: 'Alabaster', location: 'Egyptian Museum' },
  { id: 5, name: 'Viking Runestone', origin: 'Sweden', period: '11th Century', material: 'Granite', location: 'Uppsala University' },
];

export async function GET() {
  return NextResponse.json(ARTIFACTS);
}
