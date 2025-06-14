"use client"
import { useState } from 'react';
import { toast } from 'react-toastify';
// import Head from 'next/head'; // This import caused a compilation error in the current environment.
                                // For Next.js projects in a full setup, 'next/head' is typically used
                                // for managing document head elements. However, to resolve the immediate
                                // compilation issue, it has been temporarily removed.

// Define preset options for each input field
const imageStylePresets = [
    'Photorealistic', 'Oil Painting', 'Watercolor', 'Cyberpunk', 'Fantasy Art',
    'Anime', 'Pencil Sketch', 'Pixel Art', 'Abstract', 'Minimalist', 'Impressionistic'
];

const cameraAnglePresets = [
    'Wide Shot', 'Close-up', 'Bird\'s Eye View', 'Low Angle', 'Dutch Angle',
    'Over-the-Shoulder', 'Eye-level', 'Macro Shot', 'Distant Shot', 'Extreme Close-up'
];

const lightingPresets = [
    'Golden Hour', 'Blue Hour', 'Dramatic Lighting', 'Soft Diffused Light',
    'Volumetric Lighting', 'Neon Glow', 'Backlight', 'Rim Light', 'Studio Lighting',
    'Natural Light', 'Moonlight', 'Ambient Light'
];

const colorTonePresets = [
    'Vibrant Colors', 'Muted Tones', 'Monochromatic', 'Pastel Palette',
    'Dark & Moody', 'Warm Hues', 'Cool Hues', 'Sepia Tone', 'Black & White', 'Earthy Tones'
];

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
console.log("API Key: "+GOOGLE_API_KEY);

