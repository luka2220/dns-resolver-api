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

// NOTE: Structure for the header of a DNS message
export interface DNSHeaderSection {
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

// NOTE: Question structure of a DNS query
export interface DNSQuestionSection {
    qname: string; // Variable length string indicating the domain name
    queryType: number; // 2 bytes specifing the type of query
    queryClass: number; // 2 bytes for indicating the class of the query
    currentPosition: number; // Indicates the where we are in the bytes buffer after parsing
}

// NOTE: Answer structure of a DNS query
export interface DNSAnswerSection {
    name: number; // 2 bytes are given for the domain name, which is compressed
    type: number; // 2 bytes for the type of DNS record
    class: number; // 2 bytes representing the class of data in the resource record
    ttl: number; // 4 bytes to represent TTL (time to live)
    rdlength: number; // 2 bytes specifing the length in octets of the rdata field
    rdata: number; // Variable length string that describes the resource
    currentPosition: number; // Indicates the where we are in the bytes buffer after parsing
}
