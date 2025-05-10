import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../../services/data.service'; // ✅ Import the service
import { CommonModule } from '@angular/common';

interface ChatMessage {
    speaker: string;
    text: string;
    timestamp?: Date;
}

@Component({
    selector: 'app-ai-interview',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './ai-interview.component.html',
    styleUrl: './ai-interview.component.css'
})
export class AiInterviewComponent implements OnInit, OnDestroy {
    audioUrl: string | null = null;
    transcription: string = '';
    chatMessages: ChatMessage[] = [];
    isLoading: boolean = false;
    errorMessage: string = '';
    callStatus: string = 'idle';
    callId: string = '';
    finalevalResult: any = null;
    isAccepted: boolean = false;

    constructor(private http: HttpClient, public dataService: DataService) { }

    ngOnInit(): void {
        // Initialize with idle state, waiting for user to start the process
    }

    ngOnDestroy(): void {
        // Cleanup if needed
    }

    getStatusMessage(): string {
        switch (this.callStatus) {
            case 'idle':
                return 'Click "Start Interview" to begin the process';
            case 'loading':
                return 'Loading interview data...';
            case 'completed':
                return 'Interview completed';
            case 'error':
                return 'Error occurred';
            default:
                return 'Unknown status';
        }
    }

    startInterview(): void {
        this.isLoading = true;
        this.callStatus = 'loading';
        this.errorMessage = '';
        
        // Reset the component state
        this.audioUrl = null;
        this.transcription = '';
        this.chatMessages = [];
        this.finalevalResult = null;
        
        // Call calls.js to get the interview data
        this.http.get('http://localhost:4000/api/calls').subscribe(
            (response: any) => {
                console.log("✅ Interview data:", response);
        
                if (response && response.call_id && response.structured_conversation.conversation) {
                    this.callId = response.call_id;
        
                    // Set the audio URL
                    this.audioUrl = `http://localhost:4000/api/calls/audio/${response.call_id}`;
                    console.log("🎤 Audio URL:", this.audioUrl);
        
                    // Store raw conversation in chatMessages for display
                    this.chatMessages = response.structured_conversation.conversation.map((msg: any) => ({
                        speaker: msg.speaker,
                        text: msg.text,
                        timestamp: new Date() // You can set actual timestamps if available
                    }));
        
                    // Optional: You could concatenate transcript for summary or other logic
                    this.transcription = this.chatMessages.map(m => `${m.speaker}: ${m.text}`).join(' ');
        
                    // Save to dataService and call finaleval
                    this.dataService.job = this.transcription;
                    const conversation2DArray = response.structured_conversation.conversation.map(
                        (msg: any) => [msg.speaker, msg.text]
                      );

                    console.log(conversation2DArray)
                    console.log(this.dataService.summary)
                    this.finaleval(conversation2DArray, this.dataService.summary);
        
                    this.callStatus = 'completed';
                    this.isLoading = false;
                } else {
                    this.errorMessage = "No interview data found. Please try again.";
                    this.isLoading = false;
                    this.callStatus = 'idle';
                }
            },
            (error: any) => {
                console.error("❌ Error loading interview data:", error);
                this.errorMessage = "Failed to load interview data. Please try again later.";
                this.isLoading = false;
                this.callStatus = 'idle';
            }
        );
        
    }

    processTranscription(transcription: string): void {
        // Split the transcription into lines
        const lines = transcription.split('\n');
        
        // Process each line to identify speaker and text
        this.chatMessages = [];
        let currentSpeaker = '';
        let currentText = '';
        let currentTimestamp = new Date();
        
        for (const line of lines) {
            // Check if the line contains a speaker indicator
            if (line.includes('AI_HR:') || line.includes('Candidate:')) {
                // If we have a previous message, add it to the chat
                if (currentSpeaker && currentText) {
                    this.chatMessages.push({
                        speaker: currentSpeaker,
                        text: currentText.trim(),
                        timestamp: currentTimestamp
                    });
                    currentTimestamp = new Date(); // Update timestamp for next message
                }
                
                // Extract the new speaker and text
                const parts = line.split(':');
                currentSpeaker = parts[0].trim();
                currentText = parts.slice(1).join(':').trim();
            } else if (line.trim()) {
                // Append to the current text if it's a continuation
                currentText += ' ' + line.trim();
            }
        }
        
        // Add the last message if there is one
        if (currentSpeaker && currentText) {
            this.chatMessages.push({
                speaker: currentSpeaker,
                text: currentText.trim(),
                timestamp: currentTimestamp
            });
        }
        
        // If no structured messages were found, create a single message
        if (this.chatMessages.length === 0 && transcription.trim()) {
            this.chatMessages.push({
                speaker: 'Transcript',
                text: transcription.trim(),
                timestamp: new Date()
            });
        }
    }

    finaleval(conversation: any, summary: string): void {
        // const conversationArray = conversation.split('\n');

        const jobData = {
            conversation: conversation,
            summary: summary
        };

        this.http.post('http://localhost:4000/api/finaleval', jobData).subscribe(
            (response: any) => {
                console.log("✅ Finaleval response:", response);
                this.finalevalResult = response;
            },
            (error: any) => {
                console.error("❌ Error submitting job data:", error);
            }
        );
    }

    getFeedbackSkills(): string[] {
        if (this.finalevalResult?.finalDecision?.ratings) {
            return Object.keys(this.finalevalResult.finalDecision.ratings);
        }
        return [];
    }

    getSkillRating(skill: string): number {
        if (this.finalevalResult?.finalDecision?.ratings) {
            return this.finalevalResult.finalDecision.ratings[skill] || 0;
        }
        return 0;
    }

    getAudioDuration(): string {
        const audio = document.querySelector('audio') as HTMLAudioElement;
        if (audio) {
            const duration = audio.duration;
            if (!isNaN(duration)) {
                const minutes = Math.floor(duration / 60);
                const seconds = Math.floor(duration % 60);
                return `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }
        return '0:00';
    }

    downloadAudio(): void {
        if (this.audioUrl) {
            const link = document.createElement('a');
            link.href = this.audioUrl;
            link.download = `interview-recording-${this.callId}.mp3`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}
