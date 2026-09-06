export interface Transaction {  
    id: string;  
    projectId: string;  
    type: 'income' | 'expense';  
    amount: number;  
    category: string;  
    description: string;  
    date: Date;  
    invoiceNumber?: string;
}