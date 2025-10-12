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
    let questions = reqJSON?.questions;
    let answers = reqJSON?.answers;
    let clinicalTrialData = await fetch(`https://clinicaltrials.gov/api/v2/studies/${id}`).then(res => res.json());
    const prompt = `I need you to research the clinical trial "${clinicalTrialData?.protocolSection.identificationModule.officialTitle}" (acronym: ${clinicalTrialData?.protocolSection.identificationModule.acronym}, NCT ID: ${id}) and create a comprehensive report to help patients and families make informed decisions about participation.

CONTEXT YOU HAVE ACCESS TO:
${JSON.stringify(clinicalTrialData)}

PARTICIPANT-SPECIFIC CONTEXT:
Based on the questions you asked, you have received the following information about this potential participant:
1. ${questions[0]}
${answers[0]}
2. ${questions[1]}
${answers[1]}
3. ${questions[2]}
${answers[2]}
4. ${questions[3]}
${answers[3]}
5. ${questions[4]}
${answers[4]}

Use this information to:
- Emphasize sections most relevant to their stated concerns
- Provide comparisons to their current treatment if applicable
- Address their specific fears directly in the "Address Common Fears" section
- Tailor the "Key Questions to Discuss With Your Doctor" to their situation
- Flag any potential eligibility issues based on their medical background

WHAT I NEED:
At the top of the page, write the study name and id as a heading.
1. **Executive Summary**
   - Provide 4-6 bullet points at the very top summarizing the most critical information
   - Each bullet should be one complete sentence
   - Must include: what condition is being treated, what the intervention is, what phase the trial is in, the single biggest risk, and whether participants can withdraw
   - Use plain language only - no medical jargon

2. **What This Trial Is Actually Testing**
   - Explain the medical intervention being studied in terms a high school graduate would understand
   - State what problem this trial is trying to solve
   - Explain what happens to participants in each arm of the trial (treatment, placebo, control, etc.) 
   - If the trial uses a placebo, explicitly clarify whether participants still receive standard care

3. **Day-to-Day Reality of Participation**
   - Create a table showing the timeline of visits, procedures, and time commitments
   - List every procedure participants undergo (blood draws, biopsies, imaging, questionnaires, etc.) with brief explanations
   - State the total expected duration of participation
   - Explain what happens if a participant wants to leave the trial early

4. **Risks and Side Effects - With Context**
   For each significant risk or side effect:
   - State how common it is using both percentages AND "X out of 100 people" format
   - Categorize severity as mild/moderate/severe and explain what that means practically
   - Indicate whether it's temporary or permanent, reversible or irreversible
   - Compare these risks to the risks of NOT treating the underlying condition
   - Explain how the trial monitors for and manages these risks
   
   I need actual numbers, not vague terms like "common" or "rare". If specific frequency data isn't available, state that explicitly.
   
   Create a comparison table showing risk frequencies for: this trial vs. standard treatment vs. no treatment (if data is available).

5. **Potential Benefits**
    - List direct benefits (does the treatment help the participant's condition?)
    - List indirect benefits (closer medical monitoring, access to new therapy, etc.)
    - Be honest about whether this trial is primarily designed to help current participants or future patients (this varies by phase)
    - If this is a Phase 1 or Phase 2 trial, explicitly state that the primary goal is safety/dosing, not necessarily effectiveness

6. **Who Can Participate and Why**
   - List the inclusion criteria in plain language
   - List the exclusion criteria in plain language
   - For each major exclusion criterion, explain the medical reasoning behind it (e.g., "pregnant women are excluded because we don't know if this drug affects fetal development")

7. **Key Questions to Discuss With Your Doctor**
   - Generate 6-10 specific questions tailored to this trial's unique characteristics
   - Focus on practical concerns: time commitment, symptom management, what to do if side effects occur, etc.

CRITICAL REQUIREMENTS:

- **Plain Language**: Every medical term must be immediately followed by a plain-language definition in parentheses. Examples:
  - Good: "adverse events (unwanted medical problems that happen during treatment)"
  - Bad: "AEs" or "grade 3 toxicity"
  
- **Quantitative Data**: Include specific numbers wherever possible:
  - Percentages of people experiencing each side effect
  - Total number of participants being enrolled
  - Trial duration in weeks/months
  - Number and frequency of required visits
  - Statistical comparisons to existing treatments
  
- **Source Priority**: Prioritize sources in this exact order:
  1. Publications specifically about this trial (search for the NCT ID in academic databases)
  2. Publications about the specific intervention being tested
  3. Official guidance from FDA, CDC, WHO, or relevant disease-specific organizations (e.g., American Cancer Society)
  4. Peer-reviewed medical journals (prefer original research over review articles)
  5. Reputable medical institutions (Mayo Clinic, Cleveland Clinic, etc.)
  
  For every factual claim, include an inline citation linking directly to the original source.

- **Comparison Tables**: Create tables for:
  - Timeline of trial visits and what happens at each
  - Risk comparison (trial vs. standard treatment vs. no treatment)
  - Eligibility criteria (who can/cannot join and why)

- **Acknowledge Uncertainty**: If specific information is not available (e.g., long-term effects of a new drug), explicitly state "this information is not yet available" rather than speculating

- **Address Common Fears**: Directly address these misconceptions if they're relevant:
  - "Are participants treated like guinea pigs?" (explain IRB oversight, informed consent, safety monitoring boards)
  - "Will I get a placebo and no treatment?" (clarify what placebo means in this context)
  - "Can I leave if I change my mind?" (explain withdrawal rights)
  - "What if something goes wrong?" (explain adverse event reporting and management)

FORMAT:
- Use markdown formatting throughout
- Structure as a report with clear section headers (use the 7 sections listed above), using h2 and h3 as needed
- Keep paragraphs short (2-4 sentences maximum)
- Use bullet points for lists of items
- Use tables for comparative or timeline data
- The report should be scannable - someone should grasp the key points in 2 minutes but be able to read deeply for 15+ minutes if desired

TONE:
- Empathetic and balanced
- Acknowledge that clinical trial decisions are difficult and personal
- Never oversell benefits or undersell risks
- Present information objectively and let readers make their own informed decisions
- Use second person ("you") when addressing the reader to make it more personal and direct
`

    const response = await client.responses.create({
        model: 'o4-mini-deep-research-2025-06-26',
        input: [
            {role: "developer", content: prompt},
        ],
        tools: [
            {
            "type": "web_search_preview"
            },
        ],
        background: true
    });
    console.log("Response received:", response);
    return NextResponse.json({ job: response.id });
}
// curl -X POST -d '{"id":"NCT00841061", "questions":["What is the purpose of this clinical trial?", "What are the eligibility criteria?", "What are the potential risks and benefits?", "How often will I need to visit the study site?", "Can I withdraw from the trial at any time?"], "answers":["To evaluate the safety and efficacy of a new drug for treating hypertension.", "Adults aged 18-65 with diagnosed hypertension; Excludes those with severe comorbidities.", "Potential risks include side effects like dizziness and nausea; benefits may include better blood pressure control.", "Monthly visits for the first 6 months, then quarterly visits.", "Yes, participants can withdraw at any time without penalty."]}' http://localhost:3000/api/launchAgent