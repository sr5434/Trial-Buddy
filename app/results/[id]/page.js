'use client';
import { use, useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Results({ params }) {
  let id = use(params).id;
  const [ data, setData ] = useState("");
  const [ isLoading, setIsLoading ] = useState(true);
  let pollingRef = useRef(null);
  let copyFeedbackTimeoutRef = useRef(null);
  const [ copyFeedback, setCopyFeedback ] = useState("");

  const handleCopyLink = async () => {
    if (copyFeedbackTimeoutRef.current) {
      clearTimeout(copyFeedbackTimeoutRef.current);
    }

    try {
      const shareUrl = window.location.href;
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const tempInput = document.createElement('input');
        tempInput.value = shareUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
      setCopyFeedback('Link copied to clipboard.');
    } catch (error) {
      setCopyFeedback('Unable to copy link.');
    }

    copyFeedbackTimeoutRef.current = setTimeout(() => {
      setCopyFeedback('');
    }, 2500);
  };
  useEffect(() => {
    fetch('/api/getAgentStatus', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `{"id":"${id}"}`
    }).then((res) => res.json()).then((json) => {
      setData(json.report);
      setIsLoading(json.report === "");
    });
    const startPolling = () => {
      pollingRef.current = setInterval(() => {
        fetch("/api/getAgentStatus", {
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `{"id":"${id}"}`
        }).then((res) => res.json()).then((json) => {
          setData(json.report);
          setIsLoading(json.report === "");
        })
      }, 10000); // Poll every 10 seconds
    };
    startPolling();
    
    return () => {
      clearInterval(pollingRef.current);
      if (copyFeedbackTimeoutRef.current) {
        clearTimeout(copyFeedbackTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <h1 className="text-5xl font-extrabold">Trial Buddy</h1>
      {isLoading ? (
        <div className="mt-4 flex flex-col items-center gap-4 text-blue-600" role="status">
          <span className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-hidden="true"></span>
          <p className='text-xl text-center text-gray-800 dark:text-gray-100'>Generating your report. This may take a while...</p>
        </div>
      ) : (
        <div className="w-full mt-8">
          <div className="mt-4 flex flex-col items-center">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Copy Share Link
            </button>
          </div>
          {copyFeedback && (
            <div
              className="fixed bottom-6 right-6 z-50 rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-lg"
              role="status"
              aria-live="polite"
            >
              {copyFeedback}
            </div>
          )}
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children, ...props }) => (
                <h1 className="text-3xl font-extrabold mt-10 mb-4 text-left" {...props}>{children}</h1>
              ),
              h2: ({ children, ...props }) => (
                <h2 className="text-2xl font-bold mt-8 mb-3 text-left" {...props}>{children}</h2>
              ),
              h3: ({ children, ...props }) => (
                <h3 className="text-xl font-semibold mt-6 mb-2 text-left" {...props}>{children}</h3>
              ),
              p: ({ children, ...props }) => (
                <p className="text-base leading-7 mb-4 text-gray-800 dark:text-gray-100" {...props}>{children}</p>
              ),
              ul: ({ children, ...props }) => (
                <ul className="list-disc list-inside my-4 space-y-2" {...props}>{children}</ul>
              ),
              ol: ({ children, ...props }) => (
                <ol className="list-decimal list-inside my-4 space-y-2" {...props}>{children}</ol>
              ),
              li: ({ children, ...props }) => (
                <li className="ml-4" {...props}>{children}</li>
              ),
              table: ({ children, ...props }) => (
                <table className="w-full border-collapse my-6" {...props}>{children}</table>
              ),
              thead: ({ children, ...props }) => (
                <thead className="bg-gray-100 dark:bg-gray-900" {...props}>{children}</thead>
              ),
              tbody: ({ children, ...props }) => (
                <tbody {...props}>{children}</tbody>
              ),
              tr: ({ children, ...props }) => (
                <tr className="border border-gray-300 dark:border-gray-700" {...props}>{children}</tr>
              ),
              th: ({ children, ...props }) => (
                <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left font-semibold" {...props}>{children}</th>
              ),
              td: ({ children, ...props }) => (
                <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top" {...props}>{children}</td>
              ),
              a: ({ children, href, ...props }) => (
                <a href={href} className="text-blue-700 underline font-semibold" {...props}>{children}</a>
              ),
              code: ({ children, inline, ...props }) => (
                inline ? (
                  <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm" {...props}>{children}</code>
                ) : (
                  <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm" {...props}>
                    <code>{children}</code>
                  </pre>
                )
              )
            }}
          >
            {data}
          </Markdown>
        </div>
      )}
    </div>
  )
}