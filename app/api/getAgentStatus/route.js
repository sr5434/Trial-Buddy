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
    let res = await client.responses.retrieve(id);
    if (res.status == "queued" || res.status == "in_progress") {
        console.log(res);
      return NextResponse.json({ report: "" });
    } else {
        return NextResponse.json({ report: res.output_text });
    }
}
// curl -X POST "http://localhost:3000/api/getAgentStatus" -H "Content-Type: application/x-www-form-urlencoded" -d '{"id":"resp_0a1fb2897b1cb5430068ebc9ea04b88194a9c2157929a00874"}'