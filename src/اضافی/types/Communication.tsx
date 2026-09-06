export interface Communication {
  id: number;
  topic: string;
  sender: string;
  receiver: string;
  date: string;
  attachment: File | string | null;
  lettersfile: File | string | null;
}

export interface CommunicationFormData {
  topic: string;
  sender: string;
  receiver: string;
  date: string;
  attachment?: File | null;
  lettersfile?: File | null;
}