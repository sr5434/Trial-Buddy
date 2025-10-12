'use client';
import { useState } from 'react';

export default function Home() {
  const [ id, setId ] = useState("");
  const [ questions, setQuestions ] = useState([]);
  const [ isGenerating, setIsGenerating ] = useState(false);
  const [ isLaunching, setIsLaunching ] = useState(false);
  const handleInput = async (e) => {
    const fieldValue = e.target.value;

    await setId(fieldValue);
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    setIsGenerating(true);
    try {
      let res = await fetch('/api/generateQuestions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `{"id":"${id}"}`
      });
      let resJson = await res.json();
      await setQuestions(resJson.questions);
    } finally {
      setIsGenerating(false);
    }
  }

  const submitHandler2 = async (e) => {
    e.preventDefault()
    let res = await fetch('/api/launchAgent', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `{"id":"${id}", "questions":${JSON.stringify(questions)}, "answers":${JSON.stringify(Object.fromEntries(new FormData(e.target)))}}`
    });
    let resJson = await res.json();
    let jobId = resJson.job;
    window.location.href = `/results/${jobId}`;
  }

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <h1 className="text-5xl font-extrabold">Trial Buddy</h1>
      {questions.length === 0 ? (<form onSubmit={submitHandler}>
        <label className="block mb-2 pt-6 text-sm font-medium text-gray-900 dark:text-white" htmlFor="codeInput">Clinical trial ID:</label>
        <textarea
        name="linkInp"
        placeholder='e.g. NCT01234567'
        value={id}
        onChange={handleInput}
        className="block p-2.5 w-full h-10 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
        <button 
          type="submit"
          disabled={isGenerating || !id}
          className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
          {isGenerating ? 'Generating…' : 'Get Started'}
        </button>
        {isGenerating && (
          <div className="flex items-center gap-2 text-blue-600" role="status">
            <span className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" aria-hidden="true"></span>
            <span className="text-sm">Hang tight—finding the right questions.</span>
          </div>
        )}
      </form>) : (
      <div className='mt-4'>
        <h2 className='text-2xl font-bold mb-4'>Here are some questions you can answer so we can better tailor the report:</h2>
        <form onSubmit={submitHandler2}>
          {questions.map((question, index) => (
            <div key={index} className='mb-4'>
              <label key={index} className='font-medium text-gray-900 dark:text-white'>{question}</label>
              <textarea
                name={`answer${index}`}
                placeholder='Your answer here...'
                className="block p-2.5 w-full h-20 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-4"
              />
            </div>
          ))}
          <button 
            type="submit"
            className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 shadow-lg">
            Submit Answers
          </button>
        </form>
      </div>
      )}
    </div>
  )
}