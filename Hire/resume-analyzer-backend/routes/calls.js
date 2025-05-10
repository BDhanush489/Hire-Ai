// const express = require("express");
// const fs = require("fs");
// const path = require("path");
// const axios = require("axios");
// const { createClient } = require("@deepgram/sdk");
// require("dotenv").config();

// const router = express.Router();
// const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// // 🧠 Structure the transcript using Gemini
// // const structureConversation = async (transcription) => {
// //     try {
// //         const prompt = `
// // Format the following conversation into a structured JSON format where each dialogue is classified as either 'AI_HR' or 'Candidate'.
// // The JSON should be in the format:
// // {
// //   "conversation": [
// //     {
// //       "speaker": "AI_HR",
// //       "text": "Hello, how are you?"
// //     },
// //     {
// //       "speaker": "Candidate",
// //       "text": "I'm good, thank you."
// //     }
// //   ]
// // }

// // **Raw Conversation:**
// // ${transcription}
// //         `;

// //         const response = await axios.post(
// //             `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
// //             {
// //                 contents: [{ parts: [{ text: prompt }] }]
// //             },
// //             {
// //                 headers: { "Content-Type": "application/json" }
// //             }
// //         );

// //         console.log("✅ Gemini API Response:", response.data);

// //         let rawContent = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
// //         rawContent = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();

// //         return JSON.parse(rawContent);
// //     } catch (error) {
// //         console.error("❌ Error structuring conversation:", error.message);
// //         return { conversation: [] };
// //     }
// // };

// // 🎯 Main GET route
// router.get("/", async (req, res) => {
//     try {
//         // 📞 Get latest call from Bland
//         const blandRes = await axios.get("https://api.bland.ai/v1/calls", {
//             headers: {
//                 authorization: process.env.BLAND_API_KEY
//             }
//         });

//         const call = blandRes.data?.calls?.[0]; // latest call (use [4] if you want specific one)

//         if (!call?.recording_url) {
//             return res.status(404).json({ error: "Recording URL not found in the Bland API response." });
//         }

//         const filePath = path.join("recordings", `${call.call_id}.mp3`);
//         const writer = fs.createWriteStream(filePath);

//         // 🎧 Download audio
//         const audioRes = await axios({
//             url: call.recording_url,
//             method: "GET",
//             responseType: "stream"
//         });

//         audioRes.data.pipe(writer);

//         await new Promise((resolve, reject) => {
//             writer.on("finish", resolve);
//             writer.on("error", reject);
//         });

//         const audioStream = fs.createReadStream(filePath);
//         const { result, error } = await deepgram.listen.prerecorded.transcribeFile(audioStream, {
//             model: "nova-3",
//             smart_format: true
//         });

//         console.log("✅ Transcription Result:", result);

//         // fs.unlink(filePath, (err) => {
//         //     if (err) console.warn("⚠️ Could not delete file:", err.message);
//         // });

//         if (error) throw error;

//         let finalcall=JSON.stringify(result, null, 2)

//         console.log(JSON.stringify(result, null, 2));


//         res.json({
//             call_id: call.call_id,
//             structured_conversation: result
//         });

//     } catch (err) {
//         console.error("❌ Error:", err.message);
//         res.status(500).json({
//             error: "Something went wrong",
//             details: err.message
//         });
//     }
// });

// // Serve audio file
// router.get("/audio/:callId", async (req, res) => {
//     try {
//         const callId = req.params.callId;
//         const filePath = path.join(__dirname, "..", "recordings", `${callId}.mp3`);
        
//         // Check if file exists
//         if (!fs.existsSync(filePath)) {
//             return res.status(404).json({ error: "Audio file not found" });
//         }

//         // Set headers for audio streaming
//         res.setHeader('Content-Type', 'audio/mpeg');
//         res.setHeader('Content-Disposition', `inline; filename=${callId}.mp3`);
        
//         // Stream the file
//         const fileStream = fs.createReadStream(filePath);
//         fileStream.pipe(res);

//         fileStream.on('error', (error) => {
//             console.error('Error streaming audio file:', error);
//             res.status(500).json({ error: "Error streaming audio file" });
//         });
//     } catch (error) {
//         console.error('Error serving audio file:', error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// module.exports = router;


// // const express = require("express");
// // const fs = require("fs");
// // const path = require("path");
// // const axios = require("axios");
// // const { createClient } = require("@deepgram/sdk");
// // require("dotenv").config();

