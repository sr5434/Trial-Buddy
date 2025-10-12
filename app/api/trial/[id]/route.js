import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Fetch data from ClinicalTrials.gov API
    const response = await fetch(
      `https://clinicaltrials.gov/api/v2/studies/${id}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Trial not found or API error' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching trial data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trial data' },
      { status: 500 }
    );
  }
}