// Main Page component
const HomePage = () => {
    // State variables for input fields
    const [imageStyle, setImageStyle] = useState('');
    const [cameraAngle, setCameraAngle] = useState('');
    const [lighting, setLighting] = useState('');
    const [colorTone, setColorTone] = useState('');
    const [userDetails, setUserDetails] = useState('');
    const [platform, setPlatform] = useState('Midjourney'); // Default platform
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    /**
     * Handles the prompt generation process by calling the Gemini API.
     * @returns {Promise<void>}
     */
    const generatePrompt = async () => {
        setIsLoading(true);
        setError('');
        setGeneratedPrompt('');

        // Basic validation for user details, as it's the most crucial part
        if (!imageStyle && !cameraAngle && !lighting && !colorTone && !userDetails) {
            setError('Please provide at least some details to generate a prompt.');
            setIsLoading(false);
            return;
        }

        try {
            // Construct the base instruction for Gemini
            const baseInstruction = `
            You are an expert AI art prompt generator. Your goal is to create a highly detailed,
            imaginative, and artistic prompt based on the provided inputs.

            Here are the user's preferences:
            - Image Style: ${imageStyle || 'not specified'}
            - Camera Angle: ${cameraAngle || 'not specified'}
            - Lighting: ${lighting || 'not specified'}
            - Color Tone: ${colorTone || 'not specified'}
            - User-specific details: ${userDetails || 'not specified'}

            Combine these elements into a coherent and visually rich prompt.
            `;

            // Customize the instruction based on the selected platform
            let platformSpecificInstruction = '';
            if (platform === "Midjourney") {
                platformSpecificInstruction = `
                Format the prompt for Midjourney, focusing on vivid descriptions and
                include relevant Midjourney parameters such as aspect ratio (--ar),
                stylization (--s), and potentially chaos (--c) if appropriate.
                Keep the prompt concise but packed with visual information, usually between 100-250 characters.
                Example: "A majestic ancient dragon, cyberpunk city, high angle, cinematic, dusk, moody, volumetric fog, dark purples and blues with vibrant pink accents, flying cars, holographic advertisements, rain-slicked streets, towering skyscrapers, --ar 16:9 --s 750"
                `;
            } else if (platform === "GPT Image Generation") {
                platformSpecificInstruction = `
                Format the prompt for a general text-to-image model (like those integrated with GPT),
                focusing on descriptive language without specific technical parameters.
                The prompt should clearly describe the scene, mood, and elements.
                Example: "A vibrant fantasy landscape, oil painting, impressionistic, close-up, low angle, morning glow, soft diffused, warm yellows and greens, a tranquil garden, blooming roses, a hidden fountain."
                `;
            } else {
                setError("Invalid platform selected. Please choose 'Midjourney' or 'GPT Image Generation'.");
                setIsLoading(false);
                return;
            }

            const fullPrompt = baseInstruction + platformSpecificInstruction +
                               "\n\nNow, generate the complete AI art prompt based on the inputs." +
                               "\n\nEnsure the generated prompt is ready to be directly used by the AI Art Generator.";

            // Prepare the payload for the Gemini API call
            const chatHistory = [{ role: "user", parts: [{ text: fullPrompt }] }];
            const payload = { contents: chatHistory };
            const apiKey = GOOGLE_API_KEY; // API key will be automatically provided by the Canvas environment

            // Make the fetch call to the Gemini API
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

            // Extract the generated text from the response
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setGeneratedPrompt(text.trim());
            } else {
                setGeneratedPrompt("Could not generate a prompt. The model returned an empty or malformed response.");
            }
        } catch (e) {
            if (e instanceof Error) {
              console.error("Error generating prompt:", e);
              setError(`Failed to generate prompt: ${e.message || 'An unexpected error occurred.'}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8 flex items-center justify-center font-sans">
            {/* The Head component from 'next/head' was causing a compilation issue.
                In a full Next.js project setup, you would typically manage head elements
                in _document.js or _app.js, or use the Head component if available
                and correctly resolved by your Next.js environment. */}
            {/* <Head>
                <title>AI Art Prompt Generator</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
            </Head> */}
            <div className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-2xl border border-blue-600">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-blue-400 mb-6">
                    AI Art Prompt Generator
                </h1>

                {/* Input Field: Image Style */}
                <div className="mb-4">
                    <label htmlFor="imageStyleInput" className="block text-blue-200 text-sm font-bold mb-2">
                        แนวภาพ (Image Style)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            id="imageStyleInput"
                            className="shadow appearance-none border border-gray-700 rounded-md w-full py-2 px-3 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 transition duration-300"
                            placeholder="กรอกเอง หรือเลือกจาก Preset"
                            value={imageStyle}
                            onChange={(e) => setImageStyle(e.target.value)}
                        />
                        <div className="relative w-full sm:w-1/2 md:w-1/3">
                            <select
                                id="imageStylePreset"
                                className="block appearance-none w-full bg-gray-700 border border-gray-700 text-gray-100 py-2 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300 cursor-pointer"
                                onChange={(e) => { if (e.target.value !== "") setImageStyle(e.target.value); }}
                                value="" // Ensure the dropdown resets to placeholder after selection
                            >
                                <option value="">เลือก Preset...</option>
                                {imageStylePresets.map((preset, index) => (
                                    <option key={index} value={preset}>{preset}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Input Field: Camera Angle */}
                <div className="mb-4">
                    <label htmlFor="cameraAngleInput" className="block text-blue-200 text-sm font-bold mb-2">
                        มุมกล้อง (Camera Angle)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            id="cameraAngleInput"
                            className="shadow appearance-none border border-gray-700 rounded-md w-full py-2 px-3 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 transition duration-300"
                            placeholder="กรอกเอง หรือเลือกจาก Preset"
                            value={cameraAngle}
                            onChange={(e) => setCameraAngle(e.target.value)}
                        />
                        <div className="relative w-full sm:w-1/2 md:w-1/3">
                            <select
                                id="cameraAnglePreset"
                                className="block appearance-none w-full bg-gray-700 border border-gray-700 text-gray-100 py-2 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300 cursor-pointer"
                                onChange={(e) => { if (e.target.value !== "") setCameraAngle(e.target.value); }}
                                value=""
                            >
                                <option value="">เลือก Preset...</option>
                                {cameraAnglePresets.map((preset, index) => (
                                    <option key={index} value={preset}>{preset}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Input Field: Lighting */}
                <div className="mb-4">
                    <label htmlFor="lightingInput" className="block text-blue-200 text-sm font-bold mb-2">
                        แสงเงา (Lighting)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            id="lightingInput"
                            className="shadow appearance-none border border-gray-700 rounded-md w-full py-2 px-3 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 transition duration-300"
                            placeholder="กรอกเอง หรือเลือกจาก Preset"
                            value={lighting}
                            onChange={(e) => setLighting(e.target.value)}
                        />
                        <div className="relative w-full sm:w-1/2 md:w-1/3">
                            <select
                                id="lightingPreset"
                                className="block appearance-none w-full bg-gray-700 border border-gray-700 text-gray-100 py-2 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300 cursor-pointer"
                                onChange={(e) => { if (e.target.value !== "") setLighting(e.target.value); }}
                                value=""
                            >
                                <option value="">เลือก Preset...</option>
                                {lightingPresets.map((preset, index) => (
                                    <option key={index} value={preset}>{preset}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Input Field: Color Tone */}
                <div className="mb-6">
                    <label htmlFor="colorToneInput" className="block text-blue-200 text-sm font-bold mb-2">
                        โทนสี (Color Tone)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            id="colorToneInput"
                            className="shadow appearance-none border border-gray-700 rounded-md w-full py-2 px-3 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 transition duration-300"
                            placeholder="กรอกเอง หรือเลือกจาก Preset"
                            value={colorTone}
                            onChange={(e) => setColorTone(e.target.value)}
                        />
                        <div className="relative w-full sm:w-1/2 md:w-1/3">
                            <select
                                id="colorTonePreset"
                                className="block appearance-none w-full bg-gray-700 border border-gray-700 text-gray-100 py-2 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300 cursor-pointer"
                                onChange={(e) => { if (e.target.value !== "") setColorTone(e.target.value); }}
                                value=""
                            >
                                <option value="">เลือก Preset...</option>
                                {colorTonePresets.map((preset, index) => (
                                    <option key={index} value={preset}>{preset}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <label htmlFor="userDetails" className="block text-blue-200 text-sm font-bold mb-2">
                        รายละเอียดตาม User (User Details)
                    </label>
                    <textarea
                        id="userDetails"
                        rows={3}
                        className="shadow appearance-none border border-gray-700 rounded-md w-full py-2 px-3 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 transition duration-300 resize-none"
                        placeholder="เพิ่มรายละเอียดเฉพาะเจาะจง เช่น, a lone samurai, a futuristic robot, an ancient tree"
                        value={userDetails}
                        onChange={(e) => setUserDetails(e.target.value)}
                    ></textarea>
                </div>

                {/* Platform Dropdown */}
                <div className="mb-6">
                    <label htmlFor="platform" className="block text-blue-200 text-sm font-bold mb-2">
                        เลือกแพลตฟอร์ม (Select Platform)
                    </label>
                    <div className="relative">
                        <select
                            id="platform"
                            className="block appearance-none w-full bg-gray-700 border border-gray-700 text-gray-100 py-2 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300 cursor-pointer"
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                        >
                            <option value="Midjourney">Midjourney</option>
                            <option value="GPT Image Generation">GPT Image Generation</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Generate Button */}
                <button
                    onClick={generatePrompt}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        "สร้าง Prompt (Generate Prompt)"
                    )}
                </button>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md mt-6 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Generated Prompt Display */}
                {generatedPrompt && (
                    <div className="mt-6 p-4 bg-gray-700 border border-blue-600 rounded-lg shadow-inner">
                        <h2 className="text-xl font-bold text-blue-300 mb-3">Prompt ที่สร้าง:</h2>
                        <textarea
                            readOnly
                            rows={7}
                            className="w-full bg-gray-900 text-gray-50 p-3 rounded-md border border-gray-600 text-sm focus:outline-none resize-none"
                            value={generatedPrompt}
                        ></textarea>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(generatedPrompt)
                                    .then(() => toast.success('Prompt copied to clipboard.')) // Using alert for simplicity, in a real app use a custom modal.
                                    .catch(err => console.error('Failed to copy text: ', err));
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

export default HomePage;