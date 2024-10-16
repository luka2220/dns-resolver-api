// NOTE: Structure for the header of a DNS message
export interface DNSHeader {
    id: number; // Transaction id (typically 22); size: 16bits
    flags: {
        // Control flags (set to 1 for recursion desired); 16bits
        recursion: number;
        status: number;
    };
    numQuestions: number; // Number of questions (set to one since only one is being sent); 16bits
    ansCount: number; // Answer Rescource Records, set to 0 for sending a query; 16bits
    nscount: number; // Authority Resource Records, set to 0 since we have no auth records; 16bits
    arcount: number; // Additional resource records, set 0 as we have no additional resource records; 16bits
}

// NOTE: Structure of a DNS message to be sent
export interface DNSMessage {
    id: number; // Transaction id (typically 22); size: 16bits
    flags: number; // Control flags (set to 1 for recursion desired); 16bits
    numQuestions: number; // Number of questions (set to one since only one is being sent); 16bits
    ansCount: number; // Answer Rescource Records, set to 0 for sending a query; 16bits
    nscount: number; // Authority Resource Records, set to 0 since we have no auth records; 16bits
    arcount: number; // Additional resource records, set 0 as we have no additional resource records; 16bits
    question: Buffer; // The question as a Buffer type
    tquery: number; // Query type, should be set to 1
    cquery: number; // Query class, set to 1
}

// NOTE: Question structure of a DNS query
export interface DNSQuestionSection {
    size: number;
    label: string;
    queryType: number;
    queryClass: number;
    currentPosition: number;
}