// // const router = express.Router();
// // const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// // // 🎯 Main GET route
// // router.get("/", async (req, res) => {
// //     try {
// //         // 📞 Get latest call from Bland
// //         const blandRes = await axios.get("https://api.bland.ai/v1/calls", {
// //             headers: {
// //                 authorization: process.env.BLAND_API_KEY
// //             }
// //         });

// //         const call = blandRes.data?.calls?.[4];
// //         console.log(blandRes.data?.calls?.length);

// //         // if (!call?.recording_url) {
// //         //     return res.status(404).json({ error: "Recording URL not found in the Bland API response." });
// //         // }

// //         // 💾 Save as abc123.mp3
// //         const filePath = path.join("recordings", `${call.call_id}.mp3`);
        
// //         const writer = fs.createWriteStream(filePath);

// //         // 🎧 Download audio
// //         const audioRes = await axios({
// //             url: call.recording_url,
// //             method: "GET",
// //             responseType: "stream"
// //         });

// //         audioRes.data.pipe(writer);

// //         await new Promise((resolve, reject) => {
// //             writer.on("finish", resolve);
// //             writer.on("error", reject);
// //         });

// //         const audioStream = fs.createReadStream(filePath);
// //         const { result, error } = await deepgram.listen.prerecorded.transcribeFile(audioStream, {
// //             model: "nova-3",
// //             smart_format: true
// //         });

// //         console.log("✅ Transcription Result:", result);

// //         // 🧹 Delete file after transcription
// //         fs.unlink(filePath, (err) => {
// //             if (err) console.warn("⚠️ Could not delete file:", err.message);
// //         });

// //         res.json({
// //             call_id: call.call_id,
// //             structured_conversation: result
// //         });

// //     } catch (err) {
// //         console.error("❌ Error:", err.message);
// //         res.status(500).json({
// //             error: "Something went wrong",
// //             details: err.message
// //         });
// //     }
// // });

// // module.exports = router;

const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { createClient } = require("@deepgram/sdk");
require("dotenv").config();

const router = express.Router();
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// 🧠 Structure the transcript using Gemini
const structureConversation = async (transcription) => {
    try {
        const prompt = `
Format the following conversation into a structured JSON format where each dialogue is classified as either 'AI_HR' or 'Candidate'.
The JSON should be in the format:
{
  "conversation": [
    {
      "speaker": "AI_HR",
      "text": "Hello, how are you?"
    },
    {
      "speaker": "Candidate",
      "text": "I'm good, thank you."
    }
  ]
}

**Raw Conversation:**
${transcription}
        `;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
            {
                contents: [{ parts: [{ text: prompt }] }]
            },
            {
                headers: { "Content-Type": "application/json" }
            }
        );

        let rawContent = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        rawContent = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(rawContent);
    } catch (error) {
        console.error("❌ Error structuring conversation:", error.message);
        return { conversation: [] };
    }
};

// 🎯 Main GET route
router.get("/", async (req, res) => {
    try {
        // 📞 Get latest call from Bland
        const blandRes = await axios.get("https://api.bland.ai/v1/calls", {
            headers: {
                authorization: process.env.BLAND_API_KEY
            }
        });

        const call = blandRes.data?.calls?.[0];

        if (!call?.recording_url) {
            return res.status(404).json({ error: "Recording URL not found in the Bland API response." });
        }

        const filePath = path.join("recordings", `${call.call_id}.mp3`);
        const writer = fs.createWriteStream(filePath);

        // 🎧 Download audio
        const audioRes = await axios({
            url: call.recording_url,
            method: "GET",
            responseType: "stream"
        });

        audioRes.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });

        const audioStream = fs.createReadStream(filePath);
        const { result, error } = await deepgram.listen.prerecorded.transcribeFile(audioStream, {
            model: "nova-3",
            smart_format: true
        });

        if (error) throw error;

        const transcriptText = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

        
        const structuredConversation = await structureConversation(transcriptText);
        console.log("📝 Raw Transcript:", structuredConversation);
        
        // Optional: delete file after processing
        fs.unlink(filePath, (err) => {
            if (err) console.warn("⚠️ Could not delete file:", err.message);
        });

        res.json({
            call_id: call.call_id,
            structured_conversation: structuredConversation
        });

    } catch (err) {
        console.error("❌ Error:", err.message);
        res.status(500).json({
            error: "Something went wrong",
            details: err.message
        });
    }
});

module.exports = router;
