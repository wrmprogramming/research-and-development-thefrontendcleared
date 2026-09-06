export interface Project { 
     id: string;
     code: string;  
     title: string;  
     description: string;  
     startDate: Date;  
     endDate: Date;  
     budget: number;  
     status: 'active' | 'completed' | 'onHold' | 'cancelled';  
     manager: string;  
     progress: number; // 0-100
     }