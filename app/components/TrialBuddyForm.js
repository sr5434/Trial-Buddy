'use client';

import { useState } from 'react';

export default function TrialBuddyForm() {
  const [trialId, setTrialId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState('input'); // 'input' or 'questions'

  const handleSubmitTrialId = async (e) => {
    e.preventDefault();
    
    if (!trialId.trim()) {
      setError('Please enter a ClinicalTrials.gov ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch trial data from ClinicalTrials.gov API
      const trialResponse = await fetch(`/api/trial/${trialId}`);
      
      if (!trialResponse.ok) {
        throw new Error('Failed to fetch trial data');
      }

      const trialData = await trialResponse.json();

      // Generate questions using GPT-5 (mocked for now)
      const questionsResponse = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trialData }),
      });

      if (!questionsResponse.ok) {
        throw new Error('Failed to generate questions');
      }

      const { questions: generatedQuestions } = await questionsResponse.json();
      
      setQuestions(generatedQuestions);
      setStep('questions');
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmitAnswers = (e) => {
    e.preventDefault();
    // No-op for now as requested
    console.log('Submitted answers:', answers);
    alert('Form submitted! (This is a no-op for now)');
  };

  if (step === 'input') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Enter Clinical Trial ID</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Please enter a ClinicalTrials.gov ID (e.g., NCT00000000) to get started.
        </p>
        
        <form onSubmit={handleSubmitTrialId}>
          <div className="mb-4">
            <label htmlFor="trialId" className="block text-sm font-medium mb-2">
              ClinicalTrials.gov ID
            </label>
            <input
              id="trialId"
              type="text"
              value={trialId}
              onChange={(e) => setTrialId(e.target.value)}
              placeholder="NCT00000000"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {loading ? 'Loading...' : 'Continue'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Tell Us About Yourself</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Please answer the following questions to help us provide you with personalized information about this clinical trial.
      </p>

      <form onSubmit={handleSubmitAnswers}>
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="mb-6">
              <label htmlFor={`question-${question.id}`} className="block text-sm font-medium mb-2">
                {index + 1}. {question.text}
              </label>
              <textarea
                id={`question-${question.id}`}
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                placeholder="Enter your answer here..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Start
        </button>
      </form>
    </div>
  );
}
