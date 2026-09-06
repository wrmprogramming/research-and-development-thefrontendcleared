export interface User {  
    id: string;  
    username: string;  
    fullName: string;  
    role: 'admin' | 'manager' | 'viewer';  
    department: string;
}