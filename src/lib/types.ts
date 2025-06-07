export interface Quiz {
    id? : number;
    title : string;
    description : string
    roomCode? : string
    maxParticipants : number
    subject : string
    grade : string
    createdAt?: string;
    updatedAt?: string;
    host?: { id: number };  // Simplified User reference
    participants?: Participant[];
    questions?: Question[];
    status?: 'CREATED' | 'WAITING' | 'STARTED' | 'COMPLETED';  // Enum values from QuizStatus
    currentQuestionIndex?: number;
}

export interface Participant {
    id?: number;
    nickname: string;
    score?: number;
    quiz?: Quiz;
    token? : string    // Reference back to the quiz
}

export interface Question {
    id?: number;
    text: string;
    duration: number;
    points: number;
    options: string[];
    correctOptionIndices: number[];  // Note: This is a list, not a single index
    quiz?: Quiz;  // Reference back to the quiz
}

