"use client";
import React, { useState } from 'react';
import { toast } from 'react-toastify';

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY

const KeywordGeneratorPage = () => {
    const [rawKeywords, setRawKeywords] = useState('');
    const [generatedKeywordPrompt, setGeneratedKeywordPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    /**
     * Handles the generation of a keyword-based prompt using the Gemini API.
     * @returns {Promise<void>}
     */
    const generateKeywordPrompt = async () => {
        setIsLoading(true);
        setError('');
        setGeneratedKeywordPrompt('');

        if (!rawKeywords.trim()) {
            setError('Please enter some keywords to generate a prompt.');
            setIsLoading(false);
            return;
        }

        try {
            const promptTemplate = `
            You are an expert AI art prompt expander. Your task is to take a list of raw keywords
            provided by the user and expand them into a coherent, descriptive, and imaginative
            prompt suitable for advanced AI image generation models like Midjourney or DALL-E.

            Focus on:
            - Adding context, atmosphere, and mood.
            - Suggesting artistic styles, lighting, and composition.
            - Elaborating on the objects/subjects with more detail.
            - Ensuring the output is a single, continuous prompt string.

            Raw Keywords: "${rawKeywords.trim()}"

            Example Output (if raw keywords were "forest, magical, night, blue light, glowing mushrooms"):
            "An ethereal ancient forest at deep night, bathed in mystical bioluminescent blue light emanating from glowing, intricate mushrooms and vines, casting long shadows. A whimsical, dreamlike atmosphere, highly detailed, fantasy art style, wide angle, --ar 16:9 --s 750"

            Now, generate the expanded prompt for the given raw keywords.
            `;

            const chatHistory = [{ role: "user", parts: [{ text: promptTemplate }] }];
            const payload = { contents: chatHistory };
            const apiKey = GOOGLE_API_KEY; // API key will be automatically provided by the Canvas environment

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API error: ${response.status} ${response.statusText} - ${errorData.error.message || 'Unknown error'}`);
            }

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setGeneratedKeywordPrompt(text.trim());
            } else {
                setGeneratedKeywordPrompt("Could not generate a prompt. The model returned an empty or malformed response.");
            }
        } catch (e) {
            if (e instanceof Error) {
                console.error("Error generating keyword prompt:", e);
                setError(`Failed to generate keyword prompt: ${e.message || 'An unexpected error occurred.'}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8 flex items-center justify-center font-sans">
            <div className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-2xl border border-purple-600">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-purple-400 mb-6">
                    สร้าง Keyword Prompt (Generate Keyword Prompt)
                </h1>

                <div className="mb-6">
                    <label htmlFor="rawKeywords" className="block text-purple-200 text-sm font-bold mb-2">
                        Keyword ดิบ (Raw Keywords)
                    </label>
                    <textarea
                        id="rawKeywords"
                        rows={5}
                        className="shadow appearance-none border border-gray-700 rounded-md w-full py-2 px-3 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-700 transition duration-300 resize-none"
                        placeholder="ป้อน Keyword ที่ต้องการ เช่น, forest, magical, night, blue light, glowing mushrooms"
                        value={rawKeywords}
                        onChange={(e) => setRawKeywords(e.target.value)}
                    ></textarea>
                </div>

                <button
                    onClick={generateKeywordPrompt}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        "สร้าง Keyword Prompt"
                    )}
                </button>

                {error && (
                    <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md mt-6 text-sm text-center">
                        {error}
                    </div>
                )}

                {generatedKeywordPrompt && (
                    <div className="mt-6 p-4 bg-gray-700 border border-purple-600 rounded-lg shadow-inner">
                        <h2 className="text-xl font-bold text-purple-300 mb-3">Keyword Prompt ที่สร้าง:</h2>
                        <textarea
                            readOnly
                            rows={7}
                            className="w-full bg-gray-900 text-gray-50 p-3 rounded-md border border-gray-600 text-sm focus:outline-none resize-none"
                            value={generatedKeywordPrompt}
                        ></textarea>
                        <button
                            onClick={() => {
                                document.execCommand('copy', false, generatedKeywordPrompt); // Using execCommand for broader iframe compatibility
                                toast.success('Prompt copied to clipboard!'); // Simple alert for demo, use custom modal in production
                            }}
                            className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            คัดลอก Prompt (Copy Prompt)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KeywordGeneratorPage;
