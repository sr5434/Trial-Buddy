import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod/v3';
import {zodTextFormat} from "openai/helpers/zod";


const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

export async function POST(req){
    let reqJSON = await req?.json();
    let id = reqJSON?.id;
    let clinicalTrialData = await fetch(`https://clinicaltrials.gov/api/v2/studies/${id}`).then(res => res.json());
    const Schema = z.object({
        questions: z.array(z.string())
    });
    const format = zodTextFormat(Schema, "questions");
    const response = await client.responses.create({
        model: 'gpt-5',
        input: [
            {role: "system", content: 'You are a helpful clinical trial explainer. A patient wanted to know more about a clinical trial before they join. Before you make the research report, you want to ask them 5 questions to better understand their needs. Remember to explain things in layman\'s terms.'},
            {role: "user", content: `Here is the clinical trial data: ${JSON.stringify(clinicalTrialData)}. What are 5 important questions you should ask the patient to better understand their needs?`},
        ],
        text: {
            format: format
        },
        reasoning:{
            effort: "minimal"
        }
    });
    return NextResponse.json({ questions: JSON.parse(response.output_text).questions });
}